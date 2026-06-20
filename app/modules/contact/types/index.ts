/**
 * A persisted contact-form submission, as returned by the read-only dashboard
 * inbox (`GET /dashboard/messages`). The backend persists every submission with
 * a `delivered` flag (whether the notification email went out) and a `read` flag
 * toggled from the dashboard. `ContactMessage` is a global single-owner table —
 * there is no `userId` and no `updatedAt`.
 */
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  delivered: boolean;
  read: boolean;
  createdAt: string;
}

/** Write payload for `PATCH /dashboard/messages/:id` — only the read flag is mutable. */
export interface ContactMessageInput {
  read?: boolean;
}
