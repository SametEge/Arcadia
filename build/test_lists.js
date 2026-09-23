'use strict';
// Liste oluşturma, üyelik, sıralama ve Steam koleksiyon aynası testleri.
//   node build/test_lists.js
//
// Electron gerekmez: library.js'in tek ihtiyacı app.getPath('userData').

const path = require('path');
const fs = require('fs');
const os = require('os');
const Module = require('module');

const DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'arcadia-lists-'));
const origLoad = Module._load;
Module._load = function (request) {
  if (request === 'electron') return { app: { getPath: () => DATA_DIR } };
  return origLoad.apply(this, arguments);
};

const library = require(path.join(__dirname, '..', 'src', 'library.js'));

let pass = 0, fail = 0;
const check = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra !== undefined ? '  -> ' + JSON.stringify(extra) : '')); }
};
const byName = (ls, n) => ls.find((l) => l.name === n);

console.log('\n1) Liste olustur / yeniden adlandir / sil');
const a = library.createList('Bitirilenler');
const b = library.createList('Sonra oyna');
check('2 liste var', library.getLists().length === 2);
check('sira 0 ve 1', a.order === 0 && b.order === 1, [a.order, b.order]);
library.renameList(a.id, 'Bitirdiklerim');
check('ad degisti', byName(library.getLists(), 'Bitirdiklerim') !== undefined);

console.log('\n2) Oyun ekleme / cikarma');
library.setListGame(a.id, 'steam:730', true);
library.setListGame(a.id, 'epic:Fortnite', true);
let l = byName(library.getLists(), 'Bitirdiklerim');
check('2 oyun eklendi', l.games.length === 2, l.games);
check('farkli platformlar birlikte', l.games.includes('steam:730') && l.games.includes('epic:Fortnite'));
library.setListGame(a.id, 'steam:730', false);
l = byName(library.getLists(), 'Bitirdiklerim');
check('cikarildi', l.games.length === 1 && l.games[0] === 'epic:Fortnite', l.games);
library.setListGame(a.id, 'epic:Fortnite', true);
l = byName(library.getLists(), 'Bitirdiklerim');
check('ayni oyun iki kez eklenmez', l.games.length === 1, l.games);

console.log('\n3) Siralama');
const c = library.createList('Co-op');
library.reorderLists([c.id, a.id, b.id]);
const order = library.getLists().map((x) => x.name);
check('yeni sira uygulandi', JSON.stringify(order) === JSON.stringify(['Co-op', 'Bitirdiklerim', 'Sonra oyna']), order);

console.log('\n4) Steam koleksiyonlari aynalanir');
library.syncSteamCollections([
  { id: 'uc-AAA', name: 'bitirilen oyunlar', appids: ['730', '570'] },
  { id: 'uc-BBB', name: 'Co-op oyunlar', appids: ['440'] },
]);
let ls = library.getLists();
const steamA = ls.find((x) => x.steamId === 'uc-AAA');
check('Steam listesi olusturuldu', !!steamA, ls.map((x) => x.name));
check('Steam uyeleri ayri alanda', JSON.stringify(steamA.steamGames) === JSON.stringify(['steam:730', 'steam:570']), steamA.steamGames);
check('kendi oyunlari bos', steamA.games.length === 0);
check('Arcadia listeleri korundu', ls.filter((x) => !x.steamId).length === 3, ls.filter((x) => !x.steamId).map((x) => x.name));

console.log('\n5) Steam listesine kendi oyununu ekleyebilme');
library.setListGame(steamA.id, 'epic:Hades', true);
ls = library.getLists();
const s2 = ls.find((x) => x.steamId === 'uc-AAA');
check('kendi oyunu eklendi', s2.games.includes('epic:Hades'), s2.games);
check('Steam uyeleri bozulmadi', s2.steamGames.length === 2, s2.steamGames);

console.log('\n6) Steam tarafi degisince ad ve uyeler guncellenir, kendi oyunlar kalir');
library.syncSteamCollections([
  { id: 'uc-AAA', name: 'bitirilen oyunlar (yeni ad)', appids: ['730'] },
]);
ls = library.getLists();
const s3 = ls.find((x) => x.steamId === 'uc-AAA');
check('ad guncellendi', s3.name === 'bitirilen oyunlar (yeni ad)', s3.name);
check('Steam uyeleri guncellendi', JSON.stringify(s3.steamGames) === JSON.stringify(['steam:730']), s3.steamGames);
check('kendi oyunu duruyor', s3.games.includes('epic:Hades'), s3.games);
// uc-BBB Steam'den silindi ve icinde kendi oyunu yoktu -> gitmeli
check('bos Steam listesi silindi', !ls.some((x) => x.steamId === 'uc-BBB'), ls.map((x) => x.name));

console.log('\n7) Koleksiyon aynasi kapatilinca kendi listeleri kalir');
library.syncSteamCollections([]);
ls = library.getLists();
check('kendi listeleri duruyor', ls.filter((x) => !x.steamId).length === 3, ls.map((x) => x.name));
check('icinde kendi oyunu olan Steam listesi korundu', ls.some((x) => x.steamId === 'uc-AAA'), ls.map((x) => x.name));

console.log(`\n=== ${pass} gecti, ${fail} kaldi ===`);
fs.rmSync(DATA_DIR, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
