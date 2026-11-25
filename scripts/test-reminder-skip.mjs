// Checks the daily reminder only sends when an order changed after 6 PM yesterday (PHT).
// No network: Supabase and Telegram are faked. Run: node scripts/test-reminder-skip.mjs
import assert from 'node:assert/strict';
import { runOrderReminder } from '../src/lib/reminders.js';

let sends = 0;
globalThis.fetch = async () => { sends++; return { ok: true }; };

const ORDER = { id: 'ORD-1', customer: 'Ana', delivery_date_time: '2026-01-01 10:00', order_items: [], total: 0, downpayment: 0, balance: 0 };

const fakeDb = (changedAt, { orders = [ORDER], settingsError = null } = {}) => ({
	from: () => {
		const q = {
			select: () => q, gte: () => q, lte: () => q, not: () => q, eq: () => q, order: () => q,
			maybeSingle: async () => ({ data: changedAt ? { value: changedAt } : null, error: settingsError }),
			then: (resolve) => resolve({ data: orders, error: null })
		};
		return q;
	}
});

const run = (db, which = 'today') => runOrderReminder(which, { supabase: db, token: 't', chatIds: '1' });
const now = new Date().toISOString();
const twoDaysAgo = new Date(Date.now() - 2 * 864e5).toISOString();

// 2 AM
assert.equal((await run(fakeDb(now))).sent, true, 'changed after 6 PM → send');
assert.equal((await run(fakeDb(twoDaysAgo))).sent, false, 'changed before 6 PM → skip');
assert.equal((await run(fakeDb(null))).sent, false, 'never changed → skip');
assert.equal((await run(fakeDb(null, { settingsError: { message: 'down' } }))).sent, true, "can't read → send");
assert.equal((await run(fakeDb(now, { orders: [] }))).sent, false, 'no orders today → 2 AM silent, even after a change');
// 5 AM
assert.equal((await run(fakeDb(null, { orders: [] }), 'no-orders')).sent, true, 'no orders today → 5 AM sends');
assert.equal((await run(fakeDb(now), 'no-orders')).sent, false, 'orders today → 5 AM silent');
// 6 PM
assert.equal((await run(fakeDb(null, { orders: [] }), 'tomorrow')).sent, false, 'no orders tomorrow → 6 PM silent');
assert.equal(sends, 3);
console.log('ok');
