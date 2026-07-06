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

const PACKAGE_INCLUSIONS = {
	"Set A Lechon Package": [
		"1 whole Lechon Baboy",
		"1 tray Buttered Shrimps",
		"100 pieces Lumpia Shanghai",
		"1 tray Chicken Cordon Bleu",
		"1 tray Special Bam-e",
		"1 tray Diniguan",
		"1 tray Spicy Buffalo Chicken"
	],
	"Set B Lechon Package": [
		"1 whole Lechon Baboy",
		"1 tray Buttered Shrimps",
		"150 pieces Lumpia Shanghai",
		"1 tray Chicken Cordon Bleu",
		"1 tray Special Bam-e",
		"1 tray Diniguan",
		"1 tray Spicy Buffalo Chicken",
		"1 tray Calamares"
	],
	"Set C Lechon Package": [
		"1 whole Lechon Baboy",
		"1 tray Buttered Shrimps",
		"200 pieces Lumpia Shanghai",
		"1 tray Chicken Cordon Bleu",
		"1 tray Special Bam-e",
		"1 tray Diniguan",
		"1 tray Spicy Buffalo Chicken",
		"1 tray Calamares",
		"1 tray Chicken Guisado"
	],
	"P1 Package (Bilao)": [
		"1 whole Lechon Manok",
		"30 pieces Pork Lumpia",
		"10 pieces Battered Chicken",
		"1/2 kilo Buttered Shrimps",
		"25 pieces Calamares",
		"Half tray Special Bam-i",
		"1 tray Chosen Dessert"
	],
	"P2 Package (Bilao)": [
		"3 kilos Lechon Belly",
		"30 pieces Pork Lumpia",
		"10 pieces Battered Chicken",
		"1/2 kilo Buttered Shrimps",
		"25 pieces Calamares",
		"Half tray Special Bam-i",
		"1 tray Chosen Dessert"
	],
	"P3 Package (Bilao)": [
		"4 kilos Lechon Belly",
		"40 pieces Pork Lumpia",
		"15 pieces Battered Chicken",
		"10 pieces Buffalo / Teriyaki Chicken",
		"3/4 kilo Buttered Shrimps",
		"40 pieces Calamares",
		"1 tray Special Bam-i",
		"1 tray Chosen Dessert"
	],
	"P4 Package (Bilao)": [
		"5 kilos Lechon Belly",
		"50 pieces Pork Lumpia",
		"20 pieces Battered Chicken",
		"15 pieces Buffalo / Teriyaki Chicken",
		"3/4 kilo Buttered Shrimps",
		"50 pieces Calamares",
		"1 tray Special Bam-i",
		"1 tray Chosen Dessert"
	],
	"P5 Package (Bilao)": [
		"6 kilos Lechon Belly",
		"70 pieces Pork Lumpia",
		"25 pieces Battered Chicken",
		"20 pieces Buffalo / Teriyaki Chicken",
		"1 kilo Buttered Shrimps",
		"60 pieces Calamares",
		"1 tray Special Bam-i",
		"1 tray Chosen Dessert"
	],
	"P6 Package (Bilao)": [
		"7 kilos Lechon Belly",
		"80 pieces Pork Lumpia",
		"30 pieces Battered Chicken",
		"25 pieces Buffalo / Teriyaki Chicken",
		"1 kilo Buttered Shrimps",
		"70 pieces Calamares",
		"1 tray Special Bam-i",
		"1 tray Chosen Dessert"
	]
};

