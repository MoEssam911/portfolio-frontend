export interface BlogSource {
  title: string;
  url: string;
  publisher?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  coverUrl: string | null;
  publishedAt: string;
  updatedAt: string;
  sources?: BlogSource[];
  featured?: boolean;
  draft?: boolean;
}
