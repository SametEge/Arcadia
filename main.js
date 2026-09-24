'use strict';

const { app, BrowserWindow, ipcMain, shell, dialog, Menu, nativeImage, Tray } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { spawn } = require('child_process');
const crypto = require('crypto');

const library = require('./src/library');
const { scanAll } = require('./src/scanners');
const { launchGame } = require('./src/launcher');
const { prettify } = require('./src/scanners/util');
const sgdb = require('./src/sgdb');
const updater = require('./src/updater');
const accounts = require('./src/accounts');
const downloads = require('./src/downloads');
const { t, setLanguageSource } = require('./src/i18n');
const ratings = require('./src/ratings');
const { readCollections, deleteCollections, isSteamRunning } = require('./src/steamcollections');
const { getSteamPath } = require('./src/scanners/steam');
const steamAssets = require('./src/steamassets');

// Native dialogs and the tray follow the language chosen in Settings.
setLanguageSource(() => library.getSettings().language || 'en');

let mainWindow = null;
let tray = null;
let isQuitting = false;

// Identify to Windows as Arcadia (taskbar grouping, jump list, notifications).
// The packaged Arcadia.exe is what makes Task Manager show "Arcadia" instead of
// "Electron"; this aligns the runtime identity with it.
if (process.platform === 'win32') app.setAppUserModelId('com.arcadia.launcher');

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) { createWindow(); return; }
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function rebuildTrayMenu() {
  if (!tray) return;
  const top = library.getState().games
    .filter((g) => !g.hidden && (g.playCount || 0) > 0)
    .sort((a, b) => (b.playCount || 0) - (a.playCount || 0) || (b.lastPlayed || 0) - (a.lastPlayed || 0))
    .slice(0, 5);

  const template = [{ label: t('trayShow'), click: showMainWindow }];
  if (top.length) {
    template.push({ type: 'separator' }, { label: t('trayTopPlayed'), enabled: false });
    for (const g of top) {
      template.push({ label: g.customTitle || g.title, click: () => launchGameFull(g.id) });
    }
  }
  template.push({ type: 'separator' }, { label: t('trayQuit'), click: () => { isQuitting = true; app.quit(); } });
  tray.setContextMenu(Menu.buildFromTemplate(template));
}

// Launch a game (and its companions), record play stats, refresh the tray.
async function launchGameFull(id) {
  const game = library.getGame(id);
  if (!game) return false;

  // Owned but not installed: start the install through the store and follow it
  // on the downloads screen. Nothing was played, so play stats stay untouched.
  if (game.installed === false && game.installUrl) {
    await startInstall(game.id);
    return 'install';
  }

  await launchGame(game);
  library.updateGame(id, { lastPlayed: Date.now(), playCount: (game.playCount || 0) + 1 });
  for (const cid of game.companions || []) {
    const c = library.getGame(cid);
    if (c) { try { await launchGame(c); } catch (err) { console.error('[companion]', err.message); } }
  }
  rebuildTrayMenu();
  return true;
}

function createTray() {
  if (tray) return;
  const img = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.png')).resize({ width: 16, height: 16 });
  tray = new Tray(img);
  tray.setToolTip('Arcadia');
  tray.on('click', showMainWindow);
  rebuildTrayMenu();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 840,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#0b0b0d',
    title: 'Arcadia',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    show: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#121216',
      symbolColor: '#cfcfd6',
      height: 44,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  Menu.setApplicationMenu(null);
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.once('ready-to-show', () => {
    // The Store shots render in their own offscreen window; this one stays hidden.
    if (process.argv.includes('--store-shots')) { storeShotsAndQuit(); return; }
    mainWindow.show();
    if (process.argv.includes('--shot')) captureAndQuit();
  });

  // Close to tray: keep running in the background instead of quitting.
  mainWindow.on('close', (e) => {
    if (!isQuitting) { e.preventDefault(); mainWindow.hide(); }
  });
}

// Dev helper: `electron . --shot` saves a screenshot for the README, then exits.
async function captureAndQuit() {
  try {
    await new Promise((r) => setTimeout(r, 7000)); // give the scan + store covers time to load
    const img = await mainWindow.webContents.capturePage();
    fs.writeFileSync(path.join(__dirname, 'assets', 'screenshot.png'), img.toPNG());
    console.log('SHOT_SAVED');
  } catch (err) {
    console.error('SHOT_FAILED', err);
  } finally {
    app.quit();
  }
}

