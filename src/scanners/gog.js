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
const { regTree, regValue } = require('./util');

const GAMES_KEY = 'HKLM\\SOFTWARE\\WOW6432Node\\GOG.com\\Games';
const GALAXY_KEY = 'HKLM\\SOFTWARE\\WOW6432Node\\GOG.com\\GalaxyClient\\paths';

async function galaxyExe() {
  const dir = await regValue(GALAXY_KEY, 'client');
  if (!dir) return null;
  const exe = path.join(dir, 'GalaxyClient.exe');
  return fs.existsSync(exe) ? exe : null;
}

async function scanGog() {
  const tree = await regTree(GAMES_KEY);
  if (!tree.size) return [];

  const galaxy = await galaxyExe();
  const games = [];
  const seen = new Set();

  for (const [key, info] of tree) {
    const m = key.match(/\\Games\\(\d+)$/i);
    if (!m) continue;
    const id = m[1];
    if (seen.has(id)) continue;

    const name = info.gamename || info.startmenu;
    const dir = info.path;
    if (!name || !dir || !fs.existsSync(dir)) continue;
    seen.add(id);

    // `exe` is usually a full path, occasionally just a file name.
    let exe = info.exe || null;
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
