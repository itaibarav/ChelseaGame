import { App } from '@capacitor/app';
import { $, closeModal, modal, toast } from '../core/dom.js';
import { BY_ID } from '../data/cards.js';
import { GAME_START } from '../games/run.js';
import { MUT } from '../core/mut.js';
import { NAV_ICONS } from '../art/avatar.js';
import { PHOTO_CREDITS } from '../data/globals.js';
import { S, esc, save, today } from '../core/state.js';
import { albumView, animateCoins, avatarView, gamesView, homeView, matchesModal, newsView, shopView } from '../screens/index.js';
import { answerValue } from '../games/value.js';
import { buyItem, cardDetail, openPack, packTap, playHighlight, recycleAll, tapItem } from '../core/actions.js';
import { coinSVG } from '../art/cards.js';
import { confetti, sfx } from '../core/fx.js';
import { endTimer, payout } from '../games/shared.js';
import { flipMemory } from '../games/memory.js';
import { online, refreshFeed } from '../net/feed.js';
import { playRPS } from '../games/rps.js';
import { playTTT } from '../games/ttt.js';
import { shirtKey } from '../games/shirt.js';
import { shootPenalty } from '../games/penalty.js';

/* ======================= RENDER ======================= */
export function render(){
  const v={home:homeView,album:albumView,shop:shopView,games:gamesView,news:newsView,avatar:avatarView}[S.screen]||homeView;
  $('#view').innerHTML=`<div class="screen-in">${v()}</div>`;
  $('#view').scrollTop=0;
  $('#nav').innerHTML=['home','album','games','shop','news'].map(k=>
    `<button data-nav="${k}" class="${S.screen===k?'on':''}">${NAV_ICONS[k]}</button>`).join('');
  animateCoins();
}

document.addEventListener('click',e=>{
  const cel=e.target.closest('[data-cel]');
  if(cel&&!e.target.closest('button')){celebrate(cel);return;}
  const b=e.target.closest('button,[data-pk],[data-act]');if(!b)return;
  const d=b.dataset;
  if(d.nav){if(S.screen==='album')MUT.NEW_IDS=new Set();S.screen=d.nav;closeModal();endTimer();MUT.G=null;MUT.PK=null;return render();}
  if(d.tab){S.tab=d.tab;return render();}
  if(d.mt){
    const up=d.mt==='up';
    b.parentElement.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
    $('#mUp').style.display=up?'':'none';
    $('#mPast').style.display=up?'none':'';
    return;
  }
  if(d.avtab){S.avTab=d.avtab;return render();}
  if(d.equip==='none'){S.eq[S.avTab]=null;save();return render();}
  if(d.pk)return packTap(d.pk);
  if(d.buy)return buyItem(d.buy);
  if(d.item)return tapItem(d.item);
  if(d.card)return cardDetail(d.card);
  if(d.yt)return playHighlight(d.yt);
  if(d.pack)return openPack(d.pack);
  if(d.read){if(!S.read.includes(d.read)){S.read.push(d.read);S.coins+=10;save();sfx('coin');render();toast('+10 מטבעות');}return;}
  if(d.game&&GAME_START[d.game])return GAME_START[d.game]();
  if(d.again&&GAME_START[d.again]){closeModal();return GAME_START[d.again]();}
  if(d.ttt!==undefined&&MUT.G)return playTTT(+d.ttt);
  if(d.num!==undefined&&MUT.G)return shirtKey(d.num);
  if(d.vs!==undefined&&MUT.G)return answerValue(+d.vs);
  if(d.rps&&MUT.G)return playRPS(d.rps);
  if(d.mem!==undefined&&MUT.G)return flipMemory(+d.mem);
  if(d.cell!==undefined&&MUT.G)return shootPenalty(+d.cell);
  const a=d.act;
  if(a==='snd'){MUT.SND=!MUT.SND;if(MUT.SND)sfx('pop');return render();}
  if(a==='close')return closeModal();
  if(a==='quit')return payout((MUT.G&&MUT.G.coins)||0,'סיימת');
  if(a==='go-album'){S.screen='album';return render();}
  if(a==='go-shop'){S.screen='shop';return render();}
  if(a==='go-games'){S.screen='games';return render();}
  if(a==='go-avatar'){S.screen='avatar';return render();}
  if(a==='matches')return matchesModal();
  if(a==='credits')return creditsModal();
  if(a==='recycle')return recycleAll();
  if(a==='daily')return dailyModal();
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
refreshFeed();
if(typeof window!=='undefined'){window.addEventListener('online',()=>{refreshFeed(true);render();});
  window.addEventListener('offline',render);}

/* כפתור החזרה באנדרואיד: יוצא ממסך מלא (וידאו) או סוגר מודל במקום לצאת מהאפליקציה */
App.addListener('backButton',()=>{
  if(document.fullscreenElement){document.exitFullscreen();return;}
  if($('#modal').innerHTML.trim()){closeModal();return;}
  App.exitApp();
});
