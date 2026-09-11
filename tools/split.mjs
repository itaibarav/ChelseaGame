#!/usr/bin/env node
/**
 * split.mjs — הופך את הפרוטוטייפ בקובץ אחד לפרויקט מודולרי.
 *
 * הקוד נכתב כסקופ אחד גדול, ולכן הפיצול נעשה בשני שלבים:
 *   1. חיתוך לפי כותרות הסקשנים שכבר קיימות בקוד
 *   2. ניתוח אילו שמות כל מודול מגדיר ואילו הוא שואל מאחרים,
 *      וייצור אוטומטי של import/export מתאימים
 *
 * הרצה: node tools/split.mjs
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const SRC = process.argv[2] || 'blue-sticker-prototype.html';
const OUT = process.argv[3] || '/tmp/ChelseaGame';

/* איזה חלק בקוד הולך לאיזה קובץ. המפתח הוא תחילת כותרת הסקשן. */
const MAP = [
  ['/* ======================= DATA',            'data/cards.js'],
  ['/* ======================= STATE',           'core/state.js'],
  ['/* ======================= ART',             'art/cards.js'],
  ['/* ======================= עיצוב חולצות',    'art/avatar.js'],
  ['/* ======================= פיד מהשרת',       'net/feed.js'],
  ['/* ======================= STADIUM',         'art/stadium.js'],
  ['/* ======================= FX',              'core/fx.js'],
  ['/* ======================= HELPERS',         'core/dom.js'],
  ['/* ======================= SCREENS',         'screens/index.js'],
  ['/* ======================= ACTIONS',         'core/actions.js'],
  ['/* ======================= MINI GAMES',      'games/shared.js'],
  ['/* ======================= נכסי משחק',       'games/assets.js'],
  ['/* ======================= 1.',              'games/shirt.js'],
  ['/* ======================= 2.',              'games/value.js'],
  ['/* ======================= 3.',              'games/memory.js'],
  ['/* ======================= 4.',              'games/penalty.js'],
  ['/* ======================= 5.',              'games/keepie.js'],
  ['/* ======================= 6.',              'games/bubble.js'],
  ['/* ======================= 7.',              'games/rps.js'],
  ['/* ======================= 8.',              'games/ttt.js'],
  ['/* ======================= 9.',              'games/run.js'],
  ['/* ======================= RENDER',          'core/router.js'],
];

const html = await readFile(SRC, 'utf8');
let js = html.split('<script>')[1].split('</script>')[0];
const css = html.split('<style>')[1].split('</style>')[0];

/* ---------- 0. נרמול ----------
   שורות כמו "let SND=true;let AC=null;" מבלבלות את זיהוי ההצהרות.
   מפצלים אותן, אבל רק כשהשורה מתחילה בהצהרה בעמודה 0. */
js = js.split('\n').map((line) =>
  /^(?:let|const|var)\s/.test(line) && /;\s*(?:let|const|var)\s/.test(line)
    ? line.replace(/;\s*(let|const|var)\s+/g, ';\n$1 ')
    : line
).join('\n');

/* ---------- 1. חיתוך ---------- */
const marks = MAP.map(([head, file]) => ({ head, file, at: js.indexOf(head) }))
  .filter((m) => m.at >= 0)
  .sort((a, b) => a.at - b.at);
if (marks.length !== MAP.length) {
  const missing = MAP.filter(([h]) => !marks.some((m) => m.head === h)).map(([h]) => h);
  console.error('כותרות שלא נמצאו:\n  ' + missing.join('\n  '));
  process.exit(1);
}
const chunks = marks.map((m, i) => ({
  file: m.file,
  code: js.slice(m.at, i + 1 < marks.length ? marks[i + 1].at : js.length).trim(),
}));
/* לפני הסקשן הראשון יושבים בלוק הנתונים המוטמע — שכבר הפך לקבצים —
   ולצידו קבועים גלובליים כמו PHOTOS ו-KIT_STYLE. הבלוק נזרק, הקבועים נשמרים. */
