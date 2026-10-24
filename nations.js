/* Ligne de vie : origines du personnage.
   Une origine est un pays (« Français|Française »), « Américain|Américaine », ou une ville de l'univers GTA (« Vice City »).
   Chaque pays a ses prénoms et noms ; ceux qui n'en ont pas de propres réutilisent une liste de data.js (from).
   adj : adjectifs reconnus dans une description (sans accents) ; cue : nom du pays, reconnu après « originaire de », « né en »...
   look : eu, mid, dark ou asia, pour que les traits physiques tirés au sort restent plausibles.
   loc : « en France », « au Japon »... pour les phrases du background. */
(function (D) {
  const own = {
    fr: { f: ["Camille", "Léa", "Chloé", "Manon", "Inès", "Juliette", "Margaux", "Élodie", "Océane", "Clémence"], m: ["Pierre", "Julien", "Antoine", "Maxime", "Hugo", "Thomas", "Mathieu", "Baptiste", "Romain", "Étienne"], noms: ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Laurent", "Simon", "Michel", "Lefebvre", "Garnier", "Faure", "Rousseau", "Fournier"] },
    de: { f: ["Anna", "Lena", "Greta", "Heidi", "Katrin", "Sabine", "Ingrid", "Hannah"], m: ["Lukas", "Felix", "Jonas", "Klaus", "Stefan", "Matthias", "Dieter", "Jürgen"], noms: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Hoffmann", "Schulz", "Koch", "Richter"] },
    es: { f: ["Lucía", "Carmen", "Paula", "Elena", "Marta", "Pilar", "Irene", "Rocío"], m: ["Javier", "Pablo", "Álvaro", "Sergio", "Andrés", "Fernando", "Iván", "Enrique"], noms: ["García", "Fernández", "González", "Rodríguez", "López", "Martínez", "Sánchez", "Pérez", "Romero", "Navarro", "Molina", "Ortega"] },
    pt: { f: ["Inês", "Beatriz", "Joana", "Marta", "Rita", "Catarina", "Sofia", "Teresa"], m: ["João", "Tiago", "Rui", "Miguel", "Duarte", "Nuno", "Pedro", "Bruno"], noms: ["Silva", "Santos", "Ferreira", "Pereira", "Oliveira", "Costa", "Rodrigues", "Martins", "Sousa", "Almeida", "Carvalho", "Lopes"] },
    gr: { f: ["Eleni", "Maria", "Sofia", "Katerina", "Anastasia", "Dimitra", "Irini", "Zoe"], m: ["Nikos", "Giorgos", "Dimitris", "Yannis", "Kostas", "Stavros", "Panos", "Theo"], noms: ["Papadopoulos", "Georgiou", "Nikolaidis", "Dimitriou", "Karras", "Alexiou", "Stavrou", "Pappas", "Kouros", "Vasilakis"] },
    br: { f: ["Ana", "Camila", "Fernanda", "Juliana", "Larissa", "Beatriz", "Gabriela", "Luana"], m: ["Lucas", "Rafael", "Thiago", "Gabriel", "Bruno", "Felipe", "Mateus", "Caio"], noms: ["Silva", "Souza", "Oliveira", "Santos", "Lima", "Pereira", "Costa", "Ribeiro", "Alves", "Carvalho", "Gomes", "Barbosa"] },
    ca: { f: ["Marie-Claire", "Nadège", "Roseline", "Shanice", "Keisha", "Latoya", "Natasha", "Chantal"], m: ["Jean-Baptiste", "Wilfrid", "Marcus", "Devon", "Winston", "Tyrone", "Junior", "Kemar"], noms: ["Pierre", "Jean-Louis", "Joseph", "Baptiste", "Charles", "François", "Brown", "Campbell", "Clarke", "Bailey", "Henry", "Morgan"] },
    ao: { f: ["Amara", "Ngozi", "Adaeze", "Fatou", "Aminata", "Chioma", "Aïcha", "Binta"], m: ["Chidi", "Emeka", "Tunde", "Kwame", "Moussa", "Ousmane", "Ibrahima", "Obinna"], noms: ["Okafor", "Adeyemi", "Nwosu", "Okonkwo", "Diop", "Ndiaye", "Sow", "Fall", "Balogun", "Mensah", "Diallo", "Eze"] },
    jp: { f: ["Yuki", "Haruka", "Sakura", "Aiko", "Emi", "Mika", "Rina", "Hana"], m: ["Kenji", "Hiroshi", "Takeshi", "Daichi", "Ryo", "Satoshi", "Yuto", "Kaito"], noms: ["Tanaka", "Suzuki", "Takahashi", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Sato", "Kato"] },
    kr: { f: ["Min-ji", "Ji-woo", "Seo-yeon", "Hye-jin", "Soo-ah", "Eun-ji", "Yuna", "Da-eun"], m: ["Min-jun", "Ji-ho", "Seung-woo", "Hyun-woo", "Dong-hyun", "Tae-yang", "Joon", "Sung-min"], noms: ["Kim", "Lee", "Park", "Choi", "Jung", "Kang", "Cho", "Yoon", "Jang", "Lim"] },
    cn: { f: ["Mei", "Xiu", "Lian", "Jing", "Ling", "Yan", "Fang", "Hui"], m: ["Wei", "Jun", "Ming", "Hao", "Jian", "Bo", "Lei", "Tao"], noms: ["Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Huang", "Zhao", "Wu", "Zhou"] },
    vn: { f: ["Linh", "Lan", "Mai", "Thu", "Hoa", "Trang", "Ngoc", "Huong"], m: ["Minh", "Tuan", "Hung", "Duc", "Long", "Khoa", "Nam", "Thanh"], noms: ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Vu", "Dang", "Bui", "Do", "Ngo"] },
    ph: { f: ["Maricel", "Joy", "Angelica", "Rhea", "Jocelyn", "Cherry", "Liza", "Aileen"], m: ["Jun", "Jayson", "Rodel", "Ramon", "Joey", "Rommel", "Carlo", "Bong"], noms: ["Santos", "Reyes", "Cruz", "Bautista", "Ocampo", "Garcia", "Mendoza", "Aquino", "Villanueva", "Dela Cruz"] },
    in: { f: ["Priya", "Anjali", "Neha", "Kavya", "Ritu", "Meera", "Pooja", "Divya"], m: ["Raj", "Arjun", "Vikram", "Rohan", "Amit", "Sanjay", "Karan", "Ravi"], noms: ["Patel", "Sharma", "Singh", "Gupta", "Kumar", "Reddy", "Mehta", "Iyer", "Joshi", "Kapoor"] }
  };
  // v, loc, look, poids, adj, cue, et soit own (liste ci-dessus) soit from (label d'une liste de data.js)
  const rows = [
    ["Américain|Américaine", "aux États-Unis", "mix", 0, "americain|americaine", "etats-unis|usa", null, null],
    ["Français|Française", "en France", "eu", 3, "francais|francaise", "france", "fr", null],
    ["Italien|Italienne", "en Italie", "eu", 2.5, "italien|italienne", "italie", null, "Italiennes"],
    ["Mexicain|Mexicaine", "au Mexique", "mid", 4.5, "mexicain|mexicaine", "mexique", null, "Latino-américaines"],
    ["Canadien|Canadienne", "au Canada", "eu", 1, "canadien|canadienne", "canada", null, "Européennes"],
    ["Britannique", "au Royaume-Uni", "eu", 1.2, "britannique|anglais|anglaise|ecossais|ecossaise|gallois|galloise", "royaume-uni|angleterre|ecosse|pays de galles", null, "Européennes"],
    ["Irlandais|Irlandaise", "en Irlande", "eu", 1, "irlandais|irlandaise", "irlande", null, "Irlandaises"],
    ["Allemand|Allemande", "en Allemagne", "eu", 1, "allemand|allemande", "allemagne", "de", null],
    ["Espagnol|Espagnole", "en Espagne", "eu", 1, "espagnol|espagnole", "espagne", "es", null],
    ["Portugais|Portugaise", "au Portugal", "eu", 0.8, "portugais|portugaise", "portugal", "pt", null],
    ["Grec|Grecque", "en Grèce", "eu", 0.7, "grec|grecque", "grece", "gr", null],
    ["Russe", "en Russie", "eu", 1, "russe", "russie", null, "D'Europe de l'Est"],
    ["Polonais|Polonaise", "en Pologne", "eu", 0.8, "polonais|polonaise", "pologne", null, "D'Europe de l'Est"],
    ["Ukrainien|Ukrainienne", "en Ukraine", "eu", 0.6, "ukrainien|ukrainienne", "ukraine", null, "D'Europe de l'Est"],
    ["Brésilien|Brésilienne", "au Brésil", "mid", 1.2, "bresilien|bresilienne", "bresil", "br", null],
    ["Colombien|Colombienne", "en Colombie", "mid", 1.6, "colombien|colombienne", "colombie", null, "Latino-américaines"],
    ["Cubain|Cubaine", "à Cuba", "mid", 2, "cubain|cubaine", "cuba", null, "Latino-américaines"],
    ["Dominicain|Dominicaine", "en République dominicaine", "mid", 0.8, "dominicain|dominicaine", "republique dominicaine", null, "Latino-américaines"],
    ["Portoricain|Portoricaine", "à Porto Rico", "mid", 0.8, "portoricain|portoricaine", "porto rico", null, "Latino-américaines"],
    ["Salvadorien|Salvadorienne", "au Salvador", "mid", 0.8, "salvadorien|salvadorienne", "salvador", null, "Latino-américaines"],
    ["Haïtien|Haïtienne", "en Haïti", "dark", 1, "haitien|haitienne", "haiti", "ca", null],
    ["Jamaïcain|Jamaïcaine", "en Jamaïque", "dark", 1, "jamaicain|jamaicaine", "jamaique", "ca", null],
    ["Nigérian|Nigériane", "au Nigeria", "dark", 0.7, "nigerian|nigeriane", "nigeria", "ao", null],
    ["Sénégalais|Sénégalaise", "au Sénégal", "dark", 0.5, "senegalais|senegalaise", "senegal", "ao", null],
    ["Japonais|Japonaise", "au Japon", "asia", 0.3, "japonais|japonaise", "japon", "jp", null],
    ["Coréen|Coréenne", "en Corée", "asia", 0.7, "coreen|coreenne", "coree", "kr", null],
    ["Chinois|Chinoise", "en Chine", "asia", 0.5, "chinois|chinoise", "chine", "cn", null],
    ["Vietnamien|Vietnamienne", "au Vietnam", "asia", 0.4, "vietnamien|vietnamienne", "vietnam", "vn", null],
    ["Philippin|Philippine", "aux Philippines", "asia", 0.5, "philippin|philippine", "philippines", "ph", null],
    ["Indien|Indienne", "en Inde", "mid", 0.5, "indien|indienne", "inde", "in", null],
    ["Libanais|Libanaise", "au Liban", "mid", 0.6, "libanais|libanaise", "liban", null, "Arabes ou moyen-orientales"],
    ["Marocain|Marocaine", "au Maroc", "mid", 0.6, "marocain|marocaine", "maroc", null, "Arabes ou moyen-orientales"],
    ["Algérien|Algérienne", "en Algérie", "mid", 0.5, "algerien|algerienne", "algerie", null, "Arabes ou moyen-orientales"],
    ["Égyptien|Égyptienne", "en Égypte", "mid", 0.5, "egyptien|egyptienne", "egypte", null, "Arabes ou moyen-orientales"],
    ["Turc|Turque", "en Turquie", "mid", 0.5, "turc|turque", "turquie", null, "Arabes ou moyen-orientales"],
    ["Iranien|Iranienne", "en Iran", "mid", 0.4, "iranien|iranienne", "iran", null, "Arabes ou moyen-orientales"],
    ["Amérindien|Amérindienne", "dans une réserve", "mid", 0.5, "amerindien|amerindienne|navajo|cherokee|sioux|apache|lakota", null, null, "Amérindiennes"],
    ["Louisianais|Louisianaise", "en Louisiane", "eu", 0.4, "cajun|cajune|louisianais|louisianaise|creole", "louisiane", null, "Cajuns (Louisiane)"]
  ];
  D.NATIONS = rows.map(r => {
    const n = { v: r[0], loc: r[1], look: r[2], poids: r[3], adj: r[4], cue: r[5] };
    if (r[2] === 'mix') { n.mix = true; n.look = 'eu'; return n; }
    const src = r[6] ? own[r[6]] : D.ORIGINES.find(o => o.label === r[7]);
    n.f = src.f; n.m = src.m; n.noms = src.noms;
    if (r[7]) n.from = r[7];
    return n;
  });

  // villes de l'univers GTA : on peut en être originaire. lieux : quartiers possibles pour la naissance
  // heritW : origines familiales probables (noms et traits physiques) quand on vient de cette ville
  const G = D.VILLES_GROUPES || {};
  const LS = ["Davis (Los Santos)", "Rancho (Los Santos)", "La Mesa (Los Santos)", "El Burro Heights (Los Santos)", "Cypress Flats (Los Santos)", "Strawberry (Los Santos)"];
  const E = 'Européennes', AF = 'Afro-américaines', LA = 'Latino-américaines', AS = 'Asiatiques', IT = 'Italiennes', IR = 'Irlandaises', EE = "D'Europe de l'Est", AR = 'Arabes ou moyen-orientales', AM = 'Amérindiennes';
  D.ORIGINES_VILLES = [
    { v: "Los Santos", key: "los santos", poids: 7, lieux: G['los santos'], heritW: { [E]: 4, [AF]: 3, [LA]: 4, [AS]: 0.8, [IT]: 0.5, [AR]: 0.4 } },
    { v: "Vice City", key: "vice city", poids: 4, lieux: G['vice city'], heritW: { [LA]: 4, [AF]: 3, [E]: 3, [IT]: 1, [EE]: 0.5 } },
    { v: "Liberty City", key: "liberty city", poids: 4, lieux: G['liberty city'], heritW: { [E]: 3, [AF]: 3, [IT]: 2, [IR]: 1.5, [EE]: 1.5, [LA]: 1.5, [AS]: 0.8 } },
    { v: "Cayo Perico", key: "cayo perico", poids: 2.5, lieux: ["Cayo Perico"].concat(LS), heritW: { [LA]: 1 } },
    { v: "San Fierro", key: "san fierro", poids: 1.5, lieux: ["San Fierro"], heritW: { [AS]: 3, [E]: 3, [LA]: 2, [AF]: 1 } },
    { v: "Las Venturas", key: "las venturas", poids: 1, lieux: ["Las Venturas"], heritW: { [E]: 4, [LA]: 2, [AF]: 1.5, [AS]: 0.8, [IT]: 1 } },
    { v: "Blaine County", key: "blaine county", poids: 2, lieux: G['blaine county'], heritW: { [E]: 8, [LA]: 1.5, [AM]: 0.5, [AF]: 0.5 } },
    { v: "Sandy Shores", key: "sandy shores", poids: 1, lieux: ["Sandy Shores (Blaine County)"], heritW: { [E]: 8, [LA]: 1.5, [AM]: 0.5, [AF]: 0.5 } },
    { v: "Paleto Bay", key: "paleto bay|paleto", poids: 1, lieux: ["Paleto Bay (Blaine County)"], heritW: { [E]: 8, [LA]: 1, [AM]: 0.5 } }
  ];

  // le quartier où l'on vit oriente un peu l'origine et les noms : Little Seoul, Little Havana, Davis...
  const TILT = {
    'Little Seoul': { nat: { 'Coréen|Coréenne': 14 }, herit: { [AS]: 10 } },
    'Little Havana': { nat: { 'Cubain|Cubaine': 10 }, herit: { [LA]: 8 } },
    'Little Haiti': { nat: { 'Haïtien|Haïtienne': 12 }, herit: { [AF]: 8 } },
    'Davis': { herit: { [AF]: 5, [LA]: 2.5 } },
    'Chamberlain Hills': { herit: { [AF]: 5, [LA]: 2 } },
    'Strawberry': { herit: { [AF]: 3, [LA]: 2 } },
    'Rancho': { nat: { 'Mexicain|Mexicaine': 4 }, herit: { [LA]: 6 } },
    'El Burro Heights': { nat: { 'Mexicain|Mexicaine': 3 }, herit: { [LA]: 5 } },
    'Cypress Flats': { herit: { [LA]: 4 } },
    'La Mesa': { herit: { [LA]: 3 } },
    'Rockford Hills': { herit: { [E]: 3 } },
    'Burton': { herit: { [E]: 3 } },
    'Vinewood Hills': { herit: { [E]: 3 } },
    'Sandy Shores': { herit: { [E]: 4 } },
    'Paleto Bay': { herit: { [E]: 5 } },
    'Grapeseed': { herit: { [E]: 5 } },
    'Harmony': { herit: { [E]: 4 } },
    'Bohan': { herit: { [AF]: 3, [LA]: 2 } },
    'Cayo Perico': { nat: { 'Colombien|Colombienne': 3, 'Cubain|Cubaine': 3 }, herit: { [LA]: 12 } }
  };
  const tiltOf = ville => TILT[D.cityName ? D.cityName(ville) : ville] || {};
  const inCity = (c, ville) => c.lieux.indexOf(ville) >= 0 || String(ville).indexOf('(' + c.v + ')') >= 0;

  // quel genre d'origine est-ce : un pays (nation), « Américain » (mix), une ville de GTA (city) ou autre chose (other)
  D.originInfo = function (o) {
    o = String(o || '');
    const n = D.NATIONS.find(x => x.v === o);
    if (n) return { kind: n.mix ? 'mix' : 'nation', nation: n };
    const c = D.ORIGINES_VILLES.find(x => x.v === o);
    if (c) return { kind: 'city', city: c };
    return { kind: 'other' };
  };
  // les origines proposées dans le formulaire, selon l'univers : Américain, villes de GTA (univers GTA), puis les pays
  D.originList = function (gta) {
    const us = D.NATIONS[0].v;
    return [us].concat(gta ? D.ORIGINES_VILLES.map(c => c.v) : [], D.NATIONS.slice(1).map(n => n.v));
  };
  // poids du tirage au sort de l'origine ; avec le lieu de vie, qui oriente le tirage (Little Seoul : plutôt coréen)
  D.originWeights = function (gta, ville) {
    const t = tiltOf(ville).nat || {};
    const w = [[D.NATIONS[0].v, gta ? 24 : 50]];
    if (gta) D.ORIGINES_VILLES.forEach(c => w.push([c.v, c.poids * (ville && inCity(c, ville) ? 4 : 1)]));
    D.NATIONS.slice(1).forEach(n => w.push([n.v, n.poids * (t[n.v] || 1)]));
    return w;
  };
  // poids des origines familiales cachées (noms, teint) pour « Américain » et les villes
  D.heritWeights = function (origine, ville) {
    const info = D.originInfo(origine), t = tiltOf(ville).herit || {};
    const base = info.kind === 'city' && info.city.heritW ? info.city.heritW : null;
    return D.ORIGINES.map(o => [o.label, (base ? (base[o.label] || 0) : (o.poids || 1)) * (t[o.label] || 1)]);
  };
  // anciennes fiches : « Latino-américaines » devient « Américain » avec cette origine familiale pour les noms
  D.legacyOrigin = function (o) {
    return D.ORIGINES.some(x => x.label === o) ? o : null;
  };
})(window.LDV);
