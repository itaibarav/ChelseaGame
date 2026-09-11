import { $ } from '../core/dom.js';
import { ITEMS } from '../data/cards.js';
import { KIT_DESIGN2, KIT_YEAR } from '../data/globals.js';
import { S, esc } from '../core/state.js';
import { bootSVG, clubBadge, hatSVG, kitStyleOf, scarfEmblem, scarfSVG } from '../art/cards.js';

/* ======================= עיצוב חולצות לדמות =======================
   כל ערכה מצוירת מדפוס + סימן יצרן + ספונסר, בסגנון הדמות.
   מה שלא מוגדר ידנית נגזר לפי תקופה: אדידס עד 2016/17 ואז נייקי,
   סמסונג עד 2014/15, יוקוהמה עד 2019/20, ואז Three.                */
export const KIT_DESIGN={
  'kit-2007-away':  {pattern:'solid', ink:'#141414'},
  'kit-2008-home':  {pattern:'pins',  pat:'#9CC2EE'},
  'kit-2009-home':  {pattern:'pins',  pat:'#8FB6E8'},
  'kit-2010-home':  {pattern:'pins',  pat:'#8FB6E8', trim:'#E03A3A'},
  'kit-2011-home':  {pattern:'hoops', pat:'#FFFFFF'},
  'kit-2011-third': {pattern:'yoke',  pat:'#0B2545', accent:'#F2D024', ink:'#0B2545'},
  'kit-2012-home':  {pattern:'hoops', pat:'#FFFFFF'},
  'kit-2012-away':  {pattern:'sash',  pat:'#8FD8F2', ink:'#123A72'},
  'kit-2013-home':  {pattern:'solid'},
  'kit-2014-home':  {pattern:'hoops', pat:'#FFFFFF'},
  'kit-2014-third': {pattern:'fade',  pat:'#6E9BD8'},
  'kit-2015-third': {pattern:'fade',  pat:'#767676'},
  'kit-2016-home':  {pattern:'pins',  pat:'#3E74DC'},
  'kit-2018-third': {pattern:'pins',  pat:'#DCEDF9', ink:'#1B3A5C'},
  'kit-2020-home':  {pattern:'solid', trim:'#141414'},
};
export const lum=hex=>{const c=(hex||'#000').replace('#','');
  const r=parseInt(c.slice(0,2),16)/255,g=parseInt(c.slice(2,4),16)/255,b=parseInt(c.slice(4,6),16)/255;
  return .2126*r+.7152*g+.0722*b;};
export const seasonOf=id=>KIT_YEAR[id]!=null?KIT_YEAR[id]:((id||'').match(/kit-(\d{4})/)?+RegExp.$1:2026);
export function designOf(item){
  const id=item&&item.req;
  const K=kitStyleOf(item);
  const y=seasonOf(id);
  const d=Object.assign({
    pattern:'solid',
    maker:y<=2005?'umbro':y<=2016?'adidas':'nike',
    sponsor:y<=2000?'AUTOGLASS':y<=2004?'Fly Emirates':y<=2007?'SAMSUNG mobile'
           :y<=2014?'SAMSUNG':y<=2019?'YOKOHAMA':y<=2023?'3':y<=2024?'BingX':'USDC',
  }, (id&&KIT_DESIGN[id])||{}, (id&&KIT_DESIGN2[id])||{});
  if(!id)d.sponsor='';   /* ערכת האימון היא ערכה גנרית בלי חסות משחק */
  d.ink=d.ink||(lum(K.body)>0.58?'#12233F':'#FFFFFF');
  d.pat=d.pat||(lum(K.body)>0.58?'#0B2545':'#FFFFFF');
  d.trim=d.trim||K.trim;
  return {K,d,y};
}

