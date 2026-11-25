import { createClient } from '@supabase/supabase-js';
import { g as getInclusionsForTelegram } from './telegram_DOKRukXK.mjs';

function escapeHtml(text) {
  if (!text) return "";
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function formatTime12h(timeStr) {
  if (timeStr === "N/A") return "N/A";
  const match = timeStr.match(/^(\d{2}):(\d{2})$/);
  if (!match) return timeStr;
  let hour = parseInt(match[1]);
  const minute = match[2];
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour ? hour : 12;
  return `${hour}:${minute} ${ampm}`;
}
const GET = async ({ request }) => {
  const CRON_SECRET = process.env.CRON_SECRET || undefined                           ;
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || undefined                                   ;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || undefined                                         ;
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || undefined                                  ;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || undefined                                ;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return new Response(JSON.stringify({ error: "Missing configuration variables", debug: { hasSupabaseUrl: !!SUPABASE_URL, hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY, hasTelegramToken: !!TELEGRAM_BOT_TOKEN, hasTelegramChatId: !!TELEGRAM_CHAT_ID } }), { status: 500 });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
  const now = /* @__PURE__ */ new Date();
  const phtTime = new Date(now.getTime() + 8 * 60 * 60 * 1e3);
  const phtDateStr = phtTime.toISOString().split("T")[0];
  try {
    const { data: orders, error } = await supabase.from("orders").select("*, order_items(*)").gte("delivery_date_time", `${phtDateStr} 00:00`).lte("delivery_date_time", `${phtDateStr} 23:59`).not("status", "eq", "Cancelled");
    if (error) throw error;
    const formattedDate = phtTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    let message = `🌅 <b>Montejo's Lechon & Food Trays - Daily Reminder</b>
`;
    message += `📅 Date: <b>${formattedDate}</b>

`;
    if (!orders || orders.length === 0) {
      message += `✨ No orders are scheduled for today! Have a wonderful day ahead!`;
    } else {
      message += `🛒 You have <b>${orders.length} order(s)</b> scheduled for today:

`;
      orders.forEach((o, index) => {
        const timePart = o.delivery_date_time ? o.delivery_date_time.split(" ")[1] || "N/A" : "N/A";
        const formattedTime = formatTime12h(timePart);
        const fbSuffix = o.facebook_name ? ` (FB: ${escapeHtml(o.facebook_name)})` : "";
        let itemsText = "";
        if (Array.isArray(o.order_items) && o.order_items.length > 0) {
          itemsText = o.order_items.map((it) => {
            let txt = `     - <b>${it.quantity}x ${escapeHtml(it.name)}</b>`;
            const inclusions = getInclusionsForTelegram(it.name, it.custom_inclusions ?? it.customInclusions);
            if (inclusions.length > 0) {
              txt += `
       (Inclusions:
` + inclusions.map((inc) => `        * ${escapeHtml(inc)}`).join("\n") + `)`;
            }
            return txt;
          }).join("\n");
        } else {
          itemsText = "     - No items listed";
        }
        message += `${index + 1}. <b>ORD-${o.id.replace("ORD-", "")}</b> - <b>${escapeHtml(o.customer || "N/A")}</b>${fbSuffix}
`;
        message += `   📦 Fulfillment: <b>${escapeHtml(o.fulfillment_type || "Delivery")} @ ${formattedTime}</b>
`;
        message += `   📍 Address: ${escapeHtml(o.address || "N/A")}
`;
        message += `   📞 Contact: ${escapeHtml(o.contact || "N/A")}
`;
        message += `   🛒 Items:
${itemsText}
`;
        message += `   💵 Total: <b>₱${parseFloat(o.total || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</b>
`;
        message += `   ⚖️ Balance: <b>₱${parseFloat(o.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</b>

`;
      });
    }
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const chatIds = TELEGRAM_CHAT_ID.split(",").map((id) => id.trim()).filter((id) => id !== "");
    for (const chatId of chatIds) {
      const resp = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML"
        })
      });
      if (!resp.ok) {
        const errBody = await resp.text();
        console.error(`Telegram bot API error for chat ID ${chatId}:`, errBody);
      }
    }
    return new Response(JSON.stringify({ ok: true, message: "Reminder sent successfully" }), { status: 200 });
  } catch (err) {
    console.error("Failed to execute daily reminder:", err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
