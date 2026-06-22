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

let mainWindow = null;
let tray = null;
let isQuitting = false;

// Identify to Windows as Arcadia (taskbar grouping, jump list, notifications).
// The packaged Arcadia.exe is what makes Task Manager show "Arcadia" instead of
// "Electron"; this aligns the runtime identity with it.
if (process.platform === 'win32') app.setAppUserModelId('com.arcadia.launcher');

const TRAY_LABELS = {
  tr: { show: 'Aç', quit: 'Çık', topPlayed: 'En çok oynanan' },
  en: { show: 'Open', quit: 'Quit', topPlayed: 'Most played' },
  de: { show: 'Öffnen', quit: 'Beenden', topPlayed: 'Meistgespielt' },
  ja: { show: '開く', quit: '終了', topPlayed: 'よくプレイ' },
  ko: { show: '열기', quit: '종료', topPlayed: '많이 플레이' },
  es: { show: 'Abrir', quit: 'Salir', topPlayed: 'Más jugados' },
};

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) { createWindow(); return; }
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function rebuildTrayMenu() {
  if (!tray) return;
  const L = TRAY_LABELS[library.getSettings().language] || TRAY_LABELS.en;
  const top = library.getState().games
    .filter((g) => !g.hidden && (g.playCount || 0) > 0)
    .sort((a, b) => (b.playCount || 0) - (a.playCount || 0) || (b.lastPlayed || 0) - (a.lastPlayed || 0))
    .slice(0, 5);

  const template = [{ label: L.show, click: showMainWindow }];
  if (top.length) {
    template.push({ type: 'separator' }, { label: L.topPlayed, enabled: false });
    for (const g of top) {
      template.push({ label: g.customTitle || g.title, click: () => launchGameFull(g.id) });
    }
  }
  template.push({ type: 'separator' }, { label: L.quit, click: () => { isQuitting = true; app.quit(); } });
  tray.setContextMenu(Menu.buildFromTemplate(template));
}

// Launch a game (and its companions), record play stats, refresh the tray.
async function launchGameFull(id) {
  const game = library.getGame(id);
  if (!game) return false;
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

// Only allow a single Arcadia window; focus the existing one instead.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => showMainWindow());

  app.whenReady().then(() => {
    createWindow();
    createTray();
    app.setLoginItemSettings({ openAtLogin: !!library.getSettings().autostart });
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
  const result = library.mergeScanned(found);
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
let coversBusy = false;
async function fillCovers() {
  if (coversBusy) return;
  const key = library.getSettings().sgdbKey || DEFAULT_SGDB_KEY;
  if (!key) return;
  coversBusy = true;
  try {
    for (const g of library.getState().games) {
      if (g.customCover || g.autoCover) continue;
      // Steam already has art unless it shipped no local cover (e.g. ZZZ → 404).
      if (g.source === 'steam' && g.localCover) continue;
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
    title: 'Oyun ekle',
    properties: ['openFile'],
    filters: [
      { name: 'Oyunlar ve kısayollar', extensions: ['exe', 'lnk', 'url', 'bat'] },
      { name: 'Tüm dosyalar', extensions: ['*'] },
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
    title: 'Kapak görseli seç',
    properties: ['openFile'],
    filters: [{ name: 'Görseller', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] }],
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
  app.setLoginItemSettings({ openAtLogin: !!on });
  return library.setSettings({ autostart: !!on });
});

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
    title: 'Taranacak oyun klasörü seç',
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
