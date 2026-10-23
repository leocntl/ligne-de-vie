/* Ligne de vie : comprend une description libre en français et en tire les champs de la fiche.
   Ce n'est pas une IA : l'analyse repère des mots-clés, des synonymes et quelques tournures de phrase
   (âge, genre, origines, ville, métier, apparence, caractère, relations...). Tout ce qui n'est pas reconnu
   est gardé tel quel par le site dans les notes. Tout se passe dans le navigateur, rien n'est envoyé. */
window.LDV_DESCRIBE = (function () {
  'use strict';

  /* ---------- outils ---------- */
  const FROM = 'àâäáãåçéèêëíìîïñóòôöõúùûüýÿ', TO = 'aaaaaaceeeeiiiinooooouuuuyy';
  // minuscules sans accents, longueur identique : les positions du texte normalisé valent pour l'original
  const norm = s => String(s == null ? '' : s).toLowerCase().replace(/[’‘`´]/g, "'").replace(/œ/g, 'e').replace(/æ/g, 'a')
    .replace(/[àâäáãåçéèêëíìîïñóòôöõúùûüýÿ]/g, ch => TO[FROM.indexOf(ch)]);
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const wordRe = (w, plural) => new RegExp('(?<![a-z0-9])' + esc(w) + (plural ? '(?:s|x)?' : '') + '(?![a-z0-9])');
  const hasW = (t, w, plural) => wordRe(norm(w), plural).test(t);
  const anyW = (t, list, plural) => list.some(w => hasW(t, w, plural));
  const cap = s => (s ? s[0].toUpperCase() + s.slice(1) : s);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  // ajoute des frontières de mot à un motif (suffixes de pluriel et de féminin autorisés)
  const wb = re => new RegExp('(?<![a-z0-9])(?:' + re.source + ')(?:s|e|es|ne|nne|ienne|iennes)?(?![a-z0-9])');
  const WB = list => list.map(x => [wb(x[0]), x[1]]);

  // "Têtu|Têtue~ comme une mule" : formes masculine et féminine, avec leur genre
  function forms(raw) {
    const i = raw.indexOf('|');
    if (i < 0) return [{ k: norm(raw), f: null }];
    const a = raw.slice(0, i);
    let b = raw.slice(i + 1), suf = '';
    const j = b.indexOf('~');
    if (j >= 0) { suf = b.slice(j + 1); b = b.slice(0, j); }
    return [{ k: norm(a + suf), f: 'm' }, { k: norm(b + suf), f: 'f' }];
  }

  /* ---------- vocabulaire ---------- */
  const SYN_JOB = {
    flic: 'Policier|Policière', policier: 'Policier|Policière', policiere: 'Policier|Policière', cop: 'Policier|Policière',
    docteur: 'Médecin urgentiste', medecin: 'Médecin urgentiste', chirurgien: 'Médecin urgentiste', cuistot: 'Cuisinier|Cuisinière', chef: 'Cuisinier|Cuisinière',
    barman: 'Bartender', barmaid: 'Bartender', serveur: 'Serveur|Serveuse~ dans un diner', serveuse: 'Serveur|Serveuse~ dans un diner',
    prof: 'Professeur|Professeure~ au lycée', professeur: 'Professeur|Professeure~ au lycée', professeure: 'Professeur|Professeure~ au lycée',
    instituteur: 'Enseignant|Enseignante~ en école primaire', institutrice: 'Enseignant|Enseignante~ en école primaire', maitresse: 'Enseignant|Enseignante~ en école primaire', enseignant: 'Enseignant|Enseignante~ en école primaire', enseignante: 'Enseignant|Enseignante~ en école primaire',
    dev: 'Développeur|Développeuse~ web', developpeur: 'Développeur|Développeuse~ web', developpeuse: 'Développeur|Développeuse~ web', programmeur: 'Développeur|Développeuse~ web', programmeuse: 'Développeur|Développeuse~ web', informaticien: 'Développeur|Développeuse~ web', informaticienne: 'Développeur|Développeuse~ web', codeur: 'Développeur|Développeuse~ web',
    ingenieur: 'Ingénieur|Ingénieure~ logiciel', ingenieure: 'Ingénieur|Ingénieure~ logiciel',
    soldat: 'Ancien|Ancienne~ militaire', militaire: 'Ancien|Ancienne~ militaire', veteran: 'Ancien|Ancienne~ militaire', veterane: 'Ancien|Ancienne~ militaire',
    routier: 'Camionneur|Camionneuse', camionneur: 'Camionneur|Camionneuse', camionneuse: 'Camionneur|Camionneuse', trucker: 'Camionneur|Camionneuse',
    taxi: 'Chauffeur|Chauffeuse~ Uber', vtc: 'Chauffeur|Chauffeuse~ Uber', chauffeur: 'Chauffeur|Chauffeuse~ Uber', uber: 'Chauffeur|Chauffeuse~ Uber',
    secouriste: 'Ambulancier|Ambulancière~ (EMT)', paramedic: 'Ambulancier|Ambulancière~ (EMT)', ambulancier: 'Ambulancier|Ambulancière~ (EMT)', ambulanciere: 'Ambulancier|Ambulancière~ (EMT)',
    sheriff: 'Adjoint|Adjointe~ du shérif', deputy: 'Adjoint|Adjointe~ du shérif',
    retraite: 'Retraité|Retraitée', retraitee: 'Retraité|Retraitée', chomeur: 'Sans emploi pour le moment', chomeuse: 'Sans emploi pour le moment', chomage: 'Sans emploi pour le moment',
    pasteur: 'Pasteur|Pasteure', pretre: 'Pasteur|Pasteure', chanteur: 'Musicien|Musicienne', chanteuse: 'Musicien|Musicienne', guitariste: 'Musicien|Musicienne', pianiste: 'Musicien|Musicienne',
    comedien: 'Acteur|Actrice~ en devenir', comedienne: 'Acteur|Actrice~ en devenir', acteur: 'Acteur|Actrice~ en devenir', actrice: 'Acteur|Actrice~ en devenir',
    mecano: 'Mécanicien|Mécanicienne', nounou: 'Éducateur|Éducatrice~ de jeunes enfants', secretaire: 'Secrétaire', videur: 'Agent|Agente~ de sécurité', garde: 'Agent|Agente~ de sécurité',
    ranger: 'Gardien|Gardienne~ de parc national', fermier: 'Éleveur|Éleveuse~ de bétail', fermiere: 'Éleveur|Éleveuse~ de bétail', eleveur: 'Éleveur|Éleveuse~ de bétail', cowboy: 'Éleveur|Éleveuse~ de bétail',
    freelance: 'Freelance', independant: 'Freelance', cuisinier: 'Cuisinier|Cuisinière', cuisiniere: 'Cuisinier|Cuisinière', vendeur: 'Vendeur|Vendeuse~ en magasin', vendeuse: 'Vendeur|Vendeuse~ en magasin'
  };
  const STOP_STEM = ['ancien', 'charge', 'agent', 'gerant', 'assistant', 'conseiller', 'adjoint', 'reparat', 'proprietaire'];

  const ORIGINS_RAW = [
    ['Amérindiennes', /(amerindien|native american|indien d'amerique|navajo|cherokee|sioux|apache|lakota|premiere nation|autochtone)/],
    ['Afro-américaines', /(afro[- ]?americain|african[- ]american|noir americain|noire americaine|(?<![a-z])black(?![a-z])|(?:homme|femme|garcon|fille|mec|jeune|dame|gars|type|etudiant|etudiante)s? noir(?:e)?s?(?![a-z])|(?<![a-z])(?:un|une) noir(?:e)?(?![a-z])|peau noire|noir de peau|ebene|antillais|haitien|jamaicain|nigerian|senegalais|ghaneen|africain)/],
    ['Latino-américaines', /(latino|latina|hispanique|hispanic|mexicain|portoricain|cubain|colombien|salvadorien|dominicain|guatemalteque|chicano|vénézuélien|venezuelien|espagnol)/],
    ['Cajuns (Louisiane)', /(cajun|creole)/],
    ['Irlandaises', /(irlandais|irish)/],
    ['Italiennes', /(italien|italo|italian)/],
    ['Arabes ou moyen-orientales', /(arabe|libanais|syrien|iranien|irakien|egyptien|moyen-orient|palestinien|marocain|algerien|tunisien|turc|persan)/],
    ["D'Europe de l'Est", /(polonais|russe|ukrainien|roumain|tcheque|hongrois|serbe|croate|europe de l'est|slave|bulgare)/],
    ['Asiatiques', /(asiatique|chinois|japonais|coreen|vietnamien|philippin|thailandais|indien|pakistanais|bengali|sino-americain|asian|taiwanais|cambodgien|hmong)/],
    ['Européennes', /(blanc americain|caucasien|europeen|anglo|wasp|(?:homme|femme|garcon|fille|mec|jeune|dame|gars|type)s? blanc(?:he)?s?(?![a-z])|peau blanche|blanc de peau|allemand|scandinave|anglais|ecossais|suedois|norvegien|hollandais|francais d'origine)/]
  ];

  const ORIGINS = ORIGINS_RAW.map(o => [o[0], wb(o[1])]);
  const STATES = {
    texas: ['Houston, TX', 'Dallas, TX', 'Austin, TX', 'San Antonio, TX'], californie: ['Los Angeles, CA', 'San Diego, CA', 'San Francisco, CA', 'Oakland, CA', 'Sacramento, CA'],
    floride: ['Miami, FL', 'Tampa, FL'], 'new york': ['New York, NY', 'Brooklyn, NY'], illinois: ['Chicago, IL'], georgie: ['Atlanta, GA', 'Savannah, GA'],
    ohio: ['Cleveland, OH', 'Columbus, OH'], michigan: ['Detroit, MI'], pennsylvanie: ['Philadelphia, PA', 'Pittsburgh, PA'], colorado: ['Denver, CO'], arizona: ['Phoenix, AZ', 'Tucson, AZ'],
    nevada: ['Las Vegas, NV'], tennessee: ['Nashville, TN', 'Memphis, TN'], louisiane: ['New Orleans, LA'], oregon: ['Portland, OR', 'Bend, OR'], minnesota: ['Minneapolis, MN', 'Duluth, MN'],
    massachusetts: ['Boston, MA'], alaska: ['Anchorage, AK'], hawai: ['Honolulu, HI'], montana: ['Missoula, MT'], oklahoma: ['Tulsa, OK'], missouri: ['St. Louis, MO', 'Kansas City, MO'],
    wisconsin: ['Milwaukee, WI'], virginie: ['Richmond, VA'], utah: ['Salt Lake City, UT'], idaho: ['Boise, ID'], 'caroline du nord': ['Charlotte, NC', 'Asheville, NC'], 'nouveau-mexique': ['Albuquerque, NM', 'Santa Fe, NM'],
    'etat de washington': ['Seattle, WA', 'Spokane, WA'], maryland: ['Baltimore, MD'], kentucky: ['Louisville, KY'], indiana: ['Indianapolis, IN'], nebraska: ['Omaha, NE'], wyoming: ['Cheyenne, WY'], vermont: ['Burlington, VT'], 'dakota du nord': ['Fargo, ND']
  };
  const SMALL_TOWNS = ['Asheville, NC', 'Bend, OR', 'Duluth, MN', 'Savannah, GA', 'Santa Fe, NM', 'Burlington, VT', 'Fargo, ND', 'Missoula, MT', 'Tulsa, OK', 'Spokane, WA', 'Cheyenne, WY', 'Boise, ID'];
  const CITY_ALIAS = { 'nouvelle-orleans': 'New Orleans, LA', 'nouvelle orleans': 'New Orleans, LA', 'new york city': 'New York, NY', nyc: 'New York, NY', 'san fran': 'San Francisco, CA', philly: 'Philadelphia, PA', vegas: 'Las Vegas, NV', 'salt lake': 'Salt Lake City, UT', 'saint-louis': 'St. Louis, MO', 'st louis': 'St. Louis, MO' };

  const SITUATIONS_RAW = [
    [/celibataire/, 'Célibataire'], [/(?<![a-z])en couple(?![a-z])/, 'En couple'], [/fianc(?:e|ee)s?(?![a-z])/, 'Fiancé|Fiancée'],
    [/c'est compliquee?(?![a-z])|relation compliquee/, "C'est compliqué"], [/(?<![a-z])veuf|veuve/, 'Veuf|Veuve']
  ];
  const LOGEMENTS_RAW = [
    [/colocation|coloc(?![a-z])|colocataire/, 'En colocation'], [/mobile[- ]home|caravane|trailer/, 'Dans un mobile home'], [/residence universitaire|dortoir|dorm/, 'En résidence universitaire'],
    [/chez ses parents|chez sa mere|chez son pere|chez papa et maman/, 'Chez ses parents'], [/chez un ami|chez une amie|chez un proche|hebergee? par/, 'Chez un proche'],
    [/studio/, 'Dans un studio'], [/loft/, 'Dans un loft'], [/maison|pavillon|banlieue|villa/, 'Dans une maison de banlieue'], [/appartement|appart(?![a-z])/, 'Dans un appartement']
  ];
  const EVENTS_RAW = [
    [/(?:perdu|deces|mort) (?:de |d')?(?:son|sa|ses|un|une|leur|pere|mere|frere|soeur|epoux|epouse|mari|femme|fils|fille|meilleur|meilleure)|deuil|veuf|veuve/, "La perte d'un proche"],
    [/divorce|rupture|a ete quitte|l'a quitte|trahi par (?:sa|son) (?:femme|mari|copain|copine)/, 'Une rupture difficile'], [/licencie|perdu son (?:travail|emploi|boulot)/, 'Un licenciement'],
    [/faillite|ruine|banqueroute|perdu (?:toutes?|tout) (?:ses|son)/, 'Une faillite'], [/accident (?:de (?:la )?(?:route|voiture|moto)|grave)/, 'Un accident de la route'],
    [/(?:l')?armee|guerre|irak|afghanistan|vietnam|service militaire|veteran|militaire|soldat/, 'Un service militaire'], [/demenage|a quitte (?:sa|son) (?:ville|etat|pays)|nouveau depart/, "Un déménagement à l'autre bout du pays"],
    [/heritage|heritier|heritiere/, 'Un héritage inattendu'], [/ouragan|tornade|inondation|incendie de foret|catastrophe/, 'Une catastrophe naturelle'], [/maladie|cancer|a survecu|remission/, 'Une maladie surmontée'],
    [/trahison|trahi par (?:un|son|sa) (?:ami|amie|associe|associee|collegue)/, "La trahison d'un ami"], [/succes|gagne a la loterie|promotion/, 'Une réussite inattendue'], [/reconversion|a tout plaque/, 'Une reconversion']
  ];

  // synonymes de caractère : mot normalisé vers entrée de liste
  const SYN_TRAIT = {
    reserve: 'Discret|Discrète', reservee: 'Discret|Discrète', mysterieux: 'Discret|Discrète', mysterieuse: 'Discret|Discrète', taciturne: 'Discret|Discrète', silencieux: 'Discret|Discrète', silencieuse: 'Discret|Discrète',
    sociable: 'Extraverti|Extravertie', 'a l\'aise': 'Extraverti|Extravertie', expansif: 'Extraverti|Extravertie', expansive: 'Extraverti|Extravertie', solitaire: 'Introverti|Introvertie', intelligent: 'Curieux|Curieuse', intelligente: 'Curieux|Curieuse', cultive: 'Curieux|Curieuse', cultivee: 'Curieux|Curieuse',
    ironique: 'Sarcastique', moqueur: 'Sarcastique', moqueuse: 'Sarcastique', rigolo: 'Blagueur|Blagueuse', rigolote: 'Blagueur|Blagueuse', marrant: 'Blagueur|Blagueuse', marrante: 'Blagueur|Blagueuse', farceur: 'Blagueur|Blagueuse',
    stresse: 'Anxieux|Anxieuse', stressee: 'Anxieux|Anxieuse', nerveux: 'Anxieux|Anxieuse', nerveuse: 'Anxieux|Anxieuse', inquiet: 'Anxieux|Anxieuse', inquiete: 'Anxieux|Anxieuse', paranoiaque: 'Anxieux|Anxieuse',
    serieux: 'Sérieux|Sérieuse', austere: 'Sérieux|Sérieuse', rigoureux: 'Méthodique', rigoureuse: 'Méthodique', ordonne: 'Méthodique', ordonnee: 'Méthodique', patriotique: 'Patriote', croyant: 'Croyant|Croyante', pieux: 'Croyant|Croyante', religieux: 'Croyant|Croyante', religieuse: 'Croyant|Croyante',
    reveur: 'Rêveur|Rêveuse', reveuse: 'Rêveur|Rêveuse', romantique: 'Rêveur|Rêveuse', fetard: 'Fêtard|Fêtarde', noceur: 'Fêtard|Fêtarde', noceuse: 'Fêtard|Fêtarde', timide: 'Timide', pessimiste: 'Pessimiste', optimiste: 'Optimiste',
    arrogant: 'Orgueilleux|Orgueilleuse', arrogante: 'Orgueilleux|Orgueilleuse', vaniteux: 'Orgueilleux|Orgueilleuse', vaniteuse: 'Orgueilleux|Orgueilleuse',
    paresseux: 'Procrastinateur|Procrastinatrice', paresseuse: 'Procrastinateur|Procrastinatrice', flemmard: 'Procrastinateur|Procrastinatrice', flemmarde: 'Procrastinateur|Procrastinatrice',
    violent: 'Colérique', violente: 'Colérique', agressif: 'Colérique', agressive: 'Colérique', irascible: 'Colérique', 'soupe au lait': 'Colérique', mechant: 'Cassant|Cassante', mechante: 'Cassant|Cassante',
    obstine: 'Têtu|Têtue', obstinee: 'Têtu|Têtue', menteuse: 'Menteur|Menteuse', manipulateur: 'Menteur|Menteuse', manipulatrice: 'Menteur|Menteuse', radin: 'Radin', imprudent: 'Impulsif|Impulsive', imprudente: 'Impulsif|Impulsive',
    gentil: 'Bienveillant|Bienveillante', gentille: 'Bienveillant|Bienveillante', attentif: 'À l\'écoute', attentive: 'À l\'écoute', altruiste: 'Généreux|Généreuse',
    brave: 'Courageux|Courageuse', audacieux: 'Courageux|Courageuse', audacieuse: 'Courageux|Courageuse', fidele: 'Loyal|Loyale', sincere: 'Honnête', travailleur: 'Travailleur|Travailleuse', bosseur: 'Travailleur|Travailleuse', bosseuse: 'Travailleur|Travailleuse',
    protecteur: 'Protecteur|Protectrice', protectrice: 'Protecteur|Protectrice', amusant: 'Drôle', amusante: 'Drôle', fiable: 'Fiable', debrouillard: 'Débrouillard|Débrouillarde', malin: 'Débrouillard|Débrouillarde', maline: 'Débrouillard|Débrouillarde',
    charmant: 'Charmeur|Charmeuse', charmante: 'Charmeur|Charmeuse', seducteur: 'Charmeur|Charmeuse', seductrice: 'Charmeur|Charmeuse', charismatique: 'Charismatique', leader: 'Charismatique', perfectionniste: 'Perfectionniste',
    jaloux: 'Jaloux|Jalouse', jalouse: 'Jaloux|Jalouse', rancunier: 'Rancunier|Rancunière', rancuniere: 'Rancunier|Rancunière', susceptible: 'Susceptible', indecis: 'Indécis|Indécise', indecise: 'Indécis|Indécise',
    autoritaire: 'Autoritaire', naif: 'Naïf|Naïve', naive: 'Naïf|Naïve', depensier: 'Dépensier|Dépensière', depensiere: 'Dépensier|Dépensière', desorganise: 'Désorganisé|Désorganisée', desorganisee: 'Désorganisé|Désorganisée', accro: 'Bourreau de travail', workaholic: 'Bourreau de travail'
  };
  const SYN_LOISIR = {
    cuisiner: 'Cuisine', patisser: 'Pâtisserie', lire: 'Lecture', livres: 'Lecture', peindre: 'Dessin', dessiner: 'Dessin', ecrire: 'Écriture', courir: 'Course à pied', jogging: 'Course à pied', muscu: 'Musculation', gym: 'Musculation',
    marcher: 'Randonnée', rando: 'Randonnée', 'jeux video': 'Jeux vidéo', gamer: 'Jeux vidéo', gaming: 'Jeux vidéo', films: 'Cinéma', cinema: 'Cinéma', series: 'Séries', musique: 'Concerts de country', country: 'Concerts de country',
    moto: 'Customisation de voitures', mecanique: 'Customisation de voitures', voitures: 'Customisation de voitures', tuning: 'Customisation de voitures', velo: 'Vélo', nager: 'Natation', 'foot americain': 'Football américain', 'football americain': 'Football américain', nfl: 'Football américain',
    basketball: 'Basket', nba: 'Basket', mlb: 'Baseball', peche: 'Pêche', chasse: 'Chasse', camping: 'Camping', barbecue: 'Barbecue', bbq: 'Barbecue', voyager: 'Voyages', photos: 'Photographie', guitare: 'Guitare', piano: 'Piano', chanter: 'Chant', danser: 'Danse', jardin: 'Jardinage',
    bricoler: 'Bricolage', surfer: 'Surf', skate: 'Skate', poker: 'Poker', echecs: 'Jeux de société', bar: 'Karaoké'
  };

  const SITUATIONS = WB(SITUATIONS_RAW), LOGEMENTS = WB(LOGEMENTS_RAW), EVENTS_LIST = WB(EVENTS_RAW);
  const COLORS_HAIR = [
    [10, /rose[s]?(?![a-z])/], [9, /bleu[s]?(?![a-z])/], [5, /platine|blond platine/], [8, /blanc[s]?(?![a-z])|chenu/], [7, /gris|grisonn|poivre et sel/], [6, /roux|rousse|rouquin/],
    [3, /chatain clair|chatains clairs|chatain doree?/], [2, /chatain/], [4, /blond|blonde/], [1, /brun(?:e|s|es)?(?![a-z])/], [0, /noir[s]?(?![a-z])|noire[s]?(?![a-z])|de jais/]
  ];
  const COLORS_EYES = [
    [0, /marron fonce|brun fonce|chocolat/], [1, /marron|bruns?(?![a-z])/], [2, /noisette|ambre|miel/], [3, /vert[s]?(?![a-z])|emeraude/], [4, /bleu[s]?(?![a-z])|azur/], [5, /gris|gris-bleu|acier/], [6, /noir[s]?(?![a-z])|sombres?(?![a-z])/]
  ];
  const SKIN = [
    [0, /(?:peau|teint) (?:tres |extremement )?(?:claire?|pale|blanche|laiteuse|de porcelaine)|tres pale|pale comme/], [3, /bronze|hale|teint dore|peau doree/], [4, /peau mate|teint mat|metisse?|olive/], [5, /peau brune|teint brun|cafe au lait/],
    [6, /peau (?:foncee|noire|ebene)|teint fonce|noir de peau/], [1, /peau claire|teint clair/]
  ];


  /* ---------- analyse ---------- */
  function parse(text, D) {
    const orig = String(text || '').slice(0, 1500);
    let t = norm(orig);
    const v = {}, found = [], rel = [];
    let fVote = 0, mVote = 0;
    const note = s => found.push(s);

    /* relations : "sa sœur Emma", "son ex Jake" (retirées du texte avant le reste de l'analyse) */
    const ROLES = [
      ['Famille', ['frère', 'frere', 'sœur', 'soeur', 'mère', 'mere', 'père', 'pere', 'fils', 'fille', 'cousin', 'cousine', 'oncle', 'tante', 'grand-mère', 'grand-mere', 'grand-père', 'grand-pere', 'neveu', 'nièce', 'niece']],
      ['Partenaire', ['mari', 'épouse', 'epouse', 'femme', 'petit ami', 'petite amie', 'copain', 'copine', 'fiancé', 'fiancée', 'compagnon', 'compagne', 'partenaire']],
      ['Ex', ['ex']], ['Ami·e', ['meilleur ami', 'meilleure amie', 'ami', 'amie', 'pote']], ['Collègue', ['collègue', 'collegue', 'patron', 'patronne', 'associé', 'associée', 'associe']],
      ['Voisin·e', ['voisin', 'voisine']], ['Mentor', ['mentor', 'parrain', 'marraine']], ['Rival·e', ['rival', 'rivale']], ['Ennemi·e', ['ennemi', 'ennemie']], ['Colocataire', ['colocataire']]
    ];
    const cs = w => '[' + w[0].toUpperCase() + w[0] + ']' + w.slice(1);
    const roleAlt = ROLES.map(r => r[1].map(cs).join('|')).join('|');
    const relRe = new RegExp('(?<![\\p{L}])((?:[Ss]a|[Ss]on|[Ss]es|[Ll]eur|[Mm]a|[Mm]on|[Uu]ne?|[Ll]e|[Ll]a)\\s+(?:' + roleAlt + '))(?:\\s+(?:qui\\s+)?(?:s\'appelle|se nomme|nomm[ée]e?|appel[ée]e?|pr[ée]nomm[ée]e?))?\\s+([A-ZÀ-ÝŒ][\\p{L}\'-]+(?:\\s+[A-ZÀ-ÝŒ][\\p{L}\'-]+)?)', 'gu');
    let mm, masked = orig;
    while ((mm = relRe.exec(orig)) && rel.length < 5) {
      const roleWord = norm(mm[1]).replace(/^(?:sa|son|ses|leur|ma|mon|une?|le|la)\s+/, '');
      const lien = (ROLES.find(r => r[1].some(w => norm(w) === roleWord)) || ['Connaissance'])[0];
      rel.push({ nom: mm[2], lien, note: cap(mm[1].trim()) + '.' });
      const tail = (/^[^,.;!?\n]*/.exec(orig.slice(mm.index + mm[0].length)) || [''])[0];
      const len = mm[0].length + tail.length;
      masked = masked.slice(0, mm.index) + ' '.repeat(len) + masked.slice(mm.index + len);
    }
    if (rel.length) { t = norm(masked); note('Relations : ' + rel.map(r => r.nom).join(', ')); }
    const om = masked; // texte original sans les relations

    /* prénom, nom, surnom */
    const STOPN = ['de', 'du', 'la', 'le', 'les', 'et', 'un', 'une', 'qui', 'que', 'elle', 'il', 'est', 'au', 'aux', 'des', 'son', 'sa', 'ses', 'a', 'en', 'dans', 'sur', 'par'];
    const nm = om.match(/(?:[Ss]'appelle|[Ss]e nomme|[Nn]omm[ée]e?|[Aa]ppel[ée]e?|[Pp]r[ée]nomm[ée]e?|[Rr]épond au nom de)\s+([\p{L}][\p{L}'-]+)(?:\s+([A-ZÀ-ÝŒ][\p{L}'-]+))?/u);
    if (nm && STOPN.indexOf(norm(nm[1])) < 0 && nm[1].length > 1) {
      v.prenom = cap(nm[1]);
      if (nm[2] && STOPN.indexOf(norm(nm[2])) < 0) v.nom = cap(nm[2]);
      note('Nom : ' + [v.prenom, v.nom].filter(Boolean).join(' '));
    }
    const nick = om.match(/(?:surnomm[ée]e?|alias|surnom\s*:?)\s*[«"“]?\s*([\p{L}][\p{L}'-]{1,20})/u);
    if (nick && STOPN.indexOf(norm(nick[1])) < 0) { v.surnom = cap(nick[1]); note('Surnom : ' + v.surnom); }

    /* genre */
    if (/(?<![a-z])(?:une|la) (?:jeune |vieille |petite |grande |belle )?(?:femme|fille|dame|nana|meuf|heroine)(?![a-z])/.test(t)) fVote += 3;
    if (/(?<![a-z])(?:un|le) (?:jeune |vieux |petit |grand |beau )?(?:homme|garcon|mec|gars|monsieur|heros)(?![a-z])/.test(t)) mVote += 3;
    if (/(?<![a-z])elle (?:est|a|vit|travaille|aime|veut|habite|porte|cache|n'a|ne|se|fait|adore|deteste|reve)(?![a-z])/.test(t)) fVote += 2;
    if (/(?<![a-z])il (?:est|a|vit|travaille|aime|veut|habite|porte|cache|n'a|ne|se|fait|adore|deteste|reve)(?![a-z])/.test(t)) mVote += 2;
    if (/(?<![a-z])(?:madame|mademoiselle|femme)(?![a-z])/.test(t)) fVote += 1;
    if (/(?<![a-z])monsieur(?![a-z])/.test(t)) mVote += 1;
    const vote = f => { if (f === 'f') fVote += 1; else if (f === 'm') mVote += 1; };

    /* âge */
    let age = null;
    const am = t.match(/(\d{1,3})\s*(?:ans|an(?![a-z])|years?|yo(?![a-z])|y\/o)/) || t.match(/(?:age|agee?) (?:de |d')?(\d{1,3})/);
    if (am) age = +am[1];
    else {
      const AW = [[/vingtaine/, 25], [/trentaine/, 34], [/quarantaine/, 44], [/cinquantaine/, 54], [/soixantaine/, 64], [/septantaine/, 74], [/quinqua/, 52], [/quadra/, 43], [/trentenaire/, 35], [/quadragenaire/, 44], [/cinquantenaire/, 54], [/jeune adulte/, 24], [/age mur|d'age mur/, 52], [/adolescent|(?<![a-z])ado(?![a-z])|lyceen/, 16], [/senior|(?<![a-z])ages?(?![a-z])|vieux|vieille|retraite/, 68], [/(?<![a-z])jeunes?(?![a-z])/, 24]];
      const hit = AW.find(a => a[0].test(t));
      if (hit) age = hit[1];
    }
    if (age) { v.age = clamp(age, 14, 100); note(v.age + ' ans'); }

    /* origines */
    for (const o of ORIGINS) { if (o[1].test(t)) { v.origine = o[0]; note('Origines : ' + o[0].toLowerCase()); break; } }

    /* ville */
    const cities = D.VILLES.map(c => ({ c, k: norm(c.replace(/,\s*[A-Z]{2}$/, '')) }));
    const hits = [];
    cities.forEach(x => { const re = wordRe(x.k); const m = re.exec(t); if (m) hits.push({ c: x.c, i: m.index, k: x.k }); });
    Object.keys(CITY_ALIAS).forEach(a => { const m = wordRe(a.trim()).exec(t); if (m) hits.push({ c: CITY_ALIAS[a], i: m.index, k: a }); });
    if (hits.length) {
      // "New York" contient "York" : on garde la correspondance la plus longue à chaque position
      hits.sort((a, b) => b.k.length - a.k.length);
      const uniq = hits.filter((h, i) => !hits.slice(0, i).some(o => o.c === h.c));
      const live = uniq.find(h => /(?:vit|habite|installe|reside|travaille|base|vivant|demeure)[^.;]{0,25}$/.test(t.slice(Math.max(0, h.i - 30), h.i))) || uniq.sort((a, b) => a.i - b.i)[0];
      v.ville = live.c;
    } else {
      const st = Object.keys(STATES).find(s => wordRe(s).test(t));
      if (st) v.ville = pick(STATES[st]);
      else if (/petite ville|campagne|village|bled|ville de province/.test(t)) v.ville = pick(SMALL_TOWNS);
    }
    if (v.ville) note('Ville : ' + v.ville);

    /* métier */
    const jobs = D.METIERS.concat(D.METIERS_ETUDIANTS, ['Retraité|Retraitée']);
    let best = 0, bestList = [], bestF = null;
    jobs.forEach(raw => {
      const fs = forms(raw);
      const keys = fs.map(f => ({ k: f.k, f: f.f }));
      fs.forEach(f => { const w = f.k.split(/[\s-]+/)[0]; if (w.length >= 6 && !STOP_STEM.some(st => w.indexOf(st) === 0)) keys.push({ k: w, f: f.f }); });
      keys.forEach(x => {
        if (x.k.length < 4 || !wordRe(x.k, true).test(t)) return;
        if (x.k.length > best) { best = x.k.length; bestList = [raw]; bestF = x.f; }
        else if (x.k.length === best && bestList.indexOf(raw) < 0) bestList.push(raw);
      });
    });
    let job = bestList.length ? pick(bestList) : null;
    if (job && /militaire/.test(job)) {
      // "ancien militaire, mécanicien" : on retient l'autre métier, le passé militaire devient un événement marquant
      const others = jobs.filter(raw => raw.indexOf('militaire') < 0 && forms(raw).some(f => f.k.length >= 6 && wordRe(f.k.split(/[\s-]+/)[0], true).test(t)));
      if (others.length) { job = pick(others); bestF = null; }
    }
    if (!job || best < 6) {
      const sy = Object.keys(SYN_JOB).filter(k => k.length >= 3 && wordRe(k, true).test(t)).sort((a, b) => b.length - a.length)[0];
      if (sy && (!job || sy.length > best)) { job = SYN_JOB[sy]; bestF = forms(job).length === 2 && /(?:euse|iere|ice|ienne|resse|ee|trice|ure|ane|maid)$/.test(sy) ? 'f' : null; }
    }
    if (!job) {
      const fm = om.match(/(?:travaille (?:comme|en tant que)|exerce (?:comme|le metier de)|est employ[ée]e? comme|m[ée]tier\s*:|profession\s*:|[Mm]étier de|profession de)\s+(?:un |une |le |la |l')?([\p{L}][\p{L}' -]{2,34}?)(?=[,.;]| et | à | au | dans | depuis | pour |$)/u);
      if (fm) job = cap(fm[1].trim());
    }
    if (job) { v.metier = job; vote(bestF); }

    /* situation, logement */
    const sit = SITUATIONS.find(s => s[0].test(t));
    if (sit) { v.situation = sit[1]; note(sit[1].split('|')[0]); }
    else {
      const rm = /(?<![\p{L}])mari[é]e?s?(?![\p{L}])/iu.test(om) ? 'Marié|Mariée' : /(?<![\p{L}])divorc[éeé]e?s?(?![\p{L}])/iu.test(om) ? 'Divorcé|Divorcée' : /(?<![\p{L}])s[ée]par[ée]e?s?(?![\p{L}])/iu.test(om) ? 'Séparé|Séparée' : null;
      if (rm) { v.situation = rm; note(rm.split('|')[0]); }
    }
    const log = LOGEMENTS.find(s => s[0].test(t));
    if (log) { v.logement = log[1]; note('Logement : ' + log[1].toLowerCase()); }

    /* apparence */
    let work = t;
    const blank = (txt, re) => { const m = txt.match(re); return m ? txt.slice(0, m.index) + ' '.repeat(m[0].length) + txt.slice(m.index + m[0].length) : txt; };
    const sk = SKIN.find(s => wb(s[1]).test(work));
    if (sk) { v.av_peau = sk[0]; note('Teint ' + D.PEAU[sk[0]].n.toLowerCase()); work = blank(work, wb(sk[1])); }
    const eyeM = work.match(/(?:yeux?|regard|iris)\s+(?:d'un |de |d')?(?:(?:tres|plutot|assez|bien)\s+)?([a-z-]+(?:\s+fonce)?)/);
    if (eyeM) {
      const eyeTxt = eyeM[0];
      const hit = COLORS_EYES.find(c => c[1].test(eyeTxt.replace(/^(?:yeux?|regard|iris)\s+/, '')));
      if (hit) { v.av_yeux = hit[0]; note('Yeux ' + D.YEUX[hit[0]].n.toLowerCase()); work = blank(work, new RegExp(esc(eyeM[0]))); }
    }
    const eyeAdj = work.match(/aux? yeux (?:bleu|vert|marron|noisette|gris|noir)s?/);
    if (!eyeM && eyeAdj) { const hit = COLORS_EYES.find(c => c[1].test(eyeAdj[0])); if (hit) { v.av_yeux = hit[0]; note('Yeux ' + D.YEUX[hit[0]].n.toLowerCase()); work = blank(work, new RegExp(esc(eyeAdj[0]))); } }
    // couleur de cheveux : après le mot "cheveux" ou comme adjectif seul (une rousse, un blond...)
    let hairIdx = null;
    const hm = work.match(/(?:cheveux?|chevelure|coiffure|crinière|criniere)\s+((?:[a-z'-]+\s+){0,3}?)(?:(?:de )?(?:couleur )?)?(chatain clair|chatains clairs|platine|rose|rosees?|bleus?|blancs?|gris|grisonnants?|roux|rousses?|chatains?|blonds?|blondes?|bruns?|brunes?|noirs?|jais)(?![a-z])/);
    if (hm) { const hit = COLORS_HAIR.find(c => c[1].test(hm[2])); if (hit) hairIdx = hit[0]; }
    if (hairIdx === null) {
      const solo = work.match(/(?<![a-z])(roux|rousse|rouquin|rouquine|blond|blonde|brun|brune|chatain|chatains|chataine)(?![a-z])/);
      if (solo) { const hit = COLORS_HAIR.find(c => c[1].test(solo[1])); if (hit) hairIdx = hit[0]; if (/e$/.test(solo[1]) && /^(rousse|blonde|brune)$/.test(solo[1])) vote('f'); }
    }
    if (hairIdx !== null) { v.av_cheveux = hairIdx; note('Cheveux ' + D.CHEVEUX[hairIdx].n.toLowerCase()); }
    // coupe
    const CUTS = [['chauve', /chauve|crane (?:chauve|lisse)|tete (?:chauve|lisse)|sans cheveux/], ['ras', /(?:crane|tete|cheveux)\s+(?:[a-z]+\s+)?ras(?:e|es|ee|ees)?(?![a-z])|coupe militaire|buzz cut|tondu|coupe en brosse|cheveux tres courts/],
      ['queue', /queue[- ]de[- ]cheval|ponytail/], ['chignon', /chignon/], ['boucles', /cheveux[^.,;]{0,25}(?:boucle|frise|crepu)|(?<![a-z])afro(?![a-z])|chevelure bouclee|(?:boucle|frise)e?s?(?![a-z]) et/],
      ['mi', /mi-longs?|mi longs?|(?<![a-z])carre(?![a-z])|cheveux[^.,;]{0,20}epaules/], ['long', /cheveux[^.,;]{0,25}longs?|longs? cheveux|longue chevelure|chevelure longue/], ['court', /cheveux[^.,;]{0,25}courts?|courts? cheveux|coupe courte/]];
    const cut = CUTS.find(c => c[1].test(work));
    if (cut) { v.av_coupe = cut[0]; note('Coupe : ' + D.COUPES.find(c => c.v === cut[0]).l.toLowerCase()); }
    // pilosité, lunettes, taches
    if (/barbe de (?:trois|3) jours|barbe naissante|mal rase|barbe de quelques jours|trois jours de barbe/.test(work)) { v.av_pilo = '3j'; note('Barbe de trois jours'); }
    else if (/moustache|moustachu/.test(work)) { v.av_pilo = 'mous'; note('Moustache'); }
    else if (/barbe|barbu|barbichette/.test(work)) { v.av_pilo = 'barbe'; note('Barbe'); }
    else if (/rase de pres|glabre|imberbe|visage lisse/.test(work)) { v.av_pilo = 'non'; }
    if (/lunettes?\s+(?:[a-z]+\s+)?carree?s?|lunettes? de (?:vue )?carree?s?/.test(work)) { v.av_lunettes = 'carrees'; note('Lunettes carrées'); }
    else if (/lunettes?\s+(?:[a-z]+\s+)?ronde?s?|petites lunettes/.test(work)) { v.av_lunettes = 'rondes'; note('Lunettes rondes'); }
    else if (/lunettes?(?! de soleil)|binoclard|porte des verres/.test(work)) { v.av_lunettes = pick(['rondes', 'carrees']); note('Lunettes'); }
    if (/taches? de rousseur|tache de rousseur|freckles|tachete|rousseur/.test(work)) { v.av_taches = 'oui'; note('Taches de rousseur'); }
    // taille
    let cm = null;
    const t1 = work.match(/(?<![0-9])([12])\s*m\s*([0-9]{2})(?![0-9])/) || work.match(/(?<![0-9])([12])[,.]([0-9]{2})\s*m(?![a-z])/);
    const t2 = work.match(/(?<![0-9])(1[3-9][0-9]|2[0-2][0-9])\s*cm/);
    const t3 = work.match(/(?<![0-9])([4-7])\s*(?:'|pieds?|ft|feet)\s*([0-9]{1,2})?/);
    if (t1) cm = (+t1[1]) * 100 + (+t1[2]); else if (t2) cm = +t2[1]; else if (t3) cm = Math.round(((+t3[1]) * 12 + (+t3[2] || 0)) * 2.54);
    else if (/tres grande?|de grande taille|tres haute? de taille|geant|gigantesque|colosse/.test(work)) cm = 192;
    else if (/(?:plutot|assez|bien) grande?(?![a-z])|grande? et |grande?,/.test(work)) cm = 183;
    else if (/de petite taille|tres petite?|minuscule|(?:plutot|assez) petite?(?![a-z])|petite? et /.test(work)) cm = 160;
    if (cm) { v.taille = clamp(cm, 100, 230); note('Taille ' + v.taille + ' cm'); }
    // corpulence
    const COR = [['Athlétique', /athletique|muscl[e]|baraque|bien bati|sportif|sportive|sec et muscle|musculature/], ['Robuste', /costaud|robuste|massif|massive|imposant|imposante|trapu|carrure|large d'epaules|solide|colosse/], ['Ronde', /(?<![a-z])(?:rond|ronde|rondelet|rondelette|enrobe|enrobee|potele|potelee|bien en chair|gros|grosse|corpulent|corpulente|ventripotent|forte(?! d))(?![a-z])/], ['Mince', /mince|maigre|svelte|elance|elancee|fluet|fluette|menu(?![a-z])|filiforme|longiligne|fin(?:e)?(?![a-z]) et/], ['Moyenne', /corpulence moyenne|normal(?:e)? de corpulence|silhouette normale|banal/]];
    const cor = COR.find(c => wb(c[1]).test(work));
    if (cor) { v.corpulence = cor[0]; note('Corpulence ' + cor[0].toLowerCase()); }

    /* style vestimentaire */
    const styles = [];
    D.STYLES.forEach(s => { if (hasW(work, s) || (s === 'Sportif' && false)) styles.push(s); });
    const SYN_STYLE = [[/cowboy|cow-boy|bottes de cowboy|chapeau texan/, 'Western'], [/punk|gothique|goth(?![a-z])|rock|metalleux|emo(?![a-z])|skater|piercing/, 'Alternatif'], [/elegant|elegante|chic|bien habille|classe(?![a-z])/, 'Soigné'], [/costume|cravate|tailleur/, 'Classique'], [/hipster|retro|annees 80|annees 70/, 'Vintage'], [/bleu de travail|ouvrier|salopette|bottes de chantier/, 'Workwear'], [/sweat a capuche|hoodie|baskets|casquette/, 'Streetwear'], [/jean et t-shirt|jean et tee|simple/, 'Décontracté'], [/survetement|jogging|maillot/, 'Tenue de sport d\'équipe']];
    SYN_STYLE.forEach(s => { if (wb(s[0]).test(work) && styles.indexOf(s[1]) < 0) styles.push(s[1]); });
    if (styles.length) { v.style = styles.slice(0, 3); note('Style : ' + v.style.join(', ').toLowerCase()); }

    /* signes distinctifs */
    const sg = work.match(/(cicatrice|tatouage|piercing|grain de beaute|marque de naissance|brulure|boiterie|tache de vin)/);
    if (sg) {
      let s0 = sg.index, e0 = work.slice(s0).search(/[,.;]| et | mais | avec |$/);
      if (e0 < 0) e0 = work.length - s0;
      const art = work.slice(Math.max(0, s0 - 6), s0).match(/(?:une?|des|sa|son) $/);
      const start = art ? s0 - art[0].length : s0;
      const txt = orig.slice(start, s0 + e0).trim();
      if (txt.length > 3) { v.signes = cap(txt.replace(/\s+/g, ' ')) + '.'; note('Signe distinctif : ' + txt); }
    }

    /* caractère : traits, qualités, défauts */
    const lists = { traits: D.TRAITS, qualites: D.QUALITES, defauts: D.DEFAUTS };
    const maxN = { traits: 5, qualites: 3, defauts: 3 };
    const got = { traits: [], qualites: [], defauts: [] };
    const tryAdd = (raw, fv) => {
      for (const key of Object.keys(lists)) {
        if (lists[key].indexOf(raw) >= 0) { if (got[key].indexOf(raw) < 0 && got[key].length < maxN[key]) { got[key].push(raw); vote(fv); } return true; }
      }
      return false;
    };
    Object.keys(lists).forEach(key => lists[key].forEach(raw => {
      forms(raw).forEach(f => { const k = f.k; if (k.length >= 4 && wordRe(k, true).test(t)) { if (got[key].indexOf(raw) < 0 && got[key].length < maxN[key]) { got[key].push(raw); if (f.f === 'f' && f.k !== forms(raw)[0].k) vote('f'); } } });
    }));
    Object.keys(SYN_TRAIT).forEach(k => {
      if (k.length >= 4 && wordRe(norm(k), true).test(t)) {
        const raw = SYN_TRAIT[k];
        tryAdd(raw, forms(raw).length === 2 && /e$/.test(k) ? 'f' : null);
      }
    });
    // un mot peut être à la fois trait et défaut dans les listes (ex. "perfectionniste") : on garde sa première liste
    const seen = new Set();
    Object.keys(got).forEach(key => { got[key] = got[key].filter(r => { if (seen.has(r)) return false; seen.add(r); return true; }); if (got[key].length) v[key] = got[key]; });
    const labels = Object.keys(got).filter(k => got[k].length).map(k => ({ traits: 'Traits', qualites: 'Qualités', defauts: 'Défauts' }[k] + ' : ' + got[k].map(r => r.split('|')[0].split('~')[0].toLowerCase()).join(', ')));

    /* peurs, loisirs */
    const peurs = [];
    const pm = om.match(/(?:a peur|peur|phobie|craint|terrifi[ée]e?|angoiss[ée]e?)\s+(?:de la |de l'|des |du |de |d')\s*([\p{L}][\p{L}' -]{2,34}?)(?=[,.;]| et | mais |$)/u);
    D.PEURS.forEach(raw => { const k = forms(raw)[0].k.replace(/^(?:la |le |les |l'|que )/, ''); if (k.length >= 5 && wordRe(k, true).test(t) && /peur|phobie|craint|terrifi|angoiss|hante|redoute/.test(t)) peurs.push(raw); });
    if (pm && peurs.length === 0) {
      const lead = om.slice(pm.index, pm.index + pm[0].length).match(/(de la |de l'|des |du |de |d')/i);
      const art = lead ? ({ 'de la ': 'La ', "de l'": "L'", 'des ': 'Les ', 'du ': 'Le ', 'de ': '', "d'": '' }[lead[1].toLowerCase()]) : '';
      const val = (art + (art.endsWith("'") || !art ? pm[1] : pm[1])).trim();
      const hit = D.PEURS.find(r => norm(forms(r)[0].k) === norm(val));
      peurs.push(hit || cap(val));
    }
    if (peurs.length) v.peurs = peurs.slice(0, 3);
    const loisirs = [];
    D.LOISIRS.forEach(raw => { const k = norm(raw); if (raw !== 'Mode' && wordRe(k, true).test(t)) loisirs.push(raw); });
    Object.keys(SYN_LOISIR).forEach(k => { if (k.length >= 4 && wordRe(norm(k), true).test(t) && loisirs.indexOf(SYN_LOISIR[k]) < 0) loisirs.push(SYN_LOISIR[k]); });
    if (loisirs.length) { v.loisirs = loisirs.slice(0, 5); note('Loisirs : ' + v.loisirs.join(', ').toLowerCase()); }

    /* motivation, secret, événement marquant */
    const mo = om.match(/(?:[Vv]eut|[Ss]ouhaite|[Rr]êve (?:de|d')|[Cc]herche à|[Aa]imerait|[Aa]mbitionne de|[Vv]oudrait|[Ss]'efforce de)\s*([^,.;]{4,90})/);
    if (mo) { v.motivation = cap(mo[0].replace(/\s+/g, ' ').trim()) + '.'; note('Motivation'); }
    const se = om.match(/(?:[Cc]ache|[Dd]issimule|[Ss]ecrètement|[Aa] menti|[Nn]e dit (?:à )?personne|[Uu]n secret\s*:?)\s*([^.;]{4,100})/);
    if (se) { v.secret = cap(se[0].replace(/\s+/g, ' ').trim()) + '.'; note('Secret'); }
    const ev = EVENTS_LIST.find(e => e[0].test(t));
    if (ev) { v.evenement = ev[1]; note('Événement marquant : ' + ev[1].toLowerCase()); }

    /* genre : votes, puis prénom connu */
    let genre = fVote > mVote ? 'Femme' : mVote > fVote ? 'Homme' : null;
    if (!genre && v.prenom) {
      const p = norm(v.prenom);
      const inPool = k => D.ORIGINES.some(o => o[k].some(n => norm(n) === p));
      const isF = inPool('f'), isM = inPool('m');
      if (isF && !isM) genre = 'Femme'; else if (isM && !isF) genre = 'Homme';
    }
    if (genre) v.genre = genre;
    // libellé lisible d'une entrée de liste, accordée avec le genre final
    const show = raw => { const i = raw.indexOf('|'); if (i < 0) return raw; const a = raw.slice(0, i); let b = raw.slice(i + 1), suf = ''; const j = b.indexOf('~'); if (j >= 0) { suf = b.slice(j + 1); b = b.slice(0, j); } return (genre === 'Femme' ? b : a) + suf; };
    const front = [];
    if (genre) front.push(genre);
    if (v.metier) front.push('Métier : ' + show(v.metier).toLowerCase());
    const labelsLate = [];
    if (v.traits) labelsLate.push('Traits : ' + v.traits.map(x => show(x).toLowerCase()).join(', '));
    if (v.qualites) labelsLate.push('Qualités : ' + v.qualites.map(x => show(x).toLowerCase()).join(', '));
    if (v.defauts) labelsLate.push('Défauts : ' + v.defauts.map(x => show(x).toLowerCase()).join(', '));
    if (v.peurs) labelsLate.push('Peurs : ' + v.peurs.map(x => show(x).toLowerCase()).join(', '));
    found.splice(0, found.length, ...front, ...found.filter(x => !/^(?:Traits|Qualités|Défauts|Peurs) :/.test(x)), ...labelsLate);
    // le nom de famille indique parfois l'origine
    if (!v.origine && v.nom) {
      const n = norm(v.nom), o = D.ORIGINES.find(x => x.noms.some(s => norm(s) === n));
      if (o) { v.origine = o.label; note('Origines : ' + o.label.toLowerCase()); }
    }
    return { v, rel, found, genre: genre || null };
  }

  return { parse };
})();
