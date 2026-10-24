/* Alias : listes et tables de tirage, pensées pour des personnages américains.
   Convention d'écriture :
   - "Têtu|Têtue"            masculin|féminin, la forme inclusive est calculée (Têtu·e)
   - "Sûr|Sûre~ de soi"      ce qui suit "~" est un suffixe commun aux trois formes
   - {prenom} {il} {e} ...   jetons remplacés dans les textes générés (voir fill() dans app.js) */
window.LDV = {
  // label : origine familiale telle qu'elle apparaît dans la fiche, poids : fréquence du tirage
  ORIGINES: [
    { label: "Européennes", poids: 6,
      f: ["Emily", "Madison", "Hannah", "Olivia", "Ashley", "Megan", "Taylor", "Brittany", "Kayla", "Sarah", "Rachel", "Lauren", "Jessica", "Amanda", "Samantha", "Abigail", "Chloe", "Natalie", "Courtney", "Haley"],
      m: ["Jake", "Tyler", "Ryan", "Austin", "Cody", "Brandon", "Kyle", "Jason", "Matt", "Chris", "Josh", "Ethan", "Logan", "Dylan", "Nathan", "Trevor", "Caleb", "Derek", "Zach", "Garrett"],
      noms: ["Smith", "Johnson", "Miller", "Davis", "Wilson", "Anderson", "Taylor", "Thomas", "Moore", "Martin", "Thompson", "White", "Harris", "Clark", "Lewis", "Walker", "Hall", "Allen", "Young", "King", "Wright", "Scott", "Green", "Baker", "Adams", "Nelson", "Hill", "Campbell", "Mitchell", "Carter", "Roberts", "Turner", "Phillips", "Evans", "Parker", "Collins", "Stewart", "Morris", "Cook", "Rogers", "Morgan", "Cooper", "Peterson", "Reed", "Bailey", "Bell", "Howard", "Ward", "Cox", "Richardson", "Wood", "Watson", "Brooks", "Bennett", "Gray", "Price", "Hughes", "Schmidt", "Weber", "Hoffman", "Larson", "Olson"] },
    { label: "Afro-américaines", poids: 2,
      f: ["Jasmine", "Imani", "Aaliyah", "Destiny", "Tiffany", "Keisha", "Brianna", "Tamara", "Monique", "Jada", "Nia", "Simone", "Ebony", "Kiara", "Danielle"],
      m: ["DeShawn", "Marcus", "Darius", "Terrell", "Malik", "Jamal", "Andre", "Isaiah", "Xavier", "Jaylen", "Cedric", "Tyrone", "Elijah", "Devin", "Calvin"],
      noms: ["Washington", "Jefferson", "Jackson", "Robinson", "Williams", "Johnson", "Brown", "Jones", "Harris", "Coleman", "Grant", "Booker", "Freeman", "Banks", "Mitchell", "Hayes", "Simmons", "Dixon", "Wallace", "Bryant", "Ellis", "Fields", "Gaines", "Whitaker"] },
    { label: "Latino-américaines", poids: 2.5,
      f: ["Maria", "Sofia", "Isabella", "Camila", "Valeria", "Daniela", "Gabriela", "Ana", "Lucia", "Carmen", "Marisol", "Ximena", "Alejandra", "Natalia"],
      m: ["Carlos", "Miguel", "Luis", "Diego", "Javier", "Mateo", "Alejandro", "Jose", "Juan", "Eduardo", "Rafael", "Angel", "Adrian", "Ricardo"],
      noms: ["Garcia", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Perez", "Sanchez", "Ramirez", "Torres", "Flores", "Rivera", "Gomez", "Diaz", "Reyes", "Morales", "Cruz", "Ortiz", "Gutierrez", "Castillo", "Vargas", "Mendoza"] },
    { label: "Asiatiques", poids: 0.7,
      f: ["Grace", "Michelle", "Jenny", "Kelly", "Priya", "Mei", "Sophia", "Linh", "Alisha", "Christine", "Amy", "Tina", "Anjali", "Mia"],
      m: ["Kevin", "Andrew", "Brian", "David", "Eric", "Raj", "Vikram", "Daniel", "Jason", "Anthony", "Minh", "Henry", "Justin", "Arjun"],
      noms: ["Nguyen", "Chen", "Patel", "Kim", "Lee", "Wang", "Tran", "Singh", "Park", "Nakamura", "Wong", "Liu", "Shah", "Yang", "Le", "Cho", "Huang", "Lin", "Gupta", "Sharma", "Tanaka", "Reddy"] },
    { label: "Irlandaises", poids: 1,
      f: ["Erin", "Colleen", "Maeve", "Kathleen", "Siobhan", "Molly", "Bridget", "Shannon", "Kelly", "Caitlin"],
      m: ["Sean", "Patrick", "Connor", "Liam", "Declan", "Brendan", "Kevin", "Brady", "Colin", "Riley"],
      noms: ["O'Brien", "O'Connor", "Murphy", "Kelly", "Sullivan", "Doyle", "Walsh", "McCarthy", "Gallagher", "Quinn", "Brennan", "Flanagan", "Kennedy", "Daly", "Fitzgerald"] },
    { label: "Italiennes", poids: 1,
      f: ["Gianna", "Angela", "Francesca", "Nicole", "Gina", "Carla", "Isabella", "Victoria", "Marissa", "Teresa"],
      m: ["Anthony", "Vincent", "Nicholas", "Joseph", "Dominic", "Frank", "Michael", "Tony", "Salvatore", "Marco"],
      noms: ["Rossi", "Russo", "Romano", "Marino", "Esposito", "DeLuca", "Ricci", "Bruno", "Conti", "Moretti", "Rizzo", "Gallo", "Costa", "Ferrara", "Caruso"] },
    { label: "Amérindiennes", poids: 0.4,
      f: ["Cheyenne", "Sierra", "Kayla", "Ashley", "Nicole", "Shayla", "Brooke", "Taylor"],
      m: ["Tyler", "Jordan", "Shawn", "Aaron", "Dakota", "Wyatt", "Colton", "Nathan"],
      noms: ["Begay", "Yazzie", "Tsosie", "Benally", "Nez", "Chee", "Locklear", "Oxendine", "Lowry", "Hunter", "Brown", "Smith"] },
    { label: "Arabes ou moyen-orientales", poids: 0.6,
      f: ["Layla", "Noor", "Yasmin", "Dina", "Mariam", "Rania", "Sara", "Leila"],
      m: ["Omar", "Ali", "Samir", "Tarek", "Khalid", "Yusuf", "Adam", "Ahmed", "Sam", "Danny"],
      noms: ["Haddad", "Khoury", "Nasser", "Saleh", "Mansour", "Aziz", "Hamdan", "Awad", "Farah", "Khalil", "Said", "Najjar"] },
    { label: "D'Europe de l'Est", poids: 0.6,
      f: ["Anna", "Katie", "Natalie", "Olga", "Irina", "Elena", "Alina", "Tatiana"],
      m: ["Michael", "Peter", "Mark", "Dmitri", "Stefan", "Alex", "Victor", "Andrew"],
      noms: ["Kowalski", "Nowak", "Wisniewski", "Novak", "Petrov", "Ivanov", "Kovacs", "Popescu", "Sokolov", "Horvat", "Kozlov", "Volkov"] },
    { label: "Cajuns (Louisiane)", poids: 0.4,
      f: ["Colette", "Mireille", "Josephine", "Camille", "Delphine", "Lacey"],
      m: ["Remy", "Etienne", "Luc", "Jean-Paul", "Beau", "Justin"],
      noms: ["Boudreaux", "Thibodeaux", "Landry", "Fontenot", "Guidry", "Broussard", "Hebert", "Comeaux", "Arceneaux", "LeBlanc"] }
  ],
  NEUTRES: ["Alex", "Jordan", "Taylor", "Casey", "Riley", "Morgan", "Avery", "Jamie", "Sam", "Charlie", "Quinn", "Cameron", "Skyler", "Robin", "Drew", "Parker", "Rowan", "Sasha"],

  VILLES_USA: ["Los Angeles, CA", "New York, NY", "Brooklyn, NY", "Chicago, IL", "Houston, TX", "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "Austin, TX", "Seattle, WA", "Portland, OR", "Denver, CO", "Miami, FL", "Atlanta, GA", "Boston, MA", "Detroit, MI", "Minneapolis, MN", "Las Vegas, NV", "Nashville, TN", "New Orleans, LA", "Baltimore, MD", "Cleveland, OH", "Pittsburgh, PA", "St. Louis, MO", "Kansas City, MO", "Charlotte, NC", "Salt Lake City, UT", "Albuquerque, NM", "Tampa, FL", "Oakland, CA", "San Francisco, CA", "Columbus, OH", "Indianapolis, IN", "Milwaukee, WI", "Memphis, TN", "Louisville, KY", "Sacramento, CA", "Richmond, VA", "Tucson, AZ", "Boise, ID", "Anchorage, AK", "Honolulu, HI", "Asheville, NC", "Bend, OR", "Duluth, MN", "Savannah, GA", "Santa Fe, NM", "Burlington, VT", "Fargo, ND", "Missoula, MT", "Tulsa, OK", "Spokane, WA", "Omaha, NE", "Cheyenne, WY"],

  METIERS: ["Infirmier|Infirmière", "Infirmier|Infirmière~ aux urgences", "Aide-soignant|Aide-soignante", "Ambulancier|Ambulancière~ (EMT)", "Pompier", "Policier|Policière", "Adjoint|Adjointe~ du shérif", "Détective", "Agent|Agente~ de sécurité", "Ancien|Ancienne~ militaire", "Barista", "Serveur|Serveuse~ dans un diner", "Bartender","Cuisinier|Cuisinière", "Propriétaire~ d'un food truck", "Propriétaire~ d'un diner", "Gérant|Gérante~ de bar", "Vendeur|Vendeuse~ en magasin", "Caissier|Caissière", "Gérant|Gérante~ de supermarché", "Chauffeur|Chauffeuse~ Uber", "Camionneur|Camionneuse", "Conducteur|Conductrice~ de bus", "Facteur|Factrice", "Livreur|Livreuse~ de repas", "Mécanicien|Mécanicienne", "Électricien|Électricienne", "Plombier|Plombière", "Réparateur|Réparatrice~ de climatisation (HVAC)", "Ouvrier|Ouvrière~ du bâtiment", "Ouvrier|Ouvrière~ d'usine", "Technicien|Technicienne~ de maintenance", "Éleveur|Éleveuse~ de bétail", "Gardien|Gardienne~ de parc national", "Ingénieur|Ingénieure~ logiciel", "Développeur|Développeuse~ web", "Informaticien|Informaticienne", "Technicien|Technicienne~ informatique", "Technicien|Technicienne~ de support informatique", "Administrateur|Administratrice~ système", "Administrateur|Administratrice~ réseau", "Analyste en cybersécurité", "Testeur|Testeuse~ d'intrusion", "Hacker|Hackeuse~ freelance", "Développeur|Développeuse~ d'applications mobiles", "Développeur|Développeuse~ de jeux vidéo", "Data analyst", "Réparateur|Réparatrice~ d'ordinateurs et de téléphones", "Webmaster", "Chargé|Chargée~ de marketing", "Comptable", "Avocat|Avocate", "Assistant|Assistante~ juridique", "Commercial|Commerciale", "Journaliste", "Photographe", "Graphiste", "Musicien|Musicienne", "Acteur|Actrice~ en devenir", "Tatoueur|Tatoueuse", "Coiffeur|Coiffeuse", "Enseignant|Enseignante~ en école primaire", "Professeur|Professeure~ au lycée", "Coach de basket au lycée", "Éducateur|Éducatrice~ de jeunes enfants", "Bibliothécaire", "Médecin urgentiste", "Pharmacien|Pharmacienne", "Dentiste", "Psychologue", "Vétérinaire", "Kinésithérapeute", "Assistant|Assistante~ de service social", "Pasteur|Pasteure", "Pilote de ligne", "Freelance", "En reconversion professionnelle", "Sans emploi pour le moment"],
  METIERS_ETUDIANTS: ["Étudiant|Étudiante~ en droit", "Étudiant|Étudiante~ en médecine", "Étudiant|Étudiante~ en informatique", "Étudiant|Étudiante~ en cybersécurité", "Étudiant|Étudiante~ en école de code", "Étudiant|Étudiante~ en réseaux et télécoms", "Étudiant|Étudiante~ en électronique","Étudiant|Étudiante~ en école de commerce", "Étudiant|Étudiante~ en communication", "Étudiant|Étudiante~ en psychologie", "Étudiant|Étudiante~ en sciences infirmières", "Étudiant|Étudiante~ en ingénierie", "Étudiant|Étudiante~ en art et design", "Étudiant|Étudiante~ en community college", "Étudiant|Étudiante~ dans l'équipe de football de la fac"],

  // traits physiques : n = nom affiché, h = couleur de la pastille ; l = libellé, p = forme accordée avec "cheveux ..."
  PEAU: [
    { n: "Très claire", h: "#F4D8C6" }, { n: "Claire", h: "#EBC3A3" }, { n: "Beige", h: "#DBA680" }, { n: "Hâlée", h: "#C28A5F" },
    { n: "Mate", h: "#A56C47" }, { n: "Brune", h: "#80502F" }, { n: "Foncée", h: "#5C3823" }, { n: "Très foncée", h: "#412516" }
  ],
  CHEVEUX: [
    { n: "Noirs", h: "#1D1917" }, { n: "Bruns", h: "#3B2A21" }, { n: "Châtains", h: "#6A4A33" }, { n: "Châtain clair", h: "#946C45" },
    { n: "Blonds", h: "#D2AC66" }, { n: "Blond platine", h: "#E6D9AE" }, { n: "Roux", h: "#A5441F" }, { n: "Gris", h: "#9CA0A7" },
    { n: "Blancs", h: "#E6E6E9" }, { n: "Bleus", h: "#3A6FD8" }, { n: "Roses", h: "#DA5C9D" }
  ],
  YEUX: [
    { n: "Marron foncé", h: "#3A2417" }, { n: "Marron", h: "#6B4226" }, { n: "Noisette", h: "#8E6B3A" }, { n: "Verts", h: "#4C7A4A" },
    { n: "Bleus", h: "#3F78B5" }, { n: "Gris", h: "#7C8794" }, { n: "Noirs", h: "#1B1514" }
  ],
  COUPES: [
    { v: "court", l: "Courte", p: "courts" }, { v: "ras", l: "Rasée", p: "rasés" }, { v: "mi", l: "Mi-longue", p: "mi-longs" },
    { v: "long", l: "Longue", p: "longs" }, { v: "queue", l: "Queue de cheval", p: "attachés en queue de cheval" },
    { v: "chignon", l: "Chignon", p: "attachés en chignon" }, { v: "boucles", l: "Bouclée", p: "bouclés" }, { v: "chauve", l: "Chauve", p: "" }
  ],
  PILOSITE: [{ v: "non", l: "Aucune" }, { v: "3j", l: "Barbe de trois jours" }, { v: "barbe", l: "Barbe" }, { v: "mous", l: "Moustache" }],
  LUNETTES: [{ v: "non", l: "Aucune" }, { v: "rondes", l: "Rondes" }, { v: "carrees", l: "Carrées" }],
  TACHES: [{ v: "non", l: "Non" }, { v: "oui", l: "Oui" }],

  GENRES: ["Femme", "Homme"],
  SITUATIONS: ["Célibataire", "En couple", "Fiancé|Fiancée", "Marié|Mariée", "Séparé|Séparée", "Divorcé|Divorcée", "Veuf|Veuve", "C'est compliqué"],
  LOGEMENTS: ["Dans un studio", "Dans un appartement", "En colocation", "Dans une maison de banlieue", "Dans un mobile home", "Dans un loft", "Chez ses parents", "Chez un proche", "En résidence universitaire"],
  CORPULENCES: ["Mince", "Athlétique", "Moyenne", "Robuste", "Ronde"],
  STYLES: ["Décontracté", "Classique", "Sportif", "Streetwear", "Soigné", "Alternatif", "Vintage", "Négligé", "Minimaliste", "Coloré", "Workwear", "Preppy", "Western", "Tenue de sport d'équipe"],
  SIGNES: ["Une petite cicatrice au sourcil.", "Un tatouage discret sur l'avant-bras.", "Un piercing à l'oreille.", "Un grain de beauté sur la joue.", "Des mains abîmées par le travail.", "Un sourire en coin qui revient souvent.", "Une montre toujours trop grande.", "Des cernes qui ne partent jamais.", "Une casquette de baseball vissée sur la tête.", "Les cheveux toujours attachés à la va-vite.", "Une légère boiterie quand il fait froid.", "Des bagues à presque tous les doigts.", "Un vieux sweat de son lycée qu'{il} porte encore.", "Un tatouage militaire à moitié effacé."],
  ATTITUDES: ["Voix posée, gestes mesurés.", "Parle vite et beaucoup.", "Voix rauque, rit facilement.", "Démarche pressée, regard qui fuit.", "Présence discrète, on l'oublie presque.", "Sourire facile, poignée de main franche.", "Se tient droit, ton assuré.", "Mains dans les poches, haussements d'épaules.", "Accent traînant du Sud, ton chaleureux.", "Dit « sir » et « ma'am » par habitude.", "Gesticule en parlant.", "Accent de la côte Est, débit rapide, franc-parler."],

  TRAITS: ["Timide", "Extraverti|Extravertie", "Introverti|Introvertie", "Curieux|Curieuse", "Sarcastique", "Calme", "Rêveur|Rêveuse", "Pragmatique", "Observateur|Observatrice", "Perfectionniste", "Spontané|Spontanée", "Anxieux|Anxieuse", "Sûr|Sûre~ de soi", "Nostalgique", "Charmeur|Charmeuse", "Casanier|Casanière", "Aventurier|Aventurière", "Discret|Discrète", "Bavard|Bavarde", "Sérieux|Sérieuse", "Blagueur|Blagueuse", "Sensible", "Débrouillard|Débrouillarde", "Indépendant|Indépendante", "Franc|Franche", "Cynique", "Optimiste", "Pessimiste", "Fêtard|Fêtarde", "Studieux|Studieuse", "Maladroit|Maladroite", "Élégant|Élégante", "Excentrique", "Méthodique", "Contemplatif|Contemplative", "Patriote", "Croyant|Croyante", "Geek", "Bidouilleur|Bidouilleuse"],
  QUALITES: ["Loyal|Loyale", "Généreux|Généreuse", "Courageux|Courageuse", "Patient|Patiente", "Protecteur|Protectrice", "Honnête", "Drôle", "Créatif|Créative", "Empathique", "Persévérant|Persévérante", "Fiable", "Attentionné|Attentionnée", "Ouvert|Ouverte~ d'esprit", "Organisé|Organisée", "Travailleur|Travailleuse", "Dévoué|Dévouée", "Ambitieux|Ambitieuse", "Résilient|Résiliente", "Charismatique", "Bienveillant|Bienveillante", "À l'écoute", "Sociable", "Autodidacte", "Logique"],
  DEFAUTS: ["Têtu|Têtue", "Impulsif|Impulsive", "Jaloux|Jalouse", "Orgueilleux|Orgueilleuse", "Procrastinateur|Procrastinatrice", "Rancunier|Rancunière", "Menteur|Menteuse", "Susceptible", "Envahissant|Envahissante", "Colérique", "Désorganisé|Désorganisée", "Matérialiste", "Possessif|Possessive", "Fuyant|Fuyante", "Dépensier|Dépensière", "Critique", "Cassant|Cassante", "Indécis|Indécise", "Gaffeur|Gaffeuse", "Autoritaire", "Naïf|Naïve", "Bourreau de travail"],
  PEURS: ["Être abandonné|Être abandonnée", "L'échec", "La solitude", "La foule", "Les hôpitaux", "Perdre le contrôle", "L'eau profonde", "Le regard des autres", "Les tornades", "Vieillir seul|Vieillir seule", "Décevoir ses proches", "Conduire sur l'autoroute", "Les araignées", "Parler en public", "Le noir", "La précarité", "Les dettes d'études", "Les factures médicales", "Perdre son emploi", "Que ses mensonges soient découverts"],
  LOISIRS: ["Baseball", "Football américain", "Basket", "Hockey", "Pêche", "Chasse", "Camping", "Road trips", "Barbecue", "Concerts de country", "Cinéma", "Séries", "Lecture", "Jeux vidéo", "Jeux de société", "Poker", "Course à pied", "Musculation", "Randonnée", "Cuisine", "Pâtisserie", "Photographie", "Dessin", "Guitare", "Piano", "Chant", "Écriture", "Danse", "Escalade", "Vélo", "Natation", "Surf", "Skate", "Jardinage", "Vide-greniers", "Bricolage", "Customisation de voitures", "Karaoké", "Podcasts", "Mode", "Yoga", "Bénévolat", "Disques vinyles", "Astronomie", "Musique", "Moto", "Programmation", "Hacking", "Montage de PC", "Électronique et bidouillage", "Rétrogaming"],

  MOTIVATIONS: [
    "Prouver à sa famille {qu_il} peut réussir seul{e}.",
    "Économiser pour quitter {ville} et repartir de zéro ailleurs.",
    "Rembourser ses dettes d'études.",
    "Acheter sa première maison.",
    "Ouvrir son propre commerce un jour.",
    "Retrouver quelqu'un perdu de vue depuis des années.",
    "Trouver enfin un endroit où se sentir chez soi.",
    "Se faire un nom dans son métier.",
    "Décrocher la promotion qu'{il} attend depuis des années.",
    "Réparer une amitié brisée.",
    "Aider les autres comme on l'a aidé{e} un jour.",
    "Tenir une promesse faite à un proche disparu.",
    "Garder le contrôle de sa vie, quoi qu'il arrive.",
    "Traverser le pays en voiture, avant qu'il soit trop tard.",
    "Être pris{e} au sérieux.",
    "Mettre de l'ordre dans son passé."
  ],
  MANIES: [
    "Fredonne sans s'en rendre compte.",
    "Vérifie trois fois que la porte est fermée.",
    "Arrive toujours dix minutes en avance.",
    "Perd ses clés au moins une fois par semaine.",
    "Note tout dans de petits carnets.",
    "Mange souvent debout, en marchant.",
    "Garde chaque ticket de caisse.",
    "Joue avec une bague quand {il} réfléchit.",
    "Répond aux messages par des vocaux de cinq minutes.",
    "Écoute la même playlist de country en boucle.",
    "Ne refuse jamais un deuxième café.",
    "Regarde chaque match du week-end, même quand son équipe est éliminée.",
    "Garde toujours de la monnaie pour les pourboires.",
    "Plie les emballages en origami sans y penser."
  ],
  SECRETS: [
    "A abandonné l'université sans le dire à sa famille.",
    "Doit de l'argent à quelqu'un qu'il vaut mieux ne pas faire attendre.",
    "A déjà passé une nuit en cellule pour une bêtise de jeunesse.",
    "Éprouve des sentiments pour une personne de son entourage.",
    "Écrit sous pseudonyme et rencontre un petit succès en ligne.",
    "A quitté son État sans prévenir personne.",
    "Cache un problème de santé à ses proches.",
    "A été témoin d'un événement dont {il} n'a jamais parlé.",
    "Fait semblant d'aller travailler chaque matin : {il} a perdu son emploi.",
    "Possède un talent qu'{il} cache par peur du regard des autres.",
    "Garde le contact avec quelqu'un que sa famille ne doit pas connaître.",
    "A menti sur un diplôme pour décrocher son poste."
  ],
  ENFANCES: [
    "{prenom} a grandi à {ville}, dans une famille modeste où l'on comptait chaque fin de mois. {Il} en a gardé le sens de la débrouille.",
    "{prenom} a grandi dans une petite ville où tout le monde connaît tout le monde, entre le match de football du vendredi soir et l'église du dimanche. {Il} rêvait déjà de partir pour {ville}.",
    "Enfance dans une banlieue tranquille de {ville}, entre pelouses tondues, barbecues entre voisins et longs trajets en bus scolaire. {prenom} y a appris à se faire discret{e}.",
    "Enfant d'immigrés, {prenom} a grandi entre deux cultures et deux langues, à {ville}. {Il} sert encore souvent de traducteur à la maison.",
    "Enfant de militaire, {prenom} a changé de base et d'école tous les deux ans avant de se poser à {ville}. {Il} se lie vite aux gens mais se méfie des attaches trop solides.",
    "Élevé{e} en partie par ses grands-parents, {prenom} garde de {ville} le souvenir des barbecues du dimanche et des histoires de famille qu'on ne raconte qu'à moitié.",
    "Enfant unique, {prenom} a longtemps vécu dans sa tête. Les livres et les écrans lui ont tenu compagnie à {ville}.",
    "Arrivé{e} à {ville} à l'adolescence, {prenom} a dû se faire une place dans un lycée où tout le monde se connaissait déjà.",
    "{prenom} a grandi entre deux foyers après le divorce de ses parents. {Il} apprécie aujourd'hui sa liberté autant {qu_il} la craint.",
    "Famille nombreuse, petit appartement, voisins bruyants : l'enfance de {prenom} à {ville} a été chaleureuse et un peu chaotique.",
    "{prenom} a perdu un parent jeune. {Il} a dû mûrir vite et ne parle que rarement de cette période."
  ],
  PARCOURS: [
    "Après le lycée, {prenom} a enchaîné les petits jobs avant de trouver sa voie. {Il} travaille aujourd'hui comme {metier}.",
    "{prenom} a commencé l'université grâce à une bourse sans la terminer, puis s'est formé{e} sur le tas. Désormais, {il} exerce comme {metier}.",
    "Un parcours sans ligne droite : plusieurs États, plusieurs métiers, un goût du changement. Aujourd'hui, {prenom} est {metier}.",
    "Diplômé{e} d'une bonne université mais lassé{e} de la course au CV, {prenom} s'est reconverti{e} et travaille aujourd'hui comme {metier}.",
    "{prenom} a servi plusieurs années dans l'armée avant de revenir à la vie civile. {Il} travaille aujourd'hui comme {metier}.",
    "{prenom} a passé deux ans dans un community college avant de se lancer. {Il} est maintenant {metier} et rembourse encore ses prêts étudiants.",
    "{prenom} est {metier} depuis plus de dix ans. {Il} aime son travail mais se demande parfois {s_il} ne passe pas à côté d'autre chose.",
    "Un début de carrière compliqué, des contrats courts, puis une rencontre qui a tout changé. {prenom} est maintenant {metier}.",
    "{prenom} travaille comme {metier}, avec des horaires qui mangent une bonne partie de sa vie sociale."
  ],
  ACTUELS: [
    "{prenom} vit à {ville}, {logement}. Ses journées sont réglées comme du papier à musique, mais {il} rêve d'un peu d'imprévu.",
    "{prenom} habite {logement}, à {ville}. Les relations avec son entourage sont bonnes, mais {il} garde toujours une part de mystère.",
    "La vie de {prenom} à {ville} est simple : le travail et quelques amis fidèles. Son échappatoire : {hobby}.",
    "{prenom} se cherche encore un peu. {Il} vit {logement}, à {ville}. Sa soupape : {hobby}."
  ],
  EVENEMENTS: ["Un déménagement à l'autre bout du pays", "Une rupture difficile", "La perte d'un proche", "Une réussite inattendue", "La trahison d'un ami", "Une rencontre décisive", "Un accident de la route", "Un service militaire", "Un échec professionnel", "Un héritage inattendu", "Un licenciement", "Une faillite", "Une période de solitude", "Une catastrophe naturelle", "Une reconversion", "Une maladie surmontée"],
  ACCROCHES: [
    "Prêt{e} à aider un inconnu si la cause est juste.",
    "Cherche un colocataire, un associé ou un complice.",
    "Se laisserait volontiers entraîner dans une enquête de quartier.",
    "Peut devenir l'ami fidèle de quelqu'un qui en a besoin.",
    "A un contact utile dans presque tous les milieux.",
    "Un ancien ami pourrait refaire surface à tout moment.",
    "Cherche à se faire pardonner quelque chose.",
    "Facile à aborder dans un diner, un bar ou un café de {ville}.",
    "Cache un talent qui pourrait servir à la bonne occasion.",
    "Un service à rendre le lie à quelqu'un d'influent.",
    "Recherche un mentor ou un modèle.",
    "Ouvert{e} à une rencontre amoureuse, mais méfiant{e}.",
    "Peut devenir le rival de quiconque convoite la même place.",
    "Connaît les coulisses de son métier et en sait trop.",
    "Cherche un compagnon de route pour un road trip improvisé.",
    "Prêt{e} à se mettre en danger pour ceux {qu_il} aime.",
    "À la recherche d'un nouveau départ."
  ],
  LIENS: ["Famille", "Ami·e", "Partenaire", "Ex", "Collègue", "Voisin·e", "Colocataire", "Rival·e", "Mentor", "Ennemi·e", "Connaissance"],
  NOTES_REL: [
    "Se voient chaque semaine autour d'un verre.",
    "Ne se parlent plus depuis une dispute.",
    "Se connaissent depuis le lycée.",
    "Lui doit un service.",
    "Garde un œil sur {prenom}.",
    "Est au courant de ses secrets.",
    "Travaille dans le même immeuble.",
    "Se téléphonent tous les dimanches.",
    "Jalouse discrètement sa réussite.",
    "Se sont connus un soir de match, au bar du coin."
  ]
};

/* ---------- univers GTA RP : San Andreas, Vice City, Liberty City ---------- */
(function (D) {
  // lieux : "Quartier (Ville)" ; les villes entières sont écrites seules
  D.VILLES_GTA = [
    "Vinewood (Los Santos)", "Mission Row (Los Santos)", "Davis (Los Santos)", "Rockford Hills (Los Santos)", "Vespucci (Los Santos)", "Del Perro (Los Santos)",
    "Mirror Park (Los Santos)", "Strawberry (Los Santos)", "La Mesa (Los Santos)", "Little Seoul (Los Santos)", "Chamberlain Hills (Los Santos)", "Downtown (Los Santos)",
    "Burton (Los Santos)", "Vinewood Hills (Los Santos)", "Banning (Los Santos)", "El Burro Heights (Los Santos)", "Cypress Flats (Los Santos)", "Rancho (Los Santos)",
    "Sandy Shores (Blaine County)", "Paleto Bay (Blaine County)", "Grapeseed (Blaine County)", "Harmony (Blaine County)", "Mount Chiliad (Blaine County)",
    "Ocean Beach (Vice City)", "Little Havana (Vice City)", "Downtown (Vice City)", "Vice Point (Vice City)", "Washington Beach (Vice City)", "Little Haiti (Vice City)",
    "Broker (Liberty City)", "Algonquin (Liberty City)", "Bohan (Liberty City)", "Dukes (Liberty City)", "Alderney (Liberty City)", "Hove Beach (Liberty City)",
    "San Fierro", "Las Venturas", "Cayo Perico"
  ];
  // noms de villes entières reconnus dans une description (clé normalisée -> quartiers possibles)
  D.VILLES_GROUPES = {
    'los santos': D.VILLES_GTA.filter(x => /\(Los Santos\)/.test(x)), 'blaine county': D.VILLES_GTA.filter(x => /\(Blaine County\)/.test(x)),
    'vice city': D.VILLES_GTA.filter(x => /\(Vice City\)/.test(x)), 'liberty city': D.VILLES_GTA.filter(x => /\(Liberty City\)/.test(x))
  };
  D.VILLES_ALL = D.VILLES_USA.concat(D.VILLES_GTA);
  D.VILLES = D.VILLES_GTA;

  // "Davis (Los Santos)" -> "Davis" ; "Downtown (Vice City)" -> "Downtown Vice City" ; "Austin, TX" -> "Austin"
  D.cityName = function (v) {
    v = String(v || '');
    const m = v.match(/^(.*?)\s*\((.*)\)$/);
    if (m) return m[1] === 'Downtown' ? 'Downtown ' + m[2] : m[1];
    return v.replace(/,\s*[A-Z]{2}$/, '');
  };

  D.METIERS_GTA = [
    "Policier|Policière~ du LSPD", "Adjoint|Adjointe~ du BCSO", "Agent|Agente~ du San Andreas Highway Patrol", "Ambulancier|Ambulancière~ de l'EMS", "Pompier du LSFD",
    "Médecin à Pillbox Hill Medical", "Infirmier|Infirmière~ à Pillbox Hill", "Mécanicien|Mécanicienne~ chez Los Santos Customs", "Mécanicien|Mécanicienne~ à Sandy Shores",
    "Chauffeur|Chauffeuse~ pour Downtown Cab Co.", "Dépanneur|Dépanneuse", "Journaliste à Weazel News", "Avocat|Avocate~ à Los Santos", "Vendeur|Vendeuse~ chez Premium Deluxe Motorsport",
    "Bartender au Bahama Mamas", "Serveur|Serveuse~ chez Up-n-Atom Burger", "Livreur|Livreuse~ pour PostOP", "Agent|Agente~ de sécurité chez Gruppe Sechs",
    "Pilote à Los Santos International", "Pêcheur|Pêcheuse~ à Paleto Bay", "Bûcheron|Bûcheronne~ à Paleto Bay", "Éleveur|Éleveuse~ à Grapeseed", "Fermier|Fermière~ à Grapeseed",
    "Gérant|Gérante~ d'une supérette 24/7", "Cascadeur|Cascadeuse~ à Vinewood", "Acteur|Actrice~ en devenir à Vinewood", "Cuisinier|Cuisinière~ chez Pizza This",
    "Coiffeur|Coiffeuse~ chez Herr Kutz", "Tatoueur|Tatoueuse~ chez Blazing Tattoos", "Ouvrier|Ouvrière~ du port de Los Santos", "Employé|Employée~ de la raffinerie",
    "Ranger du Blaine County", "Animateur|Animatrice~ sur Non-Stop-Pop FM", "Paparazzi à Vinewood", "Contrebandier|Contrebandière", "Braqueur|Braqueuse~ de petits coups",
    "Trafiquant|Trafiquante~ de rue", "Développeur|Développeuse~ chez Lifeinvader", "Technicien|Technicienne~ informatique à Little Seoul", "Administrateur|Administratrice~ système pour la ville de Los Santos", "Hacker|Hackeuse~ pour des clients anonymes"
  ];
  D.METIERS_ETUDIANTS_GTA = ["Étudiant|Étudiante~ à l'université de Los Santos", "Étudiant|Étudiante~ en droit à Los Santos", "Étudiant|Étudiante~ en école de cinéma à Vinewood", "Étudiant|Étudiante~ en médecine à Pillbox Hill"];
  D.LOISIRS_GTA = ["Courses de rue", "Tuning", "Plage à Vespucci", "Pêche à Paleto", "Casino", "Karting", "Chasse dans le Blaine County", "Golf à Richman", "Randonnée au mont Chiliad", "Parachutisme", "Plongée"];
  D.LOGEMENTS_GTA = ["Dans un motel", "Dans une villa de Vinewood Hills", "Sur un bateau, à la marina de Del Perro", "Dans un appartement de Vespucci", "Dans une caravane, en plein désert"];
  D.AFFILIATIONS = ["LSPD", "BCSO", "SAHP", "EMS", "LSFD", "Ballas", "Families", "Vagos", "Marabunta Grande", "Lost MC", "Mafia", "Cartel", "Merryweather"];
  // affiliation déduite d'un métier : "Policier du LSPD" -> LSPD
  D.AFFIL_DE_METIER = [[/LSPD/, 'LSPD'], [/BCSO|Ranger du Blaine/, 'BCSO'], [/Highway Patrol/, 'SAHP'], [/EMS|Pillbox/, 'EMS'], [/LSFD/, 'LSFD']];
  D.GANGS = ['Ballas', 'Families', 'Vagos', 'Marabunta Grande', 'Lost MC', 'Mafia', 'Cartel'];
  // zone d'un lieu : 'ls' (Los Santos), 'bc' (Blaine County), sinon 'other' (Vice City, Liberty City, San Fierro, Las Venturas...)
  D.zoneOf = function (v) {
    v = String(v || '');
    return /\(Los Santos\)/.test(v) ? 'ls' : /\(Blaine County\)/.test(v) ? 'bc' : 'other';
  };
  // métiers GTA qui ont du sens à l'endroit où vit le personnage (la police de Los Santos reste à Los Santos...)
  D.jobFits = function (j, ville) {
    if (!ville) return true;
    const z = D.zoneOf(ville);
    const place = /Sandy Shores|Paleto Bay|Grapeseed/.exec(j);
    if (place) return String(ville).indexOf(place[0]) >= 0;
    if (/BCSO|Blaine|route 68/.test(j)) return z === 'bc';
    if (/LSPD|EMS|LSFD|Pillbox|Los Santos|Vinewood|Weazel|Downtown Cab|Bahama|Premium Deluxe|raffinerie|Non-Stop|Vespucci|Del Perro|Lifeinvader|Little Seoul/.test(j)) return z === 'ls';
    if (/Up-n-Atom|Pizza This|Herr Kutz|Blazing|PostOP|Gruppe Sechs|Highway Patrol|supérette/.test(j)) return z !== 'other';
    return true;
  };
  D.metiersGta = function (ville) { return D.METIERS_GTA.filter(j => D.jobFits(j, ville)); };
  // une idée qui cite un quartier ou une ville de l'univers n'est proposée qu'aux personnages qui y vivent
  D.placeFits = function (raw, ville) {
    if (!ville) return true;
    const names = D.VILLES_GTA.map(D.cityName).concat(['Los Santos', 'Blaine County', 'Vice City', 'Liberty City', 'Paleto']);
    const found = names.filter(n => String(raw).indexOf(n) >= 0);
    return !found.length || found.some(n => String(ville).indexOf(n) >= 0);
  };
  D.etudiantsGta = function (ville) { return D.zoneOf(ville) === 'ls' ? D.METIERS_ETUDIANTS_GTA : D.METIERS_ETUDIANTS; };
  // métiers qui demandent des années d'études ou d'ancienneté
  D.JOBS_ADULT = /Médecin|Avocat|Policier|Policière|Adjoint|Highway Patrol|Ambulanci|Pompier|Pilote|Ranger|Gérant|Ingénieur|Professeur|Chirurgien|Journaliste|Infirmi/;
  // métiers dont un gang peut faire partie du quotidien (un avocat ou un médecin n'est pas tiré au sort dans un gang)
  D.GANG_JOBS = /Contrebandi|Braqueu|Trafiquan|Mécanicien|Dépanneu|Livreu|Serveu|Bartender|Ouvrier|Sans emploi|Cascadeu|Chauffeu|Vendeu|Cuisinier|sécurité|Pêcheu|Tatoueu|Coiffeu|Employé|Caissi|Plongeu/;
})(window.LDV);
