'use strict';
// Steam koleksiyonu silmenin, Steam istemcisinin kendi yaptığıyla birebir aynı
// yazıldığını sınar. Gerçek Steam dosyalarına dokunmaz: geçici bir klasörde,
// Steam'in gerçek biçimindeki örnek verilerle çalışır.
//   node build/test_steam_delete.js

const path = require('path');
const fs = require('fs');
const os = require('os');

const { deleteCollections } = require(path.join(__dirname, '..', 'src', 'steamcollections.js'));

let pass = 0, fail = 0;
const check = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra !== undefined ? '  -> ' + JSON.stringify(extra) : '')); }
};

// Steam'in cloud-storage-namespace-1.json biçimi (gerçek kayıtlardan alındı).
const ENTRIES = [
  ['GameReleased', { key: 'GameReleased', timestamp: 1700000000, value: '{}', version: '10' }],
  ['user-collections.uc-KEEP', {
    key: 'user-collections.uc-KEEP', timestamp: 1698137668,
    value: '{"id":"uc-KEEP","name":"program","added":[228180],"removed":[]}', version: '1073',
  }],
  ['user-collections.uc-GONE', {
    key: 'user-collections.uc-GONE', timestamp: 1789948123,
    value: '{"id":"uc-GONE","name":"Oyanıyor","added":[257420],"removed":[]}', version: '3864',
    conflictResolutionMethod: 'custom', strMethodId: 'union-collections',
  }],
  ['user-collections.uc-OLD', { key: 'user-collections.uc-OLD', timestamp: 1784001617, is_deleted: true, version: '3799' }],
];

function makeUserDir() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'arcadia-steamdel-'));
  const user = path.join(root, '1125533369');
  const cs = path.join(user, 'config', 'cloudstorage');
  fs.mkdirSync(cs, { recursive: true });
  fs.writeFileSync(path.join(cs, 'cloud-storage-namespace-1.json'), JSON.stringify(ENTRIES));
  fs.writeFileSync(path.join(cs, 'cloud-storage-namespace-1.modified.json'), '[]');
  fs.writeFileSync(path.join(cs, 'cloud-storage-namespaces.json'), '[[3,"0"],[1,"3864"]]');
  return { root, user, cs };
}
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

console.log('\n1) Steam aciksa hicbir sey yazilmaz');
let t = makeUserDir();
let before = fs.readFileSync(path.join(t.cs, 'cloud-storage-namespace-1.json'), 'utf8');
let res = deleteCollections(['uc-GONE'], path.join(t.root, 'bak'), { dirs: [t.user], steamRunning: () => true });
check('bekleyen olarak doner', res.pending.includes('uc-GONE') && res.reason === 'steam-running', res);
check('dosya degismedi', fs.readFileSync(path.join(t.cs, 'cloud-storage-namespace-1.json'), 'utf8') === before);
check('yedek alinmadi', !fs.existsSync(path.join(t.root, 'bak')));

console.log('\n2) Steam kapaliyken Steam\'in kendi bicimiyle silinir');
res = deleteCollections(['uc-GONE'], path.join(t.root, 'bak'), { dirs: [t.user], steamRunning: () => false });
check('uygulandi', res.applied.includes('uc-GONE') && res.pending.length === 0, res);
const after = read(path.join(t.cs, 'cloud-storage-namespace-1.json'));
const gone = after.find((p) => p[0] === 'user-collections.uc-GONE')[1];
// Steam'in CloudStorage.Delete'i: new z(key, now, true, null) -> {key, timestamp, is_deleted}
check('kayit sadece key/timestamp/is_deleted', JSON.stringify(Object.keys(gone).sort()) === JSON.stringify(['is_deleted', 'key', 'timestamp']), Object.keys(gone));
check('is_deleted true', gone.is_deleted === true);
check('value yok', !('value' in gone));
check('zaman damgasi saniye cinsinden ve yeni', gone.timestamp > 1789948123 && gone.timestamp < 1e10, gone.timestamp);
const dirty = read(path.join(t.cs, 'cloud-storage-namespace-1.modified.json'));
check('.modified anahtar dizisi', Array.isArray(dirty) && dirty.length === 1 && dirty[0] === 'user-collections.uc-GONE', dirty);

