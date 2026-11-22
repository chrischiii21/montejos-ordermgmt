// Delivery fee per barangay/area, edited in Settings → Delivery Fees by Barangay.
// Stored as JSON in the existing `app_settings` table (row key 'delivery_zones'), so no extra SQL is needed.
// The customer order link shows these as a dropdown for Delivery orders; the server looks the fee up
// here when the customer submits, so the price can't be changed from the page.
import { serviceClient } from './family-link';
import { areaLabel } from './service-areas';

/** A service area with a delivery fee. Preset barangays carry their town; custom areas don't. */
export interface DeliveryZone { name: string; town?: string; fee: number }

const SETTING_KEY = 'delivery_zones';
/** Value the order link sends when the customer's area isn't on the list (fee set later by the shop). */
export const OTHER_ZONE = '__other__';

function clean(list: unknown): DeliveryZone[] {
	if (!Array.isArray(list)) return [];
	const seen = new Set<string>();
	const out: DeliveryZone[] = [];
	for (const z of list) {
		const name = typeof z?.name === 'string' ? z.name.trim().slice(0, 80) : '';
		const town = typeof z?.town === 'string' ? z.town.trim().slice(0, 40) : '';
		const fee = Math.round(Math.max(0, Number(z?.fee) || 0) * 100) / 100;
		const key = areaLabel(name, town).toLowerCase();
		if (!name || seen.has(key)) continue;
		seen.add(key);
		out.push(town ? { name, town, fee } : { name, fee });
	}
	// Grouped by town (custom areas last), then by name.
	return out.sort((a, b) => (a.town || '￿').localeCompare(b.town || '￿') || a.name.localeCompare(b.name));
}

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
	const db = serviceClient();
	if (!db) return [];
	const { data, error } = await db.from('app_settings').select('value').eq('key', SETTING_KEY).maybeSingle();
	if (error || !data?.value) return [];
	try { return clean(JSON.parse(data.value)); } catch { return []; }
}

export async function saveDeliveryZones(list: unknown): Promise<DeliveryZone[]> {
	const db = serviceClient();
	if (!db) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured on the server.');
	const zones = clean(list);
	const { error } = await db
		.from('app_settings')
		.upsert({ key: SETTING_KEY, value: JSON.stringify(zones), updated_at: new Date().toISOString() });
	if (error) {
		const missingTable = /app_settings/.test(error.message) && /(does not exist|schema cache)/i.test(error.message);
		throw new Error(missingTable
			? 'The app_settings table does not exist yet. Create it in Supabase first (see src/lib/family-link.ts).'
			: error.message);
	}
	return zones;
}

// ---------- Pickup address (shown to customers who choose Pickup) ----------
export interface PickupInfo { address: string; mapUrl: string }
const PICKUP_KEY = 'pickup_info';
export const DEFAULT_PICKUP_ADDRESS = 'Poblacion, Argao, Cebu';

export async function getPickupInfo(): Promise<PickupInfo> {
	const db = serviceClient();
	const fallback = { address: DEFAULT_PICKUP_ADDRESS, mapUrl: '' };
	if (!db) return fallback;
	const { data, error } = await db.from('app_settings').select('value').eq('key', PICKUP_KEY).maybeSingle();
	if (error || !data?.value) return fallback;
	try {
		const v = JSON.parse(data.value);
		return { address: String(v.address || '').trim() || DEFAULT_PICKUP_ADDRESS, mapUrl: String(v.mapUrl || '').trim() };
	} catch { return fallback; }
}

export async function savePickupInfo(info: unknown): Promise<PickupInfo> {
	const db = serviceClient();
	if (!db) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured on the server.');
	const v = (info ?? {}) as Record<string, unknown>;
	const mapUrl = String(v.mapUrl || '').trim().slice(0, 500);
	const clean = {
		address: String(v.address || '').trim().slice(0, 300),
		mapUrl: /^https?:\/\//i.test(mapUrl) ? mapUrl : ''
	};
	const { error } = await db
		.from('app_settings')
		.upsert({ key: PICKUP_KEY, value: JSON.stringify(clean), updated_at: new Date().toISOString() });
	if (error) throw new Error(error.message);
	return { address: clean.address || DEFAULT_PICKUP_ADDRESS, mapUrl: clean.mapUrl };
}

export async function findZone(name: unknown): Promise<DeliveryZone | null> {
	if (typeof name !== 'string' || !name.trim()) return null;
	// The order link sends the area's label, e.g. "Bogo, Argao" (or a custom area's plain name).
	const wanted = name.trim().toLowerCase();
	const zones = await getDeliveryZones();
	return zones.find(z => areaLabel(z.name, z.town).toLowerCase() === wanted) ?? null;
}
