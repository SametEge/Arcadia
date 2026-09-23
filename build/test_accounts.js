'use strict';
// GOG / EA / Ubisoft hesap sağlayıcılarının veri dönüştürme testleri.
//   node build/test_accounts.js
//
// Canlı giriş gerektirmez: her sağlayıcının mağaza yanıtını kütüphane kaydına
// çeviren saf fonksiyonu sınanır. Electron'u taklit etmek yeterli.

const path = require('path');
const Module = require('module');

const origLoad = Module._load;
Module._load = function (request) {
  if (request === 'electron') {
    return {
      app: { getPath: () => require('os').tmpdir() },
      safeStorage: { isEncryptionAvailable: () => false },
      BrowserWindow: class {}, session: { fromPartition: () => ({}) }, net: {},
    };
  }
  return origLoad.apply(this, arguments);
};

const acc = (n) => require(path.join(__dirname, '..', 'src', 'accounts', n + '.js'));
const gog = acc('gog')._internals;
const ea = acc('ea')._internals;
const ubi = acc('ubisoft')._internals;
const registry = acc('index');

let pass = 0, fail = 0;
const check = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra !== undefined ? '  -> ' + JSON.stringify(extra) : '')); }
};

console.log('\n1) Kayit defteri');
const ids = registry.PROVIDERS.map((p) => p.id);
check('6 saglayici', ids.length === 6, ids);
check('GOG, EA, Ubisoft kayitli', ['gog', 'ea', 'ubisoft'].every((x) => ids.includes(x)), ids);
check('hepsi ayni arayuzu uyguluyor', registry.PROVIDERS.every((p) =>
  ['signIn', 'signOut', 'status', 'fetchLibrary'].every((f) => typeof p[f] === 'function')));

console.log('\n2) GOG');
let g = gog.toGame({ id: 1207658924, title: 'The Witcher 3: Wild Hunt', image: '//images.gog.com/abc' });
check('oyun kaydi olustu', g && g.id === 'gog:1207658924' && g.source === 'gog', g);
check('Galaxy baglantisi', g.installUrl === 'goggalaxy://openGameView/1207658924', g.installUrl);
check('kapak SteamGridDB\'ye birakildi', g.cover === null);
check('kimliksiz urun atlanir', gog.toGame({ title: 'x' }) === null);

console.log('\n3) EA');
const item = (over = {}) => ({
  originOfferId: 'Origin.OFR.50.0002694',
  product: {
    name: 'Dead Space',
    baseItem: { title: 'Dead Space', gameType: 'BASE_GAME', packArt: { path: 'https://cdn.ea.com/x.jpg' } },
    gameProductUser: { ownershipMethods: ['EA_STORE'] },
    ...over,
  },
});
let e = ea.toGame(item());
check('oyun kaydi olustu', e && e.id === 'ea:Origin.OFR.50.0002694' && e.title === 'Dead Space', e);
check('EA app baglantisi', e.launch.value.startsWith('origin2://game/launch?offerIds='), e.launch.value);
check('kapak alindi', e.cover === 'https://cdn.ea.com/x.jpg', e.cover);
check('DLC atlanir', ea.toGame(item({ baseItem: { title: 'Pack', gameType: 'DLC' } })) === null);
check('eklenti atlanir', ea.toGame(item({ baseItem: { title: 'X', gameType: 'ADD_ON' } })) === null);
// Kullanicinin istedigi: Steam'den alinmis EA oyunu EA kartı olmamali.
check('Steam uzerinden sahip olunan atlanir',
  ea.toGame(item({ gameProductUser: { ownershipMethods: ['STEAM'] } })) === null);
check('goreli kapak yolu kullanilmaz', ea.toGame(item({ baseItem: { title: 'A', packArt: { path: '/img/a.jpg' } } })).cover === null);
check('dogrulanmis sorgu kullaniliyor', /ownedGameProducts\(locale: "en"\)/.test(ea.LIBRARY_QUERY) && /ownershipMethods/.test(ea.LIBRARY_QUERY));

console.log('\n4) Ubisoft');
const payload = { gamesPlayed: { list: [
  { spaceId: 'aaa-111', name: "Assassin's Creed Valhalla", platform: 'PC' },
  { spaceId: 'bbb-222', name: 'Far Cry 6', platform: 'PS5' },
  { spaceId: 'ccc-333', name: 'Rainbow Six Siege' },
] } };
const found = ubi.findGames(payload);
check('ic ice gecmis listeyi buldu', found.length === 3, found.length);
const mapped = found.map(ubi.toGame).filter(Boolean);
check('konsol oyunu atlandi', mapped.length === 2 && !mapped.some((x) => x.title === 'Far Cry 6'), mapped.map((x) => x.title));
check('platform yoksa PC sayilir', mapped.some((x) => x.title === 'Rainbow Six Siege'));
check('kimlik spaceId', mapped[0].id === 'ubisoft:aaa-111', mapped[0].id);
check('bos yanit -> bos liste', ubi.findGames({}).length === 0);

console.log(`\n=== ${pass} gecti, ${fail} kaldi ===`);
process.exit(fail ? 1 : 0);
