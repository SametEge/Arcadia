'use strict';

// Epic Games account link.
//
// Epic's own launcher uses a public OAuth client whose id/secret ship inside
// every Epic Games Launcher install; third-party launchers (Playnite, Heroic,
// Legendary) use the same pair because Epic offers no other way to read a
// personal library. The login itself happens on Epic's real login page — we
// only pick up the authorization code it hands back.

const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { json, request, login } = require('./util');
const tokens = require('./tokens');

const ID = 'epic';
const PARTITION = 'persist:arcadia-epic';
const LAUNCHER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) EpicGamesLauncher';

// Base64 of the launcher's public client id:secret.
const BASIC = 'MzRhMDJjZjhmNDQxNGUyOWIxNTkyMTg3NmRhMzZmOWE6ZGFhZmJjY2M3Mzc3NDUwMzlkZmZlNTNkOTRmYzc2Y2Y=';

const LOGIN_URL = 'https://www.epicgames.com/id/login?responseType=code';
const OAUTH_URL = 'https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/token';
const LIBRARY_URL = 'https://library-service.live.use1a.on.epicgames.com/library/api/public/items?includeMetadata=true&platform=Windows';
const CATALOG_URL = 'https://catalog-public-service-prod06.ol.epicgames.com/catalog/api/shared/namespace/';

async function exchange(form) {
  const res = await request(OAUTH_URL, {
    method: 'POST',
    headers: { Authorization: 'basic ' + BASIC },
    form,
  });
  if (res.status >= 400) {
    const err = new Error(`Epic auth failed (HTTP ${res.status})`);
    err.status = res.status;
    throw err;
  }
  return JSON.parse(res.body);
}

async function signIn() {
  const code = await login({
    url: LOGIN_URL,
    partition: PARTITION,
    userAgent: LAUNCHER_UA, // Epic's captcha refuses a generic browser UA
    title: 'Epic Games',
    width: 600,
    height: 760,
    match: async (url, win) => {
      // After a successful login Epic redirects to a localhost URL carrying the
      // authorization code. The page never loads (nothing listens there), so the
      // code is read off the address, and off the page body as a fallback.
      const fromUrl = /[?&]code=([A-Za-z0-9]+)/.exec(url);
      if (fromUrl) return fromUrl[1];
      if (!/epicgames\.com/i.test(url)) return null;
      const src = await win.webContents
        .executeJavaScript('document.body ? document.body.innerText : ""')
        .catch(() => '');
      const m = /localhost\/launcher\/authorized\?code=([A-Za-z0-9]+)/i.exec(src);
      return m ? m[1] : null;
    },
  });
  if (!code) return null;

  const t = await exchange({ grant_type: 'authorization_code', code, token_type: 'eg1' });
  const account = {
    accessToken: t.access_token,
    refreshToken: t.refresh_token,
    accountId: t.account_id,
    name: t.displayName || t.account_id,
    expiresAt: Date.parse(t.expires_at) || Date.now() + 7 * 3600 * 1000,
    linkedAt: Date.now(),
  };
  tokens.set(ID, account);
  return account;
}

function signOut() { tokens.clear(ID); }

function status() {
  const a = tokens.get(ID);
  return a ? { linked: true, name: a.name, avatar: null } : { linked: false };
}

// Epic access tokens last a few hours; the refresh token renews them silently
// so the user only logs in once.
async function validToken() {
  const a = tokens.get(ID);
  if (!a) return null;
  if (Date.now() < a.expiresAt - 60000) return a;

  const t = await exchange({ grant_type: 'refresh_token', refresh_token: a.refreshToken, token_type: 'eg1' });
  const next = {
    ...a,
    accessToken: t.access_token,
    refreshToken: t.refresh_token,
    expiresAt: Date.parse(t.expires_at) || Date.now() + 7 * 3600 * 1000,
  };
  tokens.set(ID, next);
  return next;
}

/* ------------------------------ Catalog ---------------------------------- */

// Catalog entries never change, so they're kept on disk: the first sync pays
// for them once and every later sync is instant.
const CACHE_FILE = () => path.join(app.getPath('userData'), 'epic-catalog.json');

function readCache() {
  try { return JSON.parse(fs.readFileSync(CACHE_FILE(), 'utf8')); } catch { return {}; }
}

function writeCache(obj) {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE()), { recursive: true });
    fs.writeFileSync(CACHE_FILE(), JSON.stringify(obj));
  } catch (err) {
    console.error('[epic] catalog cache save failed:', err.message);
  }
}

// Runs `worker` over `items` with at most `limit` in flight.
async function pooled(items, limit, worker) {
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      try { await worker(items[i]); } catch { /* one batch failing is not fatal */ }
    }
  });
  await Promise.all(runners);
}

const chunk = (arr, n) => {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};

