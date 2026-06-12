export interface Service {
  id: string;
  title: string;
  description: string;
  priceRange: string | null;
  icon: string | null;
  featured: boolean;
  published: boolean;
  order: number;
}
