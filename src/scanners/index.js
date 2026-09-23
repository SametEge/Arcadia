'use strict';

const { scanSteam } = require('./steam');
const { scanEpic } = require('./epic');
const { scanXbox } = require('./xbox');
const { scanFolders } = require('./folders');
const { scanShortcuts } = require('./shortcuts');
const { scanRiot } = require('./riot');
const { scanUbisoft } = require('./ubisoft');
const { scanGog } = require('./gog');
const { scanEa } = require('./ea');

// Run every enabled source and return a flat list of detected games.
async function scanAll(settings = {}, onProgress = () => {}) {
  const sources = settings.sources || {};
  const folders = settings.scanFolders || [];

  const tasks = [];
  if (sources.steam !== false) tasks.push({ key: 'steam', run: () => scanSteam() });
  if (sources.epic !== false) tasks.push({ key: 'epic', run: () => scanEpic() });
  if (sources.xbox !== false) tasks.push({ key: 'xbox', run: () => scanXbox() });
  if (sources.gog !== false) tasks.push({ key: 'gog', run: () => scanGog() });
  if (sources.ea !== false) tasks.push({ key: 'ea', run: () => scanEa() });
  if (sources.ubisoft !== false) tasks.push({ key: 'ubisoft', run: () => scanUbisoft() });
  if (sources.folders !== false && folders.length) {
    tasks.push({ key: 'folders', run: () => scanFolders(folders) });
  }

  const all = [];
  const knownTitles = new Set();
  for (const task of tasks) {
    onProgress(task.key); // renderer translates this key for the current language
    try {
      const found = await task.run();
      all.push(...found);
      for (const g of found) knownTitles.add((g.title || '').toLowerCase());
    } catch (err) {
      console.error(`[scan] ${task.key} failed:`, err.message);
    }
  }

  // Riot games (from Riot's metadata) + desktop shortcuts run last so they can
  // skip games already found above. Riot runs first so its titles dedupe links.
  if (sources.shortcut !== false) {
    onProgress('shortcut');
    try {
      const riot = await scanRiot();
      all.push(...riot);
      for (const g of riot) knownTitles.add((g.title || '').toLowerCase());
      all.push(...(await scanShortcuts(knownTitles)));
    } catch (err) {
      console.error('[scan] shortcut/riot failed:', err.message);
    }
  }

  return all;
}

module.exports = { scanAll };
