# DWTools product and UX decisions

This document records intent, not just current behavior. Future contributors
must distinguish explicit product decisions from incidental implementation
details. When a user-requested change supersedes a decision, preserve the
history here and record the new decision and its reason.

## Product purpose

DWTools is an at-the-table Dungeon World aid for Owlbear Rodeo. It should make
the small set of monster facts needed during play immediately available on the
map, while keeping fuller notes one quick action away.

The extension should:

- reduce lookup and bookkeeping during play;
- let a GM edit monster data quickly from the token;
- show only glanceable combat information on the token;
- preserve Owlbear's normal token manipulation behavior;
- avoid adding visual or synchronization noise to the scene; and
- remain a reliable base for future Dungeon World-specific features.

The overlay is a presentation of token metadata, not the source of truth.
For unlinked creatures, creature data belongs on the token. For linked
creatures, a persistent room character record is authoritative and the token
contains a synchronized scene-local copy. Each client independently derives
the visual overlay appropriate to that player's role from the token copy.

## Information hierarchy

The persistent token overlay contains only the combat summary:

- whether the overlay is shared with players;
- armor;
- damage; and
- current and maximum HP.

Instinct, moves, treasure, and other longer-form Dungeon World material belong
in the editor rather than on the always-visible overlay. New features should
not be added to the overlay merely because space can be made for them. They
should earn persistent map space by being needed at a glance during play.

## Explicit overlay design choices

These choices are intentional:

- The compact armor and damage row sits immediately above the HP bar.
- The HP bar sits near the bottom of the token portrait.
- The HP bar is aligned from the rendered portrait's **left edge**, with an
  explicit equal inset on both sides. It does not need to be 100% of the token
  width. The current inset is 8% per side, giving an 84%-wide bar.
- The HP text uses exactly the same left, top, width, and height as the HP bar.
  It is vertically and horizontally centered inside the bar.
- HP text is opaque white with a dark outline and appears in front of both the
  bar background and fill. It must never look covered by a translucent shape.
- Hiding an overlay from players does **not** dim it for the GM. The visibility
  icon is the GM's indicator. A dimmed GM overlay is redundant and makes combat
  information harder to read.
- A player-hidden overlay is absent on player clients, rather than present at
  reduced opacity.
- The GM retains a full-bright overlay when the token itself is hidden.
- A hidden token never leaves its overlay visible to players, even when the
  overlay's player-visibility setting is enabled.
- The persistent overlay uses no marker when shared with players and places an
  eye inside a prohibition circle at the far-left of the HP bar when hidden.
  Interactive controls retain explicit eye/eye-off states.
- Armor uses a shield outline on the overlay. A diamond is not an armor symbol.
- Overlay components use compact dark backgrounds, white icon/text treatment,
  and green/amber/red HP status colors, with purple reserved for over-maximum
  HP.

If exact spacing or type scale later needs adjustment for a real token, retain
the relationships above unless the user explicitly changes them.

## Motion and stability are part of the UX

A technically eventual result is not acceptable if it visibly flashes,
duplicates, or trails behind a token.

Expected behavior:

- the overlay remains visually attached during continuous dragging;
- position-only movement performs no renderer writes;
- refresh reaches one stable overlay promptly;
- HP and visibility edits update without deleting and recreating the whole
  overlay;
- old-position ghosts never reappear after movement; and
- multiple extension clients cannot compete over one shared visual overlay.

The absence of flashing and ghosting is a product requirement, not merely a
performance optimization.

## Interaction preferences

- Editing starts from the selected character token's DWTools context action.
- Editors update token metadata only. They do not directly create, delete, or
  synchronize overlay items.
- Removing DWTools data removes the metadata-derived overlay.
- Use the visibility icon for immediate feedback; do not encode the same state
  by degrading GM readability.
- Preserve the user's scene position and selected token when conducting manual
  verification whenever practical.

## Architecture choices that protect the experience

The following technical constraints exist because they preserve the intended
UX:

- Shared `OBR.scene.items` store creature metadata; local
  `OBR.scene.local` items provide client-specific visuals.
- One background coordinator is the only overlay writer.
- Overlay component IDs are deterministic by token and role.
- Position attachment behavior remains enabled so Owlbear moves overlays with
  their tokens.
- Text uses explicit `TEXT` items and explicit bounding boxes. It does not use
  Owlbear Labels, whose pointer/body layout has repeatedly caused alignment
  ambiguity.
