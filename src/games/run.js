import { $, modal } from '../core/dom.js';
import { MUT } from '../core/mut.js';
import { avatarSVG } from '../art/avatar.js';
import { payout } from '../games/shared.js';
import { S, save } from '../core/state.js';
import { sfx } from '../core/fx.js';
import { startBubble } from '../games/bubble.js';
import { startKeepie } from '../games/keepie.js';
import { startMemory } from '../games/memory.js';
import { startPenalty } from '../games/penalty.js';
import { startRPS } from '../games/rps.js';
import { startShellGame } from '../games/shell.js';
import { startShirt } from '../games/shirt.js';
import { startTTT } from '../games/ttt.js';
import { startValue } from '../games/value.js';

/* ======================= 9. ריצת סטמפורד =======================
   רץ אינסופי. הדמות עומדת בצד ימין ורצה שמאלה, והקונוסים באים לקראתה.
   הקשה בכל מקום בשטח המשחק קופצת. מטבע לכל קונוס שעברת. */
export const CONE_SVG=`<svg viewBox="0 0 40 46">
  <ellipse cx="20" cy="42" rx="17" ry="4" fill="rgba(0,0,0,.25)"/>
  <path d="M20 3 L31 40 H9z" fill="#F26A21" stroke="#B8410A" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M14 26 h12 l1.6 6 h-15.2z" fill="#FFF3E0"/>
  <rect x="5" y="39" width="30" height="6" rx="2.5" fill="#F26A21" stroke="#B8410A" stroke-width="1.4"/></svg>`;

