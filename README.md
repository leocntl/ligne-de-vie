# Ligne de vie

Créateur de personnage et rédacteur de background pour jeu de rôle contemporain et réaliste, en français, dans l'univers de GTA (Los Santos, Blaine County, Vice City, Liberty City) ou aux États-Unis.
Site statique : du HTML, du CSS et du JavaScript, sans outil de build ni serveur. Projet de fan, sans lien avec Rockstar Games.

## Trois pages

- **Accueil** (`#`) : deux carrés au centre, **Création de personnage** et **Background**. Dessous, un choix d'univers et quelques idées de personnages (un clic crée la fiche correspondante).
- **Création de personnage** (`#creation`) : six étapes, de l'identité à la fiche finale.
- **Background** (`#background`) : rédige l'histoire d'un personnage à partir de sa fiche.

## Deux univers

Le choix se fait sur l'accueil et change les propositions (villes, métiers, logements, loisirs, exemples).

- **GTA RP · San Andreas** (par défaut) : quartiers de Los Santos (Vinewood, Davis, Mission Row, Vespucci, Rockford Hills…), Blaine County (Sandy Shores, Paleto Bay, Grapeseed…), Vice City, Liberty City, San Fierro et Las Venturas. Métiers de l'univers (LSPD, BCSO, SAHP, EMS, LSFD, Weazel News, Los Santos Customs, pêcheur à Paleto…) et champ **Affiliation** (forces de l'ordre, secours, gangs comme les Ballas, les Families, les Vagos, la Marabunta Grande, le Lost MC, la Mafia, un cartel, Merryweather). Les métiers tirés au sort suivent le quartier : la police de Los Santos ne se retrouve pas à Liberty City.
- **États-Unis réels** : villes avec leur État (`Austin, TX`), métiers de la vie courante, logements et loisirs américains.

## Origines

Le champ **Origines** propose des pays (Américain, Français, Italien, Mexicain, Coréen, Brésilien, Haïtien, Libanais… une trentaine) et, dans l'univers GTA, des villes du lore : **Los Santos, Vice City, Liberty City, San Fierro, Las Venturas, Blaine County, Sandy Shores, Paleto Bay**. On peut aussi écrire une origine à soi.

- Chaque pays a ses prénoms et ses noms de famille (Pierre Rousseau, Min-ji Kim, João Sousa…). Pour « Américain » et pour une ville, une origine familiale cachée choisit les noms et les traits physiques, avec des proportions réalistes.
- Une ville d'origine devient le lieu de naissance dans le background, avec l'ambiance de son quartier.
- Les anciennes fiches (« Latino-américaines », « Européennes »…) sont converties automatiquement en « Américain ».

## Création de personnage

