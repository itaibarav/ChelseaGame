import { $, modal } from '../core/dom.js';
import { CARDS } from '../data/cards.js';
import { GA, ready } from '../games/assets.js';
import { MUT } from '../core/mut.js';
import { PHOTOS } from '../data/globals.js';
import { art } from '../art/cards.js';
import { payout } from '../games/shared.js';
import { sfx } from '../core/fx.js';
import { S, save, shuffle } from '../core/state.js';

/* ======================= 3. משחק זיכרון ======================= */
export function startMemory(){
  let pool=CARDS.filter(c=>c.cat==='legend'&&PHOTOS[c.id]);
  if(pool.length<6)pool=CARDS.filter(c=>c.cat==='legend');
  const picks=shuffle(pool).slice(0,6);
  const deck=shuffle([...picks,...picks]).map((c,i)=>({i,id:c.id,card:c}));
  MUT.G={k:'memory',left:60,start:Date.now(),up:[],done:[],deck,busy:false};
  const back=ready('lion')?`<img src="${GA.lion}" alt="">`:'⚽';
  modal(`<div class="sheet game">
    <div class="ghud"><span id="mT">⏱ 60s</span><span id="mP">0 / 6 זוגות</span></div>
    <h2 style="margin:4px 0 0;font-size:21px">משחק זיכרון</h2>
    <p style="margin:2px 0 4px">מצאו את שישה זוגות האגדות</p>
    <div class="mgrid">${deck.map(d=>`<button class="mcard" data-mem="${d.i}">
      <span class="back">${back}</span><span class="face">${art(d.card)}</span></button>`).join('')}</div>
    <button class="btn btn-ghost" data-act="quit" style="width:100%">סיום</button></div>`,{closable:false});
  MUT.G.timer=setInterval(()=>{
    MUT.G.left--;const t=$('#mT');if(t)t.textContent='⏱ '+MUT.G.left+'s';
    if(MUT.G.left<=0)payout(0,'נגמר הזמן');
  },1000);
}
export const memEl=i=>document.querySelector(`[data-mem="${i}"]`);
export function flipMemory(i){
  if(!MUT.G||MUT.G.busy||MUT.G.up.includes(i)||MUT.G.done.includes(i))return;
  MUT.G.up.push(i);
  const el=memEl(i);if(el)el.classList.add('up');
  sfx('pop');
  if(MUT.G.up.length<2)return;
  MUT.G.busy=true;
  const [x,y]=MUT.G.up, same=MUT.G.deck[x].id===MUT.G.deck[y].id;
  setTimeout(()=>{
    if(!MUT.G||MUT.G.k!=='memory')return;
    if(same){MUT.G.done.push(x,y);sfx('coin');
      [x,y].forEach(j=>{const e=memEl(j);if(e)e.classList.add('done');});}
    else [x,y].forEach(j=>{const e=memEl(j);if(e)e.classList.remove('up');});
    MUT.G.up=[];MUT.G.busy=false;
    const p=$('#mP');if(p)p.textContent=(MUT.G.done.length/2)+' / 6 זוגות';
    if(MUT.G.done.length===12){
      const sec=Math.round((Date.now()-MUT.G.start)/1000);
      S.stats.memoryWins++;save();
      payout(sec<30?20:10,sec<30?'מהיר במיוחד!':'הושלם!');
    }
  },same?420:820);
}
