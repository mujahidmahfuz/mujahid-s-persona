import type { APIRoute, GetStaticPaths } from 'astro';
import { getPublic, getResearch, KIND_LABEL, CATEGORY_LABEL } from '~/lib/content';
import { ogImage } from '~/lib/og';
import { SITE } from '~/lib/site';

type Props = { eyebrow: string; title: string; footer: string };

export const getStaticPaths = (async () => {
  const research = (await getResearch()).map((r) => ({
    params: { slug: `research/${r.id}` },
    props: {
      eyebrow: `Research · ${KIND_LABEL[r.data.kind]}`,
      title: r.data.title,
      footer: [r.cite.venue, r.cite.year].filter(Boolean).join(' · ') || SITE.university,
    },
  }));
  const projects = (await getPublic('projects')).map((p) => ({
    params: { slug: `projects/${p.id}` },
    props: {
      eyebrow: `Project · ${CATEGORY_LABEL[p.data.category]}`,
      title: p.data.title,
      footer: p.data.stack.slice(0, 4).join(' · ') || SITE.university,
    },
  }));
  return [
    {
      params: { slug: 'default' },
      props: {
        eyebrow: 'Undergraduate researcher',
        title: 'Machine learning, explainable AI and quantum computing',
        footer: SITE.university,
      },
    },
    ...research,
    ...projects,
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute<Props> = async ({ props }) =>
  new Response(new Uint8Array(await ogImage(props)), { headers: { 'Content-Type': 'image/png' } });
