import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { isDashboardSession } from '../../lib/family-link';
import { markOrdersChanged } from '../../lib/reminders.js';

// POST { id }: delete an order and its items. No Telegram alert is sent for deletions,
// but it counts as a change for the daily reminder.
export const POST: APIRoute = async ({ request, cookies }) => {
  // Only the logged-in dashboard may create or delete orders (/api is exempt from the middleware).
  if (!isDashboardSession(cookies.get('dashboard_token')?.value)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Missing Supabase service env vars' }), { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  try {
    const payload = await request.json().catch(() => ({}));
    const { id } = payload as any;
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

    const { data: existing, error: fetchErr } = await supabase.from('orders').select('id').eq('id', id).maybeSingle();
    if (fetchErr || !existing) {
      console.error('Order to delete not found', fetchErr);
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    const { error: itemsErr } = await supabase.from('order_items').delete().eq('order_id', id);
    if (itemsErr) {
      console.error('Error deleting order_items', itemsErr);
      return new Response(JSON.stringify({ error: itemsErr.message || itemsErr }), { status: 500 });
    }

    const { error: orderErr } = await supabase.from('orders').delete().eq('id', id);
    if (orderErr) {
      console.error('Error deleting order', orderErr);
      return new Response(JSON.stringify({ error: orderErr.message || orderErr }), { status: 500 });
    }

    await markOrdersChanged(supabase);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error('delete-order API error', err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
};
