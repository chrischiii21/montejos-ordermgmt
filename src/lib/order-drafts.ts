// Customer drafts for the order link (/order?id=…): what the customer has filled in so far,
// so they can close the link and continue later (any device), and so the dashboard can show
// "Link opened" / "Customer filling in".
// Stored in the existing `app_settings` table under the key "order_draft:<order id>" (no extra SQL).
// Removed when the customer submits.
import { serviceClient } from './family-link';

const PREFIX = 'order_draft:';

export interface OrderDraft {
	step: number;                 // furthest step reached (1–3)
	fields: Record<string, unknown>;
	filled: number;               // how many fields have something in them (for the dashboard)
	openedAt: string;
	updatedAt: string;
}

export async function getDraft(orderId: string): Promise<OrderDraft | null> {
	const db = serviceClient();
	if (!db) return null;
	const { data, error } = await db.from('app_settings').select('value').eq('key', PREFIX + orderId).maybeSingle();
	if (error || !data?.value) return null;
	try { return JSON.parse(data.value); } catch { return null; }
}

export async function saveDraft(orderId: string, step: number, fields: Record<string, unknown>): Promise<void> {
	const db = serviceClient();
	if (!db) return;
	const previous = await getDraft(orderId);
	const now = new Date().toISOString();
	const filled = Object.values(fields).filter(v => (typeof v === 'string' ? v.trim() !== '' : v != null && (typeof v !== 'object' || Object.keys(v as object).length > 0))).length;
	const draft: OrderDraft = {
		step: Math.max(previous?.step ?? 1, Math.min(Math.max(Math.round(step) || 1, 1), 3)),
		fields,
		filled,
		openedAt: previous?.openedAt ?? now,
		updatedAt: now
	};
	await db.from('app_settings').upsert({ key: PREFIX + orderId, value: JSON.stringify(draft), updated_at: now });
}

export async function deleteDraft(orderId: string): Promise<void> {
	const db = serviceClient();
	if (!db) return;
	await db.from('app_settings').delete().eq('key', PREFIX + orderId);
}

/** All drafts, keyed by order ID (for the dashboard). Fields are left out: only progress is shown there. */
export async function listDrafts(): Promise<Record<string, Omit<OrderDraft, 'fields'>>> {
	const db = serviceClient();
	if (!db) return {};
	const { data, error } = await db.from('app_settings').select('key, value').like('key', PREFIX + '%').limit(1000);
	if (error || !data) return {};
	const out: Record<string, Omit<OrderDraft, 'fields'>> = {};
	for (const row of data) {
		try {
			const { fields, ...rest } = JSON.parse(row.value) as OrderDraft;
			out[row.key.slice(PREFIX.length)] = rest;
		} catch { /* skip bad rows */ }
	}
	return out;
}
