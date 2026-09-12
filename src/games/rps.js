import { $, modal } from '../core/dom.js';
import { GA } from '../games/assets.js';
import { MUT } from '../core/mut.js';
import { confetti, sfx } from '../core/fx.js';
import { payout } from '../games/shared.js';
import { pick, S, save } from '../core/state.js';

/* ======================= 7. אבן נייר ומספריים מול קול פאלמר ======================= */
export const RPS=['rock','paper','scissors'];
export const RPS_HE={rock:'אבן',paper:'נייר',scissors:'מספריים'};
export const HAND_EMO={rock:'\u270A\uD83C\uDFFB',paper:'\u270B\uD83C\uDFFB',scissors:'\u270C\uD83C\uDFFC'};
export const handSVG=(kind,flip)=>`<span class="emo${flip?' flip':''}">${HAND_EMO[kind]}</span>`;

const palmerFig=GA.palmer?`<img src="${GA.palmer}" alt="">`:'🙂';

export function palmerReact(mood,ms){
  const f=$('#pFig');if(!f)return;
  f.classList.remove('win','lose');void f.offsetWidth;
  f.classList.add(mood);
  setTimeout(()=>f&&f.classList.remove(mood),ms);
}
export function startRPS(){
  MUT.G={k:'rps',round:0,coins:0,wins:0,busy:false};
  modal(`<div class="sheet game">
    <div class="ghud"><span id="rR">סיבוב 1 מתוך 5</span><span id="rW">0 ניצחונות</span><span id="rC">0 🪙</span></div>
    <h2 style="margin:2px 0 2px;font-size:21px">אבן נייר ומספריים</h2>
    <p style="margin:0 0 8px">מול קול פאלמר · ניצחון 6 · תיקו 2</p>
    <div class="rpsArena">
      <div class="side">
        <div class="who">קול פאלמר</div>
        <div class="fig" id="pFig">${palmerFig}</div>
        <div class="hand" id="pHand">${handSVG('rock')}</div>
      </div>
      <div class="side">
        <div class="who" id="uWho">אתה</div>
        <div class="hand big" id="uHand">${handSVG('rock',true)}</div>
      </div>
    </div>
    <p id="rMsg" style="min-height:22px;margin:6px 0 8px"></p>
    <div class="rpsPick">${RPS.map(k=>
      `<button data-rps="${k}"><span class="ic">${handSVG(k,true)}</span>${RPS_HE[k]}</button>`).join('')}</div>
    <button class="btn btn-ghost" data-act="quit" style="width:100%;margin-top:10px">סיום</button></div>`,{closable:false});
}
export function playRPS(choice){
  if(!MUT.G||MUT.G.busy||MUT.G.k!=='rps')return;
  MUT.G.busy=true;
  const uh=$('#uHand'),ph=$('#pHand'),msg=$('#rMsg');
  if(uh)uh.innerHTML=handSVG(choice,true);
  if(msg)msg.textContent='';
  let n=0;
  const iv=setInterval(()=>{
    if(!MUT.G||MUT.G.k!=='rps'){clearInterval(iv);return;}
    const k=RPS[n%3];
    if(ph){ph.innerHTML=handSVG(k);ph.classList.remove('shake');void ph.offsetWidth;ph.classList.add('shake');}
    if(uh){uh.classList.remove('shake');void uh.offsetWidth;uh.classList.add('shake');}
    if(++n>=6){clearInterval(iv);revealRPS(choice);}
  },160);
}
export function revealRPS(choice){
  const ai=pick(RPS),ph=$('#pHand'),msg=$('#rMsg');
  if(ph)ph.innerHTML=handSVG(ai);
  const beats={rock:'scissors',paper:'rock',scissors:'paper'};
  let gain=0,txt;
  if(ai===choice){gain=2;txt=`<b style="color:#FFD766">תיקו — שניכם ${RPS_HE[ai]} +2</b>`;sfx('pop');}
  else if(beats[choice]===ai){gain=6;MUT.G.wins++;S.stats.rpsWins++;save();txt=`<b style="color:#8FE0A0">ניצחת! ${RPS_HE[choice]} מנצח ${RPS_HE[ai]} +6</b>`;sfx('win');confetti(16);
    palmerReact('lose',1000);}
  else{txt=`<b style="color:#FF9A9C">פאלמר לקח את זה — ${RPS_HE[ai]}</b>`;sfx('err');
    palmerReact('win',1500);}
  MUT.G.coins+=gain;MUT.G.round++;
  if(msg)msg.innerHTML=txt;
  const c=$('#rC'),w=$('#rW');
  if(c)c.textContent=MUT.G.coins+' 🪙';
  if(w)w.textContent=MUT.G.wins+' ניצחונות';
  setTimeout(()=>{
    if(!MUT.G||MUT.G.k!=='rps')return;
    if(MUT.G.round>=5)return payout(MUT.G.coins,MUT.G.wins>=3?'ניצחת את פאלמר!':'סיבוב הסתיים');
    const r=$('#rR');if(r)r.textContent='סיבוב '+(MUT.G.round+1)+' מתוך 5';
    MUT.G.busy=false;
  },1400);
}
