export type InventoryItem = [name: string, unitWeight: number, count: number];

export interface InventorySelection {
  sourceIndex: number;
  expected: InventoryItem;
}

export const LOAD_COMPARISON_EPSILON = 1e-9;

export function normalizeInventoryItem(value: unknown): InventoryItem {
  if (!Array.isArray(value) || value.length !== 3) {
    throw new Error(
      "Inventory items must be [name, unit weight, count] tuples.",
    );
  }
  const name = typeof value[0] === "string" ? value[0].trim() : "";
  const unitWeight = value[1];
  const count = value[2];
  if (!name) throw new Error("Inventory item names cannot be blank.");
  if (
    typeof unitWeight !== "number" ||
    !Number.isFinite(unitWeight) ||
    unitWeight < 0
  ) {
    throw new Error(
      "Inventory item weight must be a finite number of zero or more.",
    );
  }
  if (typeof count !== "number" || !Number.isInteger(count) || count <= 0) {
    throw new Error("Inventory item count must be a positive integer.");
  }
  return [name, unitWeight, count];
}

export function normalizeInventory(value: unknown): InventoryItem[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error("Inventory must be an array.");
  return value.map(normalizeInventoryItem);
}

export function normalizeMaxLoad(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error("Maximum Load must be a finite number of zero or more.");
  }
  return value;
}

export function inventoryItemsEqual(
  left: InventoryItem,
  right: InventoryItem,
): boolean {
  return left[0] === right[0] && left[1] === right[1] && left[2] === right[2];
}

export function findSelectedInventoryIndex(
  inventory: InventoryItem[],
  selection: InventorySelection,
): number {
  const atIndex = inventory[selection.sourceIndex];
  if (atIndex && inventoryItemsEqual(atIndex, selection.expected)) {
    return selection.sourceIndex;
  }
  return inventory.findIndex((item) =>
    inventoryItemsEqual(item, selection.expected),
  );
}

export function rowLoad(item: InventoryItem): number {
  return item[1] * item[2];
}

export function totalLoad(inventory: InventoryItem[] | undefined): number {
  return (inventory ?? []).reduce((sum, item) => sum + rowLoad(item), 0);
}

export function isOverloaded(
  currentLoad: number,
  maxLoad: number | undefined,
): boolean {
  if (maxLoad === undefined) return false;
  const scale = Math.max(1, Math.abs(currentLoad), Math.abs(maxLoad));
  return currentLoad - maxLoad > LOAD_COMPARISON_EPSILON * scale;
}

export function formatLoadValue(value: number): string {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return rounded.toFixed(2);
}

export function formatLoad(
  inventory: InventoryItem[] | undefined,
  maxLoad: number | undefined,
): string {
  const current = formatLoadValue(totalLoad(inventory));
  return maxLoad === undefined
    ? `Load: ${current}`
    : `Load: ${current} / ${formatLoadValue(maxLoad)}`;
}
