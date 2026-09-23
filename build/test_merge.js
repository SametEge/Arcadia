'use strict';
// Kurulu + hesap kütüphanesi birleştirme testleri (Electron gerekmez).
//   node build/test_merge.js
//
// library.js'in Electron'dan tek ihtiyacı app.getPath('userData'); onu taklit
// edip mergeScanned / mergeOwned davranışını geçici bir klasörde sınar.

const path = require('path');
const fs = require('fs');
const os = require('os');
const Module = require('module');

const DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'arcadia-test-'));
const origResolve = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'electron') return { app: { getPath: () => DATA_DIR } };
  return origResolve.apply(this, arguments);
};

const LIB = path.join(__dirname, '..', 'src', 'library.js');
const library = require(LIB);

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra ? '  -> ' + JSON.stringify(extra) : '')); }
}
const byId = (s, id) => s.games.find((g) => g.id === id);

console.log('\n1) Kurulu oyunlar taranir');
let s = library.mergeScanned([
  { id: 'steam:730', title: 'Counter-Strike 2', source: 'steam', launch: { type: 'url', value: 'steam://rungameid/730' } },
  { id: 'epic:Fortnite', title: 'Fortnite', source: 'epic', launch: { type: 'url', value: 'x' } },
  { id: 'xbox:Forza Horizon 5', title: 'Forza Horizon 5', source: 'xbox', launch: { type: 'path', value: 'C:/f.exe' } },
]);
check('3 oyun var', s.games.length === 3, s.games.length);
check('installed=true isaretlendi', s.games.every((g) => g.installed === true));

console.log('\n2) Hesap kutuphanesi gelir (kurulu + kurulu olmayan)');
s = library.mergeOwned([
  { id: 'steam:730', title: 'Counter-Strike 2', source: 'steam', owned: true, installUrl: 'steam://store/730' },
  { id: 'steam:570', title: 'Dota 2', source: 'steam', owned: true, installUrl: 'steam://store/570', cover: 'c.jpg' },
  { id: 'epic:Fortnite', title: 'Fortnite', source: 'epic', owned: true },
  // Xbox id'leri eslesmez; baslik uzerinden kurulu olanla birlesmeli
  { id: 'xbox:pfn:Microsoft.ForzaHorizon5_8wekyb3d8bbwe', title: 'Forza Horizon 5 (PC)', source: 'xbox', owned: true },
  { id: 'xbox:pfn:Microsoft.Halo_8wekyb3d8bbwe', title: 'Halo Infinite', source: 'xbox', owned: true },
], ['steam', 'epic', 'xbox']);

check('toplam 5 oyun (Forza tekillesti)', s.games.length === 5, s.games.map((g) => g.id));
check('kurulu CS2 owned oldu', byId(s, 'steam:730').owned === true && byId(s, 'steam:730').installed === true);
check('CS2 launch bozulmadi', byId(s, 'steam:730').launch.value === 'steam://rungameid/730');
check('Dota2 kurulu degil', byId(s, 'steam:570').installed === false && byId(s, 'steam:570').owned === true);
check('Forza baslik ile eslesti', !byId(s, 'xbox:pfn:Microsoft.ForzaHorizon5_8wekyb3d8bbwe'));
check('Forza hala kurulu', byId(s, 'xbox:Forza Horizon 5').installed === true && byId(s, 'xbox:Forza Horizon 5').owned === true);
check('Halo kurulu degil olarak eklendi', byId(s, 'xbox:pfn:Microsoft.Halo_8wekyb3d8bbwe').installed === false);

console.log('\n3) Yeniden tarama: kurulu olmayanlar silinmemeli');
s = library.mergeScanned([
  { id: 'steam:730', title: 'Counter-Strike 2', source: 'steam', launch: { type: 'url', value: 'steam://rungameid/730' } },
]);
check('Dota2 duruyor', !!byId(s, 'steam:570'), s.games.map((g) => g.id));
check('Dota2 hala kurulu degil', byId(s, 'steam:570').installed === false);
check('Fortnite kaldirildi -> owned oldugu icin duruyor', !!byId(s, 'epic:Fortnite'));
check('Fortnite artik kurulu degil', byId(s, 'epic:Fortnite').installed === false);

console.log('\n4) Kullanici alanlari korunur');
library.updateGame('steam:570', { favorite: true, customTitle: 'DOTA', autoCover: 'my.jpg' });
s = library.mergeOwned([
  { id: 'steam:730', title: 'Counter-Strike 2', source: 'steam', owned: true },
  { id: 'steam:570', title: 'Dota 2', source: 'steam', owned: true },
], ['steam']);
check('favori korundu', byId(s, 'steam:570').favorite === true);
check('ozel baslik korundu', byId(s, 'steam:570').customTitle === 'DOTA');
check('otomatik kapak korundu', byId(s, 'steam:570').autoCover === 'my.jpg');

