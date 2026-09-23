'use strict';

// Xbox / Game Pass account link.
//
// Three hops, the same chain the Xbox app itself walks:
//   1. Microsoft OAuth      → a Live access token
//   2. user.auth.xboxlive   → an Xbox Live user token
//   3. xsts.auth.xboxlive   → the XSTS token the Xbox services actually accept
// The library then comes from titlehub, filtered down to titles playable on PC.

const { json, request, login } = require('./util');
const tokens = require('./tokens');

const ID = 'xbox';
const PARTITION = 'persist:arcadia-xbox';
const CLIENT_ID = '38cd2fa8-66fd-4760-afb2-405eb65d5b0c'; // Xbox app's public client
const REDIRECT = 'https://login.live.com/oauth20_desktop.srf';
const SCOPE = 'Xboxlive.signin Xboxlive.offline_access';
const TOKEN_URL = 'https://login.live.com/oauth20_token.srf';

async function oauth(form) {
  const res = await request(TOKEN_URL, {
    method: 'POST',
    form: { ...form, scope: SCOPE, client_id: CLIENT_ID, redirect_uri: REDIRECT },
  });
  if (res.status >= 400) {
    const err = new Error(`Xbox auth failed (HTTP ${res.status})`);
    err.status = res.status;
    throw err;
  }
  return JSON.parse(res.body);
}

// Trades a Live access token for an XSTS token + the user hash the Xbox APIs
// want in their Authorization header.
async function xstsFor(accessToken) {
  const userAuth = await json('https://user.auth.xboxlive.com/user/authenticate', {
    method: 'POST',
    headers: { 'x-xbl-contract-version': '1', Accept: 'application/json' },
    body: {
      RelyingParty: 'http://auth.xboxlive.com',
      TokenType: 'JWT',
      Properties: { AuthMethod: 'RPS', SiteName: 'user.auth.xboxlive.com', RpsTicket: `d=${accessToken}` },
    },
  });

  const xsts = await json('https://xsts.auth.xboxlive.com/xsts/authorize', {
    method: 'POST',
    headers: { 'x-xbl-contract-version': '1', Accept: 'application/json' },
    body: {
      RelyingParty: 'http://xboxlive.com',
      TokenType: 'JWT',
      Properties: { SandboxId: 'RETAIL', UserTokens: [userAuth.Token] },
    },
  });

  const claim = xsts.DisplayClaims && xsts.DisplayClaims.xui && xsts.DisplayClaims.xui[0];
  if (!claim) throw new Error('Xbox authorization returned no user claim');
  return { token: xsts.Token, uhs: claim.uhs, xid: claim.xid, gamertag: claim.gtg || null };
}

async function signIn() {
  const url =
    'https://login.live.com/oauth20_authorize.srf?' +
    new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      approval_prompt: 'auto',
      scope: SCOPE,
      redirect_uri: REDIRECT,
    }).toString();

  const code = await login({
    url,
    partition: PARTITION,
    title: 'Xbox',
    width: 520,
    height: 640,
    match: (navUrl) => {
      // Microsoft ends the flow on the desktop redirect carrying ?code=...
      if (!navUrl.startsWith(REDIRECT)) return null;
      const m = /[?&]code=([^&]+)/.exec(navUrl);
      return m ? decodeURIComponent(m[1]) : null;
    },
  });
  if (!code) return null;

  const t = await oauth({ grant_type: 'authorization_code', code });
  const xsts = await xstsFor(t.access_token);
  const account = {
    accessToken: t.access_token,
    refreshToken: t.refresh_token,
    expiresAt: Date.now() + (t.expires_in || 3600) * 1000,
    xsts,
    name: xsts.gamertag || 'Xbox',
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

// The XSTS token is short-lived; renew the whole chain off the refresh token.
async function validAccount() {
  const a = tokens.get(ID);
  if (!a) return null;
  if (Date.now() < a.expiresAt - 60000 && a.xsts) return a;

  const t = await oauth({ grant_type: 'refresh_token', refresh_token: a.refreshToken });
  const xsts = await xstsFor(t.access_token);
  const next = {
    ...a,
    accessToken: t.access_token,
    refreshToken: t.refresh_token || a.refreshToken,
    expiresAt: Date.now() + (t.expires_in || 3600) * 1000,
    xsts,
    name: xsts.gamertag || a.name,
  };
  tokens.set(ID, next);
  return next;
}

async function fetchLibrary() {
  let a;
  try {
    a = await validAccount();
  } catch {
    const e = new Error('expired');
    e.code = 'expired';
    throw e;
  }
  if (!a) return [];

  const headers = {
    'x-xbl-contract-version': '2',
    'Accept-Language': 'en-US',
    Authorization: `XBL3.0 x=${a.xsts.uhs};${a.xsts.token}`,
  };

  let data;
  try {
    data = await json(
      `https://titlehub.xboxlive.com/users/xuid(${a.xsts.xid})/titles/titlehistory/decoration/detail`,
      { headers }
    );
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      const e = new Error('expired');
      e.code = 'expired';
      throw e;
    }
    throw err;
  }

  return (data.titles || [])
    // Console-only titles can't be launched here, so only PC entries are kept.
    .filter((tt) => tt.pfn && Array.isArray(tt.devices) && tt.devices.includes('PC'))
    .map((tt) => ({
      // The local Xbox scanner keys off the install folder name, which titlehub
      // doesn't know — so owned Xbox entries are keyed by package family name
      // and reconciled with installed ones by title in library.mergeOwned.
      id: `xbox:pfn:${tt.pfn}`,
      title: String(tt.name || '').replace(/\(PC\)/gi, '').trim(),
      source: 'xbox',
      owned: true,
      // Xbox games launch through their package, which only exists once the
      // title is installed; until then the store page is the useful target.
      launch: { type: 'url', value: `ms-windows-store://pdp/?PFN=${tt.pfn}` },
      installUrl: `ms-windows-store://pdp/?PFN=${tt.pfn}`,
      pfn: tt.pfn,
      playtime: tt.minutesPlayed ? Number(tt.minutesPlayed) * 60 : 0,
    }))
    .filter((g) => g.title);
}

module.exports = { id: ID, signIn, signOut, status, fetchLibrary };
