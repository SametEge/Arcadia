'use strict';

// Encrypted, per-user storage for store-account tokens.
//
// Tokens never go into library.json (which is plain JSON the user may share when
// reporting a bug) — they live in their own file, encrypted with Electron's
// safeStorage, which on Windows is backed by DPAPI and tied to the Windows
// account. Copying the file to another machine yields nothing readable.

const fs = require('fs');
const path = require('path');
const { app, safeStorage } = require('electron');

const FILE = () => path.join(app.getPath('userData'), 'accounts.dat');

let cache = null;

function readAll() {
  if (cache) return cache;
  try {
    const raw = fs.readFileSync(FILE());
    // The first run after an OS/profile change can leave an undecryptable blob;
    // treating that as "no accounts" just means the user logs in again.
    const json = safeStorage.isEncryptionAvailable()
      ? safeStorage.decryptString(raw)
      : raw.toString('utf8');
    cache = JSON.parse(json);
  } catch {
    cache = {};
  }
  return cache;
}

function writeAll(data) {
  cache = data;
  try {
    const json = JSON.stringify(data);
    const buf = safeStorage.isEncryptionAvailable()
      ? safeStorage.encryptString(json)
      : Buffer.from(json, 'utf8');
    fs.mkdirSync(path.dirname(FILE()), { recursive: true });
    fs.writeFileSync(FILE(), buf);
  } catch (err) {
    console.error('[accounts] token save failed:', err.message);
  }
}

function get(provider) {
  return readAll()[provider] || null;
}

function set(provider, data) {
  const all = readAll();
  all[provider] = data;
  writeAll(all);
  return data;
}

function clear(provider) {
  const all = readAll();
  delete all[provider];
  writeAll(all);
}

module.exports = { get, set, clear };
