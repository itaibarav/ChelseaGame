import { $, modal } from '../core/dom.js';
import { clubBadge } from '../art/cards.js';
import { GA } from '../games/assets.js';
import { MUT } from '../core/mut.js';
import { confetti, sfx } from '../core/fx.js';
import { payout } from '../games/shared.js';
import { S, save, shuffle } from '../core/state.js';

/* ======================= 10. ריס ג'יימס מערבב =======================
   משחק "מצא את הגביע": שלושה כוסות כחולים, אריה מתחת לאחד וX מתחת לשניים.
   ריס מערבב אותם ~6 שניות, והשחקן מנחש איפה האריה. ניצחון מזכה ב-15
   מטבעות, ומרצף שלוש ניצחונות ברציפות עולה ל-25. הפסד מסיים את המשחק
   ומשלם את מה שנצבר. */
const jamesFig=GA.reece?`<img src="${GA.reece}" alt="">`:'🦁';

export const cupSVG=`<svg viewBox="0 0 60 60">
  <ellipse cx="30" cy="55" rx="19" ry="3.5" fill="rgba(0,0,0,.28)"/>
  <path d="M13 51 L19 15 a11 5 0 0 1 22 0 L47 51 a17 6 0 0 1 -34 0z" fill="#0E52AC" stroke="#062B63" stroke-width="2"/>
  <path d="M17 46 q13 7 26 0" stroke="#1E6BE6" stroke-width="3" fill="none" opacity=".55"/>
  <ellipse cx="30" cy="15" rx="11" ry="4.5" fill="#1E6BE6" stroke="#062B63" stroke-width="2"/>
  <path d="M19 26 q11 6 22 0" stroke="#FFC83D" stroke-width="2.2" fill="none" opacity=".85"/>
</svg>`;
const xSVG=`<svg viewBox="0 0 60 60"><g stroke="#FF6B6B" stroke-width="7" stroke-linecap="round">
  <path d="M18 18 L42 42"/><path d="M42 18 L18 42"/></g></svg>`;
const lionSVG=`<svg viewBox="0 0 60 60">${clubBadge(30,30,18)}</svg>`;

/* קושי עולה עם הרצף: סיבוב 1-2 קל (15 מטבעות), 3-4 בינוני (25),
   מסיבוב 5 ואילך הכי קשה — אבל עדיין הוגן לילד — ותמיד 50 מטבעות. */
const winAmt=streak=>streak>=5?50:streak>=3?25:15;
function shellDifficulty(round){
  if(round>=5)return{swaps:13,interval:420,label:'קשה',cls:'hard'};
  if(round>=3)return{swaps:10,interval:520,label:'בינוני',cls:'mid'};
  return{swaps:8,interval:650,label:'קל',cls:'easy'};
}

/* תגובת ריס: 'mixing' נעה כל עוד הוא מערבב, 'win'/'lose' לרגע אחרי הניחוש */
function shellReact(mood,ms){
  const f=$('#shFig');if(!f)return;
  f.classList.remove('win','lose');void f.offsetWidth;
  f.classList.add(mood);
  if(ms)setTimeout(()=>f&&f.classList.remove(mood),ms);
}

export function startShellGame(){
  MUT.G={k:'shell',streak:0,coins:0,round:1,order:shuffle([0,1,2]),busy:true};
  renderIntro();
}

/* לחיצה על "התחלה" במסך הפתיחה — מתחילה את סבב הערבוב הראשון */
export function shellStart(){
  if(!MUT.G||MUT.G.k!=='shell')return;
  renderReveal();
}

/* MUT.G.order[slot] = איזו זהות (0=אריה,1/2=X) נמצאת כרגע באיזה מיקום על המסך.
   כל עמודת DOM שייכת לזהות קבועה (התוכן שלה לא זז), וה-transform שלה
   מזיז אותה למיקום ה-slot הנוכחי שלה — בדיוק כמו כוס אמיתית שזזה על השולחן. */
function slotOf(identity){return MUT.G.order.indexOf(identity);}
function cupsHTML(closed){
  return [0,1,2].map(identity=>{
    const content=identity===0?lionSVG:xSVG;
    return `<div class="shCol" id="shCol${identity}" style="transform:translateX(${(slotOf(identity)-1)*72}px)">
      <div class="shContent">${content}</div>
      <button class="shCup" data-cup="${identity}" ${closed?'disabled':''}>${cupSVG}</button></div>`;
  }).join('');
}
const stageHTML=closed=>`<div class="shStage"><div class="shTable"></div>
  <div class="shCups" id="shCups">${cupsHTML(closed)}</div></div>`;

