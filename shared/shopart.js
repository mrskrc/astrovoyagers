/* ASTROVOYAGERS · the Star Bazaar's pixel art (7.4)
   Everything is drawn here, pixel by pixel, from the plain data in shopdata.js: no image files.
   ship()    a voyager's spaceship, side view (72×40): hull, wings, engine, paint, sticker and trail
   dressed() a voyager's creature (48×46) with a hat, a cape, an aura and a robot buddy
   card()    the art of a collection card (40×40)
   cabin()   a voyager's cabin in space (128×72), with the creature standing in it
   thumb()   the picture of one item in the shop (tried on the voyager's own ship, creature or cabin)
   Canvases are drawn at their pixel size; CSS scales them up with image-rendering: pixelated. */
(function (root) {
  'use strict';
  const SD = () => root.CQShopData, CR = () => root.CQCreatures;

  // ---------- colour ----------
  const RGB = new Map();
  function rgbOf(c) { let v = RGB.get(c); if (!v) { const n = parseInt(c.slice(1), 16); v = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; RGB.set(c, v); } return v; }
  const cl = v => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (r, g, b) => '#' + ((1 << 24) | (cl(r) << 16) | (cl(g) << 8) | cl(b)).toString(16).slice(1);
  function mix(a, b, t) { const A = rgbOf(a), B = rgbOf(b); return toHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
  const shade = (c, t) => (t < 0 ? mix(c, '#000000', -t) : mix(c, '#ffffff', t));
  const lum = c => { const [r, g, b] = rgbOf(c); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
  function hsl(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return toHex(f(0) * 255, f(8) * 255, f(4) * 255);
  }
  const RAINBOW = ['#ff5a5a', '#ff9a3d', '#ffd23f', '#6fe36f', '#5ab4ff', '#9a6bff'];
  const INK = '#151a33';
  function rng(seed) { let s = (seed >>> 0) || 0x9e3779b9; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  const hash = str => { let h = 2166136261; str = String(str); for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

  // ---------- a pixel surface ----------
  function surf(W, H) {
    const d = new Uint8ClampedArray(W * H * 4);
    let clip = null;
    const s = {
      W, H, d,
      clip(x, y, w, h) { clip = x == null ? null : [x, y, x + w, y + h]; return s; },
      set(x, y, c, a) {
        x = Math.floor(x); y = Math.floor(y);
        if (!c || x < 0 || y < 0 || x >= W || y >= H) return;
        if (clip && (x < clip[0] || y < clip[1] || x >= clip[2] || y >= clip[3])) return;
        if (a == null) a = 1;
        if (a <= 0) return;
        const i = (y * W + x) * 4, p = rgbOf(c);
        if (a >= 1) { d[i] = p[0]; d[i + 1] = p[1]; d[i + 2] = p[2]; d[i + 3] = 255; return; }
        const A = d[i + 3] / 255, o = a + A * (1 - a);
        d[i] = (p[0] * a + d[i] * A * (1 - a)) / o; d[i + 1] = (p[1] * a + d[i + 1] * A * (1 - a)) / o; d[i + 2] = (p[2] * a + d[i + 2] * A * (1 - a)) / o;
        d[i + 3] = o * 255;
      },
      on(x, y) { return x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 0; },
      rect(x, y, w, h, c, a) { x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) s.set(x + i, y + j, c, a); return s; },
      ell(cx, cy, rx, ry, c, a, part) {
        for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
          const dx = (x + 0.5 - cx) / Math.max(0.5, rx), dy = (y + 0.5 - cy) / Math.max(0.5, ry);
          if (dx * dx + dy * dy > 1) continue;
          if (part === 'back' && y + 0.5 >= cy) continue;
          if (part === 'front' && y + 0.5 < cy) continue;
          s.set(x, y, typeof c === 'function' ? c(x, y, dx, dy) : c, a);
        }
        return s;
      },
      disc(cx, cy, r, c, a) { return s.ell(cx, cy, r, r, c, a); },
      ring(cx, cy, rx, ry, w, c, a, part) {
        for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
          const dx = (x + 0.5 - cx), dy = (y + 0.5 - cy);
          const o = (dx / rx) ** 2 + (dy / ry) ** 2, i = (dx / Math.max(0.5, rx - w)) ** 2 + (dy / Math.max(0.5, ry - w)) ** 2;
          if (o > 1 || i < 1) continue;
          if (part === 'back' && dy >= 0) continue;
          if (part === 'front' && dy < 0) continue;
          s.set(x, y, c, a);
        }
        return s;
      },
      line(x0, y0, x1, y1, c, a) {
        x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
        const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
        let e = dx + dy;
        for (let n = 0; n < 400; n++) {
          s.set(x0, y0, c, a);
          if (x0 === x1 && y0 === y1) break;
          const e2 = 2 * e;
          if (e2 >= dy) { e += dy; x0 += sx; }
          if (e2 <= dx) { e += dx; y0 += sy; }
        }
        return s;
      },
      poly(pts, c, a) {
        let x0 = W, x1 = 0, y0 = H, y1 = 0;
        pts.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
        for (let y = Math.floor(y0); y <= y1; y++) for (let x = Math.floor(x0); x <= x1; x++) {
          const px = x + 0.5, py = y + 0.5;
          let inside = false;
          for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
            const [xi, yi] = pts[i], [xj, yj] = pts[j];
            if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
          }
          if (inside) s.set(x, y, typeof c === 'function' ? c(x, y) : c, a);
        }
        return s;
      },
      glyph(rows, x, y, pal, a) {
        rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.' && ch !== ' ') s.set(x + i, y + j, pal[ch] || pal['#'], a); }));
        return s;
      },
      px32(arr, N, ox, oy) { for (let i = 0; i < arr.length; i++) if (arr[i]) s.set(ox + (i % N), oy + ((i / N) | 0), arr[i]); return s; },
      blit(o, ox, oy) {
        for (let y = 0; y < o.H; y++) for (let x = 0; x < o.W; x++) {
          const i = (y * o.W + x) * 4, A = o.d[i + 3];
          if (A) s.set(ox + x, oy + y, toHex(o.d[i], o.d[i + 1], o.d[i + 2]), A / 255);
        }
        return s;
      },
      // a 1px line around everything drawn so far
      outline(c, a) {
        const m = [];
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!s.on(x, y) && (s.on(x - 1, y) || s.on(x + 1, y) || s.on(x, y - 1) || s.on(x, y + 1))) m.push(x, y);
        for (let i = 0; i < m.length; i += 2) s.set(m[i], m[i + 1], c, a);
        return s;
      },
      // soft light around a mask: fn(distance) → [colour, alpha] or null
      halo(mask, R, fn) {
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          if (mask[y * W + x]) continue;
          let best = 99;
          for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) {
            const X = x + i, Y = y + j;
            if (X < 0 || Y < 0 || X >= W || Y >= H || !mask[Y * W + X]) continue;
            const dd = Math.sqrt(i * i + j * j);
            if (dd < best) best = dd;
          }
          if (best > R) continue;
          const r = fn(best, x, y);
          if (r) s.set(x, y, r[0], r[1]);
        }
        return s;
      },
      mask() { const m = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) m[i] = d[i * 4 + 3] > 0 ? 1 : 0; return m; },
      to(cv) {
        if (!cv) return s;
        if (cv.width !== W) cv.width = W;
        if (cv.height !== H) cv.height = H;
        const g = cv.getContext('2d');
        g.clearRect(0, 0, W, H);
        g.putImageData(new ImageData(d, W, H), 0, 0);
        return cv;
      }
    };
    return s;
  }

  const item = id => (id && SD().byId.get(id)) || null;
  const part = (eq, slot) => item(eq && eq[slot]) || item(SD().STARTER[slot]);

  // ---------- little glyphs ----------
  const GLYPH = {
    star: [['..#..', '.###.', '#####', '.###.', '#.#.#'], '#ffd23f'], bolt: [['...#.', '..##.', '.####', '..##.', '.##..', '.#...'], '#ffe066'],
    heart: [['.#.#.', '#####', '#####', '.###.', '..#..'], '#ff5a8a'], planet: [['..###..', '.#####.', '#######', '.#####.', '..###..'], '#ff8a3d'],
    moon: [['.###.', '##...', '#....', '##...', '.###.'], '#fff3a0'], flame: [['..#..', '.##..', '.###.', '#####', '.###.'], '#ff6a3d'],
    wave: [['.##...##', '#..#.#..', '....#...'], '#5ad1ff'], numberfive: [['####', '#...', '###.', '...#', '###.'], '#ffffff'],
    smile: [['.###.', '#k#k#', '#####', '#kkk#', '.###.'], '#ffd23f'], paw: [['#.#.#', '.....', '.###.', '#####', '.###.'], '#c98a4a'],
    leaf: [['...##', '..###', '.###.', '###..', '#....'], '#6fe36f'], diamond: [['..#..', '.###.', '#####', '.###.', '..#..'], '#7ff0ff'],
    crown: [['#.#.#', '#####', '#####'], '#ffd23f'], musicnote: [['..##', '..#.', '..#.', '###.', '##..'], '#b18cff'],
    eye: [['.###.', '#wkw#', '.###.'], '#ffffff'], flag: [['####.', '#####', '####.', '#....', '#....'], '#ff5a5a'],
    heart3: [['#.#', '###', '.#.']], plus: [['.#.', '###', '.#.']], dia: [['.#.', '###', '.#.']], leaf2: [['.#', '##', '#.']],
    note: [['.##', '.#.', '##.']], crown2: [['#.#.#', '#####']], spark: [['#']]
  };
  const glyphOf = k => GLYPH[k] || GLYPH.star;

  // ---------- the ship ----------
  const SW = 72, SH = 40;
  function halfH(H, u) {
    if (u < 0.35) return H.t + (H.m - H.t) * (u / 0.35);
    const v = (u - 0.35) / 0.65;
    if (H.nose === 'point') return H.m + (0.5 - H.m) * Math.pow(v, 1.25);
    if (H.nose === 'split') return H.m + (0.9 - H.m) * Math.pow(v, 1.05);
    if (H.nose === 'blunt') return v > 0.92 ? Math.max(1, H.n - 1) : H.m + (H.n - H.m) * v;
    // round: towards the nose height, then a round cap
    const at = H.m + (H.n - H.m) * Math.min(1, v / 0.7);
    if (v <= 0.7) return at;
    const e = (v - 0.7) / 0.3;
    return Math.max(0.5, at * Math.sqrt(Math.max(0, 1 - e * e)));
  }
  function paintAt(P, i, y, L, cy, top, bot, r) {
    const { c1, c2 } = P, rows = Math.max(1, bot - top + 1);
    switch (P.pattern) {
      case 'stripes': return (Math.floor((y - cy + 40) / 2) % 2) ? c2 : c1;
      case 'band': return i >= Math.round(L * 0.52) && i < Math.round(L * 0.52) + 3 ? c2 : (y === cy || y === cy - 1) && i > L * 0.6 ? c2 : c1;
      case 'check': return ((i >> 1) + (y >> 1)) % 2 ? c2 : c1;
      case 'galaxy': { const v = r(); return v < 0.06 ? '#ffffff' : v < 0.2 ? mix(c1, c2, 0.7) : c1; }
      case 'fade': return mix(c1, c2, i / L);
      case 'shine': return y === top + 1 && i % 5 !== 0 ? shade(c1, 0.55) : r() < 0.04 ? '#ffffff' : c1;
      case 'dots': return (i % 4 === 1 && (y + (Math.floor(i / 4) % 2) * 2) % 4 === 1) ? c2 : c1;
      case 'camo': return (hash((i >> 2) + ':' + (y >> 1) + ':' + ((i + y) >> 3)) % 10) < 4 ? c2 : c1;
      case 'bolt': { const z = cy + ((Math.floor(i / 3) % 2) ? -1 : 1); return y === z || y === z - 1 ? c2 : c1; }
      case 'rainbow': return RAINBOW[Math.min(5, Math.floor(((y - top) / rows) * 6))];
      case 'supernova': { const dx = i - L * 0.62, dy = (y - cy) * 2.2, dd = Math.sqrt(dx * dx + dy * dy); return dd < 3 ? '#ffffff' : mix(c1, c2, Math.min(1, dd / (L * 0.45))); }
      case 'pearl': return mix(c1, c2, (Math.sin(i * 0.55 + y * 0.8) + 1) * 0.3);
      default: return c1;
    }
  }
  const WINGS = {
    basic: [[[0.55, 0], [0.38, 6], [0.24, 6], [0.3, 0]]],
    swept: [[[0.62, 0], [0.26, 8], [0.12, 8], [0.3, 0]]],
    delta: [[[0.68, 0], [0.12, 9], [0.1, 0]]],
    twin: [[[0.56, 0], [0.4, 6], [0.28, 6], [0.34, 0]], [[0.56, 0], [0.4, -6], [0.28, -6], [0.34, 0]]],
    glider: [[[0.6, 1], [0.05, 6], [0.0, 7], [0.06, 4], [0.45, 0]]],
    spike: [[[0.62, 0], [0.2, 9], [0.26, 6], [0.12, 8], [0.18, 5], [0.3, 0]]],
    feather: [[[0.56, 0], [0.42, 8], [0.37, 8], [0.44, 0]], [[0.48, 0], [0.3, 9], [0.25, 9], [0.36, 0]], [[0.4, 0], [0.17, 8], [0.12, 8], [0.28, 0]]],
    bat: [[[0.64, 0], [0.47, 8], [0.41, 6], [0.34, 9], [0.28, 6], [0.2, 8], [0.24, 0]]],
    blade: [[[0.64, 0], [0.04, 11], [0.14, 0]], [[0.56, 0], [0.08, -9], [0.16, 0]]],
    dragon: [[[0.66, 0], [0.52, 10], [0.44, 7], [0.36, 11], [0.28, 7], [0.16, 10], [0.2, 0]], [[0.6, 0], [0.46, -9], [0.38, -6], [0.28, -10], [0.2, -6], [0.24, 0]]]
  };
  function starPts(cx, cy, R, r, n) { const p = []; for (let k = 0; k < n * 2; k++) { const a = -Math.PI / 2 + (k * Math.PI) / n, q = k % 2 ? r : R; p.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); } return p; }

  function trail(s, A, xr, cy, t) {
    const r = rng(hash(A.style) + 7), off = t * 2, c = A.color;
    const fade = x => Math.max(0, Math.min(1, x / Math.max(1, xr)));
    switch (A.style) {
      case 'rainbow':
        for (let x = 0; x <= xr; x++) for (let k = 0; k < 6; k++) s.set(x, cy - 3 + k + Math.round(Math.sin((x + off) * 0.3)), RAINBOW[k], 0.25 + 0.75 * fade(x));
        return;
      case 'comet':
        for (let x = 0; x <= xr; x++) { const h = 3 * fade(x); for (let y = Math.round(cy - h); y <= cy + h; y++) s.set(x, y, Math.abs(y - cy) < h / 2 ? '#ffffff' : '#bff8ff', 0.2 + 0.7 * fade(x)); }
        return;
      case 'swirl':
        for (let x = 0; x <= xr; x++) { s.set(x, cy + Math.round(Math.sin((x + off) * 0.35) * 4), '#ff7ad9', 0.3 + 0.7 * fade(x)); s.set(x, cy + Math.round(Math.sin((x + off) * 0.35 + Math.PI) * 4), '#7ff0ff', 0.3 + 0.7 * fade(x)); }
        for (let k = 0; k < 6; k++) s.set(Math.floor(r() * xr), cy - 6 + Math.floor(r() * 12), '#ffffff', 0.8);
        return;
      case 'fire':
        for (let x = 0; x <= xr; x++) for (let y = cy - 4; y <= cy + 4; y++) { const v = r(); if (v < 0.5 * fade(x)) s.set(x, y, v < 0.15 ? '#ffe066' : v < 0.3 ? '#ff9a3d' : '#ff5a3d', 0.4 + 0.6 * fade(x)); }
        return;
      default: {
        const g = { dots: 'spark', bubbles: null, hearts: 'heart3', stars: 'plus', ice: 'dia', leaves: 'leaf2', notes: 'note', pixels: null, crown: 'crown2' }[A.style];
        const n = A.style === 'dots' ? 22 : A.style === 'pixels' ? 12 : 7;
        for (let k = 0; k < n; k++) {
          const x = Math.floor((r() * (xr + 10) + off) % (xr + 1)), y = cy - 6 + Math.floor(r() * 12), a = 0.35 + 0.65 * fade(x);
          if (A.style === 'bubbles') { s.ring(x, y, 2, 2, 1, c, a); s.set(x - 1, y - 1, '#ffffff', a); continue; }
          if (A.style === 'pixels') { s.rect(x, y, 2, 2, ['#5ad1ff', '#ff7ad9', '#ffe066'][k % 3], a); continue; }
          const col = A.style === 'leaves' ? (k % 2 ? '#6fe36f' : '#3f9a4e') : A.style === 'ice' && k % 2 ? '#ffffff' : c;
          s.glyph(glyphOf(g)[0], x, y, { '#': col }, a);
        }
      }
    }
  }
  function flame(s, xr, y, h, len, glow, t) {
    const r = rng(t * 977 + y * 13 + 5), yc = y + h / 2;
    for (let j = 0; j < len; j++) {
      const half = (h / 2) * Math.pow(1 - j / len, 0.8), x = xr - j;
      for (let yy = Math.floor(yc - half); yy < yc + half; yy++) {
        const dy = Math.abs(yy + 0.5 - yc);
        if (j > len * 0.6 && r() < 0.25) continue;
        const col = dy < half * 0.35 && j < len * 0.5 ? '#ffffff' : dy < half * 0.7 ? mix(glow, '#ffffff', 0.45) : glow;
        s.set(x, yy, col, 1 - 0.55 * (j / len));
      }
    }
  }

  function ship(cv, eq, o) {
    o = o || {};
    const t = o.t || 0, H = part(eq, 'hull').art, Wg = part(eq, 'wing').art, E = part(eq, 'engine').art, P = part(eq, 'paint').art;
    const dec = item(eq && eq.decal), tr = item(eq && eq.trail);
    const s = surf(SW, SH), L = H.len, cy = 20, x0 = SW - L - 4;
    const col = [];
    for (let i = 0; i < L; i++) { const h = halfH(H, i / (L - 1)); col.push([Math.round(cy - h), Math.round(cy + h) - 1]); }
    const ink = mix(shade(P.c1, -0.7), INK, 0.5);
    // engine nozzles, flames and the trail (behind)
    const ny = E.n, nh = Math.max(2, E.size * 2 - (ny > 1 ? 1 : 0)), totalH = ny * nh + (ny - 1);
    const ys = []; for (let k = 0; k < ny; k++) ys.push(Math.round(cy - totalH / 2 + k * (nh + 1)));
    const ex = x0 - 3, fl = E.size * 2 + 4 + (t % 3 === 1 ? 1 : 0);
    if (tr) trail(s, tr.art, ex - fl - 1, cy, t);
    if (E.warp) for (let k = 0; k < 7; k++) { const yy = cy - 9 + k * 3, len = 6 + ((k * 7 + t * 3) % 11); s.line(ex - fl - len, yy, ex - fl - 1, yy, '#ffffff', 0.45); }
    ys.forEach(y => flame(s, ex - 1, y, nh, fl, E.glow, t));
    if (E.ring) s.ring(ex - Math.round(fl / 2), cy, 2.5, totalH / 2 + 3, 1, E.glow, 0.85);
    if (E.pulse) [3, 6].forEach(k => s.ring(ex - fl / 2, cy, k + (t % 2), k + 2 + (t % 2), 1, '#ffffff', 0.35));
    const eng = surf(SW, SH);
    ys.forEach(y => {
      eng.rect(ex, y, 3, nh, '#8a94b8'); eng.rect(ex, y, 3, 1, '#c9d0e2'); eng.rect(ex, y + nh - 1, 3, 1, '#566079');
      if (E.bell) { eng.rect(ex - 1, y - 1, 1, nh + 2, '#a8b0c8'); }
    });
    if (E.solar) { eng.rect(x0 + 2, col[2][0] - 6, 8, 3, '#2a3f8a'); for (let k = 0; k < 8; k += 2) eng.set(x0 + 2 + k, col[2][0] - 5, '#5ab4ff'); eng.rect(x0 + 5, col[2][0] - 3, 1, 3, '#8a94b8'); }
    eng.outline(ink); s.blit(eng, 0, 0);
    // wings (behind the hull)
    const wl = surf(SW, SH), wc = mix(P.c1, P.c2, 0.5), extra = Math.max(0, H.m - 4);
    const WP = pts => pts.map(([u, dy]) => [x0 + u * L, cy + (dy > 0 ? dy + extra : dy < 0 ? dy - extra : 0)]);
    const wFill = (x, y) => (y > cy + extra + 4 ? shade(wc, -0.18) : wc);
    if (Wg.shape === 'ring') wl.ring(x0 + L * 0.45, cy, 4, H.m + 4, 2, wc, 1, 'back');
    else if (Wg.shape === 'butterfly') { wl.ell(x0 + L * 0.38, cy + extra + 6, 5, 4, wc); wl.ell(x0 + L * 0.38, cy - extra - 6, 4, 3, shade(wc, 0.15)); wl.disc(x0 + L * 0.36, cy + extra + 6, 1.5, P.c1); }
    else if (Wg.shape === 'star') wl.poly(starPts(x0 + L * 0.36, cy + extra + 5, 6.5, 2.8, 5), wFill);
    else (WINGS[Wg.shape] || WINGS.basic).forEach(p => wl.poly(WP(p), wFill));
    wl.outline(ink); s.blit(wl, 0, 0);
    // the hull
    const hl = surf(SW, SH), r = rng(hash(P.pattern + P.c1));
    for (let i = 0; i < L; i++) {
      const [top, bot] = col[i], u = i / (L - 1);
      for (let y = top; y <= bot; y++) {
        if (H.nose === 'split' && u > 0.8 && bot - top >= 3 && (y === cy || y === cy - 1)) continue;
        let c = paintAt(P, i, y, L, cy, top, bot, r);
        if (y === top) c = shade(c, 0.35); else if (y === bot) c = shade(c, -0.35); else if (y === bot - 1 && bot - top > 4) c = shade(c, -0.15);
        hl.set(x0 + i, y, c);
      }
    }
    if (H.gold) for (let i = 2; i < L - 3; i++) hl.set(x0 + i, cy - 1, i % 4 ? '#ffd23f' : '#fff6c8');
    // tail fin
    const f = H.fin, i0 = Math.round(L * 0.05);
    for (let j = 0; j <= f + 2; j++) { const hh = Math.round(f * (1 - j / (f + 2))), top = col[Math.min(L - 1, i0 + j)][0]; for (let k = 1; k <= hh; k++) hl.set(x0 + i0 + j, top - k, k === hh ? shade(P.c2, 0.3) : P.c2); }
    // cockpit
    const ic = Math.min(L - 3, Math.round(H.cp * L)), ct = col[ic][0];
    hl.ell(x0 + ic + 0.5, ct + 1, 3.2, 2.4, (x, y) => (y < ct ? '#bff8ff' : y === ct ? '#7ff0ff' : '#3aa8d8'), 1, 'back');
    hl.rect(x0 + ic - 2, ct, 5, 1, '#7ff0ff'); hl.set(x0 + ic - 1, ct - 1, '#ffffff');
    // sticker
    if (dec) { const [rows, gc] = glyphOf(dec.art.shape); const gx = x0 + Math.round(L * 0.42) - Math.floor(rows[0].length / 2), gy = cy - Math.floor(rows.length / 2); hl.glyph(rows, gx, gy, { '#': gc, k: INK, w: '#ffffff' }); }
    hl.outline(ink);
    if (H.glow) hl.halo(hl.mask(), 2, dd => [H.glow, dd < 1.5 ? 0.5 : 0.22]);
    s.blit(hl, 0, 0);
    if (Wg.shape === 'ring') { const fr = surf(SW, SH); fr.ring(x0 + L * 0.45, cy, 4, H.m + 4, 2, wc, 1, 'front'); fr.outline(ink); s.blit(fr, 0, 0); }
    return s.to(cv);
  }

  // ---------- the dressed creature ----------
  const CW = 48, CH = 46, OX = 8, OY = 12;
  function buddyLayer(A, t) {
    const b = surf(14, 16), col = A.gold ? '#ffd23f' : hsl(A.hue, 62, 62), dk = shade(col, -0.45), lt = shade(col, 0.4), x = 2, y = 5;
    if (A.comet) for (let k = 0; k < 6; k++) b.set(1 - k * 0, 8 + (k % 2), '#bff8ff', 0.8 - k * 0.1);
    if (A.head === 'box') { b.rect(x, y, 9, 7, col); b.rect(x, y, 9, 1, lt); }
    else if (A.head === 'round') { b.disc(x + 4.5, y + 3.5, 4.5, col); b.set(x + 2, y + 1, lt); }
    else if (A.head === 'tv') { b.rect(x, y, 10, 7, col); b.rect(x + 1, y + 1, 8, 5, '#14203a'); }
    else { b.ell(x + 4.5, y + 3, 4.5, 3.5, col, 1, 'back'); b.rect(x, y + 3, 9, 4, col); b.set(x + 2, y + 1, lt); }
    const ey = y + 3, ink = '#14203a', glow = A.head === 'tv' ? '#7ff0ff' : ink;
    if (A.eye === 'round') { b.rect(x + 2, ey - 1, 2, 2, '#ffffff'); b.rect(x + 6, ey - 1, 2, 2, '#ffffff'); b.set(x + 3, ey, ink); b.set(x + 7, ey, ink); }
    else if (A.eye === 'dot') { b.set(x + 3, ey, glow); b.set(x + 6, ey, glow); }
    else if (A.eye === 'wide') b.rect(x + 2, ey - 1, 6, 2, '#7ff0ff');
    else { b.disc(x + 5, ey, 1.6, '#ffffff'); b.set(x + 5, ey, A.head === 'tv' ? '#7ff0ff' : ink); }
    if (A.head !== 'tv') b.rect(x + 3, ey + 2, 3, 1, dk);
    const ax = x + 4;
    if (A.ant === 'bolt') { b.set(ax, y - 1, dk); b.set(ax + 1, y - 2, dk); b.set(ax, y - 3, dk); b.set(ax + 1, y - 4, '#ffe066'); }
    else if (A.ant === 'ball') { b.rect(ax, y - 2, 1, 2, dk); b.rect(ax - 0.5, y - 4, 2, 2, '#ff7ad9'); }
    else if (A.ant === 'twin') { b.rect(ax - 2, y - 3, 1, 3, dk); b.rect(ax + 2, y - 3, 1, 3, dk); b.set(ax - 2, y - 4, '#ffe066'); b.set(ax + 2, y - 4, '#ffe066'); }
    else if (A.ant === 'ring') { b.rect(ax, y - 1, 1, 1, dk); b.ring(ax + 0.5, y - 3, 2, 2, 1, '#7ff0ff'); }
    else b.glyph(GLYPH.plus[0], ax - 1, y - 4, { '#': '#ffe066' });
    b.outline(INK);
    // a little jet
    b.set(x + 4, y + 8, (t % 2) ? '#ffe066' : '#ff9a3d'); b.set(x + 4, y + 9, '#ff9a3d', 0.6);
    return b;
  }
  function hatLayer(cid, stage, A) {
    const rows = SD().HAT_SHAPES[A.shape];
    if (!rows) return null;
    const bb = CR().bounds(cid, stage), h = surf(CW, CH);
    const x = OX + 16 - Math.floor(rows[0].length / 2), y = OY + bb.y0 + 2 - rows.length;
    h.glyph(rows, x, y, A.pal);
    h.outline(INK);
    return h;
  }
  function dressed(cv, cid, stage, eq, o) {
    o = o || {}; eq = eq || {};
    const t = o.t || 0, C = CR(), s = surf(CW, CH);
    const hat = item(eq.hat), cape = item(eq.cape), aura = item(eq.aura), buddy = item(eq.buddy);
    const legacy = !hat && o.hat ? o.hat : null;
    stage = stage || 1;
    const body = surf(CW, CH); body.px32(C.pixels(cid, stage, legacy), 32, OX, OY);
    const hl = hat ? hatLayer(cid, stage, hat.art) : null;
    const bb = C.bounds(cid, stage);
    const mask = body.mask(); if (hl) { const m2 = hl.mask(); for (let i = 0; i < mask.length; i++) mask[i] |= m2[i]; }
    // aura (behind)
    if (aura) {
      const A = aura.art, c = A.color, r = rng(hash(aura.id) + t * 31);
      const mid = OY + (bb.y0 + bb.y1) / 2, cx = OX + 16;
      if (A.style === 'aurora') for (let x = 0; x < CW; x++) { const top = 4 + Math.round(Math.sin(x * 0.35 + t * 0.5) * 3); for (let y = top; y < top + 22; y++) s.set(x, y, mix('#3dffb0', '#5a6bff', (y - top) / 22), 0.4 * (1 - (y - top) / 22)); }
      if (A.style === 'ring') s.ring(cx, mid + 4, (bb.x1 - bb.x0) / 2 + 6, 4, 1.4, c, 1, 'back');
      if (A.style === 'flare') for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4 + t * 0.05; s.line(cx, mid, cx + Math.cos(a) * 22, mid + Math.sin(a) * 22, c, 0.35); }
      const R = A.style === 'flare' ? 4 : A.style === 'fire' ? 4 : 3;
      s.halo(mask, R, (dd, x, y) => {
        switch (A.style) {
          case 'glow': case 'flare': case 'ring': case 'aurora': return [c, dd < 1.5 ? 0.6 : dd < 2.5 ? 0.32 : 0.14];
          case 'rainbow': return [RAINBOW[Math.min(5, Math.floor(dd * 1.7))], 0.6];
          case 'fire': { const v = (hash(x + ':' + y + ':' + (t % 4)) % 100) / 100; return y < mid + 6 && v < 0.75 - dd * 0.15 ? [dd < 2 ? '#ffe066' : c, 0.75 - dd * 0.12] : null; }
          case 'zap': return dd < 1.5 && (x + y + t) % 3 === 0 ? [c, 0.9] : [c, dd < 1.5 ? 0.2 : 0];
          default: return [c, dd < 1.5 ? 0.3 : 0.1];
        }
      });
      if (A.style === 'sparks' || A.style === 'zap' || A.style === 'hearts') {
        for (let k = 0; k < 7; k++) {
          const a = r() * Math.PI * 2, d = 13 + r() * 7, x = cx + Math.cos(a) * d, y = mid + Math.sin(a) * d * 0.9 - (A.style === 'hearts' ? (t % 6) : 0);
          if (A.style === 'hearts') s.glyph(GLYPH.heart3[0], x, y, { '#': c }, 0.9);
          else if (A.style === 'zap') { s.line(x, y, x + 2, y + 2, c); s.line(x + 2, y + 2, x, y + 4, c); }
          else s.glyph(k % 2 ? GLYPH.plus[0] : GLYPH.spark[0], x, y, { '#': c }, (k + t) % 3 ? 0.9 : 0.4);
        }
      }
    }
    // cape (behind the body)
    if (cape) {
      const A = cape.art, cl2 = surf(CW, CH), top = OY + bb.y0 + Math.round((bb.y1 - bb.y0) * 0.36), bot = OY + bb.y1 + (A.long ? 2 : 0) - 1;
      const xl = OX + bb.x0 - 3, xr = OX + bb.x1 + 4, r = rng(hash(cape.id));
      cl2.poly([[OX + bb.x0 + 1, top], [OX + bb.x1, top], [xr, bot + 1], [xl, bot + 1]], (x, y) => {
        if (A.pattern === 'rainbow') return RAINBOW[Math.min(5, Math.floor(((y - top) / (bot - top + 1)) * 6))];
        if (A.pattern === 'stripes') return Math.floor((x - xl) / 2) % 2 ? A.c2 : A.c1;
        if (A.pattern === 'trim') return y >= bot - 1 || x <= xl + 1 + ((y - top) * 3) / (bot - top + 1) ? A.c2 : A.c1;
        if (A.pattern === 'stars' || A.pattern === 'galaxy') { const v = r(); return v < 0.1 ? A.c2 : v < 0.14 && A.pattern === 'galaxy' ? '#ffffff' : A.c1; }
        return y >= bot ? A.c2 : A.c1;
      });
      for (let x = xl; x <= xr; x++) if ((x + t) % 4 === 0) cl2.set(x, bot + 1, A.c1);
      cl2.outline(INK); s.blit(cl2, 0, 0);
    }
    s.blit(body, 0, 0);
    if (hl) s.blit(hl, 0, 0);
    if (aura && aura.art.style === 'ring') s.ring(OX + 16, OY + (bb.y0 + bb.y1) / 2 + 4, (bb.x1 - bb.x0) / 2 + 6, 4, 1.4, aura.art.color, 1, 'front');
    if (buddy && !o.tight) s.blit(buddyLayer(buddy.art, t), CW - 14, 1 + ((t >> 1) % 2));
    // tight: just around the creature (36×35, for the Crew cards)
    return o.tight ? cropOf(s, [OX - 2, OY - 3, 36, 35]).to(cv) : s.to(cv);
  }

  // ---------- painters for cards, windows and posters (they draw into a region) ----------
  function sky(s, X, Y, W, H, seed, top, bottom) {
    const r = rng(seed);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) s.set(X + x, Y + y, mix(top || '#0b1236', bottom || '#1c1550', y / H));
    for (let k = 0; k < (W * H) / 28; k++) s.set(X + r() * W, Y + r() * H, '#ffffff', 0.3 + r() * 0.7);
  }
  function sphere(s, cx, cy, R, c, c2, A, seed) {
    const r = rng(seed);
    const spots = []; for (let k = 0; k < 6; k++) spots.push([cx + (r() - 0.5) * R * 1.3, cy + (r() - 0.5) * R * 1.3, 0.8 + r() * R * 0.22]);
    s.ell(cx, cy, A.potato ? R : R, A.potato ? R * 0.68 : R, (x, y, dx, dy) => {
      let col = c;
      if (A.bands && Math.sin((y - cy) * (6 / R) + 0.5) > 0.45) col = c2;
      if (A.land && (hash(Math.floor((x - cx) / 2.5) + ':' + Math.floor((y - cy) / 2.5) + ':' + seed) % 10) < 4) col = c2;
      if ((A.craters || A.potato) && spots.some(([sx, sy, sr]) => (x - sx) ** 2 + (y - sy) ** 2 < sr * sr)) col = c2;
      if (A.spots && (hash(x + ':' + y) % 11) === 0) col = c2;
      if (A.cracks && (Math.abs(Math.sin((x - cx) * 0.9 + (y - cy) * 0.5)) < 0.12 || Math.abs(Math.sin((x - cx) * 0.3 - (y - cy) * 1.1)) < 0.1)) col = c2;
      if (A.spot && Math.abs(x - (cx + R * 0.3)) < R * 0.22 && Math.abs(y - (cy + R * 0.25)) < R * 0.12) col = '#c0502a';
      if (A.heart) { const hx = (x - (cx + R * 0.15)) / (R * 0.42), hy = (y - (cy + R * 0.05)) / (R * 0.42); if ((hx * hx + hy * hy - 1) ** 3 - hx * hx * (-hy) ** 3 < 0) col = '#f6ead8'; }
      const light = -dx * 0.55 - dy * 0.55 + Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy)) * 0.6;
      return shade(col, Math.max(-0.55, Math.min(0.35, (light - 0.45) * 0.7)));
    });
  }
  function planetArt(s, X, Y, W, H, A, seed) {
    const cx = X + W / 2, cy = Y + H / 2, R = Math.min(W, H) * (A.sun ? 0.3 : 0.32);
    if (A.sun) { s.halo((() => { const m = new Uint8Array(s.W * s.H); for (let y = 0; y < s.H; y++) for (let x = 0; x < s.W; x++) if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 < R * R) m[y * s.W + x] = 1; return m; })(), Math.round(R * 0.6), dd => ['#ffb24a', 0.55 - dd * 0.06]); }
    if (A.haze) s.disc(cx, cy, R + 2, '#e0a84a', 0.35);
    if (A.ring === 1) s.ring(cx, cy, R * 1.65, R * 0.42, 2, mix(A.c, '#ffffff', 0.3), 1, 'back');
    if (A.ring === 2) s.ring(cx, cy, R * 0.38, R * 1.5, 1.2, '#cfeff5', 0.8, 'back');
    sphere(s, cx, cy, R, A.c, A.c2, A, seed);
    if (A.sun) for (let k = 0; k < 14; k++) { const a = (k * Math.PI * 2) / 14; s.set(cx + Math.cos(a) * R * 0.6, cy + Math.sin(a) * R * 0.6, '#fff3a0', 0.7); }
    if (A.ring === 1) s.ring(cx, cy, R * 1.65, R * 0.42, 2, mix(A.c, '#ffffff', 0.3), 1, 'front');
    if (A.ring === 2) s.ring(cx, cy, R * 0.38, R * 1.5, 1.2, '#cfeff5', 0.8, 'front');
  }
  function starsArt(s, X, Y, W, H, A) {
    const P = A.pts.map(([u, v]) => [X + 3 + u * (W - 6), Y + 3 + v * (H - 6)]);
    A.lines.forEach(([a, b]) => s.line(P[a][0], P[a][1], P[b][0], P[b][1], '#6d7cff', 0.75));
    P.forEach(([x, y], k) => { s.glyph(GLYPH.plus[0], x - 1, y - 1, { '#': '#7ff0ff' }, k % 3 ? 0.55 : 0.85); s.set(x, y, '#ffffff'); });
  }
  function wonderArt(s, X, Y, W, H, kind, seed) {
    const cx = X + W / 2, cy = Y + H / 2, k = Math.min(W, H) / 40, r = rng(seed);
    switch (kind) {
      case 'comet': {
        for (let j = 0; j < 30 * k; j++) { const x = cx + 6 * k - j, y = cy - 6 * k + j * 0.75, hw = 1 + j * 0.15; for (let d = -hw; d <= hw; d++) s.set(x + d * 0.3, y + d, d === 0 ? '#ffffff' : '#7ff0ff', 0.85 - j / (34 * k)); }
        for (let j = 0; j < 22 * k; j++) s.set(cx + 6 * k - j * 0.9, cy - 6 * k + j * 0.95 + Math.sin(j * 0.4), '#ffe9a8', 0.7 - j / (26 * k));
        s.disc(cx + 6 * k, cy - 6 * k, 2.6 * k, '#ffffff'); return;
      }
      case 'nebula': case 'galaxyneb':
        for (let y = Y; y < Y + H; y++) for (let x = X; x < X + W; x++) {
          const v = (Math.sin(x * 0.21 + seed) + Math.sin(y * 0.17 + x * 0.05) + Math.sin((x + y) * 0.11 + seed * 0.3) + 3) / 6;
          const d = Math.hypot(x - cx, y - cy) / (Math.min(W, H) * 0.55);
          const a = Math.max(0, v * 1.3 - d * 0.9);
          if (a > 0.05) s.set(x, y, mix('#ff7ad9', '#5a6bff', v), Math.min(0.9, a));
        }
        for (let j = 0; j < 8; j++) s.glyph(GLYPH.plus[0], X + r() * W, Y + r() * H, { '#': '#ffffff' }, 0.8);
        return;
      case 'blackhole':
        s.ring(cx, cy, 16 * k, 5 * k, 2.5 * k, '#ff9a3d', 1, 'back');
        s.ring(cx, cy - 1, 9 * k, 8 * k, 1.6, '#ffd23f', 0.8, 'back');
        s.disc(cx, cy, 6.5 * k, '#ffb24a', 0.5); s.disc(cx, cy, 5.5 * k, '#000000');
        s.ring(cx, cy, 16 * k, 5 * k, 2.5 * k, '#ffd23f', 1, 'front'); s.ring(cx, cy, 13 * k, 3.6 * k, 1, '#fff3a0', 0.9, 'front');
        return;
      case 'galaxy':
        for (let j = 0; j < 260; j++) {
          const arm = j % 2, tt = (j / 260) * 3.2, rad = (2 + tt * 5.2) * k, a = tt * 1.9 + arm * Math.PI;
          s.set(cx + Math.cos(a) * rad + (r() - 0.5) * 3 * k, cy + Math.sin(a) * rad * 0.62 + (r() - 0.5) * 2 * k, j % 5 ? '#9ab8ff' : '#ff9ae0', 0.85);
        }
        s.ell(cx, cy, 4 * k, 3 * k, '#fff3d6'); s.disc(cx, cy, 1.6 * k, '#ffffff'); return;
      case 'aurora':
        for (let x = X; x < X + W; x++) { const top = Y + H * 0.15 + Math.sin(x * 0.25 + seed) * 4 * k; for (let y = top; y < Y + H * 0.75; y++) { const v = (y - top) / (H * 0.6); s.set(x, y, v < 0.15 ? '#ff7ad9' : mix('#3dffb0', '#3d9aff', v), 0.75 * (1 - v)); } }
        for (let x = X; x < X + W; x++) { const g = Y + H * 0.82 + Math.sin(x * 0.18) * 2 * k; for (let y = g; y < Y + H; y++) s.set(x, y, '#0a0f24'); }
        return;
      case 'meteors':
        for (let j = 0; j < 6; j++) { const x = X + r() * W, y = Y + r() * H * 0.6, len = (8 + r() * 10) * k; for (let q = 0; q < len; q++) s.set(x - q, y + q * 0.6, '#ffffff', 1 - q / len); }
        return;
      case 'supernova':
        for (let j = 0; j < 16; j++) { const a = (j * Math.PI * 2) / 16; s.line(cx, cy, cx + Math.cos(a) * 17 * k, cy + Math.sin(a) * 17 * k, j % 2 ? '#ff7ad9' : '#ffd23f', 0.6); }
        s.ring(cx, cy, 12 * k, 12 * k, 2, '#ff9a3d', 0.7); s.disc(cx, cy, 7 * k, '#ffe066'); s.disc(cx, cy, 4 * k, '#ffffff'); return;
      case 'eclipse':
        s.disc(cx, cy, 11 * k, '#fff3a0', 0.25); s.disc(cx, cy, 9.5 * k, '#ffe9a8', 0.55); s.disc(cx, cy, 8.4 * k, '#ffffff'); s.disc(cx + 0.5, cy, 7.8 * k, '#05060f'); return;
      case 'asteroids':
        for (let j = 0; j < 22; j++) { const x = X + r() * W, y = cy + (x - cx) * 0.35 + (r() - 0.5) * 12 * k, rr = (0.8 + r() * 2.2) * k; s.ell(x, y, rr * 1.2, rr, (xx, yy, dx, dy) => shade('#9a8f84', -dx * 0.25 - dy * 0.25)); }
        return;
      case 'redgiant':
        s.disc(cx, cy, 16 * k, '#ff5a3d', 0.25);
        sphere(s, cx, cy, 14 * k, '#ff6a3d', '#c0402a', { craters: 1 }, seed); return;
      case 'pulsar':
        s.poly([[cx, cy], [cx - 5 * k, Y], [cx + 5 * k, Y]], '#7ff0ff', 0.35); s.poly([[cx, cy], [cx - 5 * k, Y + H], [cx + 5 * k, Y + H]], '#7ff0ff', 0.35);
        s.disc(cx, cy, 4 * k, '#bff8ff', 0.6); s.disc(cx, cy, 2.4 * k, '#ffffff'); return;
      case 'milkyway':
        for (let j = 0; j < 420; j++) { const u = r(), x = X + u * W, y = Y + H * 0.85 - u * H * 0.7 + (r() - 0.5) * 12 * k; s.set(x, y, j % 7 ? '#ffffff' : '#ffd6a8', 0.3 + r() * 0.6); }
        for (let x = X; x < X + W; x++) for (let y = Y + H * 0.88 + Math.sin(x * 0.3) * k; y < Y + H; y++) s.set(x, y, '#070a18');
        return;
      default: return;
    }
  }
  function craftArt(s, X, Y, W, H, kind) {
    const k = Math.min(W, H) / 40, ox = X + (W - 40 * k) / 2, oy = Y + (H - 40 * k) / 2;
    const R = (x, y, w, h, c, a) => s.rect(ox + x * k, oy + y * k, Math.max(1, w * k), Math.max(1, h * k), c, a);
    const Pl = (pts, c, a) => s.poly(pts.map(([x, y]) => [ox + x * k, oy + y * k]), c, a);
    const D = (x, y, r, c, a) => s.disc(ox + x * k, oy + y * k, r * k, c, a);
    const E = (x, y, rx, ry, c, a, p) => s.ell(ox + x * k, oy + y * k, rx * k, ry * k, c, a, p);
    const Ln = (x0, y0, x1, y1, c, a) => s.line(ox + x0 * k, oy + y0 * k, ox + x1 * k, oy + y1 * k, c, a);
    const grid = (x, y, w, h) => { R(x, y, w, h, '#2a4fa8'); for (let i = x; i < x + w; i += 2) R(i, y, 1, h, '#5ab4ff', 0.6); };
    switch (kind) {
      case 'rocket':
        Pl([[18, 31], [22, 31], [20, 39]], '#ff9a3d'); Pl([[19, 31], [21, 31], [20, 36]], '#ffe066');
        Pl([[17, 23], [12, 32], [17, 30]], '#e5484d'); Pl([[23, 23], [28, 32], [23, 30]], '#e5484d');
        R(17, 9, 6, 22, '#eef2ff'); R(22, 9, 1, 22, '#b8c0d8'); Pl([[17, 9], [23, 9], [20, 2]], '#e5484d'); R(17, 21, 6, 2, '#e5484d');
        D(20, 14.5, 1.8, '#3aa8d8'); s.set(ox + 19 * k, oy + 13.5 * k, '#ffffff'); return;
      case 'station':
        R(3, 19, 34, 2, '#8a94b8'); grid(2, 8, 6, 24); grid(32, 8, 6, 24);
        R(14, 14, 12, 12, '#eef2ff'); R(14, 24, 12, 2, '#b8c0d8'); R(9, 16, 5, 8, '#c9d0e2'); R(26, 16, 5, 8, '#c9d0e2');
        D(20, 20, 2, '#3aa8d8'); R(19, 6, 2, 8, '#8a94b8'); E(20, 6, 4, 1.5, '#eef2ff'); return;
      case 'rover':
        R(0, 32, 40, 8, '#a8543a'); for (let i = 0; i < 6; i++) D(4 + i * 7, 34 + (i % 2) * 3, 1.2, '#7a3a2a');
        R(10, 18, 20, 6, '#c9d0e2'); grid(10, 15, 20, 3); Ln(12, 24, 12, 28, '#566079'); Ln(20, 24, 20, 28, '#566079'); Ln(28, 24, 28, 28, '#566079');
        [12, 20, 28].forEach(x => { D(x, 29, 3, '#2a2e3d'); D(x, 29, 1.2, '#8a94b8'); });
        R(26, 7, 2, 8, '#8a94b8'); R(24, 5, 6, 3, '#eef2ff'); R(28, 6, 1, 1, '#3aa8d8'); return;
      case 'telescope':
        Pl([[8, 30], [14, 36], [33, 17], [27, 11]], '#c9d0e2'); Pl([[8, 30], [11, 33], [30, 14], [27, 11]], '#eef2ff');
        E(30, 14, 4, 4, '#2a2e3d'); E(30, 14, 2.6, 2.6, '#ffd23f'); grid(4, 34, 14, 3); Ln(14, 36, 14, 34, '#8a94b8'); return;
      case 'satellite':
        grid(3, 18, 11, 5); grid(26, 18, 11, 5); R(14, 20, 12, 1, '#8a94b8');
        R(16, 15, 8, 10, '#ffd23f'); R(16, 15, 8, 1, '#fff6c8'); R(17, 17, 6, 1, '#c49a10'); R(17, 20, 6, 1, '#c49a10');
        Ln(20, 15, 20, 10, '#8a94b8'); E(20, 9, 5, 2, '#eef2ff', 1, 'back'); D(20, 9, 1, '#8a94b8'); return;
      case 'lander':
        R(0, 33, 40, 7, '#8a8f9a'); D(8, 36, 2, '#6a707c'); D(31, 37, 1.5, '#6a707c');
        Ln(14, 24, 9, 33, '#8a94b8'); Ln(26, 24, 31, 33, '#8a94b8'); R(7, 33, 4, 1, '#c9d0e2'); R(29, 33, 4, 1, '#c9d0e2');
        R(13, 15, 14, 10, '#ffd23f'); for (let i = 0; i < 14; i += 3) R(13 + i, 15 + (i % 2) * 4, 2, 3, '#c49a10');
        R(15, 8, 10, 7, '#c9d0e2'); R(17, 10, 2, 2, '#3aa8d8'); R(18, 25, 4, 2, '#566079'); return;
      case 'shuttle':
        Pl([[12, 26], [28, 26], [14, 33], [8, 33]], '#2a2e3d'); Pl([[5, 19], [10, 19], [6, 10]], '#eef2ff');
        Pl([[4, 19], [30, 19], [36, 22], [30, 26], [4, 26]], '#eef2ff'); R(4, 25, 26, 1, '#2a2e3d'); R(31, 20, 3, 1, '#2a2e3d');
        R(1, 20, 3, 2, '#8a94b8'); R(1, 23, 3, 2, '#8a94b8'); R(14, 21, 12, 1, '#c9d0e2'); return;
      case 'probe':
        Ln(18, 22, 37, 32, '#8a94b8'); Ln(18, 24, 6, 34, '#8a94b8'); R(5, 33, 3, 3, '#c9d0e2');
        R(16, 20, 8, 6, '#ffd23f'); E(17, 13, 8, 8, '#eef2ff'); E(17, 13, 5, 5, '#c9d0e2'); D(17, 13, 1.5, '#8a94b8'); Ln(17, 13, 17, 4, '#8a94b8'); return;
      case 'capsule':
        [[11, 10], [20, 7], [29, 10]].forEach(([x, y], i) => { E(x, y, 5, 4.5, (xx) => (Math.floor((xx - ox) / (2 * k)) % 2 ? '#ffffff' : '#ff5a5a'), 1, 'back'); Ln(x - 4, y, 18 + i * 2, 25, '#c9d0e2', 0.8); Ln(x + 4, y, 18 + i * 2, 25, '#c9d0e2', 0.8); });
        Pl([[16, 25], [24, 25], [27, 33], [13, 33]], '#c9d0e2'); R(13, 32, 14, 2, '#566079'); D(20, 29, 1.4, '#3aa8d8'); return;
      case 'sail':
        Pl([[20, 3], [37, 20], [20, 37], [3, 20]], (x, y) => mix('#c9d0e2', '#ffffff', (Math.sin((x + y) * 0.4) + 1) / 2));
        Ln(20, 3, 20, 37, '#8a94b8'); Ln(3, 20, 37, 20, '#8a94b8'); D(20, 20, 2.4, '#ffd23f'); return;
      case 'suit':
        R(12, 21, 16, 13, '#eef2ff'); R(8, 22, 4, 10, '#dde3f3'); R(28, 22, 4, 10, '#dde3f3'); R(15, 24, 10, 5, '#c9d0e2');
        R(16, 25, 2, 1, '#e5484d'); R(19, 25, 2, 1, '#5ab4ff'); R(22, 25, 2, 1, '#6fe36f'); R(12, 34, 6, 4, '#dde3f3'); R(22, 34, 6, 4, '#dde3f3');
        D(20, 13, 7.5, '#eef2ff'); E(20, 13.5, 5.2, 4.2, '#ffd23f'); E(20, 13.5, 5.2, 4.2, '#c49a10', 1, 'front'); R(17, 11, 2, 1, '#ffffff'); return;
      case 'cargo':
        Pl([[4, 16], [8, 14], [8, 26], [4, 24]], '#c9d0e2'); R(8, 14, 24, 12, '#eef2ff'); R(8, 24, 24, 2, '#b8c0d8'); R(8, 14, 24, 1, '#ffffff');
        grid(12, 8, 6, 6); grid(22, 8, 6, 6); grid(12, 26, 6, 6); grid(22, 26, 6, 6); R(32, 16, 3, 8, '#8a94b8'); return;
      default: return;
    }
  }

  // ---------- collection cards ----------
  const KW = 40;
  function card(cv, it, o) {
    const A = it.art, s = surf(KW, KW), seed = hash(it.id);
    if (A.kind === 'creature') {
      const c = CR().list[A.cid], bg = c ? (c.legendary ? '#3a2a6a' : CR().TYPES[c.type].bg) : '#2a3070';
      for (let y = 0; y < KW; y++) for (let x = 0; x < KW; x++) { const dd = Math.hypot(x - 20, y - 22) / 28; s.set(x, y, mix(shade(bg, -0.1), shade(bg, -0.72), Math.min(1, dd))); }
      const r = rng(seed); for (let k = 0; k < 14; k++) s.set(r() * KW, r() * KW, '#ffffff', 0.5);
      s.px32(CR().pixels(A.cid, c && c.legendary ? 3 : 2), 32, 4, 5);
    } else if (A.kind === 'stars') { sky(s, 0, 0, KW, KW, seed, '#060b26', '#17205a'); starsArt(s, 0, 0, KW, KW, A); }
    else if (A.kind === 'planet') { sky(s, 0, 0, KW, KW, seed, '#070b22', '#1a1446'); planetArt(s, 0, 0, KW, KW, A, seed); }
    else if (A.kind === 'wonder') { sky(s, 0, 0, KW, KW, seed, A.w === 'aurora' ? '#06122a' : '#070b22', A.w === 'aurora' ? '#0f2a3a' : '#1a1446'); wonderArt(s, 0, 0, KW, KW, A.w, seed); }
    else if (A.kind === 'craft') { sky(s, 0, 0, KW, KW, seed, '#0a1440', '#25205e'); craftArt(s, 0, 0, KW, KW, A.w); }
    if (o && o.locked) { for (let i = 0; i < KW * KW; i++) { const p = i * 4; const g = (s.d[p] + s.d[p + 1] + s.d[p + 2]) / 3; s.d[p] = s.d[p + 1] = s.d[p + 2] = g * 0.35 + 18; } }
    return s.to(cv);
  }

  // ---------- the cabin ----------
  const BW = 128, BH = 72, FLOOR = 50;
  const REGION = { floor: [0, 36, 128, 36], window: [44, 4, 40, 30], poster: [10, 6, 22, 28], shelf: [88, 8, 36, 26], bed: [0, 32, 40, 30], desk: [94, 22, 34, 38], lamp: [104, 8, 24, 52], plant: [34, 36, 18, 26], rug: [38, 56, 56, 16], gadget: [76, 26, 26, 36] };
  function wallAt(A, x, y, r) {
    const { c1, c2 } = A;
    switch (A.pattern) {
      case 'panels': return y % 22 === 0 || x % 16 === 0 ? shade(c1, -0.25) : (x % 16 === 2 && y % 22 === 2) || (x % 16 === 13 && y % 22 === 2) ? shade(c1, 0.3) : (y % 22 === 1 ? shade(c1, 0.08) : c1);
      case 'stripes': return Math.floor(x / 4) % 2 ? c2 : c1;
      case 'stars': return r() < 0.03 ? c2 : r() < 0.02 ? '#ffffff' : c1;
      case 'hex': { const row = Math.floor(y / 6), xx = (x + (row % 2) * 5) % 10; return (y % 6 === 0 && xx < 6) || xx === 0 || xx === 6 ? c2 : c1; }
      case 'fade': return mix(c1, c2, y / FLOOR);
      case 'dots': return (x + (Math.floor(y / 6) % 2) * 3) % 6 === 0 && y % 6 === 3 ? c2 : c1;
      case 'planks': return y % 6 === 5 ? shade(c1, -0.3) : (x + Math.floor(y / 6) * 13) % 31 === 0 ? shade(c1, -0.3) : (hash(Math.floor(y / 6) + ':' + Math.floor(x / 31)) % 3 ? c1 : shade(c1, 0.07));
      case 'circuit': return (y % 12 === 4 && (x % 24) < 16) || (x % 24 === 16 && y % 12 >= 4 && y % 12 <= 9) ? c2 : (x % 24 === 16 && y % 12 === 10) ? '#ffffff' : c1;
      case 'galaxy': { const v = (Math.sin(x * 0.15) + Math.sin(y * 0.2 + x * 0.05) + 2) / 4; return r() < 0.02 ? '#ffffff' : mix(c1, c2, v * 0.45); }
      default: return c1;
    }
  }
  function floorAt(A, x, y, r) {
    const { c1, c2 } = A, fy = y - FLOOR;
    switch (A.pattern) {
      case 'grid': return fy % 6 === 0 || (x + fy * 0) % 12 === 0 ? shade(c1, -0.22) : c1;
      case 'check': return (Math.floor(x / 8) + Math.floor(fy / 4)) % 2 ? c2 : c1;
      case 'planks': return fy % 4 === 3 ? shade(c1, -0.3) : (x + Math.floor(fy / 4) * 17) % 37 === 0 ? shade(c1, -0.3) : c1;
      case 'rock': return r() < 0.08 ? shade(c1, -0.2) : r() < 0.04 ? shade(c1, 0.15) : c1;
      case 'grass': return r() < 0.15 ? shade(c1, 0.18) : r() < 0.1 ? c2 : c1;
      case 'tiles': return fy % 6 === 0 || x % 10 === 0 ? c2 : c1;
      case 'rainbow': return RAINBOW[Math.floor(fy / 4) % 6];
      default: return r() < 0.06 ? shade(c1, -0.08) : c1;
    }
  }
  function windowView(s, X, Y, W, H, view) {
    const seed = hash(view);
    if (view === 'aurora') { sky(s, X, Y, W, H, seed, '#06122a', '#0f2a3a'); wonderArt(s, X, Y, W, H, 'aurora', seed); return; }
    sky(s, X, Y, W, H, seed);
    switch (view) {
      case 'earth': sphere(s, X + W * 0.72, Y + H * 0.95, H * 0.75, '#3a7fd8', '#4fb35a', { land: 1 }, 3); break;
      case 'moon': sphere(s, X + W * 0.6, Y + H * 0.5, H * 0.32, '#d0d4dc', '#9aa0ac', { craters: 1 }, 5); break;
      case 'nebula': wonderArt(s, X, Y, W, H, 'nebula', seed); break;
      case 'saturn': planetArt(s, X, Y, W, H, { c: '#f0d48a', c2: '#c9a85a', bands: 1, ring: 1 }, 6); break;
      case 'mars': sphere(s, X + W * 0.35, Y + H * 0.55, H * 0.3, '#d9663a', '#a8432a', { craters: 1 }, 7); break;
      case 'galaxy': wonderArt(s, X, Y, W, H, 'galaxy', seed); break;
      case 'comet': wonderArt(s, X, Y, W, H, 'comet', seed); break;
      case 'sunrise': s.disc(X + W * 0.5, Y + H * 0.85, H * 0.5, '#ffb24a', 0.35); s.disc(X + W * 0.5, Y + H * 0.85, H * 0.22, '#fff3a0'); sphere(s, X + W * 0.5, Y + H * 2.2, H * 1.5, '#2a5fa8', '#3f8a4a', { land: 1 }, 9); break;
      case 'blackhole': wonderArt(s, X, Y, W, H, 'blackhole', seed); break;
      default: break;
    }
  }
  function posterArt(s, X, Y, W, H, kind, color) {
    const seed = hash(kind);
    sky(s, X, Y, W, H, seed, shade(color, -0.75), shade(color, -0.55));
    switch (kind) {
      case 'planet': planetArt(s, X, Y, W, H, { c: color, c2: shade(color, -0.3), bands: 1 }, seed); break;
      case 'rocket': craftArt(s, X - 2, Y, W + 4, H, 'rocket'); break;
      case 'creature': s.px32(CR().pixels(12, 1), 32, X + W / 2 - 16, Y + H / 2 - 15); break;
      case 'galaxy': wonderArt(s, X, Y, W, H, 'galaxy', seed); break;
      case 'moon': sphere(s, X + W / 2, Y + H / 2, W * 0.32, '#d0d4dc', '#9aa0ac', { craters: 1 }, seed); break;
      case 'saturn': planetArt(s, X, Y, W, H, { c: '#f0d48a', c2: '#c9a85a', bands: 1, ring: 1 }, seed); break;
      case 'comet': wonderArt(s, X, Y, W, H, 'comet', seed); break;
      case 'starmap': starsArt(s, X, Y, W, H, SD().byId.get('card-st-00').art); break;
      case 'universe': { const r = rng(4); for (let k = 0; k < 9; k++) { const x = X + 2 + r() * (W - 4), y = Y + 2 + r() * (H - 4); s.ell(x, y, 1.6, 1, k % 2 ? '#ff9ae0' : '#9ab8ff'); s.set(x, y, '#ffffff'); } break; }
      default: break;
    }
  }
  function furniture(s, slot, A, t, o) {
    o = o || {};
    const c = A.color, dk = shade(c, -0.4), lt = shade(c, 0.35), wood = '#8a5a34', metal = '#8a94b8';
    const F = surf(BW, BH);
    switch (slot) {
      case 'bed':
        if (A.kind === 'pod') { F.ell(19, 50, 17, 9, c); F.ell(19, 47, 15, 6, '#bff8ff', 0.7, 'back'); F.rect(5, 50, 28, 2, dk); F.rect(8, 46, 9, 3, '#ffffff'); F.rect(18, 47, 14, 4, lt); }
        else if (A.kind === 'hammock') { F.rect(2, 34, 2, 26, wood); F.rect(36, 34, 2, 26, wood); for (let x = 4; x < 36; x++) { const y = 42 + Math.round(Math.sin(((x - 4) / 32) * Math.PI) * 7); F.rect(x, y, 1, 3, x % 3 ? c : lt); } F.disc(10, 37, 2.2, '#fff3a0'); F.disc(11, 36, 2, '#c9b870'); }
        else { F.rect(2, 36, 3, 24, wood); F.rect(33, 36, 3, 24, wood); F.rect(5, 50, 28, 6, '#f2f4fb'); F.rect(12, 48, 21, 8, c); F.rect(12, 48, 21, 1, lt); F.rect(6, 47, 6, 3, '#ffffff'); F.rect(5, 56, 28, 2, shade(wood, -0.2)); F.rect(5, 38, 28, 2, wood); F.rect(5, 40, 28, 4, '#f2f4fb'); F.rect(12, 40, 21, 3, lt); }
        break;
      case 'desk':
        F.rect(96, 42, 26, 3, wood); F.rect(97, 45, 2, 12, shade(wood, -0.2)); F.rect(119, 45, 2, 12, shade(wood, -0.2)); F.rect(108, 45, 11, 7, shade(wood, -0.1));
        if (A.kind === 'computer') { F.rect(101, 30, 14, 10, '#2a2e3d'); F.rect(102, 31, 12, 8, c); F.rect(103, 32, 4, 1, '#ffffff', 0.8); F.rect(107, 40, 2, 2, metal); F.rect(102, 41, 12, 1, '#c9d0e2'); }
        else { [c, '#ffd23f', '#5ab4ff', '#ff7ad9'].forEach((bc, i) => F.rect(100, 39 - i * 2, 10 - i, 2, bc)); F.rect(112, 37, 6, 5, '#f2f4fb'); F.rect(113, 38, 4, 1, '#8a94b8'); }
        break;
      case 'lamp':
        if (A.kind !== 'floor' && !o.desk) { F.rect(112, 42, 12, 2, wood); F.rect(113, 44, 2, 13, shade(wood, -0.2)); F.rect(121, 44, 2, 13, shade(wood, -0.2)); }
        if (A.kind === 'floor') { F.rect(124, 18, 2, 40, metal); F.rect(121, 57, 8, 2, metal); F.poly([[119, 18], [131, 18], [128, 11], [122, 11]], c); s.ell(125, 24, 8, 10, c, 0.18); }
        else if (A.kind === 'moon') { s.disc(118, 36, 7, c, 0.2); F.disc(118, 36, 4, c); F.disc(117, 35, 1, shade(c, -0.15)); F.rect(116, 40, 4, 2, metal); }
        else { s.disc(118, 34, 6, c, 0.18); F.poly([[116, 41], [120, 41], [121, 31], [115, 31]], shade(c, 0.5)); F.rect(115, 41, 6, 1, metal); F.rect(116, 29, 4, 2, metal); F.disc(118, 37 - (t % 3), 1.2, c); F.disc(117, 33 + (t % 2), 1, c); }
        break;
      case 'plant':
        F.poly([[37, 52], [47, 52], [46, 60], [38, 60]], '#c0603a'); F.rect(37, 52, 10, 1, '#e08a5a');
        if (A.kind === 'cactus') { F.rect(40, 38, 4, 14, c); F.rect(37, 42, 3, 2, c); F.rect(37, 39, 2, 3, c); F.rect(44, 44, 3, 2, c); F.rect(45, 41, 2, 3, c); F.rect(41, 39, 1, 12, lt); F.set(42, 37, '#ff7ad9'); }
        else { for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.42; F.line(42, 52, 42 + Math.cos(a) * 11, 52 + Math.sin(a) * 13, k % 2 ? c : lt); } s.disc(42, 44, 7, c, 0.16); }
        break;
      case 'shelf':
        F.rect(90, 20, 32, 2, wood); F.rect(90, 30, 32, 2, wood);
        if (A.kind === 'trophy') { [94, 104, 114].forEach((x, i) => { F.rect(x, 12, 5, 4, i === 1 ? '#ffd23f' : i ? '#c9d0e2' : '#c98a4a'); F.rect(x + 2, 16, 1, 2, '#c49a10'); F.rect(x + 1, 18, 3, 2, '#566079'); }); [96, 110].forEach(x => F.rect(x, 25, 6, 5, '#ff7ad9')); }
        else if (A.kind === 'models') { F.poly([[96, 19], [99, 19], [97.5, 11]], '#eef2ff'); F.rect(96, 15, 3, 4, '#eef2ff'); F.set(97, 13, '#e5484d'); F.disc(108, 15, 3.5, '#ff8a3d'); F.ring(108, 15, 6, 1.6, 1, '#ffd23f'); F.rect(116, 14, 5, 5, c); F.rect(94, 25, 8, 4, '#566079'); F.rect(106, 24, 12, 6, '#5ab4ff'); }
        else { for (let i = 0; i < 12; i++) F.rect(92 + i * 2.4, 12 + (i % 3), 2, 8 - (i % 3), [c, '#ffd23f', '#5ab4ff', '#ff7ad9', '#6fe36f', '#e5484d'][i % 6]); for (let i = 0; i < 9; i++) F.rect(94 + i * 3, 23 + (i % 2), 2, 7 - (i % 2), [lt, '#b18cff', '#ff9a3d', '#7ff0ff'][i % 4]); }
        break;
      case 'poster':
        F.rect(12, 8, 18, 24, '#f2f4fb'); s.blit(F, 0, 0); posterArt(s, 13, 9, 16, 22, A.kind, c); return;
      case 'rug':
        if (A.kind === 'stripes') F.ell(66, 64, 26, 5, (x) => (Math.floor(x / 4) % 2 ? c : lt));
        else if (A.kind === 'galaxy') { F.ell(66, 64, 26, 5, '#2a1f5a'); for (let k = 0; k < 40; k++) { const a = k * 0.5, rr = k * 0.6; F.set(66 + Math.cos(a) * rr, 64 + Math.sin(a) * rr * 0.2, k % 3 ? '#b18cff' : '#ffffff'); } }
        else { F.ell(66, 64, 26, 5, c); F.ring(66, 64, 22, 3.6, 1, lt); if (A.kind === 'star') F.glyph(GLYPH.star[0], 64, 62, { '#': '#ffffff' }); if (A.kind === 'planet') { F.ell(66, 64, 4, 2, '#ffd23f'); F.ring(66, 64, 8, 1.4, 1, '#ffffff'); } }
        F.outline(shade(c, -0.55), 0.6);
        break;
      case 'gadget':
        if (A.kind === 'telescope') { F.line(84, 60, 89, 50, metal); F.line(95, 60, 89, 50, metal); F.line(89, 60, 89, 50, metal); F.poly([[84, 46], [87, 43], [98, 36], [96, 33]], c); F.rect(95, 33, 3, 3, shade(c, -0.3)); }
        else if (A.kind === 'robot') { F.rect(84, 46, 10, 10, c); F.rect(85, 40, 8, 6, lt); F.set(87, 42, '#14203a'); F.set(90, 42, '#14203a'); F.rect(88, 38, 1, 2, metal); F.set(88, 37, '#ff7ad9'); F.rect(85, 56, 3, 3, dk); F.rect(90, 56, 3, 3, dk); }
        else if (A.kind === 'tank') { F.rect(80, 40, 18, 16, '#bff8ff'); s.blit(F, 0, 0); F.clip(); const q = surf(BW, BH); q.rect(81, 41, 16, 14, '#2a8fd8', 0.7); q.ell(89, 46 + (t % 2), 4, 3, c, 1, 'back'); for (let i = 0; i < 4; i++) q.line(86 + i * 2, 46, 86 + i * 2 + ((t + i) % 2), 52, c, 0.8); q.set(84, 52 - (t % 4), '#ffffff'); q.rect(80, 56, 18, 3, '#566079'); s.blit(q, 0, 0); return; }
        else if (A.kind === 'arcade') { F.rect(82, 34, 14, 26, c); F.rect(84, 37, 10, 8, '#14203a'); F.rect(85, 38, 3, 2, '#7ff0ff'); F.rect(89, 41, 3, 2, '#ffe066'); F.rect(83, 47, 12, 3, dk); F.set(86, 48, '#ff5a5a'); F.set(90, 48, '#ffe066'); F.rect(82, 34, 14, 2, lt); }
        else if (A.kind === 'globe') { F.rect(85, 57, 8, 2, wood); F.rect(88, 52, 2, 5, metal); F.ring(89, 46, 7, 7, 1, '#c49a10'); s.blit(F, 0, 0); sphere(s, 89, 46, 5.5, c, '#4fb35a', { land: 1 }, 11); return; }
        else if (A.kind === 'guitar') { F.ell(88, 53, 5, 5, c); F.ell(88, 47, 4, 3.5, c); F.disc(88, 51, 1.5, '#2a2e3d'); F.rect(87, 30, 2, 17, '#6a4a30'); F.rect(86, 28, 4, 3, '#2a2e3d'); }
        else if (A.kind === 'timemachine') { F.rect(81, 38, 16, 21, '#5a6680'); F.rect(81, 38, 16, 2, '#8a94b8'); F.disc(89, 46, 5, '#f2f4fb'); F.line(89, 46, 89, 43, '#14203a'); F.line(89, 46, 91 + (t % 2), 47, '#14203a'); F.rect(83, 54, 12, 3, c); s.disc(89, 48, 10, c, 0.2); }
        break;
      default: break;
    }
    F.outline(mix(shade(c || '#888888', -0.7), INK, 0.5), slot === 'rug' ? 0 : 1);
    s.blit(F, 0, 0);
  }
  function cabin(cv, eq, o) {
    o = o || {}; eq = eq || {};
    const t = o.t || 0, s = surf(BW, BH), only = o.only || null;
    const show = slot => !only || only === slot;
    const wall = (show('wall') && item(eq.wall)) || item(SD().STARTER.wall), floor = (show('floor') && item(eq.floor)) || item(SD().STARTER.floor);
    const r = rng(hash(wall.id) + 1);
    for (let y = 0; y < FLOOR; y++) for (let x = 0; x < BW; x++) s.set(x, y, wallAt(wall.art, x, y, r));
    const r2 = rng(hash(floor.id) + 2);
    for (let y = FLOOR; y < BH; y++) for (let x = 0; x < BW; x++) s.set(x, y, shade(floorAt(floor.art, x, y, r2), -((y - FLOOR) / (BH - FLOOR)) * 0.12));
    s.rect(0, FLOOR - 2, BW, 2, shade(wall.art.c1, -0.45)); s.rect(0, FLOOR, BW, 1, shade(floor.art.c1, -0.4));
    // window
    const win = (show('window') && item(eq.window)) || item(SD().STARTER.window);
    s.rect(45, 5, 38, 28, '#5a6680'); s.rect(46, 6, 36, 26, '#8a94b8');
    s.clip(48, 8, 32, 22); windowView(s, 48, 8, 32, 22, win.art.view); s.clip();
    s.rect(46, 31, 36, 2, '#c9d0e2'); s.rect(63, 8, 2, 22, '#8a94b8', 0.6);
    const order = ['rug', 'poster', 'shelf', 'bed', 'plant', 'gadget', 'desk', 'lamp'];
    const hasDesk = show('desk') && !!item(eq.desk);
    order.forEach(slot => { const it = show(slot) && item(eq[slot]); if (it) furniture(s, slot, it.art, t, { desk: hasDesk }); });
    // the voyager's creature stands on the rug (dressed() with no canvas gives back its surface)
    if (o.creature !== false && !only) s.blit(dressed(null, o.cid, o.stage || 1, o.wear || {}, { t, hat: o.hat }), 42, 20);
    return s.to(cv);
  }

  // ---------- thumbnails ----------
  const SHIP_SLOTS = ['hull', 'wing', 'engine', 'paint', 'decal', 'trail'], WEAR_SLOTS = ['hat', 'cape', 'aura', 'buddy'];
  const CABIN_SLOTS = ['wall', 'floor', 'window', 'bed', 'desk', 'lamp', 'plant', 'shelf', 'poster', 'rug', 'gadget'];
  function pick(eq, slots) { const o = {}; slots.forEach(k => { if (eq && eq[k]) o[k] = eq[k]; }); return o; }
  // ctx: { cid, stage, equip, hat } — the voyager the item is tried on (or nobody)
  function thumb(cv, it, ctx) {
    ctx = ctx || {};
    const eq = ctx.equip || {};
    if (it.shop === 'cards') return card(cv, it, { locked: ctx.locked });
    if (SHIP_SLOTS.includes(it.slot)) {
      const e2 = Object.assign(pick(eq, SHIP_SLOTS), { [it.slot]: it.id }), full = ship(null, e2, { t: ctx.t });
      if (e2.trail) return full.to(cv);
      let x0 = SW;
      for (let x = 0; x < SW && x0 === SW; x++) for (let y = 0; y < SH; y++) if (full.on(x, y)) { x0 = x; break; }
      x0 = Math.max(0, Math.min(x0 - 3, SW - 44));
      return cropOf(full, [x0, 2, SW - x0, SH - 4]).to(cv);
    }
    if (WEAR_SLOTS.includes(it.slot)) return dressed(cv, 'cid' in ctx ? ctx.cid : 0, ctx.stage || 1, Object.assign(pick(eq, WEAR_SLOTS), { [it.slot]: it.id }), { t: ctx.t });
    if (CABIN_SLOTS.includes(it.slot)) {
      const big = cabin(null, { [it.slot]: it.id }, { only: it.slot, creature: false, t: ctx.t }), reg = REGION[it.slot];
      return reg ? cropOf(big, reg).to(cv) : big.to(cv);
    }
    return null;
  }
  function cropOf(s, [x, y, w, h]) {
    const o = surf(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const k = ((y + j) * s.W + x + i) * 4, q = (j * w + i) * 4; o.d[q] = s.d[k]; o.d[q + 1] = s.d[k + 1]; o.d[q + 2] = s.d[k + 2]; o.d[q + 3] = s.d[k + 3]; }
    return o;
  }
  // ---------- Zib, the robot at the Bazaar counter (26×30) ----------
  function zib(cv, mood, t) {
    t = t || 0;
    const z = surf(26, 30), body = '#5ad1ff', dk = '#2a8fd8', scr = '#14203a', face = '#7ff0ff';
    z.rect(12, 1, 1, 4, '#8a94b8'); z.rect(11, 0, 3, 2, t % 4 < 2 ? '#ff7ad9' : '#ffb0ea');
    z.rect(4, 5, 17, 12, body); z.rect(4, 5, 17, 1, '#bff8ff'); z.rect(4, 16, 17, 1, dk); z.rect(6, 7, 13, 8, scr);
    if (mood === 'hmm') { z.rect(8, 9, 3, 1, face); z.rect(14, 9, 3, 1, face); z.rect(10, 12, 5, 1, face); }
    else if (mood === 'wow') { z.ring(9.5, 10, 1.6, 1.6, 1, face); z.ring(15.5, 10, 1.6, 1.6, 1, face); z.rect(11, 13, 3, 1, face); }
    else { z.set(8, 10, face); z.set(9, 9, face); z.set(10, 10, face); z.set(14, 10, face); z.set(15, 9, face); z.set(16, 10, face); z.rect(10, 12, 5, 1, face); z.set(9, 11, face); z.set(15, 11, face); }
    z.poly([[8, 17], [12, 18.5], [8, 20]], '#ff7ad9'); z.poly([[17, 17], [13, 18.5], [17, 20]], '#ff7ad9'); z.rect(12, 18, 1, 1, '#ffb0ea');
    z.rect(7, 20, 11, 7, '#8a94b8'); z.rect(7, 20, 11, 1, '#c9d0e2'); z.disc(12.5, 23.5, 2, '#ffd23f'); z.set(12, 23, '#fff6c8');
    const wave = mood === 'happy' || mood == null ? (t % 4 < 2 ? -2 : 0) : 0;
    z.rect(3, 20 + wave, 4, 2, '#8a94b8'); z.rect(2, 18 + wave, 2, 3, '#c9d0e2'); z.rect(18, 20, 4, 2, '#8a94b8'); z.rect(21, 21, 2, 3, '#c9d0e2');
    z.outline(INK);
    z.rect(10, 28, 5, 1, t % 2 ? '#ffe066' : '#ff9a3d'); z.rect(11, 29, 3, 1, '#ff9a3d', 0.6);
    return z.to(cv);
  }

  root.CQShopArt = { ship, dressed, card, cabin, thumb, zib, surf, mix, shade, hsl, lum, RAINBOW, REGION, SHIP: [SW, SH], DRESSED: [CW, CH], CABIN: [BW, BH], CARD: KW };
})(typeof self !== 'undefined' ? self : globalThis);
