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
  function show() { $('signin').hidden = true; $('app').hidden = false; tab = 'home'; render(); window.scrollTo(0, 0); }

  // Requests that a board finished: tell the voyager once.
  function news() {
    const shown = new Set(LS.get('shown') || []), out = [];
    (rec.done || []).forEach(([id, ok, why, x, item]) => {
      if (shown.has(id)) return;
      shown.add(id);
      const it = item && D.byId.get(item);
      if (!ok && it) out.push('Zib could not finish your order: ' + it.name + (why === 'dust' ? ' (not enough Star Coins).' : why === 'taken' ? ' (another voyager has it).' : '.'));
    });
    LS.set('shown', [...shown].slice(-200));
    if (out.length) toast(out.join(' '), 7000);
  }

  // ---------- sending a request ----------
  async function send(e) {
    e.id = P.rid(12); e.t = Date.now();
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
  const TABS = [['home', 'Home'], ['practice', 'Practice'], ['speak', 'Speak'], ['homework', 'Homework'], ['bazaar', 'Bazaar'], ['mine', 'My stuff']];
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
      b.addEventListener('click', () => { if (k === tab) return; tab = k; quiz = null; render(); window.scrollTo(0, 0); });
      nav.appendChild(b);
    });
    nav.querySelectorAll('.tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.k === tab)));
    const page = $('page');
    if (tab === 'practice' && quiz) return renderQuiz(); // the round in progress keeps its place
    page.textContent = '';
    ({ home: pageHome, practice: pagePractice, speak: pageSpeak, homework: pageHomework, bazaar: pageBazaar, mine: pageMine })[tab](page, v);
    if ($('sheet').open) renderSheet();
  }

  // ---------- 7.11: speaking practice ----------
  let speakRoot = null;
  function pageSpeak(page, v) {
    const K = self.CQSpeak;
    const head = el('article', 'panel'); head.append(el('h2', '', 'Speak Up'), el('p', 'muted', 'Listen, then say the sentence into your microphone. Every right sentence is 1 XP (up to 5 XP a day at home).'));
    page.appendChild(head);
    if (!K) { page.appendChild(el('p', 'muted', 'Speaking practice is not ready on this page yet.')); return; }
    if (!speakRoot) {
      speakRoot = el('div', 'panel');
      K.mount(speakRoot, {
        onRound: async r => {
          if (!r.checked) return 'Good practice! XP is only for sentences the microphone checks.';
          if (!r.right) return 'No XP this time. Try again!';
          const ok = await send({ kind: 'speak', n: r.n, right: r.right });
          return ok ? 'Sent to your teacher\'s board: up to +' + r.right + ' XP.' : 'Could not send it. Check the internet and play again.';
        }
      });
    }
    page.appendChild(speakRoot);
  }

  // ---------- home ----------
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
    // news
    const news = el('article', 'panel');
    news.appendChild(el('h2', '', 'News from your class'));
    const ul = el('ul', 'list');
    v.pend.slice(-6).reverse().forEach(e => {
      const it = e.item && D.byId.get(e.item), li = el('li');
      const what = e.kind === 'prac' ? 'Practice: ' + e.right + '/' + e.n + ' right' : e.kind === 'buy' && it ? 'Bought ' + it.name : e.kind === 'equip' ? 'Changed what you wear' : e.kind === 'wish' && it ? (e.on ? 'Wishlist: ' : 'Off the wishlist: ') + it.name : 'A request';
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
  let booksReady = null, quiz = null, pick = { units: '', kind: 'mix' };
  function loadBooks() {
    if (booksReady) return booksReady;
    const files = ['shared/books/meb5.js', 'shared/books/harmonize1.js', 'shared/books/harmonize2.js', 'shared/books/discover1.js', 'shared/books.js'];
    booksReady = files.reduce((p, f) => p.then(() => new Promise((ok, bad) => { const s = document.createElement('script'); s.src = f; s.onload = ok; s.onerror = () => bad(new Error('The questions did not load.')); document.head.appendChild(s); })), Promise.resolve());
    booksReady.catch(() => { booksReady = null; });
    return booksReady;
  }
  const KINDS = [['mix', 'Mixed'], ['v', 'Vocabulary'], ['g', 'Grammar'], ['d', 'Dialogue'], ['e', 'Find the mistake'], ['x', 'Odd one out']];
  function pagePractice(page, v) {
    const box = el('article', 'panel');
    box.append(el('h2', '', 'Practice'), el('p', 'muted', 'Ten questions from your class\'s units. 1 XP for each right answer, up to 10 XP a day (' + Math.max(0, v.homeMax - v.homeUsed) + ' XP left today).'));
    page.appendChild(box);
    const wait = el('p', 'muted'); wait.innerHTML = '<span class="spin"></span> Loading the questions…';
    box.appendChild(wait);
    loadBooks().then(() => {
      if (tab !== 'practice' || quiz) return;
      wait.remove();
      const B = self.CQBook;
      const units = B.parseList((cls && cls.units) || []).map(p => p.ref);
      const study = cls && cls.study && B.parse(cls.study) ? cls.study : units[units.length - 1] || B.first();
      if (!pick.units || !B.parseList(pick.units).length) pick.units = study;
      box.appendChild(el('p', 'eyebrow', 'Unit'));
      const uc = el('div', 'chips');
      const opts = [[study, 'This week: ' + B.unitName(study)]];
      units.filter(r => r !== study).slice(-6).forEach(r => opts.push([r, B.unitName(r)]));
      if (units.length > 1) opts.push([units.join(','), 'All my units']);
      opts.forEach(([r, label]) => { const b = el('button', 'chip', label); b.type = 'button'; b.setAttribute('aria-pressed', String(pick.units === r)); b.addEventListener('click', () => { pick.units = r; render(); }); uc.appendChild(b); });
      box.appendChild(uc);
      box.appendChild(el('p', 'eyebrow', 'Questions'));
      const kc = el('div', 'chips');
      KINDS.forEach(([k, label]) => { const b = el('button', 'chip', label); b.type = 'button'; b.setAttribute('aria-pressed', String(pick.kind === k)); b.addEventListener('click', () => { pick.kind = k; render(); }); kc.appendChild(b); });
      box.appendChild(kc);
      const go = el('button', 'btn btn-gold', 'Start'); go.type = 'button'; go.style.marginTop = '14px';
      go.addEventListener('click', () => startQuiz());
      box.appendChild(go);
    }).catch(e => { wait.textContent = e.message; });
  }
  function startQuiz() {
    const B = self.CQBook;
    let pool = B.poolList(pick.units, pick.kind, true);
    if (pool.length < 4) pool = B.poolList(pick.units, 'mix', true);
    const qs = shuffle(pool).slice(0, 10).map(x => B.question(x.p.unit, x.i, x.p.ref)).filter(Boolean);
    if (!qs.length) { toast('No questions for this choice.'); return; }
    quiz = { qs, at: 0, marks: [], picked: null, started: Date.now(), units: pick.units };
    render();
  }
  function say(text) {
    if (!text || !self.speechSynthesis) return;
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); const vv = speechSynthesis.getVoices().find(x => /^en(-|_)GB/i.test(x.lang)) || speechSynthesis.getVoices().find(x => /^en/i.test(x.lang)); if (vv) u.voice = vv; u.lang = vv ? vv.lang : 'en-GB'; u.rate = 0.92; speechSynthesis.speak(u); } catch (e) { /* no voice */ }
  }
  function renderQuiz() {
    const page = $('page'); page.textContent = '';
    const box = el('article', 'panel q-card');
    page.appendChild(box);
    if (quiz.at >= quiz.qs.length) return endQuiz(box);
    const q = quiz.qs[quiz.at];
    const top = el('div', 'q-top'), dots = el('div', 'dots');
    quiz.qs.forEach((x, i) => dots.appendChild(el('i', i < quiz.marks.length ? (quiz.marks[i] ? 'r' : 'w') : i === quiz.at ? 'now' : '')));
    top.append(el('span', '', q.kind + ' · ' + (quiz.at + 1) + '/' + quiz.qs.length), dots);
    box.appendChild(top);
    box.appendChild(el('p', 'eyebrow', q.ask));
    const text = el('p', 'q-text');
    if (q.t === 'e') q.prompt.split(/(\[[^\]]+\])/).forEach(part => { const m = /^\[(.+)\]$/.exec(part); text.appendChild(m ? el('mark', '', m[1]) : document.createTextNode(part)); });
    else if (q.t === 'x') text.textContent = q.prompt;
    else q.prompt.split('___').forEach((part, i) => { if (i) text.appendChild(el('span', 'gap', quiz.picked != null ? q.answer : ' ')); text.appendChild(document.createTextNode(part)); });
    box.appendChild(text);
    const opts = el('div', 'opts');
    q.options.forEach(o => {
      const b = el('button', 'opt', o); b.type = 'button';
      if (quiz.picked != null) { b.disabled = true; if (o === q.answer) b.classList.add('right'); else if (o === quiz.picked) b.classList.add('wrong'); }
      b.addEventListener('click', () => answer(o));
      opts.appendChild(b);
    });
    box.appendChild(opts);
    if (quiz.picked != null) {
      const ok = quiz.picked === q.answer, fb = el('div', 'feedback ' + (ok ? 'right' : 'wrong'));
      fb.textContent = (ok ? any(['Right!', 'Well done!', 'Great!', 'Super!']) : 'The answer: ' + q.answer + '.') + (q.t === 'x' && q.reason ? ' ' + q.reason : '') + (q.t !== 'x' ? ' ' + q.full : '');
      box.appendChild(fb);
      const row = el('div', 'acts');
      if (q.t !== 'x') { const l = el('button', 'btn btn-ghost', '🔊 Listen'); l.type = 'button'; l.addEventListener('click', () => say(q.full)); row.appendChild(l); }
      const nx = el('button', 'btn btn-gold', quiz.at + 1 < quiz.qs.length ? 'Next' : 'See my score'); nx.type = 'button';
      nx.addEventListener('click', () => { quiz.at++; quiz.picked = null; renderQuiz(); window.scrollTo(0, 0); });
      row.appendChild(nx); box.appendChild(row);
      setTimeout(() => nx.focus(), 30);
    }
  }
  function answer(o) {
    if (!quiz || quiz.picked != null) return;
    const q = quiz.qs[quiz.at];
    quiz.picked = o; quiz.marks.push(o === q.answer);
    renderQuiz();
  }
  function endQuiz(box) {
    const right = quiz.marks.filter(Boolean).length, n = quiz.qs.length, v = view();
    const left = Math.max(0, v.homeMax - v.homeUsed), xp = Math.min(right, left);
    box.className = 'panel result';
    box.append(el('p', 'eyebrow', 'Your score'), el('b', 'big', right + ' / ' + n));
    box.append(el('p', '', right === n ? 'Perfect! You are a star!' : right >= n * 0.7 ? 'Great work!' : 'Good try! Practise again to get better.'));
    if (!quiz.sent) {
      // (send() draws the page again, so the round is marked as sent first)
      quiz.sent = true; quiz.xp = xp;
      if (xp > 0) { send({ kind: 'prac', n, right, units: quiz.units, ms: Date.now() - quiz.started }); return; }
    }
    box.append(el('p', 'muted', quiz.xp > 0 ? '+' + quiz.xp + ' XP' + (cls && cls.shop && cls.shop.on !== false && cls.shop.perXp ? ' and ' + Math.round(quiz.xp * cls.shop.perXp) + ' Star Coins are' : ' is') + ' on the way to your class.' : left === 0 ? 'Today\'s 10 XP are full. Come back tomorrow!' : 'No XP this time.'));
    const row = el('div', 'acts');
    const again = el('button', 'btn btn-gold', 'Play again'); again.type = 'button'; again.addEventListener('click', () => { quiz = null; startQuiz(); });
    const back = el('button', 'btn', 'Choose other questions'); back.type = 'button'; back.addEventListener('click', () => { quiz = null; render(); });
    row.append(again, back); box.appendChild(row);
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
    page.append(cardsGrid, cab, wish);
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
    $('sheet').addEventListener('close', () => { openId = null; talk = null; });
    const saved = LS.get('me');
    if (saved && saved.url === url && saved.k && saved.raw) {
      me = { k: saved.k, raw: saved.raw };
      $('signMsg').innerHTML = '<span class="spin"></span> Opening your page…';
      refresh(false).then(() => { if (rec) show(); else { $('signMsg').textContent = ''; } });
    }
  }
  start();
})();
