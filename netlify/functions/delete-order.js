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

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  try {
    const payload = JSON.parse(event.body || '{}');
    const { id } = payload;
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing id' }) };

    // Delete order items first
    const { error: itemsErr } = await supabase.from('order_items').delete().eq('order_id', id);
    if (itemsErr) {
      console.error('Error deleting order_items', itemsErr);
      return { statusCode: 500, body: JSON.stringify({ error: itemsErr.message || itemsErr }) };
    }

    // Delete order
    const { error: orderErr } = await supabase.from('orders').delete().eq('id', id);
    if (orderErr) {
      console.error('Error deleting order', orderErr);
      return { statusCode: 500, body: JSON.stringify({ error: orderErr.message || orderErr }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('delete-order function error', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || err }) };
  }
};
