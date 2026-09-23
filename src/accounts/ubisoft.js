'use strict';

// Ubisoft Connect account link.
//
// Ubisoft's ownership GraphQL only admits the Connect PC client's own app id,
// which isn't published; Arcadia won't lift it out of Ubisoft's binary to pose
// as their launcher. What the public Connect *web* app is allowed to read is the
// account's played-games list, so that's what this uses. In practice it covers
// the games you have actually launched; titles owned but never started won't
// appear until they've been played once.
//
// The user signs in on Ubisoft's own WebAuth page. The web app then keeps a
// session ticket in its storage, which is read once and kept encrypted like
// every other token. Tickets are short-lived; when one expires the user is
// asked to link again.

const { json, login } = require('./util');
const tokens = require('./tokens');

const ID = 'ubisoft';
const PARTITION = 'persist:arcadia-ubisoft';
const APP_ID = '314d4fef-e568-454a-ae06-43e3bece12a6'; // Ubisoft Connect web app
const LOGIN_URL =
  'https://connect.ubisoft.com/login?appId=' + APP_ID +
  '&lang=en-US&nextUrl=' + encodeURIComponent('https://connect.ubisoft.com/ready');
const PLAYED_URL = 'https://public-ubiservices.ubi.com/v1/profiles/me/gamesplayed';

// Looks through the page's web storage for the session the WebAuth app saved.
// The key name has changed over the years, so match on shape, not name.
const READ_SESSION = `
  (() => {
    const stores = [window.localStorage, window.sessionStorage];
    for (const store of stores) {
      for (let i = 0; i < store.length; i++) {
        const raw = store.getItem(store.key(i));
        if (!raw || raw.indexOf('ticket') < 0) continue;
        try {
          const v = JSON.parse(raw);
          if (v && v.ticket && v.sessionId) {
            return { ticket: v.ticket, sessionId: v.sessionId,
                     profileId: v.profileId || v.userId || null,
                     name: v.nameOnPlatform || v.username || null };
          }
        } catch (e) { /* not JSON */ }
      }
    }
    return null;
  })()
`;

async function signIn() {
  const session = await login({
    url: LOGIN_URL,
    partition: PARTITION,
    title: 'Ubisoft Connect',
    width: 560,
    height: 760,
    match: (_url, win) => win.webContents.executeJavaScript(READ_SESSION).catch(() => null),
  });
  if (!session) return null;

  const account = { ...session, name: session.name || 'Ubisoft', linkedAt: Date.now() };
  tokens.set(ID, account);
  return account;
}

function signOut() { tokens.clear(ID); }

function status() {
  const a = tokens.get(ID);
  return a ? { linked: true, name: a.name, avatar: null } : { linked: false };
}

// The played-games payload isn't documented, so find the list by its contents
// rather than a fixed path: the first array of objects that carry a name.
function findGames(payload) {
  const stack = [payload];
  while (stack.length) {
    const v = stack.pop();
    if (Array.isArray(v)) {
      if (v.length && v.every((x) => x && typeof x === 'object') && v.some((x) => x.name || x.title)) return v;
      for (const x of v) stack.push(x);
    } else if (v && typeof v === 'object') {
      for (const x of Object.values(v)) stack.push(x);
    }
  }
  return [];
}

// One played-games entry → a library entry, or null. Exported for tests.
function toGame(item) {
  if (!item) return null;
  const title = String(item.name || item.title || '').trim();
  const spaceId = item.spaceId || item.id || item.applicationId;
  if (!title || !spaceId) return null;
  // Console entries turn up here too; only PC can be launched from Arcadia.
  const platform = String(item.platform || item.platformType || item.platformId || 'PC');
  if (!/pc|uplay|windows/i.test(platform)) return null;

  return {
    id: `ubisoft:${spaceId}`,
    title,
    source: 'ubisoft',
    owned: true,
    launch: { type: 'url', value: 'uplay://' },
    installUrl: 'uplay://',
    cover: null, // SteamGridDB fills this in
  };
}

async function fetchLibrary() {
  const a = tokens.get(ID);
  if (!a) return [];

  let data;
  try {
    data = await json(PLAYED_URL, {
      headers: {
        Authorization: `Ubi_v1 t=${a.ticket}`,
        'Ubi-AppId': APP_ID,
        'Ubi-SessionId': a.sessionId,
        Accept: 'application/json',
      },
    });
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      const e = new Error('expired');
      e.code = 'expired';
      throw e;
    }
    throw err;
  }

  const seen = new Set();
  const games = [];
  for (const it of findGames(data)) {
    const g = toGame(it);
    if (!g || seen.has(g.id)) continue;
    seen.add(g.id);
    games.push(g);
  }
  return games;
}

module.exports = { id: ID, signIn, signOut, status, fetchLibrary, _internals: { toGame, findGames } };
