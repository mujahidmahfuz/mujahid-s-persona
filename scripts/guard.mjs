#!/usr/bin/env node
/**
 * Custom guard — docs/QUALITY-GATES.md §1. Exits non-zero on any violation.
 * Run: node scripts/guard.mjs   (also part of `npm run check`)
 * Pass --dist to also scan the built site (run after `astro build`).
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parse as parseYaml } from 'yaml';

const ROOT = process.cwd();
const MB = 1024 * 1024;
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.astro', 'test-results', 'playwright-report', '.lighthouseci']);
const errors = [];
const warnings = [];
const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);
const rel = (p) => relative(ROOT, p).split(sep).join('/');

function walk(dir, { skip = SKIP_DIRS } = {}) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p, { skip }));
    else out.push(p);
  }
  return out;
}

const TEXT_EXT = /\.(astro|ts|tsx|js|mjs|jsx|md|mdx|css|json|ya?ml|html|svg)$/i;
const allRepo = walk(ROOT);
const srcFiles = walk(join(ROOT, 'src'));
const srcText = srcFiles.filter((f) => TEXT_EXT.test(f) && !rel(f).startsWith('src/data/cache/'));
const read = (f) => readFileSync(f, 'utf8');

// 1. File sizes
for (const f of [...walk(join(ROOT, 'public')), ...srcFiles]) {
  if (statSync(f).size > 10 * MB) fail(`File larger than 10 MB: ${rel(f)}`);
}
for (const f of allRepo) {
  if (/\.(mp4|mov|webm)$/i.test(f) && statSync(f).size > 10 * MB) fail(`Video larger than 10 MB: ${rel(f)}`);
}

// 2. No tailwind.config.*
for (const f of readdirSync(ROOT)) if (/^tailwind\.config\./.test(f)) fail(`Tailwind v4 must not have ${f}`);

// 3. /quantum-cookbook is never an internal route
const QC_EXTERNAL = 'https://mujahidmahfuz.github.io/quantum-cookbook/';
for (const f of srcText) {
  const lines = read(f).split('\n');
  lines.forEach((line, i) => {
    const stripped = line.split(QC_EXTERNAL).join('');
    // Internal route = "/quantum-cookbook" not preceded by a host or owner name (github.com/<owner>/quantum-cookbook is fine).
    if (/(?<![\w.-])\/quantum-cookbook/.test(stripped)) fail(`${rel(f)}:${i + 1} uses /quantum-cookbook as an internal route`);
  });
}
if (walk(join(ROOT, 'src/pages')).some((f) => /quantum-cookbook/.test(rel(f))))
  fail('A page exists under src/pages for quantum-cookbook');

// 4 + 5. three only inside explainers; no client:load on explainers
const THREE_IMPORT = /(?:from\s+|import\s*\(\s*|import\s+)['"](three|@react-three\/[^'"]+)(?:\/[^'"]*)?['"]/;
for (const f of srcText) {
  const r = rel(f);
  const text = read(f);
  if (!r.startsWith('src/explainers/') && THREE_IMPORT.test(text))
    fail(`${r} imports three/@react-three outside src/explainers/`);
  if (r.startsWith('src/explainers/') && /client:load/.test(text)) fail(`${r} uses client:load inside src/explainers/`);
  if (/explainers\//.test(text) && /client:load/.test(text)) fail(`${r} hydrates an explainer with client:load`);
}

// 6. Low-contrast accents (saffron, light saffron, terracotta, copper, olive) used as TEXT outside a dark
//    surface. They are for fills/marks on light paper; text uses the *-ink variants (DESIGN §3).
for (const f of srcText) {
  const r = rel(f);
  const text = read(f);
  const weak = /\btext-(pink(?!-ink)|saffron(?!-ink)(?:-light)?|terracotta(?!-ink)|copper|olive(?!-ink))\b/;
  if (weak.test(text) && !text.includes('data-surface="dark"') && !text.includes("data-surface='dark'")) {
    fail(`${r} uses a fill-only accent as text outside a data-surface="dark" container`);
  }
}

// 7. Banned strings in src
const banned = [
  [/\blorem\b/i, 'lorem'],
  [/\bipsum\b/i, 'ipsum'],
  [/example\.com/i, 'example.com'],
  [/John Doe/, 'John Doe'],
  [/console\.log\s*\(/, 'console.log'],
  [/\bTODO\b(?!\\?\(muja\\?\)|-MUJA)/, 'TODO not in TODO(muja): format'],
];
for (const f of srcText) {
  const r = rel(f);
  read(f)
    .split('\n')
    .forEach((line, i) => {
      for (const [re, label] of banned) if (re.test(line)) fail(`${r}:${i + 1} contains banned string (${label})`);
    });
}

// 8. Student ID (hash only) and phone numbers
const envLocal = join(ROOT, '.env.local');
let studentHash = process.env.STUDENT_ID_SHA256 ?? '';
if (!studentHash && existsSync(envLocal)) {
  const m = /^STUDENT_ID_SHA256=([a-f0-9]{64})\s*$/m.exec(read(envLocal));
  if (m) studentHash = m[1];
}
const scanDist = process.argv.includes('--dist');
const distFiles = scanDist
  ? walk(join(ROOT, 'dist'), { skip: new Set(['pagefind']) }).filter((f) => /\.(html|xml|json|txt)$/.test(f))
  : [];
const sha = (s) => createHash('sha256').update(s).digest('hex');
const PHONE = /\b0[5789]0[-\s]?\d{4}[-\s]?\d{4}\b|\+81[-\s]?\d{1,2}[-\s]?\d{4}[-\s]?\d{4}/;
const contentFiles = srcText.filter((f) => rel(f).startsWith('src/content/'));
if (!studentHash) warn('STUDENT_ID_SHA256 not set (.env.local) — student-ID scan skipped');
for (const f of [...contentFiles, ...distFiles]) {
  const text = read(f);
  if (studentHash) {
    for (const m of text.matchAll(/(?<!\d)\d{8}(?!\d)/g))
      if (sha(m[0]) === studentHash) fail(`${rel(f)} contains the student ID`);
  }
  if (PHONE.test(text)) fail(`${rel(f)} contains a phone number`);
}

// 9. Explainer folders
const explainersDir = join(ROOT, 'src/explainers');
const verifiedIds = new Set();
// 10. Sourced numbers — parse frontmatter of content files
const FM = /^---\r?\n([\s\S]*?)\r?\n---/;
for (const f of contentFiles.filter((x) => /\.(md|mdx)$/.test(x))) {
  const m = FM.exec(read(f));
  if (!m) continue;
  let data;
  try {
    data = parseYaml(m[1]) ?? {};
  } catch (e) {
    fail(`${rel(f)} frontmatter is not valid YAML: ${e.message}`);
    continue;
  }
  for (const key of ['keyFindings', 'highlights']) {
    for (const item of data[key] ?? []) {
      const text = String(item?.text ?? '');
      if (/\d/.test(text) && !String(item?.source ?? '').trim())
        fail(`${rel(f)} ${key}: "${text.slice(0, 50)}…" has a number but no source`);
    }
  }
  for (const ex of data.explainers ?? []) if (ex?.verified === true) verifiedIds.add(ex.id);
  // SPEC §4 fixed order: research bodies need "The problem" then "Method"; projects need "Why it exists".
  const body = read(f).slice(m[0].length);
  if (rel(f).startsWith('src/content/research/')) {
    const a = body.indexOf('## The problem');
    const b = body.indexOf('## Method');
    if (a === -1 || b === -1 || b < a) fail(`${rel(f)} must contain "## The problem" followed by "## Method"`);
  }
  if (rel(f).startsWith('src/content/projects/') && data.private !== true && !body.includes('## Why it exists')) {
    fail(`${rel(f)} must contain "## Why it exists"`);
  }
}
// 11. References resolve (Astro only logs broken references; we fail on them)
{
  const ids = {};
  const fmOf = new Map();
  for (const f of contentFiles.filter((x) => /\.(md|mdx|ya?ml|json)$/.test(x))) {
    const [, , col, ...rest] = rel(f).split('/');
    const id = rest.join('/').replace(/\.(mdx?|ya?ml|json)$/, '');
    (ids[col] ??= new Set()).add(id);
    const text = read(f);
    let data = {};
    try {
      if (/\.(ya?ml)$/.test(f)) data = parseYaml(text) ?? {};
      else if (f.endsWith('.json')) data = JSON.parse(text);
      else data = parseYaml(FM.exec(text)?.[1] ?? '') ?? {};
    } catch {
      /* reported above */
    }
    fmOf.set(f, { col, data });
  }
  const has = (col, id) => ids[col]?.has(id);
  const refs = {
    projects: [['relatedResearch', 'research']],
    sports: [['videos', 'videos']],
    talks: [
      ['video', 'videos'],
      ['research', 'research'],
    ],
    publications: [['research', 'research']],
  };
  for (const [f, { col, data }] of fmOf) {
    for (const [field, target] of refs[col] ?? []) {
      const v = data[field];
      for (const id of Array.isArray(v) ? v : v ? [v] : [])
        if (!has(target, id)) fail(`${rel(f)} ${field} → "${id}" does not exist in ${target}`);
    }
    for (const r of col === 'awards' ? (data.related ?? []) : [])
      if (!has(r.collection, r.id)) fail(`${rel(f)} related → ${r.collection}/${r.id} does not exist`);
    for (const r of col === 'videos' ? (data.related ?? []) : [])
      if (!has(r.collection, r.slug)) fail(`${rel(f)} related → ${r.collection}/${r.slug} does not exist`);
  }
}

