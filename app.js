/* Alias : créateur de personnage RP.
   Tout tourne dans le navigateur. Les fiches sont enregistrées dans localStorage. */
(function () {
  'use strict';

  const D = window.LDV;
  const A = D; // choix de traits physiques (peau, cheveux, yeux...), définis dans data.js
  const P = window.LDV_PHOTO;
  const DS = window.LDV_DESCRIBE;
  const KEY = 'ligne-de-vie.v1';

  /* ---------- petits outils ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const rnd = n => Math.floor(Math.random() * n);
  const pick = a => a[rnd(a.length)];
  const pickN = (a, n) => { const b = a.slice(), out = []; while (out.length < n && b.length) out.push(b.splice(rnd(b.length), 1)[0]); return out; };
  const rint = (a, b) => a + rnd(b - a + 1);
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const at = (arr, i) => arr[clamp(parseInt(i, 10) || 0, 0, arr.length - 1)];
  const cap = s => (s ? s[0].toUpperCase() + s.slice(1) : '');
  const lc = s => (s && !/^[A-ZÀ-Ö]{2}/.test(s) ? s[0].toLowerCase() + s.slice(1) : s || '');
  const newId = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  function wpick(pairs) {
    let r = Math.random() * pairs.reduce((s, p) => s + p[1], 0);
    for (const p of pairs) { r -= p[1]; if (r < 0) return p[0]; }
    return pairs[0][0];
  }

  const ICON = (() => {
    const s = body => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
    return {
      die: s('<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1" fill="currentColor"/>'),
      lock: s('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
      unlock: s('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-1.5"/>'),
      trash: s('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
      plus: s('<path d="M12 5v14M5 12h14"/>'),
      minus: s('<path d="M5 12h14"/>'),
      sun: s('<circle cx="12" cy="12" r="4"/><path d="M12 2.500v2.500M12 19v2.500M2.500 12H5M19 12h2.500M5.200 5.200l1.800 1.800M17 17l1.800 1.800M5.200 18.800 7 17M17 7l1.800-1.800"/>'),
      moon: s('<path d="M20 14.500A8.500 8.500 0 0 1 9.500 4a8.500 8.500 0 1 0 10.500 10.500z"/>'),
      auto: s('<circle cx="12" cy="12" r="8.500"/><path d="M12 3.500v17a8.500 8.500 0 0 0 0-17z" fill="currentColor"/>'),
      bulb: s('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.500 10.900c.6.500 1 1.200 1 2.100h5c0-.9.4-1.600 1-2.100A6 6 0 0 0 12 3z"/>'),
      copy: s('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>'),
      left: s('<path d="M15 6l-6 6 6 6"/>'),
      right: s('<path d="M9 6l6 6-6 6"/>'),
      spark: s('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'),
      list: s('<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>'),
      card: s('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h4M7 14h6M15 10h2"/>'),
      down: s('<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>'),
      link: s('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
      up: s('<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>')
    };
  })();

  /* ---------- genre grammatical ---------- */
  // "f" ou "m" d'après le genre ; "x" (forme inclusive dans les listes) tant que le genre n'est pas choisi
  function form(c) {
    const g = c.v.genre;
    return g === 'Femme' ? 'f' : g === 'Homme' ? 'm' : 'x';
  }
  // portrait affiché sur la fiche : l'image choisie, sinon une silhouette neutre
  const SILHOUETTE = '<svg class="sil" viewBox="0 0 100 120" role="img" aria-label="Pas encore d\'image"><circle cx="50" cy="42" r="19"/><path d="M14 120c0-26 16-40 36-40s36 14 36 40z"/></svg>';
  const portrait = c => (c.photo.src ? `<img class="photo-img" src="${c.photo.src}" alt="Portrait du personnage">` : SILHOUETTE);
  function incl(a, b) {
    if (a === b) return a;
    if (/eur$/.test(a) && /euse$/.test(b)) return a + '·se';
    if (/teur$/.test(a) && /trice$/.test(b)) return a + '·rice';
    let p = 0;
    while (p < a.length && p < b.length && a[p] === b[p]) p++;
    return a + '·' + b.slice(p);
  }
  // "Têtu|Têtue" ou "Infirmier|Infirmière~ de nuit" selon la forme demandée
  function disp(raw, f) {
    raw = String(raw == null ? '' : raw);
    const i = raw.indexOf('|');
    if (i < 0) return raw;
    const a = raw.slice(0, i);
    let b = raw.slice(i + 1), suffix = '';
    const j = b.indexOf('~');
    if (j >= 0) { suffix = b.slice(j + 1); b = b.slice(0, j); }
    return (f === 'm' ? a : f === 'f' ? b : incl(a, b)) + suffix;
  }
  // remplace les jetons {prenom} {il} {e} ... dans les textes générés
  function fill(tpl, c) {
    // sans genre choisi, les textes tirés au sort passent au masculin
    const f = form(c) === 'f' ? 'f' : 'm', v = c.v;
    const il = { f: 'elle', m: 'il' }[f];
    const first = (v.loisirs || [])[0];
    const map = {
      prenom: disp(v.prenom, f) || 'Le personnage',
      nom: disp(v.nom, f),
      ville: D.cityName(v.ville) || 'sa ville',
      metier: metierTxt(v.metier, f),
      logement: lc(v.logement) || 'dans un petit logement',
      hobby: lc(first) || 'la musique',
      il, Il: cap(il), e: { f: 'e', m: '' }[f],
      qu_il: { f: "qu'elle", m: "qu'il" }[f],
      s_il: { f: 'si elle', m: "s'il" }[f]
    };
    return tpl.replace(/\{(\w+)\}/g, (m, k) => (k in map ? map[k] : m));
  }
  // une origine est un pays, « Américain » ou une ville de GTA. Pour « Américain » et les villes, une origine familiale cachée
  // (herit : « Latino-américaines »...) choisit les prénoms, les noms et les traits physiques
  const needsHerit = o => D.originInfo(o).kind !== 'nation';
  function ensureHerit(c) {
    if (!needsHerit(c.v.origine)) { delete c.v.herit; return; }
    // l'origine familiale reste si elle est possible pour cette origine (Cayo Perico : seulement latino), sinon on en tire une
    const w = D.heritWeights(c.v.origine, c.v.ville), cur = w.find(x => x[0] === c.v.herit);
    if (!cur || cur[1] <= 0) c.v.herit = wpick(w);
  }
  const pool = c => {
    const i = D.originInfo(c.v.origine);
    return i.kind === 'nation' ? i.nation : D.ORIGINES.find(o => o.label === c.v.herit) || D.ORIGINES[0];
  };
  const lookGroup = c => {
    const i = D.originInfo(c.v.origine);
    if (i.kind === 'nation') return i.nation.look;
    const l = c.v.herit || '';
    return /Afro/.test(l) ? 'dark' : /Latino|Arabes|Amérindiennes/.test(l) ? 'mid' : /Asiatiques/.test(l) ? 'asia' : 'eu';
  };
  // « Enchaîne les petits boulots » ne se glisse pas dans « travaille comme… » : on met un équivalent
  function metierTxt(raw, f) {
    const m = lc(disp(raw, f));
    if (/^enchaîne les petits boulots/i.test(m)) return f === 'f' ? 'femme à tout faire' : 'homme à tout faire';
    if (/^vit de ses économies/i.test(m)) return f === 'f' ? 'rentière' : 'rentier';
    if (/^vit de combines/i.test(m)) return f === 'f' ? 'débrouillarde' : 'débrouillard';
    return m || 'un métier';
  }
  // centimètres vers pieds et pouces, par exemple 178 donne 5'10"
  const imp = cm => { if (!cm) return ''; const t = Math.round(cm / 2.54); return Math.floor(t / 12) + "'" + (t % 12) + '"'; };

  /* ---------- générateurs ---------- */
  // tire au sort les traits physiques (peau, cheveux, yeux...) de façon cohérente avec l'origine, l'âge et le genre
  function genLook(c) {
    const v = c.v, f = form(c), age = v.age || 30, g = lookGroup(c);
    const dark = g === 'dark', mid = g === 'mid', asia = g === 'asia';
    const peau = dark ? rint(4, 7) : mid ? rint(2, 5) : asia ? rint(1, 3) : rint(0, 3);
    let cheveux;
    if (age >= 58 && Math.random() < 0.6) cheveux = pick([7, 7, 8]);
    else if (dark || mid || asia) cheveux = pick([0, 0, 0, 1, 1, 2]);
    else if (age < 38 && Math.random() < 0.08) cheveux = pick([9, 10]);
    else cheveux = pick([0, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5, 6]);
    let coupe;
    if (f === 'f') coupe = pick(['mi', 'long', 'long', 'queue', 'chignon', 'court']);
    else if (f === 'm') coupe = pick(['court', 'court', 'ras', 'court']);
    else coupe = pick(['court', 'mi', 'long', 'queue', 'chignon', 'ras']);
    if (dark && Math.random() < 0.4) coupe = 'boucles';
    if (f === 'm' && age > 35 && Math.random() < 0.15) coupe = 'chauve';
    const pilo = f === 'm' ? wpick([['non', 45], ['3j', 25], ['barbe', 20], ['mous', 10]]) : f === 'x' ? wpick([['non', 85], ['3j', 15]]) : 'non';
    return {
      av_peau: peau, av_cheveux: cheveux, av_coupe: coupe,
      av_yeux: dark || asia ? pick([0, 0, 1, 6]) : mid ? pick([0, 1, 2, 6]) : pick([0, 1, 1, 2, 3, 4, 5]),
      av_pilo: pilo, av_lunettes: Math.random() < 0.28 ? pick(['rondes', 'carrees']) : 'non',
      av_taches: peau <= 3 && Math.random() < (cheveux === 6 ? 0.6 : 0.07) ? 'oui' : 'non'
    };
  }

  // les choix peuvent dépendre de l'univers : opts est alors une fonction
  const optsOf = d => (typeof d.opts === 'function' ? d.opts() : d.opts).map(o => (typeof o === 'string' ? { v: o } : o));
  const W = () => store.world;
  const logementList = () => (W() === 'gta' ? D.LOGEMENTS.concat(D.LOGEMENTS_GTA) : D.LOGEMENTS);
  const loisirList = () => (W() === 'gta' ? D.LOISIRS.concat(D.LOISIRS_GTA) : D.LOISIRS);
  const metierList = () => (W() === 'gta' ? D.METIERS_GTA.concat(D.METIERS) : D.METIERS);
  function setWorld(w) {
    store.world = w === 'usa' ? 'usa' : 'gta';
    D.VILLES = store.world === 'gta' ? D.VILLES_GTA : D.VILLES_USA;
    ui.exIdx = null;
  }

  /* ---------- banque d'idées originales ---------- */
  // les listes de ideas.js : des idées neutres, plus celles propres à l'univers GTA (clé_gta)
  const ipool = key => ((D.IDEES && D.IDEES[key]) || []).concat(W() === 'gta' && D.IDEES ? D.IDEES[key + '_gta'] || [] : []);
  // champs libres qui proposent des idées, et nombre d'idées montrées
  const IDEA_FIELDS = { surnom: 6, metier: 5, affiliation: 6, signes: 4, attitude: 4, motivation: 4, manies: 4, secret: 3, enfance: 3, parcours: 3, actuel: 3, accroches: 4, notes: 4, traits: 6, qualites: 6, defauts: 6, peurs: 6, loisirs: 6, style: 6, logement: 5, evenement: 5 };
  const hasIdeas = key => key in IDEA_FIELDS && !!D.IDEES;
  // surnoms : déduits de la fiche (métier, caractère, physique), puis une banque de surnoms
  const NICK_JOB = [[/policier|lspd|bcso|sahp|adjoint|ranger/, ['Sarge', 'Badge', 'Deputy']], [/médecin|docteur|urgentiste/, ['Doc']], [/infirmi|ambulanci|ems/, ['Pulse', 'Nurse']], [/pompier|lsfd/, ['Smokey', 'Ladder']], [/mécani|garag|dépann/, ['Wrench', 'Grease']], [/avocat|droit|juriste/, ['Counsel', 'Objection']], [/cuisin|chef|diner|burger|pizza|restaur/, ['Chef', 'Sizzle']], [/journalist|weazel|paparazzi/, ['Scoop', 'Byline']], [/pêch|marin|bateau/, ['Cap', 'Reel']], [/chauffeur|taxi|routier|livreu|camionn/, ['Wheels', 'Mile']], [/pilote/, ['Maverick']], [/barman|bartender|barmaid/, ['Shaker']], [/tatou/, ['Ink']], [/étudiant/, ['Freshman', 'Prof']], [/retrait/, ['Pops', 'Vieux']], [/cascad|acteur|actrice/, ['Action', 'Take Two']]];
  const NICK_TRAIT = [[/sarcast|ironi|pince/, 'Sunshine'], [/calme|flegma|stoïq/, 'Zen'], [/impuls|colér|bagarr/, 'Boom'], [/charm/, 'Smooth'], [/rêveu/, 'Cloud'], [/timide|discret/, 'Mouse'], [/blagu|espiègle/, 'Joker'], [/loyal|fidèle/, 'Ride-or-Die'], [/rusé|roublard/, 'Fox'], [/bavard/, 'Radio'], [/noctambule|insomni/, 'Owl']];
  function nicknameIdeas(c) {
    const v = c.v, mine = [];
    const job = disp(v.metier, 'm').toLowerCase();
    NICK_JOB.forEach(x => { if (x[0].test(job)) x[1].forEach(n => mine.push(n)); });
    (v.traits || []).forEach(t => { const w = disp(t, 'm').toLowerCase(); NICK_TRAIT.forEach(x => { if (x[0].test(w)) mine.push(x[1]); }); });
    if (v.av_cheveux === 6) mine.push('Red', 'Ginger');
    if (v.av_cheveux === 7 || v.av_cheveux === 8) mine.push('Silver');
    if (v.av_lunettes && v.av_lunettes !== 'non') mine.push('Four Eyes');
    if (v.av_pilo === 'barbe') mine.push('Bear');
    if (v.av_coupe === 'chauve') mine.push('Cue Ball');
    if (v.av_taches === 'oui') mine.push('Freckles');
    if (v.taille > 188) mine.push('Tiny'); else if (v.taille && v.taille < 162) mine.push('Shorty');
    return { mine: Array.from(new Set(mine)), pool: ipool('surnom') };
  }
  function ideaPoolFor(key, c) {
    const d = F[key], ville = c.v.ville || '';
    if (d.t === 'area') return ipool(key).map(t => (key === 'accroches' ? '• ' : '') + fill(t, c));
    // les idées liées à un lieu ou à un métier local ne vont qu'aux personnages concernés
    if (key === 'metier') return ipool(key).filter(j => D.jobFits(j, ville));
    if (key === 'logement' || key === 'affiliation' || key === 'loisirs' || key === 'evenement' || key === 'style') return ipool(key).filter(x => D.placeFits(x, ville));
    return ipool(key);
  }
  // tire n idées neuves : celles déjà présentes dans le champ et celles déjà montrées sont écartées tant qu'il en reste
  function makeIdeas(key, c, avoid) {
    const cur = c.v[key], n = IDEA_FIELDS[key];
    const has = x => (Array.isArray(cur) ? cur.indexOf(x) >= 0 : typeof cur === 'string' && cur !== '' && cur.indexOf(x) >= 0);
    const fresh = list => { const l = list.filter(x => !has(x)), f = l.filter(x => avoid.indexOf(x) < 0); return f.length ? f : l; };
    let items;
    if (key === 'surnom') {
      const nk = nicknameIdeas(c), mine = pickN(nk.mine.filter(x => !has(x) && avoid.indexOf(x) < 0), 3);
      items = mine.concat(pickN(fresh(nk.pool).filter(x => mine.indexOf(x) < 0), n - mine.length));
    } else {
      const all = ideaPoolFor(key, c).filter(x => !has(x)), unseen = all.filter(x => avoid.indexOf(x) < 0);
      if (unseen.length < n) avoid.length = 0;
      items = pickN(unseen.length >= n ? unseen : all, n);
    }
    items.forEach(x => avoid.push(x));
    return { items, avoid };
  }
  function useIdea(key, i) {
    const c = C(), d = F[key], st = ui.ideas[key];
    const item = st && st.items[i];
    if (item == null) return;
    if (d.t === 'multi') {
      const a = (c.v[key] || []).slice();
      if (a.indexOf(item) < 0) {
        if (a.length >= d.max) { toast('Maximum ' + d.max + ' choix : retires-en un d\'abord.'); return; }
        a.push(item);
      }
      c.v[key] = a;
      st.items.splice(i, 1, ...makeIdeas(key, c, st.avoid).items.slice(0, 1));
    } else {
      if (d.t === 'area') {
        const cur = (c.v[key] || '').trim(), sep = key === 'accroches' || key === 'notes' ? '\n' : ' ';
        c.v[key] = cur ? cur + sep + item : item;
      } else c.v[key] = item;
      delete ui.ideas[key];
    }
    changed(key);
    toast('Idée ajoutée.');
    if (!ui.ideas[key]) { const el = $('#f-' + key); if (el) el.focus({ preventScroll: true }); }
  }
  function ideasHTML(key, c) {
    const st = ui.ideas[key];
    if (!st) return '';
    const d = F[key], f = form(c), short = d.t !== 'area';
    return `<div class="ideas" role="group" aria-label="Idées originales : ${esc(d.label)}"><p class="ideas-t">${ICON.bulb}<span>Idées originales</span></p>` +
      `<div class="ideas-list${short ? ' pills' : ''}">${st.items.map((t, i) => `<button type="button" class="idea" data-act="ideaUse" data-key="${key}" data-i="${i}">${esc(disp(t, f))}</button>`).join('')}</div>` +
      `<div class="btnrow"><button type="button" class="btn small" data-act="ideaMore" data-key="${key}">${ICON.die}<span>D'autres idées</span></button><button type="button" class="btn small ghost" data-act="ideaClose" data-key="${key}">Fermer</button></div></div>`;
  }

  /* ---------- définition des champs ---------- */
  // t : type de champ. gen : tirage au sort (absent = pas de dé). w : "half" pour deux colonnes.
  const F = {
    prenom: { t: 'text', label: 'Prénom', ph: 'Emily', max: 40, w: 'half', gen: c => { const p = pool(c), f = form(c); return f === 'f' ? pick(p.f) : f === 'm' ? pick(p.m) : (Math.random() < 0.6 ? pick(D.NEUTRES) : pick(p.f.concat(p.m))); } },
    nom: { t: 'text', label: 'Nom', ph: 'Carter', max: 40, w: 'half', gen: c => pick(pool(c).noms) },
    surnom: { t: 'text', label: 'Surnom', ph: 'Em', max: 30, w: 'half', gen: (c, bulk) => { if (bulk && Math.random() > 0.35) return ''; const nk = nicknameIdeas(c); return nk.mine.length && Math.random() < 0.6 ? pick(nk.mine) : pick(nk.pool); } },
    age: { t: 'number', label: 'Âge', min: 14, max: 100, unit: 'ans', w: 'half', gen: () => { const r = Math.random(); return r < 0.25 ? rint(18, 25) : r < 0.7 ? rint(26, 40) : r < 0.92 ? rint(41, 60) : rint(61, 82); } },
    genre: { t: 'chips', label: 'Genre', opts: D.GENRES, w: 'half', gen: () => pick(D.GENRES) },
    origine: { t: 'chips', label: 'Origines', opts: () => D.originList(W() === 'gta'), custom: true, gen: c => wpick(D.originWeights(W() === 'gta', c.v.ville)) },
    ville: { t: 'text', label: 'Ville ou quartier', ph: () => (W() === 'gta' ? 'Davis (Los Santos)' : 'Austin, TX'), list: 'villes', max: 50, w: 'half', gen: () => pick(D.VILLES) },
    metier: {
      t: 'text', label: 'Métier ou occupation', ph: 'Infirmière', list: 'metiers', max: 70, w: 'half',
      gen: c => {
        const a = c.v.age || 30;
        const gta = W() === 'gta', ok = list => { const l = a >= 23 ? list : list.filter(j => !D.JOBS_ADULT.test(j)); return l.length ? l : list; };
        if (a <= 24 && Math.random() < 0.55) return pick(gta && Math.random() < 0.6 ? D.etudiantsGta(c.v.ville) : D.METIERS_ETUDIANTS);
        if (a >= 64 && Math.random() < 0.5) return 'Retraité|Retraitée';
        return pick(ok(gta && Math.random() < 0.6 ? D.metiersGta(c.v.ville) : D.METIERS));
      }
    },
    affiliation: {
      t: 'chips', label: 'Affiliation', opts: D.AFFILIATIONS, custom: true, world: 'gta',
      gen: c => {
        const m = disp(c.v.metier, 'm');
        if (/^(?:Étudiant|Alternant|Retrait)/.test(m) || (c.v.age || 30) < 18) return '';
        const hit = D.AFFIL_DE_METIER.find(x => x[0].test(m));
        if (hit) return hit[1];
        return Math.random() < 0.28 && (c.v.age || 30) <= 45 && (!m || D.GANG_JOBS.test(m)) ? pick(D.GANGS) : '';
      }
    },
    situation: {
      t: 'chips', label: 'Situation amoureuse', opts: D.SITUATIONS, custom: true,
      gen: c => {
        const a = c.v.age || 30;
        if (a < 22 && Math.random() < 0.7) return 'Célibataire';
        return pick(D.SITUATIONS.filter(s => !((/^Veuf/.test(s) && a < 40) || (/^Divorcé/.test(s) && a < 25) || (/^(Marié|Fiancé)/.test(s) && a < 20))));
      }
    },
    logement: {
      t: 'chips', label: 'Logement', opts: logementList, custom: true,
      gen: c => {
        const a = c.v.age || 30;
        if (a < 22) return pick(['Chez ses parents', 'En résidence universitaire', 'En colocation', 'Dans un studio']);
        const young = a < 30;
        return pick(logementList().filter(l => l !== 'En résidence universitaire' && (young ? Math.random() < 0.25 || l !== 'Chez ses parents' : l !== 'Chez ses parents')));
      }
    },

    taille: { t: 'number', label: 'Taille', min: 100, max: 230, unit: 'cm', w: 'half', gen: c => clamp(Math.round({ f: 164, m: 177, x: 170 }[form(c)] + (Math.random() + Math.random() + Math.random() - 1.5) * 14), 148, 200) },
    corpulence: { t: 'chips', label: 'Corpulence', opts: D.CORPULENCES, custom: true, w: 'half', gen: () => wpick([['Mince', 3], ['Athlétique', 2], ['Moyenne', 4], ['Robuste', 2], ['Ronde', 2]]) },
    photo: { t: 'photo', label: 'Image du personnage' },
    look: { t: 'look', label: 'Traits physiques', gen: genLook },
    av_coupe: { t: 'chips', label: 'Coupe de cheveux', opts: A.COUPES },
    av_cheveux: { t: 'swatch', label: 'Couleur des cheveux', pal: A.CHEVEUX },
    av_yeux: { t: 'swatch', label: 'Yeux', pal: A.YEUX },
    av_peau: { t: 'swatch', label: 'Teint', pal: A.PEAU },
    av_pilo: { t: 'chips', label: 'Pilosité', opts: A.PILOSITE },
    av_lunettes: { t: 'chips', label: 'Lunettes', opts: A.LUNETTES },
    av_taches: { t: 'chips', label: 'Taches de rousseur', opts: A.TACHES },
    style: { t: 'multi', label: 'Style vestimentaire', opts: D.STYLES, max: 6, custom: true, gen: () => pickN(D.STYLES, rint(1, 3)) },
    signes: { t: 'area', label: 'Signes distinctifs', rows: 2, ph: 'Cicatrice, tatouage, piercing, détail qu\'on remarque…', gen: (c, bulk) => (!bulk || Math.random() < 0.65 ? fill(pick(D.SIGNES.concat(ipool('signes'))), c) : '') },
    attitude: { t: 'area', label: 'Voix et attitude', rows: 2, ph: 'Comment il ou elle parle, se tient, occupe l\'espace…', gen: c => fill(pick(D.ATTITUDES.concat(ipool('attitude'))), c) },

    traits: { t: 'multi', label: 'Traits de caractère', opts: D.TRAITS, max: 6, custom: true, gen: () => pickN(D.TRAITS, rint(3, 5)) },
    qualites: { t: 'multi', label: 'Qualités', opts: D.QUALITES, max: 6, custom: true, gen: () => pickN(D.QUALITES, rint(2, 4)) },
    defauts: { t: 'multi', label: 'Défauts', opts: D.DEFAUTS, max: 6, custom: true, gen: () => pickN(D.DEFAUTS, rint(2, 4)) },
    peurs: { t: 'multi', label: 'Peurs', opts: D.PEURS, max: 6, custom: true, gen: () => pickN(D.PEURS, rint(1, 3)) },
    loisirs: { t: 'multi', label: 'Loisirs et passions', opts: loisirList, max: 6, custom: true, gen: () => pickN(loisirList(), rint(2, 5)) },
    motivation: { t: 'area', label: 'Ce qui le motive', rows: 2, ph: 'Un but, un besoin, une promesse…', gen: c => fill(pick(D.MOTIVATIONS.concat(ipool('motivation'))), c) },
    manies: { t: 'area', label: 'Habitudes et manies', rows: 2, ph: 'Les petits détails qui le rendent vivant.', gen: c => pickN(D.MANIES.concat(ipool('manies')), 2).map(s => fill(s, c)).join(' ') },
    secret: { t: 'area', label: 'Secret', rows: 2, ph: 'Ce que personne ne sait. Il apparaît dans la fiche exportée.', gen: c => fill(pick(D.SECRETS.concat(ipool('secret'))), c) },

    enfance: { t: 'area', label: 'Origines et enfance', rows: 4, ph: 'Où et comment a-t-il ou elle grandi ?', gen: c => fill(pick(D.ENFANCES.concat(ipool('enfance'))), c) },
    parcours: { t: 'area', label: 'Études et parcours', rows: 3, ph: 'Les étapes qui l\'ont mené où il ou elle en est.', gen: c => fill(pick(D.PARCOURS.concat(ipool('parcours'))), c) },
    evenement: { t: 'chips', label: 'Événement marquant', opts: D.EVENEMENTS, custom: true, gen: () => pick(D.EVENEMENTS) },
    actuel: { t: 'area', label: 'Aujourd\'hui', rows: 3, ph: 'Sa vie en ce moment.', gen: c => fill(pick(D.ACTUELS.concat(ipool('actuel'))), c) },
    accroches: { t: 'area', label: 'Accroches de RP', rows: 4, ph: 'Ce qui permet à un autre personnage de l\'aborder ou de l\'entraîner dans son histoire.', gen: c => pickN(D.ACCROCHES.concat(ipool('accroches')), 3).map(s => '• ' + fill(s, c)).join('\n') },
    notes: { t: 'area', label: 'Notes libres', rows: 3, ph: 'Tout ce qui ne rentre pas ailleurs.', gen: c => fill(pick(ipool('notes')), c) },

    rel: {
      t: 'rel', label: 'Relations',
      gen: c => {
        const first = pick(['Famille', 'Ami·e', 'Partenaire']);
        return [first].concat(pickN(D.LIENS.filter(l => l !== first), 2)).map(lien => {
          const o = lien === 'Famille' ? pool(c) : pick(D.ORIGINES);
          const nom = lien === 'Famille' && c.v.nom ? disp(c.v.nom, form(c)) : pick(o.noms);
          return { nom: pick(o.f.concat(o.m)) + ' ' + nom, lien, note: fill(pick(D.NOTES_REL.concat(ipool('relnote'))), c) };
        });
      }
    }
  };
  const LOOK_KEYS = ['av_coupe', 'av_cheveux', 'av_yeux', 'av_peau', 'av_pilo', 'av_lunettes', 'av_taches'];

  // groups : blocs de champs. more : champs facultatifs repliés. bare : le bloc dessine déjà sa propre carte.
  const STEPS = [
    { id: 'identite', short: 'Identité', title: 'Identité', color: '--l1', lede: 'Qui est ce personnage ?', groups: [
      { title: 'Qui est-ce ?', keys: ['prenom', 'nom', 'age', 'genre', 'origine'] },
      { title: 'Au quotidien', keys: ['ville', 'metier'] },
      { more: true, keys: ['surnom', 'situation', 'logement', 'affiliation'] }] },
    { id: 'apparence', short: 'Apparence', title: 'Apparence', color: '--l2', lede: 'Son allure et son image.', groups: [
      { keys: ['photo'], bare: true },
      { title: 'Gabarit', keys: ['taille', 'corpulence'] },
      { keys: ['look'], bare: true },
      { more: true, keys: ['style', 'signes', 'attitude'] }] },
    { id: 'personnalite', short: 'Personnalité', title: 'Personnalité', color: '--l3', lede: 'Son caractère et ce qui le pousse à agir.', groups: [
      { title: 'Caractère', keys: ['traits', 'qualites', 'defauts', 'motivation'] },
      { more: true, keys: ['peurs', 'loisirs', 'manies', 'secret'] }] },
    { id: 'histoire', short: 'Histoire', title: 'Histoire', color: '--l4', lede: 'D\'où il vient et où il en est.', groups: [
      { title: 'Son parcours', keys: ['enfance', 'parcours', 'actuel'] },
      { more: true, keys: ['evenement', 'accroches', 'notes'] }] },
    { id: 'relations', short: 'Relations', title: 'Relations', color: '--l5', lede: 'Les personnes qui comptent pour lui.', groups: [{ keys: ['rel'] }] },
    { id: 'fiche', short: 'Fiche', title: 'Fiche', color: '--l6', lede: 'Relis, copie, partage.', groups: [] }
  ];
  STEPS.forEach(st => { st.fields = st.groups.reduce((acc, g) => acc.concat(g.keys), []); });
  const ORDER = ['genre', 'ville', 'origine', 'prenom', 'nom', 'age', 'metier', 'affiliation', 'situation', 'logement', 'taille', 'corpulence', 'look', 'style', 'signes', 'attitude', 'traits', 'qualites', 'defauts', 'peurs', 'loisirs', 'motivation', 'manies', 'secret', 'enfance', 'parcours', 'evenement', 'actuel', 'accroches', 'rel', 'surnom'];

  /* ---------- modèle et stockage ---------- */
  // background : parties affichées (on), textes par partie (t). Les textes des parties masquées sont gardés.
  const BG = window.LDV_BG;
  const BG_ALL = BG.KEYS.concat(['libre']);
  const BG_TITLE = Object.assign({ libre: 'Texte libre' }, BG.TITLES);
  const BG_LINE = { origines: '--l1', jeunesse: '--l2', parcours: '--l3', tournant: '--l6', aujourdhui: '--l4', secret: '--l5', libre: '--l1' };
  const bgParts = c => c.bg.on.filter(k => (c.bg.t[k] || '').trim()).map(k => [BG_TITLE[k], c.bg.t[k].trim()]);

  function blank() {
    return {
      id: newId(), created: Date.now(), updated: Date.now(), example: false, locks: {}, rel: [], photo: { src: '' }, bg: { on: [], t: {}, seen: false },
      v: { av_coupe: 'court', av_peau: 2, av_cheveux: 2, av_yeux: 1, av_pilo: 'non', av_lunettes: 'non', av_taches: 'non' }
    };
  }
  const str = (x, n) => String(x == null ? '' : x).slice(0, n);
  // reconstruit une fiche à partir de données non fiables (import, lien, stockage)
  function clean(raw) {
    const c = blank();
    const rv = raw && typeof raw.v === 'object' && raw.v ? raw.v : {};
    for (const k of Object.keys(F)) {
      const d = F[k], x = rv[k];
      if (x == null || d.t === 'rel' || d.t === 'look' || d.t === 'photo') continue;
      if (d.t === 'text') c.v[k] = str(x, d.max || 80);
      else if (d.t === 'area') c.v[k] = str(x, 4000);
      else if (d.t === 'number') { const n = Math.round(Number(x)); if (isFinite(n)) c.v[k] = clamp(n, d.min, d.max); }
      else if (d.t === 'chips') { const s = str(x, 120); if (d.custom || optsOf(d).some(o => o.v === s)) c.v[k] = s; }
      else if (d.t === 'multi') { if (Array.isArray(x)) c.v[k] = x.slice(0, d.max).map(s => str(s, 120)).filter(Boolean); }
      else if (d.t === 'swatch') { const n = parseInt(x, 10); if (n >= 0 && n < d.pal.length) c.v[k] = n; }
    }
    if (Array.isArray(raw && raw.rel)) c.rel = raw.rel.slice(0, 20).map(r => ({ nom: str(r && r.nom, 80), lien: str(r && r.lien, 40), note: str(r && r.note, 300) }));
    const ph = raw && raw.photo;
    if (ph && typeof ph === 'object') {
      // seules les images JPEG, PNG ou WebP en data URL sont acceptées
      const src = typeof ph.src === 'string' && ph.src.length < 900000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(ph.src) ? ph.src : '';
      c.photo.src = src;
    }
    if (typeof rv.herit === 'string' && D.ORIGINES.some(o => o.label === rv.herit)) c.v.herit = rv.herit;
    if (c.v.origine && D.legacyOrigin(c.v.origine)) { c.v.herit = c.v.origine; c.v.origine = D.NATIONS[0].v; }
    ensureHerit(c);
    const rb = raw && raw.bg;
    if (rb && typeof rb === 'object') {
      const t = rb.t && typeof rb.t === 'object' ? rb.t : {};
      BG_ALL.forEach(k => { if (typeof t[k] === 'string' && t[k].trim()) c.bg.t[k] = t[k].slice(0, 6000); });
      if (Array.isArray(rb.on)) c.bg.on = BG_ALL.filter(k => rb.on.indexOf(k) >= 0 && c.bg.t[k]);
      c.bg.seen = !!rb.seen || c.bg.on.length > 0;
    }
    if (raw && raw.locks && typeof raw.locks === 'object') for (const k of Object.keys(raw.locks)) if (F[k]) c.locks[k] = true;
    return c;
  }

  let store = { cur: null, order: [], chars: {}, world: 'gta' };
  let storageOK = true;
  // ph : image en cours de cadrage (élément image, taille, zoom, décalage) pour le personnage cid
  const ui = { step: 0, shared: null, armed: null, more: {}, exp: {}, ideas: {}, exIdx: null, bgPrev: {}, bgArm: false, descText: '', desc: null, ph: { img: null, url: '', w: 0, h: 0, zoom: 1, fx: 0, fy: 0, cid: null, status: 'idle', msg: '' } };
  const C = () => store.chars[store.cur];

  function loadStore() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s && s.world === 'usa') store.world = 'usa';
      if (!s || !s.chars || !Array.isArray(s.order)) return;
      s.order.forEach(id => {
        const x = s.chars[id];
        if (!x) return;
        const c = clean(x);
        c.id = id; c.created = x.created || 0; c.updated = x.updated || 0; c.example = !!x.example;
        store.chars[id] = c; store.order.push(id);
      });
      store.cur = store.chars[s.cur] ? s.cur : store.order[0] || null;
    } catch (e) { storageOK = false; }
  }
  let saveTimer = 0;
  function scheduleSave() { clearTimeout(saveTimer); setStatus('saving'); saveTimer = setTimeout(saveNow, 350); }
  function saveNow() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); setStatus('saved'); }
    catch (e) { storageOK = false; setStatus('nostore'); }
  }
  function setStatus(s) {
    const el = $('#status');
    if (!el) return;
    el.textContent = s === 'saving' ? 'Enregistrement…' : s === 'nostore' ? 'Stockage du navigateur indisponible : exporte ta fiche pour la garder.' : '✓ Enregistré';
    el.dataset.state = s;
  }
  function addChar(c) { store.chars[c.id] = c; store.order.unshift(c.id); store.cur = c.id; ui.step = 0; }

  function setVal(c, key, val) {
    if (key === 'rel') c.rel = val;
    else if (key === 'look') Object.assign(c.v, val);
    else { c.v[key] = val; if (key === 'origine') ensureHerit(c); }
  }
  function genKeys(c, keys) {
    ORDER.filter(k => keys.indexOf(k) >= 0 && !c.locks[k] && F[k].gen && (!F[k].world || F[k].world === W())).forEach(k => setVal(c, k, F[k].gen(c, true)));
  }

  /* ---------- fiche : contenu et exports ---------- */
  function allure(c) {
    const v = c.v, cut = A.COUPES.find(o => o.v === v.av_coupe) || A.COUPES[0], parts = [];
    if (v.taille) parts.push(v.taille + ' cm (' + imp(v.taille) + ')');
    if (v.corpulence) parts.push('corpulence ' + lc(v.corpulence));
    parts.push(cut.v === 'chauve' ? 'chauve' : 'cheveux ' + at(A.CHEVEUX, v.av_cheveux).n.toLowerCase() + ' ' + cut.p);
    parts.push('yeux ' + at(A.YEUX, v.av_yeux).n.toLowerCase());
    const pilo = A.PILOSITE.find(o => o.v === v.av_pilo);
    if (pilo && pilo.v !== 'non') parts.push(pilo.l.toLowerCase());
    const lun = A.LUNETTES.find(o => o.v === v.av_lunettes);
    if (lun && lun.v !== 'non') parts.push('lunettes ' + lun.l.toLowerCase());
    return cap(parts.join(', '));
  }
  function sheet(c) {
    const v = c.v, f = form(c), d = k => disp(v[k], f), L = k => (v[k] || []).map(x => disp(x, f)).join(', ');
    const groups = [];
    const add = (title, rows) => { rows = rows.filter(r => r[1]); if (rows.length) groups.push({ title, rows }); };
    add('Identité', [
      ['Âge', v.age ? v.age + ' ans' : ''], ['Genre', v.genre],
      ['Ville', v.ville], ['Métier', d('metier')], ['Affiliation', v.affiliation], ['Origines', d('origine')], ['Situation', d('situation')], ['Logement', v.logement]
    ]);
    add('Apparence', [['Allure', allure(c)], ['Style', L('style')], ['Signes distinctifs', v.signes], ['Voix et attitude', v.attitude]]);
    add('Personnalité', [['Traits', L('traits')], ['Qualités', L('qualites')], ['Défauts', L('defauts')], ['Peurs', L('peurs')], ['Loisirs', L('loisirs')], ['Motivation', v.motivation], ['Manies', v.manies], ['Secret', v.secret]]);
    add('Histoire', [['Enfance', v.enfance], ['Parcours', v.parcours], ['Événement marquant', d('evenement')], ['Aujourd\'hui', v.actuel], ['Accroches de RP', v.accroches], ['Notes', v.notes]]);
    add('Relations', c.rel.filter(r => r.nom || r.note).map(r => [(r.nom || '?') + (r.lien ? ' (' + r.lien + ')' : ''), r.note || '–']));
    add('Background', bgParts(c));
    return {
      first: d('prenom'), last: d('nom'), nick: v.surnom || '',
      name: [d('prenom'), v.surnom ? '« ' + v.surnom + ' »' : '', d('nom')].filter(Boolean).join(' '),
      sub: [d('metier'), v.age ? v.age + ' ans' : '', v.ville].filter(Boolean).join(' · '),
      groups
    };
  }
  function toText(c, md) {
    const s = sheet(c), out = [];
    const title = s.name || 'Personnage sans nom';
    out.push(md ? '**' + title + '**' : title.toUpperCase());
    if (s.sub) out.push(md ? '*' + s.sub + '*' : s.sub);
    s.groups.forEach(g => {
      out.push('', md ? '**' + g.title + '**' : '— ' + g.title.toUpperCase() + ' —');
      g.rows.forEach(r => {
        const long = r[1].indexOf('\n') >= 0 || r[1].length > 110;
        const lab = md ? '**' + r[0] + '**' : r[0];
        out.push(long ? lab + (md ? '' : ' :') + '\n' + r[1] : lab + ' : ' + r[1]);
      });
    });
    return out.join('\n');
  }
  function mrz(c) {
    const v = c.v, f = form(c);
    const cl = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '<');
    const l1 = ('P<FIC' + cl(disp(v.nom, f)) + '<<' + cl(disp(v.prenom, f))).padEnd(36, '<').slice(0, 36);
    const idn = (c.id + '000000000').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
    const l2 = (idn + '<FIC' + String(v.age || 0).padStart(3, '0').slice(-3) + { f: 'F', m: 'M', x: 'X' }[f] + '<').padEnd(36, '<').slice(0, 36);
    return l1 + '\n' + l2;
  }
  const LINE_COLORS = ['--l1', '--l2', '--l3', '--l4', '--l5', '--l6'];
  function cardHTML(c, full) {
    const s = sheet(c), v = c.v, f = form(c);
    const dd = (k, val, wide) => `<div${wide ? ' class="wide"' : ''}><dt>${k}</dt><dd>${val ? esc(val) : '<span class="ph">–</span>'}</dd></div>`;
    const sec = (title, inner) => `<section class="idc-sec"><h4>${title}</h4>${inner}</section>`;
    const chips = arr => (arr.length ? `<ul class="idc-chips">${arr.map(x => `<li>${esc(disp(x, f))}</li>`).join('')}</ul>` : '<p class="ph">À compléter</p>');
    let body = '';
    if (full) {
      s.groups.forEach(g => {
        const rows = g.title === 'Identité' ? g.rows.filter(r => ['Âge', 'Genre', 'Ville', 'Métier'].indexOf(r[0]) < 0) : g.rows;
        if (rows.length) body += sec(g.title, `<dl class="idc-rows">${rows.map(r => `<div><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`).join('')}</dl>`);
      });
    } else {
      body += sec('Traits', chips(v.traits || []));
    }
    return `<article class="idcard${full ? ' full' : ''}">
<div class="idc-stripe" aria-hidden="true">${LINE_COLORS.map(k => `<i style="background:var(${k})"></i>`).join('')}</div>
<header class="idc-head"><span>Carte de personnage</span><span>Fictif · RP</span></header>
<div class="idc-id">
<figure class="idc-photo">${portrait(c)}</figure>
<div class="idc-who">
<h3 class="idc-name"><span class="idc-first">${esc(s.first) || '<span class="ph">Prénom</span>'}</span>${s.nick ? ` <span class="idc-nick">« ${esc(s.nick)} »</span>` : ''}<span class="idc-last">${esc(s.last.toUpperCase()) || '<span class="ph">NOM</span>'}</span></h3>
<dl class="idc-dl">${dd('Âge', v.age ? v.age + ' ans' : '')}${dd('Genre', v.genre)}${dd('Ville', v.ville)}${dd('Métier', disp(v.metier, f))}</dl>
</div></div>
${body}
${full ? '' : '<div class="idc-more"><button type="button" class="link" data-act="goto" data-i="5">Voir la fiche complète</button></div>'}
${full ? `<footer class="idc-mrz" aria-hidden="true">${esc(mrz(c)).replace('\n', '<br>')}</footer>` : ''}
</article>`;
  }

  /* ---------- rendu des champs ---------- */
  const toolsHTML = (key, label, locked) => {
    let h = '';
    if (hasIdeas(key)) h += `<button type="button" class="tool" data-act="ideas" data-key="${key}" aria-expanded="${!!ui.ideas[key]}" aria-label="Idées originales : ${esc(label)}" title="Idées originales">${ICON.bulb}</button>`;
    if (F[key].gen) {
      h += `<button type="button" class="tool" data-act="roll" data-key="${key}" aria-label="Tirer au sort : ${esc(label)}" title="Tirer au sort"${locked ? ' disabled' : ''}>${ICON.die}</button>` +
        `<button type="button" class="tool" data-act="lock" data-key="${key}" aria-pressed="${!!locked}" aria-label="Verrouiller : ${esc(label)}" title="${locked ? 'Déverrouiller' : 'Verrouiller'}">${locked ? ICON.lock : ICON.unlock}</button>`;
    }
    return `<span class="tools">${h}</span>`;
  };
  const chipBtn = (key, val, label, on) => `<button type="button" class="chip" data-act="chip" data-key="${key}" data-v="${esc(val)}" aria-pressed="${on}">${esc(label)}</button>`;

  /* ---------- image choisie par la personne ---------- */
  const phEditing = c => !!(ui.ph.img && ui.ph.cid === c.id);

  function phViewHTML(c) {
    if (phEditing(c)) return `<img class="ph-edit-img" id="phImg" src="${esc(ui.ph.url)}" alt="Image à cadrer" draggable="false">`;
    if (c.photo.src) return `<img class="photo-img" src="${c.photo.src}" alt="Image du personnage">`;
    return `<button type="button" class="ph-empty" data-act="phPick">${ICON.up}<span>Dépose une image ici<br>ou clique pour choisir un fichier</span></button>`;
  }
  function photoHTML(c) {
    const has = !!c.photo.src, ed = phEditing(c);
    const ctl = ed
      ? `<div class="field"><div class="field-head"><label class="lbl" for="phZoom">Zoom</label></div><input type="range" id="phZoom" min="1" max="3" step="0.01" value="${ui.ph.zoom}"></div>
<p class="hint">Glisse l'image pour la placer, zoome avec le curseur.</p>
<div class="btnrow"><button type="button" class="btn primary" data-act="phUse">Utiliser cette image</button><button type="button" class="btn" data-act="phCancel">Annuler</button></div>`
      : `${has ? '' : '<p class="hint">Une photo, une image faite avec une IA ou un dessin. Sans image, la fiche affiche une silhouette.</p>'}
<div class="btnrow"><button type="button" class="btn primary" data-act="phPick">${ICON.up} ${has ? 'Changer l\'image' : 'Choisir une image'}</button>${has ? `<button type="button" class="btn" data-act="phClear">${ICON.trash} Retirer l'image</button>` : ''}</div>`;
    return `<div class="field full group photo-block" data-field="photo"><div class="field-head"><span class="lbl group-title" id="l-photo">Image du personnage</span></div>
<div class="photo-grid"><div class="photo-view${ed ? ' editing' : ''}" id="phView" data-drop${ed ? ' tabindex="0" aria-label="Cadre du portrait : fais glisser l\'image"' : ''}>${phViewHTML(c)}</div>
<div class="photo-ctl">${ctl}<p class="ph-msg" id="phMsg" role="status" aria-live="polite" data-state="${ui.ph.status}">${esc(ui.ph.msg)}</p>
<input type="file" id="phFile" accept="image/jpeg,image/png,image/webp,image/gif" hidden></div></div></div>`;
  }
  // place l'image dans le cadre selon le zoom et le décalage choisis
  function phLayout() {
    const f = $('#phView'), im = $('#phImg');
    if (!f || !im || !ui.ph.img) return;
    const r = f.getBoundingClientRect();
    if (!r.width) return;
    const p = P.place(ui.ph.w, ui.ph.h, r.width, r.height, ui.ph.zoom, ui.ph.fx, ui.ph.fy);
    ui.ph.fx = p.fx; ui.ph.fy = p.fy;
    im.style.width = p.w + 'px'; im.style.height = p.h + 'px'; im.style.left = p.left + 'px'; im.style.top = p.top + 'px';
  }
  function phStop() {
    if (ui.ph.url) URL.revokeObjectURL(ui.ph.url);
    Object.assign(ui.ph, { img: null, url: '', cid: null });
  }
  function phOpen(file) {
    const c = C();
    P.load(file).then(r => {
      phStop();
      Object.assign(ui.ph, { img: r.img, url: r.url, w: r.w, h: r.h, zoom: 1, fx: 0, fy: 0, cid: c.id, status: 'idle', msg: '' });
      refreshField('photo');
    }).catch(err => {
      Object.assign(ui.ph, { status: 'error', msg: err && err.message ? err.message : 'Cette image ne peut pas être lue.' });
      refreshField('photo');
    });
  }

  function updateTailleHint() { const u = $('#u-taille'), t = C().v.taille; if (u) u.textContent = t ? 'cm · ' + imp(t) : 'cm'; }

  const CHIP_LIMIT = 12;
  function fieldHTML(key, c) {
    const d = F[key], f = form(c), v = c.v[key], locked = !!c.locks[key];
    if (d.t === 'photo') return photoHTML(c);
    if (d.t === 'look') {
      return `<div class="field full group look-block" data-field="look"><div class="field-head"><span class="lbl group-title" id="l-look">Traits physiques</span>${toolsHTML('look', 'Traits physiques', locked)}</div>
<div class="look-grid">${LOOK_KEYS.map(k => fieldHTML(k, c)).join('')}</div></div>`;
    }
    const count = d.t === 'multi' ? ` <small>${(v || []).length}/${d.max}</small>` : '';
    const textual = d.t === 'text' || d.t === 'number' || d.t === 'area';
    const label = textual ? `<label class="lbl" id="l-${key}" for="f-${key}">${esc(d.label)}</label>` : `<span class="lbl" id="l-${key}">${esc(d.label)}${count}</span>`;
    let ctl = '';
    if (d.t === 'text') {
      ctl = `<input class="in" id="f-${key}" data-key="${key}" type="text" value="${esc(disp(v, f))}" placeholder="${esc((typeof d.ph === 'function' ? d.ph() : d.ph) || '')}" maxlength="${d.max || 80}" autocomplete="off"${d.list ? ` list="dl-${d.list}"` : ''}>`;
    } else if (d.t === 'number') {
      ctl = `<div class="num${key === 'taille' ? ' long' : ''}"><input class="in" id="f-${key}" data-key="${key}" type="number" inputmode="numeric" min="${d.min}" max="${d.max}" value="${v == null ? '' : esc(v)}"><span class="unit"${key === 'taille' ? ' id="u-taille"' : ''}>${key === 'taille' && v ? d.unit + ' · ' + imp(v) : d.unit}</span></div>`;
    } else if (d.t === 'area') {
      ctl = `<textarea class="in" id="f-${key}" data-key="${key}" rows="${d.rows || 3}" placeholder="${esc(d.ph || '')}" maxlength="4000">${esc(v || '')}</textarea>`;
    } else if (d.t === 'chips' || d.t === 'multi') {
      const opts = optsOf(d), multi = d.t === 'multi', sel = multi ? (v || []) : (v ? [v] : []);
      const open = !!ui.exp[key], shown = open || opts.length <= CHIP_LIMIT ? opts : opts.filter((o, i) => i < CHIP_LIMIT || sel.indexOf(o.v) >= 0);
      let chips = shown.map(o => chipBtn(key, o.v, o.l != null ? o.l : disp(o.v, f), sel.indexOf(o.v) >= 0)).join('');
      chips += sel.filter(x => !opts.some(o => o.v === x)).map(x => chipBtn(key, x, disp(x, f), true)).join('');
      if (opts.length > CHIP_LIMIT && (open || shown.length < opts.length)) chips += `<button type="button" class="chip more-chip" data-act="expand" data-key="${key}">${open ? 'Réduire' : '+ ' + (opts.length - shown.length) + ' autres'}</button>`;
      if (d.custom) chips += `<input class="chip-in" type="text" data-custom="1" data-key="${key}" placeholder="+ Autre" maxlength="40" aria-label="Ajouter une valeur : ${esc(d.label)}">`;
      ctl = `<div class="chips" role="group" aria-labelledby="l-${key}">${chips}</div>`;
    } else if (d.t === 'swatch') {
      ctl = `<div class="swatches" role="group" aria-labelledby="l-${key}">${d.pal.map((p, i) => `<button type="button" class="sw" style="--c:${p.h}" data-act="sw" data-key="${key}" data-v="${i}" aria-pressed="${String(v) === String(i)}" aria-label="${esc(p.n)}" title="${esc(p.n)}"></button>`).join('')}</div>`;
    } else if (d.t === 'rel') {
      const liens = D.LIENS;
      ctl = c.rel.length ? `<div class="rels">${c.rel.map((r, i) => {
        const known = liens.indexOf(r.lien) >= 0;
        return `<div class="rel"><input class="in" data-rel="nom" data-i="${i}" type="text" value="${esc(r.nom)}" placeholder="Nom" maxlength="80" aria-label="Nom de la relation ${i + 1}">` +
          `<select class="in" data-rel="lien" data-i="${i}" aria-label="Lien avec ${esc(r.nom || 'cette personne')}"><option value=""${r.lien ? '' : ' selected'}>Lien…</option>${liens.map(l => `<option${l === r.lien ? ' selected' : ''}>${esc(l)}</option>`).join('')}${r.lien && !known ? `<option selected>${esc(r.lien)}</option>` : ''}</select>` +
          `<input class="in" data-rel="note" data-i="${i}" type="text" value="${esc(r.note)}" placeholder="Qui est cette personne pour lui ou elle ?" maxlength="300" aria-label="Description de la relation ${i + 1}">` +
          `<button type="button" class="tool danger" data-act="relDel" data-i="${i}" aria-label="Supprimer la relation ${i + 1}" title="Supprimer">${ICON.trash}</button>` +
          `<button type="button" class="tool rel-roll" data-act="relRoll" data-i="${i}" aria-label="Une autre description pour la relation ${i + 1}" title="Une autre description">${ICON.die}</button></div>`;
      }).join('')}</div>` : '<p class="empty">Aucune relation pour l\'instant. Ajoutes-en une, ou tire-en trois au sort avec le dé.</p>';
      ctl += `<div class="rel-actions"><button type="button" class="btn" data-act="relAdd">${ICON.plus} Ajouter une relation</button></div>`;
    }
    const tools = d.gen || hasIdeas(key) ? toolsHTML(key, d.label, locked) : '';
    const wide = d.t === 'rel' || d.t === 'chips' && d.w !== 'half' || d.t === 'multi' || d.t === 'swatch' || d.t === 'area' || !!ui.ideas[key];
    return `<div class="field${wide ? ' full' : ''}" data-field="${key}"><div class="field-head">${label}${tools}</div>${ctl}${ideasHTML(key, c)}</div>`;
  }

  /* ---------- assistance de Claude (demande à copier) ---------- */
  const TASKS = {
    passe: 'Écris le passé de ce personnage en deux ou trois paragraphes, cohérent avec la fiche. Sois concret (lieux, personnes, dates approximatives) et évite les clichés.',
    relations: 'Propose quatre relations importantes pour ce personnage (nom, lien, une ou deux phrases sur leur dynamique), cohérentes avec la fiche.',
    accroches: 'Propose cinq accroches de RP : des situations dans lesquelles un autre joueur pourrait aborder ce personnage ou être entraîné dans son histoire.',
    psycho: 'Approfondis la personnalité : trois contradictions intéressantes, trois habitudes concrètes et deux réactions typiques quand il ou elle est sous pression.',
    relecture: 'Relis la fiche, signale les incohérences éventuelles et propose des corrections ou des pistes pour la rendre plus vivante.'
  };
  function claudeHTML() {
    return `<details class="claude" id="claudeBox"><summary>${ICON.spark}<span>Besoin d'inspiration ? Demande à Claude</span></summary>
<div class="claude-body">
<p>Le site ne se connecte pas à Claude tout seul. Il prépare une demande à partir de ta fiche : tu la copies, tu la colles dans Claude, puis tu rapportes la réponse ici.</p>
<div class="field"><div class="field-head"><label class="lbl" for="ctask">Que veux-tu demander ?</label></div>
<select class="in" id="ctask"><option value="passe">Écrire le passé du personnage</option><option value="relations">Proposer des relations</option><option value="accroches">Trouver des accroches de RP</option><option value="psycho">Approfondir la personnalité</option><option value="relecture">Relire et corriger la fiche</option></select></div>
<div class="btnrow"><button type="button" class="btn primary" data-act="copyPrompt">${ICON.copy} Copier la demande</button><a class="btn" href="https://claude.ai/new" target="_blank" rel="noopener">Ouvrir Claude</a></div>
<div class="field"><div class="field-head"><label class="lbl" for="creply">Réponse de Claude</label></div><textarea class="in" id="creply" rows="5" placeholder="Colle ici ce que Claude a répondu, puis choisis où l'insérer."></textarea></div>
<div class="btnrow"><label class="lbl inline" for="ctarget">Insérer dans</label><select class="in short" id="ctarget"><option value="enfance">Origines et enfance</option><option value="parcours">Études et parcours</option><option value="actuel">Aujourd'hui</option><option value="accroches">Accroches de RP</option><option value="notes">Notes libres</option></select><button type="button" class="btn" data-act="insertReply">Insérer</button></div>
</div></details>`;
  }
  const worldLine = () => (W() === 'gta'
    ? 'contemporain et réaliste, sans surnaturel, qui se déroule dans l\'univers de GTA (San Andreas : Los Santos, Blaine County, ou bien Vice City ou Liberty City). Les lieux, les services (LSPD, BCSO, EMS, LSFD) et les gangs doivent rester cohérents avec cet univers.'
    : 'contemporain et réaliste, sans surnaturel, qui se déroule aux États-Unis.');
  function buildPrompt(c, task) {
    return 'Je crée un personnage pour un jeu de rôle (RP) ' + worldLine() + ' Voici sa fiche actuelle :\n\n' + toText(c, false) +
      '\n\nDemande : ' + TASKS[task] + '\n\nRéponds en français, avec un ton naturel et sans titres superflus, de façon à ce que je puisse copier ton texte tel quel dans ma fiche.';
  }

  /* ---------- rendu général ---------- */
  function ficheHTML(c) {
    const local = location.protocol === 'file:';
    return `<div class="fiche"><div class="fiche-card">${cardHTML(c, true)}</div>
<div class="fiche-side">
<div class="box"><h3>Copier la fiche</h3>
<div class="btnrow"><button type="button" class="btn primary" data-act="copyMd">${ICON.copy} Pour Discord</button><button type="button" class="btn" data-act="copyTxt">${ICON.copy} Texte brut</button></div></div>
<div class="box"><h3>Garder et partager</h3>
<div class="btnrow"><button type="button" class="btn" data-act="copyLink">${ICON.link} Lien de partage</button><button type="button" class="btn" data-act="dlJson">${ICON.down} Fichier .json</button>${c.photo.src ? `<button type="button" class="btn" data-act="dlPortrait">${ICON.down} Image (.jpg)</button>` : ''}</div>
<p class="hint">Le lien contient toute la fiche, sans serveur.${local ? ' Il ne marchera qu\'une fois le site publié.' : ''}</p></div>
<div class="box"><h3>Background</h3><p class="hint">Rédige l'histoire de ce personnage à partir de sa fiche.</p><div class="btnrow"><a class="btn" href="#background">${ICON.card} Rédiger son background</a></div></div>
<div class="box"><h3>Ajouter un personnage</h3><div class="btnrow"><button type="button" class="btn" data-act="openImport">${ICON.up} Importer une fiche</button><button type="button" class="btn" data-act="newBlank">${ICON.plus} Fiche vierge</button></div></div>
</div></div>`;
  }
  /* ---------- décrire le personnage en une phrase ---------- */
  const EXAMPLES = {
    gta: [
      ['Policier à Mission Row', 'Un policier du LSPD de 38 ans à Mission Row, sérieux et têtu, divorcé, avec une cicatrice au sourcil. Il veut devenir sergent'],
      ['Mécano à Sandy Shores', 'Un mécanicien de 45 ans à Sandy Shores, barbu, taciturne, qui vit dans un mobile home. Il rêve de quitter le Blaine County'],
      ['Pêcheuse à Paleto Bay', 'Une pêcheuse de 29 ans à Paleto Bay, rousse, franche et débrouillarde, qui a peur de l\'eau profonde'],
      ['Families à Davis', 'Un homme de 24 ans de Davis, membre des Families, charmeur et impulsif, avec un tatouage sur le cou'],
      ['Étudiante à Vice City', 'Étudiante en droit de 22 ans à Vice City, latino, ambitieuse, lunettes rondes, vit en colocation'],
      ['Journaliste à Liberty City', 'Une journaliste de 33 ans à Liberty City, curieuse et sarcastique, brune. Son meilleur ami Marcus est policier'],
      ['Ambulancière à Vespucci', 'Une ambulancière de l\'EMS de 31 ans à Vespucci, calme et courageuse, célibataire, adore la plage'],
      ['Motard du Lost MC', 'Un motard du Lost MC de 41 ans à Sandy Shores, barbu, costaud, loyal mais colérique, cache une dette'],
      ['Avocate à Rockford Hills', 'Une avocate de 36 ans à Rockford Hills, élégante, perfectionniste, divorcée. Elle rêve de devenir juge'],
      ['Éleveur à Grapeseed', 'Un éleveur de 52 ans à Grapeseed, moustachu, têtu, veuf, avec un chapeau de cowboy'],
      ['Pompier à Mirror Park', 'Un pompier du LSFD de 29 ans à Mirror Park, athlétique, drôle et loyal, vit en colocation'],
      ['Actrice à Vinewood', 'Une actrice en devenir de 26 ans à Vinewood, blonde, charmeuse, sociable, serveuse le soir']
    ],
    usa: [
      ['Infirmière à Chicago', 'Une infirmière de 34 ans à Chicago, rousse aux yeux verts, sarcastique, avec une cicatrice sur la main'],
      ['Ancien militaire au Texas', 'Un ancien militaire de 45 ans, barbu, taciturne, mécanicien au Texas. Il veut ouvrir son propre garage'],
      ['Étudiante à Los Angeles', 'Étudiante en droit de 22 ans, latino, ambitieuse, lunettes rondes, vit en colocation à Los Angeles'],
      ['Pompier à Atlanta', 'Un pompier de 35 ans à Atlanta, noir, costaud, loyal et drôle, marié, vit dans une maison de banlieue'],
      ['Barman à Nashville', 'Un barman de 28 ans à Nashville, blond, charmeur, fêtard. Il rêve de devenir chanteur'],
      ['Retraitée à Phoenix', 'Une retraitée de 68 ans à Phoenix, cheveux blancs, attentionnée, veuve, adore le jardinage']
    ]
  };
  const exPool = () => EXAMPLES[W()].concat((D.IDEES && D.IDEES['ex_' + W()]) || []);
  function exShown() {
    const n = exPool().length;
    if (!ui.exIdx || ui.exIdx.some(i => i >= n)) ui.exIdx = pickN(Array.from({ length: n }, (_, i) => i), Math.min(4, n));
    return ui.exIdx;
  }
  // une description complète et originale, tirée au hasard dans les pièces de ideas.js
  function randomDescription() {
    const gta = W() === 'gta', f = Math.random() < 0.5 ? 'f' : 'm', DD = D.IDEES.desc;
    const age = wpick([[rint(19, 25), 3], [rint(26, 40), 5], [rint(41, 58), 3], [rint(59, 74), 1]]);
    const ville = pick(D.VILLES), where = D.cityName(ville);
    let jobs = gta && Math.random() < 0.65 ? D.metiersGta(ville) : D.METIERS;
    if (age < 23) jobs = jobs.filter(j => !D.JOBS_ADULT.test(j));
    if (age < 26 && Math.random() < 0.5) jobs = gta ? D.etudiantsGta(ville) : D.METIERS_ETUDIANTS;
    if (age >= 64 && Math.random() < 0.5) jobs = ['Retraité|Retraitée'];
    const rawJob = pick(jobs.length ? jobs : D.METIERS);
    const job = lc(disp(rawJob, f)).replace(/\s+(?:à|chez|pour|dans|au)\s.+$/, '');
    const traits = pickN(D.TRAITS, 2).map(t => lc(disp(t, f)));
    const look = pick((f === 'f' ? DD.look_f : DD.look_m).concat(DD.look_any));
    const status = Math.random() < 0.3 ? ', ' + lc(disp(pick(['Célibataire', 'Divorcé|Divorcée', 'Veuf|Veuve', 'Marié|Mariée']), f)) : '';
    const gang = gta && age <= 45 && D.GANG_JOBS.test(rawJob) && Math.random() < 0.25 ? ', membre ' + pick(['des Ballas', 'des Families', 'des Vagos', 'de la Marabunta Grande', 'du Lost MC']) : '';
    const kind = rint(0, 2);
    let twist;
    if (kind === 0) twist = pick(DD.reves);
    else if (kind === 1) twist = pick(DD.secrets);
    else {
      const r = pick(DD.roles), nom = pick(r[1] === 'f' ? DD.noms_f : DD.noms_m);
      twist = (r[1] === 'f' ? 'Sa ' : 'Son ') + r[0] + ' ' + nom + ' ' + pick(DD.role_verbes) + '.';
    }
    twist = fill(twist, { v: { genre: f === 'f' ? 'Femme' : 'Homme' } });
    return (f === 'f' ? 'Une ' : 'Un ') + job + ' de ' + age + ' ans à ' + where + ', ' + look + ', ' + traits[0] + ' et ' + traits[1] + status + gang + '. ' + twist;
  }
  const isUntouched = c => ORDER.every(k => !hasValue(c, k)) && !c.photo.src;
  function descHTML(c) {
    const res = ui.desc && ui.desc.cid === c.id ? ui.desc : null;
    const open = ui.more.describe === undefined ? (c.example || isUntouched(c) || !!res) : ui.more.describe;
    const n = res ? res.found.length : 0;
    const result = !res ? '' : n
      ? `<div class="desc-result"><p><b>${n} élément${n > 1 ? 's' : ''} compris.</b> Le reste est complété au hasard, et ta phrase est gardée dans « Notes libres ».</p><ul class="idc-chips">${res.found.map(x => `<li>${esc(x)}</li>`).join('')}</ul>${res.unclear.indexOf('metier') >= 0 ? '<p class="hint"><b>Métier non compris :</b> ta phrase parle de travail, mais je n\'ai pas su le classer. Écris-le dans « Métier ».</p>' : ''}${res.random.length ? `<p class="hint">Tiré au hasard : ${esc(res.random.join(', '))}. Précise-le dans ta phrase pour le fixer.</p>` : ''}</div>`
      : '<div class="desc-result"><p><b>Rien de reconnu.</b> Ajoute l\'âge, le métier, la ville, l\'apparence ou le caractère.</p></div>';
    return `<details class="group describe" data-more="describe"${open ? ' open' : ''}><summary>${ICON.spark}<span>Décrire le personnage que tu imagines</span></summary>
<div class="describe-body"><textarea class="in" id="descText" rows="3" maxlength="800" placeholder="Ex. : une infirmière de 34 ans à Chicago, rousse, sarcastique, avec une cicatrice sur la main">${esc(ui.descText)}</textarea>
<div class="btnrow"><button type="button" class="btn primary" data-act="descApply">${ICON.spark} Créer le personnage</button><span class="hint">ou essaie :</span>${exShown().map(i => `<button type="button" class="chip" data-act="descEx" data-i="${i}">${esc(exPool()[i][0])}</button>`).join('')}<button type="button" class="chip" data-act="descRandom">${ICON.die} Idée au hasard</button><button type="button" class="chip more-chip" data-act="descMore">Autres idées</button></div>${result}</div></details>`;
  }
  function describeApply() {
    const text = ui.descText.trim();
    if (!text) { toast('Écris d\'abord une description.'); const t = $('#descText'); if (t) t.focus(); return; }
    let r;
    try { r = DS.parse(text, D); } catch (e) { r = { v: {}, rel: [], found: [] }; }
    const cur = C(), reuse = cur.example || isUntouched(cur), n = blank();
    Object.assign(n.v, r.v);
    if (W() !== 'gta') delete n.v.affiliation;
    const found = W() === 'gta' ? r.found : r.found.filter(x => !/^Affiliation/.test(x));
    n.rel = r.rel.slice();
    // un âge cohérent avec le métier annoncé quand la phrase n'en donne pas
    if (!n.v.age && n.v.metier) {
      if (/^(?:Étudiant|Alternant)/.test(n.v.metier)) n.v.age = rint(18, 24);
      else if (/^Retrait/.test(n.v.metier)) n.v.age = rint(63, 82);
    }
    // origines non précisées : on les déduit de l'apparence décrite plutôt que de tirer une origine incohérente
    if (!n.v.origine) {
      const hair = n.v.av_cheveux, eyes = n.v.av_yeux, skin = n.v.av_peau;
      const fam = skin >= 6 ? 'Afro-américaines' : hair === 6 ? (Math.random() < 0.4 ? 'Irlandaises' : 'Européennes') : (hair === 4 || hair === 5 || eyes === 3 || eyes === 4 || skin === 0) ? 'Européennes' : null;
      if (fam) { n.v.origine = D.NATIONS[0].v; n.v.herit = fam; }
    }
    ensureHerit(n);
    // la phrase parle de travail sans qu'on ait su le classer : le métier reste vide plutôt qu'un métier inventé qui la contredit
    const unclear = (r.unclear || []).slice();
    if (unclear.indexOf('metier') >= 0 && !n.v.metier) { n.v.metier = ''; n.locks.metier = true; }
    // les champs compris sont verrouillés le temps de tirer le reste au sort, pour ne jamais les contredire
    Object.keys(r.v).forEach(k => { if (F[k] && F[k].gen && k.indexOf('av_') !== 0) n.locks[k] = true; });
    if (n.rel.length) n.locks.rel = true;
    genKeys(n, ORDER);
    // une description sans gang ne fait entrer personne dans un gang : seule l'affiliation du métier (police, secours) est reprise
    if (W() === 'gta' && !r.v.affiliation) {
      const hit = n.v.metier && !/^(?:Étudiant|Alternant|Retrait)/.test(disp(n.v.metier, 'm')) && D.AFFIL_DE_METIER.find(x => x[0].test(disp(n.v.metier, 'm')));
      n.v.affiliation = hit ? hit[1] : '';
    }
    Object.keys(r.v).forEach(k => { if (k.indexOf('av_') === 0) n.v[k] = r.v[k]; });
    n.v.notes = ('Description de départ : ' + text).slice(0, 1500);
    // dernière vérification : longueurs et types de chaque champ, comme pour un import
    const fin = clean({ v: n.v, rel: n.rel });
    fin.example = false; fin.updated = Date.now();
    if (reuse) { fin.id = cur.id; fin.created = cur.created; store.chars[cur.id] = fin; ui.step = 0; } else addChar(fin);
    // ce qui n'était pas dans la phrase et a été tiré au sort
    const RND = { genre: 'genre', origine: 'origines', age: 'âge', ville: 'ville', metier: 'métier', affiliation: 'affiliation', situation: 'situation amoureuse', logement: 'logement' };
    const random = Object.keys(RND).filter(k => !(k in r.v) && hasValue(fin, k) && (!F[k].world || F[k].world === W())).map(k => RND[k]);
    ui.desc = { cid: fin.id, found: found.slice(), random, unclear };
    renderAll(); scheduleSave();
    if (ui.view === 'creator') $('#line').scrollIntoView({ block: 'start' }); else toCreator();
    toast(found.length ? 'Personnage créé à partir de ta description.' : 'Personnage tiré au sort : rien n\'a été reconnu.');
  }

  const hasValue = (c, k) => {
    const d = F[k];
    if (d.t === 'rel') return c.rel.length > 0;
    if (d.t === 'photo') return !!c.photo.src;
    const v = c.v[k];
    return Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && v !== '';
  };
  function groupHTML(g, c, s) {
    const keys = g.keys.filter(k => !F[k].world || F[k].world === W());
    const inner = keys.map(k => fieldHTML(k, c)).join('');
    if (g.more) {
      const n = keys.filter(k => hasValue(c, k)).length;
      return `<details class="more" data-more="${s.id}"${ui.more[s.id] ? ' open' : ''}><summary><span>Plus de détails</span><small>${n ? n + ' sur ' + keys.length + ' remplis' : 'facultatif'}</small></summary><div class="fields">${inner}</div></details>`;
    }
    if (g.bare) return inner;
    return `<section class="group">${g.title ? `<h3 class="group-title">${g.title}</h3>` : ''}<div class="fields">${inner}</div></section>`;
  }
  function panelHTML() {
    const i = ui.step, s = STEPS[i], c = C(), last = STEPS.length - 1;
    const head = `<header class="step-head"><div class="step-title"><h2 tabindex="-1">${s.title}</h2>${s.fields.length ? `<button type="button" class="btn ghost small" data-act="genStep" title="Remplir cette étape au hasard">${ICON.die} Au hasard</button>` : ''}</div><p class="lede">${s.lede}</p></header>`;
    let body;
    if (s.id === 'fiche') body = ficheHTML(c);
    else {
      body = (s.id === 'identite' ? descHTML(c) : '') + `<div class="groups">${s.groups.map(g => groupHTML(g, c, s)).join('')}</div>`;
      if (s.id === 'identite') body += `<datalist id="dl-villes">${D.VILLES.map(x => `<option value="${esc(x)}">`).join('')}</datalist><datalist id="dl-metiers">${metierList().map(x => `<option value="${esc(disp(x, form(c)))}">`).join('')}</datalist>`;
      if (s.id === 'histoire') body += `<div class="group bg-link"><div><h3 class="group-title">Besoin d'un récit complet ?</h3><p class="hint">Le générateur de Background rédige l'histoire du personnage à partir de cette fiche.</p></div><a class="btn primary" href="#background">Ouvrir Background</a></div>` + claudeHTML();
    }
    const foot = `<footer class="step-foot">${i > 0 ? `<button type="button" class="btn" data-act="prev">${ICON.left}<span>${STEPS[i - 1].short}</span></button>` : '<span></span>'}` +
      (i < last ? `<button type="button" class="btn ghost only-mobile" data-act="openPreview">${ICON.card}<span>Aperçu</span></button>` : '') +
      (i < last ? `<button type="button" class="btn primary" data-act="next"><span>${STEPS[i + 1].short}</span>${ICON.right}</button>` : '<span></span>') + '</footer>';
    return `<section class="step" data-step="${s.id}" style="--accent:var(${s.color})">${head}${body}${foot}</section>`;
  }
  function renderPanel() {
    ui.ideas = {};
    $('#panel').innerHTML = panelHTML();
    phLayout();
    $('.layout').classList.toggle('no-preview', STEPS[ui.step].id === 'fiche');
    document.body.classList.remove('show-preview');
  }
  function renderPreview() {
    $('#preview').innerHTML = `<div class="preview-bar"><span>Aperçu de la fiche</span><button type="button" class="btn" data-act="closePreview">Fermer</button></div>${cardHTML(C(), false)}`;
  }
  function renderLine() {
    $('#line').innerHTML = `<ol class="stations">${STEPS.map((s, i) => `<li class="station${i < ui.step ? ' done' : ''}${i === ui.step ? ' current' : ''}" style="--c:var(${s.color})"><button type="button" data-act="goto" data-i="${i}"${i === ui.step ? ' aria-current="step"' : ''}><span class="dot"></span><span class="name">${s.short}</span></button></li>`).join('')}</ol>`;
  }
  function renderTop() {
    const n = store.order.length;
    $('#charCount').textContent = n;
  }
  function renderBanner() {
    const c = C();
    let h = '';
    if (ui.shared) {
      const s = sheet(ui.shared);
      h += `<div class="banner"><p>Un personnage a été partagé via ce lien : <b>${esc(s.name || 'sans nom')}</b>.</p><div class="btnrow"><button type="button" class="btn primary" data-act="shareAdd">Ajouter à mes personnages</button><button type="button" class="btn" data-act="shareDismiss">Ignorer</button></div></div>`;
    }
    if (c && c.example) {
      h += `<div class="banner"><p><b>Personnage d'exemple.</b> Il a été tiré au sort pour montrer ce que donne une fiche. Modifie-le, relance des champs, ou pars d'une fiche vierge.</p><div class="btnrow"><button type="button" class="btn primary" data-act="newBlank">Fiche vierge</button><button type="button" class="btn" data-act="keepExample">Garder cet exemple</button></div></div>`;
    }
    $('#banner').innerHTML = h;
  }
  function renderAll() { renderTop(); renderBanner(); renderLine(); renderPanel(); renderPreview(); }

  function sigOf(a) {
    const w = a && a.closest && a.closest('[data-field]');
    if (!w) return null;
    return { k: w.dataset.field, tag: a.tagName.toLowerCase(), act: a.dataset.act, v: a.dataset.v, custom: a.dataset.custom, rel: a.dataset.rel, i: a.dataset.i };
  }
  function restore(sig) {
    if (!sig) return;
    const w = $(`[data-field="${sig.k}"]`);
    if (!w) return;
    const m = $$(sig.tag, w).find(x => x.dataset.act === sig.act && x.dataset.v === sig.v && x.dataset.custom === sig.custom && x.dataset.rel === sig.rel && x.dataset.i === sig.i);
    if (m) m.focus({ preventScroll: true });
  }
  function refreshField(key) {
    const el = $(`[data-field="${key}"]`);
    if (!el) return;
    const sig = sigOf(document.activeElement);
    el.outerHTML = fieldHTML(key, C());
    restore(sig);
    if (key === 'photo') phLayout();
  }
  function refreshAllFields() {
    $$('[data-field]').forEach(w => { if (w.isConnected) refreshField(w.dataset.field); });
  }
  function afterChange(key) {
    renderPreview(); renderTop(); scheduleSave();
  }
  function changed(key) {
    const c = C();
    c.updated = Date.now();
    if (c.example) { c.example = false; renderBanner(); }
    if (key === 'genre') refreshAllFields(); else refreshField(key);
    afterChange(key);
  }
  function go(i) {
    ui.step = clamp(i, 0, STEPS.length - 1);
    renderLine(); renderPanel(); renderPreview();
    const h = $('#panel h2');
    if (h) h.focus({ preventScroll: true });
    $('#line').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }
  let toastTimer = 0;
  // thème : clair (par défaut), sombre, ou celui de l'appareil
  const THEMES = [['light', 'clair', 'sun'], ['dark', 'sombre', 'moon'], ['auto', 'automatique', 'auto']];
  function renderTheme() {
    const cur = document.documentElement.dataset.theme || 'light', i = Math.max(0, THEMES.findIndex(t => t[0] === cur)), nx = THEMES[(i + 1) % THEMES.length];
    const b = $('#themeBtn');
    if (!b) return;
    b.innerHTML = ICON[THEMES[i][2]];
    b.setAttribute('aria-label', 'Thème ' + THEMES[i][1] + ' : passer en ' + nx[1]);
    b.title = 'Thème ' + THEMES[i][1] + ' (cliquer pour : ' + nx[1] + ')';
  }
  function cycleTheme() {
    const cur = document.documentElement.dataset.theme || 'light', i = Math.max(0, THEMES.findIndex(t => t[0] === cur)), nx = THEMES[(i + 1) % THEMES.length][0];
    document.documentElement.dataset.theme = nx;
    try { localStorage.setItem('ligne-de-vie.theme', nx); } catch (e) { /* sans stockage, le thème dure le temps de la visite */ }
    renderTheme();
  }
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ---------- presse-papiers, fichiers, partage ---------- */
  async function copyText(text, msg) {
    try { await navigator.clipboard.writeText(text); toast(msg || 'Copié.'); return; } catch (e) { /* repli ci-dessous */ }
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { /* ignoré */ }
    ta.remove();
    toast(ok ? (msg || 'Copié.') : 'Copie impossible : sélectionne le texte à la main.');
  }
  const slug = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'personnage';
  function saveFile(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }
  const b64u = bytes => {
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const unb64u = t => {
    t = t.replace(/-/g, '+').replace(/_/g, '/');
    while (t.length % 4) t += '=';
    const bin = atob(t), out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  };
  async function pipe(bytes, stream) {
    const w = stream.writable.getWriter();
    w.write(bytes); w.close();
    return new Uint8Array(await new Response(stream.readable).arrayBuffer());
  }
  async function encodeShare(c) {
    const bytes = new TextEncoder().encode(JSON.stringify({ v: c.v, rel: c.rel, bg: c.bg }));
    let out = 'j.' + b64u(bytes);
    if ('CompressionStream' in window) {
      try { const z = 'z.' + b64u(await pipe(bytes, new CompressionStream('gzip'))); if (z.length < out.length) out = z; } catch (e) { /* on garde la version simple */ }
    }
    return out;
  }
  async function decodeShare(s) {
    if (s.length > 80000) throw new Error('trop long');
    const kind = s.slice(0, 2);
    let bytes = unb64u(s.slice(2));
    if (kind === 'z.') bytes = await pipe(bytes, new DecompressionStream('gzip'));
    else if (kind !== 'j.') throw new Error('format');
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  async function parseImport(text) {
    text = text.trim();
    if (!text) throw new Error('Colle un lien, un texte JSON ou choisis un fichier.');
    const link = text.match(/#p=([^\s]+)/);
    if (link) return clean(await decodeShare(link[1]));
    if (/^[jz]\.[\w-]+$/.test(text)) return clean(await decodeShare(text));
    const obj = JSON.parse(text);
    return clean(obj && obj.character ? obj.character : obj);
  }

  /* ---------- fenêtres ---------- */
  function charsListHTML() {
    return store.order.map(id => {
      const c = store.chars[id], s = sheet(c), armed = ui.armed === id;
      return `<li class="chr${id === store.cur ? ' cur' : ''}"><button type="button" class="chr-main" data-act="openChar" data-id="${id}"><span class="chr-av">${portrait(c, true)}</span><span class="chr-t"><b>${esc(s.name || 'Personnage sans nom')}</b><small>${esc(s.sub || 'Fiche vide')}</small></span></button>` +
        `<button type="button" class="tool" data-act="dupChar" data-id="${id}" aria-label="Dupliquer ${esc(s.name || 'ce personnage')}" title="Dupliquer">${ICON.copy}</button>` +
        `<button type="button" class="tool danger${armed ? ' armed' : ''}" data-act="delChar" data-id="${id}" aria-label="${armed ? 'Confirmer la suppression de' : 'Supprimer'} ${esc(s.name || 'ce personnage')}" title="${armed ? 'Cliquer pour confirmer' : 'Supprimer'}">${armed ? 'Confirmer' : ICON.trash}</button></li>`;
    }).join('');
  }
  function openChars() {
    ui.armed = null;
    const dlg = $('#dlgChars');
    $('#charsList').innerHTML = charsListHTML();
    if (!dlg.open) dlg.showModal();
  }
  function closeDialogs() { $$('dialog[open]').forEach(d => d.close()); }

  /* ---------- actions ---------- */
  function newBlank() {
    const c = blank();
    addChar(c); ui.armed = null; closeDialogs();
    renderAll(); scheduleSave(); $('#line').scrollIntoView({ block: 'start' });
    toast('Nouvelle fiche vierge.');
    toCreator();
  }
  function genAllNow() {
    const c = C();
    genKeys(c, ORDER);
    c.example = false; c.updated = Date.now();
    renderAll(); scheduleSave();
    toast(Object.keys(c.locks).length ? 'Personnage tiré au sort, champs verrouillés conservés.' : 'Personnage tiré au sort.');
  }
  function roll(key) {
    const c = C();
    const val = F[key].gen(c);
    if (key === 'notes' && c.v.notes && val) setVal(c, key, c.v.notes.trim() + '\n' + val); else setVal(c, key, val);
    changed(key);
    if (key === 'prenom' || key === 'nom') renderPreview();
  }
  function toggleChip(key, val) {
    const d = F[key], c = C();
    if (d.t === 'multi') {
      const a = (c.v[key] || []).slice(), i = a.indexOf(val);
      if (i >= 0) a.splice(i, 1);
      else { if (a.length >= d.max) { toast('Maximum ' + d.max + ' choix : retires-en un d\'abord.'); return; } a.push(val); }
      c.v[key] = a;
    } else { c.v[key] = c.v[key] === val ? '' : val; if (key === 'origine') ensureHerit(c); }
    changed(key);
  }
  function addCustom(key, text) {
    const d = F[key], c = C();
    text = text.trim().slice(0, 40);
    if (!text) return;
    if (d.t === 'multi') {
      const a = (c.v[key] || []).slice();
      if (a.indexOf(text) < 0) { if (a.length >= d.max) { toast('Maximum ' + d.max + ' choix : retires-en un d\'abord.'); return; } a.push(text); }
      c.v[key] = a;
    } else { c.v[key] = text; if (key === 'origine') ensureHerit(c); }
    changed(key);
  }

  document.addEventListener('click', e => {
    const dlg = e.target;
    if (dlg.tagName === 'DIALOG') { dlg.close(); return; }
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    const act = b.dataset.act, key = b.dataset.key, c = C();
    if (act !== 'bgAll') bgDisarm();
    switch (act) {
      case 'chip': toggleChip(key, b.dataset.v); break;
      case 'sw': c.v[key] = Number(b.dataset.v); changed(key); break;
      case 'roll': roll(key); break;
      case 'lock':
        if (c.locks[key]) delete c.locks[key]; else c.locks[key] = true;
        refreshField(key); scheduleSave(); break;
      case 'goto': go(Number(b.dataset.i)); break;
      case 'prev': go(ui.step - 1); break;
      case 'next': go(ui.step + 1); break;
      case 'genStep': {
        genKeys(c, STEPS[ui.step].fields);
        c.example = false; c.updated = Date.now();
        renderBanner(); renderPanel(); renderPreview(); scheduleSave();
        toast('Étape tirée au sort.'); break;
      }
      case 'genAll': genAllNow(); break;
      case 'relAdd': c.rel.push({ nom: '', lien: '', note: '' }); changed('rel'); break;
      case 'relDel': c.rel.splice(Number(b.dataset.i), 1); changed('rel'); break;
      case 'openPreview': document.body.classList.add('show-preview'); $('#preview').scrollTop = 0; break;
      case 'closePreview': document.body.classList.remove('show-preview'); break;
      case 'newBlank': newBlank(); break;
      case 'keepExample': c.example = false; renderBanner(); scheduleSave(); break;
      case 'openChars': openChars(); break;
      case 'closeDlg': closeDialogs(); break;
      case 'openChar':
        store.cur = b.dataset.id; ui.step = 0; ui.armed = null; ui.bgArm = false; closeDialogs(); scheduleSave();
        if (ui.view === 'home') toCreator(); else renderView();
        break;
      case 'dupChar': {
        const src = store.chars[b.dataset.id], n = clean({ v: src.v, rel: src.rel, photo: src.photo, bg: src.bg });
        if (n.v.prenom) n.v.prenom += ' (copie)'; else n.v.nom = (n.v.nom || '') + ' (copie)';
        addChar(n); closeDialogs(); renderView(); scheduleSave(); toast('Personnage dupliqué.'); if (ui.view === 'home') toCreator(); break;
      }
      case 'delChar': {
        const id = b.dataset.id;
        if (ui.armed !== id) { ui.armed = id; $('#charsList').innerHTML = charsListHTML(); break; }
        delete store.chars[id]; store.order = store.order.filter(x => x !== id); ui.armed = null;
        if (!store.order.length) { addChar(blank()); closeDialogs(); renderView(); }
        else { if (store.cur === id) { store.cur = store.order[0]; ui.step = 0; renderView(); } $('#charsList').innerHTML = charsListHTML(); }
        renderTop(); scheduleSave(); break;
      }
      case 'openImport': closeDialogs(); $('#impMsg').textContent = ''; $('#impText').value = ''; $('#dlgImport').showModal(); break;
      case 'doImport': {
        parseImport($('#impText').value).then(n => {
          addChar(n); closeDialogs(); renderAll(); scheduleSave(); toast('Fiche importée.'); toCreator();
        }).catch(err => { $('#impMsg').textContent = err && err.message && !/JSON|Unexpected|format|trop/.test(err.message) ? err.message : 'Ce texte n\'est pas une fiche valide.'; });
        break;
      }
      case 'shareAdd': { ui.shared.id = newId(); addChar(ui.shared); ui.shared = null; history.replaceState(null, '', location.pathname + location.search + '#creation'); renderAll(); scheduleSave(); toast('Personnage ajouté.'); break; }
      case 'shareDismiss': ui.shared = null; history.replaceState(null, '', location.pathname + location.search + '#creation'); renderBanner(); break;
      case 'copyMd': {
        const t = toText(c, true);
        copyText(t, t.length > 2000 ? 'Copié, mais plus de 2000 caractères : Discord demandera de découper le message.' : 'Fiche copiée au format Discord.'); break;
      }
      case 'copyTxt': copyText(toText(c, false), 'Fiche copiée en texte brut.'); break;
      case 'copyLink': encodeShare(c).then(p => copyText(location.href.split('#')[0] + '#p=' + p, 'Lien de partage copié.')); break;
      case 'dlJson': saveFile(slug(sheet(c).name) + '.json', JSON.stringify({ app: 'ligne-de-vie', version: 1, character: { v: c.v, rel: c.rel, photo: c.photo, bg: c.bg } }, null, 2), 'application/json'); break;
      case 'dlPortrait':
        if (c.photo.src) fetch(c.photo.src).then(r => r.blob()).then(b => saveFile(slug(sheet(c).name) + '-portrait.jpg', b, 'image/jpeg'));
        break;
      case 'descApply': describeApply(); break;
      case 'ideas':
        if (ui.ideas[key]) delete ui.ideas[key]; else ui.ideas[key] = makeIdeas(key, c, []);
        refreshField(key); break;
      case 'ideaMore': { const st = ui.ideas[key]; if (st) { ui.ideas[key] = makeIdeas(key, c, st.avoid); refreshField(key); } break; }
      case 'ideaClose': { delete ui.ideas[key]; refreshField(key); const el = $('[data-act="ideas"][data-key="' + key + '"]'); if (el) el.focus({ preventScroll: true }); break; }
      case 'ideaUse': useIdea(key, Number(b.dataset.i)); break;
      case 'relRoll': {
        const r = c.rel[Number(b.dataset.i)];
        if (!r) break;
        if (!r.nom) { const o = pick(D.ORIGINES); r.nom = pick(o.f.concat(o.m)) + ' ' + pick(o.noms); }
        if (!r.lien) r.lien = pick(D.LIENS);
        r.note = fill(pick(D.NOTES_REL.concat(ipool('relnote'))), c);
        changed('rel'); break;
      }
      case 'descRandom': { ui.descText = randomDescription(); const t = $('#descText'); if (t) { t.value = ui.descText; t.focus(); } break; }
      case 'homeRandom': ui.descText = randomDescription(); describeApply(); break;
      case 'descMore': ui.exIdx = null; if (ui.view === 'home') renderHome(); else renderPanel(); break;
      case 'descEx': { const ex = exPool()[Number(b.dataset.i)]; if (ex) { ui.descText = ex[1]; const t = $('#descText'); if (t) { t.value = ex[1]; t.focus(); } } break; }
      case 'expand': ui.exp[key] = !ui.exp[key]; refreshField(key); break;
      case 'phPick': { const f = $('#phFile'); if (f) f.click(); break; }
      case 'phUse':
        if (phEditing(c)) {
          c.photo.src = P.crop(ui.ph.img, ui.ph.w, ui.ph.h, ui.ph.zoom, ui.ph.fx, ui.ph.fy);
          phStop(); Object.assign(ui.ph, { status: 'idle', msg: '' });
          changed('photo'); toast('Image enregistrée.');
        }
        break;
      case 'phCancel': phStop(); Object.assign(ui.ph, { status: 'idle', msg: '' }); refreshField('photo'); break;
      case 'phClear': c.photo.src = ''; changed('photo'); toast('Image retirée.'); break;
      case 'copyPrompt': copyText(buildPrompt(c, $('#ctask').value), 'Demande copiée : colle-la dans Claude.'); break;
      case 'insertReply': {
        const txt = $('#creply').value.trim(), k = $('#ctarget').value;
        if (!txt) { toast('Colle d\'abord la réponse de Claude.'); break; }
        c.v[k] = (c.v[k] ? c.v[k] + '\n\n' : '') + txt;
        $('#creply').value = ''; changed(k); toast('Texte inséré dans « ' + F[k].label + ' ».'); break;
      }
      case 'theme': cycleTheme(); break;
      case 'skip': e.preventDefault(); $('#main').focus(); break;
      case 'world':
        if (W() !== b.dataset.w) { setWorld(b.dataset.w); refreshExample(); scheduleSave(); }
        renderHome(); break;
      case 'homeEx': { const ex = exPool()[Number(b.dataset.i)]; if (ex) { ui.descText = ex[1]; describeApply(); } break; }
      case 'bgPreset': bgSetPlan(c, BG.PLANS[b.dataset.p]); bgChanged('[data-act="bgPreset"][data-p="' + b.dataset.p + '"]'); break;
      case 'bgToggle': {
        const k = b.dataset.k, on = c.bg.on.indexOf(k) >= 0;
        if (on) c.bg.on = c.bg.on.filter(x => x !== k);
        else { c.bg.on = BG_ALL.filter(x => c.bg.on.indexOf(x) >= 0 || x === k); if (k !== 'libre' && !(c.bg.t[k] || '').trim()) c.bg.t[k] = bgOne(c, k); }
        bgChanged(on ? '[data-act="bgToggle"][data-k="' + k + '"]' : '#bg-' + k); break;
      }
      case 'bgRoll': {
        const k = b.dataset.k;
        const had = (c.bg.t[k] || '').trim();
        if (had) ui.bgPrev[c.id + k] = c.bg.t[k];
        c.bg.t[k] = k === 'libre' ? (had ? had + '\n\n' : '') + BG.anecdote(c, disp, form(c), W()).slice(0, 1500) : bgOne(c, k);
        bgChanged('[data-act="bgRoll"][data-k="' + k + '"]'); break;
      }
      case 'bgUndo': {
        const k = b.dataset.k, p = ui.bgPrev[c.id + k];
        if (p) { c.bg.t[k] = p; delete ui.bgPrev[c.id + k]; bgChanged('#bg-' + k); }
        break;
      }
      case 'bgAll': {
        if (!ui.bgArm && bgHas(c)) { ui.bgArm = true; b.classList.add('armed'); const sp = $('span', b); if (sp) sp.textContent = 'Confirmer : tout réécrire'; break; }
        ui.bgArm = false;
        if (!c.bg.on.some(k => k !== 'libre')) bgSetPlan(c, BG.PLANS.moyen);
        c.bg.on.forEach(k => { if (k !== 'libre') { if ((c.bg.t[k] || '').trim()) ui.bgPrev[c.id + k] = c.bg.t[k]; c.bg.t[k] = bgOne(c, k); } });
        bgChanged('[data-act="bgAll"]'); toast('Background réécrit.'); break;
      }
      case 'bgCopyMd': case 'bgCopyTxt': {
        if (!bgHas(c)) { toast('Rien à copier pour l\'instant.'); break; }
        const md = act === 'bgCopyMd', t = bgToText(c, md);
        copyText(t, md ? (t.length > 2000 ? 'Copié, mais plus de 2000 caractères : Discord demandera de découper le message.' : 'Background copié au format Discord.') : 'Background copié.'); break;
      }
      case 'bgFix': ui.step = clamp(Number(b.dataset.i) || 0, 0, STEPS.length - 1); location.hash = '#creation'; break;
      case 'bgPrompt': copyText(buildBgPrompt(c, $('#bgTask').value), 'Demande copiée : colle-la dans Claude.'); break;
      case 'bgInsert': {
        const txt = $('#bgReply').value.trim();
        if (!txt) { toast('Colle d\'abord la réponse de Claude.'); break; }
        c.bg.t.libre = ((c.bg.t.libre || '') + (c.bg.t.libre ? '\n\n' : '') + txt).slice(0, 6000);
        c.bg.on = BG_ALL.filter(x => c.bg.on.indexOf(x) >= 0 || x === 'libre');
        bgChanged('#bg-libre'); toast('Texte ajouté dans « Texte libre ».'); break;
      }
      default: break;
    }
  });

  document.addEventListener('input', e => {
    const t = e.target, c = C();
    if (t.dataset.bg) { c.bg.t[t.dataset.bg] = t.value; c.bg.seen = true; c.updated = Date.now(); c.example = false; scheduleSave(); return; }
    if (t.dataset.rel) {
      const r = c.rel[Number(t.dataset.i)];
      if (r) { r[t.dataset.rel] = t.value; c.updated = Date.now(); afterChange('rel'); }
      return;
    }
    if (t.id === 'descText') { ui.descText = t.value; return; }
    if (t.id === 'phZoom') { ui.ph.zoom = clamp(Number(t.value) || 1, 1, 3); phLayout(); return; }
    const key = t.dataset.key;
    if (!key || t.dataset.custom || !F[key]) return;
    if (F[key].t === 'number') {
      const n = t.value === '' ? NaN : Math.round(Number(t.value));
      if (isFinite(n)) c.v[key] = n; else delete c.v[key];
    } else c.v[key] = t.value;
    c.updated = Date.now();
    if (c.example) { c.example = false; renderBanner(); }
    if (key === 'taille') updateTailleHint();
    afterChange(key);
  });
  document.addEventListener('change', e => {
    const t = e.target, c = C();
    if (t.id === 'bgChar') { store.cur = t.value; ui.step = 0; ui.bgArm = false; scheduleSave(); renderBg('#bgChar'); return; }
    if (t.dataset.rel === 'lien') { c.rel[Number(t.dataset.i)].lien = t.value; afterChange('rel'); return; }
    if (t.id === 'phFile') {
      const f = t.files && t.files[0];
      t.value = '';
      if (f) phOpen(f);
      return;
    }
    const key = t.dataset.key;
    if (key && F[key] && F[key].t === 'number' && t.value !== '') {
      const n = clamp(Math.round(Number(t.value)), F[key].min, F[key].max);
      c.v[key] = n; t.value = n;
      if (key === 'taille') updateTailleHint();
      afterChange(key);
    }
    if (t.id === 'impFile' && t.files[0]) {
      t.files[0].text().then(txt => { $('#impText').value = txt; $('#impMsg').textContent = ''; });
    }
  });
  // cadrage de l'image : glisser avec la souris ou le doigt, molette pour zoomer, flèches du clavier
  let drag = null;
  document.addEventListener('pointerdown', e => {
    const f = e.target.closest && e.target.closest('#phView.editing');
    if (!f) return;
    drag = { x: e.clientX, y: e.clientY, fx: ui.ph.fx, fy: ui.ph.fy, w: f.getBoundingClientRect().width };
    try { f.setPointerCapture(e.pointerId); } catch (err) { /* sans suite */ }
    e.preventDefault();
  });
  document.addEventListener('pointermove', e => {
    if (!drag) return;
    ui.ph.fx = drag.fx + (e.clientX - drag.x) / drag.w;
    ui.ph.fy = drag.fy + (e.clientY - drag.y) / drag.w;
    phLayout();
  });
  ['pointerup', 'pointercancel'].forEach(n => document.addEventListener(n, () => { drag = null; }));
  document.addEventListener('wheel', e => {
    const f = e.target.closest && e.target.closest('#phView.editing');
    if (!f) return;
    e.preventDefault();
    ui.ph.zoom = clamp(ui.ph.zoom - Math.sign(e.deltaY) * 0.08, 1, 3);
    const z = $('#phZoom'); if (z) z.value = ui.ph.zoom;
    phLayout();
  }, { passive: false });
  window.addEventListener('resize', phLayout);
  // un fichier déposé hors du cadre ne doit pas faire quitter la page
  const hasFiles = e => e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') >= 0;
  document.addEventListener('dragover', e => { if (hasFiles(e)) e.preventDefault(); });
  document.addEventListener('drop', e => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    const zone = e.target.closest && e.target.closest('[data-drop]'), f = e.dataTransfer.files[0];
    if (zone && f) phOpen(f);
  });

  document.addEventListener('toggle', e => { const d = e.target; if (d.dataset && d.dataset.more) ui.more[d.dataset.more] = d.open; }, true);
  document.addEventListener('keydown', e => {
    const t = e.target;
    if (t.id === 'descText' && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); describeApply(); return; }
    if (t.id === 'phView' && t.classList.contains('editing')) {
      const step = 0.02, k = e.key;
      if (k === 'ArrowLeft') ui.ph.fx -= step; else if (k === 'ArrowRight') ui.ph.fx += step;
      else if (k === 'ArrowUp') ui.ph.fy -= step; else if (k === 'ArrowDown') ui.ph.fy += step;
      else if (k === '+' || k === '=') ui.ph.zoom = clamp(ui.ph.zoom + 0.1, 1, 3);
      else if (k === '-') ui.ph.zoom = clamp(ui.ph.zoom - 0.1, 1, 3);
      else return;
      e.preventDefault();
      const z = $('#phZoom'); if (z) z.value = ui.ph.zoom;
      phLayout();
      return;
    }
    if (e.key === 'Enter' && t.matches && t.matches('.chip-in')) {
      e.preventDefault();
      const key = t.dataset.key, v = t.value;
      addCustom(key, v);
    }
    if (e.key === 'Escape' && document.body.classList.contains('show-preview')) document.body.classList.remove('show-preview');
  });
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', () => { clearTimeout(saveTimer); if (storageOK) saveNow(); });

  async function checkHash() {
    const m = location.hash.match(/^#p=(.+)$/);
    if (!m) return;
    try { ui.shared = clean(await decodeShare(m[1])); renderBanner(); }
    catch (e) { toast('Le lien de partage est illisible.'); }
  }

  /* ---------- Background : rédiger l'histoire d'un personnage ---------- */
  const bgHas = c => c.bg.on.some(k => (c.bg.t[k] || '').trim());
  const bgOne = (c, k) => BG.section(k, c, disp, form(c), W()).text;
  // affiche les parties de la liste et rédige celles qui n'ont pas encore de texte ; les autres textes sont gardés
  function bgSetPlan(c, keys) {
    c.bg.on = BG_ALL.filter(k => keys.indexOf(k) >= 0 || (k === 'libre' && c.bg.on.indexOf('libre') >= 0));
    keys.forEach(k => { if (!(c.bg.t[k] || '').trim()) c.bg.t[k] = bgOne(c, k); });
    c.bg.seen = true;
  }
  const bgPreset = c => {
    const on = c.bg.on.filter(k => k !== 'libre').join();
    return Object.keys(BG.PLANS).find(p => BG.PLANS[p].join() === on) || '';
  };
  function bgToText(c, md) {
    const name = sheet(c).name || 'Personnage sans nom', out = [md ? '**Background de ' + name + '**' : 'BACKGROUND DE ' + name.toUpperCase()];
    bgParts(c).forEach(p => out.push('', md ? '**' + p[0] + '**' : p[0].toUpperCase(), p[1]));
    return out.join('\n');
  }
  const BG_TASKS = {
    complet: 'Écris le background complet de ce personnage en trois ou quatre paragraphes (origines, parcours, situation actuelle), cohérent avec la fiche. Sois concret (lieux, personnes, dates approximatives), évite les clichés et laisse quelques zones d\'ombre que d\'autres joueurs pourront explorer.',
    enrichir: 'Réécris le background actuel de la fiche en l\'enrichissant de détails concrets et de nuances, sans changer les faits ni la fiche.',
    candidature: 'Résume le background de ce personnage en un seul paragraphe d\'une dizaine de lignes, adapté à une candidature sur un serveur de jeu de rôle.'
  };
  function buildBgPrompt(c, task) {
    return 'Je crée un personnage pour un jeu de rôle (RP) ' + worldLine() + ' Voici sa fiche actuelle :\n\n' + toText(c, false) +
      '\n\nDemande : ' + BG_TASKS[task] + '\n\nRéponds en français, avec un ton naturel et sans titres superflus, de façon à ce que je puisse copier ton texte tel quel dans ma fiche.';
  }
  function bgMiniHTML(c) {
    const s = sheet(c), f = form(c), chips = (c.v.traits || []).slice(0, 4).map(x => `<li>${esc(disp(x, f))}</li>`).join('');
    return `<div class="mini"><figure class="idc-photo">${portrait(c)}</figure><div class="mini-t"><b>${esc(s.name) || 'Personnage sans nom'}</b><small>${esc(s.sub) || 'Fiche à compléter'}</small>${chips ? `<ul class="idc-chips">${chips}</ul>` : ''}<a class="link" href="#creation">Modifier la fiche</a></div></div>`;
  }
  // ce qui manque à la fiche et rendrait le texte plus précis, avec l'étape où le compléter
  function bgHintsHTML(c) {
    const v = c.v, need = [];
    if (!v.ville) need.push(['Ville', 0]);
    if (!v.metier) need.push(['Métier', 0]);
    if (!(v.traits || []).length) need.push(['Traits', 2]);
    if (!v.motivation) need.push(['Motivation', 2]);
    if (!v.evenement) need.push(['Événement marquant', 3]);
    if (!c.rel.some(r => r.nom)) need.push(['Relations', 4]);
    if (!need.length) return '';
    return `<div class="bg-hint"><p class="hint">Le texte gagne en détails avec :</p><div class="chips">${need.map(n => `<button type="button" class="chip" data-act="bgFix" data-i="${n[1]}">${n[0]}</button>`).join('')}</div></div>`;
  }
  function bgSecHTML(c, k) {
    const gen = k !== 'libre', prev = ui.bgPrev[c.id + k], title = esc(BG_TITLE[k]);
    return `<article class="bg-sec" style="--c:var(${BG_LINE[k]})"><div class="field-head"><label class="lbl" for="bg-${k}">${title}</label><span class="tools">` +
      `<button type="button" class="tool" data-act="bgRoll" data-k="${k}" aria-label="${gen ? 'Réécrire : ' + title : 'Ajouter une anecdote originale'}" title="${gen ? 'Réécrire cette partie' : 'Ajouter une anecdote originale'}">${ICON.die}</button>` +
      `<button type="button" class="tool" data-act="bgToggle" data-k="${k}" aria-label="Masquer : ${title} (le texte est gardé)" title="Masquer cette partie (le texte est gardé)">${ICON.minus}</button></span></div>` +
      `<textarea class="in" id="bg-${k}" data-bg="${k}" rows="6" maxlength="6000" placeholder="${gen ? '' : 'Écris ici ce que tu veux ajouter, ou clique sur le dé pour une anecdote originale.'}">${esc(c.bg.t[k] || '')}</textarea>` +
      (prev ? `<div><button type="button" class="link" data-act="bgUndo" data-k="${k}">Rétablir la version précédente</button></div>` : '') + '</article>';
  }
  function bgClaudeHTML() {
    return `<details class="claude" id="bgClaude"><summary>${ICON.spark}<span>Une version plus riche ? Demande à Claude</span></summary>
<div class="claude-body">
<p>Le site ne se connecte pas à Claude tout seul. Il prépare une demande à partir de la fiche : tu la copies, tu la colles dans Claude, puis tu rapportes la réponse ici, dans « Texte libre ».</p>
<div class="field"><div class="field-head"><label class="lbl" for="bgTask">Que veux-tu demander ?</label></div>
<select class="in" id="bgTask"><option value="complet">Écrire le background complet</option><option value="enrichir">Enrichir le background actuel</option><option value="candidature">Résumer pour une candidature</option></select></div>
<div class="btnrow"><button type="button" class="btn primary" data-act="bgPrompt">${ICON.copy} Copier la demande</button><a class="btn" href="https://claude.ai/new" target="_blank" rel="noopener">Ouvrir Claude</a></div>
<div class="field"><div class="field-head"><label class="lbl" for="bgReply">Réponse de Claude</label></div><textarea class="in" id="bgReply" rows="5" placeholder="Colle ici ce que Claude a répondu."></textarea></div>
<div class="btnrow"><button type="button" class="btn" data-act="bgInsert">Ajouter dans « Texte libre »</button></div>
</div></details>`;
  }
  function bgPageHTML() {
    const c = C(), pre = bgPreset(c), has = c.bg.on.length > 0;
    const opts = store.order.map(id => {
      const x = store.chars[id], n = sheet(x).name || 'Personnage sans nom';
      return `<option value="${id}"${id === store.cur ? ' selected' : ''}>${esc(n)}${x.example ? ' (exemple)' : ''}</option>`;
    }).join('');
    const lens = Object.keys(BG.PLANS).map(p => `<button type="button" class="chip" data-act="bgPreset" data-p="${p}" aria-pressed="${pre === p}">${{ court: 'Court', moyen: 'Moyen', long: 'Long' }[p]}</button>`).join('');
    const off = BG_ALL.filter(k => c.bg.on.indexOf(k) < 0).map(k => `<button type="button" class="chip more-chip" data-act="bgToggle" data-k="${k}">+ ${esc(BG_TITLE[k])}</button>`).join('');
    let body;
    if (has) {
      body = c.bg.on.map(k => bgSecHTML(c, k)).join('') +
        (off ? `<div class="bg-add"><span class="hint">Ajouter une partie :</span>${off}</div>` : '') +
        `<div class="step-foot bg-foot"><button type="button" class="btn${ui.bgArm ? ' armed' : ''}" data-act="bgAll">${ICON.die}<span>${ui.bgArm ? 'Confirmer : tout réécrire' : 'Tout réécrire'}</span></button>` +
        `<span class="btnrow"><button type="button" class="btn" data-act="bgCopyTxt">${ICON.copy}<span>Texte brut</span></button><button type="button" class="btn primary" data-act="bgCopyMd">${ICON.copy}<span>Pour Discord</span></button></span></div>` +
        bgClaudeHTML();
    } else if (isUntouched(c)) {
      body = `<div class="empty bg-empty"><p><b>Cette fiche est encore vide.</b> Le background s'appuie sur ce que tu as rempli : âge, ville, métier, caractère, événement marquant, relations.</p><div class="btnrow"><a class="btn primary" href="#creation">Compléter la fiche</a><button type="button" class="btn" data-act="bgPreset" data-p="moyen">Rédiger quand même</button></div></div>`;
    } else {
      body = `<div class="empty bg-empty"><p>Aucune partie n'est affichée. Choisis une longueur ci-dessus${off ? ', ou ajoute une partie :' : '.'}</p>${off ? `<div class="chips">${off}</div>` : ''}</div>`;
    }
    return `<div class="bg-in"><header class="step-head"><div class="step-title"><h2 tabindex="-1">Background</h2></div><p class="lede">L'histoire d'un personnage, rédigée à partir de sa fiche. Relis, modifie, relance ce qui ne te plaît pas.</p></header>
<div class="bg-grid"><div class="bg-main">
<div class="group bg-bar"><div class="field"><div class="field-head"><label class="lbl" for="bgChar">Personnage</label></div><select class="in" id="bgChar">${opts}</select></div>
<div class="field"><div class="field-head"><span class="lbl" id="l-bglen">Longueur</span></div><div class="chips" role="group" aria-labelledby="l-bglen">${lens}</div></div></div>
${bgHintsHTML(c)}${body}</div>
<aside class="bg-side" aria-label="Personnage">${bgMiniHTML(c)}</aside></div></div>`;
  }
  function renderBg(focusSel) {
    const c = C();
    // première visite d'une fiche déjà remplie : un premier texte est proposé tout de suite
    if (c && !c.bg.seen && !c.bg.on.length && !isUntouched(c)) { bgSetPlan(c, BG.PLANS.moyen); scheduleSave(); }
    $('#bgPage').innerHTML = bgPageHTML();
    renderTop();
    if (focusSel) { const el = $(focusSel); if (el) el.focus({ preventScroll: true }); }
  }
  function bgChanged(focusSel) {
    const c = C();
    c.updated = Date.now(); c.bg.seen = true;
    scheduleSave(); renderBg(focusSel);
  }
  function bgDisarm() {
    if (!ui.bgArm) return;
    ui.bgArm = false;
    const b = $('[data-act="bgAll"]');
    if (b) { b.classList.remove('armed'); const s = $('span', b); if (s) s.textContent = 'Tout réécrire'; }
  }

  /* ---------- accueil ---------- */
  const TILE_ICON = {
    creer: '<svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="21" cy="16" r="7.5"/><path d="M6 41c0-8.5 6.5-14 15-14s15 5.500 15 14"/><path d="M38 9v10M33 14h10"/></svg>',
    histoire: '<svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 11c6.500-3 13-2.500 19 1.500 6-4 12.500-4.500 19-1.500v27c-6.500-3-13-2.500-19 1.500-6-4-12.500-4.500-19-1.500z"/><path d="M24 12.500v27"/></svg>'
  };
  function homeHTML() {
    const c = C(), gta = W() === 'gta', name = c && !c.example ? sheet(c).name : '';
    const tile = (href, line, ico, title, text, go) => `<a class="tile" href="${href}" style="--c:var(${line})"><span class="tile-ico">${ico}</span><span class="tile-t">${title}</span><span class="tile-d">${text}</span><span class="tile-go">${go}</span></a>`;
    const wbtn = (w, label) => `<button type="button" class="chip" data-act="world" data-w="${w}" aria-pressed="${W() === w}">${label}</button>`;
    return `<div class="home-in"><header class="home-head"><svg class="hero-mark" viewBox="0 0 44 32" aria-hidden="true"><defs><linearGradient id="alh-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8f7dff"/><stop offset="1" stop-color="#4fc3f7"/></linearGradient><linearGradient id="alh-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f58fc8"/><stop offset="1" stop-color="#ffb877"/></linearGradient><clipPath id="alh-c"><circle cx="15" cy="16" r="12"/></clipPath></defs><circle cx="15" cy="16" r="12" fill="url(#alh-a)" fill-opacity=".9"/><circle cx="29" cy="16" r="12" fill="url(#alh-b)" fill-opacity=".9"/><circle cx="29" cy="16" r="12" clip-path="url(#alh-c)" fill="#fff" fill-opacity=".55"/><path d="M5.4 12.2A10.6 10.6 0 0 1 13.6 5.2" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="1.3" stroke-linecap="round"/><path d="M38.6 19.8A10.6 10.6 0 0 1 30.4 26.8" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.3" stroke-linecap="round"/></svg><p class="eyebrow">Jeu de rôle · ${gta ? 'GTA RP' : 'États-Unis'}</p><h1 tabindex="-1">Alias<span aria-hidden="true">.</span></h1><p class="lede">Invente un personnage, puis écris son histoire. Tout reste dans ton navigateur.</p></header>
<div class="tiles">${tile('#creation', '--l1', TILE_ICON.creer, 'Création de personnage', 'Identité, apparence, caractère, relations. Décris-le en une phrase ou construis-le pas à pas.', name ? 'Reprendre ' + esc(name) : 'Commencer')}${tile('#background', '--l4', TILE_ICON.histoire, 'Background', 'Rédige l\'histoire d\'un personnage à partir de sa fiche : origines, parcours, tournant.', name ? 'Pour ' + esc(name) : 'Choisir un personnage')}</div>
<div class="home-boxes">
<section class="home-box" aria-labelledby="ideasT"><h2 class="box-t" id="ideasT">Une idée pour commencer ?</h2><p class="hint">Un clic crée le personnage correspondant, que tu pourras ensuite modifier.</p>
<div class="chips">${exShown().map(i => `<button type="button" class="chip" data-act="homeEx" data-i="${i}">${esc(exPool()[i][0])}</button>`).join('')}<button type="button" class="chip" data-act="homeRandom">${ICON.die} Surprends-moi</button><button type="button" class="chip more-chip" data-act="descMore">Autres idées</button></div></section>
<section class="home-box" aria-labelledby="worldT"><h2 class="box-t" id="worldT">Univers</h2>
<div class="chips" role="group" aria-labelledby="worldT">${wbtn('gta', 'GTA RP · San Andreas')}${wbtn('usa', 'États-Unis réels')}</div>
<p class="hint">${gta ? 'Los Santos, Blaine County (Sandy Shores, Paleto Bay…), Vice City et Liberty City, avec leurs métiers, services et gangs.' : 'Les grandes villes et les petites villes des États-Unis d\'aujourd\'hui, avec des métiers de la vie courante.'}</p></section>
</div></div>`;
  }
  function renderHome() { $('#home').innerHTML = homeHTML(); renderTop(); }
  // une fiche d'exemple suit l'univers choisi
  function refreshExample() {
    const c = C();
    if (!c || !c.example) return;
    const n = blank();
    genKeys(n, ORDER);
    n.id = c.id; n.created = c.created; n.example = true;
    store.chars[c.id] = n;
  }

  /* ---------- navigation entre les pages ---------- */
  // # (vide) : accueil, #creation, #background, #p=... : fiche partagée (ouverte dans la création)
  const parseView = () => {
    const h = location.hash.replace(/^#/, '');
    return h === 'creation' || /^p=/.test(h) ? 'creator' : h === 'background' ? 'bg' : h === '' ? 'home' : null;
  };
  function renderView() {
    if (ui.view === 'bg') renderBg(); else if (ui.view === 'home') renderHome(); else renderAll();
  }
  const toCreator = () => { if (ui.view !== 'creator') location.hash = '#creation'; };
  function showView(v) {
    const moved = ui.view !== undefined && ui.view !== v;
    ui.view = v;
    document.body.dataset.view = v;
    document.body.classList.remove('show-preview');
    $('#home').hidden = v !== 'home'; $('#creator').hidden = v !== 'creator'; $('#bgPage').hidden = v !== 'bg';
    $$('[data-nav]').forEach(a => { if (a.dataset.nav === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    document.title = (v === 'home' ? '' : v === 'bg' ? 'Background · ' : 'Création · ') + 'Alias';
    renderView();
    if (moved) {
      window.scrollTo(0, 0);
      const h = $(v === 'home' ? '#home h1' : v === 'bg' ? '#bgPage h2' : '#panel h2');
      if (h) h.focus({ preventScroll: true });
    }
  }
  function route() {
    const v = parseView();
    if (v) showView(v); else if (ui.view === undefined) showView('home');
    if (/^#p=/.test(location.hash)) checkHash();
  }

  /* ---------- démarrage ---------- */
  function init() {
    try { localStorage.setItem(KEY + '.t', '1'); localStorage.removeItem(KEY + '.t'); } catch (e) { storageOK = false; }
    if (storageOK) loadStore();
    setWorld(store.world);
    if (!store.order.length) {
      const c = blank();
      genKeys(c, ORDER);
      c.example = true;
      addChar(c);
      if (storageOK) saveNow();
    }
    setStatus(storageOK ? 'saved' : 'nostore');
    renderTheme();
    route();
  }
  init();
})();
