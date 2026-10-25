// Sudoku generator, based on the GeeksforGeeks algorithm:
// fill a full valid board, then erase cells while the puzzle still has exactly one solution
type Board = number[][];

const SIZE = 9;

export function generatePuzzle(clues: number): { puzzle: Board; solution: Board } {
  const solution: Board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  fillDiagonal(solution);
  fillRemaining(solution, 0, 0);

  const puzzle = solution.map(row => [...row]);
  removeDigits(puzzle, clues);

  return { puzzle, solution };
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

// Same backtracking as fillRemaining, but counts solutions and stops early at `limit`
function countSolutions(grid: Board, limit = 2): number {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (get(grid, row, col) !== 0) continue;

      let count = 0;
      for (let num = 1; num <= SIZE && count < limit; num++) {
        if (checkIfSafe(grid, row, col, num)) {
          set(grid, row, col, num);
          count += countSolutions(grid, limit - count);
          set(grid, row, col, 0);
        }
      }
      return count;
    }
  }

  return 1;
}

function shuffle<T>(items: T[]): T[] {
  return items
    .map(item => ({ item, key: Math.random() }))
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item);
}
