/* Alias : rédige le background (l'histoire) d'un personnage à partir de sa fiche.
   Chaque paragraphe est assemblé à partir de phrases types tirées au hasard, dans lesquelles on glisse
   ce que la fiche contient (ville, métier, traits, relations, événement marquant...).
   Les phrases qui parlent d'un élément absent de la fiche ne sont jamais choisies. */
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

  /* ---------- phrases types : [texte, éléments de la fiche nécessaires] ---------- */
  const B = {
    origA: [
      ["{n} est né{e} {epoque}, à {naissance}, dans une famille où l'on comptait chaque dollar. {Il} a grandi avec {fratrie}.", ['naissance', 'fratrie']],
      ["{n} est né{e} à {naissance} et a grandi comme enfant unique, dans une maison où le silence pesait parfois plus que les mots.", ['naissance', 'unique']],
      ["{n} est né{e} {epoque}, à {naissance}, dans un quartier où tout le monde connaissait tout le monde.", ['naissance']],
      ["{n} est {lefils} d'un {pere} et d'une {mere}. {Il} a vu le jour {epoque}, à {naissance}.", ['naissance']],
      ["{n} a grandi à {naissance}, entre une maison trop petite, des voisins bruyants et des étés qui n'en finissaient pas.", ['naissance']],
      ["Né{e} {epoque}, {n} a passé son enfance dans une petite ville où le seul événement de la semaine était le match du vendredi soir.", []],
      ["{n} a grandi {epoque}, dans une famille ordinaire, avec ses règles, ses habitudes et ses disputes autour de la table du dîner.", []],
      ["{lieuN} {n} y est né{e} {epoque}, dans une famille où l'on comptait chaque dollar. {Il} a grandi avec {fratrie}.", ['lieuN', 'fratrie']],
      ["{lieuN} C'est là {qu_n} a vu le jour {epoque}, entre un père {pere} et une mère {mere}.", ['lieuN']],
      ["{n} est né{e} {epoque}, à {naissance}. {lieuN}", ['lieuN']]
    ],
    origB: [
      ["Son père est {pere} et sa mère {mere} : des journées longues, mais jamais un repas sauté.", []],
      ["{n} a surtout été élevé{e} par sa mère, {mere}, qui cumulait deux emplois pour que la famille s'en sorte.", []],
      ["Élevé{e} en grande partie par ses grands-parents, {n} garde le souvenir des dimanches à l'église et du porche au crépuscule.", []],
      ["Ses parents se sont séparés quand {il} avait {agePar} ans, et {n} a longtemps navigué entre deux maisons.", []],
      ["Son père, {pere}, rentrait tard ; sa mère, {mere}, tenait la maison et les comptes.", []],
      ["Son père étant militaire, la famille déménageait tous les deux ans : {n} a changé d'école {ecoles} fois avant ses quatorze ans.", []]
    ],
    origC: [
      ["Très tôt, {n} se trouve un refuge, le seul endroit où {il} oublie le bruit de la maison : {hobby}.", ['hobby']],
      ["C'est aussi l'époque où naît une crainte tenace, qu'{il} n'a jamais vraiment surmontée : {peur}.", ['peur']],
      ["Enfant, {n} était déjà {trait}, ce qui amusait les adultes et agaçait les autres enfants.", ['trait']],
      ["Les étés se passaient dehors, à vélo, jusqu'à ce que les lampadaires s'allument.", []],
      ["L'église, l'école et le terrain de baseball formaient les limites de son monde.", []],
      ["Les fins de mois étaient serrées, et {n} a appris tôt la valeur de l'argent et le prix du silence.", []],
      ["Les étés, les gamins du coin traînaient sur la plage, sur les toits ou devant les épiceries, jusqu'à ce que la ville s'illumine.", ['gta']],
      ["À la maison, la radio ne s'éteignait jamais, entre rap, rock et publicités délirantes, et elle berçait les disputes comme les dîners.", ['gta']],
      ["Les sirènes, la nuit, faisaient partie du décor, et {n} a appris très tôt à ne plus sursauter.", ['gta']],
      ["Un voisin excentrique a appris à {n} à siffler, à ouvrir une serrure et à ne jamais refuser une partie de cartes.", []],
      ["{n} s'était inventé un code secret avec un cousin, et en a gardé l'habitude de tout noter de travers.", []],
      ["L'été de ses neuf ans, {n} a vendu de la limonade à un homme qui s'est révélé être quelqu'un d'important. {Il} ne l'a su que bien plus tard.", []]
    ],
    origD: [
      ["C'est de cette enfance qu'{il} tient son côté {qualite}.", ['qualite']],
      ["C'est là aussi que s'enracine un défaut qu'{il} traîne encore : {il} est {defaut}.", ['defaut']],
      ["Cette période lui a laissé une certitude : rien ne s'obtient sans effort.", []]
    ],
    jeunA: [
      ["Au lycée, {n} était plutôt {trait}, sans jamais être le centre de l'attention.", ['trait']],
      ["Au lycée, {n} traînait avec une bande d'amis inséparables, entre les matchs du vendredi soir et les trajets en voiture sans destination.", []],
      ["Les années de lycée ont été difficiles : notes en dents de scie, orientation floue, et le sentiment de ne pas être à sa place.", []],
      ["{n} faisait la fête le week-end et rattrapait ses devoirs le dimanche soir.", []],
      ["Au lycée, {n} avait une passion qui dévorait son temps libre, au détriment parfois des devoirs : {hobby}.", ['hobby']],
      ["Au lycée, {n} apprenait les règles du quartier plus vite que celles de l'école : qui saluer, qui éviter, quelle rue ne pas traverser à la nuit tombée.", ['gta']]
    ],
    jeunB: [
      ["C'est à cette époque qu'{il} rencontre {rel}, avec qui {il} garde un lien fort encore aujourd'hui.", ['rel']],
      ["Un professeur a vu en {lui} quelque chose {qu_n} n'osait pas encore nommer.", []],
      ["Un premier vrai coup dur, à seize ans, lui apprend que les adultes ne maîtrisent pas tout.", []]
    ],
    jeunC: [
      ["Une bêtise de jeunesse, plus grave qu'{il} ne l'aurait cru, a failli tout compromettre.", []],
      ["À dix-huit ans, {n} a dû choisir entre ce que ses parents espéraient et ce qu'{il} voulait vraiment.", []],
      ["Les premières désillusions sont arrivées vite, avec leur lot de promesses non tenues.", []],
      ["Une nuit de trop dans la mauvaise rue, et {n} a compris que, dans cette ville, les ennuis ne préviennent pas.", ['gta']],
      ["Une année, {n} a changé d'avis sur tout, y compris sur ses amis. Il en reste deux, et ce ne sont pas ceux qu'on croit.", []],
      ["Un incendie, un déménagement ou une dispute (les versions diffèrent) a obligé la famille à repartir de zéro.", []]
    ],
    jeunD: [
      ["Après le lycée, {il} a tenté l'université, puis a travaillé pour la payer, quitte à ralentir son cursus.", []],
      ["Faute de moyens, {il} a rejoint le monde du travail dès la fin du lycée.", ['pasEtu']],
      ["{il} s'est engagé{e} dans l'armée pour quitter une ville devenue trop petite et payer ses études.", ['pasEtu']],
      ["Après un an dans un community college, {n} a compris que ce n'était pas fait pour {lui}.", ['pasEtu']],
      ["Pour payer ses premiers loyers, {il} a enchaîné lavage de voitures, livraisons et plonge dans un restaurant ouvert tard.", ['gta', 'pasEtu']]
    ],
    parcA: [
      ["Les premiers emplois se sont enchaînés : restauration l'été, livraisons la nuit, magasin le week-end.", []],
      ["{n} a commencé tout en bas de l'échelle, en acceptant les horaires que personne ne voulait.", []],
      ["Pendant des années, {il} a multiplié les petits boulots, sans plan précis mais avec beaucoup d'obstination.", []],
      ["Les premiers emplois, {n} les a trouvés au hasard des annonces : un garage, un diner, un entrepôt près du port.", ['gta']]
    ],
    parcB: [
      ["Depuis {annees} ans environ, {il} travaille comme {metier}, un poste qu'{il} a obtenu plus par obstination que par chance.", ['metierPro', 'adulte']],
      ["{n} est aujourd'hui {metier}. Le travail est exigeant, mais {il} s'y est fait une réputation d'être {qualite}.", ['metierPro', 'qualite']],
      ["{n} exerce comme {metier} depuis plusieurs années, et le métier est devenu une grande partie de son identité.", ['metierPro']],
      ["{n} est actuellement {metier}, et jongle entre les cours, un job d'appoint et un budget serré.", ['etudiant']],
      ["Après des années de travail, {n} est désormais {metier} et profite d'un rythme plus lent.", ['retraite']],
      ["{n} est pour l'instant {metier}, et cherche une nouvelle direction.", ['chomage']],
      ["{n} enchaîne les petits boulots, au gré des annonces et des coups de fil, sans jamais savoir de quoi sera fait le mois suivant.", ['precaire']],
      ["Depuis des années, {n} vit de petits boulots : un jour une livraison, le lendemain un chantier, rarement la même chose deux semaines de suite.", ['precaire']],
      ["{n} vit de ses économies, et {il} sait qu'elles ne dureront pas.", ['econ']],
      ["{n} vit de combines, de services rendus et de coups de téléphone qu'{il} ne passe pas devant n'importe qui.", ['combines']]
    ],
    parcC: [
      ["{il} aime son quotidien pour ce qu'il permet de rencontrer, moins pour ce qu'il rapporte.", []],
      ["Le salaire ne suit pas toujours, mais {il} préfère cela à l'ennui.", []],
      ["Il y a des jours où {il} se demande {s_il} n'a pas manqué une autre vie.", []],
      ["Collègues et clients s'accordent sur un point : {n} n'oublie jamais un visage, et ne pardonne pas toujours.", ['metierPro']],
      ["Chaque année, {n} se promet de changer de métier. Chaque année, {il} reste, pour une raison différente.", ['metierPro']]
    ],
    parcD: [
      ["Au fond, {n} garde une idée en tête. {motivation}", ['motivation']]
    ],
    parcE: [
      ["{affil}", ['affil']]
    ],
    ajdA: [
      ["{n} vit aujourd'hui {logement}, à {ville}.", ['ville', 'logement']],
      ["{n} vit aujourd'hui à {ville}, dans un quotidien réglé par les horaires et les petites habitudes.", ['ville']],
      ["{lieuV} {n} y vit aujourd'hui {logement}.", ['lieuV', 'logement']],
      ["{lieuV} C'est là {qu_n} s'est posé{e}, malgré tout.", ['lieuV']],
      ["{n} a fini par se poser à {ville}, un endroit où {il} se sent à moitié ailleurs et à moitié chez {lui}.", ['ville']],
      ["Aujourd'hui, {n} a {age} ans et une vie qui ressemble à un équilibre fragile.", []]
    ],
    ajdB: [
      ["Côté cœur, {il} est {situation}.", ['situation']],
      ["Côté cœur, c'est compliqué, et {n} n'est pas pressé{e} de simplifier les choses.", ['compliquee']],
      ["{rel} reste l'une des personnes sur qui {il} peut compter.", ['rel']]
    ],
    ajdC: [
      ["Pour décompresser : {hobby}.", ['hobby']],
      ["Ses soirées, {il} les passe souvent à retrouver une vieille habitude : {hobby}.", ['hobby']],
      ["Quand la ville devient trop bruyante, {il} file sur la route, vitres baissées, radio à fond.", ['gta']],
      ["Il y a un coin de {ville} où {n} va quand {il} a besoin de réfléchir, et qu'{il} ne montrerait à personne.", ['ville']]
    ],
    ajdD: [
      ["Son principal adversaire reste {luimeme} : {il} est {defaut}, et cela complique parfois ses relations.", ['defaut']],
      ["Une peur suit {n} depuis longtemps : {peur}.", ['peur']],
      ["{n} est à un moment charnière : {il} le sent, sans savoir de quel côté tout va basculer.", []],
      ["Dans cette ville, un faux pas se paie cher, et {n} le sait mieux que personne.", ['gta']],
      ["Ce qui retient {n} à {ville}, {il} ne le dit à personne, pas même à {luimeme}.", ['ville']],
      ["{n} a un projet qu'{il} ne dévoile pas, de peur qu'on le décourage ou, pire, qu'on l'encourage.", []]
    ]
  };

  // un paragraphe par événement marquant : quelques phrases, puis la suite des choses
  const EVT = {
    "Un déménagement à l'autre bout du pays": ["Le tournant est arrivé avec un déménagement à l'autre bout du pays. {n} a tout laissé derrière {lui}, un coffre plein de cartons et une adresse neuve. Les premiers mois ont été solitaires, puis {ville} est devenue une habitude.", "Un jour, {n} a chargé la voiture et traversé le pays. Personne n'attendait {lui} là-bas, et c'est peut-être pour cela que tout a changé."],
    'Une rupture difficile': ["Une rupture a tout fait basculer. {n} a mis du temps à comprendre ce qui s'était brisé, et plus de temps encore à accepter de ne pas avoir la réponse.", "Quand la relation s'est terminée, {n} s'est retrouvé{e} face à {luimeme}, avec des cartons à moitié faits et beaucoup de questions."],
    "La perte d'un proche": ["La perte d'un proche a marqué un avant et un après. {n} a appris à porter un deuil que personne ne voyait, entre les obligations du quotidien et les silences.", "Le décès d'un être cher a bouleversé son équilibre. Depuis, {n} fait attention aux gens qu'{il} aime et ne laisse plus aucune dispute traîner."],
    'Une réussite inattendue': ["Une réussite inattendue a changé la donne. Du jour au lendemain, des portes se sont ouvertes, et {n} a dû apprendre à ne pas se perdre en chemin.", "Rien ne laissait prévoir ce coup de chance, et {n} s'est demandé{e} longtemps {s_il} le méritait vraiment."],
    "La trahison d'un ami": ["La trahison d'un ami a laissé une cicatrice. {n} a longtemps relu les mois précédents, cherchant les signes qu'{il} n'avait pas voulu voir.", "Quelqu'un en qui {il} avait toute confiance l'a laissé{e} tomber au pire moment. Depuis, {n} choisit ses amis avec prudence."],
    'Une rencontre décisive': ["Une rencontre décisive a tout changé. Cette personne a vu en {n} ce que {il} n'osait pas voir, et l'a poussé{e} à avancer.", "Un soir, par hasard, {n} a croisé quelqu'un qui allait compter plus que prévu, et sa vie a pris un autre chemin."],
    'Un accident de la route': ["Un accident de la route a failli tout arrêter. {n} en garde des cicatrices, visibles ou non, et une façon bien à {lui} de regarder la route.", "Quelques secondes sur une route de nuit ont suffi pour que tout bascule, et {n} n'a plus jamais pris la vie pour acquise."],
    'Un service militaire': ["Des années sous l'uniforme ont forgé son caractère. {n} y a appris la discipline, le sens du groupe et ce qu'on ne raconte pas à ceux qui n'y étaient pas.", "Le retour à la vie civile a été plus difficile que le départ, et {n} cherche encore sa place entre deux mondes."],
    'Un échec professionnel': ["Un échec professionnel a brisé une trajectoire qui semblait toute tracée. {n} a dû tout reconstruire, humblement, en reprenant à la base.", "Le projet dans lequel {il} avait tout investi s'est effondré. {n} en a gardé de l'humilité, et un peu de rancœur."],
    'Un héritage inattendu': ["Un héritage inattendu a bouleversé son quotidien. Ce n'était pas une fortune, mais assez pour ouvrir des possibilités, et des questions de famille que personne n'avait envie de poser.", "À la mort d'un parent éloigné, {n} a reçu bien plus qu'{il} ne l'imaginait : un peu d'argent, et surtout des histoires de famille à démêler."],
    'Un licenciement': ["Un licenciement brutal a tout remis en cause. {n} a découvert à quel point son identité dépendait de son travail, et ce que l'on devient quand on n'a plus de badge.", "Le jour où l'on l'a convoqué{e} dans un bureau sans fenêtre, {n} a compris que quelque chose se terminait. Il a fallu des mois pour se relever."],
    'Une faillite': ["Une faillite a tout emporté : l'argent, les certitudes, une part de sa fierté. {n} a appris à demander de l'aide, ce qui n'a jamais été son fort.", "Les dettes se sont accumulées plus vite que les solutions. {n} a perdu beaucoup, mais a gardé ceux qui sont restés."],
    'Une période de solitude': ["Une longue période de solitude a fini par marquer {n}. Les jours se ressemblaient, les messages se faisaient rares, et {il} a appris à vivre avec le silence.", "Pendant des mois, {n} s'est senti{e} invisible. C'est dans ce vide qu'{il} a découvert ce qui comptait vraiment."],
    'Une catastrophe naturelle': ["Une catastrophe naturelle a bouleversé sa région. {n} a vu des voisins tout perdre et a compris que la solidarité tient parfois à un sac de provisions partagé.", "Après la tempête, rien n'était plus pareil. {n} en a gardé un sens aigu de l'urgence et de ce qui vaut la peine d'être sauvé."],
    'Une reconversion': ["Une reconversion a redessiné sa trajectoire. {n} a tout plaqué pour repartir à zéro, au risque de passer pour un fou aux yeux de son entourage.", "Un matin, {n} a décidé qu'{il} ne ferait plus ce métier. Le changement a été rude, mais {il} ne reviendrait pas en arrière."],
    'Une maladie surmontée': ["Une maladie surmontée a changé sa perspective. {n} sait désormais ce que valent les jours ordinaires, et ne supporte plus les gens qui les gaspillent.", "Les mois d'hôpital ont laissé des traces, mais aussi une force tranquille {qu_n} ne se connaissait pas."]
  };
  const EVT_GENERIC = [
    "Un événement a fait basculer les choses, sans prévenir. {n} n'a pas tout de suite mesuré ce qui changeait, mais en quelques mois, plus rien n'était comme avant.",
    "Il y a eu un moment, plus marquant que les autres, où {n} a dû choisir une direction. Ce choix a défini la suite, pour le meilleur et pour le pire.",
    "Un jour, tout s'est accéléré. {n} y a laissé des plumes, mais a découvert une force qu'{il} ne soupçonnait pas."
  ];
  const EVT_AFTER = [
    ["Depuis, {il} est plus {qualite}, quitte à paraître distant{e}.", ['qualite']],
    ["Depuis, {n} reste {defaut}, comme pour se protéger.", ['defaut']],
    ["Depuis, une crainte suit {n} partout : {peur}.", ['peur']]
  ];
  const SECRET_GTA = [
    "{n} doit un service à quelqu'un de dangereux, et sait que la dette finira par être réclamée.",
    "Une nuit, {n} a vu quelque chose qu'{il} n'aurait pas dû voir. {Il} n'en a jamais parlé.",
    "{n} a un jour tourné le dos à quelqu'un qui avait besoin d'aide. Ce souvenir pèse encore sur ses nuits."
  ];
  const SECRET_GENERIC = [
    "Il y a une chose {qu_n} ne raconte jamais, même à ceux qu'{il} aime : un moment du passé dont {il} n'est pas fier{e}.",
    "{n} garde pour {lui} un regret ancien, qu'{il} ressort la nuit quand le sommeil ne vient pas."
  ];

  /* ---------- assemblage ---------- */
  const fill = (tpl, x) => tpl.replace(/\{(\w+)\}/g, (m, k) => (k in x ? x[k] : m));
  const ok = (entry, x) => entry[1].every(k => x[k]);
  function choose(bank, x, used) {
    const pool = bank.filter(e => ok(e, x) && !used.has(e[0]));
    if (!pool.length) return '';
    const e = pick(pool);
    used.add(e[0]);
    return fill(e[0], x);
  }
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

  const SECTIONS = {
    origines: { title: 'Origines', make: (x, used) => {
      // avec une enfance écrite dans la fiche, on ne l'embrouille pas avec des parents tirés au hasard
      const own = !!x.enfanceTxt;
      const parts = [choose(own ? B.origA.filter(e => !/famille|unique|père|mère|\{(?:pere|mere)\}|fratrie|petite ville/.test(e[0])) : B.origA, x, used)];
      if (own) parts.push(x.enfanceTxt);
      // la famille « vient de Cayo Perico » n'a rien à ajouter à une naissance à Cayo Perico
      if (x.heritage && !(x.naissance && x.heritage.indexOf(x.naissance) >= 0) && Math.random() < (x.fort ? 0.9 : 0.55)) parts.push(x.heritage);
      if (!own) parts.push(choose(B.origB, x, used));
      parts.push(choose(B.origC, x, used));
      if (Math.random() < 0.7) parts.push(choose(B.origD, x, used));
      return parts;
    } },
    jeunesse: { title: 'Jeunesse', make: (x, used) => {
      const parts = [choose(B.jeunA, x, used)];
      if (x.rel || Math.random() < 0.5) parts.push(choose(B.jeunB, x, used));
      parts.push(choose(B.jeunC, x, used), choose(B.jeunD, x, used));
      return parts;
    } },
    parcours: { title: 'Parcours', make: (x, used) => {
      const parts = [];
      if (x.parcoursTxt) {
        // le statut (retraité, étudiant, sans emploi) reste dit, même quand le parcours vient de la fiche
        const status = B.parcB.filter(e => e[1].some(k => ['retraite', 'etudiant', 'chomage'].indexOf(k) >= 0));
        parts.push(x.parcoursTxt, choose(status, x, used), choose(B.parcE, x, used));
        if (Math.random() < 0.5) parts.push(choose(B.parcC, x, used));
        parts.push(choose(B.parcD, x, used));
        return parts;
      }
      if (x.adulte || x.mur) parts.push(Math.random() < 0.8 ? choose(B.parcA, x, used) : '');
      parts.push(choose(B.parcB, x, used), choose(B.parcE, x, used));
      if (Math.random() < 0.7) parts.push(choose(B.parcC, x, used));
      parts.push(choose(B.parcD, x, used));
      return parts;
    } },
    tournant: { title: 'Le tournant', make: (x, used) => {
      const list = EVT[x.evenement] || EVT_GENERIC;
      const parts = [fill(pick(list), x)];
      if (Math.random() < 0.85) parts.push(choose(EVT_AFTER, x, used));
      return parts;
    } },
    // quand « Aujourd'hui » est écrit dans la fiche, on ne redit pas où et comment le personnage vit
    aujourdhui: { title: "Aujourd'hui", make: (x, used) => [choose(x.actuelTxt ? B.ajdA.filter(e => !/\{(?:logement|ville|lieuV)\}/.test(e[0])) : B.ajdA, x, used), x.actuelTxt, choose(B.ajdB, x, used), choose(B.ajdC, x, used), choose(B.ajdD, x, used)] },
    secret: { title: 'Le secret', make: (x, used) => [x.secret ? fill('Il y a une chose {qu_n} ne raconte jamais. ', x) + x.secret : fill(pick(x.gta ? SECRET_GENERIC.concat(SECRET_GTA) : SECRET_GENERIC), x)] }
  };
  const PLANS = { court: ['origines', 'parcours', 'aujourdhui'], moyen: ['origines', 'jeunesse', 'parcours', 'tournant', 'aujourdhui'], long: ['origines', 'jeunesse', 'parcours', 'tournant', 'aujourdhui', 'secret'] };

  function section(key, c, disp, f, world) {
    const s = SECTIONS[key], x = context(c, disp, f, world), used = new Set();
    return { k: key, title: s.title, text: tidy(s.make(x, used).filter(Boolean).join(' ')) };
  }
  const KEYS = Object.keys(SECTIONS);
  const TITLES = {};
  KEYS.forEach(k => { TITLES[k] = SECTIONS[k].title; });

  return { section, anecdote, PLANS, KEYS, TITLES };
})();
