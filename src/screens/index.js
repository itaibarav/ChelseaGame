import { $, modal, stickerHTML } from '../core/dom.js';
import { API_BASE, crestOf, lastMatch, liveMatch, liveMinute, matchDate, mediaUrl, nextMatch, ownCrest, standingsCrest, teamHe } from '../net/feed.js';
import { CARDS, CATS, GAMES, LAYER_TABS, MOCK_MATCH, MOCK_POSTS, PACKS, TOTAL, byLayer } from '../data/cards.js';
import { TASKS } from '../data/tasks.js';
import { MUT } from '../core/mut.js';
import { S, esc, got, itemLocked, save, today } from '../core/state.js';
import { avatarSVG, itemThumb } from '../art/avatar.js';
import { ballImgSrc } from '../art/ball.js';
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

/* שלוש שורות מהטבלה סביב צ'לסי: קבוצה לפני + צ'לסי + קבוצה אחרי.
   אם צ'לסי ראשונה או אחרונה בטבלה — שתי קבוצות מהצד הפנוי במקום אחת */
/* סופר רק מדבקות ששייכות לקלף קיים בפועל — S.inv עלול להכיל רשומות
   "יתומות" מקלפים שהוסרו/שונו במיזוגים קודמים של האלבום, שאף פעם לא
   נספרות בצ'יפים של קטגוריה בודדת (אלה תמיד עוברות דרך CARDS.filter),
   אבל היו מנופחות את הסכום הכולל אם היו נספרות ישירות מ-S.inv */
export const collected=()=>CARDS.filter(c=>got(c.id)).length;

export function chelseaNeighbors(T){
  const idx=T.findIndex(r=>r.own);
  if(idx<0)return[];
  let start,end;
  if(idx===0){start=0;end=Math.min(T.length,3);}
  else if(idx===T.length-1){start=Math.max(0,T.length-3);end=T.length;}
  else{start=idx-1;end=idx+2;}
  return T.slice(start,end);
}

