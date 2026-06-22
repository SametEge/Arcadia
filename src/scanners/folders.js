'use strict';

const fs = require('fs');
const path = require('path');
const { findMainExe, isJunkExe, prettify } = require('./util');

// Scan user-chosen folders. The common layout is one sub-folder per game, so
// each sub-folder becomes a game (titled after the folder); loose top-level
// .exe files are added on their own too.
function scanFolder(root) {
  const games = [];
  let entries;
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return games;
  }

  for (const e of entries) {
    const full = path.join(root, e.name);
    if (e.isDirectory()) {
      const exe = findMainExe(full);
      if (exe) {
        games.push({
          id: `folder:${full.toLowerCase()}`,
          title: prettify(e.name),
          source: 'folder',
          launch: { type: 'path', value: exe },
          iconPath: exe,
          exeName: path.basename(exe).toLowerCase(),
          installDir: full,
        });
      }
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.exe') && !isJunkExe(e.name)) {
      games.push({
        id: `folder:${full.toLowerCase()}`,
        title: prettify(e.name),
        source: 'folder',
        launch: { type: 'path', value: full },
        iconPath: full,
        exeName: path.basename(full).toLowerCase(),
        installDir: root,
      });
    }
  }
  return games;
}

async function scanFolders(folders = []) {
  const games = [];
  const seen = new Set();
  for (const folder of folders) {
    for (const g of scanFolder(folder)) {
      if (seen.has(g.id)) continue;
      seen.add(g.id);
      games.push(g);
    }
  }
  return games;
}

module.exports = { scanFolders };
