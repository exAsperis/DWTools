import { describe, expect, it } from "vitest";
import {
  findSelectedInventoryIndex,
  formatLoad,
  isOverloaded,
  normalizeInventory,
  normalizeInventoryItem,
  rowLoad,
  totalLoad,
  type InventoryItem,
} from "./inventory";

describe("inventory tuple validation and Load", () => {
  it("treats missing inventory as empty and preserves duplicate rows", () => {
    expect(normalizeInventory(undefined)).toEqual([]);
    const duplicates: InventoryItem[] = [
      ["Healing Potion", 1, 1],
      ["Healing Potion", 1, 1],
    ];
    expect(normalizeInventory(duplicates)).toEqual(duplicates);
  });

  it("allows zero weight and calculates representative fractional Loads", () => {
    const inventory: InventoryItem[] = [
      ["Weightless Key", 0, 1],
      ["Coin", 0.01, 137],
      ["Bag of Books", 0.4, 5],
      ["Bundle of Arrows", 0.33, 2],
    ];
    expect(rowLoad(inventory[1])).toBeCloseTo(1.37);
    expect(totalLoad(inventory)).toBeCloseTo(4.03);
    expect(formatLoad(inventory, 11)).toBe("Load: 4.03 / 11.00");
  });

  it("rejects blank names, negative or non-finite weights, and invalid counts", () => {
    expect(() => normalizeInventoryItem([" ", 1, 1])).toThrow("blank");
    expect(() => normalizeInventoryItem(["Sword", -1, 1])).toThrow("weight");
    expect(() => normalizeInventoryItem(["Sword", Infinity, 1])).toThrow(
      "weight",
    );
    expect(() => normalizeInventoryItem(["Sword", 1, -1])).toThrow("count");
    expect(() => normalizeInventoryItem(["Sword", 1, 1.5])).toThrow("count");
  });

  it("uses an epsilon for overload comparisons", () => {
    expect(isOverloaded(0.1 + 0.2, 0.3)).toBe(false);
    expect(isOverloaded(3.01, 3)).toBe(true);
  });

  it("resolves the original index first and then one exact tuple match", () => {
    const inventory: InventoryItem[] = [
      ["Bag of Books", 0.4, 1],
      ["Bag of Books", 0.4, 3],
      ["Healing Potion", 1, 1],
      ["Healing Potion", 1, 1],
    ];
    expect(
      findSelectedInventoryIndex(inventory, {
        sourceIndex: 1,
        expected: ["Bag of Books", 0.4, 3],
      }),
    ).toBe(1);
    expect(
      findSelectedInventoryIndex(inventory.slice(1), {
        sourceIndex: 1,
        expected: ["Bag of Books", 0.4, 3],
      }),
    ).toBe(0);
    expect(
      findSelectedInventoryIndex(inventory, {
        sourceIndex: 99,
        expected: ["Healing Potion", 1, 1],
      }),
    ).toBe(2);
  });
});
