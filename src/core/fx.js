import { $ } from '../core/dom.js';
import { MUT } from '../core/mut.js';

/* ======================= FX ======================= */
export let AC=null;
export function sfx(kind){
  if(!MUT.SND)return;
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state==='suspended')AC.resume();
    const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();
    const M={pop:[520,900,.09,'triangle'],coin:[900,1500,.14,'square'],rip:[220,70,.3,'sawtooth'],
             win:[520,1050,.28,'triangle'],err:[240,150,.18,'sine']};
    const [f1,f2,d,w]=M[kind]||M.pop;
    o.type=w;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+d);
    g.gain.setValueAtTime(.11,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
    o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.03);
  }catch(e){}
}
export function confetti(n){
  const cols=['#FFC83D','#2C7DF0','#FFFFFF','#5FB0FF','#E5252A','#FFEDB0'];
  for(let i=0;i<(n||46);i++){
    const d=document.createElement('div');d.className='conf';
    d.style.left=(Math.random()*100)+'vw';
    d.style.background=cols[(Math.random()*cols.length)|0];
    d.style.animationDuration=(1.5+Math.random()*1.5)+'s';
    d.style.animationDelay=(Math.random()*.4)+'s';
    document.body.appendChild(d);
    setTimeout(()=>d.remove(),3800);
  }
}
export const raysSVG=col=>`<svg class="rays" viewBox="0 0 200 200">${Array.from({length:16},(_,i)=>
  `<path d="M100 100 L${100+96*Math.cos((i*22.5-6)*Math.PI/180)} ${100+96*Math.sin((i*22.5-6)*Math.PI/180)}
    L${100+96*Math.cos((i*22.5+6)*Math.PI/180)} ${100+96*Math.sin((i*22.5+6)*Math.PI/180)}z"
    fill="${col}" opacity="${i%2?.28:.5}"/>`).join('')}</svg>`;
export function packArtSVG(type){
  const gold=type==='gold';
  const c1=gold?'#FFDE87':'#3A8BFF',c2=gold?'#C87A00':'#0B3A8C',c3=gold?'#FFF6D8':'#DCEBFF';
  return `<svg viewBox="0 0 120 160">
    <defs><linearGradient id="pk" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset=".5" stop-color="${c2}"/><stop offset="1" stop-color="${c1}"/></linearGradient></defs>
    <rect x="6" y="6" width="108" height="148" rx="9" fill="url(#pk)" stroke="${c3}" stroke-width="2.5"/>
    <path d="M6 30 h108" stroke="${c3}" stroke-width="2" stroke-dasharray="5 4"/>
    <path d="M60 52 l30 9v26c0 15-15 24-30 28-15-4-30-13-30-28V61z" fill="rgba(255,255,255,.9)"/>
    <text x="60" y="104" font-size="26" font-family="Secular One" text-anchor="middle" fill="${c2}">CFC</text>
    <text x="60" y="140" font-size="13" font-family="Secular One" text-anchor="middle" fill="${c3}">5 STICKERS</text>
  </svg>`;
}
