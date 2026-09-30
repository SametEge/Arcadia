'use strict';
// Kayit defteri tarayicilari (EA, GOG, Ubisoft) testleri.
//   node build/test_registry.js
//
// Gercek kayit defterine dokunmaz: `reg` cagrilari sahte ciktiyla yanitlanir.
// En onemlisi: EA oyunu olmayan bir PC'de EA tarayicisi kayit defterine hic
// gitmemeli — yuzlerce kaydi tek tek sorgulamak ana sureci 14 sn kilitliyordu
// ve Windows "Arcadia yanit vermiyor" diyordu.

const fs = require('fs');
const os = require('os');
const path = require('path');
const Module = require('module');

// Sahte `reg`: anahtar -> cikti. Her cagri kaydedilir.
const REG = new Map();
const calls = [];
const realCp = require('child_process');
const fakeCp = {
  ...realCp,
  execFile(cmd, args, opts, cb) {
    calls.push([cmd, ...args].join(' '));
    const out = cmd === 'reg' ? REG.get(`${args[1]}|${args[2]}`) : undefined;
    setImmediate(() => (out === undefined ? cb(new Error('not found'), '') : cb(null, out)));
  },
};
const origLoad = Module._load;
Module._load = function (request) {
  if (request === 'child_process') return fakeCp;
  return origLoad.apply(this, arguments);
};

// EA'nin LocalContent yolu modul yuklenirken ProgramData'dan hesaplaniyor.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'arcadia-reg-test-'));
process.env.ProgramData = path.join(tmp, 'ProgramData');

const src = (p) => require(path.join(__dirname, '..', 'src', 'scanners', p));
const { parseRegTree } = src('util');

let pass = 0, fail = 0;
const check = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra !== undefined ? '  -> ' + JSON.stringify(extra) : '')); }
};

const block = (key, values) =>
  [key, ...values.map(([n, t, d]) => `    ${n}    ${t}${d === undefined ? '' : '    ' + d}`), ''].join('\r\n');

