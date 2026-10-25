/* Alias : le moteur d'histoire.
   Au lieu d'assembler des phrases au hasard, il construit d'abord une chronologie cohérente du personnage à partir de sa fiche
   (naissance, famille, études, métier, relations, événement marquant), puis en tire les textes : l'enfance, le parcours, la vie actuelle
   et chaque partie du background. Les faits (parents, lieu de naissance, années) viennent de la fiche et d'une graine propre au personnage :
   ils ne changent pas d'un texte à l'autre, et ne contredisent jamais ce qui est écrit dans la fiche. */
window.LDV_LIFE = (function () {
  'use strict';
  const D = window.LDV, DATA = window.LDV_LIFE_DATA;
  const NOW = 2026;

  /* ---------- outils ---------- */
  const norm = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').replace(/[’]/g, "'");
  const flat = s => norm(String(s == null ? '' : s).replace(/[|~]/g, ' '));
  const cap = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const lc = s => (s && !/^[A-ZÀ-Ö]{2}/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s || '');
  const join = a => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' et ' + a[a.length - 1]);
  const NUMW = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze'];
  const numw = n => (n >= 0 && n < NUMW.length ? NUMW[n] : String(n));
  const yrs = n => (n === 1 ? 'un an' : n + ' ans');
  const yrsw = n => (n === 1 ? 'un an' : numw(n) + ' ans');
  const de = w => (/^[aeiouyàâéèêîôû]/i.test(w) ? "d'" + w : 'de ' + w);
  const hash = s => { let h = 2166136261 >>> 0; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; };
  function mulberry(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // un tirage reproductible : même graine et même étiquette, mêmes choix
  function makeR(seed, tag) {
    const f = mulberry(hash(seed + '|' + tag));
    const R = {
      f,
      int: (a, b) => a + Math.floor(f() * (b - a + 1)),
      pick: a => a[Math.floor(f() * a.length)],
      chance: p => f() < p,
      wpick: list => { const tot = list.reduce((s, x) => s + x[1], 0); let r = f() * tot; for (let i = 0; i < list.length; i++) { r -= list[i][1]; if (r < 0) return list[i][0]; } return list[list.length - 1][0]; }
    };
    return R;
  }
  const nz = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  // « de {cause} » devient « du départ… », « d'un quartier… », « des années… » selon le groupe nominal
  const cnp = (p, np) => {
    if (/^le /.test(np)) return (p === 'de' ? 'du ' : 'au ') + np.slice(3);
    if (/^les /.test(np)) return (p === 'de' ? 'des ' : 'aux ') + np.slice(4);
    if (p === 'de' && /^un /.test(np)) return "d'un " + np.slice(3);
    if (p === 'de' && /^une /.test(np)) return "d'une " + np.slice(4);
    return p + ' ' + np;
  };
  const fx = (tpl, x) => {
    let t = String(tpl);
    if (x && typeof x.cause === 'string') t = t.replace(/(^|\s)(de|à)\s+\{cause\}/g, (m, sp, p) => sp + cnp(p, x.cause));
    return t.replace(/\{(\w+)\}/g, (m, k) => (k in x ? x[k] : m));
  };
  // espaces propres, majuscule en début de phrase, pas de doublon de ponctuation
  const tidy = s => (typeof s !== 'string' ? '' : s)
    .replace(/\s+/g, ' ').replace(/\s+([,.])/g, '$1')
    .replace(/(^|\s)([Qq])ue (il|ils|elle|elles|on|un|une|en)(?=[\s,.])/g, "$1$2u'$3").replace(/(^|\s)([Dd])e (elle|elles|eux)(?=[\s,.])/g, "$1$2'$3").replace(/(^|\s)([Ss])i (il|ils)(?=\s)/g, "$1$2'$3").replace(/(^|\s)([Dd]|[Qq]u)e ([AEIOUYÉÈÊÀÂÎÔÛ])/g, (m, sp, p, v) => sp + p + "'" + v)
    .replace(/([^\s:]):(\s)/g, '$1 :$2')
    .replace(/([.!?]\s+)([a-zà-ÿ])/g, (m, a, b) => a + b.toUpperCase()).replace(/\.{2,}/g, '.').replace(/,\s*,/g, ',').replace(/^\s*([a-zà-ÿ])/, (m, a) => a.toUpperCase()).trim();
  const strip = s => (D.cityName ? D.cityName(s) : String(s || '').replace(/,\s*[A-Z]{2}$/, ''));
  // « à Davis », « dans le centre de Los Santos », « sur Cayo Perico »
  function at(p) {
    p = String(p || '').trim();
    if (!p) return '';
    if (/^Downtown /.test(p)) return 'dans le centre de ' + p.slice(9);
    if (/^Mount /.test(p)) return 'au pied du ' + p.replace('Mount ', 'mont ');
    if (p === 'Blaine County') return 'dans le Blaine County';
    if (p === 'Cayo Perico') return 'sur Cayo Perico';
    return 'à ' + p;
  }
  const regionOf = v => {
    v = String(v || '');
    const m = v.match(/\(([^)]+)\)$/);
    if (m) return m[1];
    const s = v.match(/,\s*([A-Z]{2})$/);
    return s ? s[1] : v;
  };

  /* ---------- la fiche, vue par le moteur ---------- */
  const ROLE_RE = /^(?:son|sa|ses|leur|ma|mon)\s+(fils|fille|frere|soeur|mere|pere|grand-mere|grand-pere|oncle|tante|cousin|cousine|neveu|niece|mari|epouse|femme|petit ami|petite amie|copain|copine|fiance|fiancee|compagnon|compagne|ex|meilleur ami|meilleure amie|ami|amie|pote|collegue|patron|patronne|associe|associee|voisin|voisine|mentor|parrain|marraine|rival|rivale|ennemi|ennemie|colocataire)\b/;
  function relInfo(r) {
    const note = norm(r.note || ''), lien = norm(r.lien || '');
    const m = note.match(ROLE_RE);
    const role = m ? m[1] : '';
    let kind = 'other';
    if (/^(fils|fille)$/.test(role)) kind = 'kid';
    else if (/^(mari|epouse|femme|petit ami|petite amie|copain|copine|fiance|fiancee|compagnon|compagne)$/.test(role)) kind = 'partner';
    else if (role === 'ex') kind = 'ex';
    else if (/^(frere|soeur)$/.test(role)) kind = 'sib';
    else if (/^(mere|pere|grand-mere|grand-pere|oncle|tante|cousin|cousine|neveu|niece)$/.test(role)) kind = 'fam';
    else if (/^(ami|amie|meilleur ami|meilleure amie|pote)$/.test(role)) kind = 'friend';
    else if (/^(collegue|patron|patronne|associe|associee)$/.test(role)) kind = 'work';
    else if (/^(mentor|parrain|marraine)$/.test(role)) kind = 'mentor';
    else if (/^(rival|rivale)$/.test(role)) kind = 'rival';
    else if (/^(ennemi|ennemie)$/.test(role)) kind = 'enemy';
    else if (/^(voisin|voisine)$/.test(role)) kind = 'neighbor';
    else if (role === 'colocataire') kind = 'roommate';
    else if (/^famille/.test(lien)) kind = 'fam';
    else if (/^partenaire/.test(lien)) kind = 'partner';
    else if (/^ex/.test(lien)) kind = 'ex';
    else if (/^ami/.test(lien)) kind = 'friend';
    else if (/^collegue/.test(lien)) kind = 'work';
    else if (/^mentor/.test(lien)) kind = 'mentor';
    else if (/^rival/.test(lien)) kind = 'rival';
    else if (/^ennemi/.test(lien)) kind = 'enemy';
    else if (/^voisin/.test(lien)) kind = 'neighbor';
    else if (/^colocataire/.test(lien)) kind = 'roommate';
    return { nom: String(r.nom || '').trim(), role, kind, note: String(r.note || '').trim(), raw: r };
  }
  // ce que dit la note d'une relation, en une proposition qui se glisse dans une phrase ({il} : le personnage)
  const NOTE_CLAUSE = [
    [/depuis le lycee/, "qu'{il} connaît depuis le lycée"],
    [/ne se parlent plus|dispute/, "avec qui {il} ne parle plus depuis une dispute"],
    [/chaque semaine/, "qu'{il} voit chaque semaine autour d'un verre"],
    [/dimanche/, "qu'{il} appelle chaque dimanche"],
    [/secret/, "qui est au courant de ses secrets"],
    [/soir de match|bar du coin/, "rencontré{e} un soir de match, au bar du coin"],
    [/lui doit un service/, "qui lui doit un service"],
    [/jalouse/, "qui jalouse discrètement sa réussite"],
    [/garde un oeil/, "qui garde un œil sur {lui}"],
    [/meme immeuble/, "qui habite le même immeuble"]
  ];
  function noteClause(r, x) {
    const n = norm(r.note || '');
    for (const e of NOTE_CLAUSE) if (e[0].test(n)) return fx(e[1], x);
    // une note libre qui parle de la relation à la troisième personne devient une proposition relative
    const raw = String(r.note || '').trim().replace(/[.\s]+$/, '');
    if (!raw || ROLE_RE.test(n) || raw.length > 90) return '';
    if (/^(?:lui |est |a |garde|travaille|jalouse|sert|aide|appelle|connait|habite|vit |ne )/i.test(raw)) return 'qui ' + lc(raw);
    if (/^(?:le |la |l'|un |une |les |des )/i.test(raw)) return lc(raw);
    return '';
  }

  const FAMLAB = { food: ['cuisinier', 'cuisinière'], shop: ['employé de commerce', 'employée de commerce'], beauty: ['coiffeur', 'coiffeuse'], clean: ["agent d'entretien", "agente d'entretien"], drive: ['chauffeur', 'chauffeuse'], logi: ['magasinier', 'magasinière'], pilot: ['pilote', 'pilote'], mecano: ['mécanicien', 'mécanicienne'], build: ['ouvrier du bâtiment', 'ouvrière du bâtiment'], nature: ['agriculteur', 'agricultrice'], nurse: ['infirmier', 'infirmière'], doctor: ['médecin', 'médecin'], social: ['travailleur social', 'travailleuse sociale'], police: ['policier', 'policière'], fire: ['pompier', 'pompier'], army: ['militaire', 'militaire'], security: ['agent de sécurité', 'agente de sécurité'], office: ['employé de bureau', 'employée de bureau'], law: ['avocat', 'avocate'], sales: ['commercial', 'commerciale'], it: ['informaticien', 'informaticienne'], teach: ['enseignant', 'enseignante'], media: ['artiste', 'artiste'], sport: ['entraîneur', 'entraîneuse'], crime: ['débrouillard', 'débrouillarde'], free: ['indépendant', 'indépendante'] };
  const COMMON_FAMS = ['build', 'shop', 'drive', 'office', 'mecano', 'logi', 'food', 'clean', 'nurse', 'teach'];
  const fam = id => DATA.JF.find(f => f.id === id);
  const famOf = text => { const t = flat(text); return DATA.JF.find(f => f.re.test(t)) || null; };

  /* ---------- la chronologie du personnage ---------- */
  function bio(c, disp, form, world) {
    const v = c.v || {}, g = form === 'f' ? 'f' : 'm', gta = world === 'gta';
    const seed = c.seed != null ? c.seed : hash(c.id || v.prenom || 'x');
    const R = makeR(seed, 'facts');
    const age = Math.max(6, Math.min(100, Number(v.age) || 30));
    const b = { v, c, g, gta, world, age, seed, by: NOW - age, disp };
    b.n = disp(v.prenom, g) || 'Le personnage';
    Object.assign(b, g === 'f' ? { il: 'elle', Il: 'Elle', e: 'e', se: 'se', ne: 'ne', ve: 've', lo: 'la', lui: 'elle' } : { il: 'il', Il: 'Il', e: '', se: '', ne: '', ve: '', lo: 'le', lui: 'lui' });
    b.yr = a => NOW - age + a;                        // l'année où le personnage avait l'âge a
    const tk = { n: b.n, prenom: b.n, il: b.il, Il: b.Il, e: b.e, se: b.se, ne: b.ne, ve: b.ve, lo: b.lo, lui: b.lui, qu_il: g === 'f' ? "qu'elle" : "qu'il", s_il: g === 'f' ? 'si elle' : "s'il", ville: strip(v.ville) };
    const list = a => (Array.isArray(a) ? a : []).map(x => fx(disp(x, g), tk)).filter(Boolean);
    b.traits = list(v.traits); b.qualites = list(v.qualites); b.defauts = list(v.defauts); b.peurs = list(v.peurs); b.loisirs = list(v.loisirs);
    b.situation = flat(v.situation);
    b.sit = /^celib/.test(b.situation) ? 'single' : /^marie/.test(b.situation) ? 'married' : /^fiance/.test(b.situation) ? 'engaged' : /^en couple/.test(b.situation) ? 'couple' : /^separe/.test(b.situation) ? 'separated' : /^divorce/.test(b.situation) ? 'divorced' : /^veuf/.test(b.situation) ? 'widowed' : /complique/.test(b.situation) ? 'complicated' : '';
    b.described = new Set((c.described || []));
    // un texte de la fiche est « le sien » (donc intouchable) quand il n'a pas été écrit par ce moteur tel quel
    const lg = c.lg || {};
    const ownOf = k => { const t = nz(v[k]); return t && hash(t) !== lg[k] ? t : ''; };
    b.own = { enfance: ownOf('enfance'), parcours: ownOf('parcours'), actuel: ownOf('actuel') };
    const allText = flat([v.signes, v.manies, v.motivation, v.secret, v.notes, v.enfance, v.parcours, v.actuel].join(' '));

    /* métier et statut */
    const raw = String(v.metier || ''), cut = raw.indexOf('~');
    const base = cut >= 0 ? raw.slice(0, cut) : raw, jt = flat(raw);
    b.job = { raw, label: lc(disp(base, g)), suffix: cut >= 0 ? raw.slice(cut + 1).trim() : '', status: 'ok', fam: null, former: '', studies: '' };
    const J = b.job;
    J.emp = '';
    if (J.suffix) {
      if (/^(?:chez|à|au|aux|pour|dans|sur)(?=\s)/i.test(J.suffix)) J.emp = J.suffix;
      else { J.label = J.label + ' ' + J.suffix; J.suffix = ''; }
    }
    if (age < 18) J.status = 'minor';
    else if (/etudiant|alternant/.test(jt)) { J.status = 'student'; J.studies = ''; }
    else if (/retrait/.test(jt)) J.status = 'retired';
    else if (/sans emploi|reconversion|chomage/.test(jt)) J.status = 'none';
    else if (/petits boulots/.test(jt)) J.status = 'petits';
    else if (/economies/.test(jt)) J.status = 'econ';
    else if (/combines/.test(jt)) { J.status = 'ok'; J.fam = fam('crime'); }
    else if (!raw) J.status = 'unknown';
    if (J.status === 'ok' && !J.fam) J.fam = famOf(raw) || null;
    // retraité : le métier d'avant est dans le parcours ou les notes (« Ancien mécanicien »)
    if (J.status === 'retired') {
      const fm = (String(v.parcours || '') + ' ' + String(v.notes || '')).match(/[Aa]ncien(?:ne)?\s+([^.,;]{3,40})/);
      if (fm) { J.former = lc(fm[1].trim()); J.fam = famOf(fm[1]); }
      if (!J.fam) { J.fam = fam(R.pick(COMMON_FAMS)); }
      if (!J.former) J.former = FAMLAB[J.fam.id][g === 'f' ? 1 : 0];
    }
    // « militaire » comme métier ou comme passé
    b.mil = null;
    const milText = /militaire|soldat|veteran|armee|marine|service militaire|tatouage militaire/.test(allText + ' ' + jt + ' ' + flat(v.signes));
    const evId = (DATA.EVENTS.find(e => e.re.test(norm(v.evenement || ''))) || {}).id || (v.evenement ? 'custom' : '');
    b.evId = evId;

    /* lieux */
    const nowFull = String(v.ville || '');
    const nowCity = strip(nowFull);
    const oi = D.originInfo ? D.originInfo(v.origine) : { kind: 'other' };
    b.oi = oi; b.nowCity = nowCity; b.nowFull = nowFull;
    const places = world === 'gta' ? D.VILLES_GTA : D.VILLES_USA;
    const nowReg = regionOf(nowFull);
    const sameReg = places.filter(x => regionOf(x) === nowReg && x !== nowFull), farReg = places.filter(x => regionOf(x) !== nowReg && !/Cayo Perico/.test(x));
    const place = { birth: '', grew: '', abroad: false, arriveAge: null, nation: null, moved: null };
    const needFar = evId === 'move';
    function hometown() {
      const r = R.f();
      if (!needFar && (r < 0.6 || !farReg.length)) return { name: nowCity, reg: true };
      if (!needFar && r < 0.82 && sameReg.length) return { name: strip(R.pick(sameReg)), reg: true };
      return { name: strip(R.pick(farReg.length ? farReg : [nowFull])), reg: false };
    }
    let home = null;
    if (oi.kind === 'nation') {
      place.nation = oi.nation;
      const abroad = R.chance(age >= 24 ? 0.58 : 0.3);
      if (abroad) {
        place.abroad = true; place.arriveAge = Math.min(age - 1, R.int(5, Math.max(6, Math.min(24, age - 2))));
        home = hometown(); place.birth = oi.nation.loc; place.grew = home.name; place.far = !home.reg;
      } else { home = hometown(); place.birth = home.name; place.grew = home.name; place.far = !home.reg; }
    } else if (oi.kind === 'city') {
      place.birth = strip(R.pick(oi.city.lieux)); place.grew = place.birth;
      place.far = strip(place.grew) !== nowCity && !(oi.city.lieux || []).some(l => strip(l) === nowCity);
    } else { home = hometown(); place.birth = home.name; place.grew = home.name; place.far = !home.reg; }
    // le lieu cité dans l'enfance écrite dans la fiche fait foi
    if (b.own.enfance) {
      const on = norm(b.own.enfance); let best = null, bi = 1e9;
      Array.from(new Set(places.map(strip))).forEach(x => {
        const m = new RegExp('(^|[^a-z])' + norm(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z]|$)').exec(on);
        if (m && m.index < bi) { best = x; bi = m.index; }
      });
      if (best) { place.grew = best; if (!place.abroad) place.birth = best; }
    }
    place.same = strip(place.grew) === nowCity;
    b.place = place;

    /* milieu et famille */
    const logT = flat(v.logement);
    const w = { poor: 22, modest: 38, mid: 30, rich: 10 };
    if (/villa|penthouse|manoir|yacht|vinewood hills|loft|duplex/.test(logT)) { w.rich *= 3; w.poor *= 0.4; }
    if (/mobile home|caravane|motel|sans abri|voiture/.test(logT)) { w.poor *= 1.8; w.rich = 0; }
    if (/precarite|dettes|factures|argent|pauvret/.test(flat(b.peurs.join(' ')))) { w.poor *= 1.8; w.rich *= 0.3; }
    if (J.fam && /law|doctor|pilot|sales/.test(J.fam.id)) { w.mid *= 1.5; w.rich *= 1.6; }
    if (J.fam && /clean|logi|shop|food|crime/.test(J.fam.id)) { w.poor *= 1.4; w.rich *= 0.4; }
    if (J.status === 'petits' || J.status === 'none') w.poor *= 1.4;
    b.cls = R.wpick(Object.keys(w).map(k => [k, w[k]]));
    const fw = { deux: 48, mere: 15, pere: 4, separes: 15, grands: 6, recomposee: 9, accueil: 2 };
    if (/abandon|seul/.test(flat(b.peurs.join(' ')))) { fw.mere *= 1.8; fw.separes *= 1.6; fw.pere *= 2; fw.deux *= 0.7; }
    if (b.cls === 'rich') { fw.accueil = 0; fw.grands *= 0.4; }
    b.fkind = R.wpick(Object.keys(fw).map(k => [k, fw[k]]));
    const pj = (sex) => R.pick(DATA.PARENTS[b.cls][sex]);
    b.pere = { job: pj('m') }; b.mere = { job: pj('f') };
    // un parent dans le même métier : il explique parfois le choix du métier
    b.parentLink = null;
    if (J.fam && J.fam.par && !b.parentLink && R.chance(0.3)) {
      const pk = R.pick(J.fam.par);
      b.parentLink = { who: pk[0], desc: pk[1] };
      if (pk[0] === 'père') b.pere.job = pk[1]; else if (pk[0] === 'mère') b.mere.job = pk[1];
    }
    // « le garage de son père » dans la fiche : le parent tenait bien ce commerce
    const fm = allText.match(/(garage|atelier|boutique|restaurant|ferme|bar|magasin|salon|commerce|entreprise|cabinet|diner|bateau)\s+(?:de|du)\s+(son pere|sa mere|ses parents|son grand-pere|sa grand-mere|son oncle)/);
    if (fm) {
      const who = /sa mere|sa grand-mere/.test(fm[2]) ? 'mère' : 'père', desc = "propriétaire d'un " + (fm[1] === 'garage' ? 'petit garage' : fm[1]);
      b.parentLink = { who, desc };
      if (who === 'père') b.pere.job = desc; else b.mere.job = desc;
      if (b.fkind === 'recomposee' || b.fkind === 'accueil') b.fkind = 'deux';
    }
    const gap = () => R.int(22, 34);
    b.pere.age = age + gap(); b.mere.age = age + R.int(20, 32);
    const dies = (a) => R.chance(Math.max(0, Math.min(0.97, (a - 63) / 28)));
    b.pere.dead = dies(b.pere.age); b.mere.dead = dies(b.mere.age);
    if (b.fkind === 'mere') b.pere.gone = R.int(1, 9);   // le père est parti quand le personnage avait cet âge
    if (b.fkind === 'pere') b.mere.gone = R.int(1, 9);
    b.sepAge = R.int(4, 13);
    const ns = R.wpick([[0, 16], [1, 34], [2, 28], [3, 14], [4, 8]]);
    b.sibs = [];
    for (let i = 0; i < ns; i++) b.sibs.push({ sex: R.chance(0.5) ? 'm' : 'f', older: R.chance(0.5) });
    // les frères et sœurs nommés dans la fiche comptent
    const rels = (c.rel || []).map(relInfo).filter(r => r.nom || r.role);
    b.rels = rels;
    rels.filter(r => r.kind === 'sib').forEach(r => {
      const sex = /soeur/.test(r.role) ? 'f' : 'm';
      if (!b.sibs.some(s => s.sex === sex && !s.named)) b.sibs.push({ sex, older: R.chance(0.5), named: r.nom });
      else b.sibs.find(s => s.sex === sex && !s.named).named = r.nom;
    });
    b.moveAgeFam = R.int(6, 15);

    /* carrière */
    const K = { startAge: null, years: 0, prev: [], teenJob: '', milFrom: null, milTo: null, trainAge: null, endAge: null };
    b.career = K;
    if (J.fam) {
      const jf = J.fam, s0 = R.int(jf.start[0], jf.start[1]);
      K.startAge = Math.max(jf.min, s0);
      if (J.status === 'retired') {
        K.endAge = Math.min(age, R.int(62, 67));
        K.startAge = Math.min(K.startAge, K.endAge - 5);
      } else if (age < K.startAge) K.startAge = Math.max(jf.min > age ? age : jf.min, age - R.int(0, 1));
      const tr = jf.tr || [2, 4];
      K.trainAge = Math.max(16, K.startAge - R.int(tr[0], tr[1]));
      if (/^(food|shop|clean|drive|logi|crime)$/.test(jf.id)) K.trainAge = null;
    }
    // un passé militaire (métier, événement ou signe) ; il précède le métier d'après
    if ((J.fam && J.fam.id === 'army') || evId === 'army' || (milText && /militaire|veteran|ancien/.test(allText + jt))) {
      const from = Math.min(R.int(18, 22), age), years = J.fam && J.fam.id === 'army' && J.status !== 'retired' ? Math.max(0, age - from) : R.int(2, 8);
      b.mil = { from, to: Math.min(age, from + years), years, current: !!(J.fam && J.fam.id === 'army' && J.status === 'ok') };
      K.milFrom = from; K.milTo = b.mil.to;
      if (J.fam && J.fam.id !== 'army' && J.status === 'ok') {
        if (K.trainAge != null) K.trainAge = Math.max(K.trainAge, b.mil.to);
        K.startAge = Math.min(Math.max(K.startAge, (K.trainAge != null ? K.trainAge + 1 : b.mil.to) + R.int(0, 2)), age);
      }
      if (J.fam && J.fam.id === 'army') K.startAge = from;
    }
    // un métier qui n'est pas celui de départ : reconversion
    b.prevFam = null;
    if (evId === 'retrain' && J.fam && J.status === 'ok' && age >= 28) {
      const pf = fam(R.pick(COMMON_FAMS.filter(x => x !== J.fam.id)));
      b.prevFam = pf; K.retrainAge = Math.max(26, Math.min(age - 1, K.startAge + R.int(0, 6) + 4)); K.startAge = K.retrainAge; K.trainAge = Math.max(24, K.startAge - 2);
    }
    if (J.status === 'ok' && K.startAge != null) K.years = Math.max(0, age - K.startAge);
    // petits boulots d'adolescent et premiers emplois
    if (J.fam && J.fam.teen && age >= 16) K.teenJob = R.pick(J.fam.teen);
    K.teenAge = R.int(15, 17);

    /* enfants et couple */
    b.kids = rels.filter(r => r.kind === 'kid').map((r, i) => ({ nom: r.nom, sex: /fille/.test(r.role) ? 'f' : 'm' }));
    if (b.kids.length) {
      let a0 = Math.max(0, age - R.int(21, 31));
      if (age < 22) a0 = Math.max(0, age - 18);
      b.kids.forEach((k, i) => { k.age = Math.max(0, a0 - (b.kids.length - 1 - i) * 0 - (i ? 0 : 0)); });
      // l'aîné d'abord, puis des écarts de un à cinq ans
      let cur = a0;
      b.kids.forEach((k, i) => { k.age = i === 0 ? a0 : Math.max(0, cur = cur - R.int(1, 4)); });
    }
    b.partner = rels.find(r => r.kind === 'partner') || null;
    b.ex = rels.find(r => r.kind === 'ex') || null;
    const yTogether = Math.max(1, Math.min(R.int(1, 18), age - 20));
    b.together = yTogether;
    if (b.kids.length && /married|couple|engaged/.test(b.sit)) b.together = Math.max(b.together, Math.min(Math.max(1, age - 20), b.kids[0].age + R.int(0, 2)));
    b.marriedAge = Math.max(21, age - R.int(1, Math.max(1, yTogether)));
    const eldest = b.kids.length ? b.kids[0].age : null;
    b.divorceAgo = R.int(1, Math.max(1, Math.min(9, age - 24, eldest != null ? Math.max(1, eldest) : 99)));
    b.sepAgo = R.int(1, Math.max(1, Math.min(4, eldest != null ? Math.max(1, eldest) : 99)));
    b.widowAgo = R.int(1, Math.max(1, Math.min(9, age - 24)));

    /* événement marquant */
    const ev = DATA.EVENTS.find(e => e.id === evId);
    b.evt = null;
    if (evId) {
      let lo = ev ? ev.lo : 14, hi = ev ? Math.min(ev.hi, age) : age;
      if (evId === 'fired' || evId === 'failure') lo = Math.max(lo, (K.startAge || 22) + 1);
      if (evId === 'custom' && J.status === 'ok' && K.startAge != null && /dossier|client|patron|collegue|chantier|garde|service|patient|equipe|proces|contrat|commande|hierarchie|promotion|chef|inspection|livraison|cuisine|atelier|moteur|bureau|reunion|patrouille|intervention|operation/.test(norm(v.evenement))) lo = Math.max(lo, Math.min(age, K.startAge + 1));
      if (evId === 'fired' && !(J.status === 'ok' || J.status === 'none' || J.status === 'retired')) hi = -1;
      if (evId === 'failure' && !(J.status === 'ok' || J.status === 'retired')) hi = -1;
      if (evId === 'bankrupt' && !(J.status === 'ok' || J.status === 'none' || J.status === 'petits')) hi = -1;
      if (evId === 'retrain') { lo = K.retrainAge || lo; hi = K.retrainAge || -1; }
      if (evId === 'army') { lo = (b.mil && b.mil.from) || lo; hi = (b.mil && b.mil.from) || hi; }
      if (evId === 'breakup' || evId === 'lonely') lo = Math.max(lo, 19);
      if (evId === 'loss' && b.sit === 'widowed') { lo = Math.max(lo, Math.min(age, 24)); }
      if (b.sit === 'married' && evId === 'breakup') hi = Math.max(lo, Math.min(hi, b.marriedAge - 1));
      let ea;
      if (hi >= lo) ea = R.int(lo, Math.min(hi, age)); else { ea = R.int(Math.min(16, age), age); }
      // un divorce ou une séparation qui est dans la fiche : l'événement est celui-là, à la même date
      if (evId === 'breakup' && hi >= lo && (b.sit === 'divorced' || b.sit === 'separated')) ea = Math.max(lo, Math.min(hi, age - (b.sit === 'divorced' ? b.divorceAgo : b.sepAgo)));
      if (evId === 'loss' && hi >= lo && b.sit === 'widowed') ea = Math.max(lo, Math.min(hi, age - b.widowAgo));
      b.evt = { id: hi >= lo ? evId : 'custom', label: String(v.evenement || ''), age: ea, year: NOW - age + ea };
      if (b.evt.id === 'move') place.moved = { age: ea };
      if (b.evt.id === 'loss') {
        const R3 = makeR(b.seed, 'loss'), wo = [];
        if (b.fkind !== 'mere') wo.push([['son père', 'la mort de son père', 'Sa mort', 'pere'], age >= 25 ? 3 : 1]);
        if (b.fkind !== 'pere') wo.push([['sa mère', 'la mort de sa mère', 'Sa mort', 'mere'], age >= 25 ? 3 : 1]);
        const gp = ea <= 38 ? 3 : 0;
        wo.push([['son grand-père', 'le décès de son grand-père', 'Son décès', ''], gp], [['sa grand-mère', 'le décès de sa grand-mère', 'Son décès', ''], gp], [['un ami proche', "la disparition d'un ami proche", 'Sa disparition', ''], 2]);
        if (b.sit === 'widowed') wo.push([[b.partner ? b.partner.nom : (b.g === 'f' ? 'son mari' : 'sa femme'), 'la mort de ' + (b.partner ? b.partner.nom : (b.g === 'f' ? 'son mari' : 'sa femme')), 'Sa mort', ''], 100]);
        if (b.sibs.length) wo.push([[b.sibs[0].sex === 'f' ? 'sa sœur' : 'son frère', 'la disparition de ' + (b.sibs[0].sex === 'f' ? 'sa sœur' : 'son frère'), 'Sa disparition', ''], 1]);
        const v0 = R3.wpick(wo);
        b.evt.vic = { poss: v0[0], noun: v0[1], sub: v0[2] };
        if (v0[3] === 'pere') b.pere.dead = true;
        if (v0[3] === 'mere') b.mere.dead = true;
      }
    }
    // départ de la ville d'enfance
    if (!place.same) {
      const hasPartner = !!(b.partner || b.ex), hasKids = b.kids.length > 0;
      const wr = [['work', J.status === 'ok' ? 3 : 1], ['study', age < 30 ? 3 : 1], ['fresh', 2], ['family', 2]];
      if (hasPartner) wr.push(['love', 3]);
      if (hasKids && age >= 28) wr.push(['kids', 2]);
      if (b.evt && /breakup|loss|betrayal|lonely/.test(b.evt.id)) wr.push(['escape', 3]);
      if (b.evt && b.evt.id === 'move') { wr.length = 0; wr.push(['fresh', 3], ['work', 2], ['escape', 2]); }
      if (J.status === 'student') { wr.length = 0; wr.push(['study', 1]); }
      if (place.abroad) place.arrived = true;
      const reason = R.wpick(wr);
      let ma;
      if (reason === 'family') ma = b.moveAgeFam; else if (reason === 'study') ma = Math.min(age, R.int(17, 20)); else ma = Math.min(age, Math.max(18, R.int(19, Math.max(20, Math.min(36, age - 1)))));
      if (place.abroad && place.arriveAge != null && place.arriveAge >= ma && reason !== 'family') ma = place.arriveAge;
      if (b.evt && b.evt.id === 'move') ma = b.evt.age;
      if (J.fam && K.trainAge && reason === 'study') ma = Math.min(ma, K.trainAge);
      place.moved = { age: Math.min(ma, age), reason };
    }
    if (place.abroad && place.arriveAge != null && !place.moved) place.moved = { age: place.arriveAge, reason: 'immig' };
    return b;
  }

  /* ---------- circonstances, liens entre la fiche et le passé ---------- */
  function cause(b, key) {
    const R = makeR(b.seed, 'cause:' + key), C = DATA.CAUSES;
    const opts = [];
    if (b.fkind === 'mere' || b.fkind === 'pere') opts.push(R.pick(C.sep), b.cls === 'poor' || b.cls === 'modest' ? C.single[0] : C.singleUp[0]);
    if (b.fkind === 'separes') opts.push(R.pick(C.sep));
    if (b.fkind === 'grands') opts.push(C.grand[0]);
    if (b.cls === 'poor') opts.push(R.pick(C.poor), R.pick(C.poor));
    if (b.cls === 'rich') opts.push(C.rich[0]);
    if (b.place.moved && b.place.moved.age < 16) opts.push(C.moves[0]);
    if (b.sibs.length >= 3) opts.push(C.large[0]);
    if (!b.sibs.length) opts.push(C.only[0]);
    if (b.place.abroad && b.place.arriveAge <= 17) opts.push(C.migrant[0]);
    if (b.gta && /Davis|Rancho|Strawberry|Chamberlain|Bohan|Broker|Little Haiti|Cypress|La Mesa|El Burro/.test(b.place.grew)) opts.push(C.street[0]);
    opts.push(R.pick(C.generic)); if (opts.length < 3) opts.push(R.pick(C.generic), C.quiet[0]);
    return fx(R.pick(opts), { il: b.il, lui: b.lui, x: String(b.sepAge) });
  }
  function toks(b, extra) { return Object.assign({ n: b.n, il: b.il, Il: b.Il, e: b.e, se: b.se, ne: b.ne, ve: b.ve, lo: b.lo, lui: b.lui, prenom: b.n }, extra || {}); }
  // qui a transmis une passion : un proche de la fiche, ou un membre de la famille plausible
  function whoFor(b, key, R) {
    const k = norm(key).split(/[^a-z]+/).filter(w => w.length > 3)[0] || norm(key);
    const hit = b.rels.find(r => r.nom && k && norm(r.note).indexOf(k) >= 0);
    if (hit) return hit.nom;
    const opts = ['un oncle', 'un voisin', 'un cousin', 'un entraîneur', 'un ami de la famille'];
    if (b.fkind !== 'mere' && !b.pere.dead) opts.push('son père', 'son père');
    if (b.fkind !== 'pere') opts.push('sa mère');
    if (b.sibs.some(s => s.older && s.sex === 'm')) opts.push('son grand frère');
    if (b.sibs.some(s => s.older && s.sex === 'f')) opts.push('sa grande sœur');
    if (b.fkind === 'grands') opts.push('son grand-père', 'sa grand-mère');
    return R.pick(opts);
  }
  const ADULT_HOBBY = /casino|poker|parachut|plongee|golf|vinyle|collection|hacking|programmation|vin\b|whisky|cigare|soiree|fete|boite de nuit|bar\b|alcool|clubbing/;
  // lien de la fiche vers le passé : une proposition par élément (trait, peur, passion), toujours rattachée à la même partie du récit
  function linkFor(b, kind, item, idx, mode, opt) {
    const R = makeR(b.seed, 'link:' + kind + ':' + item), t = norm(item);
    let tpl = null, extra = {};
    if (kind === 'trait') { const e = DATA.TRAIT_ORIGINS.find(x => x[0].test(t)); if (e) tpl = e[1][mode]; extra = { cause: cause(b, 'trait:' + item) }; }
    else if (kind === 'fear') {
      const e = DATA.FEAR_ORIGINS.find(x => x[0].test(t));
      extra = { cause: cause(b, 'fear:' + item), x: String(R.int(5, 11)), peur: lc(item) };
      // la peur de perdre ses enfants naît avec eux (ou avec la séparation), pas dans l'enfance
      if (e && e[1].kids && /enfant/.test(t) && b.kids.length) {
        if (mode === 'c') return null;
        const useN = mode === 'n' && opt && opt.now;
        const k = b.kids[0], first = String(k.nom || '').split(' ')[0];
        tpl = useN ? e[1].kidsN : e[1].kids;
        extra.since = /divorced/.test(b.sit) ? 'Depuis le divorce' : /separated/.test(b.sit) ? 'Depuis la séparation' : first ? 'Depuis la naissance de ' + first : 'Depuis la naissance de ' + (b.kids.length > 1 ? 'ses enfants' : 'son enfant');
        extra.kids = b.kids.length > 1 ? 'ses enfants' : first || 'son enfant';
      } else {
        if (e) tpl = e[1][mode];
        if (!tpl && mode === 'n') tpl = "{n} redoute toujours {peur}, et s'organise pour que cela n'arrive pas.";
      }
    }
    else if (kind === 'hobby') {
      const e = DATA.HOBBY_ORIGINS.find(x => x[0].test(t)), d = e ? e[1] : DATA.HOBBY_DEFAULT;
      tpl = d[mode];
      const adult = ADULT_HOBBY.test(t), slotAge = adult ? R.int(19, 32) : d.ag ? R.int(d.ag[0], d.ag[1]) + (idx > 0 ? 1 : 0) : idx === 0 ? R.int(8, 13) : R.int(13, 17);
      const hit = b.rels.find(r => r.nom && norm(r.note).indexOf(norm(item).split(/[^a-z]+/).filter(w => w.length > 3)[0] || '§') >= 0);
      extra = { a: String(Math.min(slotAge, b.age)), who: hit ? hit.nom : d.who ? R.pick(d.who) : whoFor(b, item, R), hobby: lc(item), np: (window.LDV_COH && window.LDV_COH.np ? window.LDV_COH.np(item) : lc(item)) };
    }
    else if (kind === 'sign') { if (/(cicatrice|marque|brulure|tache|tatouage)\s+(?:de|d'|due|causee|laissee|faite)\b|souvenir|suite a |apres un|chute|accident|bagarre|coup de|operation|datant|date de/.test(t)) return null; const e = DATA.SIGN_ORIGINS.find(x => x[0].test(t)); if (e) { tpl = R.pick(e[1]); const ag = e[2] || [6, 16]; extra = { a: String(Math.min(b.age, R.int(ag[0], ag[1]))) }; } }
    if (!tpl) return null;
    return tidy(fx(tpl, toks(b, extra)));
  }
  // âge où une passion a été découverte (le même que dans linkFor)
  function hobbyAge(b, item, idx) {
    const R = makeR(b.seed, 'link:hobby:' + item), t = norm(item);
    const e = DATA.HOBBY_ORIGINS.find(x => x[0].test(t)), d = e ? e[1] : DATA.HOBBY_DEFAULT;
    const adult = ADULT_HOBBY.test(t);
    return Math.min(adult ? R.int(19, 32) : d.ag ? R.int(d.ag[0], d.ag[1]) + (idx > 0 ? 1 : 0) : idx === 0 ? R.int(8, 13) : R.int(13, 17), b.age);
  }
  function mentioned(own, item) {
    if (!own) return false;
    const w = norm(item).split(/[^a-z]+/).filter(x => x.length >= 4);
    const o = norm(own);
    return w.some(x => o.indexOf(x.length > 6 ? x.slice(0, x.length - 2) : x) >= 0);
  }

  /* ---------- événements ---------- */
  const PLACE_DISASTER = ra => ra.pick(['un incendie de forêt qui a menacé le quartier', "une tempête qui a coupé l'électricité pendant des jours", 'une inondation qui a envahi la rue']);
  // ce que le caractère de la fiche fait de l'événement
  const AFTER_TRAIT = [
    [/loyal|fidele|devou|fiable|protecteu/, "Cela a renforcé ce qu'il y a de plus loyal en {lui} : {il} ne laisse plus personne derrière."],
    [/mefian|parano/, "Depuis, {n} fait encore moins confiance aux apparences, et vérifie deux fois avant de croire."],
    [/courageu|brave|resilien/, "Cela a confirmé ce que {n} savait déjà : quand il faut avancer, {il} avance."],
    [/sarcast|cynique|blagueu|drole/, "{n} en a fait une histoire drôle, qu'{il} raconte sans jamais dire ce qu'elle cache."],
    [/anxieu|inquiet|angoiss/, "Depuis, {n} dort moins bien, et prévoit le pire avant chaque rendez-vous."],
    [/solitaire|independan|discret|introvert/, "{n} s'en est sorti{e} seul{e}, comme toujours, sans rien demander à personne."],
    [/ambiti|travailleu|perfection|bourreau/, "{n} s'est jeté{e} dans le travail, comme pour mettre de la distance avec ce qui s'était passé."],
    [/generou|empathi|bienveill|attentionn|a l'ecoute/, "Cela a rendu {n} plus attentif{ve} à ceux qui traversent la même chose en silence."]
  ];
  function evtText(b, R) {
    const e = b.evt, id = e.id, n = b.n, il = b.il, a = e.age, y = e.year, x = toks(b, { a: String(a), y: String(y), place: at(b.nowCity), ville: b.nowCity });
    const biz = ({ food: 'son restaurant', mecano: 'son garage', beauty: 'son salon', shop: 'sa boutique', build: 'son entreprise', drive: 'sa petite société de transport', free: 'son activité', sales: 'son agence', media: 'son studio' }[b.job.fam && b.job.fam.id]) || 'son affaire';
    const partner = b.partner ? b.partner.nom : b.ex ? b.ex.nom : '';
    const friend = (b.rels.find(r => r.kind === 'enemy') || b.rels.find(r => r.kind === 'rival') || b.rels.find(r => r.kind === 'friend') || {}).nom || '';
    const mentor = (b.rels.find(r => r.kind === 'mentor') || {}).nom || '';
    const setup = [], after = [];
    const jobWord = b.job.label || 'son métier';
    if (id === 'move') {
      const reason = (b.place.moved && b.place.moved.reason) || 'fresh';
      const why = { work: "pour un poste qu'on lui proposait", study: 'pour ses études', fresh: 'pour repartir de zéro', family: 'à la suite de sa famille', love: partner ? 'pour suivre ' + partner : "pour quelqu'un qu'il aimait", kids: 'pour se rapprocher des siens', escape: 'pour tourner une page' }[reason];
      const from = b.place.grew && !b.place.same ? ' ' + at(b.place.grew) : '';
      setup.push(`En ${y}, à ${a} ans, ${n} quitte ${b.place.same ? 'sa ville' : b.place.grew}${why ? ', ' + why : ''}. Un coffre plein de cartons, une adresse neuve ${b.nowCity ? 'à ' + b.nowCity : ''} : les premiers mois sont solitaires, puis les lieux deviennent des habitudes.`);
      setup.push(`À ${a} ans, ${n} charge sa voiture et part${from ? ' de' + from.replace(/^ (à|au|aux|en|dans)/, '') : ''}, ${why || 'sans trop savoir ce qui l\'attend'}. Personne ne l'attend à l'arrivée, et c'est peut-être pour cela que tout change.`);
      after.push("Ce départ lui a appris à tout reconstruire, et à ne pas s'attacher trop vite aux endroits.");
    } else if (id === 'breakup') {
      const who = b.ex ? b.ex.nom : partner;
      if (b.sit === 'divorced') {
        setup.push(`En ${y}, à ${a} ans, le divorce${who ? ' d\'avec ' + who : ''} est prononcé. ${n} met du temps à comprendre ce qui s'est brisé, et plus de temps encore à accepter de ne pas avoir toutes les réponses.`);
        setup.push(`À ${a} ans, ${n} signe les papiers du divorce${who ? ' avec ' + who : ''} et se retrouve face à ${b.g === 'f' ? 'elle-même' : 'lui-même'}, avec des cartons à moitié faits et beaucoup de questions.`);
      } else if (b.sit === 'separated') {
        setup.push(`En ${y}, à ${a} ans, ${n} et ${who || 'son ancien partenaire'} se séparent. ${n} met du temps à comprendre ce qui s'est brisé, et plus de temps encore à accepter de ne pas avoir toutes les réponses.`);
        setup.push(`À ${a} ans, la séparation${who ? ' d\'avec ' + who : ''} laisse ${n} face à ${b.g === 'f' ? 'elle-même' : 'lui-même'}, avec des cartons à moitié faits et beaucoup de questions.`);
      } else {
        setup.push(`En ${y}, à ${a} ans, ${who ? 'la relation avec ' + who : 'une relation'} se termine. ${n} met du temps à comprendre ce qui s'est brisé, et plus de temps encore à accepter de ne pas avoir toutes les réponses.`);
        setup.push(`À ${a} ans, ${n} se retrouve face à ${b.g === 'f' ? 'elle-même' : 'lui-même'}, avec des cartons à moitié faits et beaucoup de questions${who ? ' sur ' + who : ''}.`);
      }
      after.push(b.kids.length ? `Depuis, ${n} fait en sorte que ${b.kids.length > 1 ? 'ses enfants' : b.kids[0].nom} ne paient pas la note.` : 'Depuis, ' + n + ' avance plus prudemment, et choisit avec soin à qui donner sa confiance.');
    } else if (id === 'loss') {
      const w = e.vic || { poss: 'un proche', noun: 'la disparition d\'un proche', sub: 'Sa disparition' };
      setup.push(`En ${y}, à ${a} ans, ${n} perd ${w.poss}. ${w.sub} marque un avant et un après : ${n} apprend à porter un deuil que personne ne voit, entre les obligations du quotidien et les silences.`);
      setup.push(`À ${a} ans, ${w.noun} bouleverse tout. ${n} se jette dans le travail et les gestes utiles pour ne pas regarder le vide en face.`);
      after.push("Depuis, " + n + " ne laisse plus une dispute traîner, et prend soin de ceux qui restent.");
    } else if (id === 'success') {
      const jf = b.job.fam && b.job.fam.id;
      const what = jf === 'media' ? 'une commande importante qui attire enfin les regards' : jf === 'sales' ? 'un contrat inespéré qui change la donne' : jf === 'sport' ? 'une victoire que personne n\'attendait' : jf === 'food' ? 'un article élogieux sur sa cuisine' : "une promotion qu'" + il + " n'espérait plus";
      setup.push(`En ${y}, à ${a} ans, ${n} reçoit ${what}. Du jour au lendemain, des portes s'ouvrent, et ${il} doit apprendre à ne pas se perdre en chemin.`);
      setup.push(`À ${a} ans, un coup de chance, et beaucoup de travail avant lui, change tout : ${n} se demande longtemps ${b.g === 'f' ? "si elle le mérite vraiment" : "s'il le mérite vraiment"}.`);
      after.push(`Cette réussite lui a donné confiance, et appris que la chance ne vient qu'à ceux qui sont déjà au travail.`);
    } else if (id === 'betrayal') {
      setup.push(`En ${y}, à ${a} ans, ${friend ? friend + ', en qui ' + il + ' avait toute confiance,' : 'quelqu\'un en qui ' + il + ' avait toute confiance'} le trahit${friend ? '' : ''} au pire moment. ${n} relit longtemps les mois précédents, cherchant les signes qu'${il} n'avait pas voulu voir.`);
      setup.push(`À ${a} ans, ${friend || 'un proche'} lâche ${n} quand ${il} en avait le plus besoin, et laisse une cicatrice qui ne se voit pas.`);
      after.push(`Depuis, ${n} choisit ses amis avec prudence, et ne donne pas sa confiance avant de l'avoir éprouvée.`);
    } else if (id === 'meeting') {
      const who = mentor || partner || '';
      setup.push(`En ${y}, à ${a} ans, ${n} fait la rencontre qui change tout${who ? ' : ' + who : ''}. Cette personne voit en ${b.lui} ce qu'${il} n'osait pas voir, et le pousse à avancer.`);
      setup.push(`Un soir de ${y}, par hasard, ${n} croise quelqu'un qui allait compter plus que prévu${who ? ', ' + who : ''}, et sa vie prend un autre chemin.`);
      after.push(`Depuis, ${n} sait que certaines rencontres valent plus que des années de projets.`);
    } else if (id === 'crash') {
      setup.push(`En ${y}, à ${a} ans, un accident de la route manque de tout arrêter. ${n} en garde des cicatrices, visibles ou non, et une façon bien à ${b.lui} de regarder la route.`);
      setup.push(`À ${a} ans, quelques secondes sur une route de nuit suffisent pour que tout bascule, et ${n} ne prend plus la vie pour acquise.`);
      after.push(`Depuis ${y}, ${n} conduit autrement, et ne monte plus à bord sans avoir bouclé sa ceinture, ni rappelé aux autres de le faire.`);
    } else if (id === 'army') {
      const m = b.mil || { from: a, years: 4, to: a + 4 };
      setup.push(`À ${m.from} ans, en ${b.yr(m.from)}, ${n} s'engage dans l'armée. Pendant ${numw(Math.max(1, m.years))} ans, ${il} apprend la discipline, le sens du groupe et ce qu'on ne raconte pas à ceux qui n'y étaient pas.`);
      setup.push(`En ${b.yr(m.from)}, ${n} signe son engagement. ${cap(il)} en sort à ${m.to} ans avec un autre rapport à la peur, aux ordres et à la loyauté.`);
      after.push(`Le retour à la vie civile a été plus difficile que le départ, et ${n} cherche encore par moments sa place entre deux mondes.`);
    } else if (id === 'failure') {
      setup.push(`En ${y}, à ${a} ans, un échec professionnel brise une trajectoire qui semblait toute tracée. ${n} doit tout reconstruire, humblement, en reprenant à la base.`);
      setup.push(`À ${a} ans, le projet dans lequel ${il} avait tout investi s'effondre. ${n} en garde de l'humilité, et un peu de rancœur.`);
      after.push(`Depuis, ${n} mesure ses promesses, et se méfie de ceux qui en font trop.`);
    } else if (id === 'inherit') {
      const from = b.age >= 40 ? 'un de ses parents' : 'un grand-oncle';
      setup.push(`En ${y}, à ${a} ans, ${n} reçoit un héritage inattendu : celui de ${from}. Ce n'est pas une fortune, mais assez pour ouvrir des possibilités, et des questions de famille que personne n'avait envie de poser.`);
      setup.push(`À la mort de ${from}, en ${y}, ${n} découvre qu'on lui a laissé bien plus qu'${il} ne l'imaginait : un peu d'argent, et surtout des histoires de famille à démêler.`);
      after.push(`Depuis, ${n} fait attention à ce qu'${il} dépense, et à ce qu'${il} en dit.`);
    } else if (id === 'fired') {
      setup.push(`En ${y}, à ${a} ans, un licenciement brutal remet tout en question. ${n} découvre à quel point son identité dépendait de son travail, et ce que l'on devient quand on n'a plus de badge.`);
      setup.push(`À ${a} ans, le jour où on le convoque dans un bureau sans fenêtre, ${n} comprend que quelque chose se termine. Il faut des mois pour se relever.`);
      after.push(`Depuis, ${n} garde toujours un plan B, et ne dépend plus d'un seul employeur.`);
    } else if (id === 'bankrupt') {
      setup.push(`En ${y}, à ${a} ans, ${biz} fait faillite. L'argent, les certitudes et une part de fierté partent avec. ${n} apprend à demander de l'aide, ce qui n'a jamais été son fort.`);
      setup.push(`À ${a} ans, les dettes s'accumulent plus vite que les solutions. ${n} perd beaucoup, mais garde ceux qui sont restés.`);
      after.push(`Depuis, ${n} regarde chaque facture en face, et n'investit plus un dollar qu'${il} n'a pas.`);
    } else if (id === 'lonely') {
      setup.push(`À ${a} ans, en ${y}, une longue période de solitude s'installe. Les jours se ressemblent, les messages se font rares, et ${n} apprend à vivre avec le silence.`);
      setup.push(`Pendant des mois, à ${a} ans, ${n} se sent invisible. C'est dans ce vide qu'${il} découvre ce qui compte vraiment.`);
      after.push(`Depuis, ${n} ne tient plus les liens pour acquis, et prend des nouvelles avant qu'on ne les lui demande.`);
    } else if (id === 'disaster') {
      const what = b.gta ? (regionOf(b.nowFull) === 'Vice City' ? 'un ouragan' : regionOf(b.nowFull) === 'Liberty City' ? 'une tempête de neige qui a paralysé la ville' : regionOf(b.nowFull) === 'Los Santos' ? 'les incendies qui ont ravagé les collines' : 'une tempête de poussière qui a duré des jours') : (/FL|LA|TX/.test(regionOf(b.nowFull)) ? 'un ouragan' : /OK|KS|MO|IN|OH/.test(regionOf(b.nowFull)) ? 'une tornade' : /CA/.test(regionOf(b.nowFull)) ? 'un incendie de forêt' : 'une tempête de neige');
      setup.push(`En ${y}, à ${a} ans, ${what} bouleverse la région de ${n}. ${cap(il)} voit des voisins tout perdre et comprend que la solidarité tient parfois à un sac de provisions partagé.`);
      setup.push(`Quand ${what} frappe, en ${y}, ${n} a ${a} ans. Rien n'est plus pareil après, et ${il} en garde un sens aigu de l'urgence et de ce qui vaut la peine d'être sauvé.`);
      after.push(`Depuis, ${n} garde toujours un sac prêt près de la porte, et un œil sur la météo.`);
    } else if (id === 'retrain') {
      const was = b.prevFam ? FAMLAB[b.prevFam.id][b.g === 'f' ? 1 : 0] : 'son ancien métier';
      setup.push(`En ${y}, à ${a} ans, ${n} quitte ${b.prevFam ? 'son poste de ' + was : 'son ancien métier'} pour devenir ${jobWord}. Le changement est rude, au risque de passer pour un fou aux yeux de l'entourage, mais ${il} ne reviendrait pas en arrière.`);
      setup.push(`Un matin de ${y}, ${n} décide qu'${il} ne fera plus ${b.prevFam ? 'ce métier de ' + was : 'le même métier'}. À ${a} ans, ${il} repart de zéro : formations du soir, économies qui fondent, et la certitude de ne plus avoir le choix.`);
      after.push(`Depuis, ${n} sait qu'on peut changer de vie, et que la peur de se tromper est pire que l'erreur.`);
    } else if (id === 'illness') {
      const own = a >= 14 ? R.chance(0.6) : false;
      setup.push(own ? `En ${y}, à ${a} ans, une maladie impose à ${n} de longs mois à l'hôpital. Il en sort changé, avec une force tranquille qu'${il} ne se connaissait pas.` : `En ${y}, à ${a} ans, ${n} accompagne un proche très malade, de l'hôpital au domicile. Il en garde une patience et un regard neufs sur ce que valent les jours ordinaires.`);
      setup.push(`À ${a} ans, ${n} traverse une maladie et en revient transformé${b.e} : ${il} ne supporte plus ceux qui gaspillent les jours ordinaires.`);
      after.push(`Depuis, ${n} ne remet plus à plus tard les choses qui comptent.`);
    } else {
      const label = lc(e.label).replace(/^(une?|le|la|les|l')\s*/, '');
      setup.push(`En ${y}, à ${a} ans, ${n} traverse un moment qui change la suite : ${lc(e.label)}. ${cap(il)} ne mesure pas tout de suite ce qui bascule, mais en quelques mois, plus rien n'est comme avant.`);
      setup.push(`À ${a} ans, ${lc(e.label)} oblige ${n} à choisir une direction. Ce choix définit la suite, pour le meilleur et pour le pire.`);
      after.push(`Depuis, ${n} regarde cette période comme celle où ${il} est devenu${b.e} ${b.g === 'f' ? 'celle' : 'celui'} qu'${il} est aujourd'hui.`);
    }
    const tr = AFTER_TRAIT.find(x => b.traits.concat(b.qualites).some(t => x[0].test(norm(t))));
    if (tr) after.push(fx(tr[1], toks(b, {})).replace(/attentifve/, b.g === 'f' ? 'attentive' : 'attentif'));
    return { setup, after };
  }

  /* ---------- la vie en phrases ---------- */
  function sibsPhrase(b) {
    const s = b.sibs;
    if (!s.length) return '';
    const mk = (list, old) => {
      const m = list.filter(x => x.sex === 'm').length, f = list.filter(x => x.sex === 'f').length, out = [];
      if (m) out.push(m === 1 ? 'un ' + (old ? 'grand' : 'petit') + ' frère' : numw(m) + ' ' + (old ? 'grands' : 'petits') + ' frères');
      if (f) out.push(f === 1 ? 'une ' + (old ? 'grande' : 'petite') + ' sœur' : numw(f) + ' ' + (old ? 'grandes' : 'petites') + ' sœurs');
      return out;
    };
    const parts = mk(s.filter(x => x.older), true).concat(mk(s.filter(x => !x.older), false));
    return join(parts);
  }
  function rankPhrase(b) {
    const s = b.sibs;
    if (!s.length) return 'enfant unique';
    const older = s.filter(x => x.older).length, younger = s.length - older;
    if (!older) return b.g === 'f' ? 'aînée de ' + numw(s.length + 1) + ' enfants' : 'aîné de ' + numw(s.length + 1) + ' enfants';
    if (!younger) return b.g === 'f' ? 'la cadette de ' + numw(s.length + 1) + ' enfants' : 'le cadet de ' + numw(s.length + 1) + ' enfants';
    return 'au milieu de ' + numw(s.length + 1) + ' enfants';
  }
  const CLASS_LINE = {
    poor: ["À la maison, on comptait chaque dollar, et les fins de mois commençaient le vingt.", "L'argent manquait toujours un peu, et {n} a appris très tôt à ne rien demander.", "Les factures s'empilaient sur le frigo, et {n} savait à six ans quels repas ne se refaisaient pas."],
    modest: ["Sans luxe mais sans manque, la maison tournait au rythme des horaires de chacun et du repas du dimanche.", "Les vacances se passaient chez la famille, et les cadeaux de Noël se choisissaient avec soin.", "On ne roulait pas sur l'or, mais on ne comptait pas non plus chaque cent : on faisait attention, simplement."],
    mid: ["La maison était confortable, les activités du mercredi et les vacances au lac rythmaient l'année.", "Les parents tenaient à ce que les enfants ne manquent de rien, et à ce qu'ils s'en souviennent.", "L'enfance de {n} s'est déroulée dans un cadre stable, avec des attentes claires et des dîners en famille."],
    rich: ["Une grande maison, des vacances à l'étranger et l'attente tacite d'être à la hauteur du nom.", "L'argent n'a jamais manqué chez {n}, mais le temps des parents, souvent.", "Chez {n}, tout se réglait par des services, des cartes de visite et de bonnes manières."]
  };
  function parentsLine(b, R) {
    const n = b.n, p = b.pere.job, m = b.mere.job, x = toks(b, { x: String(b.sepAge), pj: p, mj: m });
    switch (b.fkind) {
      case 'mere': return fx(R.pick(["{n} est élevé{e} par sa mère, {mj}, qui cumule parfois deux emplois pour tenir la maison ; son père est parti quand {il} avait {x} ans.", "Sa mère, {mj}, élève seule la famille depuis le départ du père, quand {n} avait {x} ans."]), x);
      case 'pere': return fx("Son père, {pj}, élève seul la famille depuis le départ de sa mère, quand {n} avait {x} ans.", x);
      case 'separes': return fx(R.pick(["Ses parents se séparent quand {n} a {x} ans : son père, {pj}, part vivre de son côté, sa mère, {mj}, garde la maison, et {n} navigue longtemps entre les deux.", "Ses parents divorcent quand {n} a {x} ans : son père est {pj}, sa mère {mj}, et la maison se coupe en deux."]), x);
      case 'grands': return fx("{n} est élevé{e} en grande partie par ses grands-parents : son père, {pj}, et sa mère, {mj}, travaillent trop pour s'en occuper.", x);
      case 'recomposee': return fx("Sa mère, {mj}, se remarie quand {n} a {x} ans, et {il} se retrouve avec un beau-père, {pj}, et une maison à partager.", x);
      case 'accueil': return fx("{n} passe une partie de son enfance en famille d'accueil, avant de retrouver les siens à {x} ans.", x);
      default: return fx(R.pick(["Son père est {pj} et sa mère {mj} : des journées longues, mais jamais un repas sauté.", "Son père, {pj}, et sa mère, {mj}, se partagent les horaires et se retrouvent le soir autour de la table.", "Son père, {pj}, et sa mère, {mj}, travaillent tous deux, et {n} grandit entre le bruit de la cuisine et celui de la télévision."]), x);
    }
  }

  const MEMORY = {
    work: ["Le jour de sa première vraie responsabilité, {n} a eu si peur de se tromper qu'{il} a tout vérifié trois fois, et c'est devenu une habitude.", "{n} se souvient de son premier patron, qui ne disait jamais « bien » mais n'a jamais laissé tomber {lui}.", "Il a fallu presque un an à {n} pour se faire accepter par l'équipe, et {il} a failli tout quitter avant d'y arriver.", "Une erreur de débutant, dont {n} rit aujourd'hui, a failli lui coûter son poste.", "{n} garde le souvenir d'un collègue plus âgé qui lui a tout appris sans jamais en tirer de gloire.", "Les débuts ont été durs : {n} rentrait fourbu{e}, sans être sûr{e} de tenir plus d'un an."],
    student: ["Un professeur a remarqué {n} dès la première année, et lui a proposé un projet qu'{il} n'aurait jamais osé demander.", "{n} a failli abandonner au premier semestre, avant de comprendre qu'{il} n'était pas seul{e} dans ce cas.", "Les nuits de révisions et le café du matin sont devenus un rituel dont {n} se passerait volontiers."],
    precaire: ["Le plus long contrat de {n} a duré quatre mois, dans un entrepôt, et c'est celui dont {il} parle avec le plus de fierté.", "{n} a appris à tenir un mois entier avec ce qu'il y a dans les placards, et à ne rien dire à personne.", "Plusieurs fois, {n} a cru décrocher quelque chose de stable, et plusieurs fois, la porte s'est refermée."],
    retired: ["Au départ de {n}, l'équipe lui a offert une montre gravée, qu'{il} porte encore.", "{n} garde dans un tiroir les cartes de ceux qui lui ont écrit le jour de son départ."]
  };
  // les sujets déjà traités par un texte écrit dans la fiche : le moteur ne les redit pas (et ne les contredit pas)
  function covered(text) {
    const t = norm(text), f = {};
    if (!t) return f;
    f.birth = /(?:^|\s)nee?\s|(?:^|\s)nait\s|naiss|voit le jour/.test(t);
    f.family = /pere|mere|parents|famille|grands?-parents|eleve par|orphelin/.test(t);
    f.sibs = /frere|soeur|fratrie|enfant unique|\baine|cadet|benjamin|nombreu/.test(t);
    f.class = /pauvre|pauvrete|argent|dollar|fins de mois|riche|aise|modeste|factures|comptait|luxe/.test(t);
    f.place = /grandi|enfance (?:a|au|en|dans)|originaire|(?:ville|quartier|village) (?:de|d')/.test(t);
    f.moved = /demenag|quitt|s'installe|emigr|immigr|arrive (?:a|en|aux)/.test(t);
    f.train = /ecole|etude|diplom|formation|apprenti|alternance|universit|academie|\bfac\b|lycee|cursus|concours|stage/.test(t);
    f.entry = /premier (?:emploi|poste|boulot|contrat|job)|embauch|recrute|debut(?:e|es)? (?:comme|dans|chez)/.test(t);
    f.mil = /armee|militaire|engage|soldat|marine|deploiement|sous l'uniforme/.test(t);
    f.now = /depuis \d+ ans|depuis (?:le|l'|20|19)|actuellement|exerce|travaille comme|est (?:devenu|devenue)/.test(t);
    f.status = /petits boulots|sans emploi|retrait|etudiant|chomage|reconversion|freelance/.test(t);
    f.home = /(?:^|\s)(?:vit|habite|loge)\s|installe|appartement|maison|studio|colocation|caravane|loft/.test(t);
    f.couple = /marie|couple|celibat|divorc|separe|veuf|fiance|compagn|epou|\bfemme\b|\bmari\b|petit ami|petite amie/.test(t);
    f.kids = /enfants?|\bfils\b|\bfille\b|bebe/.test(t);
    f.daily = /journee|matin|chaque (?:jour|semaine)|quotidien|routine/.test(t);
    return f;
  }
  // « Simone ... Simone ... Simone » : une phrase sur deux reprend le sujet par « il » ou « elle »
  function varyNames(list, b) {
    const pre = b.n + ' ';
    let prev = 'other';
    return list.map(p => {
      let t = p.t;
      if (t.indexOf(pre) === 0) {
        if (prev === 'name') { t = b.Il + ' ' + t.slice(pre.length); prev = 'pron'; } else prev = 'name';
      } else prev = /^(?:Il|Elle) /.test(t) ? 'pron' : 'other';
      return t === p.t ? p : { k: p.k, t };
    });
  }
  // les phrases de chaque partie du récit : { k : rôle de la phrase, t : texte }
  const first = s => String(s || '').trim().split(/\s+/)[0];
  function schoolPlace(b) { const g = b.place.grew; return g && !b.place.abroad && !/^Downtown/.test(g) ? ' ' + de(g) : ''; }
  function kidsLine(b, R) {
    const kids = b.kids; if (!kids.length) return '';
    const il = b.il, Il = b.Il, one = kids.length === 1;
    const label = k => (first(k.nom) || (k.sex === 'f' ? 'sa fille' : 'son fils')) + ' (' + k.age + ' ' + (k.age > 1 ? 'ans' : 'an') + ')';
    const kt = join(kids.map(label));
    const grown = kids.every(k => k.age >= 18);
    const head = one ? (kids[0].sex === 'f' ? 'Sa fille' : 'Son fils') : 'Ses enfants';
    if (grown) return `${head}, ${kt}, ${one ? 'est' : 'sont'} ${one ? (kids[0].sex === 'f' ? 'grande' : 'grand') : 'grands'} maintenant, et ${one ? 'prend' : 'prennent'} peu à peu ${one ? 'son' : 'leur'} envol.`;
    let s = `${head}, ${kt}, ${one ? 'compte' : 'comptent'} plus que tout.`;
    const pron = one ? (kids[0].sex === 'f' ? 'la' : 'le') : 'les';
    if (/divorced|separated/.test(b.sit)) s += ` ${Il} ${pron} voit ${R.pick(['un week-end sur deux', 'tous les mercredis et un week-end sur deux', 'une semaine sur deux'])}.`;
    else if (!/married|couple|engaged/.test(b.sit)) s += ` ${Il} ${one ? "l'élève" : 'les élève'} ${R.pick(['presque seul' + b.e, "avec l'aide de ses proches"])}.`;
    return s;
  }
  function parts(b, R) {
    const V = b.v, n = b.n, il = b.il, Il = b.Il, J = b.job, K = b.career, own = b.own;
    const out = { origines: [], jeunesse: [], parcours: [], tournant: [], aujourdhui: [], secret: [] };
    const cv = { e: covered(own.enfance), p: covered(own.parcours), a: covered(own.actuel) };
    const GATE = {
      origines: [{ birth: 'birth', sibs: 'sibs', family: 'family', plink: 'family', class: 'class', moved: 'moved', place: 'place', herit: 'place' }, cv.e],
      parcours: [{ train: 'train', prev: 'train', entry: 'entry', mil: 'mil', now: 'now', status: 'status', early: 'entry', job: 'train' }, cv.p],
      aujourdhui: [{ home: 'home', place: 'home', couple: 'couple', kids: 'kids', daily: 'daily' }, cv.a]
    };
    const ownAll = norm([own.enfance, own.parcours, own.actuel].join(' '));
    const P = (sec, k, t) => { const g = GATE[sec]; if (g && g[0][k] && g[1][g[0][k]]) return; t = tidy(t); if (!t) return; if (ownAll && ownAll.indexOf(norm(t)) >= 0) return; out[sec].push({ k, t }); };
    const BGD = (window.LDV_BG && window.LDV_BG.DATA) || {};
    const x0 = toks(b, { ville: b.nowCity });
    const yearTxt = R.pick(['en ' + b.by, 'en ' + b.by, 'vers ' + b.by]);
    const moved = b.place.moved;
    const mot = V.motivation && String(V.motivation).trim().length > 8 ? lc(String(V.motivation).trim().replace(/[.\s]+$/, '')) : '';
    const emp = J.emp ? ' ' + J.emp : '';

    /* --- origines --- */
    {
      if (b.place.abroad) {
        P('origines', 'birth', `${n} est né${b.e} ${yearTxt} ${b.place.birth}, ${b.sibs.length ? rankPhrase(b) : 'enfant unique'}.`);
        if (b.place.arriveAge >= 18) P('origines', 'moved', `À ${b.place.arriveAge} ans, ${n} quitte son pays natal et s'installe ${at(b.place.grew)}, ${R.pick(["pour tenter sa chance", "pour rejoindre un oncle déjà installé là-bas", "pour fuir des années difficiles", "pour un travail qu'on lui promettait"])}. ${Il} y apprend l'anglais sur le tas, en copiant les autres et en riant de ses propres erreurs.`);
        else P('origines', 'moved', `À ${b.place.arriveAge} ans, la famille quitte son pays natal et s'installe ${at(b.place.grew)}, ${R.pick(["pour offrir une meilleure vie aux enfants", "pour rejoindre un oncle déjà installé là-bas", "pour fuir des années difficiles"])}. ${n} y apprend l'anglais à l'école, en copiant les autres et en riant de ses propres erreurs.`);
      } else {
        P('origines', 'birth', R.pick([`${n} est né${b.e} ${yearTxt} ${at(b.place.birth)}, ${b.sibs.length ? rankPhrase(b) : 'enfant unique'}.`, `${n} voit le jour ${yearTxt} ${at(b.place.birth)}, ${b.sibs.length ? rankPhrase(b) : 'enfant unique'}.`, `${cap(yearTxt)}, ${n} naît ${at(b.place.birth)}, ${b.sibs.length ? rankPhrase(b) : 'enfant unique'}.`]));
        if (b.sibs.length && R.chance(0.6)) P('origines', 'sibs', `${Il} grandit avec ${sibsPhrase(b)}.`);
      }
      P('origines', 'family', parentsLine(b, R));
      if (b.parentLink) {
        const w = b.parentLink.who === 'mère' ? 'sa mère' : b.parentLink.who === 'père' ? 'son père' : 'son ' + b.parentLink.who;
        P('origines', 'plink', R.pick([`${cap(w)} est la première personne à lui avoir montré le métier qui deviendra le sien${J.fam ? '' : ''}.`, `C'est auprès de ${w} que ${n} découvre, tout jeune, ce qui deviendra son métier.`]));
      }
      P('origines', 'class', fx(R.pick(CLASS_LINE[b.cls]), x0));
      if (moved && moved.reason === 'family') P('origines', 'moved', `À ${moved.age} ans, la famille s'installe ${at(b.nowCity)}, pour le travail d'un des parents. ${n} laisse derrière ${b.lui} ${b.place.grew ? 'ses amis de ' + b.place.grew : "ses amis d'enfance"} et doit tout recommencer.`);
      const lieu = BGD.LIEUX && BGD.LIEUX[b.place.grew];
      if (b.gta && lieu && R.chance(0.7)) P('origines', 'place', lieu);
      else if (b.oi.kind === 'nation' && !b.place.abroad && BGD.NATION_HERIT && R.chance(0.7)) P('origines', 'herit', fx(R.pick(BGD.NATION_HERIT).replace('{loc}', b.oi.nation.loc), x0));
      else if (b.oi.kind === 'city' && BGD.CITY_HERIT && BGD.CITY_HERIT[b.oi.city.v]) { const t = fx(BGD.CITY_HERIT[b.oi.city.v], x0); if (!(b.place.grew && t.indexOf(b.place.grew) >= 0 && lieu)) P('origines', 'herit', t); }
      else if (b.oi.kind !== 'nation' && b.oi.kind !== 'city' && BGD.HERITAGE && BGD.HERITAGE[V.herit] && R.chance(0.55)) P('origines', 'herit', BGD.HERITAGE[V.herit]);
    }
    // liens de la fiche : première passion, premier trait, première peur
    const hobs = b.loisirs.slice(0, 2).map((h, i) => ({ h, i, a: hobbyAge(b, h, i) })).filter(x => !ADULT_HOBBY.test(norm(x.h)));
    hobs.filter(x => x.a <= 12 && !mentioned(own.enfance, x.h)).slice(0, 1).forEach(x => P('origines', 'hobby', linkFor(b, 'hobby', x.h, x.i, 'c')));
    if (b.traits[0] && !mentioned(own.enfance, b.traits[0])) P('origines', 'trait', linkFor(b, 'trait', b.traits[0], 0, 'c'));
    if (b.peurs[0] && !mentioned(own.enfance, b.peurs[0])) P('origines', 'fear', linkFor(b, 'fear', b.peurs[0], 0, 'c'));

    /* --- jeunesse --- */
    const T = norm(b.traits.concat(b.qualites).concat(b.defauts).join(' '));
    const lyc = schoolPlace(b);
    const school = /studieu|perfection|travailleu|methodiq|ambiti|bourreau|persever|organis/.test(T) ? ["{n} est un{e} élève appliqué{e} : au lycée" + lyc + ", {il} rend ses devoirs avant la date et se fait remarquer pour sa constance.", "Au lycée" + lyc + ", {n} travaille plus que les autres et décroche de bonnes notes, parfois au prix de sa tranquillité."]
      : /fetard|impulsi|spontane|rebel|bagarr|colerique|aventurie/.test(T) ? ["Au lycée" + lyc + ", {n} fait la fête le week-end et rattrape ses devoirs le dimanche soir, quand {il} les fait.", "Élève dissipé{e}, {n} est plus souvent dans le couloir que dans la classe, et collectionne les avertissements."]
        : /timide|discret|introvert|reserv|anxieu/.test(T) ? ["{n} traverse le lycée" + lyc + " en discrétion, le dernier rang pour domicile et quelques amis fidèles pour toute compagnie.", "Au lycée" + lyc + ", {n} passe presque inaperçu{e}, ce qui lui convient très bien."]
          : ["Au lycée" + lyc + ", {n} se contente de ce qu'il faut pour passer, sans jamais être le centre de l'attention.", "{n} traverse le lycée" + lyc + " sans éclat ni drame, entre un groupe d'amis, des matchs du vendredi soir et des trajets sans destination."];
    P('jeunesse', 'school', fx(R.pick(school), x0));
    const fr = b.rels.find(r => (r.kind === 'friend' || r.kind === 'rival' || r.kind === 'enemy') && /lycee|enfance|depuis toujours|longue date|d'enfance|grandi/.test(norm(r.note)));
    if (fr && fr.nom) { const nc = noteClause(fr.raw, x0); P('jeunesse', 'friend', R.pick([`C'est à cette époque que ${n} s'attache à ${fr.nom}${nc ? ', ' + nc : ''}.`, `${fr.nom}${nc ? ', ' + nc + ',' : ''} fait partie de ces années-là.`])); }
    hobs.filter(x => x.a > 12).slice(0, 1).forEach(x => P('jeunesse', 'hobby', linkFor(b, 'hobby', x.h, x.i, 'c')));
    if (b.traits[1]) P('jeunesse', 'trait', linkFor(b, 'trait', b.traits[1], 1, 'c'));
    if (b.defauts[0]) P('jeunesse', 'defect', linkFor(b, 'trait', b.defauts[0], 0, 'c'));
    const sg = V.signes ? linkFor(b, 'sign', V.signes, 0, 'c') : null;
    if (sg) P('jeunesse', 'sign', `${cap(String(V.signes).trim().replace(/[.\s]+$/, ''))}. ${sg}`);
    if (J.status === 'student' && !J.studies) J.studies = lc(J.label).replace(/^(?:étudiant|étudiante|alternant|alternante)\s*(?:en\s+)?/i, '').trim();
    if (J.status === 'minor') {
      P('jeunesse', 'now', `${n} est au lycée et ${R.pick(["jongle entre les cours et ses amis", "ne pense déjà qu'à ce qui vient après", "prend l'école plus ou moins au sérieux, selon les jours"])}.`);
    } else {
      if (K.teenJob && J.status !== 'student') P('jeunesse', 'teenjob', `À ${K.teenAge} ans, ${n} ${K.teenJob}, ${R.pick(["pour gagner son argent de poche", "pour participer aux dépenses de la maison", "pour mettre un peu d'argent de côté"])}.`);
      if (J.status === 'student') P('jeunesse', 'orient', `À ${Math.min(18, b.age)} ans, ${n} choisit de poursuivre ses études${J.studies ? ' en ' + J.studies.replace(/ à .*$/, '') : ''}, ${b.cls === 'poor' ? "malgré un budget serré qu'" + il + " compense par des jobs" : R.pick(["avec le soutien de ses proches", "avec l'envie d'aller plus loin que ses parents"])}.`);
      else if (J.fam && J.status !== 'none' && J.fam.why && !(b.mil && J.fam.id === 'army')) P('jeunesse', 'orient', `À ${Math.max(16, K.trainAge ? Math.min(K.trainAge, 18) : 17)} ans, ${n} sait déjà ce qu'${il} veut faire : devenir ${J.status === 'retired' ? J.former : J.label}, ${fx(R.pick(J.fam.why), x0)}.`);
    }

    /* --- parcours --- */
    const status = () => {
      if (J.status === 'minor') return `${n} est ${b.g === 'f' ? 'lycéenne' : 'lycéen'}, en ${['première', 'deuxième', 'troisième', 'dernière'][Math.max(0, Math.min(3, b.age - 14))]} année de lycée, et ${R.pick(['prend les cours plus ou moins au sérieux, selon les jours', 'pense déjà à ce qui vient après', 'partage son temps entre les cours, les amis et les devoirs'])}.`;
      if (J.status === 'student') return `${n} est aujourd'hui ${J.label}${emp}, en ${['première', 'deuxième', 'troisième', 'quatrième', 'cinquième'][Math.max(0, Math.min(4, b.age - 18))]} année, et jongle entre les cours, un job d'appoint et un budget serré.`;
      if (J.status === 'retired') return `Après ${Math.max(5, (K.endAge || 62) - (K.startAge || 20))} ans comme ${J.former}, ${n} prend sa retraite en ${b.yr(K.endAge || 62)} et goûte un rythme plus lent.`;
      if (J.status === 'none') return `${n} est sans emploi pour le moment${b.evt && b.evt.id === 'fired' ? ', depuis son licenciement' : ''}, et cherche une nouvelle direction.`;
      if (J.status === 'petits') return `${n} enchaîne les petits boulots, au gré des annonces et des coups de fil, sans jamais savoir de quoi sera fait le mois suivant.`;
      if (J.status === 'econ') return `${n} vit de ses économies, et ${il} sait qu'elles ne dureront pas.`;
      return '';
    };
    {
      if (J.fam && J.status !== 'student' && J.status !== 'minor') {
        const jf = J.fam, trainA = String(K.trainAge || K.startAge || 18);
        if (b.prevFam) P('parcours', 'prev', `${n} commence comme ${FAMLAB[b.prevFam.id][b.g === 'f' ? 1 : 0]}, et le reste jusqu'à ses ${K.retrainAge} ans.`);
        if (b.mil && jf.id !== 'army') P('parcours', 'mil', `À ${b.mil.from} ans, en ${b.yr(b.mil.from)}, ${n} s'engage dans l'armée pour ${numw(Math.max(1, b.mil.years))} ans : discipline, déploiements, camarades qui deviennent des frères. ${Il} retrouve la vie civile à ${b.mil.to} ans.`);
        if (jf.school && K.trainAge && !(b.mil && jf.id === 'army')) P('parcours', 'train', fx(R.pick(jf.school), toks(b, { a: trainA })));
        if (K.startAge != null && !(b.mil && jf.id === 'army')) {
          P('parcours', 'entry', fx(R.pick(jf.entry), toks(b, { a: String(K.startAge) })));
          if (J.status !== 'retired') {
            if (K.years >= 2) P('parcours', 'now', R.pick([`Après ${numw(K.years)} ans de métier, ${n} est aujourd'hui ${J.label}${emp}.`, `Depuis ${b.yr(K.startAge)}, ${n} exerce comme ${J.label}${emp ? ', actuellement ' + emp.trim() : ''}, et le métier est devenu une grande partie de son identité.`, `${n} est ${J.label}${emp} depuis ${yrs(K.years)}, et ${il} n'imagine plus faire autre chose.`]));
            else P('parcours', 'now', `${n} est ${J.label}${emp} depuis peu, et fait encore ses preuves.`);
          }
        }
        if (b.mil && jf.id === 'army') P('parcours', 'mil', `Engagé${b.e} à ${b.mil.from} ans, en ${b.yr(b.mil.from)}, ${n} ${J.status === 'retired' ? 'sert pendant ' + numw(b.mil.years) + ' ans' : 'sert depuis ' + numw(b.mil.years) + ' ans'}, entre bases, exercices et affectations.`);
        if (J.status === 'ok' && R.chance(0.8)) P('parcours', 'memory', fx(R.pick(MEMORY.work), x0));
        if (jf.hard && J.status === 'ok' && R.chance(0.8)) P('parcours', 'hard', `Le métier a ses revers : ${jf.hard[0]}${jf.hard[1] ? ', ' + jf.hard[1] : ''}.`);
        const wk = b.rels.find(r => (r.kind === 'work' || r.kind === 'mentor') && r.nom);
        if (wk) { const nc = noteClause(wk.raw, x0); P('parcours', 'rel', `${wk.nom}${nc ? ', ' + nc + ',' : ''} ${wk.kind === 'mentor' ? 'est celui ou celle qui lui a tout appris' : 'fait partie de son quotidien de travail'}.`.replace(' est celui ou celle', b.g === 'f' ? ' est celle' : ' est celui')); }
        if (b.qualites[0]) { const e = DATA.TRAIT_ORIGINS.find(t => t[0].test(norm(b.qualites[0]))); if (e && e[1].w) P('parcours', 'quality', tidy(fx(e[1].w, toks(b, {})))); }
      } else {
        const s = status(); if (s) P('parcours', 'status', s);
        if (J.status === 'student' || J.status === 'petits' || J.status === 'none') P('parcours', 'memory', fx(R.pick(J.status === 'student' ? MEMORY.student : MEMORY.precaire), x0));
        if (J.status === 'student' && b.cls !== 'rich') P('parcours', 'job', `${n} finance ses études ${R.pick(['avec des heures dans un restaurant', 'avec un emploi à temps partiel dans un magasin', 'en livrant le soir', 'grâce à une bourse et à quelques services'])}.`);
        if ((J.status === 'petits' || J.status === 'none') && K.teenJob) P('parcours', 'early', `${n} a commencé tôt : à ${K.teenAge} ans, ${il} ${K.teenJob}.`);
        if ((J.status === 'petits' || J.status === 'none') && b.age >= 21) {
          const ids = ['food', 'shop', 'clean', 'drive', 'logi', 'build'], got = [];
          while (got.length < 3) { const id = R.pick(ids); if (got.indexOf(id) < 0) got.push(id); }
          P('parcours', 'side', `Depuis ses ${K.teenAge + 2} ans, ${n} a été tour à tour ${FAMLAB[got[0]][b.g === 'f' ? 1 : 0]}, ${FAMLAB[got[1]][b.g === 'f' ? 1 : 0]}, puis ${FAMLAB[got[2]][b.g === 'f' ? 1 : 0]}, sans jamais rester plus d'un an au même endroit.`);
        }
      }
      if (J.status === 'retired') { const s = status(); if (s) P('parcours', 'status', s); if (R.chance(0.7)) P('parcours', 'memory', fx(R.pick(MEMORY.retired), x0)); }
      if (V.affiliation && BGD.AFFIL_TXT && J.status !== 'student') {
        const lines = BGD.AFFIL_TXT[V.affiliation];
        P('parcours', 'affil', lines ? fx(R.pick(lines), x0) : `${n} est affilié${b.e} à ${V.affiliation}, ce qui pèse sur ses choix et sur son entourage.`);
      }
    }

    /* --- tournant --- */
    if (b.evt) {
      const E = evtText(b, R);
      P('tournant', 'event', R.pick(E.setup));
      if (R.chance(0.9)) P('tournant', 'after', R.pick(E.after));
      const FEAR_EVT = { breakup: /seul|abandon|enfant|solitude/, loss: /seul|abandon|famille|proche|solitude|hopital/, lonely: /seul|abandon|solitude/, crash: /conduire|route|accident|autoroute/, fired: /emploi|chomage|precarite|argent|dettes/, bankrupt: /dettes|argent|precarite|factures/, failure: /echec|decevoir|emploi/, betrayal: /mensonge|decouvert|confiance|seul/, disaster: /tornade|tempete|ouragan|feu|eau|seisme/, illness: /hopital|medic|maladie/ };
      const fearHit = b.peurs.find(f => FEAR_EVT[b.evt.id] && FEAR_EVT[b.evt.id].test(norm(f)));
      if (b.kids.length && b.peurs.some(f => /enfant/.test(norm(f))) && /breakup/.test(b.evt.id)) { const k = linkFor(b, 'fear', b.peurs.find(f => /enfant/.test(norm(f))), 0, 'n'); if (k) P('tournant', 'fear', k); }
      else if (fearHit) P('tournant', 'fear', `Depuis, une crainte suit ${n} : ${lc(fearHit)}.`);
      const reactive = b.defauts.find(x => /rancun|mefian|colerique|impulsi|jalou|orgueil|cassant|fuyant|susceptib|possessi/.test(norm(x)));
      if (reactive && /breakup|betrayal|fired|failure|bankrupt|lonely|loss/.test(b.evt.id) && R.chance(0.6)) P('tournant', 'defect', `${Il} en garde un défaut : ${il} est ${lc(reactive)}.`);
    } else {
      P('tournant', 'event', fx(R.pick(["Il y a eu un moment, plus marquant que les autres, où {n} a dû choisir une direction. Ce choix a défini la suite.", "Un jour, tout s'est accéléré pour {n}. {Il} y a laissé des plumes, mais a découvert une force qu'{il} ne soupçonnait pas."]), x0));
    }

    /* --- aujourd'hui --- */
    {
      const log = lc(V.logement || '');
      const since = moved && (!b.place.same || moved.reason === 'immig') && moved.age <= b.age ? b.yr(moved.age) : null;
      const lieuV = BGD.LIEUX && b.gta && b.nowCity && b.nowCity !== b.place.grew ? BGD.LIEUX[b.nowCity] : '';
      const recent = since != null && b.yr(b.age) - since <= 6;
      if (b.nowCity) P('aujourdhui', 'home', since ? R.pick(recent ? [`${n} vit ${log || 'dans un petit logement'} ${at(b.nowCity)}, où ${il} s'est installé${b.e} en ${since}.`, `Depuis ${since}, ${n} vit ${log || 'dans un petit logement'} ${at(b.nowCity)}.`] : [`${n} vit ${log || 'dans un petit logement'} ${at(b.nowCity)}, la ville où ${il} a posé ses valises en ${since}.`, `${n} habite ${at(b.nowCity)} depuis ${since} : ${il} y vit ${log || 'dans un petit logement'}.`]) : R.pick([`${n} n'a jamais vraiment quitté ${b.nowCity} : ${il} y vit ${log || 'dans un petit logement'}, à quelques rues d'où ${il} a grandi.`, `${n} vit ${log || 'dans un petit logement'} ${at(b.nowCity)}, la ville où ${il} a grandi.`]));
      if (lieuV && R.chance(0.6)) P('aujourdhui', 'place', lieuV);
      const pn = b.partner ? b.partner.nom : '';
      const cu = {
        married: pn ? `${n} est marié${b.e} avec ${pn} depuis ${yrs(b.together)}.` : `${n} est marié${b.e} depuis ${yrs(b.together)}.`,
        engaged: pn ? `${n} est fiancé${b.e} à ${pn}, et la date du mariage approche.` : `${n} est fiancé${b.e} depuis quelques mois.`,
        couple: pn ? `${n} est en couple avec ${pn} depuis ${yrs(Math.min(b.together, 9))}.` : `${n} est en couple depuis ${yrs(Math.min(b.together, 9))}.`,
        separated: `${n} est séparé${b.e}${b.ex ? ' de ' + b.ex.nom : pn ? ' de ' + pn : ''} depuis ${yrsw(b.sepAgo)}, et apprend à vivre autrement.`,
        divorced: `${n} est divorcé${b.e}${b.ex ? ' de ' + b.ex.nom : pn ? ' de ' + pn : ''} depuis ${yrsw(b.divorceAgo)}.`,
        widowed: `${n} est veuf${b.g === 'f' ? 've' : ''}${pn ? ' de ' + pn : ''} depuis ${yrsw(b.widowAgo)}, et en parle peu.`,
        complicated: `Côté cœur, c'est compliqué${pn ? ' avec ' + pn : ''}, et ${n} n'est pas pressé${b.e} de simplifier les choses.`,
        single: R.pick([`${n} est célibataire${b.ex ? ', et sa relation avec ' + b.ex.nom + ' appartient au passé' : ''}.`, `Côté cœur, ${n} est célibataire, ${R.pick(['par choix, dit-' + il, "faute d'avoir trouvé le bon moment", 'depuis une rupture qui l\'a marqué' + b.e])}.`])
      }[b.sit];
      if (cu) P('aujourdhui', 'couple', cu);
      const kl = kidsLine(b, R); if (kl) P('aujourdhui', 'kids', kl);
      if (J.fam && J.status === 'ok') P('aujourdhui', 'daily', fx(R.pick(J.fam.daily), toks(b, {})));
      else if (J.status === 'student') P('aujourdhui', 'daily', `Entre les cours, les partiels et le job d'appoint, ${n} dort trop peu et rêve du jour où tout cela servira.`);
      else if (J.status === 'retired') P('aujourdhui', 'daily', `${n} a trouvé un rythme tranquille, fait de matins lents, de visites et de ce que le métier ne lui avait jamais laissé le temps de faire.`);
      else if (J.status === 'none' || J.status === 'petits') P('aujourdhui', 'daily', `${n} regarde les annonces, accepte ce qui se présente et garde un œil sur le loyer du mois suivant.`);
    }
    const rl = b.rels.filter(r => r.nom && (r.kind === 'friend' || r.kind === 'sib' || r.kind === 'fam' || r.kind === 'neighbor' || r.kind === 'roommate'))[0];
    const rlTxt = rl && rl.kind === 'friend' ? rl : null;
    if (rl) {
      const nc = noteClause(rl.raw, x0);
      const ROLE = { soeur: 'sa sœur', frere: 'son frère', mere: 'sa mère', pere: 'son père', 'grand-mere': 'sa grand-mère', 'grand-pere': 'son grand-père', oncle: 'son oncle', tante: 'sa tante', cousin: 'son cousin', cousine: 'sa cousine', neveu: 'son neveu', niece: 'sa nièce', ami: 'un ami', amie: 'une amie', pote: 'un pote', 'meilleur ami': 'son meilleur ami', 'meilleure amie': 'sa meilleure amie', voisin: 'son voisin', voisine: 'sa voisine', colocataire: 'son colocataire' };
      const who = ROLE[rl.role] || '';
      const mid = [who, nc].filter(Boolean).join(', ');
      P('aujourdhui', 'rel', `${rl.nom}${mid ? ', ' + mid + ',' : ''} reste l'une des personnes sur qui ${il} peut compter.`);
    }
    if (b.loisirs[0] && !mentioned(own.actuel, b.loisirs[0])) P('aujourdhui', 'hobby', linkFor(b, 'hobby', b.loisirs[0], 0, 'n'));
    if (b.traits[0] && !mentioned(own.actuel, b.traits[0])) P('aujourdhui', 'trait', linkFor(b, 'trait', b.traits[0], 0, 'n'));
    if (b.defauts[0] && !mentioned(own.actuel, b.defauts[0])) P('aujourdhui', 'defect', linkFor(b, 'trait', b.defauts[0], 0, 'n'));
    if (b.peurs[0] && !mentioned(own.actuel, b.peurs[0])) P('aujourdhui', 'fear', linkFor(b, 'fear', b.peurs[0], 0, 'n', { now: true }));
    if (mot && !mentioned(own.actuel, mot)) {
      const conj = /^(?:rêve|veut|souhaite|cherche|aimerait|ambitionne|voudrait|s'efforce|espère|compte|projette|attend|tient)\b/i.test(mot);
      P('aujourdhui', 'goal', conj ? `${n} ${mot}.` : R.pick([`Ce qui tient ${n} debout : ${mot}.`, `Le cap de ${n} : ${mot}.`, `${n} garde un objectif en tête : ${mot}.`]));
    }

    /* --- secret --- */
    const sec = String(V.secret || '').trim();
    if (sec) {
      const body = lc(sec.replace(/[.\s]+$/, ''));
      const starts = /^(?:un|une|le|la|les|l'|sa|son|ses|des|du|de la)\s/i.test(sec);
      const named = new RegExp('^(?:' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '|il|elle)\\b', 'i').test(sec);
      P('secret', 'own', named ? `${R.pick(["Il y a une chose que " + n + " ne raconte jamais.", n + " garde un secret."])} ${cap(sec.replace(/[.\s]+$/, ''))}.` : starts ? `${n} garde un secret : ${body}.` : `${n} garde un secret : ${il} ${body}.`);
    } else {
      const sc = [];
      if (J.fam && J.status === 'ok' && J.fam.min >= 24) sc.push(`${n} a menti sur l'un des diplômes de son dossier, et attend toujours que quelqu'un vérifie.`);
      if (b.kids.length && /divorced|separated/.test(b.sit)) sc.push(`${n} n'a jamais dit à ${b.kids.length > 1 ? 'ses enfants' : first(b.kids[0].nom) || 'son enfant'} la vraie raison de la séparation.`);
      if (b.ex) sc.push(`${n} garde dans un tiroir une lettre jamais envoyée à ${b.ex.nom}, qu'${il} réécrit chaque année avec un peu moins de colère.`);
      if (b.mil) sc.push(`${n} n'a jamais parlé de ce qu'${il} a vu pendant ses années sous l'uniforme, pas même aux siens.`);
      if (b.evt && b.evt.id === 'betrayal') sc.push(`${n} sait quelque chose sur la trahison de ${(b.rels.find(r => r.kind === 'enemy' || r.kind === 'rival') || {}).nom || 'son ancien proche'}, qu'${il} garde pour ${b.lui}, au cas où.`);
      if (b.cls === 'poor' && b.age >= 25) sc.push(`${n} envoie chaque mois de l'argent à quelqu'un de sa famille, sans que personne dans son entourage actuel ne le sache.`);
      sc.push(b.gta ? `${n} doit un service à quelqu'un de dangereux, et sait que la dette finira par être réclamée.` : `${n} garde pour ${b.lui} un regret ancien, qu'${il} ressort la nuit quand le sommeil ne vient pas.`);
      sc.push(`Il y a une chose que ${n} ne raconte jamais, même à ceux qu'${il} aime : un moment du passé dont ${il} n'est pas fier${b.e}.`);
      P('secret', 'gen', R.pick(sc));
    }
    return out;
  }

  /* ---------- sorties ---------- */
  function section(key, c, disp, form, world, vr) {
    const b = bio(c, disp, form, world), R = makeR(b.seed, 'text:' + key + ':' + (vr == null ? 0 : vr));
    const ps = (parts(b, R)[key] || []).filter(p => p.t);
    const title = ({ origines: 'Origines', jeunesse: 'Jeunesse', parcours: 'Parcours', tournant: 'Le tournant', aujourdhui: "Aujourd'hui", secret: 'Le secret' })[key];
    const own = key === 'origines' ? b.own.enfance : key === 'parcours' ? b.own.parcours : key === 'aujourdhui' ? b.own.actuel : '';
    // le texte écrit dans la fiche passe en premier, sans être modifié
    const head = own ? [own] : [];
    return { k: key, title, text: tidy(head.concat(varyNames(ps, b).map(p => p.t)).join(' ')) };
  }
  // quelques phrases pour un champ de la fiche : l'enfance, le parcours, la vie actuelle
  const FIELD_PLAN = {
    enfance: { sec: 'origines', want: [['birth'], ['family'], ['class', 'place', 'herit', 'hobby', 'trait', 'fear', 'sibs', 'moved', 'plink']], max: 3 },
    parcours: { sec: 'parcours', want: [['mil', 'status', 'prev', 'train'], ['entry', 'early', 'job', 'side'], ['now', 'affil', 'quality', 'hard', 'memory']], ordered: [0], max: 3 },
    actuel: { sec: 'aujourdhui', want: [['home'], ['couple', 'kids'], ['daily', 'hobby', 'rel', 'defect', 'fear', 'goal', 'trait']], max: 3 }
  };
  function field(key, c, disp, form, world, n, offset, cover) {
    const plan = FIELD_PLAN[key];
    if (!plan) return [];
    const b = bio(c, disp, form, world), res = [], seen = new Set();
    // la fiche existante ne doit pas se contredire : le champ concerné est ignoré pour ne pas se citer lui-même
    // pour compléter un texte déjà écrit, on ne redit pas ce qu'il contient ; pour le remplacer, on repart de zéro
    b.own = Object.assign({}, b.own, { [key]: cover ? nz(c.v[key]) : '' });
    // pour 'parcours', les passions et les traits n'ont pas de place ; on garde les phrases d'étude et de travail
    const sigs = new Set();
    for (let i = 0; i < n * 8 && res.length < n; i++) {
      const R = makeR(b.seed, 'field:' + key + ':' + ((offset || 0) + i));
      const all = parts(b, R)[plan.sec] || [], pickK = [];
      plan.want.forEach((ks, gi) => {
        let cands = all.filter(p => ks.indexOf(p.k) >= 0 && p.t);
        if (plan.ordered && plan.ordered.indexOf(gi) >= 0 && cands.length) {
          cands.sort((x, y) => ks.indexOf(x.k) - ks.indexOf(y.k));
          cands = cands.filter(p => p.k === cands[0].k);
        }
        if (cands.length) pickK.push(R.pick(cands));
      });
      let sel = pickK.filter((p, j, a) => a.indexOf(p) === j).slice(0, plan.max);
      if (sel.length < 2) sel = all.filter(p => p.t).slice(0, plan.max);
      sel = sel.slice().sort((x, y) => all.indexOf(x) - all.indexOf(y));
      // deux propositions ne doivent pas raconter la même chose : on écarte celles qui reprennent les mêmes types de phrases
      const sig = sel.map(p => p.k).join('+');
      if (sigs.has(sig) && i < n * 7) continue;
      sigs.add(sig);
      const text = tidy(varyNames(sel, b).map(p => p.t).join(' '));
      if (text.length > 25 && !seen.has(text)) { seen.add(text); res.push(text); }
    }
    return res;
  }
  // événements plausibles pour la fiche : [étiquette, poids]
  function eventScores(c, disp, form, world, labels) {
    const b = bio(Object.assign({}, c, { v: Object.assign({}, c.v, { evenement: '' }) }), disp, form, world), J = b.job, age = b.age;
    const K = b.career, T = flat(b.peurs.join(' ') + ' ' + (c.v.signes || '') + ' ' + (c.v.notes || '') + ' ' + (c.v.secret || '') + ' ' + (c.v.parcours || ''));
    return (labels || []).map(label => {
      const t = norm(label), ev = DATA.EVENTS.find(e => e.re.test(t));
      let w = 1;
      if (ev) {
        if (age < ev.lo + 1) return [label, 0];
        if (ev.id === 'fired' || ev.id === 'failure') { if (!(J.status === 'ok' || J.status === 'retired') || (K.startAge != null && age - K.startAge < 2)) return [label, 0]; }
        if (ev.id === 'bankrupt' && !(/food|shop|beauty|build|mecano|drive|free|sales|media|crime/.test(J.fam && J.fam.id) || J.status === 'petits')) w *= 0.15;
        if (ev.id === 'bankrupt' && age < 28) return [label, 0];
        if (ev.id === 'retrain') { if (!(J.status === 'ok' && age >= 29)) return [label, 0]; w *= 0.8; }
        if (ev.id === 'army') { if (J.fam && J.fam.id === 'army') w *= 6; else if (/militaire|tatouage militaire|armee/.test(T)) w *= 5; else w *= 0.4; if (age > 60) w *= 0.5; }
        if (ev.id === 'breakup') { if (/single/.test(b.sit) && !b.ex) w *= 0.5; if (/divorced|separated/.test(b.sit)) w *= 3; if (/married|engaged/.test(b.sit)) w *= 0.5; }
        if (ev.id === 'loss') { if (/abandon|seul|solitude/.test(T)) w *= 2; if (age >= 35) w *= 1.4; }
        if (ev.id === 'lonely') { if (/seul|solitude|abandon/.test(T)) w *= 3; if (b.sit === 'single') w *= 1.3; if (/married|couple|engaged/.test(b.sit)) w *= 0.4; }
        if (ev.id === 'crash') { if (/conduire|autoroute|route|boiter|cicatrice/.test(T)) w *= 3; }
        if (ev.id === 'inherit') { if (b.cls === 'poor') w *= 0.5; if (age < 30) w *= 0.5; }
        if (ev.id === 'move') { if (!b.place.same) w *= 3; }
        if (ev.id === 'disaster') { if (/tornade|tempete|ouragan|seisme|incendie|feu/.test(T)) w *= 4; else w *= 0.5; }
        if (ev.id === 'illness') { if (/hopital|medic|maladie/.test(T)) w *= 3; }
        if (ev.id === 'success') { if (J.status !== 'ok') w *= 0.5; }
      } else {
        // un événement de la banque d'idées : on écarte ce qui est impossible à l'âge, sinon neutre
        if (age < 20 && /retraite|divorce|veuf|licenci|faillite|carriere/.test(t)) return [label, 0];
        if (b.sit === 'single' && /mariage|epous/.test(t)) w *= 0.3;
      }
      return [label, w];
    });
  }
  // relations plausibles pour la fiche (sans noms) : [{lien, note}]
  function relPlan(c, disp, form, world) {
    const b = bio(c, disp, form, world), R = makeR(b.seed, 'relplan'), out = [], f = b.g === 'f';
    const J = b.job, fam1 = J.fam && J.fam.id;
    // partenaire ou ex selon la situation
    const pr = { married: [f ? 'Son mari.' : 'Sa femme.', 'Partenaire'], engaged: [f ? 'Son fiancé.' : 'Sa fiancée.', 'Partenaire'], couple: [R.pick(['Son compagnon.', 'Sa compagne.', f ? 'Son petit ami.' : 'Sa petite amie.']), 'Partenaire'], complicated: [R.pick(['Une relation compliquée.', 'Une histoire qui ne finit pas.']), 'Partenaire'] }[b.sit];
    if (pr) out.push({ lien: pr[1], note: pr[0], sex: /\b(?:mari|fiancé|compagnon|petit ami)\b/.test(pr[0]) ? 'm' : /\b(?:femme|fiancée|compagne|petite amie)\b/.test(pr[0]) ? 'f' : null });
    else if (/divorced|separated|widowed/.test(b.sit) || (b.sit === 'single' && R.chance(0.4))) out.push({ lien: 'Ex', note: 'Son ex.', sex: null });
    // famille cohérente avec le milieu de naissance
    const famOpts = [];
    if (b.fkind !== 'pere' && !b.mere.dead) famOpts.push(['Sa mère.', 'f', 3]);
    if (b.fkind === 'mere' && !b.mere.dead) famOpts.push(['Sa mère.', 'f', 5]);
    if (b.fkind !== 'mere' && b.fkind !== 'separes' && !b.pere.dead) famOpts.push(['Son père.', 'm', 2]);
    b.sibs.slice(0, 2).forEach(s => famOpts.push([s.sex === 'f' ? 'Sa sœur.' : 'Son frère.', s.sex, 4]));
    if (b.fkind === 'grands') famOpts.push(['Sa grand-mère.', 'f', 3]);
    if (!famOpts.length) famOpts.push(['Un cousin proche.', 'm', 1]);
    const fo = R.wpick(famOpts.map(x => [x, x[2]]));
    out.push({ lien: 'Famille', note: fo[0], sex: fo[1], fam: true });
    // un lien tiré du métier ou de la passion
    const hob = norm(b.loisirs.join(' '));
    const sx = R.pick(['m', 'f']), mf = (m, fm) => (sx === 'f' ? fm : m);
    const jobRel = { police: ['Collègue', mf("Son équipier.", "Son équipière.")], fire: ['Collègue', mf("Son coéquipier de caserne.", "Sa coéquipière de caserne.")], nurse: ['Collègue', mf("Un collègue de l'hôpital, avec qui {il} partage les gardes.", "Une collègue de l'hôpital, avec qui {il} partage les gardes.")], mecano: ['Collègue', mf("Le patron du garage, qui a toujours cru en {lui}.", "La patronne du garage, qui a toujours cru en {lui}.")], food: ['Collègue', mf("Le chef de cuisine, qui l'a formé{e}.", "La cheffe de cuisine, qui l'a formé{e}.")], army: ['Ami·e', mf("Un frère d'armes rencontré pendant son service.", "Une sœur d'armes rencontrée pendant son service.")], teach: ['Collègue', mf("Un collègue qui partage son bureau et ses déboires.", "Une collègue qui partage son bureau et ses déboires.")], it: ['Collègue', mf("Un collègue qui dépanne tout le monde à toute heure.", "Une collègue qui dépanne tout le monde à toute heure.")], law: ['Mentor', "Quelqu'un qui l'a pris{e} sous son aile au cabinet, et lui a tout appris."], media: ['Ami·e', mf("Un complice de projets, depuis les débuts.", "Une complice de projets, depuis les débuts.")], build: ['Collègue', mf("Le chef d'équipe, qui l'a pris{e} sous son aile.", "La cheffe d'équipe, qui l'a pris{e} sous son aile.")], factory: ['Collègue', mf("Le chef de ligne, qui l'a pris{e} sous son aile.", "La cheffe de ligne, qui l'a pris{e} sous son aile.")], drive: ['Collègue', mf("Un collègue de la centrale, croisé à chaque pause.", "Une collègue de la centrale, croisée à chaque pause.")], shop: ['Collègue', mf("Le responsable du magasin, qui compte sur {lui}.", "La responsable du magasin, qui compte sur {lui}.")], crime: ['Ami·e', "Quelqu'un qui connaît ses affaires, et à qui {il} en dit le moins possible."] }[fam1];
    const hobRel = /boxe|combat|arts martiaux/.test(hob) ? ['Ami·e', mf("Un partenaire d'entraînement, rencontré à la salle de boxe.", "Une partenaire d'entraînement, rencontrée à la salle de boxe.")] : /moto|tuning|course|mecanique|voiture/.test(hob) ? ['Ami·e', mf("Un ami croisé dans les ateliers et sur la route.", "Une amie croisée dans les ateliers et sur la route.")] : /football|basket|baseball|hockey|sport/.test(hob) ? ['Ami·e', mf("Un coéquipier de longue date.", "Une coéquipière de longue date.")] : /peche|chasse|camping|randonn/.test(hob) ? ['Ami·e', mf("Un compagnon de sorties dans la nature.", "Une compagne de sorties dans la nature.")] : /guitare|piano|musique|chant|dj/.test(hob) ? ['Ami·e', mf("Un complice de musique.", "Une complice de musique.")] : null;
    const mid = jobRel && (!hobRel || R.chance(0.5)) ? jobRel : hobRel || jobRel || ['Ami·e', R.pick([mf('Un ami de longue date.', 'Une amie de longue date.'), 'Se connaissent depuis le lycée.', mf('Un ami croisé au détour de la ville.', 'Une amie croisée au détour de la ville.')])];
    out.push({ lien: mid[0], note: fx(mid[1], toks(b, {})), sex: sx });
    return out.slice(0, 3);
  }


  // accroches de RP : des phrases courtes tirées de ce que la fiche contient (métier, passion, proches, passé, objectif)
  function hooks(c, disp, form, world, n, offset) {
    const b = bio(c, disp, form, world), R = makeR(b.seed, 'hooks:' + (offset || 0)), J = b.job, pool = [];
    const kinds = [];
    const add = (k, t) => { t = tidy(t); if (t) kinds.push({ k, t }); };
    const fam = J.fam && DATA.HOOKS_JOB[J.fam.id];
    if (J.status === 'ok' && fam) fam.forEach(t => add('job', t));
    if (DATA.HOOKS_STATUS[J.status]) DATA.HOOKS_STATUS[J.status].forEach(t => add('job', t));
    b.loisirs.slice(0, 3).forEach(h => { const e = DATA.HOOKS_HOBBY.find(x => x[0].test(norm(h))); if (e) add('hobby', e[1]); });
    const kidsN = b.kids.filter(k => k.age <= 14);
    if (kidsN.length) add('rel', `Emmène ${join(kidsN.map(k => first(k.nom) || (k.sex === 'f' ? 'sa fille' : 'son fils')))} à l'école ou au parc : on peut le croiser à ces heures-là.`.replace('le croiser', b.g === 'f' ? 'la croiser' : 'le croiser'));
    if (b.ex) add('rel', `Croise encore ${b.ex.nom} dans les mêmes lieux, et la tension se sent dès qu'on évoque son nom.`);
    if (b.partner) add('rel', `${b.partner.nom} sait ce qu'${b.il} ne dit pas : on peut passer par ${b.partner.nom} pour aborder ${b.lui}.`);
    const wk = b.rels.find(r => r.kind === 'mentor' && r.nom) || b.rels.find(r => r.kind === 'work' && r.nom);
    if (wk) add('rel', `${wk.nom} peut parler de ${b.lui} à qui s'y prend bien, en bien comme en mal.`);
    const rv = b.rels.find(r => (r.kind === 'rival' || r.kind === 'enemy') && r.nom);
    if (rv) add('rel', `A un compte à régler avec ${rv.nom} : quelqu'un qui connaît les deux peut s'en servir.`);
    if (b.mil) add('past', "Reconnaît d'autres vétérans à leur manière de se tenir, et ne parle de son service qu'à ceux qui y étaient.");
    if (b.evt && b.evt.id !== 'custom') add('past', `Parle rarement de ${({ move: 'son départ', breakup: b.sit === 'divorced' ? 'son divorce' : 'sa rupture', loss: "la personne qu'il a perdue", crash: 'son accident', fired: 'son licenciement', bankrupt: 'sa faillite', failure: 'son échec', betrayal: 'la trahison', disaster: 'la catastrophe', illness: 'sa maladie', lonely: 'ses années de solitude', retrain: 'son ancien métier', success: 'sa réussite', meeting: 'une rencontre qui a tout changé', inherit: 'cet héritage', army: 'son service' }[b.evt.id] || 'ce qui lui est arrivé')}, mais réagit dès qu'on l'évoque devant lui.`);
    const mot = V(c, 'motivation');
    if (mot && mot.length > 8) { const m = lc(mot.replace(/[.\s]+$/, '')); add('goal', /^(?:rêve|veut|souhaite|cherche|aimerait|ambitionne|voudrait)/i.test(m) ? `Ne cache pas qu'${b.il} ${m} : on peut s'en servir pour gagner sa confiance.` : `Cherche quelqu'un pour l'aider dans son projet : ${m}.`); }
    if (V(c, 'secret')) add('goal', "Réagit mal si quelqu'un s'approche trop de son secret : une rumeur ou un indice suffit à l'attirer.");
    if (V(c, 'affiliation')) add('job', `Fait partie de ${V(c, 'affiliation')} : on le croise là où le groupe se réunit, et il peut parler en son nom.`);
    // un tirage varié : un type d'accroche à la fois, dans un ordre qui change
    const byK = {};
    kinds.forEach(x => { (byK[x.k] = byK[x.k] || []).push(x.t); });
    const order = Object.keys(byK).sort(() => R.f() - 0.5), res = [];
    let guard = 0;
    while (res.length < n && guard++ < 30) {
      const k = order[(res.length + guard - 1) % order.length], list = byK[k];
      if (!list || !list.length) continue;
      const t = list.splice(R.int(0, list.length - 1), 1)[0];
      if (res.indexOf(t) < 0) res.push(t);
      if (!order.some(kk => byK[kk].length)) break;
    }
    return res;
  }
  const V = (c, k) => String((c.v && c.v[k]) || '').trim();

  // note qu'un texte du champ vient d'être écrit par ce moteur : il ne sera pas pris pour un texte de la personne
  function mark(c, key, text) { c.lg = c.lg || {}; c.lg[key] = hash(nz(text)); }

  return { bio, section, field, eventScores, relPlan, hooks, mark, KEYS: ['origines', 'jeunesse', 'parcours', 'tournant', 'aujourdhui', 'secret'], hash, makeR };
})();
