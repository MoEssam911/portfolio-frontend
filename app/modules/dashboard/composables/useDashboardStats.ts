import { useAdminApiFetch } from '~/modules/dashboard/composables/useAdminApi';
import type { PaginationMeta } from '~/shared/types/api';

/** A publishable row as seen by the Overview — only the fields we summarize. */
interface OverviewRow {
  id?: string;
  slug?: string;
  title?: string;
  name?: string;
  published?: boolean;
  updatedAt?: string;
}

interface OverviewEnvelope {
  success: true;
  data: OverviewRow[];
  meta?: PaginationMeta;
}

export interface StatCard {
  key: string;
  label: string;
  icon: string;
  to: string;
  total: number;
  published: number;
  draft: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  resource: string;
  icon: string;
  to: string;
  updatedAt: string;
  published: boolean;
}

const RESERVED_LIMIT = 100;

/**
 * useDashboardStats — the Overview's data. Reads each summarizable resource list
 * once (client-only, via the BFF) and derives published/draft counts + a merged
 * recent-activity feed. All four reads run in parallel; `pending`/`error` are the
 * union across them.
 */
export function useDashboardStats() {
  const projects = useAdminApiFetch<OverviewEnvelope, OverviewEnvelope | null>('/projects', {
    key: 'overview-projects',
    query: { limit: RESERVED_LIMIT },
    transform: (res) => res,
    getCachedData: undefined,
    default: () => null,
    server: false,
  });

  const blogs = useAdminApiFetch<OverviewEnvelope, OverviewEnvelope | null>('/blogs', {
    key: 'overview-blogs',
    query: { limit: RESERVED_LIMIT },
    transform: (res) => res,
    getCachedData: undefined,
    default: () => null,
    server: false,
  });

  const services = useAdminApiFetch<OverviewEnvelope, OverviewEnvelope | null>('/services', {
    key: 'overview-services',
    transform: (res) => res,
    getCachedData: undefined,
    default: () => null,
    server: false,
  });

  const testimonials = useAdminApiFetch<OverviewEnvelope, OverviewEnvelope | null>(
    '/testimonials',
    {
      key: 'overview-testimonials',
      transform: (res) => res,
      getCachedData: undefined,
      default: () => null,
      server: false,
    },
  );

  function summarize(
    env: OverviewEnvelope | null,
    meta: { key: string; label: string; icon: string; to: string },
  ): StatCard {
    const rows = env?.data ?? [];
    const published = rows.filter((r) => r.published).length;
    const total = env?.meta?.total ?? rows.length;
    return {
      ...meta,
      total,
      published,
      // When the list is paginated and longer than one page, infer drafts from
      // the reported total; otherwise count directly.
      draft: env?.meta ? total - published : rows.length - published,
    };
  }

  const stats = computed<StatCard[]>(() => [
    summarize(projects.data.value, {
      key: 'projects',
      label: 'Projects',
      icon: 'lucide:folder-git-2',
      to: '/dashboard/projects',
    }),
    summarize(blogs.data.value, {
      key: 'blog',
      label: 'Blog posts',
      icon: 'lucide:newspaper',
      to: '/dashboard/blog',
    }),
    summarize(services.data.value, {
      key: 'services',
      label: 'Services',
      icon: 'lucide:wrench',
      to: '/dashboard/services',
    }),
    summarize(testimonials.data.value, {
      key: 'testimonials',
      label: 'Testimonials',
      icon: 'lucide:quote',
      to: '/dashboard/testimonials',
    }),
  ]);

  const recent = computed<ActivityItem[]>(() => {
    const fromProjects = (projects.data.value?.data ?? []).map<ActivityItem>((r) => ({
      id: r.id ?? r.slug ?? r.title ?? '',
      title: r.title ?? 'Untitled project',
      resource: 'Project',
      icon: 'lucide:folder-git-2',
      to: '/dashboard/projects',
      updatedAt: r.updatedAt ?? '',
      published: Boolean(r.published),
    }));
    const fromBlogs = (blogs.data.value?.data ?? []).map<ActivityItem>((r) => ({
      id: r.id ?? r.slug ?? r.title ?? '',
      title: r.title ?? 'Untitled post',
      resource: 'Blog post',
      icon: 'lucide:newspaper',
      to: '/dashboard/blog',
      updatedAt: r.updatedAt ?? '',
      published: Boolean(r.published),
    }));
    return [...fromProjects, ...fromBlogs]
      .filter((a) => a.updatedAt)
      .sort((a, b) => Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt)))
      .slice(0, 6);
  });

  const pending = computed(
    () =>
      projects.pending.value ||
      blogs.pending.value ||
      services.pending.value ||
      testimonials.pending.value,
  );

  const error = computed(
    () =>
      projects.error.value ||
      blogs.error.value ||
      services.error.value ||
      testimonials.error.value ||
      null,
  );

  async function refresh() {
    await Promise.all([
      projects.refresh(),
      blogs.refresh(),
      services.refresh(),
      testimonials.refresh(),
    ]);
  }

  return { stats, recent, pending, error, refresh };
}
