import { Difficulty, DIFFICULTY_CONFIG } from "@/types";

/** Fisher-Yates shuffle — returns a shuffled array of indices [0..n-1] */
export function generateShuffledOrder(totalTiles: number): number[] {
  const order = Array.from({ length: totalTiles }, (_, i) => i);

  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  // Ensure it's not already solved
  const isSorted = order.every((val, idx) => val === idx);
  if (isSorted && order.length > 1) {
    [order[0], order[1]] = [order[1], order[0]];
  }

  return order;
}

/** Check if current tile order matches the solved state */
export function isPuzzleSolved(tileOrder: number[]): boolean {
  return tileOrder.every((val, idx) => val === idx);
}

/** Get grid size from difficulty */
export function getGridSize(difficulty: Difficulty): number {
  return DIFFICULTY_CONFIG[difficulty].gridSize;
}

/** Get price in kobo from difficulty */
export function getPrice(difficulty: Difficulty): number {
  return DIFFICULTY_CONFIG[difficulty].priceKobo;
}

/** Count how many tiles are in their correct position */
export function countCorrectTiles(tileOrder: number[]): number {
  return tileOrder.filter((val, idx) => val === idx).length;
}
