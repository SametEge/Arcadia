'use strict';
// Builds the Windows installer (NSIS) — `npm run dist`, or `npm run release`
// to publish it (needs GH_TOKEN). Extra arguments go to electron-builder.
//
// electron-builder makes the NSIS uninstaller by compiling an intermediate
// installer and running it once. Smart App Control blocks exactly that kind of
// freshly built, unsigned exe (spawn UNKNOWN), so on a PC where it's on the
// build can't finish. electron-builder already has a way that runs nothing —
// UninstallerReader copies the uninstaller out of the intermediate installer's
// bytes — but only takes it on macOS Catalina. Turning that switch on makes the
// NSIS build use it here too; everything else is the normal electron-builder
// build. (The flag is only read by the NSIS and MSI targets.)

const path = require('path');

require('app-builder-lib/out/util/macosVersion').isMacOsCatalina = () => true;

const cli = path.join(__dirname, '..', 'node_modules', 'electron-builder', 'cli.js');
process.argv = [process.argv[0], cli, '--win', 'nsis', ...process.argv.slice(2)];
require(cli);
