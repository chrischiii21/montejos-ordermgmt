import { createSign } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ORDER_EVENT_SELECT, manilaTime, orderEvent, type FeedOrder } from './ics.ts';
import { phtDate } from './reminders.js';

// Live family calendar: every saved order is written straight into a shared Google Calendar, so family
// members using the Google Calendar app (and its home-screen widget) see changes within about a minute.
//
// One-time setup:
//   1. console.cloud.google.com: create a project → enable "Google Calendar API" → IAM & Admin →
//      Service Accounts → create one → Keys → Add key → JSON (downloads a .json file).
//   2. calendar.google.com (shop's account): Other calendars → + → Create new calendar "Montejo's Orders".
//      Its settings → "Share with specific people" → add the service account's email (client_email in the
//      .json) with "Make changes to events". Copy the "Calendar ID" under "Integrate calendar".
//   3. Vercel env vars: GOOGLE_SERVICE_ACCOUNT_JSON = the whole .json file contents,
//      GOOGLE_CALENDAR_ID = the calendar ID. Redeploy.
//   4. Dashboard → Settings → Live Google Calendar → "Sync all orders now" to copy the existing orders.
//   5. Share the calendar with each family member's Gmail ("See all event details").
// Until steps 1–3 are done every function here does nothing.

type Config = { email: string; privateKey: string; calendarId: string };
type GEvent = {
	id: string;
	summary: string;
	description: string;
	location: string;
	start: { dateTime: string; timeZone: string };
	end: { dateTime: string; timeZone: string };
	status: 'confirmed';
	extendedProperties: { private: { orderId: string } };
};

const env = (name: string): string | undefined => process.env[name] || (import.meta.env as Record<string, string> | undefined)?.[name];

export const isGoogleCalendarConfigured = () => !!(env('GOOGLE_SERVICE_ACCOUNT_JSON') && env('GOOGLE_CALENDAR_ID'));

function config(): Config | null {
	const raw = env('GOOGLE_SERVICE_ACCOUNT_JSON');
	const calendarId = env('GOOGLE_CALENDAR_ID')?.trim(); // a pasted trailing space/newline would make Google answer Not Found
	if (!raw || !calendarId) return null;
	let key: { client_email?: string; private_key?: string };
	try { key = JSON.parse(raw); } catch { throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON. Paste the whole .json key file.'); }
	if (!key.client_email || !key.private_key) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is missing client_email or private_key.');
	return { email: key.client_email, privateKey: key.private_key, calendarId };
}

// Service-account sign-in (OAuth JWT bearer flow). Tokens last an hour; reused while the function stays warm.
let cachedToken: { value: string; expires: number } | null = null;

async function accessToken(c: Config): Promise<string> {
	if (cachedToken && cachedToken.expires > Date.now() + 60e3) return cachedToken.value;
	const now = Math.floor(Date.now() / 1000);
	const part = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
	const unsigned = part({ alg: 'RS256', typ: 'JWT' }) + '.' + part({
		iss: c.email,
		scope: 'https://www.googleapis.com/auth/calendar.events',
		aud: 'https://oauth2.googleapis.com/token',
		iat: now,
		exp: now + 3600
	});
	const jwt = `${unsigned}.${createSign('RSA-SHA256').update(unsigned).sign(c.privateKey, 'base64url')}`;
	const res = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
		signal: AbortSignal.timeout(8000)
	});
	const body = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(`Google sign-in failed: ${body.error_description || body.error || res.status}`);
	cachedToken = { value: body.access_token, expires: Date.now() + body.expires_in * 1000 };
	return cachedToken.value;
}

async function gcal(c: Config, method: string, path: string, body?: unknown): Promise<Response> {
	for (let attempt = 0; ; attempt++) {
		const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(c.calendarId)}/events${path}`, {
			method,
			headers: { Authorization: `Bearer ${await accessToken(c)}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
			body: body ? JSON.stringify(body) : undefined,
			signal: AbortSignal.timeout(8000)
		});
		// Google limits how fast events can be written ("Rate Limit Exceeded", as 403 or 429): wait 1, 2, 4, 8 s and retry.
		const limited = res.status === 429 || (res.status === 403 && /rate ?limit/i.test(await res.clone().text()));
		if (!limited || attempt === 4) return res;
		await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt));
	}
}

async function fail(res: Response, what: string): Promise<never> {
	const body = await res.json().catch(() => ({}));
	throw new Error(`${what}: ${body.error?.message || `HTTP ${res.status}`}`);
}

/** Google event IDs allow only 0-9 and a-v, so the order ID is hex-encoded. Same order → same event. */
export const eventId = (orderId: string) => 'mo' + Buffer.from(orderId).toString('hex');

