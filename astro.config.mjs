// @ts-check
// Verified against installed versions: astro 7.4, @astrojs/mdx 8.1, @astrojs/react 7.1,
// @astrojs/sitemap 3.7, @tailwindcss/vite 4.3 (Vite 8).
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The repo is `mujahidmahfuz/mujahid-s-persona` (docs/DEPLOY.md §1), which GitHub Pages
// serves as a project site under /mujahid-s-persona/. If the repo is ever renamed to
// `mujahidmahfuz.github.io`, set SITE_BASE='/' — every internal link goes through withBase().
const base = process.env.SITE_BASE ?? '/mujahid-s-persona';

export default defineConfig({
  site: 'https://mujahidmahfuz.github.io',
  base,
  output: 'static',
  trailingSlash: 'always',
  // Advanced routing is not used: this is a static site.
  fetchFile: null,
  // Keeps the dev toolbar out of explainer posters (scripts/posters.ts screenshots astro dev).
  devToolbar: { enabled: false },
  integrations: [
    mdx(),
    react(),
    sitemap({
      filter: (page) => !/\/(styleguide|explainer-preview)\//.test(page),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // three.js lives in one lazy chunk loaded only when a 3D explainer scrolls into view
      // (SPEC §8 budget is measured before scrolling). Raise the advisory limit accordingly.
      chunkSizeWarningLimit: 1200,
    },
  },
});
