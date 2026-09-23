'use strict';

// Steam account link.
//
// Steam's store pages embed a short-lived Web API token for the logged-in user
// in the `#application_config` element. Reading it after a normal store login
// means the user never has to create or paste an API key — the same approach
// Playnite uses. The token expires (~24h), so a sync that gets a 401 asks the
// user to link again rather than failing silently.

const { json, login } = require('./util');
const tokens = require('./tokens');

const ID = 'steam';
const PARTITION = 'persist:arcadia-steam';
const STORE_URL = 'https://store.steampowered.com/explore/';

// Steam "apps" that are tools/runtimes rather than games.
const SKIP_APPIDS = new Set([
  '228980', '1070560', '1391110', '1628350', '1493710',
  '2348590', '2805730', '1826330', '1887720',
]);

// Pulls { steamid, webapi_token } out of the store page the user just loaded.
// Returns null while they are still on a login step.
async function readToken(win) {
  const result = await win.webContents.executeJavaScript(`
    (() => {
      const cfg = document.getElementById('application_config');
      if (!cfg) return null;
      try {
        const user = JSON.parse(cfg.getAttribute('data-userinfo') || '{}');
        const store = JSON.parse(cfg.getAttribute('data-store_user_config') || '{}');
        if (!user.logged_in || !store.webapi_token || !user.steamid) return null;
        return { steamId: String(user.steamid), token: store.webapi_token };
      } catch { return null; }
    })()
  `).catch(() => null);
  return result;
}

async function signIn() {
  const result = await login({
    url: STORE_URL,
    partition: PARTITION,
    title: 'Steam',
    width: 640,
    height: 760,
    // No URL matching: Steam fills the token into whatever page is open, and
    // readToken's own logged_in/webapi_token checks are the real guard. Testing
    // the address instead would skip a page that is actually ready.
    match: async (_url, win) => readToken(win),
  });
  if (!result) return null;

  const account = { ...result, linkedAt: Date.now() };
  // Store the display name too, so Settings can show who is linked.
  try {
    const sum = await json(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?access_token=${encodeURIComponent(result.token)}&steamids=${result.steamId}`
    );
    const p = sum && sum.response && sum.response.players && sum.response.players[0];
    if (p) { account.name = p.personaname; account.avatar = p.avatarfull; }
  } catch { /* name is cosmetic */ }

  tokens.set(ID, account);
  return account;
}

function signOut() { tokens.clear(ID); }

function status() {
  const a = tokens.get(ID);
  return a ? { linked: true, name: a.name || a.steamId, avatar: a.avatar || null } : { linked: false };
}

// Every game on the account, installed or not.
async function fetchLibrary() {
  const a = tokens.get(ID);
  if (!a) return [];

  const url =
    'https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/' +
    `?access_token=${encodeURIComponent(a.token)}` +
    `&steamid=${a.steamId}` +
    '&include_appinfo=true&include_played_free_games=true&format=json';

  let data;
  try {
    data = await json(url);
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      const e = new Error('expired');
      e.code = 'expired';
      throw e;
    }
    throw err;
  }

  const games = (data && data.response && data.response.games) || [];
  return games
    .filter((g) => !SKIP_APPIDS.has(String(g.appid)))
    .map((g) => ({
      // Same id shape the local Steam scanner uses, so an installed game and its
      // owned-library entry are one and the same card.
      id: `steam:${g.appid}`,
      title: (g.name || '').trim(),
      source: 'steam',
      owned: true,
      launch: { type: 'url', value: `steam://rungameid/${g.appid}` },
      // steam://install opens the client's install dialog directly; steam://store
      // would only show the shop page and leave the user to find the button.
      installUrl: `steam://install/${g.appid}`,
      cover: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/library_600x900.jpg`,
      coverFallback: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
      playtime: (g.playtime_forever || 0) * 60, // seconds
    }))
    .filter((g) => g.title);
}

module.exports = { id: ID, signIn, signOut, status, fetchLibrary };
