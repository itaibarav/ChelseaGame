import { $ } from '../core/dom.js';

/* ======================= DATA ======================= */
export const DEF_LUX=[10,17,9,24,25,8,41];
/* [מספר, שם, עמדה, שווי במיליוני יורו] */
export const DEF_SQUAD=[[1,"רוברט סנצ'ס","שוער",22],[2,"מרקו פלסטרה","מגן",25],[3,"ווסלי פופנה","בלם",30],[4,"ולנטין בארקו","קשר",22],[5,"מקסנס לקרואה","בלם",30],[6,"לוי קולוויל","בלם",55],[7,"פדרו נטו","כנף",45],[8,"אנזו פרננדס","קשר",75],[9,"ז׳ואאו פדרו","חלוץ",65],[10,"קול פאלמר","קשר התקפי",90],[11,"ג'יימי גיטנס","כנף",45],[12,"ליאם דילאפ","חלוץ",40],[14,"ג'ורדן הנדרסון","קשר",5],[15,"ניקולא ג'קסון","חלוץ",45],[16,"דאריו אסוגו","קשר אחורי",20],[17,"מורגן רוג'רס","קשר התקפי",80],[18,"דני וולבק","חלוץ",3],[19,"ממדו סאר","בלם",18],[21,"יורל האטו","מגן",45],[22,"עמנואל אמגה","חלוץ",35],[23,"ג'ובאני קוונדה","כנף",40],[24,"ריס ג'יימס","מגן",45],[25,"מואיזס קייסידו","קשר אחורי",90],[27,"מאלו גוסטו","מגן",40],[38,"טוסין אדרביויו","בלם",28],[41,"אסטבאו וויליאן","כנף",75]];
export const DEF_LEGENDS=[["פרנק לאמפארד","2001–2014"],["ג'ון טרי","1998–2017"],["דידייה דרוגבה","2004–2015"],["פטר צ'ך","2004–2015"],["עדן הזאר","2012–2019"],["ג'יאנפרנקו זולה","1996–2003"],["פיטר אוסגוד","1964–1974"],["רון האריס","1961–1980"],["דניס וייז","1990–2001"],["מרסל דסאי","1998–2004"],["קלוד מקללה","2003–2008"],["אשלי קול","2006–2014"],["מיכאל בלאק","2006–2010"],["אריאן רובן","2004–2007"],["ברניסלב איבנוביץ'","2008–2017"],["ריקרדו קרבאלו","2004–2010"],["בובי טמבלינג","1959–1970"],["קרי דיקסון","1983–1992"],["נ'גולו קנטה","2016–2023"],["וויליאן","2013–2020"]];

/* אם הוטמע squad.js מעורך הסגל — הוא גובר על ברירת המחדל */
export const _SD=(typeof window!=='undefined'&&window.SQUAD_DATA)||null;
export const _LD=(typeof window!=='undefined'&&window.LEGEND_DATA)||null;
export const SQUAD=_SD&&_SD.length?_SD.map(p=>[+p.num,p.name,p.pos,+p.mv]):DEF_SQUAD;
export const LUX=_SD&&_SD.length?_SD.filter(p=>p.lux).map(p=>+p.num):DEF_LUX;
export const LEGENDS=_LD&&_LD.length?_LD.map(l=>[l.name,l.years,!!l.lux,l.bio||'']):DEF_LEGENDS;
export const TROPHIES=[["ליגת האלופות","2011/12"],["ליגת האלופות","2020/21"],["גביע העולם למועדונים","2021"],["גביע העולם למועדונים","2025"],["הסופר קאפ האירופי","2021"],["הליגה האירופית","2012/13"],["הליגה האירופית","2018/19"],["ליגת הקונפרנס","2024/25"],["גביע אלופות הגביעים","1970/71"],["גביע אלופות הגביעים","1997/98"],["אליפות אנגליה","1954/55"],["פרמייר ליג","2004/05"],["פרמייר ליג","2009/10"],["פרמייר ליג","2016/17"]];
export const STADIUM=["מבט מהדשא","היציע המערבי","יציע מת׳יו הארדינג","יציע השד","היציע המזרחי","המנהרה לכר הדשא","חדר ההלבשה","מבט אווירי","ליל אורות","מוזיאון המועדון"];
export const KITPAL={home:["#034694","#062B63","#FFFFFF"],away:["#EEF2F8","#B9C4D6","#034694"],third:["#16232F","#2BD9A6","#EAF7F2"]};
export const KITLBL={home:"מדי בית",away:"מדי חוץ",third:"מדים שלישיים"};

export const CARDS=[];
export const EXTRA=(typeof window!=='undefined'&&window.ALBUM_EXTRA)||{cats:[],cards:[]};
export const EXTRA_CATS=(EXTRA.cats||[]).map(c=>[c.key,c.label]);
export const extrasIn=key=>(EXTRA.cards||[]).filter(c=>c.cat===key);
export const pushExtras=key=>extrasIn(key).forEach(c=>CARDS.push({
  id:c.id,cat:c.cat,name:c.name,rarity:c.rarity||'common',
  num:c.num,pos:c.pos,mv:c.mv,year:c.year,kit:c.kit,titles:c.titles,bio:c.bio,nation:c.nation}));
