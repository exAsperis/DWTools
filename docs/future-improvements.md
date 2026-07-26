# DWTools future improvements

This document records requested improvements that are not yet implemented.
Effort labels describe the current codebase, not priority or commitment:

- **Simple:** localized data, validation, styling, or form changes.
- **Moderate:** coordinated changes across multiple surfaces and tests.
- **Major:** a broad renderer/layout change with substantial regression and
  manual integration testing.

## Creature data

### Additional creature fields — Implemented in 0.3.0

Add optional single-line text fields to creature metadata:

- `tags` — for example, `Solitary, Small, Intelligent, Stealthy, Devious`;
- `damageDescription` — for example, `Dagger`, `Claws`, or
  `Judgmental stare`; and
- `damageTags` — for example, `Close, Reach, Messy, Forceful`.

These are additive optional fields, so existing token metadata remains
compatible. Version 0.3.0 added them to the edit form, context menu, preview
data, and tests without changing the persistent token overlay.

## Main extension panel

### Default overlay visibility — Implemented in 0.4.0

The main DWTools extension panel gives GMs a per-room eye/eye-off toggle that
chooses whether newly created creature overlays are shown to players by
default. Rooms without a stored setting retain the original visible default.
The setting initializes new creature metadata only and never changes existing
creatures or overlays.

## Context menu panel

### Field label icons — Implemented in 0.3.0

- Replace `ARM` with the existing shield vector icon.
- Replace `DMG` with a sword vector icon.

Use shared native vector geometry rather than platform-dependent emoji. The
context panel can serialize that geometry as inline SVG, matching the existing
visibility and armor icon architecture.

### Three-line layout — Implemented in 0.3.0

Rearrange the interactive context-menu panel as follows:

1. visibility control followed by italic creature tags;
2. shield, armor value, HP decrement, current/max HP, and HP increment; and
3. sword, damage formula, damage description in parentheses, and italic damage
   tags.

Continue with Instinct, Moves, Treasure, and `Edit creature` as currently.

This is a coordinated HTML and CSS change rather than a scene-renderer
redesign. It also depends on the three new metadata fields and sword icon. The
main design work is handling long tags and descriptions within the context
menu's constrained width while keeping the HP and visibility controls usable.
Add rendering tests or representative previews for missing, short, and long
values, and manually verify both Owlbear themes.

## Token overlay

### Slightly larger type — Implemented in 0.4.1

Armor and damage use independent type scales approximately eight percent larger
than their previous sizes. HP type and geometry remain unchanged. The gap
between the stat row and HP bar was reduced from 2.5% to 0.8% of overlay width,
so the overall two-line footprint became slightly smaller rather than larger.

### Damage icon — Implemented in 0.4.1

The die glyph was replaced with the shared upright sword geometry rendered as a
native Owlbear Path. The damage expression remains a separate plain Text item,
and the sword has its own deterministic component ID so existing overlays gain
it through in-place reconciliation.

Do not use a color emoji in overlay Text. Prior live testing showed Owlbear's
canvas Text renderer corrupts color emoji. Native Path icons are the established
compatible approach.

## Creature edit form

### Normalize integer damage on field exit — Simple

When the damage field loses focus, convert a positive integer to standard die
notation; for example, `8` becomes `d8`. Preserve already valid expressions
such as `d6`, `2d6+1`, `b[2d10]+1`, and `w[2d8]-1`.

Define invalid and edge-case behavior in tests, including blank input, zero,
negative values, decimals, surrounding whitespace, and integers above the
parser's supported side limit.

### Layout update — Implemented in 0.3.0

Reorder the full creature editor as follows:

1. creature tags, with a dim example suggestion;
2. armor and current/maximum HP;
3. damage formula and description, with a dim description suggestion;
4. damage tags, with a dim example suggestion;
5. instinct;
6. moves;
7. treasure;
8. player-overlay visibility; and
9. the existing Remove data and Save actions.

Remove the full editor's HP adjustment buttons and Roll damage button.

The separate HP-only editor retains its quick adjustment controls.

## Suggested implementation grouping

1. Add the three metadata fields, editor layout, context-menu icons, and
   three-line layout. **Completed in 0.3.0.**
2. Add and persist the GM's default visibility setting. **Completed in
   0.4.0.**
3. Adjust the token overlay's type scale and replace its damage die with the
   sword Path icon. **Completed in 0.4.1.**

This sequence establishes the data before displaying it in the context menu and
keeps the regression-sensitive token-overlay adjustments isolated.
