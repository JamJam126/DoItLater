type Cell = { row: number; col: number };

const SIZE = 15;

const  STEPS: Record<Direction, Cell> = {
  up    : { row: -1, col:  0 },
  down  : { row:  1, col:  0 },
  left  : { row:  0, col: -1 },
  right : { row:  0, col:  1 }
};

const OPPOSITE: Record<Direction, Direction> = {
  up    : 'down',
  down  : 'up',
  left  : 'right',
  right : 'left'
};

const temp_snake: Cell[] = [
  { row: 7, col:  0 },
  { row: 7, col: -1 },
  { row: 7, col: -2 },
  { row: 7, col: -3 }
];

const temp_food: Cell = { row: 7, col: 11 };

export function useSnake() {
  const snake = ref<Cell[]>([...temp_snake]);
  const food = ref<Cell>({ ...temp_food });
  const size = ref(SIZE);
  const direction = ref<Direction>('right');
  const gameOver = ref(false);

  let movedDirection: Direction = 'right';

  function move() {
    if (gameOver.value) return;

    const head = snake.value[0];
    if (!head) return;

    const move = STEPS[direction.value];
    movedDirection = direction.value;
    const newHead = { row: head.row + move.row, col: head.col + move.col };

    const ate = newHead.row === food.value.row && newHead.col === food.value.col;
    const body = ate ? snake.value : snake.value.slice(0, -1);

    if (isOutside(newHead) || isCrashItself(newHead, body)) {
      gameOver.value = true;
      return;
    }
    
    snake.value = [newHead, ...body];
    if (ate) food.value = randomFood() ?? food.value;
  }

  function turn(newDirection: Direction) {
    if (newDirection === OPPOSITE[movedDirection]) return;
    direction.value = newDirection; 
  }

  function restart() {
    snake.value = [...temp_snake];
    food.value = { ...temp_food };
    direction.value = 'right';
    movedDirection = 'right';
    gameOver.value = false;
  }
    
  function randomFood(): Cell | null {
    const free: Cell[] = [];

    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        const taken = snake.value.some(part => part.row === row && part.col === col);
        if (!taken) free.push({ row, col });
      }
    }

    return free[Math.floor(Math.random() * free.length)] ?? null;
  }

  return {
    snake,
    food,
    size,
    gameOver,

    move,
    turn,
    restart,
  }
}

function isOutside(cell: Cell) {
  return cell.row < 0 || cell.row >= SIZE || cell.col < 0 || cell.col >= SIZE;
}

function isCrashItself(newHead: Cell, snake: Cell []) {
  return snake.some(part => part.row === newHead.row && part.col === newHead.col);
}