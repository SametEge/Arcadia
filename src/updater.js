'use strict';

// GitHub releases based auto-update.
//
// electron-updater reads the `latest.yml` that electron-builder uploads next to
// the installer, compares it with the running version and downloads the new
// setup in the background. The user decides in Settings whether an update is
// installed automatically on the next launch or only after they confirm.
//
// NOTE: updates only work in a packaged build (an installed Arcadia). In `npm
// start` the app has no update metadata, so every check reports "no update".

const { autoUpdater } = require('electron-updater');
const library = require('./library');

// Inside an MSIX package from the Microsoft Store the app lives in the
// read-only WindowsApps folder: electron-updater couldn't patch it, it would
// install a second, non-Store copy beside it — and Store policy requires Store
// apps to update through the Store anyway. So in a Store build this stays off.
const IN_STORE = !!process.windowsStore;

let win = null;
let checking = false;
let downloaded = null; // version string once a download has finished

// electron-updater's own flow is driven manually so the setting can switch
// between "download + install silently" and "ask first".
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

function send(channel, payload) {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload);
}

function status(state, extra = {}) {
  send('update:status', { state, ...extra });
}

function wire() {
  autoUpdater.on('error', (err) => {
    checking = false;
    status('error', { message: err == null ? 'unknown' : (err.message || String(err)) });
  });

  autoUpdater.on('update-available', (info) => {
    checking = false;
    status('available', { version: info.version });
    if (library.getSettings().autoUpdate) autoUpdater.downloadUpdate().catch(() => {});
  });

  autoUpdater.on('update-not-available', () => {
    checking = false;
    status('latest', { version: require('electron').app.getVersion() });
  });

  autoUpdater.on('download-progress', (p) => {
    status('downloading', { percent: Math.round(p.percent || 0) });
  });

  autoUpdater.on('update-downloaded', (info) => {
    downloaded = info.version;
    status('downloaded', { version: info.version });
    // With auto-update on, the update is applied the next time Arcadia quits,
    // so the user is never interrupted mid-session.
    if (library.getSettings().autoUpdate) autoUpdater.autoInstallOnAppQuit = true;
  });
}

function init(mainWindow) {
  win = mainWindow;
  wire();
}

// `silent` is used for the automatic check on launch: it reports through the
// status channel but never opens a dialog.
async function check() {
  if (IN_STORE) { status('store'); return { state: 'store' }; }
  if (checking) return { state: 'checking' };
  if (!require('electron').app.isPackaged) {
    status('dev');
    return { state: 'dev' };
  }
  checking = true;
  status('checking');
  try {
    const res = await autoUpdater.checkForUpdates();
    return { state: 'checked', version: res && res.updateInfo ? res.updateInfo.version : null };
  } catch (err) {
    checking = false;
    status('error', { message: err.message });
    return { state: 'error', message: err.message };
  }
}

async function download() {
  try {
    await autoUpdater.downloadUpdate();
    return true;
  } catch (err) {
    status('error', { message: err.message });
    return false;
  }
}

// Quit and run the downloaded installer right away.
function installNow() {
  if (IN_STORE || !downloaded) return false;
  autoUpdater.autoInstallOnAppQuit = true;
  setImmediate(() => autoUpdater.quitAndInstall(false, true));
  return true;
}

// Called once on launch. Only checks when the user has left auto-update on.
function checkOnLaunch() {
  if (IN_STORE) return;
  if (!library.getSettings().autoUpdate) return;
  setTimeout(() => { check().catch(() => {}); }, 4000); // let the window settle first
}

module.exports = { init, check, download, installNow, checkOnLaunch, isDownloaded: () => downloaded };
