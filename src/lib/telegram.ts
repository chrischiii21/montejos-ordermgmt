import { serviceClient } from './family-link';
import { markOrdersChanged } from './reminders.js';

// Order alerts (new order, confirmation slip, edit, cancel). Each one also counts as
// "changed after 6 PM" for the daily reminder.
export async function sendTelegramMessage(message: string): Promise<void> {
  const db = serviceClient();
  if (db) await markOrdersChanged(db);

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || import.meta.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || import.meta.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram Bot Token or Chat ID not configured. Notification skipped.');
    return;
  }

  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const chatIds = TELEGRAM_CHAT_ID.split(',').map(id => id.trim()).filter(id => id !== '');

  for (const chatId of chatIds) {
    try {
      const resp = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });
      if (!resp.ok) {
        const errBody = await resp.text();
        console.error(`Telegram bot API error for chat ID ${chatId}:`, errBody);
      } else {
        console.log(`Telegram notification sent successfully to chat ID ${chatId}.`);
      }
    } catch (err) {
      console.error(`Failed to send Telegram notification to chat ID ${chatId}:`, err);
    }
  }
}

// Package inclusions live in reminders.js, shared with the reminder routes.
export { PACKAGE_INCLUSIONS, getInclusionsForTelegram } from './reminders.js';
