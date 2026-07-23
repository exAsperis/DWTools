# Dungeon World Creatures for Owlbear Rodeo

A minimal Owlbear Rodeo extension for keeping Dungeon World creature information on character tokens.

## Features

- Attached on-map display for HP, armor, and damage
- HP current/max with a ten-segment percentage bar
- GM-only context-menu editor for instinct, moves, and treasure
- Quick HP adjustments from the token context menu
- Damage rolls for `d6`, `2d6+1`, `b[2d6]+1`, and `w[2d8]-1` style expressions

## Run locally

1. Install dependencies with `npm install` (or `pnpm install`).
2. Start the development server with `npm run dev`.
3. In Owlbear Rodeo, install `http://localhost:5173/manifest.json` as an extension.

The development server allows requests from `https://www.owlbear.rodeo`.

## Build

Run `npm run build`. The static extension is written to `dist/`; host that folder and install its public `manifest.json` URL in Owlbear Rodeo.

Creature data is stored in scene-item metadata. It is hidden from players by this extension's UI, but metadata synchronized through Owlbear Rodeo should not be treated as secure secret storage.
