#!/usr/bin/env node
/**
 * BlueStickerApp — שרת הביניים
 *
 * שתי מטרות:
 *   1. פוסטים מאינסטגרם כקטעי קריאה
 *   2. עשרת המשחקים האחרונים ועשרת הבאים
 *
 * הרצה:  node server/server.mjs
 * דרישות: Node 20+ בלבד. אין חבילות להתקין.
 *
 * למה בכלל צריך שרת:
 *   - טוקנים של מטא ושל ספק המשחקים לא יכולים לשבת בקוד האפליקציה
 *   - שני הספקים לא שולחים כותרות CORS, ולכן דפדפן לא יכול לפנות אליהם ישירות
 *   - כתובות התמונות של אינסטגרם פגות אחרי כמה ימים, אז השרת מוריד ומאחסן אותן
 */

import http from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT  = dirname(fileURLToPath(import.meta.url));
const DATA  = join(ROOT, 'data');
const MEDIA = join(DATA, 'media');

/* ------------------------------------------------------------------ */
/* הגדרות                                                              */
/* ------------------------------------------------------------------ */

const DEFAULTS = {
  port: 8787,
  allowOrigin: '*',
  adminToken: 'change-me',
  news: {
    mode: 'curated',            // 'curated' = רשימה שאתה מנהל · 'graph' = משיכה אוטומטית
    limit: 12,
    graph: {
      // 'instagram' = התחברת עם חשבון האינסטגרם עצמו
      // 'facebook'  = אתה מנהל של עמוד הפייסבוק המקושר אליו
      login: 'instagram',
      apiVersion: 'v23.0',
      userId: 'me',             // ב-facebook צריך את מזהה חשבון האינסטגרם המספרי
      accessToken: '',
    },
  },
  matches: {
    provider: 'football-data',  // 'football-data' | 'none'
    apiKey: '',
    teamId: 61,                 // צ'לסי ב-football-data.org
    pastCount: 10,
    upcomingCount: 10,
  },
  ttlMinutes: { news: 15, matches: 30 },
};

const deepMerge = (a, b) => {
  const out = { ...a };
  for (const [k, v] of Object.entries(b || {})) {
    out[k] = v && typeof v === 'object' && !Array.isArray(v) ? deepMerge(a[k] || {}, v) : v;
  }
  return out;
};

let CFG = DEFAULTS;
async function loadConfig() {
  try {
    CFG = deepMerge(DEFAULTS, JSON.parse(await readFile(join(ROOT, 'config.json'), 'utf8')));
  } catch {
    console.log('לא נמצא config.json — רץ עם ברירות מחדל. העתק את config.example.json.');
  }
  // משתני סביבה גוברים, נוח לפריסה בענן
  if (process.env.PORT) CFG.port = +process.env.PORT;
  if (process.env.ADMIN_TOKEN) CFG.adminToken = process.env.ADMIN_TOKEN;
  if (process.env.IG_TOKEN) { CFG.news.graph.accessToken = process.env.IG_TOKEN; CFG.news.mode = 'graph'; }
  if (process.env.FOOTBALL_DATA_KEY) CFG.matches.apiKey = process.env.FOOTBALL_DATA_KEY;
}

/* ------------------------------------------------------------------ */
/* עזרי דיסק                                                           */
/* ------------------------------------------------------------------ */

const readJson = async (f, fallback) => {
  try { return JSON.parse(await readFile(join(DATA, f), 'utf8')); } catch { return fallback; }
};
const writeJson = (f, obj) => writeFile(join(DATA, f), JSON.stringify(obj, null, 2));

/** מוריד תמונה פעם אחת ומחזיר נתיב מקומי יציב */
async function cacheImage(url) {
  if (!url) return null;
  const name = createHash('sha1').update(url).digest('hex').slice(0, 16)
             + (extname(new URL(url).pathname).split('?')[0] || '.jpg');
  const path = join(MEDIA, name);
  try { await stat(path); return '/media/' + name; } catch {}
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    await writeFile(path, Buffer.from(await r.arrayBuffer()));
    return '/media/' + name;
  } catch { return null; }
}

