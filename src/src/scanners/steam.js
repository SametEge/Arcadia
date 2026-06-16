'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { pathToFileURL } = require('url');
const { parseVDF } = require('../vdf');

// Steam "apps" that are tools/runtimes, not games — never show these.
const SKIP_APPIDS = new Set([
  '228980',  // Steamworks Common Redistributables
  '1070560', // Steam Linux Runtime
  '1391110', // Steam Linux Runtime - Soldier
  '1628350', // Steam Linux Runtime 3.0 (Sniper)
  '1493710', // Proton Experimental
  '2348590', // Proton 8.0
  '2805730', // Proton 9.0
  '1826330', // Proton EasyAntiCheat Runtime
  '1887720', // Proton Hotfix
]);

function getSteamPath() {
  try {
    const out = execSync('reg query "HKCU\\Software\\Valve\\Steam" /v SteamPath', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const m = out.match(/SteamPath\s+REG_SZ\s+(.+)/i);
    if (m) {
      const p = path.normalize(m[1].trim());
      if (fs.existsSync(p)) return p;
    }
  } catch {
    /* registry not available, fall through */
  }
  const fallback = 'C:\\Program Files (x86)\\Steam';
  return fs.existsSync(fallback) ? fallback : null;
}

function getLibraryFolders(steamPath) {
  const libs = new Set([path.join(steamPath, 'steamapps')]);
  const vdfPath = path.join(steamPath, 'steamapps', 'libraryfolders.vdf');
  try {
    const data = parseVDF(fs.readFileSync(vdfPath, 'utf8'));
    const lf = data.libraryfolders || data.LibraryFolders || {};
    for (const key of Object.keys(lf)) {
      const entry = lf[key];
      const p = typeof entry === 'string' ? entry : entry && entry.path;
      if (p) libs.add(path.join(p, 'steamapps'));
    }
  } catch {
    /* no extra libraries */
  }
  return [...libs];
}

// Steam caches the real store artwork locally; use it when present so covers
// show instantly and work offline. Falls back to the CDN otherwise.
function localCover(steamPath, appid) {
  const cacheDir = path.join(steamPath, 'appcache', 'librarycache');
  const candidates = [
    path.join(cacheDir, `${appid}_library_600x900.jpg`),
    path.join(cacheDir, appid, 'library_600x900.jpg'),
    path.join(cacheDir, appid, 'library_600x900_2x.jpg'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return pathToFileURL(c).href;
  }
  return null;
}

async function scanSteam() {
  const steamPath = getSteamPath();
  if (!steamPath) return [];

  const games = [];
  const seen = new Set();

  for (const libDir of getLibraryFolders(steamPath)) {
    let files;
    try {
      files = fs.readdirSync(libDir).filter(
        (f) => f.startsWith('appmanifest_') && f.endsWith('.acf')
      );
    } catch {
      continue;
    }

    for (const file of files) {
      try {
        const data = parseVDF(fs.readFileSync(path.join(libDir, file), 'utf8'));
        const st = data.AppState || data.appstate;
        if (!st) continue;
        const appid = String(st.appid || '').trim();
        const name = (st.name || '').trim();
        if (!appid || !name || SKIP_APPIDS.has(appid) || seen.has(appid)) continue;
        seen.add(appid);

        const installDir = st.installdir
          ? path.join(libDir, 'common', st.installdir)
          : null;

        games.push({
          id: `steam:${appid}`,
          title: name,
          source: 'steam',
          launch: { type: 'url', value: `steam://rungameid/${appid}` },
          cover: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`,
          coverFallback: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`,
          localCover: localCover(steamPath, appid),
          installDir,
        });
      } catch {
        /* skip unreadable manifest */
      }
    }
  }
  return games;
}

module.exports = { scanSteam };
