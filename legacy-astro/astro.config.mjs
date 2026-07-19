// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://southcity.pages.dev', // replace with the real domain after launch
  integrations: [
    tailwind({
      // we import our own global.css so we control layer order + custom CSS
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
  i18n: {
    defaultLocale: 'bn',
    locales: ['bn', 'en'],
    routing: {
      prefixDefaultLocale: false, // "/" = Bangla (default), "/en/" = English
    },
  },
  image: {
    // Astro's built-in sharp service — all images are optimized at build time
    // and emitted into dist/, so visitors are served from Cloudflare's CDN
    // (never hotlinked from Sanity — see §8 of the build spec).
    // cdn.sanity.io is allowed as a BUILD-TIME source only: Astro downloads,
    // optimizes and emits the files into dist/.
    domains: ['cdn.sanity.io'],
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
