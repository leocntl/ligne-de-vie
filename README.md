# Ligne de vie

Créateur de personnage pour jeu de rôle contemporain et réaliste, en français, avec des personnages américains.
Site statique : du HTML, du CSS et du JavaScript, sans outil de build ni serveur.

## Contenu américain

- **Prénoms et noms** répartis par origines familiales : européennes, afro-américaines, latino-américaines, asiatiques, irlandaises, italiennes, amérindiennes, arabes ou moyen-orientales, d'Europe de l'Est, cajuns. Le tirage suit des proportions réalistes, et les traits physiques tirés au sort (teint, cheveux, yeux) s'accordent avec l'origine choisie.
- **Villes** des États-Unis avec leur État (`Austin, TX`), grandes villes comme petites villes.
- **Métiers** locaux : EMT, adjoint du shérif, bartender, camionneur, ancien militaire, gardien de parc national, etc.
- **Logements, loisirs, peurs et parcours** adaptés : mobile home, résidence universitaire, community college, baseball, road trips, dettes d'études, factures médicales, tornades.
- **Taille** saisie en centimètres, avec la conversion en pieds et pouces dans le formulaire et sur la fiche.

## Ce que le site permet

- **Six étapes** : identité, apparence, personnalité, histoire, relations, fiche finale.
- **Tirage au sort** par champ, par étape ou pour tout le personnage, avec un cadenas pour garder un champ.
- **Genre** : Homme ou Femme. Les accords suivent le genre, dans les listes comme dans les textes tirés au sort.
- **Image du personnage** : chaque personne met l'image de son choix (photo, image générée ailleurs avec une IA, dessin), la cadre dans le portrait en la faisant glisser et en zoomant, puis l'enregistre. Sans image, la fiche affiche une silhouette.
- **Aperçu en direct** de la fiche, sous forme de carte de personnage fictive.
- **Plusieurs personnages**, enregistrés automatiquement dans le navigateur (`localStorage`).
- **Traits physiques** : coupe, couleur des cheveux, yeux, teint, pilosité, lunettes, taches de rousseur, avec tirage au sort. Ils alimentent la description d'allure de la fiche.
- **Exports** : texte mis en forme pour Discord, texte brut, fichier `.json` (avec l'image), image `.jpg`.
- **Lien de partage** : la fiche entière est encodée dans l'adresse (`#p=…`), sans serveur. La photo n'y figure pas (trop lourde) : elle voyage dans le fichier `.json`.
- **Import** d'un lien ou d'un fichier `.json`.
- **Aide de Claude** : le site prépare une demande à partir de la fiche, à coller dans Claude, puis la réponse peut être insérée dans la fiche.

## Image du personnage

Dans l'étape **Apparence**, le bloc « Image du personnage » permet d'ajouter le visuel du personnage :

1. Choisir un fichier (JPG, PNG, WebP ou GIF, 25 Mo maximum) ou le déposer dans le cadre.
2. Faire glisser l'image pour la placer, régler le zoom (molette, curseur ou touches `+` et `-`), ou utiliser les flèches du clavier.
3. Cliquer sur « Utiliser cette image » : elle est découpée au format du portrait et enregistrée en JPEG (480 × 576 px, une dizaine à une centaine de Ko).
4. Changer ou retirer l'image quand on veut. Sans image, la carte affiche une silhouette.

À savoir :

- **Rien n'est envoyé sur internet** : tout se fait dans le navigateur.
- L'image figure dans l'export `.json` et dans la copie de personnage, mais pas dans le lien de partage (trop lourde).
- Pour une photo réaliste générée par IA, il suffit de la créer dans l'outil de son choix (Midjourney, ChatGPT, Designer...) puis de l'importer ici.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Page et fenêtres |
| `style.css` | Styles, thème clair et sombre |
| `data.js` | Listes de noms, métiers, traits, textes de tirage |
| `photo.js` | Image du personnage : lecture, cadrage et enregistrement |
| `app.js` | Champs, étapes, tirages, stockage, exports |

Pour ajouter des métiers, des traits ou des phrases de tirage, il suffit de modifier `data.js`.
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
Quand tu modifies les fichiers, change le numéro dans `?v=7` de `index.html` pour que les navigateurs récupèrent la nouvelle version.

## Limites actuelles

- Les personnages restent sur l'appareil et le navigateur utilisés. Pour les déplacer, utilise le fichier `.json` ou le lien de partage.
- Il n'y a pas de connexion directe à Claude : cela demanderait une clé d'API gardée côté serveur (par exemple dans un Worker Cloudflare).
- Le site ne génère pas d'images lui-même : les générateurs gratuits testés étaient trop lents ou demandaient une clé. Un Worker Cloudflare avec Workers AI pourrait s'en charger plus tard.
