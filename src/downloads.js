'use strict';

// Install/download tracking.
//
// Arcadia does not download games itself — no store offers a public API for
// that, and Playnite hands off the same way. What Arcadia does is ask the
// store's own client to start the install and then follow it, so the user gets
// a real download screen instead of an opaque "check the other launcher".
//
// How much each store exposes differs:
//   Steam  — appmanifest_<appid>.acf carries live BytesDownloaded /
//            BytesToDownload, so we show a true percentage, speed and ETA.
//   Epic   — its manifest only says "incomplete install", so we show progress
//            against InstallSize when we can measure it, else just the state.
//   Xbox   — the Microsoft Store exposes nothing; we can only watch for the
//            game to appear on disk.

const fs = require('fs');
const path = require('path');
const { shell } = require('electron');
const { parseVDF } = require('./vdf');
const { getSteamPath, getLibraryFolders } = require('./scanners/steam');

const POLL_MS = 2000;
const EPIC_MANIFESTS = path.join(
  process.env.ProgramData || 'C:\\ProgramData',
  'Epic', 'EpicGamesLauncher', 'Data', 'Manifests'
);

// id -> { id, title, source, state, percent, downloaded, total, speed, eta,
//         startedAt, lastBytes, lastAt, error }
const active = new Map();
let timer = null;
let notify = () => {};
let onFinished = () => {};

function init({ onUpdate, onComplete }) {
  notify = onUpdate || (() => {});
  onFinished = onComplete || (() => {});
}

function snapshot() {
  return [...active.values()].map((d) => ({
    id: d.id,
    title: d.title,
    source: d.source,
    state: d.state,
    percent: d.percent,
    downloaded: d.downloaded,
    total: d.total,
    speed: d.speed,
    eta: d.eta,
    error: d.error || null,
  }));
}

function push() {
  notify(snapshot());
}

/* ------------------------------- Steam ---------------------------------- */

// Locates appmanifest_<appid>.acf in whichever Steam library holds the game.
function steamManifest(appid) {
  const steamPath = getSteamPath();
  if (!steamPath) return null;
  for (const dir of getLibraryFolders(steamPath)) {
    const file = path.join(dir, `appmanifest_${appid}.acf`);
    if (fs.existsSync(file)) {
      try {
        const data = parseVDF(fs.readFileSync(file, 'utf8'));
        const st = data.AppState || data.appstate;
        if (st) return { st, dir };
      } catch { /* mid-write by Steam: try again on the next tick */ }
    }
  }
  return null;
}

function pollSteam(d) {
  const found = steamManifest(d.appid);
  if (!found) {
    // Steam hasn't created the manifest yet — the user may still be on the
    // client's confirmation dialog.
    d.state = 'pending';
    return;
  }
  const { st } = found;
  const toDownload = Number(st.BytesToDownload || 0);
  const downloaded = Number(st.BytesDownloaded || 0);
  const toStage = Number(st.BytesToStage || 0);
  const staged = Number(st.BytesStaged || 0);
  const flags = Number(st.StateFlags || 0);

  // Fully installed: flag 4 set and nothing left to move.
  const done = (flags & 4) !== 0 && toDownload > 0 && downloaded >= toDownload && staged >= toStage;
  if (done) {
    d.state = 'done';
    d.percent = 100;
    return;
  }

  if (toDownload > 0 && downloaded < toDownload) {
    d.state = 'downloading';
    d.total = toDownload;
    d.downloaded = downloaded;
    d.percent = Math.min(99, Math.floor((downloaded / toDownload) * 100));
  } else if (toStage > 0 && staged < toStage) {
    // Steam downloaded everything and is now unpacking into place.
    d.state = 'installing';
    d.total = toStage;
    d.downloaded = staged;
    d.percent = Math.min(99, Math.floor((staged / toStage) * 100));
  } else {
    d.state = 'pending';
  }
}

/* -------------------------------- Epic ----------------------------------- */

function epicManifest(appName) {
  let files = [];
  try {
    files = fs.readdirSync(EPIC_MANIFESTS).filter((f) => f.endsWith('.item'));
  } catch {
    return null;
  }
  for (const f of files) {
    try {
      const m = JSON.parse(fs.readFileSync(path.join(EPIC_MANIFESTS, f), 'utf8'));
      if (m.AppName === appName) return m;
    } catch { /* skip malformed */ }
  }
  return null;
}

// Cheap-ish size of an install dir. Bounded so a huge tree can't stall the
// poll loop; when the cap is hit we fall back to state-only progress.
function dirSize(dir, budget = 4000) {
  let total = 0;
  let seen = 0;
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try { entries = fs.readdirSync(cur, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      if (++seen > budget) return null; // too big to measure cheaply
      const p = path.join(cur, e.name);
      if (e.isDirectory()) stack.push(p);
      else {
        try { total += fs.statSync(p).size; } catch { /* vanished mid-walk */ }
      }
    }
  }
  return total;
}

function pollEpic(d) {
  const m = epicManifest(d.appName);
  if (!m) { d.state = 'pending'; return; }

  if (m.bIsIncompleteInstall === false) { d.state = 'done'; d.percent = 100; return; }

  d.state = 'downloading';
  const total = Number(m.InstallSize || 0);
  const onDisk = m.InstallLocation ? dirSize(m.InstallLocation) : null;
  if (total > 0 && onDisk !== null) {
    d.total = total;
    d.downloaded = Math.min(onDisk, total);
    d.percent = Math.min(99, Math.floor((d.downloaded / total) * 100));
  } else {
    // Measurable size unknown — the screen shows an indeterminate bar.
    d.percent = null;
  }
}

