import { App } from '@capacitor/app';
import { $, closeModal, modal, toast } from '../core/dom.js';
import { BY_ID } from '../data/cards.js';
import { GAME_START } from '../games/run.js';
import { MUT } from '../core/mut.js';
import { NAV_ICONS } from '../art/avatar.js';
import { PHOTO_CREDITS } from '../data/globals.js';
import { S, esc, save, today } from '../core/state.js';
import { albumBody, albumHeader, animateCoins, avatarView, gamesView, homeView, matchesModal, mountAlbumTabs, mountNewsCarousel, newsList, newsView, shopView, tasksView } from '../screens/index.js';
import { answerValue } from '../games/value.js';
import { buyItem, cardDetail, claimTask, downloadPhoto, openPack, packTap, playHighlight, recycleAll, shuffleAvatar, tapItem } from '../core/actions.js';
import { coinSVG } from '../art/cards.js';
import { confetti, sfx } from '../core/fx.js';
import { endTimer, payout } from '../games/shared.js';
import { flipMemory } from '../games/memory.js';
import { liveMatch, online, refreshFeed } from '../net/feed.js';
import { playRPS } from '../games/rps.js';
import { guessCup, shellStart } from '../games/shell.js';
import { playTTT } from '../games/ttt.js';
import { shirtKey } from '../games/shirt.js';
import { shootPenalty } from '../games/penalty.js';
import { mountReels, reelsView, toggleReelMute } from '../screens/reels.js';

/* ======================= RENDER ======================= */
/* בעמוד הבית: אם יש גם קלפי משחקים וגם טבלה, הם מוצגים לסירוגין —
   מתחלפים אוטומטית כל 10 שניות, ואפשר גם לגלול ימינה/שמאלה בין השתיים
   בכל רגע (מחזורי — גלילה מהאחרון חוזרת לראשון) */
function homeCarouselGoto(car,i){
  const pages=[...car.querySelectorAll('.hcPage')],dots=[...car.querySelectorAll('.hcDots span')];
  const n=pages.length;if(!n)return;
  const idx=((i%n)+n)%n;
  pages.forEach((p,k)=>p.classList.toggle('on',k===idx));
  dots.forEach((d,k)=>d.classList.toggle('on',k===idx));
  car.dataset.i=idx;
}
function startHomeCarousel(){
  const car=$('#homeCar');if(!car)return;
  if(car.querySelectorAll('.hcPage').length<2)return;
  car.dataset.i='0';
  const restart=()=>{
    if(MUT.homeTimer)clearInterval(MUT.homeTimer);
    MUT.homeTimer=setInterval(()=>homeCarouselGoto(car,(+car.dataset.i||0)+1),10000);
  };
  restart();
  /* setPointerCapture מבטיח שה-pointerup יגיע לאלמנט הזה גם אם האצבע
     סטתה מעט אנכית באמצע הגלילה — בלעדיו מגע אמיתי (בניגוד לעכבר) לרוב
     "מאבד" את היעד באמצע גרירה, וה-swipe פשוט לא קורה */
  let x0=null;
  car.addEventListener('pointerdown',e=>{x0=e.clientX;try{car.setPointerCapture(e.pointerId);}catch(err){}});
  const end=e=>{
    if(x0==null)return;
    const dx=e.clientX-x0;x0=null;
    if(Math.abs(dx)<40)return;
    homeCarouselGoto(car,(+car.dataset.i||0)+(dx<0?1:-1));
    restart();
  };
  car.addEventListener('pointerup',end);
  car.addEventListener('pointercancel',()=>{x0=null;});
}
/* כל 15 שניות בעמוד הבית: מעבירים לדמות כדור מצד אקראי, והיא בועטת אותו
   בחזרה לאותו כיוון שממנו הגיע */
