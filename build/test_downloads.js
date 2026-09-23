'use strict';
// İndirme takibini bu makinedeki gerçek Steam/Epic manifestlerine karşı sınar.
//   node build/test_downloads.js
//
// downloads.js Electron'dan yalnızca shell.openExternal kullanır; test yalnızca
// yoklama (poll) fonksiyonlarını çağırdığı için onu taklit etmek yeterli.

const path = require('path');
const fs = require('fs');
const Module = require('module');

const origLoad = Module._load;
Module._load = function (request) {
  if (request === 'electron') return { shell: { openExternal: async () => {} } };
  return origLoad.apply(this, arguments);
};

const { _internals } = require(path.join(__dirname, '..', 'src', 'downloads.js'));
const { scanSteam } = require(path.join(__dirname, '..', 'src', 'scanners', 'steam.js'));
const { getSteamPath, getLibraryFolders } = require(path.join(__dirname, '..', 'src', 'scanners', 'steam.js'));

let pass = 0, fail = 0, skip = 0;
const check = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra !== undefined ? '  -> ' + JSON.stringify(extra) : '')); }
};

(async () => {
  console.log('\n1) Gercek Steam manifestleri okunuyor');
  const steamPath = getSteamPath();
  if (!steamPath) {
    console.log('  ATLANDI  Steam kurulu degil');
    skip++;
  } else {
    const games = await scanSteam();
    check('en az bir Steam oyunu bulundu', games.length > 0, games.length);

    // Makinedeki canli duruma gore beklenen durum: manifest'te indirme ya da
    // acma surmekteyse "iniyor/kuruluyor", bittiyse "done" olmali. (Test ilk
    // yazildiginda her kurulu oyunun bitmis oldugunu varsayiyordu; kullanici bir
    // oyunu guncellerken bu varsayim gecersiz oldu.)
    let done = 0, busy = 0;
    const wrong = [];
    for (const g of games.slice(0, 60)) {
      const appid = g.id.replace(/^steam:/, '');
      const m = _internals.steamManifest(appid);
      if (!m) continue;
      const st = m.st;
      const midway = Number(st.BytesDownloaded || 0) < Number(st.BytesToDownload || 0)
        || Number(st.BytesStaged || 0) < Number(st.BytesToStage || 0);
      const d = { source: 'steam', appid, state: 'pending', percent: 0, downloaded: 0, total: 0 };
      _internals.pollSteam(d);
      if (midway) {
        busy++;
        if (d.state !== 'downloading' && d.state !== 'installing') wrong.push(`${g.title}: manifest yarim ama ${d.state}`);
        const exp = Math.min(99, Math.floor(Number(st.BytesDownloaded) / Number(st.BytesToDownload) * 100));
        if (d.state === 'downloading' && d.percent !== exp) wrong.push(`${g.title}: yuzde ${d.percent} != ${exp}`);
      } else {
        done++;
        if (d.state !== 'done') wrong.push(`${g.title}: tamamlanmis ama ${d.state}`);
      }
    }
    check('her oyunun durumu kendi manifestiyle tutarli', wrong.length === 0, wrong.slice(0, 5));
    check('tamamlanmis oyun sayisi > 0', done > 0, done);
    if (busy) console.log(`        (su an ${busy} oyun iniyor/kuruluyor — onlar da dogru okundu)`);

    const missing = { source: 'steam', appid: '999999999', state: 'x', percent: 0, downloaded: 0, total: 0 };
    _internals.pollSteam(missing);
    check('olmayan appid -> pending', missing.state === 'pending', missing.state);
  }

  console.log('\n2) Yuzde hesabi (sentetik manifest)');
  // parseVDF ciktisini taklit etmek yerine gercek dosya bicimini kullanip
  // gecici bir kutuphane klasorune yaziyoruz.
  const tmpLib = path.join(require('os').tmpdir(), 'arcadia-dl-test', 'steamapps');
  fs.mkdirSync(tmpLib, { recursive: true });
  const write = (appid, fields) => fs.writeFileSync(
    path.join(tmpLib, `appmanifest_${appid}.acf`),
    '"AppState"\n{\n' + Object.entries(fields).map(([k, v]) => `\t"${k}"\t\t"${v}"`).join('\n') + '\n}\n'
  );

  // getLibraryFolders'i gecici klasoru de dondurecek sekilde yamala.
  const steamMod = require(path.join(__dirname, '..', 'src', 'scanners', 'steam.js'));
  const origFolders = steamMod.getLibraryFolders;
  steamMod.getLibraryFolders = (p) => [tmpLib, ...origFolders(p)];

  // downloads.js modul yuklenirken referansi kopyaladigi icin yeniden yukle.
  delete require.cache[require.resolve(path.join(__dirname, '..', 'src', 'downloads.js'))];
  const dl2 = require(path.join(__dirname, '..', 'src', 'downloads.js'))._internals;

  if (!getSteamPath()) {
    console.log('  ATLANDI  Steam kurulu degil (kutuphane klasoru cozulemiyor)');
    skip++;
  } else {
    write('900001', { appid: 900001, name: 'Yarim Indirme', StateFlags: 1026, BytesToDownload: 1000, BytesDownloaded: 250, BytesToStage: 1000, BytesStaged: 0 });
    let d = { source: 'steam', appid: '900001', state: 'pending', percent: 0, downloaded: 0, total: 0 };
    dl2.pollSteam(d);
    check('indiriliyor durumu', d.state === 'downloading', d.state);
    check('yuzde 25', d.percent === 25, d.percent);
    check('toplam bayt', d.total === 1000 && d.downloaded === 250, [d.total, d.downloaded]);

    write('900002', { appid: 900002, name: 'Aciliyor', StateFlags: 1026, BytesToDownload: 1000, BytesDownloaded: 1000, BytesToStage: 2000, BytesStaged: 500 });
    d = { source: 'steam', appid: '900002', state: 'pending', percent: 0, downloaded: 0, total: 0 };
    dl2.pollSteam(d);
    check('indirme bitti -> installing', d.state === 'installing', d.state);
    check('staging yuzdesi 25', d.percent === 25, d.percent);

    write('900003', { appid: 900003, name: 'Bitti', StateFlags: 4, BytesToDownload: 1000, BytesDownloaded: 1000, BytesToStage: 1000, BytesStaged: 1000 });
    d = { source: 'steam', appid: '900003', state: 'pending', percent: 0, downloaded: 0, total: 0 };
    dl2.pollSteam(d);
    check('tamamlandi -> done %100', d.state === 'done' && d.percent === 100, [d.state, d.percent]);

    // %100'e erken atlamamali: indirme bitmeden done gorunmemeli.
    write('900004', { appid: 900004, name: 'Neredeyse', StateFlags: 4, BytesToDownload: 1000, BytesDownloaded: 999, BytesToStage: 1000, BytesStaged: 999 });
    d = { source: 'steam', appid: '900004', state: 'pending', percent: 0, downloaded: 0, total: 0 };
    dl2.pollSteam(d);
    check('999/1000 -> hala done degil', d.state !== 'done', d.state);
    check('yuzde 99de sabitlenir', d.percent === 99, d.percent);
  }

  steamMod.getLibraryFolders = origFolders;
  fs.rmSync(path.join(require('os').tmpdir(), 'arcadia-dl-test'), { recursive: true, force: true });

  console.log('\n3) Epic manifestleri');
  const epicDir = path.join(process.env.ProgramData || 'C:\\ProgramData', 'Epic', 'EpicGamesLauncher', 'Data', 'Manifests');
  if (!fs.existsSync(epicDir)) {
    console.log('  ATLANDI  Epic kurulu degil');
    skip++;
  } else {
    const items = fs.readdirSync(epicDir).filter((f) => f.endsWith('.item'));
    if (!items.length) { console.log('  ATLANDI  Epic manifesti yok'); skip++; }
    else {
      const m = JSON.parse(fs.readFileSync(path.join(epicDir, items[0]), 'utf8'));
      check('AppName ile manifest bulundu', !!_internals.epicManifest(m.AppName), m.AppName);
      const d = { source: 'epic', appName: m.AppName, state: 'pending', percent: 0, downloaded: 0, total: 0 };
      _internals.pollEpic(d);
      // Kurulu bir oyun icin bIsIncompleteInstall false olmali -> done.
      check('kurulu Epic oyunu done', d.state === 'done', d.state);
      const ghost = { source: 'epic', appName: 'yok-boyle-bir-oyun', state: 'x', percent: 0, downloaded: 0, total: 0 };
      _internals.pollEpic(ghost);
      check('olmayan AppName -> pending', ghost.state === 'pending', ghost.state);
    }
  }

  console.log(`\n=== ${pass} gecti, ${fail} kaldi, ${skip} atlandi ===`);
  process.exit(fail ? 1 : 0);
})();
