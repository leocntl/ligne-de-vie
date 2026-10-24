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

  return { PRESETS, load, save, configured, ask };
})();
