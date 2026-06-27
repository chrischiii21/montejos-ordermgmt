import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { schedule } from '@netlify/functions';

const dailyReminderHandler = async (event) => {
  const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Missing configuration variables');
    return { statusCode: 500, body: 'Missing config' };
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

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    const formattedDate = phtTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let message = `🌅 <b>Montejo's Lechon & Food Trays - Daily Reminder</b>\n`;
    message += `📅 Date: <b>${formattedDate}</b>\n\n`;

    if (!orders || orders.length === 0) {
      message += `✨ No orders are scheduled for today! Have a wonderful day ahead!`;
    } else {
      message += `🛒 You have <b>${orders.length} order(s)</b> scheduled for today:\n\n`;
      
      orders.forEach((o, index) => {
        const timePart = o.delivery_date_time ? o.delivery_date_time.split(' ')[1] || 'N/A' : 'N/A';
        const formattedTime = formatTime12h(timePart);
        const fbSuffix = o.facebook_name ? ` (FB: ${escapeHtml(o.facebook_name)})` : '';

        // Build items details list
        let itemsText = '';
        if (Array.isArray(o.order_items) && o.order_items.length > 0) {
          itemsText = o.order_items.map((it) => {
            let txt = `     - <b>${it.quantity}x ${escapeHtml(it.name)}</b>`;
            const inclusions = getInclusionsForTelegram(it.name, it.custom_inclusions ?? it.customInclusions);
            if (inclusions.length > 0) {
              txt += `\n       (Inclusions:\n` + inclusions.map((inc) => `        * ${escapeHtml(inc)}`).join('\n') + `)`;
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

    return { statusCode: 200, body: JSON.stringify({ ok: true, message: 'Reminder sent successfully' }) };
  } catch (err) {
    console.error('Failed to execute daily reminder:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};

function formatTime12h(timeStr) {
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

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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

// schedule runs at 20:00 UTC, which translates to 4:00 AM PHT (UTC+8)
export const handler = schedule('0 20 * * *', dailyReminderHandler);
