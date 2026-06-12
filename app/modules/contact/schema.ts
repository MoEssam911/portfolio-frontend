import { z } from 'zod';

/**
 * Client-side contact payload schema used by the form (vee-validate via
 * `toTypedSchema`). Mirrors the backend `CreateContactDto` validation — the
 * NestJS `/api/v1/contact` endpoint is the authoritative validator.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please tell me your name.')
    .max(100, 'That name is a little long.'),
  email: z
    .string()
    .trim()
    .min(1, 'An email lets me reply.')
    .email('Enter a valid email address.')
    .max(200),
  subject: z
    .string()
    .trim()
    .min(3, 'Add a short subject.')
    .max(150, 'Keep the subject under 150 characters.'),
  message: z
    .string()
    .trim()
    .min(10, 'Tell me a bit more — at least 10 characters.')
    .max(5000, 'That message is over the 5,000-character limit.'),
});

export type ContactPayload = z.infer<typeof contactSchema>;
