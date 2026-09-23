'use strict';

// Steam collections ("bitirilen oyunlar", "Co-op oyunlar" …).
//
// Modern Steam keeps them in the client's cloud-storage mirror, not in
// sharedconfig.vdf: userdata/<id>/config/cloudstorage/cloud-storage-namespace-1.json
// is a JSON array of [key, entry] pairs, and every collection lives under a
// "user-collections." key whose `value` is itself a JSON string.
//
// A collection can be manual (an explicit `added` list), dynamic (a filterSpec
// Steam evaluates itself), or both. Only the explicit list is read here — the
// rules behind a dynamic collection are Steam's own and would have to be
// reimplemented to match, so a purely dynamic collection comes back empty and
// is skipped rather than shown wrong.

const fs = require('fs');
const path = require('path');
const { getSteamPath } = require('./scanners/steam');

// Arcadia has its own favourites and hidden games; mirroring Steam's would be
// two competing sources of truth for the same idea.
const SKIP_KEYS = new Set(['user-collections.favorite', 'user-collections.hidden']);

function userDataDirs() {
  const steamPath = getSteamPath();
  if (!steamPath) return [];
  const root = path.join(steamPath, 'userdata');
  try {
    return fs.readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory() && /^\d+$/.test(d.name))
      .map((d) => path.join(root, d.name));
  } catch {
    return [];
  }
}

function readNamespace(file) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Returns [{ id, name, appids, dynamic }] across every Steam account on the PC.
function readCollections() {
  const out = [];
  const seen = new Set();

  for (const dir of userDataDirs()) {
    const file = path.join(dir, 'config', 'cloudstorage', 'cloud-storage-namespace-1.json');
    if (!fs.existsSync(file)) continue;

    for (const pair of readNamespace(file)) {
      if (!Array.isArray(pair) || typeof pair[0] !== 'string') continue;
      const [key, entry] = pair;
      if (!key.startsWith('user-collections.') || SKIP_KEYS.has(key)) continue;
      if (!entry || entry.is_deleted || !entry.value) continue;

      let data;
      try { data = JSON.parse(entry.value); } catch { continue; }
      if (!data || !data.name) continue;

      const appids = (data.added || []).map(String).filter((s) => /^\d+$/.test(s));
      const removed = new Set((data.removed || []).map(String));
      const ids = appids.filter((a) => !removed.has(a));
      if (!ids.length) continue; // purely dynamic, or empty

      const id = key.slice('user-collections.'.length);
      if (seen.has(id)) continue;
      seen.add(id);

      out.push({
        id,
        name: String(data.name),
        appids: ids,
        dynamic: !!data.filterSpec,
      });
    }
  }

  return out.sort((a, b) => a.name.localeCompare(b.name));
}

/* ------------------------------ Deleting ---------------------------------- */
//
// Deleting a collection replicates, byte for byte, what the Steam client's own
// CloudStorage.Delete does (read from steamui/chunk~*.js):
//   - the entry becomes { key, timestamp: <unix seconds>, is_deleted: true },
//     with no value, version or resolution method;
//   - the key is added to cloud-storage-namespace-1.modified.json, the "dirty
//     keys" list Steam uploads on its next start. Without it Steam would
//     re-download the cloud copy and the collection would come back.
//
// The running client holds this file in memory and rewrites it on its own, so
// nothing is written while steam.exe is up — the caller keeps the deletion
// pending and retries once Steam has closed. Both files are backed up first.

const { execSync } = require('child_process');

function isSteamRunning() {
  try {
    const out = execSync('tasklist /FI "IMAGENAME eq steam.exe" /NH', {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true,
    });
    return /steam\.exe/i.test(out);
  } catch {
    return true; // can't tell → assume it is, and don't touch its files
  }
}

function namespaceFiles(userDir) {
  const base = path.join(userDir, 'config', 'cloudstorage');
  return {
    data: path.join(base, 'cloud-storage-namespace-1.json'),
    modified: path.join(base, 'cloud-storage-namespace-1.modified.json'),
  };
}

// Write-then-rename so a crash mid-write can never leave Steam a half file.
function writeJsonAtomic(file, value) {
  const tmp = file + '.arcadia-tmp';
  fs.writeFileSync(tmp, JSON.stringify(value));
  fs.renameSync(tmp, file);
}

// Marks the given collection ids deleted in Steam's store.
// Returns { applied: [ids], pending: [ids], reason? }.
// `opts.dirs` / `opts.steamRunning` exist for tests.
function deleteCollections(ids, backupRoot, opts = {}) {
  const running = opts.steamRunning || isSteamRunning;
  const wanted = [...new Set(ids)];
  if (!wanted.length) return { applied: [], pending: [] };
  if (running()) return { applied: [], pending: wanted, reason: 'steam-running' };

  const applied = new Set();
  const now = Math.floor(Date.now() / 1000);

  for (const dir of opts.dirs || userDataDirs()) {
    const f = namespaceFiles(dir);
    if (!fs.existsSync(f.data)) continue;

    const pairs = readNamespace(f.data);
    let dirty = [];
    try {
      const parsed = JSON.parse(fs.readFileSync(f.modified, 'utf8'));
      if (Array.isArray(parsed)) dirty = parsed;
    } catch { /* missing or empty: start a fresh list */ }

    let changed = false;
    for (const id of wanted) {
      const key = 'user-collections.' + id;
      const i = pairs.findIndex((p) => Array.isArray(p) && p[0] === key);
      // Not in this account's store, or already a tombstone: nothing left to
      // delete, so it must not sit in the pending queue forever.
      if (i < 0) { applied.add(id); continue; }
      if (pairs[i][1] && pairs[i][1].is_deleted) { applied.add(id); continue; }
      pairs[i] = [key, { key, timestamp: now, is_deleted: true }];
      if (!dirty.includes(key)) dirty.push(key);
      changed = true;
      applied.add(id);
    }
    if (!changed) continue;

    // Back up exactly what we're about to replace.
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const bdir = path.join(backupRoot, stamp, path.basename(dir));
    fs.mkdirSync(bdir, { recursive: true });
    fs.copyFileSync(f.data, path.join(bdir, path.basename(f.data)));
    if (fs.existsSync(f.modified)) fs.copyFileSync(f.modified, path.join(bdir, path.basename(f.modified)));

    // Steam may have started while we were reading; if so, back off.
    if (running()) return { applied: [], pending: wanted, reason: 'steam-running' };

    // Same order Steam uses: dirty list first, then the namespace.
    writeJsonAtomic(f.modified, dirty);
    writeJsonAtomic(f.data, pairs);
  }

  return { applied: [...applied], pending: wanted.filter((id) => !applied.has(id)) };
}

module.exports = { readCollections, deleteCollections, isSteamRunning };
