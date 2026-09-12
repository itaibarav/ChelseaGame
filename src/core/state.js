/* ======================= STATE ======================= */
export const KEY='blue-sticker-proto-v2';
export const today=()=>new Date().toISOString().slice(0,10);
/* סטטיסטיקות לכל החיים, למשימות — לא ניתנות לגזירה ממצב אחר */
export const DEFAULT_STATS={keepieBest:0,runBest:0,penaltyGoals:0,rpsWins:0,memoryWins:0,tttWins:0,shellWins:0,
  packsOpened:0,goldPacksOpened:0,legendPacksOpened:0,kitPacksOpened:0,recycled:0,
  shirtBestStreak:0,bgDownloaded:false,legendVideoWatched:false,trophyVideoWatched:false};
export let S={name:'',coins:0,inv:{},claim:null,streak:0,tab:'squad',screen:'home',avTab:'kit',
  news:[],matches:{past:[],upcoming:[]},feedAt:0,
  owned:['av-kit-base','av-boot-white'],
  eq:{kit:'av-kit-base',hat:null,scarf:null,boots:'av-boot-white'},read:[],
  stats:{...DEFAULT_STATS},
  claimedTasks:[]};
try{const raw=localStorage.getItem(KEY);if(raw)S=Object.assign(S,JSON.parse(raw));}catch(e){}
/* מיזוג רדוד: שדה stats שנטען מ-localStorage ישן עלול לחסר מפתחות חדשים —
   משלימים אותם עם ברירות המחדל בלי לאבד את הערכים הקיימים */
S.stats=Object.assign({},DEFAULT_STATS,S.stats);
export const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(
  {name:S.name,coins:S.coins,inv:S.inv,claim:S.claim,streak:S.streak,owned:S.owned,eq:S.eq,read:S.read,
   news:S.news,matches:S.matches,feedAt:S.feedAt,stats:S.stats,claimedTasks:S.claimedTasks}));}catch(e){}};
export const got=id=>(S.inv[id]||0)>0;
export const collected=()=>Object.values(S.inv).filter(q=>q>0).length;
export const pick=a=>a[Math.floor(Math.random()*a.length)];
export const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
export const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
