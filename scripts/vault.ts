/**
 * Private workspace ("vault") — builds the encrypted payload for the locked /vault/ page.
 *
 * Collects:
 *   - everything in private/<section>/*.md(x)   (never committed; unpublished work)
 *   - public research/projects that are still in progress (status other than published/accepted/archived)
 * Renders each body to HTML, then encrypts the whole payload with AES-256-GCM using a key
 * derived from VAULT_PASSWORD by PBKDF2-SHA256 (600 000 iterations). Only the ciphertext
 * (src/data/vault.enc.json) is committed and published; it is decrypted in the browser.
 *
 * Password: VAULT_PASSWORD env var, else .env.local. If neither exists, a strong random one is
 * generated and saved to .env.local (git-ignored). The password itself is never printed.
 *
 * Run: npm run vault   (also runs at the start of every local build; skips in CI where private/ is absent)
 */
import { createHash, randomBytes, webcrypto } from 'node:crypto';
import { appendFileSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parse as parseYaml } from 'yaml';

const ROOT = process.cwd();
const PRIVATE = join(ROOT, 'private');
const OUT = join(ROOT, 'src/data/vault.enc.json');
const HASH_FILE = join(PRIVATE, '.vault-hash');
const ENV_LOCAL = join(ROOT, '.env.local');
const ITERATIONS = 600_000;
const BASE = (process.env.SITE_BASE ?? '/mujahid-s-persona').replace(/\/+$/, '');

if (!existsSync(PRIVATE)) {
  console.info('vault: no private/ folder here (e.g. CI) — keeping the committed vault.enc.json');
  process.exit(0);
}

// ---------- password ----------
function readEnvLocal(): string | undefined {
  if (!existsSync(ENV_LOCAL)) return undefined;
  return /^VAULT_PASSWORD=(.+)$/m.exec(readFileSync(ENV_LOCAL, 'utf8'))?.[1]?.trim();
}
let password = process.env.VAULT_PASSWORD ?? readEnvLocal();
if (!password) {
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(24);
  const chars = [...bytes].map((b) => alphabet[b % alphabet.length]).join('');
  password = chars.match(/.{6}/g)!.join('-');
  appendFileSync(
    ENV_LOCAL,
    `${existsSync(ENV_LOCAL) && !readFileSync(ENV_LOCAL, 'utf8').endsWith('\n') ? '\n' : ''}VAULT_PASSWORD=${password}\n`,
  );
  console.info('vault: created a new random password and saved it to .env.local (VAULT_PASSWORD=…)');
}

// ---------- tiny Markdown → HTML (enough for our content files) ----------
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function inline(s: string): string {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w])_(.+?)_(?=[^\w]|$)/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" rel="noopener">$1</a>')
    .replace(/\uE000TODO:(.*?)\uE000/g, '<span class="vault-todo">TODO: $1</span>');
}
export function renderMarkdown(md: string): string {
  const src = md
    .replace(/<Todo[^>]*>([\s\S]*?)<\/Todo>/g, (_, t: string) => `\uE000TODO:${t.trim()}\uE000`)
    .replace(/<Explainer\s+id="([^"]+)"\s*\/>/g, (_, id: string) => `\uE000TODO:explainer planned (${id})\uE000`)
    .replace(/<Math(?:\s+display)?\s+tex="([^"]+)"\s*\/>/g, '`$1`');
  const out: string[] = [];
  let list: 'ul' | 'ol' | null = null;
  let para: string[] = [];
  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    para = [];
  };
  const closeList = () => {
    if (list) out.push(`</${list}>`);
    list = null;
  };
  for (const raw of src.split('\n')) {
    const line = raw.trimEnd();
    const h = /^(#{2,4})\s+(.*)$/.exec(line);
    const ul = /^\s*[-*]\s+(.*)$/.exec(line);
    const ol = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (!line.trim()) {
      flushPara();
      closeList();
    } else if (h) {
      flushPara();
      closeList();
      out.push(`<h${h[1]!.length + 1}>${inline(h[2]!)}</h${h[1]!.length + 1}>`);
    } else if (ul || ol) {
      flushPara();
      const kind = ul ? 'ul' : 'ol';
      if (list !== kind) {
        closeList();
        out.push(`<${kind}>`);
        list = kind;
      }
      out.push(`<li>${inline((ul ?? ol)![1]!)}</li>`);
    } else {
      closeList();
      para.push(line.trim());
    }
  }
  flushPara();
  closeList();
  return out.join('\n');
}

