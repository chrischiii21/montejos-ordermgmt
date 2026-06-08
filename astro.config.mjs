// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import vercel from '@astrojs/vercel';

// Select adapter dynamically based on deployment environment
const getAdapter = () => {
  if (process.env.VERCEL) {
    return vercel();
  }
  return netlify();
};

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: getAdapter(),
});