function kickBallFX(){
  const ball=$('#ballKick'), av=document.querySelector('.hero .avatar');
  if(!ball||!av)return;
  const dir=Math.random()<0.5?1:-1;
  ball.style.setProperty('--dir',dir);
  ball.classList.remove('kick');av.classList.remove('kicking');
  void ball.offsetWidth;
  ball.classList.add('kick');av.classList.add('kicking');
  sfx('pop');
  setTimeout(()=>{ball.classList.remove('kick');av.classList.remove('kicking');},1650);
}
function startBallFX(){
  if(!$('#ballKick'))return;
  if(MUT.ballTimer)clearInterval(MUT.ballTimer);
  MUT.ballTimer=setInterval(kickBallFX,15000);
}
export function render(){
  if(MUT.homeTimer){clearInterval(MUT.homeTimer);MUT.homeTimer=null;}
  if(MUT.ballTimer){clearInterval(MUT.ballTimer);MUT.ballTimer=null;}
  if(MUT.reelObserver){MUT.reelObserver.disconnect();MUT.reelObserver=null;}
  if(MUT.albumScrollEl&&MUT.albumScrollHandler){MUT.albumScrollEl.removeEventListener('scroll',MUT.albumScrollHandler);MUT.albumScrollEl=null;MUT.albumScrollHandler=null;}
  if(MUT.newsCarObserver){MUT.newsCarObserver.disconnect();MUT.newsCarObserver=null;}
  if(S.screen==='album'){
    /* position:sticky לא באמת נצמד בכל WebView (נבדק ונכשל בפועל במכשיר),
       אז במקום זה הכותרת יוצאת לגמרי מהאזור הגלילה: #view הופך למיכל
       flex שאינו גולל בעצמו, עם הכותרת כפריט קבוע ואזור פנימי נפרד
       (.albumScroll) שהוא היחיד שגולל. זו הצמדה אמיתית, לא תלוית דפדפן */
    $('#view').classList.add('albumMode');
    $('#view').classList.remove('newsMode');
    $('#view').innerHTML=albumHeader()+`<div class="albumScroll"><div class="screen-in">${albumBody()}</div></div>`;
  }else if(S.screen==='news'){
    /* אותו עיקרון בדיוק כמו באלבום: פוסט אחד ממלא את כל המסך, בלי גלילת
       עמוד — רק הקרוסלה (אופקית) וחלונית הכיתוב (אנכית) גוללות בעצמן */
    $('#view').classList.add('newsMode');
    $('#view').classList.remove('albumMode');
    $('#view').innerHTML=newsView();
  }else{
    $('#view').classList.remove('albumMode');
    $('#view').classList.remove('newsMode');
    const v={home:homeView,shop:shopView,games:gamesView,avatar:avatarView,tasks:tasksView,reels:reelsView}[S.screen]||homeView;
    $('#view').innerHTML=`<div class="screen-in">${v()}</div>`;
  }
  $('#view').scrollTop=0;
  if(S.screen==='album'){const sc=$('.albumScroll');if(sc)sc.scrollTop=0;}
  $('#nav').innerHTML=['home','album','games','shop','news','reels'].map(k=>
    `<button data-nav="${k}" class="${S.screen===k?'on':''}">${NAV_ICONS[k]}</button>`).join('');
  animateCoins();
  if(S.screen==='home'){startHomeCarousel();startBallFX();}
  if(S.screen==='reels')mountReels();
  if(S.screen==='album')mountAlbumTabs();
  if(S.screen==='news')mountNewsCarousel();
}

