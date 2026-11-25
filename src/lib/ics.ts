import { getInclusionsForTelegram, peso } from './reminders.js';

// What the calendar shows for an order. Shared by the subscription feed (/family/<key>/calendar.ics,
// built below) and the live Google Calendar sync (google-calendar.ts).

export const ORDER_EVENT_SELECT =
	'id, customer, facebook_name, address, contact, delivery_date_time, fulfillment_type, status, total, downpayment, balance, order_items(name, quantity, custom_inclusions)';

export type FeedOrder = {
	id: string;
	customer: string | null;
	facebook_name: string | null;
	address: string | null;
	contact: string | null;
	delivery_date_time: string | null; // 'YYYY-MM-DD HH:MM', Philippine time
	fulfillment_type: string | null;
	status: string;
	total: number | string | null;
	downpayment: number | string | null;
	balance: number | string | null;
	order_items?: { name: string; quantity: number; custom_inclusions: string[] | null }[] | null;
};

export type OrderEvent = { start: Date; end: Date; summary: string; location: string; description: string };

/** 'YYYY-MM-DD HH:MM' Philippine time → Date, or null if missing/unparseable. */
export function manilaTime(dateTime: string | null): Date | null {
	if (!dateTime) return null;
	const d = new Date(dateTime.replace(' ', 'T') + '+08:00');
	return isNaN(d.getTime()) ? null : d;
}

/**
 * Calendar event for one order (30 minutes from the delivery/pickup time), or null when it has no usable time.
 * Status is left out on purpose: the dashboard moves it to Preparing/Completed by itself as the time nears,
 * without going through the server, so a synced copy could never keep up with it.
 */
export function orderEvent(o: FeedOrder): OrderEvent | null {
	const start = manilaTime(o.delivery_date_time);
	if (!start) return null;
	const type = o.fulfillment_type || 'Delivery';
	const balance = parseFloat(String(o.balance ?? 0)) || 0;
	const items = (o.order_items ?? []).map(it => {
		const incl = getInclusionsForTelegram(it.name || '', it.custom_inclusions);
		return `${it.quantity}× ${it.name}` + incl.map((i: string) => `\n   • ${i}`).join('');
	});
	return {
		start,
		end: new Date(start.getTime() + 30 * 60e3),
		summary: `${type}: ${o.customer || 'N/A'}`,
		location: type === 'Delivery' ? o.address || '' : '',
		description: [
			`ORD-${String(o.id).replace('ORD-', '')}`,
			...(o.facebook_name ? [`FB: ${o.facebook_name}`] : []),
			`Contact: ${o.contact || 'N/A'}`,
			`Address: ${o.address || 'N/A'}`,
			'',
			'Items:',
			...(items.length ? items : ['No items listed']),
			'',
			`Total: ${peso(o.total)}`,
			`Downpayment: ${peso(o.downpayment)}`,
			`Balance: ${balance > 0 ? peso(balance) : 'Fully paid'}`
		].join('\n')
	};
}

// ---- iCalendar (RFC 5545) subscription feed. Phones re-download it on their own schedule. ----

const text = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const stamp = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, ''); // → '20261125T020000Z'

/** Lines longer than 75 bytes are folded (CRLF + space) without splitting a multi-byte character. */
export function fold(line: string): string {
	let out = '';
	let len = 0;
	for (const ch of line) {
		const n = Buffer.byteLength(ch);
		if (len + n > 74) { out += '\r\n '; len = 1; }
		out += ch;
		len += n;
	}
	return out;
}

export function buildOrdersFeed(orders: FeedOrder[], pageUrl: string): string {
	const now = stamp(new Date());
	const events = orders.flatMap(o => {
		const e = orderEvent(o);
		if (!e) return [];
		return [
			'BEGIN:VEVENT',
			`UID:${o.id}@montejos-orders`,
			`DTSTAMP:${now}`,
			`DTSTART:${stamp(e.start)}`,
			`DTEND:${stamp(e.end)}`,
			`SUMMARY:${text(e.summary)}`,
			...(e.location ? [`LOCATION:${text(e.location)}`] : []),
			`DESCRIPTION:${text(e.description)}`,
			`URL:${pageUrl}`,
			'END:VEVENT'
		];
	});
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		"PRODID:-//Montejo's//Family Orders//EN",
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		"X-WR-CALNAME:Montejo's Orders",
		'X-WR-TIMEZONE:Asia/Manila',
		// Ask for a re-check every 5 minutes. Apple Calendar uses this as a hint; Google Calendar ignores it.
		'REFRESH-INTERVAL;VALUE=DURATION:PT5M',
		'X-PUBLISHED-TTL:PT5M',
		...events,
		'END:VCALENDAR'
	];
	return lines.map(fold).join('\r\n') + '\r\n';
}
