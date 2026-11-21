import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/gi)]
  .map(match => match[1])
  .filter(source => source.trim().length > 0);

if (scripts.length !== 1) {
  throw new Error(`Expected one inline application script, found ${scripts.length}`);
}
writeFileSync('/tmp/mindi-inline.js', scripts[0]);
console.log('Extracted inline application script for node --check.');
