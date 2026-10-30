<script setup lang="ts">
const tileColors: Record<number, string> = {
  0     : 'bg-primary',
  2     : 'bg-neutral-800 text-text',
  4     : 'bg-neutral-700 text-text',
  8     : 'bg-neutral-600 text-text',
  16    : 'bg-neutral-500 text-text',
  32    : 'bg-neutral-400 text-primary',
  64    : 'bg-neutral-300 text-primary',
  128   : 'bg-neutral-200 text-primary',
  256   : 'bg-neutral-100 text-primary',
  512   : 'bg-neutral-50 text-primary',
  1024  : 'bg-white text-primary',
  2048  : 'bg-white text-primary ring-2 ring-text-sub'
}

const keyToDirection: Record<string, Direction> = {
  ArrowLeft   : 'left',
  ArrowRight  : 'right',
  ArrowUp     : 'up',
  ArrowDown   : 'down',
  a           : 'left',
  d           : 'right',
  w           : 'up',
  s           : 'down',
};

function tileClass(value: number) {
  const color = tileColors[value] ?? 'bg-white text-primary'
  const size = value >= 1000 ? 'text-xl sm:text-2xl' : value >= 100 ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
  return `${color} ${size}`
}

function tilePosition(tile: Tile) {
  return { transform: `translate(${tile.col * 100}%, ${tile.row * 100}%)` };
}

function tileAnimation(tile: Tile) {
  if (tile.isNew) return 'tile-new';
  if (tile.isMerged) return 'tile-merged';
  return '';
}

function onKeydown(event: KeyboardEvent) {
  const direction = keyToDirection[event.key];
  if (!direction) return;

  event.preventDefault();
  move(direction);
}

let startX = 0;
let startY = 0;

function onTouchStart(event: TouchEvent) {
  const touch = event.touches[0];
  if (!touch) return;

  startX = touch.clientX;
  startY = touch.clientY;
}

function onTouchEnd(event: TouchEvent) {
  const touch = event.changedTouches[0];
  if (!touch) return;

  const dx = touch.clientX - startX;
  const dy = touch.clientY - startY;

  if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return; // too short: a tap, not a swipe

  if (Math.abs(dx) > Math.abs(dy)) {
    move(dx > 0 ? 'right' : 'left');
  } else {
    move(dy > 0 ? 'down' : 'up');
  }
}

const { tiles, gameOver, won, keepPlaying, score, bestScore, move, continueGame, restart, start } = use2048()

onMounted(() => {
  start();
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <div class="flex justify-end gap-2 mb-3">
    <div class="flex flex-col items-center min-w-14 sm:min-w-20 px-2 sm:px-3 py-0.5 sm:py-1 border border-border rounded-md">
      <span class="text-[10px] sm:text-xs text-text-sub">Score</span>
      <span class="font-bold text-sm sm:text-lg text-text">{{ score }}</span>
    </div>
    <div class="flex flex-col items-center min-w-14 sm:min-w-20 px-2 sm:px-3 py-0.5 sm:py-1 border border-border rounded-md">
      <span class="text-[10px] sm:text-xs text-text-sub">Best</span>
      <span class="font-bold text-sm sm:text-lg text-text">{{ bestScore }}</span>
    </div>
  </div>

  <div class="relative w-full aspect-square bg-hover border border-border rounded-md touch-none"
       @touchstart="onTouchStart"
       @touchend="onTouchEnd"
  >
    <!-- Each cell is 1/4 of this area with p-1 around it, so neighbours are 2 × p-1 apart
         and translate(100%) moves a tile exactly one cell -->
    <div class="absolute inset-1 sm:inset-1.5">
      <div class="grid grid-cols-4 grid-rows-4 w-full h-full">
        <div v-for="n in 16" :key="n" class="p-1 sm:p-1.5">
          <div class="w-full h-full bg-primary rounded-sm" />
        </div>
      </div>

      <div
        v-for="tile in tiles"
        :key="tile.id"
        class="absolute top-0 left-0 w-1/4 h-1/4 p-1 sm:p-1.5 transition-transform duration-100 ease-in-out"
        :style="tilePosition(tile)"
      >
        <div
          class="flex items-center justify-center w-full h-full font-bold rounded-sm"
          :class="[tileClass(tile.value), tileAnimation(tile)]"
        >
          {{ tile.value }}
        </div>
      </div>
    </div>

    <div
      v-if="gameOver"
      class="absolute inset-0 flex flex-col items-center justify-center gap-4
             bg-primary/80 rounded-md"
    >
      <p class="font-bold text-3xl text-text">Game over</p>
      <button
        class="px-3 py-2 font-semibold text-sm bg-white text-primary rounded-md
               hover:bg-[#CCCCCC] active:scale-95 transition"
        @click="restart"
      >
        Try again
      </button>
    </div>

    <div
      v-else-if="won && !keepPlaying"
      class="absolute inset-0 flex flex-col items-center justify-center gap-4
             bg-primary/80 rounded-md"
    >
      <p class="font-bold text-3xl text-text">You win!</p>
      <div class="flex gap-3">
        <button
          class="px-3 py-2 font-semibold text-sm bg-white text-primary rounded-md
                 hover:bg-[#CCCCCC] active:scale-95 transition"
          @click="continueGame"
        >
          Keep going
        </button>
        <button
          class="px-3 py-2 font-semibold text-sm text-text border border-border rounded-md
                 hover:bg-[#262626] active:scale-95 transition"
          @click="restart"
        >
          New game
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tile-new {
  animation: tile-appear 150ms ease-out 100ms backwards;
}

.tile-merged {
  animation: tile-pop 150ms ease-out 100ms backwards;
}

@keyframes tile-appear {
  from { opacity: 0; transform: scale(0); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes tile-pop {
  0%   { transform: scale(0); }
  50%  { transform: scale(1.15); }
  100% { transform: scale(1); }
}
</style>
