import { describe, expect, it, vi } from "vitest";
import {
  buildCharacterPersistenceDevMarkup,
  buildCharacterPersistenceDevSnapshot,
  DEVELOPER_TOOLS_ENABLED_KEY,
  readDeveloperToolsEnabled,
  writeDeveloperToolsEnabled,
} from "./characterPersistenceDev";
import { activeRecord } from "./characterTestHelpers";
import { CHARACTER_KEY_PREFIX } from "./constants";
import {
  LOCAL_CHARACTER_ENTRY_FORMAT_VERSION,
  type CharacterLocalEntry,
  type CharacterLocalStoreScan,
} from "./characterLocalStore";
import type { CharacterSceneStoreScan } from "./characterSceneStore";
import type { CharacterHistory } from "./characterRevision";

function history(heads = ["root"]): CharacterHistory {
  const revisions = Object.fromEntries(
    heads.map((writeId, index) => [
      writeId,
      activeRecord("character-1", { writeId, revision: index + 1 }),
    ]),
  );
  return { formatVersion: 1, characterId: "character-1", revisions, heads };
}

function entry(
  value = history(),
  pendingRevisionIds: string[] = [],
): CharacterLocalEntry {
  return {
    formatVersion: LOCAL_CHARACTER_ENTRY_FORMAT_VERSION,
    roomId: "room-1",
    characterId: "character-1",
    history: value,
    sync: { pendingRevisionIds },
  };
}

function local(
  entries: CharacterLocalEntry[] = [entry()],
): CharacterLocalStoreScan {
  return { entries, issues: [] };
}

function scene(
  histories: CharacterHistory[] = [history()],
): CharacterSceneStoreScan {
  return { histories, issues: [] };
}

function snapshot(
  localScan = local(),
  sceneScan: CharacterSceneStoreScan | undefined = scene(),
  sceneReady = true,
) {
  return buildCharacterPersistenceDevSnapshot(
    {},
    localScan,
    sceneScan,
    sceneReady,
  );
}

describe("Character persistence developer diagnostics", () => {
  it("defaults the developer toggle to false", () => {
    expect(readDeveloperToolsEnabled({ getItem: () => null })).toBe(false);
  });

  it("loads the developer toggle from true", () => {
    expect(readDeveloperToolsEnabled({ getItem: () => "true" })).toBe(true);
  });

  it("removes the setting when disabled", () => {
    const removeItem = vi.fn();
    writeDeveloperToolsEnabled({ setItem: vi.fn(), removeItem }, false);
    expect(removeItem).toHaveBeenCalledWith(DEVELOPER_TOOLS_ENABLED_KEY);
  });

  it("reports matching Local and Scene heads as synced", () => {
    expect(snapshot().rows[0].status).toBe("synced");
  });

  it("reports pending local IDs as pending", () => {
    expect(snapshot(local([entry(history(), ["root"])])).rows[0].status).toBe(
      "pending",
    );
  });

  it("reports multiple heads as branched", () => {
    const branched = history(["left", "right"]);
    expect(
      snapshot(local([entry(branched)]), scene([branched])).rows[0].status,
    ).toBe("branched");
  });

  it("reports differing Local and Scene heads as drift", () => {
    expect(
      snapshot(local([entry(history(["local"]))]), scene([history(["scene"])]))
        .rows[0].status,
    ).toBe("drift");
  });

  it("reports a room-only Character as local missing", () => {
    const record = activeRecord("character-1", { writeId: "room" });
    const value = buildCharacterPersistenceDevSnapshot(
      { [CHARACTER_KEY_PREFIX + record.id]: record },
      local([]),
      scene([]),
      true,
    );
    expect(value.rows[0].status).toBe("local-missing");
  });

  it("reports a local Character without scene history as scene missing", () => {
    expect(snapshot(local(), scene([])).rows[0].status).toBe("scene-missing");
  });

  it("reports an unready scene as scene unavailable", () => {
    expect(snapshot(local(), undefined, false).rows[0].status).toBe(
      "scene-unavailable",
    );
  });

  it("gives malformed local or scene entries issue precedence", () => {
    const localScan = local();
    localScan.issues.push({
      key: "bad",
      characterId: "character-1",
      code: "MALFORMED",
      message: "bad local entry",
    });
    const sceneScan = scene();
    sceneScan.issues.push({
      key: "bad-scene",
      characterId: "character-1",
      code: "MALFORMED",
      message: "bad scene entry",
    });
    const value = snapshot(localScan, sceneScan);
    expect(value.rows[0].status).toBe("issue");
    expect(value.rows[0].issues).toHaveLength(2);
  });

  it("shows abbreviated revision IDs while preserving full IDs in titles", () => {
    const writeId = "1234567890-full-revision-id";
    const value = snapshot(
      local([entry(history([writeId]))]),
      scene([history([writeId])]),
    );
    const markup = buildCharacterPersistenceDevMarkup(value, false, undefined);
    expect(markup).toContain(`title="${writeId}"`);
    expect(markup).toContain("12345678…");
  });
});
