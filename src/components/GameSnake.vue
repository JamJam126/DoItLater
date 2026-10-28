<script setup lang="ts">
type Cell = { row: number; col: number };

const SIZE = 15;

const gridStyle = { gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` };

const cells: Cell[] = Array.from({ length: SIZE * SIZE }, (_, i) => ({ row: Math.floor(i / SIZE), col: i % SIZE }));

const snake: Cell[] = [
  { row: 7, col: 6 },
  { row: 7, col: 5 },
  { row: 7, col: 4 },
  { row: 7, col: 3 }
];

const food: Cell = { row: 7, col: 11 };

function isSame(a: Cell, b: Cell) {
  return a.row === b.row && a.col === b.col;
}

function cellClass(cell: Cell) {
  const [head] = snake;

  if (head && isSame(cell, head)) return 'bg-white';
  if (snake.some(part => isSame(cell, part))) return 'bg-neutral-400';
  return 'bg-primary';
}
</script>

<template>
  <div class="grid gap-px p-1 w-full aspect-square bg-hover border border-border rounded-md"
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
  </div>
</template>
