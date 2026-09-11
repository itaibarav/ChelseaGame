import { $ } from '../core/dom.js';
import { S, save } from '../core/state.js';
import { crestSVG } from '../art/cards.js';
import { render } from '../core/router.js';

/* ======================= פיד מהשרת ======================= */
export const API_BASE=((typeof window!=='undefined'&&window.APP_CONFIG&&window.APP_CONFIG.apiBase)||'').replace(/\/$/,'');
export const mediaUrl=u=>!u?'':(/^https?:/.test(u)?u:API_BASE+u);
export const online=()=>typeof navigator==='undefined'||navigator.onLine!==false;
export const FEED_TTL=15*60*1000;

export async function refreshFeed(force){
  if(!API_BASE||!online())return;
  if(!force&&Date.now()-(S.feedAt||0)<FEED_TTL)return;
  try{
    const r=await fetch(API_BASE+'/api/feed',{cache:'no-store'});
    if(!r.ok)return;
    const d=await r.json();
    if(d.news&&Array.isArray(d.news.posts))S.news=d.news.posts;
    if(d.matches){S.matches={past:d.matches.past||[],upcoming:d.matches.upcoming||[]};}
    S.feedAt=Date.now();save();
    if(S.screen==='news'||S.screen==='home')render();
  }catch(e){}
}
export const nextMatch=()=>(S.matches&&S.matches.upcoming&&S.matches.upcoming[0])||null;
export const matchDate=iso=>{
  const d=new Date(iso);
  if(isNaN(d))return '';
  return d.toLocaleDateString('he-IL',{day:'numeric',month:'numeric'})+' · '+
         d.toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit'});
};
export const crestOf=m=>m.opponentLogo
  ? `<img class="crest" src="${mediaUrl(m.opponentLogo)}" alt="" onerror="this.style.visibility='hidden'">`
  : crestSVG('#C8102E','#FFFFFF',teamHe(m.opponent||'?').slice(0,1));

/* שמות הקבוצות כפי שה-API (football-data.org, shortName) מחזיר → עברית.
   עשרים קבוצות הפרמייר ליג של העונה הנוכחית, כולל העולות. */
export const TEAM_HE={
  'Arsenal':"ארסנל",
  'Aston Villa':"אסטון וילה",
  'Chelsea':"צ'לסי",
  'Everton':"אברטון",
  'Fulham':"פולהאם",
  'Liverpool':"ליברפול",
  'Man City':"מנצ'סטר סיטי",
  'Man United':"מנצ'סטר יונייטד",
  'Newcastle':"ניוקאסל",
  'Sunderland':"סנדרלנד",
  'Tottenham':"טוטנהאם",
  'Hull City':"האל סיטי",
  'Leeds United':"לידס יונייטד",
  'Ipswich Town':"איפסוויץ' טאון",
  'Nottingham':"נוטינגהאם פורסט",
  'Crystal Palace':"קריסטל פאלאס",
  'Brighton Hove':"ברייטון",
  'Brentford':"ברנטפורד",
  'Bournemouth':"בורנמות'",
  'Coventry City':"קובנטרי סיטי",
};
export const teamHe=name=>TEAM_HE[name]||name;
