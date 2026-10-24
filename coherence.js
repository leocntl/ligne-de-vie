/* Cohérence : une fiche n'est pas un tirage au hasard.
   Chaque proposition (ampoule d'idées, dés, tirage d'un personnage décrit) est choisie d'après le profil de la fiche :
   âge, métier ou statut, goûts, origine, situation. Une idée incompatible est écartée, une idée de son univers passe devant. */
window.LDV_COH = (function () {
  const D = window.LDV;
  const norm = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').replace(/[’]/g, "'");
  const flat = s => norm(String(s == null ? '' : s).replace(/[|~]/g, ' '));
  const arr = x => (Array.isArray(x) ? x : x ? [x] : []);

  /* ---------- profil de la fiche ---------- */
  function profile(c, gta) {
    const v = (c && c.v) || {};
    const age = Number(v.age) || 30;
    const job = flat(v.metier), jobAll = job + ' ' + flat(v.affiliation);
    const texts = [v.enfance, v.parcours, v.actuel, v.notes, v.motivation, v.manies, v.secret, v.accroches, v.signes, v.attitude].map(flat).join(' ');
    const likes = [].concat(arr(v.traits), arr(v.loisirs), arr(v.qualites), arr(v.style)).map(flat).join(' ') + ' ' + texts + ' ' + flat(v.origine) + ' ' + flat(v.herit);
    const student = /etudiant|alternant/.test(job), retired = /retrait/.test(job) || (!job && age >= 68);
    const precaire = /petits boulots|sans emploi|chomage|reconversion|combines/.test(job);
    // themesJob : ce que le personnage est (métier, affiliation, statut, origine) ; ses goûts ne colorent que les détails
    const themesJob = new Set(), themes = new Set();
    D.THEMES.forEach(t => { if (t.job && t.job.test(jobAll)) themesJob.add(t.id); else if (t.like && t.like.test(likes)) themes.add(t.id); });
    if (student) themesJob.add('etudiant');
    if (retired) themesJob.add('retraite');
    if (precaire) themesJob.add('precaire');
    if (gta && /cayo perico/.test(flat(v.origine) + ' ' + flat(v.herit) + ' ' + texts)) themesJob.add('ile');
    themesJob.forEach(id => themes.add(id));
    const state = flat([v.enfance, v.parcours, v.actuel, v.notes, v.logement].join(' '));
    const poor = precaire || /pauvrete|modeste|fins de mois|sans le sou|debrouill|precarit|dettes?/.test(state);
    const rich = /villa|penthouse|manoir|fortune|riche|yacht|duplex d'alta/.test(flat(v.logement) + ' ' + state) && !poor;
    return {
      age, minor: age < 18, student, retired, precaire, poor, rich, themes, themesJob, gta: !!gta,
      noJob: !job || /sans emploi|reconversion|chomage|vit de/.test(job),
      single: /celibataire/.test(flat(v.situation)),
      kids: (c.rel || []).some(r => /^(?:son fils|sa fille)/i.test(r.note || '')),
      villeRaw: v.ville || ''
    };
  }

  /* ---------- ce qui est incompatible avec le profil ---------- */
  const NUMW = { un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10, onze: 11, douze: 12, treize: 13, quatorze: 14, quinze: 15, seize: 16, vingt: 20, trente: 30, quarante: 40, cinquante: 50 };
  function numOf(w) {
    if (/^\d+$/.test(w)) return +w;
    let n = 0;
    for (const x of w.split('-')) { if (x === 'et') continue; if (!(x in NUMW)) return null; n += NUMW[x]; }
    return n;
  }
  // « depuis dix ans » suppose au moins 26 ans, « à vingt-sept ans » au moins 27...
  const AGE_RULES = [
    [/depuis (?:plus de |pres de |environ )?([a-z0-9-]+) ans/g, n => n + 16],
    [/pendant (?:plus de |pres de |environ )?([a-z0-9-]+) ans/g, n => n + 14],
    [/il y a (?:plus de |pres de |environ )?([a-z0-9-]+) ans/g, n => n + 3],
    [/\ba ([a-z0-9-]+) ans\b/g, n => n]
  ];
  const ageOk = (t, age) => AGE_RULES.every(r => { r[0].lastIndex = 0; let m; while ((m = r[0].exec(t))) { const n = numOf(m[1]); if (n != null && age < r[1](n)) return false; } return true; });

  const ADULT = /casino|poker|alcool|\bbars?\b|bartender|cellule|prison|armee|militaire|divorc|veuf|veuve|licenci|faillite|cartel|braq|trafic|\bgang|ballas|vagos|families|mafia|\bmarie|mariage|epou|hypotheque|patron|employeur|salaire|\{metier\}/;
  const YOUNG_ONLY = /skate|parachut|escalade|tuning|courses? de rue|karting|caisses a savon|musculation|surf\b|retrogaming|hockey|danser dans les clubs/;
  // univers qu'on ne propose qu'à ceux qui les ont : le vocabulaire des listes de base qui ne vaut que pour eux
  const GATE = [[/(?:^|\s)geek|bidouill|paranoiaque numerique|programmation|hacking|montage de pc|electronique et bidouillage|\(ctf\)|reparer des consoles|bricolage electronique|perdre toutes ses donnees|repere\S* en ligne|panne de courant|devant ses ecrans|patience devant un ecran|cle usb/, 'it']];
  const gated = (t, p) => { const n = norm(t); return GATE.some(g => g[0].test(n) && !p.themes.has(g[1])); };

  function veto(raw, p, key) {
    const t = norm(raw);
    if (!ageOk(t, p.age)) return true;
    if (p.age < 55 && /retraite|petits-enfants|petit-enfant/.test(t)) return true;
    if (p.age < 24 && /faillite|a dirige|son entreprise/.test(t)) return true;
    if (p.age < 35 && /veuf|veuve/.test(t)) return true;
    if (p.minor && ADULT.test(t)) return true;
    if (p.age >= 60 && YOUNG_ONLY.test(t)) return true;
    if (p.age < 24 && /ses enfants|sa fille|son fils|divorc/.test(t)) return true;
    if (p.single && key !== 'relnote' && /sa femme|son mari|son epouse|son epoux/.test(t)) return true;
    if (/\{metier\}/.test(t) && (p.student || p.noJob)) return true;
    if (p.student && /promotion|collegues|patron|\bbureau\b|licenci|embauch|salaire|carriere|reconvers|heures sup|\bcontrat/.test(t) && key !== 'relnote') return true;
    if (p.retired && /promotion|carriere|stage\b|diplome|premiere maison|ouvrir (?:son|un)|se faire un nom|premier job|premier poste|dettes? d'etudes/.test(t)) return true;
    if (p.kids && key === 'logement' && /studio|colocation|motel|canape|sans fenetre|toit|caravane|bateau|chez ses parents|grenier|entrepot|residence/.test(t)) return true;
    if (!p.student && /universitaire|residence etudiante|campus|dortoir/.test(t)) return true;
    if (!p.student && p.age >= 26 && /partiels|bourse d'etudes/.test(t)) return true;
    if ((p.poor || p.precaire) && /heritage|herite|fortune|villa|yacht|manoir|rentier|duplex d'alta|penthouse|actions en bourse/.test(t)) return true;
    if (p.rich && /sans le sou|fins de mois|dort dans sa voiture|petits boulots|dettes? d'etudes/.test(t)) return true;
    if (p.age >= 35 && /chez ses parents|grenier d'un oncle/.test(t) && key === 'logement') return true;
    // un lieu cité dans l'idée doit être celui du personnage (Cayo Perico reste permis à qui en vient)
    if (D.placeFits && !D.placeFits(p.themes.has('ile') ? String(raw).replace(/Cayo Perico/g, '') : raw, p.villeRaw)) return true;
    return false;
  }

  /* ---------- les propositions de la fiche ---------- */
  // l'enfance, le parcours et la vie actuelle suivent ce que le personnage est, pas ses goûts
  const LIFE = new Set(['enfance', 'parcours', 'actuel', 'motivation']);
  function themed(key, p) {
    const out = [];
    (LIFE.has(key) ? p.themesJob : p.themes).forEach(id => {
      const T = D.IDEES_T && D.IDEES_T[id];
      if (!T) return;
      arr(T[key]).forEach(x => out.push(x));
      if (p.gta) arr(T[key + '_gta']).forEach(x => out.push(x));
    });
    return out;
  }
  // toutes les idées possibles pour un champ : celles de son univers (poids fort), puis les générales ; les incompatibles sont écartées
  function candidates(key, c, generic, gta) {
    const p = profile(c, gta), seen = new Set(), items = [];
    const add = (t, w, own) => { const k = norm(t); if (seen.has(k)) return; seen.add(k); if (veto(t, p, key) || gated(t, p)) return; items.push({ t, w, own }); };
    themed(key, p).forEach(t => add(t, 8, true));
    arr(generic).forEach(t => add(t, 1, false));
    if (!items.length) arr(generic).forEach(t => items.push({ t, w: 1, own: false }));
    return { items, p };
  }
  function pickWeighted(items, n, accept) {
    const pool = items.slice(), res = [];
    while (res.length < n && pool.length) {
      const tot = pool.reduce((s, x) => s + x.w, 0);
      let r = Math.random() * tot, i = 0;
      for (; i < pool.length; i++) { r -= pool[i].w; if (r < 0) break; }
      const x = pool.splice(Math.min(i, pool.length - 1), 1)[0];
      if (!accept || accept(x, res)) res.push(x);
    }
    return res;
  }
  // n textes (modèles) de la banque d'un champ
  function pick(key, c, generic, n, gta) {
    return pickWeighted(candidates(key, c, generic, gta).items, n || 1).map(x => x.t);
  }

  // des traits qui se contredisent ne vont pas ensemble (timide et extraverti...)
  const CONFLICT = [
    [/timide|discret|introverti|solitaire|casanier|asocial|pudique/, /extraverti|bavard|theatral|sociable|charmeur|flambeur|fetard|magnetique|excentrique/],
    [/calme|flegmatique|stoique|patient(?![a-z])|serein|contemplatif/, /impulsif|colerique|bagarreur|fonceur|susceptible|rancunier/],
    [/optimiste|bienveillant/, /pessimiste|fataliste|cynique|melancolique|cassant|hautain/],
    [/honnete|loyal|parole tenue|fiable|franc(?:he)?(?![a-z])/, /menteur|mythomane|roublard|joue la comedie|ne dit jamais le fond|bluffeu/],
    [/genereux|attentionne|empathique/, /radin|materialiste|egoiste|hautain|cassant/],
    [/organise|methodique|maniaque|perfectionniste/, /desorganise|distrait|procrastinateur|retardataire/],
    [/courageux|sang-froid/, /anxieux|hypersensible/],
    [/travailleur|bourreau de travail|ambitieux|perseverant/, /procrastinateur|paresseux/],
    [/sur de soi|charismatique|sociable/, /timide|anxieux/],
    [/spontane/, /methodique|calculateur/],
    [/studieux/, /fetard/]
  ];
  const clash = (a, b) => { a = norm(a); b = norm(b); return CONFLICT.some(r => (r[0].test(a) && r[1].test(b)) || (r[1].test(a) && r[0].test(b))); };

  // n choix dans une liste de mots (traits, loisirs, événement...) : sans doublon avec ce qui est déjà choisi, sans contradiction
  function words(key, c, generic, n, gta) {
    const cand = candidates(key, c, generic, gta).items;
    const cur = arr(c.v[key]).map(norm);
    const trio = key === 'traits' || key === 'qualites' || key === 'defauts' ? [].concat(arr(c.v.traits), arr(c.v.qualites), arr(c.v.defauts)) : [];
    const pool = cand.filter(x => cur.indexOf(norm(x.t)) < 0);
    const got = pickWeighted(pool, n, (x, res) => !trio.concat(res.map(r => r.t)).some(o => clash(o, x.t)));
    return got.map(x => x.t);
  }

  const has = (c, id, gta) => profile(c, gta).themes.has(id);
  const themesOf = (c, gta) => Array.from(profile(c, gta).themes);

  /* ---------- une activité dans une phrase : « musique » devient « la musique » ---------- */
  const VERBES = new Set(['restaurer', 'reparer', 'observer', 'dessiner', 'chiner', 'cuisiner', 'apprendre', 'ecrire', 'ecouter', 'tricoter', 'danser', 'collectionner', 'chasser', 'jouer', 'chanter', 'corriger', 'organiser', 'construire', 'fabriquer', 'cueillir', 'bricoler', 'voyager', 'peindre', 'lire', 'nager', 'courir', 'dormir']);
  const FEMININ = new Set(['moto', 'peche', 'chasse', 'danse', 'mode', 'cuisine', 'guitare', 'course', 'plage', 'plongee', 'randonnee', 'voile', 'magie', 'boxe', 'batterie', 'basse']);
  const MASCULIN = new Set(['pique', 'cinema', 'karaoke']);
  function np(raw) {
    const s = String(raw == null ? '' : raw).trim();
    if (!s) return '';
    const low = s.charAt(0).toLowerCase() + s.slice(1);
    if (/^(?:l'|la |le |les |un |une |des |du |de la )/i.test(s)) return low;
    const w = norm(s).split(/[\s'-]+/)[0];
    if (VERBES.has(w)) return low;
    const vowel = /^[aeiouy]/.test(w);
    let art;
    if (w.length > 3 && /[sx]$/.test(w)) art = 'les ';
    else if (!MASCULIN.has(w) && (FEMININ.has(w) || /(?:tion|sion|ie|ique|ure|ade|ette|esse|ance|ence|ee)$/.test(w))) art = vowel ? "l'" : 'la ';
    else art = vowel ? "l'" : 'le ';
    return art + low;
  }

  return { profile, veto, candidates, pickWeighted, pick, words, has, themesOf, np, norm, flat };
})();
