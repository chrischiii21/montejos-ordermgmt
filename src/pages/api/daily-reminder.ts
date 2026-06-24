import 'dotenv/config';
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

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
  const authHeader = request.headers.get('Authorization');

  // Verify cron secret if configured
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return new Response(JSON.stringify({ error: 'Missing configuration variables' }), { status: 500 });
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

    let message = `🌅 Montejo's Lechon & Food Trays - Daily Reminder\n`;
    message += `📅 Date: ${formattedDate}\n\n`;

    if (!orders || orders.length === 0) {
      message += `✨ No orders are scheduled for today! Have a wonderful day ahead!`;
    } else {
      message += `🛒 You have ${orders.length} order(s) scheduled for today:\n\n`;
      
      orders.forEach((o: any, index: number) => {
        const timePart = o.delivery_date_time ? o.delivery_date_time.split(' ')[1] || 'N/A' : 'N/A';
        const formattedTime = formatTime12h(timePart);
        const fbSuffix = o.facebook_name ? ` (FB: ${o.facebook_name})` : '';

        // Build items details list
        let itemsText = '';
        if (Array.isArray(o.order_items) && o.order_items.length > 0) {
          itemsText = o.order_items.map((it: any) => {
            let txt = `     - ${it.quantity}x ${it.name}`;
            const inclusions = it.custom_inclusions ?? it.customInclusions ?? [];
            if (Array.isArray(inclusions) && inclusions.length > 0) {
              txt += `\n       (Custom Inclusions:\n` + inclusions.map((inc: any) => `        * ${inc}`).join('\n') + `)`;
            }
            return txt;
          }).join('\n');
        } else {
          itemsText = '     - No items listed';
        }

        message += `${index + 1}. ORD-${o.id.replace('ORD-', '')} - ${o.customer || 'N/A'}${fbSuffix}\n`;
        message += `   📦 Fulfillment: ${o.fulfillment_type || 'Delivery'} @ ${formattedTime}\n`;
        message += `   📍 Address: ${o.address || 'N/A'}\n`;
        message += `   📞 Contact: ${o.contact || 'N/A'}\n`;
        message += `   🛒 Items:\n${itemsText}\n`;
        message += `   💵 Total: ₱${parseFloat(o.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
        message += `   ⚖️ Balance: ₱${parseFloat(o.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n\n`;
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
          text: message
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
