<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ContactPayload } from '~/modules/contact/schema';
import { contactSchema } from '~/modules/contact/schema';

const toast = useToast();

const submitted = ref(false);

// Shared glass field styling — `peer` drives the floating label, neon focus ring.
const fieldClass =
  'peer h-14 rounded-xl border-border bg-glass px-3.5 pt-5 pb-1 placeholder:text-transparent transition-shadow focus-visible:border-primary focus-visible:shadow-(--shadow-neon-soft)';

const { handleSubmit, defineField, errors, isSubmitting, resetForm } = useForm<ContactPayload>({
  validationSchema: toTypedSchema(contactSchema),
});

const [name, nameAttrs] = defineField('name');
const [email, emailAttrs] = defineField('email');
const [subject, subjectAttrs] = defineField('subject');
const [message, messageAttrs] = defineField('message');

const onSubmit = handleSubmit(async (values) => {
  try {
    const body = new URLSearchParams({
      'form-name': 'contact',
      name: values.name,
      email: values.email,
      subject: values.subject,
      message: values.message,
    });
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (res.ok) {
      submitted.value = true;
      resetForm();
    } else {
      toast.error('Message not sent', 'Please try again or email me directly.');
    }
  } catch {
    toast.error('Message not sent', 'Something went wrong. Please try again.');
  }
});

function reset() {
  submitted.value = false;
  resetForm();
}
</script>

<template>
  <div class="glass-surface-strong relative overflow-hidden rounded-3xl p-6 sm:p-8">
    <!-- Success state — neon glow burst + confirmation. -->
    <div v-if="submitted" class="flex flex-col items-center gap-4 py-10 text-center">
      <div
        class="success-icon relative flex size-16 items-center justify-center rounded-2xl bg-primary-muted text-primary shadow-(--shadow-neon)"
      >
        <span class="success-burst absolute inset-0 rounded-2xl" aria-hidden="true" />
        <span
          class="success-burst success-burst--delayed absolute inset-0 rounded-2xl"
          aria-hidden="true"
        />
        <Icon name="lucide:check" class="relative size-8" />
      </div>
      <h3 class="font-display text-2xl text-foreground">Message sent</h3>
      <p class="max-w-sm text-pretty text-muted-foreground">
        Thanks for reaching out — I read every message and usually reply within a day or two.
      </p>
      <Button variant="outline" class="neon-glow mt-2 h-11 px-5" @click="reset">
        <Icon name="lucide:rotate-ccw" class="size-4" />
        Send another
      </Button>
    </div>

    <!-- Form -->
    <form
      v-else
      name="contact"
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      class="flex flex-col gap-5"
      novalidate
      @submit="onSubmit"
    >
      <input type="hidden" name="form-name" value="contact" />
      <p class="hidden" aria-hidden="true">
        <label>
          Don’t fill this out:
          <input name="bot-field" tabindex="-1" autocomplete="off" />
        </label>
      </p>
      <div class="grid gap-5 sm:grid-cols-2">
        <div class="relative">
          <Input
            id="contact-name"
            v-model="name"
            v-bind="nameAttrs"
            type="text"
            autocomplete="name"
            placeholder=" "
            :class="fieldClass"
            :aria-invalid="Boolean(errors.name) || undefined"
            :aria-describedby="errors.name ? 'contact-name-error' : undefined"
          />
          <Label for="contact-name" class="floating-label">Name</Label>
          <p v-if="errors.name" id="contact-name-error" class="mt-1.5 text-sm text-destructive">
            {{ errors.name }}
          </p>
        </div>

        <div class="relative">
          <Input
            id="contact-email"
            v-model="email"
            v-bind="emailAttrs"
            type="email"
            autocomplete="email"
            placeholder=" "
            :class="fieldClass"
            :aria-invalid="Boolean(errors.email) || undefined"
            :aria-describedby="errors.email ? 'contact-email-error' : undefined"
          />
          <Label for="contact-email" class="floating-label">Email</Label>
          <p v-if="errors.email" id="contact-email-error" class="mt-1.5 text-sm text-destructive">
            {{ errors.email }}
          </p>
        </div>
      </div>

      <div class="relative">
        <Input
          id="contact-subject"
          v-model="subject"
          v-bind="subjectAttrs"
          type="text"
          placeholder=" "
          :class="fieldClass"
          :aria-invalid="Boolean(errors.subject) || undefined"
          :aria-describedby="errors.subject ? 'contact-subject-error' : undefined"
        />
        <Label for="contact-subject" class="floating-label">Subject</Label>
        <p v-if="errors.subject" id="contact-subject-error" class="mt-1.5 text-sm text-destructive">
          {{ errors.subject }}
        </p>
      </div>

      <div class="relative">
        <Textarea
          id="contact-message"
          v-model="message"
          v-bind="messageAttrs"
          rows="6"
          placeholder=" "
          class="peer min-h-40 rounded-xl border-border bg-glass px-3.5 pt-7 pb-2 placeholder:text-transparent transition-shadow focus-visible:border-primary focus-visible:shadow-(--shadow-neon-soft)"
          :aria-invalid="Boolean(errors.message) || undefined"
          :aria-describedby="errors.message ? 'contact-message-error' : undefined"
        />
        <Label for="contact-message" class="floating-label floating-label--textarea">Message</Label>
        <p v-if="errors.message" id="contact-message-error" class="mt-1.5 text-sm text-destructive">
          {{ errors.message }}
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        :disabled="isSubmitting"
        :class="cn('neon-glow h-12 px-6 shadow-cta', isSubmitting && 'opacity-80')"
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

<style scoped>
/* Inset floating label — sits over the glass field, floats up on focus / when filled. */
.floating-label {
  position: absolute;
  left: 0.875rem;
  top: 1.75rem;
  transform: translateY(-50%);
  font-size: var(--text-sm);
  color: var(--color-muted-foreground);
  pointer-events: none;
  transition: all 0.2s var(--ease-out);
}
.floating-label--textarea {
  top: 1.4rem;
  transform: none;
}
.peer:focus ~ .floating-label,
.peer:not(:placeholder-shown) ~ .floating-label {
  top: 0.55rem;
  transform: translateY(0);
  font-size: var(--text-xs);
  color: var(--color-primary-light);
}

/* Success — icon spring-in + expanding neon rings. */
.success-icon {
  animation: success-pop 0.5s var(--ease-spring) both;
}
.success-burst {
  border: 2px solid var(--color-primary);
  opacity: 0;
  animation: success-burst 0.9s var(--ease-out) 0.15s forwards;
}
.success-burst--delayed {
  animation-delay: 0.4s;
}
@keyframes success-pop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
@keyframes success-burst {
  0% {
    opacity: 0.7;
    transform: scale(0.65);
  }
  100% {
    opacity: 0;
    transform: scale(1.9);
  }
}

@media (prefers-reduced-motion: reduce) {
  .floating-label {
    transition: none;
  }
  .success-icon {
    animation: none;
  }
  .success-burst {
    animation: none;
    opacity: 0;
  }
}
</style>
