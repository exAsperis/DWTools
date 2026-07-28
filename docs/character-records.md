# DWTools character-record engineering notes

Last updated: 2026-07-27

This document records the architecture and operational limits of persistent
room-level character records.

## Data ownership

The authoritative character record lives in Owlbear room metadata under one
independent key per record:

```text
com.ex-asperis.dwtools/character/<character-id>
```

The manifest is discovered by scanning that prefix. There is no monolithic
record map and no separate index.

Each linked scene token stores a versioned relationship under:

```text
com.ex-asperis.dwtools/character-link
```

The link is a DWTools relationship only. It does not change Owlbear ownership,
permissions, `createdUserId`, image data, visibility, position, scale, rotation,
layer, or selection. An explicit link can optionally copy the Character name
to the native token label according to the room-wide **Overwrite label**
preference, which defaults to enabled.

The room record is authoritative. A linked token retains a synchronized
scene-local copy of the persistent creature data so existing overlays and UI
continue to read the established creature metadata. The Character name remains
part of the record, but the token's native label is overwritten only during an
explicit link when requested. Later synchronization does not change it.

Inventory and Load are never copied to Creature token metadata. Multiple tokens
linked to one Character therefore share the same canonical inventory without
creating redundant scene metadata.

## Persistent fields

`CreatureFields` derives from the existing `CreatureData` schema and adds the
Character's name. When first created from a token, that name comes from the
token's native label. It includes:

- name;
- tags;
- current and maximum HP;
- armor;
- damage expression, description, and tags;
- instinct;
- moves;
- treasure; and
- player-overlay visibility.

Schema 2 adds two optional top-level Character fields:

- `maxLoad`, a finite nonnegative number; and
- `inventory`, a compact array of `[name, unitWeight, count]` tuples.

Schema-1 records are defaulted non-destructively to no maximum Load and an empty
inventory. Empty inventory arrays are omitted when written.

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

Inventory mutations retain the selected source-array index and original tuple.
Each command reads the latest record, checks that index for the exact tuple, and
falls back to one exact tuple match if the array shifted. A missing match fails
without changing another row. GM transfers re-read and validate both records,
then submit both independent metadata keys in one `setMetadata` update and
confirm both write IDs.

## Character access

GMs can list and edit every Character. Players can list and edit only Characters
linked to Character-layer tokens they currently control in the active scene.
Control follows Owlbear's Character update permission, optional Owner Only
permission and `createdUserId`, plus token lock state. Duplicate links are
deduplicated by Character ID.

Authorization is re-read from Owlbear immediately before every Character or
inventory mutation. Losing token control invalidates an open player editor.
This is an interface permission boundary over synchronized room metadata, not
strong per-user data secrecy.

## Inventory interaction

Inventory is edited only in the main-panel **Characters** section. Each item
uses two compact lines: its name and actions on the first line, then unit
weight, decrement/count/increment controls, and calculated row Load on the
second. Editable values remain visually borderless until focused.

Adding or saving an item scrolls only as needed to keep the inventory draft or
**Add Item** control visible. Routine additions do not produce success
notifications. This preserves a stable viewport for entering several items in
sequence.

The token context menu shows the linked Character's current and maximum Load
for quick reference, but all inventory mutations remain in the main panel.

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
  current scene receive the record's creature data while retaining their
  individual native token labels.
- A failed record write leaves token fields unchanged.

Do not add an arbitrary scene-item watcher that writes token changes back to a
record. Token-to-record updates must remain explicit commands to avoid
feedback loops and ambiguous authority.

The existing background page subscribes to room metadata and scene readiness.
Changed records synchronize current-scene tokens. Opening a scene performs a
full linked-token synchronization. Missing records retain their links for
orphan recovery. Legacy tombstones from version 1.1.1 still remove stale links
while they exist, preserving backward compatibility.

Version 1.2.2 changed the DWTools namespace from
`com.bryan.dungeon-world-creatures` to `com.ex-asperis.dwtools`. Startup moves
room settings and character records atomically, while each scene's creature
and character-link metadata moves when that scene is opened. New-namespaced
values win conflicts, migrated legacy keys are removed immediately, and the
absence of legacy keys makes the migration idempotent.

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

The compact inventory-entry workflow, stable viewport, Load calculations, and
removal of the redundant Basic Moves/Special Moves divider were confirmed by
the project owner in the live Owlbear environment on 2026-07-27.

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
