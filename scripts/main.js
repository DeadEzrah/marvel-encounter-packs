const MODULE_ID = "marvel-encounter-packs";
const PACK_INDEX = `modules/${MODULE_ID}/packs.json`;

let registrationPromise = null;

async function registerEncounterPacks(api = game.marvelEncounters) {
  if (registrationPromise) return registrationPromise;
  if (typeof api?.registerEncounterPackageFromUrl !== "function") {
    throw new Error("Marvel Encounter Framework 0.2.0 or newer is required.");
  }

  registrationPromise = (async () => {
    const response = await fetch(PACK_INDEX);
    if (!response.ok) {
      throw new Error(`Could not load encounter pack index: ${response.status} ${response.statusText}`);
    }

    const index = await response.json();
    const registered = [];
    for (const pack of index.packs ?? []) {
      const url = `modules/${MODULE_ID}/packs/${pack.id}/encounter.json`;
      registered.push(await api.registerEncounterPackageFromUrl(url));
    }
    return registered;
  })();

  try {
    return await registrationPromise;
  } catch (error) {
    registrationPromise = null;
    throw error;
  }
}

async function registerWithNotification(api) {
  try {
    const registered = await registerEncounterPacks(api);
    console.info(`${MODULE_ID} | Registered ${registered.length} encounter packs.`);
  } catch (error) {
    console.error(`${MODULE_ID} | Encounter registration failed.`, error);
    ui.notifications?.error("Marvel Encounter Packs could not be registered. See console.");
  }
}

Hooks.once("marvel-encounter-framework.ready", registerWithNotification);
Hooks.once("ready", () => {
  if (game.marvelEncounters) void registerWithNotification(game.marvelEncounters);
});