const preamble = js.slice(0, marks[0].at)
  .replace(/\/\*PHOTOS_START\*\/[\s\S]*?\/\*PHOTOS_END\*\//, '')
  .trim();
chunks.unshift({ file: 'data/globals.js', code: preamble });

/* ---------- 2. אילו שמות כל מודול מגדיר ---------- */
const declRe = /^(?:export\s+)?(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/;
const extraRe = /^(?:const|let|var)\s+(.+?);\s*$/;

function declaredIn(code) {
  const names = new Set();
  for (const line of code.split('\n')) {
    const m = declRe.exec(line);
    if (!m) continue;
    names.add(m[1]);
    /* const a='x', b='y';  — רק רשימה פשוטה. שורה עם חץ, סוגריים או
       סוגר מסולסל מכילה קוד של פונקציה, והמשתנים שבה מקומיים. */
    if (/[=]>|[({[]/.test(line)) continue;
    const e = extraRe.exec(line);
    if (e) {
      for (const part of e[1].split(',')) {
        const n = /^\s*([A-Za-z_$][\w$]{1,})\s*=/.exec(part);
        if (n) names.add(n[1]);
      }
    }
  }
  return names;
}

const owner = new Map();               // שם -> קובץ
for (const c of chunks) {
  c.declares = declaredIn(c.code);
  for (const n of c.declares) if (!owner.has(n)) owner.set(n, c.file);
}

/* ---------- 2.5 מצב משתנה משותף ----------
   הקוד המקורי היה סקופ אחד, ולכן מודול אחד מגדיר משתנה ואחר משנה אותו.
   ב-ES modules ייבוא הוא לקריאה בלבד, אז כל משתנה כזה עובר לאובייקט MUT. */
const assignRe = (n) => new RegExp('(?<![\\w$.])' + n + '\\s*=(?!=)');
const shared = new Set();
for (const c of chunks) {
  for (const [name, file] of owner) {
    if (file === c.file) continue;
    if (assignRe(name).test(c.code)) shared.add(name);
  }
}

const inits = new Map();
for (const c of chunks) {
  if (!shared.size) break;
  c.code = c.code.split('\n').filter((line) => {
    const m = /^(?:let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([\s\S]*?);\s*$/.exec(line);
    if (m && shared.has(m[1])) { inits.set(m[1], m[2]); return false; }
    const d = /^(?:let|var)\s+([A-Za-z_$][\w$]*)\s*;\s*$/.exec(line);
    if (d && shared.has(d[1])) { inits.set(d[1], 'null'); return false; }
    return true;
  }).join('\n');
}

if (shared.size) {
  const body = 'export const MUT = {\n' +
    [...shared].map((n) => `  ${n}: ${inits.has(n) ? inits.get(n) : 'null'},`).join('\n') +
    '\n};\n';
  chunks.unshift({ file: 'core/mut.js', code: '/* מצב משתנה שחוצה מודולים */\n' + body });
  for (const c of chunks) {
    if (c.file === 'core/mut.js') continue;
    for (const n of shared) {
      c.code = c.code.replace(new RegExp('(?<![\\w$.])' + n + '(?![\\w$])', 'g'), 'MUT.' + n);
    }
  }
  /* מיפוי הבעלות מחושב מחדש, כי הצהרות הוסרו ו-MUT נוסף */
  owner.clear();
  for (const c of chunks) {
    c.declares = declaredIn(c.code);
    for (const n of c.declares) if (!owner.has(n)) owner.set(n, c.file);
  }
  console.log('משתנים משותפים שעברו ל-MUT: ' + [...shared].join(', ') + '\n');
}

/* ---------- 3. ייצור imports ---------- */
const rel = (from, to) => {
  const a = from.split('/'), b = to.split('/');
  a.pop();
  let p = b.join('/');
  if (a.length === 0) return './' + p;
  const up = '../'.repeat(a.length);
  return up + p;
};

for (const c of chunks) {
  const needs = new Map();             // קובץ -> Set של שמות
  for (const [name, file] of owner) {
    if (file === c.file || c.declares.has(name)) continue;
    /* שימוש כמילה שלמה, ולא בתוך מחרוזת של כותרת */
    const re = new RegExp('(?<![\\w$.])' + name.replace(/\$/g, '\\$') + '(?![\\w$])');
    if (re.test(c.code)) {
      if (!needs.has(file)) needs.set(file, new Set());
      needs.get(file).add(name);
    }
  }
  c.imports = [...needs.entries()]
    .map(([file, set]) => `import { ${[...set].sort().join(', ')} } from '${rel(c.file, file)}';`)
    .sort();
}

/* ---------- 4. כתיבה ---------- */
const exportify = (code, declares) =>
  code.split('\n').map((line) => {
    const m = declRe.exec(line);
    if (!m || !declares.has(m[1]) || line.startsWith('export ')) return line;
    return 'export ' + line;
  }).join('\n');

for (const c of chunks) {
  const path = join(OUT, 'src', c.file);
  await mkdir(join(path, '..'), { recursive: true });
  const body = exportify(c.code, c.declares);
  const head = c.imports.length ? c.imports.join('\n') + '\n\n' : '';
  await writeFile(path, head + body + '\n');
}

await writeFile(join(OUT, 'src', 'styles.css'), css.trim() + '\n');

console.log(`פוצל ל-${chunks.length} מודולים`);
for (const c of chunks)
  console.log(`  ${c.file.padEnd(22)} ${String(c.code.split('\n').length).padStart(4)} שורות · ` +
              `מגדיר ${String(c.declares.size).padStart(3)} · מייבא מ-${c.imports.length}`);

