'use strict';

// EA App / Origin games.
//
// EA has no single registry list of installs. What it does leave behind is a
// per-game folder under %ProgramData%\(EA Desktop|Origin)\LocalContent with a
// `.mfst` manifest whose query string carries the offer id, and an uninstall
// entry that knows where the game actually lives. Both are read here and joined
// by title.
//
// Launching goes through EA's protocol so the EA App handles entitlement and
// updates; a bare exe usually bounces you back to the launcher anyway.

const fs = require('fs');
const path = require('path');
const { regTree } = require('./util');

const LOCAL_CONTENT = [
  path.join(process.env.ProgramData || 'C:\\ProgramData', 'EA Desktop', 'LocalContent'),
  path.join(process.env.ProgramData || 'C:\\ProgramData', 'Origin', 'LocalContent'),
];

const UNINSTALL_ROOTS = [
  'HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
  'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
];

// Uninstall entries published by EA titles, used for the install folder.
async function eaInstallDirs() {
  const dirs = new Map(); // lowercased display name -> install location
  for (const root of UNINSTALL_ROOTS) {
    for (const [key, values] of await regTree(root)) {
      const info = key + '\n' + Object.values(values).join('\n');
      // Only EA's own entries; Steam-published EA games point at steam.exe and
      // must not be picked up here — they already come from the Steam scanner.
      if (!/Electronic Arts|EA Games|Origin/i.test(info)) continue;
      if (/steam\.exe/i.test(info)) continue;

      const name = values.displayname;
      const loc = values.installlocation;
      if (name && loc && fs.existsSync(loc)) dirs.set(name.toLowerCase(), loc);
    }
  }
  return dirs;
}

// A manifest is `?id=<offerId>&...`; the offer id is what origin2:// wants.
function offerIdFrom(file) {
  try {
    const text = fs.readFileSync(file, 'utf8');
    const m = text.match(/[?&]id=([^&\s]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

async function scanEa() {
  const found = [];
  const seen = new Set();

  for (const root of LOCAL_CONTENT) {
    let entries = [];
    try {
      entries = fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory());
    } catch { continue; }

    for (const d of entries) {
      const dir = path.join(root, d.name);
      let manifests = [];
      try {
        manifests = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.mfst'));
      } catch { continue; }
      // An empty LocalContent folder is a leftover from an uninstalled game.
      if (!manifests.length) continue;

      const offerId = offerIdFrom(path.join(dir, manifests[0]));
      if (!offerId) continue;

      const title = d.name;
      const key = title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      found.push({ title, key, offerId });
    }
  }
  // Most PCs have no EA games at all; don't walk the uninstall list for them.
  if (!found.length) return [];

  const installDirs = await eaInstallDirs();
  return found.map(({ title, key, offerId }) => ({
    id: `ea:${offerId}`,
    title,
    source: 'ea',
    launch: { type: 'url', value: `origin2://game/launch?offerIds=${encodeURIComponent(offerId)}` },
    installUrl: `origin2://game/download?offerId=${encodeURIComponent(offerId)}`,
    installDir: installDirs.get(key) || null,
    exeName: '',
  }));
}

module.exports = { scanEa };
