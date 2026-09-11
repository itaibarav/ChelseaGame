#!/usr/bin/env node
/**
 * get-token.mjs — עושה את כל שרשרת הטוקנים של מטא בפקודה אחת.
 *
 * מחליף את הצעדים הידניים: החלפה לטוקן ארוך, איתור טוקן העמוד,
 * שליפת מזהה האינסטגרם, אימות שהטוקן לא פג, וכתיבה ל-config.json.
 *
 * הרצה:
 *   node server/get-token.mjs
 * או בשורה אחת:
 *   node server/get-token.mjs --app-id=... --app-secret=... --token=... --page=133427760029168
 */

import { createInterface } from 'node:readline/promises';
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const V = 'v23.0';
const G = 'https://graph.facebook.com';

const args = Object.fromEntries(process.argv.slice(2)
  .filter(a => a.startsWith('--'))
  .map(a => { const i = a.indexOf('='); return [a.slice(2, i), a.slice(i + 1)]; }));

const die = (m) => { console.error('\n✗ ' + m + '\n'); process.exit(1); };

async function get(path) {
  const r = await fetch(G + path);
  const j = await r.json().catch(() => ({}));
  if (j.error) die(`מטא החזירה שגיאה: ${j.error.message}` +
    (j.error.code ? `  (code ${j.error.code})` : ''));
  if (!r.ok) die('HTTP ' + r.status);
  return j;
}

async function ask(rl, q, val) {
  if (val) return val;
  const a = (await rl.question(q)).trim();
  return a;
}

const rl = createInterface({ input: process.stdin, output: process.stdout });

console.log('\n— טוקן קבוע לעמוד פייסבוק —\n');
console.log('צריך שלושה דברים מלוח האפליקציה ומ-Graph API Explorer:');
console.log('  App ID ו-App Secret  →  App settings ← Basic');
console.log('  טוקן משתמש קצר      →  Graph API Explorer ← Generate Access Token');
console.log('  ההרשאות: pages_show_list, pages_read_engagement, instagram_basic\n');

const appId  = await ask(rl, 'App ID: ', args['app-id']);
const secret = await ask(rl, 'App Secret: ', args['app-secret']);
const short  = await ask(rl, 'טוקן משתמש קצר: ', args['token']);
const pageId = await ask(rl, 'Page ID [133427760029168]: ', args['page']) || '133427760029168';
rl.close();

if (!appId || !secret || !short)
  die('חסר אחד השדות. אפשר גם להעביר אותם בשורת הפקודה:\n     node server/get-token.mjs --app-id=... --app-secret=... --token=...');

console.log('\n1/4  מחליף לטוקן משתמש ארוך…');
const { access_token: longUser } = await get(
  `/${V}/oauth/access_token?grant_type=fb_exchange_token` +
  `&client_id=${appId}&client_secret=${secret}&fb_exchange_token=${short}`);
if (!longUser) die('לא התקבל טוקן ארוך');

console.log('2/4  מאתר את טוקן העמוד…');
const { data: pages = [] } = await get(
  `/${V}/me/accounts?fields=name,id,access_token&access_token=${longUser}`);
const page = pages.find(p => p.id === pageId);
if (!page) die(`העמוד ${pageId} לא נמצא ברשימה. עמודים זמינים: ` +
  (pages.map(p => `${p.name} (${p.id})`).join(', ') || 'אין'));

console.log('3/4  מוודא שהטוקן לא פג…');
const dbg = await get(`/${V}/debug_token?input_token=${page.access_token}` +
  `&access_token=${appId}|${secret}`);
const expires = dbg.data?.expires_at;
const never = !expires || expires === 0;
console.log(never ? '     ✓ Expires: Never'
                  : '     ⚠ פג בתאריך ' + new Date(expires * 1000).toLocaleString('he-IL') +
                    '\n       בדרך כלל אומר שההרשאות לא אושרו במלואן ב-Explorer');

console.log('4/4  שולף את מזהה האינסטגרם המקושר…');
const linked = await get(
  `/${V}/${pageId}?fields=name,instagram_business_account&access_token=${page.access_token}`);
const igId = linked.instagram_business_account?.id;
if (!igId) die('לעמוד הזה אין חשבון אינסטגרם מקצועי מקושר. ' +
  'צריך לקשר אותו דרך הגדרות העמוד ← Linked accounts.');

let username = null;
try {
  username = (await get(`/${V}/${igId}?fields=username&access_token=${page.access_token}`)).username;
} catch {}

const block = {
  mode: 'graph',
  limit: 12,
  graph: { login: 'facebook', apiVersion: V, userId: igId, accessToken: page.access_token },
};

console.log('\n✓ הכל הושלם');
console.log('  עמוד      : ' + page.name + ' (' + pageId + ')');
console.log('  אינסטגרם  : ' + (username ? '@' + username : igId));
console.log('  תוקף      : ' + (never ? 'לא פג' : 'מוגבל — ראה אזהרה למעלה'));

const cfgPath = join(ROOT, 'config.json');
try {
  const cfg = JSON.parse(await readFile(cfgPath, 'utf8'));
  cfg.news = { ...cfg.news, ...block };
  await writeFile(cfgPath, JSON.stringify(cfg, null, 2));
  console.log('\nconfig.json עודכן. הפעל מחדש:  node server/server.mjs');
} catch {
  console.log('\nלא נמצא config.json. העתק את הבלוק הזה לתוכו תחת "news":\n');
  console.log(JSON.stringify(block, null, 2));
}
console.log('');
