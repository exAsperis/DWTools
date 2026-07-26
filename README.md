# DWTools for Owlbear Rodeo

![DWTools logo](public/icon.svg)

A minimal Owlbear Rodeo extension for keeping Dungeon World creature information on character tokens.

## Features

- Attached on-map display for HP, armor, and damage
- HP current/max with a ten-segment percentage bar
- GM-only context-menu editor for instinct, moves, and treasure
- Quick HP adjustments from the token context menu
- Damage rolls for `d6`, `2d6+1`, `b[2d6]+1`, and `w[2d8]-1` style expressions
- Persistent room-level character records that synchronize linked tokens across scenes

## Testing workflow

Local extension testing through a local server is currently nonfunctional.
Until the project owner explicitly revokes this standing directive:

1. complete internal QC with the formatter, linter, type checker, tests, and
   production build;
2. push the reviewed changes to GitHub;
3. allow GitHub Pages to update the hosted extension automatically; and
4. perform Owlbear integration and manual testing in that live pre-production
   environment.

## Build

Run `npm run build`. The static extension is written to `dist/`; host that folder and install its public `manifest.json` URL in Owlbear Rodeo.

The production extension is hosted at
`https://exasperis.github.io/DWTools/manifest.json`. Store submission content
is maintained in [`docs/store.md`](docs/store.md).

Creature data is stored in scene-item metadata. It is hidden from players by this extension's UI, but metadata synchronized through Owlbear Rodeo should not be treated as secure secret storage.
