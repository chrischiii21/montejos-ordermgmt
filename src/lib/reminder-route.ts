import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { runOrderReminder } from './reminders.js';

// Builds the GET handler used by the Vercel cron routes (/api/daily-reminder, /api/tomorrow-reminder).
export function reminderRoute(which: 'today' | 'tomorrow'): APIRoute {
	return async ({ request }) => {
		const env = (name: string) => process.env[name] || (import.meta.env as Record<string, string | undefined>)[name];

		// Vercel sends "Authorization: Bearer <CRON_SECRET>" when CRON_SECRET is set.
		const CRON_SECRET = env('CRON_SECRET');
		if (CRON_SECRET && request.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
			return json({ error: 'Unauthorized' }, 401);
		}

		const url = env('PUBLIC_SUPABASE_URL');
		const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
		const token = env('TELEGRAM_BOT_TOKEN');
		const chatIds = env('TELEGRAM_CHAT_ID');
		if (!url || !serviceKey || !token || !chatIds) {
			return json({
				error: 'Missing configuration variables',
				debug: { hasSupabaseUrl: !!url, hasServiceKey: !!serviceKey, hasTelegramToken: !!token, hasTelegramChatId: !!chatIds }
			}, 500);
		}

		try {
			const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
			const result = await runOrderReminder(which, { supabase, token, chatIds });
			console.log(`[${which}-reminder]`, result);
			return json({ ok: true, ...result });
		} catch (err) {
			console.error(`[${which}-reminder] failed:`, err);
			return json({ error: err instanceof Error ? err.message : String(err) }, 500);
		}
	};
}

function json(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
