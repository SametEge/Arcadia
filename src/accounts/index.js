'use strict';

// Registry of linkable store accounts.
//
// A provider is just an object with { id, signIn, signOut, status, fetchLibrary }.
// Adding GOG, Battle.net, Ubisoft, EA or Amazon later means writing one more
// file here and listing it below — nothing else in the app changes.

const steam = require('./steam');
const epic = require('./epic');
const xbox = require('./xbox');
const gog = require('./gog');
const ea = require('./ea');
const ubisoft = require('./ubisoft');

// Order matters twice: it's the order of the Linked Accounts list, and the
// order libraries are fetched in.
const PROVIDERS = [steam, epic, xbox, gog, ea, ubisoft];
const byId = new Map(PROVIDERS.map((p) => [p.id, p]));

function get(id) {
  return byId.get(id) || null;
}

function list() {
  return PROVIDERS.map((p) => ({ id: p.id, ...p.status() }));
}

async function signIn(id) {
  const p = get(id);
  if (!p) throw new Error(`Unknown account provider: ${id}`);
  const account = await p.signIn();
  return { id, cancelled: !account, ...p.status() };
}

function signOut(id) {
  const p = get(id);
  if (!p) return false;
  p.signOut();
  return true;
}

// Pulls every linked account's library. One store failing (offline, expired
// session) must not lose the others, so failures are collected per provider.
async function fetchAll(onProgress = () => {}) {
  const games = [];
  const errors = [];

  for (const p of PROVIDERS) {
    if (!p.status().linked) continue;
    onProgress(p.id);
    try {
      // Providers that take a while (Epic resolves a catalog entry per game)
      // report how far along they are, so the overlay isn't a blank spinner.
      games.push(...(await p.fetchLibrary((detail) => onProgress(p.id, detail))));
    } catch (err) {
      errors.push({ id: p.id, code: err.code || 'failed', message: err.message });
    }
  }
  return { games, errors };
}

module.exports = { list, get, signIn, signOut, fetchAll, PROVIDERS };
