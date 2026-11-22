import type { APIRoute } from 'astro';
import { isDashboardSession } from '../../lib/family-link';

// POST: suggest delivery fees for service areas without a fee, based on the fees the owner
// already set and each area's road distance from the shop. Uses Groq (OpenAI-compatible API).
// Needs GROQ_API_KEY in the environment; GROQ_MODEL optionally overrides the model.
// Dashboard session only (/api is exempt from the middleware). Suggestions are never saved here:
// the Settings page fills them in for the owner to review and save.

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

function env(name: string): string | undefined {
	return (import.meta.env as Record<string, string | undefined>)[name] ?? process.env[name];
}

// ---------- Groq helpers ----------
const GROQ = 'https://api.groq.com/openai/v1';
// Tried in order; the first one this key can use wins. Anything else chat-capable is the fallback.
const PREFERRED_MODELS = [
	'openai/gpt-oss-120b',
	'llama-3.3-70b-versatile',
	'moonshotai/kimi-k2-instruct',
	'qwen/qwen3-32b',
	'openai/gpt-oss-20b',
	'meta-llama/llama-4-maverick-17b-128e-instruct',
	'meta-llama/llama-4-scout-17b-16e-instruct',
	'llama-3.1-8b-instant'
];
// Not text-chat models (speech, safety classifiers, etc.).
const NOT_CHAT = /whisper|tts|playai|guard|distil|orpheus|compound/i;
let cachedModel: string | null = null;

async function pickModel(apiKey: string, avoid?: string): Promise<string> {
	if (cachedModel && cachedModel !== avoid) return cachedModel;
	const res = await fetch(`${GROQ}/models`, { headers: { Authorization: `Bearer ${apiKey}` } });
	const body = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(body?.error?.message || `model list failed (${res.status})`);
	const ids: string[] = (body?.data ?? [])
		.filter((m: any) => m?.active !== false && typeof m?.id === 'string' && !NOT_CHAT.test(m.id) && m.id !== avoid)
		.map((m: any) => m.id);
	const wanted = env('GROQ_MODEL');
	const choice = (wanted && ids.includes(wanted) ? wanted : null)
		?? PREFERRED_MODELS.find(id => ids.includes(id))
		?? ids[0];
	if (!choice) throw new Error('no chat model is available for this Groq API key');
	cachedModel = choice;
	return choice;
}

async function chat(apiKey: string, model: string, messages: unknown[], jsonMode: boolean): Promise<{ ok: true; content: string } | { ok: false; error: string }> {
	const res = await fetch(`${GROQ}/chat/completions`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
		body: JSON.stringify({
			model,
			temperature: 0.1,
			...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
			messages
		})
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) return { ok: false, error: String(data?.error?.message || res.status) };
	return { ok: true, content: String(data?.choices?.[0]?.message?.content ?? '') };
}

interface Priced { label: string; km: number; min: number; fee: number }
interface Unpriced { label: string; km: number; min: number }