// ---------- collect ----------
type Item = {
  key: string;
  section: string;
  visibility: 'private' | 'public';
  title: string;
  status: string;
  summary: string;
  kind?: string;
  date?: string;
  tags: string[];
  areas: string[];
  todos: string[];
  html: string;
  file: string;
  url?: string;
};
const FM = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const walk = (d: string): string[] =>
  existsSync(d) ? readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)])) : [];
const str = (v: unknown) => (v === undefined || v === null ? '' : String(v));
const todosIn = (text: string) => [
  ...[...text.matchAll(/TODO\(muja\):\s*([^'"<\n]+)/g)].map((m) => m[1]!.trim()),
  ...[...text.matchAll(/<Todo[^>]*>([^<]+)<\/Todo>/g)].map((m) => m[1]!.trim()),
];

function toItem(file: string, visibility: Item['visibility'], section: string, url?: string): Item | undefined {
  const text = readFileSync(file, 'utf8');
  const m = FM.exec(text);
  let data: Record<string, unknown> = {};
  try {
    data = (m ? parseYaml(m[1] ?? '') : {}) ?? {};
  } catch (e) {
    console.warn(`vault: warning: ${relative(ROOT, file)} has invalid frontmatter (${(e as Error).message})`);
  }
  const body = m ? text.slice(m[0].length) : text;
  const id = file
    .split(sep)
    .pop()!
    .replace(/\.(mdx?|txt)$/, '');
  const period = data.period as { start?: unknown; end?: unknown } | undefined;
  return {
    key: `${section}/${id}`,
    section,
    visibility,
    title: str(data.title ?? data.team ?? data.role ?? id),
    status: str(data.status ?? (visibility === 'private' ? 'unpublished' : '')),
    summary: str(data.summary ?? data.description),
    kind: str(data.kind ?? data.category) || undefined,
    date: str(data.date ?? period?.start) || undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    areas: Array.isArray(data.areas) ? data.areas.map(String) : [],
    todos: todosIn(text),
    html: renderMarkdown(body),
    file: relative(ROOT, file).split(sep).join('/'),
    url,
  };
}

const items: Item[] = [];
for (const f of walk(PRIVATE).filter((f) => /\.(mdx?|txt)$/.test(f) && !/README\.md$/.test(f))) {
  const section = relative(PRIVATE, f).split(sep)[0] ?? 'notes';
  const it = toItem(f, 'private', section.includes('.') ? 'notes' : section);
  if (it) items.push(it);
}
const DONE = new Set(['published', 'accepted', 'archived']);
for (const section of ['research', 'projects']) {
  for (const f of walk(join(ROOT, 'src/content', section)).filter((x) => /\.mdx?$/.test(x))) {
    const id = f
      .split(sep)
      .pop()!
      .replace(/\.mdx?$/, '');
    const it = toItem(f, 'public', section, `${BASE}/${section}/${id}/`);
    if (it && !DONE.has(it.status)) items.push(it);
  }
}
items.sort(
  (a, b) => a.section.localeCompare(b.section) || a.visibility.localeCompare(b.visibility) || a.title.localeCompare(b.title),
);

// ---------- encrypt (only when the content or password changed) ----------
const payload = JSON.stringify({ items });
const fingerprint = createHash('sha256').update(payload).update('\0').update(password).digest('hex');
if (existsSync(OUT) && existsSync(HASH_FILE) && readFileSync(HASH_FILE, 'utf8').trim() === fingerprint) {
  console.info(`vault: unchanged (${items.length} items) — kept src/data/vault.enc.json`);
  process.exit(0);
}
const { subtle } = webcrypto;
const salt = randomBytes(16);
const iv = randomBytes(12);
const baseKey = await subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await subtle.deriveKey(
  { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS },
  baseKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt'],
);
const ct = Buffer.from(
  await subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(JSON.stringify({ generatedAt: new Date().toISOString(), items })),
  ),
);
writeFileSync(
  OUT,
  `${JSON.stringify({ v: 1, kdf: 'PBKDF2-SHA256', iterations: ITERATIONS, cipher: 'AES-256-GCM', salt: salt.toString('base64'), iv: iv.toString('base64'), data: ct.toString('base64') }, null, 2)}\n`,
);
writeFileSync(HASH_FILE, `${fingerprint}\n`);
console.info(
  `vault: encrypted ${items.length} items (${items.filter((i) => i.visibility === 'private').length} private, ${items.filter((i) => i.visibility === 'public').length} public in progress) → src/data/vault.enc.json`,
);
