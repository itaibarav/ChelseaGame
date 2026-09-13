import { $, closeModal, modal, stickerHTML, toast } from '../core/dom.js';
import { ALL_IDS, BY_ID, COMMON_POOL, ITEMS, KIT_POOL, LEGEND_POOL, LUX_ONLY, PACKS, RARE_ONLY, RARE_POOL } from '../data/cards.js';
import { Capacitor } from '@capacitor/core';
import { Media } from '@capacitor-community/media';
import { MUT } from '../core/mut.js';
import { S, esc, got, pick, save, shuffle } from '../core/state.js';
import { art, coinSVG } from '../art/cards.js';
import { avatarSVG } from '../art/avatar.js';
import { confetti, packArtSVG, raysSVG, sfx } from '../core/fx.js';
import CARD_VIDEOS from '../data/cardVideos.js';
import { PHOTOS } from '../data/globals.js';
import { render } from '../core/router.js';
import { stadiumBG } from '../art/stadium.js';
import { TASKS } from '../data/tasks.js';

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
  if(type==='kit')res[order[0]]=()=>uniquePick(KIT_POOL,COMMON_POOL);
  /* הסלוטים החופשיים (לא אגדה/מדים מובטחים): נדיר/לוקסוס בסיכוי חצי מהרגיל,
     כלומר פי 2 יותר סיכוי למדבקה רגילה. במעטפת זהב הסיכוי נשאר מוגבר כרגיל. */
  const o=type==='gold'?{l:.06,r:.24}:{l:.0075,r:.0425},slots=[];
  for(let i=0;i<5;i++)slots.push(res[i]?res[i]():rollUnique(o));

  const fresh=slots.map(id=>!got(id));
  slots.forEach(id=>S.inv[id]=(S.inv[id]||0)+1);
  MUT.NEW_IDS=new Set(slots.filter((id,i)=>fresh[i]));
  S.stats.packsOpened++;
  if(type==='gold')S.stats.goldPacksOpened++;
  if(type==='legend')S.stats.legendPacksOpened++;
  if(type==='kit')S.stats.kitPacksOpened++;
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
  S.coins+=total;S.stats.recycled+=n;save();sfx('coin');render();toast(`מוחזרו ${n} כפילויות → ${total} מטבעות`);
}

