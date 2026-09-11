import { $, modal, stickerHTML } from '../core/dom.js';
import { API_BASE, crestOf, matchDate, mediaUrl, nextMatch, online, teamHe } from '../net/feed.js';
import { CARDS, CATS, GAMES, LAYER_TABS, MOCK_MATCH, MOCK_POSTS, PACKS, TOTAL, byLayer } from '../data/cards.js';
import { MUT } from '../core/mut.js';
import { S, collected, esc, got, today } from '../core/state.js';
import { avatarSVG, itemThumb } from '../art/avatar.js';
import { coinSVG, crestSVG } from '../art/cards.js';
import { stadiumBG } from '../art/stadium.js';

/* ======================= SCREENS ======================= */
export let hudCoins=S.coins;
export const hud=()=>`<div class="hud">
  <div class="coin-pill">${coinSVG(21)}<span class="n">${hudCoins}</span></div>
  <div class="hud-right">
    <button class="snd" data-act="snd">${MUT.SND?'&#128266;':'&#128263;'}</button>
    <button class="icon-btn gold" data-act="daily">&#127873;${S.claim!==today()?'<span class="dot">!</span>':''}</button>
    <button class="icon-btn" data-act="go-avatar">&#129490;</button>
  </div></div>`;
export function animateCoins(){
  const el=document.querySelector('.coin-pill .n'),pill=document.querySelector('.coin-pill');
  if(!el)return; const from=hudCoins,to=S.coins; hudCoins=to;
  if(from===to)return;
  if(to>from&&pill){pill.classList.add('bump');setTimeout(()=>pill.classList.remove('bump'),480);}
  const t0=performance.now();
  (function step(t){const k=Math.min((t-t0)/560,1);
    el.textContent=Math.round(from+(to-from)*(1-Math.pow(1-k,3)));
    if(k<1)requestAnimationFrame(step);})(t0);
}

export function homeView(){
  const c=collected(),pct=Math.round(c/TOTAL*100);
  return hud()+`
  <div class="hero">${stadiumBG(false)}
    <div class="who">היי ${esc(S.name||'אלוף')} &#128075;</div>${avatarSVG()}
  </div>
  <div class="hero-row">
    <button class="btn btn-ghost" data-act="go-avatar">&#128085; התאם אוואטר</button>
    <button class="btn btn-blue progress-btn" data-act="go-album">
      <div class="fill" style="width:${pct}%"></div><span>&#128214; אלבום ${c}/${TOTAL}</span></button>
  </div>
  ${(()=>{const m=nextMatch();
    if(!m)return `<div class="card match" data-act="matches">
      <div class="side">${crestSVG('#034694','#FFC83D','C')}<small>${MOCK_MATCH.home}</small></div>
      <div class="mid"><div class="t">${MOCK_MATCH.comp}</div><div class="d">${MOCK_MATCH.when}</div>
        <span class="chip">${API_BASE?'ממתין לשרת':'נתוני דוגמה'}</span></div>
      <div class="side">${crestSVG('#C8102E','#FFFFFF','A')}<small>${MOCK_MATCH.away}</small></div></div>`;
    return `<div class="card match" data-act="matches">
      <div class="side">${crestSVG('#034694','#FFC83D','C')}<small>צ׳לסי</small></div>
      <div class="mid"><div class="t">${esc(m.competition||'המשחק הבא')}</div>
        <div class="d">${matchDate(m.date)}</div>
        <span class="chip">${m.homeAway==='H'?'בבית':'בחוץ'}</span></div>
      <div class="side">${crestOf(m)}<small>${esc(teamHe(m.opponent))}</small></div></div>`;})()}
  <div class="tiles">
    <button class="tile tile-gold" data-act="go-shop"><div style="font-size:34px">&#127873;</div><div class="lbl">חנות מעטפות</div></button>
    <button class="tile tile-blue" data-act="go-games"><div style="font-size:34px">&#127918;</div><div class="lbl">הרוויחו מטבעות<br>9 משחקים</div></button>
  </div>
  <p class="note">כל האיורים נוצרים בקוד (SVG). לוח המשחקים מציג נתוני דוגמה עד שנחבר מקור נתונים.</p>`;
}

