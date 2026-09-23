'use strict';
// Altı dilin de eksiksiz olduğunu doğrular (Electron gerekmez).
//   node build/test_i18n.js
//
// Yeni bir metin eklerken bir dili atlamak kolay; bu test onu yakalar.
// İngilizce referans alınır: İngilizcede olan her anahtar diğer beş dilde de
// bulunmalı, fazladan/yazım hatası anahtar da olmamalı.

const fs = require('fs');
const path = require('path');

const LANGS = ['tr', 'en', 'de', 'ja', 'ko', 'es'];
let pass = 0, fail = 0;
const check = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra !== undefined ? '  -> ' + JSON.stringify(extra) : '')); }
};

// app.js'teki `const I18N = { ... };` nesnesini süslü parantez sayarak ayıklar.
function extractI18N(src) {
  const start = src.indexOf('const I18N = {');
  if (start < 0) throw new Error('app.js icinde I18N bulunamadi');
  const open = src.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return eval('(' + src.slice(open, i + 1) + ')'); // eslint-disable-line no-eval
    }
  }
  throw new Error('I18N nesnesi kapanmiyor');
}

function compare(label, table) {
  console.log('\n' + label);
  const present = LANGS.filter((l) => table[l]);
  check('6 dilin hepsi var', present.length === LANGS.length, present);

  const ref = Object.keys(table.en || {});
  check('ingilizce anahtar sayisi > 0', ref.length > 0, ref.length);

  for (const lang of LANGS) {
    if (!table[lang]) continue;
    const keys = Object.keys(table[lang]);
    const missing = ref.filter((k) => !(k in table[lang]));
    const extra = keys.filter((k) => !ref.includes(k));
    check(`${lang}: eksik anahtar yok (${keys.length}/${ref.length})`, missing.length === 0, missing);
    if (lang !== 'en') check(`${lang}: fazladan anahtar yok`, extra.length === 0, extra);
  }

  // Bir dilde metin tamamen boş kalmasın.
  const blanks = [];
  for (const lang of LANGS) {
    for (const [k, v] of Object.entries(table[lang] || {})) {
      if (typeof v !== 'string' || !v.trim()) blanks.push(`${lang}.${k}`);
    }
  }
  check('bos metin yok', blanks.length === 0, blanks);

  // {t}, {n} gibi yer tutucular her dilde aynı olmalı; yoksa metin bozuk çıkar.
  const slots = (s) => (String(s).match(/\{[a-z]\}/g) || []).sort().join(',');
  const mismatched = [];
  for (const k of ref) {
    const want = slots(table.en[k]);
    for (const lang of LANGS) {
      if (lang === 'en' || !table[lang] || !(k in table[lang])) continue;
      if (slots(table[lang][k]) !== want) mismatched.push(`${lang}.${k} (${slots(table[lang][k])} != ${want})`);
    }
  }
  check('yer tutucular tutarli', mismatched.length === 0, mismatched);
}

const appSrc = fs.readFileSync(path.join(__dirname, '..', 'renderer', 'app.js'), 'utf8');
compare('1) Arayuz sozlugu (renderer/app.js)', extractI18N(appSrc));

const { STRINGS } = require(path.join(__dirname, '..', 'src', 'i18n.js'));
compare('2) Ana surec sozlugu (src/i18n.js)', STRINGS);

console.log(`\n=== ${pass} gecti, ${fail} kaldi ===`);
process.exit(fail ? 1 : 0);
