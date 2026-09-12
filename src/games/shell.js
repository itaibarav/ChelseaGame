import { $, modal } from '../core/dom.js';
import { clubBadge, LION } from '../art/cards.js';
import { MUT } from '../core/mut.js';
import { confetti, sfx } from '../core/fx.js';
import { payout } from '../games/shared.js';
import { S, save, shuffle } from '../core/state.js';

/* ======================= 10. ריס ג'יימס מערבב =======================
   משחק "מצא את הגביע": שלושה כוסות כחולים, אריה מתחת לאחד וX מתחת לשניים.
   ריס מערבב אותם ~6 שניות, והשחקן מנחש איפה האריה. ניצחון מזכה ב-15
   מטבעות, ומרצף שלוש ניצחונות ברציפות עולה ל-25. הפסד מסיים את המשחק
   ומשלם את מה שנצבר. */
export const jamesSVG=`<svg viewBox="0 0 150 250">
  <ellipse cx="75" cy="243" rx="44" ry="6" fill="rgba(0,0,0,.16)"/>
  <!-- רגליים ונעליים -->
  <rect x="59" y="168" width="14" height="58" rx="7" fill="#8A5A3B"/>
  <rect x="77" y="168" width="14" height="58" rx="7" fill="#8A5A3B"/>
  <path d="M53 224 h23 v9 a5 5 0 0 1 -5 5 h-21 a4 4 0 0 1 -1 -8z" fill="#161616" stroke="#000" stroke-width="2"/>
  <path d="M74 224 h23 v9 a5 5 0 0 1 -5 5 h-21 a4 4 0 0 1 -1 -8z" fill="#161616" stroke="#000" stroke-width="2"/>
  <!-- שורט כחול -->
  <path d="M48 148 h54 v34 h-22 l-5 -13 -5 13 h-22z" fill="#034694" stroke="#062B63" stroke-width="2"/>
  <!-- זרועות -->
  <g class="jarm l"><rect x="29" y="106" width="15" height="60" rx="7.5" fill="#8A5A3B"/></g>
  <g class="jarm r"><rect x="106" y="106" width="15" height="60" rx="7.5" fill="#8A5A3B"/>
    <rect x="105.5" y="119" width="16" height="7" fill="#FFFFFF"/></g>
  <!-- שרוולים וגוף: מדי בית 2026/27 -->
  <path d="M50 100 l-21 8 5 26 17 -7z" fill="#034694" stroke="#062B63" stroke-width="2"/>
  <path d="M100 100 l21 8 -5 26 -17 -7z" fill="#034694" stroke="#062B63" stroke-width="2"/>
  <rect x="48" y="98" width="54" height="54" rx="5" fill="#034694" stroke="#062B63" stroke-width="2"/>
  <path d="M62 98 L75 114 L88 98" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>
  ${LION?`<image href="${LION}" x="84" y="103" width="16" height="21"/>`:'<circle cx="92" cy="113" r="9" fill="#F2C230"/>'}
  <path d="M63 130 h15 v11 a7.5 7.5 0 0 1 -15 0z" fill="#D9B14A" stroke="#B08A2E" stroke-width="1.4"/>
  <g class="jcold">
    <g class="jca a"><path d="M38 114 L100 120" fill="none" stroke="#8A5A3B" stroke-width="15" stroke-linecap="round"/>
      <circle cx="100" cy="120" r="8.5" fill="#8A5A3B" stroke="#6E4429" stroke-width="1"/></g>
    <g class="jca b"><path d="M112 117 L46 123" fill="none" stroke="#7C4E32" stroke-width="15" stroke-linecap="round"/>
      <circle cx="46" cy="123" r="8.5" fill="#8A5A3B" stroke="#6E4429" stroke-width="1"/></g>
  </g>
  <!-- ראש -->
  <rect x="34" y="14" width="82" height="84" rx="35" fill="#8A5A3B"/>
  <!-- שיער קצר וקרוב לראש -->
  <path d="M35 50 Q35 12 75 12 Q115 12 115 50 Q108 34 96 30 Q100 24 92 20 Q84 15 75 15 Q66 15 58 20 Q50 24 54 30 Q42 34 35 50 Z" fill="#0F0D0C"/>
  <!-- זקן מלא -->
  <path d="M42 58 Q40 82 55 92 Q65 98 75 98 Q85 98 95 92 Q110 82 108 58 Q106 70 98 76 Q99 69 95 64 Q92 74 75 74 Q58 74 55 64 Q51 69 52 76 Q44 70 42 58 Z" fill="#171412" opacity=".94"/>
  <!-- גבות -->
  <path d="M49 44 q11 -6 22 -1" fill="none" stroke="#0F0D0C" stroke-width="4.2" stroke-linecap="round"/>
  <path d="M79 43 q11 -5 22 1" fill="none" stroke="#0F0D0C" stroke-width="4.2" stroke-linecap="round"/>
  <!-- עיניים -->
  <ellipse cx="60" cy="58" rx="8" ry="9.5" fill="#241D16"/>
  <ellipse cx="90" cy="58" rx="8" ry="9.5" fill="#241D16"/>
  <circle cx="63" cy="54" r="2.8" fill="#fff"/><circle cx="93" cy="54" r="2.8" fill="#fff"/>
  <!-- חיוך בין השפם לזקן -->
  <path d="M61 75 q14 9 28 0" fill="none" stroke="#2A1B12" stroke-width="3" stroke-linecap="round"/>
  <path d="M64 76 q11 5 22 0" fill="#fff" opacity=".85"/>
  <ellipse cx="45" cy="69" rx="5" ry="3.5" fill="#5A381F" opacity=".35"/>
  <ellipse cx="105" cy="69" rx="5" ry="3.5" fill="#5A381F" opacity=".35"/></svg>`;

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

