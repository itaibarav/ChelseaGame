import { $, modal, toast } from '../core/dom.js';
import { MUT } from '../core/mut.js';
import { canvasPoint, drawPitch, endTimer, payout, setupCanvas } from '../games/shared.js';
import { drawBallArt, drawLionArt } from '../games/assets.js';
import { sfx } from '../core/fx.js';

/* ======================= 6. פיצוץ בועות ======================= */
export function startBubble(){
  modal(`<div class="sheet game"><div class="ghud"><span id="gt">⏱ 45s</span>
      <span id="gl">מהירות 1</span><span id="gs">0 נקודות</span></div>
    <h2 style="margin:2px 0 8px;font-size:21px">פיצוץ בועות</h2>
    <canvas id="cv" class="gcanvas"></canvas>
    <p style="margin:9px 0 0;font-size:12.5px">כדור = נקודה · אריה = שתיים · כרטיס אדום גוזל 5 שניות</p>
    <button class="btn btn-ghost" data-act="quit" style="width:100%;margin-top:8px">סיום</button></div>`,{closable:false});
  const s=setupCanvas(360);if(!s)return;
  MUT.G={k:'bubble',score:0,left:45,items:[],tier:0};
  let spawnAt=0;
  MUT.G.timer=setInterval(()=>{
    MUT.G.left--;
    const el=$('#gt');if(el)el.textContent='⏱ '+MUT.G.left+'s';
    const t=Math.min(6,Math.floor((45-MUT.G.left)/7));   /* האצה כל 7 שניות */
    if(t!==MUT.G.tier){MUT.G.tier=t;const l=$('#gl');if(l)l.textContent='מהירות '+(t+1);
      if(t>0)sfx('pop');}
    if(MUT.G.left<=0){MUT.G.over=true;endTimer();
      setTimeout(()=>payout(MUT.G.score,'הזמן נגמר'),1000);}
  },1000);
  s.cv.addEventListener('pointerdown',e=>{
    if(MUT.G.over)return;
    const p=canvasPoint(s.cv,e);
    for(let i=MUT.G.items.length-1;i>=0;i--){const it=MUT.G.items[i];
      if(Math.hypot(p.x-it.x,p.y-it.y)<it.r+10){
        MUT.G.items.splice(i,1);
        if(it.t==='red'){MUT.G.left=Math.max(1,MUT.G.left-5);sfx('err');toast('כרטיס אדום! -5 שניות');
          const el=$('#gt');if(el)el.textContent='⏱ '+MUT.G.left+'s';}
        else{sfx('pop');MUT.G.score+=it.t==='lion'?2:1;
          const el=$('#gs');if(el)el.textContent=MUT.G.score+' נקודות';}
        return;}}
  });
  (function loop(ts){
    ts=ts||0;
    const gap=Math.max(240,780-MUT.G.tier*95);
    if(ts-spawnAt>gap){spawnAt=ts;
      const r=Math.random(),t=r<.18?'red':r<.44?'lion':'ball',rad=t==='red'?18:21;
      MUT.G.items.push({x:rad+Math.random()*(s.w-rad*2),y:-26,r:rad,t,
        v:(1.6+Math.random()*1.4)*(1+MUT.G.tier*0.28)});}
    const x=s.ctx;drawPitch(x,s.w,s.h);
    MUT.G.items.forEach(it=>it.y+=it.v);
    MUT.G.items=MUT.G.items.filter(it=>it.y<s.h+42);
    MUT.G.items.forEach(it=>{
      if(it.t==='ball')drawBallArt(x,it.x,it.y,it.r);
      else if(it.t==='lion'){
        x.fillStyle='#F5F8FD';x.beginPath();x.arc(it.x,it.y,it.r,0,7);x.fill();
        x.strokeStyle='#034694';x.lineWidth=it.r*.22;x.stroke();
        drawLionArt(x,it.x,it.y,it.r*.62);}
      else{x.fillStyle='#E5252A';x.strokeStyle='#fff';x.lineWidth=2;
        x.beginPath();x.roundRect(it.x-it.r*.66,it.y-it.r,it.r*1.32,it.r*2,4);x.fill();x.stroke();}
    });
    MUT.RAF=requestAnimationFrame(loop);
  })();
}
