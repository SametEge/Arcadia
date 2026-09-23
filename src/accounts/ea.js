'use strict';

// EA account link (EA app, formerly Origin).
//
// The Origin-era library API (api1.origin.com) has been shut down, so this uses
// what the EA app itself talks to:
//   1. The user signs in on EA's own page (signin.ea.com). That leaves an SSO
//      session cookie in this provider's persisted Electron session.
//   2. accounts.ea.com/connect/auth with prompt=none trades that session for a
//      short-lived bearer token — no password or refresh token is ever stored.
//   3. The EA app's GraphQL service lists the account's games.
// The GraphQL query below was checked field-by-field against the live schema.

const { json, sessionJson, login } = require('./util');
const tokens = require('./tokens');

const ID = 'ea';
const PARTITION = 'persist:arcadia-ea';
const AUTH_URL = 'https://accounts.ea.com/connect/auth?client_id=ORIGIN_JS_SDK&response_type=token&redirect_uri=nucleus:rest';
const GRAPHQL_URL = 'https://service-aggregation-layer.juno.ea.com/graphql';
const PERSONA_URL = 'https://gateway.ea.com/proxy/identity/pids/me/personas';

const LIBRARY_QUERY = `{ me { ownedGameProducts(locale: "en") { items {
  originOfferId
  product { name gameSlug
    baseItem { title gameType packArt { path } }
    gameProductUser { ownershipMethods } }
} } } }`;

// A fresh bearer token from the stored EA session, or null when signed out.
async function sessionToken() {
  try {
    const t = await sessionJson(`${AUTH_URL}&prompt=none`, PARTITION);
    return t && t.access_token ? t.access_token : null;
  } catch {
    return null;
  }
}

async function displayName(token) {
  try {
    const p = await json(PERSONA_URL, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
    const list = p && p.personas && p.personas.persona;
    const first = Array.isArray(list) ? list[0] : list;
    return (first && (first.displayName || first.name)) || null;
  } catch {
    return null;
  }
}

async function signIn() {
  const token = await login({
    // prompt=login lands on EA's real sign-in form at signin.ea.com.
    url: `${AUTH_URL}&prompt=login`,
    partition: PARTITION,
    title: 'EA',
    width: 560,
    height: 760,
    match: async (url) => {
      // Fast path: EA sometimes hands the token straight back in the redirect.
      const m = /[#&?]access_token=([^&#]+)/.exec(url || '');
      if (m) return decodeURIComponent(m[1]);
      // Otherwise the session cookie is now set and prompt=none mints a token.
      return sessionToken();
    },
  });
  if (!token) return null;

  const account = { name: (await displayName(token)) || 'EA', linkedAt: Date.now() };
  tokens.set(ID, account);
  return account;
}

function signOut() { tokens.clear(ID); }

function status() {
  const a = tokens.get(ID);
  return a ? { linked: true, name: a.name, avatar: null } : { linked: false };
}

// DLC, expansions and bonus content share the library with the games.
const NOT_A_GAME = /dlc|add.?on|expansion|extra|bundle|currency|pack\b/i;

// One ownedGameProducts item → a library entry, or null if it should be
// skipped. Exported for tests.
function toGame(item) {
  if (!item || !item.originOfferId || !item.product) return null;
  const p = item.product;
  const base = p.baseItem || {};
  if (base.gameType && NOT_A_GAME.test(base.gameType)) return null;

  // Owned through Steam: that copy is the Steam card, not a second EA one.
  const methods = (p.gameProductUser && p.gameProductUser.ownershipMethods) || [];
  if (methods.some((m) => /steam/i.test(String(m)))) return null;

  const title = String(base.title || p.name || '').trim();
  if (!title) return null;

  const art = base.packArt && base.packArt.path;
  const offer = encodeURIComponent(item.originOfferId);
  return {
    id: `ea:${item.originOfferId}`,
    title,
    source: 'ea',
    owned: true,
    launch: { type: 'url', value: `origin2://game/launch?offerIds=${offer}` },
    installUrl: `origin2://game/download?offerId=${offer}`,
    cover: art && /^https?:/i.test(art) ? art : null,
  };
}

async function fetchLibrary() {
  if (!tokens.get(ID)) return [];

  const token = await sessionToken();
  if (!token) {
    const e = new Error('expired');
    e.code = 'expired';
    throw e;
  }

  let data;
  try {
    data = await json(GRAPHQL_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      body: { query: LIBRARY_QUERY },
    });
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      const e = new Error('expired');
      e.code = 'expired';
      throw e;
    }
    throw err;
  }

  const items = (data && data.data && data.data.me && data.data.me.ownedGameProducts && data.data.me.ownedGameProducts.items) || [];
  const seen = new Set();
  const games = [];
  for (const it of items) {
    const g = toGame(it);
    if (!g || seen.has(g.id)) continue;
    seen.add(g.id);
    games.push(g);
  }
  return games;
}

module.exports = { id: ID, signIn, signOut, status, fetchLibrary, _internals: { toGame, LIBRARY_QUERY } };
