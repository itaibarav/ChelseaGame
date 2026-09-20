import { $ } from '../core/dom.js';
import { BY_ID } from '../data/cards.js';
import { art } from '../art/cards.js';
import { drawBall } from '../games/shared.js';
import { equippedBall } from '../art/ball.js';
import { esc } from '../core/state.js';

/* ======================= נכסי משחק ======================= */
export const GA=(typeof window!=='undefined'&&window.GAME_ART)||{};
export const IMG={};
['ball','lion'].forEach(k=>{if(GA[k]){const i=new Image();i.src=GA[k];IMG[k]=i;}});
export const ready=k=>IMG[k]&&IMG[k].complete&&IMG[k].naturalWidth>0;
/* כל כדור נטען לפי הצורך (כדי לא לטעון מראש 5 תמונות), ונשמר במטמון לפי מפתח GAME_ART */
function ballImage(key){
  if(!IMG[key]&&GA[key]){const i=new Image();i.src=GA[key];IMG[key]=i;}
  return IMG[key];
}
export function drawBallArt(x,cx,cy,r){
  const key=equippedBall().art;
  ballImage(key);
  if(ready(key))return x.drawImage(IMG[key],cx-r,cy-r,r*2,r*2);
  drawBall(x,cx,cy,r);
}
export function drawLionArt(x,cx,cy,r){
  if(ready('lion')){const im=IMG.lion,h=r*2,w=h*im.naturalWidth/im.naturalHeight;
    x.drawImage(im,cx-w/2,cy-h/2,w,h);return;}
  x.fillStyle='#034694';x.beginPath();x.arc(cx,cy,r*.8,0,7);x.fill();
}
export const cardOf=id=>BY_ID[id];
export const gameCard=(card,hideNum,cls)=>
  `<div class="gamecard ${card.rarity==='luxury'?'lux':''} ${cls||''}">${art(card,hideNum)}</div>`;

/* כרטיס למשחק "קרב שווי" במצב עולמי — שחקן שאינו חלק מהאלבום, אז אין לו
   קלף אמיתי. באותו יחס גובה-רוחב ואותו "מסגרת" (gamecard) כמו קלף רגיל,
   כדי שהצד הימני/שמאלי של ההשוואה ייראו עקביים. בלי תמונה עדיין (לפני
   שהתמונות יובאו) מוצג כרטיס סגול גנרי במקום ריבוע שבור */
export function worldCard(p){
  const w=90,h=120,gid='gw'+p.id;
  const ph=p.photo||'';
  const inner=ph?`<svg viewBox="0 0 ${w} ${h}"><defs>
      <clipPath id="cp${gid}"><rect width="${w}" height="${h}"/></clipPath>
      <linearGradient id="sh${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset=".45" stop-color="#04204F" stop-opacity="0"/>
        <stop offset=".78" stop-color="#04204F" stop-opacity=".8"/>
        <stop offset="1" stop-color="#04204F"/></linearGradient></defs>
      <rect width="${w}" height="${h}" fill="#0A2A5C"/>
      <image href="${ph}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMin slice" clip-path="url(#cp${gid})"/>
      <rect width="${w}" height="${h}" fill="url(#sh${gid})"/>
      <text x="45" y="${h-9}" font-size="8.5" font-weight="700" text-anchor="middle" fill="#fff">${esc(p.name)}</text></svg>`
    :`<svg viewBox="0 0 ${w} ${h}"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6B2FB3"/><stop offset="1" stop-color="#1A0A38"/></linearGradient></defs>
      <rect width="${w}" height="${h}" fill="url(#${gid})"/>
      <text x="45" y="62" font-size="30" text-anchor="middle">&#127760;</text>
      <rect y="${h-24}" width="${w}" height="24" fill="rgba(3,20,46,.85)"/>
      <text x="45" y="${h-9}" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">${esc(p.name)}</text></svg>`;
  return `<div class="gamecard">${inner}</div>`;
}