/* ------------------------------------------------------------------ */
/* מטמון: מגיש תוכן ישן כשהספק נופל, במקום להחזיר שגיאה                */
/* ------------------------------------------------------------------ */

const cache = { news: null, matches: null };

async function cached(key, ttlMin, producer) {
  const now = Date.now();
  if (cache[key] && now - cache[key].updated < ttlMin * 60000) return cache[key];
  const disk = await readJson(`${key}.cache.json`, null);
  if (!cache[key] && disk) cache[key] = disk;
  if (cache[key] && now - cache[key].updated < ttlMin * 60000) return cache[key];
  try {
    const fresh = { updated: now, ...(await producer()) };
    cache[key] = fresh;
    await writeJson(`${key}.cache.json`, fresh);
    return fresh;
  } catch (e) {
    console.error(`[${key}] רענון נכשל:`, e.message);
    if (cache[key]) return { ...cache[key], stale: true };
    throw e;
  }
}

/* ------------------------------------------------------------------ */
/* 1. חדשות                                                            */
/* ------------------------------------------------------------------ */

async function fetchNews() {
  if (CFG.news.mode === 'graph' && CFG.news.graph.accessToken) return fetchNewsGraph();
  return fetchNewsCurated();
}

/** רשימה שאתה מנהל דרך /admin — עובד לכל חשבון, גם כזה שאינו שלך */
async function fetchNewsCurated() {
  const list = await readJson('news.json', []);
  const posts = [];
  for (const p of list.slice(0, CFG.news.limit)) {
    posts.push({
      id: p.id,
      caption: p.caption || '',
      image: p.imageLocal || (await cacheImage(p.image)) || p.image || null,
      permalink: p.permalink || '',
      timestamp: p.timestamp || new Date().toISOString(),
    });
  }
  posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return { source: 'curated', posts };
}

/** משיכה אוטומטית — דורש שהחשבון יהיה מקושר לאפליקציית מטא שלך */
const graphHost = () =>
  CFG.news.graph.login === 'facebook' ? 'https://graph.facebook.com' : 'https://graph.instagram.com';

