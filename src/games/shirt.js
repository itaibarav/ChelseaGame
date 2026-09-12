import { $, modal, toast } from '../core/dom.js';
import { MUT } from '../core/mut.js';
import { SQUAD } from '../data/cards.js';
import { cardOf, gameCard } from '../games/assets.js';
import { payout } from '../games/shared.js';
import { sfx } from '../core/fx.js';
import { S, save, shuffle } from '../core/state.js';

/* ======================= 1. מי החולצה ======================= */
/* תור מעורבב — שחקן לא חוזר עד שכל הסגל עבר */
export const STREAK=[0,0,3,3,5,7,10];
export function startShirt(){
  MUT.G={k:'shirt',coins:0,streak:0,left:60,input:'',cur:null,
     queue:shuffle(SQUAD.map((_,i)=>i)),qi:0,seen:0};
  modal(`<div class="sheet game">
    <div class="ghud"><span id="gT">⏱ 60s</span><span id="gS">רצף 0</span><span id="gC">0 🪙</span></div>
    <div id="gCard"></div>
    <h2 id="gName" style="margin:2px 0 0;font-size:21px"></h2>
    <p id="gPos" style="margin:2px 0 6px"></p>
    <div class="numin" id="gIn">–</div>
    <div class="numpad">${[1,2,3,4,5,6,7,8,9].map(d=>`<button data-num="${d}">${d}</button>`).join('')}
      <button data-num="del">⌫</button><button data-num="0">0</button>
      <button data-num="ok" style="background:linear-gradient(180deg,#FFD766,#E09800);color:#3A2400">✓</button></div>
    <button class="btn btn-ghost" data-act="quit" style="width:100%;margin-top:10px">סיום</button></div>`,{closable:false});
  MUT.G.timer=setInterval(()=>{
    MUT.G.left--;const t=$('#gT');if(t)t.textContent='⏱ '+MUT.G.left+'s';
    if(MUT.G.left<=0)payout(MUT.G.coins,'נגמר הזמן!');
  },1000);
  nextShirt();
}
export function nextShirt(){
  if(MUT.G.qi>=MUT.G.queue.length){MUT.G.queue=shuffle(MUT.G.queue);MUT.G.qi=0;}
  MUT.G.cur=SQUAD[MUT.G.queue[MUT.G.qi++]];MUT.G.input='';MUT.G.seen++;
  const c=cardOf('squad-'+MUT.G.cur[0]);
  const el=$('#gCard');if(el)el.innerHTML=gameCard(c,true);
  const n=$('#gName');if(n)n.textContent=MUT.G.cur[1];
  const p=$('#gPos');if(p)p.textContent=MUT.G.cur[2]+' — מה מספר החולצה?';
  const i=$('#gIn');if(i)i.textContent='–';
}
export function shirtKey(k){
  const inEl=$('#gIn');
  if(k==='del'){MUT.G.input=MUT.G.input.slice(0,-1);if(inEl)inEl.textContent=MUT.G.input||'–';return;}
  if(k==='ok'){
    if(!MUT.G.input)return;
    if(+MUT.G.input===MUT.G.cur[0]){
      MUT.G.streak++;const b=MUT.G.streak<STREAK.length?STREAK[MUT.G.streak]:10;
      MUT.G.coins+=3+b;sfx('coin');toast('נכון! +'+(3+b));
      S.stats.shirtBestStreak=Math.max(S.stats.shirtBestStreak,MUT.G.streak);save();
    }else{MUT.G.streak=0;sfx('err');toast('לא מדויק — '+MUT.G.cur[0]);}
    const s=$('#gS'),c=$('#gC');
    if(s)s.textContent='רצף '+MUT.G.streak;
    if(c)c.textContent=MUT.G.coins+' 🪙';
    return nextShirt();
  }
  if(MUT.G.input.length<2){MUT.G.input+=k;if(inEl)inEl.textContent=MUT.G.input;}
}