SQUAD.forEach(([n,name,pos,mv])=>CARDS.push({id:'squad-'+n,cat:'squad',name,rarity:LUX.includes(n)?'luxury':'common',num:n,pos,mv}));
pushExtras('squad');
LEGENDS.forEach(([name,yr,lx,bio],i)=>CARDS.push({id:'legend-'+i,cat:'legend',name,rarity:lx?'luxury':'rare',year:yr,bio}));
pushExtras('legend');
/* קטגוריית הגביעים המצוירת הוסרה — הוחלפה בקטגוריות שהוזנו בעורך */
EXTRA_CATS.forEach(([k])=>pushExtras(k));
export const KIT_DEFAULT=[];
for(let y=2007;y<=2026;y++)['home','away','third'].forEach(k=>KIT_DEFAULT.push(`kit-${y}-${k}`));
export const KIT_LIST=(typeof window!=='undefined'&&window.KIT_ALLOW&&window.KIT_ALLOW.length)?window.KIT_ALLOW:KIT_DEFAULT;
KIT_LIST.forEach(id=>{const [,ys,k]=id.split('-'),y=+ys;
  const se=y+'/'+String((y+1)%100).padStart(2,'0');
  CARDS.push({id,cat:'kit',name:KITLBL[k]+' '+se,rarity:'common',year:se,kit:k});});
STADIUM.forEach((s,i)=>CARDS.push({id:'stadium-'+i,cat:'stadium',name:s,rarity:'common'}));
pushExtras('stadium');pushExtras('kit');
export const OVR=(typeof window!=='undefined'&&window.OVERRIDES)||{names:{},cats:{}};
CARDS.forEach(c=>{if(OVR.names&&OVR.names[c.id]!==undefined)c.name=OVR.names[c.id];});
/* כל קטגוריה נשמרת כרצף אחד, לפי סדר הטאבים */
(()=>{const order=['squad','legend'].concat(EXTRA_CATS.map(c=>c[0])).concat(['kit','stadium']);
  const rank=c=>{const i=order.indexOf(c.cat);return i<0?order.length:i;};
  CARDS.sort((a,b)=>rank(a)-rank(b));})();
(()=>{ /* לכל קלף מדים: שנה וסוג לפי השם שהוגדר */
  const T={'בית':'home','חוץ':'away','שלישית':'third'};
  CARDS.filter(c=>c.cat==='kit').forEach(c=>{
    const m=String(c.name||'').match(/(\d{4}\/\d{2})/);
    if(m)c.year=m[1];
    const t=Object.keys(T).find(k=>String(c.name||'').includes(k));
    if(t)c.kit=T[t];
  });})();
export const seasonYear=n=>{const m=String(n||'').match(/(\d{4})\/(\d{2})/);return m?+m[1]:9999;};
export const KIT_ORDER={home:0,away:1,third:2};
(()=>{  /* עמוד המדים מסודר כרונולוגית */
  const idx=CARDS.map((c,i)=>[c,i]).filter(([c])=>c.cat==='kit');
  if(!idx.length)return;
  const slots=idx.map(([,i])=>i);
  const sorted=idx.map(([c])=>c).sort((a,b)=>
    seasonYear(a.name)-seasonYear(b.name) || (KIT_ORDER[a.kit]??9)-(KIT_ORDER[b.kit]??9));
  slots.forEach((slot,k)=>CARDS[slot]=sorted[k]);
})();
CARDS.forEach((c,i)=>c.no=i+1);
export const BY_ID=Object.fromEntries(CARDS.map(c=>[c.id,c]));
export const TOTAL=CARDS.length;
export const RARE_POOL=CARDS.filter(c=>c.rarity!=='common').map(c=>c.id);
export const COMMON_POOL=CARDS.filter(c=>c.rarity==='common').map(c=>c.id);
export const RARE_ONLY=CARDS.filter(c=>c.rarity==='rare').map(c=>c.id);
export const LUX_ONLY=CARDS.filter(c=>c.rarity==='luxury').map(c=>c.id);
export const KIT_CARDS=CARDS.filter(c=>c.cat==='kit');
/* קטגוריות שנחשבות "מדים" לצורך הבטחת מעטפת המדים, גם אם יש להן טאב נפרד באלבום
   (למשל "חולצות 2026/27" — קטגוריה שנוספה בעורך אך אמורה להיכלל בהגרלת המעטפה) */
export const KIT_POOL_CATS=['kit','newcat2'];
export const KIT_POOL=CARDS.filter(c=>KIT_POOL_CATS.includes(c.cat)).map(c=>c.id);
export const ALL_IDS=CARDS.map(c=>c.id);
export const LEGEND_POOL=CARDS.filter(c=>c.cat==='legend').map(c=>c.id);
export const CATS=[['squad','הסגל'],['legend','אגדות']]
  .concat(EXTRA_CATS).concat([['kit','מדים'],['stadium','האצטדיון']])
  .map(([k,l])=>[k,(OVR.cats&&OVR.cats[k])||l]);