- Rendering is serialized and latest-wins. A stale asynchronous pass must not
  overwrite a newer state.

See `overlay-engineering-notes.md` for implementation detail and failure
history.

Persistent character-record architecture and limits are recorded in
[`character-records.md`](character-records.md).

## Acceptance criteria for future changes

Before treating an overlay change as complete, verify:

- the HP text and bar share a box and the text is visibly in front;
- left alignment follows the rendered portrait, not a guessed token center;
- the GM sees full-brightness overlays regardless of player visibility;
- players do not see player-hidden overlays;
- the GM retains overlays for hidden tokens while players do not;
- dragging, refresh, and idle time produce no flash, duplicates, or ghosts;
- scaling and rotation retain correct portrait-relative layout;
- no new DWTools visual items are written to shared scene items; and
- automated geometry, visibility, reconciliation, and stale-pass tests pass.

Some integration cases require more than one signed-in client. If those clients
are unavailable, record the unverified cases rather than implying they passed.

## Planned changes

Remaining proposals in [`future-improvements.md`](future-improvements.md) are
recorded future work, not current behavior. The implemented three-line layout
is for the interactive context-menu panel, not the persistent token overlay.
The persistent overlay retains its compact two-line information hierarchy and
client-local, single-writer renderer architecture.

## Decision history

### 2026-07-27 — Main panel follows Owlbear theme and groups moves

The main panel takes its background, surface, text, secondary text, disabled
text, and primary accent colors from `OBR.theme`, and updates immediately when
the Owlbear theme changes. Operating-system color-scheme media queries are not
used to determine the extension panel theme.

The Moves section contains independently collapsible Basic Moves and Special
Moves subsections. Basic Moves is expanded by default and Special Moves is
collapsed by default; both states use the existing per-browser section-state
persistence. All thirteen Dungeon World Special Moves are available as the
same dialog links used for Basic Moves.

Reason: extension surfaces should remain visually consistent with Owlbear
across desktop and mobile, and grouping the complete shared move set keeps a
larger reference list quick to scan.

### 2026-07-26 — Main panel prioritizes table references

The main panel uses a compact single-line DWTools brand header followed by
collapsible reference and management sections. The GM-only Agenda is expanded
by default; Moves is available to everyone and expanded by default; GM-only
Settings and Character Records are collapsed by default. Section expansion is
stored as a per-browser preference so it persists without consuming room
metadata.

The default new-character overlay setting is inside Settings. Character
Records omits search, places **New** beneath the room-metadata usage bar, and
does not load its visual list into the open panel until expanded. Each basic
move opens its complete rules text in a dialog.

Reason: the panel should function first as an at-the-table Dungeon World
reference, while infrequent room configuration and record management remain
quickly available without dominating the limited panel space.

### 2026-07-26 — Character deletion relies on orphan recovery

Deleting a character unlinks current-scene tokens without changing their
creature fields, then removes the authoritative room-metadata key immediately.
Linked copies in closed scenes become missing-record orphans and must be
resolved manually through the existing creature-editor recovery actions.

DWTools no longer creates tombstones or exposes tombstone-management UI. When
the GM manager encounters valid tombstones created by version 1.1.1, it removes
those legacy keys idempotently so they stop consuming shared room metadata.

This supersedes the two tombstone decisions below.

Reason: returning to a closed scene containing a previously linked copy of a
deleted character is rare, while orphan recovery already preserves the copied
creature data and provides appropriate manual choices. Direct deletion is
simpler and avoids a permanent metadata cost for an uncommon case.

The project owner confirmed this direct-delete and orphan-recovery workflow in
live Owlbear testing on 2026-07-26.

### 2026-07-26 — Tombstones are visible on demand and can be purged

The GM character manager places a **Show tombstoned characters** checkbox
directly beneath room-metadata usage. Deleted records remain absent from the
ordinary list; when requested, they appear as muted, explicitly labeled cards.
New compact tombstones retain the character name for recognition, while older
tombstones fall back to a shortened record ID.

Only tombstoned records offer **Delete permanently**. Permanent deletion
removes that character's independent room-metadata key and warns that links in
closed scenes will become orphaned. Current-scene stale links are removed
without changing creature fields. The outdated sample overlay is no longer
shown in the main panel.

Reason: tombstones provide safe cross-scene deletion semantics but consume
scarce shared room metadata. An explicit, GM-only purge path makes that cost
recoverable while preserving the safe default and clearly communicating the
closed-scene consequence.

