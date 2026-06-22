'use strict';

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const DATA_FILE = path.join(app.getPath('userData'), 'library.json');

const DEFAULTS = {
  settings: {
    sources: { steam: true, epic: true, xbox: true, folders: true, shortcut: true },
    scanFolders: [],
    accent: '#10b981',
    logo: '#10b981',
    logoShape: 'hexagon',
    logoSymbol: 'play',
    sortBy: 'title',
    autostart: false,
    onboarded: false,
    sgdbKey: '', // user's own SteamGridDB API key (kept local, never in the repo)
  },
  games: {}, // id -> game object
};

// Fields owned by the user (or fetched once) that must survive a re-scan.
const USER_FIELDS = ['favorite', 'hidden', 'customTitle', 'customCover', 'autoCover', 'companions', 'lastPlayed', 'playCount', 'addedAt'];

let state = null;

function load() {
  if (state) return state;
  try {
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    state = {
      settings: {
        ...DEFAULTS.settings,
        ...(raw.settings || {}),
        sources: { ...DEFAULTS.settings.sources, ...((raw.settings || {}).sources || {}) },
      },
      games: raw.games || {},
    };
  } catch {
    state = JSON.parse(JSON.stringify(DEFAULTS));
  }
  return state;
}

function save() {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('[library] save failed:', err.message);
  }
}

function getState() {
  load();
  return { settings: state.settings, games: Object.values(state.games), dataFile: DATA_FILE };
}

function getGame(id) {
  load();
  return state.games[id] || null;
}

function getSettings() {
  load();
  return state.settings;
}

function setSettings(patch = {}) {
  load();
  state.settings = {
    ...state.settings,
    ...patch,
    sources: { ...state.settings.sources, ...(patch.sources || {}) },
  };
  save();
  return state.settings;
}

// Merge freshly scanned games into the store, preserving user-owned fields and
// dropping auto-detected games that are no longer installed.
function mergeScanned(scanned) {
  load();
  const now = Date.now();
  const scannedIds = new Set(scanned.map((g) => g.id));

  for (const g of scanned) {
    const prev = state.games[g.id] || {};
    const merged = { ...g };
    for (const f of USER_FIELDS) {
      if (prev[f] !== undefined) merged[f] = prev[f];
    }
    merged.favorite = merged.favorite || false;
    merged.hidden = merged.hidden || false;
    merged.playCount = merged.playCount || 0;
    merged.addedAt = merged.addedAt || now;
    delete merged.missing;
    state.games[g.id] = merged;
  }

  for (const id of Object.keys(state.games)) {
    const g = state.games[id];
    if (g.source === 'manual' || scannedIds.has(id)) continue;
    if (g.favorite) g.missing = true; // keep favourites around even if uninstalled
    else delete state.games[id];
  }

  save();
  return getState();
}

function addGame(game) {
  load();
  state.games[game.id] = {
    favorite: false,
    hidden: false,
    playCount: 0,
    addedAt: Date.now(),
    ...game,
  };
  save();
  return state.games[game.id];
}

function updateGame(id, patch = {}) {
  load();
  if (!state.games[id]) return null;
  state.games[id] = { ...state.games[id], ...patch };
  save();
  return state.games[id];
}

function removeGame(id) {
  load();
  delete state.games[id];
  save();
  return true;
}

function addFolder(folder) {
  load();
  if (!state.settings.scanFolders.includes(folder)) {
    state.settings.scanFolders.push(folder);
    save();
  }
  return state.settings;
}

function removeFolder(folder) {
  load();
  state.settings.scanFolders = state.settings.scanFolders.filter((f) => f !== folder);
  save();
  return state.settings;
}

module.exports = {
  getState,
  getGame,
  getSettings,
  setSettings,
  mergeScanned,
  addGame,
  updateGame,
  removeGame,
  addFolder,
  removeFolder,
};
