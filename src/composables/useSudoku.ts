const SIZE = 9;
const MAX_LIVES = 3;
const CLUES = 32;
const GAME_KEY = 'doitlater:sudoku:game';

type SavedGame = {
  puzzle: number[][];
  solution: number[][];
  board: number[][];
  lives: number;
  seconds: number;
};

export function useSudoku() {
  const puzzle = ref<number[][]>(emptyBoard());
  const solution = ref<number[][]>(emptyBoard());
  const board = ref<number[][]>(emptyBoard());
  const lives = ref(MAX_LIVES);
  const seconds = ref(0);
  const gameOver = computed(() => lives.value === 0);
  const won = computed(() =>
    board.value.every((cells, row) => cells.every((value, col) => value !== 0 && value === solution.value[row]?.[col]))
  );

  function isGiven(row: number, col: number) {
    return (puzzle.value[row]?.[col] ?? 0) !== 0;
  }

  function isWrong(row: number, col: number) {
    const value = board.value[row]?.[col] ?? 0;
    return value !== 0 && value !== solution.value[row]?.[col];
  }

  function isUsedUp(value: number) {
    const answers = solution.value.flat();
    const count = board.value.flat().filter((cell, i) => cell === value && cell === answers[i]).length;
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
    const next = generatePuzzle(CLUES);
    puzzle.value = next.puzzle;
    solution.value = next.solution;
    board.value = next.puzzle.map(row => [...row]);
    lives.value = MAX_LIVES;
    seconds.value = 0;
    save();
  }

  function start() {
    const saved = loadGame();
    if (!saved) {
      restart();
      return;
    }

    puzzle.value = saved.puzzle;
    solution.value = saved.solution;
    board.value = saved.board;
    lives.value = saved.lives;
    seconds.value = saved.seconds;
  }

  function save() {
    saveGame({
      puzzle: puzzle.value,
      solution: solution.value,
      board: board.value,
      lives: lives.value,
      seconds: seconds.value
    });
  }

  return { board, lives, seconds, gameOver, won, isGiven, isWrong, isUsedUp, fill, erase, tick, restart, start };
}

function emptyBoard(): number[][] {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function isValidBoard(value: unknown): value is number[][] {
  return Array.isArray(value) && value.length === SIZE &&
    value.every(row => Array.isArray(row) && row.length === SIZE && row.every(cell => typeof cell === 'number'));
}

function loadGame(): SavedGame | null {
  try {
    const saved = JSON.parse(localStorage.getItem(GAME_KEY) ?? 'null');
    if (!isValidBoard(saved?.puzzle) || !isValidBoard(saved?.solution) || !isValidBoard(saved?.board)) return null;
    if (typeof saved.lives !== 'number' || typeof saved.seconds !== 'number') return null;

    return { puzzle: saved.puzzle, solution: saved.solution, board: saved.board, lives: saved.lives, seconds: saved.seconds };
  } catch {
    return null;
  }
}

function saveGame(game: SavedGame) {
  try {
    localStorage.setItem(GAME_KEY, JSON.stringify(game));
  } catch {}
}
