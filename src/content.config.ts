/**
 * Content model — docs/SPEC.md §3. Astro 7 content layer (glob loader, Zod 4 via astro/zod).
 * Objects are .strict(): unknown keys fail validation, as do unknown enum values,
 * broken references, and summaries over 280 characters.
 */
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { existsSync, readdirSync } from 'node:fs';

/**
 * glob() for folders that may be empty (videos, notes, talks…). An empty folder gets an
 * empty inline loader, so the build has no "No files found" warnings. After adding the
 * first file to an empty folder, restart `npm run dev`.
 */
function contentGlob(base: string, pattern = '**/*.{md,mdx}') {
  const ext = /\.(mdx?|ya?ml|json)$/;
  const has = existsSync(base) && readdirSync(base, { recursive: true }).some((f) => ext.test(String(f)));
  return has ? glob({ pattern, base }) : () => [];
}

// ---------- shared ----------
const PLACEHOLDER = z.string().regex(/^TODO\(muja\):\s*\S/, 'Placeholder must look like "TODO(muja): what is needed"');

/** Partial date: "2026", "2026-04" or "2026-04-15". We never invent a month or day. */
const partialDate = z
  .union([z.string(), z.number(), z.date()])
  .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v)))
  .pipe(z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'Use YYYY, YYYY-MM or YYYY-MM-DD'));
const dateOrTodo = z.union([PLACEHOLDER, partialDate]);

const todoable = <T extends z.ZodType>(schema: T) => z.union([PLACEHOLDER, schema]);

export const statusEnum = z.enum([
  'published',
  'accepted',
  'under-review',
  'in-preparation',
  'in-progress',
  'prototype',
  'concept',
  'archived',
]);
export const areaEnum = z.enum([
  'xai',
  'machine-learning',
  'continual-learning',
  'quantum-computing',
  'quantum-networking',
  'quantum-sensing',
  'medical-ai',
  'computational-biology',
  'neuromorphic',
  'cognitive-science',
  'cryptography',
  'optimization',
  'hci',
  'systems',
]);
const kebab = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Tags must be kebab-case');
const url = todoable(z.url());
const summary = z.string().min(1).max(280, 'summary must be ≤ 280 characters');

/** A claim with the place it comes from ("Paper §4.2, Table 3" or a URL). */
const sourced = z.object({ text: z.string().min(1), source: z.string().min(1) }).strict();
/** A headline figure for the "by the numbers" panel. Value as written (e.g. "1,886 B"); always sourced. */
const stat = z.object({ value: z.string().min(1).max(14), label: z.string().min(1).max(90), source: z.string().min(1) }).strict();

const explainer = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    dim: z.enum(['2d', '3d']),
    title: z.string(),
    caption: z.string(),
    verified: z.boolean().default(false),
  })
  .strict();

// ---------- collections ----------
const research = defineCollection({
  loader: contentGlob('./src/content/research', '**/*.{md,mdx}'),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        summary: z.union([PLACEHOLDER, summary]),
        status: statusEnum,
        kind: z.enum(['journal-article', 'conference-paper', 'preprint', 'technical-report', 'thesis', 'study']),
        doi: z
          .string()
          .regex(/^10\.\d{4,9}\/\S+$/)
          .optional(),
        venue: todoable(z.string()).optional(),
        /** Journal quartile, e.g. Q1 — shown on the journal badge (source: Muja's CV). */
        quartile: z.enum(['Q1', 'Q2', 'Q3', 'Q4']).optional(),
        year: z.number().int().min(2000).max(2100).optional(),
        authors: z.array(z.string()).optional(),
        myRole: todoable(z.string().min(1)),
        advisor: z.string().optional(),
        areas: z.array(areaEnum).min(1),
        tags: z.array(kebab).default([]),
        date: dateOrTodo,
        links: z
          .object({ paper: url, preprint: url, pdf: url, code: url, data: url, slides: url, poster: url, arxiv: url })
          .partial()
          .strict()
          .default({}),
        cover: image().optional(),
        coverAlt: z.string().optional(),
        keyFindings: z.array(sourced).default([]),
        stats: z.array(stat).max(4).default([]),
        limitations: z.array(z.string().min(1)).default([]),
        explainers: z.array(explainer).default([]),
        featured: z.boolean().default(false),
        private: z.boolean().default(false),
      })
      .strict(),
});

const projects = defineCollection({
  loader: contentGlob('./src/content/projects', '**/*.{md,mdx}'),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        summary: z.union([PLACEHOLDER, summary]),
        status: statusEnum,
        category: z.enum(['software', 'mobile-app', 'hardware', 'research-tool', 'education', 'competition', 'platform']),
        stack: z.array(z.string()).default([]),
        role: todoable(z.string().min(1)),
        period: z.object({ start: dateOrTodo, end: dateOrTodo.optional() }).strict(),
        links: z.object({ repo: url, live: url, demo: url, store: url, report: url }).partial().strict().default({}),
        /** If the project lives on another site, its card links there. */
        external: z.boolean().default(false),
        repo: z
          .string()
          .regex(/^[\w.-]+\/[\w.-]+$/)
          .optional(),
        highlights: z.array(sourced).default([]),
        stats: z.array(stat).max(4).default([]),
        learned: z.array(z.string().min(1)).default([]),
        relatedResearch: z.array(reference('research')).default([]),
        explainers: z.array(explainer).default([]),
        cover: image().optional(),
        coverAlt: z.string().optional(),
        areas: z.array(areaEnum).min(1),
        tags: z.array(kebab).default([]),
        featured: z.boolean().default(false),
        private: z.boolean().default(false),
      })
      .strict(),
});

