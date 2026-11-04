# DEPLOY — Free hosting on GitHub Pages

## 1. Why GitHub Pages

- $0, no card, no trial.
- Muja already serves `mujahidmahfuz.github.io/quantum-cookbook`, so the main site at `https://mujahidmahfuz.github.io/` sits naturally next to it.
- Limits (GitHub docs, checked Nov 2026): published site ≤ 1 GB, soft bandwidth 100 GB/month, deployments time out after 10 minutes, one user site per account. A personal academic site uses a small fraction of this, **provided videos are on YouTube and not in the repo**.
- GitHub Pages is not for commercial sites. A personal research portfolio is fine.

- Here is the github repo for this: https://github.com/mujahidmahfuz/mujaverse

## 2. One-time setup (Muja does these by hand)

1. Create a **public** repo named exactly `mujahidmahfuz.github.io`.
2. Repo → Settings → Pages → *Build and deployment* → Source: **GitHub Actions**.
3. Push the code (Claude Code creates `.github/workflows/deploy.yml`).
4. After the first green run, the site is at `https://mujahidmahfuz.github.io/`.
5. Check that `https://mujahidmahfuz.github.io/quantum-cookbook/` still works.

## 3. Workflow Claude Code must create (`.github/workflows/deploy.yml`)

Triggers:
- `push` to `main`
- `workflow_dispatch` (manual button)
- `schedule`: weekly cron (e.g. Monday 03:17 UTC) — re-runs the Crossref/ORCID/GitHub sync so publication data and GitHub stats stay current

Jobs:
1. `build`: checkout → setup Node (LTS) with npm cache → `npm ci` → `npm run sync:pubs` (non-fatal) → `npm run check` → `npm run build` → upload Pages artifact. Use the official `withastro/action` or the equivalent manual steps — check its current README for the right version tags.
2. `deploy`: `actions/deploy-pages`, `permissions: pages: write, id-token: write`, `environment: github-pages`.

A separate `ci.yml` runs `check` + `test:e2e` on pull requests.

## 4. Astro config essentials

```ts
// astro.config.mjs (sketch — verify against installed version)
export default defineConfig({
  site: 'https://mujahidmahfuz.github.io',
  // base not needed for a user site; keep withBase() so moving later is painless
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), react(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
```

## 5. Videos (free)

- Upload sports clips to YouTube as **Unlisted** (only people with the link/site can find them) or Public.
- Paste the video ID into `src/content/videos/<slug>.md`.
- The site shows a thumbnail + play button; the YouTube player loads only on click, from `youtube-nocookie.com`.
- Very short clips (≤ 10 MB after compression, e.g. a 6-second goal loop) may be self-hosted as WebM + MP4 with a poster, `preload="none"`, muted, no autoplay.

## 6. Optional free extras (ask Muja first)

| Need | Free option | Note |
|---|---|---|
| Custom domain (e.g. `mujahidulislam.com`) | Domain itself costs money (~$10/yr) | GitHub Pages HTTPS on a custom domain is free. Skip if $0 is strict |
| Analytics | GoatCounter (free for personal use) or Cloudflare Web Analytics | Cookie-free; verify current free terms before adding |
| Contact form | A free-tier form endpoint (e.g. Formspree, Web3Forms) | Verify monthly limits; obfuscated email is the zero-dependency default |
| Edit content from the browser | A git-based CMS that works with static GitHub Pages (e.g. Pages CMS) | Verify it is still free; otherwise use the `/add-research` Claude Code command |

## 7. Fallback host

If GitHub Pages ever becomes unsuitable, the same `dist/` folder deploys unchanged to Cloudflare Pages or Netlify free tiers. Do not use a host-specific adapter; keep `output: 'static'`.
