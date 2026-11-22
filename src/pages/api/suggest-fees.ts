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

	let data: any;
	try {
		const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
			body: JSON.stringify({
				model: env('GROQ_MODEL') || 'llama-3.3-70b-versatile',
				temperature: 0.1,
				response_format: { type: 'json_object' },
				messages: [
					{ role: 'system', content: 'You are a careful pricing assistant. You reply with valid JSON only.' },
					{ role: 'user', content: prompt }
				]
			})
		});
		data = await res.json().catch(() => ({}));
		if (!res.ok) return json({ error: `Groq error: ${data?.error?.message || res.status}` }, 502);
	} catch (err) {
		return json({ error: `Could not reach Groq: ${err instanceof Error ? err.message : String(err)}` }, 502);
	}

	let parsed: any;
	try {
		parsed = JSON.parse(data?.choices?.[0]?.message?.content ?? '{}');
	} catch {
		return json({ error: 'The AI reply could not be read. Please try again.' }, 502);
	}

	// Keep only areas we asked about, with sane fees, rounded to ₱10.
	const wanted = new Set(unpriced.map(u => u.label));
	const maxFee = Math.max(...priced.map(p => p.fee)) * 4 + 500;
	const suggestions = (Array.isArray(parsed?.suggestions) ? parsed.suggestions : [])
		.map((s: any) => ({ label: String(s?.label ?? ''), fee: Math.round(Number(s?.fee) / 10) * 10 }))
		.filter((s: { label: string; fee: number }) => wanted.has(s.label) && isFinite(s.fee) && s.fee >= 0 && s.fee <= maxFee);

	return json({ rule: typeof parsed?.rule === 'string' ? parsed.rule.slice(0, 300) : '', suggestions });
};
