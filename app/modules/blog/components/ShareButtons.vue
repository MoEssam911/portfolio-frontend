<script setup lang="ts">
interface Props {
  /** Absolute canonical URL of the post. */
  url: string;
  title: string;
}

const props = defineProps<Props>();

const { success, error } = useToast();

const encodedUrl = computed(() => encodeURIComponent(props.url));
const encodedTitle = computed(() => encodeURIComponent(props.title));

const links = computed(() => [
  {
    label: 'Share on X',
    icon: 'lucide:twitter',
    href: `https://twitter.com/intent/tweet?text=${encodedTitle.value}&url=${encodedUrl.value}`,
  },
  {
    label: 'Share on LinkedIn',
    icon: 'lucide:linkedin',
    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl.value}`,
  },
]);

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.url);
    success('Link copied', 'The post URL is on your clipboard.');
  } catch {
    error('Could not copy', 'Copy the URL from the address bar instead.');
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="label mr-1 text-muted-foreground">Share</span>
    <a
      v-for="link in links"
      :key="link.label"
      :href="link.href"
      :aria-label="link.label"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary-border hover:text-foreground"
    >
      <Icon :name="link.icon" class="size-4" />
    </a>
    <button
      type="button"
      aria-label="Copy link"
      class="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary-border hover:text-foreground"
      @click="copyLink"
    >
      <Icon name="lucide:link" class="size-4" />
    </button>
  </div>
</template>
