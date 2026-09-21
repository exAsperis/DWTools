# DWTools character-record engineering notes

Last updated: 2026-09-21

This document records the architecture and operational limits of persistent
Character records.

## Data ownership

The authoritative Character history lives in browser local storage and is
synchronized through Owlbear scene metadata. Owlbear room metadata under the
following prefixes is frozen, read-only migration input:

```text
com.ex-asperis.dwtools/character/<character-id>
```

Production code never writes or deletes these room keys. At bootstrap, under
the room-wide Character mutation lock, DWTools recovers any inventory-transfer
journal, imports both legacy room namespaces, and validates local storage. Any
unsafe collision, malformed source, malformed local entry, or failed recovery
blocks Character startup; there is no room-authoritative fallback.

Each linked scene token stores a versioned relationship under:

```text
com.ex-asperis.dwtools/character-link
```

The link is a DWTools relationship only. It does not change Owlbear ownership,
permissions, `createdUserId`, image data, visibility, position, scale, rotation,
layer, or selection. An explicit link can optionally copy the Character name
to the native token label according to the room-wide **Overwrite label**
preference, which defaults to enabled.

The local/scene revision history is authoritative. A linked token retains a synchronized
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

Room records using older schemas are normalized to schema 4 with no parents
before insertion into a Character history. Revisions embedded in histories
must already use schema 4.

The pure helpers in `creatureFields.ts` are the canonical mapping between an
Owlbear item and a character record. Do not add another field mapping in a UI
component.

## Repository and concurrency

Production surfaces depend on `CharacterRepositoryContract` and use
`CharacterLocalRepository`. The legacy room `CharacterRepository` remains only
for migration compatibility and focused tests.

Bootstrap, room imports, local mutations, transfer recovery, and complete
reconciliation executions share one room-wide Web Lock. Startup ordering is:
journal recovery, frozen-room import, local validation, scene reconciliation,
linked-token synchronization, then normal subscriptions. Room change events
may import newer legacy descendants but are serialized through the same lock;
room Character keys remain untouched.

Every production authority reconciles its local history with the current ready
scene before its repository is exposed. Failed/retry results and unsafe
collisions block startup. Safely combined multi-head histories remain readable
as explicit conflict state until a GM creates a resolution revision.

Inventory mutations retain the selected source-array index and original tuple.
Each command reads the latest record, checks that index for the exact tuple, and
falls back to one exact tuple match if the array shifted. A missing match fails
without changing another row. GM transfers re-read and validate both records,
then commits both local entries through the recovery journal.

## Character access

GMs can list and edit every Character. Players can list and edit only Characters
linked to Character-layer tokens they currently control in the active scene.
Control follows Owlbear's Character update permission, optional Owner Only
permission and `createdUserId`, plus token lock state. Duplicate links are
deduplicated by Character ID.

Authorization is re-read from Owlbear immediately before every Character or
inventory mutation. Losing token control invalidates an open player editor.
This is an interface permission boundary over synchronized Character data, not
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

The old 16 KiB room-metadata Character capacity no longer governs new Character
mutations. Frozen room Character records may temporarily continue consuming
room metadata until migration retirement. Small DWTools settings still use
room metadata.

## Synchronization direction

All explicit DWTools creature mutations use `CreatureService`.

- Unlinked tokens update only their scene item.
- Linked tokens append to authoritative local Character history first.
- After a successful record write, all tokens linked to that character in the
  current scene receive the record's creature data while retaining their
  individual native token labels.
- A failed record write leaves token fields unchanged.

Do not add an arbitrary scene-item watcher that writes token changes back to a
record. Token-to-record updates must remain explicit commands to avoid
feedback loops and ambiguous authority.

The background page reconciles local Character histories with the ready scene
replica before linked-token synchronization. Frozen room changes from old
clients are imported only as revision knowledge and never receive special
authority.

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

Deletion appends a versioned tombstone descended from the active revision.
History is retained and the tombstone synchronizes through scene metadata.
Current-scene linked tokens are unlinked by normal Character synchronization.
Frozen room records remain untouched and cannot resurrect a known tombstone.

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
- Room metadata is synchronized extension state, not secret storage.
- Local-server extension testing is currently nonfunctional. Follow the
  standing internal-QC, GitHub push, and live pre-production testing directive
  recorded in the project decision documents.

## Local/scene persistence

Browser-local `CharacterHistory` is the production authority. Scene
`CharacterHistory` is its shared synchronization replica. Room Character
records are frozen migration and old-client compatibility input; production
code never writes or deletes them. Bootstrap fails closed when recovery,
import, validation, or ready-scene reconciliation cannot complete safely.

Automatic merge revisions are deterministic across clients. Their identity is
derived from the Character ID, merge base, and parent revision IDs; automatic
merge audit metadata is also deterministic. Two clients independently merging
the same revisions therefore manufacture the same revision rather than creating
competing merge commits.

## Local-first mutation repository

`CharacterLocalRepository` is used by the Character UI, CreatureService, and
linked-token synchronization.

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

Relative HP and XP adjustments are applied to the latest active local head
while holding the mutation lock. Multi-head conflicts remain read-only until a
GM selects one complete head; resolution creates a new revision whose parents
contain every observed current head, preserving all branch ancestry.

### Inventory transfer journal

A local-first inventory transfer changes two independent Character localStorage
entries and therefore cannot rely on localStorage for multi-key atomicity.

Transfers use a room-scoped write-ahead recovery journal while holding the same
room-wide Character mutation lock used by ordinary mutations. The journal
contains validated before and intended-after Character entries for both sides.

The durable write order is:

1. journal intent;
2. source Character;
3. destination Character;
4. journal removal.

If execution stops after the journal is durable, recovery completes the
transaction forward. Recovery first classifies both Character states before
making any write. A Character still at the recorded before-history can receive
its intended after-state. A Character that already contains the exact intended
after revision is considered applied, even if later descendants now exist.
Any incompatible state blocks automatic recovery and preserves the journal for
inspection.

The journal is not used to roll back already-written transfer revisions.
Preserving immutable revisions avoids erasing history that may already have
synchronized to another browser or the active scene.

Before local-first production startup permits Character mutations or starts
scene reconciliation, any pending transfer journal must be recovered or
surfaced as a blocking persistence error.
