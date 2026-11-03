// ESLint 10 flat config.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'test-results/',
      'playwright-report/',
      '.lighthouseci/',
      'src/data/cache/',
      'MCM/',
      'bwa-research/',
      'Portable_PQC_Container/',
      'fujitsu_results/',
      'fujitsu_vrp/',
      'llm-council/',
      'sound_society/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['scripts/**', 'tests/**', '*.config.*'],
    rules: { 'no-console': 'off' },
  },
];
