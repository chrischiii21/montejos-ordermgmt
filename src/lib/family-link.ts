import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

// Secret key for the read-only family calendar link (/family/<key>).
//
// Where the key comes from, in order:
//   1. A key generated from Settings → Family Calendar Link → "Generate New Link",
//      stored in the Supabase `app_settings` table (row key = 'family_link_key').
//   2. The FAMILY_LINK_KEY env var.
//   3. A stable key derived from DASHBOARD_PASSWORD, so the link works with no setup.
//
// `app_settings` needs RLS enabled with no policies, so only the service-role key
// (server-side) can read or write it:
//   create table if not exists app_settings (key text primary key, value text not null, updated_at timestamptz default now());
//   alter table app_settings enable row level security;

const SETTING_KEY = 'family_link_key';

function env(name: string): string | undefined {
	return (import.meta.env as Record<string, string | undefined>)[name] ?? process.env[name];
}

export function serviceClient() {
	const url = env('PUBLIC_SUPABASE_URL');
	const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
	if (!url || !serviceKey) return null;
	return createClient(url, serviceKey, { auth: { persistSession: false } });
}

function fallbackKey(): string {
	const explicit = env('FAMILY_LINK_KEY');
	if (explicit) return explicit;
	const password = env('DASHBOARD_PASSWORD') || 'montejo2026';
	return createHmac('sha256', password).update('family-calendar-link').digest('base64url').slice(0, 24);
}

export async function getFamilyKey(): Promise<string> {
	const db = serviceClient();
	if (db) {
		const { data, error } = await db.from('app_settings').select('value').eq('key', SETTING_KEY).maybeSingle();
		if (!error && data?.value) return data.value;
	}
	return fallbackKey();
}

/** True when the server can use the app_settings table, i.e. "Generate New Link" will work. */
export async function canGenerateFamilyKey(): Promise<boolean> {
	const db = serviceClient();
	if (!db) return false;
	const { error } = await db.from('app_settings').select('key').limit(1);
	return !error;
}

/** Creates and stores a brand-new key. The previous link stops working immediately. */
export async function regenerateFamilyKey(): Promise<string> {
	const db = serviceClient();
	if (!db) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured on the server.');
	const key = randomBytes(18).toString('base64url');
	const { error } = await db
		.from('app_settings')
		.upsert({ key: SETTING_KEY, value: key, updated_at: new Date().toISOString() });
	if (error) {
		const missingTable = /app_settings/.test(error.message) && /(does not exist|schema cache)/i.test(error.message);
		throw new Error(missingTable
			? 'The app_settings table does not exist yet. Create it in Supabase first (see src/lib/family-link.ts).'
			: error.message);
	}
	return key;
}

export async function isValidFamilyKey(key: string | undefined): Promise<boolean> {
	if (!key) return false;
	const a = Buffer.from(key);
	const b = Buffer.from(await getFamilyKey());
	return a.length === b.length && timingSafeEqual(a, b);
}

/** Same check the middleware uses for the dashboard session cookie. */
export function isDashboardSession(token: string | undefined): boolean {
	const valid = env('DASHBOARD_PASSWORD') || 'montejo2026';
	return !!token && token === valid;
}
