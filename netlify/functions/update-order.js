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

function getInclusionsForTelegram(itemName, customInclusions) {
  if (customInclusions && customInclusions.length > 0) {
    return customInclusions;
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
  for (const key in PACKAGE_INCLUSIONS) {
    if (itemName.toLowerCase().includes(key.toLowerCase()) || 
        (key.startsWith('P') && itemName.toLowerCase().includes(key.toLowerCase().split(' ')[0] + ' package'))) {
      return PACKAGE_INCLUSIONS[key];
    }
  }
  return [];
}

function getDiffText(oldVal, newVal, label, formatter) {
  const oldStr = oldVal === null || oldVal === undefined ? '' : String(oldVal).trim();
  const newStr = newVal === null || newVal === undefined ? '' : String(newVal).trim();
  
  if (oldStr === newStr) return null;
  
  const oldFormatted = formatter ? formatter(oldVal) : oldStr;
  const newFormatted = formatter ? formatter(newVal) : newStr;
  return `• <b>${label}:</b> ${oldFormatted || 'N/A'} ➡️ ${newFormatted || 'N/A'}`;
}

const formatCurrency = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? '₱0.00' : `₱${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

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

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    const payload = JSON.parse(event.body || '{}');
    const { id, orderUpdates, items } = payload;

    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing order ID' }) };
    }

    // 1. Fetch old order
    const { data: oldOrder, error: oldFetchErr } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();

    if (oldFetchErr || !oldOrder) {
      console.error('Failed to fetch old order details', oldFetchErr);
      return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
    }

    // Update order fields
    if (orderUpdates) {
      const { error: orderErr } = await supabase
        .from('orders')
        .update(orderUpdates)
        .eq('id', id);

      if (orderErr) {
        console.error('Order update error', orderErr);
        return { statusCode: 500, body: JSON.stringify({ error: orderErr.message || orderErr }) };
      }
    }

    // If items are provided, replace them
    if (Array.isArray(items)) {
      const { error: deleteErr } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);

      if (deleteErr) {
        console.error('Order items delete error', deleteErr);
        return { statusCode: 500, body: JSON.stringify({ error: deleteErr.message || deleteErr }) };
      }

      if (items.length > 0) {
        const { error: itemsErr } = await supabase.from('order_items').insert(
          items.map(it => ({
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
          return { statusCode: 500, body: JSON.stringify({ error: itemsErr.message || itemsErr }) };
        }
      }
    }

    // 3. Compare and send Telegram notification
    const { data: newOrder, error: newFetchErr } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();

    if (!newFetchErr && newOrder) {
      const changes = [];

      const diffStatus = getDiffText(oldOrder.status, newOrder.status, 'Status');
      if (diffStatus) changes.push(diffStatus);

      const diffCustomer = getDiffText(oldOrder.customer, newOrder.customer, 'Customer Name');
      if (diffCustomer) changes.push(diffCustomer);

      const diffFacebook = getDiffText(oldOrder.facebook_name, newOrder.facebook_name, 'Facebook Name');
      if (diffFacebook) changes.push(diffFacebook);

      const diffContact = getDiffText(oldOrder.contact, newOrder.contact, 'Contact Number');
      if (diffContact) changes.push(diffContact);

      const diffAddress = getDiffText(oldOrder.address, newOrder.address, 'Address');
      if (diffAddress) changes.push(diffAddress);

      const diffFulfillment = getDiffText(oldOrder.fulfillment_type, newOrder.fulfillment_type, 'Fulfillment Type');
      if (diffFulfillment) changes.push(diffFulfillment);

      const diffDeliveryDateTime = getDiffText(oldOrder.delivery_date_time, newOrder.delivery_date_time, 'Delivery Date/Time', formatDateTime12h);
      if (diffDeliveryDateTime) changes.push(diffDeliveryDateTime);

      const diffTotal = getDiffText(oldOrder.total, newOrder.total, 'Total Amount', formatCurrency);
      if (diffTotal) changes.push(diffTotal);

      const diffDownpayment = getDiffText(oldOrder.downpayment, newOrder.downpayment, 'Downpayment', formatCurrency);
      if (diffDownpayment) changes.push(diffDownpayment);

      const diffBalance = getDiffText(oldOrder.balance, newOrder.balance, 'Balance', formatCurrency);
      if (diffBalance) changes.push(diffBalance);

      const diffDeliveryFee = getDiffText(oldOrder.delivery_fee, newOrder.delivery_fee, 'Delivery Fee', formatCurrency);
      if (diffDeliveryFee) changes.push(diffDeliveryFee);

      const diffNote = getDiffText(oldOrder.note, newOrder.note, 'Owner Note');
      if (diffNote) changes.push(diffNote);

      let itemsChanged = false;
      if (Array.isArray(items)) {
        const oldItems = oldOrder.order_items || [];
        const newItems = newOrder.order_items || [];
        if (oldItems.length !== newItems.length) {
          itemsChanged = true;
        } else {
          for (const oIt of oldItems) {
            const nIt = newItems.find(n => n.name === oIt.name);
            if (!nIt || nIt.quantity !== oIt.quantity || parseFloat(nIt.price) !== parseFloat(oIt.price)) {
              itemsChanged = true;
              break;
            }
            const oInc = oIt.custom_inclusions ?? [];
            const nInc = nIt.custom_inclusions ?? nIt.customInclusions ?? [];
            if (JSON.stringify(oInc) !== JSON.stringify(nInc)) {
              itemsChanged = true;
              break;
            }
          }
        }
      }
      if (itemsChanged) {
        changes.push(`• <b>Order Items:</b> Updated (see below)`);
      }

      if (changes.length > 0) {
        const idNumber = newOrder.id.replace('ORD-', '');
        const isCancelled = newOrder.status === 'Cancelled';
        const title = isCancelled ? `❌ <b>ORDER CANCELLED</b>` : `🔄 <b>ORDER UPDATED</b>`;

        const itemsText = (newOrder.order_items || []).map(it => {
          let text = `<b>${it.quantity}x ${escapeHtml(it.name)}</b>`;
          const inclusions = getInclusionsForTelegram(it.name, it.custom_inclusions ?? it.customInclusions);
          if (inclusions.length > 0) {
            text += `\n  (Inclusions:\n` + inclusions.map(inc => `   - ${escapeHtml(inc)}`).join('\n') + `)`;
          }
          return text;
        }).join('\n');

        const formattedDateTime = formatDateTime12h(newOrder.delivery_date_time);
        const deliveryFee = parseFloat(newOrder.delivery_fee ?? 0);
        const total = parseFloat(newOrder.total ?? 0);
        const downpayment = parseFloat(newOrder.downpayment ?? 0);
        const balance = parseFloat(newOrder.balance ?? 0);
        const subtotal = total - deliveryFee;

        const formattedSubtotal = subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const formattedDeliveryFee = deliveryFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const formattedTotal = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const formattedDownpayment = downpayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const formattedBalance = balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const fbName = newOrder.facebook_name;
        const fbSuffix = fbName ? ` (FB: <b>${escapeHtml(fbName)}</b>)` : '';

        const message = `${title}\n\n` +
          `🎟️ Order ID: <b>${idNumber}</b>\n\n` +
          `🛠️ <b>Changes:</b>\n` +
          `${changes.join('\n')}\n\n` +
          `📋 <b>C U R R E N T   S U M M A R Y</b>\n\n` +
          `👤 Name: <b>${escapeHtml(newOrder.customer || '')}</b>${fbSuffix}\n` +
          `📦 Fulfillment: <b>${escapeHtml(newOrder.fulfillment_type || 'Delivery')}</b>\n` +
          `📍 Exact Address: ${escapeHtml(newOrder.address || '')}\n` +
          `📞 Contact Number of the Receiver/s: ${escapeHtml(newOrder.contact || '')}\n` +
          `⏰ Time & Date: <b>${escapeHtml(formattedDateTime)}</b>\n` +
          `🛒 List of Order/s:\n` +
          `${itemsText || 'No items'}\n\n` +
          `💰 Subtotal: <b>₱${formattedSubtotal}</b>\n` +
          `🛵 Delivery/Meetup Fee: <b>₱${formattedDeliveryFee}</b>\n` +
          `💵 TOTAL: <b>₱${formattedTotal}</b>\n` +
          `💳 DOWNPAYMENT: <b>₱${formattedDownpayment}</b>\n` +
          `⚖️ BALANCE: <b>₱${formattedBalance}${newOrder.status === 'Completed' ? ' (Settled)' : ''}</b>`;

        await sendTelegramMessage(message);
      }
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('update-order function error', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || err }) };
  }
};
