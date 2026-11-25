import { reminderRoute } from '../../lib/reminder-route';

// Vercel cron (vercel.json): 19:00 UTC = 3:00 AM Philippine time. Lists today's orders.
export const GET = reminderRoute('today');