function getInclusionsForTelegram(itemName, customInclusions) {
  if (customInclusions && customInclusions.length > 0) {
    return customInclusions;
  }
  for (const key in PACKAGE_INCLUSIONS) {
    if (itemName.toLowerCase().includes(key.toLowerCase()) || 
        (key.startsWith('P') && itemName.toLowerCase().includes(key.toLowerCase().split(' ')[0] + ' package'))) {
      return PACKAGE_INCLUSIONS[key];
    }
  }
  return [];
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

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    const payload = JSON.parse(event.body || '{}');
    const { order, items, isOwnerFill } = payload;

    if (!order) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing order' }) };
    }

    // Insert order
    const { error: orderErr } = await supabase.from('orders').insert({
      id: order.id,
      date: order.date,
      customer: order.customer,
      address: order.address,
      contact: order.contact,
      note: order.note ?? null,
      delivery_date_time: order.delivery_date_time ?? order.deliveryDateTime ?? null,
      fulfillment_type: order.fulfillment_type ?? order.fulfillmentType ?? 'Delivery',
      status: order.status,
      total: order.total,
      downpayment: order.downpayment,
      balance: order.balance,
      delivery_fee: order.delivery_fee ?? order.deliveryFee ?? 0,
      facebook_name: order.facebook_name ?? order.facebookName ?? null
    });

    if (orderErr) {
      console.error('Order insert error', orderErr);
      return { statusCode: 500, body: JSON.stringify({ error: orderErr.message || orderErr }) };
    }

    if (Array.isArray(items) && items.length > 0) {
      const { error: itemsErr } = await supabase.from('order_items').insert(
        items.map(it => ({
          order_id: order.id,
          name: it.name,
          quantity: it.quantity,
          price: it.price,
          total: it.total,
          custom_inclusions: it.customInclusions ?? []
        }))
      );
      if (itemsErr) {
        console.error('Order items insert error', itemsErr);
        return { statusCode: 500, body: JSON.stringify({ error: itemsErr.message || itemsErr }) };
      }
    }

    if (isOwnerFill) {
      const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        try {
          const itemsText = (items || []).map((it) => {
            let text = `<b>${it.quantity}x ${escapeHtml(it.name)}</b>`;
            const inclusions = getInclusionsForTelegram(it.name, it.customInclusions ?? it.custom_inclusions);
            if (inclusions.length > 0) {
              text += `\n  (Inclusions:\n` + inclusions.map((inc) => `   - ${escapeHtml(inc)}`).join('\n') + `)`;
            }
            return text;
          }).join('\n');

          const idNumber = order.id.replace('ORD-', '');
          const formattedDateTime = formatDateTime12h(order.deliveryDateTime ?? order.delivery_date_time);
          const deliveryFee = parseFloat(order.deliveryFee ?? order.delivery_fee ?? 0);
          const total = parseFloat(order.total ?? 0);
          const downpayment = parseFloat(order.downpayment ?? 0);
          const balance = parseFloat(order.balance ?? 0);
          const subtotal = total - deliveryFee;

          const formattedSubtotal = subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const formattedDeliveryFee = deliveryFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const formattedTotal = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const formattedDownpayment = downpayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const formattedBalance = balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

          const fbName = order.facebook_name ?? order.facebookName;
          const fbSuffix = fbName ? ` (FB: <b>${escapeHtml(fbName)}</b>)` : '';

          const message = `🔔 <b>NEW ORDER ALERT</b>\n\n` +
            `🎉 <b>Order ID - ${idNumber} successfully added.</b>\n\n` +
            `📋 <b>C O N F I R M A T I O N   S L I P</b>\n\n` +
            `👤 Name: <b>${escapeHtml(order.customer || '')}</b>${fbSuffix}\n` +
            `📦 Fulfillment: <b>${escapeHtml(order.fulfillmentType ?? order.fulfillment_type ?? 'Delivery')}</b>\n` +
            `📍 Exact Address: ${escapeHtml(order.address || '')}\n` +
            `📞 Contact Number of the Receiver/s: ${escapeHtml(order.contact || '')}\n` +
            `⏰ Time & Date: <b>${escapeHtml(formattedDateTime)}</b>\n` +
            `🛒 List of Order/s:\n` +
            `${itemsText || 'No items'}\n\n` +
            `💰 Subtotal: <b>₱${formattedSubtotal}</b>\n` +
            `🛵 Delivery/Meetup Fee: <b>₱${formattedDeliveryFee}</b>\n` +
            `💵 TOTAL: <b>₱${formattedTotal}</b>\n` +
            `💳 DOWNPAYMENT: <b>₱${formattedDownpayment}</b>\n` +
            `⚖️ BALANCE: <b>₱${formattedBalance}${order.status === 'Completed' ? ' (Settled)' : ''}</b>`;

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
                console.log(`Telegram notification sent successfully to chat ID ${chatId} for order ${order.id}.`);
              }
            });
          }
        } catch (teleErr) {
          console.error('Failed to send Telegram notification:', teleErr);
        }
      }
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('create-order function error', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || err }) };
  }
};
