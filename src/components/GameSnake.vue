<script setup lang="ts">
type Cell = { row: number; col: number };

const { snake, food, size, gameOver, move, turn, restart } = useSnake();

const gridStyle = { gridTemplateColumns: `repeat(${size.value}, minmax(0, 1fr))` };

const cells: Cell[] = Array.from({ length: size.value * size.value }, (_, i) => ({ row: Math.floor(i / size.value), col: i % size.value }));

let timer: ReturnType<typeof setInterval> | undefined;

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

function onKeydown(event: KeyboardEvent) {
  const direction = keyToDirection[event.key];
  if (!direction) return;

  event.preventDefault();
  turn(direction);
}

onMounted(() => {
  timer = setInterval(move, 200);
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  clearInterval(timer);
  window.removeEventListener('keydown', onKeydown);
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