export function albumView(){
  const list=CARDS.filter(c=>c.cat===S.tab);
  return hud()+`<div class="head"><h1>האלבום שלי</h1><p>${collected()} מתוך ${TOTAL} מדבקות נאספו</p></div>
    <div class="tabs">${CATS.map(([k,l])=>{const n=CARDS.filter(c=>c.cat===k),o=n.filter(c=>got(c.id)).length;
      return `<button class="tab ${S.tab===k?'on':''}" data-tab="${k}">${l} ${o}/${n.length}</button>`;}).join('')}</div>
    <div class="grid">${list.map(stickerHTML).join('')}</div>
    ${list.every(c=>!got(c.id))?'<p class="note">אין עדיין מדבקות בעמוד הזה. פתחו מעטפה בחנות.</p>':''}
    <div style="padding:0 var(--pad) 26px"><button class="btn btn-ghost" style="width:100%" data-act="credits">
      &#128247; קרדיטים לתמונות</button></div>`;
}

export function shopView(){
  return hud()+`<div class="head"><h1>חנות המעטפות</h1><p>כל מעטפה מכילה 5 מדבקות</p></div>
    <div class="packs">${PACKS.map(p=>`<div class="pack ${p.t==='gold'?'gold':''}">
      <div style="font-size:34px">${p.t==='gold'?'🏆':'🎴'}</div>
      <div class="txt"><b>${p.n}</b><small>${p.d}</small></div>
      <button class="buy" data-pack="${p.t}" ${S.coins<p.p?'disabled':''}>${p.p} ${coinSVG(17)}</button></div>`).join('')}</div>
    <div class="packs"><button class="btn btn-ghost" data-act="recycle">♻️ מיחזור כפילויות${(()=>{
      let n=0;Object.keys(S.inv).forEach(id=>{if(S.inv[id]>1)n+=S.inv[id]-1;});
      return n?` — ${n} זמינות`:'';})()}</button></div>
    <p class="note">מעטפת זהב משריינת סלוט אקראי אחד מתוך 5 לקלף נדיר, ואותה מדבקה לא תצא פעמיים באותה מעטפה.<br>מיחזור כפילות: מדבקה רגילה שווה מטבע אחד, נדירה 2, לוקסוס 3. העותק האחרון של כל מדבקה נשמר תמיד.</p>`;
}

export function gamesView(){
  return hud()+`<div class="head"><h1>משחקונים</h1><p>שחקו, צברו מטבעות, קנו מעטפות</p></div>
    <div class="glist">${GAMES.map(([n,e,k])=>`<button class="gtile ${k?'':'soon'}" ${k?`data-game="${k}"`:''}>
      <span class="emoji">${e}</span><span>${n}</span>${k?'':'<small style="font-size:10px">בקרוב</small>'}</button>`).join('')}</div>
    <p class="note">כל שמונת המשחקונים פעילים.</p>`;
}

export function newsView(){
  const posts=(S.news&&S.news.length)?S.news:null;
  const off=!online();
  const list=posts||MOCK_POSTS.map(p=>({id:p.id,caption:p.txt,image:null,emoji:p.emoji}));
  return hud()+`<div class="head"><h1>חדשות המועדון</h1><p>מבית מועדון האוהדים הישראלי</p></div>
    <div style="padding:0 var(--pad)">${
      off?'<span class="mock" style="background:rgba(229,37,42,.16);border-color:rgba(229,37,42,.4);color:#FFB3B5">מצב לא-מקוון — מוצג מידע שמור</span>'
      :posts?`<span class="mock">עודכן ${matchDate(new Date(S.feedAt).toISOString())}</span>`
      :`<span class="mock">${API_BASE?'לא הגיע מידע מהשרת — מוצג תוכן לדוגמה':'תוכן לדוגמה — השרת עדיין לא מחובר'}</span>`}</div>
    ${list.map(p=>{const done=S.read.includes(p.id);
      return `<div class="post">
        ${p.image?`<img class="ph" src="${mediaUrl(p.image)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ph',textContent:'📰'}))">`
                 :`<div class="ph" style="background:linear-gradient(150deg,#2C6FE0,#062B63)">${p.emoji||'📰'}</div>`}
        <div class="bd"><p>${esc((p.caption||'').slice(0,240))}</p>
        ${p.permalink?`<a class="perma" href="${p.permalink}" target="_blank" rel="noopener">פתיחה באינסטגרם ↗</a>`:''}
        <button class="readbtn ${done?'done':''}" ${done?'':`data-read="${p.id}"`}>${done?'✅ נקרא':'קראתי ✅ — 10 מטבעות'}</button></div></div>`;}).join('')}
    <p class="note">כל פוסט מזכה פעם אחת בלבד, לפי מזהה הפוסט.</p>`;
}

