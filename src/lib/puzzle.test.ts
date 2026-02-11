import { describe, it, expect } from "vitest";
import {
  generateShuffledOrder,
  isPuzzleSolved,
  getGridSize,
  getPrice,
  countCorrectTiles,
} from "@/lib/puzzle";

const isValidPermutation = (order: number[], total: number) => {
  const set = new Set(order);
  if (set.size !== total) return false;
  for (let i = 0; i < total; i++) if (!set.has(i)) return false;
  return true;
};

describe("puzzle utils", () => {
  it("generates a valid shuffled order", () => {
    const total = 9;
    const order = generateShuffledOrder(total);
    expect(order).toHaveLength(total);
    expect(isValidPermutation(order, total)).toBe(true);
  });

  it("does not return solved state for total > 1", () => {
    const total = 9;
    const order = generateShuffledOrder(total);
    const solved = order.every((v, i) => v === i);
    expect(solved).toBe(false);
  });

  it("detects solved puzzle", () => {
    const order = [0, 1, 2, 3];
    expect(isPuzzleSolved(order)).toBe(true);
  });

  it("counts correct tiles", () => {
    const order = [0, 2, 1, 3];
    expect(countCorrectTiles(order)).toBe(2);
  });

  it("returns grid size and price by difficulty", () => {
    expect(getGridSize("easy")).toBe(3);
    expect(getGridSize("medium")).toBe(4);
    expect(getGridSize("hard")).toBe(5);

    expect(getPrice("easy")).toBe(50000);
    expect(getPrice("medium")).toBe(80000);
    expect(getPrice("hard")).toBe(150000);
  });
});