if (existsSync(explainersDir)) {
  for (const name of readdirSync(explainersDir)) {
    const dir = join(explainersDir, name);
    if (!statSync(dir).isDirectory() || name === 'shared' || name.startsWith('_')) continue;
    if (!existsSync(join(dir, 'README.md'))) fail(`src/explainers/${name} has no README.md`);
    if (!existsSync(join(dir, 'poster.png'))) fail(`src/explainers/${name} has no poster.png (run npm run posters)`);
    if (verifiedIds.has(name) && existsSync(join(dir, 'README.md'))) {
      const readme = read(join(dir, 'README.md'));
      if (!/Source anchor:/.test(readme) || !/Data provenance:/.test(readme)) {
        fail(`src/explainers/${name} is verified but README lacks "Source anchor:" / "Data provenance:"`);
      }
    }
  }
}

// 13. Epigraphs (Website_Redesign.md §5): exactly one per built page; no accidental repetition
//     (only topic pages share the pool); every Quran reference is in the fetched cache.
if (scanDist) {
  const seen = new Map();
  for (const f of walk(join(ROOT, 'dist'), { skip: new Set(['pagefind', '_astro', 'og']) }).filter((x) => x.endsWith('.html'))) {
    const html = read(f);
    const ids = [...html.matchAll(/data-epigraph="([^"]+)"/g)].map((m) => m[1]);
    const page = rel(f);
    if (ids.length !== 1) fail(`${page} has ${ids.length} epigraphs (expected exactly 1)`);
    const id = ids[0];
    if (id && !id.startsWith('pool/')) {
      if (seen.has(id)) fail(`epigraph "${id}" used on both ${seen.get(id)} and ${page}`);
      seen.set(id, page);
    }
  }
}
{
  const reg = read(join(ROOT, 'src/data/epigraphs.ts'));
  const cachePath = join(ROOT, 'src/data/cache/quran.json');
  const cache = existsSync(cachePath) ? JSON.parse(read(cachePath)) : {};
  for (const m of reg.matchAll(/ref: '([^']+)'/g))
    if (!cache[m[1]]) fail(`epigraph Quran ${m[1]} is not in src/data/cache/quran.json (run npm run epigraphs)`);
}

// Built site must not contain a quantum-cookbook route
if (scanDist && existsSync(join(ROOT, 'dist/quantum-cookbook'))) fail('dist/quantum-cookbook exists');

for (const w of warnings) console.warn(`guard: warning: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`guard: ✗ ${e}`);
  console.error(`guard: ${errors.length} violation(s)`);
  process.exit(1);
}
console.log(`guard: ✓ all checks passed (${srcText.length} source files${scanDist ? `, ${distFiles.length} built files` : ''})`);
