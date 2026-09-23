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
const { execSync } = require('child_process');

const LOCAL_CONTENT = [
  path.join(process.env.ProgramData || 'C:\\ProgramData', 'EA Desktop', 'LocalContent'),
  path.join(process.env.ProgramData || 'C:\\ProgramData', 'Origin', 'LocalContent'),
];

// Uninstall entries published by EA titles, used for the install folder.
function eaInstallDirs() {
  const dirs = new Map(); // lowercased display name -> install location
  const roots = [
    'HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
    'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
  ];
  for (const root of roots) {
    let list = '';
    try {
      list = execSync(`reg query "${root}"`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    } catch { continue; }

    for (const line of list.split(/\r?\n/)) {
      const key = line.trim();
      if (!key.startsWith('HKEY_')) continue;
      let info = '';
      try {
        info = execSync(`reg query "${key}"`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      } catch { continue; }
      // Only EA's own entries; Steam-published EA games point at steam.exe and
      // must not be picked up here — they already come from the Steam scanner.
      if (!/Electronic Arts|EA Games|Origin/i.test(info)) continue;
      if (/steam\.exe/i.test(info)) continue;

      const name = (info.match(/DisplayName\s+REG_SZ\s+(.+)/i) || [])[1];
      const loc = (info.match(/InstallLocation\s+REG_SZ\s+(.+)/i) || [])[1];
      if (name && loc && fs.existsSync(loc.trim())) dirs.set(name.trim().toLowerCase(), loc.trim());
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
  const installDirs = eaInstallDirs();
  const games = [];
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

      const installDir = installDirs.get(key) || null;
      games.push({
        id: `ea:${offerId}`,
        title,
        source: 'ea',
        launch: { type: 'url', value: `origin2://game/launch?offerIds=${encodeURIComponent(offerId)}` },
        installUrl: `origin2://game/download?offerId=${encodeURIComponent(offerId)}`,
        installDir,
        exeName: '',
      });
    }
  }
  return games;
}

module.exports = { scanEa };
