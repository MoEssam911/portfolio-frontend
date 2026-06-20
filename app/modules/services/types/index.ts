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

/**
 * The admin write payload — mirrors the backend Create/UpdateServiceDto exactly
 * (only these whitelisted keys may be sent; the backend uses
 * `forbidNonWhitelisted`). Empty optionals (`priceRange`/`icon`) are sent as
 * `null` to clear them. `order` is NOT part of this payload — position is managed
 * exclusively through the dedicated `PATCH /services/reorder` endpoint.
 */
export interface ServiceInput {
  title: string;
  description: string;
  priceRange: string | null;
  icon: string | null;
  featured: boolean;
  published: boolean;
}