// Dev helper: `electron . --store-shots` saves the Microsoft Store screenshots
// (build/store-shots.js), then exits. build/ isn't packaged, so source only.
async function storeShotsAndQuit() {
  try {
    await require('./build/store-shots')(mainWindow);
    console.log('STORE_SHOTS_SAVED');
  } catch (err) {
    console.error('STORE_SHOTS_FAILED', err);
  } finally {
    app.quit();
  }
}

// Only allow a single Arcadia window; focus the existing one instead.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => showMainWindow());

  app.whenReady().then(() => {
    createWindow();
    createTray();
    updater.init(mainWindow);
    updater.checkOnLaunch();
    // A Store (MSIX) app can't register itself in the Run key; Windows manages
    // its startup through the package manifest instead.
    if (!process.windowsStore) app.setLoginItemSettings({ openAtLogin: !!library.getSettings().autostart });
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
      else showMainWindow();
    });
  });

  app.on('before-quit', () => { isQuitting = true; });
  // Stay alive in the tray when the window is closed; quit only via the tray
  // "Quit" item or app.quit().
  app.on('window-all-closed', () => {});
}

/* ------------------------------- IPC ------------------------------------- */

ipcMain.handle('library:get', () => library.getState());

ipcMain.handle('library:scan', async () => {
  const settings = library.getSettings();
  const onProgress = (msg) => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('scan:progress', msg);
  };
  const found = await scanAll(settings, onProgress);
  let result = library.mergeScanned(found);
  // A scan is also the right moment to refresh the linked accounts, so the
  // grid reflects both what's on disk and what the stores say you own.
  if (accounts.list().some((a) => a.linked)) {
    try { result = await syncAccounts(); } catch (err) { console.error('[accounts]', err.message); }
  }
  rebuildTrayMenu();
  fillCovers(); // fire-and-forget: pull real cover art for non-Steam games
  return result;
});

// Bundled SteamGridDB key, provided by the user for open-source distribution so
// covers work out of the box. A user's own key (Settings) overrides it.
const DEFAULT_SGDB_KEY = '30946d90d42ccc90529855533c0370f4';

// Gaming tools/companions that aren't games — they would wrongly match similarly
// named indie games on SteamGridDB (FACEIT→"Face It", Blitz→"Blitz Breaker",
// Wand→"Wand Wars"…), so we never assign them cover art; they keep their real icon.
const NOT_A_GAME = /\b(faceit|blitz|wand|mobalytics|tft\s?academy|gankster|r2modman|overwolf|discord|playnite|medal|wallpaper\s?engine|afterburner|obs\s?studio)\b/i;

// Fetch SteamGridDB cover art for games that lack a real cover (Xbox, launchers,
// Riot…) and as a fallback for Steam games whose store art is missing. Runs in
// the background after a scan; Minecraft keeps its hand-drawn tile, tools skipped.
// Replaces guessed Steam cover URLs with the real ones from Steam's store API.
// Runs before fillCovers so SteamGridDB is only asked about the few games Steam
// itself has no portrait art for.
let steamArtBusy = false;
async function fillSteamCovers() {
  if (steamArtBusy) return;
  steamArtBusy = true;
  try {
    const ids = library.getState().games
      .filter((g) => g.source === 'steam' && /^steam:\d+$/.test(g.id))
      .map((g) => g.id.slice(6));

    const apply = (batch) => {
      for (const [appid, art] of Object.entries(batch)) {
        const g = library.getGame('steam:' + appid);
        if (!g) continue;
        const prev = g.steamArt || {};
        if (prev.cover === art.cover && prev.header === art.header) continue;
        library.updateGame(g.id, { steamArt: art });
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('covers:updated', { id: g.id, steamArt: art });
        }
      }
    };
    // Fresh batches land as they arrive (a first run spans ~20 requests); the
    // final pass picks up whatever came straight from the cache.
    apply(await steamAssets.resolve(ids, apply));
  } catch (err) {
    console.error('[steamassets]', err.message);
  } finally {
    steamArtBusy = false;
  }
}

