/* ASTROVOYAGERS · coursebook library
   The practice questions of the class books (books/*.js, 100 per unit) and helpers to turn them into
   questions for the board: vocabulary, grammar, dialogue, find the mistake, odd one out and word order.
   A unit is referred to as "book/unit", for example "h1/u3". Several units are joined with commas:
   "h1/u1,h1/u2" (a practice round or a boss can use more than one unit). */
(function (root) {
  'use strict';

  const ORDER = ['meb5', 'h1', 'h2', 'df1'];
  const KINDS = {
    v: { label: 'Vocabulary', ask: 'Choose the word' },
    g: { label: 'Grammar', ask: 'Choose the right form' },
    d: { label: 'Dialogue', ask: 'Choose the best answer' },
    e: { label: 'Find the mistake', ask: 'Which part is wrong?' },
    x: { label: 'Odd one out', ask: 'Which one does not belong?' },
    o: { label: 'Word order', ask: 'Put the words in order' }
  };
  const CHOICE = ['v', 'g', 'd', 'e', 'x'];
  const books = () => (root.CQBooks || []).slice().sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
  const book = id => books().find(b => b.id === id) || null;
  const ref = (b, u) => b + '/' + u;
  function parse(r) {
    const [b, u] = String(r || '').split('/');
    const bk = book(b), un = bk ? bk.units.find(x => x.id === u) : null;
    return un ? { book: bk, unit: un, ref: ref(bk.id, un.id) } : null;
  }
  // "a/b,c/d" or an array → the valid units, in book and unit order, without repeats.
  function parseList(rs) {
    const list = (Array.isArray(rs) ? rs : String(rs || '').split(',')).map(s => parse(String(s).trim())).filter(Boolean);
    const seen = new Set(), out = [];
    list.forEach(p => { if (!seen.has(p.ref)) { seen.add(p.ref); out.push(p); } });
    const pos = p => ORDER.indexOf(p.book.id) * 1000 + p.book.units.indexOf(p.unit);
    return out.sort((a, b) => pos(a) - pos(b));
  }
  const join = list => parseList(list).map(p => p.ref).join(',');
  const first = () => { const b = books()[0]; return b && b.units[0] ? ref(b.id, b.units[0].id) : null; };
  const unitShort = u => String(u.name).split(' · ')[0];
  // A name for one unit or a group of units.
  function unitName(rs) {
    const L = parseList(rs);
    if (!L.length) return '';
    if (L.length === 1) return L[0].book.short + ' · ' + L[0].unit.name;
    const bks = [...new Set(L.map(p => p.book))];
    if (bks.length === 1) {
      const all = L.length === bks[0].units.length;
      return bks[0].short + ' · ' + (all ? 'all units' : L.length <= 3 ? L.map(p => unitShort(p.unit)).join(', ') : L.length + ' units');
    }
    return L.length + ' units · ' + bks.map(b => b.short).join(' + ');
  }

  function rnd(n) {
    try { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; } catch (e) { return Math.floor(Math.random() * n); }
  }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  // One stored item → a question ready for the board. i is its index in the unit.
  function question(unit, i, r) {
    const q = unit.q[i];
    if (!q) return null;
    const t = q[0], k = KINDS[t];
    if (!k) return null;
    const base = { t, i, ref: r || null, kind: k.label, ask: k.ask };
    if (t === 'v' || t === 'g' || t === 'd') {
      return Object.assign(base, { prompt: q[1], answer: q[2], options: shuffle([q[2]].concat(q[3].split('|'))), full: q[1].replace('___', q[2]) });
    }
    if (t === 'e') {
      // The sentence has four [marked] parts; the options are those parts in sentence order.
      const parts = [...q[1].matchAll(/\[([^\]]+)\]/g)].map(m => m[1]);
      const plain = q[1].replace(/\[([^\]]+)\]/g, '$1');
      let done = false;
      const full = q[1].replace(/\[([^\]]+)\]/g, (m, p) => { if (!done && p === q[2]) { done = true; return q[3]; } return p; });
      return Object.assign(base, { prompt: q[1], plain, parts, answer: q[2], fix: q[3], options: parts, full });
    }
    if (t === 'x') {
      return Object.assign(base, { prompt: 'Which one does not belong?', answer: q[2], options: shuffle(q[1].split('|')), reason: q[3] || '', full: q[1].split('|').join(', ') });
    }
    if (t === 'o') {
      const words = q[1].split(' ');
      let tiles = shuffle(words);
      for (let n = 0; n < 6 && tiles.join(' ') === q[1]; n++) tiles = shuffle(words);
      return Object.assign(base, { prompt: 'Put the words in order.', answer: q[1], words, tiles, full: q[1] });
    }
    return null;
  }
  const kindOk = (t, kind, choiceOnly) => (kind === 'mix' || !kind ? true : t === kind) && (!choiceOnly || t !== 'o');
  // Indexes of a unit's items of the given kind ('mix' = every kind; choiceOnly leaves out word order).
  function pool(unit, kind, choiceOnly) {
    return unit.q.map((q, i) => (kindOk(q[0], kind, choiceOnly) ? i : -1)).filter(i => i >= 0);
  }
  // The same for several units: [{ k: position in the list, p: parsed unit, i }].
  function poolList(rs, kind, choiceOnly) {
    const out = [];
    parseList(rs).forEach((p, k) => pool(p.unit, kind, choiceOnly).forEach(i => out.push({ k, p, i })));
    return out;
  }
  function counts(unitOrList) {
    const c = { v: 0, g: 0, d: 0, e: 0, x: 0, o: 0, mix: 0, mt: 0, sc: 0, dc: 0 };
    const units = Array.isArray(unitOrList) || typeof unitOrList === 'string' ? parseList(unitOrList).map(p => p.unit) : [unitOrList];
    units.forEach(u => u.q.forEach(q => { c[q[0]] = (c[q[0]] || 0) + 1; c.mix++; if (DECODE(q)) c.dc++; }));
    c.mt = Math.floor(units.reduce((a, u) => a + matchItems(u).length, 0) / MATCH_N);
    c.sc = Math.floor((c.g + c.e) / SORT_N);
    return c;
  }

  // ---------- 7.1: three board games from the same questions ----------
  // Docking Bay: match four words to their gap sentences. Signal Check: sort six sentences into
  // correct and broken. Decode the Signal: put the letters of a word in order (the sentence is the clue).
  const MATCH_N = 4, SORT_N = 6;
  const DECODE = q => q[0] === 'v' && q[1].includes('___') && /^[A-Za-z]{3,10}$/.test(q[2]);
  const matchItems = u => u.q.filter(q => q[0] === 'v' && q[1].includes('___') && q[2].split(' ').length <= 3);
  function gameRound(rs, kind, n) {
    const L = parseList(rs), out = [];
    if (!L.length) return out;
    const want = n > 0 ? n : 99;
    if (kind === 'mt') {
      const bag = shuffle(L.flatMap(p => matchItems(p.unit).map(q => ({ q, ref: p.ref }))));
      while (out.length < want && bag.length >= MATCH_N) {
        const pairs = [], used = new Set();
        for (let i = 0; i < bag.length && pairs.length < MATCH_N; ) {
          const w = bag[i].q[2].toLowerCase();
          if (used.has(w) || pairs.some(p => bag[i].q[1].toLowerCase().includes(p.word.toLowerCase()))) { i++; continue; }
          used.add(w); pairs.push({ word: bag[i].q[2], prompt: bag[i].q[1], full: bag[i].q[1].replace('___', bag[i].q[2]), ref: bag[i].ref });
          bag.splice(i, 1);
        }
        if (pairs.length < MATCH_N) break;
        out.push({ t: 'mt', kind: 'Docking Bay', ask: 'Match each word to its sentence', pairs, words: shuffle(pairs.map(p => p.word)), sentences: shuffle(pairs.map((p, i) => i)),
          prompt: 'Dock every word next to its sentence.', answer: pairs.map(p => p.word).join(', '), full: pairs.map(p => p.full).join(' '), ref: pairs[0].ref });
      }
      return out;
    }
    if (kind === 'sc') {
      const bag = shuffle(L.flatMap(p => p.unit.q.filter(q => q[0] === 'g' || q[0] === 'e').map(q => ({ q, ref: p.ref }))));
      while (out.length < want && bag.length >= SORT_N) {
        const nOk = 2 + rnd(3); // two to four correct sentences on a board
        const cards = bag.splice(0, SORT_N).map((x, i) => {
          const q = x.q, ok = i < nOk;
          if (q[0] === 'g') {
            const right = q[1].replace('___', q[2]), wrongs = q[3].split('|');
            return ok ? { text: right, ok: true } : { text: q[1].replace('___', wrongs[rnd(wrongs.length)]), ok: false, fix: right };
          }
          const plain = q[1].replace(/\[([^\]]+)\]/g, '$1');
          let done = false;
          const right = q[1].replace(/\[([^\]]+)\]/g, (m, part) => { if (!done && part === q[2]) { done = true; return q[3]; } return part; });
          return ok ? { text: right, ok: true } : { text: plain, ok: false, fix: right };
        });
        out.push({ t: 'sc', kind: 'Signal Check', ask: 'Correct signal or broken signal?', cards: shuffle(cards), prompt: 'Read each signal. Is the sentence correct or broken?',
          answer: '', full: cards.map(c2 => c2.ok ? c2.text : c2.fix).join(' '), ref: L[0].ref });
      }
      return out;
    }
    if (kind === 'dc') {
      const bag = shuffle(L.flatMap(p => p.unit.q.filter(DECODE).map(q => ({ q, ref: p.ref }))));
      const seen = new Set();
      bag.forEach(x => {
        const w = x.q[2];
        if (out.length >= want || seen.has(w.toLowerCase())) return;
        seen.add(w.toLowerCase());
        const letters = w.split('');
        let tiles = shuffle(letters);
        for (let k = 0; k < 8 && tiles.join('') === w; k++) tiles = shuffle(letters);
        out.push({ t: 'dc', kind: 'Decode the Signal', ask: 'Put the letters in order', answer: w, prompt: x.q[1], tiles, words: letters, full: x.q[1].replace('___', w), ref: x.ref });
      });
      return out;
    }
    return out;
  }
  const GAMES = ['mt', 'sc', 'dc'];
  // A practice round: n random items of the chosen kind from one or more units.
  // With several units the questions are shared out between them as evenly as possible.
  function round(unitOrList, kind, n) {
    if (unitOrList && unitOrList.q) return shuffle(pool(unitOrList, kind)).slice(0, n || undefined).map(i => question(unitOrList, i)).filter(Boolean);
    const L = parseList(unitOrList);
    const bags = L.map(p => shuffle(pool(p.unit, kind)).map(i => ({ p, i })));
    const total = bags.reduce((a, b) => a + b.length, 0), want = n && n < total ? n : total;
    const picked = [];
    let k = rnd(Math.max(1, bags.length));
    while (picked.length < want) {
      const bag = bags[k % bags.length];
      if (bag.length) picked.push(bag.shift());
      k++;
    }
    return shuffle(picked).map(x => question(x.p.unit, x.i, x.p.ref)).filter(Boolean);
  }

  // Word of the day: a vocabulary item of the unit, the same all day.
  function wordOfDay(r, d) {
    const p = parse(r) || parse(first());
    if (!p) return null;
    const items = p.unit.q.filter(q => q[0] === 'v' && q[1].includes('___') && q[2].split(' ').length <= 3);
    if (!items.length) return null;
    d = d || new Date();
    const n = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000);
    const q = items[(n * 7919) % items.length];
    return { word: q[2], sentence: q[1].replace('___', q[2]), book: p.book, unit: p.unit, ref: p.ref };
  }

  root.CQBook = { GAMES, gameRound, KINDS, CHOICE, books, book, parse, parseList, join, ref, first, unitName, unitShort, question, pool, poolList, counts, round, wordOfDay, shuffle };
})(typeof self !== 'undefined' ? self : globalThis);
