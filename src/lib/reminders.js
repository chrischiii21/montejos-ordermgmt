// Shared logic for the scheduled Telegram order reminders.
// Plain JavaScript so it can be imported by both the Astro API routes (Vercel crons)
// and the Netlify scheduled functions in netlify/functions/.

export const PACKAGE_INCLUSIONS = {
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

/** @param {string} itemName @param {string[] | null | undefined} customInclusions @returns {string[]} */
export function getInclusionsForTelegram(itemName, customInclusions) {
	if (customInclusions && customInclusions.length > 0) return customInclusions;
	for (const key in PACKAGE_INCLUSIONS) {
		if (itemName.toLowerCase().includes(key.toLowerCase()) ||
			(key.startsWith('P') && itemName.toLowerCase().includes(key.toLowerCase().split(' ')[0] + ' package'))) {
			return PACKAGE_INCLUSIONS[key];
		}
	}
	return [];
}

/** @param {unknown} text */
function escapeHtml(text) {
	if (text === null || text === undefined) return '';
	return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** 'HH:MM' -> '2:30 PM' */
function formatTime12h(timeStr) {
	const m = (timeStr || '').match(/^(\d{2}):(\d{2})/);
	if (!m) return timeStr || 'N/A';
	const h = parseInt(m[1], 10);
	return `${h % 12 || 12}:${m[2]} ${h >= 12 ? 'PM' : 'AM'}`;
}

/** @param {unknown} n */
function peso(n) {
	return '₱' + (parseFloat(String(n ?? 0)) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Philippine (UTC+8) calendar date, shifted by `offsetDays`.
 * @returns {{ dateStr: string, label: string }} dateStr is 'YYYY-MM-DD'.
 */
export function phtDate(offsetDays = 0) {
	const d = new Date(Date.now() + 8 * 3600e3 + offsetDays * 864e5);
	return {
		dateStr: d.toISOString().slice(0, 10),
		label: d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
	};
}

/** Non-cancelled orders scheduled on `dateStr`, in delivery-time order (same as the family calendar). */
export async function fetchOrdersForDate(supabase, dateStr) {
	const { data, error } = await supabase
		.from('orders')
		.select('*, order_items(*)')
		.gte('delivery_date_time', `${dateStr} 00:00`)
		.lte('delivery_date_time', `${dateStr} 23:59`)
		.not('status', 'eq', 'Cancelled')
		.order('delivery_date_time', { ascending: true })
		.order('id', { ascending: true });
	if (error) throw error;
	return data ?? [];
}

/** One numbered order block, as shown in the Telegram reminders. */
function formatOrder(o, index) {
	const timePart = o.delivery_date_time ? o.delivery_date_time.split(' ')[1] || 'N/A' : 'N/A';
	const fbSuffix = o.facebook_name ? ` (FB: ${escapeHtml(o.facebook_name)})` : '';
	const items = Array.isArray(o.order_items) && o.order_items.length > 0
		? o.order_items.map((it) => {
			let txt = `     - <b>${escapeHtml(it.quantity)}x ${escapeHtml(it.name)}</b>`;
			const inclusions = getInclusionsForTelegram(it.name || '', it.custom_inclusions ?? it.customInclusions);
			if (inclusions.length > 0) {
				txt += `\n       (Inclusions:\n` + inclusions.map((inc) => `        * ${escapeHtml(inc)}`).join('\n') + `)`;
			}
			return txt;
		}).join('\n')
		: '     - No items listed';

	return `${index + 1}. <b>ORD-${escapeHtml(String(o.id).replace('ORD-', ''))}</b> - <b>${escapeHtml(o.customer || 'N/A')}</b>${fbSuffix}\n`
		+ `   📦 Fulfillment: <b>${escapeHtml(o.fulfillment_type || 'Delivery')} @ ${formatTime12h(timePart)}</b>\n`
		+ `   📍 Address: ${escapeHtml(o.address || 'N/A')}\n`
		+ `   📞 Contact: ${escapeHtml(o.contact || 'N/A')}\n`
		+ `   🛒 Items:\n${items}\n`
		+ `   💵 Total: <b>${peso(o.total)}</b>\n`
		+ `   💳 Downpayment: <b>${peso(o.downpayment)}</b>\n`
		+ `   ⚖️ Balance: <b>${peso(o.balance)}</b>\n\n`;
}

/**
 * Builds the reminder as one or more Telegram messages (Telegram's limit is 4096 characters,
 * so long days are split between orders, never in the middle of one).
 * @param {{ header: string, intro: string, emptyText: string }} text
 * @returns {string[]}
 */
export function buildReminderMessages(orders, text) {
	if (!orders.length) return [`${text.header}${text.emptyText}`];
	const LIMIT = 3900;
	const messages = [];
	let current = `${text.header}${text.intro}`;
	orders.forEach((o, i) => {
		const block = formatOrder(o, i);
		if (current.length + block.length > LIMIT && current.trim()) {
			messages.push(current.trimEnd());
			current = `<i>(continued)</i>\n\n`;
		}
		current += block;
	});
	messages.push(current.trimEnd());
	return messages;
}

/**
 * Sends every message to every chat ID. Throws if any send fails, so the failure shows up
 * as an error in the Vercel/Netlify logs instead of a false "sent successfully".
 */
export async function sendTelegramMessages(token, chatIdList, messages) {
	const chatIds = String(chatIdList).split(',').map((id) => id.trim()).filter(Boolean);
	const url = `https://api.telegram.org/bot${token}/sendMessage`;
	const failures = [];
	for (const chatId of chatIds) {
		for (const text of messages) {
			const resp = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
			});
			if (!resp.ok) failures.push(`chat ${chatId}: ${await resp.text()}`);
		}
	}
	if (failures.length) throw new Error(`Telegram send failed: ${failures.join(' | ')}`);
}

const SHOP = "Montejo's Lechon & Food Trays";

/**
 * Runs one reminder end to end.
 * @param {'today' | 'tomorrow'} which
 * @param {{ supabase: any, token: string, chatIds: string }} deps
 * @returns {Promise<{ sent: boolean, orders: number, date: string }>}
 */
export async function runOrderReminder(which, { supabase, token, chatIds }) {
	const isTomorrow = which === 'tomorrow';
	const { dateStr, label } = phtDate(isTomorrow ? 1 : 0);
	const orders = await fetchOrdersForDate(supabase, dateStr);

	// Tomorrow's reminder is skipped when there is nothing scheduled.
	if (isTomorrow && orders.length === 0) return { sent: false, orders: 0, date: dateStr };

	const messages = buildReminderMessages(orders, isTomorrow
		? {
			header: `🗓️ <b>${SHOP} - Tomorrow's Orders</b>\n📅 Date: <b>${label}</b>\n\n`,
			intro: `🛒 You have <b>${orders.length} order(s)</b> scheduled for tomorrow:\n\n`,
			emptyText: ''
		}
		: {
			header: `🌅 <b>${SHOP} - Daily Reminder</b>\n📅 Date: <b>${label}</b>\n\n`,
			intro: `🛒 You have <b>${orders.length} order(s)</b> scheduled for today:\n\n`,
			emptyText: `✨ No orders are scheduled for today! Have a wonderful day ahead!`
		});
	await sendTelegramMessages(token, chatIds, messages);
	return { sent: true, orders: orders.length, date: dateStr };
}