let coversBusy = false;
async function fillCovers() {
  if (coversBusy) return;
  await fillSteamCovers();
  const key = library.getSettings().sgdbKey || DEFAULT_SGDB_KEY;
  if (!key) return;
  coversBusy = true;
  try {
    for (const g of library.getState().games) {
      if (g.customCover || g.autoCover) continue;
      // Steam art comes from the store CDN or the local cache; either way we
      // already have a URL, and the renderer falls back to header.jpg if it
      // 404s. Asking SteamGridDB anyway would mean a thousand needless calls on
      // a linked account — enough to burn the shared key's quota — and every
      // answer would repaint the grid.
      // Steam games get their real art from Steam's store API (fillSteamCovers);
      // only ones Steam has no portrait for come here.
      if (g.source === 'steam' && (g.localCover || !g.steamArt || g.steamArt.cover)) continue;
      if (/minecraft/i.test(g.title || '') || NOT_A_GAME.test(g.title || '')) continue;
      let url = null;
      try { url = await sgdb.findCover(g.customTitle || g.title, key); } catch { /* skip */ }
      if (!url) continue;
      library.updateGame(g.id, { autoCover: url });
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('covers:updated', { id: g.id, cover: url });
      }
    }
  } finally {
    coversBusy = false;
  }
}

ipcMain.handle('game:launch', (_e, id) => launchGameFull(id));

ipcMain.handle('game:update', (_e, id, patch) => library.updateGame(id, patch));
ipcMain.handle('game:remove', (_e, id) => library.removeGame(id));

ipcMain.handle('game:add', async () => {
  const res = await dialog.showOpenDialog(mainWindow, {
    title: t('addGameTitle'),
    properties: ['openFile'],
    filters: [
      { name: t('gamesAndShortcuts'), extensions: ['exe', 'lnk', 'url', 'bat'] },
      { name: t('allFiles'), extensions: ['*'] },
    ],
  });
  if (res.canceled || !res.filePaths.length) return null;

  const file = res.filePaths[0];
  const game = {
    id: `manual:${file.toLowerCase()}`,
    title: prettify(path.basename(file)),
    source: 'manual',
    launch: { type: 'path', value: file },
    iconPath: file,
    exeName: /\.exe$/i.test(file) ? path.basename(file).toLowerCase() : '',
    installDir: path.dirname(file),
  };
  library.addGame(game);
  return game;
});

ipcMain.handle('game:pickCover', async (_e, id) => {
  const res = await dialog.showOpenDialog(mainWindow, {
    title: t('pickCoverTitle'),
    properties: ['openFile'],
    filters: [{ name: t('images'), extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] }],
  });
  if (res.canceled || !res.filePaths.length) return null;
  const url = pathToFileURL(res.filePaths[0]).href;
  return library.updateGame(id, { customCover: url });
});

ipcMain.handle('game:openDir', (_e, id) => {
  const game = library.getGame(id);
  if (game && game.installDir && fs.existsSync(game.installDir)) {
    shell.openPath(game.installDir);
    return true;
  }
  return false;
});

function iconCacheDir() {
  const d = path.join(app.getPath('userData'), 'iconcache');
  try { fs.mkdirSync(d, { recursive: true }); } catch {}
  return d;
}