export const POST: APIRoute = async ({ request, cookies }) => {
	if (!isDashboardSession(cookies.get('dashboard_token')?.value)) return json({ error: 'Unauthorized' }, 401);

	const apiKey = env('GROQ_API_KEY');
	if (!apiKey) return json({ error: 'GROQ_API_KEY is not set on the server. Add it to .env (and Netlify/Vercel) to use AI suggestions.' }, 500);

	const body = await request.json().catch(() => null);
	const num = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : NaN);
	const priced: Priced[] = (Array.isArray(body?.priced) ? body.priced : [])
		.map((p: any) => ({ label: String(p?.label ?? '').slice(0, 100), km: num(p?.km), min: num(p?.min), fee: num(p?.fee) }))
		.filter((p: Priced) => p.label && p.km >= 0 && p.fee >= 0)
		.slice(0, 200);
	const unpriced: Unpriced[] = (Array.isArray(body?.unpriced) ? body.unpriced : [])
		.map((p: any) => ({ label: String(p?.label ?? '').slice(0, 100), km: num(p?.km), min: num(p?.min) }))
		.filter((p: Unpriced) => p.label && p.km >= 0)
		.slice(0, 200);

	if (priced.length < 2) return json({ error: 'Set fees for at least 2 areas first, so the AI can follow your pricing.' }, 400);
	if (!unpriced.length) return json({ error: 'No areas without a fee to suggest for.' }, 400);

	const prompt = [
		'You help a small lechon and food tray shop in Argao, Cebu, Philippines set delivery fees in Philippine pesos.',
		'Below are the fees the owner already set for some service areas, with each area\'s road distance and driving time from the shop.',
		'Driving time matters: a long time for a short distance means steep or rough mountain roads, which this owner charges much more for.',
		'Suggest a fee for each area in the second list that follows the owner\'s own pricing pattern',
		'(how the fee grows with distance and driving time, any minimum fee, and the way they round). Do not invent a different pricing style.',
		'Base each suggestion mostly on the owner\'s areas with the most similar distance AND driving time.',
		'Round every fee to the nearest 10 pesos.',
		'',
		'Owner\'s fees (area | km | minutes | fee):',
		...priced.map(p => `${p.label} | ${p.km} km | ${isFinite(p.min) ? p.min : '?'} min | ₱${p.fee}`),
		'',
		'Suggest fees for (area | km | minutes):',
		...unpriced.map(u => `${u.label} | ${u.km} km | ${isFinite(u.min) ? u.min : '?'} min`),
		'',
		'Reply with JSON only, exactly in this shape:',
		'{"rule": "<one short sentence describing the pricing pattern you followed>", "suggestions": [{"label": "<area exactly as given>", "fee": <number>}]}'
	].join('\n');

	const messages = [
		{ role: 'system', content: 'You are a careful pricing assistant. You reply with valid JSON only.' },
		{ role: 'user', content: prompt }
	];

	// Model: GROQ_MODEL if set and available, otherwise the best one this key can use (Groq retires
	// models over time, so a fixed name eventually breaks).
	let model: string;
	try {
		model = await pickModel(apiKey);
	} catch (err) {
		return json({ error: `Could not reach Groq: ${err instanceof Error ? err.message : String(err)}` }, 502);
	}

	let content = '';
	try {
		let result = await chat(apiKey, model, messages, true);
		// Some models don't support JSON mode: ask again without it and read the JSON from the text.
		if (!result.ok && /response_format|json/i.test(result.error)) result = await chat(apiKey, model, messages, false);
		// The chosen model just went away: refresh the list once and retry.
		if (!result.ok && /does not exist|decommissioned|not have access|model_not_found/i.test(result.error)) {
			cachedModel = null;
			model = await pickModel(apiKey, model);
			result = await chat(apiKey, model, messages, true);
		}
		if (!result.ok) return json({ error: `Groq error (${model}): ${result.error}` }, 502);
		content = result.content;
	} catch (err) {
		return json({ error: `Could not reach Groq: ${err instanceof Error ? err.message : String(err)}` }, 502);
	}

	let parsed: any;
	try {
		parsed = JSON.parse(content);
	} catch {
		const match = content.match(/\{[\s\S]*\}/);
		try { parsed = match ? JSON.parse(match[0]) : null; } catch { parsed = null; }
		if (!parsed) return json({ error: 'The AI reply could not be read. Please try again.' }, 502);
	}

	// Keep only areas we asked about, with sane fees, rounded to ₱10.
	const wanted = new Set(unpriced.map(u => u.label));
	const maxFee = Math.max(...priced.map(p => p.fee)) * 4 + 500;
	const suggestions = (Array.isArray(parsed?.suggestions) ? parsed.suggestions : [])
		.map((s: any) => ({ label: String(s?.label ?? ''), fee: Math.round(Number(s?.fee) / 10) * 10 }))
		.filter((s: { label: string; fee: number }) => wanted.has(s.label) && isFinite(s.fee) && s.fee >= 0 && s.fee <= maxFee);

	return json({ rule: typeof parsed?.rule === 'string' ? parsed.rule.slice(0, 300) : '', suggestions, model });
};
