<script setup lang="ts">
const games = [
  {
    slug: '2048',
    title: '2048',
    tag: 'Puzzle  •  Playable',
    description: 'Slide tiles, merge numbers.'
  },
  {
    slug: 'coming-soon-1',
    title: 'Coming soon',
    tag: 'Game  •  TBA',
    description: ''
  },
  {
    slug: 'coming-soon-2',
    title: 'Coming soon',
    tag: 'Game  •  TBA',
    description: ''
  },
  {
    slug: 'coming-soon-3',
    title: 'Coming soon',
    tag: 'Game  •  TBA',
    description: ''
  }
]
</script>

<template>
  <div class="flex flex-col items-center gap-8 p-8 w-full h-full">
    <div class="flex flex-col items-center text-text">
      <h3 class="font-bold text-[48px]">You have better things to do.</h3>
      <p class="text-2xl opacity-80">And yet, here we are</p>
    </div>

    <div class="grid grid-cols-4 gap-8 w-full max-w-7xl">
      <GameCard
        v-for="game in games"
        :key="game.slug"
        :slug="game.slug"
        :title="game.title"
        :tag="game.tag"
        :description="game.description"
      />
    </div>
  </div>
</template>
