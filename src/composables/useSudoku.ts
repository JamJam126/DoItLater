const SIZE = 9;
const MAX_LIVES = 3;
const GAME_KEY = 'doitlater:sudoku:game';

type SavedGame = {
  board: number[][];
  lives: number;
  seconds: number;
};

const PUZZLE = [
  [5, 3, 0, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
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
  const seconds = ref(0);
  const gameOver = computed(() => lives.value === 0);
  const won = computed(() =>
    board.value.every((cells, row) => cells.every((value, col) => value === SOLUTION[row]?.[col]))
  );

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
    if (gameOver.value || won.value) return;
    if (isGiven(row, col)) return;
    if (value !== 0 && isUsedUp(value)) return;

    const cells = board.value[row];
    if (!cells || cells[col] === value) return;

    cells[col] = value;
    if (isWrong(row, col)) lives.value--;

    save();
  }

  function erase(row: number, col: number) {
    fill(row, col, 0);
  }

  function tick() {
    if (gameOver.value || won.value) return;

    seconds.value++;
    save();
  }

  function restart() {
    board.value = PUZZLE.map(row => [...row]);
    lives.value = MAX_LIVES;
    seconds.value = 0;
    save();
  }

  function start() {
    const saved = loadGame();
    if (!saved) return;

    board.value = saved.board;
    lives.value = saved.lives;
    seconds.value = saved.seconds;
  }

  function save() {
    saveGame({ board: board.value, lives: lives.value, seconds: seconds.value });
  }

  return { board, lives, seconds, gameOver, won, isGiven, isWrong, isUsedUp, fill, erase, tick, restart, start };
}

function loadGame(): SavedGame | null {
  try {
    const saved = JSON.parse(localStorage.getItem(GAME_KEY) ?? 'null');
    const validBoard = Array.isArray(saved?.board) && saved.board.length === SIZE &&
      saved.board.every((row: unknown) => Array.isArray(row) && row.length === SIZE && row.every(value => typeof value === 'number'));
    if (!validBoard || typeof saved.lives !== 'number' || typeof saved.seconds !== 'number') return null;

    return { board: saved.board, lives: saved.lives, seconds: saved.seconds };
  } catch {
    return null;
  }
}

function saveGame(game: SavedGame) {
  try {
    localStorage.setItem(GAME_KEY, JSON.stringify(game));
  } catch {}
}
