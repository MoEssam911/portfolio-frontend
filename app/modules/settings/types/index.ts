export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  about: string;
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  contactEmail: string;
  resumeFileUrl: string | null;
  availableForWork: boolean;
}

/**
 * Write payload for the dashboard settings upsert (`PATCH /dashboard/settings`).
 * Mirrors the backend `UpdateSettingsDto` — every field optional (the backend
 * whitelists keys with `forbidNonWhitelisted`). Nullable URL fields are sent as
 * `null` to clear them; `contactEmail` is required in the DB so it is never sent
 * empty (omitted instead).
 */
export interface SettingsInput {
  siteTitle?: string;
  siteDescription?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  about?: string;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  contactEmail?: string;
  resumeFileUrl?: string | null;
  availableForWork?: boolean;
}