export const PACKS=[{t:'standard',n:'מעטפה רגילה',p:50,d:'5 מדבקות אקראיות'},{t:'legend',n:'מעטפת אגדות',p:70,d:'מובטחת לפחות אגדה אחת'},{t:'kit',n:'מעטפת מדים',p:70,d:'מובטחים מדי משחק'},{t:'gold',n:'מעטפת זהב',p:100,d:'מובטח קלף נדיר או לוקסוס'}];
export const GAMES=[['מי החולצה?','👕','shirt'],['קרב שווי','💶','value'],['משחק זיכרון','🃏','memory'],['דו-קרב פנדלים','🥅','penalty'],['אבן נייר ומספריים','✊','rps'],['איקס עיגול','⭕','ttt'],['פיצוץ בועות','🫧','bubble'],['הקפצות','🤹','keepie'],['ריצת סטמפורד','🏃','run'],['ריס ג׳יימס מערבב','🦁','shell']];

/* --- avatar catalogue --- */
/* [מזהה, שם, מחיר, [צבע ראשי, פס], סמל] */
export const SCARVES=[
 ['av-scarf-classic','צעיף קלאסי',25,['#034694','#FFFFFF'],'badge'],
 ['av-scarf-retro',  'צעיף רטרו', 35,['#12305C','#E4C05B'],'badge'],
 ['av-scarf-il',     'צעיף ישראל',45,['#1E6BE6','#FFFFFF'],'badge'],
 ['av-scarf-white',  'צעיף לבן',  30,['#F2F5FA','#1E5BE0'],'badge'],
 ['av-scarf-2027',   'צעיף 2027', 55,['#0B45B5','#D9B14A'],'gold']];
export const HATS=[['av-hat-beanie','כובע גרב',20,'beanie',['#1E6BE6','#0F4FB5']],['av-hat-cap','כובע מצחייה',20,'cap',['#034694','#FFC83D']],['av-hat-bucket','כובע פטרייה',30,'bucket',['#DDE7F5','#034694']],['av-hat-beanie2','כובע גרב שחור-כחול',40,'beanie',['#141414','#1E6BE6']],['av-hat-crown','כתר אלופים',60,'crown',['#FFC83D','#B87700']]];
/* [מזהה, שם, מחיר, [צבע ראשי, הדגשה, סוליה ופקקים]] */
export const BOOTS=[
 ['av-boot-white',  'אפורות',    0,['#8A9199','#FFFFFF','#4B5157']],
 ['av-boot-classic','כחול ולבן', 20,['#1E5BE0','#FFFFFF','#0B2E7A']],
 ['av-boot-blue',   'ניאון ושחור',25,['#C6F51D','#141414','#7E9E12']],
 ['av-boot-neon',   'זהב וכחול', 35,['#E8B93B','#123A9E','#9C7615']],
 ['av-boot-gold',   'שחור ותכלת',70,['#1A1A1A','#5FD4F5','#000000']]];
export const ITEMS={};
ITEMS['av-kit-base']={id:'av-kit-base',layer:'kit',name:'מדי אימון',price:0,pal:['#2C6FE0','#0C3A8C','#FFFFFF']};
KIT_CARDS.forEach(c=>{ITEMS['av-'+c.id]={id:'av-'+c.id,layer:'kit',name:c.name,price:40,pal:KITPAL[c.kit]||KITPAL.home,req:c.id};});
SCARVES.forEach(([id,name,price,pal,emblem])=>ITEMS[id]={id,layer:'scarf',name,price,pal,emblem});
HATS.forEach(([id,name,price,shape,pal])=>ITEMS[id]={id,layer:'hat',name,price,shape,pal});
BOOTS.forEach(([id,name,price,pal])=>ITEMS[id]={id,layer:'boots',name,price,pal});
export const byLayer=l=>Object.values(ITEMS).filter(i=>i.layer===l);
export const LAYER_TABS=[['kit','מדים'],['hat','כובעים'],['scarf','צעיפים'],['boots','נעליים']];

/* --- mock content (deferred data sources) --- */
export const MOCK_MATCH={home:'צ׳לסי',away:'ארסנל',when:'שבת, 20:30'};
export const MOCK_POSTS=[
  {id:'p1',emoji:'🏟️',txt:'ליל משחק בסטמפורד ברידג׳ — האווירה ביציעים הייתה חשמלית מהדקה הראשונה.'},
  {id:'p2',emoji:'🎉',txt:'מפגש אוהדים בתל אביב בשבוע הבא. פרטים והרשמה בסטורי.'},
  {id:'p3',emoji:'📸',txt:'התמונות מהאימון הפתוח — תודה לכל מי שהגיע עם המשפחה.'}
];
