import { $ } from '../core/dom.js';
import { KITLBL, KITPAL } from '../data/cards.js';
import { KIT_STYLE, PHOTOS } from '../data/globals.js';
import { esc } from '../core/state.js';

/* ======================= ART ======================= */
export const coinSVG=(s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#E09800"/><circle cx="12" cy="11" r="9.2" fill="#FFD766"/><circle cx="12" cy="11" r="6.4" fill="#F0B21E"/><text x="12" y="15" font-size="9" font-family="Secular One" text-anchor="middle" fill="#7A4A00">₵</text></svg>`;
export const crestSVG=(c1,c2,txt)=>`<svg class="crest" viewBox="0 0 40 40"><path d="M20 2 36 7v16c0 8-8 13-16 15C12 36 4 31 4 23V7z" fill="${c1}" stroke="${c2}" stroke-width="2"/><text x="20" y="25" font-size="13" font-family="Secular One" text-anchor="middle" fill="#fff">${txt}</text></svg>`;

export const CFC_BLUE='#034694', CFC_GOLD='#D9B14A';
export const LION=(typeof window!=='undefined'&&window.GAME_ART&&window.GAME_ART.lion)||'';
export const LION_AR=144/190;   // יחס הרוחב-גובה של הקובץ החתוך
export const clubBadge=(cx,cy,r)=>{
  const h=r*1.12, w=h*LION_AR;
  const lion=LION
    ? `<image href="${LION}" x="${(-w/2).toFixed(2)}" y="${(-h/2).toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}"/>`
    : `<g transform="scale(${(r/12).toFixed(3)})" fill="${CFC_BLUE}">
         <path d="M-3.4 5.6 L-2.1 0.6 L-4.8 -0.4 L-3.8 -2.6 L-1.5 -1.7 L-2.0 -4.2 L-0.4 -5.6
                  L1.5 -5.1 L2.3 -3.1 L1.3 -1.7 L2.9 0.8 L3.5 3.4 L5.1 1.5 L5.5 3.3 L3.7 5.2 L3.3 5.6 Z"/>
         <circle cx="0.5" cy="-4.7" r="1.6"/></g>`;
  return `<g transform="translate(${cx.toFixed(2)} ${cy.toFixed(2)})">
    <circle r="${r.toFixed(2)}" fill="#F5F8FD" stroke="${CFC_BLUE}" stroke-width="${(r*0.26).toFixed(2)}"/>
    <circle r="${(r*1.17).toFixed(2)}" fill="none" stroke="${CFC_GOLD}" stroke-width="${(r*0.075).toFixed(2)}"/>
    ${lion}</g>`;
};

export function art(c,hideNum){
  const w=90,h=120,gid='g'+c.no;
  const ph=PHOTOS[c.id];
  if(c.cat==='squad'&&ph){
    return `<svg viewBox="0 0 ${w} ${h}"><defs>
      <clipPath id="cp${gid}"><rect width="${w}" height="${h}"/></clipPath>
      <linearGradient id="sh${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset=".40" stop-color="#04204F" stop-opacity="0"/>
        <stop offset=".72" stop-color="#04204F" stop-opacity=".75"/>
        <stop offset="1" stop-color="#04204F"/></linearGradient></defs>
      <rect width="${w}" height="${h}" fill="#0A2A5C"/>
      <image href="${ph}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMin slice" clip-path="url(#cp${gid})"/>
      <rect width="${w}" height="${h}" fill="url(#sh${gid})"/>
      ${hideNum||c.num==null?'':`<g><rect x="3.5" y="3.5" width="26" height="21" rx="5" fill="rgba(3,20,46,.82)" stroke="rgba(255,255,255,.35)" stroke-width=".8"/>
        <text x="16.5" y="19" font-size="14" font-family="Secular One" text-anchor="middle" fill="#fff">${c.num}</text></g>`}
      <text x="45" y="${h-15}" font-size="8.5" font-weight="700" text-anchor="middle" fill="#fff">${esc(c.name)}</text>
      <text x="45" y="${h-5}" font-size="7" text-anchor="middle" fill="#9FC4F5">${esc(c.pos||'')}</text></svg>`;}
  if(c.cat==='legend'&&ph){
    return `<svg viewBox="0 0 ${w} ${h}"><defs>
      <clipPath id="lp${gid}"><rect x="6" y="6" width="${w-12}" height="${h-12}"/></clipPath>
      <linearGradient id="lg${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset=".45" stop-color="#2A1B04" stop-opacity="0"/><stop offset="1" stop-color="#2A1B04"/></linearGradient></defs>
      <rect width="${w}" height="${h}" fill="#2A1B04"/>
      <image href="${ph}" x="6" y="6" width="${w-12}" height="${h-12}" preserveAspectRatio="xMidYMin slice" clip-path="url(#lp${gid})"/>
      <rect x="6" y="6" width="${w-12}" height="${h-12}" fill="url(#lg${gid})"/>
      <rect x="3" y="3" width="${w-6}" height="${h-6}" fill="none" stroke="#C9A227" stroke-width="1.6"/>
      <circle cx="45" cy="52" r="11" fill="rgba(0,0,0,.55)" stroke="#C9A227" stroke-width="1.2"/><path d="M42 47 l8 5 -8 5z" fill="#fff"/>
      <text x="45" y="${h-20}" font-size="8" font-weight="700" text-anchor="middle" fill="#FFF3C4">${esc(c.name)}</text>
      <text x="45" y="${h-9}" font-size="6.5" text-anchor="middle" fill="#C9A227">${esc(c.year)}</text></svg>`;}
  if(c.cat==='squad'){const lux=c.rarity==='luxury';
    return `<svg viewBox="0 0 ${w} ${h}"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${lux?'#2B5FA8':'#2C7DF0'}"/><stop offset="1" stop-color="#04204F"/></linearGradient></defs>
      <rect width="${w}" height="${h}" fill="url(#${gid})"/><circle cx="45" cy="46" r="30" fill="rgba(255,255,255,.09)"/>
      <text x="45" y="60" font-size="40" font-family="Secular One" text-anchor="middle" fill="#fff" opacity=".95">${hideNum?'?':c.num}</text>
      <rect y="${h-32}" width="${w}" height="32" fill="rgba(3,20,46,.85)"/>
      <text x="45" y="${h-17}" font-size="8.5" font-weight="700" text-anchor="middle" fill="#fff">${esc(c.name)}</text>
      <text x="45" y="${h-6}" font-size="7" text-anchor="middle" fill="#9FC4F5">${esc(c.pos)}</text></svg>`;}
  if(c.cat==='legend')
    return `<svg viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#2A1B04"/>
      <rect x="3" y="3" width="${w-6}" height="${h-6}" fill="none" stroke="#C9A227" stroke-width="1.6"/>
      <rect x="6" y="6" width="${w-12}" height="${h-12}" fill="#3A2A08"/>
      <circle cx="45" cy="44" r="24" fill="#5A430F"/><circle cx="45" cy="38" r="10" fill="#C9A227" opacity=".8"/>
      <path d="M30 60 q15 -12 30 0 v8 h-30z" fill="#C9A227" opacity=".8"/>
      <circle cx="45" cy="44" r="11" fill="rgba(0,0,0,.55)"/><path d="M42 39 l8 5 -8 5z" fill="#fff"/>
      <text x="45" y="${h-22}" font-size="8" font-weight="700" text-anchor="middle" fill="#FFF3C4">${esc(c.name)}</text>
      <text x="45" y="${h-11}" font-size="6.5" text-anchor="middle" fill="#C9A227">${esc(c.year)}</text></svg>`;
  if(c.cat==='trophy')
    return `<svg viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#0B2A5E"/>
      <path d="M30 22 h30 v18 a15 15 0 0 1 -30 0z" fill="#FFC83D"/>
      <path d="M30 26 h-7 a7 7 0 0 0 7 10z M60 26 h7 a7 7 0 0 1 -7 10z" fill="none" stroke="#FFC83D" stroke-width="2.5"/>
      <rect x="41" y="55" width="8" height="12" fill="#E09800"/><rect x="33" y="67" width="24" height="6" rx="1.5" fill="#FFC83D"/>
      <text x="45" y="${h-22}" font-size="7.5" font-weight="700" text-anchor="middle" fill="#fff">${esc(c.name)}</text>
      <text x="45" y="${h-10}" font-size="8" font-family="Secular One" text-anchor="middle" fill="#FFC83D">${esc(c.year)}</text></svg>`;
  if(c.cat==='kit'&&ph){
    return `<svg viewBox="0 0 ${w} ${h}"><defs>
      <clipPath id="kc${gid}"><rect width="${w}" height="${h}"/></clipPath>
      <linearGradient id="kg${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset=".58" stop-color="#04204F" stop-opacity="0"/>
        <stop offset=".82" stop-color="#04204F" stop-opacity=".8"/>
        <stop offset="1" stop-color="#04204F"/></linearGradient></defs>
      <rect width="${w}" height="${h}" fill="#0A2A5C"/>
      <image href="${ph}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#kc${gid})"/>
      <rect width="${w}" height="${h}" fill="url(#kg${gid})"/>
      <text x="45" y="${h-6}" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">${esc(c.name)}</text></svg>`;}
  if(c.cat==='kit'){const [a,b,t]=KITPAL[c.kit];
    return `<svg viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#08203F"/>
      <path d="M32 26 l-14 8 5 12 9-4 v42 h36 v-42 l9 4 5-12 -14-8 -9 5 -9 0z" fill="${a}" stroke="${b}" stroke-width="1.4"/>
      <path d="M41 26 a5 5 0 0 0 8 0" fill="none" stroke="${t}" stroke-width="1.6"/>
      <rect x="41" y="45" width="8" height="8" fill="${t}" opacity=".85"/>
      <text x="45" y="${h-19}" font-size="7.5" font-weight="700" text-anchor="middle" fill="#fff">${esc(KITLBL[c.kit])}</text>
      <text x="45" y="${h-8}" font-size="8" font-family="Secular One" text-anchor="middle" fill="#9FC4F5">${esc(c.year)}</text></svg>`;}
  if(c.cat!=='stadium'||ph){
    if(ph)return `<svg viewBox="0 0 ${w} ${h}"><defs>
      <clipPath id="xp${gid}"><rect width="${w}" height="${h}"/></clipPath>
      <linearGradient id="xg${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset=".45" stop-color="#04204F" stop-opacity="0"/><stop offset="1" stop-color="#04204F"/></linearGradient></defs>
      <rect width="${w}" height="${h}" fill="#0A2A5C"/>
      <image href="${ph}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#xp${gid})"/>
      <rect width="${w}" height="${h}" fill="url(#xg${gid})"/>
      <text x="45" y="${h-8}" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">${esc(c.name)}</text></svg>`;
    return `<svg viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#0B2A5E"/>
      <circle cx="45" cy="50" r="26" fill="rgba(255,255,255,.08)"/>
      ${clubBadge(45,50,17)}
      <text x="45" y="${h-8}" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">${esc(c.name)}</text></svg>`;
  }
  return `<svg viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#062B63"/>
    <rect y="70" width="${w}" height="50" fill="#2E8B3D"/><path d="M0 34 h90 v34 h-90z" fill="#0B3D6E"/>
    <g fill="#3E6FA8">${Array.from({length:7},(_,i)=>`<rect x="${4+i*12}" y="${38+(i%2)*4}" width="8" height="${26-(i%2)*4}" rx="1"/>`).join('')}</g>
    <rect x="6" y="16" width="18" height="9" rx="2" fill="#FFE9A8"/><rect x="66" y="16" width="18" height="9" rx="2" fill="#FFE9A8"/>
    <rect x="30" y="82" width="30" height="20" fill="none" stroke="#fff" stroke-width="1.2" opacity=".7"/>
    <text x="45" y="${h-6}" font-size="7.5" font-weight="700" text-anchor="middle" fill="#fff">${esc(c.name)}</text></svg>`;
}

/* --- layered avatar --- */
/* נעל כדורגל: מגף, פס הדגשה, סוליה ושישה פקקים */
export const scarfEmblem=(kind,cx,cy,r)=>{
  const gold=(typeof window!=='undefined'&&window.GAME_ART&&window.GAME_ART.lionGold)||'';
  if(kind==='gold'&&gold){const h=r*2.3,w=h*(155/200);
    return `<image href="${gold}" x="${(cx-w/2).toFixed(1)}" y="${(cy-h/2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"/>`;}
  return clubBadge(cx,cy,r);
};
export const scarfSVG=sc=>{
  const [a,b]=sc.pal, em=sc.emblem||'badge';
  return `<path d="M52 80 q18 12 36 0 l3 8 q-21 13 -42 0z" fill="${a}"/>
    <path d="M88 86 l11 36 h-12 l-7 -32z" fill="${a}"/>
    <rect x="53" y="82" width="34" height="3.2" fill="${b}"/>
    <rect x="53.5" y="87.5" width="33" height="2.2" fill="${b}" opacity=".8"/>
    <path d="M84.5 96 l11.5 0.4" stroke="${b}" stroke-width="2.6"/>
    <path d="M86.8 112 l11.4 0.4" stroke="${b}" stroke-width="2.6"/>
    <g stroke="${a}" stroke-width="1.5" stroke-linecap="round">
      <path d="M88 122 v4"/><path d="M91 122 v4.5"/><path d="M94 122 v4"/><path d="M97 122 v4.5"/></g>
    ${scarfEmblem(em,91.5,104,5.4)}`;
};
export const bootSVG=(x,p)=>`<g transform="translate(${x} 0)">
  <path d="M0 200 h15 q9 0 9 -5.4 v-2 q0 -4 -6.4 -4 h-11 q-6.6 1 -6.6 7z"
        fill="${p[0]}" stroke="${p[2]}" stroke-width="1.3" stroke-linejoin="round"/>
  <path d="M2.6 193.6 q7 -1.8 13 1.6" fill="none" stroke="${p[1]}" stroke-width="2.3" stroke-linecap="round"/>
  <path d="M4 197.6 h9" stroke="${p[1]}" stroke-width="1.5" stroke-linecap="round" opacity=".85"/>
  <path d="M0 200 h24 v2.5 q0 1.5 -2.2 1.5 h-19.6 q-2.2 0 -2.2 -1.5z" fill="${p[2]}"/>
  <g fill="${p[2]}">
    <rect x="1.4" y="203.6" width="3.3" height="3.6" rx="1.3"/>
    <rect x="7.2" y="203.6" width="3.3" height="3.6" rx="1.3"/>
    <rect x="13" y="203.6" width="3.3" height="3.6" rx="1.3"/>
    <rect x="18.8" y="203.6" width="3.3" height="3.6" rx="1.3"/></g>
  <g fill="${p[1]}" opacity=".9">
    <rect x="4.3" y="204.4" width="2" height="2" rx=".8"/>
    <rect x="16" y="204.4" width="2" height="2" rx=".8"/></g></g>`;

export function hatSVG(shape,p){
  const gold=(typeof window!=='undefined'&&window.GAME_ART&&window.GAME_ART.lionGold)||'';
  if(shape==='cap')return `<path d="M40 42 q0 -25 30 -25 q30 0 30 25 z" fill="${p[0]}"/>
    <path d="M96 40 q22 2 22 10 q-14 3 -24 -2z" fill="${p[1]}"/>
    <circle cx="70" cy="18" r="4" fill="${p[1]}"/>
    <path d="M40 42 q0 -25 30 -25 q30 0 30 25" fill="none" stroke="${p[1]}" stroke-width="1.4" opacity=".7"/>
    ${clubBadge(70,32,6.4)}`;
  if(shape==='bucket')return `<path d="M44 42 q0 -24 26 -24 q26 0 26 24 z" fill="${p[0]}"/>
    <rect x="44" y="30" width="52" height="7" fill="${p[1]}" opacity=".85"/>
    <path d="M32 40 h76 q2 10 -12 12 h-52 q-14 -2 -12 -12z" fill="${p[1]}"/>
    ${clubBadge(70,25,5.8)}`;
  if(shape==='crown')return `<path d="M42 42 l2 -26 12 12 14 -18 14 18 12 -12 2 26z" fill="${p[0]}" stroke="${p[1]}" stroke-width="2"/>
    <rect x="41" y="40" width="58" height="6" rx="2.5" fill="${p[1]}"/>
    ${LION?`<image href="${LION}" x="63" y="23" width="14" height="18"/>`
          :`<circle cx="70" cy="32" r="6" fill="${CFC_BLUE}"/>`}`;
  return `<path d="M40 42 q0 -26 30 -26 q30 0 30 26 z" fill="${p[0]}"/>
    <g stroke="${p[1]}" stroke-width="1.3" opacity=".55" fill="none">
      <path d="M52 20 v22"/><path d="M62 16.5 v25.5"/><path d="M78 16.5 v25.5"/><path d="M88 20 v22"/></g>
    <rect x="38" y="37" width="64" height="12" rx="5.5" fill="${p[1]}"/>
    ${clubBadge(70,43,5.4)}
    <circle cx="70" cy="14" r="6" fill="${p[0]}"/>`;
}
export function kitStyleOf(item){
  if(!item)return {body:'#2C6FE0',sleeve:'#2C6FE0',shorts:'#0C3A8C',socks:'#FFFFFF',trim:'#FFFFFF',line:'#0A2A5C'};
  const st=item.req&&KIT_STYLE[item.req];
  if(st)return st;
  const p=item.pal||['#2C6FE0','#0C3A8C','#FFFFFF'];
  return {body:p[0],sleeve:p[0],shorts:p[1],socks:p[2],trim:p[2],line:p[1]};
}
