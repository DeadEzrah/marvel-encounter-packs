# Marvel Encounter Packs

Companion content repository for the **Marvel Encounter Framework (MEF)**.

This repository owns encounter content. It does **not** own rules or runtime orchestration.

## Architecture

- **Marvel Multiverse system** — rules, rolls, damage, Focus, Karma, powers, conditions
- **Marvel Encounter Framework** — encounter orchestration, state, Regions, objectives, clocks, phases, VFX/audio adapters
- **Marvel Encounter Packs** — maps, foregrounds, encounter manifests, semantic Regions, environmental objects, objectives, phases, and content
- **Marvel Character Library** — reusable Heroes, Villains, and Minions/NPC Actor compendiums referenced by encounters

## Included starter packs

1. `city-intersection-crisis`
2. `research-lab-breach`
3. `subway-station-attack`
4. `rooftop-chase`
5. `dockyard-warehouse`
6. `aerial-carrier-deck`
7. `superhuman-prison-breakout`
8. `alien-invasion-avenue`

Each pack is self-contained under `packs/<encounter-id>/`.

## Recommended VS Code layout

```text
projects/
├── marvel-multiverse-system/
├── marvel-encounter-framework/
└── marvel-encounter-packs/
```

## Development rule
Encounter packs describe **intent**, not implementation. A pack should say `play-vfx: environment.structure.collapse`, not reference a JB2A file path directly; `request-roll`, not read an Actor data path; `set-region-enabled`, not contain arbitrary system-specific scripts.

This keeps encounter content portable and lets MEF eventually support D&D, Dragonbane, and other systems through adapters.


## Included art

Every encounter directory includes the generated realistic map assets under `art/background.png` and `art/foreground.png`, plus the corresponding `scene.json` from the original Foundry map pack.

## Installation

Copy this folder to `{Foundry User Data}/Data/modules/marvel-encounter-packs`, then enable both Marvel Encounter Framework and Marvel Encounter Packs. The module registers every package in `packs.json`; activating an encounter creates or reuses its Scene.

Run `npm run validate` after editing pack manifests or referenced content files.

`Alien Invasion Avenue` demonstrates actor integration: three Alien Vanguard minions from the character library spawn when combat round 7 starts.
