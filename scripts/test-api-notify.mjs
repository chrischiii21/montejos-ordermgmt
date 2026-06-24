import fs from 'fs';
import path from 'path';

console.log('🧪 Starting API update-order notification test...');

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

// We need an existing order ID from the database to test the API fetch.
// Let's assume ORD-021 exists or let's ask the user.
const testOrderId = 'ORD-021'; 

console.log(`📡 Sending test POST request to http://localhost:4321/api/update-order for order: ${testOrderId}...`);

async function testApi() {
  try {
    const resp = await fetch('http://localhost:4321/api/update-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: testOrderId,
        isCustomerVerification: true,
        orderUpdates: {
          customer: "Test Customer (API Trigger)",
          contact: "09123456789",
          address: "123 Sample St, Cebu City",
          delivery_date_time: "2026-12-25 16:30"
        }
      })
    });

    const text = await resp.text();
    console.log(`Response Status: ${resp.status}`);
    console.log(`Response Body:`, text);

    if (resp.ok) {
      console.log('✅ API returned success status.');
      console.log('💡 Note: Check your running dev server terminal logs to see if Telegram was triggered or if any config/fetch errors occurred.');
    } else {
      console.error('❌ API returned failure status.');
    }
  } catch (err) {
    console.error('❌ Connection failed! Make sure your Astro development server is running locally on http://localhost:4321');
    console.error('Error Details:', err.message || err);
  }
}

testApi();
