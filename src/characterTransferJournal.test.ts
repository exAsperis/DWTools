import { describe, expect, it } from "vitest";
import {
  CHARACTER_TRANSFER_JOURNAL_FORMAT_VERSION,
  CharacterTransferJournalStore,
  characterTransferJournalStorageKey,
  parseCharacterTransferJournal,
  recoverCharacterTransferJournal,
  type CharacterTransferJournal,
} from "./characterTransferJournal";
import {
  CharacterLocalStore,
  type CharacterLocalEntry,
} from "./characterLocalStore";
import type { CharacterRecord } from "./characterRepository";
import { activeRecord } from "./characterTestHelpers";

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>();
  get length(): number {
    return this.values.size;
  }
  clear(): void {
    this.values.clear();
  }
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.values.delete(key);
  }
  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

function record(
  id: string,
  writeId: string,
  revision: number,
  parents: string[] = [],
): CharacterRecord {
  return activeRecord(id, { writeId, revision, parents });
}

function entry(
  id: string,
  records: CharacterRecord[],
  head = records.at(-1)!.writeId,
): CharacterLocalEntry {
  return {
    formatVersion: 1,
    roomId: "room-1",
    characterId: id,
    history: {
      formatVersion: 1,
      characterId: id,
      revisions: Object.fromEntries(
        records.map((value) => [value.writeId, value]),
      ),
      heads: [head],
    },
    sync: { pendingRevisionIds: head === records[0].writeId ? [] : [head] },
  };
}

function validJournal(): CharacterTransferJournal {
  const A = record("source", "A", 1);
  const B = record("source", "B", 2, ["A"]);
  const X = record("destination", "X", 1);
  const Y = record("destination", "Y", 2, ["X"]);
  return {
    formatVersion: CHARACTER_TRANSFER_JOURNAL_FORMAT_VERSION,
    roomId: "room-1",
    transactionId: "transaction-1",
    createdAt: "2026-09-21T12:00:00.000Z",
    sourceCharacterId: "source",
    destinationCharacterId: "destination",
    sourceBefore: entry("source", [A]),
    sourceAfter: entry("source", [A, B]),
    destinationBefore: entry("destination", [X]),
    destinationAfter: entry("destination", [X, Y]),
  };
}

function recoverySetup(journal = validJournal()) {
  const storage = new MemoryStorage();
  const local = new CharacterLocalStore(storage, "room-1");
  const journals = new CharacterTransferJournalStore(storage, "room-1");
  local.put(journal.sourceBefore);
  local.put(journal.destinationBefore);
  journals.put(journal);
  return { storage, local, journals, journal };
}