console.log('\n5) Hesaptan dusen oyun silinir (yalniz senkron olan magaza icin)');
s = library.mergeOwned([
  { id: 'steam:730', title: 'Counter-Strike 2', source: 'steam', owned: true },
], ['steam']);
check('Dota2 favori oldugu icin duruyor (missing)', byId(s, 'steam:570') && byId(s, 'steam:570').missing === true);
check('Xbox senkron edilmedi -> Halo duruyor', !!byId(s, 'xbox:pfn:Microsoft.Halo_8wekyb3d8bbwe'));

library.updateGame('steam:570', { favorite: false });
s = library.mergeOwned([{ id: 'steam:730', title: 'Counter-Strike 2', source: 'steam', owned: true }], ['steam']);
check('favori degilse silindi', !byId(s, 'steam:570'), s.games.map((g) => g.id));

console.log('\n6) Hesap baglantisi kesilince kurulu oyun kaybolmaz');
// Forza'yi tekrar kurulu yap (adim 3'teki tarama onu diskte bulamamisti).
library.mergeScanned([
  { id: 'steam:730', title: 'Counter-Strike 2', source: 'steam', launch: { type: 'url', value: 'steam://rungameid/730' } },
  { id: 'xbox:Forza Horizon 5', title: 'Forza Horizon 5', source: 'xbox', launch: { type: 'path', value: 'C:/f.exe' } },
]);
s = library.mergeOwned([], ['steam', 'epic', 'xbox']);
check('kurulu CS2 duruyor', !!byId(s, 'steam:730') && byId(s, 'steam:730').installed === true);
check('CS2 artik owned degil', !byId(s, 'steam:730').owned);
check('kurulu Forza duruyor', !!byId(s, 'xbox:Forza Horizon 5'));
check('kurulu olmayan Halo silindi', !byId(s, 'xbox:pfn:Microsoft.Halo_8wekyb3d8bbwe'));


console.log('\n7) Ayni oyun birden fazla magazada -> tek kart, Steam kazanir');
for (const g of s.games) library.removeGame(g.id);
library.mergeScanned([
  { id: 'steam:1238810', title: 'Battlefield\u2122 V', source: 'steam', launch: { type: 'url', value: 'steam://rungameid/1238810' } },
]);
s = library.mergeOwned([
  { id: 'steam:1238810', title: 'Battlefield\u2122 V', source: 'steam', owned: true },
  { id: 'ea:Origin.OFR.50.0002847', title: 'Battlefield V', source: 'ea', owned: true },
  { id: 'ubisoft:4321', title: 'Battlefield V Deluxe Edition', source: 'ubisoft', owned: true },
], ['steam', 'ea', 'ubisoft']);
check('tek kart kaldi', s.games.length === 1, s.games.map((g) => g.id));
check('kart Steam kaynakli', s.games[0].source === 'steam', s.games[0].source);
check('diger magazalar isaretlendi', (s.games[0].alsoOn || []).slice().sort().join(',') === 'ea,ubisoft', s.games[0].alsoOn);
check('Steam launch bozulmadi', s.games[0].launch.value === 'steam://rungameid/1238810');

console.log('\n8) Steamde olmayan EA oyunu kendi karti olur');
s = library.mergeOwned([
  { id: 'steam:1238810', title: 'Battlefield\u2122 V', source: 'steam', owned: true },
  { id: 'ea:Origin.OFR.50.0009999', title: 'Dead Space', source: 'ea', owned: true, installUrl: 'origin2://x' },
], ['steam', 'ea']);
check('2 kart var', s.games.length === 2, s.games.map((g) => g.title));
check('Dead Space EA kaynakli', (s.games.find((g) => g.title === 'Dead Space') || {}).source === 'ea');

console.log('\n9) Surum eki farki ayni oyun sayilir');
for (const g of s.games) library.removeGame(g.id);
library.mergeScanned([{ id: 'steam:1174180', title: 'Red Dead Redemption 2', source: 'steam', launch: { type: 'url', value: 'x' } }]);
s = library.mergeOwned([
  { id: 'steam:1174180', title: 'Red Dead Redemption 2', source: 'steam', owned: true },
  { id: 'ea:rdr2', title: 'Red Dead Redemption 2: Ultimate Edition', source: 'ea', owned: true },
], ['steam', 'ea']);
check('tek kart', s.games.length === 1, s.games.map((g) => g.title));
check('Steam kaldi', s.games[0].source === 'steam');

console.log(`\n=== ${pass} gecti, ${fail} kaldi ===`);
fs.rmSync(DATA_DIR, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
