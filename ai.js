/* IA facultative : écrit une phrase à partir de la fiche, avec une clé d'API que la personne colle elle-même.
   La clé reste dans ce navigateur (localStorage) et n'est envoyée qu'au service choisi. Sans clé, rien ne change :
   le site garde son résumé automatique et la demande à copier-coller. */
window.LDV_AI = (function () {
  const STORE = 'alias.ai.v1';
  const PRESETS = {
    gemini: { label: 'Google Gemini', model: 'gemini-3.5-flash-lite', help: 'https://aistudio.google.com/apikey', note: 'Clé gratuite sur Google AI Studio (compte Google, sans carte bancaire en général).' },
    openai: { label: 'Autre service (compatible OpenAI)', model: 'openai/gpt-oss-20b', url: 'https://api.groq.com/openai/v1/chat/completions', help: '', note: 'Groq, OpenRouter, Mistral… : colle l\'adresse de l\'API, le nom du modèle et ta clé.' }
  };
  const DEFAULTS = { provider: 'gemini', model: PRESETS.gemini.model, url: PRESETS.openai.url, key: '' };

  const load = () => {
    try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(STORE) || '{}')); } catch (e) { return Object.assign({}, DEFAULTS); }
  };
  const save = cfg => { try { localStorage.setItem(STORE, JSON.stringify(cfg)); return true; } catch (e) { return false; } };
  const configured = () => !!load().key;

  const friendly = (status, msg) => {
    const m = String(msg || '').replace(/\s+/g, ' ').slice(0, 160);
    if (status === 400 || status === 401 || status === 403) return 'La clé est refusée ou invalide' + (m ? ' (' + m + ')' : '') + '.';
    if (status === 404) return 'Ce modèle n\'existe pas pour ce service' + (m ? ' (' + m + ')' : '') + ' : change le nom du modèle dans les réglages.';
    if (status === 429) return 'Limite gratuite atteinte : réessaie dans une minute, ou demain.';
    return 'Le service a répondu par une erreur (' + status + ')' + (m ? ' : ' + m : '') + '.';
  };

  // une phrase, sans guillemets ni titre
  const clean = t => String(t || '').split(/\n+/).map(x => x.trim()).filter(Boolean)[0].replace(/^["«“\s*]+|["»”\s*]+$/g, '').replace(/\s+/g, ' ').slice(0, 400);

  async function ask(prompt, signal) {
    const cfg = load();
    if (!cfg.key) throw new Error('Aucune clé enregistrée.');
    let res, data;
    try {
      if (cfg.provider === 'openai') {
        res = await fetch(cfg.url, { method: 'POST', signal, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + cfg.key }, body: JSON.stringify({ model: cfg.model, messages: [{ role: 'user', content: prompt }], temperature: 0.6, max_tokens: 400 }) });
      } else {
        res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(cfg.model) + ':generateContent', { method: 'POST', signal, headers: { 'Content-Type': 'application/json', 'x-goog-api-key': cfg.key }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 1024 } }) });
      }
    } catch (e) {
      if (e && e.name === 'AbortError') throw e;
      throw new Error('Impossible de joindre le service : vérifie ta connexion.');
    }
    try { data = await res.json(); } catch (e) { data = null; }
    if (!res.ok) throw new Error(friendly(res.status, data && data.error && (data.error.message || data.error)));
    const text = cfg.provider === 'openai'
      ? data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
      : data && data.candidates && data.candidates[0] && data.candidates[0].content && (data.candidates[0].content.parts || []).map(p => p.text || '').join('');
    if (!text || !String(text).trim()) throw new Error('Le service n\'a rien renvoyé (réponse bloquée ou vide). Réessaie.');
    return clean(text);
  }

  /* ---------- image : génération avec une clé OpenAI (ChatGPT Images) ---------- */
  const IMG_STORE = 'alias.img.v1';
  const IMG_DEFAULTS = { model: 'gpt-image-2.5-flare', quality: 'medium', key: '' };
  const imgLoad = () => { try { return Object.assign({}, IMG_DEFAULTS, JSON.parse(localStorage.getItem(IMG_STORE) || '{}')); } catch (e) { return Object.assign({}, IMG_DEFAULTS); } };
  const imgSave = cfg => { try { localStorage.setItem(IMG_STORE, JSON.stringify(cfg)); return true; } catch (e) { return false; } };
  const imgFriendly = (status, msg) => {
    const m = String(msg || '').replace(/\s+/g, ' ').slice(0, 200);
    if (status === 401) return 'La clé OpenAI est refusée ou invalide' + (m ? ' (' + m + ')' : '') + '.';
    if (status === 403) return 'OpenAI refuse l\'accès à ce modèle : l\'organisation doit parfois être vérifiée dans la console OpenAI' + (m ? ' (' + m + ')' : '') + '.';
    if (status === 404) return 'Ce modèle d\'image n\'existe pas pour ce compte' + (m ? ' (' + m + ')' : '') + ' : change le nom du modèle dans les réglages.';
    if (status === 429) return 'Limite atteinte ou crédit insuffisant sur le compte OpenAI' + (m ? ' (' + m + ')' : '') + '.';
    if (status === 400) return 'OpenAI a refusé la demande' + (m ? ' : ' + m : '') + '.';
    return 'OpenAI a répondu par une erreur (' + status + ')' + (m ? ' : ' + m : '') + '.';
  };
  // renvoie un Blob (image PNG) ; la génération peut durer une bonne minute
  async function image(prompt, size, signal) {
    const cfg = imgLoad();
    if (!cfg.key) throw new Error('Aucune clé OpenAI enregistrée.');
    let res, data;
    try {
      res = await fetch('https://api.openai.com/v1/images/generations', { method: 'POST', signal, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + cfg.key }, body: JSON.stringify({ model: cfg.model, prompt, size: size || '1024x1536', quality: cfg.quality, n: 1 }) });
    } catch (e) {
      if (e && e.name === 'AbortError') throw e;
      throw new Error('Impossible de joindre OpenAI : vérifie ta connexion.');
    }
    try { data = await res.json(); } catch (e) { data = null; }
    if (!res.ok) throw new Error(imgFriendly(res.status, data && data.error && (data.error.message || data.error)));
    const b64 = data && data.data && data.data[0] && data.data[0].b64_json;
    if (!b64) throw new Error('OpenAI n\'a renvoyé aucune image. Réessaie.');
    const bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: 'image/png' });
  }

  return { PRESETS, load, save, configured, ask, image, imgLoad, imgSave, IMG_DEFAULTS };
})();
