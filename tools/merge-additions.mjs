// Merges an "album-additions-*.json.js" patch (exported from tools/sticker-studio-new.html)
// into src/data/album.json.js. Append-only: never edits or reorders existing cats/cards/photos.
//
// Usage:  node tools/merge-additions.mjs path/to/album-additions-2026-09-13-1230.json.js

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const albumPath = resolve(__dirname, '../src/data/album.json.js');

const patchFile = process.argv[2];
if (!patchFile) {
  console.error('Usage: node tools/merge-additions.mjs <album-additions-file.json.js>');
  process.exit(1);
}

function loadJsModule(path) {
  const text = readFileSync(path, 'utf8');
  const jsonText = text.replace(/^export default\s*/, '').replace(/;\s*$/, '');
  return JSON.parse(jsonText);
}

const patch = loadJsModule(resolve(patchFile));
const album = loadJsModule(albumPath);

let addedCats = 0, skippedCats = 0, addedCards = 0, skippedCards = 0, addedPhotos = 0;

for (const cat of patch.cats || []) {
  if (album.extra.cats.some(c => c.key === cat.key)) { skippedCats++; continue; }
  album.extra.cats.push(cat);
  addedCats++;
}

for (const card of patch.cards || []) {
  if (album.extra.cards.some(c => c.id === card.id)) { skippedCards++; continue; }
  album.extra.cards.push(card);
  addedCards++;
}

for (const [id, photo] of Object.entries(patch.photos || {})) {
  album.extraPhotos[id] = photo;
  addedPhotos++;
}

writeFileSync(albumPath, 'export default ' + JSON.stringify(album, null, 1) + ';\n');

console.log(`Merged into ${albumPath}`);
console.log(`  cats:   +${addedCats}${skippedCats ? ` (${skippedCats} already existed, skipped)` : ''}`);
console.log(`  cards:  +${addedCards}${skippedCards ? ` (${skippedCards} already existed, skipped)` : ''}`);
console.log(`  photos: +${addedPhotos}`);
