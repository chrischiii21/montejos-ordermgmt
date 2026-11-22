import type { APIRoute } from 'astro';
import { isDashboardSession, serviceClient } from '../../lib/family-link';
import { isValidOrderSignature, isAwaitingCustomer } from '../../lib/order-access';
import { getDraft, saveDraft, listDrafts } from '../../lib/order-drafts';

// Customer drafts for the order link (see src/lib/order-drafts.ts).
//   GET  ?id=…&t=…   → the customer's saved draft (to continue where they left off)
//   GET  (dashboard, no id) → progress of every draft, for the "Link opened / filling in" badges
//   POST { id, t, step, fields } → save the customer's progress
// Customer requests need the order link's signature, and only work while the order still awaits the customer.

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// Only these fields are kept, each as a short string (or the dessert picks map).
const FIELD_LIMITS: Record<string, number> = {
	customer: 200, contact: 20, facebookName: 200, address: 500, deliveryDateTime: 40,
	downpayment: 20, method: 20, zone: 120, otherAreaText: 120
};

async function awaitingCustomer(id: string): Promise<boolean> {
	const db = serviceClient();
	if (!db) return false;
	const { data } = await db.from('orders').select('customer, delivery_date_time, status').eq('id', id).maybeSingle();
	return !!data && data.status !== 'Completed' && data.status !== 'Cancelled' && isAwaitingCustomer(data);
}

export const GET: APIRoute = async ({ url, cookies }) => {
	const id = url.searchParams.get('id');
	if (!id) {
		if (!isDashboardSession(cookies.get('dashboard_token')?.value)) return json({ error: 'Unauthorized' }, 401);
		return json({ drafts: await listDrafts() });
	}
	if (!isValidOrderSignature(id, url.searchParams.get('t'))) return json({ error: 'Unauthorized' }, 401);
	return json({ draft: await getDraft(id) });
};

export const POST: APIRoute = async ({ request }) => {
	const body = await request.json().catch(() => null);
	const id = typeof body?.id === 'string' ? body.id : '';
	if (!id || !isValidOrderSignature(id, body?.t)) return json({ error: 'Unauthorized' }, 401);
	if (!(await awaitingCustomer(id))) return json({ error: 'This order has already been submitted.' }, 409);

	const raw = body?.fields && typeof body.fields === 'object' ? body.fields : {};
	const fields: Record<string, unknown> = {};
	for (const [key, max] of Object.entries(FIELD_LIMITS)) {
		if (typeof raw[key] === 'string') fields[key] = raw[key].slice(0, max);
	}
	// Dessert picks: { "<item index>": "<dessert>" }
	if (raw.desserts && typeof raw.desserts === 'object') {
		const desserts: Record<string, string> = {};
		for (const [k, v] of Object.entries(raw.desserts).slice(0, 30)) {
			if (/^\d{1,3}$/.test(k) && typeof v === 'string') desserts[k] = v.slice(0, 60);
		}
		fields.desserts = desserts;
	}

	await saveDraft(id, Number(body?.step) || 1, fields);
	return json({ ok: true });
};
