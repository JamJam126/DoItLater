<script setup lang="ts">
const {
  level, board, lives, seconds, paused, picking, hasGame, gameOver, won,
  isGiven, isWrong, isUsedUp, fill, erase, tick, togglePause, openPicker, closePicker, newGame, start
} = useSudoku();

const levels: Level[] = ['easy', 'medium', 'hard'];

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

const arrowSteps: Record<string, { row: number; col: number }> = {
  ArrowUp     : { row: -1, col: 0 },
  ArrowDown   : { row: 1, col: 0 },
  ArrowLeft   : { row: 0, col: -1 },
  ArrowRight  : { row: 0, col: 1 }
};

function moveSelection(rowStep: number, colStep: number) {
  if (!selected.value) {
    select(0, 0);
    return;
  }

  const row = Math.min(Math.max(selected.value.row + rowStep, 0), 8);
  const col = Math.min(Math.max(selected.value.col + colStep, 0), 8);
  select(row, col);
}

function onKeydown(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const step = arrowSteps[event.key];
  if (step) {
    event.preventDefault();
    moveSelection(step.row, step.col);
  } else if (/^[1-9]$/.test(event.key)) {
    onNumber(Number(event.key));
  } else if (event.key === 'Backspace' || event.key === 'Delete') {
    event.preventDefault();
    onErase();
  }
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
  window.addEventListener('keydown', onKeydown);
  timer = setInterval(tick, 1000);
});

onUnmounted(() => {
  window.removeEventListener('click', onClickOutside);
  window.removeEventListener('keydown', onKeydown);
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
    <div class="flex justify-between mb-3">
      <div class="flex gap-2">
        <button
          :disabled="won || gameOver || picking"
          :aria-label="paused ? 'Resume' : 'Pause'"
          :title="paused ? 'Resume' : 'Pause'"
          @click="togglePause"
          class="flex items-center justify-center w-12 text-text border border-border rounded-md
                hover:bg-[#262626] active:scale-95 transition
                disabled:opacity-30 disabled:pointer-events-none"
        >
          <svg v-if="paused" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        </button>
        <button
          aria-label="New game"
          title="New game"
          @click="openPicker"
          class="flex items-center justify-center w-12 text-text border border-border rounded-md
                hover:bg-[#262626] active:scale-95 transition"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>

      <div class="flex gap-2">
        <div class="flex flex-col items-center min-w-20 px-3 py-1 border border-border rounded-md">
          <span class="text-xs text-text-sub">Time</span>
          <span class="font-bold text-lg text-text">{{ formatTime(seconds) }}</span>
        </div>
        <div class="flex flex-col items-center min-w-20 px-3 py-1 border border-border rounded-md">
          <span class="text-xs text-text-sub">Lives</span>
          <span class="font-bold text-lg text-text">{{ lives }}</span>
        </div>
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
        v-if="picking"
        class="absolute inset-0 flex flex-col items-center justify-center gap-4
               bg-primary rounded-md"
      >
        <p class="font-bold text-2xl sm:text-3xl text-text">Choose difficulty</p>
        <div class="grid grid-cols-3 gap-2 w-64">
          <button
            v-for="option in levels"
            :key="option"
            @click="newGame(option)"
            class="py-2 font-semibold text-sm capitalize rounded-md active:scale-95 transition"
            :class="option === level
              ? 'bg-white text-primary hover:bg-[#CCCCCC]'
              : 'text-text border border-border hover:bg-[#262626]'"
          >
            {{ option }}
          </button>
        </div>
        <button
          v-if="hasGame && !gameOver && !won"
          class="text-sm text-text-sub hover:text-text transition-colors"
          @click="closePicker"
        >
          Cancel
        </button>
      </div>

      <div
        v-else-if="gameOver"
        class="absolute inset-0 flex flex-col items-center justify-center gap-4
               bg-primary/80 rounded-md"
      >
        <p class="font-bold text-3xl text-text">Game over</p>
        <button
          class="px-3 py-2 font-semibold text-sm bg-white text-primary rounded-md
                 hover:bg-[#CCCCCC] active:scale-95 transition"
          @click="openPicker"
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
          @click="openPicker"
        >
          New game
        </button>
      </div>

      <div
        v-else-if="paused"
        class="absolute inset-0 flex flex-col items-center justify-center gap-4
               bg-primary rounded-md"
      >
        <p class="font-bold text-3xl text-text">Paused</p>
        <button
          class="px-3 py-2 font-semibold text-sm bg-white text-primary rounded-md
                 hover:bg-[#CCCCCC] active:scale-95 transition"
          @click="togglePause"
        >
          Resume
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
