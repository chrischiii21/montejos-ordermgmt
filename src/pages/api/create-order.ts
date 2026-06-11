import 'dotenv/config';
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
    const { order, items } = payload as any;

    if (!order) return new Response(JSON.stringify({ error: 'Missing order' }), { status: 400 });

    const { error: orderErr } = await supabase.from('orders').insert({
      id: order.id,
      date: order.date,
      customer: order.customer,
      address: order.address,
      contact: order.contact,
      note: order.note ?? null,
      delivery_date_time: order.delivery_date_time ?? order.deliveryDateTime ?? null,
      fulfillment_type: order.fulfillment_type ?? order.fulfillmentType ?? 'Delivery',
      status: order.status,
      total: order.total,
      downpayment: order.downpayment,
      balance: order.balance,
      delivery_fee: order.delivery_fee ?? order.deliveryFee ?? 0,
    });

    if (orderErr) {
      console.error('Order insert error', orderErr);
      return new Response(JSON.stringify({ error: orderErr.message || orderErr }), { status: 500 });
    }

    if (Array.isArray(items) && items.length > 0) {
      const { error: itemsErr } = await supabase.from('order_items').insert(
        items.map((it: any) => ({
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
        return new Response(JSON.stringify({ error: itemsErr.message || itemsErr }), { status: 500 });
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error('create-order API error', err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
};
