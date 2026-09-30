'use strict';
// Prints the GitHub release notes for one version.
//   node build/release-notes.js 1.1.0 > release-notes.md
//
// The body is that version's section of CHANGELOG.md (from its `## [x.y.z]`
// heading to the next one), followed by the install notes every release
// carries. A version missing from the changelog is an error rather than an
// empty release page.

const fs = require('fs');
const path = require('path');

const version = (process.argv[2] || '').replace(/^v/, '');
if (!version) {
  console.error('usage: node build/release-notes.js <version>');
  process.exit(2);
}

const changelog = fs.readFileSync(path.join(__dirname, '..', 'CHANGELOG.md'), 'utf8').replace(/\r\n/g, '\n');
const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const match = changelog.match(new RegExp(`^## \\[${escaped}\\][^\\n]*\\n([\\s\\S]*?)(?=^## \\[|^\\[[^\\]]+\\]: |(?![\\s\\S]))`, 'm'));
if (!match || !match[1].trim()) {
  console.error(`CHANGELOG.md has no entry for ${version}`);
  process.exit(1);
}

const body = match[1].trim().replace(/\n---$/, '').trim();

process.stdout.write(`${body}

---

### Install

**Recommended:** get Arcadia from the [Microsoft Store](https://apps.microsoft.com/detail/9N22381XP9S9). Microsoft signs the Store version, so it installs with no SmartScreen or Smart App Control warning, and the Store keeps it up to date.

Or download **Arcadia-Setup-${version}.exe** below and run it; it keeps itself up to date after that. This installer isn't signed like the Store version, so Windows SmartScreen may ask you to confirm it (**More info → Run anyway**) and Smart App Control blocks it. It was built from this tag's source; \`SHA256SUMS.txt\` lets you check the file you downloaded.
`);
