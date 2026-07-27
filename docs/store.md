---
title: DWTools
description: Persistent Dungeon World characters, inventories, Load tracking, creature stats, and damage rolls for Owlbear Rodeo.
author: Bryan
image: https://raw.githubusercontent.com/exAsperis/DWTools/main/public/icon.svg
icon: https://exasperis.github.io/DWTools/icon.svg
tags:
  - combat
  - tool
manifest: https://exasperis.github.io/DWTools/manifest.json
learn-more: https://github.com/exAsperis/DWTools
---

# DWTools

DWTools keeps the Dungeon World creature information you need during play
attached to character tokens in Owlbear Rodeo. It gives the GM quick access to
HP, armor, damage, tags, instinct, moves, and treasure without taking over the
map.

## Features

- A compact token overlay for current and maximum HP, armor, and damage
- Quick HP adjustments from a character token's context menu
- Dungeon World damage rolls, including best-of and worst-of expressions
- Creature tags, damage details, instinct, moves, and treasure
- Per-creature and room-default controls for sharing overlays with players
- Persistent room-level character records shared by linked tokens
- Shared inventories with item weights, counts, transfers, and Load tracking
- Automatic synchronization when a linked character changes or its scene opens
- A searchable character manager with controlled-token access for players
- GM-only token editing with player-safe, client-local overlays
- Light and dark theme support

## Using DWTools

1. Install the extension using its
   [public manifest](https://exasperis.github.io/DWTools/manifest.json).
2. As the GM, right-click a character token and select **DWTools**.
3. Enter the creature's details and save.
4. Reopen the token menu to adjust HP, roll damage, or edit its details.

The main DWTools action controls whether new creature overlays are visible to
players by default in the current room. Each creature can override that setting
in its editor.

## Persistent character records

Character records keep a creature's game data available across scenes. They
are stored for the current Owlbear room and can be linked to one or more
character tokens.

### Link a token

1. Right-click the token, choose **DWTools**, and open **Edit creature**.
2. In the **Character record** section, select **Link to character**.
3. Choose an existing record, or select **Create new from this creature**.
4. Confirm before linking an existing record. Its latest fields replace the
   token's current DWTools fields.

After linking, edits to that character update all of its linked tokens in the
current scene. When another scene opens, its linked tokens synchronize from
the same room record.

Use **Change link** to associate the token with another character. Use
**Unlink** to stop synchronization while retaining all current creature
fields on the token.

### Manage characters and inventory

Open the main DWTools action and use **Characters** to manage persistent
records. GMs can see every room character. Players can see and edit only
characters linked to unlocked Character-layer tokens they currently control in
the active scene.

Each expanded character includes an optional maximum Load and an **Inventory**
subsection. Add items, edit names and unit weights, adjust counts, and see both
per-item and total Load. The compact two-line item layout keeps the controls
usable in Owlbear's standard panel, and **Add Item** remains in view during
repeated entry. GMs can also transfer item quantities between characters.

GMs retain room-wide search, creation, deletion, current-scene linked-token
counts, and room-metadata usage reporting.

Deleting a record requires confirmation. Current-scene tokens are unlinked but
retain their copied fields, and the room record is removed immediately. Linked
copies in closed scenes retain their creature data but become orphaned from the
missing record. The creature editor can relink them, create a new record from
their current fields, or unlink them while retaining those fields.

When the editor reports **Orphaned link (missing)**:

- **Relink to existing** adopts the selected character's latest fields;
- **Create new from creature** turns the token's preserved copy into a new room
  character; and
- **Unlink and retain fields** removes only the broken link.

Linked-token counts cover only the current scene; Owlbear extensions cannot
inspect closed scenes. Character records share Owlbear's limited room-metadata
space with other extensions, so DWTools warns near capacity and rejects writes
that would exceed its safe threshold.

## Damage expressions

DWTools supports standard expressions such as `d6`, `2d6+1`, and `2d8-1`.
Dungeon World's best-of and worst-of notation is also supported, for example
`b[2d6]+1` and `w[2d8]-1`.

## Support

For help, bug reports, or feature requests, open an issue in the
[DWTools GitHub repository](https://github.com/exAsperis/DWTools/issues).
