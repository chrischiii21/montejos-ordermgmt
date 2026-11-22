// Visit log for the family calendar link (/family/<key>), shown in Settings → Family Link Visits.
//
// Needs this table in Supabase (RLS on, no policies, so only the server's service-role key can use it):
//   create table if not exists family_visits (
//     id bigint generated always as identity primary key,
//     visited_at timestamptz not null default now(),
//     device_id text not null,
//     model text,
//     os text,
//     browser text,
//     standalone boolean not null default false,
//     user_agent text
//   );
//   create index if not exists family_visits_visited_at on family_visits (visited_at desc);
//   alter table family_visits enable row level security;
//
// What can be known about the phone:
//   - Android Chrome: the real model (e.g. SM-A546E), via navigator.userAgentData on the page.
//   - Messenger/Facebook's built-in browser: usually the model, from its user agent.
//   - iPhone in Safari: only "iPhone" + iOS version. Apple hides the model from all websites.

export interface DeviceInfo { model: string; os: string; browser: string }

// Facebook/Messenger report iPhones by hardware identifier (e.g. FBDV/iPhone14,5).
const IPHONE_IDS: Record<string, string> = {
	'iPhone12,1': 'iPhone 11', 'iPhone12,3': 'iPhone 11 Pro', 'iPhone12,5': 'iPhone 11 Pro Max', 'iPhone12,8': 'iPhone SE (2nd gen)',
	'iPhone13,1': 'iPhone 12 mini', 'iPhone13,2': 'iPhone 12', 'iPhone13,3': 'iPhone 12 Pro', 'iPhone13,4': 'iPhone 12 Pro Max',
	'iPhone14,4': 'iPhone 13 mini', 'iPhone14,5': 'iPhone 13', 'iPhone14,2': 'iPhone 13 Pro', 'iPhone14,3': 'iPhone 13 Pro Max',
	'iPhone14,6': 'iPhone SE (3rd gen)', 'iPhone14,7': 'iPhone 14', 'iPhone14,8': 'iPhone 14 Plus',
	'iPhone15,2': 'iPhone 14 Pro', 'iPhone15,3': 'iPhone 14 Pro Max', 'iPhone15,4': 'iPhone 15', 'iPhone15,5': 'iPhone 15 Plus',
	'iPhone16,1': 'iPhone 15 Pro', 'iPhone16,2': 'iPhone 15 Pro Max',
	'iPhone17,1': 'iPhone 16 Pro', 'iPhone17,2': 'iPhone 16 Pro Max', 'iPhone17,3': 'iPhone 16', 'iPhone17,4': 'iPhone 16 Plus', 'iPhone17,5': 'iPhone 16e'
};

// Common model-code prefixes → brand, so "SM-A546E" reads as "Samsung SM-A546E".
const BRAND_PREFIXES: [RegExp, string][] = [
	[/^SM-/i, 'Samsung'], [/^CPH\d/i, 'OPPO'], [/^RMX\d/i, 'realme'], [/^V2\d{3}/i, 'vivo'],
	[/^TECNO/i, ''], [/^Infinix/i, ''], [/^(Redmi|POCO|Mi )/i, ''], [/^Pixel/i, 'Google'], [/^moto/i, 'Motorola'], [/^Nokia/i, '']
];

function withBrand(model: string): string {
	model = model.replace(/^SAMSUNG\s+/i, ''); // Samsung Internet sends "SAMSUNG SM-S918B"
	for (const [re, brand] of BRAND_PREFIXES) if (re.test(model)) return brand ? `${brand} ${model}` : model;
	return model;
}

export function describeDevice(ua: string, hintModel?: string, hintPlatformVersion?: string): DeviceInfo {
	// --- OS ---
	let os = 'Unknown';
	const ios = ua.match(/(?:iPhone|iPad|iPod).*?OS (\d+)[_.](\d+)/);
	const android = ua.match(/Android (\d+(?:\.\d+)?)/);
	if (ios) os = `iOS ${ios[1]}.${ios[2]}`;
	else if (android) os = `Android ${hintPlatformVersion?.split('.')[0] || android[1]}`;
	else if (/Windows/.test(ua)) os = 'Windows';
	else if (/Macintosh/.test(ua)) os = 'Mac';
	else if (/Linux/.test(ua)) os = 'Linux';

	// --- Model ---
	let model = '';
	const fbdv = ua.match(/FBDV\/([^;\]]+)/);
	if (hintModel) model = withBrand(hintModel);
	else if (fbdv) model = IPHONE_IDS[fbdv[1]] ?? withBrand(fbdv[1]);
	else if (android) {
		// "Android 14; SM-A546E Build/..." — Chrome now sends "Android 10; K" (model hidden), so skip that.
		const m = ua.match(/Android [\d.]+;\s*(?:[a-z]{2}[-_][a-z]{2};\s*)?([^;)]+?)(?:\s+Build\/[^;)]*)?[;)]/i);
		const raw = m?.[1]?.trim();
		if (raw && raw !== 'K' && raw !== 'wv') model = withBrand(raw);
	}
	if (!model) {
		if (/iPhone/.test(ua)) model = 'iPhone (model hidden by Apple)';
		else if (/iPad/.test(ua) || (/Macintosh/.test(ua) && /Mobile/.test(ua))) model = 'iPad';
		else if (android) model = 'Android phone (model not shared)';
		else if (/Windows|Macintosh|Linux|CrOS/.test(ua)) model = 'Computer';
		else model = 'Unknown device';
	}

	// --- Browser (in-app browsers first, since their UA also contains Safari/Chrome) ---
	let browser = 'Unknown';
	if (/MessengerForiOS|MessengerLite|Orca-Android|FBAN\/Messenger/.test(ua)) browser = 'Messenger';
	else if (/Instagram/.test(ua)) browser = 'Instagram';
	else if (/FBAN|FBAV|FB_IAB|FBIOS|FB4A/.test(ua)) browser = 'Facebook';
	else if (/SamsungBrowser/.test(ua)) browser = 'Samsung Internet';
	else if (/EdgA|EdgiOS|Edg\//.test(ua)) browser = 'Edge';
	else if (/OPR\/|Opera/.test(ua)) browser = 'Opera';
	else if (/FxiOS|Firefox/.test(ua)) browser = 'Firefox';
	else if (/CriOS|Chrome\//.test(ua)) browser = 'Chrome';
	else if (/Safari\//.test(ua)) browser = 'Safari';

	return { model, os, browser };
}

export function isMissingTable(message: string): boolean {
	return /family_visits/.test(message) && /(does not exist|schema cache)/i.test(message);
}
