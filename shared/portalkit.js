/* ASTROVOYAGERS · the portal's keys and envelopes (7.5)
   Shared by Star Base (the boards) and the student portal website, so both make exactly the same keys.
   - A voyager's code (6 letters and numbers) + the script's salt → two keys with PBKDF2:
     k, the name of their record in the script (it does not reveal the code), and the AES key that
     locks the record and their requests from home. Only someone with the code can find or read them.
   - A class key (random, kept in the class data) locks the class's record (homework, units).
   - Teacher sign-in with a phone: the board shows a one-time public key in a QR code; the phone locks
     the teacher code for that board only (ECDH P-256 + AES-GCM). The script only passes it on.
   Envelopes: "p1." + iv + "." + ciphertext, both base64url. */
(function (root) {
  'use strict';
  const te = new TextEncoder(), td = new TextDecoder();
  const subtle = () => root.crypto.subtle;
  const ITER = 120000;
  const b64u = bytes => {
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const unb64u = str => {
    str = String(str).replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    const s = atob(str), out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  };
  const rand = n => root.crypto.getRandomValues(new Uint8Array(n));
  const rid = (n) => b64u(rand(n || 12));
  // the same cleaning as the board's code check (no O/0, I/1, L/1 mix-ups)
  const normCode = v => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/O/g, '0').replace(/I|L/g, '1');
  const sha = async bytes => new Uint8Array(await subtle().digest('SHA-256', bytes));
  const cat = (...parts) => { const n = parts.reduce((a, p) => a + p.length, 0), out = new Uint8Array(n); let o = 0; parts.forEach(p => { out.set(p, o); o += p.length; }); return out; };

  // A voyager's keys: { k, raw } (raw: the AES key, base64url, so a board can keep it)
  async function studentKeys(code, salt) {
    const base = await subtle().importKey('raw', te.encode(normCode(code)), 'PBKDF2', false, ['deriveBits']);
    const bits = new Uint8Array(await subtle().deriveBits({ name: 'PBKDF2', salt: te.encode('astrovoyagers-portal|' + salt), iterations: ITER, hash: 'SHA-256' }, base, 512));
    const k = b64u(await sha(cat(bits.slice(0, 32), te.encode('|record')))).slice(0, 32);
    return { k, raw: b64u(bits.slice(32, 64)) };
  }
  const aes = raw => subtle().importKey('raw', unb64u(raw), 'AES-GCM', false, ['encrypt', 'decrypt']);
  const keyCache = new Map();
  async function keyOf(raw) { if (!keyCache.has(raw)) keyCache.set(raw, await aes(raw)); return keyCache.get(raw); }
  async function seal(raw, value) {
    const iv = rand(12);
    const ct = new Uint8Array(await subtle().encrypt({ name: 'AES-GCM', iv }, await keyOf(raw), te.encode(JSON.stringify(value))));
    return 'p1.' + b64u(iv) + '.' + b64u(ct);
  }
  async function open(raw, text) {
    const p = String(text || '').split('.');
    if (p.length !== 3 || p[0] !== 'p1') throw new Error('damaged');
    const pt = await subtle().decrypt({ name: 'AES-GCM', iv: unb64u(p[1]) }, await keyOf(raw), unb64u(p[2]));
    return JSON.parse(td.decode(pt));
  }
  const newClassKey = () => b64u(rand(32));
  const classId = async raw => b64u(await sha(cat(unb64u(raw), te.encode('|class')))).slice(0, 32);

  // ---------- teacher sign-in with a phone ----------
  async function boardPair() {
    const kp = await subtle().generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
    const pub = new Uint8Array(await subtle().exportKey('raw', kp.publicKey));
    return { priv: kp.privateKey, pub: b64u(pub) };
  }
  async function shared(priv, pubB64u) {
    const pub = await subtle().importKey('raw', unb64u(pubB64u), { name: 'ECDH', namedCurve: 'P-256' }, false, []);
    const bits = new Uint8Array(await subtle().deriveBits({ name: 'ECDH', public: pub }, priv, 256));
    return b64u(await sha(cat(bits, te.encode('|astrovoyagers-qr'))));
  }
  // the phone: lock a message for the board whose public key was in the QR code
  async function phoneSeal(boardPub, value) {
    const kp = await subtle().generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
    const raw = await shared(kp.privateKey, boardPub);
    const mine = b64u(new Uint8Array(await subtle().exportKey('raw', kp.publicKey)));
    return mine + '~' + await seal(raw, value);
  }
  // the board: open it with its private key
  async function boardOpen(priv, text) {
    const [pub, env] = String(text || '').split('~');
    if (!pub || !env) throw new Error('damaged');
    return open(await shared(priv, pub), env);
  }

  // The portal's address for a script (the id travels in the # part, so it is never sent to GitHub).
  function scriptRef(url) {
    const m = /^https:\/\/script\.google\.com\/(?:a\/macros\/[^/?#]+|macros)\/s\/([\w-]+)\/exec$/.exec(String(url || ''));
    if (m) return 's=' + m[1];
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/[\w/.-]*$/.test(String(url || ''))) return 'u=' + encodeURIComponent(url);
    return '';
  }
  function scriptUrl(ref) {
    const q = new URLSearchParams(String(ref || '').replace(/^#/, ''));
    const s = q.get('s'), u = q.get('u');
    if (s && /^[\w-]{20,120}$/.test(s)) return 'https://script.google.com/macros/s/' + s + '/exec';
    if (u && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/[\w/.-]*$/.test(u)) return u;
    return '';
  }

  root.CQPortalKit = { ITER, b64u, unb64u, rid, normCode, studentKeys, seal, open, newClassKey, classId, boardPair, phoneSeal, boardOpen, scriptRef, scriptUrl };
})(typeof self !== 'undefined' ? self : globalThis);
