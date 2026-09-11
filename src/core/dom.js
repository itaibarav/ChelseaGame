import { MUT } from '../core/mut.js';
import { S, got } from '../core/state.js';
import { art } from '../art/cards.js';

/* ======================= HELPERS ======================= */
export const $=s=>document.querySelector(s);
export function toast(msg){const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);
  setTimeout(()=>{t.style.transition='opacity .3s';t.style.opacity='0';setTimeout(()=>t.remove(),320);},1500);}
export const modal=(h,opts)=>{const closable=!opts||opts.closable!==false;
  $('#modal').innerHTML=`<div class="ov"${closable?' data-close':''}>${h}</div>`;};
export const closeModal=()=>$('#modal').innerHTML='';
$('#modal').addEventListener('click',e=>{if(e.target.hasAttribute('data-close'))closeModal();});

export function stickerHTML(c,stage){
  if(!got(c.id))return `<button class="sticker missing" data-card="${c.id}"><span class="q">?</span><span class="n">${c.no}</span></button>`;
  const q=S.inv[c.id],dupe=q>1?`<span class="dupe">x${q}</span>`:'';
  const fresh=!stage&&MUT.NEW_IDS.has(c.id)?' snap':'';
  if(c.rarity==='luxury')return `<button class="sticker got luxury${fresh}" data-card="${c.id}">${dupe}<span class="badge-lux">לוקסוס</span><span class="inner">${art(c)}</span></button>`;
  return `<button class="sticker got ${c.rarity==='rare'?'rare':''}${fresh}" data-card="${c.id}">${dupe}${art(c)}</button>`;
}
