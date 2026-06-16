'use strict';

const fs = require('fs');
const path = require('path');

// Helper executables that live next to games but are never the game itself.
const JUNK_EXE = [
  'unins', 'setup', 'install', 'vcredist', 'vc_redist', 'dxsetup', 'dotnet',
  'directx', 'redist', 'crashreport', 'crashhandler', 'crashpad', 'unitycrashhandler',
  'uninstall', 'launcher_helper', 'cleanup', 'config', 'settings', 'notification_helper',
  'ueprereqsetup', 'eossdk', 'easyanticheat', 'battleye', 'beservice', 'touchup',
];

function isJunkExe(name) {
  const n = name.toLowerCase();
  return JUNK_EXE.some((j) => n.includes(j));
}

function prettify(name) {
  return name
    .replace(/\.(exe|lnk|url)$/i, '')
    .replace(/[._]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Find the most likely "main" executable under a directory: walk a couple of
// levels deep, ignore helper exes, and prefer the largest binary (a decent
// heuristic for the real game vs. small tools).
function findMainExe(root, maxDepth = 3) {
  let best = null;
  let bestSize = -1;

  function walk(dir, depth) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        walk(full, depth + 1);
      } else if (e.isFile() && e.name.toLowerCase().endsWith('.exe') && !isJunkExe(e.name)) {
        let size = 0;
        try {
          size = fs.statSync(full).size;
        } catch {
          /* ignore */
        }
        // Shallower matches get a bonus so a top-level game.exe beats a deep tool.
        const score = size + (maxDepth - depth) * 5_000_000;
        if (score > bestSize) {
          bestSize = score;
          best = full;
        }
      }
    }
  }

  walk(root, 0);
  return best;
}

module.exports = { findMainExe, isJunkExe, prettify };
