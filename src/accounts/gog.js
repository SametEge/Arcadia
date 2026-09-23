'use strict';

// GOG account link.
//
// GOG offers no OAuth for third parties. You log into gog.com itself and the
// account endpoints answer to the session cookie — the same approach Playnite
// uses. Arcadia never reads the cookie: requests go out through Electron's
// `net` bound to this provider's persisted session, so the browser sends it.

const { sessionJson, login } = require('./util');
const tokens = require('./tokens');

const ID = 'gog';
const PARTITION = 'persist:arcadia-gog';
const LOGIN_URL = 'https://www.gog.com/account/';
const ACCOUNT_URL = 'https://menu.gog.com/v1/account/basic';
const LIBRARY_URL = 'https://www.gog.com/account/getFilteredProducts?hiddenFlag=0&mediaType=1&sortBy=title&page=';

async function accountInfo() {
  try {
    const a = await sessionJson(ACCOUNT_URL, PARTITION);
    return a && a.isLoggedIn ? a : null;
  } catch {
    return null;
  }
}

async function signIn() {
  const info = await login({
    url: LOGIN_URL,
    partition: PARTITION,
    title: 'GOG',
    width: 620,
    height: 760,
    // GOG logs you in through a modal on the same page, so there is no
    // redirect to watch — just ask the account endpoint until it says yes.
    match: () => accountInfo(),
  });
  if (!info) return null;

  const account = { name: info.username || 'GOG', userId: info.userId || null, linkedAt: Date.now() };
  tokens.set(ID, account);
  return account;
}

function signOut() { tokens.clear(ID); }

function status() {
  const a = tokens.get(ID);
  return a ? { linked: true, name: a.name, avatar: null } : { linked: false };
}

// Turns one getFilteredProducts product into a library entry. Exported for tests.
function toGame(p) {
  if (!p || !p.id || !p.title) return null;
  return {
    id: `gog:${p.id}`,
    title: String(p.title).trim(),
    source: 'gog',
    owned: true,
    // Galaxy opens the game's page, where "Install" is one click.
    launch: { type: 'url', value: `goggalaxy://openGameView/${p.id}` },
    installUrl: `goggalaxy://openGameView/${p.id}`,
    // GOG only has landscape tiles; leaving `cover` empty lets SteamGridDB
    // supply portrait art the grid is built for.
    cover: null,
  };
}

async function fetchLibrary(onProgress = () => {}) {
  if (!tokens.get(ID)) return [];

  const games = [];
  let totalPages = 1;
  for (let page = 1; page <= totalPages && page <= 60; page++) {
    let data;
    try {
      data = await sessionJson(LIBRARY_URL + page, PARTITION);
    } catch (err) {
      if (err.code === 'expired') {
        const e = new Error('expired');
        e.code = 'expired';
        throw e;
      }
      throw err;
    }
    totalPages = Number(data.totalPages) || 1;
    for (const p of data.products || []) {
      const g = toGame(p);
      if (g) games.push(g);
    }
    onProgress({ done: page, total: totalPages });
  }
  return games;
}

module.exports = { id: ID, signIn, signOut, status, fetchLibrary, _internals: { toGame } };