export let _kg=0;
export function shirtPattern(K,d){
  const X=46,Y=82,W=48,H=46,g='kg'+(++_kg);
  if(d.pattern==='pins')
    return Array.from({length:11},(_,i)=>
      `<path d="M${(X+3+i*4.2).toFixed(1)} ${Y} v${H}" stroke="${d.pat}" stroke-width="0.9" opacity=".42"/>`).join('');
  if(d.pattern==='hoops')
    return Array.from({length:6},(_,i)=>
      `<rect x="${X}" y="${Y+3+i*7.4}" width="${W}" height="3.4" fill="${d.pat}" opacity=".22"/>`).join('');
  if(d.pattern==='fade')
    return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${d.pat}" stop-opacity="0"/>
      <stop offset="1" stop-color="${d.pat}" stop-opacity=".85"/></linearGradient></defs>
      <rect x="${X}" y="${Y+14}" width="${W}" height="${H-14}" fill="url(#${g})"/>
      ${Array.from({length:9},(_,i)=>`<path d="M${(X+3+i*5.2).toFixed(1)} ${Y+16} v${H-16}" stroke="${K.body}" stroke-width="1.1" opacity=".55"/>`).join('')}`;
  if(d.pattern==='sash')
    return `<path d="M${X} ${Y+30} L${X+22} ${Y} h13 L${X} ${Y+42}z" fill="${d.pat}"/>`;
  if(d.pattern==='band2')
    return `<rect x="${X+W*0.30}" y="${Y}" width="${W*0.14}" height="${H}" fill="${d.pat}"/>
            <rect x="${X+W*0.46}" y="${Y}" width="${W*0.10}" height="${H}" fill="${d.pat2||'#141414'}"/>`;
  if(d.pattern==='hoopsLow')
    return Array.from({length:4},(_,i)=>
      `<rect x="${X}" y="${Y+H*0.52+i*5.4}" width="${W}" height="2.8" fill="${d.pat}" opacity=".30"/>`).join('');
  if(d.pattern==='grid'){
    const g='gd'+(++_kg);
    return `<defs><pattern id="${g}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <path d="M0 0 v7 M0 0 h7" stroke="${d.pat}" stroke-width="0.7" opacity=".55" fill="none"/></pattern></defs>
      <rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="url(#${g})"/>`;}
  if(d.pattern==='smoke'){
    const g='sm'+(++_kg);
    return `<defs><radialGradient id="${g}" cx=".5" cy=".45" r=".7">
      <stop offset="0" stop-color="${d.pat}" stop-opacity=".55"/>
      <stop offset=".55" stop-color="${d.pat}" stop-opacity=".18"/>
      <stop offset="1" stop-color="${d.pat}" stop-opacity="0"/></radialGradient></defs>
      <rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="url(#${g})"/>
      <g fill="none" stroke="${d.pat}" stroke-width="1.6" opacity=".38" stroke-linecap="round">
        <path d="M${X+6} ${Y+38} q10 -14 20 -4 q10 10 18 -6"/>
        <path d="M${X+4} ${Y+22} q12 -10 22 0 q10 10 20 -4"/>
        <path d="M${X+8} ${Y+16} q14 12 26 2"/></g>`;}
  if(d.pattern==='band')
    return `<rect x="${X+W*0.30}" y="${Y}" width="${W*0.16}" height="${H}" fill="${d.pat}"/>
            <rect x="${X+W*0.27}" y="${Y}" width="${W*0.03}" height="${H}" fill="${d.accent||d.trim}"/>
            <rect x="${X+W*0.46}" y="${Y}" width="${W*0.03}" height="${H}" fill="${d.accent||d.trim}"/>`;
  if(d.pattern==='yoke')
    return `<rect x="${X}" y="${Y}" width="${W}" height="12" fill="${d.pat}"/>
            <rect x="${X}" y="${Y+12}" width="${W}" height="5" fill="${d.accent||'#F2D024'}"/>`;
  return '';
}
export const ADIDAS=(ink)=>`<g stroke="${ink}" stroke-width="1.5" stroke-linecap="round" opacity=".95">
  <path d="M44.5 84.5 L32.5 91.5"/><path d="M45.8 88.5 L34.2 95.4"/><path d="M47 92.5 L36 99"/></g>
  <g stroke="${ink}" stroke-width="1.5" stroke-linecap="round" opacity=".95">
  <path d="M95.5 84.5 L107.5 91.5"/><path d="M94.2 88.5 L105.8 95.4"/><path d="M93 92.5 L104 99"/></g>`;
export const NIKE=(ink)=>`<path transform="translate(53 89) scale(0.9)" fill="${ink}"
  d="M0 3.6 C1.2 4.5 2.6 4.1 4.4 3.0 L10.5 0 C9 2 6.8 3.4 4.1 4.4 C2.2 5.1 0.6 4.8 0 3.6z"/>`;
export const UMBRO=(ink)=>`<g fill="none" stroke="${ink}" stroke-width="1.7">
  <path d="M55 91 l4 -4 4 4 -4 4z"/><path d="M60.5 91 l4 -4 4 4 -4 4z"/></g>`;
export function kitBadge(d){
  const gold=(typeof window!=='undefined'&&window.GAME_ART&&window.GAME_ART.lionGold)||'';
  if(d.badge==='goldLion'&&gold)
    return `<image href="${gold}" x="75" y="86" width="11" height="14"/>`;
  return clubBadge(81,92,6.6);
}
export function shirtCuffs(d){
  let o='';
  if(d.cuff){
    o+=`<path d="M31.5 116.5 l9.5 -4" stroke="${d.cuff}" stroke-width="4.4" stroke-linecap="round"/>`;
    o+=`<path d="M108.5 116.5 l-9.5 -4" stroke="${d.cuff}" stroke-width="4.4" stroke-linecap="round"/>`;
  }
  if(d.edge)o+=`<path d="M62 82 a9 9 0 0 0 16 0" fill="none" stroke="${d.edge}" stroke-width="1.1"/>`;
  return o;
}
export function shirtDecor(K,d){
  const maker=d.maker==='adidas'?ADIDAS(d.ink):d.maker==='nike'?NIKE(d.ink)
             :d.maker==='umbro'?UMBRO(d.ink):'';
  const sp=d.sponsor?(d.sponsor==='3'
    ? `<text x="70" y="115" font-size="13" font-family="Secular One" text-anchor="middle" fill="${d.ink}" opacity=".95">3</text>`
    : `<text x="70" y="113" font-size="5.6" font-family="Rubik" font-weight="700" text-anchor="middle"
         fill="${d.ink}" textLength="${Math.min(38,d.sponsor.length*3.6)}" lengthAdjust="spacingAndGlyphs">${esc(d.sponsor)}</text>`):'';
  return maker+sp;
}

export function avatarSVG(cls){
  const kit=ITEMS[S.eq.kit]||ITEMS['av-kit-base'];
  const {K,d:D}=designOf(kit);
  const bt=ITEMS[S.eq.boots], hat=S.eq.hat?ITEMS[S.eq.hat]:null, sc=S.eq.scarf?ITEMS[S.eq.scarf]:null;
  const BP=(bt&&bt.pal&&bt.pal.length>2)?bt.pal:['#1E5BE0','#FFFFFF','#0B2E7A'];
  const leg=(x,sx,bx)=>`
    <rect x="${x}" y="150" width="14" height="46" rx="6" fill="#F0C9A4"/>
    <rect x="${sx}" y="150" width="18" height="30" rx="5" fill="${K.socks}" stroke="${K.line}" stroke-width="1"/>
    <rect x="${sx}" y="152" width="18" height="4" fill="${D.trim}" opacity=".9"/>
    ${bootSVG(bx-1,BP)}`;
  return `<svg class="${cls||'avatar'}" viewBox="0 0 140 232" data-cel="1">
    <ellipse class="shadow" cx="70" cy="224" rx="42" ry="8" fill="rgba(0,0,0,.3)"/>
    <g class="rig">
      <g class="leg l">${leg(53,51,48)}</g>
      <g class="leg r">${leg(73,71,70)}</g>
      <g class="torso">
        <path d="M46 128 h48 v28 h-19 l-5 -12 -5 12 h-19z" fill="${K.shorts}" stroke="${K.line}" stroke-width="1.4"/>
        <path d="M46 148 h19 M75 148 h19" stroke="${D.trim}" stroke-width="2" opacity=".75"/>
        <path d="M46 82 l-16 9 6 20 10 -4z" fill="${K.sleeve}" stroke="${K.line}" stroke-width="1.3"/>
        <path d="M94 82 l16 9 -6 20 -10 -4z" fill="${K.sleeve}" stroke="${K.line}" stroke-width="1.3"/>
        <path d="M46 82 h48 v46 h-48z" fill="${K.body}"/>
        ${shirtPattern(K,D)}
        <path d="M46 82 h48 v46 h-48z" fill="none" stroke="${K.line}" stroke-width="1.4"/>
        <path d="M62 82 a9 9 0 0 0 16 0" fill="none" stroke="${D.trim}" stroke-width="2.6"/>
        ${shirtDecor(K,D)}
        ${shirtCuffs(D)}
        ${kit.req?kitBadge(D):''}
        ${sc?scarfSVG(sc):''}
      </g>
      <g class="arm l"><rect x="26" y="96" width="12" height="34" rx="6" fill="#F0C9A4"/></g>
      <g class="arm r"><rect x="102" y="96" width="12" height="34" rx="6" fill="#F0C9A4"/></g>
      <g class="coldarms">
        <g class="ca a">
          <path d="M34 101 L98 106" fill="none" stroke="#F0C9A4" stroke-width="12.5" stroke-linecap="round"/>
          <circle cx="98" cy="106" r="7.2" fill="#F5D0AC" stroke="#DDA97F" stroke-width=".8"/></g>
        <g class="ca b">
          <path d="M106 103 L42 108" fill="none" stroke="#EFC6A0" stroke-width="12.5" stroke-linecap="round"/>
          <circle cx="42" cy="108" r="7.2" fill="#F5D0AC" stroke="#DDA97F" stroke-width=".8"/></g>
      </g>
      <g class="head">
        <circle cx="70" cy="56" r="30" fill="#F5D0AC"/>
        <ellipse cx="59" cy="55" rx="4.5" ry="5.5" fill="#2A2118"/><ellipse cx="81" cy="55" rx="4.5" ry="5.5" fill="#2A2118"/>
        <circle cx="60.5" cy="53" r="1.6" fill="#fff"/><circle cx="82.5" cy="53" r="1.6" fill="#fff"/>
        <path d="M62 68 q8 6 16 0" fill="none" stroke="#B4795A" stroke-width="2.4" stroke-linecap="round"/>
        <ellipse cx="48" cy="63" rx="5" ry="3.5" fill="#F0A98C" opacity=".5"/>
        <ellipse cx="92" cy="63" rx="5" ry="3.5" fill="#F0A98C" opacity=".5"/>
        <path d="M42 46 q6 -22 28 -22 q22 0 28 22 q-14 -9 -28 -9 q-14 0 -28 9z" fill="#3A2A1C"/>
        ${hat?hatSVG(hat.shape,hat.pal):''}
      </g>
    </g>
  </svg>`;
}
export function itemThumb(it){
  const p=it.pal;
  if(it.layer==='kit'){const {K,d:D}=designOf(it);
    const pat=D.pattern==='pins'?Array.from({length:5},(_,i)=>`<path d="M${23+i*3.4} 14 v30" stroke="${D.pat}" stroke-width=".7" opacity=".45"/>`).join('')
      :D.pattern==='hoops'?Array.from({length:4},(_,i)=>`<rect x="21" y="${17+i*7}" width="18" height="2.4" fill="${D.pat}" opacity=".28"/>`).join('')
      :D.pattern==='sash'?`<path d="M21 34 L33 14 h6 L21 44z" fill="${D.pat}"/>`
      :D.pattern==='yoke'?`<rect x="21" y="14" width="18" height="5" fill="${D.pat}"/><rect x="21" y="19" width="18" height="2" fill="${D.accent||'#F2D024'}"/>`
      :D.pattern==='fade'?`<rect x="21" y="26" width="18" height="18" fill="${D.pat}" opacity=".55"/>`:'';
    return `<svg viewBox="0 0 60 60">
      <path d="M21 14 l-9 5 3 8 6 -3z" fill="${K.sleeve}" stroke="${K.line}" stroke-width="1"/>
      <path d="M39 14 l9 5 -3 8 -6 -3z" fill="${K.sleeve}" stroke="${K.line}" stroke-width="1"/>
      <path d="M21 14 h18 v30 h-18z" fill="${K.body}"/>${pat}
      <path d="M21 14 h18 v30 h-18z" fill="none" stroke="${K.line}" stroke-width="1.2"/>
      <path d="M27 14 a4 4 0 0 0 6 0" fill="none" stroke="${D.trim}" stroke-width="1.8"/>
      <rect x="24" y="46" width="12" height="9" rx="2" fill="${K.shorts}" stroke="${K.line}" stroke-width="1"/></svg>`;}
  if(it.layer==='hat')return `<svg viewBox="0 0 140 60"><g transform="translate(0,4)">${hatSVG(it.shape,p)}</g></svg>`;
  if(it.layer==='scarf')return `<svg viewBox="0 0 60 60">
    <path d="M8 18 q22 13 44 0 l3 9 q-25 14 -50 0z" fill="${p[0]}"/>
    <rect x="9" y="20.5" width="42" height="3.6" fill="${p[1]}"/>
    <path d="M50 25 l7 27 h-12 l-4 -22z" fill="${p[0]}"/>
    <path d="M44 34 l11 .4" stroke="${p[1]}" stroke-width="2.4"/>
    <path d="M46 46 l10 .4" stroke="${p[1]}" stroke-width="2.4"/>
    <g transform="translate(0 -64) scale(0.62)">${scarfEmblem(it.emblem||'badge',80,166,8.6)}</g></svg>`;
  /* הנעל מצוירת סביב y=187..207 בתיבת האוואטר, אז צריך להזיז ואז להגדיל */
  const bp=p.length>2?p:[p[0],p[1],p[1]];
  return `<svg viewBox="0 0 60 60">
    <path d="M2 53 h56" stroke="rgba(255,255,255,.18)" stroke-width="2" stroke-linecap="round"/>
    <g transform="scale(2.19) translate(2 -184.3)">${bootSVG(0,bp)}</g></svg>`;
}

export const NAV_ICONS={
  home:'<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 2.5 11h3v9h5v-6h3v6h5v-9h3z"/></svg>',
  album:'<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3h13a2 2 0 0 1 2 2v16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 4v6h9V7z"/></svg>',
  games:'<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7 8h10a5 5 0 0 1 0 10 4 4 0 0 1-3-1.4h-4A4 4 0 0 1 7 18a5 5 0 0 1 0-10zm-1 3v2H4v2h2v2h2v-2h2v-2H8v-2zm10 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>',
  shop:'<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 7V6a6 6 0 0 1 12 0v1h3v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zm2 0h8V6a4 4 0 0 0-8 0z"/></svg>',
  news:'<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h13v16H5a1 1 0 0 1-1-1zm3 3v4h7V7zm0 6v2h7v-2zM19 8h2v10a2 2 0 0 1-2 2z"/></svg>'
};
