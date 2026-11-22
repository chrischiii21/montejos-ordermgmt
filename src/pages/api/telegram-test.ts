import type { APIRoute } from 'astro';
import { isDashboardSession } from '../../lib/family-link';

// Settings → Telegram Alerts: checks what THIS server (Netlify, Vercel or local) can see and,
// on POST, sends a test message to every chat ID, reporting Telegram's answer per chat.
// Dashboard session only (/api is exempt from the middleware). Never returns secret values.

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

function env(name: string): string | undefined {
	return process.env[name] || (import.meta.env as Record<string, string | undefined>)[name];
}

function status() {
	const token = env('TELEGRAM_BOT_TOKEN') || '';
	const chatIds = (env('TELEGRAM_CHAT_ID') || '').split(',').map(s => s.trim()).filter(Boolean);
	return {
		host: process.env.VERCEL ? 'Vercel' : process.env.NETLIFY ? 'Netlify' : 'Local / other',
		vercelEnv: process.env.VERCEL_ENV || null, // production / preview / development
		hasTelegramToken: !!token,
		tokenLooksValid: /^\d+:[\w-]{30,}$/.test(token),
		chatIdCount: chatIds.length,
		hasSupabaseUrl: !!env('PUBLIC_SUPABASE_URL'),
		hasServiceRoleKey: !!env('SUPABASE_SERVICE_ROLE_KEY'),
		hasCronSecret: !!env('CRON_SECRET'),
		token,
		chatIds
	};
}

const publicStatus = ({ token, chatIds, ...rest }: ReturnType<typeof status>) => rest;

export const GET: APIRoute = async ({ cookies }) => {
	if (!isDashboardSession(cookies.get('dashboard_token')?.value)) return json({ error: 'Unauthorized' }, 401);
	return json(publicStatus(status()));
};

export const POST: APIRoute = async ({ cookies }) => {
	if (!isDashboardSession(cookies.get('dashboard_token')?.value)) return json({ error: 'Unauthorized' }, 401);
	const s = status();
	if (!s.token || !s.chatIds.length) return json({ ...publicStatus(s), sent: [], error: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set on this server.' });

	const when = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' });
	const text = `✅ <b>Test alert</b>\nTelegram alerts are working on <b>${s.host}${s.vercelEnv ? ` (${s.vercelEnv})` : ''}</b>.\n${when} (PH time)`;
	const sent = [];
	for (const [i, chatId] of s.chatIds.entries()) {
		try {
			const res = await fetch(`https://api.telegram.org/bot${s.token}/sendMessage`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
			});
			const body = await res.json().catch(() => ({}));
			// Only the last 4 characters of the chat ID are shown.
			let error = body.ok ? '' : String(body.description || res.status);
			// Group chat IDs start with "-"; a dropped minus sign is the usual copy-paste mistake.
			if (!body.ok && /chat not found/i.test(error) && !chatId.startsWith('-')) {
				error += ' — this ID has no minus sign at the start. Group chat IDs begin with "-" (e.g. -123456789): add it in your environment variables and redeploy.';
			}
			sent.push({ chat: `#${i + 1} (…${chatId.slice(-4)})`, ok: !!body.ok, error });
		} catch (err) {
			sent.push({ chat: `#${i + 1} (…${chatId.slice(-4)})`, ok: false, error: err instanceof Error ? err.message : String(err) });
		}
	}
	return json({ ...publicStatus(s), sent });
};
