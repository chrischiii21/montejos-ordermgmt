import { createClient } from '@supabase/supabase-js';
import { g as getInclusionsForTelegram, s as sendTelegramMessage } from './telegram_DOKRukXK.mjs';

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
    const { id } = payload;
    if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
    const { data: orderData, error: fetchErr } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).single();
    if (fetchErr || !orderData) {
      console.error("Failed to fetch order details for deletion", fetchErr);
      return new Response(JSON.stringify({ error: "Order not found" }), { status: 404 });
    }
    const { error: itemsErr } = await supabase.from("order_items").delete().eq("order_id", id);
    if (itemsErr) {
      console.error("Error deleting order_items", itemsErr);
      return new Response(JSON.stringify({ error: itemsErr.message || itemsErr }), { status: 500 });
    }
    const { error: orderErr } = await supabase.from("orders").delete().eq("id", id);
    if (orderErr) {
      console.error("Error deleting order", orderErr);
      return new Response(JSON.stringify({ error: orderErr.message || orderErr }), { status: 500 });
    }
    const isPendingCustomer = !orderData.customer || orderData.customer === "Pending Customer Details" || orderData.customer.trim() === "";
    if (!isPendingCustomer) {
      try {
        const idNumber = orderData.id.replace("ORD-", "");
        const formattedDateTime = formatDateTime12h(orderData.delivery_date_time);
        const deliveryFee = parseFloat(orderData.delivery_fee ?? 0);
        const total = parseFloat(orderData.total ?? 0);
        const downpayment = parseFloat(orderData.downpayment ?? 0);
        const balance = parseFloat(orderData.balance ?? 0);
        const subtotal = total - deliveryFee;
        const formattedSubtotal = subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const formattedDeliveryFee = deliveryFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const formattedTotal = total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const formattedDownpayment = downpayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const formattedBalance = balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const fbName = orderData.facebook_name ?? orderData.facebookName;
        const fbSuffix = fbName ? ` (FB: <b>${escapeHtml(fbName)}</b>)` : "";
        const itemsText = (orderData.order_items || []).map((it) => {
          let text = `<b>${it.quantity}x ${escapeHtml(it.name)}</b>`;
          const inclusions = getInclusionsForTelegram(it.name, it.custom_inclusions ?? it.customInclusions);
          if (inclusions.length > 0) {
            text += `
  (Inclusions:
` + inclusions.map((inc) => `   - ${escapeHtml(inc)}`).join("\n") + `)`;
          }
          return text;
        }).join("\n");
        const message = `🗑️ <b>ORDER DELETED</b>

🎟️ Order ID: <b>${idNumber}</b>

⚠️ This order ticket was deleted by an admin user.

📋 <b>D E L E T E D   O R D E R   D E T A I L S</b>

👤 Name: <b>${escapeHtml(orderData.customer || "")}</b>${fbSuffix}
📦 Fulfillment: <b>${escapeHtml(orderData.fulfillment_type || "Delivery")}</b>
📍 Exact Address: ${escapeHtml(orderData.address || "")}
📞 Contact Number of the Receiver/s: ${escapeHtml(orderData.contact || "")}
⏰ Time & Date: <b>${escapeHtml(formattedDateTime)}</b>
🛒 List of Order/s:
${itemsText || "No items"}

💰 Subtotal: <b>₱${formattedSubtotal}</b>
🛵 Delivery/Meetup Fee: <b>₱${formattedDeliveryFee}</b>
💵 TOTAL: <b>₱${formattedTotal}</b>
💳 DOWNPAYMENT: <b>₱${formattedDownpayment}</b>
⚖️ BALANCE: <b>₱${formattedBalance}</b>`;
        await sendTelegramMessage(message);
      } catch (teleErr) {
        console.error("Failed to send Telegram notification for deleted order:", teleErr);
      }
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("delete-order API error", err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
