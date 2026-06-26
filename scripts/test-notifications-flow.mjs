import fs from 'fs';
import path from 'path';

console.log('🧪 Starting End-to-End Telegram Notifications Flow Test...');

const testOrderId = 'ORD-TEST-999';

async function runTest() {
  try {
    // 1. Create a test order
    console.log(`\n1. Creating test order ${testOrderId}...`);
    const createResp = await fetch('http://localhost:4321/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: {
          id: testOrderId,
          date: '2026-06-26',
          customer: 'E2E Test User',
          address: '456 Test Blvd, Tech City',
          contact: '0999-999-9999',
          status: 'Pending',
          total: 1500.00,
          downpayment: 500.00,
          balance: 1000.00,
          deliveryFee: 150.00,
          facebookName: 'e2e.test.user'
        },
        items: [
          { name: 'Lechon Pork Belly (Small)', quantity: 1, price: 1350.00, total: 1350.00, customInclusions: ['Spicy', 'Extra Lemongrass'] }
        ],
        isOwnerFill: false // Skip the initial creation notification so we only test updates/deletes
      })
    });

    const createResult = await createResp.text();
    console.log(`Create Response Status: ${createResp.status}, Body: ${createResult}`);
    if (!createResp.ok) throw new Error('Order creation failed');

    // Wait a bit to ensure async tasks finish
    await new Promise(r => setTimeout(r, 2000));

    // 2. Perform an update (Status and Customer Name change)
    console.log(`\n2. Updating test order ${testOrderId} (status to Preparing, customer change)...`);
    const updateResp1 = await fetch('http://localhost:4321/api/update-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: testOrderId,
        isCustomerVerification: false,
        orderUpdates: {
          status: 'Preparing',
          customer: 'E2E Test User (Modified)',
          address: '789 Updated Rd, Tech City'
        }
      })
    });

    const updateResult1 = await updateResp1.text();
    console.log(`Update 1 Response Status: ${updateResp1.status}, Body: ${updateResult1}`);
    if (!updateResp1.ok) throw new Error('Update 1 failed');

    await new Promise(r => setTimeout(r, 2000));

    // 3. Cancel the order (Status to Cancelled)
    console.log(`\n3. Cancelling test order ${testOrderId}...`);
    const updateResp2 = await fetch('http://localhost:4321/api/update-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: testOrderId,
        isCustomerVerification: false,
        orderUpdates: {
          status: 'Cancelled'
        }
      })
    });

    const updateResult2 = await updateResp2.text();
    console.log(`Update 2 (Cancel) Response Status: ${updateResp2.status}, Body: ${updateResult2}`);
    if (!updateResp2.ok) throw new Error('Update 2 (Cancel) failed');

    await new Promise(r => setTimeout(r, 2000));

    // 4. Delete the order
    console.log(`\n4. Deleting test order ${testOrderId}...`);
    const deleteResp = await fetch('http://localhost:4321/api/delete-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: testOrderId })
    });

    const deleteResult = await deleteResp.text();
    console.log(`Delete Response Status: ${deleteResp.status}, Body: ${deleteResult}`);
    if (!deleteResp.ok) throw new Error('Deletion failed');

    console.log('\n✅ All steps completed! Check your Telegram group chat to verify that you received the:');
    console.log('1. Update Notification (E2E Test User -> E2E Test User (Modified), Pending -> Preparing)');
    console.log('2. Cancellation Notification (❌ ORDER CANCELLED)');
    console.log('3. Deletion Notification (🗑️ ORDER DELETED)');

  } catch (err) {
    console.error('\n❌ Test execution failed!', err.message || err);
  }
}

runTest();
