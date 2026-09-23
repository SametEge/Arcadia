'use strict';

// GOG games.
//
// GOG Galaxy (and the standalone installers) register each game under
//   HKLM\SOFTWARE\WOW6432Node\GOG.com\Games\<gameId>
// with gameName, path and exe. Launching through Galaxy keeps its overlay and
// cloud saves; without Galaxy installed we fall back to the exe, which is fine
// because GOG games are DRM-free.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GAMES_KEY = 'HKLM\\SOFTWARE\\WOW6432Node\\GOG.com\\Games';
const GALAXY_KEY = 'HKLM\\SOFTWARE\\WOW6432Node\\GOG.com\\GalaxyClient\\paths';

function regQuery(key, args = '') {
  try {
    return execSync(`reg query "${key}" ${args}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
}

function value(out, name) {
  const m = out.match(new RegExp(`${name}\\s+REG_\\w+\\s+(.+)`, 'i'));
  return m ? m[1].trim() : null;
}

function galaxyExe() {
  const out = regQuery(GALAXY_KEY, '/v client');
  const dir = value(out, 'client');
  if (!dir) return null;
  const exe = path.join(dir, 'GalaxyClient.exe');
  return fs.existsSync(exe) ? exe : null;
}

async function scanGog() {
  const list = regQuery(GAMES_KEY);
  if (!list) return [];

  const galaxy = galaxyExe();
  const games = [];
  const seen = new Set();

  for (const line of list.split(/\r?\n/)) {
    const m = line.match(/\\Games\\(\d+)\s*$/);
    if (!m) continue;
    const id = m[1];
    if (seen.has(id)) continue;

    const info = regQuery(`${GAMES_KEY}\\${id}`);
    const name = value(info, 'gameName') || value(info, 'startMenu');
    const dir = value(info, 'path');
    if (!name || !dir || !fs.existsSync(dir)) continue;
    seen.add(id);

    // `exe` is usually a full path, occasionally just a file name.
    let exe = value(info, 'exe');
    if (exe && !path.isAbsolute(exe)) exe = path.join(dir, exe);
    if (exe && !fs.existsSync(exe)) exe = null;

    const launch = galaxy
      ? { type: 'exe', value: galaxy, args: `/command=runGame /gameId=${id} /path="${dir}"` }
      : exe
        ? { type: 'path', value: exe }
        : null;

    games.push({
      id: `gog:${id}`,
      title: name,
      source: 'gog',
      launch,
      installUrl: `goggalaxy://openGameView/${id}`,
      iconPath: exe,
      exeName: exe ? path.basename(exe).toLowerCase() : '',
      installDir: dir,
    });
  }
  return games.filter((g) => g.launch);
}

module.exports = { scanGog };