const winAmt=streak=>streak>=3?25:15;

export function startShellGame(){
  MUT.G={k:'shell',streak:0,coins:0,round:1,order:shuffle([0,1,2]),busy:true};
  renderReveal();
}

/* MUT.G.order[slot] = איזו זהות (0=אריה,1/2=X) נמצאת כרגע באיזה מיקום על המסך.
   כל עמודת DOM שייכת לזהות קבועה (התוכן שלה לא זז), וה-transform שלה
   מזיז אותה למיקום ה-slot הנוכחי שלה — בדיוק כמו כוס אמיתית שזזה על השולחן. */
function slotOf(identity){return MUT.G.order.indexOf(identity);}
function frame(hint){
  const cell=(identity)=>{
    const content=identity===0?lionSVG:xSVG;
    return `<div class="shCol" id="shCol${identity}" style="transform:translateX(${(slotOf(identity)-1)*72}px)">
      <div class="shContent">${content}</div>
      <button class="shCup" data-cup="${identity}">${cupSVG}</button></div>`;
  };
  return `<div class="sheet game">
    <div class="ghud"><span>סיבוב ${MUT.G.round}</span><span>רצף ${MUT.G.streak}</span><span>${MUT.G.coins} 🪙</span></div>
    <h2 style="margin:2px 0 6px;font-size:21px">ריס ג'יימס מערבב</h2>
    <div class="shArena"><div class="shFig">${jamesSVG}</div></div>
    <p id="shHint" style="min-height:22px;margin:8px 0">${hint}</p>
    <div class="shCups" id="shCups">${[0,1,2].map(cell).join('')}</div>
    <button class="btn btn-ghost" data-act="quit" style="width:100%;margin-top:10px">פרישה עם המטבעות</button></div>`;
}

function renderReveal(){
  modal(frame('שימו לב — האריה שם! 👀'),{closable:false});
  $('#shCups').classList.add('open');
  setTimeout(()=>{
    if(!MUT.G||MUT.G.k!=='shell')return;
    $('#shCups').classList.remove('open');
    $('#shHint').textContent='ריס מערבב את הכוסות…';
    setTimeout(shuffleStep,500,8);
  },1500);
}

function shuffleStep(left){
  if(!MUT.G||MUT.G.k!=='shell')return;
  if(!left){MUT.G.busy=false;$('#shHint').textContent='איפה האריה?';return;}
  const [slotA,slotB]=shuffle([0,1,2]).slice(0,2);
  const idA=MUT.G.order[slotA],idB=MUT.G.order[slotB];
  MUT.G.order[slotA]=idB;MUT.G.order[slotB]=idA;
  const elA=$('#shCol'+idA),elB=$('#shCol'+idB);
  if(elA)elA.style.transform=`translateX(${(slotB-1)*72}px)`;
  if(elB)elB.style.transform=`translateX(${(slotA-1)*72}px)`;
  sfx('pop');
  setTimeout(shuffleStep,650,left-1);
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
    setTimeout(()=>{
      if(!MUT.G||MUT.G.k!=='shell')return;
      MUT.G.order=shuffle([0,1,2]);MUT.G.busy=true;
      renderReveal();
    },1700);
  }else{
    $('#shHint').innerHTML='<b style="color:#FF9A9C">לא הפעם…</b>';
    sfx('err');
    setTimeout(()=>payout(MUT.G.coins,MUT.G.streak?'רצף של '+MUT.G.streak+' ניצחונות!':'סיימת'),1500);
  }
}