describe("Character transfer journal", () => {
  it("uses a stable room-scoped storage key", () => {
    expect(characterTransferJournalStorageKey("room 1")).toBe(
      characterTransferJournalStorageKey("room 1"),
    );
    expect(characterTransferJournalStorageKey("room 1")).toContain("room%201");
    expect(characterTransferJournalStorageKey("one")).not.toBe(
      characterTransferJournalStorageKey("two"),
    );
  });

  it("rejects blank room IDs", () => {
    expect(() => characterTransferJournalStorageKey(" ")).toThrow();
  });

  it("round-trips a valid journal", () => {
    const storage = new MemoryStorage();
    const store = new CharacterTransferJournalStore(storage, "room-1");
    expect(store.put(validJournal())).toEqual(validJournal());
    expect(store.get()).toEqual(validJournal());
  });

  it("rejects a mismatched room", () => {
    expect(() =>
      parseCharacterTransferJournal(validJournal(), "room-2"),
    ).toThrow();
  });

  it("rejects the same source and destination", () => {
    const value = validJournal() as unknown as Record<string, unknown>;
    value.destinationCharacterId = "source";
    expect(() => parseCharacterTransferJournal(value, "room-1")).toThrow();
  });

  it("requires the after state to add exactly one revision", () => {
    const value = validJournal();
    value.sourceAfter.history.revisions.extra = record("source", "extra", 3, [
      "B",
    ]);
    expect(() => parseCharacterTransferJournal(value, "room-1")).toThrow();
  });

  it("requires the after revision to parent the exact before head", () => {
    const value = validJournal();
    value.sourceAfter.history.revisions.B.parents = [];
    expect(() => parseCharacterTransferJournal(value, "room-1")).toThrow();
  });

  it("rejects changes to prior immutable revisions", () => {
    const value = validJournal();
    value.sourceAfter = structuredClone(value.sourceAfter);
    const prior = value.sourceAfter.history.revisions.A;
    if (prior.deleted) throw new Error("Expected active revision");
    prior.fields.hpCurrent = 1;
    expect(() => parseCharacterTransferJournal(value, "room-1")).toThrow();
  });

  it("reports malformed JSON without deleting it", () => {
    const storage = new MemoryStorage();
    const key = characterTransferJournalStorageKey("room-1");
    storage.setItem(key, "not-json");
    const store = new CharacterTransferJournalStore(storage, "room-1");
    expect(() => store.get()).toThrow();
    expect(storage.getItem(key)).toBe("not-json");
  });

  it("refuses to clear a different transaction", () => {
    const storage = new MemoryStorage();
    const store = new CharacterTransferJournalStore(storage, "room-1");
    store.put(validJournal());
    expect(() => store.clear("other")).toThrow();
    expect(store.get()).toBeDefined();
  });

  it("clears the matching transaction", () => {
    const storage = new MemoryStorage();
    const store = new CharacterTransferJournalStore(storage, "room-1");
    store.put(validJournal());
    store.clear("transaction-1");
    expect(store.get()).toBeUndefined();
  });

  it("returns none when no journal exists", () => {
    const storage = new MemoryStorage();
    expect(
      recoverCharacterTransferJournal(
        new CharacterLocalStore(storage, "room-1"),
        new CharacterTransferJournalStore(storage, "room-1"),
      ),
    ).toEqual({ status: "none" });
  });

  it("recovers both Characters when neither write occurred", () => {
    const { local, journals, journal } = recoverySetup();
    expect(recoverCharacterTransferJournal(local, journals)).toMatchObject({
      status: "recovered",
      transactionId: journal.transactionId,
    });
    expect(local.get("source")?.history.heads).toEqual(["B"]);
    expect(local.get("destination")?.history.heads).toEqual(["Y"]);
    expect(journals.get()).toBeUndefined();
  });

  it("writes only the missing destination when source was written", () => {
    const { local, journals, journal } = recoverySetup();
    local.put(journal.sourceAfter);
    recoverCharacterTransferJournal(local, journals);
    expect(Object.keys(local.get("source")!.history.revisions)).toEqual([
      "A",
      "B",
    ]);
    expect(local.get("destination")?.history.heads).toEqual(["Y"]);
  });

  it("only clears when both intended revisions were already written", () => {
    const { local, journals, journal } = recoverySetup();
    local.put(journal.sourceAfter);
    local.put(journal.destinationAfter);
    recoverCharacterTransferJournal(local, journals);
    expect(Object.keys(local.get("source")!.history.revisions)).toHaveLength(2);
    expect(
      Object.keys(local.get("destination")!.history.revisions),
    ).toHaveLength(2);
    expect(journals.get()).toBeUndefined();
  });

  it("preserves a later descendant while clearing a completed journal", () => {
    const { local, journals, journal } = recoverySetup();
    const B = journal.sourceAfter.history.revisions.B as CharacterRecord;
    const C = record("source", "C", 3, ["B"]);
    local.put(
      entry("source", [
        journal.sourceBefore.history.revisions.A as CharacterRecord,
        B,
        C,
      ]),
    );
    local.put(journal.destinationAfter);
    recoverCharacterTransferJournal(local, journals);
    expect(local.get("source")?.history.heads).toEqual(["C"]);
    expect(Object.keys(local.get("source")!.history.revisions)).toEqual([
      "A",
      "B",
      "C",
    ]);
  });

  it("makes no writes when either side is unsafe", () => {
    const { local, journals, journal } = recoverySetup();
    const unrelated = record("source", "D", 1);
    local.put(entry("source", [unrelated]));
    const destinationBefore = structuredClone(local.get("destination"));
    expect(() => recoverCharacterTransferJournal(local, journals)).toThrow();
    expect(local.get("destination")).toEqual(destinationBefore);
    expect(journals.get()).toEqual(journal);
  });

  it("rejects recovery stores from different rooms", () => {
    const storage = new MemoryStorage();
    expect(() =>
      recoverCharacterTransferJournal(
        new CharacterLocalStore(storage, "room-1"),
        new CharacterTransferJournalStore(storage, "room-2"),
      ),
    ).toThrow();
  });
});
