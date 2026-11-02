import { getPublic, getResearch } from './content';
import { entryPath } from './paths';

export type TopicItem = { href: string; title: string; summary?: string | undefined; kind: string; tags: string[] };

export async function allTopicItems(): Promise<TopicItem[]> {
  const research = (await getResearch()).map((e) => ({
    href: entryPath(e),
    title: e.data.title,
    summary: e.data.summary,
    kind: 'Research',
    tags: e.data.tags,
  }));
  const projects = (await getPublic('projects')).map((e) => ({
    href: entryPath(e),
    title: e.data.title,
    summary: e.data.summary,
    kind: 'Project',
    tags: e.data.tags,
  }));
  const notes = (await getPublic('notes')).map((e) => ({
    href: entryPath(e),
    title: e.data.title,
    summary: e.data.summary,
    kind: 'Note',
    tags: e.data.tags,
  }));
  const videos = (await getPublic('videos')).map((e) => ({
    href: entryPath(e),
    title: e.data.title,
    summary: e.data.description,
    kind: 'Video',
    tags: e.data.tags,
  }));
  const exp = (await getPublic('experience')).map((e) => ({
    href: entryPath(e),
    title: e.data.course ? `${e.data.role} — ${e.data.course}` : e.data.role,
    kind: 'Experience',
    tags: e.data.tags,
  }));
  const awards = (await getPublic('awards')).map((e) => ({
    href: entryPath(e),
    title: e.data.title,
    kind: 'Achievement',
    tags: e.data.tags,
  }));
  return [...research, ...projects, ...notes, ...videos, ...exp, ...awards];
}
