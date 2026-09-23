'use strict';

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const DATA_FILE = path.join(app.getPath('userData'), 'library.json');

const DEFAULTS = {
  settings: {
    sources: { steam: true, epic: true, xbox: true, gog: true, ea: true, ubisoft: true, folders: true, shortcut: true },
    scanFolders: [],
    accent: '#10b981',
    logo: '#10b981',
    logoShape: 'hexagon',
    logoSymbol: 'play',
    sortBy: 'title',
    autostart: false,
    autoUpdate: true, // install GitHub releases automatically (Settings → Updates)
    steamCollections: false, // mirror Steam's own collections into the sidebar
    steamCollectionsAsked: false,
    // Steam collections deleted in Arcadia but not yet removed from Steam's own
    // store (only possible while Steam is closed). Also keeps them from being
    // re-mirrored into Arcadia in the meantime.
    pendingSteamDeletes: [],
    onboarded: false,
    sgdbKey: '', // user's own SteamGridDB API key (kept local, never in the repo)
  },
  games: {}, // id -> game object
  // User lists. A list may be linked to a Steam collection (steamId), in which
  // case its members are Steam's own plus anything added here. The only thing
  // written back to Steam is deleting a whole collection, and only while Steam
  // is closed (see steamcollections.deleteCollections); membership changes made
  // here stay in Arcadia.
  lists: [], // { id, name, order, steamId|null, games: [gameId] }
};

// Fields owned by the user (or fetched once) that must survive a re-scan.
const USER_FIELDS = ['favorite', 'hidden', 'customTitle', 'customCover', 'autoCover', 'steamArt', 'companions', 'lastPlayed', 'playCount', 'addedAt'];

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
      lists: Array.isArray(raw.lists) ? raw.lists : [],
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
  return {
    settings: state.settings,
    games: Object.values(state.games),
    lists: [...state.lists].sort((a, b) => (a.order || 0) - (b.order || 0)),
    dataFile: DATA_FILE,
  };
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
    // A game found on disk keeps whatever a linked account told us about it.
    if (prev.owned) merged.owned = true;
    if (prev.playtime && !merged.playtime) merged.playtime = prev.playtime;
    merged.installed = true;
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
    // Games that came from a linked account stay in the library — they are
    // simply not installed right now, which is the whole point of linking.
    if (g.owned) { g.installed = false; continue; }
    if (g.favorite) g.missing = true; // keep favourites around even if uninstalled
    else delete state.games[id];
  }

  save();
  return getState();
}

// Titles are matched loosely across sources: store listings carry trademark
// symbols, edition suffixes and "(PC)" that a local install folder never has.
const normTitle = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/\((pc|win(dows)?)\)/g, '')
    .replace(/[™®©]/g, '')
    .replace(/\b(deluxe|ultimate|standard|definitive|complete|goty|game of the year|remastered|edition)\b/g, '')
    .replace(/[^a-z0-9]/g, '');

// Which store owns a game when the same title shows up in more than one.
// A game bought on Steam that also appears in an EA or Ubisoft library is the
// Steam copy — that's where it was paid for and that's what launches it.
const SOURCE_RANK = { steam: 0, epic: 1, xbox: 2, gog: 3, ea: 4, ubisoft: 5, shortcut: 6, folder: 7, manual: 8 };
const rankOf = (src) => (SOURCE_RANK[src] === undefined ? 99 : SOURCE_RANK[src]);

