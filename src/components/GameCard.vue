<script setup lang="ts">
defineProps<{
  slug:         string
  title:        string
  description:  string
  tag:          string
}>()
</script>

<template>
  <NuxtLink :to="`/games/${slug}`" 
            class="flex flex-col gap-6 p-4 sm:p-6 w-full border border-border rounded-md
                  hover:-translate-y-1 transition-transform duration-150 cursor-pointer"
  >
    <div class="flex items-center justify-center w-full aspect-video
                bg-hover border border-border rounded-t-sm"
    >
      <span class="text-4xl text-text-sub">?</span>
    </div>

    <div class="flex flex-col gap-4 w-full">
      <div class="flex flex-col gap-1">
        <h3 class="font-semibold text-lg text-text">{{ title }}</h3>
        <p class="text-xs text-text-sub whitespace-pre">{{ tag }}</p>
      </div>
      <p class="font-medium text-sm text-text-sub">{{ description }}</p>
    </div>
  </NuxtLink>
</template>
