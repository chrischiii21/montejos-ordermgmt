// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import vercel from '@astrojs/vercel';

// Select adapter dynamically based on deployment environment
const getAdapter = () => {
  if (process.env.VERCEL) {
    return vercel({
      // Ensure all Vercel dashboard env vars are available at runtime via process.env
      isr: false,
    });
  }
  return netlify();
};

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: getAdapter(),
  // Expose private env vars to SSR server functions at runtime
  vite: {
    define: process.env.VERCEL ? {} : {},
  },
});
