import { CARDS, HATS, ITEMS, SCARVES } from './cards.js';
import { S, got } from '../core/state.js';

/* ======================= משימות =======================
   כל משימה: id ייחודי, תווית, פרס וקריטריון (check). משימות עם סטטיסטיקה
   מצטברת (keepieBest, runBest וכו') נבדקות מול S.stats, שמתעדכן במקום
   שבו כל הישג קורה בפועל (המשחקים עצמם, פתיחת מעטפות, מיחזור).
   משימות "נגזרות" (מדים/כובעים/צעיפים/אלבום) נבדקות ישירות מול המצב
   הקיים — אין צורך במונה נפרד. */
const kitsOwned=()=>S.owned.filter(id=>id!=='av-kit-base'&&ITEMS[id]&&ITEMS[id].layer==='kit').length;
const scarvesOwned=()=>S.owned.filter(id=>SCARVES.some(([sid])=>sid===id)).length;
const allHatsOwned=()=>HATS.every(([id])=>S.owned.includes(id));
const catComplete=cat=>{const list=CARDS.filter(c=>c.cat===cat);return list.length>0&&list.every(c=>got(c.id));};

export const TASKS=[
 {id:'shirt-5',   label:'נחש 5 מספרים נכונים במשחק אחד ב"מי החולצה?"',  reward:20,  check:()=>S.stats.shirtBestStreak>=5},
 {id:'shirt-10',  label:'נחש 10 מספרים נכונים במשחק אחד ב"מי החולצה?"', reward:50,  check:()=>S.stats.shirtBestStreak>=10},
 {id:'shirt-20',  label:'נחש 20 מספרים נכונים במשחק אחד ב"מי החולצה?"', reward:100, check:()=>S.stats.shirtBestStreak>=20},
 {id:'keepie-20', label:'הקפץ 20 פעמים במשחק הקפצות',        reward:20,  check:()=>S.stats.keepieBest>=20},
 {id:'keepie-40', label:'הקפץ 40 פעמים במשחק הקפצות',        reward:40,  check:()=>S.stats.keepieBest>=40},
 {id:'keepie-60', label:'הקפץ 60 פעמים במשחק הקפצות',        reward:60,  check:()=>S.stats.keepieBest>=60},
 {id:'keepie-80', label:'הקפץ 80 פעמים במשחק הקפצות',        reward:80,  check:()=>S.stats.keepieBest>=80},
 {id:'keepie-100',label:'הקפץ 100 פעמים במשחק הקפצות',       reward:100, check:()=>S.stats.keepieBest>=100},
 {id:'run-1000',  label:'עבור 1,000 מטר במשחק ריצת סטמפורד', reward:25,  check:()=>S.stats.runBest>=1000},
 {id:'run-2000',  label:'עבור 2,000 מטר במשחק ריצת סטמפורד', reward:50,  check:()=>S.stats.runBest>=2000},
 {id:'run-3000',  label:'עבור 3,000 מטר במשחק ריצת סטמפורד', reward:100, check:()=>S.stats.runBest>=3000},
 {id:'run-4000',  label:'עבור 4,000 מטר במשחק ריצת סטמפורד', reward:150, check:()=>S.stats.runBest>=4000},
 {id:'pen-25',    label:'הבקע 25 שערים בדו-קרב פנדלים',      reward:25,  check:()=>S.stats.penaltyGoals>=25},
 {id:'pen-50',    label:'הבקע 50 שערים בדו-קרב פנדלים',      reward:50,  check:()=>S.stats.penaltyGoals>=50},
 {id:'pen-100',   label:'הבקע 100 שערים בדו-קרב פנדלים',     reward:100, check:()=>S.stats.penaltyGoals>=100},
 {id:'pen-150',   label:'הבקע 150 שערים בדו-קרב פנדלים',     reward:150, check:()=>S.stats.penaltyGoals>=150},
 {id:'pen-200',   label:'הבקע 200 שערים בדו-קרב פנדלים',     reward:200, check:()=>S.stats.penaltyGoals>=200},
 {id:'rps-30',    label:"נצח את פאלמר 30 פעמים באבן נייר ומספריים", reward:30,  check:()=>S.stats.rpsWins>=30},
 {id:'rps-60',    label:"נצח את פאלמר 60 פעמים באבן נייר ומספריים", reward:60,  check:()=>S.stats.rpsWins>=60},
 {id:'rps-90',    label:"נצח את פאלמר 90 פעמים באבן נייר ומספריים", reward:90,  check:()=>S.stats.rpsWins>=90},
 {id:'rps-120',   label:"נצח את פאלמר 120 פעמים באבן נייר ומספריים",reward:120, check:()=>S.stats.rpsWins>=120},
 {id:'mem-10',    label:'נצח 10 פעמים במשחק הזכרון',          reward:25,  check:()=>S.stats.memoryWins>=10},
 {id:'mem-20',    label:'נצח 20 פעמים במשחק הזכרון',          reward:50,  check:()=>S.stats.memoryWins>=20},
 {id:'mem-35',    label:'נצח 35 פעמים במשחק הזכרון',          reward:100, check:()=>S.stats.memoryWins>=35},
 {id:'ttt-10',    label:'נצח 10 פעמים באיקס עיגול',           reward:25,  check:()=>S.stats.tttWins>=10},
 {id:'ttt-20',    label:'נצח 20 פעמים באיקס עיגול',           reward:50,  check:()=>S.stats.tttWins>=20},
 {id:'ttt-35',    label:'נצח 35 פעמים באיקס עיגול',           reward:100, check:()=>S.stats.tttWins>=35},
 {id:'shell-20',  label:"נצח 20 פעמים בריס ג'יימס מערבב",     reward:20,  check:()=>S.stats.shellWins>=20},
 {id:'shell-40',  label:"נצח 40 פעמים בריס ג'יימס מערבב",     reward:40,  check:()=>S.stats.shellWins>=40},
 {id:'shell-80',  label:"נצח 80 פעמים בריס ג'יימס מערבב",     reward:80,  check:()=>S.stats.shellWins>=80},
 {id:'kits-4',    label:'רכוש 4 מדים לאווטאר שלך',            reward:40,  check:()=>kitsOwned()>=4},
 {id:'kits-8',    label:'רכוש 8 מדים לאווטאר שלך',            reward:60,  check:()=>kitsOwned()>=8},
 {id:'kits-10',   label:'רכוש 10 מדים לאווטאר שלך',           reward:75,  check:()=>kitsOwned()>=10},
 {id:'hats-all',  label:'רכוש את כל הכובעים האפשריים',        reward:80,  check:allHatsOwned},
 {id:'scarves-2', label:'רכוש 2 צעיפים לאווטאר שלך',          reward:30,  check:()=>scarvesOwned()>=2},
 {id:'squad-full',label:'השלם את מדבקות כל הסגל באלבום',      reward:100, check:()=>catComplete('squad')},
 {id:'legend-full',label:'השלם את מדבקות כל האגדות באלבום',   reward:200, check:()=>catComplete('legend')},
 {id:'bg-download',label:'הורד לטלפון רקע מתוך קלפי "רקע" באלבום', reward:25, check:()=>!!S.stats.bgDownloaded},
 {id:'legend-video',label:'צפה בסרטון הייליטס של אגדה',       reward:40,  check:()=>!!S.stats.legendVideoWatched},
 {id:'trophy-video',label:'צפה בסרטון של זכייה בגביע',        reward:50,  check:()=>!!S.stats.trophyVideoWatched},
 {id:'packs-20',  label:'קנה 20 מעטפות בחנות',                reward:50,  check:()=>S.stats.packsOpened>=20},
 {id:'packs-40',  label:'קנה 40 מעטפות בחנות',                reward:100, check:()=>S.stats.packsOpened>=40},
 {id:'packs-100', label:'קנה 100 מעטפות בחנות',               reward:150, check:()=>S.stats.packsOpened>=100},
 {id:'packs-legend-15',label:'קנה 15 מעטפות אגדה בחנות',      reward:100, check:()=>S.stats.legendPacksOpened>=15},
 {id:'packs-kit-15',label:'קנה 15 מעטפות מדים בחנות',         reward:100, check:()=>S.stats.kitPacksOpened>=15},
 {id:'gold-10',   label:'קנה 10 מעטפות זהב בחנות',            reward:200, check:()=>S.stats.goldPacksOpened>=10},
 {id:'recycle-25',label:'מחזר 25 קלפים כפולים',               reward:10,  check:()=>S.stats.recycled>=25},
 {id:'recycle-50',label:'מחזר 50 קלפים כפולים',               reward:30,  check:()=>S.stats.recycled>=50},
 {id:'recycle-100',label:'מחזר 100 קלפים כפולים',             reward:50,  check:()=>S.stats.recycled>=100},
 {id:'recycle-200',label:'מחזר 200 קלפים כפולים',             reward:100, check:()=>S.stats.recycled>=200},
];
