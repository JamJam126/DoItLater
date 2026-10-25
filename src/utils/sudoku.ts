// Sudoku generator, based on the GeeksforGeeks algorithm:
// fill a full valid board, then erase cells while the puzzle still has exactly one solution
import { HARD_PUZZLES } from './sudokuHard';

type Board = number[][];

const SIZE = 9;
const MIN_CLUES = 17;

export function generatePuzzle(clues: number): { puzzle: Board; solution: Board } {
  // Erasing at random can't get down to 17, so use one of the known 17-clue puzzles instead
  if (clues <= MIN_CLUES) return pickHardPuzzle();

  const solution: Board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  fillDiagonal(solution);
  fillRemaining(solution, 0, 0);

  const puzzle = solution.map(row => [...row]);
  removeDigits(puzzle, clues);

  return { puzzle, solution };
}

// Relabelling digits and shuffling rows/columns (within their band) keeps a puzzle valid
// and unique, so 50 puzzles look like many more
function pickHardPuzzle() {
  const index = Math.floor(Math.random() * HARD_PUZZLES.length);
  const [puzzle = '', solution = ''] = HARD_PUZZLES[index] ?? [];

  const rows = shuffledLines();
  const cols = shuffledLines();
  const digits = [0, ...shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])];
  const build = (text: string): Board =>
    rows.map(row => cols.map(col => digits[Number(text[row * SIZE + col]) || 0] ?? 0));

  return { puzzle: build(puzzle), solution: build(solution) };
}

// e.g. [4, 3, 5, 0, 2, 1, 8, 6, 7]: bands of 3 in random order, lines inside each band shuffled
function shuffledLines() {
  return shuffle([0, 1, 2]).flatMap(band => shuffle([0, 1, 2]).map(line => band * 3 + line));
}

function get(grid: Board, row: number, col: number) {
  return grid[row]?.[col] ?? 0;
}

function set(grid: Board, row: number, col: number, value: number) {
  const cells = grid[row];
  if (cells) cells[col] = value;
}

function unUsedInRow(grid: Board, row: number, num: number) {
  for (let col = 0; col < SIZE; col++) {
    if (get(grid, row, col) === num) return false;
  }
  return true;
}

function unUsedInCol(grid: Board, col: number, num: number) {
  for (let row = 0; row < SIZE; row++) {
    if (get(grid, row, col) === num) return false;
  }
  return true;
}

function unUsedInBox(grid: Board, rowStart: number, colStart: number, num: number) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (get(grid, rowStart + i, colStart + j) === num) return false;
    }
  }
  return true;
}

function checkIfSafe(grid: Board, row: number, col: number, num: number) {
  return unUsedInRow(grid, row, num) && unUsedInCol(grid, col, num) &&
    unUsedInBox(grid, row - (row % 3), col - (col % 3), num);
}

// The 3 diagonal boxes share no row or column, so each can be filled randomly on its own
function fillDiagonal(grid: Board) {
  for (let i = 0; i < SIZE; i += 3) {
    fillBox(grid, i, i);
  }
}

function fillBox(grid: Board, row: number, col: number) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let num;
      do {
        num = Math.floor(Math.random() * SIZE) + 1;
      } while (!unUsedInBox(grid, row, col, num));
      set(grid, row + i, col + j, num);
    }
  }
}

// Backtracking: try a number, move on, undo it if we hit a dead end
function fillRemaining(grid: Board, row: number, col: number): boolean {
  if (row === SIZE) return true;
  if (col === SIZE) return fillRemaining(grid, row + 1, 0);
  if (get(grid, row, col) !== 0) return fillRemaining(grid, row, col + 1);

  for (let num = 1; num <= SIZE; num++) {
    if (checkIfSafe(grid, row, col, num)) {
      set(grid, row, col, num);
      if (fillRemaining(grid, row, col + 1)) return true;
      set(grid, row, col, 0);
    }
  }

  return false;
}

// Erase cells in random order, but put a number back if erasing it allows a second solution
function removeDigits(grid: Board, clues: number) {
  const cells = shuffle(Array.from({ length: SIZE * SIZE }, (_, i) => i));
  let filled = SIZE * SIZE;

  for (const cell of cells) {
    if (filled <= clues) break;

    const row = Math.floor(cell / SIZE);
    const col = cell % SIZE;
    const value = get(grid, row, col);

    set(grid, row, col, 0);
    if (countSolutions(grid) === 1) {
      filled--;
    } else {
      set(grid, row, col, value);
    }
  }
}

// Same backtracking as fillRemaining, but counts solutions and stops early at `limit`.
// It tries the empty cell with the fewest options first, so dead ends show up much sooner.
function countSolutions(grid: Board, limit = 2): number {
  let best: { row: number; col: number; options: number[] } | null = null;

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (get(grid, row, col) !== 0) continue;

      const options = candidates(grid, row, col);
      if (options.length === 0) return 0;
      if (!best || options.length < best.options.length) best = { row, col, options };
    }
  }

  if (!best) return 1;

  let count = 0;
  for (const num of best.options) {
    if (count >= limit) break;

    set(grid, best.row, best.col, num);
    count += countSolutions(grid, limit - count);
    set(grid, best.row, best.col, 0);
  }

  return count;
}

function candidates(grid: Board, row: number, col: number) {
  const options: number[] = [];
  for (let num = 1; num <= SIZE; num++) {
    if (checkIfSafe(grid, row, col, num)) options.push(num);
  }
  return options;
}

function shuffle<T>(items: T[]): T[] {
  return items
    .map(item => ({ item, key: Math.random() }))
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item);
}
