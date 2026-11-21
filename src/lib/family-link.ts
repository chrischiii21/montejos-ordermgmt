import { createHmac, timingSafeEqual } from 'node:crypto';

// Secret key for the read-only family calendar link (/family/<key>).
// Uses FAMILY_LINK_KEY if set; otherwise derives a stable key from DASHBOARD_PASSWORD,
// so the link works with no extra setup. Changing either value revokes the old link.
function env(name: string): string | undefined {
	return (import.meta.env as Record<string, string | undefined>)[name] ?? process.env[name];
}

export function getFamilyKey(): string {
	const explicit = env('FAMILY_LINK_KEY');
	if (explicit) return explicit;
	const password = env('DASHBOARD_PASSWORD') || 'montejo2026';
	return createHmac('sha256', password).update('family-calendar-link').digest('base64url').slice(0, 24);
}

export function isValidFamilyKey(key: string | undefined): boolean {
	if (!key) return false;
	const a = Buffer.from(key);
	const b = Buffer.from(getFamilyKey());
	return a.length === b.length && timingSafeEqual(a, b);
}
