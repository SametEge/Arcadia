'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');
const { prettify } = require('./util');

// Clear non-games skipped when importing desktop shortcuts (lowercase "contains").
// Game clients/tools (FACEIT, Riot, Battle.net, Medal, Blitz…) are intentionally kept.
const BLOCK = [
  'discord', 'visual studio', 'vscode', 'chrome', 'firefox', 'opera', 'brave', 'msedge',
  'microsoft edge', 'obs studio', 'afterburner', 'rivatuner', 'notion', 'spotify', 'antigravity',
  'displaywidget', 'atk hub', 'animecix', 'slack', 'telegram', 'whatsapp', 'zoom', 'teams',
  'outlook', 'thunderbird', 'word', 'excel', 'powerpoint', 'onenote', 'photoshop', 'davinci',
  'audacity', 'vlc', 'clipchamp', 'explorer', 'settings', 'ayarlar', 'control', 'cmd',
  'powershell', 'terminal', 'git bash', 'git cmd', 'github desktop', 'node.js', 'python', 'idle',
  'java', 'unity', 'android studio', 'rustdesk', 'anydesk', 'teamviewer', 'paint', 'calculator',
  'hesap', '7-zip', 'winrar', 'nvidia', 'ryzen master', 'ccleaner', 'malwarebytes', 'kaspersky',
  'steam', 'epic games launcher', 'uninstall', 'kaldır', 'readme', 'help', 'website',
  'documentation', 'iexplore', 'icloud', 'itunes', 'onedrive', 'dosya gezgini', 'not defteri',
  'medya oynatıcı', 'microsoft store', 'phone link', 'telefon', 'overwolf',
  'vpn', 'splitwire', 'wireguard', 'nordvpn', 'proxy',
  'arcadia', // never list ourselves (the installer creates an "Arcadia" shortcut)
];

function desktopRoots() {
  const home = process.env.USERPROFILE || '';
  const pub = process.env.PUBLIC || 'C:\\Users\\Public';
  const candidates = [
    path.join(home, 'Desktop'),
    path.join(home, 'OneDrive', 'Desktop'),
    path.join(pub, 'Desktop'),
  ];
  const seen = new Set();
  return candidates.filter((r) => {
    const k = r.toLowerCase();
    if (seen.has(k) || !fs.existsSync(r)) return false;
    seen.add(k);
    return true;
  });
}

const isBlocked = (name) => {
  const n = name.toLowerCase();
  return BLOCK.some((b) => n.includes(b));
};

function cleanName(file) {
  return prettify(
    file
      .replace(/\.(lnk|url|exe)$/i, '')
      .replace(/ ?[-–] ?(kısayol|shortcut|verknüpfung)$/i, '')
  );
}

// Resolve many .lnk files at once -> { lnkLower: { target, args, icon } }.
function resolveShortcuts(lnkPaths) {
  const map = {};
  if (!lnkPaths.length) return map;
  const tmp = path.join(os.tmpdir(), `arcadia_lnk_${Date.now()}.txt`);
  try {
    fs.writeFileSync(tmp, lnkPaths.join('\n'), 'utf8');
    const ps =
      `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; ` +
      `$sh = New-Object -ComObject WScript.Shell; ` +
      `Get-Content -LiteralPath '${tmp}' -Encoding UTF8 | ForEach-Object { if ($_) { try { ` +
      `$s = $sh.CreateShortcut($_); ` +
      `[Console]::Out.WriteLine($_ + '<|>' + $s.TargetPath + '<|>' + $s.Arguments + '<|>' + $s.IconLocation) ` +
      `} catch {} } }`;
    const out = execFileSync(
      'powershell',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps],
      { encoding: 'utf8', windowsHide: true }
    );
    for (const line of out.split(/\r?\n/)) {
      const p = line.split('<|>');
      if (p.length >= 2 && p[1]) {
        map[p[0].toLowerCase()] = {
          target: p[1].trim(),
          args: (p[2] || '').trim(),
          icon: (p[3] || '').trim(),
        };
      }
    }
  } catch {
    /* resolution unavailable */
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }
  return map;
}

