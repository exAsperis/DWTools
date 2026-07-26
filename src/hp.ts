export function adjustedHp(current: number, amount: number): number {
  return Math.max(0, current + amount);
}
