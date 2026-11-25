import { reminderRoute } from '../../lib/reminder-route';

// Vercel cron (vercel.json): 21:00 UTC = 5:00 AM Philippine time (Hobby plan: 5:00–5:59).
// Sends "no orders today", only on days with no orders.
export const GET = reminderRoute('no-orders');
