'use strict';
// Dev helper behind `electron . --store-shots`: saves the Microsoft Store
// screenshots to dist/store-screenshots/ (1920×1080, one set per UI language —
// all six, or just some with STORE_SHOT_LANGS=de,ja). main.js calls it once the
// window is ready, then quits.
//
// Arcadia allows one instance per profile, so while it's running, point this
// one at a copy of the profile: `electron . --store-shots --user-data-dir=<copy>`.
//
// The shots are rendered in a second, offscreen window: it has exactly the
// Store's size whatever the monitor is, and it can't be moved, resized or
// clicked while it works. It runs the real app on this PC's library, so the
// shots show what is here: games, covers, lists. Linked account names are
// replaced with a plain "Linked" and toasts are hidden. Nothing is saved —
// language, filter and sort are only switched inside the page.

const fs = require('fs');
const path = require('path');
const { BrowserWindow } = require('electron');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist', 'store-screenshots');
const W = 1920;
const H = 1080;
const MODALS = ['settings-modal', 'random-modal', 'accounts-modal', 'downloads-modal'];
const ALL_LANGS = ['en', 'tr', 'de', 'ja', 'ko', 'es'];
const LANGS = (process.env.STORE_SHOT_LANGS || ALL_LANGS.join(',')).split(',').map((s) => s.trim()).filter(Boolean);
// Games whose cover art is fine for any age rating, for the random-picker shot.
const GENTLE = ['Stardew Valley', 'GRIS', 'Unpacking', 'Machinarium', 'Celeste', 'Subnautica', 'It Takes Two', 'FEZ', 'Slay the Spire'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const run = (wc, body) => wc.executeJavaScript(`(async () => { ${body} })()`, true);

async function until(wc, cond, ms) {
  for (const end = Date.now() + ms; Date.now() < end; await sleep(250)) {
    if (await run(wc, `return !!(${cond});`)) return true;
  }
  return false;
}

const LOADED = `document.getElementById('scan-overlay').hidden && document.querySelector('#grid .card')`;

// Every cover on screen has loaded or given up (a failed one is swapped for a
// placeholder, which is fine to shoot).
const COVERS_SETTLED = `[...document.querySelectorAll('#grid img, #random-body img')]
  .filter((i) => { const r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; })
  .every((i) => i.complete)`;

module.exports = async function storeShots(mainWindow) {
  // Let the visible window finish its launch scan and account sync first, so
  // the two windows don't scan at the same time.
  await until(mainWindow.webContents, LOADED, 180000);
  await sleep(3000);

  const win = new BrowserWindow({
    width: W,
    height: H,
    useContentSize: true,
    show: false,
    frame: false,
    backgroundColor: '#0b0b0d',
    webPreferences: {
      preload: path.join(ROOT, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      offscreen: true,
    },
  });
  // The size given at creation is clamped to the monitor's work area (1032 px
  // high on a 1080p screen with a taskbar); set after creation, it isn't.
  win.setContentSize(W, H);
  const wc = win.webContents;
  const page = (body) => run(wc, body);

  try {
    await win.loadFile(path.join(ROOT, 'renderer', 'index.html'));
    await wc.insertCSS('#toasts { display: none !important; }');
    await until(wc, LOADED, 60000);
    await sleep(6000); // its own quiet rescan, cached scores, store art

    const reset = (extra = '') => page(`
      closeMenu();
      for (const id of ${JSON.stringify(MODALS)}) document.getElementById(id).hidden = true;
      state.search = '';
      ${extra}
      document.getElementById('sort').value = state.sort;
      render();`);

    // Hover the nth card on screen that has a Metacritic score, so the shot
    // shows the score badge and the play button. Returns the point it hovered.
    const hoverScoredCard = async (nth = 0) => {
      const at = await page(`
        const card = [...document.querySelectorAll('#grid .card')].filter((c) => c.querySelector('.card-meta'))[${nth}];
        if (!card) return null;
        const r = card.getBoundingClientRect();
        return r.top < innerHeight ? { x: r.x + r.width / 2, y: r.y + r.height / 2, id: card.dataset.id } : null;`);
      if (at) wc.sendInputEvent({ type: 'mouseMove', x: Math.round(at.x), y: Math.round(at.y) });
      await sleep(600); // hover transitions
      return at;
    };
    const unhover = async () => {
      wc.sendInputEvent({ type: 'mouseMove', x: W - 4, y: H - 4 });
      await sleep(300);
    };

    const shot = async (name) => {
      await until(wc, COVERS_SETTLED, 20000);
      await sleep(500);
      const img = await wc.capturePage();
      const { width, height } = img.getSize();
      if (width !== W || height !== H) throw new Error(`${name}: captured ${width}x${height}, expected ${W}x${H}`);
      fs.writeFileSync(path.join(OUT, `${name}.png`), img.toPNG());
      console.log(`STORE_SHOT ${name}.png ${width}x${height}`);
    };

    // Replace only the languages being shot; other sets stay as they are.
    fs.mkdirSync(OUT, { recursive: true });
    for (const f of fs.readdirSync(OUT)) {
      if (LANGS.some((code) => f.startsWith(`${code}-`))) fs.rmSync(path.join(OUT, f));
    }

    // Every scene sorts by rating: the top of a library is then well-known
    // games with real covers, never the unrated tail (where a Steam library
    // can hold titles that don't belong in a Store listing). Lists aren't shot
    // on their own for the same reason; the sidebar shows them anyway.
    for (const code of LANGS) {
      await page(`lang = '${code}'; applyLang();`);

      await reset(`state.filter = 'installed'; state.sort = 'rating';`);
      await hoverScoredCard();
      await shot(`${code}-1-library`);
      await unhover();

      await reset(`state.filter = 'notInstalled'; state.sort = 'rating';`);
      await hoverScoredCard();
      await shot(`${code}-2-not-installed`);
      await unhover();

      // The right-click menu on an installed game.
      await reset(`state.filter = 'installed'; state.sort = 'rating';`);
      const at = await hoverScoredCard(2);
      if (at) {
        await page(`openMenu(state.games.find((g) => g.id === ${JSON.stringify(at.id)}), ${Math.round(at.x)}, ${Math.round(at.y)});`);
        await shot(`${code}-3-menu`);
      }
      await unhover();

      // The picker shows its game large, and Store screenshots have to suit the
      // app's own age rating — so show one of a few well-known games with
      // gentle cover art (a different one per language) instead of whatever a
      // real roll lands on. Without any of them, a well-rated Steam game.
      await reset(`state.filter = 'all'; state.sort = 'rating';`);
      await page(`
        const owned = ${JSON.stringify(GENTLE)}
          .map((t) => state.games.find((g) => !g.hidden && displayTitle(g) === t))
          .filter(Boolean);
        let g = owned.length ? owned[${ALL_LANGS.indexOf(code)} % owned.length] : null;
        for (let i = 0; !g && i < 60; i++) {
          const r = rollGame();
          if (r && r.source === 'steam' && (ratingOf(r) || 0) >= 80) g = r;
        }
        rolledGame = g;
        renderRandom();
        document.getElementById('random-modal').hidden = false;`);
      await shot(`${code}-4-random`);

      await reset();
      await page(`
        openAccounts();
        const linked = t('accLinked', { n: '' }).replace(/[\\s:]+$/, '');
        document.querySelectorAll('#accounts-body .acc-sub').forEach((s) => { s.textContent = linked; });`);
      await shot(`${code}-5-accounts`);

      // Only when something is really downloading; an empty panel shows nothing.
      if (await page(`return downloadList.some((d) => !DL_FINISHED.has(d.state));`)) {
        await reset();
        await page('openDownloads();');
        await sleep(1500);
        await shot(`${code}-6-downloads`);
      }
    }
  } finally {
    win.destroy();
  }
};
