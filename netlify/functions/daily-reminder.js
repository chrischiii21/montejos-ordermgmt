import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { schedule } from '@netlify/functions';
import { runOrderReminder } from '../../src/lib/reminders.js';

// 20:00 UTC = 4:00 AM Philippine time. Lists today's orders.
const handlertoday = async () => {
  const { PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Missing configuration variables');
    return { statusCode: 500, body: 'Missing config' };
  }
  try {
    const supabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const result = await runOrderReminder('today', { supabase, token: TELEGRAM_BOT_TOKEN, chatIds: TELEGRAM_CHAT_ID });
    console.log('[today-reminder]', result);
    return { statusCode: 200, body: JSON.stringify({ ok: true, ...result }) };
  } catch (err) {
    console.error('[today-reminder] failed:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};

export const handler = schedule('0 20 * * *', handlertoday);
