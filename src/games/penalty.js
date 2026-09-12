import { $, modal } from '../core/dom.js';
import { GA } from '../games/assets.js';
import { MUT } from '../core/mut.js';
import { confetti, sfx } from '../core/fx.js';
import { pick, S, save } from '../core/state.js';

/* ======================= 4. דו-קרב פנדלים =======================
   השוער נשאר בגודל קבוע. הבסיס שלו במשבצת 5 והוא נוטה כמו מחוג
   לעבר המשבצת השנייה שהוא מכסה — חוץ מ-1+4 ו-3+6, שם הוא עומד בצד. */
export const KEEPER_POSES=[
  {cells:[5,2], rot:0,   dx:0},
  {cells:[5,1], rot:-46, dx:0},
  {cells:[5,3], rot:46,  dx:0},
  {cells:[5,4], rot:-88, dx:0},
  {cells:[5,6], rot:88,  dx:0},
  {cells:[1,4], rot:0,   dx:-30},
  {cells:[3,6], rot:0,   dx:30},
];
export const NET_L=5, NET_T=6, NET_W=90, NET_H=72;
export const cellBox=n=>{const c=(n-1)%3, r=((n-1)/3)|0, w=NET_W/3, h=NET_H/2;
  return {l:NET_L+c*w, t:NET_T+r*h, w, h, cx:NET_L+c*w+w/2, cy:NET_T+r*h+h/2};};

export const keeperSVG=`<svg viewBox="0 0 60 116">
  <circle cx="30" cy="15" r="12" fill="#F5D0AC"/>
  <path d="M18 12 a12 12 0 0 1 24 0 z" fill="#3A2A1C"/>
  <rect x="19" y="28" width="22" height="42" rx="9" fill="#2BD96A" stroke="#127A3C" stroke-width="1.5"/>
  <path d="M22 32 L5 8" stroke="#2BD96A" stroke-width="9" stroke-linecap="round"/>
  <path d="M38 32 L55 8" stroke="#2BD96A" stroke-width="9" stroke-linecap="round"/>
  <circle cx="5" cy="8" r="7" fill="#FFC83D" stroke="#B87700" stroke-width="1.5"/>
  <circle cx="55" cy="8" r="7" fill="#FFC83D" stroke="#B87700" stroke-width="1.5"/>
  <rect x="21" y="68" width="8" height="40" rx="4" fill="#123A72"/>
  <rect x="31" y="68" width="8" height="40" rx="4" fill="#123A72"/></svg>`;

/* רצף שערים ברציפות מזכה בפרס גדל: 7,7,10,10,15,15,15,20,20,25 — ומהרצף
   העשירי והלאה נשאר קבוע על 25. הפסקת רצף (עצירה) לא מסיימת את המשחק,
   רק מאפסת אותו — המשחק נמשך עד שהשחקן לוחץ "סיום". */
export const PEN_TIERS=[7,7,10,10,15,15,15,20,20,25];
export const penReward=streak=>PEN_TIERS[Math.min(streak,PEN_TIERS.length)-1];

export function startPenalty(){
  MUT.G={k:'penalty',coins:0,streak:0,shots:0,busy:false};
  const cells=[1,2,3,4,5,6].map(n=>{const b=cellBox(n);
    return `<button class="cell" data-cell="${n}" style="left:${b.l}%;top:${b.t}%;width:${b.w}%;height:${b.h}%">
      <span>${n}</span></button>`;}).join('');
  modal(`<div class="sheet game">
    <div class="ghud"><span id="pR">בעיטה 1</span><span id="pS">רצף 0</span><span id="pC">0 🪙</span></div>
    <h2 style="margin:2px 0 2px;font-size:21px">דו-קרב פנדלים</h2>
    <p id="pMsg" style="margin:0 0 6px">בחרו משבצת — השוער מכסה שתיים</p>
    <div class="goalwrap" id="pGoal">
      <div class="net"></div>
      ${cells}
      <div class="keeper" id="pKeeper">${keeperSVG}</div>
      <img class="pball" id="pBall" src="${GA.ball||''}" alt="">
    </div>
    <button class="btn btn-ghost" data-act="quit" style="width:100%">סיום</button></div>`,{closable:false});
  resetPenalty();
}
export function poseKeeper(p){
  const k=$('#pKeeper');if(!k)return;
  k.style.left=(34+p.dx)+'%';
  k.style.transform=`rotate(${p.rot}deg)`;
}
export function resetPenalty(){
  const b=$('#pBall');
  if(b){b.style.transition='none';b.style.left='43.5%';b.style.top='84%';b.style.width='13%';
        void b.offsetWidth;b.style.transition='';}
  poseKeeper(KEEPER_POSES[0]);
  document.querySelectorAll('.cell').forEach(c=>c.classList.remove('hot'));
}
export function shootPenalty(n){
  if(!MUT.G||MUT.G.busy||MUT.G.k!=='penalty')return;
  MUT.G.busy=true;
  const cell=cellBox(n);
  const pose=pick(KEEPER_POSES);
  const saved=pose.cells.includes(n);

  const el=document.querySelector(`[data-cell="${n}"]`);
  if(el)el.classList.add('hot');
  poseKeeper(pose);

  const b=$('#pBall');
  if(b){const AR=1.5,bw=8;
    b.style.width=bw+'%';
    b.style.left=(cell.cx-bw/2)+'%';
    b.style.top=(cell.cy-bw*AR/2)+'%';}

  setTimeout(()=>{
    if(!MUT.G||MUT.G.k!=='penalty')return;
    const m=$('#pMsg');
    if(saved){
      MUT.G.streak=0;sfx('err');
      if(m)m.innerHTML='<b style="color:#FF9A9C">השוער עצר! הרצף התאפס</b>';
    }else{
      MUT.G.streak++;const gain=penReward(MUT.G.streak);
      MUT.G.coins+=gain;S.stats.penaltyGoals++;save();sfx('win');confetti(MUT.G.streak>=10?30:18);
      if(m)m.innerHTML=`<b style="color:#8FE0A0">גול! +${gain} · רצף ${MUT.G.streak}</b>`;
      const c=$('#pC');if(c)c.textContent=MUT.G.coins+' 🪙';
      const s=$('#pS');if(s)s.textContent='רצף '+MUT.G.streak;
    }
    MUT.G.shots++;
    setTimeout(()=>{
      if(!MUT.G||MUT.G.k!=='penalty')return;
      const r=$('#pR');if(r)r.textContent='בעיטה '+(MUT.G.shots+1);
      if(m)m.textContent='בחרו משבצת — השוער מכסה שתיים';
      resetPenalty();MUT.G.busy=false;
    },1200);
  },700);
}
