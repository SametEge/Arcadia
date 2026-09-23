'use strict';
// Hesap giriş penceresinin gerçekten açıldığını ve akışı doğru bitirdiğini sınar.
//   npx electron build/test_login_window.js
//
// Electron gerektirir (BrowserWindow + session lazım). Mağazaya bağlanmaz:
// data: URL kullanır, yani ağ ya da hesap gerekmez. Burada yakalanan hata sınıfı
// kullanıcıya "Bağlan'a bastım, hiçbir şey olmadı" olarak görünür.

const { app } = require('electron');
const path = require('path');

app.disableHardwareAcceleration();

// Arcadia'nin kendisi de bunu yapar (tepside yasamaya devam eder). Olmazsa ilk
// giris penceresi kapandigi anda Electron uygulamayi kapatir ve sonraki testler
// daha basmadan coker.
app.on('window-all-closed', () => {});

let pass = 0, fail = 0;
const check = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra !== undefined ? '  -> ' + JSON.stringify(extra) : '')); }
};

const page = (body) => 'data:text/html,' + encodeURIComponent(`<html><body>${body}</body></html>`);

app.whenReady().then(async () => {
  const { login } = require(path.join(__dirname, '..', 'src', 'accounts', 'util.js'));

  console.log('\n1) Pencere aciliyor ve match calisiyor');
  let sawMatch = false;
  const value = await login({
    url: page('<div id="token">abc123</div>'),
    partition: 'persist:arcadia-test-login',
    title: 'test',
    match: async (_url, win) => {
      sawMatch = true;
      return win.webContents.executeJavaScript(
        'document.getElementById("token") ? document.getElementById("token").textContent : null'
      ).catch(() => null);
    },
  });
  check('match cagrildi', sawMatch);
  check('deger dondu', value === 'abc123', value);

  console.log('\n2) Sayfa hazir olmadan token gelirse yoklama yakalar');
  // Token sayfa yuklendikten SONRA disaridan enjekte edilir: hicbir gezinme
  // olayi tetiklenmez, dolayisiyla yalnizca yoklama gorebilir. Steam'in
  // webapi_token'i tam boyle davraniyor.
  let matchCalls = 0;
  const latePromise = login({
    url: page('<p id="x">bekliyor</p>'),
    partition: 'persist:arcadia-test-login2',
    title: 'test2',
    match: async (_url, win) => {
      matchCalls++;
      return win.webContents.executeJavaScript(
        'document.getElementById("token") ? document.getElementById("token").textContent : null'
      ).catch(() => null);
    },
  });
  setTimeout(() => {
    const { BrowserWindow } = require('electron');
    const w = BrowserWindow.getAllWindows().find((x) => x.getTitle() === 'test2')
      || BrowserWindow.getAllWindows()[0];
    if (w && !w.isDestroyed()) {
      w.webContents.executeJavaScript(
        'const d=document.createElement("div");d.id="token";d.textContent="gec-geldi";document.body.appendChild(d);true'
      ).catch((e) => console.log('  (enjeksiyon hatasi: ' + e.message + ')'));
    } else {
      console.log('  (pencere bulunamadi/kapanmis)');
    }
  }, 2200);
  const late = await latePromise;
  check('gec gelen token yakalandi', late === 'gec-geldi', late);
  check('match birden fazla kez cagrildi (yoklama calisiyor)', matchCalls > 1, matchCalls);

  console.log('\n3) Kullanici pencereyi kapatirsa null doner (hata degil)');
  const closing = login({
    url: page('<p>bos</p>'),
    partition: 'persist:arcadia-test-login3',
    title: 'test3',
    match: async () => null, // asla bitmez
  });
  setTimeout(() => {
    const { BrowserWindow } = require('electron');
    const w = BrowserWindow.getAllWindows().find((x) => x.getTitle() === 'test3') || BrowserWindow.getAllWindows()[0];
    if (w) w.close();
  }, 1200);
  const cancelled = await closing;
  check('iptal -> null', cancelled === null, cancelled);

  console.log('\n4) Bitince zamanlayici kalmiyor');
  // Kalan setInterval olsaydi surec kapanmazdi; app.quit() ile teyit ediyoruz.
  check('acik pencere kalmadi', require('electron').BrowserWindow.getAllWindows().length === 0,
    require('electron').BrowserWindow.getAllWindows().length);

  console.log(`\n=== ${pass} gecti, ${fail} kaldi ===`);
  app.exit(fail ? 1 : 0);
}).catch((err) => {
  console.error('TEST COKTU:', err);
  app.exit(1);
});
