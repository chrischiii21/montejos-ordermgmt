(async()=>{
  try{
    const res = await fetch('http://localhost:4321/.netlify/functions/create-order',{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: { id: 9999999, date: '2026-06-08', customer: 'CLI Test', address: 'x', contact: 'x', status: 'Pending', total: 1, downpayment: 0, balance: 1, delivery_fee: 0 }, items: [] })
    });
    const text = await res.text();
    console.log('status', res.status, 'body', text);
  }catch(e){
    console.error('error', e);
  }
})();
