'use strict';

const fs = require('fs');
const path = require('path');

// Riot installs every game through one launcher, so desktop shortcuts only point
// at the generic "Riot Client". Read Riot's own metadata instead, so VALORANT /
// League of Legends / LoR show up as individual games even without per-game links.
const INSTALLS = path.join(process.env.ProgramData || 'C:\\ProgramData', 'Riot Games', 'RiotClientInstalls.json');

function productFor(installPath) {
  const p = installPath.toLowerCase();
  if (p.includes('valorant')) {
    return { product: 'valorant', title: 'VALORANT', exeNames: ['valorant.exe', 'valorant-win64-shipping.exe'] };
  }
  if (p.includes('league of legends')) {
    return { product: 'league_of_legends', title: 'League of Legends', exeNames: ['leagueclient.exe', 'leagueclientux.exe', 'league of legends.exe'] };
  }
  if (p.includes('runeterra')) {
    return { product: 'bacon', title: 'Legends of Runeterra', exeNames: ['legends of runeterra.exe', 'lor.exe'] };
  }
  return null;
}

async function scanRiot() {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(INSTALLS, 'utf8'));
  } catch {
    return []; // Riot not installed
  }
  const rc = data.rc_live || data.rc_default || (data.patchlines && Object.values(data.patchlines)[0]);
  if (!rc || !fs.existsSync(rc)) return [];

  const games = [];
  const seen = new Set();
  for (const installPath of Object.keys(data.associated_client || {})) {
    const meta = productFor(installPath);
    if (!meta || seen.has(meta.product)) continue;
    seen.add(meta.product);
    const dir = path.normalize(installPath);
    games.push({
      id: `riot:${meta.product}`,
      title: meta.title,
      source: 'shortcut',
      launch: { type: 'exe', value: rc, args: `--launch-product=${meta.product} --launch-patchline=live` },
      exeName: meta.exeNames[0],
      exeNames: meta.exeNames,
      killNames: [...meta.exeNames, 'riotclientservices.exe', 'riotclientux.exe'],
      installDir: fs.existsSync(dir) ? dir : null,
    });
  }
  return games;
}

module.exports = { scanRiot };
