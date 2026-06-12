<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ContactPayload } from '~/modules/contact/schema';
import { contactSchema } from '~/modules/contact/schema';

interface ContactResponse {
  success: boolean;
  data: { delivered: boolean };
}

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;

const { settings } = useSiteSettings();
const toast = useToast();

const submitted = ref(false);

const { handleSubmit, defineField, errors, isSubmitting, resetForm } = useForm<ContactPayload>({
  validationSchema: toTypedSchema(contactSchema),
});

const [name, nameAttrs] = defineField('name');
const [email, emailAttrs] = defineField('email');
const [subject, subjectAttrs] = defineField('subject');
const [message, messageAttrs] = defineField('message');

/** No mail service configured → hand off to the visitor's email client. */
function openMailto(values: ContactPayload) {
  const to = settings.value?.contactEmail?.trim();
  if (!to || !import.meta.client) return;
  const body = `${values.message}\n\n— ${values.name} (${values.email})`;
  window.location.href = `mailto:${to}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(body)}`;
}

const onSubmit = handleSubmit(async (values) => {
  try {
    const res = await $fetch<ContactResponse>(`${apiBase}/contact`, {
      method: 'POST',
      body: values,
    });
    if (res.data.delivered) {
      submitted.value = true;
      resetForm();
    } else {
      // Backend has no mailer configured → hand off to the visitor's email client.
      toast.info('Opening your email app', 'Send the pre-filled message to reach me directly.');
      openMailto(values);
    }
  } catch (e) {
    const err = e as { status?: number; statusCode?: number; data?: { message?: string } };
    const status = err.statusCode ?? err.status;
    toast.error(
      status === 429 ? 'Slow down a moment' : 'Message not sent',
      err.data?.message || 'Something went wrong. Please try again, or email me directly.',
    );
  }
});

function reset() {
  submitted.value = false;
  resetForm();
}
</script>

<template>
  <div class="rounded-3xl border border-border bg-card p-6 sm:p-8">
    <!-- Success state -->
    <div v-if="submitted" class="flex flex-col items-center gap-4 py-8 text-center">
      <span
        class="bg-success-muted flex size-14 items-center justify-center rounded-2xl text-success"
      >
        <Icon name="lucide:check" class="size-7" />
      </span>
      <h3 class="font-display text-2xl text-foreground">Message sent</h3>
      <p class="max-w-sm text-pretty text-muted-foreground">
        Thanks for reaching out — I read every message and usually reply within a day or two.
      </p>
      <Button variant="outline" class="mt-2 h-10 px-5" @click="reset">
        <Icon name="lucide:rotate-ccw" class="size-4" />
        Send another
      </Button>
    </div>

    <!-- Form -->
    <form v-else class="flex flex-col gap-5" novalidate @submit="onSubmit">
      <div class="grid gap-5 sm:grid-cols-2">
        <div class="flex flex-col gap-2">
          <Label for="contact-name">Name</Label>
          <Input
            id="contact-name"
            v-model="name"
            v-bind="nameAttrs"
            type="text"
            autocomplete="name"
            placeholder="Ada Lovelace"
            class="h-10"
            :aria-invalid="Boolean(errors.name) || undefined"
            :aria-describedby="errors.name ? 'contact-name-error' : undefined"
          />
          <p v-if="errors.name" id="contact-name-error" class="text-sm text-destructive">
            {{ errors.name }}
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <Label for="contact-email">Email</Label>
          <Input
            id="contact-email"
            v-model="email"
            v-bind="emailAttrs"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            class="h-10"
            :aria-invalid="Boolean(errors.email) || undefined"
            :aria-describedby="errors.email ? 'contact-email-error' : undefined"
          />
          <p v-if="errors.email" id="contact-email-error" class="text-sm text-destructive">
            {{ errors.email }}
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <Label for="contact-subject">Subject</Label>
        <Input
          id="contact-subject"
          v-model="subject"
          v-bind="subjectAttrs"
          type="text"
          placeholder="A new project, a question, a hello…"
          class="h-10"
          :aria-invalid="Boolean(errors.subject) || undefined"
          :aria-describedby="errors.subject ? 'contact-subject-error' : undefined"
        />
        <p v-if="errors.subject" id="contact-subject-error" class="text-sm text-destructive">
          {{ errors.subject }}
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <Label for="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          v-model="message"
          v-bind="messageAttrs"
          rows="6"
          placeholder="Tell me what you have in mind…"
          :aria-invalid="Boolean(errors.message) || undefined"
          :aria-describedby="errors.message ? 'contact-message-error' : undefined"
        />
        <p v-if="errors.message" id="contact-message-error" class="text-sm text-destructive">
          {{ errors.message }}
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        :disabled="isSubmitting"
        :class="cn('h-11 px-6 shadow-cta', isSubmitting && 'opacity-80')"
      >
        <Icon
          :name="isSubmitting ? 'lucide:loader-circle' : 'lucide:send'"
          :class="cn('size-4', isSubmitting && 'animate-spin')"
        />
        {{ isSubmitting ? 'Sending…' : 'Send message' }}
      </Button>
    </form>
  </div>
</template>
