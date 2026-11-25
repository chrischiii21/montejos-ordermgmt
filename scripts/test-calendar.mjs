// Checks the family calendars: the .ics subscription feed (src/lib/ics.ts) and the live Google Calendar
// sync (src/lib/google-calendar.ts). No network: Google and Supabase are faked.
// Run: node scripts/test-calendar.mjs   (Node 23.6+ runs the .ts imports directly)
import assert from 'node:assert/strict';
import { generateKeyPairSync, createVerify } from 'node:crypto';
import { buildOrdersFeed, manilaTime, orderEvent } from '../src/lib/ics.ts';

// ---- .ics feed ----
assert.equal(manilaTime('2026-11-25 10:00').toISOString(), '2026-11-25T02:00:00.000Z', '10 AM Manila = 2 AM UTC');
assert.equal(manilaTime('2026-11-25 07:30').toISOString(), '2026-11-24T23:30:00.000Z', 'early morning is the previous UTC day');
assert.equal(manilaTime('not a date'), null);
assert.equal(manilaTime(null), null);

const order = {
	id: 'ORD-42', customer: 'Ana; Cruz, Jr.', facebook_name: null, address: 'Brgy. Poblacion, Argao, Cebu',
	contact: '0917', delivery_date_time: '2026-11-25 10:00', fulfillment_type: 'Delivery', status: 'Pending',
	total: 5000, downpayment: 2000, balance: 3000,
	order_items: [{ name: 'Lechon Belly '.repeat(8), quantity: 2, custom_inclusions: ['₱₱₱ inclusion '.repeat(6)] }]
};
const feed = buildOrdersFeed([order, { ...order, id: 'ORD-43', delivery_date_time: null }], 'https://x.test/family/k');

assert.ok(feed.endsWith('END:VCALENDAR\r\n'));
assert.equal(feed.match(/BEGIN:VEVENT/g).length, 1, 'order without a date is skipped');
assert.ok(feed.includes('DTSTART:20261125T020000Z\r\nDTEND:20261125T023000Z'));
assert.ok(feed.includes('SUMMARY:Delivery: Ana\\; Cruz\\, Jr.'), 'semicolons and commas escaped');
for (const line of feed.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75, `line too long: ${line}`);
const unfolded = feed.replace(/\r\n /g, '');
assert.ok(unfolded.includes('₱₱₱ inclusion'), 'folding never splits a multi-byte character');
assert.ok(unfolded.includes('\\nBalance: ₱3\\,000.00'), 'description lines joined with \\n, commas escaped');

// ---- live Google Calendar sync ----
const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify({
	client_email: 'sync@test.iam.gserviceaccount.com',
	private_key: privateKey.export({ type: 'pkcs8', format: 'pem' })
});
process.env.GOOGLE_CALENDAR_ID = 'cal@group.calendar.google.com';
const { syncAllOrdersToGoogle, syncOrderToGoogle, eventId } = await import('../src/lib/google-calendar.ts');

const o1 = { ...order, id: 'ORD-1', customer: 'Ana', order_items: [] };
const o2 = { ...o1, id: 'ORD-2', customer: 'Ben' };
const o3 = { ...o1, id: 'ORD-3', customer: 'Cy', fulfillment_type: 'Pickup' };
const e1 = orderEvent(o1);
const tag = (id) => ({ private: { orderId: id } });
const calendarNow = [
	// up to date (Google answers in +08:00, not Z): must not be rewritten
	{ id: eventId('ORD-1'), summary: e1.summary, description: e1.description, location: e1.location,
		start: { dateTime: '2026-11-25T10:00:00+08:00' }, end: { dateTime: '2026-11-25T10:30:00+08:00' }, extendedProperties: tag('ORD-1') },
	{ id: eventId('ORD-2'), summary: 'Delivery: old name', start: { dateTime: '2026-11-25T10:00:00+08:00' }, extendedProperties: tag('ORD-2') },
	{ id: eventId('ORD-9'), summary: 'order was deleted', extendedProperties: tag('ORD-9') },
	{ id: 'handmade123', summary: 'added by hand, no tag' }
];

let calls = [];
let googleDown = false;
let rateLimitOnce = true; // Google's "slow down" answer for the first ORD-2 write: must be retried, not reported
globalThis.fetch = async (url, init = {}) => {
	if (googleDown) throw new Error('network down');
	const method = init.method || 'GET';
	if (url === 'https://oauth2.googleapis.com/token') {
		const jwt = new URLSearchParams(init.body.toString()).get('assertion').split('.');
		assert.ok(createVerify('RSA-SHA256').update(`${jwt[0]}.${jwt[1]}`).verify(publicKey, jwt[2], 'base64url'), 'JWT signed with the key');
		assert.equal(JSON.parse(Buffer.from(jwt[1], 'base64url')).iss, 'sync@test.iam.gserviceaccount.com');
		return Response.json({ access_token: 'tok', expires_in: 3600 });
	}
	assert.equal(init.headers.Authorization, 'Bearer tok');
	const path = decodeURIComponent(new URL(url).pathname).replace('/calendar/v3/calendars/cal@group.calendar.google.com/events', '');
	calls.push(`${method} ${path || '/'}`);
	if (method === 'GET') return Response.json({ items: calendarNow });
	if (method === 'PUT' && path === `/${eventId('ORD-2')}` && rateLimitOnce) {
		rateLimitOnce = false;
		return Response.json({ error: { code: 403, message: 'Rate Limit Exceeded' } }, { status: 403 });
	}
	if (method === 'PUT' && path === `/${eventId('ORD-3')}`) return new Response('{}', { status: 404 }); // never synced before
	if (method === 'DELETE' && path === `/${eventId('ORD-404')}`) return new Response('', { status: 410 }); // already gone
	return Response.json({});
};

const fakeDb = (rows) => ({
	from: () => {
		const q = {
			select: () => q, not: () => q, gte: () => q, eq: (_, id) => { q.id = id; return q; },
			maybeSingle: async () => ({ data: rows.find(r => r.id === q.id) ?? null, error: null }),
			then: (resolve) => resolve({ data: rows, error: null })
		};
		return q;
	}
});

const result = await syncAllOrdersToGoogle(fakeDb([o1, o2, o3]));
assert.deepEqual(result, { orders: 3, saved: 2, removed: 1, remaining: 0 });
assert.deepEqual(calls.filter(c => !c.startsWith('GET')).sort(), [
	`DELETE /${eventId('ORD-9')}`, // orphan removed; hand-made event left alone; ORD-1 untouched
	`POST /`, // ORD-3 created after the 404
	`PUT /${eventId('ORD-2')}`, // rate-limited once…
	`PUT /${eventId('ORD-2')}`, // …then retried
	`PUT /${eventId('ORD-3')}`
].sort());

calls = [];
await syncOrderToGoogle(fakeDb([{ ...o1, status: 'Cancelled' }]), 'ORD-1');
assert.deepEqual(calls, [`DELETE /${eventId('ORD-1')}`], 'cancelled order is taken off');

calls = [];
await syncOrderToGoogle(fakeDb([]), 'ORD-404');
assert.deepEqual(calls, [`DELETE /${eventId('ORD-404')}`], 'deleted order is taken off; 410 is fine');

googleDown = true;
const origError = console.error;
console.error = () => {};
await syncOrderToGoogle(fakeDb([o1]), 'ORD-1'); // must not throw: saving an order never fails because of Google
console.error = origError;

assert.match(eventId('ORD-1'), /^[0-9a-v]{5,1024}$/, 'event ID uses only characters Google allows');

console.log('calendar feed + Google sync OK');
