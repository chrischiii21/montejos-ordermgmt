import type { APIRoute } from 'astro';
import { isValidFamilyKey } from '../../../lib/family-link';

// Web app manifest for the family calendar, one per secret link, so "Add to Home Screen" /
// "Install app" opens straight to /family/<key>. Wrong key → 404, like the page itself.
// Note: after "Generate New Link", icons already on phones point at the old link and must be re-added.
export const GET: APIRoute = async ({ params }) => {
	if (!(await isValidFamilyKey(params.key))) return new Response('Not found', { status: 404 });

	const base = `/family/${encodeURIComponent(params.key!)}`;
	const manifest = {
		id: base,
		name: "Montejo's Orders",
		short_name: "Montejo's",
		description: 'Order calendar for family',
		start_url: base,
		scope: base,
		display: 'standalone',
		orientation: 'portrait',
		background_color: '#f6efe9',
		theme_color: '#4a0d0a',
		icons: [
			{ src: '/icons/family-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
			{ src: '/icons/family-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }
		]
	};

	return new Response(JSON.stringify(manifest), {
		headers: {
			'Content-Type': 'application/manifest+json',
			'Cache-Control': 'no-store',
			'X-Robots-Tag': 'noindex, nofollow'
		}
	});
};