console.log('\n3) Digerlerine dokunulmaz');
const keep = after.find((p) => p[0] === 'user-collections.uc-KEEP')[1];
check('diger koleksiyon aynen duruyor', JSON.stringify(keep) === JSON.stringify(ENTRIES[1][1]));
check('eski silinmis kayit aynen duruyor', JSON.stringify(after.find((p) => p[0] === 'user-collections.uc-OLD')[1]) === JSON.stringify(ENTRIES[3][1]));
check('diger anahtarlar aynen duruyor', JSON.stringify(after.find((p) => p[0] === 'GameReleased')[1]) === JSON.stringify(ENTRIES[0][1]));
check('kayit sayisi ayni', after.length === ENTRIES.length, after.length);
check('namespaces.json degismedi (Steam de degistirmiyor)', fs.readFileSync(path.join(t.cs, 'cloud-storage-namespaces.json'), 'utf8') === '[[3,"0"],[1,"3864"]]');
check('gecici dosya kalmadi', !fs.readdirSync(t.cs).some((f) => f.endsWith('.arcadia-tmp')));

console.log('\n4) Yedek');
const stamps = fs.readdirSync(path.join(t.root, 'bak'));
const bfile = path.join(t.root, 'bak', stamps[0], '1125533369', 'cloud-storage-namespace-1.json');
check('yedek olusturuldu', stamps.length === 1 && fs.existsSync(bfile), stamps);
check('yedek orijinalin aynisi', fs.readFileSync(bfile, 'utf8') === before);

console.log('\n5) Tekrar calistirmak zararsiz');
res = deleteCollections(['uc-GONE'], path.join(t.root, 'bak'), { dirs: [t.user], steamRunning: () => false });
check('yine uygulandi sayilir', res.applied.includes('uc-GONE'));
check('.modified cift yazilmadi', read(path.join(t.cs, 'cloud-storage-namespace-1.modified.json')).length === 1);
check('ikinci yedek alinmadi (degisiklik yok)', fs.readdirSync(path.join(t.root, 'bak')).length === 1);

console.log('\n6) Bulunmayan koleksiyon kuyrukta takili kalmaz');
res = deleteCollections(['uc-YOK'], path.join(t.root, 'bak'), { dirs: [t.user], steamRunning: () => false });
check('uygulandi sayilir', res.applied.includes('uc-YOK') && res.pending.length === 0, res);

console.log('\n7) Silinen koleksiyon artik okunmaz');
const Module = require('module');
const orig = Module._load;
const sc = path.join(__dirname, '..', 'src', 'steamcollections.js');
// readCollections'i ayni dosyaya yonlendirmek icin userdata kokunu taklit et.
const steamRoot = path.join(t.root, 'Steam');
fs.mkdirSync(path.join(steamRoot, 'userdata'), { recursive: true });
fs.cpSync(t.user, path.join(steamRoot, 'userdata', '1125533369'), { recursive: true });
Module._load = function (request, parent) {
  if (request === './scanners/steam' && parent && parent.filename === sc) return { getSteamPath: () => steamRoot };
  return orig.apply(this, arguments);
};
delete require.cache[require.resolve(sc)];
const names = require(sc).readCollections().map((c) => c.name);
Module._load = orig;
check('Oyanıyor listede yok', !names.includes('Oyanıyor'), names);
check('diger koleksiyon hala var', names.includes('program'), names);

fs.rmSync(t.root, { recursive: true, force: true });
console.log(`\n=== ${pass} gecti, ${fail} kaldi ===`);
process.exit(fail ? 1 : 0);
