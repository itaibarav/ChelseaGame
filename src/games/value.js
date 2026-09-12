import { $, modal } from '../core/dom.js';
import { MUT } from '../core/mut.js';
import { SQUAD } from '../data/cards.js';
import { cardOf, gameCard } from '../games/assets.js';
import { pick } from '../core/state.js';
import { sfx } from '../core/fx.js';

/* ======================= 2. קרב שווי (ללא הגבלה) ======================= */
export function startValue(){
  MUT.G={k:'value',coins:0,q:0,right:0,pair:null,busy:false};
  modal(`<div class="sheet game">
    <div class="ghud"><span id="vQ">שאלה 1</span><span id="vR">0 נכונות</span><span id="vC">0 🪙</span></div>
    <h2 style="margin:2px 0 8px;font-size:21px">למי שווי שוק גבוה יותר?</h2>
    <div class="vscards">
      <button class="vscard" data-vs="0" id="vA"></button>
      <span style="font-family:Secular One;font-size:18px;opacity:.6">VS</span>
      <button class="vscard" data-vs="1" id="vB"></button></div>
    <p id="vMsg" style="min-height:22px;margin:0 0 8px"></p>
    <button class="btn btn-ghost" data-act="quit" style="width:100%">סיום ואיסוף</button></div>`,{closable:false});
  nextValue();
}
export function nextValue(){
  let a=pick(SQUAD),b=pick(SQUAD);
  while(b[0]===a[0]||b[3]===a[3])b=pick(SQUAD);
  MUT.G.pair=[a,b];MUT.G.q++;MUT.G.busy=false;
  const q=$('#vQ');if(q)q.textContent='שאלה '+MUT.G.q;
  const m=$('#vMsg');if(m)m.textContent='';
  const A=$('#vA'),B=$('#vB');
  if(A)A.innerHTML=gameCard(cardOf('squad-'+a[0]));
  if(B)B.innerHTML=gameCard(cardOf('squad-'+b[0]));
}
export function answerValue(i){
  if(!MUT.G||MUT.G.busy)return;
  MUT.G.busy=true;
  const [a,b]=MUT.G.pair,win=a[3]>b[3]?0:1;
  const m=$('#vMsg');
  if(i===win){MUT.G.coins+=5;MUT.G.right++;sfx('coin');
    if(m)m.innerHTML=`<b style="color:#8FE0A0">נכון! ${MUT.G.pair[win][1]} — €${MUT.G.pair[win][3]}M</b>`;}
  else{sfx('err');
    if(m)m.innerHTML=`<b style="color:#FF9A9C">${MUT.G.pair[win][1]} שווה יותר — €${MUT.G.pair[win][3]}M</b>`;}
  const c=$('#vC'),r=$('#vR');
  if(c)c.textContent=MUT.G.coins+' 🪙';
  if(r)r.textContent=MUT.G.right+' נכונות';
  setTimeout(()=>{if(MUT.G&&MUT.G.k==='value')nextValue();},1000);
}
