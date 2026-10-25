/* Univers d'un personnage : ce qui permet de proposer des idées en rapport avec sa fiche.
   - THEMES : comment reconnaître un univers (métier ou affiliation = job, goûts = like). Les textes sont comparés sans accents, en minuscules.
   - IDEES_T : des idées propres à chaque univers, rangées par champ. Elles ne sont proposées qu'aux personnages concernés
     (les clés finissant par _gta ne servent que dans l'univers GTA). */
window.LDV = window.LDV || {};
(function (D) {
  D.THEMES = [
    { id: 'it', job: /informati|hacker|hackeu|cyber|developpeu|webmaster|data analyst|administrat\S* (?:systeme|reseau)|technicien\S* (?:de support )?informatique|testeu\S* d'intrusion|jeux video|ingenieu\S* logiciel|lifeinvader/, like: /\bgeek\b|bidouill|paranoiaque numerique|hacking|programmation|\bpirat|informaticien/ },
    { id: 'police', job: /polic|lspd|bcso|sahp|sheri|adjoint|ranger|detective|gendarme|marshal|highway patrol|caution judiciaire/ },
    { id: 'soin', job: /infirm|aide-soign|ambulan|\bems\b|medecin|urgentiste|pharmac|dentiste|kinesi|psycholog|veterinaire|service social|pompier|lsfd/ },
    { id: 'atelier', job: /mecanic|garag|depann|customs|carross|electricien|plombier|hvac|climatisation|ouvrier|batiment|usine|maintenance|bucheron|raffinerie|docker|chauffeu|camionneu|conducteu|taxi|livreu|factrice|facteur|postop|macon|soudeu|menuisier|serrurier|demenageu|magasinier|peintre en batiment/ },
    { id: 'service', job: /serveu|barista|bartender|barman|gerant|cuisini|food truck|diner|burger|pizza|up-n-atom|bahama|vendeu|caissi|supermarche|superette|boulang|patissi|coiffeu|tatoueu/ },
    { id: 'bureau', job: /avocat|juridi|juge|notaire|comptable|marketing|commercial|assurance|banqu|immobilier|consultant|bibliothec/ },
    { id: 'artiste', job: /journalist|weazel|paparazzi|photograph|graphiste|musicien|\bacteu|actrice|cascad|animateu|artiste|chanteu|\bdj\b|non-stop-pop|guide des tournages|helicoptere de tournage/ },
    { id: 'ecole', job: /enseignant|professeu|educateu|coach|moniteu|instituteu|pasteu/ },
    { id: 'rue', job: /contrebandi|braqueu|trafiquant|clandestin|pegre|combines|ballas|families|vagos|marabunta|lost mc|mafia|cartel|merryweather|indic|sans etiquette|ancien des|chasseu\S* de primes/ },
    { id: 'arme', job: /militaire|merryweather|garde du corps|agent\S* de securite|gruppe sechs|vigile|veteran/, like: /service militaire|armee|ancien militaire/ },
    { id: 'nature', job: /pecheu|marin|eleveu|fermier|gardien\S* de parc|ranger|bucheron|plongee|apiculteu|agriculteu|jardinier/ },
    { id: 'musique', job: /musicien|\bdj\b|animateu/, like: /musique|guitare|piano|\bchant\b|karaoke|disques|vinyle|concerts|chansons/ },
    { id: 'sport', job: /coach|athlete|boxeu|sportif/, like: /baseball|football|basket|hockey|course a pied|musculation|escalade|natation|boxe|karting/ },
    { id: 'moto', like: /\bmoto|tuning|courses de rue|customisation de voitures|lowrider|restaurer des motos/ }
  ];

  D.IDEES_T = {
    /* ---------- informatique ---------- */
    it: {
      secret: ["A pénétré un système qu'{il} n'aurait jamais dû toucher, et en garde une copie.", "Écrit des outils pour un client anonyme dont {il} ignore tout.", "Vend des accès dont {il} ne parle à personne.", "A laissé une porte dérobée dans un logiciel écrit pour un ancien employeur, et ne l'a jamais refermée.", "Anime sous pseudonyme un forum célèbre dont personne ne connaît l'administrateur."],
      motivation: ["Monter sa propre société de sécurité informatique.", "Écrire l'outil qui changera tout, et le publier sous un autre nom.", "Récupérer des données qu'un ancien patron lui a volées.", "Décrocher un premier contrat en règle, avec une facture et un nom dessus."],
      manies: ["Garde dix onglets ouverts et n'en ferme jamais un.", "Vérifie la source de chaque message qu'{il} reçoit.", "Couvre la caméra de son ordinateur d'un morceau de ruban adhésif.", "Change ses mots de passe à chaque pleine lune et ne les note nulle part.", "Démonte et remonte tout ce qui passe entre ses mains."],
      signes: ["Des lunettes aux verres rayés, réparées avec du ruban adhésif.", "Des doigts qui pianotent dans le vide quand {il} réfléchit.", "Un sweat à capuche taché de café et de soudure."],
      attitude: ["Répond par monosyllabes, sauf quand on parle de technique.", "Parle à voix basse, les yeux sur un écran imaginaire."],
      enfance: ["{prenom} a appris à coder sur un vieil ordinateur récupéré dans une benne de {ville}, faute d'argent pour en acheter un.", "{prenom} a passé son enfance à démonter radios et télévisions dans le garage, pendant que ses parents travaillaient.", "Enfant solitaire, {prenom} préférait les forums et les salons de discussion à la cour de récréation."],
      parcours: ["{prenom} a suivi une formation en informatique, puis a enchaîné les petits contrats freelance sans jamais décrocher de poste stable.", "Autodidacte, {prenom} a appris à coder la nuit, sur des tutoriels gratuits, avant de décrocher ses premiers contrats.", "Sorti{e} d'une école d'informatique sans le sou, {prenom} vit de petites missions : dépannages, sites web, outils sur mesure.", "Un diplôme d'informatique en poche, mais aucun employeur n'a répondu : {prenom} s'est mis{e} à son compte."],
      actuel: ["{prenom} passe ses nuits devant plusieurs écrans, entre un outil à finir et un client à relancer.", "Un contrat arrive de temps en temps ; le reste du temps, {prenom} bricole des outils que personne n'a demandés."],
      accroches: ["Peut dépanner un ordinateur, un téléphone ou un système de sécurité, contre un service.", "Connaît quelqu'un qui peut ouvrir presque n'importe quel accès.", "Cherche un associé pour monter une petite société de sécurité informatique.", "Détient une clé USB que plusieurs personnes aimeraient récupérer."],
      relnote: ["Lui a offert son premier ordinateur.", "Est la seule personne à qui {prenom} confie ses mots de passe."],
      evenement: ["Un piratage qui a mal tourné", "Un contrat annulé du jour au lendemain", "Une perte de données irréparable"],
      traits: ["Paranoïaque numérique", "Geek", "Bidouilleur|Bidouilleuse", "Asocial|Asociale"],
      qualites: ["Ingénieux|Ingénieuse", "Patience devant un écran", "Autodidacte", "Logique"],
      defauts: ["Oublie de manger", "S'endort devant ses écrans"],
      peurs: ["Perdre toutes ses données", "Être repéré|Être repérée en ligne", "Une panne de courant au pire moment"],
      loisirs: ["Compétitions de hacking (CTF)", "Réparer des consoles", "Bricolage électronique", "Programmation", "Hacking", "Montage de PC", "Rétrogaming"],
      style: ["Sweat à capuche et casque", "T-shirts de groupes obscurs"],
      secret_gta: ["Possède un accès au réseau du LSPD."],
      actuel_gta: ["{prenom} revend de temps en temps un outil à quelqu'un de Little Seoul, sans jamais demander à quoi il servira."]
    },

    /* ---------- police et justice ---------- */
    police: {
      secret: ["A fermé les yeux sur une infraction commise par un collègue, et n'a jamais cessé d'y penser.", "Garde dans un tiroir le dossier d'une affaire qu'on lui a demandé d'oublier.", "A failli démissionner la nuit où {il} a failli tirer.", "Tient un carnet des promesses faites aux victimes qu'{il} n'a pas pu tenir."],
      motivation: ["Résoudre l'affaire qui l'a privé{e} de sommeil pendant des années.", "Prouver qu'on peut faire ce métier sans y perdre son humanité.", "Gagner la confiance d'un quartier qui ne regarde plus l'uniforme qu'avec méfiance."],
      manies: ["Note chaque plaque d'immatriculation qui lui paraît louche, même en congé.", "Ne s'assoit jamais dos à la porte, même chez sa mère.", "Garde son badge dans la poche intérieure de chaque veste, y compris celles qu'{il} ne met jamais."],
      signes: ["Un dos raide d'avoir trop longtemps porté la ceinture de service.", "Une cicatrice nette sur l'avant-bras, souvenir d'une interpellation qui a mal tourné."],
      enfance: ["{prenom} a grandi dans une famille de policiers et a mis longtemps à savoir {s_il} portait l'uniforme par choix ou par héritage."],
      parcours: ["{prenom} a passé l'académie de justesse, puis cinq ans de nuits en patrouille avant de décrocher un poste de jour.", "Passé{e} par la sécurité privée puis par l'académie, {prenom} sait ce qu'on ressent des deux côtés d'un cordon de police."],
      actuel: ["{prenom} enchaîne les gardes de nuit, entre rapports en retard et café froid, en gardant un œil sur un dossier qui ne lui appartient pas.", "Entre deux patrouilles, {prenom} s'occupe d'une affaire que personne ne lui a confiée."],
      accroches: ["Peut fermer les yeux sur une petite infraction contre un renseignement.", "Connaît tous les habitués du quartier, et leurs secrets de poche.", "Cherche un témoin qui accepterait enfin de parler.", "A un coéquipier de confiance, et un collègue dont {il} se méfie."],
      relnote: ["Fait équipe avec {prenom} depuis des années.", "Sait ce {qu_prenom} a fait la nuit de l'incident, et ne l'a pas écrit dans le rapport.", "Garde un souvenir étonnamment amical de la nuit où {prenom} l'a interpellé."],
      evenement: ["Une intervention qui a mal tourné", "Une promotion refusée", "Un coéquipier tombé en service"],
      peurs: ["Perdre un équipier", "Une erreur qui coûte une vie", "Être filmé|Être filmée pendant une intervention"],
      loisirs: ["Tir sportif", "Boxe"],
      secret_gta: ["Sait qui, à Mission Row, revend ses rapports au plus offrant."],
      actuel_gta: ["{prenom} partage son temps entre Mission Row, un deuxième job pour les fins de mois et un voisin qu'{il} soupçonne d'être indic."],
      accroches_gta: ["Connaît quelqu'un chez les Ballas qui parle au LSPD, et quelqu'un d'autre qui ne devrait pas."]
    },

    /* ---------- santé et secours ---------- */
    soin: {
      secret: ["A commis une erreur de dosage qu'{il} n'a jamais déclarée, et dont le patient s'est remis sans rien savoir.", "Garde le bracelet d'un patient qu'{il} n'a pas pu sauver.", "Prend des gardes de nuit pour éviter de rentrer dans un appartement vide.", "A déjà soigné quelqu'un que la police recherchait, sans poser de questions."],
      motivation: ["Ne plus jamais rentrer en se demandant si l'on aurait pu faire mieux.", "Ouvrir un jour un cabinet dans un quartier qui n'en a plus.", "Former quelqu'un qui reprendra son poste avec plus de patience qu'{il} n'en a eu."],
      manies: ["Prend le pouls de chaque personne qu'{il} serre dans ses bras.", "Ne mange qu'à des heures impossibles, selon son planning de garde.", "Garde dans chaque sac une paire de gants, un pansement et un stylo qui marche."],
      signes: ["Des mains parfaitement propres, même au milieu du chaos.", "Des cernes de gardes de nuit qui ne partent plus.", "Une odeur de désinfectant qui flotte dans son sillage."],
      enfance: ["{prenom} a grandi avec une mère infirmière de nuit et a appris très tôt à ne pas faire de bruit en rentrant de l'école."],
      parcours: ["Après trois ans de formation, {prenom} a fait sa première nuit de garde et n'a plus jamais voulu faire autre chose.", "{prenom} a commencé comme bénévole aux urgences, avant qu'on lui propose un vrai poste."],
      actuel: ["{prenom} enchaîne les gardes, entre cafés froids et patients qui demandent toujours « combien de temps ».", "{prenom} dort le jour, vit la nuit et croise ses amis une fois par mois."],
      accroches: ["Peut soigner discrètement une blessure qu'on ne veut pas déclarer.", "Connaît tous les services d'urgence de la ville.", "Cherche un remplaçant pour une garde, en échange d'un service."],
      relnote: ["Lui a recousu la main un soir, sans demander d'où venait la blessure.", "A été son patient, puis son ami."],
      evenement: ["Une garde de trente-six heures", "Un patient qui lui a écrit des années plus tard"],
      peurs: ["Un patient qu'on ne peut pas sauver", "Se tromper de dosage", "La première garde en solo"],
      loisirs: ["Cuisiner pour toute l'équipe"],
      actuel_gta: ["{prenom} alterne les gardes à Pillbox Hill et les nuits blanches à regarder les sirènes passer sous sa fenêtre."]
    },

    /* ---------- ateliers, chantiers, route ---------- */
    atelier: {
      secret: ["A déjà trafiqué le compteur d'une voiture pour un ami, puis pour des inconnus.", "Garde dans l'atelier une voiture qui n'appartient à personne, et que personne ne vient réclamer.", "A un deuxième emploi de nuit dont {il} ne parle pas à son patron.", "A signé le contrôle d'un véhicule qui n'aurait jamais dû passer."],
      motivation: ["Ouvrir son propre atelier avant quarante ans.", "Construire de ses mains la voiture qu'{il} n'a jamais pu s'offrir.", "Racheter le camion de son père, retrouvé dans un champ."],
      manies: ["Écoute le moteur de chaque voiture qui passe et diagnostique la panne à voix haute.", "Garde un chiffon dans la poche arrière, même en costume.", "Ne jette jamais une pièce, « au cas où »."],
      signes: ["Une cicatrice de clé à molette sur l'arcade.", "Une casquette d'atelier, délavée par dix étés.", "Un dos de métier : voûté mais solide."],
      enfance: ["{prenom} a appris à lire en déchiffrant les notices de pièces détachées dans l'atelier de son père."],
      parcours: ["Apprenti à seize ans, {prenom} a tout appris sur le tas, avec un patron qui ne disait jamais « bravo ».", "{prenom} a changé trois fois de poste, du chantier à l'atelier, avant de trouver un métier qui lui ressemblait."],
      actuel: ["{prenom} termine ses journées l'huile aux mains et les oreilles pleines de bruit, avec un projet de week-end qui prend toute la place."],
      accroches: ["Peut réparer à peu près n'importe quoi, du moment qu'on ne pose pas de questions.", "Connaît chaque casse, chaque garage et chaque dépanneur de la ville.", "Cherche une pièce introuvable pour un modèle qu'on ne fabrique plus."],
      relnote: ["Lui a vendu sa première voiture, une épave qui roulait quand même.", "Passe tous les samedis à l'atelier de {prenom}, sans rien y réparer."],
      evenement: ["Un accident de chantier", "Une voiture volée dans l'atelier"],
      peurs: ["Une panne sur l'autoroute, de nuit", "Un accident dont {il} serait responsable"],
      loisirs: ["Restaurer une voiture ancienne", "Brocantes de pièces détachées"]
    },

    /* ---------- restauration, commerce, beauté ---------- */
    service: {
      secret: ["A servi un jour une célébrité sans la reconnaître, et ne s'en est aperçu{e} que le lendemain.", "Met de côté, chaque semaine, une partie de ses pourboires pour quelqu'un qui n'en sait rien.", "A pris un jour de l'argent dans la caisse, puis a tout remboursé sans que personne ne le sache.", "Connaît les secrets de tous les habitués, et les garde mieux que son propre mot de passe."],
      motivation: ["Ouvrir son propre comptoir : trois tables, une carte courte et personne pour dire quoi servir.", "Gagner assez pour ne plus jamais compter les pourboires.", "Retrouver la recette que son grand-père n'a jamais écrite."],
      manies: ["Sait ce que chaque habitué va commander avant qu'il ne s'asseye.", "Essuie le comptoir même chez les autres.", "Compte les couverts en entrant dans un restaurant, par déformation professionnelle."],
      signes: ["Une brûlure de poêle sur l'avant-bras, souvenir d'un service de vendredi soir.", "Un tablier plié dans le sac, toujours.", "Une démarche prudente de quelqu'un qui a fait trop de services."],
      enfance: ["{prenom} a grandi derrière le comptoir d'un petit commerce de quartier, à faire ses devoirs entre deux clients."],
      parcours: ["{prenom} a commencé en plonge, puis aux fourneaux, puis en salle, et connaît chaque poste de la maison.", "Après une formation express, {prenom} a quitté l'usine pour un comptoir où tout le monde sait son prénom."],
      actuel: ["{prenom} jongle entre les services de midi et du soir, avec une pause de trois heures qu'{il} passe à dormir.", "Les horaires de {prenom} ne ressemblent à ceux de personne : {il} dîne à quinze heures et déjeune à minuit."],
      accroches: ["Connaît les meilleurs plats de la ville, et qui y est interdit d'entrée.", "Peut faire entrer quelqu'un dans un endroit complet, ce soir seulement.", "Garde une table au fond pour ceux qui ne veulent pas être vus."],
      relnote: ["Lui sert toujours le même café, avant même la commande de {prenom}.", "Est son collègue le plus fiable, et le plus mauvais cuisinier."],
      evenement: ["Un incendie en cuisine", "Une critique assassine"],
      peurs: ["Un service où tout part en vrille", "Une inspection d'hygiène surprise"],
      loisirs: ["Dîners entre collègues après la fermeture", "Collectionner les menus"]
    },

    /* ---------- droit, bureau, finance ---------- */
    bureau: {
      secret: ["A détruit un jour un document qui aurait pu changer l'issue d'un dossier.", "Doit sa carrière à un mensonge de CV qu'{il} a fini par rendre vrai.", "Lit en cachette les mails de son patron, juste pour savoir ce qui va tomber."],
      motivation: ["Monter son propre cabinet, quitte à tout perdre.", "Être la personne qu'on appelle en premier quand tout va mal.", "Se faire respecter par ceux qui l'ont longtemps pris pour un simple exécutant."],
      manies: ["Relit trois fois chaque contrat, même ceux qu'{il} a écrits.", "Garde un stylo de rechange dans chaque poche.", "Arrive toujours une heure avant tout le monde, et part une heure après."],
      signes: ["Un col un peu trop serré, une cravate impeccable.", "Un porte-documents élimé, hérité de quelqu'un d'important."],
      enfance: ["{prenom} a grandi dans une maison où l'on parlait de contrats et de dossiers au dîner, et en a gardé le goût du mot juste."],
      parcours: ["{prenom} a gravi les échelons un stage à la fois, en disant oui à tout ce que les autres refusaient.", "Diplômé{e} avec mention, {prenom} a refusé le poste prestigieux pour un cabinet plus petit, où {il} voyait enfin les gens en face."],
      actuel: ["{prenom} jongle entre trois dossiers, deux échéances et un téléphone qui ne sonne jamais à l'heure qu'il faut."],
      accroches: ["Peut lire un contrat à toute heure, pour un café ou une faveur.", "Connaît la faille dans la plupart des règlements de la ville.", "Cherche un client que personne d'autre ne veut défendre."],
      relnote: ["A lu le contrat de {prenom} avant la signature, et lui a épargné une catastrophe.", "Est l'ancien associé de {prenom} : on ne parle jamais de pourquoi."],
      evenement: ["Un dossier perdu à la dernière minute", "Une promotion volée"],
      peurs: ["Une faute professionnelle", "Perdre un dossier important"],
      loisirs: ["Golf du dimanche", "Échecs"]
    },

    /* ---------- médias, arts, spectacle ---------- */
    artiste: {
      secret: ["A écrit sous pseudonyme les textes d'un artiste devenu célèbre.", "A refusé un grand rôle pour une raison qu'{il} ne dit à personne.", "Garde un enregistrement ancien qui ruinerait la réputation de quelqu'un d'influent."],
      motivation: ["Décrocher enfin le projet qui prouvera qu'{il} n'était pas qu'un second rôle.", "Terminer l'œuvre commencée il y a dix ans, avant que personne ne s'en souvienne.", "Être reconnu{e} pour ce qu'{il} fait, pas pour qui {il} fréquente."],
      manies: ["Note chaque idée sur le premier support venu : une serviette, une main, un ticket.", "Arrive en retard partout, sauf devant un public.", "Observe les gens à la dérobée pour en faire des personnages."],
      signes: ["Des doigts tachés d'encre, de peinture ou de café, selon la saison.", "Un foulard qui ne quitte jamais son cou, hiver comme été.", "Un carnet à spirale qui dépasse toujours de la poche."],
      enfance: ["{prenom} a grandi dans une maison où l'on chantait au lieu de parler, et où le silence servait de punition."],
      parcours: ["{prenom} a enchaîné les castings, les contrats courts et les galères, sans jamais cesser d'y croire.", "Formé{e} sur le tas, {prenom} a fini par vivre de son art, un peu grâce au talent, beaucoup grâce à l'obstination."],
      actuel: ["{prenom} alterne les petits contrats qui paient le loyer et le projet qui ne paie rien, mais qui compte.", "Entre deux projets, {prenom} garde le téléphone allumé, au cas où ce serait le bon appel."],
      accroches: ["Cherche un partenaire créatif pour un projet qui ne rapportera rien, sinon une histoire.", "Connaît quelqu'un qui peut faire entrer n'importe qui dans n'importe quelle soirée.", "A besoin d'un modèle, d'un comédien ou d'un figurant pour un projet fou."],
      relnote: ["Lui a donné sa première chance, et le lui rappelle souvent.", "Sert de muse, de critique et de public à {prenom}, selon l'humeur."],
      evenement: ["Un projet volé par un ami", "Un succès inattendu qui n'a pas duré"],
      peurs: ["Le manque d'inspiration", "Un échec en public", "Être oublié|Être oubliée"],
      loisirs: ["Musées vides le lundi", "Cinéma d'art et d'essai"],
      evenement_gta: ["Un contrat de film perdu à Vinewood"],
      secret_gta: ["A refusé un contrat de Vinewood qui aurait tout changé, et se le reproche chaque matin."],
      actuel_gta: ["{prenom} passe ses journées entre castings à Vinewood et petits contrats, avec un book qui s'étoffe plus vite que le compte en banque."]
    },

    /* ---------- enseignement, accompagnement ---------- */
    ecole: {
      secret: ["A falsifié une note pour sauver un élève de l'exclusion.", "Garde les lettres d'anciens élèves qu'{il} n'a jamais osé relire.", "Rêve de quitter l'enseignement, et se déteste de l'avoir pensé."],
      motivation: ["Sortir un élève du trou dans lequel plus personne ne regarde.", "Écrire le manuel qu'{il} aurait voulu avoir à quinze ans.", "Obtenir le budget d'une salle de classe qui ne fuit pas."],
      manies: ["Corrige tout ce qu'{il} lit, y compris les menus.", "Garde un paquet de craies ou de feutres dans chaque sac.", "Appelle tout le monde par son nom de famille, comme au premier jour de classe."],
      signes: ["Des lunettes sur le front qu'{il} cherche partout.", "Une voix qui porte, héritée de vingt ans de couloirs."],
      enfance: ["{prenom} a eu une institutrice qui lui a tout appris, et qui lui a donné envie de rendre la pareille."],
      parcours: ["{prenom} a commencé comme remplaçant{e}, de classe en classe, avant d'obtenir un poste fixe.", "Ancien{ne} élève du quartier, {prenom} est revenu{e} enseigner là où {il} avait failli décrocher."],
      actuel: ["{prenom} corrige des copies le soir et prépare des cours le week-end, avec un mug trop plein et un chat sur les genoux."],
      accroches: ["Peut donner un cours particulier, ou un coup de main pour un dossier scolaire.", "Connaît tous les enfants du quartier, et leurs familles.", "Cherche des bénévoles pour une sortie de classe."],
      relnote: ["Était son élève, et l'appelle encore par son nom de famille."],
      evenement: ["Un élève retrouvé des années plus tard", "Une classe fermée par manque de budget"],
      peurs: ["Un élève qu'on laisse tomber", "Une classe qui se vide, un jour, sans raison"],
      loisirs: ["Corriger des copies au café", "Bénévolat dans une association de quartier"]
    },

    /* ---------- la rue, les combines, le milieu ---------- */
    rue: {
      secret: ["A balancé un nom, un soir, et en a perdu le sommeil depuis.", "Garde une arme qu'{il} n'a jamais utilisée, au cas où.", "A abandonné un complice pour sauver sa peau, et le croise parfois."],
      motivation: ["Rembourser une dette avant qu'on ne vienne la réclamer autrement.", "Faire un dernier coup, puis tout arrêter : c'est ce qu'{il} se répète depuis des années.", "Sortir un petit frère du milieu avant qu'il ne s'y enfonce."],
      manies: ["Compte les voitures qui le suivent, même à pied.", "Change de trottoir devant chaque voiture de patrouille.", "Garde toujours du liquide sur soi, jamais plus de cinquante dollars à la fois."],
      signes: ["Un tatouage fait vite, un soir, qu'{il} aurait préféré ne pas avoir.", "Une cicatrice qu'on remarque à peine, jusqu'au moment où l'on comprend ce qu'elle est."],
      enfance: ["{prenom} a grandi dans un quartier où l'on apprenait à courir avant d'apprendre à lire.", "Dans la rue de {prenom}, on avait trois choix : l'usine, la prison ou « les grands »."],
      parcours: ["{prenom} a commencé par de petites courses pour un voisin, puis des services, puis des affaires dont {il} préfère ne pas parler.", "Une première condamnation à dix-neuf ans, une seconde chance, puis un retour plus prudent."],
      actuel: ["{prenom} vit entre deux adresses et trois téléphones, en se répétant que c'est temporaire.", "{prenom} change de rue chaque semaine, jamais deux fois la même."],
      accroches: ["Peut obtenir à peu près n'importe quoi, à condition de poser très peu de questions.", "Connaît un raccourci, un entrepôt et un nom qui n'ont rien à faire dans la même phrase.", "Cherche quelqu'un de confiance pour une livraison dont {il} ne dit rien."],
      relnote: ["Sait pour qui travaille {prenom}, et n'a jamais posé la question.", "A grandi dans la même rue que {prenom}, et a choisi l'autre côté."],
      evenement: ["Une arrestation un soir de fête", "Une dette qui a changé d'adresse"],
      evenement_gta: ["Une évasion de Bolingbroke"],
      peurs: ["Une descente à l'aube", "Être trahi|Être trahie par un proche"],
      loisirs: ["Billard dans un bar sans nom"]
    },

    /* ---------- armée, sécurité ---------- */
    arme: {
      secret: ["A quitté l'armée avec un souvenir qu'{il} n'a raconté à personne.", "Garde une lettre jamais envoyée à la famille d'un camarade.", "A refusé un ordre un jour, et en paie toujours le prix."],
      motivation: ["Retrouver un camarade dont {il} n'a plus de nouvelles depuis le retour.", "Apprendre à dormir sans réveil, sans alerte, sans radio.", "Transmettre à quelqu'un ce qu'{il} sait faire sans que cela serve à tuer."],
      manies: ["Se réveille chaque matin à la même heure, sans réveil.", "Fait son lit au carré, même à l'hôtel.", "Ne s'assoit jamais dos à une fenêtre ou à une porte."],
      signes: ["Une plaque d'identité autour du cou, au nom effacé.", "Une posture trop droite pour être naturelle.", "Une cicatrice nette de la tempe au cou, qu'{il} ne commente jamais."],
      enfance: ["{prenom} a grandi dans une famille où l'on s'engageait de père en fils, et où l'on parlait peu."],
      parcours: ["{prenom} s'est engagé{e} à dix-huit ans pour fuir sa ville, et en est revenu{e} avec des habitudes qu'{il} ne perd pas."],
      actuel: ["{prenom} protège des gens qui ne savent pas qu'{il} le fait, pour un salaire qui ne le dit pas non plus."],
      accroches: ["Peut former quelqu'un à se défendre ou à tenir sa place sous pression.", "Connaît d'anciens camarades dans à peu près tous les services de la ville.", "Cherche un contrat sans histoire, et en trouve toujours un compliqué."],
      relnote: ["A servi avec {prenom}, et a gardé le contact malgré tout.", "Doit la vie à {prenom}, et ne lui en a jamais parlé."],
      evenement: ["Un retour sans cérémonie", "Un camarade perdu au combat"],
      peurs: ["Les feux d'artifice", "Le bruit d'un hélicoptère à l'improviste", "Dormir sans fenêtre à portée"],
      loisirs: ["Tir sportif", "Course à pied avant le lever du jour"]
    },

    /* ---------- nature, mer, terre ---------- */
    nature: {
      secret: ["Connaît un coin de forêt ou de côte où {il} cache quelque chose qu'{il} ne montrera à personne.", "A relâché un animal que la loi lui interdisait de garder.", "A pêché là où {il} n'en avait pas le droit, plus d'une fois."],
      motivation: ["Racheter la terre ou le bateau de la famille avant qu'elle ne passe à un promoteur.", "Vivre un jour d'un lopin de terre, d'un bateau et de rien d'autre.", "Protéger un coin de nature que la ville mange un peu plus chaque année."],
      manies: ["Lit le ciel avant de sortir, et se trompe rarement.", "Siffle les oiseaux avec une précision qui énerve ses voisins.", "Ne jette jamais un hameçon, une corde ou un bout de ficelle."],
      signes: ["Un teint tanné par le soleil et le sel.", "Des mains calleuses qui connaissent chaque nœud."],
      enfance: ["{prenom} a grandi loin de tout, entre une ferme, un chien et un voisin qui ne parlait qu'au bétail."],
      parcours: ["{prenom} a quitté la ville pour la mer ou la terre, et n'a jamais regretté d'avoir troqué le bruit contre la patience."],
      actuel: ["{prenom} se lève avant l'aube, rentre à la nuit, et en parle comme d'un privilège."],
      accroches: ["Peut guider quelqu'un dans un coin que peu de gens connaissent.", "Vend du poisson, du miel ou du bois, selon la saison.", "Connaît un chemin discret pour passer d'un comté à l'autre."],
      relnote: ["Lui a appris à pêcher, puis à se taire.", "Partage avec {prenom} un coin que personne d'autre ne connaît."],
      evenement: ["Un naufrage", "Un hiver sans récolte"],
      peurs: ["Une tempête en mer", "Un incendie de forêt"],
      loisirs: ["Randonnée en solitaire"]
    },

    /* ---------- statuts : études, retraite, précarité ---------- */
    etudiant: {
      secret: ["A triché à un examen décisif, et obtient depuis ses meilleures notes par peur d'être découvert{e}.", "Vit sur le canapé d'un ami depuis la fin de son bail, et personne à la fac ne le sait."],
      motivation: ["Décrocher son diplôme sans s'endetter pour vingt ans.", "Prouver à sa famille que ces études en valaient la peine.", "Trouver un stage qui ne se résume pas au café et à la photocopieuse."],
      manies: ["Révise mieux à la dernière minute, le sait, et recommence chaque semestre.", "Dort entre deux cours dans la même salle vide du bâtiment B."],
      parcours: ["{prenom} est encore en pleine formation, entre cours, révisions et un petit boulot pour payer le loyer.", "{prenom} a obtenu une bourse de justesse, et ne sait pas encore si c'est une chance ou une pression.", "{prenom} porte les espoirs de toute la famille depuis qu'{il} est entré{e} à la fac, et en tremble parfois.", "{prenom} a changé de filière une fois, et ne sait pas encore {s_il} a eu raison."],
      actuel: ["{prenom} partage son temps entre les amphis, la bibliothèque et un job d'appoint qui ne laisse que les nuits.", "À la fac, {prenom} est connu{e} de tout le monde, sans que personne ne sache vraiment qui {il} est."],
      accroches: ["Peut partager ses cours, un coup de main pour un devoir ou un canapé pour dormir.", "Cherche un colocataire ou un binôme pour les projets de groupe."],
      relnote: ["Se sont rencontrés en cours et ne se sont plus quittés.", "Partage les notes et les galères de la fac avec {prenom}."],
      evenement: ["Un examen raté de peu", "Une bourse obtenue in extremis"],
      loisirs: ["Soirées d'étudiants", "Révisions à la bibliothèque jusqu'à la fermeture"]
    },
    retraite: {
      secret: ["A caché toute sa vie un talent qu'{il} n'a osé montrer qu'à la retraite.", "Sait quelque chose sur un ancien notable de la ville, et attend qu'il ne puisse plus nuire."],
      motivation: ["Transmettre ce qu'{il} sait à quelqu'un qui voudra l'entendre.", "Réparer un lien avec un enfant ou un ami perdu de vue.", "Voir enfin la mer qu'{il} n'a jamais eu le temps de regarder."],
      manies: ["Fait la sieste à heure fixe, et le nie.", "Lit le journal en trois étapes : nécrologies, météo, mots croisés."],
      parcours: ["{prenom} a travaillé toute sa vie pour mériter un repos dont {il} ne sait pas quoi faire.", "Après quarante ans au même poste, {prenom} s'est découvert{e} une vie entière à remplir."],
      actuel: ["{prenom} se lève tôt par habitude, fait le tour du quartier et connaît tout le monde.", "La retraite de {prenom} ressemble à une série d'invitations qu'{il} n'ose pas refuser."],
      accroches: ["Peut raconter la ville d'avant, et sait où est enterré chaque secret.", "Cherche quelqu'un pour une partie de cartes, de dames ou d'échecs."],
      relnote: ["Vient chaque semaine prendre le café, par politesse d'abord, puis par plaisir."],
      evenement: ["Un dernier jour de travail sans cérémonie"],
      peurs: ["La solitude des dimanches", "Oublier un nom"],
      loisirs: ["Parties de cartes au club", "Jardinage"]
    },
    precaire: {
      secret: ["A dormi dans sa voiture une semaine entière sans que personne ne le sache.", "Doit une petite somme à beaucoup de gens, et tient les comptes sur un carnet."],
      motivation: ["Décrocher enfin un poste fixe, avec un contrat, un nom sur la porte et des congés payés.", "Sortir de l'engrenage des petites missions avant d'y avoir passé sa vie."],
      manies: ["Garde chaque ticket de caisse, comme si l'on pouvait un jour en rembourser un.", "Compte l'argent liquide deux fois avant de sortir."],
      parcours: ["{prenom} a changé d'emploi plus vite que de chaussures, sans jamais pouvoir dire que c'était un choix.", "Un contrat court, puis un autre, puis une longue période creuse : {prenom} a appris à vivre sans filet."],
      actuel: ["{prenom} guette les annonces, accepte tout ce qui paie, et garde un peu d'argent pour la semaine suivante.", "{prenom} cumule les missions à la journée, entre un coup de fil le matin et une avance le soir."],
      accroches: ["Accepte à peu près n'importe quelle mission, si elle paie le soir même.", "Connaît tous les chantiers, toutes les agences d'intérim et tous les patrons qui paient en retard."],
      relnote: ["Lui prête de l'argent sans le dire, et lui en demande rarement.", "Lui a trouvé son dernier contrat, un service {qu_prenom} n'oublie pas."],
      evenement: ["Un licenciement", "Une période de chômage qui s'éternise"],
      peurs: ["Un mois sans mission", "Le loyer du premier du mois"]
    },

    /* ---------- origines : Cayo Perico ---------- */
    ile: {
      enfance_gta: ["{prenom} a grandi entre deux rives : celle de la famille, où l'on parlait de Cayo Perico comme d'un pays perdu, et celle de {ville}.", "Chez {prenom}, on cuisinait comme à Cayo Perico et on se taisait sur ce que l'île avait coûté."],
      secret_gta: ["Sait ce que sa famille a dû faire pour quitter l'île, et n'en parle jamais.", "A reçu une lettre de Cayo Perico qu'{il} n'a jamais osé ouvrir.", "Garde un lien discret avec quelqu'un qui dirige quelque chose sur l'île, et préférerait que cela ne se sache pas."],
      motivation_gta: ["Retourner un jour à Cayo Perico, sans se faire reconnaître.", "Faire venir un proche de l'île avant que la situation ne se dégrade."],
      manies_gta: ["Met du piment dans tout, et propose toujours un peu de la recette de la maison.", "Parle espagnol à la radio quand {il} croit que personne n'écoute."],
      accroches_gta: ["A de la famille à Cayo Perico, et peut transmettre un message sans passer par la douane.", "Cherche quelqu'un qui connaît l'île, ses habitants et ses règles."],
      relnote_gta: ["Vit toujours sur l'île et appelle {prenom} le dimanche, quand la ligne le permet."],
      peurs_gta: ["Que la famille soit rattrapée par l'histoire de l'île"],
      evenement_gta: ["Un départ précipité de Cayo Perico"]
    },

    /* ---------- goûts : musique, sport, moto ---------- */
    musique: {
      secret: ["A écrit une chanson pour quelqu'un qui n'a jamais su qu'elle existait.", "A refusé un contrat avec un label par fidélité à un ami, et se le reproche parfois."],
      motivation: ["Jouer un jour sur une vraie scène, devant des gens qui n'ont pas payé pour être gentils.", "Enregistrer l'album qui traîne depuis dix ans dans un carnet."],
      manies: ["Écoute de la musique en continu dans un casque, même pour s'endormir.", "Tape le rythme sur tout ce qui passe : un volant, un genou, un comptoir.", "Fredonne le même refrain pendant une semaine, puis l'oublie."],
      signes: ["Un médiator toujours dans la poche, même en tenue de travail.", "Des écouteurs qui dépassent du col, branchés ou non."],
      actuel: ["{prenom} remplit ses soirées de répétitions, de bars ouverts jusqu'à tard et de gens qui disent « à la prochaine »."],
      accroches: ["Cherche un bassiste, une batteuse ou un public.", "Peut jouer à un mariage, un enterrement ou une soirée sans en demander la raison."],
      relnote: ["Chante faux, et refuse de l'admettre devant {prenom}."],
      loisirs: ["Concerts dans de petits bars", "Écrire des chansons"]
    },
    sport: {
      secret: ["A truqué un résultat une fois, et n'a jamais retrouvé le même plaisir à gagner.", "A renoncé à un grand match par peur de gagner."],
      motivation: ["Gagner une dernière fois, rien que pour soi.", "Entraîner un jeune qui ira plus loin qu'{il} n'est allé{e}."],
      manies: ["Ne rate jamais un entraînement, même malade.", "Étire ses jambes dans la file d'attente, au distributeur, dans l'ascenseur.", "Mange toujours la même chose avant un effort."],
      signes: ["Un corps qui garde la trace de vingt ans d'entraînement.", "Un trophée oublié sur une étagère, jamais montré."],
      enfance: ["{prenom} a grandi sur un terrain vague où l'on jouait jusqu'à la nuit, ballon ou pas."],
      actuel: ["{prenom} partage ses journées entre l'entraînement, le travail et la récupération, qu'{il} traite comme une obligation."],
      accroches: ["Cherche un partenaire d'entraînement, un coach ou un adversaire qui ne ménage pas.", "Organise des matchs amicaux le dimanche : tout le monde est invité."],
      relnote: ["Était son adversaire le plus coriace, et est devenu son meilleur ami."],
      evenement: ["Une blessure qui a tout arrêté", "Une finale perdue de justesse"],
      peurs: ["Une blessure qui l'arrêterait pour de bon"],
      loisirs: ["Entraînements du matin", "Matchs entre amis le dimanche"]
    },
    moto: {
      secret: ["Garde dans un garage loué sous un faux nom une moto qu'{il} n'a jamais osé déclarer."],
      motivation: ["Traverser le pays sur deux roues, sans autre plan qu'un plein d'essence."],
      manies: ["Salue chaque motard croisé sur la route, même à l'arrêt.", "Écoute le bruit d'un moteur avant de regarder la machine."],
      signes: ["Une cicatrice sur le tibia, souvenir d'une chute à basse vitesse."],
      accroches: ["Cherche un équipier pour une longue virée de nuit.", "Peut prêter une moto, un casque ou un coup de main pour un démarrage capricieux."],
      relnote: ["Lui a appris à tenir une moto, puis lui a rappelé la fois où {prenom} est tombé{e}."],
      loisirs: ["Virées nocturnes", "Rassemblements de motards"]
    }
  };
})(window.LDV);
