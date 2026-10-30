type Cell = { row: number; col: number };

const SIZE = 15;

const  STEPS: Record<Direction, Cell> = {
  up    : { row: -1, col:  0 },
  down  : { row:  1, col:  0 },
  left  : { row:  0, col: -1 },
  right : { row:  0, col:  1 }
};

const temp_snake: Cell[] = [
  { row: 7, col:  0 },
  { row: 7, col: -1 },
  { row: 7, col: -2 },
  { row: 7, col: -3 }
];

const temp_food: Cell = { row: 7, col: 11 };

export function useSnake() {
  const snake = ref<Cell[]>(temp_snake);
  const food = ref<Cell>(temp_food);
  const size = ref(SIZE);
  const direction = ref<Direction>('right');

  function move() {
    const head = snake.value[0];
    if (!head) return;

    const move = STEPS[direction.value];
    const newHead = { row: head.row + move.row, col: head.col + move.col };
    const ate = newHead.row === food.value.row && newHead.col === food.value.col;
    snake.value = [newHead, ...snake.value.slice(0, -1)];

    if (ate) {
      food.value = randomFood() ?? food.value;
    }
  }

  function turn(newDirection: Direction) {
    direction.value = newDirection; 
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

    move,
    turn,
  };
}
