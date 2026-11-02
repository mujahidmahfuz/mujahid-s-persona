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
  integrations: [
    mdx(),
    react(),
    sitemap({
      filter: (page) => !page.includes('/styleguide/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
