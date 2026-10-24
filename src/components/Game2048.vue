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
  s           : 'down'
};

function tileClass(value: number) {
  const color = tileColors[value] ?? 'bg-white text-primary'
  const size = value >= 1000 ? 'text-xl sm:text-2xl' : value >= 100 ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
  return `${color} ${size}`
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

const { board, gameOver, won, keepPlaying, move, continueGame, restart } = use2048()

onMounted(() => {
  restart();
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
});
</script>

<template>
  <div class="relative grid grid-cols-4 grid-rows-4 gap-2 sm:gap-3 p-2 sm:p-3 w-full aspect-square
              bg-hover border border-border rounded-md touch-none"
       @touchstart="onTouchStart"
       @touchend="onTouchEnd"
  >
    <div
      v-for="(value, index) in board.flat()"
      :key="index"
      class="flex items-center justify-center font-bold rounded-sm"
      :class="tileClass(value)"
    >
      {{ value || '' }}
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

  <div class="flex gap-4">
    <button class="mt-4 px-3 py-2 text-sm text-text border border-border rounded-md" @click="move('left')">
      Left
    </button>
    
    <button class="mt-4 px-3 py-2 text-sm text-text border border-border rounded-md" @click="move('right')">
      Right
    </button>

    <button class="mt-4 px-3 py-2 text-sm text-text border border-border rounded-md" @click="move('up')">
      Up
    </button>

    <button class="mt-4 px-3 py-2 text-sm text-text border border-border rounded-md" @click="move('down')">
      Down
    </button>
  </div>
</template>
