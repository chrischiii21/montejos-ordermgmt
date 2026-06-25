import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatDateTime12h(dateTimeStr: string | null | undefined): string {
  if (!dateTimeStr) return '';
  const d = new Date(dateTimeStr.replace(' ', 'T'));
  if (isNaN(d.getTime())) return dateTimeStr;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export const POST: APIRoute = async ({ request }) => {
  const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Missing Supabase service env vars' }), { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  try {
    const payload = await request.json().catch(() => ({}));
    const { id, orderUpdates, items, isCustomerVerification } = payload as any;

    if (!id) return new Response(JSON.stringify({ error: 'Missing order ID' }), { status: 400 });

    if (orderUpdates) {
      const { error: orderErr } = await supabase.from('orders').update(orderUpdates).eq('id', id);
      if (orderErr) {
        console.error('Order update error', orderErr);
        return new Response(JSON.stringify({ error: orderErr.message || orderErr }), { status: 500 });
      }
    }

    if (isCustomerVerification) {
      // Fetch full order + items from Supabase
      const { data: orderData, error: fetchErr } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();

      if (!fetchErr && orderData) {
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
          try {
            const itemsText = (orderData.order_items || []).map((it: any) => {
              let text = `<b>${it.quantity}x ${escapeHtml(it.name)}</b>`;
              const inclusions = it.custom_inclusions ?? it.customInclusions ?? [];
              if (Array.isArray(inclusions) && inclusions.length > 0) {
                text += `\n  (Custom Inclusions:\n` + inclusions.map((inc: any) => `   - ${escapeHtml(inc)}`).join('\n') + `)`;
              }
              return text;
            }).join('\n');

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

            const message = `🎉 <b>Order ID - ${idNumber} link is successfully fulfilled.</b>\n\n` +
              `📋 <b>C O N F I R M A T I O N   S L I P</b>\n\n` +
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
              `⚖️ BALANCE: <b>₱${formattedBalance}${orderData.status === 'Completed' ? ' (Settled)' : ''}</b>`;

            const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
            const chatIds = TELEGRAM_CHAT_ID.split(',').map(id => id.trim()).filter(id => id !== '');

            for (const chatId of chatIds) {
              await fetch(telegramUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: message,
                  parse_mode: 'HTML'
                })
              }).then(async (teleResp) => {
                if (!teleResp.ok) {
                  const errBody = await teleResp.text();
                  console.error(`Telegram bot API error for chat ID ${chatId}:`, errBody);
                } else {
                  console.log(`Telegram notification sent successfully to chat ID ${chatId} for order ${id}.`);
                }
              });
            }
          } catch (teleErr) {
            console.error('Failed to send Telegram notification:', teleErr);
          }
        } else {
          console.log('Telegram Bot Token or Chat ID not configured. Notification skipped.');
        }
      } else {
        console.error(`Failed to fetch order details for Telegram notification:`, fetchErr?.message);
      }
    }

    if (Array.isArray(items)) {
      const { error: deleteErr } = await supabase.from('order_items').delete().eq('order_id', id);
      if (deleteErr) {
        console.error('Order items delete error', deleteErr);
        return new Response(JSON.stringify({ error: deleteErr.message || deleteErr }), { status: 500 });
      }

      if (items.length > 0) {
        const { error: itemsErr } = await supabase.from('order_items').insert(
          items.map((it: any) => ({
            order_id: id,
            name: it.name,
            quantity: it.quantity,
            price: it.price,
            total: it.total,
            custom_inclusions: it.customInclusions ?? it.custom_inclusions ?? []
          }))
        );
        if (itemsErr) {
          console.error('Order items insert error', itemsErr);
          return new Response(JSON.stringify({ error: itemsErr.message || itemsErr }), { status: 500 });
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error('update-order API error', err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
};
