<script setup lang="ts">
type Cell = { row: number; col: number };

const { snake, food, size, gameOver, score, bestScore, move, turn, restart, start } = useSnake();

const gridStyle = { gridTemplateColumns: `repeat(${size.value}, minmax(0, 1fr))` };

const cells: Cell[] = Array.from({ length: size.value * size.value }, (_, i) => ({ row: Math.floor(i / size.value), col: i % size.value }));

let timer: ReturnType<typeof setInterval> | undefined;

useHead({ bodyAttrs: { class: 'touch-none overscroll-none' } });

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

let startX = 0;
let startY = 0;

function onKeydown(event: KeyboardEvent) {
  const direction = keyToDirection[event.key];
  if (!direction) return;

  event.preventDefault();
  turn(direction);
}

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
    turn(dx > 0 ? 'right' : 'left');
  } else {
    turn(dy > 0 ? 'down' : 'up');
  }
}

onMounted(() => {
  start();
  timer = setInterval(move, 200);
  window.addEventListener('keydown', onKeydown);
  window.addEventListener('touchstart', onTouchStart);
  window.addEventListener('touchend', onTouchEnd);
});

onUnmounted(() => {
  clearInterval(timer);
  window.removeEventListener('keydown', onKeydown);
  window.removeEventListener('touchstart', onTouchStart);
  window.removeEventListener('touchend', onTouchEnd);
});

function isSame(a: Cell, b: Cell) {
  return a.row === b.row && a.col === b.col;
}

function cellClass(cell: Cell) {
  const [head] = snake.value;

  if (head && isSame(cell, head)) return 'bg-white';
  if (snake.value.some(part => isSame(cell, part))) return 'bg-neutral-400';
  return 'bg-primary';
}
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

  <div class="relative grid gap-px p-1 w-full aspect-square bg-hover border border-border rounded-md"
       :style="gridStyle"
  >
    <div
      v-for="cell in cells"
      :key="`${cell.row}-${cell.col}`"
      class="rounded-[2px]"
      :class="cellClass(cell)"
    >
      <div v-if="isSame(cell, food)" class="w-full h-full bg-red-400 rounded-full scale-75" />
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
  </div>
</template>
