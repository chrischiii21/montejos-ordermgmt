import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage, getInclusionsForTelegram } from '../../lib/telegram';
import { DESSERT_OPTIONS, needsDessertChoice, applyDessertChoice } from '../../lib/menu';
import { isDashboardSession } from '../../lib/family-link';
import { isValidOrderSignature, isAwaitingCustomer, scheduledStatusAllows } from '../../lib/order-access';
import { findZone, OTHER_ZONE } from '../../lib/delivery-zones';
import { normalizePhMobile, isValidPhMobile, PH_MOBILE_HINT } from '../../lib/phone';
import { deleteDraft } from '../../lib/order-drafts';

const deny = (error: string, status = 403) => new Response(JSON.stringify({ error }), { status });

// Fields a customer may fill in from their order link. Everything else (items, totals,
// fees, status, notes) can only be changed from the logged-in dashboard.
const CUSTOMER_FIELDS = ['customer', 'contact', 'facebook_name', 'address', 'delivery_date_time', 'downpayment'] as const;

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

function getDiffText(oldVal: any, newVal: any, label: string, formatter?: (val: any) => string): string | null {
  const oldStr = oldVal === null || oldVal === undefined ? '' : String(oldVal).trim();
  const newStr = newVal === null || newVal === undefined ? '' : String(newVal).trim();
  
  if (oldStr === newStr) return null;
  
  const oldFormatted = formatter ? formatter(oldVal) : oldStr;
  const newFormatted = formatter ? formatter(newVal) : newStr;
  return `• <b>${label}:</b> ${oldFormatted || 'N/A'} ➡️ ${newFormatted || 'N/A'}`;
}

