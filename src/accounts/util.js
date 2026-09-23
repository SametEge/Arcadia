'use strict';

// Shared plumbing for the store-account providers: a small JSON/HTTP client and
// the login window they all drive.

const https = require('https');
const { URL } = require('url');
const { BrowserWindow, session, net } = require('electron');

const DEFAULT_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Minimal HTTPS request helper. `body` may be a string (sent as-is) or an object
// (sent as JSON); pass `form` instead for x-www-form-urlencoded.
function request(url, { method = 'GET', headers = {}, body = null, form = null, timeout = 20000 } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    let payload = body;
    const hdrs = { 'User-Agent': DEFAULT_UA, ...headers };

    if (form) {
      payload = new URLSearchParams(form).toString();
      hdrs['Content-Type'] = 'application/x-www-form-urlencoded';
    } else if (body && typeof body === 'object') {
      payload = JSON.stringify(body);
      hdrs['Content-Type'] = 'application/json';
    }
    if (payload) hdrs['Content-Length'] = Buffer.byteLength(payload);

    const req = https.request(
      { hostname: u.hostname, path: u.pathname + u.search, method, headers: hdrs },
      (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      }
    );
    req.on('error', reject);
    req.setTimeout(timeout, () => { req.destroy(new Error('timeout')); });
    if (payload) req.write(payload);
    req.end();
  });
}

async function json(url, opts = {}) {
  const res = await request(url, opts);
  if (res.status >= 400) {
    const err = new Error(`HTTP ${res.status} for ${url}`);
    err.status = res.status;
    err.body = res.body;
    throw err;
  }
  try {
    return JSON.parse(res.body);
  } catch {
    throw new Error(`Invalid JSON from ${url}`);
  }
}

// Some stores (GOG, Battle.net) have no OAuth for third parties: you log into
// their website and the library endpoint answers to the session cookie. Going
// through Electron's `net` bound to the login partition sends those cookies the
// same way the store's own site would, without ever reading them ourselves.
function sessionRequest(url, partition, { method = 'GET', headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const req = net.request({ method, url, session: session.fromPartition(partition), useSessionCookies: true });
    for (const [k, v] of Object.entries({ 'User-Agent': DEFAULT_UA, ...headers })) req.setHeader(k, v);

    req.on('response', (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.end();
  });
}

async function sessionJson(url, partition, opts = {}) {
  const res = await sessionRequest(url, partition, opts);
  if (res.status === 401 || res.status === 403) {
    const err = new Error('expired');
    err.code = 'expired';
    err.status = res.status;
    throw err;
  }
  if (res.status >= 400) {
    const err = new Error(`HTTP ${res.status} for ${url}`);
    err.status = res.status;
    throw err;
  }
  try {
    return JSON.parse(res.body);
  } catch {
    // A logged-out session gets the HTML login page instead of JSON.
    const err = new Error('expired');
    err.code = 'expired';
    throw err;
  }
}

// Opens the store's own login page in a real window and watches where it goes.
//
// `match(url, win)` runs on every navigation and whenever a page finishes
// loading; return a truthy value to finish the flow with it (the window closes
// automatically). Returning nothing lets the user carry on — that is how
// multi-step logins, 2FA and captchas pass through untouched.
//
// Resolves to null if the user closes the window: a cancelled login, not an
// error. Each provider uses its own session partition so store cookies stay
// isolated from each other and from the app.
function login({ url, partition, match, userAgent, width, height, title, fresh }) {
  return new Promise((resolve, reject) => {
    const ses = session.fromPartition(partition);
    const win = new BrowserWindow({
      width: width || 620,
      height: height || 760,
      title: title || 'Login',
      autoHideMenuBar: true,
      backgroundColor: '#0b0b0d',
      webPreferences: { session: ses, nodeIntegration: false, contextIsolation: true },
    });

    let settled = false;
    let poll = null;
    const close = () => {
      if (poll) { clearInterval(poll); poll = null; }
      if (!win.isDestroyed()) { win.removeAllListeners('closed'); win.destroy(); }
    };
    const done = (value) => { if (!settled) { settled = true; close(); resolve(value); } };
    const fail = (err) => { if (!settled) { settled = true; close(); reject(err); } };

    const check = async (navUrl) => {
      if (settled) return;
      try {
        const result = await match(navUrl, win);
        if (result) done(result);
      } catch (err) {
        fail(err);
      }
    };

    win.webContents.on('did-navigate', (_e, u) => check(u));
    win.webContents.on('did-redirect-navigation', (_e, u) => check(u));
    win.webContents.on('did-navigate-in-page', (_e, u) => check(u));
    win.webContents.on('did-finish-load', () => check(win.webContents.getURL()));

    // Navigation events alone are not enough: Steam fills its webapi_token into
    // the already-loaded page, and some stores finish the login with an in-page
    // XHR. Without this poll the window would sit there logged in, never
    // closing, and the link would silently fail. Cheap: one tiny DOM read.
    poll = setInterval(() => {
      if (settled || win.isDestroyed()) return;
      check(win.webContents.getURL());
    }, 1500);

    win.on('closed', () => {
      if (poll) { clearInterval(poll); poll = null; }
      if (!settled) { settled = true; resolve(null); }
    });

    (async () => {
      // A fresh login must not silently reuse the previously linked account.
      if (fresh !== false) {
        try { await ses.clearStorageData({ storages: ['cookies'] }); } catch { /* best effort */ }
      }
      win.loadURL(url, userAgent ? { userAgent } : undefined);
    })();
  });
}

module.exports = { request, json, sessionRequest, sessionJson, login, DEFAULT_UA };