This was superseded by direct deletion and orphan recovery after evaluating the
expected frequency of returning to linked copies in closed scenes.

### 2026-07-26 — Room character records are authoritative for linked tokens

DWTools supports versioned room-level character records that persist across
scenes. Tokens opt into persistence through a separate versioned link metadata
key; existing tokens are never linked or converted automatically.

Each record uses an independent namespaced room-metadata key. The record
contains every persistent DWTools creature field, including the native token
name and player-overlay visibility. A linked token keeps a complete copy in its
existing creature metadata so established overlays and editor surfaces remain
compatible.

Explicit DWTools mutation commands update the record first and then synchronize
all linked tokens in the current scene. Room-record changes and scene readiness
also synchronize record data down to tokens. Arbitrary scene-item changes never
write back to records.

Deletion uses compact tombstones. Current-scene tokens are unlinked without
losing fields, and stale links encountered in later scenes are removed when
that scene opens. Missing records without tombstones retain their links for
explicit orphan recovery.

Reason: characters need durable identity and state across scenes without
replacing the stable token-metadata overlay architecture or creating
bidirectional synchronization loops.

The tombstone portion of this decision was superseded by direct deletion and
orphan recovery. The authoritative-record and synchronization architecture
remains unchanged.

### 2026-07-26 — Live deployment is the integration-test environment

Local extension testing through a local server is currently nonfunctional.
Until the project owner explicitly revokes this directive, changes must first
complete internal quality checks, then be pushed to GitHub. The push
automatically updates the hosted site, after which integration and manual
testing may be performed in the live environment.

This is a temporary standing workflow decision while the extension is not yet
in production. It authorizes live-environment testing only after internal QC;
it does not reduce the project's automated-test, build, generated-output
review, or other release-verification requirements.

Reason: the local-server extension workflow cannot currently provide a usable
test environment, while the pre-production hosted site can.

### 2026-07-26 — Version 1.0 uses the supplied DWTools brand

The supplied crossed wrench-and-sword DWTools logo is the extension icon in
Owlbear Rodeo, the main panel brand, the browser icon, and the store listing.
The editable source remains at the repository root as `extension-logo.svg`;
the release build consumes its published copy at `public/icon.svg`.
The release version is 1.0.0, with synchronized manifest, embedded URL, context
menu, and generated-asset cache-busters.

Reason: the extension is functionally ready for its first public release and
needs one consistent identity across its installed UI and public listing.

### 2026-07-26 — Hidden-only visibility marker moves into the HP bar

The persistent overlay no longer reserves a stat-row pill for visibility.
Armor starts at the overlay's left inset and keeps its existing width. Damage
uses the remaining row width, increasing its formula box by approximately 44%
without changing the font or outer geometry.

When the overlay is hidden from players, the existing eye-off Path appears at
the far-left of the HP bar. Shared overlays show no marker. Player clients
still omit hidden overlays entirely, while context-menu and main-panel controls
retain their explicit eye/eye-off states.

Reason: long Dungeon World damage formulas need more horizontal space, and a
hidden-only HP marker preserves GM feedback without adding player-facing visual
clutter.

### 2026-07-26 — Over-maximum HP is allowed and visually distinct

Quick HP increases are no longer capped at Maximum HP. When Current HP exceeds
Maximum HP, the overlay uses a full purple HP bar, including the edge case of a
positive current value with a zero maximum. Quick decreases retain the existing
zero floor.

For faster initial entry, leaving Current HP copies a nonnegative numeric value
into Maximum HP only when Maximum HP is blank. Existing maximum values are
never overwritten.

Damage entry converts a positive integer such as `8` to `d8` on blur. A
nonblank expression unsupported by the existing damage parser receives a red
border and accessible invalid state after blur; blank values are allowed.

Reason: these behaviors reduce repetitive entry, permit temporary HP beyond a
creature's normal maximum, and make that exceptional state immediately visible.

### 2026-07-26 — All overlay text uses one 140% shared scale

Armor, damage, and HP now use the original HP font size as one common baseline,
increased by 40%. The overlay width, background boxes, insets, row height, HP
geometry, and compact row gap remain unchanged.

This supersedes the independent approximately-eight-percent armor and damage
increase recorded below. Live normal-zoom testing showed that adjustment was
too subtle to solve the readability problem.

Reason: a substantial shared increase makes every numeric combat value readable
at the same visual scale while preserving the overlay footprint already proven
stable in Owlbear.

### 2026-07-26 — Overlay readability changes preserve HP geometry