// Merge the libraries pulled from linked store accounts.
//
// `sources` names which stores were actually fetched, so an owned game can be
// dropped when it leaves that account without touching stores that weren't
// synced (or failed) this time round.
function mergeOwned(owned, sources = []) {
  load();
  const now = Date.now();
  const synced = new Set(sources);
  const seen = new Set();

  // An installed game and its store-library entry are the same game. Steam and
  // Epic ids already line up; Xbox's don't, so fall back to the title.
  const installedByTitle = new Map();
  for (const g of Object.values(state.games)) {
    if (g.installed === false) continue;
    installedByTitle.set(g.source + '|' + normTitle(g.customTitle || g.title), g.id);
  }

  // Same title, different store: keep one card, owned by the higher-ranked
  // store. EA and Ubisoft libraries list games that were bought on Steam and
  // merely launch through their client — those must not become a second card.
  const byTitle = new Map();
  for (const g of Object.values(state.games)) {
    const key = normTitle(g.customTitle || g.title);
    if (!key) continue;
    const cur = byTitle.get(key);
    if (!cur || rankOf(g.source) < rankOf(cur.source)) byTitle.set(key, g);
  }

  for (const g of owned) {
    let id = g.id;
    if (!state.games[id]) {
      const match = installedByTitle.get(g.source + '|' + normTitle(g.title));
      if (match) id = match;
    }

    if (!state.games[id]) {
      const key = normTitle(g.title);
      const rival = byTitle.get(key);
      // A copy already exists under a store that outranks this one — record
      // that this library also carries it and move on.
      if (rival && rankOf(rival.source) < rankOf(g.source)) {
        // Read the live record, not the snapshot taken before the loop — a
        // third store matching the same title must add to `alsoOn`, not
        // replace what the second one wrote.
        const current = state.games[rival.id] || rival;
        const alsoOn = new Set(current.alsoOn || []);
        alsoOn.add(g.source);
        state.games[rival.id] = { ...current, owned: true, alsoOn: [...alsoOn] };
        seen.add(rival.id);
        continue;
      }
      if (key) byTitle.set(key, { ...g, id });
    }
    seen.add(id);

    const prev = state.games[id];
    if (prev) {
      // Already known: only add what the account knows and the disk doesn't.
      const patch = { owned: true };
      if (g.installUrl && !prev.installUrl) patch.installUrl = g.installUrl;
      if (g.cover && !prev.cover) patch.cover = g.cover;
      if (g.playtime && !prev.playtime) patch.playtime = g.playtime;
      state.games[id] = { ...prev, ...patch };
      continue;
    }

    state.games[id] = {
      ...g,
      installed: false,
      owned: true,
      favorite: false,
      hidden: false,
      playCount: 0,
      addedAt: now,
    };
  }

  // Drop owned-only entries that disappeared from an account we just synced
  // (refunded, removed from Game Pass, left a family share…).
  for (const id of Object.keys(state.games)) {
    const g = state.games[id];
    if (!g.owned || seen.has(id)) continue;
    if (!synced.has(g.source)) continue;
    if (g.installed) { delete g.owned; continue; } // still on disk: keep the game
    if (g.favorite) { g.missing = true; continue; }
    delete state.games[id];
  }

  save();
  return getState();
}

/* -------------------------------- Lists ---------------------------------- */

const newListId = () => 'l-' + Math.random().toString(36).slice(2, 10);

function getLists() {
  load();
  return [...state.lists].sort((a, b) => (a.order || 0) - (b.order || 0));
}

function createList(name, steamId = null) {
  load();
  const list = {
    id: newListId(),
    name: String(name || '').trim() || 'Liste',
    order: state.lists.length,
    steamId: steamId || null,
    games: [],
  };
  state.lists.push(list);
  save();
  return list;
}

function renameList(id, name) {
  load();
  const l = state.lists.find((x) => x.id === id);
  if (!l) return null;
  l.name = String(name || '').trim() || l.name;
  save();
  return l;
}

function deleteList(id) {
  load();
  state.lists = state.lists.filter((x) => x.id !== id);
  state.lists.forEach((l, i) => { l.order = i; });
  save();
  return getLists();
}

function setListGame(listId, gameId, member) {
  load();
  const l = state.lists.find((x) => x.id === listId);
  if (!l) return null;
  const has = l.games.includes(gameId);
  if (member && !has) l.games.push(gameId);
  if (!member && has) l.games = l.games.filter((g) => g !== gameId);
  save();
  return l;
}

// `orderedIds` is the full list of ids in their new order.
function reorderLists(orderedIds) {
  load();
  const pos = new Map(orderedIds.map((id, i) => [id, i]));
  for (const l of state.lists) {
    if (pos.has(l.id)) l.order = pos.get(l.id);
  }
  save();
  return getLists();
}

// Mirrors Steam's collections into lists: one Arcadia list per Steam collection,
// created on first sight and kept named in step with Steam afterwards. Games the
// user added here are untouched — only the Steam side is refreshed.
function syncSteamCollections(collections) {
  load();
  const seen = new Set();

  for (const c of collections) {
    let l = state.lists.find((x) => x.steamId === c.id);
    if (!l) {
      l = { id: newListId(), name: c.name, order: state.lists.length, steamId: c.id, games: [] };
      state.lists.push(l);
    } else {
      l.name = c.name;
    }
    l.steamGames = c.appids.map((a) => 'steam:' + a);
    seen.add(c.id);
  }

  // A collection deleted in Steam leaves its Arcadia list behind only if the
  // user put their own games in it; otherwise it goes too.
  state.lists = state.lists.filter((l) => {
    if (!l.steamId || seen.has(l.steamId)) return true;
    return l.games.length > 0;
  });
  state.lists.forEach((l, i) => { l.order = l.order ?? i; });

  save();
  return getLists();
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
  mergeOwned,
  getLists,
  createList,
  renameList,
  deleteList,
  setListGame,
  reorderLists,
  syncSteamCollections,
  addGame,
  updateGame,
  removeGame,
  addFolder,
  removeFolder,
};