// Extract an exe's embedded icon and cache it as a PNG. Uses .NET
// ExtractAssociatedIcon, which reads the real icon reliably (Electron's
// getFileIcon returns a generic icon for some apps, e.g. large Electron exes).
function extractIcon(exePath) {
  return new Promise((resolve) => {
    const cache = path.join(iconCacheDir(), crypto.createHash('md5').update(exePath.toLowerCase()).digest('hex') + '.png');
    if (fs.existsSync(cache)) { resolve(pathToFileURL(cache).href); return; }
    const q = (s) => s.replace(/'/g, "''");
    const ps =
      `Add-Type -AssemblyName System.Drawing; try { ` +
      `$i=[System.Drawing.Icon]::ExtractAssociatedIcon('${q(exePath)}'); ` +
      `$i.ToBitmap().Save('${q(cache)}', [System.Drawing.Imaging.ImageFormat]::Png) } catch {}`;
    try {
      const p = spawn('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps], { windowsHide: true });
      p.on('close', () => resolve(fs.existsSync(cache) ? pathToFileURL(cache).href : null));
      p.on('error', () => resolve(null));
    } catch {
      resolve(null);
    }
  });
}

// Icon for a non-Steam tile (returns a cached PNG file URL).
ipcMain.handle('icon:get', async (_e, id) => {
  const game = library.getGame(id);
  if (!game || !game.iconPath || !fs.existsSync(game.iconPath)) return null;
  if (game.iconPath.toLowerCase().endsWith('.lnk')) return null;
  return extractIcon(game.iconPath);
});

ipcMain.handle('settings:get', () => library.getSettings());
ipcMain.handle('settings:set', (_e, patch) => {
  const s = library.setSettings(patch);
  if (patch && patch.language) rebuildTrayMenu();
  return s;
});
ipcMain.handle('app:setAutostart', (_e, on) => {
  if (process.windowsStore) return library.getSettings();
  app.setLoginItemSettings({ openAtLogin: !!on });
  return library.setSettings({ autostart: !!on });
});

/* ----------------------------- Accounts ---------------------------------- */

ipcMain.handle('accounts:list', () => accounts.list());

// The renderer follows a successful link with accounts:sync, so the library
// fetch happens once, with the progress overlay showing what it is doing.
ipcMain.handle('accounts:login', (_e, id) => accounts.signIn(id));

ipcMain.handle('accounts:logout', (_e, id) => {
  accounts.signOut(id);
  return accounts.list();
});

// Pull every linked account's library into the store and refresh covers.
async function syncAccounts() {
  const onProgress = (id, detail) => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    // "account:epic" or, once a provider reports detail, "account:epic:120/450".
    let msg = `account:${id}`;
    if (detail && detail.done) msg += `:${detail.done}${detail.total ? '/' + detail.total : ''}`;
    mainWindow.webContents.send('scan:progress', msg);
  };
  const { games, errors } = await accounts.fetchAll(onProgress);
  // Only stores that answered successfully may have their stale entries pruned;
  // a store that failed keeps whatever it last told us.
  const synced = accounts
    .list()
    .filter((a) => a.linked && !errors.some((e) => e.id === a.id))
    .map((a) => a.id);
  const result = library.mergeOwned(games, synced);
  rebuildTrayMenu();
  fillCovers();
  return { ...result, errors };
}

ipcMain.handle('accounts:sync', () => syncAccounts());

/* ---------------------------- Downloads ---------------------------------- */

// True once the game exists on disk — the only completion signal the Microsoft
// Store gives us, and a useful cross-check for the others.
function isInstalledNow(id) {
  const g = library.getGame(id);
  return !!(g && g.installed !== false && g.installDir && fs.existsSync(g.installDir));
}

downloads.init({
  onUpdate: (list) => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('downloads:update', list);
  },
  // A finished install has real launch data on disk now, so re-scan to pick up
  // its exe, install folder and local cover art.
  onComplete: async () => {
    try {
      const found = await scanAll(library.getSettings(), () => {});
      library.mergeScanned(found);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('library:updated', library.getState());
      }
      rebuildTrayMenu();
      fillCovers();
    } catch (err) {
      console.error('[downloads] post-install rescan failed:', err.message);
    }
  },
});

async function startInstall(id) {
  const game = library.getGame(id);
  if (!game) throw new Error('unknown-game');
  if (!game.installUrl) throw new Error('no-install-url');
  return downloads.install(game, isInstalledNow);
}

ipcMain.handle('downloads:list', () => downloads.list());
ipcMain.handle('downloads:install', (_e, id) => startInstall(id));
ipcMain.handle('downloads:forget', (_e, id) => downloads.forget(id));
ipcMain.handle('downloads:cancel', (_e, id) => downloads.cancel(id));

/* ----------------------------- Ratings ----------------------------------- */

// Metacritic scores trickle in from Steam's store API; the renderer asks for
// what it is about to draw and gets the rest pushed as they arrive.
ratings.init((batch) => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('ratings:update', batch);
});

ipcMain.handle('ratings:request', (_e, appids, front) => ratings.request(appids || [], !!front));
ipcMain.handle('ratings:all', () => ratings.all());

// Steam's own collections, read from the client's local cloud-storage mirror
// and mirrored into Arcadia's lists. The mirror is one-way by design: Steam's
// store carries a cloud change-counter and the running client owns it, so
// writing to it from outside risks losing the user's real collections.
ipcMain.handle('collections:sync', () => {
  try {
    const pending = new Set(library.getSettings().pendingSteamDeletes || []);
    const found = library.getSettings().steamCollections
      ? readCollections().filter((c) => !pending.has(c.id)) // deleted here, not yet in Steam
      : [];
    return library.syncSteamCollections(found);
  } catch (err) {
    console.error('[collections]', err.message);
    return library.getLists();
  }
});