Armor and damage text use independent type scales approximately eight percent
larger than before. HP type, bar geometry, overall width, insets, and stat-row
height remain unchanged. Reducing the stat-to-HP gap from 2.5% to 0.8% of
overlay width makes the two-line footprint slightly smaller.

The damage die glyph is replaced by the shared upright sword rendered as a
native Path with its own deterministic component ID. The damage expression
remains a separate plain Text item. The layout version advances so existing
components update in place and only the missing sword is added.

Reason: armor and damage need better normal-zoom readability without enlarging
or destabilizing the overlay that previously required extensive live tuning.

### 2026-07-26 — New-creature visibility default is room-scoped

The main DWTools panel gives GMs a shared per-room default for whether newly
created creature overlays are visible to players. A missing or malformed room
setting defaults to visible, preserving prior behavior. Players do not see the
setting.

The preference is consulted only when a token has no valid DWTools creature
metadata. Existing and legacy creature data remain unchanged, even when their
visibility is implicit. Removing data and adding it again initializes from the
room's current default.

Reason: different rooms can adopt different sharing conventions without a
preference change rewriting token metadata or causing overlay renderer work.

### 2026-07-26 — Sword icon uses a complete upright silhouette

The damage sword uses a centered upright design with a pointed double-edged
blade, crossguard, outlined grip, and diamond pommel.

Reason: the first diagonal sword geometry read as an abstract arrow at the
context panel's small icon size. A complete symmetric silhouette remains
recognizable without relying on color emoji.

### 2026-07-26 — Rich creature details remain in interactive UI

Creature tags, damage descriptions, and damage tags are optional token metadata
shown in the editor and interactive context-menu panel. The context menu uses a
three-line summary with wrapping descriptive text and retains HP, visibility,
and damage-roll interactions. The persistent scene overlay remains limited to
its existing compact combat summary.

Reason: the added Dungeon World details are valuable when inspecting a creature,
but they should not enlarge or destabilize the always-visible token overlay.

### 2026-07-25 — Hidden tokens retain GM-only overlays

Token visibility affects player rendering but not GM rendering. A GM continues
to see the full-bright overlay when a token is hidden. Player clients omit the
overlay whenever the token is hidden, regardless of the overlay's own
player-visibility setting.

GM overlays disable inherited attachment visibility. Player overlays retain
Owlbear's inherited visibility behavior so they hide immediately with the
token, before local reconciliation removes them.

Reason: hidden tokens still need glanceable combat bookkeeping for the GM, but
their local overlays must not reveal them to players.

### 2026-07-25 — Native Path icons replace canvas emoji

The context panel renders inline SVG from shared path geometry, while the
overlay renders the same geometry as native Owlbear Path items.

Reason: emoji work in the HTML iframe but Owlbear's canvas Text renderer
corrupts color emoji into red/yellow artifacts. Native Paths avoid both the
image loader and color-emoji font rendering.

### 2026-07-25 — Emoji replace failed SVG image items

Visibility now uses `👁️` / `🚫`, and armor uses `🛡️`. They are native Text
items in the overlay and the same emoji strings in the context menu.

Reason: Owlbear displayed the SVG data-URI Image items as failed-image
placeholders (red circles with a yellow wedge). Emoji rendering is simpler and
reliable in both surfaces.

This was superseded after live testing showed that emoji are reliable only in
the HTML context panel, not in Owlbear canvas Text items.

### 2026-07-25 — Theme-aware text and shared vector iconography

The context-menu panel now reads Owlbear's active theme and uses its primary
and secondary text colors instead of the operating system's color-scheme
preference. Visibility uses matching vector eye/eye-off art in the menu and
overlay, and armor uses a shield on the overlay.

Reason: iframe media preferences can disagree with Owlbear's selected theme,
and Unicode glyphs render differently by platform and font.

This icon-rendering portion was superseded by the emoji decision above after
live Owlbear testing exposed the failed-image placeholder.

### 2026-07-25 — Stable local renderer and explicit HP alignment

The overlay was moved from shared delete/add rendering to deterministic
client-local rendering. The HP bar was defined as 84% of the portrait width,
left-aligned at an 8% portrait inset. HP text was given the identical explicit
box on the `TEXT` layer. Hidden-from-player overlays remain full brightness for
the GM and are omitted for players.

Reason: prior shared, multi-writer Label/Shape implementations produced
alignment ambiguity, translucent text occlusion, long-running flashes, and
old-position ghosts.
