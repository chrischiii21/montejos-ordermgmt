import { createClient } from '@supabase/supabase-js';
import { g as getInclusionsForTelegram } from './telegram_DOKRukXK.mjs';

function escapeHtml(text) {
  if (!text) return "";
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function formatDateTime12h(dateTimeStr) {
  if (!dateTimeStr) return "";
  const d = new Date(dateTimeStr.replace(" ", "T"));
  if (isNaN(d.getTime())) return dateTimeStr;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}
const POST = async ({ request }) => {
  const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || undefined                                   ;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || undefined                                         ;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing Supabase service env vars" }), { status: 500 });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  try {
    const payload = await request.json().catch(() => ({}));
    const { order, items, isOwnerFill } = payload;
    if (!order) return new Response(JSON.stringify({ error: "Missing order details" }), { status: 400 });
    const { error: orderErr } = await supabase.from("orders").insert({
      id: order.id,
      date: order.date,
      customer: order.customer,
      address: order.address,
      contact: order.contact,
      note: order.note ?? null,
      delivery_date_time: order.deliveryDateTime ?? order.delivery_date_time ?? null,
      fulfillment_type: order.fulfillmentType ?? order.fulfillment_type ?? "Delivery",
      status: order.status,
      total: order.total,
      downpayment: order.downpayment,
      balance: order.balance,
      delivery_fee: order.deliveryFee ?? order.delivery_fee ?? 0,
      facebook_name: order.facebook_name ?? order.facebookName ?? null
    });
    if (orderErr) {
      console.error("Order insert error", orderErr);
      return new Response(JSON.stringify({ error: orderErr.message || orderErr }), { status: 500 });
    }
    if (Array.isArray(items) && items.length > 0) {
      const { error: itemsErr } = await supabase.from("order_items").insert(
        items.map((it) => ({
          order_id: order.id,
          name: it.name,
          quantity: it.quantity,
          price: it.price,
          total: it.total,
          custom_inclusions: it.customInclusions ?? []
        }))
      );
      if (itemsErr) {
        console.error("Order items insert error", itemsErr);
        return new Response(JSON.stringify({ error: itemsErr.message || itemsErr }), { status: 500 });
      }
    }
    if (isOwnerFill) {
      const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || undefined                                  ;
      const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || undefined                                ;
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        try {
          const itemsText = (items || []).map((it) => {
            let text = `<b>${it.quantity}x ${escapeHtml(it.name)}</b>`;
            const inclusions = getInclusionsForTelegram(it.name, it.customInclusions ?? it.custom_inclusions);
            if (inclusions.length > 0) {
              text += `
  (Inclusions:
` + inclusions.map((inc) => `   - ${escapeHtml(inc)}`).join("\n") + `)`;
            }
            return text;
          }).join("\n");
          const idNumber = order.id.replace("ORD-", "");
          const formattedDateTime = formatDateTime12h(order.deliveryDateTime ?? order.delivery_date_time);
          const deliveryFee = parseFloat(order.deliveryFee ?? order.delivery_fee ?? 0);
          const total = parseFloat(order.total ?? 0);
          const downpayment = parseFloat(order.downpayment ?? 0);
          const balance = parseFloat(order.balance ?? 0);
          const subtotal = total - deliveryFee;
          const formattedSubtotal = subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const formattedDeliveryFee = deliveryFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const formattedTotal = total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const formattedDownpayment = downpayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const formattedBalance = balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const fbName = order.facebook_name ?? order.facebookName;
          const fbSuffix = fbName ? ` (FB: <b>${escapeHtml(fbName)}</b>)` : "";
          const message = `🔔 <b>NEW ORDER ALERT</b>

🎉 <b>Order ID - ${idNumber} successfully added.</b>

📋 <b>C O N F I R M A T I O N   S L I P</b>

👤 Name: <b>${escapeHtml(order.customer || "")}</b>${fbSuffix}
📦 Fulfillment: <b>${escapeHtml(order.fulfillmentType ?? order.fulfillment_type ?? "Delivery")}</b>
📍 Exact Address: ${escapeHtml(order.address || "")}
📞 Contact Number of the Receiver/s: ${escapeHtml(order.contact || "")}
⏰ Time & Date: <b>${escapeHtml(formattedDateTime)}</b>
🛒 List of Order/s:
${itemsText || "No items"}

💰 Subtotal: <b>₱${formattedSubtotal}</b>
🛵 Delivery/Meetup Fee: <b>₱${formattedDeliveryFee}</b>
💵 TOTAL: <b>₱${formattedTotal}</b>
💳 DOWNPAYMENT: <b>₱${formattedDownpayment}</b>
⚖️ BALANCE: <b>₱${formattedBalance}${order.status === "Completed" ? " (Settled)" : ""}</b>`;
          const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
          const chatIds = TELEGRAM_CHAT_ID.split(",").map((id) => id.trim()).filter((id) => id !== "");
          for (const chatId of chatIds) {
            await fetch(telegramUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: "HTML"
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
          console.error("Failed to send Telegram notification:", teleErr);
        }
      }
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("create-order API error", err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