export function homeView(){
  const c=collected(),pct=Math.round(c/TOTAL*100);
  return hud()+`
  <div class="hero">${stadiumBG(false)}
    <div class="who">היי ${esc(S.name||'אלוף')} &#128075;</div>${avatarSVG()}
    <img class="ballKick" id="ballKick" src="${ballImgSrc()}" alt="">
  </div>
  <div class="hero-row">
    <button class="btn btn-ghost" data-act="go-avatar">&#128085; התאם אוואטר</button>
    <button class="btn btn-blue progress-btn" data-act="go-album">
      <div class="fill" style="width:${pct}%"></div><span>&#128214; אלבום ${c}/${TOTAL}</span></button>
  </div>
  ${(()=>{
    const matchesHTML=(()=>{const lm=liveMatch();
      const liveHTML=lm?`<div class="card match live" data-act="matches" data-mtab="live">
        <div class="side">${ownCrest()}<small>צ׳לסי</small></div>
        <div class="mid"><div class="t livebadge">&#128308; ${lm.status==='PAUSED'?'הפסקה':liveMinute(lm)+"'"}</div>
          <b class="sc live">${esc(lm.score||'0-0')}</b>
          <div class="d">${lm.status==='PAUSED'?'הפסקה':'המשחק בעיצומו'}</div></div>
        <div class="side">${crestOf(lm)}<small>${esc(teamHe(lm.opponent))}</small></div></div>`:'';
      const nextHTML=lm?'':(()=>{const m=nextMatch();
        if(!m)return `<div class="card match" data-act="matches" data-mtab="up">
          <div class="side">${crestSVG('#034694','#FFC83D','C')}<small>${MOCK_MATCH.home}</small></div>
          <div class="mid"><div class="t">המשחק הבא:</div><div class="d">${MOCK_MATCH.when}</div>
            <span class="chip">${API_BASE?'ממתין לשרת':'נתוני דוגמה'}</span></div>
          <div class="side">${crestSVG('#C8102E','#FFFFFF','A')}<small>${MOCK_MATCH.away}</small></div></div>`;
        return `<div class="card match" data-act="matches" data-mtab="up">
          <div class="side">${ownCrest()}<small>צ׳לסי</small></div>
          <div class="mid"><div class="t">המשחק הבא:</div>
            <div class="d">${matchDate(m.date)}</div>
            <span class="chip">${m.homeAway==='H'?'בבית':'בחוץ'}</span></div>
          <div class="side">${crestOf(m)}<small>${esc(teamHe(m.opponent))}</small></div></div>`;})();
      const lastHTML=(()=>{const m=lastMatch();
        if(!m)return '';
        return `<div class="card match" data-act="matches" data-mtab="past">
          <div class="side">${ownCrest()}<small>צ׳לסי</small></div>
          <div class="mid"><div class="t">התוצאה האחרונה:</div>
            <b class="sc ${m.result==='W'?'w':m.result==='L'?'l':'d'}">${esc(m.score||'')}</b>
            <div class="d">${matchDate(m.date)}</div></div>
          <div class="side">${crestOf(m)}<small>${esc(teamHe(m.opponent))}</small></div></div>`;})();
      return liveHTML+nextHTML+lastHTML;
    })();
    const tableHTML=(()=>{const rows=chelseaNeighbors(S.standings||[]);
      if(!rows.length)return'';
      return `<div class="card table" data-act="matches" data-mtab="table">
        <div class="tblHead">טבלה</div>
        <div class="mrow standing mini head"><span class="pos">מקום</span><div class="mo"><span>קבוצה</span></div><b class="pts">נק'</b></div>
        ${rows.map(r=>`<div class="mrow standing mini ${r.own?'own':''}">
          <span class="pos">${r.position}</span>
          <div class="mo">${standingsCrest(r)}<span>${esc(teamHe(r.team))}</span></div>
          <b class="pts">${r.points}</b></div>`).join('')}
        <button class="tblMore" data-act="matches" data-mtab="table">לטבלה המלאה &laquo;</button>
      </div>`;})();
    if(!tableHTML)return matchesHTML;
    return `<div class="homeCarousel" id="homeCar">
      <div class="hcPage on" data-hc="0">${matchesHTML}</div>
      <div class="hcPage" data-hc="1">${tableHTML}</div>
      <div class="hcDots"><span class="on"></span><span></span></div>
    </div>`;
  })()}
  <div class="tiles">
    <button class="tile tile-gold" data-act="go-shop"><div style="font-size:34px">&#127873;</div><div class="lbl">חנות מעטפות</div></button>
    <button class="tile tile-blue" data-act="go-games"><div style="font-size:34px">&#127918;</div><div class="lbl">הרוויחו מטבעות<br>10 משחקים</div></button>
  </div>
  <div class="hero-row">
    <button class="btn btn-gold" style="width:100%;position:relative" data-act="go-tasks">&#127942; משימות · ${S.claimedTasks.length}/${TASKS.length}
      ${TASKS.some(t=>!S.claimedTasks.includes(t.id)&&t.check())?'<span class="dot">!</span>':''}</button>
  </div>
  <p class="note">כל האיורים נוצרים בקוד (SVG). לוח המשחקים מציג נתוני דוגמה עד שנחבר מקור נתונים.</p>`;
}

export function tasksView(){
  const done=S.claimedTasks.length,total=TASKS.length,pct=Math.round(done/total*100);
  const ready=[],locked=[],completed=[];
  TASKS.forEach(t=>{
    if(S.claimedTasks.includes(t.id))completed.push(t);
    else if(t.check())ready.push(t);
    else locked.push(t);
  });
  const row=(t,claimed)=>`<div class="pack ${claimed?'done':''}">
    <div class="txt"><b>${esc(t.label)}</b><small>פרס: ${t.reward} מטבעות</small></div>
    ${claimed?'<span class="chip">&#9989; נאסף</span>'
      :ready.includes(t)?`<button class="buy" data-claim="${t.id}">איסוף ${coinSVG(15)}</button>`
      :'<span class="chip">&#128274; נעול</span>'}
  </div>`;
  return hud()+`<div class="head"><h1>משימות</h1><p>השלימו משימות במשחקים וקבלו מטבעות</p></div>
    <div class="hero-row">
      <div class="btn btn-blue progress-btn" style="width:100%">
        <div class="fill" style="width:${pct}%"></div><span>&#127942; ${done}/${total} משימות הושלמו</span></div>
    </div>
    <div class="packs">${ready.map(t=>row(t,false)).join('')}${locked.map(t=>row(t,false)).join('')}</div>
    ${completed.length?`<div class="head" style="padding-top:6px"><h1 style="font-size:19px">&#128081; משימות שהושלמו</h1></div>
    <div class="packs">${completed.map(t=>row(t,true)).join('')}</div>`:''}`;
}

