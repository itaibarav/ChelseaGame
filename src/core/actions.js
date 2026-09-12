import { $, closeModal, modal, stickerHTML, toast } from '../core/dom.js';
import { ALL_IDS, BY_ID, COMMON_POOL, ITEMS, KIT_POOL, LEGEND_POOL, LUX_ONLY, PACKS, RARE_ONLY, RARE_POOL } from '../data/cards.js';
import { MUT } from '../core/mut.js';
import { S, esc, got, pick, save, shuffle } from '../core/state.js';
import { art, coinSVG } from '../art/cards.js';
import { avatarSVG } from '../art/avatar.js';
import { confetti, packArtSVG, raysSVG, sfx } from '../core/fx.js';
import CARD_VIDEOS from '../data/cardVideos.js';
import { PHOTOS } from '../data/globals.js';
import { render } from '../core/router.js';
import { stadiumBG } from '../art/stadium.js';

/* ======================= ACTIONS ======================= */
export function openPack(type){
  const p=PACKS.find(x=>x.t===type);
  if(S.coins<p.p)return toast('אין מספיק מטבעות');
  S.coins-=p.p;

  /* אותו קלף לא יוצא פעמיים באותה מעטפה */
  const used=new Set();
  const uniquePick=(pool,fallback)=>{
    let free=pool.filter(id=>!used.has(id));
    if(!free.length&&fallback)free=fallback.filter(id=>!used.has(id));
    if(!free.length)free=ALL_IDS.filter(id=>!used.has(id));
    const id=pick(free.length?free:pool);
    used.add(id);
    return id;
  };
  const rollUnique=o=>{
    const r=Math.random();
    const pool=r<o.l?LUX_ONLY:r<o.l+o.r?RARE_ONLY:COMMON_POOL;
    return uniquePick(pool,COMMON_POOL);
  };

  const order=shuffle([0,1,2,3,4]),res={};
  if(type==='gold')res[order[0]]=()=>uniquePick(RARE_POOL,COMMON_POOL);
  if(type==='legend')res[order[0]]=()=>uniquePick(LEGEND_POOL,RARE_ONLY);
  if(type==='kit'){res[order[0]]=()=>uniquePick(KIT_POOL,COMMON_POOL);
                   res[order[1]]=()=>uniquePick(KIT_POOL,COMMON_POOL);}
  const o=type==='gold'?{l:.06,r:.24}:{l:.015,r:.085},slots=[];
  for(let i=0;i<5;i++)slots.push(res[i]?res[i]():rollUnique(o));

  const fresh=slots.map(id=>!got(id));
  slots.forEach(id=>S.inv[id]=(S.inv[id]||0)+1);
  MUT.NEW_IDS=new Set(slots.filter((id,i)=>fresh[i]));
  save();
  MUT.PK={p,slots,fresh,i:-1};
  renderPack();render();
}
export const RLBL={common:'מדבקה רגילה',rare:'קלף אגדה נדיר',luxury:'לוקסוס הולוגרפי'};
export function renderPack(){
  if(!MUT.PK)return;
  if(MUT.PK.i<0){
    return modal(`<div class="sheet"><h2>${MUT.PK.p.n}</h2><p>${MUT.PK.p.d}</p>
      <div class="packstage"><button class="envelope" data-pk="open">${packArtSVG(MUT.PK.p.t)}</button></div>
      <p class="tap-hint">הקישו על המעטפה כדי לקרוע אותה</p></div>`);
  }
  if(MUT.PK.i>=5){
    const lux=MUT.PK.slots.some(id=>BY_ID[id].rarity==='luxury');
    const n=MUT.PK.fresh.filter(Boolean).length;
    return modal(`<div class="sheet"><div style="font-size:40px">${lux?'&#127775;':'&#10024;'}</div>
      <h2>${n} מדבקות חדשות</h2><p>מתוך 5 שנפתחו</p>
      <div class="reveal">${MUT.PK.slots.map((id,i)=>`<div class="rv" style="animation-delay:${i*.08}s">${stickerHTML(BY_ID[id],true)}</div>`).join('')}</div>
      <button class="btn btn-gold" data-pk="done" style="width:100%">לאלבום</button></div>`);
  }
  const id=MUT.PK.slots[MUT.PK.i],c=BY_ID[id],isNew=MUT.PK.fresh[MUT.PK.i];
  const rayCol=c.rarity==='luxury'?'#FFD766':c.rarity==='rare'?'#C9A227':'#5FB0FF';
  modal(`<div class="sheet" data-pk="next">
    <div class="pipdots">${[0,1,2,3,4].map(i=>`<i class="${i<=MUT.PK.i?'on':''}"></i>`).join('')}</div>
    <div class="packstage">
      ${MUT.PK.i===0?'<div class="flash"></div>':''}
      ${c.rarity!=='common'?raysSVG(rayCol):''}
      <div class="bigcard ${c.rarity}">
        <span class="newtag ${isNew?'':'dup'}">${isNew?'חדש!':'כפילות'}</span>
        <div class="frame">${art(c)}</div></div>
    </div>
    <h2 style="margin:2px 0 2px">${esc(c.name)}</h2>
    <p style="margin-bottom:10px">${RLBL[c.rarity]} · #${c.no}</p>
    <button class="btn btn-gold" data-pk="next" style="width:100%">${MUT.PK.i<4?'הבא':'סיכום'}</button></div>`);
  sfx(c.rarity==='luxury'?'win':c.rarity==='rare'?'coin':'pop');
  if(c.rarity==='luxury')confetti(38);
}
export function packTap(what){
  if(!MUT.PK)return;
  if(what==='open'){sfx('rip');MUT.PK.i=0;return renderPack();}
  if(what==='next'){MUT.PK.i++;return renderPack();}
  if(what==='done'){MUT.PK=null;closeModal();S.screen='album';return render();}
}

