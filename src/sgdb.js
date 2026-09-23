'use strict';

// SteamGridDB cover lookup. The caller passes the key: either the user's own
// from Settings, or the shared fallback in main.js (DEFAULT_SGDB_KEY) so covers
// work out of the box. That fallback is committed and therefore public — treat
// it as a shared quota, not a secret, and expect it to be rate-limited or
// revoked one day; a user's own key always wins. Without any key this module
// simply returns nothing.
const https = require('https');

const API = 'https://www.steamgriddb.com/api/v2';

function apiGet(path, key) {
  return new Promise((resolve) => {
    try {
      const req = https.request(API + path, { headers: { Authorization: `Bearer ${key}` } }, (res) => {
        let d = '';
        res.on('data', (c) => { d += c; });
        res.on('end', () => {
          try { resolve(JSON.parse(d)); } catch { resolve(null); }
        });
      });
      req.on('error', () => resolve(null));
      req.setTimeout(9000, () => req.destroy());
      req.end();
    } catch {
      resolve(null);
    }
  });
}

const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Guard against fuzzy mismatches (e.g. "Blitz" → "Blitz Breaker", "Wand" →
// "Wand Wars"): only accept a candidate whose name matches the title exactly
// once punctuation/case/spacing is normalised. Substring matches were too loose.
function nameMatches(candidate, target) {
  return !!target && norm(candidate) === target;
}

// Returns a portrait cover URL for `title`, or null if no confident match.
async function findCover(title, key) {
  if (!title || !key) return null;
  const target = norm(title);
  const search = await apiGet(`/search/autocomplete/${encodeURIComponent(title)}`, key);
  if (!search || !search.success || !Array.isArray(search.data)) return null;

  const cands = search.data.filter((g) => nameMatches(g.name, target));
  // Exact name matches first, then the rest.
  cands.sort((a, b) => (norm(b.name) === target) - (norm(a.name) === target));

  for (const g of cands.slice(0, 3)) {
    const grids = await apiGet(`/grids/game/${g.id}?dimensions=600x900,660x930&types=static&limit=1`, key);
    const grid = grids && grids.success && Array.isArray(grids.data) && grids.data[0];
    if (grid && grid.url) return grid.url;
  }
  return null;
}

module.exports = { findCover };