async function fetchNewsGraph() {
  const { userId, accessToken, apiVersion } = CFG.news.graph;
  const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
  const url = `${graphHost()}/${apiVersion || 'v23.0'}/${userId || 'me'}/media`
            + `?fields=${fields}&limit=${CFG.news.limit}&access_token=${accessToken}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('Instagram ' + r.status + ' ' + (await r.text()).slice(0, 160));
  const { data = [] } = await r.json();
  const posts = [];
  for (const m of data) {
    if (m.media_type === 'VIDEO' && !m.thumbnail_url) continue;
    posts.push({
      id: m.id,
      caption: m.caption || '',
      image: await cacheImage(m.thumbnail_url || m.media_url),
      permalink: m.permalink,
      timestamp: m.timestamp,
    });
  }
  return { source: 'graph', posts };
}

/** רענון הטוקן הארוך — פג אחרי 60 יום אם לא מחדשים */
async function refreshInstagramToken() {
  const t = CFG.news.graph.accessToken;
  if (CFG.news.mode !== 'graph' || !t) return;
  // מסלול פייסבוק משתמש בטוקן עמוד שלא פג, ואין לו נקודת רענון כזו
  if (CFG.news.graph.login === 'facebook') return;
  try {
    const r = await fetch('https://graph.instagram.com/refresh_access_token'
      + `?grant_type=ig_refresh_token&access_token=${t}`);
    if (!r.ok) return;
    const d = await r.json();
    if (d.access_token) {
      CFG.news.graph.accessToken = d.access_token;
      await writeJson('token.json', { access_token: d.access_token, refreshed: new Date().toISOString() });
      console.log('טוקן אינסטגרם חודש');
    }
  } catch {}
}

/* ------------------------------------------------------------------ */
/* 2. משחקים                                                           */
/* ------------------------------------------------------------------ */

async function fetchMatches() {
  if (CFG.matches.provider !== 'football-data' || !CFG.matches.apiKey) {
    return { source: 'none', past: [], upcoming: [] };
  }
  const { apiKey, teamId, pastCount, upcomingCount } = CFG.matches;
  const call = async (status, limit) => {
    const r = await fetch(
      `https://api.football-data.org/v4/teams/${teamId}/matches?status=${status}&limit=${limit}`,
      { headers: { 'X-Auth-Token': apiKey } });
    if (!r.ok) throw new Error('football-data ' + r.status);
    return (await r.json()).matches || [];
  };

  const [finished, scheduled] = await Promise.all([
    call('FINISHED', pastCount),
    call('SCHEDULED', upcomingCount),
  ]);

  const map = async (m) => {
    const home = m.homeTeam.id === teamId;
    const opp = home ? m.awayTeam : m.homeTeam;
    const ft = m.score?.fullTime;
    return {
      id: String(m.id),
      opponent: opp.shortName || opp.name,
      opponentLogo: await cacheImage(opp.crest),
      homeAway: home ? 'H' : 'A',
      score: ft && ft.home != null ? `${ft.home}-${ft.away}` : null,
      result: ft && ft.home != null
        ? (ft.home === ft.away ? 'D' : (ft.home > ft.away) === home ? 'W' : 'L')
        : null,
      date: m.utcDate,
      competition: m.competition?.name || '',
    };
  };

  const past = (await Promise.all(finished.map(map)))
    .sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, pastCount);
  const upcoming = (await Promise.all(scheduled.map(map)))
    .sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, upcomingCount);
  return { source: 'football-data', past, upcoming };
}

/* ------------------------------------------------------------------ */
/* HTTP                                                                */
/* ------------------------------------------------------------------ */

