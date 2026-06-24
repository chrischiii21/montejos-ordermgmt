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

// Mock confirmation slip body details
const slipBody = `📋 C O N F I R M A T I O N   S L I P

👤 Name: Test Customer (Telegram Check)
📦 Fulfillment: Delivery
📍 Exact Address: 123 Sample Street, Barangay Test, Cebu City
📞 Contact Number of the Receiver/s: 09123456789
⏰ Time & Date: 12/25/2026, 4:30 PM
🛒 List of Order/s:
2x Chocolate Fudge Cake
  (Custom Inclusions:
   - Extra fudge topping
   - Happy Birthday topper)
1x Vanilla Caramel Slice

💰 Subtotal: ₱1,350.00
🛵 Delivery/Meetup Fee: ₱150.00
💵 TOTAL: ₱1,500.00
💳 DOWNPAYMENT: ₱750.00
⚖️ BALANCE: ₱750.00`;

const mockSlip1 = `🎉 Order ID - 999 link is successfully fulfilled.\n\n${slipBody}`;
const mockSlip2 = `🎉 Order ID - 999 successfully added.\n\n${slipBody}`;

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
          text: mockSlip1
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
    console.log(`⏳ Dispatching Context 2 (Owner Added) to Chat ID: ${chatId}...`);
    try {
      const resp = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: mockSlip2
        })
      });

      const body = await resp.json();
      if (resp.ok && body.ok) {
        console.log(`🎉 Success! Owner Added sample delivered to Chat ID: ${chatId}.`);
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