// Resolves every record to its catalog entry, keyed "<namespace>:<id>".
//
// The bulk endpoint takes many ids at once as long as they share a namespace,
// so records are grouped by namespace and requested in batches instead of one
// call per game. If a batch comes back short (older endpoint behaviour), the
// missing ids are retried singly so nothing is silently dropped.
async function loadCatalog(records, auth, onProgress = () => {}) {
  const cache = readCache();
  const result = new Map();
  const wanted = [];

  for (const r of records) {
    const key = r.namespace + ':' + r.catalogItemId;
    if (cache[key]) result.set(key, cache[key]);
    else wanted.push(r);
  }
  if (!wanted.length) return result;

  const byNamespace = new Map();
  for (const r of wanted) {
    if (!byNamespace.has(r.namespace)) byNamespace.set(r.namespace, []);
    byNamespace.get(r.namespace).push(r.catalogItemId);
  }

  const batches = [];
  for (const [ns, ids] of byNamespace) {
    for (const part of chunk([...new Set(ids)], 40)) batches.push({ ns, ids: part });
  }

  let done = 0;
  const fresh = {};
  const fetchBatch = async ({ ns, ids }) => {
    const query = ids.map((id) => `id=${encodeURIComponent(id)}`).join('&');
    let bulk = null;
    try {
      bulk = await json(`${CATALOG_URL}${ns}/bulk/items?${query}&country=US&locale=en-US&includeMainGameDetails=true`, { headers: auth });
    } catch { /* fall through to the per-id retry below */ }

    const got = bulk && typeof bulk === 'object' ? bulk : {};
    for (const id of ids) {
      if (got[id]) {
        const key = ns + ':' + id;
        result.set(key, got[id]);
        fresh[key] = got[id];
      }
    }

    // Anything the batch didn't answer for, ask individually.
    const missing = ids.filter((id) => !got[id]);
    for (const id of missing) {
      try {
        const one = await json(`${CATALOG_URL}${ns}/bulk/items?id=${encodeURIComponent(id)}&country=US&locale=en-US&includeMainGameDetails=true`, { headers: auth });
        if (one && one[id]) {
          const key = ns + ':' + id;
          result.set(key, one[id]);
          fresh[key] = one[id];
        }
      } catch { /* this one stays unknown */ }
    }

    done += ids.length;
    onProgress({ stage: 'catalog', done: Math.min(done, wanted.length), total: wanted.length });
  };

  await pooled(batches, 4, fetchBatch);
  if (Object.keys(fresh).length) writeCache({ ...cache, ...fresh });
  return result;
}

async function fetchLibrary(onProgress = () => {}) {
  let a;
  try {
    a = await validToken();
  } catch {
    const e = new Error('expired');
    e.code = 'expired';
    throw e;
  }
  if (!a) return [];

  const auth = { Authorization: `bearer ${a.accessToken}` };
  const records = [];
  let url = LIBRARY_URL;
  // The library is cursor-paginated; a large account spans several pages.
  for (let page = 0; page < 30; page++) {
    let data;
    try {
      data = await json(url, { headers: auth });
    } catch (err) {
      if (err.status === 401) { const e = new Error('expired'); e.code = 'expired'; throw e; }
      throw err;
    }
    records.push(...(data.records || []));
    onProgress({ stage: 'records', done: records.length });
    const next = data.responseMetadata && data.responseMetadata.nextCursor;
    if (!next) break;
    url = `${LIBRARY_URL}&cursor=${encodeURIComponent(next)}`;
  }

  const usable = records.filter((r) => r.appName && r.namespace && r.catalogItemId);
  // A record is only a game once the catalog says so — the raw library also
  // holds DLC, soundtracks and engine builds. Asking per record meant hundreds
  // of sequential round-trips, which is what made the sync appear to hang.
  const catalog = await loadCatalog(usable, auth, onProgress);

  const games = [];
  for (const r of usable) {
    const item = catalog.get(r.namespace + ':' + r.catalogItemId) || null;

    if (item) {
      const cats = (item.categories || []).map((c) => c.path);
      if (!cats.includes('games')) continue;
      if (item.mainGameItem) continue; // DLC
    }

    // Without catalog data we can't tell a game from its DLC, and a library
    // full of soundtracks is worse than a missing entry. The exception is the
    // catalog being unreachable altogether — then names beat nothing.
    if (!item && catalog.size > 0) continue;

    const title = (item && item.title) || r.appName;
    const art =
      item && Array.isArray(item.keyImages)
        ? (item.keyImages.find((i) => i.type === 'DieselGameBoxTall') ||
           item.keyImages.find((i) => i.type === 'OfferImageTall') ||
           item.keyImages.find((i) => i.type === 'DieselGameBox') ||
           item.keyImages.find((i) => i.type === 'OfferImageWide'))
        : null;

    games.push({
      // Matches the local Epic scanner's id, so installed and owned agree.
      id: `epic:${r.appName}`,
      title: String(title).trim(),
      source: 'epic',
      owned: true,
      launch: {
        type: 'url',
        value: `com.epicgames.launcher://apps/${r.namespace}%3A${r.catalogItemId}%3A${r.appName}?action=launch&silent=true`,
      },
      installUrl: `com.epicgames.launcher://apps/${r.namespace}%3A${r.catalogItemId}%3A${r.appName}?action=install`,
      cover: art ? art.url : null,
    });
  }
  return games;
}

module.exports = {
  id: ID, signIn, signOut, status, fetchLibrary,
  // For build/test_epic_catalog.js — not part of the app's own API.
  _internals: { loadCatalog, pooled, chunk },
};
