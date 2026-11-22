// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Deployed on Vercel. Server routes (src/pages/api) run as Vercel functions and read their
// settings from the Vercel project's environment variables via process.env at runtime.
// The daily Telegram reminders are scheduled in vercel.json.
// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel({ isr: false }),
});
