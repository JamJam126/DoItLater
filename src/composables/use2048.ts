export type Direction = 'left' | 'right' | 'up' | 'down'

const SIZE = 4
const WINNING_TILE = 2048
const DIRECTIONS: Direction[] = ['left', 'right', 'up', 'down']
const BEST_SCORE_KEY = 'doitlater:2048:best'
const GAME_KEY = 'doitlater:2048:game'

type SavedGame = {
  board: number[][];
  score: number;
  won: boolean;
  keepPlaying: boolean;
};

export function use2048() {
  const board = ref<number[][]>(emptyBoard());
  const won = ref(false);
  const keepPlaying = ref(false);
  const score = ref(0);
  const bestScore = ref(0);
  const gameOver = computed(() => {
    if (board.value.some(row => row.includes(0))) return false; 

    const current = JSON.stringify(board.value)
    return DIRECTIONS.every(direction => JSON.stringify(moveBoard(board.value, direction)) === current)
  });

  function move(direction: Direction) {
    if (gameOver.value || (won.value && !keepPlaying.value)) return;

    let points = 0;
    const next = moveBoard(board.value, direction, value => { points += value; });
    if (JSON.stringify(next) === JSON.stringify(board.value)) return;

    board.value = addRandomTile(next);
    score.value += points;
    if (score.value > bestScore.value) {
      bestScore.value = score.value;
      saveBestScore(bestScore.value);
    }

    if (!won.value && next.some(row => row.includes(WINNING_TILE))) {
      won.value = true;
    }

    save();
  }

  function continueGame() {
    keepPlaying.value = true;
    save();
  }

  function restart() {
    board.value = addRandomTile(addRandomTile(emptyBoard()));
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

    board.value = saved.board;
    score.value = saved.score;
    won.value = saved.won;
    keepPlaying.value = saved.keepPlaying;
  }

  function save() {
    saveGame({ board: board.value, score: score.value, won: won.value, keepPlaying: keepPlaying.value });
  }

  return { board, won, keepPlaying, gameOver, score, bestScore, move, continueGame, restart, start };
}

type OnMerge = (value: number) => void;

function moveBoard(board: number[][], direction: string, onMerge?: OnMerge): number[][] {
  switch (direction) {
    case 'left':
      return moveLeft(board, onMerge);

    case 'right':
      return moveRight(board, onMerge);

    case 'up':
      return moveUp(board, onMerge);

    case 'down':
      return moveDown(board, onMerge);

    default:
      break;
  }

  return board;
}

function moveLeft(board: number[][], onMerge?: OnMerge): number[][] {
  return board.map(row => slideRowLeft(row, onMerge));
}

function moveRight(board: number[][], onMerge?: OnMerge): number[][] {
  return board.map(row => slideRowLeft([...row].reverse(), onMerge).reverse());
}

function moveUp(board: number[][], onMerge?: OnMerge): number[][] {
  return transpose(moveLeft(transpose(board), onMerge));
}

function moveDown(board: number[][], onMerge?: OnMerge): number[][] {
  return transpose(moveRight(transpose(board), onMerge));
}


function slideRowLeft(row: number[], onMerge?: OnMerge): number[] {
  const result: number[] = [];
  let canMerge = false;

  for (const tile of row) {
    if (tile === 0) continue;

    if (canMerge && result.at(-1) === tile) {
      result[result.length - 1] = tile * 2;
      onMerge?.(tile * 2);
      canMerge = false;
    } else {
      result.push(tile);
      canMerge = true;
    }
  }

  while (result.length < SIZE) result.push(0);
  return result;
}

function addRandomTile(board: number[][]): number[][] {
  if (!board.some(row => row.includes(0))) return board;

  const next = board.map(row => [...row]); 
  let r = Math.floor(Math.random() * SIZE);
  let c = Math.floor(Math.random() * SIZE);

  while (board[r]?.[c] !== 0) {
    r = Math.floor(Math.random() * SIZE);
    c = Math.floor(Math.random() * SIZE);
  }

  const row = next[r];
  if (row) row[c] = getTile();

  return next;
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

// New tile is a 2 (90%) or a 4 (10%)
function getTile(): number {
  const value = Math.random() < 0.1 ? 4 : 2;
  return value;
}

function transpose(board: number[][]) {
  const trans = [];
  for (let i = 0; i < SIZE; i++) {
    let row = [];
    for (let j = 0; j < SIZE; j++) {
      row.push(board[j]?.[i] ?? 0);
    }
    trans.push(row);
  }

  return trans
}