export const APPEARANCE_STORAGE_KEY = 'tl:appearance';

/** Выполняется в <head> до отрисовки: переносит сохранённую тему на <html>, чтобы не было вспышки. */
export const themeInitScript = `(function(){try{var s=JSON.parse(localStorage.getItem('${APPEARANCE_STORAGE_KEY}')||'null');var e=document.documentElement;if(s&&(s.theme==='light'||s.theme==='dark'))e.setAttribute('data-theme',s.theme);if(s&&(s.candleStyle==='mono'||s.candleStyle==='color'))e.setAttribute('data-candles',s.candleStyle)}catch(_){}})();`;