const formatCurrency = (val: any) => {
  const num = parseFloat(val);
  return isNaN(num) ? '₱0.00' : `₱${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Missing Supabase service env vars' }), { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  try {
    const payload = await request.json().catch(() => ({}));
    const { id, items, isCustomerVerification, dessertChoices, t, deliveryZone, fulfillmentType } = payload as any;
    let { orderUpdates } = payload as any;

    if (!id) return new Response(JSON.stringify({ error: 'Missing order ID' }), { status: 400 });

    // Who is calling: the logged-in dashboard can change anything; anyone else must come
    // from a valid customer order link and may only do what a customer is meant to do.
    const isAdmin = isDashboardSession(cookies.get('dashboard_token')?.value);
    if (!isAdmin && !isValidOrderSignature(id, t)) return deny('Unauthorized', 401);

    // 1. Fetch old order details first
    const { data: oldOrder, error: oldFetchErr } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();

    if (oldFetchErr || !oldOrder) {
      console.error('Failed to fetch old order details', oldFetchErr);
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    if (!isAdmin) {
      if (Array.isArray(items)) return deny('Items can only be changed by the shop.');
      if (oldOrder.status === 'Completed' || oldOrder.status === 'Cancelled') return deny('This order is already closed.');
      const updates = orderUpdates && typeof orderUpdates === 'object' ? orderUpdates : {};

      if (isCustomerVerification) {
        // Customer filling in their details: only once, only the allowed fields.
        if (!isAwaitingCustomer(oldOrder)) return deny('This order has already been submitted.');
        const clean: Record<string, unknown> = {};
        for (const key of CUSTOMER_FIELDS) {
          if (!(key in updates)) continue;
          if (key === 'downpayment') continue;
          const v = updates[key];
          clean[key] = v === null ? null : String(v ?? '').slice(0, key === 'address' ? 500 : 200);
        }
        if (!String(clean.customer ?? '').trim() || !String(clean.delivery_date_time ?? '').trim()) {
          return deny('Please fill in your name and the date & time.', 400);
        }
        // PH mobile number: 11 digits starting with 09 (+63 / 63 forms are converted).
        const contact = normalizePhMobile(String(clean.contact ?? ''));
        if (!isValidPhMobile(contact)) return deny(`Please enter a valid ${PH_MOBILE_HINT}.`, 400);
        clean.contact = contact;
        // Money is worked out here, never taken from the page.
        const total = parseFloat(oldOrder.total ?? 0) || 0;
        const dp = Math.min(Math.max(parseFloat(updates.downpayment) || 0, 0), total);
        clean.downpayment = dp;
        clean.balance = Math.max(0, parseFloat((total - dp).toFixed(2)));
        orderUpdates = clean;
      } else {
        // The order page moving the status forward as the delivery time approaches.
        const keys = Object.keys(updates);
        if (keys.length !== 1 || keys[0] !== 'status' || !scheduledStatusAllows(oldOrder.delivery_date_time, updates.status)) {
          return deny('Not allowed.');
        }
        orderUpdates = { status: updates.status };
      }
    }

    // Pickup / Meetup / Delivery chosen by the customer on the order link, and the fee that goes with it:
    //   - same method the shop set, and the shop set a fee → keep the shop's fee
    //   - Pickup → no fee;  Meetup → 0 for now (agreed by message, added later)
    //   - Delivery → fee of the chosen barangay (Settings → Delivery Fees); "not on the list" → 0 for now
    // Total and balance are recalculated here; the downpayment stays as entered.
    if (isCustomerVerification && orderUpdates) {
      const METHODS = ['Pickup', 'Meetup', 'Delivery'];
      // Set by the shop → fixed, whatever the page sends. Empty → the customer's choice (required).
      const locked = METHODS.includes(oldOrder.fulfillment_type);
      if (!locked && !METHODS.includes(fulfillmentType)) return deny('Please choose Pickup, Meetup or Delivery.', 400);
      const oldMethod = oldOrder.fulfillment_type || 'Delivery';
      const method = locked ? oldOrder.fulfillment_type : fulfillmentType;
      const oldFee = parseFloat(oldOrder.delivery_fee ?? 0) || 0;
      const subtotal = (parseFloat(oldOrder.total ?? 0) || 0) - oldFee;

      let fee = 0;
      if (method === oldMethod && oldFee > 0) {
        fee = oldFee;
      } else if (method === 'Delivery' && deliveryZone && deliveryZone !== OTHER_ZONE) {
        const zone = await findZone(deliveryZone);
        if (!zone) return deny('Please choose your service area from the list.', 400);
        fee = zone.fee;
      }

      const total = parseFloat((subtotal + fee).toFixed(2));
      const dp = Math.min(Math.max(parseFloat(orderUpdates.downpayment) || 0, 0), total);
      orderUpdates = {
        ...orderUpdates,
        fulfillment_type: method,
        delivery_fee: fee,
        total,
        downpayment: dp,
        balance: Math.max(0, parseFloat((total - dp).toFixed(2))),
        ...(method === 'Pickup' ? { address: '' } : {})
      };
    }

    // 2a. Customer's dessert picks for Bilao packages (from the order link).
    // Only applied to this order's Bilao items that still need a dessert, and only with a dessert from the menu.
    if (isCustomerVerification && Array.isArray(dessertChoices) && dessertChoices.length) {
      const stillNeeded = (oldOrder.order_items || []).filter((it: any) => needsDessertChoice(it.name, it.custom_inclusions));
      for (const choice of dessertChoices) {
        const item = stillNeeded.find((it: any) => it.id === choice?.itemId);
        const dessert = typeof choice?.dessert === 'string' ? choice.dessert.trim() : '';
        if (!item) continue;
        if (!DESSERT_OPTIONS.includes(dessert)) {
          return new Response(JSON.stringify({ error: 'Please choose a dessert from the list.' }), { status: 400 });
        }
        const updated = applyDessertChoice(item.name, item.custom_inclusions, dessert);
        const { error: dessertErr } = await supabase
          .from('order_items')
          .update({ name: updated.name, custom_inclusions: updated.customInclusions })
          .eq('id', item.id)
          .eq('order_id', id);
        if (dessertErr) {
          console.error('Dessert choice update error', dessertErr);
          return new Response(JSON.stringify({ error: dessertErr.message || dessertErr }), { status: 500 });
        }
      }
    }

    // 2. Perform updates
    if (orderUpdates) {
      const { error: orderErr } = await supabase.from('orders').update(orderUpdates).eq('id', id);
      if (orderErr) {
        console.error('Order update error', orderErr);
        return new Response(JSON.stringify({ error: orderErr.message || orderErr }), { status: 500 });
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

    // The customer submitted: their saved draft (order link progress) is no longer needed.
    if (isCustomerVerification) await deleteDraft(id).catch(() => {});

    // 3. Trigger notification
    if (isCustomerVerification) {
      // Flow 3a: Customer verification confirmation slip
      const { data: orderData, error: fetchErr } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();

      if (!fetchErr && orderData) {
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || import.meta.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || import.meta.env.TELEGRAM_CHAT_ID;

        if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
          try {
            const itemsText = (orderData.order_items || []).map((it: any) => {
              let text = `<b>${it.quantity}x ${escapeHtml(it.name)}</b>`;
              const inclusions = getInclusionsForTelegram(it.name, it.custom_inclusions ?? it.customInclusions);
              if (inclusions.length > 0) {
                text += `\n  (Inclusions:\n` + inclusions.map((inc: any) => `   - ${escapeHtml(inc)}`).join('\n') + `)`;
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
            // Meetup, or Delivery to a barangay not on the list: the shop still has to agree the fee by message.
            const method = orderData.fulfillment_type || 'Delivery';
            const feeToConfirm = method !== 'Pickup' && deliveryFee === 0;
            const feeReason = method === 'Meetup' ? 'meetup fee, to agree by message' : 'service area not on the list';

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
              `🛵 Delivery/Meetup Fee: <b>${feeToConfirm ? `TO BE CONFIRMED (${feeReason})` : `₱${formattedDeliveryFee}`}</b>\n` +
              `💵 TOTAL: <b>₱${formattedTotal}</b>${feeToConfirm ? ' + delivery fee' : ''}\n` +
              `💳 DOWNPAYMENT: <b>₱${formattedDownpayment}</b>\n` +
              `⚖️ BALANCE: <b>₱${formattedBalance}${orderData.status === 'Completed' ? ' (Settled)' : ''}</b>`;

            await sendTelegramMessage(message);
          } catch (teleErr) {
            console.error('Failed to send Telegram confirmation slip:', teleErr);
          }
        }
      }
    } else {
      // Flow 3b: Admin manual update comparison and notification.
      // Skip while the order is still awaiting customer details — the customer's
      // form submission sends the confirmation slip; only edits after that notify.
      const isPendingCustomer = !oldOrder.customer ||
        oldOrder.customer.trim() === 'Pending Customer Details' ||
        oldOrder.customer.trim() === '' ||
        !oldOrder.delivery_date_time;
      if (isPendingCustomer) {
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      const { data: newOrder, error: newFetchErr } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();

      if (!newFetchErr && newOrder) {
        const changes: string[] = [];

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
              const nIt = newItems.find((n: any) => n.name === oIt.name);
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

          const itemsText = (newOrder.order_items || []).map((it: any) => {
            let text = `<b>${it.quantity}x ${escapeHtml(it.name)}</b>`;
            const inclusions = getInclusionsForTelegram(it.name, it.custom_inclusions ?? it.customInclusions);
            if (inclusions.length > 0) {
              text += `\n  (Inclusions:\n` + inclusions.map((inc: any) => `   - ${escapeHtml(inc)}`).join('\n') + `)`;
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
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error('update-order API error', err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
};