/* ------------------------------- Lists ----------------------------------- */

ipcMain.handle('lists:get', () => library.getLists());
ipcMain.handle('lists:create', (_e, name) => library.createList(name));
ipcMain.handle('lists:rename', (_e, id, name) => { library.renameList(id, name); return library.getLists(); });
// Deleting a Steam-linked list also deletes the collection in Steam. That write
// can only happen while Steam is closed, so it's queued and applied as soon as
// it can be — see flushSteamDeletes.
ipcMain.handle('lists:delete', (_e, id) => {
  const target = library.getLists().find((l) => l.id === id);
  const lists = library.deleteList(id);
  let steam = null;
  if (target && target.steamId) {
    const pending = new Set(library.getSettings().pendingSteamDeletes || []);
    pending.add(target.steamId);
    library.setSettings({ pendingSteamDeletes: [...pending] });
    steam = flushSteamDeletes().includes(target.steamId) ? 'applied' : 'pending';
  }
  return { lists, steam };
});

// Applies queued Steam collection deletions if Steam isn't running. Returns the
// ids that were applied this time.
function flushSteamDeletes() {
  const pending = library.getSettings().pendingSteamDeletes || [];
  if (!pending.length) return [];
  let res;
  try {
    res = deleteCollections(pending, path.join(app.getPath('userData'), 'steam-collection-backups'));
  } catch (err) {
    console.error('[collections] delete failed:', err.message);
    return [];
  }
  if (res.applied.length) {
    library.setSettings({ pendingSteamDeletes: pending.filter((x) => !res.applied.includes(x)) });
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('collections:steamDeleted', res.applied);
    }
  }
  return res.applied;
}

// Steam's UI helper can outlive steam.exe by a moment and still hold the
// cloud-storage files, so "closed" means both are gone.
function steamFullyClosed() {
  if (isSteamRunning()) return false;
  try {
    const out = require('child_process').execSync('tasklist /FI "IMAGENAME eq steamwebhelper.exe" /NH', {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true,
    });
    return !/steamwebhelper\.exe/i.test(out);
  } catch {
    return false;
  }
}

function waitFor(check, timeoutMs) {
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      if (check()) return resolve(true);
      if (Date.now() - start > timeoutMs) return resolve(false);
      setTimeout(tick, 1000);
    };
    tick();
  });
}

