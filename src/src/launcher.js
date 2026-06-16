'use strict';

const { shell } = require('electron');

// Launch a game by its stored descriptor.
//   { type: 'url',  value: 'steam://rungameid/730' }  -> openExternal (protocols)
//   { type: 'path', value: 'C:\\...\\game.exe' }      -> openPath (exe/.lnk/.url)
async function launchGame(game) {
  if (!game || !game.launch || !game.launch.value) {
    throw new Error('Bu oyun için başlatma hedefi bulunamadı.');
  }
  const { type, value } = game.launch;

  const isProtocol = /^[a-z][a-z0-9+.\-]*:/i.test(value) && !/^file:/i.test(value);
  if (type === 'url' && isProtocol) {
    await shell.openExternal(value);
    return;
  }

  const err = await shell.openPath(value);
  if (err) throw new Error(err);
}

module.exports = { launchGame };
