const SIZE = 9;
const MAX_LIVES = 3;

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

const SOLUTION = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

export function useSudoku() {
  const board = ref<number[][]>(PUZZLE.map(row => [...row]));
  const lives = ref(MAX_LIVES);
  const gameOver = computed(() => lives.value === 0);

  function isGiven(row: number, col: number) {
    return (PUZZLE[row]?.[col] ?? 0) !== 0;
  }

  function isWrong(row: number, col: number) {
    const value = board.value[row]?.[col] ?? 0;
    return value !== 0 && value !== SOLUTION[row]?.[col];
  }

  function isUsedUp(value: number) {
    const solution = SOLUTION.flat();
    const count = board.value.flat().filter((cell, i) => cell === value && cell === solution[i]).length;
    return count >= SIZE;
  }

  function fill(row: number, col: number, value: number) {
    if (gameOver.value) return;
    if (isGiven(row, col)) return;
    if (value !== 0 && isUsedUp(value)) return;

    const cells = board.value[row];
    if (!cells || cells[col] === value) return;

    cells[col] = value;
    if (isWrong(row, col)) lives.value--;
  }

  function erase(row: number, col: number) {
    fill(row, col, 0);
  }

  function restart() {
    board.value = PUZZLE.map(row => [...row]);
    lives.value = MAX_LIVES;
  }

  return { board, lives, gameOver, isGiven, isWrong, isUsedUp, fill, erase, restart };
}