export function albumHeader(){
  return `<div class="albumSticky">
    ${hud()}
    <div class="head"><h1>האלבום שלי</h1><p>${collected()} מתוך ${TOTAL} מדבקות נאספו</p></div>
    <div class="tabs alltabs" id="albumTabs">${CATS.map(([k,l])=>{const n=CARDS.filter(c=>c.cat===k),o=n.filter(c=>got(c.id)).length;
      return `<button class="tab ${S.tab===k?'on':''}" data-tab="${k}">${l} <span class="cnt">${o}/${n.length}</span></button>`;}).join('')}</div>
    </div>`;
}
export function albumBody(){
  return `${CATS.map(([k,l])=>{
      const list=CARDS.filter(c=>c.cat===k);
      const note=k==='cat5'?'<p class="note">ניתן להוריד את התמונות ולהשתמש בהן כרקע לטלפון</p>'
        :(k==='legend'||k==='cat2')?'<p class="note">אפשר ללחוץ על קלף כדי לצפות בסרטון ההיילייטס שלו &#127909;</p>'
        :'';
      return `<div class="albumCat" data-cat="${k}">
        <h2 class="catHead">${l}</h2>
        ${note}
        <div class="grid">${list.map(stickerHTML).join('')}</div>
        ${list.every(c=>!got(c.id))?'<p class="note">אין עדיין מדבקות בעמוד הזה. פתחו מעטפה בחנות.</p>':''}
      </div>`;
    }).join('')}
    <div style="padding:0 var(--pad) 26px"><button class="btn btn-ghost" style="width:100%" data-act="credits">
      &#128247; קרדיטים לתמונות</button></div>`;
}
/* עוקבים אחר הקטגוריה שגלושה כרגע לתוך התצוגה, כדי שהצ'יפ הדביק למעלה
   יראה איפה נמצאים — עם סף/שוליים רחבים כך שהעדכון לא "מרצד" מהר מדי */
