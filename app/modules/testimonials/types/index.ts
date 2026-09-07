export interface Testimonial {
  name: string;
  role: string;
  company: string | null;
  quote: string;
  avatarUrl: string | null;
  featured: boolean;
  order: number;
}
