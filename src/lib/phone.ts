// Philippine mobile numbers: 11 digits starting with 09 (e.g. 09171234567).
// People also type +63 917 123 4567, 63917…, or 917…; those are converted to the 09… form.
// Used by the customer order link, the owner's order form and the server.

/** Clean up what was typed so far: digits only, +63/63 → 0, a leading 9 → 09, never more than 11 digits. */
export function normalizePhMobile(raw: string): string {
	let d = String(raw ?? '').replace(/\D/g, '');
	if (d.startsWith('63')) {
		// "63 9xx…" is the international form: allow up to 12 digits, then convert to 09…
		d = d.slice(0, 12);
		return d.length === 12 ? '0' + d.slice(2) : d;
	}
	if (d.startsWith('9')) d = '0' + d;
	return d.slice(0, 11);
}

/** A complete PH mobile number: 09 followed by 9 digits. */
export function isValidPhMobile(value: string): boolean {
	return /^09\d{9}$/.test(String(value ?? ''));
}

export const PH_MOBILE_HINT = '11-digit mobile number starting with 09, e.g. 09171234567';
