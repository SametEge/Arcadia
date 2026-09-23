'use strict';
// Builds the Microsoft Store (MSIX/AppX) package.
//   npm run dist:store
//
// electron-builder packs AppX with makepri.exe / makeappx.exe. The copies it
// ships don't survive this machine: the legacy bundle's makepri fails on
// Windows 11 (PRI191, 0x8007007e) and a freshly downloaded modern bundle is
// blocked by Smart App Control (spawn UNKNOWN). The Windows SDK's own tools are
// Microsoft-signed and installed, so both problems go away — this finds the
// newest SDK on the PC and hands it to electron-builder through its
// ELECTRON_BUILDER_WINDOWS_KITS_PATH hook.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function newestSdkBin() {
  const root = path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Windows Kits', '10', 'bin');
  let versions = [];
  try {
    versions = fs.readdirSync(root).filter((v) => /^10\.\d+\.\d+\.\d+$/.test(v));
  } catch {
    return null;
  }
  const byVersion = (a, b) => {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < 4; i++) if (pa[i] !== pb[i]) return pb[i] - pa[i];
    return 0;
  };
  for (const v of versions.sort(byVersion)) {
    const dir = path.join(root, v, 'x64');
    if (fs.existsSync(path.join(dir, 'makeappx.exe')) && fs.existsSync(path.join(dir, 'makepri.exe'))) return dir;
  }
  return null;
}

const env = { ...process.env };
if (!env.ELECTRON_BUILDER_WINDOWS_KITS_PATH) {
  const sdk = newestSdkBin();
  if (sdk) {
    env.ELECTRON_BUILDER_WINDOWS_KITS_PATH = sdk;
    console.log(`Using Windows SDK tools: ${sdk}`);
  } else {
    console.log('No Windows SDK found; falling back to electron-builder\'s bundled tools.');
  }
}

const cli = path.join(__dirname, '..', 'node_modules', 'electron-builder', 'cli.js');
const res = spawnSync(process.execPath, [cli, '--win', 'appx', ...process.argv.slice(2)], { stdio: 'inherit', env });
process.exit(res.status == null ? 1 : res.status);