export function startRun(){
  const bg=(typeof window!=='undefined'&&window.GAME_ART&&window.GAME_ART.stadium)||'';
  modal(`<div class="sheet game">
    <div class="ghud"><span id="uD">0 מ׳</span><span id="uS">מהירות 1</span><span id="uC">0 🪙</span></div>
    <div class="grecord">שיא: ${S.stats.runBest} מ׳</div>
    <h2 style="margin:2px 0 6px;font-size:21px">ריצת סטמפורד</h2>
    <div class="runScene" id="rScene">
      ${bg?`<img class="bg" src="${bg}" alt="">`:''}
      <div class="rgrass"></div>
      <div class="robs" id="rObs"></div>
      <div class="runner" id="rRun">${avatarSVG('runner')}</div>
      <div class="rhint" id="rHint">הקישו כדי לצאת לדרך</div>
    </div>
    <p class="runTip">הקישו בכל מקום על המגרש כדי לקפוץ מעל הקונוסים</p>
    <div class="runQuit"><button class="btn btn-ghost" data-act="quit" style="width:100%">סיום</button></div></div>`,{closable:false});

  const sc=$('#rScene'),obsBox=$('#rObs'),run=$('#rRun');
  if(!sc)return;
  const W=sc.clientWidth||360, H=sc.clientHeight||320;
  const GROUND=H*0.80;
  const RH=H*0.58, RW=RH*140/232;      /* יחס תיבת הציור — אחרת הדמות מרחפת */
  const FEET=208/232;                  /* תחתית הנעליים בתוך תיבת הציור */
  const RX=W*0.78-RW/2;                /* עומד בצד ימין */

  run.style.width=RW+'px';run.style.height=RH+'px';
  run.style.left=RX+'px';run.style.top=(GROUND-RH*FEET)+'px';

  MUT.G={k:'run',coins:0,dist:0,tier:0,over:false,live:false,
     y:0,vy:0,air:false,obs:[],nextAt:W*0.55,v:W*0.46,last:0};
  const V0=H*1.65, GRAV=H*4.0;         /* שיא ~0.34H, ריחוף ~0.82 שניות */

  const CW=H*0.11, CH=H*0.13;
  const spawnOne=(offset=0)=>{
    const el=document.createElement('div');
    el.className='ob cone';
    el.style.width=CW+'px';el.style.height=CH+'px';el.style.top=(GROUND-CH)+'px';
    el.innerHTML=CONE_SVG;
    obsBox.appendChild(el);
    MUT.G.obs.push({el,x:-CW-10-offset,scored:false});
  };
  /* ממהירות 5 (tier 4) ואילך: לפעמים שני קונוסים מגיעים צמודים זה לזה,
     כזוג שקופצים מעליו בקפיצה אחת (לא שתי קפיצות נפרדות). ממהירות 6
     (tier 5) ואילך, לפעמים הזוג הזה מתארך לשלישייה צמודה באותו האופן */
  const spawn=()=>{
    spawnOne();
    if(MUT.G.tier>=4&&Math.random()<0.35){
      const gapPx=CW*(0.35+Math.random()*0.35);
      spawnOne(gapPx);
      if(MUT.G.tier>=5&&Math.random()<0.4){
        const gap2Px=CW*(0.35+Math.random()*0.35);
        spawnOne(gapPx+gap2Px);
      }
    }
  };

  const jump=()=>{if(!MUT.G.live||MUT.G.over||MUT.G.air)return;MUT.G.vy=-V0;MUT.G.air=true;run.classList.add('air');sfx('pop');};
  MUT.G.jump=jump;

  const begin=()=>{
    if(MUT.G.live)return;
    MUT.G.live=true;run.classList.add('go');
    const h=$('#rHint');if(h)h.style.display='none';
    MUT.G.last=performance.now();loop(MUT.G.last);
  };
  sc.addEventListener('pointerdown',()=>{MUT.G.live?jump():begin();});

  const die=()=>{
    MUT.G.over=true;run.classList.remove('go','air');sfx('err');
    S.stats.runBest=Math.max(S.stats.runBest,Math.round(MUT.G.dist));save();
    payout(MUT.G.coins,MUT.G.dist>400?'ריצה מעולה!':'נתקלת בקונוס');
  };

  function loop(ts){
    if(!MUT.G||MUT.G.k!=='run'||MUT.G.over)return;
    const dt=Math.min(50,ts-MUT.G.last)/1000;MUT.G.last=ts;

    MUT.G.dist+=MUT.G.v*dt/12;
    const tier=Math.min(9,Math.floor(MUT.G.dist/80));
    if(tier!==MUT.G.tier){MUT.G.tier=tier;MUT.G.v=W*(0.46+tier*0.07);
      const s=$('#uS');if(s)s.textContent='מהירות '+(tier+1);sfx('pop');}
    run.style.setProperty('--rd',Math.max(.20,.42-MUT.G.tier*.022)+'s');

    if(MUT.G.air){
      MUT.G.vy+=GRAV*dt;MUT.G.y+=MUT.G.vy*dt;
      if(MUT.G.y>=0){MUT.G.y=0;MUT.G.vy=0;MUT.G.air=false;run.classList.remove('air');}
    }
    run.style.transform='translateY('+MUT.G.y+'px)';

    /* הקונוסים באים משמאל לקראת הרץ */
    MUT.G.nextAt-=MUT.G.v*dt;
    if(MUT.G.nextAt<=0){spawn();MUT.G.nextAt=MUT.G.v*(1.15+Math.random()*0.8);}
    const rTop=GROUND-RH+MUT.G.y, rBot=GROUND+MUT.G.y;
    const bodyL=RX+RW*0.30, bodyR=RX+RW*0.70;
    for(let i=MUT.G.obs.length-1;i>=0;i--){
      const o=MUT.G.obs[i];
      o.x+=MUT.G.v*dt;
      o.el.style.transform='translateX('+o.x+'px)';
      if(o.x>bodyL-CW&&o.x<bodyR&&rBot>GROUND-CH&&rTop<GROUND)return die();
      if(!o.scored&&o.x>bodyR){o.scored=true;MUT.G.coins++;sfx('coin');
        const c=$('#uC');if(c)c.textContent=MUT.G.coins+' 🪙';}
      if(o.x>W+80){o.el.remove();MUT.G.obs.splice(i,1);}
    }
    const d=$('#uD');if(d)d.textContent=Math.round(MUT.G.dist)+' מ׳';
    MUT.RAF=requestAnimationFrame(loop);
  }
}

export const GAME_START={shirt:startShirt,value:startValue,memory:startMemory,penalty:startPenalty,
  rps:startRPS,ttt:startTTT,bubble:startBubble,keepie:startKeepie,run:startRun,shell:startShellGame};
