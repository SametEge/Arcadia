'use strict';
// Epic katalog çözümlemesinin toplu çalıştığını sınar (ağ ve hesap gerekmez).
//   node build/test_epic_catalog.js
//
// Eski hâlinde her oyun için ayrı bir istek atılıyordu; yüzlerce kayıtta
// senkron dakikalarca asılı kalıyordu. Buradaki ölçüm istek sayısı.

const path = require('path');
const fs = require('fs');
const os = require('os');
const Module = require('module');

const DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'arcadia-epic-'));

// Sahte istekleri say; her toplu çağrıda kaç id istendiğini kaydet.
const calls = [];
let answerAll = true;

const origLoad = Module._load;
Module._load = function (request, parent) {
  if (request === 'electron') return { app: { getPath: () => DATA_DIR }, BrowserWindow: class {}, session: { fromPartition: () => ({}) }, net: {} };
  if (parent && /accounts[\\/]epic\.js$/.test(parent.filename) && request === './util') {
    return {
      login: async () => null,
      request: async () => ({ status: 200, body: '{}' }),
      json: async (url) => {
        const ids = [...url.matchAll(/[?&]id=([^&]+)/g)].map((m) => decodeURIComponent(m[1]));
        calls.push(ids.length);
        const out = {};
        // answerAll=false iken her partinin ilk id'sini kasten eksik birak.
        for (const [i, id] of ids.entries()) {
          if (!answerAll && i === 0 && ids.length > 1) continue;
          out[id] = { title: 'Oyun ' + id, categories: [{ path: 'games' }], keyImages: [] };
        }
        return out;
      },
    };
  }
  return origLoad.apply(this, arguments);
};

const epic = require(path.join(__dirname, '..', 'src', 'accounts', 'epic.js'));
const { loadCatalog, chunk, pooled } = epic._internals;

let pass = 0, fail = 0;
const check = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra !== undefined ? '  -> ' + JSON.stringify(extra) : '')); }
};

const makeRecords = (n, ns = 'ns1') =>
  Array.from({ length: n }, (_, i) => ({ namespace: ns, catalogItemId: 'id' + i, appName: 'app' + i }));

(async () => {
  console.log('\n1) Yardimcilar');
  check('chunk 95 -> 40/40/15', chunk(Array(95).fill(0), 40).map((c) => c.length).join('/') === '40/40/15');
  let running = 0, peak = 0;
  await pooled(Array(20).fill(0), 4, async () => {
    running++; peak = Math.max(peak, running);
    await new Promise((r) => setTimeout(r, 5));
    running--;
  });
  check('pooled es zamanlilik <= 4', peak <= 4, peak);

  console.log('\n2) 450 kayit tek tek degil, toplu isteniyor');
  calls.length = 0;
  const recs = makeRecords(450);
  let lastProgress = null;
  const map = await loadCatalog(recs, {}, (p) => { lastProgress = p; });
  check('450 kaydin hepsi cozuldu', map.size === 450, map.size);
  check('istek sayisi 450 degil', calls.length !== 450, calls.length);
  check('istek sayisi <= 12 (450/40=12 parti)', calls.length <= 12, calls.length);
  check('ilerleme bildirildi', lastProgress && lastProgress.total === 450, lastProgress);

  console.log('\n3) Ikinci cagri onbellekten gelir (sifir istek)');
  calls.length = 0;
  const again = await loadCatalog(recs, {}, () => {});
  check('yine 450 kayit', again.size === 450, again.size);
  check('hic istek atilmadi', calls.length === 0, calls.length);

  console.log('\n4) Parti eksik cevap verirse tek tek tamamlanir');
  fs.rmSync(path.join(DATA_DIR, 'epic-catalog.json'), { force: true });
  answerAll = false;
  calls.length = 0;
  const partial = await loadCatalog(makeRecords(100, 'ns2'), {}, () => {});
  check('eksikler telafi edildi (100/100)', partial.size === 100, partial.size);
  const singles = calls.filter((n) => n === 1).length;
  check('eksik id\'ler tek tek istendi', singles === 3, singles); // 40/40/20 -> her partide 1 eksik
  answerAll = true;

  console.log('\n5) Birden fazla namespace ayri gruplanir');
  fs.rmSync(path.join(DATA_DIR, 'epic-catalog.json'), { force: true });
  calls.length = 0;
  const mixed = [...makeRecords(50, 'nsA'), ...makeRecords(50, 'nsB')];
  const m2 = await loadCatalog(mixed, {}, () => {});
  check('100 kayit cozuldu', m2.size === 100, m2.size);
  // nsA: 40+10, nsB: 40+10 -> 4 parti
  check('4 parti (namespace basina 2)', calls.length === 4, calls.length);

  console.log(`\n=== ${pass} gecti, ${fail} kaldi ===`);
  fs.rmSync(DATA_DIR, { recursive: true, force: true });
  process.exit(fail ? 1 : 0);
})();