export const RECYCLE_VALUE={common:1,rare:2,luxury:3};
export function recycleAll(){
  let total=0,n=0;
  Object.keys(S.inv).forEach(id=>{const extra=S.inv[id]-1;
    if(extra>0){const v=RECYCLE_VALUE[(BY_ID[id]||{}).rarity]||1;total+=extra*v;n+=extra;S.inv[id]=1;}});
  if(!n)return toast('אין כפילויות למחזור');
  S.coins+=total;save();sfx('coin');render();toast(`מוחזרו ${n} כפילויות → ${total} מטבעות`);
}

export function cardDetail(id){
  const c=BY_ID[id];
  if(!got(id))return toast('המדבקה עדיין חסרה');
  const rows=[];
  if(c.pos)rows.push(['עמדה',c.pos]);
  if(c.num)rows.push(['מספר חולצה',c.num]);
  if(c.mv)rows.push(['שווי שוק','€'+c.mv+'M']);
  if(c.year)rows.push(['שנים',c.year]);
  rows.push(['מספר באלבום','#'+c.no],['נדירות',{common:'רגילה',rare:'נדירה',luxury:'לוקסוס'}[c.rarity]]);
  if(S.inv[id]>1)rows.push(['ברשותך','x'+S.inv[id]]);
  const playable=!!CARD_VIDEOS[c.id];
  const downloadable=c.cat==='cat5'&&!!PHOTOS[c.id];
  const artClass=`detail-art ${c.rarity==='luxury'?'lux':''}`;
  modal(`<div class="sheet">${playable
      ?`<button class="${artClass}" data-yt="${c.id}">${art(c,false,true)}</button>`
      :`<div class="${artClass}">${art(c)}</div>`}
    <h2>${esc(c.name)}</h2>
    <div style="text-align:start;margin-bottom:14px">${rows.map(r=>`<div class="kv"><span>${r[0]}</span><b>${esc(r[1])}</b></div>`).join('')}</div>
    ${downloadable?`<button class="btn btn-blue" style="width:100%;margin-bottom:8px" data-dl="${c.id}">&#128229; הורד לטלפון</button>`:''}
    <button class="btn btn-ghost" data-act="close" style="width:100%">סגירה</button></div>`);
}

export function playHighlight(id){
  const c=BY_ID[id],vid=CARD_VIDEOS[id];
  if(!vid)return toast('אין עדיין קטע וידאו לקלף הזה');
  modal(`<div class="sheet"><h2 style="margin-bottom:12px">${esc(c.name)} — סרטון היילייטס</h2>
    <div style="position:relative;padding-top:56.25%;border-radius:14px;overflow:hidden;margin-bottom:14px;background:#000">
      <iframe style="position:absolute;inset:0;width:100%;height:100%;border:0"
        src="https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&playsinline=1&rel=0"
        title="${esc(c.name)} — סרטון היילייטס" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
    </div>
    <button class="btn btn-ghost" data-act="close" style="width:100%">סגירה</button></div>`);
}

export function downloadPhoto(id){
  const c=BY_ID[id];
  if(!got(id))return;
  const src=PHOTOS[id];
  if(!src)return toast('אין תמונה זמינה להורדה');
  const a=document.createElement('a');
  a.href=src;a.download=`chelsea-${id}.jpg`;
  document.body.appendChild(a);a.click();a.remove();
  toast('התמונה יורדת… 📥');
}

export const LAYER_NAME={kit:'ערכה',hat:'כובע',scarf:'צעיף',boots:'נעליים'};

export function tapItem(id){
  const it=ITEMS[id];
  if(!it)return;
  /* פריט שכבר ברשותך נלבש מיד · פריט חדש עובר קודם תצוגה מקדימה */
  if(S.owned.includes(id)){S.eq[it.layer]=id;save();render();return toast('לבוש: '+it.name);}
  previewItem(id);
}

export function previewItem(id){
  const it=ITEMS[id];
  const locked=!!(it.req&&!got(it.req));
  const short=Math.max(0,it.price-S.coins);
  const card=it.req?BY_ID[it.req]:null;

  /* לובשים את הפריט רק לצורך הציור, ומחזירים מיד את המצב הקודם */
  const prev=S.eq[it.layer];
  S.eq[it.layer]=id;
  const figure=avatarSVG();
  S.eq[it.layer]=prev;

  const label=locked?'🔒 נעול'
    :short?`חסרים ${short} מטבעות`
    :(it.price?`קנייה — ${it.price} `:'קבלה — חינם');

  modal(`<div class="sheet">
    <h2 style="margin:2px 0 1px;font-size:21px">${esc(it.name)}</h2>
    <p style="margin:0 0 8px">${LAYER_NAME[it.layer]||''}</p>
    <div class="prevStage">${stadiumBG(true)}${figure}</div>
    ${locked?`<p class="lockmsg">צריך לאסוף קודם את «${esc(card?card.name:'המדבקה')}» באלבום</p>`
            :`<p class="prevCoins">${coinSVG(18)} יש לך ${S.coins}</p>`}
    <div class="endBtns">
      <button class="btn btn-gold" ${locked||short?'disabled':''} data-buy="${id}">
        ${label}${!locked&&!short&&it.price?coinSVG(17):''}</button>
      <button class="btn btn-ghost" data-act="close">ביטול</button>
    </div></div>`);
}

export function buyItem(id){
  const it=ITEMS[id];
  if(!it||S.owned.includes(id))return;
  if(it.req&&!got(it.req))return toast('אספו קודם את המדבקה באלבום');
  if(S.coins<it.price)return toast('אין מספיק מטבעות');
  S.coins-=it.price;S.owned.push(id);S.eq[it.layer]=id;
  save();sfx('coin');if(it.price>=50)confetti(24);
  closeModal();render();toast('נרכש: '+it.name);
}
