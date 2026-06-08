import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request }) => {
  const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Missing Supabase service env vars' }), { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  try {
    const payload = await request.json().catch(() => ({}));
    const { id, orderUpdates, items } = payload as any;

    if (!id) return new Response(JSON.stringify({ error: 'Missing order ID' }), { status: 400 });

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

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error('update-order API error', err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
};
