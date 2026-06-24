import fs from 'fs';
import path from 'path';

console.log('🤖 Loading configuration from .env...');

let envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  envPath = 'c:/Users/chris/Documents/montejos-ordermgmt/.env';
}

if (!fs.existsSync(envPath)) {
  console.error(`❌ Could not locate .env file.`);
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

if (!token || !chatIdStr) {
  console.error('❌ Missing Telegram config inside your .env file.');
  process.exit(1);
}

const chatIds = chatIdStr.split(',').map(id => id.trim()).filter(id => id !== '');
const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

const sampleReminder = `🌅 Montejo's Lechon & Food Trays - Daily Reminder
📅 Date: Thursday, June 25, 2026

🛒 You have 2 order(s) scheduled for today:

1. ORD-021 - Christy Montejo (FB: ChristyMontejoOfficial)
   📦 Fulfillment: Pickup @ 4:30 PM
   📍 Address: N/A (Customer Pickup)
   📞 Contact: 09760721404
   🛒 Items:
     - 1x Set A Lechon Package
       (Custom Inclusions:
        * 1 whole Lechon Baboy
        * 1 tray Buttered Shrimps
        * 100 pieces Lumpia Shanghai
        * 1 tray Chicken Cordon Bleu
        * 1 tray Special Bam-e
        * 1 tray Diniguan
        * 1 tray Spicy Buffalo Chicken)
   💵 Total: ₱1,275.00
   ⚖️ Balance: ₱637.50

2. ORD-022 - John Doe
   📦 Fulfillment: Delivery @ 6:00 PM
   📍 Address: 123 Orchid Street, Barangay Tisa, Cebu City
   📞 Contact: 09123456789
   🛒 Items:
     - 2x Lechon Baboy (Kilo)
   💵 Total: ₱2,500.00
   ⚖️ Balance: ₱1,250.00`;

const sampleSummary = `🌃 Montejo's Lechon & Food Trays - Daily EOD Summary
📅 Date: Thursday, June 25, 2026

📋 Today's Orders & Statuses:

1. ORD-021 - Christy Montejo (FB: ChristyMontejoOfficial)
   Revenue: ₱1,275.00

2. ORD-022 - John Doe
   Revenue: ₱1,250.00

📈 EOD Summary Tally:
- Total Scheduled Orders: 2
- Completed Orders: 1
- Preparing Orders: 1
- Pending Details Orders: 0
- Cancelled Orders: 0

💰 Revenue Details:
- Total Non-Cancelled Value: ₱3,775.00
- Payments Collected Today (Est.): ₱2,525.00`;

async function run() {
  for (const chatId of chatIds) {
    console.log(`⏳ Dispatching sample Daily Reminder to Chat ID: ${chatId}...`);
    try {
      let resp = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: sampleReminder })
      });
      if (resp.ok) console.log('🎉 Reminder sample delivered!');
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log(`⏳ Dispatching sample Daily Summary to Chat ID: ${chatId}...`);
      resp = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: sampleSummary })
      });
      if (resp.ok) console.log('🎉 Summary sample delivered!');
    } catch (err) {
      console.error('❌ Failed:', err.message);
    }
  }
}

run();
