/* Prompt d'image : décrit le personnage (âge, traits physiques, style, métier) pour une IA qui génère des images.
   Rien n'est envoyé : la personne copie le texte et le colle dans l'outil de son choix. */
window.LDV_IMG = (function () {
  const D = window.LDV;
  const norm = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const first = raw => String(raw || '').split('|')[0];
  const cap = t => (t ? t.charAt(0).toUpperCase() + t.slice(1) : '');

  const OPT = {
    style: [['photo', 'Photo réaliste'], ['jeu', 'Style jeu vidéo'], ['comics', 'Comics'], ['peinture', 'Peinture']],
    frame: [['buste', 'Portrait'], ['pied', 'Plein pied']],
    scene: [['neutre', 'Fond neutre'], ['rue', 'Dans la rue'], ['travail', 'Au travail']],
    lang: [['en', 'English'], ['fr', 'Français']]
  };
  const DEFAULTS = { style: 'photo', frame: 'buste', scene: 'neutre', lang: 'en' };

  const EN = {
    peau: ['very fair skin', 'fair skin', 'light beige skin', 'tanned skin', 'olive skin', 'brown skin', 'dark brown skin', 'deep dark skin'],
    cheveux: ['black', 'dark brown', 'chestnut brown', 'light brown', 'blond', 'platinum blond', 'red', 'grey', 'white', 'blue', 'pink'],
    yeux: ['dark brown', 'brown', 'hazel', 'green', 'blue', 'grey', 'black'],
    coupe: { court: 'short', ras: 'buzz-cut', mi: 'medium-length', long: 'long', boucles: 'curly' },
    pilo: { '3j': 'a short stubble', barbe: 'a full beard', mous: 'a moustache' },
    lunettes: { rondes: 'round glasses', carrees: 'square glasses' },
    corps: { Mince: 'a slim build', 'Athlétique': 'an athletic build', Moyenne: 'an average build', Robuste: 'a stocky, broad build', Ronde: 'a soft, round build' },
    style: { 'Décontracté': 'casual clothes', Classique: 'classic, tailored clothes', Sportif: 'sportswear', Streetwear: 'streetwear', 'Soigné': 'a neat, well-groomed outfit', Alternatif: 'an alternative style with dark layered clothes', Vintage: 'vintage clothes', 'Négligé': 'rumpled, careless clothes', Minimaliste: 'a minimalist outfit', 'Coloré': 'colorful clothes', Workwear: 'workwear', Preppy: 'preppy clothes', Western: 'western clothes (denim, boots)', "Tenue de sport d'équipe": 'a team sports jersey',
      'Cuir élimé': 'a worn leather jacket', 'Tout en jean': 'an all-denim outfit', Foulards: 'a scarf', 'Total look noir': 'an all-black outfit', 'Vestes de seconde main': 'a second-hand jacket', 'Casquettes de collection': 'a vintage cap', 'Couleurs criardes assumées': 'loud, bold colors', 'Cravates de travers': 'a crooked tie', 'Lunettes de soleil à toute heure': 'sunglasses', 'Chemises hawaïennes sans ironie': 'a Hawaiian shirt', 'Sweat à capuche et casque': 'a hoodie with headphones around the neck', 'T-shirts de groupes obscurs': 'an obscure band t-shirt', 'Streetwear de Vespucci': 'beach-town streetwear', 'Costume de Rockford Hills': 'an expensive tailored suit', 'Bandana et débardeur': 'a bandana and a tank top', "Veste d'équipe de Little Seoul": 'a varsity team jacket', 'Tenue de motard du Lost MC': 'a leather biker outfit with a club patch', 'Lowrider chic : pantalon à plis, chemise boutonnée': 'lowrider style: pleated trousers and a buttoned shirt' },
    mood: [[/timide|discret|pudique/, 'shy and reserved'], [/serieux|studieux|stoique/, 'serious'], [/charm|magnetique/, 'a confident, charming smile'], [/blagu|espiegle|pince/, 'a playful grin'], [/anxieux|hypersensible/, 'a slightly tense, worried look'], [/calme|flegmatique|serein/, 'calm and composed'], [/sarcast|ironi|cynique/, 'a sarcastic half-smile'], [/curieux|observateur/, 'curious, attentive eyes'], [/mefiant|paranoia|rusé|ruse|roublard/, 'a wary, suspicious look'], [/reveu|contemplatif|nostalg|melanc/, 'a dreamy, distant gaze'], [/sur de soi|fier|insolent/, 'a confident, direct gaze'], [/extravert|bavard|optimiste|sociable/, 'a warm, open smile']],
    job: [[/polic|lspd|bcso|sahp|sheri|adjoint|ranger|highway/, 'a police officer in uniform'], [/infirm|aide-soign/, 'a nurse in scrubs'], [/medecin|urgentiste/, 'a doctor in scrubs'], [/ambulan|\bems\b/, 'a paramedic in uniform'], [/pompier|lsfd/, 'a firefighter'], [/mecanic|garag|depann/, 'a mechanic in work overalls'], [/informati|hacker|developpeu|cyber|webmaster|data/, 'a tech worker in a hoodie'], [/serveu|barista|bartender|cuisin/, 'in hospitality work attire'], [/etudiant/, 'a student with a backpack'], [/avocat|juridi|comptable|commercial|marketing/, 'in business attire'], [/journalist|photograph|paparazzi/, 'a journalist with a camera'], [/musicien|\bdj\b/, 'a musician'], [/pecheu|marin|plongee/, 'a fisherman in weathered clothes'], [/securite|garde du corps|merryweather/, 'in dark security attire'], [/livreu|chauffeu|taxi|camionneu/, 'a driver in practical clothes']],
    head: { photo: 'Photorealistic portrait photograph, 85mm lens, shallow depth of field, natural soft lighting, detailed skin texture', jeu: 'Stylized semi-realistic digital illustration inspired by modern open-world crime video game artwork, bold shapes, vibrant colors', comics: 'Detailed comic-book illustration with clean ink lines and cel shading', peinture: 'Cinematic digital painting with visible brushstrokes and dramatic lighting' },
    frame: { buste: 'head-and-shoulders portrait, vertical 4:5 composition', pied: 'full-body shot, standing, vertical 2:3 composition' },
    scene: { neutre: 'a plain neutral studio background', rue: gta => (gta ? 'a sunny Southern California-style street with palm trees and neon signs, softly blurred (Los Santos atmosphere)' : 'a typical American city street, softly blurred'), travail: 'their workplace, softly blurred background' }
  };
  const FR = {
    coupe: { court: 'courts', ras: 'rasés', mi: 'mi-longs', long: 'longs', boucles: 'bouclés' },
    pilo: { '3j': 'une barbe de trois jours', barbe: 'une barbe', mous: 'une moustache' },
    lunettes: { rondes: 'des lunettes rondes', carrees: 'des lunettes carrées' },
    corps: { Mince: 'une silhouette mince', 'Athlétique': 'une silhouette athlétique', Moyenne: 'une silhouette moyenne', Robuste: 'une carrure robuste', Ronde: 'une silhouette ronde' },
    mood: [[/timide|discret|pudique/, 'un air timide et réservé'], [/serieux|studieux|stoique/, 'un air sérieux'], [/charm|magnetique/, 'un sourire charmeur et assuré'], [/blagu|espiegle|pince/, 'un sourire en coin amusé'], [/anxieux|hypersensible/, 'un regard tendu, inquiet'], [/calme|flegmatique|serein/, 'une expression calme'], [/sarcast|ironi|cynique/, 'un demi-sourire sarcastique'], [/curieux|observateur/, 'un regard curieux et attentif'], [/mefiant|paranoia|rusé|ruse|roublard/, 'un regard méfiant'], [/reveu|contemplatif|nostalg|melanc/, 'un regard rêveur et lointain'], [/sur de soi|fier|insolent/, 'un regard direct et assuré'], [/extravert|bavard|optimiste|sociable/, 'un sourire chaleureux et ouvert']],
    job: [[/polic|lspd|bcso|sahp|sheri|adjoint|ranger|highway/, 'en uniforme de policier'], [/infirm|aide-soign/, 'en blouse d\'infirmier'], [/medecin|urgentiste/, 'en blouse de médecin'], [/ambulan|\bems\b/, 'en uniforme d\'ambulancier'], [/pompier|lsfd/, 'en tenue de pompier'], [/mecanic|garag|depann/, 'en bleu de travail de mécanicien'], [/informati|hacker|developpeu|cyber|webmaster|data/, 'en sweat à capuche, façon informaticien'], [/serveu|barista|bartender|cuisin/, 'en tenue de service'], [/etudiant/, 'avec un sac à dos d\'étudiant'], [/avocat|juridi|comptable|commercial|marketing/, 'en tenue de bureau'], [/journalist|photograph|paparazzi/, 'avec un appareil photo autour du cou'], [/musicien|\bdj\b/, 'en tenue de musicien'], [/pecheu|marin|plongee/, 'en vêtements de marin usés'], [/securite|garde du corps|merryweather/, 'en tenue de sécurité sombre'], [/livreu|chauffeu|taxi|camionneu/, 'en tenue pratique de conducteur']],
    head: { photo: 'Portrait photographique réaliste, objectif 85 mm, faible profondeur de champ, lumière naturelle douce, texture de peau détaillée', jeu: 'Illustration numérique semi-réaliste inspirée des jeux vidéo d\'action en monde ouvert, formes marquées, couleurs vives', comics: 'Illustration de comics détaillée, traits d\'encre nets, ombrage en aplats', peinture: 'Peinture numérique cinématographique, coups de pinceau visibles, éclairage dramatique' },
    frame: { buste: 'portrait en buste, composition verticale 4:5', pied: 'personnage en pied, debout, composition verticale 2:3' },
    scene: { neutre: 'un fond de studio neutre', rue: gta => (gta ? 'une rue ensoleillée façon Californie du Sud, avec palmiers et enseignes néon, légèrement floue (ambiance Los Santos)' : 'une rue américaine typique, légèrement floue'), travail: 'son lieu de travail, arrière-plan flou' }
  };

  const pickMood = (dict, traits) => { const out = []; dict.forEach(m => { if (out.length < 2 && traits.some(t => m[0].test(t))) out.push(m[1]); }); return out; };

  function build(c, o, gta) {
    o = Object.assign({}, DEFAULTS, o);
    const v = c.v, en = o.lang !== 'fr', F = en ? EN : FR;
    const genre = v.genre, age = Number(v.age) || 0;
    const traits = (v.traits || []).map(norm), job = norm(v.metier);
    const hairIdx = Math.min(Math.max(parseInt(v.av_cheveux, 10) || 0, 0), D.CHEVEUX.length - 1), eyeIdx = Math.min(Math.max(parseInt(v.av_yeux, 10) || 0, 0), D.YEUX.length - 1), skinIdx = Math.min(Math.max(parseInt(v.av_peau, 10) || 0, 0), D.PEAU.length - 1);
    const bits = [];
    const who = en ? ('a ' + (age ? age + '-year-old ' : '') + (genre === 'Femme' ? 'woman' : genre === 'Homme' ? 'man' : 'person')) : ((genre === 'Femme' ? 'une femme' : genre === 'Homme' ? 'un homme' : 'une personne') + (age ? ' de ' + age + ' ans' : ''));
    bits.push(who);
    if (en) bits.push(EN.peau[skinIdx]); else bits.push('peau ' + D.PEAU[skinIdx].n.toLowerCase());
    // cheveux
    const cut = v.av_coupe || 'court';
    if (cut === 'chauve') bits.push(en ? 'a bald head' : 'crâne chauve');
    else if (en) bits.push(cut === 'queue' ? EN.cheveux[hairIdx] + ' hair tied in a ponytail' : cut === 'chignon' ? EN.cheveux[hairIdx] + ' hair tied in a bun' : EN.coupe[cut] + ' ' + EN.cheveux[hairIdx] + ' hair');
    else { const cp = D.COUPES.find(x => x.v === cut); bits.push('cheveux ' + D.CHEVEUX[hairIdx].n.toLowerCase() + ' ' + (cp ? cp.p : '')); }
    bits.push(en ? EN.yeux[eyeIdx] + ' eyes' : 'yeux ' + D.YEUX[eyeIdx].n.toLowerCase());
    if (genre !== 'Femme' && F.pilo[v.av_pilo]) bits.push(F.pilo[v.av_pilo]);
    if (F.lunettes[v.av_lunettes]) bits.push(F.lunettes[v.av_lunettes]);
    if (v.av_taches === 'oui') bits.push(en ? 'freckles' : 'des taches de rousseur');
    if (F.corps[v.corpulence]) bits.push(F.corps[v.corpulence]);
    const h = Number(v.taille) || 0;
    if (h >= 186) bits.push(en ? 'tall' : 'grand'); else if (h && h <= 160) bits.push(en ? 'short in stature' : 'de petite taille');
    const body = bits.filter(Boolean).join(', ').replace(/^(.*?), /, '$1, ');
    // tenue
    const styles = (v.style || []).map(s => first(s));
    let outfit = '';
    if (en) {
      const sl = styles.map(s => EN.style[s] || '"' + s + '"');
      const jb = EN.job.find(j => j[0].test(job));
      outfit = [sl.length ? 'wearing ' + sl.join(' and ') : '', jb ? (sl.length ? 'as ' : 'dressed as ') + jb[1] : ''].filter(Boolean).join(', ');
    } else {
      const jb = FR.job.find(j => j[0].test(job));
      outfit = [styles.length ? 'style vestimentaire : ' + styles.map(s => s.toLowerCase()).join(', ') : '', jb ? jb[1] : ''].filter(Boolean).join(', ');
    }
    const moods = pickMood(F.mood, traits);
    const mood = moods.length ? moods.join(', ') : (en ? 'a natural, neutral expression' : 'une expression naturelle');
    const scene = o.scene === 'rue' ? F.scene.rue(!!gta) : o.scene === 'travail' ? F.scene.travail : F.scene.neutre;
    const signes = String(v.signes || '').replace(/\s+/g, ' ').trim();
    const parts = en
      ? [F.head[o.style] + '.', cap(F.frame[o.frame]) + '.', cap(body) + '.', outfit ? outfit.charAt(0).toUpperCase() + outfit.slice(1) + '.' : '', signes ? 'Distinguishing features (written in French): ' + signes + (/[.!?]$/.test(signes) ? '' : '.') : '', 'Expression: ' + mood + '.', 'Background: ' + scene + '.', 'No text, no logo, no watermark.']
      : [F.head[o.style] + '.', cap(F.frame[o.frame]) + '.', cap(body) + '.', outfit ? outfit.charAt(0).toUpperCase() + outfit.slice(1) + '.' : '', signes ? 'Signes distinctifs : ' + signes + (/[.!?]$/.test(signes) ? '' : '.') : '', 'Expression : ' + mood + '.', 'Décor : ' + scene + '.', 'Pas de texte, pas de logo, pas de filigrane.'];
    return parts.filter(Boolean).join(' ');
  }

  return { build, OPT, DEFAULTS };
})();