export function mountAlbumTabs(){
  const wrap=$('#albumTabs'),scroller=$('.albumScroll');
  if(MUT.albumObserver){MUT.albumObserver.disconnect();MUT.albumObserver=null;}
  if(!wrap||!scroller)return;
  const sections=[...document.querySelectorAll('.albumCat')];
  if(!sections.length)return;
  /* הכותרת יושבת כפריט flex קבוע מחוץ ל-.albumScroll (ראו albumMode ב-CSS),
     כך שהיא לא חופפת את התוכן — אין צורך בקיזוז גובה כלשהו כאן */
  const setActive=k=>{
    if(S.tab===k)return;
    S.tab=k;
    wrap.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.tab===k));
    /* מוצמד לצד ימין (inline:'start' בכיוון rtl) — כשמגיעים לסוף הרשימה
       הדפדפן עוצר בגבול הגלילה בפועל ולא משאיר שטח ריק מעבר לתוכן */
    const btn=wrap.querySelector(`.tab[data-tab="${k}"]`);
    if(btn)btn.scrollIntoView({inline:'start',block:'nearest',behavior:'smooth'});
  };
  /* IntersectionObserver מדווח בכל קריאה רק על הסקציות שחצו סף מאז הבדיקה
     הקודמת — לא על כל הסקציות הנצפות כרגע. הבאג היה שהבחירה ב"הכי נראית"
     הסתמכה רק על המנה הזו: סקציה שכבר חצתה סף ונשארת יציבה (כמו "אגדות"
     ו"גביעים", ששכנות לסקציות קצרות שחוצות ספים הרבה יותר) פשוט לא
     מופיעה יותר בקריאות הבאות, ולכן אף פעם לא "מנצחת" שוב גם כשהיא בפועל
     הכי נראית על המסך. פותרים בשמירת מפה של כל היחסים הידועים, ומחשבים
     את הסקציה הכי נראית מתוך המפה המלאה בכל קריאה */
  const ratios=new Map();
  const io=new IntersectionObserver(entries=>{
    entries.forEach(en=>ratios.set(en.target,en.isIntersecting?en.intersectionRatio:0));
    let best=null,bestRatio=0;
    ratios.forEach((r,el)=>{if(r>bestRatio){bestRatio=r;best=el;}});
    if(best)setActive(best.dataset.cat);
  },{root:scroller,threshold:[0.25,0.5,0.75],rootMargin:'0px 0px -55% 0px'});
  sections.forEach(s=>io.observe(s));
  MUT.albumObserver=io;
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
    <p class="note">כל עשרת המשחקונים פעילים.</p>`;
}

/* רשימת הפוסטים בפועל (אמיתיים מהשרת, או תוכן לדוגמה כשאין עדיין חיבור) —
   פונקציה משותפת כדי ש-router.js יוכל לחשב גבולות ניווט (קודם/הבא) בלי
   לשכפל את לוגיקת ה-fallback */
export const newsList=()=>{
  const posts=(S.news&&S.news.length)?S.news:null;
  return posts||MOCK_POSTS.map(p=>({id:p.id,caption:p.txt,images:[],emoji:p.emoji}));
};
export function newsView(){
  const list=newsList();
  const total=list.length;
  const idx=Math.min(Math.max(S.newsIdx||0,0),Math.max(total-1,0));
  S.newsIdx=idx;
  const p=list[idx]||{};
  const done=S.read.includes(p.id);
  const images=(p.images&&p.images.length)?p.images:null;
  const slides=images
    ? images.map(src=>`<div class="newsSlide"><img src="${mediaUrl(src)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'phEmoji',textContent:'📰'}))"></div>`).join('')
    : `<div class="newsSlide"><div class="phEmoji">${p.emoji||'📰'}</div></div>`;
  const dots=images&&images.length>1?`<div class="newsDots">${images.map((_,i)=>`<span class="${i===0?'on':''}"></span>`).join('')}</div>`:'';
  /* פוסט ארוך (מעל 1,000 תווים) שווה יותר בלחיצת "קראתי" — עידוד לקרוא
     כיתובים ארוכים ולא רק לדלג עליהם */
  const reward=(p.caption||'').length>1000?25:10;
  return `<div class="newsChrome">
      ${hud()}
      <div class="newsHead">
        <button class="newsNavBtn" data-newsnav="prev" ${idx<=0?'disabled':''}>&#8250; קודם</button>
        <div class="newsTitle"><h1>חדשות צ'לסי</h1><span class="newsCount">${total?idx+1:0} / ${total}</span></div>
        <button class="newsNavBtn" data-newsnav="next" ${idx>=total-1?'disabled':''}>הבא &#8249;</button>
      </div>
    </div>
    <div class="newsBody">
      <div class="newsCarousel" id="newsCar">${slides}${dots}</div>
      <div class="newsCaption"><p>${esc(p.caption||'')}</p></div>
      <button class="readbtn newsReadBtn ${done?'done':''}" ${done||!p.id?'':`data-read="${p.id}" data-readamt="${reward}"`}>${done?'✅ נקרא':`קראתי ✅ — ${reward} מטבעות`}</button>
    </div>`;
}
/* עוקבים אחרי איזו תמונה בקרוסלה גלושה כרגע לתוך התצוגה, כדי לעדכן את
   הנקודה הפעילה — אותה טכניקה בדיוק כמו בסרגל הקטגוריות באלבום */
export function mountNewsCarousel(){
  const car=$('#newsCar');
  if(MUT.newsCarObserver){MUT.newsCarObserver.disconnect();MUT.newsCarObserver=null;}
  if(!car)return;
  const slides=[...car.querySelectorAll('.newsSlide')],dots=[...car.querySelectorAll('.newsDots span')];
  if(slides.length<2||!dots.length)return;
  const io=new IntersectionObserver(entries=>{
    let best=null;
    entries.forEach(en=>{if(en.isIntersecting&&(!best||en.intersectionRatio>best.intersectionRatio))best=en;});
    if(!best)return;
    const i=slides.indexOf(best.target);
    dots.forEach((d,k)=>d.classList.toggle('on',k===i));
  },{root:car,threshold:[0.5]});
  slides.forEach(s=>io.observe(s));
  MUT.newsCarObserver=io;
}

export function matchesModal(initial){
  const lm=liveMatch();
  const tab=['up','past','table','live'].includes(initial)?initial:(lm?'live':'up');
  if(tab==='table'&&!S.stats.tableViewed){S.stats.tableViewed=true;save();}
  const M=S.matches||{past:[],upcoming:[]};
  const T=S.standings||[];
  if(!lm&&!M.past.length&&!M.upcoming.length&&!T.length)
    return modal(`<div class="sheet"><div style="font-size:42px">📅</div>
      <h2>לוח המשחקים ריק</h2>
      <p>${API_BASE?'השרת לא החזיר משחקים. בדוק שמפתח ה-API מוגדר.':'צריך לחבר את האפליקציה לשרת כדי למשוך משחקים.'}</p>
      <button class="btn btn-ghost" data-act="close" style="width:100%">סגירה</button></div>`);
  const row=m=>`<div class="mrow">
      <div class="mo">${crestOf(m)}<span>${esc(teamHe(m.opponent))}</span></div>
      <div class="mc">${m.score?`<b class="sc ${m.result==='W'?'w':m.result==='L'?'l':'d'}">${m.score}</b>`
                              :`<span class="vs">${matchDate(m.date)}</span>`}</div>
      <div class="mh">${m.homeAway==='H'?'בית':'חוץ'}</div></div>`;
  const stRow=r=>`<div class="mrow standing ${r.own?'own':''}">
      <span class="pos">${r.position}</span>
      <div class="mo">${standingsCrest(r)}<span>${esc(teamHe(r.team))}</span></div>
      <span class="pld">${r.played}</span>
      <span class="gd">${r.goalDifference>0?'+':''}${r.goalDifference}</span>
      <b class="pts">${r.points}</b></div>`;
  /* אין ב-API (בשכבה החינמית) שמות כובשים או דקת משחק אמיתית — מציגים
     דקה משוערת (liveMinute) ומבהירים שכובשים לא זמינים, במקום להמציא נתון */
  const liveBox=lm=>`<div class="liveBox">
      <div class="liveClock">${lm.status==='PAUSED'?'&#9208; הפסקה':'&#9917; '+(liveMinute(lm)>=90?"90'+":liveMinute(lm)+"'")}</div>
      <div class="liveScoreRow">
        <div class="side">${ownCrest()}<span>צ׳לסי</span></div>
        <b class="sc live big">${esc(lm.score||'0-0')}</b>
        <div class="side">${crestOf(lm)}<span>${esc(teamHe(lm.opponent))}</span></div>
      </div>
      <div class="d" style="text-align:center">${lm.homeAway==='H'?'משחק בית':'משחק חוץ'}${lm.competition?' · '+esc(lm.competition):''}</div>
      <p class="note">הדקה משוערת לפי שעת ההתחלה. שמות הכובשים לא זמינים דרך מקור הנתונים הנוכחי. הציון מתעדכן אוטומטית כל כמה שניות.</p>
    </div>`;
  modal(`<div class="sheet game"><h2 style="margin:2px 0 8px">לוח המשחקים</h2>
    <div class="mtabs${lm?' live4':''}">
      ${lm?`<button class="${tab==='live'?'on':''}" data-mt="live">&#128308; חי</button>`:''}
      <button class="${tab==='up'?'on':''}" data-mt="up">הבאים</button>
      <button class="${tab==='past'?'on':''}" data-mt="past">תוצאות</button>
      <button class="${tab==='table'?'on':''}" data-mt="table">טבלה</button></div>
    ${lm?`<div class="mlist" id="mLive" style="display:${tab==='live'?'':'none'}">${liveBox(lm)}</div>`:''}
    <div class="mlist" id="mUp" style="display:${tab==='up'?'':'none'}">${M.upcoming.map(row).join('')||'<p class="note">אין משחקים קרובים</p>'}</div>
    <div class="mlist" id="mPast" style="display:${tab==='past'?'':'none'}">${M.past.map(row).join('')||'<p class="note">אין תוצאות</p>'}</div>
    <div class="mlist" id="mTable" style="display:${tab==='table'?'':'none'}">
      ${T.length?`<div class="mrow standing head"><span class="pos">#</span><div class="mo"><span>קבוצה</span></div>
        <span class="pld">מש'</span><span class="gd">הפרש</span><b class="pts">נק'</b></div>`:''}
      ${T.map(stRow).join('')||'<p class="note">אין נתוני טבלה</p>'}</div>
    <button class="btn btn-ghost" data-act="close" style="width:100%;margin-top:10px">סגירה</button></div>`);
}

export function avatarView(){
  const items=byLayer(S.avTab);
  return hud()+`<div class="head"><h1>הלוקר שלי</h1><p>הרכיבו את הדמות — מדים נפתחים לפי האלבום</p></div>
    <div style="padding:0 var(--pad)"><button class="btn btn-ghost" style="width:100%" data-act="edit-name">
      &#9997;&#65039; ${esc(S.name||'אלוף')} <span style="opacity:.6;font-size:12px">(שינוי שם)</span></button></div>
    <div class="studio">${stadiumBG(true)}${avatarSVG('avatar')}</div>
    <div class="tabs">${LAYER_TABS.map(([k,l])=>`<button class="tab ${S.avTab===k?'on':''}" data-avtab="${k}">${l}</button>`).join('')}</div>
    <button class="btn btn-ghost" data-act="shuffle-avatar" style="width:100%;margin:2px 0 10px">🎲 הרכבה אקראית</button>
    <div class="items">${(S.avTab==='hat'||S.avTab==='scarf')?`<button class="item ${!S.eq[S.avTab]?'on':''}" data-equip="none">
        <svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="20" fill="none" stroke="#8FA3C0" stroke-width="4"/><line x1="16" y1="44" x2="44" y2="16" stroke="#8FA3C0" stroke-width="4"/></svg>
        <span class="nm">בלי</span><span class="pr">—</span></button>`:''}${items.map(it=>{
      const owned=S.owned.includes(it.id), on=S.eq[it.layer]===it.id;
      const locked=itemLocked(it);
      const lockLabel=it.reqDist?`${it.reqDist} מ׳`:'נעול';
      return `<button class="item ${on?'on':''} ${locked&&!owned?'locked':''}" data-item="${it.id}">
        ${locked&&!owned?'<span class="lockbadge">🔒</span>':''}
        ${itemThumb(it)}<span class="nm">${esc(it.name)}</span>
        <span class="pr ${owned?'owned':''}">${owned?(on?'לבוש':'ברשותך'):(locked?lockLabel:(it.price?it.price+' ':'חינם')+(it.price?coinSVG(13):''))}</span>
      </button>`;}).join('')}</div>
    ${S.avTab==='kit'?'<p class="note">מדים נפתחים לרכישה רק אחרי שאספתם את מדבקת המדים המתאימה באלבום.</p>':''}
    ${S.avTab==='boots'?'<p class="note">נעליים נפתחות לפי השיא שלכם במשחק "ריצת סטמפורד" — כל 300 מ׳ פותחים זוג חדש.</p>':''}`;
}
