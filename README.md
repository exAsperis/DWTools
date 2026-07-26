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

## Using DWTools

### Add or edit creature data

1. As the GM, right-click a character token and choose **DWTools**.
2. Select **Edit creature**.
3. Enter the creature's name, tags, armor, HP, damage, instinct, moves,
   treasure, and player-overlay visibility.
4. Select **Save**.

The token menu provides immediate HP adjustments and damage rolls after
creature data has been added.

### Persist a character across scenes

Open the token's creature editor and use its **Character record** section:

- **Link to character** associates the token with an existing room character.
  Confirming the link replaces the token's DWTools fields with the latest
  fields from that character record.
- **Create new from this creature** creates a room character using the token's
  current name and creature fields, then links the token to it.
- **Change link** replaces the token's fields with a different character
  record.
- **Unlink** keeps the token's current fields but stops future synchronization.

Once linked, the room character record is authoritative. Editing any linked
token updates the record and every token linked to that character in the
current scene. Linked tokens in another scene receive the latest record when
that scene is opened.

### Manage room characters

The main DWTools action contains a GM-only **Character Records** section. From
there, the GM can:

- search all active room characters;
- create a blank character record;
- edit every persistent creature field;
- see how many tokens are linked in the current scene;
- review approximate room-metadata usage; and
- delete a record.

Deleting a record unlinks its tokens in the current scene without erasing
their copied creature fields. Tokens encountered later in another scene are
also safely unlinked when that scene opens.

Select **Show tombstoned characters** beneath the metadata-usage bar to review
deleted records. Tombstones appear as muted, labeled cards. A tombstone can be
deleted permanently to reclaim its room-metadata space, but doing so cannot
unlink tokens in closed scenes; those tokens retain their creature fields and
show an orphaned link when their scene is opened.

Counts always apply only to the current scene because Owlbear extensions cannot
inspect closed scenes.

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
