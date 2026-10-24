/* Alias : image choisie par la personne (photo, image générée ailleurs avec une IA, dessin...).
   Tout se passe dans le navigateur : l'image est lue, cadrée au format 5:6 du portrait puis enregistrée en JPEG.
   Rien n'est envoyé sur internet. */
window.LDV_PHOTO = (function () {
  'use strict';

  const OUT_W = 480, OUT_H = 576; // taille enregistrée, au format du portrait
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  class PhotoError extends Error {}

  // lit un fichier image ; renvoie l'élément image, son adresse temporaire et sa taille
  function load(file) {
    return new Promise((res, rej) => {
      if (!file || !/^image\/(jpeg|png|webp|gif)$/.test(file.type)) return rej(new PhotoError('Choisis une image JPG, PNG, WebP ou GIF.'));
      if (file.size > 25 * 1024 * 1024) return rej(new PhotoError('Cette image dépasse 25 Mo.'));
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => res({ img, url, w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => { URL.revokeObjectURL(url); rej(new PhotoError('Cette image ne peut pas être lue.')); };
      img.src = url;
    });
  }

  // position de l'image (w × h) dans un cadre fw × fh : zoom >= 1, fx et fy = décalage en fraction de la largeur du cadre
  function place(w, h, fw, fh, zoom, fx, fy) {
    const s = Math.max(fw / w, fh / h) * zoom, iw = w * s, ih = h * s;
    const mx = (iw - fw) / 2, my = (ih - fh) / 2;
    const px = clamp(fx * fw, -mx, mx), py = clamp(fy * fw, -my, my);
    return { w: iw, h: ih, left: (fw - iw) / 2 + px, top: (fh - ih) / 2 + py, fx: px / fw, fy: py / fw };
  }

  // découpe ce que montre le cadre et renvoie un JPEG en data URL
  function crop(img, w, h, zoom, fx, fy) {
    const c = document.createElement('canvas');
    c.width = OUT_W; c.height = OUT_H;
    const p = place(w, h, OUT_W, OUT_H, zoom, fx, fy), ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, OUT_W, OUT_H);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, p.left, p.top, p.w, p.h);
    return c.toDataURL('image/jpeg', 0.88);
  }

  return { load, place, crop, PhotoError, OUT_W, OUT_H };
})();
