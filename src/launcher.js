'use strict';

const { shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { t } = require('./i18n');

// Launch a game by its stored descriptor.
//   { type: 'url',  value: 'steam://rungameid/730' }            -> openExternal (protocols)
//   { type: 'path', value: 'C:\\...\\game.exe' }                -> openPath (exe/.lnk/.url)
//   { type: 'exe',  value: 'C:\\...\\RiotClientServices.exe',
//     args: '--launch-product=valorant --launch-patchline=live' } -> spawn with args
async function launchGame(game) {
  if (!game || !game.launch || !game.launch.value) {
    throw new Error(t('noLaunchTarget'));
  }
  const { type, value, args } = game.launch;

  const isProtocol = /^[a-z][a-z0-9+.\-]*:/i.test(value) && !/^file:/i.test(value);
  if (type === 'url' && isProtocol) {
    await shell.openExternal(value);
    return;
  }

  if (type === 'exe') {
    // Run an executable with arguments (e.g. Riot Client → a specific game).
    const argv = Array.isArray(args)
      ? args
      : (String(args || '').match(/(?:[^\s"]+|"[^"]*")+/g) || []).map((a) => a.replace(/^"|"$/g, ''));
    const child = spawn(value, argv, { cwd: path.dirname(value), detached: true, stdio: 'ignore' });
    child.on('error', () => {});
    child.unref();
    return;
  }

  const err = await shell.openPath(value);
  if (err) throw new Error(err);
}

module.exports = { launchGame };
