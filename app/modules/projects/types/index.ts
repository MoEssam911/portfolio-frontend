export type ProjectType = 'personal' | 'professional';

export interface Project {
  slug: string;
  title: string;
  excerpt: string | null;
  description: string;
  projectType: ProjectType;
  role?: string;
  clientName?: string;
  technologies: string[];
  featured: boolean;
  thumbnailUrl: string | null;
  images: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
