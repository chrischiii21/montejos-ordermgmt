// Server-side checks for requests coming from a customer's order link (/order?id=…&t=…).
//
// The link's `t` value is the same signature the dashboard puts in the link
// (getOrderSignature in src/pages/index.astro and src/pages/order.astro). Keep the three in sync.
// Note: that signature is computed in browser code, so it is not a real secret. Customer requests
// are therefore also limited to the few things a customer is supposed to do (see update-order.ts).

export function getOrderSignature(orderId: string): string {
	const salt = 'montejo_order_security_salt_2026';
	let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
	const str = orderId + salt;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334903);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
	h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
	h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	return ((h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0')).slice(0, 10);
}

export function isValidOrderSignature(orderId: unknown, sig: unknown): boolean {
	return typeof orderId === 'string' && typeof sig === 'string' && sig.length > 0 && sig === getOrderSignature(orderId);
}

/** Order still waiting for the customer to fill in their details on the link. */
export function isAwaitingCustomer(order: { customer?: string | null; delivery_date_time?: string | null }): boolean {
	const c = (order.customer || '').trim();
	return !c || c === 'Pending Customer Details' || !order.delivery_date_time;
}

/**
 * Status an order should have by now, from its delivery time (same rule as the dashboard and order page):
 * past → Completed, within 4 hours → Preparing. Delivery times are local Philippine time.
 * A few minutes of slack covers clock differences between the phone and the server.
 */
export function scheduledStatusAllows(deliveryDateTime: string | null | undefined, requested: string): boolean {
	if (!deliveryDateTime) return false;
	const when = new Date(deliveryDateTime.replace(' ', 'T') + '+08:00');
	if (isNaN(when.getTime())) return false;
	const hours = (when.getTime() - Date.now()) / 36e5;
	const SLACK = 0.25;
	if (requested === 'Completed') return hours <= SLACK;
	if (requested === 'Preparing') return hours <= 4 + SLACK;
	return false;
}
