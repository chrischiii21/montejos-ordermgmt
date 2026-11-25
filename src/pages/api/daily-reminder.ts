import { reminderRoute } from '../../lib/reminder-route';

// Vercel cron (vercel.json): 18:00 UTC = 2:00 AM Philippine time (Hobby plan fires within the hour, so 2:00–2:59). Lists today's orders,
// but only when an order was added, edited, cancelled or deleted after 6 PM. Silent on days with
// no orders (no-orders-reminder.ts covers those at 5 AM). See reminders.js.
export const GET = reminderRoute('today');
