import { $, modal } from '../core/dom.js';
import { MUT } from '../core/mut.js';
import { SQUAD } from '../data/cards.js';
import { art } from '../art/cards.js';
import { cardOf } from '../games/assets.js';
import { esc, pick, shuffle } from '../core/state.js';
import { payout } from '../games/shared.js';
import { sfx } from '../core/fx.js';

/* ======================= 8. איקס עיגול ======================= */
export const TTT_LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
export function startTTT(){
  const two=shuffle(SQUAD).slice(0,2);
  const hard=Math.random()<0.5;
  MUT.G={k:'ttt',b:Array(9).fill(0),me:two[0],ai:two[1],over:false,busy:false,hard};
  modal(`<div class="sheet game">
    <div class="ghud"><span>${esc(MUT.G.me[1])}</span>
      <span class="lvl ${hard?'hard':'easy'}">${hard?'רמה קשה':'רמה קלה'}</span>
      <span>${esc(MUT.G.ai[1])}</span></div>
    <h2 style="margin:2px 0 0;font-size:21px">איקס עיגול</h2>
    <p style="margin:2px 0 4px">ניצחון 10 · תיקו 3</p>
    <div class="ttt">${Array.from({length:9},(_,i)=>`<button data-ttt="${i}"></button>`).join('')}</div>
    <button class="btn btn-ghost" data-act="quit" style="width:100%">סיום</button></div>`);
}
export function tttMark(who){
  const p=who===1?MUT.G.me:MUT.G.ai;
  return `<span class="tttmark ${who===1?'me':'ai'}">${art(cardOf('squad-'+p[0]))}</span>`;
}
export const tttWinner=b=>{for(const [a,c,d] of TTT_LINES)if(b[a]&&b[a]===b[c]&&b[a]===b[d])return b[a];
  return b.every(v=>v)?3:0;};
export function tttBest(b,who){
  const free=b.map((v,i)=>v?-1:i).filter(i=>i>=0);
  /* רמה קלה: לרוב מהלך אקראי, לפעמים חוסם */
  if(!MUT.G.hard&&Math.random()<0.62)return pick(free);
  const other=who===1?2:1;
  for(const l of TTT_LINES){const v=l.map(i=>b[i]);
    if(v.filter(x=>x===who).length===2&&v.includes(0))return l[v.indexOf(0)];}
  for(const l of TTT_LINES){const v=l.map(i=>b[i]);
    if(v.filter(x=>x===other).length===2&&v.includes(0))return l[v.indexOf(0)];}
  if(!b[4])return 4;
  const corners=[0,2,6,8].filter(i=>!b[i]);
  if(corners.length)return pick(corners);
  return pick(free);
}
export const tttCell=i=>document.querySelector(`[data-ttt="${i}"]`);
export function playTTT(i){
  if(!MUT.G||MUT.G.over||MUT.G.busy||MUT.G.b[i])return;
  MUT.G.busy=true;MUT.G.b[i]=1;
  const e=tttCell(i);if(e){e.innerHTML=tttMark(1);e.classList.add('filled');}
  sfx('pop');
  let w=tttWinner(MUT.G.b);
  const endIt=()=>{MUT.G.over=true;setTimeout(()=>{
    if(!MUT.G||MUT.G.k!=='ttt')return;
    if(w===1)payout(10,'ניצחת!');else if(w===3)payout(3,'תיקו');else payout(0,'הפסדת');
  },700);};
  if(w)return endIt();
  setTimeout(()=>{
    if(!MUT.G||MUT.G.k!=='ttt')return;
    const j=tttBest(MUT.G.b,2);MUT.G.b[j]=2;
    const e2=tttCell(j);if(e2){e2.innerHTML=tttMark(2);e2.classList.add('filled');}
    w=tttWinner(MUT.G.b);MUT.G.busy=false;
    if(w)endIt();
  },420);
}
