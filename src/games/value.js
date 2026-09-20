import { $, modal, toast } from '../core/dom.js';
import { MUT } from '../core/mut.js';
import { SQUAD } from '../data/cards.js';
import { cardOf, gameCard, worldCard } from '../games/assets.js';
import { pick } from '../core/state.js';
import { sfx } from '../core/fx.js';
import { streakCelebration } from '../games/shared.js';
import WORLD from '../data/worldPlayers.json.js';

/* ======================= 2. קרב שווי (ללא הגבלה) =======================
   שני מצבים: "צ'לסי" (ברירת מחדל, שני שחקני צ'לסי אקראיים) ו-"עולמי"
   (שחקן צ'לסי אקראי מול שחקן עולם אקראי — תמיד יש צ'לסי אחד בכל שאלה,
   לא משנה איזה צד זכה בהגרלה). המצב נשמר תוך כדי משחק (לא מתאפס בין
   שאלות), אבל לא נשמר בין הרצות — כמו כפתורי מצב אחרים באפליקציה */
const worldReady=()=>WORLD.players.length>0;

export function startValue(){
  MUT.G={k:'value',coins:0,q:0,right:0,streak:0,pair:null,busy:false,mode:'chelsea'};
  modal(`<div class="sheet game">
    <div class="ghud"><span id="vQ">שאלה 1</span><span id="vR">0 נכונות</span><span id="vC">0 🪙</span></div>
    <div class="mtabs" id="vModeTabs" style="grid-template-columns:repeat(2,1fr);margin-bottom:6px">
      <button class="on" data-vsmode="chelsea">צ'לסי</button>
      <button data-vsmode="world">עולמי</button></div>
    <h2 style="margin:2px 0 8px;font-size:21px">למי שווי שוק גבוה יותר?</h2>
    <div class="vscards">
      <button class="vscard" data-vs="0" id="vA"></button>
      <span style="font-family:Secular One;font-size:18px;opacity:.6">VS</span>
      <button class="vscard" data-vs="1" id="vB"></button></div>
    <p id="vMsg" style="min-height:22px;margin:0 0 8px"></p>
    <button class="btn btn-ghost" data-act="quit" style="width:100%">סיום ואיסוף</button></div>`,{closable:false});
  nextValue();
}
export function setValueMode(mode){
  if(!MUT.G||MUT.G.k!=='value'||MUT.G.mode===mode)return;
  if(mode==='world'&&!worldReady())return toast('עדיין אין שחקני עולם — בקרוב!');
  MUT.G.mode=mode;
  const tabs=$('#vModeTabs');
  if(tabs)tabs.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.vsmode===mode));
  nextValue();
}
/* שחקן צ'לסי אקראי, מנורמל לצורה משותפת עם שחקן עולם — כך ש-answerValue
   ושאר הלוגיקה לא צריכים לדעת מאיזה מקור הגיע כל צד. הגבלת ניסיונות
   ב"בריחה משוויון" מונעת לולאה אינסופית תיאורטית אם יש מעט מדי שחקני
   עולם עם ערכים שונים (בפועל, עם ~40 שחקנים, כמעט ולא קורה) */
const chelseaEntry=()=>{
  const s=pick(SQUAD);
  return {name:s[1],mv:s[3],num:s[0],card:gameCard(cardOf('squad-'+s[0]))};
};
const worldEntry=excludeMv=>{
  let p=pick(WORLD.players);
  for(let i=0;i<20&&p.mv===excludeMv;i++)p=pick(WORLD.players);
  return {name:p.name,mv:p.mv,card:worldCard({...p,photo:WORLD.photos[p.id]})};
};
export function nextValue(){
  let a,b;
  if(MUT.G.mode==='world'&&worldReady()){
    a=chelseaEntry();b=worldEntry(a.mv);
    if(Math.random()<0.5)[a,b]=[b,a];
  }else{
    const sa=pick(SQUAD);let sb=pick(SQUAD);
    while(sb[0]===sa[0]||sb[3]===sa[3])sb=pick(SQUAD);
    a={name:sa[1],mv:sa[3],num:sa[0],card:gameCard(cardOf('squad-'+sa[0]))};
    b={name:sb[1],mv:sb[3],num:sb[0],card:gameCard(cardOf('squad-'+sb[0]))};
  }
  MUT.G.pair=[a,b];MUT.G.q++;MUT.G.busy=false;
  const q=$('#vQ');if(q)q.textContent='שאלה '+MUT.G.q;
  const m=$('#vMsg');if(m)m.textContent='';
  const A=$('#vA'),B=$('#vB');
  if(A)A.innerHTML=a.card;
  if(B)B.innerHTML=b.card;
}
export function answerValue(i){
  if(!MUT.G||MUT.G.busy)return;
  MUT.G.busy=true;
  const [a,b]=MUT.G.pair,win=a.mv>b.mv?0:1;
  const m=$('#vMsg');
  let celebrate=false;
  if(i===win){MUT.G.coins+=5;MUT.G.right++;MUT.G.streak++;sfx('coin');
    if(m)m.innerHTML=`<b style="color:#8FE0A0">נכון! ${MUT.G.pair[win].name} — €${MUT.G.pair[win].mv}M</b>`;
    celebrate=MUT.G.streak%5===0;
  }else{MUT.G.streak=0;sfx('err');
    if(m)m.innerHTML=`<b style="color:#FF9A9C">${MUT.G.pair[win].name} שווה יותר — €${MUT.G.pair[win].mv}M</b>`;}
  const c=$('#vC'),r=$('#vR');
  if(c)c.textContent=MUT.G.coins+' 🪙';
  if(r)r.textContent=MUT.G.right+' נכונות';
  const next=()=>{if(MUT.G&&MUT.G.k==='value')nextValue();};
  if(celebrate)streakCelebration(MUT.G.streak,5,next);
  else setTimeout(next,1000);
}
