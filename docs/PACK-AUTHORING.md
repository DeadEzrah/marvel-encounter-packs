# Encounter Pack Authoring Rules

1. Keep each encounter self-contained.
2. Use stable semantic IDs.
3. Prefer MEF actions over arbitrary JavaScript.
4. Treat Regions as geometry + spatial meaning.
5. Treat environmental objects as identity + state + interaction.
6. Use semantic VFX/audio profile names.
7. Keep rules in the system adapter, never in the encounter data.
8. Keep phase changes reversible where practical.
9. Use native Foundry flags as authoritative metadata; Tagger can be optional later.
10. Assume foreground art is an overhead layer that tokens may pass beneath.
11. Reference reusable Actors through an `actors` roster of compendium UUIDs.
12. Use `spawn-actors` in phases or triggers for reinforcements; set `once: true` when an arrival must not repeat.
