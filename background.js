/* Alias : le background (l'histoire) d'un personnage.
   Les textes des parties (origines, jeunesse, parcours, tournant, aujourd'hui, secret) sont écrits par life.js, à partir d'une chronologie
   construite sur la fiche. Ce fichier garde les tables de lieux et de groupes qu'il utilise, et les anecdotes du « Texte libre ». */
window.LDV_BG = (function () {
  'use strict';

  const pick = a => a[Math.floor(Math.random() * a.length)];
  const cap = s => (s ? s[0].toUpperCase() + s.slice(1) : s);
  const lc = s => (s && !/^[A-ZÀ-Ö]{2}/.test(s) ? s[0].toLowerCase() + s.slice(1) : s || '');

  const PERES = ['mécanicien', 'chauffeur routier', 'ouvrier d\'usine', 'électricien', 'plombier', 'soldat', 'facteur', 'commerçant', 'pompier', 'employé de bureau', 'agriculteur', 'gérant de supermarché', 'livreur', 'maçon'];
  const MERES = ['infirmière', 'enseignante', 'caissière', 'serveuse', 'aide-soignante', 'secrétaire médicale', 'coiffeuse', 'comptable', 'agente d\'entretien', 'employée de banque', 'vendeuse', 'assistante dentaire'];
  const HERITAGE = {
    'Latino-américaines': 'Sa famille est arrivée aux États-Unis une génération plus tôt, avec peu de moyens et beaucoup d\'espoir, et l\'espagnol se parlait encore à table.',
    'Asiatiques': 'Ses parents ont traversé l\'océan pour offrir une meilleure vie à leurs enfants, et ne lui ont jamais laissé oublier ce que cela avait coûté.',
    'Arabes ou moyen-orientales': 'La famille a gardé ses traditions et ses repas du dimanche, malgré la distance avec le pays d\'origine.',
    "D'Europe de l'Est": 'Les grands-parents, venus d\'Europe de l\'Est, ont laissé à la famille un goût des histoires tristes et du pain noir.',
    'Irlandaises': 'Les histoires de famille remontent à un arrière-grand-père venu d\'Irlande, et on les raconte encore à chaque réunion.',
    'Italiennes': 'La cuisine de la grand-mère et les grandes tablées italiennes ont rythmé toute son enfance.',
    'Cajuns (Louisiane)': 'À la maison, on parlait encore le français de Louisiane, entre deux parties de cartes et un plat de gombo.',
    'Amérindiennes': 'La famille garde des liens avec sa communauté d\'origine, et les récits des anciens ont façonné sa façon de voir le monde.',
    'Afro-américaines': 'Les récits de famille, de l\'église du quartier aux luttes des grands-parents, ont nourri sa fierté et son exigence.'
  };

  // l'ambiance de chaque quartier de l'univers GTA : une phrase qui peut ouvrir un paragraphe
  const LIEUX = {
    'Vinewood': "À Vinewood, tout le monde a un scénario dans un tiroir et une histoire à raconter à qui voudra l'entendre.",
    'Mission Row': "À Mission Row, les sirènes du commissariat rythment les nuits et personne n'y prête plus attention.",
    'Davis': "À Davis, on apprend très tôt à regarder par-dessus son épaule et à reconnaître les voitures qui ralentissent.",
    'Rockford Hills': "À Rockford Hills, les pelouses sont tondues au millimètre et les secrets se règlent à voix basse.",
    'Vespucci': "À Vespucci, entre la plage, les rollers et les skateurs, la vie ressemble à un éternel été.",
    'Del Perro': "À Del Perro, la jetée et l'odeur de friture donnent l'impression que les vacances ne finissent jamais.",
    'Mirror Park': "À Mirror Park, entre les cafés branchés et les barbecues au bord du lac, tout le monde se connaît de vue.",
    'Strawberry': "À Strawberry, les immeubles serrés et les carrefours bruyants imposent le rythme de la rue.",
    'La Mesa': "À La Mesa, les entrepôts et les ateliers dessinent un paysage où l'on gagne sa vie à la sueur de son front.",
    'Little Seoul': "À Little Seoul, les néons ne s'éteignent jamais et les restaurants ferment bien après minuit.",
    'Chamberlain Hills': "À Chamberlain Hills, on se serre les coudes entre voisins, parce que personne d'autre ne le fera.",
    'Downtown Los Santos': "En plein Downtown de Los Santos, les tours de verre jettent leur ombre sur des trottoirs où l'on se croise sans se regarder.",
    'Burton': "À Burton, les boutiques de luxe côtoient des loyers que seuls quelques-uns peuvent suivre.",
    'Vinewood Hills': "Sur les hauteurs de Vinewood Hills, la ville s'étale en contrebas, et chacun s'y croit un peu au-dessus des autres.",
    'Banning': "À Banning, le port et ses grues rythment les journées, entre containers et horaires de nuit.",
    'El Burro Heights': "À El Burro Heights, la raffinerie crache ses fumées et chacun sait de quoi vivent ses voisins.",
    'Cypress Flats': "À Cypress Flats, les camions et les entrepôts s'étendent à perte de vue et la poussière se glisse partout.",
    'Rancho': "À Rancho, les cours d'immeuble et les murs peints en disent plus long sur le quartier que n'importe quel guide.",
    'Sandy Shores': "À Sandy Shores, la chaleur écrase tout, les mobile homes s'alignent face au désert et l'on se méfie des étrangers.",
    'Paleto Bay': "À Paleto Bay, on vit au rythme des bateaux de pêche et de la scierie, et tout se sait avant la fin de la journée.",
    'Grapeseed': "À Grapeseed, les fermes sont isolées, les chemins sont de terre, et les voisins habitent à dix minutes de voiture.",
    'Harmony': "À Harmony, au bord de la route du désert, on croise surtout des routiers, des motards et des gens qui ne font que passer.",
    'Mount Chiliad': "Au pied du mont Chiliad, entre forêts et sentiers, le téléphone ne passe qu'une fois sur deux.",
    'Ocean Beach': "À Ocean Beach, les néons roses, les palmiers et la musique des terrasses font oublier l'heure.",
    'Little Havana': "À Little Havana, la salsa déborde des fenêtres et le café se sert fort, à toute heure.",
    'Downtown Vice City': "En plein Downtown de Vice City, les fortunes se font et se défont entre deux verres sur un toit.",
    'Vice Point': "À Vice Point, les yachts bordent les quais et les affaires se règlent dans des salons climatisés.",
    'Washington Beach': "À Washington Beach, les hôtels art déco fanés racontent une époque où tout semblait possible.",
    'Little Haiti': "À Little Haiti, les marchés, les couleurs et la musique dans les rues forment une famille élargie.",
    'Broker': "À Broker, entre les ponts, les rames de métro et les briques rouges, la ville ne dort jamais vraiment.",
    'Algonquin': "À Algonquin, les gratte-ciel écrasent tout et chacun court après son prochain rendez-vous.",
    'Bohan': "À Bohan, les immeubles gris et les terrains vagues apprennent à ne rien attendre de personne.",
    'Dukes': "À Dukes, les avenues sont larges et les petites maisons alignées cachent des histoires de famille bien plus bruyantes.",
    'Alderney': "À Alderney, les usines, les entrepôts et le brouillard du port rythment les journées.",
    'Hove Beach': "À Hove Beach, la promenade et les restaurants russes se mêlent à un vent d'océan qui ne s'arrête jamais.",
    'San Fierro': "À San Fierro, la brume, les collines et les tramways donnent à la ville un air d'un autre temps.",
    'Las Venturas': "À Las Venturas, la ville ne dort jamais, entre casinos, néons et promesses d'argent facile.",
    'Cayo Perico': "Sur Cayo Perico, l'île vit au rythme des plantations, de la musique et des silences qu'on apprend à ne pas relever."
  };
  // ce que change l'appartenance à un service ou à un groupe (affiliation)
  const AFFIL_TXT = {
    'LSPD': ["{n} porte l'insigne du LSPD, convaincu{e} qu'une ville se protège patrouille après patrouille, même quand la hiérarchie ne suit pas.", "Au sein du LSPD, {n} a compris que le terrain enseigne plus que l'académie, et que chaque coéquipier devient une seconde famille."],
    'BCSO': ["Adjoint{e} au BCSO, {n} patrouille sur de longues routes où le renfort arrive toujours trop tard.", "Au BCSO, {n} connaît chaque ferme, chaque bar et chaque raccourci du comté, et le comté le lui rend bien."],
    'SAHP': ["{n} appartient à la Highway Patrol et connaît chaque kilomètre d'asphalte entre le désert et la côte.", "À la Highway Patrol, {n} passe ses journées sur la route, entre contrôles, accidents et conducteurs qui ont toujours une bonne excuse."],
    'EMS': ["Au sein de l'EMS, {n} a vu la ville à ses pires heures et appris à garder son calme quand tout le monde crie.", "{n} travaille pour l'EMS, là où chaque minute compte et où l'on ne rentre jamais tout à fait comme on est parti."],
    'LSFD': ["Au LSFD, {n} a appris à courir vers ce dont les autres s'éloignent, et à faire confiance à l'équipe plus qu'à soi-même.", "Sous l'uniforme du LSFD, {n} partage les gardes, les repas à la caserne et une loyauté qui ne se discute pas."],
    'Ballas': ["{n} traîne avec les Ballas, une famille de rue qui exige de la loyauté en échange de sa protection.", "Chez les Ballas, {n} a trouvé un clan, des règles et des ennemis hérités, sans toujours les avoir choisis."],
    'Families': ["{n} est lié{e} aux Families, par le quartier, les amis d'enfance et des dettes d'honneur dont on ne parle pas à voix haute.", "Chez les Families, {n} a trouvé une fidélité de quartier, et la certitude que quelqu'un surveille ses arrières."],
    'Vagos': ["{n} évolue dans l'orbite des Vagos, où le respect se gagne sur la durée et se perd en un instant.", "Avec les Vagos, {n} partage les couleurs, les codes et un territoire que l'on défend sans poser de questions."],
    'Marabunta Grande': ["{n} a rejoint la Marabunta Grande, une famille de rue soudée par le sang, les tatouages et un sens aigu de l'honneur.", "Dans la Marabunta Grande, {n} a appris que la loyauté est une dette qui ne s'éteint jamais."],
    'Lost MC': ["{n} roule avec le Lost MC, un club de motards où la fraternité compte plus que les lois.", "Au Lost MC, {n} a trouvé une bande, une moto et un code qui ne s'écrit nulle part mais que tout le monde connaît."],
    'Mafia': ["{n} gravite autour de la Mafia, où chaque faveur est notée et où le silence est la première des vertus.", "Dans l'ombre de la Mafia, {n} a appris à sourire, à écouter et à ne jamais poser une question de trop."],
    'Cartel': ["{n} travaille dans l'orbite d'un cartel, un monde où l'argent vient vite et où l'on ne quitte pas la partie quand on veut.", "Pour le cartel, {n} rend des services qu'{il} préfère ne pas détailler, en se disant que c'est provisoire."],
    'Merryweather': ["{n} travaille pour Merryweather, une société de sécurité privée qui paie bien et pose peu de questions.", "Chez Merryweather, {n} a appris à exécuter les ordres sans toujours en connaître le but."]
  };

  // ce que dit la famille de ses racines, selon le pays d'origine ({loc} : « en France », « au Japon »)
  const NATION_HERIT = [
    "Les racines de la famille plongent {loc}, et cela se sent dans la cuisine, les fêtes et quelques mots que {n} glisse encore dans ses phrases.",
    "Une partie de la famille vit encore {loc}, et les appels du dimanche rythment les semaines de {n}.",
    "Toutes les histoires de famille viennent de là-bas, {loc}, et {n} les connaît par cœur sans y avoir jamais vécu."
  ];
  // et quand on vient d'une ville de l'univers GTA
  const CITY_HERIT = {
    'Los Santos': "Los Santos a toujours été la ville de {n} : ses embouteillages, ses collines et ses illusions.",
    'Vice City': "{n} est enfant de Vice City, de ses néons, de sa chaleur moite et de ses fortunes qui changent de mains.",
    'Liberty City': "{n} est enfant de Liberty City, de ses ponts, de son métro et de ses quartiers où chacun a son accent.",
    'San Fierro': "San Fierro a laissé à {n} sa brume, ses collines et un goût pour les tramways et les secrets.",
    'Las Venturas': "{n} a grandi dans le bruit des casinos de Las Venturas, où l'on apprend très tôt que la chance se pèse.",
    'Blaine County': "{n} vient du Blaine County, de ses routes poussiéreuses, de ses ranchs et de voisins qu'on ne voit qu'une fois par mois.",
    'Sandy Shores': "{n} vient de Sandy Shores, où la chaleur écrase tout et où l'on se méfie des étrangers.",
    'Cayo Perico': "La famille de {n} vient de Cayo Perico, et l'île, avec ses plantations, sa musique et ses secrets, n'a jamais vraiment quitté la maison.",
    'Paleto Bay': "{n} vient de Paleto Bay, petite ville de pêcheurs et de bûcherons où tout se sait avant la fin de la journée."
  };

  const ordinaryJob = m => !/^(?:étudiant|alternant|retrait|sans emploi|en reconversion|enchaîne|vit de)/i.test(m || '');

  /* ---------- contexte : tout ce que la fiche permet de dire ---------- */
  function context(c, disp, f, world) {
    const v = c.v, g = f === 'f' ? 'f' : 'm', gta = world === 'gta';
    const age = v.age || 30;
    const strip = s => (window.LDV && window.LDV.cityName ? window.LDV.cityName(s) : String(s || '').replace(/,\s*[A-Z]{2}$/, ''));
    const year = 2026 - age, yd = year % 10, dec = Math.floor(year / 10) * 10;
    const decLabel = dec >= 2000 ? '2000' : String(dec).slice(2);
    const epoque = (yd < 4 ? 'au début' : yd < 7 ? 'au milieu' : 'à la fin') + ' des années ' + decLabel;
    const first = a => (a && a.length ? disp(a[0], g) : '');
    const metier = lc(disp(v.metier, g));
    const rel = (c.rel || []).find(r => r.nom);
    const sit = lc(disp(v.situation, g));
    const villes = (window.LDV && window.LDV.VILLES) || [];
    const oi = window.LDV && window.LDV.originInfo ? window.LDV.originInfo(v.origine) : { kind: 'other' };
    const naissance = oi.kind === 'city' ? strip(pick(oi.city.lieux)) : v.ville ? (Math.random() < 0.6 ? strip(v.ville) : strip(pick(villes.filter(x => x !== v.ville)) || v.ville)) : '';
    const sibs = pick([0, 1, 1, 2, 3]);
    const fratrie = sibs === 0 ? '' : pick(sibs === 1 ? ['un petit frère', 'une grande sœur', 'un grand frère', 'une petite sœur'] : sibs === 2 ? ['deux frères', 'deux sœurs', 'un frère et une sœur'] : ['trois frères', 'deux sœurs et un frère', 'trois sœurs']);
    const x = {
      n: disp(v.prenom, g) || 'Le personnage', nom: disp(v.nom, g),
      il: g === 'f' ? 'elle' : 'il', Il: g === 'f' ? 'Elle' : 'Il', e: g === 'f' ? 'e' : '', lui: g === 'f' ? 'elle' : 'lui', luimeme: g === 'f' ? 'elle-même' : 'lui-même',
      qu_il: g === 'f' ? "qu'elle" : "qu'il", s_il: g === 'f' ? 'si elle' : "s'il", lefils: g === 'f' ? 'la fille' : 'le fils',
      age: String(age), epoque, jeune: age < 26 ? 'oui' : '', adulte: age >= 26 && age < 50 ? 'oui' : '', mur: age >= 50 ? 'oui' : '',
      annees: String(Math.max(2, age - 22)),
      ville: strip(v.ville), naissance, logement: lc(v.logement || ''),
      metier, metierPro: ordinaryJob(disp(v.metier, g)) ? metier : '', etudiant: /^étudiant|^alternant/i.test(disp(v.metier, g)) ? metier : '', retraite: /^retrait/i.test(disp(v.metier, g)) ? metier : '',
      chomage: /sans emploi|reconversion/i.test(v.metier || '') ? metier : '',
      hobby: v.loisirs && v.loisirs[0] ? window.LDV_COH.np(disp(v.loisirs[0], g)) : '',
      peur: v.peurs && v.peurs[0] ? lc(disp(v.peurs[0], g)) : '',
      trait: lc(first(v.traits)), qualite: lc(first(v.qualites)), defaut: lc(first(v.defauts)),
      rel: rel ? rel.nom : '', motivation: v.motivation ? cap(v.motivation.trim().replace(/\s+/g, ' ')) : '', secret: v.secret ? cap(v.secret.trim().replace(/\s+/g, ' ')) : '',
      situation: sit && sit !== "c'est compliqué" ? sit : '', compliquee: sit === "c'est compliqué" ? 'oui' : '',
      pere: pick(PERES), mere: pick(MERES), fratrie, unique: sibs === 0 ? 'oui' : '', ecoles: String(pick([2, 3, 4, 5])), agePar: String(pick([6, 8, 9, 11, 12])),
      heritage: oi.kind === 'nation' || oi.kind === 'city' ? '' : HERITAGE[v.herit || v.origine] || '', evenement: v.evenement || '',
      gta: gta ? 'oui' : '',
      enfanceTxt: String(v.enfance || '').replace(/\s+/g, ' ').trim(), parcoursTxt: String(v.parcours || '').replace(/\s+/g, ' ').trim(), actuelTxt: String(v.actuel || '').replace(/\s+/g, ' ').trim()
    };
    x.qu_n = (/^[aeiouyéèêâîôû]/i.test(x.n) ? "qu'" : 'que ') + x.n;
    x.pasEtu = x.etudiant || /études|diplôm|université|école|formation|\bfac\b/i.test(x.parcoursTxt) ? '' : 'oui';
    if (oi.kind === 'nation') x.heritage = fill(pick(NATION_HERIT).replace('{loc}', oi.nation.loc), x);
    else if (oi.kind === 'city') x.heritage = fill(CITY_HERIT[oi.city.v] || '', x);
    x.fort = oi.kind === 'nation' || oi.kind === 'city' ? 'oui' : '';
    const mt = disp(v.metier, g);
    x.precaire = /enchaîne les petits boulots/i.test(mt) ? 'oui' : '';
    x.econ = /^vit de ses économies/i.test(mt) ? 'oui' : '';
    x.combines = /^vit de combines/i.test(mt) ? 'oui' : '';
    if (gta) {
      // l'ambiance du quartier de naissance, puis celle du quartier actuel quand ce n'est pas le même
      x.lieuN = LIEUX[naissance] || '';
      x.lieuV = LIEUX[x.ville] && x.ville !== naissance ? LIEUX[x.ville] : '';
      if (v.affiliation) {
        const lines = AFFIL_TXT[v.affiliation] || ["{n} est affilié{e} à " + v.affiliation + ", ce qui pèse sur ses choix et sur son entourage."];
        x.affil = fill(pick(lines), x);
      }
    }
    return x;
  }

  /* ---------- assemblage ---------- */
  const fill = (tpl, x) => tpl.replace(/\{(\w+)\}/g, (m, k) => (k in x ? x[k] : m));
  const ok = (entry, x) => entry[1].every(k => x[k]);
  // majuscule en début de phrase, espaces propres
  const tidy = s => s.replace(/\s+/g, ' ').replace(/\s+([,.])/g, '$1').replace(/(^|[.!?]\s+)([a-zà-ÿ])/g, (m, a, b) => a + b.toUpperCase()).replace(/\.\s*\./g, '.').trim();

  // anecdotes : de petits épisodes originaux à glisser dans le « Texte libre »
  const ANEC = [
    ["Un hiver, {n} a recueilli un chien errant « pour une nuit ». Le chien est resté quatre ans, et {n} jure que c'est lui qui l'a adopté{e}.", []],
    ["Le jour de ses dix-huit ans, {n} a pris un bus sans regarder la destination. {Il} est revenu{e} trois jours plus tard, avec une histoire qu'{il} ne raconte qu'à moitié.", []],
    ["{n} a un jour gagné un concours de karaoké en chantant une chanson dont {il} ne connaissait pas les paroles. Depuis, {il} est invité{e} à des fêtes où {il} ne connaît personne.", []],
    ["Pendant des années, {n} a signé ses cartes d'anniversaire d'un nom qui n'est pas le sien. La seule personne à avoir deviné est {rel}.", ['rel']],
    ["Une panne de voiture au milieu de nulle part a forcé {n} à passer une nuit chez des inconnus. {Il} en parle encore comme de la meilleure soirée de sa vie.", []],
    ["{n} a prêté un jour sa voiture à un ami, qui l'a rendue avec dix litres d'essence, un bouquet de fleurs fanées dans le coffre et une explication que personne n'a jamais comprise.", []],
    ["Lors d'un mariage auquel {il} n'était pas invité{e}, {n} a fini par prononcer le discours du témoin. Il a été très applaudi.", []],
    ["{n} garde dans un tiroir une lettre jamais envoyée. {Il} la réécrit chaque année, avec un peu moins de colère à chaque fois.", []],
    ["{n} a travaillé une semaine entière sous un faux nom, à cause d'une erreur administrative. {Il} y a gagné deux amis et une réputation.", []],
    ["À {ville}, on parle encore de la fois où {n} a tenu tête à tout un bar, armé{e} d'un seul mot et d'un sourire.", ['ville']],
    ["{n} a failli rater sa propre fête surprise : arrivé{e} en avance, {il} avait aidé à tout installer sans rien comprendre.", []],
    ["Un soir d'orage, {n} a fait une promesse à {rel}. {Il} ne l'a pas encore tenue, aucun des deux n'en parle, et personne ne l'a oubliée.", ['rel']],
    ["Quelqu'un a dit un jour à {n} qu'{il} ferait un bon {metierPro}. C'était pour rire. {Il} l'est devenu{e} pour avoir le dernier mot.", ['metierPro']],
    ["Un jour, pour tordre le cou à sa peur ({peur}), {n} a fait exactement le contraire de ce qu'on attendait de {lui}. Cela n'a pas marché, mais personne ne s'en souvient comme d'un échec.", ['peur']],
    ["{n} a reçu un jour, par erreur, un colis destiné à quelqu'un de {ville}. {Il} l'a porté en personne, a été invité{e} à dîner, et en est reparti{e} avec un ami.", ['ville']],
    ["{n} avait promis de ne plus jamais prêter d'argent. La semaine suivante, {il} en prêtait.", []],
    ["{n} a réparé un jour quelque chose qui ne valait rien, juste pour voir. C'est devenu une habitude, puis une réputation, puis presque un métier.", []],
    ["Au travail, on cite encore une remarque que {n} a faite un mardi matin, devant tout le monde, et que personne n'a oubliée.", ['metierPro']]
  ];
  const ANEC_GTA = [
    ["Une nuit à {ville}, {n} a été pris{e} pour quelqu'un d'autre par trois hommes en costume. {Il} s'en est tiré avec un sourire, une fausse identité de quarante minutes et un numéro de téléphone qu'{il} n'a jamais osé appeler.", ['ville']],
    ["{n} a un jour fait trois fois le tour du pâté de maisons devant un commissariat avant de se décider à entrer. {Il} ne dit pas pourquoi.", []],
    ["Lors d'un tournage à Vinewood, {n} a été figurant six heures derrière un acteur très célèbre. Personne ne l'a repéré à l'écran, sauf {n}, qui regarde la scène à chaque fois qu'elle repasse à la télé.", []],
    ["Un soir de panne d'électricité à {ville}, {n} a organisé un dîner dans la rue pour tout l'immeuble. Depuis, il paraît que chacun lui doit un service.", ['ville']],
    ["{n} a failli acheter un bateau lors d'une vente aux enchères à Del Perro. {Il} ne l'a pas fait, mais la facture d'inscription traîne encore dans sa boîte à gants.", []],
    ["Sur la route de Sandy Shores, {n} a pris un jour en stop un homme avec une valise noire. {Il} ne lui a posé aucune question. L'homme lui a laissé en partant un billet de cent dollars et un conseil : « ne reviens jamais par ici ».", []],
    ["{n} a gagné un jour un concours de danse sur la jetée de Vespucci, devant une foule qui riait au début et applaudissait à la fin.", []],
    ["La nuit de la grande coupure de courant, {n} s'est retrouvé{e} coincé{e} dans un ascenseur avec un inconnu. Ils en parlent encore, chacun de son côté, avec des versions différentes.", []],
    ["{n} a reçu un jour une enveloppe d'un inconnu : trois mille dollars et un mot, « merci pour hier ». {Il} ne se souvient pas d'hier, ni de lui.", []],
    ["Un chauffeur de taxi de Downtown a dit un jour à {n} : « tu finiras bien par savoir où tu vas ». {n} y repense à chaque carrefour.", []]
  ];
  function anecdote(c, disp, f, world) {
    const x = context(c, disp, f, world);
    const all = world === 'gta' ? ANEC.concat(ANEC_GTA) : ANEC;
    const pool = all.filter(e => ok(e, x));
    return tidy(fill(pick(pool)[0], x));
  }

  const PLANS = { court: ['origines', 'parcours', 'aujourdhui'], moyen: ['origines', 'jeunesse', 'parcours', 'tournant', 'aujourdhui'], long: ['origines', 'jeunesse', 'parcours', 'tournant', 'aujourdhui', 'secret'] };
  const KEYS = ['origines', 'jeunesse', 'parcours', 'tournant', 'aujourdhui', 'secret'];
  const TITLES = { origines: 'Origines', jeunesse: 'Jeunesse', parcours: 'Parcours', tournant: 'Le tournant', aujourdhui: "Aujourd'hui", secret: 'Le secret' };
  // vr : une variante, pour que « réécrire » donne un autre texte sur les mêmes faits
  function section(key, c, disp, f, world) {
    return window.LDV_LIFE.section(key, c, disp, f, world, Math.floor(Math.random() * 1e9));
  }
  const DATA = { LIEUX, AFFIL_TXT, HERITAGE, NATION_HERIT, CITY_HERIT };

  return { section, anecdote, PLANS, KEYS, TITLES, DATA };
})();