function toGoogle(o: FeedOrder): GEvent | null {
	const e = o.status === 'Cancelled' ? null : orderEvent(o);
	if (!e) return null;
	return {
		id: eventId(o.id),
		summary: e.summary,
		description: e.description,
		location: e.location,
		start: { dateTime: e.start.toISOString(), timeZone: 'Asia/Manila' },
		end: { dateTime: e.end.toISOString(), timeZone: 'Asia/Manila' },
		status: 'confirmed', // also brings back an event that was deleted when the order was cancelled
		extendedProperties: { private: { orderId: o.id } }
	};
}

async function save(c: Config, ev: GEvent): Promise<void> {
	let res = await gcal(c, 'PUT', `/${ev.id}`, ev);
	if (res.status === 404) res = await gcal(c, 'POST', '', ev); // first time for this order
	if (!res.ok) await fail(res, `Could not save ${ev.extendedProperties.private.orderId}`);
}

async function remove(c: Config, id: string): Promise<void> {
	const res = await gcal(c, 'DELETE', `/${id}`);
	if (!res.ok && res.status !== 404 && res.status !== 410) await fail(res, `Could not remove event ${id}`);
}

/**
 * Puts one order's current state on the calendar, or takes it off (deleted, cancelled, no date yet).
 * Call after every create/update/delete. Never throws: saving an order must not fail because of Google;
 * anything missed is fixed by the daily full sync.
 */
export async function syncOrderToGoogle(db: SupabaseClient, orderId: string): Promise<void> {
	try {
		const c = config();
		if (!c) return;
		const { data, error } = await db.from('orders').select(ORDER_EVENT_SELECT).eq('id', orderId).maybeSingle();
		if (error) throw error;
		const ev = data ? toGoogle(data as FeedOrder) : null;
		if (ev) await save(c, ev);
		else await remove(c, eventId(orderId));
	} catch (err) {
		console.error(`[google-calendar] ${orderId}:`, err);
	}
}

const sameTime = (a: string | undefined, b: string) => Date.parse(a ?? '') === Date.parse(b);

/**
 * Makes the calendar match the orders from 2 months ago onward: saves what's missing or different,
 * removes events of orders that no longer exist or were cancelled. Older events are left alone.
 */
export async function syncAllOrdersToGoogle(
	db: SupabaseClient
): Promise<{ orders: number; saved: number; removed: number; remaining: number }> {
	const started = Date.now();
	const c = config();
	if (!c) throw new Error('Google Calendar is not set up yet (GOOGLE_SERVICE_ACCOUNT_JSON and GOOGLE_CALENDAR_ID).');
	const since = `${phtDate(-60).dateStr} 00:00`;
	const { data, error } = await db
		.from('orders')
		.select(ORDER_EVENT_SELECT)
		.not('status', 'eq', 'Cancelled')
		.gte('delivery_date_time', since);
	if (error) throw new Error(error.message);
	const wanted = new Map<string, GEvent>();
	for (const o of (data ?? []) as FeedOrder[]) {
		const ev = toGoogle(o);
		if (ev) wanted.set(ev.id, ev);
	}

	const existing = new Map<string, any>();
	let pageToken = '';
	do {
		const q = new URLSearchParams({ timeMin: manilaTime(since)!.toISOString(), maxResults: '2500' });
		if (pageToken) q.set('pageToken', pageToken);
		const res = await gcal(c, 'GET', `?${q}`);
		// Google says 404 both for a wrong ID and for a calendar the service account can't see.
		if (res.status === 404) {
			throw new Error(`Google can't find calendar "${c.calendarId}". Check GOOGLE_CALENDAR_ID, and that the calendar is shared with ${c.email} as "Make changes to events".`);
		}
		if (!res.ok) await fail(res, 'Could not read the Google Calendar');
		const page = await res.json();
		for (const ev of page.items ?? []) existing.set(ev.id, ev);
		pageToken = page.nextPageToken ?? '';
	} while (pageToken);

	const toSave = [...wanted.values()].filter(ev => {
		const cur = existing.get(ev.id);
		return !cur || cur.summary !== ev.summary || (cur.description ?? '') !== ev.description
			|| (cur.location ?? '') !== ev.location || !sameTime(cur.start?.dateTime, ev.start.dateTime)
			|| !sameTime(cur.end?.dateTime, ev.end.dateTime);
	});
	// Only events this sync created (tagged with an orderId), never ones added by hand.
	const toRemove = [...existing.values()]
		.filter(ev => ev.extendedProperties?.private?.orderId && !wanted.has(ev.id))
		.map(ev => ev.id as string);

	// One write at a time: Google rejects bursts of event writes on one calendar (gcal() retries when it does).
	// ponytail: stops after 45 s to stay inside Vercel's function time limit. The next sync (button or nightly
	// cron) carries on, because events that are already right are skipped.
	const jobs = [...toSave.map(ev => () => save(c, ev)), ...toRemove.map(id => () => remove(c, id))];
	let done = 0;
	while (done < jobs.length && Date.now() - started < 45_000) await jobs[done++]();
	return {
		orders: wanted.size,
		saved: Math.min(done, toSave.length),
		removed: Math.max(0, done - toSave.length),
		remaining: jobs.length - done
	};
}