document.addEventListener('click',e=>{
  const cel=e.target.closest('[data-cel]');
  if(cel&&!e.target.closest('button')){celebrate(cel);return;}
  const b=e.target.closest('button,[data-pk],[data-act]');if(!b)return;
  const d=b.dataset;
  if(d.nav){if(S.screen==='album')MUT.NEW_IDS=new Set();if(d.nav==='news')S.newsIdx=0;S.screen=d.nav;closeModal();endTimer();MUT.G=null;MUT.PK=null;return render();}
  if(d.newsnav){
    const total=newsList().length;
    if(d.newsnav==='prev')S.newsIdx=Math.max(0,(S.newsIdx||0)-1);
    if(d.newsnav==='next')S.newsIdx=Math.min(total-1,(S.newsIdx||0)+1);
    return render();
  }
  if(d.tab){
    if(S.screen==='album'){
      const sec=document.querySelector(`.albumCat[data-cat="${d.tab}"]`);
      if(sec){
        S.tab=d.tab;
        document.querySelectorAll('#albumTabs .tab').forEach(x=>x.classList.toggle('on',x===b));
        sec.scrollIntoView({behavior:'smooth',block:'start'});
        return;
      }
    }
    S.tab=d.tab;return render();
  }
  if(d.mt){
    const ids={up:'mUp',past:'mPast',table:'mTable',live:'mLive'};
    if(d.mt==='table'&&!S.stats.tableViewed){S.stats.tableViewed=true;save();}
    b.parentElement.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
    Object.entries(ids).forEach(([k,id])=>{const el=$('#'+id);if(el)el.style.display=k===d.mt?'':'none';});
    return;
  }
  if(d.avtab){S.avTab=d.avtab;return render();}
  if(d.equip==='none'){S.eq[S.avTab]=null;save();return render();}
  if(d.pk)return packTap(d.pk);
  if(d.buy)return buyItem(d.buy);
  if(d.item)return tapItem(d.item);
  if(d.card)return cardDetail(d.card);
  if(d.yt)return playHighlight(d.yt);
  if(d.dl)return downloadPhoto(d.dl);
  if(d.pack)return openPack(d.pack);
  if(d.claim)return claimTask(d.claim);
  if(d.read){if(!S.read.includes(d.read)){const amt=+d.readamt||10;S.read.push(d.read);S.coins+=amt;save();sfx('coin');render();toast('+'+amt+' מטבעות');}return;}
  if(d.game&&GAME_START[d.game]){
    if(!S.stats.playedGames.includes(d.game)){S.stats.playedGames.push(d.game);save();}
    return GAME_START[d.game]();
  }
  if(d.again&&GAME_START[d.again]){closeModal();return GAME_START[d.again]();}
  if(d.ttt!==undefined&&MUT.G)return playTTT(+d.ttt);
  if(d.num!==undefined&&MUT.G)return shirtKey(d.num);
  if(d.vs!==undefined&&MUT.G)return answerValue(+d.vs);
  if(d.rps&&MUT.G)return playRPS(d.rps);
  if(d.mem!==undefined&&MUT.G)return flipMemory(+d.mem);
  if(d.cup!==undefined&&MUT.G)return guessCup(+d.cup);
  if(d.cell!==undefined&&MUT.G)return shootPenalty(+d.cell);
  const a=d.act;
  if(a==='snd'){MUT.SND=!MUT.SND;if(MUT.SND)sfx('pop');return render();}
  if(a==='close')return closeModal();
  if(a==='quit')return payout((MUT.G&&MUT.G.coins)||0,'סיימת');
  if(a==='go-album'){S.screen='album';return render();}
  if(a==='go-shop'){S.screen='shop';return render();}
  if(a==='go-games'){S.screen='games';return render();}
  if(a==='go-avatar'){S.screen='avatar';return render();}
  if(a==='go-tasks'){S.screen='tasks';return render();}
  if(a==='matches'){
    matchesModal(d.mtab);
    if(MUT.liveTimer){clearInterval(MUT.liveTimer);MUT.liveTimer=null;}
    /* כדי שדקה/תוצאה יתעדכנו בזמן אמת בזמן שהמשתמש עוקב במודל: רענון
       מייד עם פתיחה, ואם יש משחק חי — פולינג קל כל עוד המודל פתוח
       (נעצר מרכזית ב-closeModal) */
    const refreshOpenModal=()=>{
      const box=$('#modal').querySelector('.mtabs');
      if(!box)return;
      const on=box.querySelector('button.on');
      matchesModal(on?on.dataset.mt:d.mtab);
      if(liveMatch()&&!MUT.liveTimer)MUT.liveTimer=setInterval(()=>refreshFeed(true).then(refreshOpenModal),20000);
    };
    refreshFeed(true).then(refreshOpenModal);
    return;
  }
  if(a==='credits')return creditsModal();
  if(a==='recycle')return recycleAll();
  if(a==='shuffle-avatar')return shuffleAvatar();
  if(d.reelmute!==undefined)return toggleReelMute(b);
  if(a==='daily')return dailyModal();
  if(a==='shell-start')return shellStart();
  if(a==='edit-name')return editNameModal();
});

export function creditsModal(){
  if(!PHOTO_CREDITS.length)
    return modal(`<div class="sheet"><div style="font-size:42px">&#128247;</div>
      <h2>עדיין אין תמונות</h2>
      <p>הגרסה הזו משתמשת באיורים שנוצרים בקוד. אחרי הרצת tools/fetch-photos.mjs
      ו-tools/embed-photos.mjs יופיעו כאן התמונות והקרדיטים לצלמים.</p>
      <button class="btn btn-ghost" data-act="close" style="width:100%">סגירה</button></div>`);
  modal(`<div class="sheet"><h2>קרדיטים לתמונות</h2>
    <p>התמונות מוויקישיתוף, ברישיון חופשי. תודה לצלמים:</p>
    <div style="text-align:start;max-height:46dvh;overflow-y:auto">
      ${PHOTO_CREDITS.map(x=>`<div class="kv"><span>${esc((BY_ID[x.id]||{}).name||x.id)}</span>
        <b style="font-size:11.5px;text-align:end">${esc(x.author)}<br><span style="color:#9FB8DA;font-weight:400">${esc(x.license)}</span></b></div>`).join('')}
    </div>
    <button class="btn btn-ghost" data-act="close" style="width:100%;margin-top:12px">סגירה</button></div>`);
}

export let CEL=0;
export function celebrate(el){
  if(el.dataset.busy)return;
  el.dataset.busy='1';
  CEL=CEL%3+1;
  el.classList.add('celebrating','cel-'+CEL);
  sfx('win');
  if(CEL===2)confetti(22);
  setTimeout(()=>{el.classList.remove('celebrating','cel-'+CEL);delete el.dataset.busy;},2050);
}

