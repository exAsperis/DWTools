import type { Item } from "@owlbear-rodeo/sdk";
import { describe, expect, it } from "vitest";
import {
  accessibleCharacterIdsFromTokens,
  playerControlsCharacterToken,
  type CharacterAccessSnapshot,
} from "./characterAccess";
import { token } from "./characterTestHelpers";

function linkedToken(
  id: string,
  characterId: string,
  owner: string,
  locked = false,
): Item {
  return Object.assign(
    token(id, characterId, {}, { schemaVersion: 1, characterId }),
    { createdUserId: owner, locked },
  );
}

describe("Character access from controlled Owlbear tokens", () => {
  const ownedSnapshot: CharacterAccessSnapshot = {
    role: "PLAYER",
    playerId: "player-1",
    canUpdateCharacters: true,
    ownerOnly: true,
  };

  it("uses CHARACTER_UPDATE, Owner Only, createdUserId, and lock state", () => {
    expect(
      playerControlsCharacterToken(
        linkedToken("owned", "hero", "player-1"),
        ownedSnapshot,
      ),
    ).toBe(true);
    expect(
      playerControlsCharacterToken(
        linkedToken("other", "hero", "player-2"),
        ownedSnapshot,
      ),
    ).toBe(false);
    expect(
      playerControlsCharacterToken(
        linkedToken("locked", "hero", "player-1", true),
        ownedSnapshot,
      ),
    ).toBe(false);
    expect(
      playerControlsCharacterToken(linkedToken("owned", "hero", "player-1"), {
        ...ownedSnapshot,
        canUpdateCharacters: false,
      }),
    ).toBe(false);
  });

  it("deduplicates multiple controlled tokens linked to one Character", () => {
    const ids = accessibleCharacterIdsFromTokens(
      [
        linkedToken("one", "hero", "player-1"),
        linkedToken("two", "hero", "player-1"),
        linkedToken("three", "wagon", "player-2"),
      ],
      ownedSnapshot,
    );
    expect([...ids]).toEqual(["hero"]);
  });

  it("lets the GM control all linked Character tokens", () => {
    const ids = accessibleCharacterIdsFromTokens(
      [
        linkedToken("one", "hero", "player-1", true),
        linkedToken("two", "wagon", "player-2"),
      ],
      {
        role: "GM",
        canUpdateCharacters: true,
        ownerOnly: false,
      },
    );
    expect([...ids]).toEqual(["hero", "wagon"]);
  });
});
