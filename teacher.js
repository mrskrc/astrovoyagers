/* ASTROVOYAGERS · teacher sign-in with a phone
   The board's lock screen shows a QR code with this page's address. Its # part holds the teacher's
   script, a one-time session and the board's public key. The PIN typed here is locked for that board
   only (shared/portalkit.js) and passed on by the script; the board checks it and answers. */
(() => {
  'use strict';
  const P = self.CQPortalKit, $ = id => document.getElementById(id);
  const q = new URLSearchParams(location.hash.slice(1));
  const url = P.scriptUrl(location.hash), sid = q.get('q') || '', pub = q.get('p') || '';
  let pin = '', busy = false;
  function msg(t, kind) { $('tMsg').className = 'msg' + (kind ? ' ' + kind : ''); $('tMsg').innerHTML = t; }
  function dots() { const d = $('dots'); d.textContent = ''; for (let i = 0; i < Math.max(4, pin.length + (pin.length < 8 ? 1 : 0)); i++) { const s = document.createElement('span'); if (i < pin.length) s.className = 'on'; d.appendChild(s); } }
  async function api(body) {
    const res = await fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'text/plain;charset=utf-8' }, credentials: 'omit', cache: 'no-store', redirect: 'follow' });
    const d = JSON.parse(await res.text());
    if (!d.ok) throw new Error(d.error || 'error');
    return d;
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function send() {
    if (busy) return;
    if (pin.length < 4) { msg('The code has 4 to 8 digits.', 'err'); return; }
    busy = true; msg('<span class="spin"></span> Sending to the board…');
    try {
      await api({ op: 'qrPut', s: sid, d: await P.phoneSeal(pub, { pin, t: Date.now() }) });
      pin = ''; dots();
      for (let i = 0; i < 16; i++) {
        await wait(1500);
        const r = await api({ op: 'qrGet', s: sid + '.r' });
        if (r.d) {
          const a = JSON.parse(r.d);
          if (a.ok) { $('tTitle').textContent = 'The board is open'; $('tSub').textContent = 'You can put your phone away.'; $('pad').hidden = true; $('dots').hidden = true; msg('✓ Signed in.', 'ok'); return; }
          msg(a.wait ? 'Too many wrong tries. Wait ' + a.wait + ' seconds.' : 'That code was not right. Try again.', 'err');
          return;
        }
      }
      msg('The board did not answer. Is it on and connected? Scan the code on the board again.', 'err');
    } catch (e) { msg('No connection. Try again.', 'err'); } finally { busy = false; }
  }
  if (!url || !/^[A-Za-z0-9_-]{16,40}$/.test(sid) || !/^[A-Za-z0-9_-]{80,100}$/.test(pub)) {
    $('tTitle').textContent = 'Scan the code on the board';
    $('tSub').textContent = 'Open the lock on the board (tap the padlock) and scan the QR code with your phone camera.';
    $('pad').hidden = true;
    return;
  }
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0', 'ok'].forEach(k => {
    const b = document.createElement('button'); b.type = 'button';
    b.textContent = k === 'back' ? '⌫' : k === 'ok' ? 'Unlock' : k;
    if (k === 'back' || k === 'ok') b.className = k;
    b.addEventListener('click', () => {
      if (k === 'back') pin = pin.slice(0, -1);
      else if (k === 'ok') return send();
      else if (pin.length < 8) pin += k;
      dots();
    });
    $('pad').appendChild(b);
  });
  document.addEventListener('keydown', e => { if (/^[0-9]$/.test(e.key) && pin.length < 8) { pin += e.key; dots(); } else if (e.key === 'Backspace') { pin = pin.slice(0, -1); dots(); } else if (e.key === 'Enter') send(); });
  dots();
})();
