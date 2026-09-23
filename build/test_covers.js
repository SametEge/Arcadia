'use strict';
// Kapak seçimi testleri (ağ gerekmez).
//   node build/test_covers.js
//
// İki hata sınıfını kapsar: yeni Steam oyunlarında eski CDN yolunun 404
// vermesi (PEAK) ve eski yolun 200 dönüp gri bir yer tutucu göstermesi
// (Battlefield 6). İkisinde de doğru kapak Steam'in mağaza API'sinden gelir.

const path = require('path');
const fs = require('fs');
const Module = require('module');

const origLoad = Module._load;
Module._load = function (request) {
  if (request === 'electron') return { app: { getPath: () => require('os').tmpdir() } };
  return origLoad.apply(this, arguments);
};

const { artFromAssets } = require(path.join(__dirname, '..', 'src', 'steamassets.js'))._internals;

// renderer/app.js'teki coverCandidates'i aynen al.
const src = fs.readFileSync(path.join(__dirname, '..', 'renderer', 'app.js'), 'utf8');
const start = src.indexOf('function coverCandidates(g)');
let depth = 0, end = src.indexOf('{', start);
for (let i = end; i < src.length; i++) {
  if (src[i] === '{') depth++;
  else if (src[i] === '}') { depth--; if (!depth) { end = i + 1; break; } }
}
const coverCandidates = new Function(src.slice(start, end) + '; return coverCandidates;')();

let pass = 0, fail = 0;
const check = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra !== undefined ? '  -> ' + JSON.stringify(extra) : '')); }
};
const BASE = 'https://shared.steamstatic.com/store_item_assets/';

console.log('\n1) Steam varlik adresleri');
// Gercek GetItems yanitlarindan (2026-09-22) alinan ornekler.
let a = artFromAssets({
  asset_url_format: 'steam/apps/3527290/${FILENAME}?t=1786470571',
  library_capsule: '480bd879ac737921bfa2529a6fea15961267ad21/library_600x900.jpg',
  header: '31bac6b2eccf09b368f5e95ce510bae2baf3cfcd/header.jpg',
});
check('PEAK: hashli kapak yolu', a.cover === BASE + 'steam/apps/3527290/480bd879ac737921bfa2529a6fea15961267ad21/library_600x900.jpg?t=1786470571', a.cover);
check('PEAK: baslik gorseli', a.header.endsWith('/header.jpg?t=1786470571'), a.header);
a = artFromAssets({
  asset_url_format: 'steam/apps/2807960/${FILENAME}?t=1790089142',
  library_capsule: '289b1c193f9730a0d4ea4dbf912219e46cd1a8a3/library_capsule.jpg',
  header: 'c12d12ce3c7d217398d3fcad77427bfc9d57c570/header.jpg',
});
check('Battlefield 6: library_capsule.jpg adi korunur', a.cover.includes('/library_capsule.jpg'), a.cover);
a = artFromAssets({ asset_url_format: 'steam/apps/730/${FILENAME}?t=1', library_capsule: 'library_600x900.jpg' });
check('hashsiz eski oyun', a.cover === BASE + 'steam/apps/730/library_600x900.jpg?t=1', a.cover);
check('kapaksiz -> null (SteamGridDB\'ye birakilir)', artFromAssets({ asset_url_format: 'x/${FILENAME}', header: 'h.jpg' }).cover === null);
check('varlik yok -> ikisi de null', JSON.stringify(artFromAssets(null)) === JSON.stringify({ cover: null, header: null }));

console.log('\n2) Kapak adayi sirasi');
const legacy = 'https://cdn.cloudflare.steamstatic.com/steam/apps/2807960/library_600x900.jpg';
let g = {
  source: 'steam',
  cover: legacy, coverFallback: legacy.replace('library_600x900', 'header'),
  autoCover: 'https://cdn2.steamgriddb.com/grid/x.png',
  steamArt: { cover: BASE + 'real.jpg', header: BASE + 'head.jpg' },
};
let c = coverCandidates(g);
check('Steam gercek kapagi ilk sirada', c[0] === BASE + 'real.jpg', c);
check('eski tahmin hic denenmez (gri 200 donebilir)', !c.includes(legacy) && !c.includes(g.coverFallback), c);
check('sira: steam -> sgdb -> baslik', JSON.stringify(c) === JSON.stringify([BASE + 'real.jpg', g.autoCover, BASE + 'head.jpg']), c);

g = { ...g, steamArt: { cover: null, header: BASE + 'head.jpg' } };
c = coverCandidates(g);
check('Steam\'de dikey kapak yoksa SteamGridDB once', c[0] === g.autoCover, c);

g = { source: 'steam', cover: legacy, autoCover: null, coverFallback: null };
c = coverCandidates(g);
check('steamArt henuz yoksa eski tahmin gecici olarak kullanilir', c[0] === legacy, c);

g = { source: 'steam', customCover: 'file:///me.png', localCover: 'file:///local.jpg', steamArt: { cover: BASE + 'real.jpg' } };
c = coverCandidates(g);
check('kullanicinin kapagi her zaman once', c[0] === 'file:///me.png', c);
check('sonra diskteki Steam onbellegi', c[1] === 'file:///local.jpg', c);

g = { source: 'epic', cover: 'https://epic/x.jpg', autoCover: 'https://sgdb/y.png' };
c = coverCandidates(g);
check('Steam disi degismedi', JSON.stringify(c) === JSON.stringify(['https://epic/x.jpg', 'https://sgdb/y.png']), c);
check('tekrar eden aday yok', new Set(coverCandidates({ source: 'x', cover: 'a', autoCover: 'a' })).size === 1);

console.log(`\n=== ${pass} gecti, ${fail} kaldi ===`);
process.exit(fail ? 1 : 0);
