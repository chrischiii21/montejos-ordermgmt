import type { APIRoute } from 'astro';
import { isDashboardSession } from '../../lib/family-link';
import { getDeliveryZones, saveDeliveryZones, getPickupInfo, savePickupInfo } from '../../lib/delivery-zones';

// GET:  barangay fee list + pickup address (public: the customer order link shows them).
// POST: save them from Settings (dashboard session only; /api is exempt from the middleware).
//       Body: { zones?: [{ name, fee }], pickup?: { address, mapUrl } } — only the parts sent are saved.

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const GET: APIRoute = async () => {
	const [zones, pickup] = await Promise.all([getDeliveryZones(), getPickupInfo()]);
	return json({ zones, pickup });
};

export const POST: APIRoute = async ({ request, cookies }) => {
	if (!isDashboardSession(cookies.get('dashboard_token')?.value)) return json({ error: 'Unauthorized' }, 401);
	const body = await request.json().catch(() => null);
	if (!body || (!Array.isArray(body.zones) && !body.pickup)) return json({ error: 'Bad request' }, 400);
	try {
		const zones = Array.isArray(body.zones) ? await saveDeliveryZones(body.zones) : await getDeliveryZones();
		const pickup = body.pickup ? await savePickupInfo(body.pickup) : await getPickupInfo();
		return json({ zones, pickup });
	} catch (err) {
		return json({ error: err instanceof Error ? err.message : String(err) }, 500);
	}
};