function renderIntro(){
  const diff=shellDifficulty(MUT.G.round);
  modal(`<div class="sheet game">
    <div class="ghud"><span>סיבוב ${MUT.G.round}</span><span class="lvl ${diff.cls}">רמה ${diff.label}</span><span>${MUT.G.coins} 🪙</span></div>
    <h2 style="margin:2px 0 6px;font-size:21px">ריס ג'יימס מערבב</h2>
    <div class="shArena"><div class="shFig" id="shFig">${jamesFig}</div></div>
    <p style="min-height:22px;margin:8px 0">ריס עומד ליד השולחן — האריה מתחת לאחת הכוסות. עקבו אחריו בעיניים!</p>
    ${stageHTML(true)}
    <button class="btn btn-gold" data-act="shell-start" style="width:100%;margin-top:10px">התחלה</button>
    <button class="btn btn-ghost" data-act="quit" style="width:100%;margin-top:8px">ביטול</button></div>`,{closable:false});
}

function frame(hint){
  const diff=shellDifficulty(MUT.G.round);
  return `<div class="sheet game">
    <div class="ghud"><span>סיבוב ${MUT.G.round}</span><span class="lvl ${diff.cls}">רמה ${diff.label}</span><span>${MUT.G.coins} 🪙</span></div>
    <h2 style="margin:2px 0 6px;font-size:21px">ריס ג'יימס מערבב</h2>
    <div class="shArena"><div class="shFig" id="shFig">${jamesFig}</div></div>
    <p id="shHint" style="min-height:22px;margin:8px 0">${hint}</p>
    ${stageHTML(false)}
    <button class="btn btn-ghost" data-act="quit" style="width:100%;margin-top:10px">פרישה עם המטבעות</button></div>`;
}

function renderReveal(){
  const diff=shellDifficulty(MUT.G.round);
  MUT.G.diff=diff;
  modal(frame('שימו לב — האריה שם! 👀'),{closable:false});
  $('#shCups').classList.add('open');
  setTimeout(()=>{
    if(!MUT.G||MUT.G.k!=='shell')return;
    $('#shCups').classList.remove('open');
    $('#shHint').textContent='ריס מערבב את הכוסות…';
    const f=$('#shFig');if(f)f.classList.add('mixing');
    setTimeout(shuffleStep,500,MUT.G.diff.swaps);
  },1500);
}

function shuffleStep(left){
  if(!MUT.G||MUT.G.k!=='shell')return;
  if(!left){
    MUT.G.busy=false;$('#shHint').textContent='איפה האריה?';
    const f=$('#shFig');if(f)f.classList.remove('mixing');
    return;
  }
  const [slotA,slotB]=shuffle([0,1,2]).slice(0,2);
  const idA=MUT.G.order[slotA],idB=MUT.G.order[slotB];
  MUT.G.order[slotA]=idB;MUT.G.order[slotB]=idA;
  const elA=$('#shCol'+idA),elB=$('#shCol'+idB);
  if(elA)elA.style.transform=`translateX(${(slotB-1)*72}px)`;
  if(elB)elB.style.transform=`translateX(${(slotA-1)*72}px)`;
  sfx('pop');
  setTimeout(shuffleStep,MUT.G.diff.interval,left-1);
}

export function guessCup(identity){
  if(!MUT.G||MUT.G.k!=='shell'||MUT.G.busy)return;
  MUT.G.busy=true;
  const win=identity===0;
  [0,1,2].forEach(id=>{
    const col=$('#shCol'+id);
    if(!col)return;
    col.classList.add('reveal');
    if(id===0)col.classList.add('lionslot');
    if(id===identity)col.classList.add('picked');
  });
  if(win){
    MUT.G.streak++;
    const gain=winAmt(MUT.G.streak);
    MUT.G.coins+=gain;MUT.G.round++;
    S.stats.shellWins++;save();
    $('#shHint').innerHTML=`<b style="color:#8FE0A0">בול! +${gain} מטבעות</b>`;
    sfx('win');confetti(MUT.G.streak>=3?36:20);
    shellReact('win',1500);
    setTimeout(()=>{
      if(!MUT.G||MUT.G.k!=='shell')return;
      MUT.G.order=shuffle([0,1,2]);MUT.G.busy=true;
      renderReveal();
    },1700);
  }else{
    $('#shHint').innerHTML='<b style="color:#FF9A9C">לא הפעם…</b>';
    sfx('err');
    shellReact('lose');
    setTimeout(()=>payout(MUT.G.coins,MUT.G.streak?'רצף של '+MUT.G.streak+' ניצחונות!':'סיימת'),1500);
  }
}