/** Publications without their own research page (rare; most come from `research` with a DOI). */
const publications = defineCollection({
  loader: contentGlob('./src/content/publications', '**/*.{yaml,yml,json}'),
  schema: z
    .object({
      doi: z.string().regex(/^10\.\d{4,9}\/\S+$/),
      title: z.string().optional(),
      status: statusEnum,
      research: reference('research').optional(),
      private: z.boolean().default(false),
    })
    .strict(),
});

const education = defineCollection({
  loader: contentGlob('./src/content/education', '**/*.{md,mdx,yaml}'),
  schema: z
    .object({
      institution: z.string(),
      degree: z.string(),
      major: z.string(),
      start: dateOrTodo,
      expectedEnd: dateOrTodo.optional(),
      end: dateOrTodo.optional(),
      location: z.string(),
      coursework: z.array(z.string()).default([]),
      honours: z.array(z.string()).default([]),
      /** Private by default — shown only if Muja opts in (inventory §1). */
      gpa: z
        .object({ value: z.string(), public: z.boolean().default(false) })
        .strict()
        .optional(),
      private: z.boolean().default(false),
    })
    .strict(),
});

const experience = defineCollection({
  loader: contentGlob('./src/content/experience', '**/*.{md,mdx}'),
  schema: z
    .object({
      role: z.string(),
      org: z.string(),
      type: z.enum(['ta', 'sa', 'research', 'internship', 'leadership', 'other']),
      start: dateOrTodo,
      end: dateOrTodo.optional(),
      supervisor: z.string().optional(),
      /** Public profile of the supervisor (evidence for the role). */
      supervisorUrl: z.url().optional(),
      course: z.string().optional(),
      description: z.union([PLACEHOLDER, z.string().min(1)]),
      tags: z.array(kebab).default([]),
      private: z.boolean().default(false),
    })
    .strict(),
});

const awards = defineCollection({
  loader: contentGlob('./src/content/awards', '**/*.{md,mdx}'),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        issuer: z.string(),
        date: dateOrTodo,
        rank: z.string().optional(),
        category: z.enum(['competition', 'academic', 'research', 'sports', 'other']),
        description: z.union([PLACEHOLDER, z.string().min(1)]),
        evidenceUrl: url.optional(),
        photos: z.array(z.object({ src: image(), alt: z.string().min(1) }).strict()).default([]),
        related: z.array(z.object({ collection: z.enum(['research', 'projects']), id: z.string() }).strict()).default([]),
        tags: z.array(kebab).default([]),
        private: z.boolean().default(false),
      })
      .strict(),
});

const sports = defineCollection({
  loader: contentGlob('./src/content/sports', '**/*.{md,mdx}'),
  schema: ({ image }) =>
    z
      .object({
        team: z.string(),
        sport: z.string(),
        org: z.string(),
        leagues: z.array(z.string()).default([]),
        start: dateOrTodo,
        end: dateOrTodo.optional(),
        position: todoable(z.string()).optional(),
        highlights: z.array(sourced).default([]),
        photos: z.array(z.object({ src: image(), alt: z.string().min(1) }).strict()).default([]),
        videos: z.array(reference('videos')).default([]),
        private: z.boolean().default(false),
      })
      .strict(),
});

const videos = defineCollection({
  loader: contentGlob('./src/content/videos', '**/*.{md,mdx}'),
  schema: z
    .object({
      title: z.string(),
      provider: z.literal('youtube'),
      videoId: z.string().regex(/^[\w-]{11}$/, 'YouTube IDs are 11 characters'),
      date: partialDate,
      category: z.enum(['sports', 'talk', 'demo', 'explainer']),
      description: z.string().min(1),
      related: z
        .array(z.object({ collection: z.enum(['research', 'projects', 'sports', 'awards', 'notes']), slug: z.string() }).strict())
        .default([]),
      start: z.number().int().nonnegative().optional(),
      tags: z.array(kebab).default([]),
      private: z.boolean().default(false),
    })
    .strict(),
});

const talks = defineCollection({
  loader: contentGlob('./src/content/talks', '**/*.{md,mdx}'),
  schema: z
    .object({
      title: z.string(),
      event: z.string(),
      date: partialDate,
      location: z.string().optional(),
      slides: z.url().optional(),
      video: reference('videos').optional(),
      research: reference('research').optional(),
      private: z.boolean().default(false),
    })
    .strict(),
});

const notes = defineCollection({
  loader: contentGlob('./src/content/notes', '**/*.{md,mdx}'),
  schema: z
    .object({
      title: z.string(),
      date: partialDate,
      summary,
      tags: z.array(kebab).default([]),
      draft: z.boolean().default(false),
    })
    .strict(),
});

export const collections = { research, projects, publications, education, experience, awards, sports, videos, talks, notes };
