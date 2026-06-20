/**
 * POST /api/auth/login — BFF login.
 *
 * Validates the body, forwards credentials to the backend, and on success stores
 * the returned access + refresh tokens in httpOnly cookies. Only `{ user }` is
 * ever returned to the browser — the tokens never cross back over the wire.
 */
import { z } from 'zod';

import type { AuthUser } from '../../utils/bff';
import { forwardFetchError, internalApiBase, setAuthCookies, wireError } from '../../utils/bff';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

interface LoginResponse {
  success: true;
  data: { accessToken: string; refreshToken: string; user: AuthUser };
}

export default defineEventHandler(async (event) => {
  const parsed = loginSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    return wireError(
      event,
      400,
      'Validation failed',
      parsed.error.issues.map((i) => i.message),
    );
  }

  try {
    const res = await $fetch<LoginResponse>(`${internalApiBase()}/auth/login`, {
      method: 'POST',
      body: parsed.data,
    });

    const { accessToken, refreshToken, user } = res.data;
    setAuthCookies(event, { accessToken, refreshToken });

    return { success: true as const, data: { user } };
  } catch (error) {
    return forwardFetchError(event, error);
  }
});