/* -------------------------------- Xbox ----------------------------------- */

// The Store tells us nothing, so the only signal is the game showing up in the
// XboxGames folder. `checkInstalled` is supplied by main (a library lookup).
function pollXbox(d, checkInstalled) {
  d.percent = null;
  d.state = checkInstalled(d.id) ? 'done' : 'downloading';
}

/* ------------------------------- Engine ---------------------------------- */

// How long an install may sit in "pending" before we stop believing in it.
// Steam/Epic create their manifest within seconds of the user confirming, so
// past this the user almost certainly dismissed or cancelled the store dialog
// and the entry would otherwise sit at "starting…" forever.
const PENDING_GIVE_UP_MS = 90_000;

function tick(checkInstalled) {
  for (const d of active.values()) {
    if (d.state === 'done' || d.state === 'error' || d.state === 'stalled') continue;
    const before = d.downloaded;
    try {
      if (d.source === 'steam') pollSteam(d);
      else if (d.source === 'epic') pollEpic(d);
      else pollXbox(d, checkInstalled);
    } catch (err) {
      d.state = 'error';
      d.error = err.message;
      continue;
    }

    // Speed and ETA from the byte delta between ticks, smoothed so the number
    // doesn't jump around every two seconds.
    const now = Date.now();
    if (d.downloaded > before && d.lastAt) {
      const inst = ((d.downloaded - d.lastBytes) * 1000) / Math.max(1, now - d.lastAt);
      d.speed = d.speed ? d.speed * 0.7 + inst * 0.3 : inst;
      if (d.speed > 0 && d.total) d.eta = Math.max(0, Math.round((d.total - d.downloaded) / d.speed));
    }
    if (d.downloaded !== d.lastBytes) { d.lastBytes = d.downloaded; d.lastAt = now; }

    // Never started, or cancelled in the store: stop pretending it's coming.
    if (d.state === 'pending' && Date.now() - d.startedAt > PENDING_GIVE_UP_MS) {
      d.state = 'stalled';
      d.percent = null;
      d.speed = 0;
      d.eta = null;
      continue;
    }

    // Was downloading and the manifest vanished — cancelled from the store.
    if (d.state === 'pending' && d.everStarted) {
      d.state = 'stalled';
      d.percent = null;
      continue;
    }
    if (d.state === 'downloading' || d.state === 'installing') d.everStarted = true;

    if (d.state === 'done') {
      d.percent = 100;
      d.speed = 0;
      d.eta = 0;
      onFinished(d.id);
    }
  }

  push();
  const live = [...active.values()].some((d) => d.state !== 'done' && d.state !== 'error' && d.state !== 'stalled');
  if (!live) stop();
}

function start(checkInstalled) {
  if (timer) return;
  timer = setInterval(() => tick(checkInstalled), POLL_MS);
  // Report immediately rather than waiting a full interval.
  tick(checkInstalled);
}

function stop() {
  if (timer) { clearInterval(timer); timer = null; }
}

// Ask the store to install `game` and begin following it.
async function install(game, checkInstalled) {
  if (!game || !game.installUrl) throw new Error('no-install-url');

  const entry = {
    id: game.id,
    title: game.customTitle || game.title,
    source: game.source,
    state: 'pending',
    percent: 0,
    downloaded: 0,
    total: 0,
    speed: 0,
    eta: null,
    startedAt: Date.now(),
    lastBytes: 0,
    lastAt: 0,
  };
  if (game.source === 'steam') entry.appid = String(game.id).replace(/^steam:/, '');
  if (game.source === 'epic') entry.appName = String(game.id).replace(/^epic:/, '');

  active.set(game.id, entry);
  await shell.openExternal(game.installUrl);
  start(checkInstalled);
  push();
  return snapshot();
}

// Cancels an install. No store exposes a "stop downloading" call to third
// parties, so what Arcadia can do is stop tracking it and — when bytes are
// actually moving — put the store's own download queue in front of the user so
// they can stop it there in one click.
const DOWNLOAD_PAGES = {
  steam: 'steam://open/downloads',
  epic: 'com.epicgames.launcher://apps',
  xbox: 'ms-windows-store://downloadsandupdates',
};

async function cancel(id) {
  const d = active.get(id);
  if (!d) return { removed: false, openedStore: false };
  const wasRunning = d.state === 'downloading' || d.state === 'installing';
  active.delete(id);
  push();
  if (!active.size) stop();

  if (wasRunning && DOWNLOAD_PAGES[d.source]) {
    try { await shell.openExternal(DOWNLOAD_PAGES[d.source]); } catch { /* best effort */ }
    return { removed: true, openedStore: true };
  }
  return { removed: true, openedStore: false };
}

// Stops following an install. The store client keeps doing whatever it was
// doing — Arcadia never had control over it.
function forget(id) {
  active.delete(id);
  push();
  if (!active.size) stop();
  return snapshot();
}

function clearFinished() {
  for (const [id, d] of active) {
    if (d.state === 'done' || d.state === 'error' || d.state === 'stalled') active.delete(id);
  }
  push();
  return snapshot();
}

module.exports = {
  init, install, cancel, forget, clearFinished, snapshot, list: snapshot,
  // Exposed for build/test_downloads.js, which drives the pollers against the
  // real manifests on this machine. Not part of the app's own API.
  _internals: { pollSteam, pollEpic, steamManifest, epicManifest },
};
