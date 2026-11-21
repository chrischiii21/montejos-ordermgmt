import { reminderRoute } from '../../lib/reminder-route';

// Vercel cron (vercel.json): 20:00 UTC = 4:00 AM Philippine time. Lists today's orders.
export const GET = reminderRoute('today');
