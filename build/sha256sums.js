'use strict';
// Prints a SHA256SUMS listing (`<hash>  <name>`, as sha256sum writes it) for
// the given files, so a release can be verified with standard tools.
//   node build/sha256sums.js release/*.exe > release/SHA256SUMS.txt

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node build/sha256sums.js <file>...');
  process.exit(2);
}

for (const file of files) {
  const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  process.stdout.write(`${hash}  ${path.basename(file)}\n`);
}
