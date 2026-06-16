'use strict';

const fs = require('fs');
const path = require('path');

function manifestsDir() {
  const base = process.env.PROGRAMDATA || 'C:\\ProgramData';
  return path.join(base, 'Epic', 'EpicGamesLauncher', 'Data', 'Manifests');
}

async function scanEpic() {
  const dir = manifestsDir();
  let files;
  try {
    files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.item'));
  } catch {
    return [];
  }

  const games = [];
  for (const file of files) {
    try {
      const m = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      if (!m.DisplayName || !m.InstallLocation) continue;

      // Skip plugins / engine / non-game entries when categories are present.
      const cats = m.AppCategories || [];
      if (cats.length && !cats.includes('games')) continue;

      const exe = m.LaunchExecutable
        ? path.join(m.InstallLocation, m.LaunchExecutable)
        : null;

      const ns = m.CatalogNamespace || m.MainGameCatalogNamespace;
      const cid = m.CatalogItemId || m.MainGameCatalogItemId;
      const appName = m.AppName || m.MainGameAppName;

      // Proper Epic deep-link launches via the store (handles updates/cloud saves).
      const launchUrl =
        ns && cid && appName
          ? `com.epicgames.launcher://apps/${ns}%3A${cid}%3A${appName}?action=launch&silent=true`
          : null;

      games.push({
        id: `epic:${appName || m.DisplayName}`,
        title: m.DisplayName,
        source: 'epic',
        launch: launchUrl
          ? { type: 'url', value: launchUrl }
          : exe
          ? { type: 'path', value: exe }
          : null,
        iconPath: exe,
        exeName: exe ? path.basename(exe).toLowerCase() : '',
        installDir: m.InstallLocation,
      });
    } catch {
      /* skip malformed manifest */
    }
  }
  return games;
}

module.exports = { scanEpic };
