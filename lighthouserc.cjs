// Lighthouse CI — SPEC §8 budgets (mobile): Performance ≥ 0.9, Accessibility / Best Practices / SEO = 1.
// Uses `astro preview` so the /mujahid-s-persona/ base path resolves. Run: npm run lighthouse
const base = `http://localhost:4321${process.env.SITE_BASE ?? '/mujahid-s-persona'}`;
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npx astro preview --port 4321',
      startServerReadyPattern: 'localhost:4321',
      url: [`${base}/`, `${base}/research/sleep-continual-learning/`, `${base}/projects/doombreak/`],
      numberOfRuns: 1,
      settings: { chromeFlags: '--headless=new --no-sandbox' },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 1 }],
        'categories:seo': ['error', { minScore: 1 }],
      },
    },
    upload: { target: 'filesystem', outputDir: '.lighthouseci/reports' },
  },
};
