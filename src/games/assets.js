import { $ } from '../core/dom.js';
import { BY_ID } from '../data/cards.js';
import { art } from '../art/cards.js';
import { drawBall } from '../games/shared.js';

/* ======================= נכסי משחק ======================= */
export const GA=(typeof window!=='undefined'&&window.GAME_ART)||{};
export const IMG={};
['ball','lion'].forEach(k=>{if(GA[k]){const i=new Image();i.src=GA[k];IMG[k]=i;}});
export const ready=k=>IMG[k]&&IMG[k].complete&&IMG[k].naturalWidth>0;
export function drawBallArt(x,cx,cy,r){
  if(ready('ball'))x.drawImage(IMG.ball,cx-r,cy-r,r*2,r*2);
  else drawBall(x,cx,cy,r);
}
export function drawLionArt(x,cx,cy,r){
  if(ready('lion')){const im=IMG.lion,h=r*2,w=h*im.naturalWidth/im.naturalHeight;
    x.drawImage(im,cx-w/2,cy-h/2,w,h);return;}
  x.fillStyle='#034694';x.beginPath();x.arc(cx,cy,r*.8,0,7);x.fill();
}
export const cardOf=id=>BY_ID[id];
export const gameCard=(card,hideNum,cls)=>
  `<div class="gamecard ${card.rarity==='luxury'?'lux':''} ${cls||''}">${art(card,hideNum)}</div>`;
