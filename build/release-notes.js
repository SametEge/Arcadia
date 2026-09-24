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

Download **Arcadia-Setup-${version}.exe** below and run it. Arcadia keeps itself up to date after that.

If Windows SmartScreen says it protected your PC, choose **More info → Run anyway** — the installer isn't signed with a paid certificate yet, which is normal for open-source apps. It was built by GitHub Actions from this tag; \`SHA256SUMS.txt\` lets you check the file you downloaded.
`);
