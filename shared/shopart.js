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
    note: [['.##', '.#.', '##.']], crown2: [['#.#.#', '#####']], spark: [['#']],
    // 7.6
    rocket: [['..#..', '.###.', '.#w#.', '.###.', '##.##'], '#ff5a5a'], alien: [['#...#', '.###.', '#k#k#', '#####', '.#.#.'], '#6fe36f'],
    ghost: [['.###.', '#####', '#k#k#', '#####', '#.#.#'], '#ffffff'], cat: [['#...#', '##.##', '#k#k#', '##w##', '.###.'], '#ffd23f'],
    sun: [['#.#.#', '.###.', '#####', '.###.', '#.#.#'], '#ffb24a'], snow: [['#.#.#', '.###.', '##.##', '.###.', '#.#.#'], '#bff8ff'],
    saturn: [['....##', '.####.', '#####.', '.####.', '##....'], '#ffd23f'], ufo: [['..##..', '.####.', '######', '.#.#.#'], '#7ff0ff'],
    thumb: [['..##.', '..##.', '####.', '#####', '####.'], '#ffd6a8'], dove: [['.##..', '####.', '.####', '..###', '...#.'], '#ffffff'],
    apple: [['..#..', '.#.#.', '#####', '#####', '.###.'], '#ff5a5a'], pizza: [['#####', '.#k#.', '.###.', '..#..'], '#ffd23f'],
    flake: [['#.#', '.#.', '#.#']], coin: [['.##.', '#ww#', '#ww#', '.##.']], petal: [['.#', '##']], bfly: [['#.#', '###', '#.#']],
    confetti: [['#']], dove2: [['##']]
  };
  // 5×5 letters and numbers for the stickers
  const FONT5 = {
    A: ['.###.', '#...#', '#####', '#...#', '#...#'], B: ['####.', '#...#', '####.', '#...#', '####.'], C: ['.####', '#....', '#....', '#....', '.####'],
    D: ['####.', '#...#', '#...#', '#...#', '####.'], E: ['#####', '#....', '####.', '#....', '#####'], F: ['#####', '#....', '####.', '#....', '#....'],
    G: ['.####', '#....', '#..##', '#...#', '.####'], H: ['#...#', '#...#', '#####', '#...#', '#...#'], I: ['#####', '..#..', '..#..', '..#..', '#####'],
    J: ['..###', '...#.', '...#.', '#..#.', '.##..'], K: ['#...#', '#..#.', '###..', '#..#.', '#...#'], L: ['#....', '#....', '#....', '#....', '#####'],
    M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], N: ['#...#', '##..#', '#.#.#', '#..##', '#...#'], O: ['.###.', '#...#', '#...#', '#...#', '.###.'],
    P: ['####.', '#...#', '####.', '#....', '#....'], Q: ['.###.', '#...#', '#.#.#', '#..#.', '.##.#'], R: ['####.', '#...#', '####.', '#..#.', '#...#'],
    S: ['.####', '#....', '.###.', '....#', '####.'], T: ['#####', '..#..', '..#..', '..#..', '..#..'], U: ['#...#', '#...#', '#...#', '#...#', '.###.'],
    V: ['#...#', '#...#', '#...#', '.#.#.', '..#..'], W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'], X: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
    Y: ['#...#', '.#.#.', '..#..', '..#..', '..#..'], Z: ['#####', '...#.', '..#..', '.#...', '#####'],
    0: ['.###.', '#..##', '#.#.#', '##..#', '.###.'], 1: ['..#..', '.##..', '..#..', '..#..', '.###.'], 2: ['####.', '....#', '.###.', '#....', '#####'],
    3: ['####.', '....#', '.###.', '....#', '####.'], 4: ['#..#.', '#..#.', '#####', '...#.', '...#.'], 5: ['#####', '#....', '####.', '....#', '####.'],
    6: ['.###.', '#....', '####.', '#...#', '.###.'], 7: ['#####', '....#', '...#.', '..#..', '..#..'], 8: ['.###.', '#...#', '.###.', '#...#', '.###.'],
    9: ['.###.', '#...#', '.####', '....#', '.###.']
  };
  // 'ch:A' → a letter; 'g:rocket' → a picture; otherwise the 7.4 glyphs
  const glyphOf = k => {
    k = String(k || '');
    if (k.startsWith('ch:')) return [FONT5[k.slice(3)] || FONT5.A, '#ffffff'];
    if (k.startsWith('g:')) return GLYPH[k.slice(2)] || GLYPH.star;
    return GLYPH[k] || GLYPH.star;
  };

  // ---------- the ship ----------
  const SW = 72, SH = 40;
  function halfH(H, u) {
    if (H.form === 'saucer') { const e = 2 * u - 1; return Math.max(0.6, H.m * Math.sqrt(Math.max(0, 1 - e * e)) + (Math.abs(e) < 0.5 ? 0.5 : 0)); }
    if (H.form === 'crystal') { const e = Math.abs(2 * u - 1); return Math.max(0.6, H.m * (1 - e) + 0.4); }
    if (H.form === 'fish') { if (u < 0.22) return Math.max(0.6, H.t * 0.7); const e = 2 * ((u - 0.22) / 0.78) - 1; return Math.max(0.8, H.m * Math.sqrt(Math.max(0, 1 - e * e))); }
    if (H.nose === 'hammer' && u > 0.88) return H.m + 3;
    if (u < 0.35) return H.t + (H.m - H.t) * (u / 0.35);
    const v = (u - 0.35) / 0.65;
    if (H.nose === 'point') return H.m + (0.5 - H.m) * Math.pow(v, 1.25);
    if (H.nose === 'split') return H.m + (0.9 - H.m) * Math.pow(v, 1.05);
    if (H.nose === 'blunt' || H.nose === 'hammer') return v > 0.92 ? Math.max(1, H.n - 1) : H.m + (H.n - H.m) * v;
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
      // 7.6
      case 'belly': return y > cy ? c2 : c1;
      case 'split': return y >= cy ? c2 : c1;
      case 'stripesV': return Math.floor(i / 3) % 2 ? c2 : c1;
      case 'scales': return ((i + (y % 2) * 2) % 4 === 0 && y % 2 === 0) || ((i + 2) % 4 === 0 && y % 2 === 1) ? c2 : c1;
      case 'zebra': return Math.sin(i * 0.7 + Math.sin(y * 0.9) * 1.6) > 0.35 ? c2 : c1;
      case 'tiger': return Math.sin((i + y * 1.3) * 0.75) > 0.55 ? c2 : c1;
      case 'leopard': { const a = (i % 6) - 3, b = ((y + Math.floor(i / 6) * 3) % 6) - 3, d = a * a + b * b; return d >= 2 && d <= 3 ? c2 : d < 2 ? shade(c1, -0.15) : c1; }
      case 'hearts': { const a = i % 6, b = (y - top + (Math.floor(i / 6) % 2) * 3) % 6; return (b === 1 && (a === 1 || a === 3)) || (b === 2 && a >= 1 && a <= 3) || (b === 3 && a === 2) ? c2 : c1; }
      case 'waves': return Math.floor((y + Math.round(Math.sin(i * 0.5) * 1.5) + 40) / 2) % 2 ? c2 : c1;
      case 'flames': return y - top < (Math.sin(i * 0.9) + 1.2) * 1.4 + (1 - i / L) * rows * 0.9 ? c2 : c1;
      case 'marble': return Math.abs(Math.sin(i * 0.35 + Math.sin(y * 0.8 + i * 0.1) * 2)) < 0.12 ? c2 : r() < 0.03 ? shade(c1, -0.06) : c1;
      case 'edge': return y === top + 1 || y === bot - 1 || i === 1 ? c2 : c1;
      case 'circuit': return (y === cy && i % 8 < 5) || (i % 8 === 4 && Math.abs(y - cy) < 3) || (i % 8 === 4 && y === cy - 3) ? c2 : c1;
      case 'hexes': { const row = Math.floor(y / 3), xx = (i + (row % 2) * 3) % 6; return y % 3 === 0 && xx < 4 || xx === 0 ? c2 : c1; }
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
    dragon: [[[0.66, 0], [0.52, 10], [0.44, 7], [0.36, 11], [0.28, 7], [0.16, 10], [0.2, 0]], [[0.6, 0], [0.46, -9], [0.38, -6], [0.28, -10], [0.2, -6], [0.24, 0]]],
    // 7.6
    fins3: [[[0.62, 0], [0.56, 5], [0.52, 0]], [[0.46, 0], [0.4, 6], [0.36, 0]], [[0.3, 0], [0.24, 5], [0.2, 0]]],
    leaf: [[[0.6, 0], [0.5, 4], [0.36, 8], [0.22, 7], [0.26, 3], [0.36, 0]], [[0.52, 0], [0.42, -4], [0.3, -6], [0.24, -3], [0.32, 0]]],
    hex: [[[0.52, 0], [0.48, 3], [0.38, 3], [0.34, 0]], [[0.5, 3], [0.46, 7], [0.36, 7], [0.32, 3], [0.36, 2], [0.46, 2]], [[0.52, 0], [0.48, -3], [0.38, -3], [0.34, 0]]],
    jet: [[[0.6, 0], [0.32, 7], [0.2, 7], [0.3, 0]]]
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
      // 7.6
      case 'neon':
        for (let x = 0; x <= xr; x++) { const y = cy + Math.round(Math.sin((x + off) * 0.18) * 2); s.set(x, y, '#ffffff', 0.5 + 0.5 * fade(x)); s.set(x, y - 1, c, 0.8 * fade(x)); s.set(x, y + 1, c, 0.8 * fade(x)); s.set(x, y - 2, c, 0.25 * fade(x)); s.set(x, y + 2, c, 0.25 * fade(x)); }
        return;
      case 'dotted':
        for (let x = (off % 4); x <= xr; x += 4) s.rect(x, cy - 1, 2, 2, c, 0.3 + 0.7 * fade(x));
        return;
      case 'zap': {
        let y = cy;
        for (let x = xr; x >= 0; x -= 3) { const ny = cy + Math.round((r() - 0.5) * 8); s.line(x, y, Math.max(0, x - 3), ny, c, 0.4 + 0.6 * fade(x)); s.set(x, y, '#ffffff', fade(x)); y = ny; }
        return;
      }
      case 'smoke':
        for (let k = 0; k < 9; k++) { const x = Math.floor((r() * (xr + 12) + off) % (xr + 1)), y = cy - 3 + Math.floor(r() * 6), rr = 1 + (1 - fade(x)) * 2.5; s.disc(x, y, rr, k % 2 ? '#9aa0ac' : '#c9d0e2', 0.25 + 0.4 * fade(x)); }
        return;
      case 'rings':
        for (let k = 0; k < 5; k++) { const x = xr - ((k * 9 + off) % (xr + 1)); s.ring(x, cy, 1.6, 2 + (1 - fade(x)) * 4, 1, c, 0.3 + 0.6 * fade(x)); }
        return;
      case 'confetti':
        for (let k = 0; k < 26; k++) { const x = Math.floor((r() * (xr + 10) + off) % (xr + 1)), y = cy - 7 + Math.floor(r() * 14); s.rect(x, y, 1 + (k % 2), 1, RAINBOW[k % 6], 0.5 + 0.5 * fade(x)); }
        return;
      default: {
        const g = { dots: 'spark', bubbles: null, hearts: 'heart3', stars: 'plus', ice: 'dia', leaves: 'leaf2', notes: 'note', pixels: null, crown: 'crown2', snow: 'flake', coins: 'coin', petals: 'petal', butterflies: 'bfly' }[A.style];
        const n = A.style === 'dots' ? 22 : A.style === 'pixels' ? 12 : 7;
        for (let k = 0; k < n; k++) {
          const x = Math.floor((r() * (xr + 10) + off) % (xr + 1)), y = cy - 6 + Math.floor(r() * 12), a = 0.35 + 0.65 * fade(x);
          if (A.style === 'bubbles') { s.ring(x, y, 2, 2, 1, c, a); s.set(x - 1, y - 1, '#ffffff', a); continue; }
          if (A.style === 'pixels') { s.rect(x, y, 2, 2, ['#5ad1ff', '#ff7ad9', '#ffe066'][k % 3], a); continue; }
          const col = A.style === 'leaves' ? (k % 2 ? '#6fe36f' : '#3f9a4e') : A.style === 'ice' && k % 2 ? '#ffffff' : A.style === 'butterflies' ? ['#ffb24a', '#ff7ad9', '#7ff0ff'][k % 3] : A.style === 'petals' && k % 2 ? '#ffffff' : c;
          s.glyph(glyphOf(g)[0], x, y, { '#': col, w: '#fff6c8' }, a);
        }
      }
    }
  }
  function flame(s, xr, y, h, len, glow, t, E) {
    E = E || {};
    const r = rng(t * 977 + y * 13 + 5), yc = y + h / 2;
    for (let j = 0; j < len; j++) {
      const half = (h / 2) * Math.pow(1 - j / len, 0.8), x = xr - j;
      for (let yy = Math.floor(yc - half); yy < yc + half; yy++) {
        const dy = Math.abs(yy + 0.5 - yc);
        if (j > len * 0.6 && r() < 0.25) continue;
        let col = dy < half * 0.35 && j < len * 0.5 ? '#ffffff' : dy < half * 0.7 ? mix(glow, '#ffffff', 0.45) : glow;
        if (E.rainbow && col !== '#ffffff') col = RAINBOW[Math.min(5, Math.floor(((yy - (yc - h / 2)) / Math.max(1, h)) * 6))];
        s.set(x, yy, col, (1 - 0.55 * (j / len)) * (E.ghost ? 0.55 : 1));
      }
    }
  }

  // ---------- 7.8: hulls with their own silhouette ----------
  // prof(u, H) → [up, down] in pixels from the middle line (u: 0 the tail … 1 the nose);
  // tint(u, y, colour, k) → another colour; back / body / front draw the extra parts.
  const eLL = (u, a, b, r) => r * Math.sqrt(Math.max(0, 1 - ((u - a) / b) ** 2));
  const FORMS = {
    paperplane: {
      prof: u => [u > 0.94 ? 0.6 : 1.2, u > 0.94 ? 0.6 : 1 + 6.5 * (1 - u) * Math.min(1, u / 0.1)],
      back: k => k.back.poly([[k.X(0.04), k.cy - 1], [k.X(0.78), k.cy - 1], [k.X(-0.02), k.cy - 8]], (x, y) => (y < k.cy - 4 ? shade(k.P.c1, -0.06) : shade(k.P.c1, -0.16))),
      body: k => { for (let i = 2; i < k.L - 2; i++) k.hl.set(k.x0 + i, k.cy + 1, shade(k.P.c1, -0.22)); for (let i = 3; i < k.L * 0.7; i += 4) k.hl.set(k.x0 + i, k.cy + 3, k.P.c2); }
    },
    pencil: {
      prof: u => { const r = u > 0.8 ? 3.4 * (1 - (u - 0.8) / 0.2) + 0.5 : 3.4; return [r, r]; },
      tint: (u, y, c, k) => (u > 0.95 ? '#3a3a48' : u > 0.8 ? (y < k.cy ? '#f6dcae' : '#e0bf8a') : u < 0.09 ? '#ff9ac2' : u < 0.16 ? (Math.round(u * 100) % 2 ? '#c9d0e2' : '#9aa6c8') : y === k.cy + 1 ? shade(c, -0.18) : null)
    },
    bus: {
      prof: u => [u > 0.93 ? 4.5 : 6.5, 4],
      tint: (u, y, c, k) => (y === k.cy + 1 ? '#1d1f2e' : null),
      body: k => { for (let i = 3; i < k.L - 6; i += 5) { k.hl.rect(k.x0 + i, k.cy - 5, 4, 4, '#bff8ff'); k.hl.set(k.x0 + i, k.cy - 5, '#ffffff'); } k.hl.rect(k.x0 + k.L - 4, k.cy - 5, 3, 5, '#7ff0ff'); k.hl.set(k.x0 + k.L - 1, k.cy + 2, '#fff3a0'); k.hl.set(k.x0, k.cy + 2, '#ff5a5a'); },
      front: k => [0.2, 0.76].forEach(u => { k.fr.disc(k.X(u), k.cy + 5, 2.6, '#2a2e3d'); k.fr.set(k.X(u), k.cy + 5, '#c9d0e2'); })
    },
    train: {
      prof: u => (u < 0.34 ? [8.5, 4] : u > 0.93 ? [3, 4] : [4, 4]),
      tint: (u, y, c, k) => (u < 0.34 && y < k.cy - 6 ? k.P.c2 : y === k.cy + 2 ? k.P.c2 : null),
      back: k => { k.back.rect(k.X(0.78), k.cy - 9, 3, 6, '#3a4766'); k.back.rect(k.X(0.78) - 1, k.cy - 10, 5, 2, '#566079'); k.back.ell(k.X(0.56), k.cy - 4, 2.4, 2.6, k.P.c2); for (let j = 0; j < 3; j++) k.s.disc(k.X(0.78) - 2 - j * 4 - (k.t % 3), k.cy - 12 - j * 2, 1.6 + j * 0.7, '#e8ecf8', 0.55 - j * 0.14); k.back.poly([[k.X(0.98), k.cy + 1], [k.X(1.08), k.cy + 4], [k.X(0.98), k.cy + 4]], '#566079'); },
      body: k => { k.hl.rect(k.X(0.08), k.cy - 6, 6, 4, '#bff8ff'); k.hl.set(k.X(0.08), k.cy - 6, '#ffffff'); k.hl.set(k.x0 + k.L - 1, k.cy - 1, '#fff3a0'); },
      front: k => { [0.14, 0.42, 0.62, 0.82].forEach((u, i) => { k.fr.disc(k.X(u), k.cy + 5, i ? 2.2 : 2.8, '#2a2e3d'); k.fr.set(k.X(u), k.cy + 5, '#ffd23f'); }); k.fr.line(k.X(0.42), k.cy + 5, k.X(0.82), k.cy + 5, '#c9d0e2'); }
    },
    galleon: {
      prof: u => [u < 0.2 ? 5 : u > 0.86 ? 3.5 : 2, 2 + 5 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.05)), 0.6)],
      tint: (u, y, c, k) => (y === k.cy - 1 ? k.P.c2 : (y - k.cy) % 3 === 2 ? shade(c, -0.14) : null),
      back: k => {
        [[0.34, 15], [0.62, 13]].forEach(([u, h], i) => {
          const x = k.X(u); k.back.rect(x, k.cy - h, 1, h, '#8a5a34');
          k.back.poly([[x - 5, k.cy - h + 2], [x + 6, k.cy - h + 2], [x + 8 + (k.t % 4 < 2 ? 1 : 0), k.cy - h / 2], [x + 6, k.cy - 3], [x - 5, k.cy - 3]], (px, py) => (py % 4 === 0 ? shade(k.P.c2, -0.1) : k.P.c2));
          if (!i) { k.back.rect(x + 1, k.cy - h - 3, 4, 2, '#e5484d'); k.back.rect(x, k.cy - h - 3, 1, 3, '#8a5a34'); }
        });
        k.back.line(k.X(0.9), k.cy - 3, k.X(1.12), k.cy - 6, '#8a5a34');
      },
      body: k => { for (let i = 5; i < k.L - 6; i += 5) k.hl.rect(k.x0 + i, k.cy + 2, 2, 2, '#1d1f2e'); k.hl.rect(k.X(0.04), k.cy - 3, 3, 2, '#fff3a0'); }
    },
    duck: {
      prof: u => (u < 0.1 ? [5.5 - u * 20, 1] : [Math.max(0.8, eLL(u, 0.5, 0.5, 5)), Math.max(0.8, eLL(u, 0.5, 0.5, 6))]),
      back: k => k.back.poly([[k.X(0.98), k.cy - 9], [k.X(1.2), k.cy - 8], [k.X(0.98), k.cy - 6]], '#ff9a3d'),
      body: k => { const hx = k.X(0.8), hy = k.cy - 8; k.hl.disc(hx, hy, 4.8, (x, y) => (y < hy - 2 ? shade(k.P.c1, 0.25) : k.P.c1)); k.hl.rect(hx + 1, hy - 2, 2, 2, '#ffffff'); k.hl.set(hx + 2, hy - 1, INK); k.hl.ell(k.X(0.42), k.cy, 5, 3, shade(k.P.c1, -0.14)); k.hl.ell(k.X(0.4), k.cy - 1, 4, 2, shade(k.P.c1, -0.04)); }
    },
    turtle: {
      prof: u => [u > 0.04 && u < 0.86 ? Math.max(1, eLL(u, 0.45, 0.42, 8.5)) : 1, 2.5],
      tint: (u, y, c, k) => (y > k.cy ? '#f2e2a8' : y === k.cy ? shade(c, -0.4) : null),
      back: k => { const g = '#8fd35a', gd = '#5fa83a'; k.back.disc(k.X(0.97), k.cy - 1, 3.4, g); k.back.set(k.X(0.97) + 1, k.cy - 2, INK); k.back.set(k.X(0.97) + 2, k.cy, gd); [[0.2, 1], [0.68, -1]].forEach(([u, d]) => k.back.poly([[k.X(u), k.cy + 2], [k.X(u) + 5, k.cy + 2], [k.X(u) + 2 + d * ((k.t >> 1) % 2), k.cy + 7]], g)); k.back.poly([[k.X(0.02), k.cy], [k.X(-0.08), k.cy + 2], [k.X(0.02), k.cy + 2]], g); }
    },
    snail: {
      prof: u => [u > 0.82 ? 5.5 : 1.5, 2.5],
      tint: (u, y, c, k) => (y > k.cy + 1 ? '#ffe9c8' : '#ffd6a8'),
      back: k => { const x = k.X(0.92); k.back.line(x, k.cy - 5, x - 1, k.cy - 10, '#ffd6a8'); k.back.line(x + 3, k.cy - 5, x + 4, k.cy - 10, '#ffd6a8'); k.back.disc(x - 1, k.cy - 11, 1.2, '#ffffff'); k.back.disc(x + 4, k.cy - 11, 1.2, '#ffffff'); k.back.set(x - 1, k.cy - 11, INK); k.back.set(x + 4, k.cy - 11, INK); },
      body: k => { const sx = k.X(0.38), sy = k.cy - 6.5; k.hl.disc(sx, sy, 8, (x, y) => k.paint(x, y, sy - 8, sy + 8)); for (let a = 0; a < 44; a++) { const th = a * 0.42, rr = 0.6 + a * 0.16; k.hl.set(sx + Math.cos(th) * rr, sy + Math.sin(th) * rr, shade(k.P.c2, -0.1)); } k.hl.set(k.x0 + k.L - 2, k.cy, '#c2459c'); }
    },
    zeppelin: {
      prof: u => { const r = Math.max(0.8, 7.5 * Math.pow(Math.max(0, 1 - (2 * u - 1) ** 2), 0.42)); return [r, r]; },
      tint: (u, y, c, k) => (Math.round(u * (k.L - 1)) % 7 === 3 ? shade(c, -0.12) : null),
      back: k => { k.back.poly([[k.X(0.02), k.cy - 2], [k.X(0.2), k.cy - 5], [k.X(0.02), k.cy - 11]], k.P.c2); k.back.poly([[k.X(0.02), k.cy + 2], [k.X(0.2), k.cy + 5], [k.X(0.02), k.cy + 11]], k.P.c2); },
      front: k => { const gx = k.X(0.42), gy = k.cy + 8; k.fr.rect(gx, gy, 9, 3, '#8a5a34'); k.fr.rect(gx, gy, 9, 1, '#c98a4a'); [1, 4, 7].forEach(d => k.fr.set(gx + d, gy + 1, '#fff3a0')); k.fr.rect(gx + 2, gy - 1, 1, 1, '#566079'); k.fr.rect(gx + 6, gy - 1, 1, 1, '#566079'); }
    },
    carrot: {
      prof: u => { const r = 0.7 + 6 * Math.pow(1 - u, 0.75) * Math.min(1, 0.5 + u * 8); return [r, r]; },
      tint: (u, y, c, k) => ((Math.round(u * (k.L - 1)) * 3 + y * 5) % 17 === 0 ? shade(c, -0.2) : null),
      back: k => { ['#3f9a4e', '#6fe36f', '#3f9a4e'].forEach((g, i) => { const a = -2.2 + i * 0.5; for (let q = 0; q < 9; q++) { k.back.set(k.X(0.04) + Math.cos(a) * q, k.cy + Math.sin(a) * q * 1.1 - 3, g); k.back.set(k.X(0.04) + Math.cos(a) * q + 1, k.cy + Math.sin(a) * q * 1.1 - 3, g); } }); }
    },
    banana: {
      prof: u => { const e = (2 * u - 1) ** 2, off = 2.5 - 4.5 * e, t = Math.max(2.4, 3.4 * Math.sqrt(1 - e * 0.8)); return [t - off, t + off]; },
      tint: (u, y, c, k) => (u < 0.05 || u > 0.96 ? '#6a4a20' : null)
    },
    guitar: {
      prof: u => { const r = Math.max(u > 0.9 ? 2.4 : 1.3, eLL(u, 0.13, 0.14, 7.5), eLL(u, 0.32, 0.12, 5.5)); return [r, r]; },
      tint: (u, y, c, k) => (u > 0.42 ? (u > 0.9 ? '#2a2a40' : '#6a4a30') : null),
      body: k => { k.hl.disc(k.X(0.24), k.cy, 2.4, '#1d1f2e'); k.hl.rect(k.X(0.07), k.cy - 2, 2, 5, '#2a2a40'); for (let i = Math.round(k.L * 0.08); i < k.L - 2; i += 1) if (i % 2) k.hl.set(k.x0 + i, k.cy, '#e8ecf8', 0.75); [0.92, 0.97].forEach(u => { k.hl.set(k.X(u), k.cy - 2, '#ffd23f'); k.hl.set(k.X(u), k.cy + 2, '#ffd23f'); }); }
    },
    teapot: {
      prof: u => { const r = u > 0.03 && u < 0.87 ? Math.max(1, eLL(u, 0.45, 0.42, 7.5)) : 1; return [r, r]; },
      tint: (u, y, c, k) => (y === k.cy - 3 || y === k.cy - 4 ? k.P.c2 : null),
      back: k => { k.back.ring(k.X(0.04), k.cy, 5, 5.5, 2, k.P.c1); k.back.poly([[k.X(0.78), k.cy + 1], [k.X(1.1), k.cy - 6], [k.X(1.2), k.cy - 4], [k.X(0.86), k.cy + 5]], k.P.c1); k.back.ell(k.X(0.45), k.cy - 8, 4, 1.6, k.P.c2); k.back.disc(k.X(0.45), k.cy - 10, 1.6, k.P.c2); for (let j = 0; j < 3; j++) k.s.disc(k.X(1.18) + j * 2, k.cy - 8 - j * 3 - (k.t % 3), 1.2 + j * 0.5, '#ffffff', 0.5 - j * 0.14); },
      body: k => { [[0.3, -1], [0.56, 1], [0.44, 3]].forEach(([u, d]) => k.hl.glyph(GLYPH.heart3[0], k.X(u), k.cy + d, { '#': k.P.c2 })); }
    },
    sneaker: {
      prof: u => [u < 0.3 ? 8 : Math.max(2, 8 - 6 * Math.pow((u - 0.3) / 0.7, 0.65)) - (u > 0.96 ? 1 : 0), 4],
      tint: (u, y, c, k) => (y > k.cy + 1 ? (y === k.cy + 3 ? '#c9d0e2' : '#ffffff') : u > 0.86 ? '#ffffff' : u < 0.3 && y < k.cy - 6 ? k.P.c2 : null),
      body: k => { for (let j = 0; j < 4; j++) { const x = k.X(0.38 + j * 0.1), y = k.cy - 6 + j * 1.4; k.hl.line(x, y, x + 2, y + 2, '#ffffff'); } k.hl.glyph(GLYPH.star[0], k.X(0.1), k.cy - 3, { '#': k.P.c2 }); }
    },
    cat: {
      prof: u => { const r = u > 0.05 && u < 0.74 ? Math.max(1, Math.min(4.5, eLL(u, 0.4, 0.36, 6))) : 1; return [r, r]; },
      back: k => { let x = k.X(0.06), y = k.cy; for (let q = 0; q < 11; q++) { k.back.rect(x, y, 2, 2, q > 8 ? k.P.c2 : k.P.c1); x -= q < 4 ? 1 : 0.3; y -= q < 3 ? 0 : 1; } [[0.3, 0], [0.56, 1]].forEach(([u, d]) => k.back.rect(k.X(u), k.cy + 3, 3, 3 + ((k.t >> 1) + d) % 2, k.P.c2)); },
      body: k => { const hx = k.X(0.84), hy = k.cy - 3; k.hl.poly([[hx - 5, hy - 2], [hx - 4, hy - 8], [hx - 1, hy - 4]], k.P.c1); k.hl.poly([[hx + 1, hy - 4], [hx + 4, hy - 8], [hx + 5, hy - 2]], k.P.c1); k.hl.set(hx - 3, hy - 5, '#ff9ad8'); k.hl.set(hx + 3, hy - 5, '#ff9ad8'); k.hl.disc(hx, hy, 5.4, k.P.c1); k.hl.rect(hx - 3, hy - 1, 2, 2, '#ffffff'); k.hl.rect(hx + 2, hy - 1, 2, 2, '#ffffff'); k.hl.set(hx - 2, hy, INK); k.hl.set(hx + 3, hy, INK); k.hl.set(hx, hy + 2, '#ff7ad9'); k.hl.line(hx + 4, hy + 2, hx + 7, hy + 1, '#ffffff'); k.hl.line(hx + 4, hy + 3, hx + 7, hy + 4, '#ffffff'); }
    },
    key: {
      prof: u => (u < 0.3 ? [0, 0] : [1.6, 1.6]),
      body: k => { const cx = k.X(0.15), R = 6.5; k.hl.ring(cx, k.cy, R, R, 2.6, k.P.c1); for (let y = k.cy - 7; y <= k.cy + 7; y++) for (let x = Math.floor(cx - 7); x <= cx + 7; x++) if (k.hl.on(x, y)) k.hl.set(x, y, k.paint(x, y, k.cy - 7, k.cy + 7)); [0.72, 0.84, 0.94].forEach((u, i) => k.hl.rect(k.X(u), k.cy + 2, 2, 3 + (i % 2) * 2, k.P.c1)); k.hl.disc(cx, k.cy - 5, 1, '#ffffff', 0.8); }
    },
    star: {
      prof: () => [0, 0],
      body: k => { const cx = k.X(0.5), R = 11, pts = []; for (let q = 0; q < 10; q++) { const a = (q * Math.PI) / 5, rr = q % 2 ? 4.8 : R; pts.push([cx + Math.cos(a) * rr * 1.08, k.cy + Math.sin(a) * rr]); } k.hl.poly(pts, (x, y) => k.paint(x, y, k.cy - R, k.cy + R)); k.hl.disc(cx + 0.5, k.cy, 3, '#7ff0ff'); k.hl.disc(cx, k.cy - 0.5, 1.6, '#bff8ff'); k.hl.set(cx - 1, k.cy - 1, '#ffffff'); }
    },
    heart: {
      prof: () => [0, 0],
      body: k => { const cx = k.X(0.5), R = 9.5; for (let y = k.cy - 12; y <= k.cy + 12; y++) for (let x = Math.floor(cx - 14); x <= cx + 14; x++) { const hx = (x + 0.5 - cx) / R, hy = -(y + 0.5 - k.cy) / R + 0.15; if ((hx * hx + hy * hy - 1) ** 3 - hx * hx * hy ** 3 < 0) k.hl.set(x, y, k.paint(x, y, k.cy - 11, k.cy + 10)); } k.hl.disc(cx - 4, k.cy - 5, 1.6, '#ffffff', 0.7); k.hl.disc(cx + 0.5, k.cy + 1, 2.6, '#7ff0ff'); k.hl.set(cx - 1, k.cy, '#ffffff'); }
    },
    burger: {
      prof: u => { const r = Math.max(1, 6.5 * Math.pow(Math.max(0, 1 - (2 * u - 1) ** 2), 0.3)); return [r, Math.min(r, 5.5)]; },
      tint: (u, y, c, k) => { const d = y - k.cy; return d === -1 ? ((Math.round(u * 40) % 3) ? '#6fe36f' : '#3f9a4e') : d === 0 || d === 1 ? '#7a4a2a' : d === 2 ? '#ffd23f' : d === -2 && Math.round(u * 40) % 5 === 0 ? '#e5484d' : null; },
      body: k => { for (let i = 4; i < k.L - 4; i += 3) k.hl.set(k.x0 + i, k.cy - 4 - (i % 2), '#fff6c8'); }
    },
    drill: {
      prof: u => (u > 0.62 ? (() => { const r = 0.6 + 6 * (1 - (u - 0.62) / 0.38); return [r, r]; })() : [6, 5]),
      tint: (u, y, c, k) => (u > 0.62 ? ((Math.round(u * (k.L - 1)) + (y - k.cy) + 40 + k.t) % 4 < 2 ? '#c9d0e2' : '#8a94b8') : null),
      body: k => { k.hl.rect(k.X(0.3), k.cy - 4, 5, 4, '#bff8ff'); k.hl.set(k.X(0.3), k.cy - 4, '#ffffff'); k.hl.rect(k.X(0.58), k.cy - 6, 2, 11, '#566079'); },
      front: k => { k.fr.rect(k.X(0.02), k.cy + 5, k.L * 0.56, 3, '#2a2e3d'); for (let i = 1; i < k.L * 0.56; i += 3) k.fr.set(k.X(0.02) + i + (k.t % 3), k.cy + 6, '#8a94b8'); }
    }
  };

  // which paint the ship wears: a bought paint, or else the hull's own factory colours
  function paintOf(eq, H) {
    const pe = item(eq && eq.paint), st = SD().STARTER.paint;
    if (pe && pe.id !== st) return pe.art;
    return H.paint || part(eq, 'paint').art;
  }
  function ship(cv, eq, o) {
    o = o || {};
    const t = o.t || 0, H = part(eq, 'hull').art, Wg = part(eq, 'wing').art, E = part(eq, 'engine').art, P = paintOf(eq, H);
    const dec = item(eq && eq.decal), tr = item(eq && eq.trail);
    const s = surf(SW, SH), L = H.len, cy = 20, x0 = SW - L - 4;
    const twin = H.form === 'twin', mids = twin ? [cy - 4, cy + 4] : [cy];
    const FM = FORMS[H.form] || null;
    const cols = mids.map(m => { const c = []; for (let i = 0; i < L; i++) { if (FM) { const [up, dn] = FM.prof(i / (L - 1), H); c.push([Math.round(m - up), Math.round(m + dn) - 1]); } else { const h = halfH(H, i / (L - 1)); c.push([Math.round(m - h), Math.round(m + h) - 1]); } } return c; });
    const col = cols[0];
    const topAt = i => Math.min(...cols.map(c => c[Math.max(0, Math.min(L - 1, i))][0]));
    const botAt = i => Math.max(...cols.map(c => c[Math.max(0, Math.min(L - 1, i))][1]));
    const ink = mix(shade(P.c1, -0.7), INK, 0.5);
    // engine nozzles, flames and the trail (behind)
    const ny = E.n, nh = Math.max(2, E.size * 2 - (ny > 1 ? 1 : 0)), totalH = ny * nh + (ny - 1);
    const ys = [];
    if (twin) mids.forEach(m => ys.push(Math.round(m - nh / 2)));
    else for (let k = 0; k < ny; k++) ys.push(Math.round(cy - totalH / 2 + k * (nh + 1)));
    const ex = x0 - 3, fl = E.size * 2 + 4 + (t % 3 === 1 ? 1 : 0);
    if (tr) trail(s, tr.art, ex - fl - 1, cy, t);
    if (E.warp) for (let k = 0; k < 7; k++) { const yy = cy - 9 + k * 3, len = 6 + ((k * 7 + t * 3) % 11); s.line(ex - fl - len, yy, ex - fl - 1, yy, '#ffffff', 0.45); }
    if (E.hearts || E.stars) for (let k = 0; k < 4; k++) {
      const x = ex - fl - 3 - ((k * 7 + t * 2) % 20), y = cy - 5 + ((k * 5) % 9), a = 0.5 + 0.5 * (x / Math.max(1, ex));
      s.glyph(E.hearts ? GLYPH.heart3[0] : GLYPH.plus[0], x, y, { '#': E.hearts ? (k % 2 ? '#ff9ad8' : E.glow) : (k % 2 ? '#fff6c8' : E.glow) }, a);
    }
    ys.forEach(y => flame(s, ex - 1, y, nh, fl, E.glow, t, E));
    if (E.ring) s.ring(ex - Math.round(fl / 2), cy, 2.5, totalH / 2 + 3, 1, E.glow, 0.85);
    if (E.pulse) [3, 6].forEach(k => s.ring(ex - fl / 2, cy, k + (t % 2), k + 2 + (t % 2), 1, '#ffffff', 0.35));
    const eng = surf(SW, SH);
    ys.forEach(y => {
      eng.rect(ex, y, 3, nh, '#8a94b8'); eng.rect(ex, y, 3, 1, '#c9d0e2'); eng.rect(ex, y + nh - 1, 3, 1, '#566079');
      if (E.bell) { eng.rect(ex - 1, y - 1, 1, nh + 2, '#a8b0c8'); eng.rect(ex - 2, y - 2, 1, nh + 4, '#8a94b8'); }
    });
    if (E.solar) { eng.rect(x0 + 2, col[2][0] - 6, 8, 3, '#2a3f8a'); for (let k = 0; k < 8; k += 2) eng.set(x0 + 2 + k, col[2][0] - 5, '#5ab4ff'); eng.rect(x0 + 5, col[2][0] - 3, 1, 3, '#8a94b8'); }
    eng.outline(ink); s.blit(eng, 0, 0);
    // wings (behind the hull)
    const wl = surf(SW, SH), wc = Wg.col || mix(P.c1, P.c2, 0.5), extra = Math.max(0, H.m - 4) + (twin ? 4 : 0);
    const WP = pts => pts.map(([u, dy]) => [x0 + u * L, cy + (dy > 0 ? dy + extra : dy < 0 ? dy - extra : 0)]);
    const wFill = (x, y) => (y > cy + extra + 4 ? shade(wc, -0.18) : wc);
    const wx = x0 + L * 0.4, wb = cy + extra, wt = cy - extra;
    let glass = null;
    switch (Wg.shape) {
      case 'ring': wl.ring(x0 + L * 0.45, cy, 4, H.m + 4, 2, wc, 1, 'back'); break;
      case 'butterfly': wl.ell(x0 + L * 0.38, wb + 6, 5, 4, wc); wl.ell(x0 + L * 0.38, wt - 6, 4, 3, shade(wc, 0.15)); wl.disc(x0 + L * 0.36, wb + 6, 1.5, P.c1); wl.disc(x0 + L * 0.42, wt - 6, 1, '#ffffff'); break;
      case 'star': wl.poly(starPts(x0 + L * 0.36, wb + 5, 6.5, 2.8, 5), wFill); break;
      case 'solar':
        [[wb + 3, 1], [wt - 3, -1]].forEach(([y, d]) => {
          wl.rect(wx, Math.min(y, cy), 1, Math.abs(y - cy) + 1, '#8a94b8');
          const py = d > 0 ? y : y - 4;
          wl.rect(wx - 7, py, 15, 5, wc);
          for (let i = 0; i < 15; i += 3) wl.rect(wx - 7 + i, py, 1, 5, shade(wc, -0.35));
          wl.rect(wx - 7, py + 2, 15, 1, shade(wc, -0.35));
          for (let i = 1; i < 15; i += 3) wl.set(wx - 7 + i, py + 1, '#9ad0ff');
        });
        break;
      case 'insect':
        glass = surf(SW, SH);
        [[wb + 4, 0.9], [wt - 4, 0.75]].forEach(([y, k]) => {
          glass.ell(wx - 4, y, 9 * k, 2.6, (x, yy) => (Math.abs(yy - y) < 0.5 || (x + yy) % 5 === 0 ? shade(wc, -0.3) : wc), 0.55);
          glass.ell(wx - 7, y + (y > cy ? 3 : -3), 7 * k, 2, wc, 0.45);
        });
        break;
      case 'arc': {
        const R = 8 + extra, cx = wx - 1;
        const outer = [], inner = [];
        for (let k = 0; k <= 12; k++) { const a = Math.PI * (0.1 + 0.8 * (k / 12)); outer.push([cx + Math.cos(a) * R * 1.2, cy + Math.sin(a) * R]); inner.push([cx + Math.cos(a) * (R - 3) * 1.2, cy - 2 + Math.sin(a) * (R - 3)]); }
        wl.poly(outer.concat(inner.reverse()), wFill);
        break;
      }
      case 'cloud':
        [[wb + 4, 1], [wt - 3, 0.75]].forEach(([y, k]) => {
          [[-6, 0, 3], [-1, 1, 3.6], [4, 0, 3], [-3, -2, 2.6]].forEach(([dx, dy, r]) => wl.disc(wx + dx * k, y + dy * (y > cy ? 1 : -1), r * k, (x, yy) => (yy > y + 1 ? '#d8e6ff' : '#ffffff')));
        });
        break;
      case 'jet':
        WINGS.jet.forEach(p => wl.poly(WP(p), wFill));
        WINGS.jet.forEach(p => wl.poly(WP(p.map(([u, dy]) => [u, -dy])), (x, y) => shade(wc, 0.12)));
        [[wb + 6, 1], [wt - 6, -1]].forEach(([y]) => { wl.rect(x0 + L * 0.2, y - 1, 6, 3, '#8a94b8'); wl.rect(x0 + L * 0.2, y - 1, 6, 1, '#c9d0e2'); flame(s, x0 + L * 0.2 - 1, y - 1, 3, 4 + (t % 2), E.glow, t); });
        break;
      default: (WINGS[Wg.shape] || WINGS.basic).forEach(p => wl.poly(WP(p), wFill));
    }
    if (Wg.shape === 'leaf') for (let k = 0; k < 8; k++) { wl.set(x0 + L * (0.5 - k * 0.03), wb + 1 + k * 0.7, shade(wc, -0.3)); wl.set(x0 + L * (0.44 - k * 0.025), wt - 1 - k * 0.6, shade(wc, -0.3)); }
    wl.outline(ink); s.blit(wl, 0, 0);
    if (glass) { glass.outline(shade(wc, -0.4), 0.8); s.blit(glass, 0, 0); }
    // things behind the hull
    const back = surf(SW, SH);
    if (H.form === 'ring') back.ring(x0 + L * 0.5, cy, 3.5, H.m + 6, 2, P.c2, 1, 'back');
    if (H.form === 'fish') back.poly([[x0 + L * 0.24, cy], [x0 - 1, cy - H.m - 2], [x0 + 2, cy], [x0 - 1, cy + H.m + 2]], (x, y) => (Math.abs(y - cy) > H.m ? shade(P.c2, -0.1) : P.c2));
    if (twin) back.rect(x0 + L * 0.3, cy - 3, L * 0.35, 6, '#8a94b8');
    if (H.antenna) { const ax = x0 + Math.round(L * 0.3), at = topAt(Math.round(L * 0.3)); back.rect(ax, at - 5, 1, 5, '#8a94b8'); back.disc(ax + 0.5, at - 6, 1.3, t % 4 < 2 ? '#ff5a5a' : '#ffb0b0'); }
    if (H.spikes) for (let i = Math.round(L * 0.15); i < L * 0.78; i += 4) { const tp = topAt(i); back.poly([[x0 + i, tp + 1], [x0 + i + 1.5, tp - 3], [x0 + i + 3, tp + 1]], shade(P.c2, 0.1)); }
    if (H.puffs) for (let i = 2; i < L - 3; i += 5) { back.disc(x0 + i + 1, topAt(i) + 0.5, 2.2, '#ffffff'); back.disc(x0 + i + 3, botAt(i + 2) + 0.5, 2.2, '#e0ecff'); }
    if (H.form === 'rocket') { const i0 = Math.round(L * 0.04), f = H.fin; back.poly([[x0 + i0, botAt(i0)], [x0 + i0 + f + 2, botAt(i0 + f)], [x0 + i0 - 1, botAt(i0) + f]], P.c2); }
    const fr = surf(SW, SH), hl = surf(SW, SH), r = rng(hash(P.pattern + P.c1));
    const K = { s, back, hl, fr, x0, L, cy, P, t, H, E, X: u => x0 + u * L, topAt, botAt, paint: (x, y, top, bot) => paintAt(P, Math.round(x - x0), y, L, cy, top, bot, r) };
    if (FM && FM.back) FM.back(K);
    back.outline(ink); s.blit(back, 0, 0);
    // the hull
    cols.forEach((cc, hi) => {
      const m = mids[hi];
      for (let i = 0; i < L; i++) {
        const [top, bot] = cc[i], u = i / (L - 1);
        for (let y = top; y <= bot; y++) {
          if (H.nose === 'split' && u > 0.8 && bot - top >= 3 && (y === m || y === m - 1)) continue;
          let c = paintAt(P, i, y - m + cy, L, cy, top - m + cy, bot - m + cy, r);
          if (H.form === 'rocket' && u > 0.86) c = P.c2;
          if (FM && FM.tint) c = FM.tint(u, y, c, K) || c;
          if (H.form === 'crystal') c = shade(c, (i + (y - m) * 2) % 6 < 3 ? 0.18 : -0.08);
          if (y === top) c = shade(c, 0.35); else if (y === bot) c = shade(c, -0.35); else if (y === bot - 1 && bot - top > 4) c = shade(c, -0.15);
          hl.set(x0 + i, y, c);
        }
      }
    });
    if (H.form === 'crystal') for (let i = 2; i < L - 2; i++) hl.set(x0 + i, cy, '#ffffff', 0.45);
    if (H.form === 'saucer') for (let i = 3; i < L - 3; i += 3) hl.set(x0 + i, cy + 1, (i + t) % 2 ? '#ffe066' : '#7ff0ff');
    if (H.gold) for (let i = 2; i < L - 3; i++) hl.set(x0 + i, cy - 1, i % 4 ? '#ffd23f' : '#fff6c8');
    if (H.holes) for (let k = 0; k < H.holes; k++) { const hx = x0 + Math.round(L * (0.28 + k * 0.13)); hl.rect(hx, cy - 1, 2, 2, '#3aa8d8'); hl.set(hx, cy - 1, '#bff8ff'); }
    // tail fin
    if (FM && FM.body) FM.body(K);
    const f = H.fin, i0 = Math.round(L * 0.05);
    if (f && H.form !== 'fish') for (let j = 0; j <= f + 2; j++) { const hh = Math.round(f * (1 - j / (f + 2))), top = col[Math.min(L - 1, i0 + j)][0]; for (let k = 1; k <= hh; k++) hl.set(x0 + i0 + j, top - k, k === hh ? shade(P.c2, 0.3) : P.c2); }
    if (H.form === 'fish') { hl.disc(x0 + L * 0.86, cy - 1, 1.2, '#ffffff'); hl.set(x0 + L * 0.86, cy - 1, INK); for (let j = 0; j < 4; j++) hl.set(x0 + L * 0.5 + j, col[Math.round(L * 0.5) + j][0] - 1, P.c2); }
    // the hammerhead's eyes
    if (H.nose === 'hammer') { const hx = x0 + L - 3; hl.set(hx, col[L - 3][0] + 1, INK); hl.set(hx, col[L - 3][1] - 1, INK); }
    // cockpit
    const ic = Math.min(L - 3, Math.round(H.cp * L)), ct = topAt(ic);
    if (H.nocp) { /* this hull has its own windows */ }
    else if (H.dome || H.form === 'saucer') {
      const R = H.form === 'saucer' ? 5.5 : 5;
      hl.ell(x0 + ic + 0.5, ct + 1, R, R * 0.85, (x, y, dx, dy) => (dx * dx + dy * dy < 0.25 && dx < 0 && dy < 0 ? '#ffffff' : y < ct - 2 ? '#bff8ff' : '#7ff0ff'), 0.92, 'back');
    } else {
      hl.ell(x0 + ic + 0.5, ct + 1, 3.2, 2.4, (x, y) => (y < ct ? '#bff8ff' : y === ct ? '#7ff0ff' : '#3aa8d8'), 1, 'back');
      hl.rect(x0 + ic - 2, ct, 5, 1, '#7ff0ff'); hl.set(x0 + ic - 1, ct - 1, '#ffffff');
    }
    // sticker
    if (dec) {
      const [rows, gc] = glyphOf(dec.art.shape), tint = dec.art.color || gc, letter = String(dec.art.shape).startsWith('ch:');
      const gx = x0 + Math.round(L * 0.42) - Math.floor(rows[0].length / 2), gy = cy - Math.floor(rows.length / 2);
      if (letter) hl.rect(gx - 1, gy - 1, rows[0].length + 2, rows.length + 2, INK, 0.55);
      hl.glyph(rows, gx, gy, { '#': letter ? tint : gc, k: INK, w: '#ffffff' });
    }
    hl.outline(ink);
    if (H.glow) hl.halo(hl.mask(), 2, dd => [H.glow, dd < 1.5 ? 0.5 : 0.22]);
    s.blit(hl, 0, 0);
    if (FM && FM.front) FM.front(K);
    if (Wg.shape === 'ring') fr.ring(x0 + L * 0.45, cy, 4, H.m + 4, 2, wc, 1, 'front');
    if (H.form === 'ring') fr.ring(x0 + L * 0.5, cy, 3.5, H.m + 6, 2, P.c2, 1, 'front');
    fr.outline(ink); s.blit(fr, 0, 0);
    return s.to(cv);
  }

  // ---------- the dressed creature ----------
  const CW = 48, CH = 46, OX = 8, OY = 12;
  function robotLayer(A, t) {
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
  // 7.6: animal and space buddies, 14×16, the head in the middle
  function petLayer(A, t) {
    const b = surf(14, 16), c1 = A.c1, c2 = A.c2, cx = 7, cy = 9, dk = shade(c1, -0.35), lt = shade(c1, 0.35), k = A.kind;
    const head = (r, col) => { b.disc(cx, cy, r || 4.6, col || c1); b.set(cx - 2, cy - 3, lt); };
    const eyes = (dy, col, gap) => { gap = gap || 2; b.set(cx - gap, cy + (dy || 0), col || INK); b.set(cx + gap - 1, cy + (dy || 0), col || INK); };
    const tri = (x, y, w, h, col) => b.poly([[x, y + h], [x + w / 2, y], [x + w, y + h]], col);
    switch (k) {
      case 'cat': tri(2, 2, 4, 4, c1); tri(8, 2, 4, 4, c1); b.set(4, 4, '#ff9ad8'); b.set(9, 4, '#ff9ad8'); head(); eyes(0); b.set(cx - 0.5, cy + 1, '#ff7ad9'); b.set(cx + 0.5, cy + 1, '#ff7ad9'); b.set(cx - 0.5, cy + 2, c2); b.set(cx + 0.5, cy + 2, c2); b.line(0, cy + 1, 2, cy + 1, '#ffffff', 0.7); b.line(12, cy + 1, 13, cy + 1, '#ffffff', 0.7); break;
      case 'dog': head(); b.ell(cx, cy + 2, 2.6, 1.8, c2); b.rect(1.5, cy - 3, 2, 6, dk); b.rect(10.5, cy - 3, 2, 6, dk); eyes(-1); b.rect(cx - 0.5, cy + 1, 2, 1, INK); if (t % 4 < 2) b.set(cx, cy + 3, '#ff7a88'); break;
      case 'fox': tri(1.5, 1, 4.5, 6, c1); tri(8, 1, 4.5, 6, c1); b.set(3.5, 4, INK); b.set(10, 4, INK); head(4.6); b.poly([[cx - 4, cy + 1], [cx, cy + 5], [cx + 4, cy + 1]], c2); eyes(-1); b.set(cx - 0.5, cy + 3, INK); b.set(cx + 0.5, cy + 3, INK); break;
      case 'bear': b.disc(3, 5, 2, c1); b.disc(11, 5, 2, c1); b.set(3, 5, c2); b.set(11, 5, c2); head(); b.ell(cx, cy + 2, 2.4, 1.6, c2); eyes(-1); b.rect(cx - 0.5, cy + 1, 2, 1, INK); break;
      case 'panda': b.disc(3, 5, 2, c2); b.disc(11, 5, 2, c2); head(4.6, c1); b.ell(cx - 2, cy, 1.4, 1.6, c2); b.ell(cx + 2, cy, 1.4, 1.6, c2); b.set(cx - 2, cy, '#ffffff'); b.set(cx + 1, cy, '#ffffff'); b.rect(cx - 0.5, cy + 2, 2, 1, INK); break;
      case 'bunny': b.rect(4, 0, 2, 6, c1); b.rect(8, 0, 2, 6, c1); b.rect(4.5, 1, 1, 4, c2); b.rect(8.5, 1, 1, 4, c2); head(); eyes(0); b.set(cx - 0.5, cy + 2, c2); b.set(cx + 0.5, cy + 2, c2); b.rect(cx - 0.5, cy + 3, 2, 1, '#ffffff'); break;
      case 'frog': b.ell(cx, cy + 1, 5.5, 4, c1); b.disc(cx - 3, cy - 3, 2, c1); b.disc(cx + 3, cy - 3, 2, c1); b.set(cx - 3, cy - 3, '#ffffff'); b.set(cx + 3, cy - 3, '#ffffff'); b.set(cx - 3, cy - 2, INK); b.set(cx + 3, cy - 2, INK); b.ell(cx, cy + 3, 3, 1.5, c2); b.line(cx - 3, cy + 1, cx + 3, cy + 1, dk); break;
      case 'owl': tri(2, 2, 3, 4, c1); tri(9, 2, 3, 4, c1); head(5); b.disc(cx - 2, cy - 0.5, 1.8, c2); b.disc(cx + 2, cy - 0.5, 1.8, c2); b.set(cx - 2, cy - 0.5, INK); b.set(cx + 2, cy - 0.5, INK); b.poly([[cx - 1, cy + 1.5], [cx + 1, cy + 1.5], [cx, cy + 3.5]], '#ff9a3d'); break;
      case 'penguin': head(5, c1); b.ell(cx, cy + 1, 3.5, 3.4, c2); eyes(-1, INK); b.poly([[cx - 1.5, cy + 1], [cx + 1.5, cy + 1], [cx, cy + 3]], '#ff9a3d'); break;
      case 'mouse': b.disc(2.5, 4.5, 2.6, c1); b.disc(11.5, 4.5, 2.6, c1); b.disc(2.5, 4.5, 1.4, c2); b.disc(11.5, 4.5, 1.4, c2); head(4.2); eyes(0); b.set(cx, cy + 2, '#ff7ad9'); b.line(1, cy + 2, 3, cy + 2, '#ffffff', 0.6); b.line(11, cy + 2, 13, cy + 2, '#ffffff', 0.6); break;
      case 'hamster': b.disc(3.5, 5, 1.6, c1); b.disc(10.5, 5, 1.6, c1); head(5); b.disc(cx - 3, cy + 2, 1.8, c2); b.disc(cx + 3, cy + 2, 1.8, c2); eyes(-1); b.set(cx - 0.5, cy + 1, '#ff7ad9'); b.set(cx + 0.5, cy + 1, '#ff7ad9'); b.rect(cx - 0.5, cy + 3, 2, 1, '#ffffff'); break;
      case 'monkey': b.disc(1.8, cy, 2, c1); b.disc(12.2, cy, 2, c1); b.set(1.8, cy, c2); b.set(12.2, cy, c2); head(); b.ell(cx, cy + 1, 3.5, 3, c2); eyes(-1); b.line(cx - 1, cy + 2, cx + 1, cy + 2, dk); break;
      case 'koala': b.disc(2.2, 5, 2.8, c1); b.disc(11.8, 5, 2.8, c1); b.disc(2.2, 5, 1.5, c2); b.disc(11.8, 5, 1.5, c2); head(); eyes(-1); b.ell(cx, cy + 1.5, 1.4, 1.8, '#2a2a40'); break;
      case 'pig': tri(2.5, 3, 3, 3, dk); tri(8.5, 3, 3, 3, dk); head(); b.ell(cx, cy + 1.5, 2.4, 1.6, c2); b.set(cx - 1, cy + 1.5, dk); b.set(cx + 1, cy + 1.5, dk); eyes(-2); break;
      case 'lion': b.disc(cx, cy, 6.6, c2); for (let a = 0; a < 10; a++) b.set(cx + Math.cos(a * 0.63) * 6.4, cy + Math.sin(a * 0.63) * 6.4, shade(c2, -0.2)); head(4.4); eyes(-1); b.ell(cx, cy + 2, 2, 1.3, '#ffe9c8'); b.set(cx, cy + 1, INK); break;
      case 'alien': b.line(cx - 2, cy - 4, cx - 4, cy - 7, c1); b.line(cx + 2, cy - 4, cx + 4, cy - 7, c1); b.disc(cx - 4, cy - 7, 1, '#ff5ad9'); b.disc(cx + 4, cy - 7, 1, '#ff5ad9'); b.ell(cx, cy, 5, 4.6, c1); b.ell(cx - 2, cy, 1.4, 2, c2); b.ell(cx + 2, cy, 1.4, 2, c2); b.set(cx - 2.5, cy - 1, '#ffffff'); b.set(cx + 1.5, cy - 1, '#ffffff'); b.rect(cx - 0.5, cy + 3, 2, 1, dk); break;
      case 'octo': head(4.8); for (let j = 0; j < 5; j++) { const x = 3 + j * 2; b.line(x, cy + 3, x + ((j + (t >> 1)) % 2 ? 1 : -1), cy + 6, c1); } eyes(-1); b.set(cx - 3, cy - 2, c2); b.set(cx + 3, cy - 3, c2); b.set(cx + 2, cy + 1, c2); break;
      case 'slime': b.ell(cx, cy + 2, 5.6, 4, c1, 0.85); b.ell(cx, cy - 1, 3.6, 3, c1, 0.85); b.set(cx - 2, cy - 2, '#ffffff'); b.set(cx - 3, cy - 1, '#ffffff', 0.7); eyes(0); b.rect(cx - 1, cy + 2, 3, 1, dk); break;
      case 'ghost': b.ell(cx, cy - 1, 4.8, 4.8, c1, 0.92, 'back'); b.rect(cx - 4.8, cy - 1, 10, 5, c1, 0.92); for (let x = 2; x < 12; x++) if ((x + (t >> 1)) % 3) b.set(x, cy + 4, c1, 0.92); eyes(-1); b.ell(cx, cy + 2, 1, 1, INK); b.set(cx - 3, cy + 1, '#ff9ad8', 0.7); b.set(cx + 3, cy + 1, '#ff9ad8', 0.7); break;
      case 'star': b.poly(starPts(cx, cy, 6.6, 3, 5), (x, y) => (y < cy - 2 ? c2 : c1)); eyes(0); b.line(cx - 1, cy + 2, cx + 1, cy + 2, '#c45a1a'); break;
      case 'moon': b.disc(cx, cy, 5.4, c1); b.disc(cx + 3, cy - 2, 4.4, '#000000'); for (let i = 0; i < b.W * b.H; i++) { const p = i * 4; if (b.d[p] === 0 && b.d[p + 1] === 0 && b.d[p + 2] === 0 && b.d[p + 3] === 255) b.d[p + 3] = 0; } b.set(cx - 3, cy, INK); b.set(cx - 1, cy + 3, c2); b.set(cx - 2, cy - 3, c2); break;
      case 'sun': for (let a = 0; a < 8; a++) b.line(cx + Math.cos(a * 0.785) * 4.6, cy + Math.sin(a * 0.785) * 4.6, cx + Math.cos(a * 0.785) * 6.6, cy + Math.sin(a * 0.785) * 6.6, c1); head(4.2, c2); eyes(-1, '#c45a1a'); b.line(cx - 1, cy + 1, cx + 1, cy + 1, '#c45a1a'); b.set(cx - 2, cy + 1, '#ff9a3d'); break;
      case 'cloud': [[cx - 3, cy + 1, 3], [cx + 3, cy + 1, 3], [cx, cy - 1, 3.8], [cx - 1, cy + 2, 3]].forEach(([x, y, r]) => b.disc(x, y, r, c1)); b.rect(cx - 5, cy + 2, 11, 2, c2); eyes(0); b.line(cx - 1, cy + 2, cx + 1, cy + 2, '#5a6680'); if (t % 6 < 3) b.set(cx + 4, cy + 6, '#5ab4ff'); break;
      case 'planet': b.ring(cx, cy, 6.6, 2.2, 1.2, c2, 1, 'back'); head(4.2, c1); b.ell(cx + 1, cy - 1, 2, 1.2, shade(c1, -0.15)); eyes(0); b.line(cx - 1, cy + 2, cx + 1, cy + 2, INK); b.ring(cx, cy, 6.6, 2.2, 1.2, c2, 1, 'front'); break;
      case 'dragon': tri(2.5, 0.5, 2.5, 5, c2); tri(9, 0.5, 2.5, 5, c2); b.poly([[0, cy - 2], [3, cy - 5], [3, cy + 1]], shade(c1, -0.2)); b.poly([[14, cy - 2], [11, cy - 5], [11, cy + 1]], shade(c1, -0.2)); head(4.6); b.ell(cx, cy + 2.2, 2.8, 1.6, lt); b.set(cx - 1, cy + 2, INK); b.set(cx + 1, cy + 2, INK); b.set(cx - 2, cy - 1, c2); b.set(cx + 1, cy - 1, c2); eyes(-1); if (t % 6 < 2) b.glyph(GLYPH.plus[0], cx + 4, cy + 3, { '#': '#ffe066' }); break;
      default: head(); eyes(0);
    }
    b.outline(INK);
    if (A.helmet) { b.ring(cx, cy - 0.5, 6.8, 6.8, 1, '#bff8ff', 0.75); b.ell(cx, cy - 0.5, 6, 6, '#bff8ff', 0.16); b.set(cx - 3, cy - 4, '#ffffff'); b.set(cx - 4, cy - 3, '#ffffff'); b.rect(cx - 4, cy + 5.5, 9, 1.5, '#c9d0e2'); }
    return b;
  }
  const buddyLayer = (A, t) => (A.kind ? petLayer(A, t) : robotLayer(A, t));
  function hatLayer(cid, stage, A) {
    const rows = SD().HAT_SHAPES[A.shape];
    if (!rows) return null;
    const g = CR().geometry ? CR().geometry(cid, stage) : null, bb = CR().bounds(cid, stage), h = surf(CW, CH);
    const y0 = g ? g.top + 1 : bb.y0 + 1;
    const x = OX + 16 - Math.floor(rows[0].length / 2), y = OY + y0 + 1 - rows.length;
    h.glyph(rows, x, y, A.pal);
    h.outline(INK);
    return h;
  }
  // 7.6: fit a pair of glasses to the face: take away or copy the middle columns
  function fitRows(rows, w) {
    let R = rows.slice();
    for (let n = 0; n < 4 && R[0].length > w; n++) { const m = Math.floor(R[0].length / 2); R = R.map(r => r.slice(0, m) + r.slice(m + 1)); }
    for (let n = 0; n < 4 && R[0].length < w; n++) { const m = Math.floor(R[0].length / 2); R = R.map(r => r.slice(0, m) + r[m] + r.slice(m)); }
    return R;
  }
  function faceLayer(cid, stage, A) {
    const S = SD().FACE_SHAPES && SD().FACE_SHAPES[A.shape];
    if (!S) return null;
    const g = CR().geometry(cid, stage), f = surf(CW, CH);
    const span = g.eyeR - g.eyeL + 3;
    const rows = S.dy >= 98 ? S.rows : fitRows(S.rows, Math.max(9, span));
    const w = rows[0].length, x = OX + 16 - Math.floor(w / 2);
    const y = OY + (S.dy === 99 ? g.eyeY + g.eh : S.dy === 98 ? g.eyeY + g.eh - 1 : g.eyeY + S.dy);
    rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.' && ch !== 'g') f.set(x + i, y + j, A.pal[ch] || A.pal.a); }));
    f.outline(INK, 0.85);
    rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === 'g') f.set(x + i, y + j, A.pal.g || '#bff8ff', 0.45); }));
    if (S.dy < 98 && A.shape !== 'eyepatch' && A.shape !== 'heromask') rows.forEach((r, j) => { const i = r.indexOf('g'); if (i >= 0 && j === 1) f.set(x + i, y + j, '#ffffff', 0.85); });
    return f;
  }
  function neckLayer(cid, stage, A) {
    const rows = SD().NECK_SHAPES && SD().NECK_SHAPES[A.shape];
    if (!rows) return null;
    const g = CR().geometry(cid, stage), f = surf(CW, CH);
    const x = OX + 16 - Math.floor(rows[0].length / 2), y = OY + Math.min(g.mouthY + 1, g.bottom + 1 - rows.length);
    f.glyph(rows, x, y, A.pal);
    f.outline(INK);
    return f;
  }
  function holdLayer(cid, stage, A, px) {
    const rows = SD().HOLD_SHAPES && SD().HOLD_SHAPES[A.shape];
    if (!rows) return null;
    const g = CR().geometry(cid, stage), f = surf(CW, CH);
    const hx = 31 - g.sideL, hy = g.handY;
    const x = OX + hx - 1, y = OY + hy + 2 - rows.length;
    f.glyph(rows, x, y, A.pal);
    // a little paw holding it, in the creature's own colour
    const body = px && px[hy * 32 + hx - 1];
    const paw = body || '#ffd6a8';
    f.rect(OX + hx - 1, OY + hy, 2, 2, paw); f.set(OX + hx - 1, OY + hy, shade(paw, 0.25));
    f.outline(INK);
    return f;
  }
  const CAPE_PAT = {
    rainbow: (A, x, y, top, bot, xl) => RAINBOW[Math.min(5, Math.floor(((y - top) / (bot - top + 1)) * 6))],
    stripes: (A, x, y, top, bot, xl) => (Math.floor((x - xl) / 2) % 2 ? A.c2 : A.c1),
    trim: (A, x, y, top, bot, xl) => (y >= bot - 1 || x <= xl + 1 + ((y - top) * 3) / (bot - top + 1) ? A.c2 : A.c1),
    hearts: (A, x, y, top) => { const a = (x + 40) % 5, b = (y - top + 40) % 5; return (b === 1 && (a === 1 || a === 3)) || (b === 2 && a >= 1 && a <= 3) || (b === 3 && a === 2) ? A.c2 : A.c1; },
    checker: (A, x, y) => (((x >> 1) + (y >> 1)) % 2 ? A.c2 : A.c1),
    flames: (A, x, y, top, bot) => (bot - y < 2 + ((x * 7) % 5) * 0.8 ? (bot - y < 1.5 ? '#ffe066' : A.c2) : A.c1),
    moon: (A, x, y, top, bot, xl, xr) => { const cx = (xl + xr) / 2 + 1, cy = top + 4, d1 = (x - cx) ** 2 + (y - cy) ** 2, d2 = (x - cx - 1.5) ** 2 + (y - cy + 1) ** 2; return d1 < 7 && d2 > 5 ? A.c2 : (hash(x + ':' + y) % 23 === 0 ? '#ffffff' : A.c1); },
    waves: (A, x, y) => (Math.floor((y + Math.round(Math.sin(x * 0.7) * 1.2) + 40) / 2) % 2 ? A.c2 : A.c1),
    fade: (A, x, y, top, bot) => mix(A.c1, A.c2, (y - top) / Math.max(1, bot - top))
  };
  const AURA_BITS = { bubbles: null, notes: 'note', snow: 'flake', leaves: 'leaf2', stars: 'plus', pixels: null };
  function dressed(cv, cid, stage, eq, o) {
    o = o || {}; eq = eq || {};
    const t = o.t || 0, C = CR(), s = surf(CW, CH);
    const hat = item(eq.hat), cape = item(eq.cape), aura = item(eq.aura), buddy = item(eq.buddy);
    const face = item(eq.face), neck = item(eq.neck), hold = item(eq.hold);
    const legacy = !hat && o.hat ? o.hat : null;
    stage = stage || 1;
    const px = C.pixels(cid, stage, legacy);
    const body = surf(CW, CH); body.px32(px, 32, OX, OY);
    if (o.silhouette) for (let i = 0; i < CW * CH; i++) { const p = i * 4; if (body.d[p + 3]) { body.d[p] = 34; body.d[p + 1] = 44; body.d[p + 2] = 96; } }
    const hl = hat ? hatLayer(cid, stage, hat.art) : null;
    const fl = face ? faceLayer(cid, stage, face.art) : null, nl = neck ? neckLayer(cid, stage, neck.art) : null, hd = hold ? holdLayer(cid, stage, hold.art, px) : null;
    const bb = C.bounds(cid, stage);
    const mask = body.mask(); [hl, hd].forEach(L => { if (L) { const m2 = L.mask(); for (let i = 0; i < mask.length; i++) mask[i] |= m2[i]; } });
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
          case 'pixels': return dd < 2.5 && (x + y) % 2 === 0 ? [RAINBOW[(x + t) % 6], 0.55] : null;
          default: return [c, dd < 1.5 ? 0.3 : 0.1];
        }
      });
      if (A.style === 'sparks' || A.style === 'zap' || A.style === 'hearts' || A.style in AURA_BITS) {
        const n = A.style === 'pixels' ? 12 : A.style === 'snow' ? 10 : 8;
        for (let k = 0; k < n; k++) {
          const a = r() * Math.PI * 2, d = 13 + r() * 7, x = cx + Math.cos(a) * d, rise = A.style === 'hearts' || A.style === 'bubbles' || A.style === 'notes' ? (t % 6) : A.style === 'snow' || A.style === 'leaves' ? -(t % 6) : 0;
          const y = mid + Math.sin(a) * d * 0.9 - rise;
          if (A.style === 'hearts') s.glyph(GLYPH.heart3[0], x, y, { '#': c }, 0.9);
          else if (A.style === 'zap') { s.line(x, y, x + 2, y + 2, c); s.line(x + 2, y + 2, x, y + 4, c); }
          else if (A.style === 'bubbles') { s.ring(x, y, 2, 2, 1, c, 0.8); s.set(x - 1, y - 1, '#ffffff', 0.9); }
          else if (A.style === 'pixels') s.rect(x, y, 2, 2, RAINBOW[k % 6], 0.85);
          else if (A.style in AURA_BITS) s.glyph(GLYPH[AURA_BITS[A.style]][0], x, y, { '#': A.style === 'leaves' && k % 2 ? '#3f9a4e' : c }, (k + t) % 3 ? 0.9 : 0.55);
          else s.glyph(k % 2 ? GLYPH.plus[0] : GLYPH.spark[0], x, y, { '#': c }, (k + t) % 3 ? 0.9 : 0.4);
        }
      }
    }
    // cape (behind the body)
    if (cape) {
      const A = cape.art, cl2 = surf(CW, CH), top = OY + bb.y0 + Math.round((bb.y1 - bb.y0) * 0.36), bot = OY + bb.y1 + (A.long ? 2 : 0) - 1;
      const xl = OX + bb.x0 - 3, xr = OX + bb.x1 + 4, r = rng(hash(cape.id));
      cl2.poly([[OX + bb.x0 + 1, top], [OX + bb.x1, top], [xr, bot + 1], [xl, bot + 1]], (x, y) => {
        const f = CAPE_PAT[A.pattern];
        if (f) return f(A, x, y, top, bot, xl, xr);
        if (A.pattern === 'stars' || A.pattern === 'galaxy') { const v = r(); return v < 0.1 ? A.c2 : v < 0.14 && A.pattern === 'galaxy' ? '#ffffff' : A.c1; }
        return y >= bot ? A.c2 : A.c1;
      });
      for (let x = xl; x <= xr; x++) if ((x + t) % 4 === 0) cl2.set(x, bot + 1, A.c1);
      cl2.outline(INK); s.blit(cl2, 0, 0);
    }
    if (o.silhouette) body.outline('#5a6bb8');
    s.blit(body, 0, 0);
    if (nl) s.blit(nl, 0, 0);
    if (fl) s.blit(fl, 0, 0);
    if (hl) s.blit(hl, 0, 0);
    if (hd) s.blit(hd, 0, 0);
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
    if (A.moons) for (let k = 0; k < A.moons; k++) { const mx = cx + (k ? -R * 1.25 : R * 1.3), my = cy + (k ? R * 0.9 : -R * 1.05), mr = Math.max(1.4, R * (k ? 0.16 : 0.22)); sphere(s, mx, my, mr, '#c9ccd8', '#9aa0ac', { craters: 1 }, seed + k); }
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

  // 7.6: the animals that flew to space (all in little helmets), 14×16 like the buddies
  function critterLayer(w, t) {
    const PET = { dog: ['#f2e6d0', '#c98a4a'], monkey: ['#a8743a', '#ffd6a8'], cat: ['#2a2a40', '#ffffff'], mouse: ['#eef2ff', '#ffc4d6'], frog: ['#6fe36f', '#c4f4a0'] };
    if (PET[w]) return petLayer({ kind: w, c1: PET[w][0], c2: PET[w][1], helmet: 1 }, t);
    const b = surf(14, 16), cx = 7, cy = 9;
    switch (w) {
      case 'fly': b.ell(cx - 3, cy - 2, 3.4, 1.8, '#d8f0ff', 0.6); b.ell(cx + 3, cy - 2, 3.4, 1.8, '#d8f0ff', 0.6); b.ell(cx, cy + 1, 2.2, 3.4, '#4a4a5a'); for (let y = cy; y < cy + 4; y += 2) b.rect(cx - 2, y, 5, 1, '#7a6a3a'); b.disc(cx, cy - 2.5, 2, '#4a4a5a'); b.disc(cx - 1.5, cy - 3, 1.1, '#e5484d'); b.disc(cx + 1.5, cy - 3, 1.1, '#e5484d'); break;
      case 'tortoise': b.ell(cx - 1, cy + 1, 5, 3.6, (x, y) => ((x + y) % 4 === 0 || (x - y) % 4 === 0 ? '#2a6a35' : '#4f9a4e'), 1, 'back'); b.rect(cx - 6, cy + 1, 10, 1, '#3f7a3a'); b.disc(cx + 5, cy, 1.6, '#9ad06a'); b.set(cx + 5.5, cy - 0.5, INK); b.rect(cx - 5, cy + 2, 2, 2, '#9ad06a'); b.rect(cx + 1, cy + 2, 2, 2, '#9ad06a'); break;
      case 'spider': for (let i = 0; i < 4; i++) { b.line(cx, cy, cx - 5, cy - 3 + i * 2.4, '#3a2a40'); b.line(cx, cy, cx + 5, cy - 3 + i * 2.4, '#3a2a40'); } b.disc(cx, cy + 1, 2.6, '#3a2a40'); b.disc(cx, cy - 2, 1.8, '#3a2a40'); b.set(cx - 1, cy - 2, '#ffffff'); b.set(cx + 1, cy - 2, '#ffffff'); b.line(cx, cy - 8, cx, cy - 4, '#ffffff', 0.5); break;
      case 'fish': b.ell(cx, cy, 4.4, 2.8, '#ff8a3d'); b.poly([[cx - 4, cy], [cx - 7, cy - 3], [cx - 7, cy + 3]], '#ff8a3d'); b.set(cx + 2, cy - 1, INK); b.line(cx - 1, cy - 2, cx - 1, cy + 2, '#ffd23f'); for (let i = 0; i < 3; i++) b.set(cx + 5 + (i % 2), cy - 3 - i * 1.6, '#ffffff', 0.7); break;
      case 'jelly': b.ell(cx, cy - 1, 4.6, 3.6, '#ff9ad8', 0.85, 'back'); b.rect(cx - 4.6, cy - 1, 10, 1, '#ff9ad8', 0.85); b.set(cx - 2, cy - 3, '#ffffff'); for (let j = 0; j < 4; j++) { const x = cx - 3 + j * 2; for (let q = 0; q < 5; q++) b.set(x + ((q + j + (t >> 1)) % 2), cy + 1 + q, '#ffc4e6', 0.85); } break;
      case 'tardigrade': b.ell(cx, cy, 5.6, 3.2, '#c9b8a0'); for (let x = cx - 3; x <= cx + 3; x += 2) b.line(x, cy - 3, x, cy + 2, '#a8947a'); for (let x = cx - 4; x <= cx + 4; x += 3) b.rect(x, cy + 2, 2, 2, '#c9b8a0'); b.disc(cx + 5, cy, 1.8, '#d8c8b0'); b.set(cx + 5, cy - 0.5, INK); b.set(cx + 6, cy + 0.5, '#8a7a60'); break;
      case 'bee': b.ell(cx - 2, cy - 4, 2.6, 1.6, '#ffffff', 0.75); b.ell(cx + 2, cy - 4, 2.6, 1.6, '#ffffff', 0.75); b.ell(cx, cy, 4.2, 3, (x) => (Math.floor(x / 2) % 2 ? '#2a2a40' : '#ffd23f')); b.disc(cx + 4, cy - 0.5, 1.8, '#2a2a40'); b.set(cx + 4.5, cy - 1, '#ffffff'); b.set(cx - 5, cy, '#2a2a40'); break;
      default: b.disc(cx, cy, 4, '#c9d0e2');
    }
    b.outline(INK);
    b.ring(cx, cy - 0.5, 6.8, 6.8, 1, '#bff8ff', 0.75); b.ell(cx, cy - 0.5, 6, 6, '#bff8ff', 0.14); b.set(cx - 3, cy - 4, '#ffffff'); b.set(cx - 4, cy - 3, '#ffffff'); b.rect(cx - 4, cy + 5.5, 9, 1.5, '#c9d0e2');
    return b;
  }
  // scale a small surface up by 2 (for the animal cards)
  function blit2(s, o, ox, oy) {
    for (let y = 0; y < o.H; y++) for (let x = 0; x < o.W; x++) {
      const i = (y * o.W + x) * 4, A = o.d[i + 3];
      if (A) { const c = toHex(o.d[i], o.d[i + 1], o.d[i + 2]); s.rect(ox + x * 2, oy + y * 2, 2, 2, c, A / 255); }
    }
  }
  function animalArt(s, it, seed, t) {
    sky(s, 0, 0, KW, KW, seed, '#060b26', '#17205a');
    sphere(s, 30, 52, 20, '#3a7fd8', '#4fb35a', { land: 1 }, 3);
    blit2(s, critterLayer(it.art.w, t || 0), 6, 2);
  }
  function starTypeArt(s, A, seed) {
    sky(s, 0, 0, KW, KW, seed, '#04071c', '#140f3a');
    const c = A.color, cx = 20, cy = 20, R = Math.min(17, 1.6 + A.size * 0.95);
    const glow = (x, y, rr, col, a) => { for (let k = 3; k > 0; k--) s.disc(x, y, rr + k * 1.6, col, a * (0.25 / k)); };
    const star = (x, y, rr, col) => { glow(x, y, rr, col, 1); s.ell(x, y, rr, rr, (px, py, dx, dy) => mix(col, '#ffffff', Math.max(0, 0.65 - Math.sqrt(dx * dx + dy * dy)) * 0.9)); };
    switch (A.w) {
      case 'binarystars': star(13, 18, 5, '#ffd23f'); star(28, 24, 3.6, '#9ad0ff'); s.ring(20, 21, 12, 5, 0.6, '#ffffff', 0.3); break;
      case 'starcluster': { const r = rng(seed); for (let k = 0; k < 26; k++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 13; const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; s.disc(x, y, 0.6 + r() * 1.2, k % 4 ? '#bfe0ff' : '#ffffff'); if (k % 5 === 0) s.glyph(GLYPH.plus[0], x - 1, y - 1, { '#': '#9ad0ff' }, 0.6); } break; }
      case 'neutronstar': s.poly([[cx - 1, cy], [cx + 1, cy], [cx + 7, 0], [cx + 3, 0]], '#bff8ff', 0.35); s.poly([[cx - 1, cy], [cx + 1, cy], [cx - 3, 40], [cx - 7, 40]], '#bff8ff', 0.35); star(cx, cy, 2.4, c); s.ring(cx, cy, 6, 6, 0.6, '#7ff0ff', 0.5); break;
      case 'protostar': for (let k = 0; k < 220; k++) { const a = (k / 220) * Math.PI * 8, d = 3 + k * 0.07; s.set(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.45, k % 3 ? '#a8643a' : '#ff9ad8', 0.55); } star(cx, cy, R * 0.6, c); break;
      case 'variablestar': star(cx, cy, R, c); s.ell(cx, cy, R, R, (x, y, dx) => (dx > 0.15 ? '#000000' : null), 0.35); s.ring(cx, cy, R + 4, R + 4, 0.6, c, 0.4); s.ring(cx, cy, R + 7, R + 7, 0.6, c, 0.2); break;
      case 'polaris': star(cx, cy, R, c); s.line(cx - 15, cy, cx + 15, cy, '#ffffff', 0.55); s.line(cx, cy - 15, cx, cy + 15, '#ffffff', 0.55); [[6, 31], [10, 29], [12, 33], [9, 35]].forEach(([x, y]) => s.disc(x, y, 0.8, '#ffffff')); break;
      case 'browndwarf': glow(cx, cy, R, c, 0.6); s.ell(cx, cy, R, R, (x, y) => (Math.sin((y - cy) * 1.2) > 0.3 ? shade(c, -0.25) : c)); break;
      case 'redsupergiant': star(cx + 6, cy + 6, R, c); break;
      default: star(cx, cy, R, c);
    }
  }
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
    else if (A.kind === 'animal') animalArt(s, it, seed, o && o.t);
    else if (A.kind === 'startype') starTypeArt(s, A, seed);
    if (o && o.locked) { for (let i = 0; i < KW * KW; i++) { const p = i * 4; const g = (s.d[p] + s.d[p + 1] + s.d[p + 2]) / 3; s.d[p] = s.d[p + 1] = s.d[p + 2] = g * 0.35 + 18; } }
    return s.to(cv);
  }

  // ---------- the cabin ----------
  const BW = 128, BH = 72, FLOOR = 50;
  const REGION = { floor: [0, 36, 128, 36], window: [44, 4, 40, 30], poster: [10, 6, 22, 28], shelf: [88, 8, 36, 26], bed: [0, 32, 40, 30], desk: [94, 22, 34, 38], lamp: [104, 8, 24, 52], plant: [34, 36, 18, 26], rug: [38, 56, 56, 16], gadget: [76, 26, 26, 36], pet: [0, 50, 28, 22], ceiling: [40, 0, 48, 22] };
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
      default: return wallMore(A, x, y, r) || c1;
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
      default: return floorMore(A, x, y, r) || (r() < 0.06 ? shade(c1, -0.08) : c1);
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
      default: windowMore(s, X, Y, W, H, view, seed);
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
      default: posterMore(s, X, Y, W, H, kind, color, seed);
    }
  }
  // 7.6: more walls, floors, windows and posters
  function wallMore(A, x, y, r) {
    const { c1, c2 } = A;
    switch (A.pattern) {
      case 'bricks': { const row = Math.floor(y / 5), xs = x + (row % 2) * 6; return y % 5 === 4 || xs % 12 === 0 ? shade(c1, -0.42) : (hash(row + ':' + Math.floor(xs / 12)) % 3 ? c1 : c2); }
      case 'tiles': return x % 8 === 0 || y % 8 === 0 ? shade(c1, -0.3) : x % 8 === 2 && y % 8 === 2 ? c2 : (Math.floor(x / 8) + Math.floor(y / 8)) % 2 ? c1 : shade(c1, 0.1);
      case 'chevron': return Math.floor((y + Math.abs((x % 12) - 6)) / 3) % 2 ? c2 : c1;
      case 'clouds': { const row = Math.floor(y / 16), cx = ((x + row * 21) % 42) - 21, cy = (y % 16) - 9; return (cx * cx) / 90 + (cy * cy) / 10 < 1 || ((cx - 5) ** 2) / 30 + ((cy + 3) ** 2) / 10 < 1 ? (cy > 1 ? shade(c2, -0.08) : c2) : c1; }
      case 'waves': return Math.floor((y + Math.round(Math.sin(x * 0.3) * 2) + 80) / 4) % 2 ? c2 : c1;
      case 'plaid': { const a = x % 12 < 3, b = y % 12 < 3; return a && b ? shade(c2, -0.15) : a || b ? mix(c1, c2, 0.45) : x % 12 === 7 || y % 12 === 7 ? shade(c1, -0.25) : c1; }
      case 'zigzag': { const yy = y % 8, z = Math.abs((x % 8) - 4); return yy === z || yy === z + 1 ? c2 : c1; }
      case 'trees': { const col = Math.floor(x / 12), tx = (x % 12) - 6, by = 46 - (hash('t' + col) % 3) * 5; if (y >= by && y < by + 4 && Math.abs(tx) < 1) return '#6a4a30'; if (y > by - 18 && y < by && Math.abs(tx) <= (y - (by - 18)) * 0.33) return (y + tx) % 4 ? c2 : shade(c2, -0.25); return y < 14 && r() < 0.03 ? '#ffffff' : c1; }
      case 'triangles': { const row = Math.floor(y / 8), xx = (x + (row % 2) * 4) % 8, yy = y % 8; return Math.abs(xx - 4) <= yy / 2 ? c2 : c1; }
      case 'starmap': return r() < 0.022 ? c2 : r() < 0.016 ? '#ffffff' : x % 32 === 0 || y % 24 === 0 ? mix(c1, c2, 0.22) : c1;
      default: return null;
    }
  }
  function floorMore(A, x, y, r) {
    const { c1, c2 } = A, fy = y - FLOOR;
    switch (A.pattern) {
      case 'hex': { const row = Math.floor(fy / 3), xx = (x + (row % 2) * 4) % 8; return (fy % 3 === 0 && xx < 5) || xx === 0 ? shade(c1, -0.25) : xx === 2 && fy % 3 === 1 ? c2 : c1; }
      case 'marble': return Math.abs(Math.sin(x * 0.12 + Math.sin(fy * 0.5 + x * 0.05) * 2.5)) < 0.08 ? c2 : r() < 0.02 ? shade(c1, -0.05) : c1;
      case 'lava': return Math.abs(Math.sin(x * 0.2 + fy * 0.9) + Math.sin(x * 0.07 - fy * 0.4)) < 0.2 ? c2 : r() < 0.03 ? '#ffb24a' : c1;
      case 'water': return Math.floor((fy + Math.round(Math.sin(x * 0.25 + fy) * 1.2)) / 2) % 3 === 0 ? mix(c1, c2, 0.5) : r() < 0.012 ? '#ffffff' : c1;
      case 'stars': return r() < 0.03 ? c2 : r() < 0.02 ? '#b18cff' : c1;
      case 'plain': return fy === 3 || fy === 19 ? c2 : c1;
      default: return null;
    }
  }
  function windowMore(s, X, Y, W, H, view, seed) {
    switch (view) {
      case 'jupiter': planetArt(s, X - 4, Y - 2, W + 8, H + 8, { c: '#e0b080', c2: '#a8643a', bands: 1, spot: 1 }, 12); return true;
      case 'sun': s.disc(X + W * 0.62, Y + H * 0.55, H * 0.75, '#ffb24a', 0.3); s.disc(X + W * 0.62, Y + H * 0.55, H * 0.5, '#ffd23f'); s.disc(X + W * 0.62, Y + H * 0.55, H * 0.34, '#fff3a0'); s.disc(X + W * 0.4, Y + H * 0.45, 1.5, '#ff9a3d'); return true;
      case 'meteors': case 'pulsar': case 'asteroids': case 'eclipse': case 'redgiant': wonderArt(s, X, Y, W, H, view, seed); return true;
      case 'station': craftArt(s, X, Y, W, H, 'station'); return true;
      default: return false;
    }
  }
  function posterMore(s, X, Y, W, H, kind, color, seed) {
    const cx = X + W / 2, cy = Y + H / 2;
    switch (kind) {
      case 'astronaut': craftArt(s, X - 3, Y, W + 6, H, 'suit'); return true;
      case 'satellite': case 'station': case 'rover': craftArt(s, X - 3, Y, W + 6, H, kind); return true;
      case 'eclipse': case 'aurora': case 'nebula': case 'blackhole': wonderArt(s, X, Y, W, H, kind, seed); return true;
      case 'sun': planetArt(s, X, Y, W, H, { c: '#ffd23f', c2: '#ff9a3d', sun: 1, spots: 1 }, seed); return true;
      case 'robot': s.blit(robotLayer({ head: 'box', eye: 'round', ant: 'ball', hue: 160 }, 0), cx - 7, cy - 8); return true;
      case 'alien': s.blit(petLayer({ kind: 'alien', c1: color, c2: '#1d1f2e' }, 0), cx - 7, cy - 8); return true;
      case 'ufo': { s.poly([[cx - 2, cy], [cx + 2, cy], [cx + 6, Y + H - 2], [cx - 6, Y + H - 2]], '#fff3a0', 0.35); s.ell(cx, cy - 2, 7, 2.4, '#c9d0e2'); s.ell(cx, cy - 3, 3.4, 2.6, '#7ff0ff', 1, 'back'); [-4, 0, 4].forEach(d => s.set(cx + d, cy - 1, '#ffe066')); return true; }
      default: return false;
    }
  }
  const heartAt = (x, y, cx, cy, R) => { const hx = (x - cx) / R, hy = -(y - cy) / R + 0.25; return (hx * hx + hy * hy - 1) ** 3 - hx * hx * hy ** 3 < 0; };
  // 7.6: the new kinds of furniture, and the pet and ceiling corners.
  // true: drawn into F (outlined and put on the wall by the caller); 'drawn': all done; false: the 7.4 code draws it.
  function moreFurniture(s, F, slot, A, t, o, P) {
    const { c, dk, lt, wood, metal } = P, k = A.kind, r = rng(hash(slot + k) + t);
    if (slot === 'plant' && k !== 'bonsai' && ['sunflower', 'flytrap', 'crystal', 'tulips', 'fern'].includes(k)) { F.poly([[37, 52], [47, 52], [46, 60], [38, 60]], '#c0603a'); F.rect(37, 52, 10, 1, '#e08a5a'); }
    const side = () => { if (!o.desk) { F.rect(112, 42, 12, 2, wood); F.rect(113, 44, 2, 13, shade(wood, -0.2)); F.rect(121, 44, 2, 13, shade(wood, -0.2)); } };
    const table = () => { F.rect(96, 42, 26, 3, wood); F.rect(97, 45, 2, 12, shade(wood, -0.2)); F.rect(119, 45, 2, 12, shade(wood, -0.2)); };
    switch (slot + ':' + k) {
      // beds
      case 'bed:tent': F.poly([[2, 59], [19, 35], [36, 59]], (x, y) => (Math.abs(x - 19) < (y - 35) * 0.12 ? lt : c)); F.poly([[13, 59], [19, 45], [25, 59]], '#2a2e3d'); F.rect(18, 31, 1, 5, wood); F.rect(19, 31, 4, 2, '#ffe066'); F.rect(2, 59, 35, 1, dk); return true;
      case 'bed:rocketbed': F.rect(7, 45, 23, 11, '#eef2ff'); F.poly([[30, 45], [37, 50.5], [30, 56]], c); F.poly([[7, 45], [2, 40], [10, 45]], c); F.poly([[7, 56], [2, 61], [10, 56]], c); F.rect(11, 46, 15, 9, c); F.rect(11, 46, 15, 1, lt); F.rect(25, 46, 4, 4, '#ffffff'); F.disc(19, 50, 1.4, '#7ff0ff'); F.rect(9, 56, 2, 3, metal); F.rect(27, 56, 2, 3, metal); s.disc(2, 50, 2 + (t % 2), '#ffb24a', 0.5); return true;
      case 'bed:cloud': [[9, 51, 6], [18, 47, 7.5], [28, 50, 6.5], [14, 54, 6], [24, 54, 6]].forEach(([x, y, rr]) => F.disc(x, y, rr, (xx, yy) => (yy > 55 ? shade(c, -0.12) : c))); F.disc(9, 46, 2.4, '#fff3a0'); F.disc(10, 45, 2.2, shade(c, -0.05)); for (let i = 0; i < 4; i++) s.glyph(GLYPH.plus[0], 4 + i * 9, 36 + ((i * 5 + t) % 4), { '#': '#fff3a0' }, 0.8); return true;
      case 'bed:nest': F.ell(19, 53, 17, 7, (x, y) => ((x * 3 + y * 5) % 7 < 2 ? shade(c, -0.35) : (x + y) % 5 ? c : lt)); F.ell(19, 49, 13, 3.4, '#f6e6c8', 1, 'back'); F.rect(8, 49, 22, 2, '#f6e6c8'); F.ell(13, 48, 3, 2, '#ffffff'); F.rect(17, 47, 11, 3, '#ff9ad8'); for (let i = 0; i < 5; i++) F.line(3 + i * 7, 52 + (i % 2), 9 + i * 7, 55 - (i % 2), shade(c, -0.45)); return true;
      case 'bed:bunk': F.rect(3, 33, 2, 27, wood); F.rect(33, 33, 2, 27, wood); [[36, 1], [50, 0]].forEach(([y]) => { F.rect(5, y + 3, 28, 3, '#f2f4fb'); F.rect(11, y + 2, 22, 4, c); F.rect(11, y + 2, 22, 1, lt); F.rect(6, y + 1, 5, 2, '#ffffff'); F.rect(5, y + 6, 28, 2, shade(wood, -0.15)); }); for (let y = 36; y < 58; y += 4) F.rect(35, y, 3, 1, wood); F.rect(37, 34, 1, 26, wood); if (c === '#7a3fc4') for (let i = 0; i < 6; i++) F.set(13 + i * 3, 38 + (i % 2) * 14, '#ffffff'); return true;
      // desks
      case 'desk:easel': F.line(100, 59, 106, 28, wood); F.line(114, 59, 108, 28, wood); F.line(107, 59, 107, 36, shade(wood, -0.2)); F.rect(99, 30, 16, 13, '#ffffff'); F.disc(104, 35, 2.4, c); F.rect(108, 37, 5, 3, '#5ab4ff'); F.line(101, 41, 113, 32, '#6fe36f'); F.rect(98, 43, 18, 1, wood); F.ell(122, 56, 4, 2, '#f2e0c0'); [[120, 55, '#e5484d'], [122, 56, '#5ab4ff'], [124, 55, '#ffd23f']].forEach(([x, y, cc]) => F.set(x, y, cc)); return true;
      case 'desk:lab': table(); F.poly([[100, 41], [106, 41], [104, 34], [104, 30], [102, 30], [102, 34]], '#bff8ff'); F.poly([[100.5, 41], [105.5, 41], [104.5, 37], [101.5, 37]], c); s.disc(103, 27 - (t % 3), 1, c, 0.7); for (let i = 0; i < 3; i++) { F.rect(110 + i * 3, 33, 2, 9, '#bff8ff'); F.rect(110 + i * 3, 37 + i, 2, 5 - i, ['#ff7ad9', '#6fe36f', '#ffd23f'][i]); } F.rect(109, 39, 10, 2, metal); F.ell(121, 39, 2.6, 2.6, '#bff8ff'); F.ell(121, 40, 2, 1.5, '#5ab4ff'); return true;
      case 'desk:piano': F.rect(96, 34, 28, 9, c); F.rect(96, 34, 28, 1, lt); F.rect(96, 43, 28, 4, '#ffffff'); for (let x = 98; x < 123; x += 3) { F.rect(x, 43, 1, 2, '#2a2e3d'); } for (let x = 96; x < 124; x += 2) F.set(x, 46, '#c9d0e2'); F.rect(97, 47, 2, 11, c); F.rect(121, 47, 2, 11, c); F.rect(105, 29, 10, 6, '#f2f4fb'); F.rect(106, 31, 8, 1, '#8a94b8'); F.rect(106, 33, 6, 1, '#8a94b8'); if (t % 4 < 2) s.glyph(GLYPH.note[0], 117, 26, { '#': '#ffe066' }); return true;
      case 'desk:console': F.rect(97, 42, 26, 16, shade(c, -0.2)); F.poly([[96, 42], [124, 42], [121, 33], [99, 33]], c); F.rect(102, 35, 16, 5, '#14203a'); F.rect(103, 36, 6, 1, '#3dffb0'); F.rect(103, 38, 10, 1, '#7ff0ff'); [['#e5484d', 99], ['#ffd23f', 103], ['#6fe36f', 107], ['#5ab4ff', 111], ['#ff7ad9', 115], ['#e5484d', 119]].forEach(([cc, x], i) => F.rect(x, 44 + (i % 2) * 3, 2, 2, (i + t) % 3 ? cc : '#ffffff')); F.rect(99, 51, 22, 1, lt); return true;
      // lamps
      case 'lamp:neon': s.disc(118, 24, 10, c, 0.16); F.poly(starPts(118, 24, 7, 3, 5), (x, y) => (y < 22 ? '#ffffff' : c)); s.blit(F, 0, 0); return 'drawn';
      case 'lamp:plasma': side(); F.poly([[114, 42], [122, 42], [120, 38], [116, 38]], '#2a2e3d'); F.disc(118, 32, 6, '#1a1040', 0.95); for (let i = 0; i < 5; i++) { const a = r() * Math.PI * 2; F.line(118, 32, 118 + Math.cos(a) * 5, 32 + Math.sin(a) * 5, i % 2 ? c : '#ffffff', 0.9); } F.disc(118, 32, 1.4, '#ffffff'); s.disc(118, 32, 9, c, 0.18); return true;
      case 'lamp:jar': side(); F.rect(114, 30, 9, 12, '#bff8ff', 0.4); F.rect(114, 28, 9, 2, metal); for (let i = 0; i < 6; i++) F.set(115 + r() * 7, 31 + r() * 10, (i + t) % 3 ? c : '#ffffff'); s.disc(118, 36, 8, c, 0.15); return true;
      case 'lamp:lava': side(); F.poly([[114, 42], [122, 42], [120, 37], [116, 37]], metal); F.poly([[116, 37], [120, 37], [119.5, 25], [116.5, 25]], shade(c, -0.55)); F.rect(116, 23, 4, 2, metal); F.disc(118, 34 - (t % 4), 1.4, c); F.disc(118.5, 29 + (t % 3), 1.1, c); F.disc(117.5, 27, 0.8, lt); s.disc(118, 31, 8, c, 0.14); return true;
      // plants
      case 'plant:bonsai': F.rect(36, 55, 12, 4, '#566079'); F.line(42, 55, 40, 48, wood); F.line(40, 48, 44, 43, wood); F.line(42, 50, 46, 47, wood); [[38, 46, 3.2], [46, 45, 3], [42, 41, 3.4]].forEach(([x, y, rr]) => F.disc(x, y, rr, (xx, yy) => (yy < y ? lt : c))); return true;
      case 'plant:sunflower': F.line(42, 52, 42, 39, '#3f9a4e'); F.ell(39, 47, 2.4, 1.2, '#4fb35a'); F.ell(45, 44, 2.4, 1.2, '#4fb35a'); for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; F.disc(42 + Math.cos(a) * 3.4, 36 + Math.sin(a) * 3.4, 1.6, c); } F.disc(42, 36, 2.4, '#6a4a20'); F.set(41, 35, '#8a6a30'); return true;
      case 'plant:flytrap': [[38, 41, -1], [46, 43, 1]].forEach(([x, y, d]) => { F.line(42, 52, x, y + 3, '#3f9a4e'); const open = (t + (d > 0 ? 2 : 0)) % 6 < 3; F.ell(x, y - (open ? 1 : 0), 3.6, 1.8, c, 1, 'back'); F.ell(x, y + (open ? 1 : 0), 3.6, 1.8, c, 1, 'front'); F.rect(x - 3, y, 7, open ? 1 : 0, '#e5484d'); for (let i = -3; i <= 3; i += 2) F.set(x + i, y - (open ? 2.5 : 1.5), '#ffffff'); }); return true;
      case 'plant:crystal': [[42, 37, 2.6], [38.5, 43, 1.8], [45.5, 42, 2]].forEach(([x, y, w]) => F.poly([[x - w, 52], [x - w, y + 3], [x, y], [x + w, y + 3], [x + w, 52]], (xx) => (xx < x ? lt : c), 0.92)); s.disc(42, 44, 8, c, 0.18); return true;
      case 'plant:tulips': [[38, 41], [42, 38], [46, 41]].forEach(([x, y], i) => { F.line(42, 52, x, y + 3, '#3f9a4e'); F.poly([[x - 2, y], [x - 1, y - 1.5], [x, y], [x + 1, y - 1.5], [x + 2, y], [x + 2, y + 3], [x - 2, y + 3]], i === 1 ? lt : c); }); F.ell(39, 49, 2, 1, '#4fb35a'); F.ell(45, 48, 2, 1, '#4fb35a'); return true;
      case 'plant:fern': for (let j = 0; j < 5; j++) { const a = -Math.PI / 2 + (j - 2) * 0.55; for (let q = 0; q < 12; q++) { const rr = q * 1.1, x = 42 + Math.cos(a) * rr + (j - 2) * q * 0.12, y = 52 + Math.sin(a) * rr + (q * q) * 0.06 * Math.abs(j - 2); F.set(x, y, q % 2 ? c : lt); F.set(x + 1, y + 0.5, c, 0.8); F.set(x - 1, y + 0.5, c, 0.8); } } return true;
      // shelves
      case 'shelf:plush': F.rect(90, 20, 32, 2, wood); F.rect(90, 30, 32, 2, wood); F.disc(95, 16, 3.4, '#c98a4a'); F.disc(92.5, 13, 1.3, '#c98a4a'); F.disc(97.5, 13, 1.3, '#c98a4a'); F.set(94, 16, INK); F.set(96, 16, INK); F.rect(103, 11, 2, 4, '#ffffff'); F.rect(106, 11, 2, 4, '#ffffff'); F.disc(105.5, 17, 3, '#ffffff'); F.set(104, 17, INK); F.set(107, 17, INK); F.disc(116, 16, 3.5, c); F.set(115, 15, '#ffffff'); F.disc(97, 26, 3.4, '#6fe36f'); F.disc(108, 26, 3.4, '#5ab4ff'); F.set(107, 25, INK); F.set(109, 25, INK); F.disc(117, 26, 3, '#ffd23f'); return true;
      case 'shelf:crystals': F.rect(90, 20, 32, 2, wood); F.rect(90, 30, 32, 2, wood); [[95, 12, 2], [102, 14, 1.6], [110, 11, 2.4], [117, 13, 1.8], [96, 24, 1.6], [106, 23, 2.2], [116, 24, 1.6]].forEach(([x, y, w], i) => F.poly([[x - w, y < 20 ? 20 : 30], [x - w, y + 2], [x, y], [x + w, y + 2], [x + w, y < 20 ? 20 : 30]], (xx) => (xx < x ? '#ffffff' : [c, '#7ff0ff', '#ff9ad8', '#6fe3b4'][i % 4]), 0.9)); return true;
      case 'shelf:potions': F.rect(90, 20, 32, 2, wood); F.rect(90, 30, 32, 2, wood); [[94, 20, 3], [102, 20, 2.4], [110, 20, 3.2], [118, 20, 2.4], [97, 30, 2.6], [106, 30, 3], [115, 30, 2.6]].forEach(([x, y, rr], i) => { F.disc(x, y - rr - 0.5, rr, '#bff8ff', 0.5); F.ell(x, y - rr + 0.5, rr - 0.5, rr * 0.6, [c, '#ff7ad9', '#ffd23f', '#5ab4ff', '#b18cff'][i % 5], 1, 'front'); F.rect(x - 0.5, y - rr * 2 - 2, 2, 2, '#8a5a34'); }); return true;
      case 'shelf:records': F.rect(90, 20, 32, 2, wood); F.rect(90, 30, 32, 2, wood); for (let i = 0; i < 9; i++) F.rect(92 + i * 2, 12, 1.5, 8, ['#e5484d', '#ffd23f', '#5ab4ff', '#ff7ad9', '#2a2a40'][i % 5]); F.disc(114, 15, 4.5, '#1d1f2e'); F.disc(114, 15, 1.4, c === '#2a2a40' ? '#ff7ad9' : c); F.ring(114, 15, 3.4, 3.4, 0.6, '#3a3a50'); for (let i = 0; i < 4; i++) { F.rect(93 + i * 7, 23, 6, 7, ['#ff9a3d', '#7ff0ff', '#b18cff', '#6fe36f'][i]); F.disc(96 + i * 7, 26.5, 1.6, '#1d1f2e'); } return true;
      // rugs
      case 'rug:hex': F.ell(66, 64, 26, 5, (x, y) => { const row = Math.floor(y / 2), xx = (x + (row % 2) * 3) % 6; return xx === 0 || y % 2 === 0 && xx < 3 ? lt : c; }); return true;
      case 'rug:checker': F.ell(66, 64, 26, 5, (x, y) => ((Math.floor(x / 4) + Math.floor(y / 2)) % 2 ? c : '#f2f4fb')); return true;
      case 'rug:paw': F.ell(66, 64, 26, 5, c); [[52, 63], [64, 65], [76, 63]].forEach(([x, y]) => { F.ell(x, y + 0.5, 2, 1.2, lt); F.set(x - 2, y - 1, lt); F.set(x, y - 1.5, lt); F.set(x + 2, y - 1, lt); }); return true;
      case 'rug:heart': F.ell(66, 63.5, 24, 6.5, (x, y) => (heartAt((x - 66) / 3.2 + 66, (y - 63) + 63, 66, 63, 4.6) ? ((x + y) % 7 === 0 ? lt : c) : null)); return true;
      case 'rug:moon': F.ell(66, 64, 25, 5.5, (x, y) => (((x - 74) / 22) ** 2 + ((y - 62.5) / 4.6) ** 2 < 1 ? null : (x + y) % 9 === 0 ? '#ffffff' : c)); return true;
      case 'rug:round': F.ell(66, 64, 24, 5.5, (x, y) => { const d = Math.sqrt(((x - 66) / 24) ** 2 + ((y - 64) / 5.5) ** 2); return d > 0.82 ? dk : d > 0.6 ? lt : d > 0.35 ? c : '#ffd23f'; }); return true;
      // gadgets
      case 'gadget:drums': F.disc(88, 51, 7, c); F.disc(88, 51, 5.4, '#f6f2e8'); F.glyph(GLYPH.star[0], 86, 49, { '#': c }); F.ell(80, 44, 4, 1.4, '#c9d0e2'); F.rect(76, 44, 8, 4, c); F.rect(79, 48, 1, 10, metal); F.line(95, 34, 101, 33, '#ffd23f'); F.line(98, 34, 98, 58, metal); F.rect(84, 57, 9, 2, metal); if (t % 4 < 2) s.glyph(GLYPH.note[0], 93, 28, { '#': '#ffe066' }); return true;
      case 'gadget:microscope': F.rect(78, 46, 22, 2, wood); F.rect(79, 48, 2, 10, shade(wood, -0.2)); F.rect(97, 48, 2, 10, shade(wood, -0.2)); F.rect(84, 43, 10, 3, '#566079'); F.rect(91, 33, 2, 10, c); F.line(91, 34, 86, 30, c); F.rect(84, 28, 3, 4, metal); F.rect(85, 32, 2, 6, metal); F.rect(83, 38, 8, 1, '#c9d0e2'); F.set(86, 37, '#6fe36f'); return true;
      case 'gadget:vending': F.rect(80, 29, 19, 30, c); F.rect(80, 29, 19, 1, lt); F.rect(82, 32, 11, 18, '#bff8ff', 0.45); for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) F.rect(83 + i * 3.5, 33 + j * 4.5, 2, 3, ['#ff5a5a', '#ffd23f', '#6fe36f', '#ff7ad9', '#ff9a3d', '#5ab4ff'][(i + j * 3) % 6]); F.rect(94, 33, 3, 6, '#14203a'); F.set(95, 34, '#3dffb0'); F.rect(94, 41, 3, 2, metal); F.rect(82, 52, 11, 4, '#14203a'); return true;
      case 'gadget:hologram': F.ell(89, 57, 7, 2, metal); F.rect(84, 54, 10, 3, '#5a6680'); F.rect(86, 53, 6, 1, c); s.poly([[86, 53], [92, 53], [100, 30], [78, 30]], c, 0.12); s.disc(89, 38, 6, c, 0.35); s.ring(89, 38, 9, 2.4, 0.8, c, 0.6); for (let y = 31; y < 46; y += 2) s.line(83, y, 95, y, '#ffffff', 0.12); s.set(87, 36, '#ffffff', 0.8); return 'drawn';
      case 'gadget:jukebox': F.rect(80, 38, 19, 21, c); F.ell(89.5, 38, 9.5, 8, c, 1, 'back'); F.ell(89.5, 39, 7, 5.6, '#14203a', 1, 'back'); for (let i = 0; i < 6; i++) F.rect(81 + i * 3, 41, 2, 7, RAINBOW[(i + t) % 6]); F.rect(82, 50, 15, 6, shade(c, -0.35)); for (let x = 83; x < 96; x += 2) F.rect(x, 51, 1, 4, shade(c, -0.6)); F.disc(89.5, 34, 2.4, '#ffd23f'); return true;
      case 'gadget:chess': F.rect(80, 48, 18, 3, wood); F.rect(87, 51, 4, 6, shade(wood, -0.2)); F.rect(83, 57, 12, 2, shade(wood, -0.2)); for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) F.rect(80 + i * 3, 46 + j, 3, 1, (i + j) % 2 ? '#f2f4fb' : '#2a2a40'); [[82, '#f2f4fb'], [86, '#f2f4fb'], [91, '#2a2a40'], [95, '#2a2a40']].forEach(([x, cc], i) => { F.rect(x, 42 - (i % 2), 2, 4 + (i % 2), cc); F.set(x, 41 - (i % 2), cc); }); return true;
      case 'gadget:gumball': F.rect(85, 46, 8, 13, c); F.rect(86, 49, 6, 3, '#c9d0e2'); F.rect(88, 50, 2, 1, '#566079'); F.rect(83, 57, 12, 2, shade(c, -0.3)); F.disc(89, 38, 7, '#bff8ff', 0.4); for (let i = 0; i < 16; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 5.5; F.disc(89 + Math.cos(a) * d, 40 + Math.sin(a) * d * 0.7, 1, RAINBOW[i % 6]); } F.rect(87, 30, 4, 2, c); return true;
      case 'gadget:robotarm': F.rect(80, 54, 14, 5, '#3a4766'); F.rect(84, 51, 6, 3, c); F.line(87, 51, 84, 40, c); F.line(88, 51, 85, 40, c); F.disc(84.5, 40, 2, '#3a4766'); F.line(84, 40, 95, 34, c); F.line(85, 41, 96, 35, c); F.disc(95.5, 34.5, 1.6, '#3a4766'); F.line(96, 35, 99, 40, metal); F.line(96, 35, 93, 40, metal); if (t % 4 < 2) F.rect(94, 40, 3, 3, '#ff7ad9'); return true;
      case 'gadget:keys': F.line(81, 58, 95, 46, metal); F.line(95, 58, 81, 46, metal); F.rect(76, 43, 26, 4, c); F.rect(77, 46, 24, 3, '#ffffff'); for (let x = 78; x < 101; x += 3) F.rect(x, 46, 1, 2, '#2a2e3d'); F.set(79, 44, '#ff5a5a'); F.set(81, 44, '#6fe36f'); return true;
      case 'gadget:throne': F.poly([[80, 58], [80, 32], [83, 27], [86, 31], [89, 25], [92, 31], [95, 27], [98, 32], [98, 58]], c); F.rect(80, 46, 18, 6, '#c41a3a'); F.rect(80, 46, 18, 1, '#ff6a7a'); F.rect(83, 34, 12, 11, '#c41a3a'); F.rect(78, 43, 3, 9, shade(c, -0.15)); F.rect(97, 43, 3, 9, shade(c, -0.15)); F.disc(89, 30, 1.4, '#5ad1ff'); F.set(83, 30, '#ff5ad9'); F.set(95, 30, '#6fe36f'); F.rect(81, 52, 16, 6, shade(c, -0.25)); s.disc(89, 42, 14, c, 0.1); return true;
      // pets: on the floor in the front left corner
      case 'pet:fishbowl':
        if (A.big) { F.rect(1, 50, 25, 19, '#bff8ff', 0.4); F.rect(2, 53, 23, 15, '#2a8fd8', 0.65); F.rect(1, 68, 25, 3, '#566079'); [[7, 57, '#ff7ad9'], [16, 60, '#ffd23f'], [11, 64, '#7ff0ff'], [20, 55, '#ff8a3d']].forEach(([x, y, cc], i) => { const xx = x + ((t + i * 2) % 6) - 3; F.ell(xx, y, 2, 1.2, cc); F.set(xx - 3, y, cc); }); F.line(4, 67, 5, 61, '#3f9a4e'); F.line(22, 67, 21, 60, '#3f9a4e'); return true; }
        F.disc(13, 62, 7.5, '#bff8ff', 0.4); F.ell(13, 63, 6.6, 5.4, '#2a8fd8', 0.6, 'front'); F.rect(8, 69, 10, 2, '#566079'); { const fx = 13 + ((t % 6) - 3); F.ell(fx, 64, 2, 1.3, c); F.poly([[fx - 2, 64], [fx - 4, 62.5], [fx - 4, 65.5]], c); F.set(fx + 1, 63.5, INK); } return true;
      case 'pet:hamster': F.rect(2, 56, 24, 14, '#ffffff', 0.08); for (let x = 2; x <= 26; x += 3) F.rect(x, 56, 1, 14, metal); F.rect(2, 55, 25, 1, metal); F.rect(1, 69, 27, 2, '#c0603a'); F.ring(19, 63, 4.5, 4.5, 1, '#ff7ad9'); F.ell(9, 66, 3, 2.2, c); F.set(10, 65, INK); F.set(7, 64, '#ffc4d6'); return true;
      case 'pet:slug': for (let x = 2; x < 9; x++) F.set(x, 70, '#bff8ff', 0.6); F.ell(15, 68, 7 + (t % 2), 2.6, c, 1, 'back'); F.rect(8, 68, 15, 2, c); F.line(19, 66, 21, 61, c); F.line(17, 66, 18, 61, c); F.set(21, 60, INK); F.set(18, 60, INK); F.set(16, 67, shade(c, 0.4)); return true;
      case 'pet:robodog': F.rect(5, 61, 13, 5, c); F.rect(16, 56, 7, 6, c); F.rect(17, 58, 1, 1, '#7ff0ff'); F.rect(20, 58, 1, 1, '#7ff0ff'); F.rect(22, 60, 2, 2, shade(c, -0.3)); F.rect(16, 54, 2, 2, shade(c, -0.3)); F.rect(6, 66, 2, 4, metal); F.rect(15, 66, 2, 4, metal); F.line(5, 61, 2, 56 + (t % 2), metal); F.set(2, 55 + (t % 2), '#ff5a5a'); return true;
      case 'pet:catbed': F.ell(13, 66, 11, 4.5, '#8a5a34'); F.ell(13, 64.5, 9, 2.6, '#e8d8c0'); F.ell(12, 63.5, 6, 3, c); F.poly([[15, 61], [16, 58], [18, 61]], c); F.poly([[18, 61.5], [19.5, 58.5], [20.5, 62]], c); F.ell(17.5, 62.5, 3, 2.4, c); F.line(16.5, 62.5, 18, 62.5, INK); s.set(21 + (t % 3), 56 - (t % 3), '#ffffff', 0.8); s.set(23 + (t % 3), 54 - (t % 3), '#ffffff', 0.6); return true;
      case 'pet:birdcage': F.rect(12, 62, 2, 8, metal); F.rect(8, 69, 10, 2, metal); F.ell(13, 56, 7, 7, (x, y) => (x % 2 === 0 ? '#c9b870' : null), 1, 'back'); for (let x = 6; x <= 20; x += 2) F.rect(x, 56, 1, 6, '#c9b870'); F.rect(6, 61, 15, 1, '#c9b870'); F.rect(12, 48, 2, 1, '#c9b870'); F.ell(12, 58, 2.4, 2, c); F.set(11, 57, INK); F.set(14, 58, '#ff9a3d'); return true;
      case 'pet:turtle': F.rect(2, 57, 23, 12, '#bff8ff', 0.35); F.rect(3, 63, 21, 6, '#2a8fd8', 0.55); F.ell(8, 66, 4, 2.4, '#9aa0ac'); F.rect(1, 69, 25, 2, '#566079'); F.ell(16, 63, 4, 2.6, c, 1, 'back'); F.rect(12, 63, 8, 1, shade(c, -0.25)); F.disc(21, 62.5, 1.4, '#9ad06a'); F.set(21, 62, INK); F.set(13, 64, '#9ad06a'); F.set(19, 64, '#9ad06a'); return true;
      case 'pet:ants': F.rect(3, 52, 20, 17, '#bff8ff', 0.3); F.rect(4, 55, 18, 13, c); for (let i = 0; i < 4; i++) F.line(5 + i * 4, 56 + (i % 2) * 3, 8 + i * 4, 66 - (i % 2) * 4, shade(c, -0.4)); F.rect(4, 61, 18, 1, shade(c, -0.4)); for (let i = 0; i < 5; i++) F.set(5 + ((i * 7 + t) % 17), 56 + ((i * 5) % 11), INK); F.rect(2, 68, 22, 2, wood); F.rect(2, 51, 22, 1, wood); return true;
      // the ceiling: hanging things
      case 'ceiling:mobile': F.rect(64, 0, 1, 5, metal); F.rect(54, 5, 21, 1, metal); [[55, 9, '#ffb24a', 2.4], [64, 12, '#5ab4ff', 3], [74, 8, '#ff7ad9', 2]].forEach(([x, y, cc, rr]) => { F.rect(x, 5, 1, y - rr - 5, metal); F.disc(x + 0.5, y, rr, cc); F.set(x - 0.5, y - 1, shade(cc, 0.4)); }); F.ring(64.5, 12, 5, 1.2, 0.8, '#ffe066'); return true;
      case 'ceiling:disco': F.rect(64, 0, 1, 6, metal); F.disc(64.5, 11, 5, (x, y) => ((x + y) % 2 ? '#e8ecf8' : '#8a94b8')); F.set(62, 9, '#ffffff'); for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + t * 0.3; s.set(64 + Math.cos(a) * (18 + (i % 3) * 9), 16 + Math.sin(a) * 9 + 12, RAINBOW[i % 6], 0.7); } return true;
      case 'ceiling:lights': for (let x = 0; x < BW; x++) { const y = 2 + Math.round(Math.sin((x / BW) * Math.PI * 3) ** 2 * 5); F.set(x, y, '#2a3040'); if (x % 7 === 3) { F.rect(x, y + 1, 1, 2, (Math.floor(x / 7) + t) % 3 ? c : '#ffffff'); s.disc(x, y + 2, 2.4, c, 0.25); } } return true;
      case 'ceiling:lanterns': [[52, 8], [64, 12], [76, 8]].forEach(([x, y]) => { F.rect(x, 0, 1, y - 3, metal); F.ell(x + 0.5, y, 3.6, 4, c); F.rect(x - 2, y - 4, 5, 1, '#ffd23f'); F.rect(x - 2, y + 4, 5, 1, '#ffd23f'); for (let j = -2; j <= 2; j += 2) F.rect(x + j, y - 3, 1, 7, shade(c, -0.2)); s.disc(x + 0.5, y, 6, '#ffb24a', 0.15); }); return true;
      case 'ceiling:hangplant': F.line(64, 0, 59, 10, '#c9a870'); F.line(64, 0, 69, 10, '#c9a870'); F.ell(64, 12, 6, 3, '#c0603a'); F.rect(58, 10, 13, 2, '#c0603a'); for (let j = 0; j < 6; j++) { const x = 58 + j * 2.4; for (let q = 0; q < 6 + (j % 3) * 2; q++) F.set(x + Math.sin(q * 0.8 + j) * 0.8, 12 + q, q % 2 ? c : shade(c, -0.3)); } return true;
      case 'ceiling:rocket': F.rect(64, 0, 1, 4, metal); F.rect(62, 4, 5, 8, '#eef2ff'); F.poly([[62, 4], [64.5, 0.5], [67, 4]], c); F.poly([[62, 10], [60, 13], [62, 12]], c); F.poly([[67, 10], [69, 13], [67, 12]], c); F.disc(64.5, 7, 1, '#7ff0ff'); flame(s, 64, 12, 2, 4, '#ffb24a', t); return true;
      case 'ceiling:garland': for (let x = 2; x < BW - 2; x++) { const y = 2 + Math.round(Math.sin(((x - 2) / (BW - 4)) * Math.PI * 4) ** 2 * 4); F.set(x, y, '#c9a870'); if (x % 9 === 4) F.glyph(GLYPH.star[0], x - 2, y + 1, { '#': [c, '#ff7ad9', '#7ff0ff'][Math.floor(x / 9) % 3] }); } return true;
      case 'ceiling:chandelier': F.rect(64, 0, 1, 5, '#c49a10'); F.ell(64.5, 9, 9, 2.4, '#c49a10', 1, 'front'); F.rect(56, 8, 18, 1, '#ffd23f'); [56, 60, 64, 68, 73].forEach((x, i) => { F.rect(x, 5, 1, 3, '#fff6c8'); s.disc(x + 0.5, 4, 1.8, '#ffe066', 0.4); F.set(x, 11 + (i % 2), c); F.set(x, 13 + (i % 2), c); }); F.disc(64.5, 13, 1.6, c); s.disc(64, 9, 13, c, 0.1); return true;
      default: return false;
    }
  }
  function furniture(s, slot, A, t, o) {
    o = o || {};
    const c = A.color, dk = shade(c, -0.4), lt = shade(c, 0.35), wood = '#8a5a34', metal = '#8a94b8';
    const F = surf(BW, BH);
    const done = moreFurniture(s, F, slot, A, t, o, { c, dk, lt, wood, metal });
    if (done === 'drawn') return;
    if (!done) switch (slot) {
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
        if (A.kind !== 'floor' && A.kind !== 'neon' && !o.desk) { F.rect(112, 42, 12, 2, wood); F.rect(113, 44, 2, 13, shade(wood, -0.2)); F.rect(121, 44, 2, 13, shade(wood, -0.2)); }
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
    ['pet', 'ceiling'].forEach(slot => { const it = show(slot) && item(eq[slot]); if (it) furniture(s, slot, it.art, t, {}); });
    return s.to(cv);
  }

  // ---------- thumbnails ----------
  // 7.6: every shelf shows the thing itself, big, so no two tiles look alike. The item's own page still
  // tries it on the voyager's ship, creature or cabin.
  const SHIP_SLOTS = ['hull', 'wing', 'engine', 'paint', 'decal', 'trail'], WEAR_SLOTS = ['hat', 'face', 'neck', 'hold', 'cape', 'aura', 'buddy'];
  const CABIN_SLOTS = ['wall', 'floor', 'window', 'bed', 'desk', 'lamp', 'plant', 'shelf', 'poster', 'rug', 'gadget', 'pet', 'ceiling'];
  function pick(eq, slots) { const o = {}; slots.forEach(k => { if (eq && eq[k]) o[k] = eq[k]; }); return o; }
  // the pixels of a pattern, alone, in a box of w×h
  function alone(rows, pal, w, h, glass) {
    const o = surf(w, h), x = Math.floor((w - rows[0].length) / 2), y = Math.floor((h - rows.length) / 2);
    rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.' && !(glass && ch === 'g')) o.set(x + i, y + j, pal[ch] || pal.a || pal['#']); }));
    o.outline(INK);
    o.halo(o.mask(), 1, () => ['#c9d6ff', 0.28]);
    if (glass) rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch === 'g') o.set(x + i, y + j, pal.g || '#bff8ff', 0.55); }));
    return o;
  }
  function trimmed(full, pad) {
    let x0 = full.W, x1 = -1, y0 = full.H, y1 = -1;
    for (let y = 0; y < full.H; y++) for (let x = 0; x < full.W; x++) if (full.on(x, y)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    if (x1 < 0) return full;
    pad = pad || 2;
    x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(full.W - 1, x1 + pad); y1 = Math.min(full.H - 1, y1 + pad);
    return cropOf(full, [x0, y0, x1 - x0 + 1, y1 - y0 + 1]);
  }
  function wearThumb(it, ctx) {
    const A = it.art, D = SD();
    switch (it.slot) {
      case 'hat': return D.HAT_SHAPES[A.shape] ? alone(D.HAT_SHAPES[A.shape], A.pal, 18, 13) : null;
      case 'face': { const S = D.FACE_SHAPES && D.FACE_SHAPES[A.shape]; return S ? alone(S.rows, A.pal, 18, 11, true) : null; }
      case 'neck': { const R = D.NECK_SHAPES && D.NECK_SHAPES[A.shape]; return R ? alone(R, A.pal, 16, 11) : null; }
      case 'hold': { const R = D.HOLD_SHAPES && D.HOLD_SHAPES[A.shape]; return R ? alone(R, A.pal, 14, 13) : null; }
      case 'buddy': { const o = surf(18, 18); o.blit(buddyLayer(A, ctx.t || 0), 2, 1); o.halo(o.mask(), 1, () => ['#c9d6ff', 0.22]); return o; }
      case 'cape': {
        const o = surf(24, 22), top = 3, bot = 19, xl = 2, xr = 21, r = rng(hash(it.id));
        o.poly([[7, top], [17, top], [xr, bot + 1], [xl, bot + 1]], (x, y) => {
          const f = CAPE_PAT[A.pattern];
          if (f) return f(A, x, y, top, bot, xl, xr);
          if (A.pattern === 'stars' || A.pattern === 'galaxy') { const v = r(); return v < 0.1 ? A.c2 : v < 0.14 && A.pattern === 'galaxy' ? '#ffffff' : A.c1; }
          return y >= bot ? A.c2 : A.c1;
        });
        o.rect(6, top - 1, 12, 2, shade(A.c1, -0.3)); o.rect(11, top - 1, 2, 2, '#ffd23f');
        for (let x = xl; x <= xr; x++) if (x % 4 === 0) o.set(x, bot + 1, A.c1);
        o.outline(INK); return o;
      }
      default: return null;
    }
  }
  function decalThumb(it) {
    const [rows, gc] = glyphOf(it.art.shape), letter = String(it.art.shape).startsWith('ch:');
    const o = surf(15, 13);
    o.rect(1, 1, 13, 11, '#1a2350'); o.rect(1, 1, 13, 1, '#2a3a7a'); o.rect(1, 11, 13, 1, '#10173a');
    o.glyph(rows, 7 - Math.floor(rows[0].length / 2), 6 - Math.floor(rows.length / 2), { '#': letter ? it.art.color || gc : gc, k: INK, w: '#ffffff' });
    o.outline('#7ff0ff', 0.5);
    return o;
  }
  // ctx: { cid, stage, equip, hat } — the voyager the item is tried on (or nobody)
  function thumb(cv, it, ctx) {
    ctx = ctx || {};
    const eq = ctx.equip || {};
    if (it.shop === 'cards') return card(cv, it, { locked: ctx.locked, t: ctx.t });
    if (SHIP_SLOTS.includes(it.slot)) {
      if (it.slot === 'decal') return decalThumb(it).to(cv);
      // a hull in its own factory colours; wings on the plain hull; paints and trails on the voyager's ship
      const e2 = it.slot === 'hull' ? { hull: it.id } : it.slot === 'wing' ? { wing: it.id } : it.slot === 'engine' ? { engine: it.id }
        : Object.assign(pick(eq, ['hull', 'wing', 'engine']), { [it.slot]: it.id });
      const full = ship(null, e2, { t: ctx.t });
      if (it.slot === 'trail') return cropOf(full, [0, 6, 52, 28]).to(cv);
      if (it.slot === 'engine') { const tr = trimmed(full, 1); return cropOf(tr, [0, 0, Math.min(tr.W, 34), tr.H]).to(cv); }
      return trimmed(full, 2).to(cv);
    }
    if (WEAR_SLOTS.includes(it.slot)) {
      if (it.slot !== 'aura') { const w = wearThumb(it, ctx); if (w) return w.to(cv); }
      // an aura glows around the voyager's creature, drawn dark so the light shows
      const d = dressed(null, 'cid' in ctx ? ctx.cid : 0, ctx.stage || 1, { [it.slot]: it.id }, { t: ctx.t, silhouette: it.slot === 'aura' });
      return cropOf(d, [2, 2, 44, 42]).to(cv);
    }
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

  root.CQShopArt = { ship, dressed, card, cabin, thumb, zib, buddy: buddyLayer, paintOf, surf, mix, shade, hsl, lum, RAINBOW, REGION, SHIP: [SW, SH], DRESSED: [CW, CH], CABIN: [BW, BH], CARD: KW };
})(typeof self !== 'undefined' ? self : globalThis);
