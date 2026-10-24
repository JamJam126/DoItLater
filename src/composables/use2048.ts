export type Direction = 'left' | 'right' | 'up' | 'down'

const SIZE = 4
const WINNING_TILE = 2048
const DIRECTIONS: Direction[] = ['left', 'right', 'up', 'down']


function emptyBoard(): number[][] {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

export function use2048() {
  const board = ref<number[][]>(emptyBoard());
  const won = ref(false);
  const keepPlaying = ref(false);
  const gameOver = computed(() => {
    if (board.value.some(row => row.includes(0))) return false; // an empty cell means the game isn't over

    const current = JSON.stringify(board.value)
    return DIRECTIONS.every(direction => JSON.stringify(moveBoard(board.value, direction)) === current)
  });

  function move(direction: Direction) {
    if (gameOver.value || (won.value && !keepPlaying.value)) return;

    const next = moveBoard(board.value, direction);
    if (JSON.stringify(next) === JSON.stringify(board.value)) return;

    board.value = addRandomTile(next);
    if (!won.value && next.some(row => row.includes(WINNING_TILE))) {
      won.value = true;
    }
  }

  function continueGame() {
    keepPlaying.value = true;
  }

  function restart() {
    board.value = addRandomTile(addRandomTile(emptyBoard()));
    won.value = false;
    keepPlaying.value = false;
  }

  return { board, won, keepPlaying, gameOver, move, continueGame, restart };
}

function moveBoard(board: number[][], direction: string): number[][] {
  switch (direction) {
    case 'left':
      return moveLeft(board);
  
    case 'right':
      return moveRight(board);

    case 'up':
      return moveUp(board);

    case 'down':
      return moveDown(board);
    
    default:
      break;
  }

  return board; 
}

function moveLeft(board: number[][]): number[][] {
  return board.map(row => slideRowLeft(row));
}

function moveRight(board: number[][]): number[][] {
  return board.map(row => slideRowLeft([...row].reverse()).reverse());
}

function moveUp(board: number[][]): number[][] {
  return transpose(moveLeft(transpose(board)));
}

function moveDown(board: number[][]): number[][] {
  return transpose(moveRight(transpose(board)));
}


function slideRowLeft(row: number[]): number[] {
  const result: number[] = [];
  let canMerge = false;

  for (const tile of row) {
    if (tile === 0) continue;

    if (canMerge && result.at(-1) === tile) {
      result[result.length - 1] = tile * 2;
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