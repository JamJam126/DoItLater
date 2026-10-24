<template>
  <div class="font-sans min-h-dvh bg-primary">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>  
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: title => title ? `${title} • DoItLater` : 'DoItLater'
})
</script>