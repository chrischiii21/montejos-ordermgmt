import type { APIRoute } from 'astro';
import { isDashboardSession, serviceClient } from '../../lib/family-link';
import { isGoogleCalendarConfigured, syncAllOrdersToGoogle } from '../../lib/google-calendar';

// Full sync of the live Google Calendar (see src/lib/google-calendar.ts).
//   POST: Settings → Live Google Calendar → "Sync all orders now" (dashboard session only).
//   GET:  Vercel cron (vercel.json), daily, to fix anything a failed save missed.

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

async function run(): Promise<Response> {
	const db = serviceClient();
	if (!db) return json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server.' }, 500);
	try {
		const result = await syncAllOrdersToGoogle(db);
		console.log('[google-calendar-sync]', result);
		return json({ ok: true, ...result });
	} catch (err) {
		console.error('[google-calendar-sync] failed:', err);
		return json({ error: err instanceof Error ? err.message : String(err) }, 500);
	}
}

export const GET: APIRoute = async ({ request }) => {
	// Vercel sends "Authorization: Bearer <CRON_SECRET>" when CRON_SECRET is set (same as the reminder crons).
	const secret = process.env.CRON_SECRET || import.meta.env.CRON_SECRET;
	if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) return json({ error: 'Unauthorized' }, 401);
	if (!isGoogleCalendarConfigured()) return json({ ok: true, skipped: 'Google Calendar is not set up' });
	return run();
};

export const POST: APIRoute = async ({ cookies }) => {
	if (!isDashboardSession(cookies.get('dashboard_token')?.value)) return json({ error: 'Unauthorized' }, 401);
	return run();
};
