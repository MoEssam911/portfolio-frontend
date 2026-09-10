<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BlogPost } from '~/modules/blog/types';

interface Props {
  post: BlogPost;
}

const props = defineProps<Props>();
const { formatDate } = useFormatters();
const toast = useToast();
const url = useRequestURL();

const copied = ref(false);

const shareUrl = computed(() => `${url.origin}/blog/${props.post.slug}`);

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    copied.value = true;
    toast.success('Link copied', 'Share this post with anyone.');
    window.setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    toast.error('Could not copy', 'Copy the URL from the address bar instead.');
  }
}
</script>

<template>
  <aside class="glass-surface flex flex-col gap-5 rounded-2xl p-5 sm:p-6">
    <div>
      <p class="label mb-2">Published</p>
      <p class="text-sm text-foreground">{{ formatDate(post.publishedAt) }}</p>
    </div>

    <div v-if="post.updatedAt !== post.publishedAt">
      <p class="label mb-2">Updated</p>
      <p class="text-sm text-foreground">{{ formatDate(post.updatedAt) }}</p>
    </div>

    <div v-if="post.tags.length">
      <p class="label mb-2">Topics</p>
      <div class="flex flex-wrap gap-1.5">
        <Badge v-for="tag in post.tags" :key="tag" variant="outline" class="font-mono">
          {{ tag }}
        </Badge>
      </div>
    </div>

    <button
      type="button"
      :class="cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-1 w-full justify-center')"
      @click="copyLink"
    >
      <Icon :name="copied ? 'lucide:check' : 'lucide:link'" class="size-4" />
      {{ copied ? 'Copied' : 'Copy link' }}
    </button>
  </aside>
</template>
