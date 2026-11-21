import type { APIRoute } from 'astro';
import { isDashboardSession, regenerateFamilyKey } from '../../lib/family-link';

// POST: generate a new family calendar link (the old one stops working).
// /api is exempt from the middleware, so the dashboard session is checked here.
export const POST: APIRoute = async ({ cookies }) => {
	if (!isDashboardSession(cookies.get('dashboard_token')?.value)) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
	}
	try {
		const key = await regenerateFamilyKey();
		return new Response(JSON.stringify({ path: `/family/${key}` }), {
			headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), { status: 500 });
	}
};
