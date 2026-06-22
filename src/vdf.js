'use strict';

// Minimal parser for Valve's KeyValues (VDF) format, used by Steam's
// libraryfolders.vdf and appmanifest_*.acf files. Good enough for reading
// nested string keys — not a full spec implementation.

function parseVDF(text) {
  let i = 0;
  const n = text.length;

  function skipWs() {
    while (i < n) {
      const c = text[i];
      if (c === ' ' || c === '\t' || c === '\r' || c === '\n') {
        i++;
      } else if (c === '/' && text[i + 1] === '/') {
        while (i < n && text[i] !== '\n') i++;
      } else {
        break;
      }
    }
  }

  function readToken() {
    skipWs();
    if (i >= n) return null;
    const c = text[i];
    if (c === '{') { i++; return { t: 'open' }; }
    if (c === '}') { i++; return { t: 'close' }; }
    if (c === '"') {
      i++;
      let s = '';
      while (i < n && text[i] !== '"') {
        if (text[i] === '\\' && i + 1 < n) { i++; s += text[i]; }
        else s += text[i];
        i++;
      }
      i++; // closing quote
      return { t: 'str', v: s };
    }
    // bare token
    let s = '';
    while (i < n && !' \t\r\n{}"'.includes(text[i])) { s += text[i]; i++; }
    return { t: 'str', v: s };
  }

  function parseObject() {
    const obj = {};
    for (;;) {
      const key = readToken();
      if (!key || key.t === 'close') break;
      if (key.t !== 'str') continue;
      const val = readToken();
      if (!val) break;
      if (val.t === 'open') obj[key.v] = parseObject();
      else if (val.t === 'str') obj[key.v] = val.v;
    }
    return obj;
  }

  const root = {};
  for (;;) {
    const key = readToken();
    if (!key || key.t === 'close') break;
    if (key.t !== 'str') continue;
    const val = readToken();
    if (!val) break;
    if (val.t === 'open') root[key.v] = parseObject();
    else if (val.t === 'str') root[key.v] = val.v;
  }
  return root;
}

module.exports = { parseVDF };
