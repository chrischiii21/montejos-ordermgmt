import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatDateTime12h(dateTimeStr) {
  if (!dateTimeStr) return '';
  const d = new Date(dateTimeStr.replace(' ', 'T'));
  if (isNaN(d.getTime())) return dateTimeStr;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

async function sendTelegramMessage(message) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram Bot Token or Chat ID not configured. Notification skipped.');
    return;
  }

  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const chatIds = TELEGRAM_CHAT_ID.split(',').map(id => id.trim()).filter(id => id !== '');

  for (const chatId of chatIds) {
    try {
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
    } catch (err) {
      console.error(`Failed to send Telegram notification to chat ID ${chatId}:`, err);
    }
  }
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing Supabase service env vars' }) };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  try {
    const payload = JSON.parse(event.body || '{}');
    const { id } = payload;
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing id' }) };

    // Fetch order + items before deleting
    const { data: orderData, error: fetchErr } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();

    if (fetchErr || !orderData) {
      console.error('Failed to fetch order details for deletion', fetchErr);
      return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
    }

    // Delete order items first
    const { error: itemsErr } = await supabase.from('order_items').delete().eq('order_id', id);
    if (itemsErr) {
      console.error('Error deleting order_items', itemsErr);
      return { statusCode: 500, body: JSON.stringify({ error: itemsErr.message || itemsErr }) };
    }

    // Delete order
    const { error: orderErr } = await supabase.from('orders').delete().eq('id', id);
    if (orderErr) {
      console.error('Error deleting order', orderErr);
      return { statusCode: 500, body: JSON.stringify({ error: orderErr.message || orderErr }) };
    }

    // Trigger Telegram Notification
    try {
      const idNumber = orderData.id.replace('ORD-', '');
      const formattedDateTime = formatDateTime12h(orderData.delivery_date_time);
      const deliveryFee = parseFloat(orderData.delivery_fee ?? 0);
      const total = parseFloat(orderData.total ?? 0);
      const downpayment = parseFloat(orderData.downpayment ?? 0);
      const balance = parseFloat(orderData.balance ?? 0);
      const subtotal = total - deliveryFee;

      const formattedSubtotal = subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const formattedDeliveryFee = deliveryFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const formattedTotal = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const formattedDownpayment = downpayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const formattedBalance = balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const fbName = orderData.facebook_name ?? orderData.facebookName;
      const fbSuffix = fbName ? ` (FB: <b>${escapeHtml(fbName)}</b>)` : '';

      const itemsText = (orderData.order_items || []).map(it => {
        let text = `<b>${it.quantity}x ${escapeHtml(it.name)}</b>`;
        const inclusions = it.custom_inclusions ?? it.customInclusions ?? [];
        if (Array.isArray(inclusions) && inclusions.length > 0) {
          text += `\n  (Custom Inclusions:\n` + inclusions.map(inc => `   - ${escapeHtml(inc)}`).join('\n') + `)`;
        }
        return text;
      }).join('\n');

      const message = `🗑️ <b>ORDER DELETED</b>\n\n` +
        `🎟️ Order ID: <b>${idNumber}</b>\n\n` +
        `⚠️ This order ticket was deleted by an admin user.\n\n` +
        `📋 <b>D E L E T E D   O R D E R   D E T A I L S</b>\n\n` +
        `👤 Name: <b>${escapeHtml(orderData.customer || '')}</b>${fbSuffix}\n` +
        `📦 Fulfillment: <b>${escapeHtml(orderData.fulfillment_type || 'Delivery')}</b>\n` +
        `📍 Exact Address: ${escapeHtml(orderData.address || '')}\n` +
        `📞 Contact Number of the Receiver/s: ${escapeHtml(orderData.contact || '')}\n` +
        `⏰ Time & Date: <b>${escapeHtml(formattedDateTime)}</b>\n` +
        `🛒 List of Order/s:\n` +
        `${itemsText || 'No items'}\n\n` +
        `💰 Subtotal: <b>₱${formattedSubtotal}</b>\n` +
        `🛵 Delivery/Meetup Fee: <b>₱${formattedDeliveryFee}</b>\n` +
        `💵 TOTAL: <b>₱${formattedTotal}</b>\n` +
        `💳 DOWNPAYMENT: <b>₱${formattedDownpayment}</b>\n` +
        `⚖️ BALANCE: <b>₱${formattedBalance}</b>`;

      await sendTelegramMessage(message);
    } catch (teleErr) {
      console.error('Failed to send Telegram notification for deleted order:', teleErr);
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('delete-order function error', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || err }) };
  }
};
