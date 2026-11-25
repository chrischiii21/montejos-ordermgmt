import type { APIRoute } from 'astro';
import { isValidFamilyKey, serviceClient } from '../../../lib/family-link';
import { buildOrdersFeed, ORDER_EVENT_SELECT } from '../../../lib/ics';
import { phtDate } from '../../../lib/reminders.js';

// Calendar subscription feed for the family calendar: same secret key, same orders (not Cancelled).
// Family members subscribe in Apple/Google Calendar so their phone's own calendar widget shows orders.
// After "Generate New Link" the old feed 404s and everyone has to subscribe again.
export const GET: APIRoute = async ({ params, url }) => {
	if (!(await isValidFamilyKey(params.key))) return new Response('Not found', { status: 404 });

	// On any failure return an error, never an empty calendar: phones keep the last good copy
	// on an error, but an empty feed would wipe every order off their calendars.
	const db = serviceClient();
	if (!db) return new Response('Server is missing Supabase settings', { status: 503 });
	const { data, error } = await db
		.from('orders')
		.select(ORDER_EVENT_SELECT)
		.not('status', 'eq', 'Cancelled')
		.gte('delivery_date_time', `${phtDate(-60).dateStr} 00:00`) // last 2 months + everything upcoming
		.order('delivery_date_time', { ascending: true })
		.order('id', { ascending: true });
	if (error) return new Response('Could not load orders', { status: 503 });

	const pageUrl = `${url.origin}/family/${encodeURIComponent(params.key!)}`;
	return new Response(buildOrdersFeed(data ?? [], pageUrl), {
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': 'inline; filename="montejos-orders.ics"',
			'Cache-Control': 'no-store',
			'X-Robots-Tag': 'noindex, nofollow'
		}
	});
};
