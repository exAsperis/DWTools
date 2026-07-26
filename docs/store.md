---
title: DWTools
description: Dungeon World creature stats, HP tracking, and damage rolls directly on Owlbear Rodeo character tokens.
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

## Damage expressions

DWTools supports standard expressions such as `d6`, `2d6+1`, and `2d8-1`.
Dungeon World's best-of and worst-of notation is also supported, for example
`b[2d6]+1` and `w[2d8]-1`.

## Support

For help, bug reports, or feature requests, open an issue in the
[DWTools GitHub repository](https://github.com/exAsperis/DWTools/issues).
