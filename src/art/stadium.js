import { $ } from '../core/dom.js';
import { STADIUM } from '../data/cards.js';

/* ======================= STADIUM ======================= */
export function crowdLayer(y1,y2,rows,cols){
  let base='',flash='';
  for(let r=0;r<rows;r++){
    const y=(y1+(y2-y1)*(r+.5)/rows).toFixed(1);
    for(let i=0;i<cols;i++){
      const x=(6+i*(388/cols)+(r%2?4:0)).toFixed(1);
      const k=(i*7+r*5)%11;
      const c=k===0?'#E4EEFB':k<3?'#7FB4F0':k<6?'#3A6BB0':'#25538F';
      base+=`<circle cx="${x}" cy="${y}" r="2.05" fill="${c}"/>`;
      if((i*3+r*7)%23===0)flash+=`<circle cx="${x}" cy="${y}" r="2.6" fill="#FFF3C4"/>`;
    }
  }
  return `<g>${base}</g><g class="sparkle">${flash}</g>`;
}
export function stadiumBG(compact){
  const src=(typeof window!=='undefined'&&window.GAME_ART&&window.GAME_ART.stadium)||'';
  return src?`<img class="bg" src="${src}" alt="">`:stadiumSVG(compact);
}
export function stadiumSVG(compact){
  const seatText=compact?'':`<text x="200" y="123" font-size="17" font-family="Secular One" text-anchor="middle"
      fill="#E8F1FF" letter-spacing="9" opacity=".92">CHELSEA</text>`;
  return `<svg class="bg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04122C"/><stop offset="1" stop-color="#0D3670"/></linearGradient>
    <linearGradient id="tier" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#123F80"/><stop offset="1" stop-color="#062A5C"/></linearGradient>
    <linearGradient id="turf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E8C3F"/><stop offset="1" stop-color="#41B355"/></linearGradient>
    <linearGradient id="hoard" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B58BE"/><stop offset="1" stop-color="#04306E"/></linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="#DCEEFF" stop-opacity=".8"/><stop offset="1" stop-color="#DCEEFF" stop-opacity="0"/></radialGradient>
    <clipPath id="hclip"><rect x="0" y="176" width="400" height="17"/></clipPath>
  </defs>

  <rect width="400" height="300" fill="url(#sky)"/>
  <g class="flood"><ellipse cx="48" cy="30" rx="70" ry="46" fill="url(#glow)"/><ellipse cx="352" cy="30" rx="70" ry="46" fill="url(#glow)"/>
    <ellipse cx="200" cy="24" rx="90" ry="40" fill="url(#glow)" opacity=".7"/></g>

  <!-- roof -->
  <path d="M0 46 L34 24 H366 L400 46 V58 H0z" fill="#03102A"/>
  <g stroke="#0B2A56" stroke-width="1.4">${Array.from({length:13},(_,i)=>`<path d="M${18+i*30} 26 L${12+i*31} 46"/>`).join('')}</g>
  <path d="M0 56 H400 V60 H0z" fill="#5FB0FF" opacity=".25"/>
  <!-- floodlight banks -->
  ${[46,144,256,354].map(x=>`<g><rect x="${x-19}" y="16" width="38" height="11" rx="2" fill="#08203F"/>
     <g fill="#FFF6D0" class="flood">${Array.from({length:5},(_,i)=>`<rect x="${x-16+i*7}" y="18" width="5" height="7" rx="1"/>`).join('')}</g></g>`).join('')}
  <!-- flags -->
  ${[86,200,314].map((x,i)=>`<g class="flag" style="animation-delay:${i*.4}s" transform="translate(${x},24)">
     <rect x="0" y="-16" width="2" height="16" fill="#8FBFFF"/><path d="M2 -16 l16 4 -16 5z" fill="${i===1?'#FFC83D':'#5FB0FF'}"/></g>`).join('')}

  <!-- upper tier -->
  <path d="M6 60 H394 V96 H6z" fill="url(#tier)"/>
  ${crowdLayer(64,93,3,32)}
  <rect x="6" y="96" width="388" height="5" fill="#041C3E"/>
  <!-- middle tier (seat lettering) -->
  <rect x="6" y="101" width="388" height="30" fill="#0A3068"/>
  ${crowdLayer(104,129,3,32)}
  ${seatText}
  <rect x="6" y="131" width="388" height="5" fill="#041C3E"/>
  <!-- lower tier -->
  <path d="M6 136 H394 V172 H6z" fill="url(#tier)"/>
  ${crowdLayer(140,169,4,34)}
  <!-- big screen -->
  <g><rect x="298" y="62" width="76" height="42" rx="3" fill="#020C1E" stroke="#1B4E8C" stroke-width="2"/>
    <rect x="302" y="66" width="68" height="34" fill="#0C3A7E"/>
    <text x="336" y="88" font-size="15" font-family="Secular One" text-anchor="middle" fill="#7FE0A0">CFC</text></g>

  <!-- hoardings -->
  <rect x="0" y="176" width="400" height="17" fill="url(#hoard)"/>
  <g clip-path="url(#hclip)"><rect class="hoard-sweep" x="0" y="176" width="90" height="17"
     fill="rgba(255,255,255,.28)" transform="skewX(-20)"/></g>
  <g fill="#9FCBFF" opacity=".5">${Array.from({length:8},(_,i)=>`<rect x="${12+i*50}" y="182" width="26" height="4" rx="2"/>`).join('')}</g>

  <!-- pitch -->
  <rect y="193" width="400" height="107" fill="url(#turf)"/>
  <g fill="rgba(255,255,255,.055)">${[0,1,2,3].map(i=>{const y=193+i*i*5+i*11;const h=9+i*5;
    return `<rect x="0" y="${y}" width="400" height="${h}"/>`;}).join('')}</g>
  <g stroke="rgba(255,255,255,.5)" stroke-width="2" fill="none">
    <path d="M0 197 H400"/>
    <path d="M96 197 v20 h208 v-20"/>
    <path d="M140 197 v8 h120 v-8"/>
    <path d="M-30 300 L96 197 M430 300 L304 197"/>
    <path d="M186 224 a16 9 0 0 0 28 0"/>
  </g>
  <!-- goal -->
  <g><rect x="150" y="163" width="100" height="34" fill="rgba(255,255,255,.07)"/>
    <g stroke="rgba(255,255,255,.3)" stroke-width=".9">
      ${Array.from({length:11},(_,i)=>`<path d="M${150+i*10} 163 v34"/>`).join('')}
      ${Array.from({length:5},(_,i)=>`<path d="M150 ${165+i*8} h100"/>`).join('')}</g>
    <path d="M150 197 v-34 h100 v34" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/></g>
  <rect y="286" width="400" height="14" fill="rgba(0,0,0,.18)"/>
</svg>`;
}