const send = (res, code, body, headers = {}) => {
  res.writeHead(code, {
    'Access-Control-Allow-Origin': CFG.allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
};

const readBody = (req) => new Promise((resolve) => {
  let b = ''; req.on('data', (c) => (b += c));
  req.on('end', () => { try { resolve(JSON.parse(b || '{}')); } catch { resolve({}); } });
});

const isAdmin = (req) => (req.headers['x-admin-token'] || '') === CFG.adminToken;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;

  if (req.method === 'OPTIONS') return send(res, 204, '');

  try {
    if (p === '/health')
      return send(res, 200, { ok: true, newsMode: CFG.news.mode, matches: CFG.matches.provider });

    if (p === '/api/news')
      return send(res, 200, await cached('news', CFG.ttlMinutes.news, fetchNews));

    if (p === '/api/matches')
      return send(res, 200, await cached('matches', CFG.ttlMinutes.matches, fetchMatches));

    /* קריאה אחת שמחזירה הכול — פחות סיבובים מהטלפון */
    if (p === '/api/feed') {
      const [news, matches] = await Promise.all([
        cached('news', CFG.ttlMinutes.news, fetchNews).catch(() => ({ posts: [] })),
        cached('matches', CFG.ttlMinutes.matches, fetchMatches).catch(() => ({ past: [], upcoming: [] })),
      ]);
      return send(res, 200, { updated: Date.now(), news, matches });
    }

    /* תמונות שמורות */
    if (p.startsWith('/media/')) {
      const file = join(MEDIA, p.slice(7).replace(/[^\w.-]/g, ''));
      try {
        await stat(file);
        res.writeHead(200, {
          'Access-Control-Allow-Origin': CFG.allowOrigin,
          'Cache-Control': 'public, max-age=604800',
          'Content-Type': extname(file) === '.png' ? 'image/png'
                        : extname(file) === '.svg' ? 'image/svg+xml' : 'image/jpeg',
        });
        return createReadStream(file).pipe(res);
      } catch { return send(res, 404, { error: 'not found' }); }
    }

    /* ניהול הרשימה */
    if (p === '/admin/ig-check' && req.method === 'GET') {
      if (!isAdmin(req)) return send(res, 401, { error: 'bad token' });
      const g = CFG.news.graph;
      if (!g.accessToken) return send(res, 200, { ok: false, error: 'לא הוגדר טוקן' });
      const v = g.apiVersion || 'v23.0';
      try {
        const who = await fetch(`${graphHost()}/${v}/${g.userId || 'me'}`
          + `?fields=username,name&access_token=${g.accessToken}`);
        const whoJson = await who.json();
        if (!who.ok) return send(res, 200, { ok: false, error: whoJson.error?.message || who.status });
        const med = await fetch(`${graphHost()}/${v}/${g.userId || 'me'}/media`
          + `?fields=id&limit=5&access_token=${g.accessToken}`);
        const medJson = await med.json();
        return send(res, 200, {
          ok: true, login: g.login,
          account: whoJson.username || whoJson.name || null,
          postsVisible: (medJson.data || []).length,
          error: medJson.error?.message || null,
        });
      } catch (e) { return send(res, 200, { ok: false, error: e.message }); }
    }

    if (p === '/admin' && req.method === 'GET') {
      const html = await readFile(join(ROOT, 'admin.html'), 'utf8');
      return send(res, 200, html, { 'Content-Type': 'text/html; charset=utf-8' });
    }
    if (p === '/admin/news' && req.method === 'GET') {
      if (!isAdmin(req)) return send(res, 401, { error: 'bad token' });
      return send(res, 200, await readJson('news.json', []));
    }
    if (p === '/admin/news' && req.method === 'POST') {
      if (!isAdmin(req)) return send(res, 401, { error: 'bad token' });
      const b = await readBody(req);
      if (!b.caption && !b.image) return send(res, 400, { error: 'צריך לפחות כיתוב או תמונה' });
      const list = await readJson('news.json', []);
      const post = {
        id: b.id || 'p' + Date.now(),
        caption: b.caption || '',
        image: b.image || '',
        imageLocal: b.image ? await cacheImage(b.image) : null,
        permalink: b.permalink || '',
        timestamp: b.timestamp || new Date().toISOString(),
      };
      list.unshift(post);
      await writeJson('news.json', list);
      cache.news = null;
      return send(res, 200, post);
    }
    if (p.startsWith('/admin/news/') && req.method === 'DELETE') {
      if (!isAdmin(req)) return send(res, 401, { error: 'bad token' });
      const id = decodeURIComponent(p.slice(12));
      const list = (await readJson('news.json', [])).filter((x) => x.id !== id);
      await writeJson('news.json', list);
      cache.news = null;
      return send(res, 200, { deleted: id });
    }

    send(res, 404, { error: 'not found' });
  } catch (e) {
    console.error(e);
    send(res, 500, { error: e.message });
  }
});

/* ------------------------------------------------------------------ */

await loadConfig();
await mkdir(MEDIA, { recursive: true });
const saved = await readJson('token.json', null);
if (saved?.access_token) CFG.news.graph.accessToken = saved.access_token;

server.listen(CFG.port, () => {
  console.log(`\nשרת אלבום הבלוז רץ על http://localhost:${CFG.port}`);
  console.log(`  חדשות : ${CFG.news.mode}${CFG.news.mode === 'graph' ? ' (אוטומטי)' : ' (רשימה מנוהלת)'}`);
  console.log(`  משחקים: ${CFG.matches.apiKey ? CFG.matches.provider : 'לא מוגדר — חסר מפתח API'}`);
  console.log(`  ניהול : http://localhost:${CFG.port}/admin\n`);
});

refreshInstagramToken();
setInterval(refreshInstagramToken, 24 * 60 * 60 * 1000);
