const PUZZLE = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

export function useSudoku() {
  const board = ref<number[][]>(PUZZLE.map(row => [...row]));

  function isGiven(row: number, col: number) {
    return (PUZZLE[row]?.[col] ?? 0) !== 0;
  }

  function fill(row: number, col: number, value: number) {
    if (isGiven(row, col)) return;

    const cells = board.value[row];
    if (cells) cells[col] = value;
  }

  function erase(row: number, col: number) {
    fill(row, col, 0);
  }

  return { board, isGiven, fill, erase };
}
