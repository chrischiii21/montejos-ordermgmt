import fs from 'fs';
import path from 'path';

console.log('🤖 Loading configuration from .env...');

let envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  envPath = 'c:/Users/chris/Documents/montejos-ordermgmt/.env';
}

if (!fs.existsSync(envPath)) {
  console.error(`❌ Could not locate .env file at either process.cwd() or ${envPath}`);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[match[1]] = val;
  }
});

const token = env.TELEGRAM_BOT_TOKEN;
const chatIdStr = env.TELEGRAM_CHAT_ID;

if (!token) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN is not defined in your .env file.');
  process.exit(1);
}
if (!chatIdStr) {
  console.error('❌ Error: TELEGRAM_CHAT_ID is not defined in your .env file.');
  process.exit(1);
}

const chatIds = chatIdStr.split(',').map(id => id.trim()).filter(id => id !== '');
if (chatIds.length === 0) {
  console.error('❌ Error: No valid chat IDs found in TELEGRAM_CHAT_ID.');
  process.exit(1);
}

console.log(`✅ Loaded Telegram Config:`);
console.log(`   - Bot Token: ${token.substring(0, 10)}... (hidden for security)`);
console.log(`   - Chat IDs to notify: ${chatIds.join(', ')}`);

// Mock confirmation slip body — HTML formatted
const slipBody = `` +
  `📋 <b>C O N F I R M A T I O N   S L I P</b>\n\n` +
  `👤 Name: <b>Test Customer</b> (FB: <b>TestCustomerFB</b>)\n` +
  `📦 Fulfillment: <b>Delivery</b>\n` +
  `📍 Exact Address: 123 Sample Street, Barangay Test, Cebu City\n` +
  `📞 Contact Number of the Receiver/s: 09123456789\n` +
  `⏰ Time &amp; Date: <b>December 25, 2026 at 4:30 PM</b>\n` +
  `🛒 List of Order/s:\n` +
  `<b>2x Chocolate Fudge Cake</b>\n` +
  `  (Custom Inclusions:\n` +
  `   - Extra fudge topping\n` +
  `   - Happy Birthday topper)\n` +
  `<b>1x Vanilla Caramel Slice</b>\n\n` +
  `💰 Subtotal: <b>₱1,350.00</b>\n` +
  `🛵 Delivery/Meetup Fee: <b>₱150.00</b>\n` +
  `💵 TOTAL: <b>₱1,500.00</b>\n` +
  `💳 DOWNPAYMENT: <b>₱750.00</b>\n` +
  `⚖️ BALANCE: <b>₱750.00</b>`;

// Context 1: Customer fulfilled via shared link (no NEW ORDER ALERT)
const mockSlip1 = `` +
  `🎉 <b>Order ID - 999 link is successfully fulfilled.</b>\n\n` +
  slipBody;

// Context 2: Owner added a new order — includes NEW ORDER ALERT
const mockSlip2 = `` +
  `🔔 <b>NEW ORDER ALERT</b>\n\n` +
  `🎉 <b>Order ID - 999 successfully added.</b>\n\n` +
  slipBody;

const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

async function run() {
  for (const chatId of chatIds) {
    // Send Context 1
    console.log(`⏳ Dispatching Context 1 (Customer Fulfilled) to Chat ID: ${chatId}...`);
    try {
      const resp = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: mockSlip1,
          parse_mode: 'HTML'
        })
      });

      const body = await resp.json();
      if (resp.ok && body.ok) {
        console.log(`🎉 Success! Customer Fulfilled sample delivered to Chat ID: ${chatId}.`);
      } else {
        console.error(`❌ Failed to send to Chat ID: ${chatId}.`);
        console.error(`   Telegram API response:`, JSON.stringify(body, null, 2));
      }
    } catch (err) {
      console.error(`❌ Network error while connecting to Telegram API:`, err.message || err);
    }

    // Wait 1 second between messages to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Send Context 2
    console.log(`⏳ Dispatching Context 2 (Owner Added — NEW ORDER ALERT) to Chat ID: ${chatId}...`);
    try {
      const resp = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: mockSlip2,
          parse_mode: 'HTML'
        })
      });

      const body = await resp.json();
      if (resp.ok && body.ok) {
        console.log(`🎉 Success! Owner Added (NEW ORDER ALERT) sample delivered to Chat ID: ${chatId}.`);
      } else {
        console.error(`❌ Failed to send to Chat ID: ${chatId}.`);
        console.error(`   Telegram API response:`, JSON.stringify(body, null, 2));
      }
    } catch (err) {
      console.error(`❌ Network error while connecting to Telegram API:`, err.message || err);
    }
  }
}

run();
