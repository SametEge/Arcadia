'use strict';

// Metacritic scores for Steam games.
//
// Valve's appdetails endpoint answers for one appid at a time and rate-limits
// hard (a few hundred requests per five minutes), so a 1000-game library can't
// be fetched in one go. Instead this keeps a permanent on-disk cache and trickles
// through the unknown ones in the background, newest request first — so whatever
// the user is actually looking at gets a score quickly, and the rest fills in.
//
// Only Steam games have an appid; Epic and Xbox entries simply never get a score.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const https = require('https');
const { app } = require('electron');

const API = 'https://store.steampowered.com/api/appdetails';
const GAP_MS = 1600;          // polite spacing between requests
const FAILURE_RETRY_MS = 6 * 60 * 60 * 1000; // re-ask a failed lookup after 6h

const CACHE_FILE = () => path.join(app.getPath('userData'), 'ratings.json');

let cache = null;             // appid -> { score, url, ts, failed? }
let queue = [];               // appids still to look up, front = most wanted
const queued = new Set();
let timer = null;
let onScores = () => {};
let pending = [];             // scores found since the last flush to the renderer

function load() {
  if (cache) return cache;
  try { cache = JSON.parse(fs.readFileSync(CACHE_FILE(), 'utf8')); } catch { cache = {}; }
  return cache;
}

let saveTimer = null;
function saveSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.mkdirSync(path.dirname(CACHE_FILE()), { recursive: true });
      fs.writeFileSync(CACHE_FILE(), JSON.stringify(cache));
    } catch (err) {
      console.error('[ratings] cache save failed:', err.message);
    }
  }, 4000);
}

function init(emit) { onScores = emit || (() => {}); load(); }

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'gzip' } }, (res) => {
      const chunks = [];
      const stream = res.headers['content-encoding'] === 'gzip' ? res.pipe(zlib.createGunzip()) : res;
      stream.on('data', (c) => chunks.push(c));
      stream.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
      stream.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('timeout')));
  });
}

// A cached entry is usable unless it was a failure we're willing to retry.
function known(appid) {
  const e = load()[appid];
  if (!e) return null;
  if (e.failed && Date.now() - e.ts > FAILURE_RETRY_MS) return null;
  return e;
}

async function fetchOne(appid) {
  try {
    const res = await get(`${API}?appids=${appid}&filters=basic,metacritic`);
    if (res.status === 429) return 'rate-limited';
    const data = JSON.parse(res.body);
    const entry = data && data[appid];
    if (!entry || !entry.success) {
      cache[appid] = { score: null, ts: Date.now(), failed: true };
    } else {
      const mc = entry.data && entry.data.metacritic;
      // No Metacritic score is a real answer — cache it so we never re-ask.
      cache[appid] = mc && mc.score
        ? { score: mc.score, url: mc.url || null, ts: Date.now() }
        : { score: null, ts: Date.now() };
    }
  } catch {
    cache[appid] = { score: null, ts: Date.now(), failed: true };
  }
  saveSoon();
  return 'ok';
}

let flushTimer = null;

function flush() {
  clearTimeout(flushTimer);
  flushTimer = null;
  if (!pending.length) return;
  const batch = pending;
  pending = [];
  onScores(batch);
}

// Waiting for a full batch would leave the first scores invisible for half a
// minute on a large library, so anything pending is pushed out shortly after it
// arrives regardless of how few there are.
function flushSoon() {
  if (flushTimer) return;
  flushTimer = setTimeout(flush, 2500);
}

async function pump() {
  if (timer) return;
  timer = setInterval(async () => {
    const appid = queue.shift();
    if (appid === undefined) {
      flush();
      clearInterval(timer);
      timer = null;
      return;
    }
    queued.delete(appid);
    const result = await fetchOne(appid);
    if (result === 'rate-limited') {
      // Put it back and idle a while rather than hammering a closed door.
      queue.unshift(appid);
      queued.add(appid);
      clearInterval(timer);
      timer = null;
      setTimeout(pump, 60000);
      return;
    }
    const e = cache[appid];
    if (e && e.score) {
      pending.push({ appid, score: e.score, url: e.url || null });
      if (pending.length >= 12) flush(); else flushSoon();
    }
  }, GAP_MS);
}

// Returns every score we already have for `appids`, and queues the rest.
// `front` puts them at the head of the queue — used for what's on screen.
function request(appids, front = false) {
  load();
  const out = {};
  const missing = [];
  for (const id of appids) {
    const e = known(id);
    if (e) { if (e.score) out[id] = { score: e.score, url: e.url || null }; }
    else if (!queued.has(id)) missing.push(id);
  }
  if (missing.length) {
    for (const id of missing) queued.add(id);
    if (front) queue = [...missing, ...queue];
    else queue.push(...missing);
    pump();
  }
  return out;
}

// Everything known right now, for sorting.
function all() {
  const out = {};
  for (const [appid, e] of Object.entries(load())) if (e && e.score) out[appid] = e.score;
  return out;
}

function stats() {
  const c = load();
  const total = Object.keys(c).length;
  const scored = Object.values(c).filter((e) => e && e.score).length;
  return { cached: total, scored, queued: queue.length };
}

module.exports = { init, request, all, stats };