export function matchesModal(){
  const M=S.matches||{past:[],upcoming:[]};
  if(!M.past.length&&!M.upcoming.length)
    return modal(`<div class="sheet"><div style="font-size:42px">📅</div>
      <h2>לוח המשחקים ריק</h2>
      <p>${API_BASE?'השרת לא החזיר משחקים. בדוק שמפתח ה-API מוגדר.':'צריך לחבר את האפליקציה לשרת כדי למשוך משחקים.'}</p>
      <button class="btn btn-ghost" data-act="close" style="width:100%">סגירה</button></div>`);
  const row=m=>`<div class="mrow">
      <div class="mo">${crestOf(m)}<span>${esc(teamHe(m.opponent))}</span></div>
      <div class="mc">${m.score?`<b class="sc ${m.result==='W'?'w':m.result==='L'?'l':'d'}">${m.score}</b>`
                              :`<span class="vs">${matchDate(m.date)}</span>`}</div>
      <div class="mh">${m.homeAway==='H'?'בית':'חוץ'}</div></div>`;
  modal(`<div class="sheet game"><h2 style="margin:2px 0 8px">לוח המשחקים</h2>
    <div class="mtabs"><button class="on" data-mt="up">המשחקים הבאים</button><button data-mt="past">תוצאות אחרונות</button></div>
    <div class="mlist" id="mUp">${M.upcoming.map(row).join('')||'<p class="note">אין משחקים קרובים</p>'}</div>
    <div class="mlist" id="mPast" style="display:none">${M.past.map(row).join('')||'<p class="note">אין תוצאות</p>'}</div>
    <button class="btn btn-ghost" data-act="close" style="width:100%;margin-top:10px">סגירה</button></div>`);
}

export function avatarView(){
  const items=byLayer(S.avTab);
  return hud()+`<div class="head"><h1>הלוקר שלי</h1><p>הרכיבו את הדמות — ערכות נפתחות לפי האלבום</p></div>
    <div class="studio">${stadiumBG(true)}${avatarSVG('avatar')}</div>
    <div class="tabs">${LAYER_TABS.map(([k,l])=>`<button class="tab ${S.avTab===k?'on':''}" data-avtab="${k}">${l}</button>`).join('')}
      ${S.avTab!=='kit'&&S.avTab!=='boots'?`<button class="tab" data-equip="none">הסרה</button>`:''}</div>
    <div class="items">${items.map(it=>{
      const owned=S.owned.includes(it.id), on=S.eq[it.layer]===it.id;
      const locked=it.req&&!got(it.req);
      return `<button class="item ${on?'on':''} ${locked&&!owned?'locked':''}" data-item="${it.id}">
        ${locked&&!owned?'<span class="lockbadge">🔒</span>':''}
        ${itemThumb(it)}<span class="nm">${esc(it.name)}</span>
        <span class="pr ${owned?'owned':''}">${owned?(on?'לבוש':'ברשותך'):(locked?'נעול':(it.price?it.price+' ':'חינם')+(it.price?coinSVG(13):''))}</span>
      </button>`;}).join('')}</div>
    ${S.avTab==='kit'?'<p class="note">ערכה נפתחת לרכישה רק אחרי שאספתם את מדבקת הערכה המתאימה באלבום.</p>':''}`;
}
