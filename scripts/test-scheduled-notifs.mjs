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

const sampleReminder = `🌅 <b>Montejo's Lechon & Food Trays - Daily Reminder</b>
📅 Date: <b>Thursday, June 25, 2026</b>

🛒 You have <b>2 order(s)</b> scheduled for today:

1. <b>ORD-021</b> - <b>Christy Montejo</b> (FB: <b>ChristyMontejoOfficial</b>)
   📦 Fulfillment: <b>Pickup @ 4:30 PM</b>
   📍 Address: N/A (Customer Pickup)
   📞 Contact: 09760721404
   🛒 Items:
     - <b>1x Set A Lechon Package</b>
       (Custom Inclusions:
        * 1 whole Lechon Baboy
        * 1 tray Buttered Shrimps
        * 100 pieces Lumpia Shanghai
        * 1 tray Chicken Cordon Bleu
        * 1 tray Special Bam-e
        * 1 tray Diniguan
        * 1 tray Spicy Buffalo Chicken)
   💵 Total: <b>₱1,275.00</b>
   ⚖️ Balance: <b>₱637.50</b>

2. <b>ORD-022</b> - <b>John Doe</b>
   📦 Fulfillment: <b>Delivery @ 6:00 PM</b>
   📍 Address: 123 Orchid Street, Barangay Tisa, Cebu City
   📞 Contact: 09123456789
   🛒 Items:
     - <b>2x Lechon Baboy (Kilo)</b>
   💵 Total: <b>₱2,500.00</b>
   ⚖️ Balance: <b>₱1,250.00</b>`;

const sampleSummary = `` +
  `🌃 <b>Montejo's Lechon & Food Trays - Daily EOD Summary</b>\n` +
  `📅 Date: <b>Thursday, June 25, 2026</b>\n\n` +
  `📋 Today's Orders & Statuses:\n\n` +
  `1. <b>ORD-021</b> - <b>Christy Montejo</b> (FB: <b>ChristyMontejoOfficial</b>)\n` +
  `   Revenue: <b>₱1,275.00</b>\n\n` +
  `2. <b>ORD-022</b> - <b>John Doe</b>\n` +
  `   Revenue: <b>₱1,250.00</b>\n\n` +
  `📈 <b>EOD Summary Tally:</b>\n` +
  `- Total Scheduled Orders: <b>2</b>\n` +
  `- Completed Orders: <b>1</b>\n` +
  `- Preparing Orders: <b>1</b>\n` +
  `- Pending Details Orders: <b>0</b>\n` +
  `- Cancelled Orders: <b>0</b>\n\n` +
  `💰 <b>Revenue Details:</b>\n` +
  `- Total Non-Cancelled Value: <b>₱3,775.00</b>\n` +
  `- Payments Collected Today (Est.): <b>₱2,525.00</b>`;

async function run() {
  for (const chatId of chatIds) {
    console.log(`⏳ Dispatching sample Daily Reminder to Chat ID: ${chatId}...`);
    try {
      let resp = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: sampleReminder, parse_mode: 'HTML' })
      });
      if (resp.ok) console.log('🎉 Reminder sample delivered!');
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log(`⏳ Dispatching sample Daily Summary to Chat ID: ${chatId}...`);
      resp = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: sampleSummary, parse_mode: 'HTML' })
      });
      if (resp.ok) console.log('🎉 Summary sample delivered!');
    } catch (err) {
      console.error('❌ Failed:', err.message);
    }
  }
}

run();
