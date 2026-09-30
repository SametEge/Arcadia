'use strict';

// Ubisoft Connect games.
//
// The launcher registers every install under
//   HKLM\SOFTWARE\WOW6432Node\Ubisoft\Launcher\Installs\<gameId>\InstallDir
// and launches by id through its own protocol, which keeps Connect's overlay,
// cloud saves and updates working — running the exe directly often doesn't.

const fs = require('fs');
const path = require('path');
const { prettify, regTree, regValue } = require('./util');

const INSTALLS_KEY = 'HKLM\\SOFTWARE\\WOW6432Node\\Ubisoft\\Launcher\\Installs';
const LAUNCHER_KEY = 'HKLM\\SOFTWARE\\WOW6432Node\\Ubisoft\\Launcher';

async function launcherDir() {
  const dir = await regValue(LAUNCHER_KEY, 'InstallDir');
  return dir ? path.normalize(dir) : null;
}

// The install folder's name is the best title Ubisoft gives us locally; the
// registry holds no display name.
function titleFor(installDir) {
  const base = path.basename(path.normalize(installDir).replace(/[\\/]+$/, ''));
  return prettify(base);
}

// Biggest exe in the install root, used only as an icon source — launching
// still goes through uplay://.
function mainExe(dir) {
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isFile() && /\.exe$/i.test(d.name))
      .filter((d) => !/^(unins|setup|launcher|crash|redist|vc_|dxweb|touchup)/i.test(d.name))
      .map((d) => {
        const p = path.join(dir, d.name);
        let size = 0;
        try { size = fs.statSync(p).size; } catch { /* ignore */ }
        return { p, size };
      })
      .sort((a, b) => b.size - a.size);
    return files.length ? files[0].p : null;
  } catch {
    return null;
  }
}

async function scanUbisoft() {
  const tree = await regTree(INSTALLS_KEY);
  if (!tree.size) return [];

  const games = [];
  const seen = new Set();

  for (const [key, info] of tree) {
    const m = key.match(/\\Installs\\(\d+)$/i);
    if (!m) continue;
    const id = m[1];
    if (seen.has(id)) continue;
    if (!info.installdir) continue;

    const dir = path.normalize(info.installdir);
    if (!fs.existsSync(dir)) continue; // registered but uninstalled
    seen.add(id);

    const exe = mainExe(dir);
    games.push({
      id: `ubisoft:${id}`,
      title: titleFor(dir),
      source: 'ubisoft',
      launch: { type: 'url', value: `uplay://launch/${id}/0` },
      installUrl: `uplay://install/${id}`,
      iconPath: exe,
      exeName: exe ? path.basename(exe).toLowerCase() : '',
      installDir: dir,
    });
  }
  return games;
}

module.exports = { scanUbisoft, launcherDir };
