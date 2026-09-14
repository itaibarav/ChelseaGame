import { $, modal } from '../core/dom.js';
import { GAMES } from '../data/cards.js';
import { MUT } from '../core/mut.js';
import { S, esc, save } from '../core/state.js';
import { confetti, sfx } from '../core/fx.js';
import { render } from '../core/router.js';
import { avatarSVG } from '../art/avatar.js';

/* ======================= MINI GAMES ======================= */
export const stopLoop=()=>{if(MUT.RAF){cancelAnimationFrame(MUT.RAF);MUT.RAF=null;}};
export const endTimer=()=>{if(MUT.G&&MUT.G.timer)clearInterval(MUT.G.timer);stopLoop();};
export function setupCanvas(h){
  const cv=$('#cv');if(!cv)return null;
  const w=cv.clientWidth||300,dpr=Math.min(window.devicePixelRatio||1,2);
  cv.style.height=h+'px';cv.width=w*dpr;cv.height=h*dpr;
  const ctx=cv.getContext('2d');ctx.scale(dpr,dpr);
  return {cv,ctx,w,h};
}
export function canvasPoint(cv,e){const r=cv.getBoundingClientRect();
  const t=e.touches&&e.touches[0]?e.touches[0]:e;
  return {x:t.clientX-r.left,y:t.clientY-r.top};}
export const drawPitch=(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);
  g.addColorStop(0,'#0B3568');g.addColorStop(.55,'#123F80');x.fillStyle=g;x.fillRect(0,0,w,h);
  x.fillStyle='#2E8B3D';x.fillRect(0,h*.62,w,h*.38);
  x.fillStyle='rgba(255,255,255,.06)';for(let i=0;i<5;i++)x.fillRect(0,h*.62+i*h*.08,w,h*.04);};
export const drawBall=(x,cx,cy,r)=>{x.fillStyle='#fff';x.beginPath();x.arc(cx,cy,r,0,7);x.fill();
  x.fillStyle='#123';x.beginPath();x.arc(cx,cy,r*.34,0,7);x.fill();
  x.strokeStyle='#123';x.lineWidth=r*.14;
  for(let i=0;i<5;i++){const a=i*1.2566;x.beginPath();
    x.moveTo(cx+Math.cos(a)*r*.34,cy+Math.sin(a)*r*.34);
    x.lineTo(cx+Math.cos(a)*r*.86,cy+Math.sin(a)*r*.86);x.stroke();}};
/* חגיגת רצף: כל כמה תשובות/בעיטות נכונות ברצף (every), מציגים את האוואטר
   של השחקן חוגג בסגנון "קר לי" של קול פאלמר (cel-3, כבר מוגדר ב-avatarSVG),
   מקפיאים את המשחק ל-2 שניות עם הודעה, ואז ממשיכים */
const STREAK_LINES=[
  n=>`${n} ברצף — כל הכבוד ${esc(S.name||'אלוף')}!`,
  n=>`${n} ברצף — ${esc(S.name||'אלוף')} האלוף!`,
  n=>`${n} ברצף — ${esc(S.name||'אלוף')} בלתי ניתן לעצירה!`,
  n=>`${n} ברצף — ${esc(S.name||'אלוף')} אגדה!`,
  n=>`${n} ברצף — ${esc(S.name||'אלוף')} מטורף! 🔥`,
];
export function streakCelebration(streak,every,done){
  if(!streak||streak%every!==0)return done&&done();
  const host=$('.sheet.game');
  if(!host)return done&&done();
  const level=Math.min(Math.floor(streak/every)-1,STREAK_LINES.length-1);
  const el=document.createElement('div');
  el.className='streakCel';
  el.innerHTML=`<div class="scAv">${avatarSVG('avatar celebrating cel-3')}</div>
    <div class="scMsg">${STREAK_LINES[level](streak)}</div>`;
  host.appendChild(el);
  sfx('win');confetti(26);
  setTimeout(()=>{el.remove();done&&done();},2000);
}
export let LAST_GAME=null;
export function payout(coins,title){
  endTimer();
  const k=(MUT.G&&MUT.G.k)||LAST_GAME;LAST_GAME=k;
  S.coins+=coins;save();MUT.G=null;
  sfx(coins>0?'win':'err');if(coins>=20)confetti(40);
  modal(`<div class="sheet"><div style="font-size:46px">🏁</div><h2>${title}</h2>
    <p>הרווחת ${coins} מטבעות</p>
    <div class="endBtns">
      ${k?`<button class="btn btn-gold" data-again="${k}">שחק שוב</button>`:''}
      <button class="btn btn-ghost" data-act="close">סיום</button></div></div>`,{closable:false});
  render();
}
