---
title: DWTools
description: Persistent Dungeon World characters, creature stats, HP tracking, and damage rolls for Owlbear Rodeo.
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
- Automatic synchronization when a linked character changes or its scene opens
- A searchable GM character manager with room-metadata usage reporting
- GM-only editing with player-safe, client-local overlays
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

### Manage characters

GMs can open the main DWTools action and use **Character Records** to:

- search, create, and edit room characters;
- view compact HP, armor, and damage summaries;
- see linked-token counts for the current scene;
- monitor approximate room-metadata usage; and
- delete records.

Deleting a record requires confirmation. Current-scene tokens are unlinked but
retain their copied fields. Linked tokens found when another scene opens are
also unlinked without losing their creature data.

Use **Show tombstoned characters** beneath the room-metadata bar to review
deleted records. Tombstones are visually labeled and can be deleted
permanently to reclaim their storage. Permanent deletion cannot inspect closed
scenes, so linked tokens there retain their creature data but become orphaned
from the missing record.

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
