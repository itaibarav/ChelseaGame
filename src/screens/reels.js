import { BY_ID } from '../data/cards.js';
import { esc, shuffle } from '../core/state.js';
import { MUT } from '../core/mut.js';
import REELS_DATA from '../data/reels.js';

/* הסדר מתערבב פעם אחת בכל הפעלה של האפליקציה (לא בכל פעם שנכנסים ללשונית
   בתוך אותו מושב) — כדי שלא תמיד יופיע אותו סדר קבוע */
const REELS=shuffle(REELS_DATA);

/* ======================= היילייטס: פיד גלילה ======================= */
export function reelsView(){
  return `<div class="reelStack" id="reelStack">
    ${REELS.map(r=>{
      const card=r.cardId?BY_ID[r.cardId]:null;
      const who=card?card.name:"צ'לסי · Shorts רשמי";
      return `<section class="reelCard" data-vid="${esc(r.vid)}" data-muted="1">
        <div class="reelVideoSlot"></div>
        <div class="reelVign"></div>
        <button class="reelMuteBtn" data-reelmute><span class="ico">&#128263;</span></button>
        <div class="reelMeta">
          <div class="reelWho">${esc(who)}${card?`<button class="reelInfo" data-card="${card.id}">&#8505;&#65039;</button>`:''}</div>
          <div class="reelCap">${esc(r.cap)}</div>
        </div>
      </section>`;
    }).join('')}
  </div>`;
}

/* טוענים iframe אמיתי רק לקטע שבתצוגה (עד 1 בו-זמנית) — כדי לא לטעון
   מספר נגני יוטיוב יחד, וכדי שהווידאו יעצור בפועל כשגוללים הלאה */
export function mountReels(){
  const stack=document.getElementById('reelStack');
  if(MUT.reelObserver){MUT.reelObserver.disconnect();MUT.reelObserver=null;}
  if(!stack)return;
  const mount=card=>{
    if(card.querySelector('iframe'))return;
    const vid=card.dataset.vid;
    card.dataset.muted='1';
    card.querySelector('.reelVideoSlot').innerHTML=
      `<iframe src="https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&mute=1&loop=1&playlist=${vid}`+
      `&playsinline=1&controls=0&modestbranding=1&rel=0&enablejsapi=1" `+
      `allow="autoplay; encrypted-media" frameborder="0"></iframe>`;
    const ico=card.querySelector('.reelMuteBtn .ico');if(ico)ico.textContent='\u{1F507}';
  };
  const unmount=card=>{const slot=card.querySelector('.reelVideoSlot');if(slot)slot.innerHTML='';};
  const io=new IntersectionObserver(entries=>{
    entries.forEach(en=>en.isIntersecting&&en.intersectionRatio>.6?mount(en.target):unmount(en.target));
  },{root:stack,threshold:[0,.6,1]});
  stack.querySelectorAll('.reelCard').forEach(c=>io.observe(c));
  MUT.reelObserver=io;
}

export function toggleReelMute(btn){
  const card=btn.closest('.reelCard');
  const ifr=card&&card.querySelector('iframe');
  if(!card||!ifr)return;
  const wasMuted=card.dataset.muted!=='0';
  ifr.contentWindow.postMessage(JSON.stringify({event:'command',func:wasMuted?'unMute':'mute',args:[]}),'*');
  card.dataset.muted=wasMuted?'0':'1';
  const ico=btn.querySelector('.ico');if(ico)ico.textContent=wasMuted?'\u{1F50A}':'\u{1F507}';
}
