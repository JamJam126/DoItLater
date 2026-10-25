<script setup lang="ts">
const { board, lives, seconds, gameOver, won, isGiven, isWrong, isUsedUp, fill, erase, tick, restart, start } = useSudoku();

const selected = ref<{ row: number; col: number } | null>(null);
const gameEl = ref<HTMLElement | null>(null);

  function select(row: number, col: number) {
  selected.value = { row, col };
}

function onNumber(value: number) {
  if (!selected.value) return;

  fill(selected.value.row, selected.value.col, value);
}

function onErase() {
  if (!selected.value) return;

  erase(selected.value.row, selected.value.col);
}

function onClickOutside(event: MouseEvent) {
  if (!gameEl.value?.contains(event.target as Node)) {
    selected.value = null;
  }
}

let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  start();
  window.addEventListener('click', onClickOutside);
  timer = setInterval(tick, 1000);
});

onUnmounted(() => {
  window.removeEventListener('click', onClickOutside);
  clearInterval(timer);
});

function formatTime(total: number) {
  const minutes = String(Math.floor(total / 60)).padStart(2, '0');
  const secs = String(total % 60).padStart(2, '0');
  return `${minutes}:${secs}`;
}

function cellClass(row: number, col: number, value: number) {
  const cell = selected.value;
  if (!cell) return 'bg-primary';

  const isSelected = row === cell.row && col === cell.col;
  const sameNumber = value !== 0 && value === board.value[cell.row]?.[cell.col];
  const sameBox = Math.floor(row / 3) === Math.floor(cell.row / 3) && Math.floor(col / 3) === Math.floor(cell.col / 3);
  const related = row === cell.row || col === cell.col || sameBox;

  if (isSelected) return 'bg-neutral-700';
  if (sameNumber) return 'bg-neutral-800';
  if (related) return 'bg-hover';
  return 'bg-primary';
}

function textClass(row: number, col: number) {
  if (isGiven(row, col)) return 'font-bold text-text';
  if (isWrong(row, col)) return 'text-red-400';
  return 'text-text-sub';
}

function borderClass(row: number, col: number) {
  const classes = [];

  if (col === 2 || col === 5) classes.push('border-r-2 border-r-neutral-600');
  else if (col !== 8) classes.push('border-r border-r-border');

  if (row === 2 || row === 5) classes.push('border-b-2 border-b-neutral-600');
  else if (row !== 8) classes.push('border-b border-b-border');

  return classes.join(' ');
}
</script>

<template>
  <div ref="gameEl">
    <div class="flex justify-end gap-2 mb-3">
      <div class="flex flex-col items-center min-w-20 px-3 py-1 border border-border rounded-md">
        <span class="text-xs text-text-sub">Time</span>
        <span class="font-bold text-lg text-text">{{ formatTime(seconds) }}</span>
      </div>
      <div class="flex flex-col items-center min-w-20 px-3 py-1 border border-border rounded-md">
        <span class="text-xs text-text-sub">Lives</span>
        <span class="font-bold text-lg text-text">{{ lives }}</span>
      </div>
    </div>

    <div class="relative grid grid-cols-9 w-full border-2 border-neutral-600 rounded-md overflow-hidden">
      <template v-for="(cells, row) in board" :key="row">
        <button
          v-for="(value, col) in cells"
          :key="col"
          class="flex items-center justify-center aspect-square text-lg sm:text-2xl"
          :class="[
            cellClass(row, col, value),
            borderClass(row, col),
            textClass(row, col)
          ]"
          @click="select(row, col)"
        >
          {{ value || '' }}
        </button>
      </template>

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
        v-else-if="won"
        class="absolute inset-0 flex flex-col items-center justify-center gap-4
               bg-primary/80 rounded-md"
      >
        <p class="font-bold text-3xl text-text">Solved!</p>
        <p class="text-text-sub">Time: {{ formatTime(seconds) }}</p>
        <button
          class="px-3 py-2 font-semibold text-sm bg-white text-primary rounded-md
                 hover:bg-[#CCCCCC] active:scale-95 transition"
          @click="restart"
        >
          New game
        </button>
      </div>
    </div>

    <div class="grid grid-cols-9 gap-1 sm:gap-2 mt-2">
      <button
        v-for="n in 9"
        :key="n"
        :disabled="isUsedUp(n)"
        @click="onNumber(n)"
        class="aspect-square font-bold text-lg sm:text-xl text-text border border-border rounded-md
              hover:bg-hover active:scale-95 transition
              disabled:opacity-30 disabled:pointer-events-none"
      >
        {{ n }}
      </button>
    </div>

    <button
      @click="onErase"
      class="w-full mt-2 py-2 font-semibold text-sm text-text border border-border rounded-md
            hover:bg-[#262626] active:scale-95 transition"
    >
      Erase
    </button>
  </div>
</template>