// "Close Steam and apply": the user asked for it, so shut Steam down through
// its own -shutdown switch (it saves its state on the way out), write the
// queued deletions, and start Steam again — which then uploads them.
// Never called on its own: closing Steam can interrupt a game or a download.
ipcMain.handle('collections:applyNow', async () => {
  const pending = library.getSettings().pendingSteamDeletes || [];
  if (!pending.length) return { applied: [], closed: false, restarted: false };

  const dir = getSteamPath();
  const exe = dir ? path.join(dir, 'steam.exe') : null;
  const wasRunning = isSteamRunning();

  if (wasRunning) {
    if (!exe || !fs.existsSync(exe)) return { error: 'no-steam' };
    spawn(exe, ['-shutdown'], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
    // Steam may ask the user to confirm (a game running, a sync in flight);
    // give it a generous window, and write nothing if it never closes.
    if (!(await waitFor(steamFullyClosed, 90000))) return { applied: [], closed: false, restarted: false, error: 'steam-busy' };
  }

  const applied = flushSteamDeletes();
  let restarted = false;
  if (wasRunning && exe) {
    spawn(exe, [], { detached: true, stdio: 'ignore' }).unref();
    restarted = true;
  }
  return { applied, closed: wasRunning, restarted };
});

ipcMain.handle('collections:pending', () => library.getSettings().pendingSteamDeletes || []);

// Steam is usually open, so check back regularly: the moment it closes, the
// queued deletions go in, and Steam uploads them on its next start.
app.whenReady().then(() => {
  flushSteamDeletes();
  setInterval(flushSteamDeletes, 15000);
});
ipcMain.handle('lists:setGame', (_e, listId, gameId, member) => {
  library.setListGame(listId, gameId, member);
  return library.getLists();
});
ipcMain.handle('lists:reorder', (_e, orderedIds) => library.reorderLists(orderedIds || []));
ipcMain.handle('ratings:stats', () => ratings.stats());
ipcMain.handle('downloads:clear', () => downloads.clearFinished());

// Opens the store client's own window, for anything Arcadia can't drive.
ipcMain.handle('downloads:openClient', (_e, source) => {
  const urls = { steam: 'steam://open/downloads', epic: 'com.epicgames.launcher://apps', xbox: 'ms-windows-store://downloadsandupdates' };
  if (!urls[source]) return false;
  shell.openExternal(urls[source]);
  return true;
});

/* ----------------------------- Updates ----------------------------------- */

// Single source of truth for the version shown in the UI — no hard-coded
// constant in the renderer that can drift from package.json.
ipcMain.handle('app:version', () => app.getVersion());
// True when running as the Microsoft Store (MSIX) build.
ipcMain.handle('app:isStore', () => !!process.windowsStore);
ipcMain.handle('update:check', () => updater.check());
ipcMain.handle('update:download', () => updater.download());
ipcMain.handle('update:install', () => updater.installNow());

// Update the window + taskbar icon live from a PNG the renderer rendered.
ipcMain.handle('app:setIcon', (_e, dataUrl) => {
  try {
    const img = nativeImage.createFromDataURL(dataUrl);
    if (img.isEmpty()) return false;
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.setIcon(img);
    if (tray) tray.setImage(img.resize({ width: 16, height: 16 }));
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('folder:add', async () => {
  const res = await dialog.showOpenDialog(mainWindow, {
    title: t('pickFolderTitle'),
    properties: ['openDirectory'],
  });
  if (res.canceled || !res.filePaths.length) return library.getSettings();
  return library.addFolder(res.filePaths[0]);
});

ipcMain.handle('folder:remove', (_e, folder) => library.removeFolder(folder));

// Launch the Discord desktop app (titlebar quick button).
function launchDiscord() {
  const base = path.join(process.env.LOCALAPPDATA || '', 'Discord');
  try {
    const update = path.join(base, 'Update.exe');
    if (fs.existsSync(update)) {
      spawn(update, ['--processStart', 'Discord.exe'], { detached: true, stdio: 'ignore' }).unref();
      return true;
    }
    if (fs.existsSync(base)) {
      const apps = fs.readdirSync(base).filter((d) => d.startsWith('app-')).sort().reverse();
      for (const a of apps) {
        const exe = path.join(base, a, 'Discord.exe');
        if (fs.existsSync(exe)) {
          spawn(exe, { detached: true, stdio: 'ignore' }).unref();
          return true;
        }
      }
    }
  } catch (err) {
    console.error('[discord]', err.message);
  }
  // Fallback: the discord:// protocol (works if Discord is registered).
  try {
    shell.openExternal('discord://');
    return true;
  } catch {
    return false;
  }
}

ipcMain.handle('app:openDiscord', () => launchDiscord());

// Is the Discord desktop app currently running?
function isDiscordRunning() {
  return new Promise((resolve) => {
    try {
      const p = spawn('tasklist', ['/FI', 'IMAGENAME eq Discord.exe', '/NH'], { windowsHide: true });
      let out = '';
      p.stdout.on('data', (d) => { out += d; });
      p.on('close', () => resolve(/discord\.exe/i.test(out)));
      p.on('error', () => resolve(false));
    } catch {
      resolve(false);
    }
  });
}

function closeDiscordApp() {
  return new Promise((resolve) => {
    try {
      const p = spawn('taskkill', ['/F', '/T', '/IM', 'Discord.exe'], { windowsHide: true });
      p.on('close', () => resolve(true));
      p.on('error', () => resolve(false));
    } catch {
      resolve(false);
    }
  });
}

ipcMain.handle('app:discordStatus', () => isDiscordRunning());
ipcMain.handle('app:closeDiscord', () => closeDiscordApp());

// List of currently running process image names (lowercased) for the grid's
// "game is running" indicators.
// Running process image names + full paths (paths let us match a game by its
// install folder even when we don't know the exe name).
function runningProcs() {
  return new Promise((resolve) => {
    const ps = 'Get-Process | ForEach-Object { "$($_.ProcessName)|$($_.Path)" }';
    try {
      const p = spawn('powershell', ['-NoProfile', '-Command', ps], { windowsHide: true });
      let out = '';
      p.stdout.on('data', (d) => { out += d; });
      p.on('close', () => {
        const names = [];
        const paths = [];
        for (const line of out.split(/\r?\n/)) {
          const i = line.indexOf('|');
          if (i < 0) continue;
          const name = line.slice(0, i).trim().toLowerCase();
          const pth = line.slice(i + 1).trim().toLowerCase();
          if (name) names.push(name + '.exe');
          if (pth) paths.push(pth);
        }
        resolve({ names, paths });
      });
      p.on('error', () => resolve({ names: [], paths: [] }));
    } catch {
      resolve({ names: [], paths: [] });
    }
  });
}

// Cheap process-name probe via tasklist — a native Win32 tool that starts ~10x
// faster than PowerShell. Used for the frequent poll; the heavier PowerShell
// path scan (runningProcs) only runs occasionally.
function runningProcNames() {
  return new Promise((resolve) => {
    try {
      const p = spawn('tasklist', ['/fo', 'csv', '/nh'], { windowsHide: true });
      let out = '';
      p.stdout.on('data', (d) => { out += d; });
      p.on('close', () => {
        const names = [];
        for (const line of out.split(/\r?\n/)) {
          const m = line.match(/^"([^"]+\.exe)"/i);
          if (m) names.push(m[1].toLowerCase());
        }
        resolve(names);
      });
      p.on('error', () => resolve([]));
    } catch {
      resolve([]);
    }
  });
}

// Steam marks running games in the registry (Apps\<appid>\Running = 1). This
// detects any running Steam game by appid — no need to know its exe path.
function runningSteamApps() {
  return new Promise((resolve) => {
    try {
      const p = spawn('reg', ['query', 'HKCU\\Software\\Valve\\Steam\\Apps', '/s', '/v', 'Running'], { windowsHide: true });
      let out = '';
      p.stdout.on('data', (d) => { out += d; });
      p.on('close', () => {
        const running = [];
        let cur = null;
        for (const line of out.split(/\r?\n/)) {
          const m = line.match(/\\Apps\\(\d+)\s*$/);
          if (m) { cur = m[1]; continue; }
          if (cur && /Running\s+REG_DWORD\s+0x1/i.test(line)) running.push(cur);
        }
        resolve(running);
      });
      p.on('error', () => resolve([]));
    } catch {
      resolve([]);
    }
  });
}

// withPaths runs the heavier PowerShell scan (full process paths) for install-dir
// matching; without it we use the cheap tasklist name probe + Steam registry.
ipcMain.handle('app:runningProcs', async (_e, opts = {}) => {
  const steam = await runningSteamApps();
  if (opts && opts.withPaths) {
    const { names, paths } = await runningProcs();
    return { procs: names, paths, steam };
  }
  return { procs: await runningProcNames(), paths: null, steam };
});

// Force-kill a process tree by image name (fast, no graceful close).
function killExe(exe) {
  return new Promise((resolve) => {
    try {
      const p = spawn('taskkill', ['/F', '/T', '/IM', exe], { windowsHide: true });
      p.on('close', () => resolve(true));
      p.on('error', () => resolve(false));
    } catch {
      resolve(false);
    }
  });
}

// Kill every process whose executable lives under a folder (for games whose
// exe name we don't know, e.g. most Steam titles).
function killByDir(dir) {
  return new Promise((resolve) => {
    if (!dir) { resolve(false); return; }
    const ps = `Get-Process | Where-Object { $_.Path -like '${dir.replace(/'/g, "''")}\\*' } | Stop-Process -Force -ErrorAction SilentlyContinue`;
    try {
      const p = spawn('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps], { windowsHide: true });
      p.on('close', () => resolve(true));
      p.on('error', () => resolve(false));
    } catch {
      resolve(false);
    }
  });
}

// Close a game AND any companion apps launched alongside it, all at once.
ipcMain.handle('game:close', async (_e, id) => {
  const g = library.getGame(id);
  if (!g) return false;
  const procsOf = (x) => (x.killNames && x.killNames.length ? x.killNames : x.exeNames && x.exeNames.length ? x.exeNames : x.exeName ? [x.exeName] : []);
  const exes = new Set(procsOf(g));
  for (const cid of g.companions || []) {
    const c = library.getGame(cid);
    if (c) for (const n of procsOf(c)) exes.add(n);
  }
  const tasks = [...exes].map(killExe);
  // Steam/Xbox (or any exe-less) game: kill whatever runs under its folder.
  if (g.installDir && (g.source === 'steam' || g.source === 'xbox' || !exes.size)) {
    tasks.push(killByDir(g.installDir));
  }
  if (!tasks.length) return false;
  await Promise.all(tasks);
  return true;
});