/* מתנה יומית: שבעה ימים עולים, ואחרי השביעי חוזרים ליום הראשון */
export const DAILY=[10,15,20,25,30,40,75];
export const dayBefore=()=>{const d=new Date();d.setDate(d.getDate()-1);return d.toISOString().slice(0,10);};
export function dailyState(){
  const t=today();
  if(S.claim===t)return {claimed:true,day:S.streak||1};
  let day=(S.claim===dayBefore()&&S.streak)?S.streak+1:1;
  if(day>7)day=1;                       /* אחרי היום השביעי מתחילים מחדש */
  return {claimed:false,day};
}
export function dailyModal(){
  const st=dailyState();
  const cells=DAILY.map((amt,i)=>{
    const d=i+1;
    const done=d<st.day||(d===st.day&&st.claimed);
    const active=d===st.day&&!st.claimed;
    return `<div class="dcell${done?' done':''}${active?' active':''}${d===7?' big':''}">
      <span class="dnum">יום ${d}</span>
      <span class="dico">${done?'<span class="tick">✓</span>':coinSVG(d===7?30:22)}</span>
      <span class="damt">${amt}</span></div>`;}).join('');

  const head=st.claimed
    ? `<h2>נתראה מחר</h2><p>אספת את מתנת יום ${st.day}. ${st.day===7?'מחר הרצף מתחיל מהתחלה.':'מחר מחכים לך '+DAILY[st.day]+' מטבעות.'}</p>`
    : `<h2>מתנה יומית</h2><p>${esc(S.name||'אלוף')}, יום ${st.day} ברצף — ${DAILY[st.day-1]} מטבעות</p>`;

  modal(`<div class="sheet"><div style="font-size:44px">${st.claimed?'✅':'🎁'}</div>
    ${head}
    <div class="dgrid">${cells}</div>
    ${st.claimed
      ? `<button class="btn btn-ghost" data-act="close" style="width:100%">סגירה</button>`
      : `<button class="btn btn-gold" id="claim" style="width:100%">איסוף ${DAILY[st.day-1]} מטבעות</button>`}
    </div>`);

  const btn=$('#claim');
  if(btn)btn.addEventListener('click',()=>{
    const cur=dailyState();
    if(cur.claimed)return;
    const amt=DAILY[cur.day-1];
    S.coins+=amt;S.streak=cur.day;S.claim=today();save();
    sfx(cur.day===7?'win':'coin');confetti(cur.day===7?46:26);
    render();toast('+'+amt+' מטבעות');
    dailyModal();
  });
}

export function editNameModal(){
  modal(`<div class="sheet"><div style="font-size:44px">&#9997;&#65039;</div>
    <h2>שינוי שם</h2><p>איך תרצו שנקרא לכם?</p>
    <input class="input" id="nm2" maxlength="20" value="${esc(S.name||'')}" placeholder="השם שלך" autocomplete="off">
    <button class="btn btn-gold" id="go2" style="width:100%">שמירה</button></div>`);
  const go=()=>{const v=$('#nm2').value.trim();if(!v)return $('#nm2').focus();
    S.name=v;save();closeModal();render();toast('השם עודכן');};
  $('#go2').addEventListener('click',go);
  $('#nm2').addEventListener('keydown',e=>{if(e.key==='Enter')go();});
  setTimeout(()=>{const el=$('#nm2');el.focus();el.select();},250);
}
export function onboarding(){
  modal(`<div class="sheet"><div style="font-size:50px">⚽</div>
    <h2>ברוכים הבאים לסטמפורד ברידג׳</h2><p>איך קוראים לך?</p>
    <input class="input" id="nm" maxlength="20" placeholder="השם שלך" autocomplete="off">
    <button class="btn btn-gold" id="go" style="width:100%">מתחילים לאסוף</button></div>`);
  const go=()=>{const v=$('#nm').value.trim();if(!v)return $('#nm').focus();
    S.name=v;S.coins=120;save();closeModal();render();setTimeout(dailyModal,400);};
  $('#go').addEventListener('click',go);
  $('#nm').addEventListener('keydown',e=>{if(e.key==='Enter')go();});
  setTimeout(()=>$('#nm').focus(),250);
}

render();
if(!S.name)onboarding();
else if(!dailyState().claimed)setTimeout(dailyModal,500);
refreshFeed();
if(typeof window!=='undefined'){window.addEventListener('online',()=>{refreshFeed(true);render();});
  window.addEventListener('offline',render);}

/* כפתור החזרה באנדרואיד: יוצא ממסך מלא (וידאו) או סוגר מודל במקום לצאת מהאפליקציה */
App.addListener('backButton',()=>{
  if(document.fullscreenElement){document.exitFullscreen();return;}
  if($('#modal').innerHTML.trim()){closeModal();return;}
  App.exitApp();
});