export function cardDetail(id){
  const c=BY_ID[id];
  if(!got(id))return toast('המדבקה עדיין חסרה');
  const rows=[];
  if(c.nation)rows.push(['נבחרת',c.nation]);
  if(c.pos)rows.push(['עמדה',c.pos]);
  if(c.num)rows.push(['מספר חולצה',c.num]);
  if(c.mv)rows.push(['שווי שוק','€'+c.mv+'M']);
  if(c.year)rows.push(['שנים',c.year]);
  rows.push(['מספר באלבום','#'+c.no],['נדירות',{common:'רגילה',rare:'נדירה',luxury:'לוקסוס'}[c.rarity]]);
  if(S.inv[id]>1)rows.push(['ברשותך','x'+S.inv[id]]);
  const playable=!!CARD_VIDEOS[c.id];
  const isWallpaper=c.cat==='cat5'&&!!PHOTOS[c.id];
  const artClass=`detail-art ${c.rarity==='luxury'?'lux':''}`;
  /* תצוגת רקע: התמונה המלאה ביחס המסך של המכשיר, בלי חיתוך, כדי לראות איך זה ייראה כטפט */
  const sw=Math.min(window.screen.width||9,window.screen.height||16);
  const sh=Math.max(window.screen.width||9,window.screen.height||16);
  const artHTML=isWallpaper
    ?`<div class="wallpreview" style="aspect-ratio:${sw}/${sh}"><img src="${PHOTOS[c.id]}" alt=""></div>`
    :playable?`<button class="${artClass}" data-yt="${c.id}">${art(c,false,true)}</button>`
    :`<div class="${artClass}">${art(c)}</div>`;
  const titlesHTML=(c.titles&&c.titles.length)
    ?`<div style="text-align:start;margin-bottom:14px">
        <div style="color:#9FB8DA;font-size:12.5px;margin-bottom:6px">תארים שזכה בהם עם צ'לסי</div>
        ${c.titles.map(t=>`<div style="padding:4px 2px;font-size:14px">&#127942; ${esc(t)}</div>`).join('')}
      </div>`
    :'';
  const bioHTML=c.bio?`<p style="color:#C6D8F2;font-size:13.5px;line-height:1.5;margin:-4px 0 14px">${esc(c.bio)}</p>`:'';
  modal(`<div class="sheet">${artHTML}
    <h2>${esc(c.name)}</h2>
    ${bioHTML}
    <div style="text-align:start;margin-bottom:14px">${rows.map(r=>`<div class="kv"><span>${r[0]}</span><b>${esc(r[1])}</b></div>`).join('')}</div>
    ${titlesHTML}
    ${isWallpaper?`<button class="btn btn-blue" style="width:100%;margin-bottom:8px" data-dl="${c.id}">&#128229; הורד לטלפון</button>`:''}
    <button class="btn btn-ghost" data-act="close" style="width:100%">סגירה</button></div>`);
}

export function playHighlight(id){
  const c=BY_ID[id],vid=CARD_VIDEOS[id];
  if(!vid)return toast('אין עדיין קטע וידאו לקלף הזה');
  if(c.cat==='legend')S.stats.legendVideoWatched=true;
  if(c.cat==='cat2')S.stats.trophyVideoWatched=true;
  save();
  modal(`<div class="sheet"><h2 style="margin-bottom:12px">${esc(c.name)} — סרטון היילייטס</h2>
    <div style="position:relative;padding-top:56.25%;border-radius:14px;overflow:hidden;margin-bottom:14px;background:#000">
      <iframe style="position:absolute;inset:0;width:100%;height:100%;border:0"
        src="https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&playsinline=1&rel=0"
        title="${esc(c.name)} — סרטון היילייטס" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
    </div>
    <button class="btn btn-ghost" data-act="close" style="width:100%">סגירה</button></div>`);
}

/* שמירה לגלריה של המכשיר: אנדרואיד לא יודע לשמור data: URI גדול מ-<a download>
   בצורה אמינה, לכן באפליקציה הארוזה (native) משתמשים בפלאגין ששומר דרך
   MediaStore. בדפדפן/תצוגה מקדימה (web) אין תמיכה בפלאגין, אז חוזרים
   ל-<a download> הרגיל. */
const ALBUM_NAME="אלבום הבלוז";
let albumIdPromise=null;
function getAlbumId(){
  if(!albumIdPromise)albumIdPromise=(async()=>{
    try{
      let {albums}=await Media.getAlbums();
      let found=albums.find(a=>a.name===ALBUM_NAME);
      if(!found){
        await Media.createAlbum({name:ALBUM_NAME});
        ({albums}=await Media.getAlbums());
        found=albums.find(a=>a.name===ALBUM_NAME);
      }
      return found?found.identifier:undefined;
    }catch(e){return undefined;}
  })();
  return albumIdPromise;
}

/* פלאגין השמירה לגלריה (Media.savePhoto) יודע לטפל רק ב-data: URI או
   ב-http(s) אמיתי (הוא מוריד אותו בעצמו ברשת) — נתיב יחסי כמו
   /assets/stickers/x.jpg לא נתמך, כי הוא לא נגיש מחוץ ל-webview. לכן
   תמיד ממירים קודם ל-data: URI דרך fetch, מתוך ה-webview עצמו. */
async function toDataUrl(src){
  if(src.startsWith('data:'))return src;
  const res=await fetch(src);
  const blob=await res.blob();
  return await new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=reject;
    reader.readAsDataURL(blob);
  });
}

export async function downloadPhoto(id){
  const c=BY_ID[id];
  if(!got(id))return;
  const src=PHOTOS[id];
  if(!src)return toast('אין תמונה זמינה להורדה');
  if(Capacitor.isNativePlatform()){
    try{
      const albumIdentifier=await getAlbumId();
      const dataUrl=await toDataUrl(src);
      await Media.savePhoto({path:dataUrl,albumIdentifier,fileName:`chelsea-${id}`});
      toast('התמונה נשמרה בגלריה! 📥');
      if(c.cat==='cat5'){S.stats.bgDownloaded=true;save();}
    }catch(e){
      toast('שמירת התמונה נכשלה — נסו שוב');
    }
    return;
  }
  const a=document.createElement('a');
  a.href=src;a.download=`chelsea-${id}.jpg`;
  document.body.appendChild(a);a.click();a.remove();
  toast('התמונה יורדת… 📥');
  if(c.cat==='cat5'){S.stats.bgDownloaded=true;save();}
}

export const LAYER_NAME={kit:'מדים',hat:'כובע',scarf:'צעיף',boots:'נעליים'};

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

export function claimTask(id){
  if(S.claimedTasks.includes(id))return;
  const t=TASKS.find(x=>x.id===id);
  if(!t||!t.check())return;
  S.claimedTasks.push(id);S.coins+=t.reward;save();
  sfx('coin');confetti(20);render();toast(`המשימה הושלמה! +${t.reward} מטבעות`);
}

/* הרכבה אקראית: לכל שכבה בוחרים פריט אקראי מבין הפריטים שכבר ברשותכם —
   לכובע ולצעיף גם "בלי" הוא אפשרות חוקית, כי אפשר להסיר אותם */
export function shuffleAvatar(){
  ['kit','hat','scarf','boots'].forEach(layer=>{
    const ownedItems=S.owned.filter(id=>ITEMS[id]&&ITEMS[id].layer===layer);
    const optional=layer==='hat'||layer==='scarf';
    const pool=optional?[...ownedItems,null]:ownedItems;
    if(!pool.length)return;
    S.eq[layer]=pick(pool);
  });
  save();sfx('pop');render();toast('הרכבה אקראית! 🎲');
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
