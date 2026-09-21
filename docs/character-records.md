# DWTools character-record engineering notes

Last updated: 2026-09-21

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

Inventory and calculated current Load are never copied to Creature token
metadata. Maximum Load is a shared creature field so it is available to
unlinked creatures and synchronized linked tokens. Multiple tokens linked to
one Character still share one canonical inventory without creating redundant
scene metadata.

## Persistent fields

`CreatureFields` derives from the existing `CreatureData` schema and adds the
Character's name. When first created from a token, that name comes from the
token's native label. It includes:

- name;
- tags;
- current and maximum HP;
- HP base;
- maximum Load and Load base;
- armor;
- damage expression, description, and tags;
- instinct;
- moves;
- treasure; and
- level, XP, and alignment;
- six compact ability-score slots in STR, DEX, CON, INT, WIS, CHA order;
- sparse debility condition key/value pairs; and
- player-overlay visibility.

Schema 2 added two optional top-level Character fields:

- `maxLoad`, a finite nonnegative number; and
- `inventory`, a compact array of `[name, unitWeight, count]` tuples.

Schema 3 moves `maxLoad` into `CreatureFields` while keeping `inventory`
top-level and record-only. Schema-2 records migrate their legacy top-level
maximum into `fields.maxLoad`; schema-1 records default non-destructively to no
maximum Load and an empty inventory. Empty inventory arrays are omitted when
written.

Schema 4 adds explicit revision ancestry through `parents`, an array of direct
parent `writeId` values. `writeId` is the stable identity of a specific
Character revision; the integer `revision` remains a convenience value and is
not used by itself to establish ancestry or authority.

New Characters begin with an empty parent list. An ordinary mutation records
the exact previous record's `writeId` as its sole parent. Schema-1, schema-2,
and schema-3 records migrate non-destructively as earliest-known roots with an
empty parent list while preserving their existing Character ID, revision
number, write ID, timestamps, fields, and inventory. The first subsequent
mutation descends from that preserved legacy write ID.

This schema change is preparatory for the local-first Character persistence
architecture. At this stage, room metadata remains the authoritative live
Character store.

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
3. create a descendant revision whose parent is the latest record's `writeId`,
   increment its numeric revision, and generate a new `writeId`;
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
`com.bryan.dungeon-world-creatures` to `com.ex-asperis.dwtools`. Ordinary room
settings still migrate to the current namespace, and each scene's Creature and
Character-link metadata still migrates when that scene is opened.

During the local-first Character-storage transition, room Character records are
treated differently. Startup namespace migration no longer moves or deletes
Character records from either the legacy or current room namespace. Both are
preserved as non-destructive migration and recovery inputs. The Character room
importer reads both namespaces, normalizes legacy record schemas to schema 4,
combines compatible revision identities, preserves divergent branches, and
imports the resulting history into local storage. Unsafe revision-ID collisions
are reported rather than resolved by choosing one namespace.

Imported room records are not deleted in this phase. Room Character retirement
is a separate later operation performed only after the local/scene persistence
system has been validated.

Room-to-local import is idempotent by `writeId`. Re-reading the same room
snapshot does not create a new Character revision. When imported history adds
new revision knowledge, the resulting local history heads are marked pending
scene synchronization; the reconciliation executor clears that marker only
after scene metadata confirms the desired history.

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

## Shadow local/scene persistence

During the migration validation phase, the existing room Character repository
remains the live authority used by the DWTools UI, linked-token synchronization,
inventory editing, and deletion workflow.

In parallel, the background page runs the new persistence system in shadow
mode. Existing Character records from both supported room namespaces are
imported non-destructively into room-scoped browser local storage. The active
scene stores synchronized Character revision histories in scene metadata.
Room-metadata changes continue to be imported as new revision knowledge, and
the local/scene reconciliation coordinator propagates that history without
writing any result back to room Character records.

Shadow storage is therefore observational and redundant at this stage. Failure
of shadow import or synchronization is logged but does not prevent the existing
room-authoritative Character workflow from operating.

Automatic merge revisions are deterministic across clients. Their identity is
derived from the Character ID, merge base, and parent revision IDs; automatic
merge audit metadata is also deterministic. Two clients independently merging
the same revisions therefore manufacture the same revision rather than creating
competing merge commits.

Physical deletion of an authoritative room Character is intentionally not
treated as a shadow deletion during this phase. Absence is not sufficient
evidence of deletion. The shadow history may retain the deleted Character as
recovery data until versioned tombstone deletion becomes the production model.

## Local-first mutation repository

DWTools now contains a dormant local-first Character mutation repository in
preparation for production cutover. It is not yet used by the Character UI,
CreatureService, or linked-token synchronization.

Local Character read-modify-write operations are serialized within one browser
using one room-scoped exclusive Web Lock. A room-wide lock is deliberately used
instead of per-Character locks so later multi-Character operations can be
coordinated without nested lock ordering.

A local mutation appends a new immutable revision to the CharacterHistory,
moves the history head to that revision, and marks the new head pending scene
confirmation. Existing ancestor revisions remain available for reconciliation
and merge ancestry.

Local deletion is versioned rather than physical. A delete creates a
CharacterTombstone that descends from the previous active head. The previous
active revision and the tombstone both remain in history, allowing stale or
concurrent edits from another browser to be recognized as a delete/edit
divergence rather than silently resurrecting the Character.

A Character with multiple unresolved heads is read-only to the local mutation
repository. Automatic mutation never chooses one conflicting branch.

Relative HP adjustment is applied to the latest active local head while holding
the mutation lock. UI code must eventually call that semantic operation rather
than reading an HP value and converting a relative +/- action into an absolute
write.

Inventory transfer is intentionally excluded from this repository phase because
it changes two localStorage keys. Production transfer requires a durable
transaction journal and recovery procedure in addition to mutation locking.
