/**
 * Collects every "TODO(muja): …" in src/ (content, pages, components), prints them,
 * and rewrites the auto-generated part of TODO-MUJA.md (SPEC §7).
 * Run: node scripts/todos.ts   (also runs before every build)
 */
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const MARK = '<!-- AUTO-GENERATED BELOW — scripts/todos.ts rewrites everything under this line -->';
const SKIP = new Set(['node_modules', 'data', '.astro']);
const SKIP_FILES = new Set(['src/lib/todo.ts', 'src/components/Todo.astro', 'src/content.config.ts']);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    if (SKIP.has(n)) return [];
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

type Item = { file: string; line: number; text: string; private: boolean };
const items: Item[] = [];
const privateDir = join(ROOT, 'private');
const roots = [join(ROOT, 'src'), ...(existsSync(privateDir) ? [privateDir] : [])];
for (const f of roots.flatMap(walk).filter((x) => /\.(mdx?|astro|ts|tsx|ya?ml|json)$/.test(x))) {
  const rel = relative(ROOT, f).split(sep).join('/');
  if (SKIP_FILES.has(rel)) continue;
  const src = readFileSync(f, 'utf8');
  const isPrivate = rel.startsWith('private/') || /^private:\s*true\s*$/m.test(src);
  src.split('\n').forEach((line, i) => {
    // <Todo>text</Todo> in MDX, or "TODO(muja): text" in frontmatter/strings
    for (const m of line.matchAll(/<Todo[^>]*>([^<]+)<\/Todo>/g))
      items.push({ file: rel, line: i + 1, text: m[1]!.trim(), private: isPrivate });
    for (const m of line.matchAll(/TODO\(muja\):\s*([^'"<`\n]+)/g))
      items.push({ file: rel, line: i + 1, text: m[1]!.trim(), private: isPrivate });
  });
}

const byFile = new Map<string, Item[]>();
for (const it of items) byFile.set(it.file, [...(byFile.get(it.file) ?? []), it]);
const pub = [...byFile].filter(([, v]) => !v[0]!.private);
const priv = [...byFile].filter(([, v]) => v[0]!.private);
const section = (title: string, groups: [string, Item[]][]) =>
  [
    `### ${title}`,
    '',
    ...groups.flatMap(([file, list]) => [`- **${file}**`, ...list.map((i) => `  - [ ] ${i.text} (line ${i.line})`)]),
    '',
  ].join('\n');

const auto = [
  '',
  `## Placeholders found in content (${items.length})`,
  '',
  `_Generated ${new Date().toISOString().slice(0, 10)} by \`scripts/todos.ts\`. In production builds each of these elements is hidden._`,
  '',
  section(`Public pages (${pub.reduce((n, [, v]) => n + v.length, 0)})`, pub),
  section(`Private entries — not built (${priv.reduce((n, [, v]) => n + v.length, 0)})`, priv),
].join('\n');

const file = join(ROOT, 'TODO-MUJA.md');
const current = existsSync(file) ? readFileSync(file, 'utf8') : `# TODO — things only Muja can provide\n\n${MARK}\n`;
const head = current.includes(MARK) ? current.slice(0, current.indexOf(MARK) + MARK.length) : `${current.trimEnd()}\n\n${MARK}`;
writeFileSync(file, `${head}\n${auto}`);

console.info(
  `todos: ${items.length} TODO(muja) placeholders (${pub.reduce((n, [, v]) => n + v.length, 0)} on public pages) — see TODO-MUJA.md`,
);
if (process.argv.includes('--list'))
  for (const it of items.filter((i) => !i.private)) console.info(`  ${it.file}:${it.line}  ${it.text}`);
