import { defineConfig } from 'vite';

export default defineConfig({
  base: './',                 // Capacitor מגיש מהדיסק, לא משורש אתר
  server: { host: true },     // כדי לפתוח מהטלפון באותה רשת
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,     // תמונות נשארות קבצים ולא חוזרות ל-base64
  },
});
