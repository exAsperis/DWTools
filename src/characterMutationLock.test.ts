import { describe, expect, it, vi } from "vitest";
import {
  BrowserCharacterMutationLock,
  characterMutationLockName,
  type CharacterLockManager,
} from "./characterMutationLock";
import { CharacterRepositoryError } from "./characterRepository";

describe("Character mutation lock", () => {
  it("creates a stable room-scoped name", () => {
    expect(characterMutationLockName("room 1")).toBe(
      characterMutationLockName("room 1"),
    );
    expect(characterMutationLockName("room 1")).toContain("room%201");
  });

  it("uses different names for different rooms", () => {
    expect(characterMutationLockName("one")).not.toBe(
      characterMutationLockName("two"),
    );
  });

  it("rejects blank room IDs", () => {
    expect(() => characterMutationLockName("  ")).toThrow(
      CharacterRepositoryError,
    );
  });

  it("passes the expected name and returns the callback result", async () => {
    const request = vi.fn(
      async (_name: string, callback: () => Promise<number>) => callback(),
    );
    const lock = new BrowserCharacterMutationLock({
      request,
    } as CharacterLockManager);
    await expect(lock.runExclusive("room-1", async () => 42)).resolves.toBe(42);
    expect(request).toHaveBeenCalledWith(
      characterMutationLockName("room-1"),
      expect.any(Function),
    );
  });

  it("propagates callback exceptions", async () => {
    const manager: CharacterLockManager = {
      request: async (_name, callback) => callback(),
    };
    const lock = new BrowserCharacterMutationLock(manager);
    await expect(
      lock.runExclusive("room-1", async () => {
        throw new Error("failed");
      }),
    ).rejects.toThrow("failed");
  });
});
