/* ASTROVOYAGERS · the recorded voice
   The listening parts play recordings (audio/…mp3, made in voice-kit) when there is one for the text;
   if not, the page uses the device's own voice as before. audio/index.js lists what exists.
   Shared: the voyager's page (the site, next to its audio/ folder) and, from 7.14, the class boards,
   which play the same recordings from the site over the internet (voiceboard.js loads the list).
   The source is in sinif-paneli; the site's build.sh copies it. */
(function () {
  'use strict';
  let M = {}, base = '', have = new Set(), stories = new Set(), V = '';
  // M: the list of recordings (self.AVAudio of audio/index.js); at: where the audio/ folder is ('' = next to the page)
  function load(list, at) {
    M = list || {}; base = at || '';
    have = new Set(String(M.s || '').split(' ').filter(Boolean)); stories = new Set(M.story || []);
    // the recordings keep their names when they are made again, so their version is in the address
    // (a browser then fetches the new voice instead of playing the old one from its cache)
    V = M.v ? '?v=' + encodeURIComponent(M.v) : '';
    if (self.AVVoice) self.AVVoice.name = M.voice || '';
  }
  load(self.AVAudio);
  let player = null, queue = [], turn = 0;
  // a text, or { story: id } → the address of its recording ('' when there is none)
  function urlOf(x) {
    if (x && typeof x === 'object') return stories.has(x.story) ? base + 'audio/story/' + x.story + '.mp3' + V : '';
    const k = self.AVKey ? self.AVKey(x) : '';
    return k && have.has(k) ? base + 'audio/s/' + k + '.mp3' + V : '';
  }
  // The recorded form of one piece of text: as it is, or a word without/with its full stop
  // (the words are recorded under the bare word: "cat", the boards often say "cat.").
  function one(p) {
    p = String(p).trim(); if (!p) return null;
    const bare = p.replace(/[.!?,;:]+$/, '');
    for (const c of [p, bare, bare + '.']) if (c && urlOf(c)) return c;
    return null;
  }
  // A text without a recording of its own may be made of recorded parts: "Word. A sentence." or a list
  // of words "cat, dog, bird". → the parts (in their recorded form) or null
  function partsOf(text) {
    const t = String(text).trim();
    const all = list => { const out = list.map(one); return out.length && out.every(Boolean) ? out : null; };
    const solo = one(t);
    if (solo) return [solo];
    // sentences: the fewest recorded pieces, each one or more sentences in a row ("Shy. Burak is quiet. He is shy.")
    const s = t.split(/(?<=[.!?])\s+/), best = [[]];
    for (let i = 1; i <= s.length; i++) {
      best[i] = null;
      for (let j = 0; j < i; j++) {
        const r = best[j] && one(s.slice(j, i).join(' '));
        if (r && (!best[i] || best[j].length + 1 < best[i].length)) best[i] = best[j].concat([r]);
      }
    }
    if (best[s.length] && s.length > 1) return best[s.length];
    return /[.!?]\s+\S/.test(t) ? null : all(t.replace(/[.!?]$/, '').split(/,\s*/));
  }
  function stop() { turn++; queue = []; if (player) { try { player.pause(); } catch (e) { /* nothing is playing */ } } }
  // Plays one recording or several, one after the other. Returns false (and plays nothing) when a
  // recording is missing; onFail is called when a recording cannot be played after all.
  function say(what, slow, onFail) {
    let list = Array.isArray(what) ? what : [what];
    if (typeof what === 'string') list = partsOf(what) || list;
    const urls = list.map(urlOf);
    if (!urls.length || urls.some(u => !u)) return false;
    stop();
    try { if (self.speechSynthesis) speechSynthesis.cancel(); } catch (e) { /* no device voice */ }
    const my = turn, rate = slow ? 0.75 : 1, fail = () => { if (my === turn) { stop(); if (onFail) onFail(); } };
    queue = urls.slice();
    const next = () => {
      if (my !== turn || !queue.length) return;
      player = player || new Audio();
      player.onended = next; player.onerror = fail;
      player.src = queue.shift();
      player.defaultPlaybackRate = rate; player.playbackRate = rate;
      const p = player.play();
      if (p && p.catch) p.catch(e => { if (e && e.name !== 'AbortError') fail(); });
    };
    next();
    return true;
  }
  // The best English voice the device has, for texts without a recording: British first, the
  // natural-sounding ones before the others, never the joke voices of some phones.
  const NICE = /natural|neural|premium|enhanced|siri/i, JOKE = /compact|espeak|eloquence|albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley/i;
  function device() {
    if (!self.speechSynthesis) return null;
    const score = v => (/^en[-_]GB/i.test(v.lang) ? 4 : /^en[-_]US/i.test(v.lang) ? 2 : 1) + (NICE.test(v.name) ? 6 : /google/i.test(v.name) ? 3 : 0) - (JOKE.test(v.name) ? 20 : 0);
    return speechSynthesis.getVoices().filter(v => /^en([-_]|$)/i.test(v.lang)).sort((a, b) => score(b) - score(a))[0] || null;
  }
  self.AVVoice = { say, stop, device, load, has: x => typeof x === 'string' ? !!partsOf(x) : !!urlOf(x), count: () => have.size, name: M.voice || '' };
})();
