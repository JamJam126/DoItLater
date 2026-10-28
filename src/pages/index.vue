<script setup lang="ts">
const games = [
  {
    slug: '2048',
    title: '2048',
    tag: 'Puzzle  •  Playable',
    description: 'Slide tiles, merge numbers.'
  },
  {
    slug: 'sudoku',
    title: 'Sudoku',
    tag: 'Puzzle  •  Playable',
    description: 'Fill the grid, one number at a time.'
  },
  {
    slug: 'coming-soon-1',
    title: 'Coming soon',
    tag: 'Game  •  TBA',
    description: ''
  },
];

</script>

<template>
  <div class="flex flex-col items-center gap-8 p-4 sm:p-8 w-full h-full">
    <div class="flex flex-col items-center text-center text-text gap-0 sm:gap-4">
      <h3 class="font-bold text-3xl sm:text-[48px]">You have better things to do.</h3>
      <p class="text-lg sm:text-2xl opacity-80">And yet, here we are</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 w-full max-w-7xl">
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
