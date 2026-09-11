/* מגשר בין קבצי הנתונים לקוד, שנכתב במקור מול משתני window.
   חייב לרוץ לפני כל מודול אחר — main.js מייבא אותו ראשון. */
import squad from './squad.json.js';
import kits  from './kits.json.js';
import album from './album.json.js';
import media from './media.js';

const W = typeof window !== 'undefined' ? window : globalThis;

W.SQUAD_DATA  = squad.squad;
W.LEGEND_DATA = squad.legends;

W.KIT_ALLOW   = kits.allow;
W.KIT_ANCHOR  = kits.anchor;
W.KIT_STYLE   = kits.style;
W.KIT_DESIGN2 = kits.design;
W.KIT_YEAR    = kits.year;

W.ALBUM_EXTRA = album.extra;
W.OVERRIDES   = { photos: {}, ...album.overrides };

/* תמונות סגל/אגדות/ערכות הן קבצים תחת public/assets. תמונות מדבקות
   וקטגוריות מותאמות אישית (tools/sticker-studio.html) הן base64 מוטמע
   ישירות בקובץ, כפי שהכלי מייצא אותן. */
W.PHOTOS       = media.photos;
W.KIT_PHOTOS   = {};
W.EXTRA_PHOTOS = album.extraPhotos || {};
W.FILL_PHOTOS  = {};
W.GAME_ART     = media.art;

W.PHOTO_CREDITS = [...(squad.credits || []), ...(kits.credits || [])];

export default W;
