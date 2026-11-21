import { reminderRoute } from '../../lib/reminder-route';

// Vercel cron (vercel.json): 10:00 UTC = 6:00 PM Philippine time. Lists tomorrow's orders;
// skipped when tomorrow has none.
export const GET = reminderRoute('tomorrow');
