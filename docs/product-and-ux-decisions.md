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
Creature data belongs on the token. Each client independently derives the
visual overlay appropriate to that player's role.

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

- The compact visibility, armor, and damage row sits immediately above the HP
  bar.
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
- Player visibility uses an open eye when visible and an eye inside a
  prohibition circle when hidden. The overlay and context menu derive from the
  same native vector geometry.
- Armor uses a shield outline on the overlay. A diamond is not an armor symbol.
- Overlay components use compact dark backgrounds, white icon/text treatment,
  and green/amber/red HP status colors.

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

## Decision history

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
