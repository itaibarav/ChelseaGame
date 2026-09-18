import { ITEMS } from '../data/cards.js';
import { S } from '../core/state.js';

/* ======================= כדורים =======================
   כל הכדורים מצוירים מתמונה אמיתית (GAME_ART[item.art]) — לא וקטורית. */
export const equippedBall=()=>ITEMS[S.eq.ball]||ITEMS['av-ball-basic'];
export function ballArtSrc(item){
  const it=item||equippedBall();
  return (typeof window!=='undefined'&&window.GAME_ART&&window.GAME_ART[it.art])||'';
}
/* לשימוש ב-<img src> (בעיטת הכדור במסך הבית, הכדור בפנדלים) */
export const ballImgSrc=item=>ballArtSrc(item);
