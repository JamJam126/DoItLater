<script setup lang="ts">
const { board, isGiven, fill, erase } = useSudoku();

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

onMounted(() => window.addEventListener('click', onClickOutside));
onUnmounted(() => window.removeEventListener('click', onClickOutside));

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
    <div class="grid grid-cols-9 w-full border-2 border-neutral-600 rounded-md overflow-hidden">
      <template v-for="(cells, row) in board" :key="row">
        <button
          v-for="(value, col) in cells"
          :key="col"
          class="flex items-center justify-center aspect-square text-lg sm:text-2xl"
          :class="[
            cellClass(row, col, value),
            borderClass(row, col),
            isGiven(row, col) ? 'font-bold text-text' : 'text-text-sub'
          ]"
          @click="select(row, col)"
        >
          {{ value || '' }}
        </button>
      </template>
    </div>

    <div class="grid grid-cols-9 gap-1 sm:gap-2 mt-2">
      <button
        v-for="n in 9"
        :key="n"
        @click="onNumber(n)"
        class="aspect-square font-bold text-lg sm:text-xl text-text border border-border rounded-md
              hover:bg-hover active:scale-95 transition"
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