- **Six étapes** : identité, apparence, personnalité, histoire, relations, fiche finale. Les champs sont regroupés par blocs, les options facultatives sont repliées dans « Plus de détails », les longues listes de choix montrent les 12 premiers puis le reste à la demande, et les boutons Précédent et Suivant restent visibles en bas.
- **Décrire le personnage en une phrase** : au début de l'étape Identité, une case permet d'écrire ce qu'on imagine (« un policier du LSPD de 38 ans à Mission Row, sérieux et têtu »). Le site crée une fiche qui correspond, complète le reste au hasard sans contredire la phrase, montre ce qu'il a compris et garde la phrase dans les notes.
- **Tirage au sort** par champ, par étape ou pour tout le personnage, avec un cadenas pour garder un champ.
- **Genre** : Homme ou Femme. Les accords suivent le genre, dans les listes comme dans les textes tirés au sort.
- **Image du personnage** : chaque personne met l'image de son choix (photo, image générée ailleurs avec une IA, dessin), la cadre dans le portrait en la faisant glisser et en zoomant, puis l'enregistre. Sans image, la fiche affiche une silhouette.
- **Aperçu en direct** de la fiche, sous forme de carte de personnage fictive.
- **Traits physiques** : coupe, couleur des cheveux, yeux, teint, pilosité, lunettes, taches de rousseur, avec tirage au sort.
- **Taille** saisie en centimètres, avec la conversion en pieds et pouces.
- **Plusieurs personnages**, enregistrés automatiquement dans le navigateur (`localStorage`).
- **Exports** : texte mis en forme pour Discord, texte brut, fichier `.json` (avec l'image et le background), image `.jpg`.
- **Lien de partage** : la fiche entière, background compris, est encodée dans l'adresse (`#p=…`), sans serveur. La photo n'y figure pas (trop lourde) : elle voyage dans le fichier `.json`.
- **Import** d'un lien ou d'un fichier `.json`.

## Idées originales

Partout où l'on peut écrire soi-même, le site propose des idées au hasard, et elles sont originales plutôt que génériques.

- **Une ampoule** à côté de chaque champ libre ouvre quatre à six idées : surnom, métier, affiliation, signes distinctifs, voix et attitude, motivation, manies, secret, enfance, parcours, aujourd'hui, accroches, notes, événement marquant, logement, traits, qualités, défauts, peurs, loisirs, style. Un clic ajoute l'idée (au texte déjà écrit, ou comme nouveau choix), « D'autres idées » en propose d'autres.
- **Les dés** (tirage au sort) piochent dans les mêmes listes d'idées : le dé d'un champ de texte ne tombe plus jamais sur du vide, et chaque relation a son propre dé.
- **Description** : « Idée au hasard » écrit une description complète (métier, âge, quartier, physique, caractère, un rêve, un secret ou une relation), et « Surprends-moi » sur l'accueil crée directement le personnage.
- **Univers GTA** : des idées propres à San Andreas s'ajoutent (Vinewood, Sandy Shores, Paleto Bay, LSPD, gangs…). Les idées qui citent un lieu ou un métier local ne sont proposées qu'aux personnages qui y vivent.
- **Surnoms** : déduits de la fiche (le métier, le caractère, les cheveux roux, les lunettes, la taille…) puis tirés d'une banque.
- **Background** : le dé du « Texte libre » ajoute une anecdote originale, et de nouvelles phrases ont rejoint les parties générées.

## Background

La page rédige l'histoire d'un personnage à partir de sa fiche.

1. Choisir le personnage et une longueur : **court** (origines, parcours, aujourd'hui), **moyen** (avec la jeunesse et le tournant) ou **long** (avec le secret).
2. Le texte est assemblé à partir de phrases types qui utilisent ce que contient la fiche : ville ou quartier, métier, affiliation, traits, loisirs, peurs, relations, événement marquant, motivation, secret. Les phrases qui parlent d'un élément absent de la fiche ne sont jamais choisies, et dans l'univers GTA chaque quartier a son ambiance.
3. Chaque partie est un champ modifiable. Le dé relance une partie (le bouton « Rétablir la version précédente » rend l'ancien texte), « Tout réécrire » demande une confirmation, et les parties masquées gardent leur texte.
4. Le champ **Texte libre** reçoit ce que l'on veut ajouter, par exemple la réponse de Claude.
5. **Copier pour Discord** ou en texte brut. Le background figure aussi dans la fiche finale, dans les exports et dans le lien de partage.

Le site ne se connecte pas à Claude tout seul : il prépare une demande à partir de la fiche (écrire le background complet, l'enrichir, le résumer pour une candidature), à coller dans Claude, puis la réponse se colle dans « Texte libre ».

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Page, navigation, fenêtres |
| `style.css` | Styles, thème clair et sombre |
| `data.js` | Listes de noms, villes, métiers, traits, textes de tirage, univers GTA |
| `nations.js` | Origines : pays avec leurs prénoms et noms, villes du lore GTA |
| `ideas.js` | Banque d'idées originales (surnoms, secrets, enfances, manies, anecdotes…) |
| `photo.js` | Image du personnage : lecture, cadrage et enregistrement |
| `describe.js` | Analyse de la description libre (mots-clés, synonymes, tournures de phrase) |
| `background.js` | Phrases types et assemblage du background |
| `app.js` | Pages, champs, étapes, tirages, stockage, exports |

Pour ajouter des métiers, des traits ou des phrases de tirage, il suffit de modifier `data.js` ; pour ajouter des idées originales, `ideas.js` (les listes finissant par `_gta` ne servent que dans l'univers GTA) ; pour le background, `background.js`.
Écrire `Têtu|Têtue` donne le bon accord selon le personnage, et `~` introduit un suffixe commun (`Sûr|Sûre~ de soi`).

## Tester en local

Double-clique sur `index.html`, ou lance un petit serveur dans le dossier :

```bash
python -m http.server 8765
```

puis ouvre <http://localhost:8765>.

## Publier sur GitHub Pages

1. Crée un dépôt sur GitHub (par exemple `ligne-de-vie`).
2. Ajoute les fichiers de ce dossier à la racine du dépôt.
3. Dans le dépôt, ouvre **Settings → Pages**.
4. Sous **Build and deployment**, choisis **Deploy from a branch**, la branche `main` et le dossier `/ (root)`.
5. Après une minute environ, le site est en ligne à l'adresse `https://<ton-compte>.github.io/ligne-de-vie/`.

Les liens de partage utilisent l'adresse de la page : ils fonctionnent donc une fois le site publié.
Quand tu modifies les fichiers, change le numéro dans `?v=29` de `index.html` pour que les navigateurs récupèrent la nouvelle version.

## Description libre : ce qu'elle comprend

L'analyse n'est pas une IA : elle repère des mots-clés et des tournures de phrase, en français, dans le navigateur. Elle reconnaît notamment :
- **Identité** : prénom et nom (« elle s'appelle Emma Carter »), genre, âge (« 34 ans », « une quarantaine »), origines (« un Français », « d'origine italienne », « née au Mexique », « né à Vice City », « latino »), quartier ou ville (« à Davis », « à Paleto », « à Los Santos », « au Texas »), métier et synonymes (« enchaîne les petits boulots », « intérimaire », « streamer »…), affiliation (LSPD, EMS, Ballas, Lost MC…), situation, logement.
- **Apparence** : couleur et coupe des cheveux, yeux, teint, barbe, lunettes, taches de rousseur, taille (`1m90`, `5'10"`), corpulence, style, signe distinctif (cicatrice, tatouage).
- **Caractère** : traits, qualités, défauts, peurs, loisirs, ce que le personnage veut, un secret, un événement marquant.
- **Relations** : « sa sœur Lily », « son meilleur ami Jake ».

Les noms de quartiers (Davis, Burton…) ne sont reconnus qu'après une préposition (« à Davis »), pour ne pas confondre « Emma Davis » avec un lieu. Une description qui ne parle pas de gang ne met jamais le personnage dans un gang. Quand plusieurs métiers sont cités, le premier l'emporte, et un métier lié à un lieu (la police de Los Santos) n'est gardé que s'il va avec le lieu du personnage. Si la phrase parle de travail sans qu'on sache le classer, le métier reste vide au lieu d'être inventé, et le site le dit. Il indique aussi ce qui a été tiré au hasard. Ce qui n'est pas reconnu n'est pas perdu : toute la phrase est copiée dans « Notes libres ». Pour enrichir le vocabulaire, il suffit d'ajouter des mots dans `describe.js`.

## Limites actuelles

- Les personnages restent sur l'appareil et le navigateur utilisés. Pour les déplacer, utilise le fichier `.json` ou le lien de partage.
- Il n'y a pas de connexion directe à Claude : cela demanderait une clé d'API gardée côté serveur (par exemple dans un Worker Cloudflare).
- Le background est assemblé à partir de phrases types : il donne une base solide à relire et à modifier, pas un texte littéraire. Pour une version plus riche, la demande à Claude prend le relais.
- Le site ne génère pas d'images lui-même : les générateurs gratuits testés étaient trop lents ou demandaient une clé.
