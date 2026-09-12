import { $, modal } from '../core/dom.js';
import { LION } from '../art/cards.js';
import { MUT } from '../core/mut.js';
import { confetti, sfx } from '../core/fx.js';
import { payout } from '../games/shared.js';
import { pick, S, save } from '../core/state.js';

/* ======================= 7. אבן נייר ומספריים מול קול פאלמר ======================= */
export const RPS=['rock','paper','scissors'];
export const RPS_HE={rock:'אבן',paper:'נייר',scissors:'מספריים'};
export const HAND_EMO={rock:'\u270A\uD83C\uDFFB',paper:'\u270B\uD83C\uDFFB',scissors:'\u270C\uD83C\uDFFC'};
export const handSVG=(kind,flip)=>`<span class="emo${flip?' flip':''}">${HAND_EMO[kind]}</span>`;

export const palmerSVG=`<svg viewBox="0 0 150 250">
  <ellipse cx="75" cy="243" rx="44" ry="6" fill="rgba(0,0,0,.16)"/>
  <!-- רגליים ונעליים -->
  <rect x="59" y="168" width="14" height="58" rx="7" fill="#F3D2AE"/>
  <rect x="77" y="168" width="14" height="58" rx="7" fill="#F3D2AE"/>
  <path d="M53 224 h23 v9 a5 5 0 0 1 -5 5 h-21 a4 4 0 0 1 -1 -8z" fill="#2050CC" stroke="#123A9E" stroke-width="2"/>
  <path d="M74 224 h23 v9 a5 5 0 0 1 -5 5 h-21 a4 4 0 0 1 -1 -8z" fill="#2050CC" stroke="#123A9E" stroke-width="2"/>
  <!-- מכנסיים -->
  <path d="M48 148 h54 v34 h-22 l-5 -13 -5 13 h-22z" fill="#2050CC" stroke="#123A9E" stroke-width="2"/>
  <!-- זרועות -->
  <g class="parm l"><rect x="29" y="106" width="15" height="60" rx="7.5" fill="#F3D2AE"/></g>
  <g class="parm r"><rect x="106" y="106" width="15" height="60" rx="7.5" fill="#F3D2AE"/></g>
  <!-- שרוולים וגוף -->
  <path d="M50 100 l-21 8 5 26 17 -7z" fill="#2050CC" stroke="#123A9E" stroke-width="2"/>
  <path d="M100 100 l21 8 -5 26 -17 -7z" fill="#2050CC" stroke="#123A9E" stroke-width="2"/>
  <rect x="48" y="98" width="54" height="54" rx="5" fill="#2050CC" stroke="#123A9E" stroke-width="2"/>
  <path d="M62 98 L75 114 L88 98" fill="none" stroke="#123A9E" stroke-width="3" stroke-linejoin="round"/>
  <path d="M55 120 c4 3 9 2 14 -2 l12 -7 c-4 6 -10 9 -17 12 c-5 2 -8 1 -9 -3z" fill="#F2C230"/>
  ${LION?`<image href="${LION}" x="84" y="103" width="16" height="21"/>`
        :'<circle cx="92" cy="113" r="9" fill="#F2C230"/>'}
  <path d="M63 130 h15 v11 a7.5 7.5 0 0 1 -15 0z" fill="#D9B14A" stroke="#B08A2E" stroke-width="1.4"/>
  <g class="pcold">
    <g class="pca a"><path d="M38 114 L100 120" fill="none" stroke="#F3D2AE" stroke-width="15" stroke-linecap="round"/>
      <circle cx="100" cy="120" r="8.5" fill="#F5D5B0" stroke="#DDA97F" stroke-width="1"/></g>
    <g class="pca b"><path d="M112 117 L46 123" fill="none" stroke="#EFC6A0" stroke-width="15" stroke-linecap="round"/>
      <circle cx="46" cy="123" r="8.5" fill="#F5D5B0" stroke="#DDA97F" stroke-width="1"/></g>
  </g>
  <!-- ראש -->
  <rect x="34" y="14" width="82" height="84" rx="35" fill="#F5D5B0"/>
  <!-- שיער -->
  <path d="M34 52 q1 -42 41 -42 q40 0 41 42 q-7 -19 -20 -24 q-18 -8 -37 -1 q-19 7 -25 25z" fill="#B08A57"/>
  <g stroke="#8E6C3C" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".75">
    <path d="M46 40 q6 -12 16 -16"/><path d="M58 30 q10 -8 22 -7"/>
    <path d="M78 24 q13 2 20 13"/><path d="M96 42 q4 -8 12 -6"/>
    <path d="M40 50 q3 -10 10 -14"/></g>
  <!-- גבות -->
  <g class="pbrow happy">
    <path d="M49 44 q11 -6 22 -1" fill="none" stroke="#8A6838" stroke-width="4.2" stroke-linecap="round"/>
    <path d="M79 43 q11 -5 22 1" fill="none" stroke="#8A6838" stroke-width="4.2" stroke-linecap="round"/></g>
  <g class="pbrow sad">
    <path d="M49 38 q11 4 22 10" fill="none" stroke="#8A6838" stroke-width="4.2" stroke-linecap="round"/>
    <path d="M79 48 q11 -6 22 -10" fill="none" stroke="#8A6838" stroke-width="4.2" stroke-linecap="round"/></g>
  <!-- עיניים -->
  <ellipse cx="60" cy="58" rx="8.5" ry="10.5" fill="#241D16"/>
  <ellipse cx="90" cy="58" rx="8.5" ry="10.5" fill="#241D16"/>
  <circle cx="63.5" cy="53.5" r="3.2" fill="#fff"/><circle cx="93.5" cy="53.5" r="3.2" fill="#fff"/>
  <!-- חיוך פתוח -->
  <g class="pmouth happy">
    <path d="M56 73 a19 15 0 0 0 38 0z" fill="#8E4436"/>
    <path d="M56 73 h38 a19 6.5 0 0 1 -38 0z" fill="#FFFFFF"/></g>
  <g class="pmouth sad">
    <path d="M60 84 a16 12 0 0 1 30 0" fill="none" stroke="#8E4436" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M104 60 q5 10 0 16" fill="none" stroke="#7FC7F5" stroke-width="3" stroke-linecap="round"/></g>
  <ellipse cx="45" cy="72" rx="6" ry="4" fill="#F0A98C" opacity=".45"/>
  <ellipse cx="105" cy="72" rx="6" ry="4" fill="#F0A98C" opacity=".45"/></svg>`;

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
        <div class="fig" id="pFig">${palmerSVG}</div>
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
