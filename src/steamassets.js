'use strict';

// Real Steam library art, the way Steam's own store and Playnite find it.
//
// The old guess — cdn…/steam/apps/<appid>/library_600x900.jpg — is wrong for a
// growing share of games. Newer titles keep their art under a hashed folder
// (…/<appid>/<sha1>/library_600x900.jpg), some name it library_capsule.jpg, and
// for many the old URL doesn't 404 but returns a 1.6 KB grey placeholder, so
// the image "loads" and no fallback ever kicks in.
//
// IStoreBrowseService/GetItems returns the actual asset paths, needs no key and
// answers for many apps per request. Results are cached on disk; a hash only
// changes when a publisher updates its art, so a couple of weeks is plenty.

const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');
const { app } = require('electron');

const API = 'https://api.steampowered.com/IStoreBrowseService/GetItems/v1/';
const ASSET_BASE = 'https://shared.steamstatic.com/store_item_assets/';
const BATCH = 50;
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

const CACHE_FILE = () => path.join(app.getPath('userData'), 'steam-assets.json');
let cache = null; // appid -> { cover, header, ts }

function load() {
  if (cache) return cache;
  try { cache = JSON.parse(fs.readFileSync(CACHE_FILE(), 'utf8')); } catch { cache = {}; }
  return cache;
}

function save() {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE()), { recursive: true });
    fs.writeFileSync(CACHE_FILE(), JSON.stringify(cache));
  } catch (err) {
    console.error('[steamassets] cache save failed:', err.message);
  }
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'gzip' } }, (res) => {
      const chunks = [];
      const stream = res.headers['content-encoding'] === 'gzip' ? res.pipe(zlib.createGunzip()) : res;
      stream.on('data', (c) => chunks.push(c));
      stream.on('end', () => {
        if (res.statusCode >= 400) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
        try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch (e) { reject(e); }
      });
      stream.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(20000, () => req.destroy(new Error('timeout')));
  });
}

// Builds full URLs from one store item's `assets` block. Exported for tests.
function artFromAssets(assets) {
  if (!assets || !assets.asset_url_format) return { cover: null, header: null };
  const url = (file) => (file ? ASSET_BASE + assets.asset_url_format.replace('${FILENAME}', file) : null);
  return {
    // Portrait art is what the grid is built for; the 2x variant is the same
    // picture at double size, used only when the normal one is absent.
    cover: url(assets.library_capsule || assets.library_capsule_2x),
    header: url(assets.header || assets.main_capsule),
  };
}

async function fetchBatch(appids) {
  const input = {
    ids: appids.map((a) => ({ appid: Number(a) })),
    context: { language: 'english', country_code: 'US' },
    data_request: { include_assets: true },
  };
  const data = await getJson(`${API}?input_json=${encodeURIComponent(JSON.stringify(input))}`);
  const items = (data && data.response && data.response.store_items) || [];
  const out = {};
  for (const it of items) {
    if (!it || !it.appid) continue;
    out[String(it.appid)] = artFromAssets(it.assets);
  }
  return out;
}

// Returns { appid: { cover, header } } for every requested appid. Apps Steam
// doesn't return (delisted, region-locked) come back as { cover: null } so the
// caller can hand them to SteamGridDB instead of retrying Steam forever.
async function resolve(appids, onBatch = () => {}) {
  load();
  const now = Date.now();
  const result = {};
  const todo = [];

  for (const id of new Set(appids.map(String))) {
    const hit = cache[id];
    if (hit && now - hit.ts < MAX_AGE_MS) result[id] = { cover: hit.cover, header: hit.header };
    else todo.push(id);
  }

  for (let i = 0; i < todo.length; i += BATCH) {
    const part = todo.slice(i, i + BATCH);
    let found = {};
    try {
      found = await fetchBatch(part);
    } catch (err) {
      // Leave this batch uncached so the next run tries again.
      console.error('[steamassets] batch failed:', err.message);
      continue;
    }
    const resolvedNow = {};
    for (const id of part) {
      const art = found[id] || { cover: null, header: null };
      cache[id] = { ...art, ts: now };
      result[id] = art;
      resolvedNow[id] = art;
    }
    onBatch(resolvedNow);
  }

  if (todo.length) save();
  return result;
}

module.exports = { resolve, _internals: { artFromAssets } };
