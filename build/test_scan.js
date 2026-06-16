// Quick headless check of the scanners (no Electron needed).
//   node build/test_scan.js
const { scanSteam } = require('../src/scanners/steam');
const { scanEpic } = require('../src/scanners/epic');
const { scanXbox } = require('../src/scanners/xbox');

(async () => {
  const steam = await scanSteam();
  console.log(`\nSteam: ${steam.length} oyun`);
  console.log(steam.slice(0, 12).map((g) => ` - ${g.title} (${g.id})`).join('\n'));

  const epic = await scanEpic();
  console.log(`\nEpic: ${epic.length} oyun`);
  console.log(epic.map((g) => ` - ${g.title}`).join('\n'));

  const xbox = await scanXbox();
  console.log(`\nXbox: ${xbox.length} oyun`);
  console.log(xbox.map((g) => ` - ${g.title} -> ${g.launch ? g.launch.value : 'EXE yok'}`).join('\n'));

  if (steam[0]) console.log('\nÖrnek Steam kapak:', steam[0].cover);
})();
