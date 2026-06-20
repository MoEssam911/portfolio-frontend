<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { extractErrorMessage } from '~/core/api/errors';
import { loginSchema } from '~/modules/dashboard/schema';
import type { LoginCredentials } from '~/modules/dashboard/types';

definePageMeta({
  layout: 'dashboard-auth',
  middleware: 'guest',
});

useHead({ title: 'Sign in · Dashboard' });

const { login } = useAuth();
const route = useRoute();

const formError = ref<string | null>(null);

/**
 * Where to land after sign-in. Honor a `?redirect=` set by the auth middleware or
 * the session guard, but only if it's a same-origin dashboard path (never the
 * login page) — guards against open-redirect via a crafted query string.
 */
function resolveRedirect(): string {
  const target = route.query.redirect;
  const path = Array.isArray(target) ? target[0] : target;
  if (
    typeof path === 'string' &&
    path.startsWith('/dashboard') &&
    !path.startsWith('/dashboard/login')
  ) {
    return path;
  }
  return '/dashboard';
}

const { handleSubmit, defineField, errors, isSubmitting } = useForm<LoginCredentials>({
  validationSchema: toTypedSchema(loginSchema),
});

const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');

const onSubmit = handleSubmit(async (values) => {
  formError.value = null;
  try {
    await login(values);
    await navigateTo(resolveRedirect());
  } catch (e) {
    const err = e as { status?: number; statusCode?: number };
    const status = err.statusCode ?? err.status;
    formError.value =
      status === 401
        ? 'Invalid email or password.'
        : extractErrorMessage(e) || 'Could not sign in. Please try again.';
  }
});
</script>

<template>
  <div class="rounded-3xl border border-border bg-card p-6 sm:p-8">
    <div class="mb-6 flex flex-col gap-1.5">
      <h1 class="font-display text-2xl text-foreground">Sign in</h1>
      <p class="text-sm text-muted-foreground">Enter your credentials to access the dashboard.</p>
    </div>

    <form class="flex flex-col gap-5" novalidate @submit="onSubmit">
      <p
        v-if="formError"
        class="rounded-lg border border-destructive/40 bg-destructive-muted px-3 py-2 text-sm text-destructive-muted-foreground"
        role="alert"
      >
        {{ formError }}
      </p>

      <div class="flex flex-col gap-2">
        <Label for="login-email">Email</Label>
        <Input
          id="login-email"
          v-model="email"
          v-bind="emailAttrs"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          class="h-10"
          :aria-invalid="Boolean(errors.email) || undefined"
          :aria-describedby="errors.email ? 'login-email-error' : undefined"
        />
        <p v-if="errors.email" id="login-email-error" class="text-sm text-destructive">
          {{ errors.email }}
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <Label for="login-password">Password</Label>
        <Input
          id="login-password"
          v-model="password"
          v-bind="passwordAttrs"
          type="password"
          autocomplete="current-password"
          placeholder="••••••••"
          class="h-10"
          :aria-invalid="Boolean(errors.password) || undefined"
          :aria-describedby="errors.password ? 'login-password-error' : undefined"
        />
        <p v-if="errors.password" id="login-password-error" class="text-sm text-destructive">
          {{ errors.password }}
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        :disabled="isSubmitting"
        :class="cn('h-11 px-6 shadow-cta', isSubmitting && 'opacity-80')"
      >
        <Icon
          :name="isSubmitting ? 'lucide:loader-circle' : 'lucide:log-in'"
          :class="cn('size-4', isSubmitting && 'animate-spin')"
        />
        {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
      </Button>
    </form>
  </div>
</template>
