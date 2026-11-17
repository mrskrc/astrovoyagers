/* ASTROVOYAGERS · student portal
   A voyager opens their own page from home with the code on their card. The class boards keep a small
   record of each voyager in the teacher's Google script, locked with a key made from that code; this
   page finds and opens it (shared/portalkit.js). What the voyager does here (a practice round, buying
   or wearing something in the Star Bazaar, the wishlist) is sent back as a request, also locked, and
   the next class board that is on checks it and does it. Until then it shows as "on its way".
   Practice at home: 1 XP (and its Star Coins) for each right answer, at most 10 XP a day.
   Nothing about the voyagers is in this website's files. */
(() => {
  'use strict';
  const P = self.CQPortalKit, D = self.CQShopData, A = self.CQShopArt, C = self.CQCreatures;
  const $ = id => document.getElementById(id);
  function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  const LS = {
    get(k) { try { return JSON.parse(localStorage.getItem('av.' + k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('av.' + k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
    del(k) { try { localStorage.removeItem('av.' + k); } catch (e) { /* ignore */ } }
  };
  const coins = n => '✦ ' + Number(n || 0).toLocaleString('en-GB');
  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
  const todayKey = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const niceDay = d => { const [y, m, dd] = String(d).split('-').map(Number); return new Date(y, m - 1, dd).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }); };
  const ago = t => { const m = Math.round((Date.now() - t) / 60000); if (m < 2) return 'just now'; if (m < 60) return m + ' minutes ago'; const h = Math.round(m / 60); if (h < 24) return plural(h, 'hour') + ' ago'; return plural(Math.round(h / 24), 'day') + ' ago'; };
  const any = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let toastT = 0;
  function toast(text, ms) { const t = $('toast'); t.textContent = text; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms || 4200); }

  // ---------- the teacher's script ----------
  let url = '';
  async function api(body) {
    let res, text;
    try {
      res = await fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'text/plain;charset=utf-8' }, credentials: 'omit', cache: 'no-store', redirect: 'follow' });
      text = await res.text();
    } catch (e) { throw new Error('No connection. Check the internet and try again.'); }
    let d;
    try { d = JSON.parse(text); } catch (e) { throw new Error('The class cloud did not answer. Try again later.'); }
    if (!d.ok) throw new Error(d.error || 'Something went wrong. Try again.');
    return d;
  }

  // ---------- who is signed in ----------
  let me = null;      // { k, raw }
  let rec = null;     // the voyager's record (from the boards)
  let cls = null;     // the class's record
  let inbox = [];     // requests that wait for a board (from the script)
  let sent = [];      // requests sent from this device, not seen in the script yet
  let tab = 'home', tick = 0;

  const EQUIP = ['hull', 'wing', 'engine', 'paint', 'decal', 'trail', 'hat', 'cape', 'aura', 'buddy', 'frame', 'title', 'wall', 'floor', 'window', 'bed', 'desk', 'lamp', 'plant', 'shelf', 'poster', 'rug', 'gadget', 'face', 'neck', 'hold', 'pet', 'ceiling'];
  const equipable = it => EQUIP.includes(it.slot);
  const owns = (v, it) => it.rarity === 'starter' || v.own.includes(it.id);
  const wearing = (v, it) => equipable(it) && (v.eq[it.slot] === it.id || (!v.eq[it.slot] && D.STARTER[it.slot] === it.id));
  const setCards = k => D.items.filter(i => i.set === k);
  const setCount = (v, k) => setCards(k).filter(i => v.own.includes(i.id)).length;
  const mySig = v => Object.keys(v.sigs || {}).find(i => v.sigs[i] === '') || null;
  function reqOk(v, r) {
    if (!r) return true;
    if (r.books) return (v.books || 0) >= r.books;
    if (r.hw) return (v.hw || 0) >= r.hw;
    if (r.set) return setCount(v, r.set) === setCards(r.set).length;
    if (r.badge) return (v.badges || []).includes(r.badge);
    if (r.level) return (v.lv || 1) >= r.level;
    return true;
  }
  const priceOf = (v, it) => (D.priceOf ? D.priceOf(it, v.c || '') : it.price);
  const offOf = (v, it) => (D.offOf ? D.offOf(it, v.c || '') : 0);
  function block(v, it) {
    if (owns(v, it)) return '';
    if (it.signature) { if (it.id in v.sigs && v.sigs[it.id] !== '') return 'taken'; if (mySig(v)) return 'one'; }
    if (it.req && !reqOk(v, it.req)) return 'req';
    if (v.dust < priceOf(v, it)) return 'dust';
    return '';
  }
  // What the page shows: the record, with the requests that are on their way already done.
  function view() {
    const v = JSON.parse(JSON.stringify(rec));
    v.sigs = v.sigs || {};
    const done = new Set((rec.done || []).map(d => d[0])), seen = new Set();
    v.pend = inbox.concat(sent).filter(e => { if (done.has(e.id) || seen.has(e.id)) return false; seen.add(e.id); return true; }).sort((a, b) => a.t - b.t);
    v.pendXp = 0; v.pendItems = new Set();
    const home = rec.home && rec.home.d === todayKey() ? rec.home.x : 0, max = (rec.home && rec.home.max) || 10;
    let used = home;
    v.pend.forEach(e => {
      const it = e.item ? D.byId.get(e.item) : null;
      if (e.kind === 'prac') { const x = Math.max(0, Math.min(e.right || 0, max - used)); used += x; v.pendXp += x; }
      else if (e.kind === 'buy' && it && !block(v, it)) {
        v.dust -= priceOf(v, it); v.own.push(it.id); v.pendItems.add(it.id); v.wish = v.wish.filter(x => x !== it.id);
        if (equipable(it)) v.eq[it.slot] = it.id;
        if (it.signature) v.sigs[it.id] = '';
      } else if (e.kind === 'equip') { if (e.item) v.eq[e.slot] = e.item; else delete v.eq[e.slot]; }
      else if (e.kind === 'name') v.eq.shipname = e.a + '|' + e.n;
      else if (e.kind === 'chest' && v.team) { const n = Math.min(e.n || 0, v.dust); v.dust -= n; v.team.fill += n; }
      else if (e.kind === 'gift' && it) { v.dust -= priceOf(v, it); v.gleft = 0; }
      else if (e.kind === 'wish' && it) { const has = v.wish.includes(it.id); if (e.on && !has) v.wish.push(it.id); if (!e.on && has) v.wish = v.wish.filter(x => x !== it.id); }
    });
    v.homeUsed = used; v.homeMax = max;
    return v;
  }

  // ---------- signing in ----------
  let fails = 0, waitUntil = 0;
  async function signIn(code, remember) {
    const msg = $('signMsg');
    if (Date.now() < waitUntil) { msg.className = 'msg err'; msg.textContent = 'Wait a moment, then try again.'; return; }
    if (P.normCode(code).length !== 6) { msg.className = 'msg err'; msg.textContent = 'Your code has 6 letters and numbers.'; return; }
    $('go').disabled = true; msg.className = 'msg'; msg.innerHTML = '<span class="spin"></span> Opening…';
    try {
      const info = await api({ op: 'info' });
      if (!info.portal || !info.salt) throw new Error('Your class is not online yet. Ask your teacher.');
      const kk = await P.studentKeys(code, info.salt);
      const r = await api({ op: 'portalGet', k: kk.k });
      if (r.none) {
        fails++;
        if (fails >= 3) waitUntil = Date.now() + Math.min(60, 5 * fails) * 1000;
        throw new Error('That code did not work. Check it on your card.');
      }
      me = kk; fails = 0;
      if (remember) LS.set('me', { url, k: kk.k, raw: kk.raw }); else LS.del('me');
      await absorb(r);
      show();
    } catch (e) {
      msg.className = 'msg err'; msg.textContent = e.message;
    } finally { $('go').disabled = false; }
  }
  async function absorb(r) {
    rec = await P.open(me.raw, r.rec);
    const list = [];
    for (const e of r.ev || []) { try { const d = await P.open(me.raw, e.d); if (d && d.id === e.id) list.push(d); } catch (x) { /* not ours */ } }
    inbox = list;
    const ids = new Set(inbox.map(e => e.id).concat((rec.done || []).map(d => d[0])));
    sent = sent.filter(e => !ids.has(e.id));
    if (r.cls) cls = await P.open(rec.ck, r.cls);
    else if (!cls || cls.c !== rec.c) { const r2 = await api({ op: 'portalGet', k: me.k, c: rec.cid }); if (r2.cls) cls = await P.open(rec.ck, r2.cls); }
    news();
  }
  let refreshing = false;
  async function refresh(quiet) {
    if (!me || refreshing) return;
    refreshing = true;
    try { const r = await api({ op: 'portalGet', k: me.k, c: rec ? rec.cid : '' }); if (r.none) { signOut('Your code has changed. Ask your teacher for your new card.'); return; } await absorb(r); render(); }
    catch (e) { if (!quiet) toast(e.message); }
    finally { refreshing = false; }
  }
  function signOut(note) {
    me = null; rec = null; cls = null; inbox = []; sent = [];
    LS.del('me');
    $('app').hidden = true; $('signin').hidden = false;
    $('code').value = '';
    $('signMsg').className = 'msg' + (note ? ' err' : ''); $('signMsg').textContent = note || '';
  }
  function show() { $('signin').hidden = true; $('app').hidden = false; tab = 'home'; render(); window.scrollTo(0, 0); hello(); }

  // Requests that a board finished: tell the voyager once.
  function news() {
    const shown = new Set(LS.get('shown') || []), out = [];
    (rec.done || []).forEach(([id, ok, why, x, item]) => {
      if (shown.has(id)) return;
      shown.add(id);
      const it = item && D.byId.get(item);
      if (!ok && it) out.push('Zib could not finish your order: ' + it.name + (why === 'dust' ? ' (not enough Star Coins).' : why === 'taken' ? ' (another voyager has it).' : why === 'owned' ? ' (your friend has it already).' : why === 'week' ? ' (one gift a week).' : '.'));
    });
    const gseen = +LS.get('gseen') || 0, fresh = (rec.gifts || []).filter(g => g[2] > gseen);
    fresh.forEach(g => { const it = D.byId.get(g[0]); if (it) out.push('🎁 A gift from ' + (g[1] || 'a friend') + ': ' + it.name + '!'); });
    if (fresh.length) LS.set('gseen', Math.max(...fresh.map(g => g[2])));
    LS.set('shown', [...shown].slice(-200));
    if (out.length) toast(out.join(' '), 7000);
  }

  // ---------- sending a request ----------
  function device() { let d = LS.get('dv'); if (!/^[a-z0-9]{8}$/.test(d || '')) { d = ''; while (d.length < 8) d += Math.random().toString(36).slice(2); d = d.slice(0, 8); LS.set('dv', d); } return d; }
  function hello() { // once for each phone and code, so the teacher can see a code that travels
    if (!me) return;
    const said = LS.get('hi') || [], mark = String(me.k).slice(0, 10);
    if (said.includes(mark)) return;
    LS.set('hi', said.concat(mark).slice(-10));
    send({ kind: 'hi' });
  }
  async function send(e) {
    e.id = P.rid(12); e.t = Date.now(); e.dv = device();
    sent.push(e); render();
    try {
      await api({ op: 'portalSend', k: me.k, id: e.id, d: await P.seal(me.raw, e) });
      setTimeout(() => refresh(true), 2500);
      return true;
    } catch (x) {
      sent = sent.filter(s => s !== e); render();
      toast(x.message);
      return false;
    }
  }

  // ---------- the page ----------
  const ICONS = {
    speak: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 0 0-8 0v5a4 4 0 0 0 4 4zm7-4h-2a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1A7 7 0 0 0 19 11z"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 2 11h3v9h6v-6h2v6h6v-9h3z"/></svg>',
    practice: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h12l4 4v12H4zm2 2v12h12V9h-3V6zm2 5h8v2H8zm0 4h6v2H8z"/></svg>',
    homework: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h9l5 5v15H6zm2 2v16h10V8h-4V4zm1.5 9.5 1.4-1.4 1.6 1.6 3.6-3.6 1.4 1.4-5 5z"/></svg>',
    bazaar: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.6 6.6L21 9l-5 4.6L17.6 21 12 17.3 6.4 21 8 13.6 3 9l6.4-.4z"/></svg>',
    mine: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 12c-2-4-5-7-9-8 1 2 1 4 0 6L4 14l2 2-2 4 4-2 2 2 4-8c2-1 4-1 6 0z"/></svg>'
  };
  const TABS = [['home', 'Home'], ['practice', 'Practice'], ['speak', 'Captain'], ['homework', 'Homework'], ['bazaar', 'Bazaar'], ['mine', 'My stuff']];
  function frameOn(node, it) {
    node.classList.toggle('framed', !!it);
    if (!it) return;
    node.dataset.frame = it.art.style; node.style.setProperty('--f1', it.art.c1); node.style.setProperty('--f2', it.art.c2);
  }
  function render() {
    if (!rec) return;
    const v = view();
    // header
    const cv = el('canvas', 'px'); A.dressed(cv, v.cr, v.st || 1, v.eq, { hat: v.hat, t: tick });
    $('meArt').replaceChildren(cv);
    frameOn($('meArt'), D.byId.get(v.eq.frame) || null);
    $('meClass').textContent = 'Voyager · ' + v.c;
    $('meName').textContent = 'Hello, ' + v.n + '!';
    const ti = D.byId.get(v.eq.title) || D.byId.get(D.STARTER.title);
    $('meTitle').textContent = ti.art.text;
    $('meLv').textContent = 'Level ' + v.lv;
    $('meBar').style.width = Math.round((100 * v.into) / Math.max(1, v.need)) + '%';
    $('meCoins').textContent = coins(v.dust);
    // tabs
    const nav = $('tabs');
    if (!nav.childElementCount) TABS.forEach(([k, label]) => {
      const b = el('button', 'tab'); b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.k = k;
      b.innerHTML = ICONS[k]; b.appendChild(el('span', '', label));
      b.addEventListener('click', () => { if (k === tab) return; tab = k; quiz = null; pick.view = ''; stopSay(); render(); window.scrollTo(0, 0); });
      nav.appendChild(b);
    });
    nav.querySelectorAll('.tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.k === tab)));
    const page = $('page');
    if (tab === 'practice' && quiz) { if (quiz.hold && quiz.hold.isConnected) return; return renderQuiz(); } // the round in progress keeps its place
    page.textContent = '';
    ({ home: pageHome, practice: pagePractice, speak: pageSpeak, homework: pageHomework, bazaar: pageBazaar, mine: pageMine, parent: pageParent })[tab](page, v);
    if ($('sheet').open) renderSheet();
  }

  // ---------- 7.11: speaking practice ----------
  let speakRoot = null;
  function pageSpeak(page, v) {
    const K = self.CQSpeak;
    const head = el('article', 'panel'); const sp = (rec && rec.speak) || { x: 0, max: 10 };
    head.append(el('h2', '', 'Your Captain Speaking'), el('p', 'muted', '"This is your captain speaking!" Listen, then say the sentence into your microphone, loud and clear. Every right sentence is 1 XP.'), el('p', 'shipname', sp.x + ' / ' + sp.max + ' XP today'));
    page.appendChild(head);
    if (!K) { page.appendChild(el('p', 'muted', 'Speaking practice is not ready on this page yet.')); return; }
    if (!speakRoot) {
      speakRoot = el('div', 'panel');
      K.mount(speakRoot, {
        intro: 'Captain, your crew is listening!',
        onRound: async r => {
          if (!r.checked) return 'Good practice! XP is only for sentences the microphone checks.';
          if (!r.right) return 'No XP this time. Try again!';
          const ok = await send({ kind: 'speak', n: r.n, right: r.right, mode: r.mode });
          return ok ? 'Sent to your teacher\'s board: up to +' + r.right + ' XP.' : 'Could not send it. Check the internet and play again.';
        }
      });
    }
    page.appendChild(speakRoot);
  }

  // ---------- home ----------
  // ---------- 7.14: the word of the day, the same word as on the class board ----------
  // The board takes it from the Oxford books only: the unit of the week if it is an Oxford one,
  // or else the last Oxford unit the class studied.
  // (The books a class does not use: the same list as CLASS_SKIP_BOOKS in the extension's store.js.)
  const CLASS_SKIP_BOOKS = { '5A': ['h1'], '5B': ['h1'], '5C': ['h1'], '5D': ['h1'] };
  let wodBack = 0, wodSaid = null;
  function wodRef() {
    const B = self.CQBook, skip = CLASS_SKIP_BOOKS[rec && rec.c] || [];
    const ox = r => { const p = r && B.parse(r); return !!(p && p.book.publisher === 'Oxford' && !skip.includes(p.book.id)); };
    const st = cls && cls.study;
    if (ox(st)) return st;
    const t = ((cls && cls.units) || []).slice().reverse().find(ox);
    if (t) return t;
    const b = B.books().find(x => x.publisher === 'Oxford' && !skip.includes(x.id));
    return b && b.units[0] ? B.ref(b.id, b.units[0].id) : st || B.first();
  }
  function wodCard() {
    const box = el('article', 'panel wod'), body = el('div', 'wod-body');
    box.append(el('p', 'eyebrow', 'Word of the day'), body);
    body.innerHTML = '<span class="spin"></span>';
    loadBooks().then(() => drawWod(body)).catch(() => box.remove());
    return box;
  }
  function drawWod(body) {
    const B = self.CQBook, K = self.CQSpeak, d = new Date(); d.setDate(d.getDate() - wodBack);
    const w = B.wordOfDay(wodRef(), d);
    body.textContent = '';
    if (!w) { body.appendChild(el('p', 'muted', 'No word today.')); return; }
    body.appendChild(el('b', 'wod-word', w.word));
    const sent = el('p', 'wod-sent'), at = w.sentence.toLowerCase().indexOf(w.word.toLowerCase());
    if (at < 0) sent.textContent = w.sentence;
    else sent.append(document.createTextNode(w.sentence.slice(0, at)), el('mark', '', w.sentence.slice(at, at + w.word.length)), document.createTextNode(w.sentence.slice(at + w.word.length)));
    body.appendChild(sent);
    const row = el('div', 'acts'), out = el('p', 'wod-out'); out.setAttribute('role', 'status');
    row.appendChild(btnOf('🔊 Listen', 'btn btn-cyan', () => say(w.word + '. ' + w.sentence)));
    row.appendChild(btnOf('🐢 Slowly', 'btn btn-ghost', () => say(w.word + '. ' + w.sentence, true)));
    if (K && K.canListen()) {
      const mic = btnOf('🎤 Say it', 'btn btn-gold', async () => {
        if (mic.disabled) return;
        mic.disabled = true; stopSay(); out.className = 'wod-out'; out.textContent = 'Say the sentence now…';
        try {
          const alts = await K.listen(st => { out.textContent = st === 'checking' ? 'Checking…' : 'Listening… say the sentence.'; });
          if (!alts.length) { out.textContent = 'I did not hear you. Tap and try again.'; }
          else {
            const r = K.score([w.sentence], alts, 0.8);
            wodSaid = r.ok ? w.word : wodSaid;
            out.className = 'wod-out ' + (r.ok ? 'ok' : 'bad');
            out.textContent = r.ok ? (r.perfect ? 'Perfect! Every word was clear.' : 'Well done! You said it.') : 'Almost! I heard: "' + r.heard + '". Listen and try again.';
          }
        } catch (e) { out.textContent = /not-allowed|denied/i.test(e.message) ? 'The microphone is off. Allow it in your browser and try again.' : 'The microphone did not work. Try again.'; }
        mic.disabled = false;
      });
      mic.id = 'wodMic';
      row.appendChild(mic);
    }
    body.append(row, out);
    if (wodSaid === w.word) { out.className = 'wod-out ok'; out.textContent = 'You said this sentence. Well done!'; }
    const days = el('div', 'chips wod-days');
    ['Today', 'Yesterday', '2 days ago', '3 days ago', '4 days ago'].forEach((label, k) => {
      const b = btnOf(label, 'chip', () => { wodBack = k; drawWod(body); }); b.setAttribute('aria-pressed', String(wodBack === k));
      days.appendChild(b);
    });
    body.append(days, el('p', 'muted small', B.unitName(w.ref)));
  }
  function pageHome(page, v) {
    const cards = el('div', 'cards');
    const wk = el('article', 'panel stat'); wk.append(el('p', 'eyebrow', 'This week'), el('b', '', '+' + v.wk + ' XP'), el('span', 'muted', v.xp + ' XP in all · ' + plural((v.badges || []).length, 'badge')));
    const hp = el('article', 'panel stat'), bar = el('span', 'bar'), fill = el('i');
    fill.style.width = Math.round((100 * Math.min(v.homeUsed, v.homeMax)) / v.homeMax) + '%'; bar.appendChild(fill);
    hp.append(el('p', 'eyebrow', 'Practice at home today'), el('b', '', v.homeUsed + ' / ' + v.homeMax + ' XP'), bar,
      el('span', 'muted', v.homeUsed >= v.homeMax ? 'Great work! You can still practise for fun.' : '1 XP for each right answer.'));
    const go = el('button', 'btn btn-cyan', 'Practise now'); go.type = 'button'; go.addEventListener('click', () => { tab = 'practice'; render(); });
    hp.appendChild(go);
    const hwOpen = cls ? cls.hw.filter(h => !h.checked).sort((a, b) => a.due.localeCompare(b.due)) : [];
    const hw = el('article', 'panel stat');
    hw.append(el('p', 'eyebrow', 'Homework'), el('b', '', hwOpen.length ? plural(hwOpen.length, 'task') + ' open' : 'All done'));
    if (hwOpen[0]) hw.append(el('span', '', hwOpen[0].title + ' · due ' + niceDay(hwOpen[0].due)));
    cards.append(wk, hp, hw);
    page.appendChild(cards);
    page.appendChild(wodCard());
    // news
    const news = el('article', 'panel');
    news.appendChild(el('h2', '', 'News from your class'));
    const ul = el('ul', 'list');
    v.pend.slice(-6).reverse().forEach(e => {
      const it = e.item && D.byId.get(e.item), li = el('li');
      const what = e.kind === 'prac' ? 'Practice: ' + e.right + '/' + e.n + ' right' : e.kind === 'buy' && it ? 'Bought ' + it.name : e.kind === 'equip' ? 'Changed what you wear' : e.kind === 'name' ? 'A new name for your ship' : e.kind === 'chest' ? coins(e.n) + ' for the squad chest' : e.kind === 'gift' && it ? 'A gift: ' + it.name : e.kind === 'hi' ? 'Hello from this device' : e.kind === 'wish' && it ? (e.on ? 'Wishlist: ' : 'Off the wishlist: ') + it.name : 'A request';
      li.append(el('span', 'tag wait', 'On its way'), el('span', '', what));
      ul.appendChild(li);
    });
    (rec.done || []).slice(-8).reverse().forEach(([id, ok, why, x, item]) => {
      const it = item && D.byId.get(item), li = el('li');
      let what;
      if (x || why === 'cap') what = 'Practice at home: +' + x + ' XP' + (why === 'cap' ? ' (the day\'s 10 XP were full)' : '');
      else if (it) what = (ok ? 'Yours now: ' : 'Not done: ') + it.name + (ok ? '' : why === 'dust' ? ' (not enough coins)' : why === 'taken' ? ' (someone else has it)' : '');
      else if (!ok) what = 'A request could not be done';
      else return;
      li.append(el('span', 'tag ' + (ok ? 'ok' : 'bad'), ok ? 'Done' : 'Not done'), el('span', '', what));
      ul.appendChild(li);
    });
    if (!ul.childElementCount) news.appendChild(el('p', 'empty', 'Nothing new yet. Practise, or visit the Star Bazaar!'));
    else news.appendChild(ul);
    news.appendChild(el('p', 'muted small', 'Things you do here arrive when a board in your classroom is on. Your class updated this page ' + ago(rec.at) + '.'));
    page.appendChild(news);
    const pb = el('button', 'btn btn-ghost parent-link', 'For parents: a summary'); pb.type = 'button';
    pb.addEventListener('click', () => { tab = 'parent'; render(); window.scrollTo(0, 0); });
    page.appendChild(pb);
  }

  // ---------- 7.13: a summary for the parents ----------
  function pageParent(page, v) {
    const box = el('article', 'panel parent');
    const p = v.par || { weeks: [0, 0, 0, v.wk || 0], hd: 0, hp: 0, hs: 0, picks: 0 };
    box.append(el('p', 'eyebrow', 'For parents · ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })), el('h2', '', v.n + ' · ' + v.c + ' · English'));
    box.appendChild(el('p', 'muted', 'ASTROVOYAGERS is the game of our English lessons. Children earn XP when they speak, answer, read and do their homework. Here is how ' + v.n + ' is doing.'));
    const facts = el('div', 'pfacts');
    const fact = (k, val, sub) => { const d = el('div', 'pfact'); d.append(el('span', '', k), el('b', '', val)); if (sub) d.appendChild(el('small', '', sub)); facts.appendChild(d); };
    fact('Level', String(v.lv), v.xp + ' XP in all');
    fact('This week', '+' + p.weeks[3] + ' XP', p.weeks[3] > p.weeks[2] ? 'More than last week' : p.weeks[3] === p.weeks[2] ? 'The same as last week' : 'Less than last week');
    fact('Books read', String(v.books || 0), 'on BookR Next');
    fact('Badges', String((v.badges || []).length), 'for good work');
    box.appendChild(facts);
    box.appendChild(el('h3', '', 'XP in the last four weeks'));
    const chart = el('div', 'pweeks'), top = Math.max(1, ...p.weeks);
    p.weeks.forEach((x, i) => { const c = el('div', 'pweek'), b = el('i'); b.style.height = Math.max(4, Math.round(100 * x / top)) + '%'; c.append(el('b', '', '+' + x), b, el('span', '', i === 3 ? 'This week' : i === 2 ? 'Last week' : (3 - i) + ' weeks ago')); chart.appendChild(c); });
    box.appendChild(chart);
    box.appendChild(el('h3', '', 'Homework'));
    const hwl = cls ? cls.hw.filter(h => h.checked) : [], done = hwl.filter(h => (v.hwm || {})[h.id] === 'd').length, miss = hwl.filter(h => { const m = (v.hwm || {})[h.id]; return m !== 'd' && m !== 'e'; });
    box.appendChild(el('p', '', hwl.length ? done + ' of the last ' + plural(hwl.length, 'checked task') + ' done.' + (miss.length ? ' Not done: ' + miss.slice(0, 4).map(h => h.title).join('; ') + '.' : ' Nothing is missing.') : 'No checked homework yet.'));
    const open = cls ? cls.hw.filter(h => !h.checked) : [];
    if (open.length) box.appendChild(el('p', '', 'To do now: ' + open.map(h => h.title + ' (due ' + niceDay(h.due) + ')').join('; ') + '.'));
    box.appendChild(el('h3', '', 'Work at home in the last four weeks'));
    box.appendChild(el('p', '', p.hd ? 'Practised on ' + plural(p.hd, 'day') + ': ' + plural(p.hp, 'right answer') + ' and ' + plural(p.hs, 'sentence') + ' spoken aloud.' : 'No practice at home yet. Ten minutes a day on this page is enough.'));
    box.appendChild(el('h3', '', 'How you can help'));
    const ul = el('ul', 'ptips');
    ['Ask your child to open this page for ten minutes a day: Practice and Captain.', 'Listen to one BookR book together each week.', 'Ask "What did you learn in English today?" Any answer in English is a success.'].forEach(t => ul.appendChild(el('li', '', t)));
    box.appendChild(ul);
    const row = el('div', 'acts noprint'), pr = el('button', 'btn btn-gold', 'Print'), bk = el('button', 'btn btn-ghost', 'Back');
    pr.type = bk.type = 'button'; pr.addEventListener('click', () => window.print()); bk.addEventListener('click', () => { tab = 'home'; render(); });
    row.append(pr, bk); box.appendChild(row);
    box.appendChild(el('p', 'muted small', 'Mr. Şekerci · This page shows only your own child. Updated ' + ago(rec.at) + '.'));
    page.appendChild(box);
  }

  // ---------- homework ----------
  function pageHomework(page, v) {
    const box = el('article', 'panel');
    box.appendChild(el('h2', '', 'Homework'));
    const list = cls ? cls.hw.slice().sort((a, b) => b.due.localeCompare(a.due)) : [];
    if (!list.length) { box.appendChild(el('p', 'empty', 'No homework right now.')); page.appendChild(box); return; }
    const ul = el('ul', 'list');
    list.forEach(h => {
      const li = el('li'), m = (v.hwm || {})[h.id];
      let tag;
      if (h.checked) tag = m === 'd' ? ['ok', 'Done ✓'] : m === 'e' ? ['open', 'Excused'] : ['bad', 'Not done'];
      else tag = h.due < todayKey() ? ['bad', 'Late'] : ['open', 'Due ' + niceDay(h.due)];
      const tx = el('div'); tx.append(el('b', '', h.title));
      if (h.note) tx.append(el('div', 'muted small', h.note));
      li.append(el('span', 'tag ' + tag[0], tag[1]), tx);
      ul.appendChild(li);
    });
    box.appendChild(ul);
    box.appendChild(el('p', 'muted small', 'Your teacher checks homework in class. Done homework gives +10 XP.'));
    page.appendChild(box);
  }

  // ---------- practice ----------
  let booksReady = null, storiesReady = null, quiz = null, pick = { units: '', kind: 'mix', game: 'quiz', view: '' };
  const loadScript = (src, sorry) => new Promise((ok, bad) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => bad(new Error(sorry)); document.head.appendChild(s); });
  function loadBooks() {
    if (booksReady) return booksReady;
    const files = ['shared/books/meb5.js', 'shared/books/harmonize1.js', 'shared/books/harmonize2.js', 'shared/books/discover1.js', 'shared/books.js'];
    booksReady = files.reduce((p, f) => p.then(() => loadScript(f, 'The questions did not load.')), Promise.resolve());
    booksReady.catch(() => { booksReady = null; });
    return booksReady;
  }
  function loadStories() {
    if (self.AVStories) return Promise.resolve();
    if (!storiesReady) { storiesReady = loadScript('stories.js', 'The stories did not load.'); storiesReady.catch(() => { storiesReady = null; }); }
    return storiesReady;
  }
  const KINDS = [['mix', 'Mixed'], ['v', 'Vocabulary'], ['g', 'Grammar'], ['d', 'Dialogue'], ['e', 'Find the mistake'], ['x', 'Odd one out']];
  // 7.14: more ways to practise. Every game sends its right answers like the quiz (1 XP each, the day's 10 XP).
  const GAMES = [
    ['quiz', '❓', 'Quiz', 'Ten questions, choose the answer'],
    ['spell', '🎧', 'Listen and spell', 'Hear a word and type it'],
    ['build', '🧩', 'Build the sentence', 'Put the words in the right order'],
    ['memory', '🃏', 'Memory match', 'Find the word for each sentence'],
    ['story', '📖', 'Story time', 'Listen to a story, answer five questions']
  ];

  // ---------- 7.14: the mistake notebook (it lives on this device) ----------
  const misKey = () => 'mis.' + String(me ? me.k : '').slice(0, 10);
  const misAll = () => { const m = LS.get(misKey()); return Array.isArray(m) ? m : []; };
  const misId = q => (q.t === 'sp' ? 's:' : 'q:') + q.ref + '#' + q.i;
  // ok: the question was answered right (it leaves the notebook); not ok: it goes in. Returns +1, -1 or 0.
  function misMark(q, ok) {
    if (!q || !q.ref || q.i == null) return 0;
    let m = misAll();
    const id = misId(q), at = m.findIndex(x => x.id === id);
    if (ok) { if (at < 0) return 0; m.splice(at, 1); LS.set(misKey(), m); return -1; }
    if (at >= 0) { m[at].n++; m[at].d = todayKey(); LS.set(misKey(), m); return 0; }
    m.push({ id, r: q.ref, i: q.i, s: q.t === 'sp' ? 1 : 0, a: q.answer, n: 1, d: todayKey() });
    if (m.length > 60) m = m.slice(-60);
    LS.set(misKey(), m);
    return 1;
  }
  const SPELL = q => q[0] === 'v' && q[1].includes('___') && /^[A-Za-z]{3,10}$/.test(q[2]);
  const spellQ = (p, i) => { const q = p.unit.q[i]; return { t: 'sp', i, ref: p.ref, kind: 'Listen and spell', ask: 'Listen and type the word', prompt: q[1], answer: q[2], full: q[1].replace('___', q[2]) }; };
  // A notebook line → its question again (null when the books have changed since).
  function misQuestion(x) {
    const B = self.CQBook, p = B.parse(x.r), raw = p && p.unit.q[x.i];
    if (!raw) return null;
    if (x.s) return raw[2] === x.a && SPELL(raw) ? spellQ(p, x.i) : null;
    const q = B.question(p.unit, x.i, p.ref);
    return q && q.answer === x.a ? q : null;
  }
  function misLive() { // the lines that still have a question; the others are dropped
    const all = misAll(), live = all.filter(x => misQuestion(x));
    if (live.length !== all.length) LS.set(misKey(), live);
    return live;
  }

  function pagePractice(page, v) {
    const box = el('article', 'panel');
    box.append(el('h2', '', 'Practice'), el('p', 'muted', 'Choose a game. 1 XP for each right answer, up to 10 XP a day (' + Math.max(0, v.homeMax - v.homeUsed) + ' XP left today).'));
    page.appendChild(box);
    const wait = el('p', 'muted'); wait.innerHTML = '<span class="spin"></span> Loading the questions…';
    box.appendChild(wait);
    loadBooks().then(() => {
      if (tab !== 'practice' || quiz || !box.isConnected) return;
      wait.remove();
      if (pick.view === 'mistakes') { box.remove(); return pageMistakes(page); }
      const B = self.CQBook;
      const units = B.parseList((cls && cls.units) || []).map(p => p.ref);
      const study = cls && cls.study && B.parse(cls.study) ? cls.study : units[units.length - 1] || B.first();
      if (!pick.units || !B.parseList(pick.units).length) pick.units = study;
      box.appendChild(el('p', 'eyebrow', 'Game'));
      const gc = el('div', 'games');
      GAMES.forEach(([k, icon, name, about]) => {
        const b = el('button', 'opt game'); b.type = 'button'; b.dataset.game = k; b.setAttribute('aria-pressed', String(pick.game === k));
        const tx = el('span', 'game-tx'); tx.append(el('b', '', name), el('small', '', about));
        b.append(el('span', 'game-ic', icon), tx);
        b.addEventListener('click', () => { pick.game = k; render(); });
        gc.appendChild(b);
      });
      box.appendChild(gc);
      if (pick.game !== 'story') {
        box.appendChild(el('p', 'eyebrow', 'Unit'));
        const uc = el('div', 'chips');
        const opts = [[study, 'This week: ' + B.unitName(study)]];
        units.filter(r => r !== study).slice(-6).forEach(r => opts.push([r, B.unitName(r)]));
        if (units.length > 1) opts.push([units.join(','), 'All my units']);
        opts.forEach(([r, label]) => { const b = el('button', 'chip', label); b.type = 'button'; b.setAttribute('aria-pressed', String(pick.units === r)); b.addEventListener('click', () => { pick.units = r; render(); }); uc.appendChild(b); });
        box.appendChild(uc);
      }
      if (pick.game === 'quiz') {
        box.appendChild(el('p', 'eyebrow', 'Questions'));
        const kc = el('div', 'chips');
        KINDS.forEach(([k, label]) => { const b = el('button', 'chip', label); b.type = 'button'; b.setAttribute('aria-pressed', String(pick.kind === k)); b.addEventListener('click', () => { pick.kind = k; render(); }); kc.appendChild(b); });
        box.appendChild(kc);
      }
      const go = el('button', 'btn btn-gold', 'Start'); go.type = 'button'; go.id = 'pracGo'; go.style.marginTop = '14px';
      go.addEventListener('click', () => startQuiz());
      box.appendChild(go);
      // the mistake notebook
      const n = misLive().length, nb = el('article', 'panel notebook');
      nb.appendChild(el('h2', '', 'My mistake notebook'));
      nb.appendChild(el('p', n ? '' : 'muted', n ? plural(n, 'question') + ' to try again. A right answer takes a question out of the notebook.' : 'It is empty. Questions you get wrong wait here, so you can try them again.'));
      if (n) {
        const row = el('div', 'acts'), again = el('button', 'btn btn-cyan', 'Try my mistakes again'), see = el('button', 'btn btn-ghost', 'See my mistakes');
        again.type = see.type = 'button'; again.id = 'misGo';
        again.addEventListener('click', () => startQuiz('mistakes'));
        see.addEventListener('click', () => { pick.view = 'mistakes'; render(); window.scrollTo(0, 0); });
        row.append(again, see); nb.appendChild(row);
      }
      page.appendChild(nb);
    }).catch(e => { wait.textContent = e.message; });
  }
  function pageMistakes(page) {
    const B = self.CQBook, list = misLive().slice().sort((a, b) => b.n - a.n), box = el('article', 'panel notebook');
    box.append(el('h2', '', 'My mistake notebook'), el('p', 'muted', 'Read the right sentences and listen to them. Then try the questions again.'));
    const ul = el('ul', 'list mis-list');
    list.forEach(x => {
      const q = misQuestion(x), li = el('li'), tx = el('div');
      const text = q.t === 'x' ? q.full + ' · the odd one: ' + q.answer + (q.reason ? ' (' + q.reason + ')' : '') : q.full;
      tx.append(el('b', '', text), el('div', 'muted small', q.kind + ' · ' + B.unitName(q.ref) + ' · wrong ' + (x.n === 1 ? 'once' : x.n + ' times')));
      const l = el('button', 'btn btn-ghost mis-say', '🔊'); l.type = 'button'; l.setAttribute('aria-label', 'Listen'); l.addEventListener('click', () => say(q.t === 'x' ? q.answer : q.full));
      li.append(tx, l); ul.appendChild(li);
    });
    box.appendChild(ul);
    const row = el('div', 'acts'), again = el('button', 'btn btn-cyan', 'Try my mistakes again'), back = el('button', 'btn', 'Back'), wipe = el('button', 'btn btn-ghost', 'Empty the notebook');
    again.type = back.type = wipe.type = 'button';
    again.addEventListener('click', () => { pick.view = ''; startQuiz('mistakes'); });
    back.addEventListener('click', () => { pick.view = ''; render(); });
    wipe.addEventListener('click', () => { if (wipe.dataset.armed) { LS.set(misKey(), []); pick.view = ''; render(); } else { wipe.dataset.armed = '1'; wipe.textContent = 'Tap again to empty it'; } });
    if (list.length) row.append(again);
    row.append(back); if (list.length) row.append(wipe);
    box.appendChild(row); page.appendChild(box);
  }

  // One memory board: four words (left) and their gap sentences (right), face down.
  function memoryBoard(r) {
    const cards = [];
    r.pairs.forEach((p, k) => { cards.push({ k, side: 'w', text: p.word }); cards.push({ k, side: 's', text: p.prompt }); });
    return { t: 'mem', kind: 'Memory match', ask: 'Open a word and a sentence. Do they go together?', pairs: r.pairs, words: shuffle(cards.filter(c => c.side === 'w')), sents: shuffle(cards.filter(c => c.side === 's')), sel: null, miss: null, errors: 0, turns: 0, marks: r.pairs.length };
  }
  async function startQuiz(how) {
    const B = self.CQBook, game = how === 'mistakes' ? 'mistakes' : pick.game;
    let qs = [], story = null;
    if (game === 'mistakes') qs = shuffle(misLive().slice().sort((a, b) => b.n - a.n).slice(0, 10)).map(misQuestion).filter(Boolean);
    else if (game === 'spell') {
      const bag = [], seen = new Set();
      B.parseList(pick.units).forEach(p => p.unit.q.forEach((q, i) => { if (SPELL(q)) bag.push([p, i]); }));
      shuffle(bag).forEach(([p, i]) => { const w = p.unit.q[i][2].toLowerCase(); if (qs.length < 10 && !seen.has(w)) { seen.add(w); qs.push(spellQ(p, i)); } });
    } else if (game === 'build') qs = shuffle(B.poolList(pick.units, 'o')).slice(0, 10).map(x => B.question(x.p.unit, x.i, x.p.ref)).filter(Boolean);
    else if (game === 'memory') qs = B.gameRound(pick.units, 'mt', 2).map(memoryBoard);
    else if (game === 'story') {
      try { await loadStories(); } catch (e) { toast(e.message); return; }
      const all = self.AVStories || [], key = 'st.' + String(me ? me.k : '').slice(0, 10);
      let done = (LS.get(key) || []).filter(id => all.some(s => s.id === id));
      if (done.length >= all.length) done = done.slice(-1); // every story heard: start again, but not with the last one
      story = shuffle(all.filter(s => !done.includes(s.id)))[0];
      if (story) { LS.set(key, done.concat(story.id)); qs = story.q.map(q => ({ t: 'st', kind: 'Story time', ask: 'Listen to the story and answer', prompt: q[0], answer: q[1], options: shuffle(q.slice(1)), full: '' })); }
    } else {
      let pool = B.poolList(pick.units, pick.kind, true);
      if (pool.length < 4) pool = B.poolList(pick.units, 'mix', true);
      qs = shuffle(pool).slice(0, 10).map(x => B.question(x.p.unit, x.i, x.p.ref)).filter(Boolean);
    }
    if (!qs.length) { toast(game === 'mistakes' ? 'Your notebook is empty.' : 'No questions for this choice.'); return; }
    quiz = { game, qs, at: 0, marks: [], total: qs.reduce((a, q) => a + (q.marks || 1), 0), picked: null, started: Date.now(), units: pick.units, story, added: 0, fixed: 0 };
    stopSay();
    render(); window.scrollTo(0, 0);
  }
  const enVoice = () => { const vs = speechSynthesis.getVoices(); return vs.find(x => /^en(-|_)GB/i.test(x.lang)) || vs.find(x => /^en/i.test(x.lang)); };
  function stopSay() { try { if (self.speechSynthesis) speechSynthesis.cancel(); } catch (e) { /* no voice */ } }
  // Long texts are spoken sentence by sentence (some phones stop in the middle of a long one).
  function say(text, slow) {
    if (!text || !self.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const vv = enVoice();
      (String(text).match(/[^.!?]+[.!?]*/g) || [text]).map(s => s.trim()).filter(Boolean).forEach(part => {
        const u = new SpeechSynthesisUtterance(part);
        if (vv) u.voice = vv;
        u.lang = vv ? vv.lang : 'en-GB'; u.rate = slow ? 0.62 : 0.92;
        speechSynthesis.speak(u);
      });
    } catch (e) { /* no voice */ }
  }
  const btnOf = (label, cl, fn) => { const b = el('button', cl, label); b.type = 'button'; b.addEventListener('click', fn); return b; };
  // The current question is over: right or wrong, into or out of the notebook.
  function settle(ok) {
    const q = quiz.qs[quiz.at];
    quiz.done = true; quiz.ok = ok; quiz.marks.push(ok); quiz.hold = null;
    if (!ok && !quiz.missed) { quiz.missed = true; if (misMark(q, false) > 0) quiz.added++; }
    else if (ok && !quiz.missed && misMark(q, true) < 0) quiz.fixed++;
    renderQuiz();
  }
  function slip() { // a first wrong try: the question goes into the notebook, one more try is left
    const q = quiz.qs[quiz.at];
    quiz.tries = 1;
    if (!quiz.missed) { quiz.missed = true; if (misMark(q, false) > 0) quiz.added++; }
  }
  function nextQ() {
    quiz.at++;
    ['picked', 'done', 'ok', 'tries', 'missed', 'typed', 'hint', 'said', 'slots', 'lock', 'hold', 'note'].forEach(k => { delete quiz[k]; });
    quiz.picked = null;
    renderQuiz(); window.scrollTo(0, 0);
  }
  function renderQuiz() {
    const page = $('page'); page.textContent = '';
    if (quiz.story && quiz.at < quiz.qs.length) page.appendChild(storyPanel());
    const box = el('article', 'panel q-card');
    page.appendChild(box);
    if (quiz.at >= quiz.qs.length) return endQuiz(box);
    const q = quiz.qs[quiz.at];
    const top = el('div', 'q-top'), dots = el('div', 'dots'), at = quiz.marks.length;
    for (let i = 0; i < quiz.total; i++) dots.appendChild(el('i', i < at ? (quiz.marks[i] ? 'r' : 'w') : i === at ? 'now' : ''));
    top.append(el('span', '', (quiz.game === 'mistakes' ? 'My mistakes · ' : '') + (q.t === 'o' ? 'Build the sentence' : q.kind) + ' · ' + (quiz.at + 1) + '/' + quiz.qs.length), dots);
    box.appendChild(top);
    box.appendChild(el('p', 'eyebrow', q.ask));
    if (q.t === 'mem') return renderMemory(box, q);
    if (q.t === 'sp') renderSpell(box, q);
    else if (q.t === 'o') renderBuild(box, q);
    else renderChoice(box, q);
    if (quiz.done) {
      const ok = quiz.ok, fb = el('div', 'feedback ' + (ok ? 'right' : 'wrong'));
      const praise = any(['Right!', 'Well done!', 'Great!', 'Super!']);
      fb.textContent = q.t === 'sp' ? (ok ? praise : 'The word: ' + q.answer + '.') + ' ' + q.full
        : q.t === 'o' ? (ok ? praise : 'The sentence: ' + q.answer)
        : (ok ? praise : 'The answer: ' + q.answer + (/[.!?]$/.test(q.answer) ? '' : '.')) + (q.t === 'x' && q.reason ? ' ' + q.reason : '') + (q.t !== 'x' && q.full ? ' ' + q.full : '');
      box.appendChild(fb);
      const row = el('div', 'acts');
      if (q.t !== 'x' && q.full) row.appendChild(btnOf('🔊 Listen', 'btn btn-ghost', () => say(q.full)));
      const nx = btnOf(quiz.at + 1 < quiz.qs.length ? 'Next' : 'See my score', 'btn btn-gold', nextQ); nx.id = 'qNext';
      row.appendChild(nx); box.appendChild(row);
      setTimeout(() => nx.focus(), 30);
    }
  }
  function renderChoice(box, q) {
    const text = el('p', 'q-text');
    if (q.t === 'e') q.prompt.split(/(\[[^\]]+\])/).forEach(part => { const m = /^\[(.+)\]$/.exec(part); text.appendChild(m ? el('mark', '', m[1]) : document.createTextNode(part)); });
    else if (q.t === 'x' || q.t === 'st') text.textContent = q.prompt;
    else q.prompt.split('___').forEach((part, i) => { if (i) text.appendChild(el('span', 'gap', quiz.picked != null ? q.answer : ' ')); text.appendChild(document.createTextNode(part)); });
    box.appendChild(text);
    const opts = el('div', 'opts');
    q.options.forEach(o => {
      const b = el('button', 'opt', o); b.type = 'button';
      if (quiz.picked != null) { b.disabled = true; if (o === q.answer) b.classList.add('right'); else if (o === quiz.picked) b.classList.add('wrong'); }
      b.addEventListener('click', () => answer(o));
      opts.appendChild(b);
    });
    box.appendChild(opts);
  }
  function answer(o) {
    if (!quiz || quiz.picked != null) return;
    quiz.picked = o;
    settle(o === quiz.qs[quiz.at].answer);
  }
  // Listen and spell: the word is spoken, the sentence is the clue, two tries.
  function renderSpell(box, q) {
    const text = el('p', 'q-text');
    q.prompt.split('___').forEach((part, i) => { if (i) text.appendChild(el('span', 'gap', quiz.done ? q.answer : ' ')); text.appendChild(document.createTextNode(part)); });
    box.appendChild(text);
    if (!quiz.said) { quiz.said = true; say(q.answer); }
    if (quiz.done) return;
    const tools = el('div', 'acts');
    tools.append(btnOf('🔊 Listen', 'btn btn-cyan', () => say(q.answer)), btnOf('🐢 Slowly', 'btn btn-ghost', () => say(q.answer, true)),
      btnOf('🔤 Show the letters', 'btn btn-ghost', () => { quiz.hint = quiz.hint || shuffle(q.answer.toLowerCase().split('')).join(' '); quiz.hold = null; renderQuiz(); }));
    box.appendChild(tools);
    if (quiz.hint) box.appendChild(el('p', 'letters', quiz.hint));
    const form = el('form', 'spell'), inp = el('input', 'spell-in'), ok = el('button', 'btn btn-gold', 'Check');
    inp.type = 'text'; inp.id = 'spellIn'; inp.maxLength = 14; inp.value = quiz.typed || ''; inp.placeholder = q.answer.length + ' letters';
    inp.setAttribute('autocapitalize', 'none'); inp.setAttribute('autocomplete', 'off'); inp.setAttribute('autocorrect', 'off'); inp.spellcheck = false;
    inp.setAttribute('aria-label', 'Type the word you hear');
    inp.addEventListener('input', () => { quiz.typed = inp.value; });
    ok.type = 'submit';
    form.append(inp, ok);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const typed = inp.value.trim().toLowerCase();
      if (!typed) { inp.focus(); return; }
      if (typed === q.answer.toLowerCase()) return settle(true);
      if (quiz.tries) return settle(false);
      slip(); quiz.typed = inp.value; quiz.note = 'Not yet. Listen again and try once more.';
      say(q.answer, true); quiz.hold = null; renderQuiz();
    });
    box.appendChild(form);
    if (quiz.note) box.appendChild(el('p', 'feedback wrong', quiz.note));
    quiz.hold = inp; // the page is not drawn again while the voyager types
    setTimeout(() => { if (inp.isConnected) inp.focus(); }, 30);
  }
  // Build the sentence: tap the words into the line. After a first wrong try the right words stay.
  function renderBuild(box, q) {
    const n = q.words.length;
    if (!quiz.slots) { quiz.slots = new Array(n).fill(null); quiz.lock = new Array(n).fill(false); }
    const line = el('div', 'build-line' + (quiz.done ? (quiz.ok ? ' right' : ' wrong') : ''));
    quiz.slots.forEach((ti, pos) => {
      if (ti == null) { line.appendChild(el('span', 'slot', '')); return; }
      const b = el('button', 'chip tile' + (quiz.lock[pos] ? ' locked' : ''), q.tiles[ti]); b.type = 'button'; b.disabled = quiz.done || quiz.lock[pos];
      b.addEventListener('click', () => { quiz.slots[pos] = null; renderQuiz(); });
      line.appendChild(b);
    });
    box.appendChild(line);
    if (quiz.done) return;
    const bank = el('div', 'build-bank'), used = new Set(quiz.slots.filter(x => x != null));
    q.tiles.forEach((w, ti) => {
      if (used.has(ti)) return;
      const b = el('button', 'chip tile', w); b.type = 'button';
      b.addEventListener('click', () => { const pos = quiz.slots.indexOf(null); if (pos >= 0) { quiz.slots[pos] = ti; renderQuiz(); } });
      bank.appendChild(b);
    });
    box.appendChild(bank);
    if (quiz.note) box.appendChild(el('p', 'feedback wrong', quiz.note));
    const row = el('div', 'acts'), ok = btnOf('Check', 'btn btn-gold', () => {
      if (quiz.slots.map(ti => q.tiles[ti]).join(' ') === q.answer) return settle(true);
      if (quiz.tries) return settle(false);
      slip();
      let kept = 0;
      quiz.slots.forEach((ti, pos) => { if (q.tiles[ti] === q.words[pos]) { quiz.lock[pos] = true; kept++; } else quiz.slots[pos] = null; });
      quiz.note = kept ? 'Not yet. The green words are in the right place. Try once more.' : 'Not yet. Try once more.';
      renderQuiz();
    });
    ok.id = 'buildOk'; ok.disabled = quiz.slots.includes(null);
    row.append(ok, btnOf('Clear', 'btn btn-ghost', () => { quiz.slots = quiz.slots.map((ti, pos) => (quiz.lock[pos] ? ti : null)); renderQuiz(); }));
    box.appendChild(row);
  }
  // Memory match: one word card and one sentence card each turn. A wrong pair that the voyager could
  // have known (a card seen before) costs one of the board's four points.
  function renderMemory(box, q) {
    const grid = el('div', 'mem'), over = q.over;
    const card = c => {
      const open = c.done || c === q.sel || (q.miss && q.miss.includes(c));
      const b = el('button', 'opt mem-card ' + (c.side === 'w' ? 'mem-w' : 'mem-s') + (c.done ? ' right' : open ? ' open' : '') + (q.miss && q.miss.includes(c) ? ' wrong' : ''));
      b.type = 'button'; b.disabled = c.done || !!over;
      if (open) b.textContent = c.side === 's' && c.done ? c.text.replace('___', q.pairs[c.k].word) : c.text;
      else { b.appendChild(el('span', 'mem-back', c.side === 'w' ? 'WORD' : 'SENTENCE')); b.setAttribute('aria-label', (c.side === 'w' ? 'A word card' : 'A sentence card') + ', face down'); }
      b.addEventListener('click', () => flip(q, c));
      return b;
    };
    for (let i = 0; i < q.words.length; i++) grid.append(card(q.words[i]), card(q.sents[i]));
    box.appendChild(grid);
    const found = q.words.filter(c => c.done).length;
    box.appendChild(el('p', 'muted', over ? 'All pairs found in ' + plural(q.turns, 'turn') + '. ' + (q.errors ? plural(q.pairs.length - Math.min(q.pairs.length, q.errors), 'point') + ' for this board.' : 'A perfect board!')
      : q.miss ? 'They do not go together. Tap a card to go on.' : q.sel ? (q.sel.side === 'w' ? 'Now open a sentence.' : 'Now open a word.') : found + ' of ' + plural(q.pairs.length, 'pair') + ' found.'));
    if (over) {
      const row = el('div', 'acts'), nx = btnOf(quiz.at + 1 < quiz.qs.length ? 'Next board' : 'See my score', 'btn btn-gold', nextQ); nx.id = 'qNext';
      row.appendChild(nx); box.appendChild(row);
    }
  }
  function flip(q, c) {
    if (q.over || c.done) return;
    if (q.miss) { q.miss = null; q.sel = null; }
    if (!q.sel) { q.sel = c; renderQuiz(); return; }
    if (q.sel === c || q.sel.side === c.side) return; // one word and one sentence each turn
    const a = q.sel; q.turns++;
    if (a.k === c.k) {
      a.done = c.done = true; q.sel = null;
      say(q.pairs[a.k].full);
      if (q.words.every(x => x.done)) {
        q.over = true;
        const right = Math.max(0, q.pairs.length - q.errors);
        for (let i = 0; i < q.pairs.length; i++) quiz.marks.push(i < right);
      }
    } else {
      const partner = (a.side === 'w' ? q.sents : q.words).find(x => x.k === a.k);
      if (partner.seen || c.seen) q.errors++;
      q.miss = [a, c];
    }
    a.seen = c.seen = true;
    renderQuiz();
  }
  function storyPanel() {
    const s = quiz.story, box = el('article', 'panel story');
    box.append(el('p', 'eyebrow', 'Story time'), el('h2', '', s.title));
    const row = el('div', 'acts');
    row.append(btnOf('🔊 Listen', 'btn btn-cyan', () => say(s.text)), btnOf('🐢 Slowly', 'btn btn-ghost', () => say(s.text, true)),
      btnOf(quiz.showText ? 'Hide the text' : 'Show the text', 'btn btn-ghost', () => { quiz.showText = !quiz.showText; renderQuiz(); }));
    box.appendChild(row);
    if (quiz.showText || !self.speechSynthesis) box.appendChild(el('p', 'story-text', s.text));
    else box.appendChild(el('p', 'muted small', 'Listen first. You can listen as many times as you like.'));
    return box;
  }
  function endQuiz(box) {
    const right = quiz.marks.filter(Boolean).length, n = quiz.total, v = view();
    const left = Math.max(0, v.homeMax - v.homeUsed), xp = Math.min(right, left);
    box.className = 'panel result';
    box.append(el('p', 'eyebrow', 'Your score'), el('b', 'big', right + ' / ' + n));
    box.append(el('p', '', right === n ? 'Perfect! You are a star!' : right >= n * 0.7 ? 'Great work!' : 'Good try! Practise again to get better.'));
    if (!quiz.sent) {
      // (send() draws the page again, so the round is marked as sent first)
      quiz.sent = true; quiz.xp = xp; stopSay();
      if (xp > 0) { send({ kind: 'prac', n, right, units: quiz.units, ms: Date.now() - quiz.started, game: quiz.game }); return; }
    }
    box.append(el('p', 'muted', quiz.xp > 0 ? '+' + quiz.xp + ' XP' + (cls && cls.shop && cls.shop.on !== false && cls.shop.perXp ? ' and ' + Math.round(quiz.xp * cls.shop.perXp) + ' Star Coins are' : ' is') + ' on the way to your class.' : left === 0 ? 'Today\'s 10 XP are full. Come back tomorrow!' : 'No XP this time.'));
    if (quiz.fixed) box.append(el('p', 'note-line ok', plural(quiz.fixed, 'mistake') + ' fixed and out of your notebook!'));
    if (quiz.added) box.append(el('p', 'note-line', plural(quiz.added, 'question') + ' went into your mistake notebook. Try ' + (quiz.added === 1 ? 'it' : 'them') + ' again later.'));
    const row = el('div', 'acts'), mis = quiz.game === 'mistakes', more = !mis || misLive().length > 0;
    if (more) row.appendChild(btnOf(mis ? 'More of my mistakes' : 'Play again', 'btn btn-gold', () => { const g = quiz.game; quiz = null; startQuiz(g === 'mistakes' ? 'mistakes' : ''); }));
    row.appendChild(btnOf(mis ? 'Back to Practice' : 'Choose another game', 'btn', () => { quiz = null; render(); }));
    box.appendChild(row);
  }

  // ---------- the Star Bazaar ----------
  let shop = 'ship', group = {}, openId = null, talk = null, shopView = 'all';
  const SHIP = D.SHIP_SLOTS || ['hull', 'wing', 'engine', 'paint', 'decal', 'trail'], WEAR = D.WEAR_SLOTS || ['hat', 'cape', 'aura', 'buddy'];
  const CABIN = D.CABIN_SLOTS || ['wall', 'floor', 'window', 'bed', 'desk', 'lamp', 'plant', 'shelf', 'poster', 'rug', 'gadget'];
  const homeOf = it => (it.shop !== 'vault' ? it.shop : SHIP.includes(it.slot) ? 'ship' : WEAR.includes(it.slot) ? 'wear' : it.slot === 'frame' || it.slot === 'title' ? 'profile' : 'cabin');
  const useWord = it => ({ ship: 'On your ship', wear: 'Wearing it', cabin: 'In your cabin', profile: 'On your card' }[homeOf(it)] || 'Yours');
  const pickEq = (o, keys) => { const r = {}; keys.forEach(k => { if (o[k]) r[k] = o[k]; }); return r; };
  function itemsOf(sh, g) {
    if (sh.key === 'vault') return D.items.filter(i => i.shop === 'vault');
    if (g.startsWith('set:')) return D.items.filter(i => i.set === g.slice(4));
    return D.items.filter(i => i.shop === sh.key && i.slot === g);
  }
  function pageBazaar(page, v) {
    const head = el('article', 'panel');
    head.append(el('h2', '', 'Star Bazaar'), el('p', 'muted', 'Try anything on. What you buy here is finished by your class board (when it is on).'));
    const tabs = el('div', 'shops');
    D.SHOPS.forEach(sh => { const b = el('button', 'shop-tab', sh.name); b.type = 'button'; b.setAttribute('aria-selected', String(sh.key === shop)); b.addEventListener('click', () => { shop = sh.key; render(); }); tabs.appendChild(b); });
    head.appendChild(tabs);
    const sh = D.SHOPS.find(x => x.key === shop), g = group[shop] && sh.groups.some(x => x[0] === group[shop]) ? group[shop] : sh.groups[0][0];
    if (sh.groups.length > 1) {
      const gc = el('div', 'chips'); gc.style.marginTop = '10px';
      sh.groups.forEach(([k, name]) => { const list = itemsOf(sh, k); const b = el('button', 'chip', name + ' ' + list.filter(i => owns(v, i)).length + '/' + list.length); b.type = 'button'; b.setAttribute('aria-pressed', String(k === g)); b.addEventListener('click', () => { group[shop] = k; render(); }); gc.appendChild(b); });
      head.appendChild(gc);
    }
    if (sh.key === 'vault') head.appendChild(el('p', 'muted small', 'One of a kind: each treasure has one owner in your class, and each voyager can own one.'));
    const all = itemsOf(sh, g);
    if (all.length >= 8) {
      const fc = el('div', 'chips'); fc.style.marginTop = '10px';
      [['all', 'All'], ['can', 'I can buy'], ['new', 'New'], ['cheap', 'Cheapest first']].forEach(([k, name]) => { const b = el('button', 'chip', name); b.type = 'button'; b.setAttribute('aria-pressed', String(k === shopView)); b.addEventListener('click', () => { shopView = k; render(); }); fc.appendChild(b); });
      head.appendChild(fc);
    }
    page.appendChild(head);
    if (D.offers && shop === 'ship' && g === sh.groups[0][0] && shopView === 'all') {
      const op = el('article', 'panel offers'); op.appendChild(el('h2', '', 'Today\'s offers'));
      const og = el('div', 'grid'); [...D.offers(v.c || '').keys()].map(id => D.byId.get(id)).filter(Boolean).forEach(it => og.appendChild(tile(v, it)));
      op.appendChild(og); page.appendChild(op);
    }
    const grid = el('div', 'grid');
    let list = all;
    if (shopView === 'can') list = all.filter(it => !owns(v, it) && !block(v, it));
    else if (shopView === 'new') list = all.filter(it => it.nu);
    else if (shopView === 'cheap') list = all.slice().sort((a, b) => priceOf(v, a) - priceOf(v, b));
    list.forEach(it => grid.appendChild(tile(v, it)));
    if (!list.length) grid.appendChild(el('p', 'muted', shopView === 'can' ? 'Nothing here you can buy now. Earn more Star Coins!' : 'Nothing new here.'));
    page.appendChild(grid);
  }
  function thumbInto(box, it, v) {
    if (it.slot === 'frame') { const f = el('div', 'fprev'); frameOn(f, it); const cv = el('canvas', 'px'); A.dressed(cv, v.cr, v.st || 1, {}, { hat: v.hat, tight: true }); f.appendChild(cv); box.appendChild(f); return; }
    if (it.slot === 'title') { box.appendChild(el('span', 'tprev', it.art.text)); return; }
    const cv = el('canvas', 'px'); box.appendChild(cv);
    A.thumb(cv, it, { cid: v.cr, stage: v.st || 1, equip: homeOf(it) === 'wear' ? {} : v.eq, hat: v.hat, locked: it.shop === 'cards' && !owns(v, it) });
  }
  function tile(v, it) {
    const own = owns(v, it), why = block(v, it), on = own && wearing(v, it), pend = v.pendItems.has(it.id);
    const b = el('button', 'item r-' + it.rarity + (own ? ' own' : '') + (on ? ' on' : '') + (why ? ' no-' + why : '') + (it.shop === 'cards' ? ' card' : '') + (pend ? ' pend' : ''));
    b.type = 'button';
    const th = el('div', 'thumb'); thumbInto(th, it, v);
    if (v.wish.includes(it.id) && !own) th.appendChild(el('span', 'heart', '♥'));
    else if (it.nu && !own) th.appendChild(el('span', 'newtag', 'New'));
    let st;
    if (pend) st = 'On its way';
    else if (own) st = on ? useWord(it) : it.shop === 'cards' ? 'In your collection' : 'Owned';
    else if (why === 'taken') st = 'Taken';
    else if (why === 'req') st = '🔒 ' + coins(it.price);
    else st = coins(priceOf(v, it));
    const off = own || pend ? 0 : offOf(v, it), stEl = el('span', 'ist', st);
    if (off && why !== 'req' && why !== 'taken') { th.appendChild(el('span', 'sale', '−' + off + '%')); stEl.prepend(el('s', '', String(it.price)), ' '); }
    b.append(th, el('span', 'iname', it.name), stEl);
    b.addEventListener('click', () => { openId = it.id; talk = null; renderSheet(); $('sheet').showModal(); });
    return b;
  }
  function renderSheet() {
    const sh = $('sheet'), it = D.byId.get(openId);
    if (!it || !rec) { if (sh.open) sh.close(); return; }
    const v = view(), own = owns(v, it), why = block(v, it), on = own && wearing(v, it), pend = v.pendItems.has(it.id), home = homeOf(it);
    sh.textContent = '';
    sh.className = 'sheet r-' + it.rarity;
    const head = el('div', 'sheet-head'), ht = el('div');
    ht.append(el('p', 'eyebrow', D.RARITY[it.rarity].name + (it.set ? ' · ' + D.SETS[it.set].name : '')), Object.assign(el('h2', '', it.name), { id: 'shName' }));
    const x = el('button', 'btn btn-ghost', 'Close'); x.type = 'button'; x.addEventListener('click', () => sh.close());
    head.append(ht, x); sh.appendChild(head);
    const pv = el('div', 'prev' + (it.shop === 'cards' ? ' card' : '')); sh.appendChild(pv);
    if (it.slot === 'frame' || it.slot === 'title') {
      const f = el('div', 'fprev'); f.style.width = '140px'; f.style.height = '140px';
      frameOn(f, it.slot === 'frame' ? it : D.byId.get(v.eq.frame) || null);
      const cv = el('canvas', 'px'); A.dressed(cv, v.cr, v.st || 1, pickEq(v.eq, WEAR), { hat: v.hat, tight: true }); cv.style.cssText = 'width:120px!important;height:116px!important';
      f.appendChild(cv);
      const wrap = el('div'); wrap.style.cssText = 'display:grid;justify-items:center;gap:8px';
      wrap.append(f, el('span', 'tprev', it.slot === 'title' ? it.art.text : (D.byId.get(v.eq.title) || D.byId.get(D.STARTER.title)).art.text));
      pv.appendChild(wrap);
    } else {
      const cv = el('canvas', 'px'); pv.appendChild(cv);
      if (it.shop === 'cards') A.card(cv, it);
      else if (home === 'ship') A.ship(cv, Object.assign(pickEq(v.eq, SHIP), { [it.slot]: it.id }), { t: tick });
      else if (home === 'wear') A.dressed(cv, v.cr, v.st || 1, Object.assign(pickEq(v.eq, WEAR), { [it.slot]: it.id }), { hat: v.hat, t: tick });
      else A.cabin(cv, Object.assign(pickEq(v.eq, CABIN), { [it.slot]: it.id }), { cid: v.cr, stage: v.st || 1, wear: pickEq(v.eq, WEAR), hat: v.hat, t: tick });
    }
    const desc = el('p', 'desc', it.desc + ' ');
    const l = el('button', 'btn btn-ghost', '🔊'); l.type = 'button'; l.style.minHeight = '36px'; l.setAttribute('aria-label', 'Listen'); l.addEventListener('click', () => say(it.name + '. ' + it.desc));
    desc.appendChild(l); sh.appendChild(desc);
    sh.appendChild(el('p', 'price', pend ? 'On its way' : own ? (on ? useWord(it) : it.shop === 'cards' ? 'In your collection' : 'You own it') : coins(priceOf(v, it)) + (offOf(v, it) ? '  (today only: −' + offOf(v, it) + '%)' : '')));
    const acts = el('div', 'acts'); sh.appendChild(acts);
    const btn = (label, cls2, fn) => { const b = el('button', 'btn ' + (cls2 || ''), label); b.type = 'button'; b.addEventListener('click', fn); acts.appendChild(b); return b; };
    let note = '';
    if (pend) note = 'Zib has your order. A board in your classroom will finish it.';
    else if (own) {
      if (equipable(it) && !on) btn(home === 'profile' ? 'Put it on my card' : home === 'ship' ? 'Put it on my ship' : home === 'cabin' ? 'Put it in my cabin' : 'Wear it', 'btn-gold', () => send({ kind: 'equip', slot: it.slot, item: it.id }));
      else if (equipable(it) && on && it.rarity !== 'starter') btn('Take it off', '', () => send({ kind: 'equip', slot: it.slot, item: null }));
    } else if (!talk) {
      if (why === 'dust') note = 'You need ' + coins(priceOf(v, it) - v.dust) + ' more. Practise and read on BookR to earn more!';
      else if (why === 'taken') note = v.sigs[it.id] + ' owns this treasure.';
      else if (why === 'one') note = 'You already have a signature treasure: ' + D.byId.get(mySig(v)).name + '.';
      else if (why === 'req') note = 'You can buy this when you have ' + D.reqText(it.req) + '.';
      if (!why) btn('Buy for ' + coins(priceOf(v, it)), 'btn-gold', () => {
        if (cls && cls.shop && cls.shop.talk === false) { buy(it); return; }
        const L = D.buyLines(it);
        talk = { lines: shuffle([L.right].concat(L.wrong)), right: L.right, wrong: new Set(), say: 'Beep! What would you like? Choose the right sentence.', mood: 'happy' };
        renderSheet();
      });
      if (why !== 'taken') btn(v.wish.includes(it.id) ? '♥ On my wishlist' : '♡ Wishlist', 'btn-ghost', () => send({ kind: 'wish', item: it.id, on: !v.wish.includes(it.id) }));
    }
    if (note) sh.appendChild(el('p', 'msg', note));
    if (!talk && !pend && it.rarity !== 'starter' && !it.signature && !it.req && cls && cls.fleet && rec.sid) {
      const g = btn('🎁 Give to a friend', 'btn-ghost', () => { giftPick = !giftPick; renderSheet(); });
      g.setAttribute('aria-pressed', String(giftPick));
      if (giftPick) {
        const price = priceOf(v, it), gb = el('div', 'gift');
        gb.appendChild(el('p', '', !v.gleft ? 'You gave a gift this week. You can give one again next week.' : v.dust < price ? 'A gift costs ' + coins(price) + '. You need ' + coins(price - v.dust) + ' more.' : 'Who is it for? You pay ' + coins(price) + '. One gift a week.'));
        if (v.gleft && v.dust >= price) {
          const row = el('div', 'gift-row');
          cls.fleet.filter(f => f.id !== rec.sid).forEach(f => {
            const b = el('button', 'pick', f.n); b.type = 'button';
            b.addEventListener('click', async () => { if (b.dataset.armed) { giftPick = false; const ok = await send({ kind: 'gift', item: it.id, to: f.id }); if (ok) toast('Your gift for ' + f.n + ' is on its way!', 5000); renderSheet(); } else { row.querySelectorAll('.pick').forEach(x => { delete x.dataset.armed; x.textContent = x.dataset.n || x.textContent; }); b.dataset.n = f.n; b.dataset.armed = '1'; b.textContent = 'Give to ' + f.n + '?'; } });
            row.appendChild(b);
          });
          gb.appendChild(row);
        }
        sh.appendChild(gb);
      }
    }
    if (talk) {
      const tk = el('div', 'talk'), top = el('div', 'talk-top'), z = el('canvas', 'px');
      A.zib(z, talk.mood, tick);
      top.append(z, el('p', 'bubble', talk.say)); tk.appendChild(top);
      if (!talk.done) talk.lines.forEach(line => {
        const b = el('button', 'line' + (talk.wrong.has(line) ? ' wrong' : ''), line); b.type = 'button'; b.disabled = talk.wrong.has(line);
        b.addEventListener('click', () => { if (line === talk.right) buy(it); else { talk.wrong.add(line); talk.say = any(D.SHOPKEEPER.tryAgain); talk.mood = 'hmm'; renderSheet(); } });
        tk.appendChild(b);
      });
      sh.appendChild(tk);
    }
  }
  let giftPick = false;
  async function buy(it) {
    const ok = await send({ kind: 'buy', item: it.id, d: D.dayKey ? D.dayKey() : '' });
    talk = ok ? { lines: [], wrong: new Set(), say: any(D.SHOPKEEPER.thanks) + ' Your class board will finish the order.', mood: 'wow', done: true } : null;
    renderSheet();
  }

  // ---------- my stuff ----------
  function pageMine(page, v) {
    const ship = el('article', 'panel');
    ship.appendChild(el('h2', '', 'My ship'));
    const hg = el('div', 'hangar'), sc = el('canvas', 'px'); sc.id = 'myShip'; A.ship(sc, v.eq, { t: tick }); hg.appendChild(sc); ship.appendChild(hg);
    if (D.shipName) { const nm = D.shipName(v.eq), n = v.own.filter(id => { const it = D.byId.get(id); return it && it.rarity !== 'starter'; }).length; ship.appendChild(el('p', 'shipname', nm || 'Your ship has no name yet. Name it in the Star Bazaar at school!')); ship.appendChild(el('p', 'muted small', 'Bazaar rank: ' + D.rankOf(n).name)); }
    const cab = el('article', 'panel cabin');
    cab.appendChild(el('h2', '', 'My cabin'));
    const cc = el('canvas', 'px'); cc.id = 'myCabin'; A.cabin(cc, v.eq, { cid: v.cr, stage: v.st || 1, wear: pickEq(v.eq, WEAR), hat: v.hat, t: tick }); cab.appendChild(cc);
    const cards = el('article', 'panel');
    cards.appendChild(el('h2', '', 'My cards'));
    const sets = el('div', 'sets');
    Object.keys(D.SETS).forEach(k => { const n = setCount(v, k), all = setCards(k).length, row = el('div', 'set'), bar = el('span', 'bar'), f = el('i'); f.style.width = Math.round((100 * n) / all) + '%'; bar.appendChild(f); row.append(el('span', '', D.SETS[k].name), bar, el('span', 'n', n + '/' + all)); sets.appendChild(row); });
    cards.appendChild(sets);
    const wish = el('article', 'panel');
    wish.appendChild(el('h2', '', 'My wishlist'));
    const wl = v.wish.map(id => D.byId.get(id)).filter(it => it && !owns(v, it));
    if (!wl.length) wish.appendChild(el('p', 'empty', 'Tap ♡ on an item in the Bazaar to add it here.'));
    else { const g = el('div', 'grid'); wl.forEach(it => g.appendChild(tile(v, it))); wish.appendChild(g); }
    const cardsGrid = el('div', 'cards'); cardsGrid.append(ship, cards);
    page.append(cardsGrid);
    if (v.team) {
      const ch = el('article', 'panel chest'); ch.style.setProperty('--tc', v.team.col);
      ch.appendChild(el('h2', '', 'Squad chest · ' + v.team.n));
      const bar = el('span', 'bar big'), f = el('i'); f.style.width = Math.min(100, Math.round(100 * v.team.fill / v.team.goal)) + '%'; bar.appendChild(f);
      ch.append(bar, el('p', '', coins(v.team.fill) + ' of ' + coins(v.team.goal) + ' · opened ' + (v.team.opened === 1 ? 'once' : v.team.opened + ' times')), el('p', 'muted small', 'Fill it together. When it is full, everyone in your squad gets +10 XP.'));
      const acts = el('div', 'acts');
      [10, 25].forEach(n => { const b = el('button', 'btn btn-gold', 'Give ' + coins(n)); b.type = 'button'; b.disabled = v.dust < n; b.addEventListener('click', () => send({ kind: 'chest', n })); acts.appendChild(b); });
      ch.appendChild(acts); page.appendChild(ch);
    }
    if ((v.gifts || []).length) {
      const gf = el('article', 'panel'); gf.appendChild(el('h2', '', 'Gifts from friends'));
      const ul = el('ul', 'list');
      v.gifts.slice().reverse().forEach(g => { const it = D.byId.get(g[0]); if (!it) return; const li = el('li'); li.append(el('span', 'tag ok', '🎁'), el('span', '', it.name + ' from ' + (g[1] || 'a friend'))); ul.appendChild(li); });
      gf.append(ul, el('p', 'muted small', 'Say: "Thank you! That is very kind."')); page.appendChild(gf);
    }
    page.append(cab, wish);
    if (cls && cls.fleet && cls.fleet.length > 1) {
      const fl = el('article', 'panel'); fl.appendChild(el('h2', '', 'The fleet of ' + v.c));
      const g = el('div', 'fleet');
      cls.fleet.forEach(f => {
        const mine = f.id === rec.sid, d = el('div', 'fship' + (mine ? ' mine' : '')), sc = el('canvas', 'px');
        A.ship(sc, mine ? v.eq : f.eq, { t: 1 });
        d.append(sc, el('b', '', f.n), el('span', '', D.shipName(mine ? v.eq : f.eq) || 'No name yet'));
        g.appendChild(d);
      });
      fl.appendChild(g); page.appendChild(fl);
    }
  }

  // ---------- moving pictures ----------
  setInterval(() => {
    if (!rec || document.hidden) return;
    tick++;
    const v = view(), c1 = $('meArt').querySelector('canvas');
    if (c1) A.dressed(c1, v.cr, v.st || 1, v.eq, { hat: v.hat, t: tick });
    const s = $('myShip'); if (s) A.ship(s, v.eq, { t: tick });
    if ($('sheet').open && talk && tick % 2 === 0) { const z = $('sheet').querySelector('.talk canvas'); if (z) A.zib(z, talk.mood, tick); }
  }, 240);
  setInterval(() => { if (me && !document.hidden && !$('sheet').open && !quiz) refresh(true); }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && me) refresh(true); });

  // ---------- start ----------
  function start() {
    A.zib($('zib'), 'happy', 0);
    setInterval(() => { if (!$('signin').hidden) A.zib($('zib'), 'happy', ++tick); }, 300);
    url = P.scriptUrl(location.hash) || (LS.get('script') || '');
    if (P.scriptUrl(location.hash)) LS.set('script', url);
    if (!url) { $('codeForm').hidden = true; $('noScript').hidden = false; $('hello').textContent = 'Hello, voyager!'; return; }
    $('codeForm').addEventListener('submit', e => { e.preventDefault(); signIn($('code').value, $('remember').checked); });
    $('code').addEventListener('input', e => {
      const raw = P.normCode(e.target.value).slice(0, 6);
      e.target.value = raw.length > 3 ? raw.slice(0, 3) + '-' + raw.slice(3) : raw;
    });
    $('signOut').addEventListener('click', () => signOut());
    $('sheet').addEventListener('close', () => { openId = null; talk = null; giftPick = false; });
    const saved = LS.get('me');
    if (saved && saved.url === url && saved.k && saved.raw) {
      me = { k: saved.k, raw: saved.raw };
      $('signMsg').innerHTML = '<span class="spin"></span> Opening your page…';
      refresh(false).then(() => { if (rec) show(); else { $('signMsg').textContent = ''; } });
    }
  }
  start();
})();
