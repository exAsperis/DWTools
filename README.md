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
- Shared character inventories with item weights, counts, transfers, and Load tracking

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
  Confirming the link replaces the token's DWTools creature data with the
  latest data from that character record. **Overwrite label** controls whether
  the explicit link also copies the Character name to the token label.
- **Create new from this creature** creates a room character using the token's
  current name and creature fields, then links the token to it.
- **Change link** associates the token with a different character record.
- **Unlink** keeps the token's current fields but stops future synchronization.

Once linked, the room character record is authoritative. Editing any linked
token updates the record and every token linked to that character in the
current scene. Linked tokens in another scene receive the latest record when
that scene is opened. Later synchronization leaves native token labels
unchanged.

### Manage characters and inventory

The main DWTools action contains a **Characters** section. GMs can see every
room character. Players can see and edit only characters linked to unlocked
Character-layer tokens they currently control in the active scene.

Expand a character to edit its persistent creature fields and optional maximum
Load. Its **Inventory** subsection supports:

- adding and removing items;
- editing item names and unit weights;
- changing counts with the minus and plus controls;
- viewing each item's Load and the character's total Load; and
- transferring item quantities between characters as the GM.

Item rows use a compact two-line layout for the standard Owlbear panel. Adding
an item keeps **Add Item** in view so several items can be entered without
repeated scrolling. Changes are saved directly to the authoritative room
character record, so every linked token shares the same inventory.

GMs can also search and create room characters, see current-scene linked-token
counts, review approximate room-metadata usage, and delete records.

Deleting a record unlinks its tokens in the current scene without erasing
their copied creature fields, then removes the room record immediately. Linked
copies in closed scenes retain their creature fields but become orphaned. When
their scene is opened, use the creature editor to relink them, create a new
record from their current fields, or unlink them while retaining those fields.

### Recover an orphaned copy

When a token points to a character record that no longer exists, its creature
editor displays **Orphaned link (missing)**. Choose one of these actions:

- **Relink to existing** replaces the token's persistent DWTools fields with
  the selected room character.
- **Create new from creature** preserves the token's current copied fields,
  creates a new room character from them, and links the token to it.
- **Unlink and retain fields** keeps the token as an ordinary scene-local
  creature and removes only the broken character link.

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

Creature data is stored in scene-item metadata, while character records and
inventories use room metadata. The extension limits what its UI shows players,
but metadata synchronized through Owlbear Rodeo should not be treated as secure
secret storage.
