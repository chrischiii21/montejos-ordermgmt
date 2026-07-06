import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage, getInclusionsForTelegram } from '../../lib/telegram';

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
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export const POST: APIRoute = async ({ request }) => {
  const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Missing Supabase service env vars' }), { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  try {
    const payload = await request.json().catch(() => ({}));
    const { id } = payload as any;
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

    // Fetch order + items before deleting
    const { data: orderData, error: fetchErr } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();

    if (fetchErr || !orderData) {
      console.error('Failed to fetch order details for deletion', fetchErr);
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    const { error: itemsErr } = await supabase.from('order_items').delete().eq('order_id', id);
    if (itemsErr) {
      console.error('Error deleting order_items', itemsErr);
      return new Response(JSON.stringify({ error: itemsErr.message || itemsErr }), { status: 500 });
    }

    const { error: orderErr } = await supabase.from('orders').delete().eq('id', id);
    if (orderErr) {
      console.error('Error deleting order', orderErr);
      return new Response(JSON.stringify({ error: orderErr.message || orderErr }), { status: 500 });
    }

    // Trigger Telegram Notification only if order doesn't have pending customer details
    const isPendingCustomer = !orderData.customer || 
      orderData.customer === 'Pending Customer Details' || 
      orderData.customer.trim() === '';

    if (!isPendingCustomer) {
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

        const itemsText = (orderData.order_items || []).map((it: any) => {
          let text = `<b>${it.quantity}x ${escapeHtml(it.name)}</b>`;
          const inclusions = getInclusionsForTelegram(it.name, it.custom_inclusions ?? it.customInclusions);
          if (inclusions.length > 0) {
            text += `\n  (Inclusions:\n` + inclusions.map((inc: any) => `   - ${escapeHtml(inc)}`).join('\n') + `)`;
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
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error('delete-order API error', err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
};
