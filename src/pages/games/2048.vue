<script setup lang="ts">
  useHead({ title: '2048 • DoItLater' })
</script>

<template>
  <div class="flex flex-col items-center gap-6 p-8 w-full">
    <div class="flex flex-col gap-4 w-full max-w-md">
      <NuxtLink to="/" class="w-fit text-sm text-text-sub hover:text-text transition-colors">
        ← Back
      </NuxtLink>
      <h1 class="font-bold text-4xl text-text">2048</h1>
    </div>

    <div class="w-full max-w-md">
      <Game2048 />
    </div>
  </div>
</template>
