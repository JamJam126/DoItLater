const SIZE = 4
const WINNING_TILE = 2048
const BEST_SCORE_KEY = 'doitlater:2048:best'
const GAME_KEY = 'doitlater:2048:game'

export type Tile = {
  id:         number;
  value:      number;
  row:        number;
  col:        number;
  isNew?:     boolean;    
  isMerged?:  boolean; 
  isGone?:    boolean;  
};

type SavedGame = {
  board:        number[][];
  score:        number;
  won:          boolean;
  keepPlaying:  boolean;
};

let lastId = 0;

export function use2048() {
  const tiles = ref<Tile[]>([]);
  const board = computed(() => toBoard(tiles.value));
  const won = ref(false);
  const keepPlaying = ref(false);
  const score = ref(0);
  const bestScore = ref(0);
  const gameOver = computed(() => tiles.value.length > 0 && !canMove(board.value));

  function move(direction: Direction) {
    if (gameOver.value || (won.value && !keepPlaying.value)) return;

    let points = 0;
    const current = tiles.value.filter(tile => !tile.isGone);
    const next = moveTiles(current, direction, value => { points += value; });
    if (JSON.stringify(toBoard(next)) === JSON.stringify(board.value)) return;

    tiles.value = sortById(addRandomTile(next));
    score.value += points;
    if (score.value > bestScore.value) {
      bestScore.value = score.value;
      saveBestScore(bestScore.value);
    }

    if (!won.value && board.value.some(row => row.includes(WINNING_TILE))) {
      won.value = true;
    }

    save();
  }

  function continueGame() {
    keepPlaying.value = true;
    save();
  }

  function restart() {
    tiles.value = addRandomTile(addRandomTile([]));
    won.value = false;
    keepPlaying.value = false;
    score.value = 0;
    save();
  }

  function start() {
    bestScore.value = loadBestScore();

    const saved = loadGame();
    if (!saved) {
      restart();
      return;
    }

    tiles.value = fromBoard(saved.board);
    score.value = saved.score;
    won.value = saved.won;
    keepPlaying.value = saved.keepPlaying;
  }

  function save() {
    saveGame({ board: board.value, score: score.value, won: won.value, keepPlaying: keepPlaying.value });
  }

  return { tiles, won, keepPlaying, gameOver, score, bestScore, move, continueGame, restart, start };
}

type Cell = { row: number; col: number };
type OnMerge = (value: number) => void;

function moveTiles(tiles: Tile[], direction: Direction, onMerge?: OnMerge): Tile[] {
  const next: Tile[] = [];

  for (const cells of getLines(direction)) {
    const lineTiles = [];
    for (const cell of cells) {
      const tile = tiles.find(tile => tile.row === cell.row && tile.col === cell.col);
      if (tile) lineTiles.push(tile);
    }

    next.push(...slideLine(lineTiles, cells, onMerge));
  }

  return next;
}

function getLines(direction: Direction): Cell[][] {
  const lines: Cell[][] = [];

  for (let i = 0; i < SIZE; i++) {
    const line: Cell[] = [];

    for (let j = 0; j < SIZE; j++) {
      const back = SIZE - 1 - j;

      switch (direction) {
        case 'left':
          line.push({ row: i, col: j });
          break;

        case 'right':
          line.push({ row: i, col: back });
          break;

        case 'up':
          line.push({ row: j, col: i });
          break;

        case 'down':
          line.push({ row: back, col: i });
          break;
      }
    }

    lines.push(line);
  }

  return lines;
}

function slideLine(lineTiles: Tile[], cells: Cell[], onMerge?: OnMerge): Tile[] {
  const result: Tile[] = [];
  let free = 0;
  let last: Tile | null = null;

  for (const tile of lineTiles) {
    if (last && last.value === tile.value) {
      result.push(...mergeTiles(last, tile));
      onMerge?.(tile.value * 2);
      last = null;
    } else {
      const cell = cells[free] ?? { row: 0, col: 0 };
      last = { ...tile, row: cell.row, col: cell.col };
      result.push(last);
      free++;
    }
  }

  return result;
}

function mergeTiles(target: Tile, tile: Tile): Tile[] {
  target.isGone = true;
  const moved = { ...tile, row: target.row, col: target.col, isGone: true };
  const merged = { ...createTile(tile.value * 2, target.row, target.col), isMerged: true };
  return [moved, merged];
}

function canMove(board: number[][]) {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const value = board[row]?.[col] ?? 0;
      if (value === 0) return true;
      if (value === board[row]?.[col + 1] || value === board[row + 1]?.[col]) return true;
    }
  }
  return false;
}

function createTile(value: number, row: number, col: number): Tile {
  lastId++;
  return { id: lastId, value, row, col };
}

function sortById(tiles: Tile[]) {
  return [...tiles].sort((a, b) => a.id - b.id);
}

function toBoard(tiles: Tile[]): number[][] {
  const board = emptyBoard();

  for (const tile of tiles) {
    const row = board[tile.row];
    if (row && !tile.isGone) row[tile.col] = tile.value;
  }

  return board;
}

function fromBoard(board: number[][]): Tile[] {
  const tiles: Tile[] = [];

  board.forEach((cells, row) => cells.forEach((value, col) => {
    if (value !== 0) tiles.push(createTile(value, row, col));
  }));

  return tiles;
}

function addRandomTile(tiles: Tile[]): Tile[] {
  const board = toBoard(tiles);
  if (!board.some(row => row.includes(0))) return tiles;

  let r = Math.floor(Math.random() * SIZE);
  let c = Math.floor(Math.random() * SIZE);

  while (board[r]?.[c] !== 0) {
    r = Math.floor(Math.random() * SIZE);
    c = Math.floor(Math.random() * SIZE);
  }

  return [...tiles, { ...createTile(getTile(), r, c), isNew: true }];
}

function loadBestScore(): number {
  try {
    return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBestScore(value: number) {
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(value));
  } catch {}
}

function loadGame(): SavedGame | null {
  try {
    const saved = JSON.parse(localStorage.getItem(GAME_KEY) ?? 'null');
    const validBoard = Array.isArray(saved?.board) && saved.board.length === SIZE &&
      saved.board.every((row: unknown) => Array.isArray(row) && row.length === SIZE && row.every(value => typeof value === 'number'));
    if (!validBoard || typeof saved.score !== 'number') return null;

    return { board: saved.board, score: saved.score, won: saved.won === true, keepPlaying: saved.keepPlaying === true };
  } catch {
    return null;
  }
}

function saveGame(game: SavedGame) {
  try {
    localStorage.setItem(GAME_KEY, JSON.stringify(game));
  } catch {}
}

function emptyBoard(): number[][] {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function getTile(): number {
  const value = Math.random() < 0.1 ? 4 : 2;
  return value;
}
