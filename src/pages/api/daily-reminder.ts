import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatTime12h(timeStr: string | null | undefined): string {
  if (!timeStr || timeStr === 'N/A') return 'N/A';
  const match = timeStr.match(/^(\d{2}):(\d{2})$/);
  if (!match) return timeStr;
  let hour = parseInt(match[1]);
  const minute = match[2];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12; // 0 should be 12
  return `${hour}:${minute} ${ampm}`;
}

export const GET: APIRoute = async ({ request }) => {
  const CRON_SECRET = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

  // Verify cron secret if configured
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return new Response(JSON.stringify({ error: 'Missing configuration variables', debug: { hasSupabaseUrl: !!SUPABASE_URL, hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY, hasTelegramToken: !!TELEGRAM_BOT_TOKEN, hasTelegramChatId: !!TELEGRAM_CHAT_ID } }), { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Get current date in PHT (UTC+8)
  const now = new Date();
  const phtTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  const phtDateStr = phtTime.toISOString().split('T')[0];

  try {
    // Fetch orders scheduled for today (PHT) that are NOT Cancelled
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .gte('delivery_date_time', `${phtDateStr} 00:00`)
      .lte('delivery_date_time', `${phtDateStr} 23:59`)
      .not('status', 'eq', 'Cancelled');

    if (error) throw error;

    const formattedDate = phtTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let message = `🌅 <b>Montejo's Lechon & Food Trays - Daily Reminder</b>\n`;
    message += `📅 Date: <b>${formattedDate}</b>\n\n`;

    if (!orders || orders.length === 0) {
      message += `✨ No orders are scheduled for today! Have a wonderful day ahead!`;
    } else {
      message += `🛒 You have <b>${orders.length} order(s)</b> scheduled for today:\n\n`;
      
      orders.forEach((o: any, index: number) => {
        const timePart = o.delivery_date_time ? o.delivery_date_time.split(' ')[1] || 'N/A' : 'N/A';
        const formattedTime = formatTime12h(timePart);
        const fbSuffix = o.facebook_name ? ` (FB: ${escapeHtml(o.facebook_name)})` : '';

        // Build items details list
        let itemsText = '';
        if (Array.isArray(o.order_items) && o.order_items.length > 0) {
          itemsText = o.order_items.map((it: any) => {
            let txt = `     - <b>${it.quantity}x ${escapeHtml(it.name)}</b>`;
            const inclusions = it.custom_inclusions ?? it.customInclusions ?? [];
            if (Array.isArray(inclusions) && inclusions.length > 0) {
              txt += `\n       (Custom Inclusions:\n` + inclusions.map((inc: any) => `        * ${escapeHtml(inc)}`).join('\n') + `)`;
            }
            return txt;
          }).join('\n');
        } else {
          itemsText = '     - No items listed';
        }

        message += `${index + 1}. <b>ORD-${o.id.replace('ORD-', '')}</b> - <b>${escapeHtml(o.customer || 'N/A')}</b>${fbSuffix}\n`;
        message += `   📦 Fulfillment: <b>${escapeHtml(o.fulfillment_type || 'Delivery')} @ ${formattedTime}</b>\n`;
        message += `   📍 Address: ${escapeHtml(o.address || 'N/A')}\n`;
        message += `   📞 Contact: ${escapeHtml(o.contact || 'N/A')}\n`;
        message += `   🛒 Items:\n${itemsText}\n`;
        message += `   💵 Total: <b>₱${parseFloat(o.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</b>\n`;
        message += `   ⚖️ Balance: <b>₱${parseFloat(o.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</b>\n\n`;
      });
    }

    // Dispatch message to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const chatIds = TELEGRAM_CHAT_ID.split(',').map(id => id.trim()).filter(id => id !== '');

    for (const chatId of chatIds) {
      const resp = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });
      if (!resp.ok) {
        const errBody = await resp.text();
        console.error(`Telegram bot API error for chat ID ${chatId}:`, errBody);
      }
    }

    return new Response(JSON.stringify({ ok: true, message: 'Reminder sent successfully' }), { status: 200 });
  } catch (err: any) {
    console.error('Failed to execute daily reminder:', err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
};