(async () => {
  console.log('\n1) reg query ciktisini okuma');
  const out = '\r\n' + block('HKEY_LOCAL_MACHINE\\SOFTWARE\\Test\\One', [
    ['DisplayName', 'REG_SZ', 'Some Game: Deluxe'],
    ['InstallLocation', 'REG_SZ', 'C:\\Games\\Some Game\\'],
    ['EstimatedSize', 'REG_DWORD', '0x1a2b'],
    ['Empty Value', 'REG_SZ', undefined],
  ]) + '\r\n' + block('HKEY_LOCAL_MACHINE\\SOFTWARE\\Test\\One\\Nested', [['Path', 'REG_EXPAND_SZ', '%ProgramFiles%\\X']]);
  const tree = parseRegTree(out);
  check('iki anahtar', tree.size === 2, [...tree.keys()]);
  const one = tree.get('HKEY_LOCAL_MACHINE\\SOFTWARE\\Test\\One') || {};
  check('deger adlari kucuk harfle', one.displayname === 'Some Game: Deluxe', one);
  check('yol degeri bozulmadan', one.installlocation === 'C:\\Games\\Some Game\\', one.installlocation);
  check('DWORD okunur', one.estimatedsize === '0x1a2b', one.estimatedsize);
  check('bosluklu ad ve bos deger', one['empty value'] === '', one);
  check('alt anahtar ayri', (tree.get('HKEY_LOCAL_MACHINE\\SOFTWARE\\Test\\One\\Nested') || {}).path === '%ProgramFiles%\\X');
  check('bos cikti bos harita', parseRegTree('').size === 0);

  console.log('\n2) EA: oyun yoksa kayit defterine gidilmez');
  const { scanEa } = src('ea');
  calls.length = 0;
  let ea = await scanEa();
  check('oyun yok', ea.length === 0, ea);
  check('hic reg cagrisi yok', calls.length === 0, calls);

  console.log('\n3) EA: oyun varken kurulum klasoru');
  const game = path.join(process.env.ProgramData, 'EA Desktop', 'LocalContent', 'Dead Space');
  fs.mkdirSync(game, { recursive: true });
  fs.writeFileSync(path.join(game, 'OFB-EAST.mfst'), '?id=Origin.OFR.50.0002694&dipinstallpath=x', 'utf8');
  const deadSpaceDir = path.join(tmp, 'Games', 'Dead Space');
  fs.mkdirSync(deadSpaceDir, { recursive: true });
  // The Steam copy's folder exists too, so only the steam.exe rule can keep it out.
  fs.mkdirSync(path.join(tmp, 'steam-copy'), { recursive: true });
  const U32 = 'HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall';
  const U64 = 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall';
  REG.set(`${U32}|/s`, block(`HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{DS}`, [
    ['DisplayName', 'REG_SZ', 'Dead Space'],
    ['Publisher', 'REG_SZ', 'Electronic Arts'],
    ['InstallLocation', 'REG_SZ', deadSpaceDir],
  ]));
  REG.set(`${U64}|/s`, block('HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Steam App 1238840', [
    ['DisplayName', 'REG_SZ', 'Dead Space'],
    ['Publisher', 'REG_SZ', 'Electronic Arts'],
    ['UninstallString', 'REG_SZ', '"C:\\Program Files (x86)\\Steam\\steam.exe" steam://uninstall/1238840'],
    ['InstallLocation', 'REG_SZ', path.join(tmp, 'steam-copy')],
  ]));
  calls.length = 0;
  ea = await scanEa();
  check('bir EA oyunu', ea.length === 1 && ea[0].id === 'ea:Origin.OFR.50.0002694', ea);
  check('kurulum klasoru EA kaydindan, Steam kopyasi degil', ea[0] && ea[0].installDir === deadSpaceDir, ea[0] && ea[0].installDir);
  check('kok basina tek reg cagrisi', calls.length === 2 && calls.every((c) => / \/s$/.test(c)), calls);

  console.log('\n4) GOG');
  const G = 'HKLM\\SOFTWARE\\WOW6432Node\\GOG.com\\Games';
  const GALAXY = 'HKLM\\SOFTWARE\\WOW6432Node\\GOG.com\\GalaxyClient\\paths';
  const witcher = path.join(tmp, 'GOG', 'The Witcher 3');
  const galaxyDir = path.join(tmp, 'GOG Galaxy');
  fs.mkdirSync(witcher, { recursive: true });
  fs.mkdirSync(galaxyDir, { recursive: true });
  fs.writeFileSync(path.join(witcher, 'witcher3.exe'), '');
  fs.writeFileSync(path.join(galaxyDir, 'GalaxyClient.exe'), '');
  REG.set(`${G}|/s`,
    block('HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\GOG.com\\Games\\1207664663', [
      ['gameName', 'REG_SZ', 'The Witcher 3: Wild Hunt'],
      ['path', 'REG_SZ', witcher],
      ['exe', 'REG_SZ', 'witcher3.exe'],
    ]) + '\r\n' +
    block('HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\GOG.com\\Games\\1111111111', [
      ['gameName', 'REG_SZ', 'Uninstalled Game'],
      ['path', 'REG_SZ', path.join(tmp, 'gone')],
    ]));
  REG.set(`${GALAXY}|/v`, block('HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\GOG.com\\GalaxyClient\\paths', [['client', 'REG_SZ', galaxyDir]]));
  const { scanGog } = src('gog');
  const gog = await scanGog();
  check('kurulu oyun bulundu, kaldirilan atlandi', gog.length === 1 && gog[0].id === 'gog:1207664663', gog.map((x) => x.id));
  check('kisa exe adi klasore baglandi', gog[0] && gog[0].exeName === 'witcher3.exe', gog[0] && gog[0].exeName);
  check('Galaxy uzerinden acilir', gog[0] && gog[0].launch.type === 'exe' && /GalaxyClient\.exe$/.test(gog[0].launch.value), gog[0] && gog[0].launch);

  console.log('\n5) Ubisoft');
  const I = 'HKLM\\SOFTWARE\\WOW6432Node\\Ubisoft\\Launcher\\Installs';
  const ac = path.join(tmp, 'Ubisoft', "Assassin's Creed Unity");
  fs.mkdirSync(ac, { recursive: true });
  fs.writeFileSync(path.join(ac, 'ACU.exe'), 'x');
  REG.set(`${I}|/s`, block('HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Ubisoft\\Launcher\\Installs\\720', [['InstallDir', 'REG_SZ', ac + '\\']]));
  const { scanUbisoft } = src('ubisoft');
  const ubi = await scanUbisoft();
  check('oyun bulundu', ubi.length === 1 && ubi[0].id === 'ubisoft:720', ubi.map((x) => x.id));
  check('uplay ile acilir', ubi[0] && ubi[0].launch.value === 'uplay://launch/720/0', ubi[0] && ubi[0].launch);
  check('klasor adindan baslik', ubi[0] && ubi[0].title === "Assassin's Creed Unity", ubi[0] && ubi[0].title);

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`\n=== ${pass} gecti, ${fail} kaldi ===`);
  process.exit(fail ? 1 : 0);
})();
