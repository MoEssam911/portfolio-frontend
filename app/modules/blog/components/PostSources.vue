<script setup lang="ts">
import type { BlogSource } from '~/modules/blog/types';

interface Props {
  sources: BlogSource[];
}

defineProps<Props>();
</script>

<template>
  <section
    v-if="sources.length"
    aria-labelledby="post-references"
    class="glass-surface rounded-2xl p-6 sm:p-8"
  >
    <h2 id="post-references" class="font-display text-xl text-foreground sm:text-2xl">
      References
    </h2>
    <p class="mt-2 text-sm text-muted-foreground">
      Primary sources cited in this article. Open any link to read the original material.
    </p>

    <ol class="mt-6 flex flex-col gap-4">
      <li
        v-for="(source, index) in sources"
        :key="source.url"
        class="flex gap-4 border-t border-border pt-4 first:border-t-0 first:pt-0"
      >
        <span
          class="font-mono text-sm text-primary tabular-nums"
          aria-hidden="true"
        >
          {{ String(index + 1).padStart(2, '0') }}
        </span>
        <div class="min-w-0 flex-1">
          <p v-if="source.publisher" class="label mb-1.5 text-muted-foreground">
            {{ source.publisher }}
          </p>
          <a
            :href="source.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-start gap-1.5 text-pretty text-foreground transition-colors hover:text-primary"
          >
            <span>{{ source.title }}</span>
            <Icon name="lucide:arrow-up-right" class="mt-0.5 size-3.5 shrink-0 opacity-70" />
          </a>
        </div>
      </li>
    </ol>
  </section>
</template>
