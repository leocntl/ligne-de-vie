/* Export de la fiche : image PNG et PDF, dessinés sur un canvas (aucune bibliothèque, rien n'est envoyé).
   Le modèle vient de app.js : { first, last, nick, sub, summary, tags, portrait, sections, bg }.
   Le rendu est toujours clair, avec un fond blanc : lisible une fois partagé sur Discord ou imprimé. */
window.LDV_EXPORT = (function () {
  const W = 1200, M = 64, CW = W - 2 * M, PAGE_H = Math.round(W * 1.4142), SCALE = 1.5, FOOT = 64;
  const C = { ink: '#17152a', body: '#2b2940', muted: '#6a6880', line: '#e6e3f2', paper: '#ffffff', tint: '#f6f4fc',
    '--l1': '#7a6bf0', '--l2': '#35a5e6', '--l3': '#e46fb2', '--l4': '#2fbf9d', '--l5': '#ee9f5d', '--l6': '#8d93ab' };
  const TONES = { trait: '--l1', qualite: '--l4', defaut: '--l5', peur: '--l3', loisir: '--l2', style: '--l6', event: '--l4' };
  const SANS = "'Manrope','Segoe UI',system-ui,-apple-system,sans-serif", MONO = "'IBM Plex Mono',ui-monospace,Consolas,monospace";
  const font = (w, s, mono) => w + ' ' + s + 'px ' + (mono ? MONO : SANS);

  const measure = document.createElement('canvas').getContext('2d');
  const wrap = (text, maxW, f) => {
    measure.font = f;
    const out = [];
    String(text).split(/\n/).forEach(par => {
      let line = '';
      par.split(/\s+/).filter(Boolean).forEach(w => {
        const t = line ? line + ' ' + w : w;
        if (!line || measure.measureText(t).width <= maxW) line = t;
        else { out.push(line); line = w; }
      });
      out.push(line);
    });
    return out;
  };
  const rrect = (ctx, x, y, w, h, r) => {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  };
  const alpha = (ctx, a, fn) => { const o = ctx.globalAlpha; ctx.globalAlpha = o * a; fn(); ctx.globalAlpha = o; };
  const spaced = (ctx, px, fn) => { const had = 'letterSpacing' in ctx; if (had) ctx.letterSpacing = px + 'px'; fn(); if (had) ctx.letterSpacing = '0px'; };
  const loadImg = src => new Promise(res => { if (!src) return res(null); const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });

  /* ---------- les blocs : une hauteur, une fonction de dessin ---------- */
  function build(model, img) {
    const blocks = [];
    const add = (h, draw, keep) => blocks.push({ h, draw, keep: !!keep });

    // en-tête : portrait, nom, métier
    const PW = 224, PH = 280, tx = M + PW + 40, tw = CW - PW - 40;
    let nameFont = 66; measure.font = font(700, nameFont);
    while (nameFont > 38 && measure.measureText(model.first || 'Prénom').width > tw) { nameFont -= 4; measure.font = font(700, nameFont); }
    const subLines = wrap(model.sub || '', tw, font(500, 22));
    add(PH + 44, (ctx, x, y) => {
      ctx.save(); rrect(ctx, M, y, PW, PH, 30); ctx.clip();
      ctx.fillStyle = C.tint; ctx.fillRect(M, y, PW, PH);
      if (img) {
        const s = Math.max(PW / img.width, PH / img.height), w = img.width * s, h = img.height * s;
        ctx.drawImage(img, M + (PW - w) / 2, y + (PH - h) / 2, w, h);
      } else {
        alpha(ctx, 0.5, () => { ctx.fillStyle = C['--l6']; ctx.beginPath(); ctx.arc(M + PW / 2, y + PH * 0.38, PW * 0.19, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(M + PW / 2, y + PH + 6, PW * 0.38, PH * 0.34, 0, Math.PI, 0); ctx.fill(); });
      }
      ctx.restore();
      ctx.strokeStyle = C.line; ctx.lineWidth = 2; rrect(ctx, M, y, PW, PH, 30); ctx.stroke();
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = C.muted; ctx.font = font(500, 13, true); spaced(ctx, 3, () => ctx.fillText('CARTE DE PERSONNAGE  ·  FICTIF  ·  RP', tx, y + 20));
      ctx.fillStyle = C.ink; ctx.font = font(700, nameFont);
      let ny = y + 28 + nameFont;
      ctx.fillText(model.first || 'Prénom', tx, ny);
      if (model.nick) { ny += 36; ctx.fillStyle = C.muted; ctx.font = font(500, 22, true); ctx.fillText('« ' + model.nick + ' »', tx, ny); }
      ny += 40; ctx.fillStyle = C.body; ctx.font = font(500, 26, true); spaced(ctx, 6, () => ctx.fillText((model.last || 'NOM').toUpperCase(), tx, ny));
      ny += 14; ctx.font = font(500, 22); ctx.fillStyle = C.muted;
      subLines.forEach((l, i) => ctx.fillText(l, tx, ny + 34 + i * 32));
    });

    // résumé
    if (model.summary) {
      const lines = wrap(model.summary, CW - 64, font(500, 22));
      const pillsH = model.tags && model.tags.length ? 64 : 0;
      const h = 30 + 30 + lines.length * 34 + pillsH + 26;
      add(h + 30, (ctx, x, y) => {
        ctx.fillStyle = C.tint; rrect(ctx, M, y, CW, h, 26); ctx.fill();
        const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, C['--l1']); g.addColorStop(0.5, C['--l3']); g.addColorStop(1, C['--l5']);
        ctx.fillStyle = g; rrect(ctx, M, y + 22, 6, h - 44, 3); ctx.fill();
        ctx.fillStyle = C['--l1']; ctx.font = font(600, 13, true); spaced(ctx, 3, () => ctx.fillText('EN BREF', M + 32, y + 40));
        ctx.fillStyle = C.ink; ctx.font = font(500, 22);
        lines.forEach((l, i) => ctx.fillText(l, M + 32, y + 78 + i * 34));
        let px = M + 32; const py = y + 78 + lines.length * 34 + 6;
        (model.tags || []).forEach(t => {
          const col = C[TONES[t.tone]] || C['--l6'];
          ctx.font = font(700, 16, true); const kw = ctx.measureText(t.k.toUpperCase()).width + 4;
          ctx.font = font(600, 18); const vw = ctx.measureText(t.v).width, w = 18 + kw + 10 + vw + 18;
          if (px + w > M + CW - 20) return;
          alpha(ctx, 0.14, () => { ctx.fillStyle = col; rrect(ctx, px, py, w, 40, 20); ctx.fill(); });
          ctx.fillStyle = col; ctx.font = font(700, 14, true); ctx.fillText(t.k.toUpperCase(), px + 18, py + 26);
          ctx.fillStyle = C.ink; ctx.font = font(600, 18); ctx.fillText(t.v, px + 18 + kw + 10, py + 27);
          px += w + 10;
        });
      });
    }

    const body = (ctx, lines, x, y, f, lh, color) => { ctx.font = f; ctx.fillStyle = color || C.body; lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh)); };

    // sections
    model.sections.forEach((s, si) => {
      const col = C[s.color] || C['--l1'];
      add(88, (ctx, x, y) => {
        ctx.fillStyle = col; ctx.font = font(600, 15, true); spaced(ctx, 2, () => ctx.fillText(String(si + 1).padStart(2, '0'), M, y + 54));
        ctx.fillStyle = C.ink; ctx.font = font(700, 32); ctx.fillText(s.title, M + 44, y + 56);
        ctx.fillStyle = C.line; ctx.fillRect(M, y + 74, CW, 2);
        ctx.fillStyle = col; rrect(ctx, M, y + 73, 56, 4, 2); ctx.fill();
      }, true);
      s.blocks.forEach(b => {
        const ind = s.timeline ? 34 : 0;
        if (b.t === 'facts') {
          const cw = CW / 4, rows = [];
          for (let i = 0; i < b.items.length; i += 4) rows.push(b.items.slice(i, i + 4));
          const hs = rows.map(r => Math.max.apply(null, r.map(it => wrap(it[1], cw - 22, font(600, 20)).slice(0, 3).length)) * 28 + 40);
          add(hs.reduce((a, n) => a + n, 0) + 14, (ctx, x, y) => {
            let yy = y;
            rows.forEach((r, ri) => {
              r.forEach((it, i) => {
                const cx = M + i * cw;
                ctx.fillStyle = C.muted; ctx.font = font(500, 12, true); spaced(ctx, 1.5, () => ctx.fillText(it[0].toUpperCase(), cx, yy + 18));
                body(ctx, wrap(it[1], cw - 22, font(600, 20)).slice(0, 3), cx, yy + 46, font(600, 20), 28, C.ink);
              });
              yy += hs[ri];
            });
          });
        } else if (b.t === 'text') {
          const paras = String(b.text).split(/\n+/).filter(Boolean).map(p => wrap(p, CW - ind, font(500, 21)));
          const n = paras.reduce((a, p) => a + p.length, 0), h = 30 + n * 33 + (paras.length - 1) * 10 + 26;
          add(h, (ctx, x, y) => {
            if (ind) { ctx.fillStyle = col; alpha(ctx, 0.35, () => ctx.fillRect(M + 7, y - 2, 3, h + 4)); ctx.beginPath(); ctx.arc(M + 8.5, y + 14, 8, 0, Math.PI * 2); ctx.fill(); }
            ctx.fillStyle = col; ctx.font = font(600, 12, true); spaced(ctx, 2, () => ctx.fillText(b.label.toUpperCase(), M + ind, y + 18));
            let yy = y + 52;
            paras.forEach(p => { body(ctx, p, M + ind, yy, font(500, 21), 33); yy += p.length * 33 + 10; });
          });
        } else if (b.t === 'chips') {
          const colr = C[TONES[b.tone]] || C['--l6'];
          measure.font = font(600, 18);
          const rows = []; let row = [], rw = 0;
          b.items.forEach(t => { const w = measure.measureText(t).width + 36; if (row.length && rw + w + 10 > CW - ind) { rows.push(row); row = []; rw = 0; } row.push([t, w]); rw += w + 10; });
          if (row.length) rows.push(row);
          const h = 34 + rows.length * 50 + 14;
          add(h, (ctx, x, y) => {
            if (ind) { ctx.fillStyle = col; alpha(ctx, 0.35, () => ctx.fillRect(M + 7, y - 2, 3, h + 4)); ctx.beginPath(); ctx.arc(M + 8.5, y + 14, 8, 0, Math.PI * 2); ctx.fill(); }
            else { ctx.fillStyle = colr; ctx.beginPath(); ctx.arc(M + 5, y + 14, 5, 0, Math.PI * 2); ctx.fill(); }
            ctx.fillStyle = ind ? col : colr; ctx.font = font(600, 12, true); spaced(ctx, 2, () => ctx.fillText(b.label.toUpperCase(), M + (ind || 20), y + 18));
            rows.forEach((r, ri) => {
              let px = M + ind;
              r.forEach(it => {
                alpha(ctx, 0.14, () => { ctx.fillStyle = colr; rrect(ctx, px, y + 34 + ri * 50, it[1], 40, 20); ctx.fill(); });
                alpha(ctx, 0.35, () => { ctx.strokeStyle = colr; ctx.lineWidth = 1.5; rrect(ctx, px, y + 34 + ri * 50, it[1], 40, 20); ctx.stroke(); });
                ctx.fillStyle = C.ink; ctx.font = font(600, 18); ctx.fillText(it[0], px + 18, y + 34 + ri * 50 + 26);
                px += it[1] + 10;
              });
            });
          });
        } else if (b.t === 'cards') {
          b.items.forEach(it => {
            const lines = wrap(it.text, CW - 64, font(500, 21)), h = 26 + 30 + lines.length * 33 + 22;
            add(h + 16, (ctx, x, y) => {
              ctx.fillStyle = C.tint; rrect(ctx, M, y, CW, h, 22); ctx.fill();
              ctx.fillStyle = col; rrect(ctx, M, y + 20, 5, h - 40, 2.5); ctx.fill();
              ctx.fillStyle = col; ctx.font = font(600, 12, true); spaced(ctx, 2, () => ctx.fillText(it.label.toUpperCase(), M + 30, y + 36));
              body(ctx, lines, M + 30, y + 72, font(500, 21), 33);
            });
          });
        } else if (b.t === 'list') {
          const items = b.items.map(t => wrap(t, CW - 36, font(500, 21)));
          const n = items.reduce((a, l) => a + l.length, 0), h = 36 + n * 33 + items.length * 10 + 16;
          add(h, (ctx, x, y) => {
            ctx.fillStyle = col; ctx.font = font(600, 12, true); spaced(ctx, 2, () => ctx.fillText(b.label.toUpperCase(), M, y + 18));
            let yy = y + 56;
            items.forEach(l => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(M + 6, yy - 7, 5, 0, Math.PI * 2); ctx.fill(); body(ctx, l, M + 28, yy, font(500, 21), 33); yy += l.length * 33 + 10; });
          });
        } else if (b.t === 'rels') {
          const cw = (CW - 16) / 2, cards = b.items.map(r => ({ r, lines: wrap(r.note || '', cw - 100, font(500, 18)) }));
          const rowsH = []; for (let i = 0; i < cards.length; i += 2) rowsH.push(Math.max(cards[i].lines.length, cards[i + 1] ? cards[i + 1].lines.length : 0) * 27 + 92);
          add(rowsH.reduce((a, n) => a + n + 14, 0) + 6, (ctx, x, y) => {
            cards.forEach((cd, i) => {
              const cx = M + (i % 2) * (cw + 16), cy = y + rowsH.slice(0, Math.floor(i / 2)).reduce((a, n) => a + n + 14, 0), h = rowsH[Math.floor(i / 2)];
              ctx.fillStyle = C.tint; rrect(ctx, cx, cy, cw, h, 22); ctx.fill();
              alpha(ctx, 0.2, () => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx + 46, cy + 46, 26, 0, Math.PI * 2); ctx.fill(); });
              ctx.fillStyle = col; ctx.font = font(700, 24); ctx.textAlign = 'center'; ctx.fillText((cd.r.nom.match(/[\p{L}]/u) || ['?'])[0].toUpperCase(), cx + 46, cy + 55); ctx.textAlign = 'left';
              ctx.fillStyle = C.ink; ctx.font = font(700, 21); ctx.fillText(cd.r.nom, cx + 88, cy + 40);
              if (cd.r.lien) { ctx.fillStyle = C.muted; ctx.font = font(500, 12, true); spaced(ctx, 2, () => ctx.fillText(cd.r.lien.toUpperCase(), cx + 88, cy + 62)); }
              body(ctx, cd.lines, cx + 88, cy + 94, font(500, 18), 27, C.body);
            });
          });
        }
      });
    });

    // background
    if (model.bg && model.bg.length) {
      add(88, (ctx, x, y) => {
        ctx.fillStyle = C['--l1']; ctx.font = font(600, 15, true); spaced(ctx, 2, () => ctx.fillText('+', M, y + 54));
        ctx.fillStyle = C.ink; ctx.font = font(700, 32); ctx.fillText('Background', M + 44, y + 56);
        ctx.fillStyle = C.line; ctx.fillRect(M, y + 74, CW, 2);
        ctx.fillStyle = C['--l1']; rrect(ctx, M, y + 73, 56, 4, 2); ctx.fill();
      }, true);
      model.bg.forEach(p => {
        const paras = String(p[1]).split(/\n+/).filter(Boolean).map(t => wrap(t, CW, font(500, 21)));
        const n = paras.reduce((a, l) => a + l.length, 0), h = 30 + n * 33 + (paras.length - 1) * 10 + 26;
        add(h, (ctx, x, y) => {
          ctx.fillStyle = C['--l1']; ctx.font = font(600, 12, true); spaced(ctx, 2, () => ctx.fillText(String(p[0]).toUpperCase(), M, y + 18));
          let yy = y + 52;
          paras.forEach(l => { body(ctx, l, M, yy, font(500, 21), 33); yy += l.length * 33 + 10; });
        });
      });
    }
    return blocks;
  }

  /* ---------- décor commun : barre colorée, pied de page ---------- */
  function chrome(ctx, h, page, pages) {
    const g = ctx.createLinearGradient(0, 0, W, 0);
    ['--l1', '--l2', '--l3', '--l5'].forEach((k, i, a) => g.addColorStop(i / (a.length - 1), C[k]));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 8);
    ctx.fillStyle = C.muted; ctx.font = font(500, 13, true); ctx.textBaseline = 'alphabetic';
    spaced(ctx, 2, () => ctx.fillText('ALIAS  ·  FICHE FICTIVE POUR LE JEU DE RÔLE', M, h - 30));
    if (pages > 1) { ctx.textAlign = 'right'; ctx.fillText(page + ' / ' + pages, W - M, h - 30); ctx.textAlign = 'left'; }
  }
  const newCanvas = h => {
    const cv = document.createElement('canvas'); cv.width = Math.round(W * SCALE); cv.height = Math.round(h * SCALE);
    const ctx = cv.getContext('2d'); ctx.scale(SCALE, SCALE);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, h); ctx.textBaseline = 'alphabetic';
    return { cv, ctx };
  };
  const ready = async () => {
    try { await Promise.all([['500', 'Manrope'], ['600', 'Manrope'], ['700', 'Manrope'], ['500', '"IBM Plex Mono"'], ['600', '"IBM Plex Mono"']].map(f => document.fonts.load(f[0] + ' 20px ' + f[1], 'AaÉé'))); } catch (e) { /* polices système */ }
  };
  const toBlob = (cv, type, q) => new Promise((res, rej) => cv.toBlob(b => (b ? res(b) : rej(new Error('Image impossible à créer.'))), type, q));

  // une seule image, aussi haute que nécessaire
  async function png(model) {
    await ready();
    const blocks = build(model, await loadImg(model.portrait));
    const h = M + 8 + blocks.reduce((a, b) => a + b.h, 0) + FOOT;
    const { cv, ctx } = newCanvas(h);
    let y = M + 8;
    blocks.forEach(b => { b.draw(ctx, M, y); y += b.h; });
    chrome(ctx, h, 1, 1);
    return toBlob(cv, 'image/png');
  }

  // des pages A4 : les blocs ne sont jamais coupés en deux, un titre ne reste jamais seul en bas d'une page
  async function pdf(model) {
    await ready();
    const blocks = build(model, await loadImg(model.portrait));
    const pages = [[]], room = PAGE_H - M - FOOT - 8;
    let used = 0;
    blocks.forEach((b, i) => {
      const need = b.h + (b.keep && blocks[i + 1] ? blocks[i + 1].h : 0);
      if (used && used + need > room) { pages.push([]); used = 0; }
      pages[pages.length - 1].push([b, used]); used += b.h;
    });
    const jpegs = [];
    for (let i = 0; i < pages.length; i++) {
      const { cv, ctx } = newCanvas(PAGE_H);
      pages[i].forEach(it => it[0].draw(ctx, M, M + 8 + it[1]));
      chrome(ctx, PAGE_H, i + 1, pages.length);
      const blob = await toBlob(cv, 'image/jpeg', 0.92);
      jpegs.push({ w: cv.width, h: cv.height, data: new Uint8Array(await blob.arrayBuffer()) });
    }
    return pdfFrom(jpegs);
  }

  /* ---------- un PDF minimal : une image JPEG par page ---------- */
  function pdfFrom(jpegs) {
    const enc = new TextEncoder(), parts = [], offs = [];
    let len = 0;
    const put = x => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
    const PW = 595.28, PHT = 841.89, n = jpegs.length;
    put('%PDF-1.4\n'); put(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));
    const obj = (id, body) => { offs[id] = len; put(id + ' 0 obj\n' + body + '\nendobj\n'); };
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [' + jpegs.map((_, i) => (3 + 3 * i) + ' 0 R').join(' ') + '] /Count ' + n + ' >>');
    jpegs.forEach((j, i) => {
      const pg = 3 + 3 * i, ct = pg + 1, im = pg + 2, draw = 'q ' + PW + ' 0 0 ' + PHT + ' 0 0 cm /Im0 Do Q';
      obj(pg, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PW + ' ' + PHT + '] /Resources << /XObject << /Im0 ' + im + ' 0 R >> >> /Contents ' + ct + ' 0 R >>');
      obj(ct, '<< /Length ' + draw.length + ' >>\nstream\n' + draw + '\nendstream');
      offs[im] = len;
      put(im + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + j.w + ' /Height ' + j.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + j.data.length + ' >>\nstream\n');
      put(j.data); put('\nendstream\nendobj\n');
    });
    const total = 3 + 3 * n, xref = len;
    let x = 'xref\n0 ' + total + '\n0000000000 65535 f \n';
    for (let i = 1; i < total; i++) x += String(offs[i]).padStart(10, '0') + ' 00000 n \n';
    put(x + 'trailer\n<< /Size ' + total + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
    return new Blob(parts, { type: 'application/pdf' });
  }

  return { png, pdf };
})();
