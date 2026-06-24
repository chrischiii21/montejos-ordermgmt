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

function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const GET: APIRoute = async ({ request }) => {
  const CRON_SECRET = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;
  // Vercel sends 'authorization' (lowercase); use get() which is case-insensitive per spec
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

  // Verify cron secret if configured
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const TELEGRAM_BOT_TOKEN = import.meta.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = import.meta.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

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
    // Fetch all orders scheduled for today
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .gte('delivery_date_time', `${phtDateStr} 00:00`)
      .lte('delivery_date_time', `${phtDateStr} 23:59`);

    if (error) throw error;

    const formattedDate = phtTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let message = `🌃 <b>Montejo's Lechon & Food Trays - Daily EOD Summary</b>\n`;
    message += `📅 Date: <b>${formattedDate}</b>\n\n`;

    if (!orders || orders.length === 0) {
      message += `✨ No orders were scheduled for today.`;
    } else {
      let totalSales = 0;
      let completedCount = 0;
      let preparingCount = 0;
      let pendingCount = 0;
      let cancelledCount = 0;
      let totalPaymentsReceived = 0;

      message += `📋 Today's Orders & Statuses:\n\n`;

      orders.forEach((o: any, index: number) => {
        const fbSuffix = o.facebook_name ? ` (FB: ${escapeHtml(o.facebook_name)})` : '';
        const total = parseFloat(o.total || 0);
        const balance = parseFloat(o.balance || 0);
        
        let orderRevenue = 0;

        if (o.status === 'Completed') {
          completedCount++;
          totalSales += total;
          orderRevenue = Math.max(0, total - balance);
        } else if (o.status === 'Preparing') {
          preparingCount++;
          totalSales += total;
          orderRevenue = Math.max(0, total - balance);
        } else if (o.status === 'Pending') {
          pendingCount++;
          totalSales += total;
          orderRevenue = Math.max(0, total - balance);
        } else if (o.status === 'Cancelled') {
          cancelledCount++;
          orderRevenue = 0;
        }

        totalPaymentsReceived += orderRevenue;

        message += `${index + 1}. <b>ORD-${o.id.replace('ORD-', '')}</b> - <b>${escapeHtml(o.customer || 'N/A')}</b>${fbSuffix}\n`;
        message += `   Revenue: <b>₱${orderRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b>\n\n`;
      });

      message += `📈 <b>EOD Summary Tally:</b>\n`;
      message += `- Total Scheduled Orders: <b>${orders.length}</b>\n`;
      message += `- Completed Orders: <b>${completedCount}</b>\n`;
      message += `- Preparing Orders: <b>${preparingCount}</b>\n`;
      message += `- Pending Details Orders: <b>${pendingCount}</b>\n`;
      message += `- Cancelled Orders: <b>${cancelledCount}</b>\n\n`;
      message += `💰 <b>Revenue Details:</b>\n`;
      message += `- Total Non-Cancelled Value: <b>₱${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b>\n`;
      message += `- Payments Collected Today (Est.): <b>₱${totalPaymentsReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b>\n`;
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

    return new Response(JSON.stringify({ ok: true, message: 'EOD Summary sent successfully' }), { status: 200 });
  } catch (err: any) {
    console.error('Failed to execute EOD summary:', err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
};