// Pick the tile image for a shortcut. A .ico from the shortcut's IconLocation
// (distinct per game, e.g. LoL vs Valorant) is shown directly as an image —
// getFileIcon can't render .ico contents. Otherwise extract the exe's icon.
function iconFor(cand, r) {
  if (cand.ext === '.exe') return { iconPath: cand.full, iconImage: null };
  if (r) {
    if (r.icon) {
      const ip = r.icon.split(',')[0].trim().replace(/^"|"$/g, '');
      if (ip && fs.existsSync(ip)) {
        if (/\.ico$/i.test(ip)) return { iconPath: null, iconImage: pathToFileURL(ip).href };
        if (/\.exe$/i.test(ip)) return { iconPath: ip, iconImage: null };
      }
    }
    if (r.target && fs.existsSync(r.target)) return { iconPath: r.target, iconImage: null };
  }
  return { iconPath: cand.full, iconImage: null }; // unresolved .lnk -> initials
}

// Riot games all launch through RiotClientServices.exe, so the shortcut target
// alone can't tell LoL from Valorant. Map the --launch-product argument to the
// game's actual process names so run-detection is per-game. The bare Riot
// Client launcher (no product) gets no detection — it's shared by all of them.
function riotProcesses(args) {
  const m = /--launch-product=([a-z_]+)/i.exec(args || '');
  const prod = m ? m[1].toLowerCase() : '';
  if (prod === 'league_of_legends') return ['leagueclientux.exe', 'leagueclient.exe', 'league of legends.exe'];
  if (prod === 'valorant') return ['valorant.exe', 'valorant-win64-shipping.exe'];
  if (prod === 'bacon') return ['legends of runeterra.exe', 'lor.exe'];
  return null;
}

// Scan the user's desktop(s) for game/app shortcuts (e.g. FACEIT, LoL, Valorant).
// .url files are skipped — they are mostly Steam duplicates already covered.
async function scanShortcuts(knownTitles = new Set()) {
  const candidates = [];
  const seenName = new Set();

  for (const root of desktopRoots()) {
    let entries;
    try {
      entries = fs.readdirSync(root, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      if (!e.isFile()) continue;
      const ext = path.extname(e.name).toLowerCase();
      if (ext !== '.lnk' && ext !== '.exe') continue;
      const title = cleanName(e.name);
      const key = title.toLowerCase();
      if (!title || isBlocked(e.name) || seenName.has(key) || knownTitles.has(key)) continue;
      seenName.add(key);
      candidates.push({ full: path.join(root, e.name), ext, title });
    }
  }

  const resolved = resolveShortcuts(candidates.filter((c) => c.ext === '.lnk').map((c) => c.full));

  const games = [];
  const seenTarget = new Set();
  for (const c of candidates) {
    const r = c.ext === '.lnk' ? resolved[c.full.toLowerCase()] : null;
    const target = c.ext === '.exe' ? c.full : r ? r.target : '';
    const args = r ? r.args : '';

    // Never list Arcadia itself, whatever the shortcut is named.
    if (target && path.basename(target).toLowerCase() === 'arcadia.exe') continue;

    // De-dupe by target + arguments: EN/TR duplicate launchers merge, but
    // League of Legends and Valorant (same exe, different args) stay separate.
    const dkey = target ? `${target}::${args}`.toLowerCase() : c.full.toLowerCase();
    if (seenTarget.has(dkey)) continue;
    seenTarget.add(dkey);

    const ic = iconFor(c, r);
    let exeName = (c.ext === '.exe' ? path.basename(c.full) : target ? path.basename(target) : '').toLowerCase();
    let exeNames;
    let killNames; // processes to kill on close (game-specific + the Riot launcher)
    if (target && /riotclientservices\.exe$/i.test(target)) {
      const rn = riotProcesses(args);
      if (!rn) continue; // bare Riot Client launcher — don't list it as a game
      exeNames = rn;
      exeName = rn[0];
      killNames = [...rn, 'riotclientservices.exe', 'riotclientux.exe'];
    }
    games.push({
      id: `shortcut:${c.full.toLowerCase()}`,
      title: c.title,
      source: 'shortcut',
      launch: { type: 'path', value: c.full },
      iconPath: ic.iconPath,
      iconImage: ic.iconImage,
      exeName,
      exeNames,
      killNames,
      installDir: c.ext === '.exe' ? path.dirname(c.full) : target ? path.dirname(target) : null,
    });
  }
  return games;
}

module.exports = { scanShortcuts };
