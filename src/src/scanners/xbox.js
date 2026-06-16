'use strict';

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { findMainExe, prettify } = require('./util');

// Microsoft Store / Game Pass titles ship store artwork as PNGs; use the best
// one as the tile image so games like Minecraft show real art (not a generic
// .exe icon). Hints are ordered from most to least preferred.
const ART_HINTS = [
  'poster', 'keyart', 'hero', 'largetile', 'square480x480logo', 'square310x310logo',
  'square150x150logo', 'wide310x150logo', 'splashscreen', 'storelogo', 'logo',
];

function findXboxArt(installDir) {
  let best = null;
  let bestScore = -1;

  function consider(full, name) {
    const n = name.toLowerCase();
    if (!/\.(png|jpg|jpeg)$/.test(n)) return;
    const idx = ART_HINTS.findIndex((h) => n.includes(h));
    if (idx < 0) return;
    let size = 0;
    try { size = fs.statSync(full).size; } catch {}
    // Rank (hint preference) dominates; file size only breaks ties within a hint.
    const score = (ART_HINTS.length - idx) * 1e9 + size;
    if (score > bestScore) { bestScore = score; best = full; }
  }

  function walk(dir, depth) {
    if (depth > 2) return;
    let ents;
    try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (depth === 0 || /asset|image|resource|logo|art|media/i.test(e.name)) walk(full, depth + 1);
      } else {
        consider(full, e.name);
      }
    }
  }

  walk(installDir, 0);
  return best;
}

// Folders Windows/Xbox creates that aren't games.
const SKIP_DIRS = new Set(['gamesave', 'gamesaves', '.gaming', 'temp']);

// Xbox / Game Pass (PC) installs land in <drive>:\XboxGames\<Title>\Content\.
function xboxRoots() {
  const roots = [];
  for (const d of ['C', 'D', 'E', 'F', 'G', 'H']) {
    const p = `${d}:\\XboxGames`;
    try {
      if (fs.existsSync(p)) roots.push(p);
    } catch {
      /* ignore */
    }
  }
  return roots;
}

async function scanXbox() {
  const games = [];
  const seen = new Set();

  for (const root of xboxRoots()) {
    let dirs;
    try {
      dirs = fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory());
    } catch {
      continue;
    }

    for (const d of dirs) {
      if (SKIP_DIRS.has(d.name.toLowerCase())) continue;
      const title = prettify(d.name);
      const id = `xbox:${d.name}`;
      if (seen.has(id)) continue;
      seen.add(id);

      const dir = path.join(root, d.name);
      const content = path.join(dir, 'Content');
      const exe = fs.existsSync(content) ? findMainExe(content) : findMainExe(dir);
      const art = findXboxArt(dir);

      games.push({
        id,
        title,
        source: 'xbox',
        launch: exe ? { type: 'path', value: exe } : null,
        iconPath: exe,
        iconImage: art ? pathToFileURL(art).href : null,
        exeName: exe ? path.basename(exe).toLowerCase() : '',
        installDir: dir,
      });
    }
  }
  return games;
}

module.exports = { scanXbox };
