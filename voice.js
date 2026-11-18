/* ASTROVOYAGERS · the recorded voice
   The listening parts play recordings (audio/…mp3, made with tools/voice) when there is one for the
   text; if not, the page uses the device's own voice as before. audio/index.js lists what exists. */
(function () {
  'use strict';
  const M = self.AVAudio || {};
  const have = new Set(String(M.s || '').split(' ').filter(Boolean)), stories = new Set(M.story || []);
  // the recordings keep their names when they are made again, so their version is in the address
  // (a browser then fetches the new voice instead of playing the old one from its cache)
  const V = M.v ? '?v=' + encodeURIComponent(M.v) : '';
  let player = null, queue = [], turn = 0;
  // a text, or { story: id } → the address of its recording ('' when there is none)
  function urlOf(x) {
    if (x && typeof x === 'object') return stories.has(x.story) ? 'audio/story/' + x.story + '.mp3' + V : '';
    const k = self.AVKey ? self.AVKey(x) : '';
    return k && have.has(k) ? 'audio/s/' + k + '.mp3' + V : '';
  }
  function stop() { turn++; queue = []; if (player) { try { player.pause(); } catch (e) { /* nothing is playing */ } } }
  // Plays one recording or several, one after the other. Returns false (and plays nothing) when a
  // recording is missing; onFail is called when a recording cannot be played after all.
  function say(what, slow, onFail) {
    const urls = (Array.isArray(what) ? what : [what]).map(urlOf);
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
  self.AVVoice = { say, stop, device, has: x => !!urlOf(x), name: M.voice || '' };
})();
