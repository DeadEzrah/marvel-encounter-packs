import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const index = await readJson(path.join(root, "packs.json"));
const errors = [];
const packIds = new Set();
const collections = ["regions", "objects", "objectives", "phases", "actors"];
const actionTypes = new Set([
  "increment-clock",
  "set-clock",
  "update-objective",
  "activate-phase",
  "chat-message",
  "set-region-enabled",
  "play-sound",
  "play-vfx",
  "play-fxmaster",
  "stop-fxmaster",
  "set-fxmaster-regions",
  "spawn-actors",
  "apply-health-damage",
  "apply-focus-damage",
  "apply-status",
  "request-roll"
]);

for (const pack of index.packs ?? []) {
  if (!pack?.id || packIds.has(pack.id)) {
    errors.push(`Pack index contains a missing or duplicate id: ${pack?.id ?? "<missing>"}`);
    continue;
  }
  packIds.add(pack.id);

  const directory = path.join(root, "packs", pack.id);
  const encounter = await readJson(path.join(directory, "encounter.json"));
  if (encounter.id !== pack.id) {
    errors.push(`${pack.id}: encounter id '${encounter.id}' does not match its directory.`);
  }

  for (const field of ["background", "foreground", "sceneData"]) {
    const reference = encounter.scene?.[field];
    if (reference) await requireFile(directory, reference, `${pack.id}: scene.${field}`);
  }

  for (const collection of collections) {
    const resolved = [];
    for (const entry of encounter[collection] ?? []) {
      if (typeof entry === "string") {
        const file = path.join(directory, entry);
        await requireFile(directory, entry, `${pack.id}: ${collection}`);
        const contents = await readJson(file);
        if (!Array.isArray(contents)) {
          errors.push(`${pack.id}: ${entry} must contain an array.`);
        } else {
          resolved.push(...contents);
        }
      } else {
        resolved.push(entry);
      }
    }
    validateIds(pack.id, collection, resolved);
    if (collection === "phases") {
      for (const phase of resolved) {
        validateActions(pack.id, `phase ${phase.id} onEnter`, phase.onEnter);
        validateActions(pack.id, `phase ${phase.id} onExit`, phase.onExit);
      }
    }
    if (collection === "actors") {
      for (const actor of resolved) {
        if (!actor.uuid) errors.push(`${pack.id}: actor '${actor.id}' has no compendium UUID.`);
      }
    }
  }

  validateIds(pack.id, "clocks", encounter.clocks ?? []);
  validateIds(pack.id, "triggers", encounter.triggers ?? []);
  for (const trigger of encounter.triggers ?? []) {
    if (!trigger.event) errors.push(`${pack.id}: trigger '${trigger.id}' has no event.`);
    validateActions(pack.id, `trigger ${trigger.id}`, trigger.actions);
  }
}

if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${packIds.size} encounter packs.`);
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    errors.push(`${path.relative(root, file)}: ${error.message}`);
    return {};
  }
}

async function requireFile(directory, reference, label) {
  try {
    await access(path.resolve(directory, reference));
  } catch {
    errors.push(`${label} references missing file '${reference}'.`);
  }
}

function validateIds(packId, collection, entries) {
  const ids = new Set();
  for (const entry of entries) {
    if (!entry?.id || ids.has(entry.id)) {
      errors.push(`${packId}: ${collection} contains a missing or duplicate id '${entry?.id ?? "<missing>"}'.`);
    } else {
      ids.add(entry.id);
    }
  }
}

function validateActions(packId, owner, actions) {
  if (actions == null) return;
  if (!Array.isArray(actions)) {
    errors.push(`${packId}: ${owner} actions must be an array.`);
    return;
  }
  for (const action of actions) {
    if (!actionTypes.has(action?.type)) {
      errors.push(`${packId}: ${owner} uses unknown action '${action?.type ?? "<missing>"}'.`);
      continue;
    }
    if (action.type === "play-fxmaster") {
      if (typeof action.key !== "string" || !action.key.trim()) {
        errors.push(`${packId}: ${owner} play-fxmaster action requires a key.`);
      }
      if (!action.core || typeof action.core !== "object" || Array.isArray(action.core)) {
        errors.push(`${packId}: ${owner} play-fxmaster action requires a core effect payload.`);
      }
      if (action.plus != null && (typeof action.plus !== "object" || Array.isArray(action.plus))) {
        errors.push(`${packId}: ${owner} play-fxmaster plus payload must be an object.`);
      }
    }
    if (action.type === "stop-fxmaster" && (typeof action.key !== "string" || !action.key.trim())) {
      errors.push(`${packId}: ${owner} stop-fxmaster action requires a key.`);
    }
  }
}
