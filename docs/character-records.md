# DWTools character-record engineering notes

Last updated: 2026-07-26

This document records the architecture and operational limits of persistent
room-level character records.

## Data ownership

The authoritative character record lives in Owlbear room metadata under one
independent key per record:

```text
com.bryan.dungeon-world-creatures/character/<character-id>
```

The manifest is discovered by scanning that prefix. There is no monolithic
record map and no separate index.

Each linked scene token stores a versioned relationship under:

```text
com.bryan.dungeon-world-creatures/character-link
```

The link is a DWTools relationship only. It does not change Owlbear ownership,
permissions, `createdUserId`, image data, visibility, position, scale, rotation,
layer, or selection.

The room record is authoritative. A linked token retains a synchronized
scene-local copy of the complete persistent creature fields so existing
overlays and UI continue to read the established creature metadata.

## Persistent fields

`CreatureFields` derives from the existing `CreatureData` schema and adds the
token's native name. It includes:

- name;
- tags;
- current and maximum HP;
- armor;
- damage expression, description, and tags;
- instinct;
- moves;
- treasure; and
- player-overlay visibility.

The pure helpers in `creatureFields.ts` are the canonical mapping between an
Owlbear item and a character record. Do not add another field mapping in a UI
component.

## Repository and concurrency

`CharacterRepository` owns record discovery, validation, schema migration,
creation, patching, replacement, direct deletion, legacy-tombstone cleanup,
subscriptions, and metadata-size estimation.

Record patches use bounded optimistic retries:

1. read the latest record;
2. merge the requested patch;
3. increment its revision and generate a new write ID;
4. write only the record's independent room-metadata key;
5. read it back and compare the write ID; and
6. merge the original patch onto the new latest record and retry after a
   competing write.

Same-field conflicts are eventual last-write-wins. The retry merge preserves
different-field changes when the competing write can be observed.

## Metadata capacity

Owlbear limits total room metadata, shared by all extensions, to 16 KiB.
DWTools:

- serializes the proposed complete room metadata with `TextEncoder`;
- warns at 80% of Owlbear's limit;
- rejects character writes above a conservative 15 KiB safe maximum;
- reports an actionable capacity error; and
- never applies a linked token edit when its authoritative record write fails.

The GM manager reports approximate total room-metadata use, including other
extensions. DWTools includes that data only when estimating capacity and never
modifies metadata outside its own keys.

## Synchronization direction

All explicit DWTools creature mutations use `CreatureService`.

- Unlinked tokens update only their scene item.
- Linked tokens write the authoritative room record first.
- After a successful record write, all tokens linked to that character in the
  current scene receive the record's complete fields.
- A failed record write leaves token fields unchanged.

Do not add an arbitrary scene-item watcher that writes token changes back to a
record. Token-to-record updates must remain explicit commands to avoid
feedback loops and ambiguous authority.

The existing background page subscribes to room metadata and scene readiness.
Changed records synchronize current-scene tokens. Opening a scene performs a
full linked-token synchronization. Missing records retain their links for
orphan recovery. Legacy tombstones from version 1.1.1 still remove stale links
while they exist, preserving backward compatibility.

## Deletion

Deletion first unlinks current-scene tokens without changing their creature
fields, then removes the active record's independent room-metadata key. DWTools
cannot inspect closed scenes, so tokens still linked there become
missing-record orphans. Their creature editor provides explicit recovery
actions to relink, create a replacement record from the current fields, or
unlink while retaining those fields.

Schema-1 tombstones created by version 1.1.1 remain valid migration input. The
GM manager removes those legacy tombstone keys idempotently before listing
records, freeing their room-metadata space. DWTools no longer creates new
tombstones.

The direct-delete and missing-record recovery workflow was confirmed by the
project owner in the live Owlbear environment on 2026-07-26.

## Durable limitations

- DWTools cannot inspect or update tokens in closed scenes. Those tokens
  synchronize when their scene becomes ready.
- A linked-token count is therefore always labeled as applying to the current
  scene only.
- The 16 KiB room-metadata limit is shared with every enabled extension.
  Character capacity depends on field lengths and other extensions' usage.
- Room metadata is synchronized extension state, not secret storage.
- Local-server extension testing is currently nonfunctional. Follow the
  standing internal-QC, GitHub push, and live pre-production testing directive
  recorded in the project decision documents.
