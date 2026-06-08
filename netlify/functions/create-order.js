import { createClient } from '@supabase/supabase-js';

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
    const { order, items } = payload;

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
      delivery_date_time: order.delivery_date_time ?? order.deliveryDateTime ?? null,
      fulfillment_type: order.fulfillment_type ?? order.fulfillmentType ?? 'Delivery',
      status: order.status,
      total: order.total,
      downpayment: order.downpayment,
      balance: order.balance,
      delivery_fee: order.delivery_fee ?? order.deliveryFee ?? 0
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

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('create-order function error', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || err }) };
  }
};
