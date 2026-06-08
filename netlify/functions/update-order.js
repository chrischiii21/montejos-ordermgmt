import 'dotenv/config';
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
    const { id, orderUpdates, items } = payload;

    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing order ID' }) };
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
      // 1. Delete old items
      const { error: deleteErr } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);

      if (deleteErr) {
        console.error('Order items delete error', deleteErr);
        return { statusCode: 500, body: JSON.stringify({ error: deleteErr.message || deleteErr }) };
      }

      // 2. Insert new items if any
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

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('update-order function error', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || err }) };
  }
};
