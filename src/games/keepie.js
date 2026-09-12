import { $, modal } from '../core/dom.js';
import { MUT } from '../core/mut.js';
import { canvasPoint, drawPitch, payout, setupCanvas } from '../games/shared.js';
import { drawBallArt, drawLionArt } from '../games/assets.js';
import { S, save } from '../core/state.js';
import { sfx } from '../core/fx.js';

/* ======================= 5. הקפצות ======================= */
export function startKeepie(){
  modal(`<div class="sheet game"><div class="ghud"><span id="gs">0 הקפצות</span><span>🤹</span></div>
    <h2 style="margin:2px 0 8px;font-size:21px">הקפצות</h2>
    <canvas id="cv" class="gcanvas"></canvas>
    <p id="kHint" style="margin:9px 0 0;font-size:12.5px">הקישו על הכדור שעל הקו כדי להתחיל</p>
    <button class="btn btn-ghost" data-act="quit" style="width:100%;margin-top:8px">סיום</button></div>`,{closable:false});
  const s=setupCanvas(340);if(!s)return;
  MUT.G={k:'keepie',taps:0,coins:0,over:false,live:false};
  const B={x:s.w/2,y:0,vx:0,vy:0,r:24},line=s.h-34;
  B.y=line-B.r;                       /* הכדור מונח על הקו */
  let g=.30;

  const paint=()=>{
    const x=s.ctx;drawPitch(x,s.w,s.h);
    x.globalAlpha=.13;drawLionArt(x,s.w/2,s.h*.42,s.h*.26);x.globalAlpha=1;
    x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=2;x.setLineDash([7,7]);
    x.beginPath();x.moveTo(0,line);x.lineTo(s.w,line);x.stroke();x.setLineDash([]);
    if(!MUT.G.live){x.fillStyle='rgba(255,200,61,.22)';x.beginPath();x.arc(B.x,B.y,B.r+14,0,7);x.fill();}
    drawBallArt(x,B.x,B.y,B.r);
    x.fillStyle='#fff';x.font='700 24px Rubik';x.textAlign='center';x.fillText(MUT.G.taps,s.w/2,32);
  };
  paint();

  s.cv.addEventListener('pointerdown',e=>{
    if(MUT.G.over)return;
    const p=canvasPoint(s.cv,e);
    if(Math.hypot(p.x-B.x,p.y-B.y)>70)return;
    if(!MUT.G.live){                       /* ההקפצה הפותחת לא נספרת */
      MUT.G.live=true;B.vy=-10.5;sfx('pop');
      const h=$('#kHint');if(h)h.textContent='הקישו על הכדור לפני שיחצה את הקו';
      return loop();
    }
    if(B.y>s.h*.38){
      B.vy=-(9.6+Math.min(MUT.G.taps*.07,3));
      B.vx=Math.max(-4.5,Math.min(4.5,B.vx+(B.x-p.x)*.10));
      MUT.G.taps++;g=.30+Math.min(MUT.G.taps*.006,.22);sfx('pop');
      const el=$('#gs');if(el)el.textContent=MUT.G.taps+' הקפצות';
    }
  });
  function loop(){
    B.vy+=g;B.y+=B.vy;B.x+=B.vx;
    if(B.x<B.r){B.x=B.r;B.vx*=-.8;}
    if(B.x>s.w-B.r){B.x=s.w-B.r;B.vx*=-.8;}
    paint();
    if(B.y-B.r>line){MUT.G.over=true;
      S.stats.keepieBest=Math.max(S.stats.keepieBest,MUT.G.taps);save();
      return setTimeout(()=>payout(MUT.G.taps,MUT.G.taps>25?'הקפצן של המועדון!':'הכדור נפל'),1000);}
    MUT.RAF=requestAnimationFrame(loop);
  }
}
