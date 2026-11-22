import type { APIRoute } from 'astro';
import { isDashboardSession, isValidFamilyKey, serviceClient } from '../../lib/family-link';
import { describeDevice, isMissingTable } from '../../lib/family-visits';

// POST: the family page logs a visit (needs the valid family key, so outsiders can't write).
// GET:  Settings → Family Link Visits reads the log, grouped per phone (dashboard session only).
// /api is exempt from the middleware, so both checks happen here. See src/lib/family-visits.ts for the table.

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');

export const POST: APIRoute = async ({ request }) => {
	let body: Record<string, unknown>;
	try { body = await request.json(); } catch { return json({ error: 'Bad request' }, 400); }

	if (!(await isValidFamilyKey(clip(body.key, 200)))) return json({ error: 'Not found' }, 404);
	const deviceId = clip(body.deviceId, 64);
	if (!deviceId) return json({ error: 'Bad request' }, 400);

	const db = serviceClient();
	if (!db) return new Response(null, { status: 204 });

	const ua = clip(request.headers.get('user-agent'), 500);
	const info = describeDevice(ua, clip(body.model, 60) || undefined, clip(body.platformVersion, 20) || undefined);
	const { error } = await db.from('family_visits').insert({
		device_id: deviceId,
		model: info.model,
		os: info.os,
		browser: info.browser,
		standalone: body.standalone === true,
		user_agent: ua
	});
	// Never break the family page over logging; just report it in the server log.
	if (error && !isMissingTable(error.message)) console.error('family_visits insert failed:', error.message);
	return new Response(null, { status: 204 });
};

interface DeviceRow {
	deviceId: string;
	model: string;
	os: string;
	browser: string;
	visits: number;
	firstSeen: string;
	lastSeen: string;
	homeScreen: boolean;
}

export const GET: APIRoute = async ({ cookies }) => {
	if (!isDashboardSession(cookies.get('dashboard_token')?.value)) return json({ error: 'Unauthorized' }, 401);

	const db = serviceClient();
	if (!db) return json({ ready: false, error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server.' });

	const since = new Date(Date.now() - 90 * 864e5).toISOString();
	const { data, error } = await db
		.from('family_visits')
		.select('device_id, model, os, browser, standalone, visited_at')
		.gte('visited_at', since)
		.order('visited_at', { ascending: false })
		.limit(2000);
	if (error) {
		return json(isMissingTable(error.message)
			? { ready: false, error: 'The family_visits table does not exist yet. Create it in Supabase first (see src/lib/family-visits.ts).' }
			: { ready: false, error: error.message });
	}

	// Rows are newest first, so the first row per device holds its latest model/browser.
	const byDevice = new Map<string, DeviceRow>();
	for (const r of data ?? []) {
		const d = byDevice.get(r.device_id);
		if (!d) {
			byDevice.set(r.device_id, {
				deviceId: r.device_id,
				model: r.model ?? 'Unknown device',
				os: r.os ?? '',
				browser: r.browser ?? '',
				visits: 1,
				firstSeen: r.visited_at,
				lastSeen: r.visited_at,
				homeScreen: !!r.standalone
			});
		} else {
			d.visits++;
			d.firstSeen = r.visited_at;
			if (r.standalone) d.homeScreen = true;
		}
	}

	return json({ ready: true, totalVisits: data?.length ?? 0, devices: [...byDevice.values()] });
};
