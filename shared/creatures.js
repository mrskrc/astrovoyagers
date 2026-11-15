/* ASTROVOYAGERS · creatures
   80 original pixel space creatures (10 types × 8) plus 10 legendaries, each with three evolution stages,
   built procedurally on a 32×32 grid. Works in the browser (self.CQCreatures)
   and in Node (module.exports) so the extension icons can be rendered too. */
(function (root) {
  'use strict';

  const N = 32;

  const TYPES = {
    leaf:  { label: 'Leaf',  bg: '#2f8f4e', ink: '#ffffff' },
    ember: { label: 'Ember', bg: '#d9482b', ink: '#ffffff' },
    tide:  { label: 'Tide',  bg: '#2a6fd0', ink: '#ffffff' },
    spark: { label: 'Spark', bg: '#f2c230', ink: '#3b2a00' },
    stone: { label: 'Stone', bg: '#8a6c55', ink: '#ffffff' },
    frost: { label: 'Frost', bg: '#8fd8ea', ink: '#073542' },
    sky:   { label: 'Sky',   bg: '#5d8fe0', ink: '#ffffff' },
    moon:  { label: 'Moon',  bg: '#5b43b8', ink: '#ffffff' },
    bloom: { label: 'Bloom', bg: '#de5597', ink: '#ffffff' },
    metal: { label: 'Metal', bg: '#566479', ink: '#ffffff' }
  };
  const TYPE_ORDER = ['leaf', 'ember', 'tide', 'spark', 'stone', 'frost', 'sky', 'moon', 'bloom', 'metal'];

  // Default colour of head/side features per type: [hue, sat, light]; null = derived from the body.
  const TYPE_FEAT = {
    leaf: [112, 55, 45], ember: [30, 100, 56], tide: null, spark: [54, 100, 62], stone: [195, 45, 74],
    frost: [192, 80, 86], sky: [210, 30, 97], moon: [45, 85, 70], bloom: [0, 0, 98], metal: [42, 70, 55]
  };

  // name, type, hue, sat, light, body shape, eyes, mouth, head feature, side feature, pattern, blush, feature colour
  const RAW = [
    ['Sprig', 'leaf', 158, 52, 60, 'round', 'dot', 'smile', 'leaf', 'arms', 'belly', 1],
    ['Mossy', 'leaf', 96, 42, 48, 'slime', 'sleepy', 'tiny', 'tuft', 'none', 'spots', 0],
    ['Fernlet', 'leaf', 128, 48, 54, 'egg', 'big', 'open', 'cat', 'wings', 'belly', 0],
    ['Budbun', 'leaf', 84, 55, 58, 'pear', 'happy', 'cat', 'long', 'arms', 'stripes', 1],
    ['Clover', 'leaf', 142, 42, 44, 'block', 'shine', 'smile', 'flower', 'arms', 'none', 0, [0, 0, 98]],

    ['Cinder', 'ember', 14, 72, 54, 'round', 'big', 'fang', 'flame', 'arms', 'belly', 0],
    ['Sizzle', 'ember', 26, 85, 58, 'egg', 'happy', 'open', 'flame', 'wings', 'spots', 1],
    ['Smoulder', 'ember', 4, 58, 44, 'block', 'sleepy', 'smile', 'horns', 'arms', 'stripes', 0],
    ['Ashby', 'ember', 20, 18, 50, 'slime', 'dot', 'tiny', 'flame', 'none', 'spots', 0],
    ['Flicker', 'ember', 36, 90, 60, 'tall', 'shine', 'cat', 'cat', 'arms', 'belly', 1],

    ['Ripple', 'tide', 205, 68, 58, 'round', 'big', 'smile', 'fin', 'fins', 'belly', 0],
    ['Splish', 'tide', 190, 62, 62, 'slime', 'happy', 'open', 'antenna', 'none', 'spots', 1],
    ['Coral', 'tide', 354, 62, 70, 'egg', 'dot', 'cat', 'crystal', 'fins', 'belly', 0, [8, 75, 80]],
    ['Puddle', 'tide', 216, 52, 52, 'pear', 'sleepy', 'tiny', 'none', 'fins', 'stripes', 0],
    ['Marlo', 'tide', 226, 58, 42, 'tall', 'shine', 'fang', 'fin', 'fins', 'mask', 0],

    ['Zappo', 'spark', 50, 95, 58, 'round', 'big', 'open', 'antenna', 'arms', 'belly', 0],
    ['Fizzle', 'spark', 58, 82, 62, 'slime', 'happy', 'smile', 'crystal', 'none', 'stripes', 0, [54, 100, 82]],
    ['Volta', 'spark', 42, 88, 55, 'block', 'shine', 'cat', 'cat', 'arms', 'mask', 0],
    ['Glimmer', 'spark', 50, 60, 76, 'egg', 'dot', 'tiny', 'tuft', 'wings', 'spots', 1],
    ['Buzzby', 'spark', 46, 90, 52, 'pear', 'big', 'fang', 'antenna', 'wings', 'stripes', 0, [200, 45, 90]],

    ['Pebble', 'stone', 30, 12, 64, 'round', 'dot', 'smile', 'none', 'arms', 'spots', 1],
    ['Cobble', 'stone', 25, 14, 50, 'block', 'sleepy', 'tiny', 'crystal', 'arms', 'spots', 0],
    ['Gravel', 'stone', 36, 24, 46, 'slime', 'big', 'cat', 'horns', 'none', 'stripes', 0],
    ['Rocco', 'stone', 18, 30, 40, 'block', 'shine', 'fang', 'horns', 'arms', 'belly', 0],
    ['Shale', 'stone', 212, 12, 48, 'tall', 'happy', 'open', 'crystal', 'none', 'mask', 0],

    ['Flurry', 'frost', 196, 55, 82, 'round', 'big', 'tiny', 'crystal', 'arms', 'belly', 1],
    ['Sleet', 'frost', 202, 34, 70, 'egg', 'sleepy', 'smile', 'round', 'none', 'spots', 0],
    ['Icelet', 'frost', 186, 58, 74, 'block', 'dot', 'cat', 'crystal', 'arms', 'stripes', 0],
    ['Snowby', 'frost', 210, 22, 92, 'slime', 'happy', 'open', 'tuft', 'none', 'none', 1, [200, 45, 78]],
    ['Rime', 'frost', 190, 44, 58, 'tall', 'shine', 'fang', 'horns', 'wings', 'mask', 0],

    ['Breeze', 'sky', 168, 44, 70, 'round', 'happy', 'smile', 'tuft', 'wings', 'belly', 0],
    ['Nimbus', 'sky', 220, 24, 86, 'slime', 'sleepy', 'tiny', 'none', 'wings', 'none', 1, [220, 35, 99]],
    ['Gusty', 'sky', 200, 58, 64, 'egg', 'big', 'open', 'tuft', 'wings', 'stripes', 0],
    ['Cirrus', 'sky', 238, 40, 76, 'pear', 'dot', 'cat', 'long', 'wings', 'belly', 0],
    ['Wisp', 'sky', 262, 28, 88, 'tall', 'shine', 'tiny', 'antenna', 'wings', 'none', 0],

    ['Luno', 'moon', 254, 52, 52, 'round', 'shine', 'smile', 'horns', 'arms', 'belly', 0],
    ['Eclipse', 'moon', 268, 32, 30, 'block', 'big', 'fang', 'horns', 'wings', 'stripes', 0],
    ['Nocturn', 'moon', 244, 42, 38, 'egg', 'big', 'tiny', 'cat', 'wings', 'mask', 0],
    ['Dusky', 'moon', 286, 38, 56, 'slime', 'sleepy', 'cat', 'long', 'none', 'spots', 0],
    ['Starla', 'moon', 234, 58, 66, 'tall', 'happy', 'open', 'antenna', 'arms', 'belly', 1],

    ['Petal', 'bloom', 340, 72, 76, 'round', 'big', 'smile', 'flower', 'arms', 'belly', 1],
    ['Posy', 'bloom', 322, 52, 68, 'egg', 'happy', 'cat', 'round', 'arms', 'spots', 1],
    ['Tulip', 'bloom', 350, 68, 60, 'tall', 'dot', 'tiny', 'leaf', 'none', 'belly', 0, [112, 55, 45]],
    ['Marigold', 'bloom', 32, 90, 64, 'pear', 'shine', 'open', 'flower', 'wings', 'none', 0, [48, 100, 62]],
    ['Lilac', 'bloom', 284, 44, 72, 'slime', 'sleepy', 'smile', 'flower', 'none', 'spots', 1, [300, 60, 88]],

    ['Rivet', 'metal', 214, 14, 62, 'block', 'shine', 'tiny', 'antenna', 'arms', 'stripes', 0],
    ['Cogsby', 'metal', 30, 42, 54, 'round', 'big', 'smile', 'horns', 'arms', 'belly', 0],
    ['Sprocket', 'metal', 204, 24, 46, 'block', 'dot', 'cat', 'fin', 'arms', 'mask', 0],
    ['Tinker', 'metal', 188, 20, 70, 'egg', 'happy', 'open', 'antenna', 'none', 'spots', 0],
    ['Alloy', 'metal', 226, 20, 36, 'tall', 'sleepy', 'fang', 'crystal', 'wings', 'belly', 0],

    // Legendary (unlocked by the Observatory, level 10 and up)
    ['Lumina', 'sky', 46, 88, 78, 'round', 'shine', 'smile', 'crystal', 'wings', 'belly', 1, [48, 100, 86], 1],
    ['Tempest', 'spark', 232, 66, 52, 'tall', 'shine', 'fang', 'antenna', 'wings', 'stripes', 0, [54, 100, 62], 1],
    ['Glacius', 'frost', 196, 72, 70, 'block', 'shine', 'tiny', 'crystal', 'arms', 'mask', 0, [190, 90, 88], 1],
    ['Verdano', 'leaf', 142, 58, 40, 'pear', 'shine', 'smile', 'flower', 'wings', 'belly', 0, [330, 85, 76], 1],
    ['Infernix', 'ember', 2, 78, 48, 'round', 'shine', 'fang', 'flame', 'wings', 'mask', 0, null, 1],
    ['Abyssa', 'tide', 238, 58, 30, 'egg', 'big', 'tiny', 'fin', 'fins', 'spots', 0, [176, 90, 58], 1],
    ['Nebula', 'moon', 282, 58, 42, 'slime', 'shine', 'smile', 'antenna', 'none', 'spots', 1, [320, 90, 72], 1],
    ['Prism', 'bloom', 300, 40, 86, 'block', 'big', 'cat', 'crystal', 'wings', 'none', 0, [180, 80, 80], 1],
    ['Titanox', 'metal', 212, 24, 40, 'block', 'shine', 'fang', 'horns', 'arms', 'stripes', 0, [45, 90, 56], 1],
    ['Chronos', 'stone', 40, 45, 50, 'tall', 'sleepy', 'tiny', 'horns', 'wings', 'belly', 0, [48, 95, 62], 1],

    // 7.8: thirty more (three for every type), with new bodies, faces and parts. New ones go at the END: the number is the creature's id.
    ['Shroomy', 'leaf', 8, 68, 58, 'mushroom', 'dot', 'smile', 'none', 'arms', 'spots', 1],
    ['Thistle', 'leaf', 150, 42, 50, 'drop', 'lash', 'tiny', 'spikes', 'claws', 'freckles', 0, [300, 60, 70]],
    ['Bamboo', 'leaf', 100, 50, 60, 'tall', 'oval', 'grin', 'sprout', 'ears', 'half', 0],
    ['Blaze', 'ember', 8, 85, 56, 'drop', 'star', 'grin', 'flame', 'tail', 'belly', 0],
    ['Magmo', 'ember', 350, 60, 36, 'gem', 'big', 'fang', 'spikes', 'claws', 'spots', 0, [40, 100, 60]],
    ['Toasty', 'ember', 32, 70, 66, 'cloud', 'happy', 'tongue', 'puff', 'arms', 'freckles', 1, [20, 90, 60]],
    ['Bubbles', 'tide', 180, 60, 70, 'cloud', 'oval', 'o', 'antenna', 'fins', 'belly', 1],
    ['Squidly', 'tide', 300, 45, 66, 'ghost', 'big', 'tiny', 'fin', 'tentacles', 'spots', 0],
    ['Clawdia', 'tide', 5, 70, 58, 'round', 'dot', 'smile', 'antenna', 'claws', 'belly', 0, [5, 80, 50]],
    ['Twinkle', 'spark', 52, 95, 66, 'star', 'happy', 'smile', 'none', 'none', 'none', 1],
    ['Jolt', 'spark', 190, 80, 58, 'gem', 'star', 'grin', 'mohawk', 'tail', 'stripes', 0, [54, 100, 62]],
    ['Wattson', 'spark', 44, 80, 60, 'block', 'lash', 'wave', 'star', 'ears', 'freckles', 0],
    ['Boulder', 'stone', 20, 16, 44, 'gem', 'sleepy', 'grin', 'antlers', 'arms', 'spots', 0],
    ['Geode', 'stone', 270, 25, 40, 'block', 'shine', 'tiny', 'crystal', 'claws', 'starmark', 0, [290, 80, 72]],
    ['Dusty', 'stone', 38, 30, 66, 'cloud', 'dot', 'wave', 'puff', 'none', 'freckles', 1, [38, 25, 82]],
    ['Icicle', 'frost', 200, 60, 80, 'drop', 'oval', 'tiny', 'unicorn', 'wings', 'belly', 0],
    ['Pompom', 'frost', 215, 20, 95, 'cloud', 'happy', 'tongue', 'bow', 'arms', 'none', 1, [350, 80, 70]],
    ['Frostbite', 'frost', 185, 50, 62, 'ghost', 'big', 'fang', 'spikes', 'tentacles', 'half', 0],
    ['Comet', 'sky', 195, 70, 66, 'star', 'big', 'open', 'none', 'tail', 'belly', 0],
    ['Halo', 'sky', 48, 30, 94, 'ghost', 'happy', 'smile', 'halo', 'wings', 'none', 1, [48, 90, 70]],
    ['Puffin', 'sky', 215, 40, 40, 'egg', 'dot', 'beak', 'mohawk', 'wings', 'belly', 1, [25, 100, 58]],
    ['Boo', 'moon', 260, 25, 90, 'ghost', 'oval', 'o', 'none', 'arms', 'none', 1],
    ['Batty', 'moon', 275, 40, 36, 'round', 'big', 'fang', 'cat', 'wings', 'heart', 0, [330, 70, 60]],
    ['Orbit', 'moon', 240, 50, 58, 'gem', 'star', 'smile', 'halo', 'none', 'starmark', 0],
    ['Cupid', 'bloom', 345, 75, 74, 'drop', 'heart', 'smile', 'bow', 'wings', 'heart', 1],
    ['Dahlia', 'bloom', 310, 60, 60, 'cloud', 'lash', 'tongue', 'flower', 'ears', 'freckles', 1],
    ['Peachy', 'bloom', 18, 85, 74, 'pear', 'happy', 'o', 'sprout', 'arms', 'belly', 1],
    ['Gizmo', 'metal', 200, 25, 60, 'gem', 'oval', 'wave', 'star', 'claws', 'half', 0, [50, 95, 60]],
    ['Boltz', 'metal', 215, 15, 50, 'block', 'star', 'grin', 'unicorn', 'ears', 'stripes', 0, [10, 80, 58]],
    ['Chrome', 'metal', 220, 10, 82, 'drop', 'lash', 'tiny', 'mohawk', 'tail', 'mask', 0, [190, 90, 60]]
  ];

  const LIST = RAW.map((r, i) => ({
    id: i, name: r[0], type: r[1], h: r[2], s: r[3], l: r[4], shape: r[5], eye: r[6], mouth: r[7],
    head: r[8], side: r[9], pattern: r[10], blush: !!r[11], f: r[12] || null, legendary: !!r[13]
  }));
  const LEGEND = { label: 'Legendary', bg: '#f0b429', ink: '#3b2a00' };

  // ---------- hats (drawn on top of the head) ----------
  const HAT_ART = {
    // Antenna Band
    leaf: { pal: { p: '#ff7ad9', P: '#d05aa8', l: '#8a94b8', b: '#5ad1ff', B: '#2a8fd8' }, rows: ['.pp......pp.', '.pP......pP.', '..l......l..', '...l....l...', '..bbbbbbbb..', '..BBBBBBBB..'] },
    // Star Halo
    flower: { pal: { y: '#ffe066', Y: '#f0a500', w: '#ffffff', g: '#7ff0ff' }, rows: ['..y...y...y.', '.yww.yww.yww', '..Y...Y...Y.', 'gggggggggggg'] },
    // Star Crown
    crown: { pal: { y: '#ffcf3a', Y: '#d9a011', r: '#ff7ad9', b: '#5ad1ff', w: '#fff6c8' }, rows: ['y....yy....y', 'yy..yyyy..yy', 'ywyyyyyyyyyy', 'yryyybbyyyry', 'yyyyyyyyyyyy', 'YYYYYYYYYYYY'] },
    // Cosmic Hat
    wizard: { pal: { p: '#3a4fd8', P: '#25348f', s: '#ffe066', w: '#ffffff' }, rows: ['......pp....', '.....ppw....', '.....pp.....', '....pppp....', '....psppp...', '...ppppwpp..', '...pppppsp..', '..ppwpppppp.', '.PPPPPPPPPP.', 'PPPPPPPPPPPP'] },
    // Astro Helmet
    helm: { pal: { r: '#ff5a5a', w: '#f2f5fb', W: '#ffffff', g: '#c3c9dc', G: '#858fab', c: '#7ff0ff' }, rows: ['.....r......', '.....g......', '...wwwwww...', '..wWwwwwww..', '.wWwwwwwwwg.', '.wwwwwwwwgg.', 'GcGGGGGGGGcG'] },
    // Star Visor (Fashion Lab)
    visor: { pal: { y: '#ffe066', Y: '#f0a500', b: '#3a4fd8', B: '#25348f', c: '#7ff0ff', w: '#e6fdff' }, rows: ['.....y......', '....yYy.....', '.....y......', 'bbbbbbbbbbbb', 'BccwccccwccB', '.cccccccccc.'] },
    // Headphones (Fashion Lab)
    phones: { pal: { g: '#c3c9dc', G: '#858fab', r: '#ff5a5a', R: '#c23b3b', w: '#ffc4c4' }, rows: ['...gggggg...', '..gG....Gg..', '.gG......Gg.', 'rrr......rrr', 'rwR......rwR', 'rRR......rRR'] },
    // UFO Cap (Fashion Lab)
    ufo: { pal: { c: '#7ff0ff', w: '#ffffff', g: '#c9d0e2', G: '#858fab', y: '#ffe066' }, rows: ['....cccc....', '...cwccccc..', '..cccccccc..', 'gggggggggggg', 'GyGGyGGyGGyG', '.GGGGGGGGGG.'] }
  };
  // ---------- material icons: metal, crystal, stardust (keys stay wood, stone, gold) ----------
  const ICON_ART = {
    wood: { pal: { m: '#c9d0e2', M: '#858fab', l: '#eef1f8', b: '#5f6a8a' }, rows: ['lllllllll.', 'lmbmmmbmmM', 'lmmmmmmmmM', 'lmbmmmbmmM', '.MMMMMMMMM'] },
    stone: { pal: { c: '#5ad1ff', C: '#2a8fd8', w: '#e6fbff', d: '#1d5f9a' }, rows: ['...c...', '..cwc..', '.cCwCc.', 'cCCwCCc', '.cCCCd.', '..cCd..', '...d...'] },
    gold: { pal: { y: '#ffe066', Y: '#f0a500', w: '#fff6c8' }, rows: ['....y....', '...yYy...', 'yyyYwYyyy', '.yYYwYYy.', '..yYYYy..', '.yYy.yYy.', '.yy...yy.'] }
  };
  function artPixels(art, outline) {
    const h = art.rows.length, w = art.rows[0].length;
    const W2 = w + 2, H2 = h + 2, px = new Array(W2 * H2).fill(null);
    art.rows.forEach((row, y) => { for (let x = 0; x < w; x++) if (row[x] !== '.') px[(y + 1) * W2 + x + 1] = art.pal[row[x]]; });
    const out = px.slice();
    for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
      if (px[y * W2 + x]) continue;
      const n = (xx, yy) => xx >= 0 && yy >= 0 && xx < W2 && yy < H2 && px[yy * W2 + xx];
      if (n(x - 1, y) || n(x + 1, y) || n(x, y - 1) || n(x, y + 1)) out[y * W2 + x] = outline;
    }
    return { w: W2, h: H2, px: out };
  }

  // ---------- colour ----------
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function hsl(h, s, l) {
    h = ((h % 360) + 360) % 360; s = clamp(s, 0, 100) / 100; l = clamp(l, 0, 100) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
    let r, g, b;
    if (h < 60) { r = c; g = x; b = 0; } else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; } else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; } else { r = c; g = 0; b = x; }
    const hx = v => { const t = Math.round((v + m) * 255).toString(16); return t.length < 2 ? '0' + t : t; };
    return '#' + hx(r) + hx(g) + hx(b);
  }
  // Shadows drift toward blue, highlights toward yellow.
  function coolDir(h) { h = ((h % 360) + 360) % 360; return (h > 60 && h < 240) ? 1 : -1; }
  function tri(h, s, l) {
    const d = coolDir(h);
    return [hsl(h, s, l), hsl(h + 10 * d, s + 4, l - 14), hsl(h - 8 * d, s - 6, l + 12)];
  }

  function palette(c) {
    const h = c.h, s = c.s, l = c.l, d = coolDir(h);
    const p = {};
    [p.body, p.shade, p.hi] = tri(h, s, l);
    p.belly = hsl(h - 10 * d, s * 0.45, Math.min(95, l + 26));
    p.bellyShade = hsl(h - 6 * d, s * 0.4, Math.min(88, l + 13));
    p.spot = hsl(h + 14 * d, s + 6, l - 20);
    p.line = hsl(h + 18 * d, Math.min(s, 50), clamp(l * 0.28, 9, 18));
    p.eye = '#17192b'; p.white = '#ffffff'; p.iris = hsl(h + 14 * d, Math.max(40, s), 34);
    p.mouth = '#2b1b2b'; p.tongue = '#ff7e96'; p.blush = '#ff9cb2'; p.inner = '#ffb2c3';
    const f = c.f || TYPE_FEAT[c.type] || [h, s, l - 10];
    [p.feat, p.featShade, p.featHi] = tri(f[0], f[1], f[2]);
    const horn = (c.type === 'moon' || c.type === 'frost' || c.type === 'metal') ? f : [40, 45, 88];
    [p.horn, p.hornShade, p.hornHi] = tri(horn[0], horn[1], horn[2]);
    const wing = c.type === 'moon' ? [h, s, l - 12] : f;
    [p.wing, p.wingShade, p.wingHi] = tri(wing[0], wing[1], wing[2]);
    [p.stem, p.stemShade, p.stemHi] = tri(112, 50, 40);
    p.stalk = hsl(h + 18 * d, Math.min(s, 40), 30);
    p.gem = hsl(h + 180, 80, 60); p.gemHi = '#ffffff';
    p.ball = c.type === 'spark' ? p.feat : p.gem; p.ballHi = '#ffffff';
    p.pollen = (f[0] >= 30 && f[0] <= 70 && f[1] > 50) ? '#b4501c' : '#ffcf3a';
    p.aura = '#ffd34d'; p.auraHi = '#ffffff';
    p.deep = hsl(h + 16 * d, s + 6, l - 24); p.glint = hsl(h - 12 * d, Math.max(0, s - 20), Math.min(97, l + 24));
    return p;
  }

  // ---------- shapes ----------
  const SIZES = [[12, 11], [16, 14], [20, 17]];
  function dims(shape, stage) {
    let w = SIZES[stage - 1][0], h = SIZES[stage - 1][1];
    if (shape === 'tall') { w -= 2; h += 2; }
    else if (shape === 'egg') { w -= 2; h += 1; }
    else if (shape === 'slime') { w += 2; h -= 2; }
    else if (shape === 'block') { h -= 1; }
    else if (shape === 'drop') { h += 2; }
    else if (shape === 'cloud') { w += 2; }
    else if (shape === 'star') { w += 4; h += 3; }
    else if (shape === 'mushroom') { w += 2; h += 1; }
    else if (shape === 'ghost') { h += 1; }
    return [w, h];
  }
  function shapeFn(shape) {
    switch (shape) {
      case 'egg': case 'tall':
        return (u, v) => { const s = 1 + 0.16 * v; return Math.hypot(u / s, v); };
      case 'pear':
        return (u, v) => { const s = 1 + 0.3 * v; return Math.hypot(u / s, v); };
      case 'block':
        return (u, v) => Math.pow(u ** 4 + v ** 4, 0.25);
      case 'slime':
        return (u, v) => {
          if (v < 0) return Math.hypot(u, v);
          const a = Math.abs(u) / (1 + 0.08 * v);
          return Math.pow(a ** 4 + v ** 4, 0.25);
        };
      case 'drop':
        return (u, v) => (v < 0 ? Math.hypot(u / Math.max(0.12, 1 + 0.8 * v), v) : Math.hypot(u, v));
      case 'ghost':
        return (u, v) => (v < 0 ? Math.hypot(u, v) : Math.max(Math.abs(u), v / (Math.cos(u * 9.42) > 0 ? 1 : 0.8)));
      case 'cloud':
        return (u, v) => Math.hypot(u, v) / (1 + 0.1 * Math.cos(Math.atan2(v, u) * 6 + 0.5));
      case 'gem':
        return (u, v) => Math.pow(Math.abs(u) ** 1.45 + Math.abs(v) ** 1.45, 1 / 1.45);
      case 'star':
        return (u, v) => Math.hypot(u, v) / (0.72 + 0.28 * Math.cos(Math.atan2(v, u) * 5 + Math.PI / 2));
      case 'mushroom':
        return (u, v) => (v < 0.15 ? Math.hypot(u, (v - 0.15) / 1.15) : Math.max(Math.abs(u) / 0.6, v));
      default:
        return (u, v) => Math.hypot(u, v);
    }
  }

  const EYES = {
    dot:    [['we', 'ee'], ['we', 'ee', 'ee'], ['we', 'ee', 'ee']],
    big:    [['wee', 'eee', 'eee'], ['wee', 'wee', 'eee', 'eee'], ['wee', 'wee', 'eee', 'eee']],
    happy:  [['.e.', 'e.e'], ['.e.', 'e.e'], ['.ee.', 'e..e']],
    sleepy: [['eee'], ['eee'], ['eeee']],
    shine:  [['wii', 'iee', 'iee'], ['wii', 'iee', 'iee', 'iii'], ['wii', 'iee', 'iee', 'iii']],
    ring:   [['www', 'wew', 'www'], ['wwww', 'weew', 'weew', 'wwww'], ['wwww', 'weew', 'weew', 'wwww']],
    star:   [['.e.', 'eee', '.e.'], ['.e.', 'ewe', '.e.'], ['.ee.', 'ewee', 'eeee', '.ee.']],
    oval:   [['we', 'ee', 'ee'], ['we', 'ee', 'ee', 'ee'], ['wee', 'eee', 'eee', 'eee']],
    heart:  [['i.i', 'iii', '.i.'], ['i.i', 'iii', '.i.'], ['ii.ii', 'iwiii', '.iii.', '..i..']],
    lash:   [['e..', '.we', '.ee'], ['e...', '.wee', '.eee'], ['e...', '.wee', '.eee', '.eee']]
  };
  const MOUTHS = {
    smile: [['m..m', '.mm.'], ['m..m', '.mm.'], ['m....m', '.mmmm.']],
    open:  [['mm', 'tt'], ['.mm.', 'mttm'], ['.mm.', 'mttm', '.mm.']],
    cat:   [['m.mm.m', '.m..m.'], ['m.mm.m', '.m..m.'], ['m.mm.m', '.m..m.']],
    fang:  [['m..m', '.mm.', '..w.'], ['m..m', '.mm.', '..w.'], ['m....m', '.mmmm.', '...w..']],
    tiny:  [['mm'], ['mm'], ['mmmm']],
    o:     [['mm', 'mm'], ['mm', 'mm'], ['.mm.', 'mttm', '.mm.']],
    grin:  [['mwwm', '.mm.'], ['mwwwwm', '.mmmm.'], ['mwwwwm', '.mmmm.']],
    tongue: [['mmmm', '.tt.'], ['mmmm', '.tt.'], ['mmmmmm', '..tt..', '..tt..']],
    wave:  [['m.m.', '.m.m'], ['m.m.m.', '.m.m.m'], ['m.m.m.', '.m.m.m']],
    beak:  [['pp', 'pp'], ['pppp', '.pp.'], ['pppp', 'pppp', '.pp.']]
  };
  const CH = { w: 'white', e: 'eye', i: 'iris', m: 'mouth', t: 'tongue', p: 'pollen' };

  const WINGS = [
    [[-1, 1], [0, 2], [1, 1]],
    [[-3, 1], [-2, 2], [-1, 3], [0, 4], [1, 3], [2, 2]],
    [[-5, 1], [-4, 2], [-3, 3], [-2, 4], [-1, 5], [0, 6], [1, 5], [2, 4], [3, 2]]
  ];
  const FINS = [[[0, 1], [1, 2]], [[0, 1], [1, 2], [2, 3], [3, 1]], [[-1, 1], [0, 2], [1, 3], [2, 4], [3, 2]]];
  const SPOTS = [[-0.66, 0.42], [0.52, 0.55], [0.66, -0.5], [-0.38, -0.66]];

  // ---------- build one creature ----------
  function build(c, stage, opts) {
    opts = opts || {};
    const g = new Array(N * N).fill(null);
    const mask = new Array(N * N).fill(false);
    const UV = new Array(N * N);
    const inb = (x, y) => x >= 0 && x < N && y >= 0 && y < N;
    const set = (x, y, k) => { x = Math.round(x); y = Math.round(y); if (inb(x, y)) g[y * N + x] = k; };
    const get = (x, y) => (inb(x, y) ? g[y * N + x] : null);
    const setM = (x, y, k) => { set(x, y, k); set(N - 1 - Math.round(x), y, k); };
    const isBody = (x, y) => inb(x, y) && mask[y * N + x];

    const [W, H] = dims(c.shape, stage);
    const bottom = c.shape === 'slime' ? 29 : 27;
    const top = bottom - H + 1;
    const cyc = top + H / 2;
    const metric = shapeFn(c.shape);

    for (let y = top; y <= bottom; y++) for (let x = 0; x < N; x++) {
      const u = (x + 0.5 - 16) / (W / 2), v = (y + 0.5 - cyc) / (H / 2), r = metric(u, v);
      if (r <= 1) { mask[y * N + x] = true; UV[y * N + x] = [u, v, r]; }
    }
    const topAt = x => { for (let y = 0; y < N; y++) if (isBody(x, y)) return y; return top; };
    const leftAt = y => {
      y = clamp(y, top, bottom);
      for (let x = 0; x < 16; x++) if (isBody(x, y)) return x;
      return 16;
    };

    // --- features behind the body ---
    if (c.shape !== 'slime' && c.shape !== 'ghost' && c.shape !== 'star') {
      const fw = stage === 3 ? 4 : 3, fxc = 16 - Math.round(W * 0.27), fx0 = fxc - Math.ceil(fw / 2);
      for (let y = bottom + 1; y <= bottom + 2; y++) for (let x = fx0; x < fx0 + fw; x++) setM(x, y, 'body');
    }

    if (c.side === 'arms') {
      const aw = stage, ah = stage === 3 ? 3 : 2, ya = Math.round(cyc + H * 0.12);
      for (let i = 0; i < ah; i++) {
        const y = ya + i, lx = leftAt(y), w = i === ah - 1 && aw > 1 ? aw - 1 : aw;
        for (let k = 1; k <= w; k++) setM(lx - k, y, 'body');
      }
    } else if (c.side === 'wings') {
      const yw = Math.round(cyc - H * 0.02);
      WINGS[stage - 1].forEach(([dy, w]) => {
        const y = yw + dy, lx = leftAt(y);
        for (let k = 1; k <= w; k++) setM(lx - k, y, 'wing');
      });
    } else if (c.side === 'fins') {
      const yf = Math.round(cyc + H * 0.05);
      FINS[stage - 1].forEach(([dy, w]) => {
        const y = yf + dy, lx = leftAt(y);
        for (let k = 1; k <= w; k++) setM(lx - k, y, 'feat');
      });
    }

    else if (c.side === 'ears') {
      const w = stage, hh = 2 + 2 * stage, y0 = Math.round(top + H * 0.22);
      for (let i = 0; i < hh; i++) { const lx = leftAt(y0 + i); for (let k = 1; k <= w + (i > 0 && i < hh - 1 ? 1 : 0); k++) setM(lx - k, y0 + i, k === 1 && i > 0 && i < hh - 1 ? 'inner' : 'body'); }
    } else if (c.side === 'claws') {
      const ya = Math.round(cyc + H * 0.1), lx = leftAt(ya);
      for (let k = 1; k <= stage; k++) setM(lx - k, ya, 'feat');
      const cx = lx - stage - 1;
      setM(cx, ya - 1, 'feat'); setM(cx - 1, ya - 2, 'feat'); setM(cx, ya + 1, 'feat'); setM(cx - 1, ya + 1, 'feat');
      if (stage > 1) { setM(cx - 1, ya - 1, 'feat'); setM(cx - 2, ya - 3, 'feat'); setM(cx - 2, ya + 2, 'feat'); }
    } else if (c.side === 'tail') {
      const yb = bottom - 1 - stage, rx = N - 1 - leftAt(yb);
      const pts = [[1, 0], [2, 0], [3, -1], [4, -2], [4, -3], [3, -4], [5, -1], [5, -3], [2, -5]].slice(0, 3 + stage * 2);
      pts.forEach(([dx, dy], i) => { set(rx + dx, yb + dy, i === pts.length - 1 ? 'feat' : 'body'); set(rx + dx, yb + dy + 1, i === pts.length - 1 ? 'feat' : 'body'); });
    } else if (c.side === 'tentacles') {
      for (let k = -2; k <= 2; k++) { const x = Math.round(15.5 + k * W * 0.2); for (let i = 0; i <= stage; i++) set(x + ((i + k + 4) % 2 ? 0 : (k < 0 ? -1 : 1)), bottom + i, 'body'); }
    }

    const head = {
      halo() {
        const cy = top - 1.6 - stage * 0.4, rx = 3 + stage, ry = 1.3;
        for (let y = Math.floor(cy - 2); y <= cy + 2; y++) for (let x = 0; x < N; x++) {
          const d = ((x + 0.5 - 16) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2;
          if (d <= 1.35 && d >= (stage === 1 ? 0.2 : 0.42)) set(x, y, (x + y) % 5 === 0 ? 'auraHi' : 'aura');
        }
      },
      unicorn() {
        const hh = 3 + 2 * stage;
        for (let i = 0; i < hh; i++) { const half = (1 - i / hh) * (0.7 + 0.35 * stage); for (let x = 0; x < N; x++) if (Math.abs(x + 0.5 - 16) <= half + 0.3) set(x, top + 1 - i, i % 2 ? 'horn' : 'hornShade'); }
      },
      bow() {
        const w = 1 + stage;
        for (let dx = 1; dx <= w; dx++) { const hh = Math.min(dx, 1 + (stage > 1 ? 1 : 0)); for (let dy = -hh; dy <= hh; dy++) setM(15 - dx, top - 1 + dy, 'feat'); }
        set(15, top - 1, 'featHi'); set(16, top - 1, 'featHi'); set(15, top, 'featShade'); set(16, top, 'featShade');
      },
      spikes() {
        for (let k = -stage; k <= stage; k++) {
          const xc = 16 + k * 2.6, hh = (1.5 + stage) * (1 - Math.abs(k) / (stage + 1.5)), base = topAt(Math.floor(xc)) + 1.2;
          for (let y = Math.floor(base - hh) - 1; y <= base; y++) for (let x = 0; x < N; x++) { const t = (base - (y + 0.5)) / hh; if (t >= 0 && t <= 1 && Math.abs(x + 0.5 - xc) <= 1.2 * (1 - t) + 0.2) set(x, y, 'feat'); }
        }
      },
      star() {
        const y0 = top - stage;
        for (let y = top; y >= y0; y--) setM(15, y, 'stalk');
        const rad = stage === 1 ? 1 : 2, cy = y0 - rad;
        for (let dy = -rad; dy <= rad; dy++) for (let x = 12; x <= 19; x++) { const dx = Math.min(Math.abs(x - 15), Math.abs(x - 16)); if (dx + Math.abs(dy) <= rad) set(x, cy + dy, dx + Math.abs(dy) === 0 ? 'auraHi' : 'aura'); }
      },
      antlers() {
        const hh = 2 + 2 * stage, xc = 16 - Math.round(W * 0.2), yb = topAt(xc);
        for (let i = 0; i < hh; i++) { const x = xc - Math.floor(i / 2); setM(x, yb - i, 'horn'); if (i === Math.floor(hh / 2)) { setM(x + 1, yb - i - 1, 'horn'); if (stage > 1) setM(x + 2, yb - i - 2, 'horn'); } if (i === hh - 1 && stage > 1) setM(x - 1, yb - i + 1, 'horn'); }
      },
      sprout() {
        const y0 = top - stage;
        for (let y = top; y >= y0; y--) setM(15, y, 'stem');
        const L = 1 + stage;
        for (let j = 1; j <= L; j++) for (let d = 0; d <= (j === L ? 0 : 1); d++) setM(15 - j, y0 - d - Math.floor(j / 2), 'feat');
      },
      puff() {
        const rad = 1.3 + 0.45 * stage;
        [[16, top - rad * 0.5, rad * 1.15], [16 - rad * 1.5, top + 0.4, rad], [16 + rad * 1.5, top + 0.4, rad]].forEach(([cx, cy, rr]) => {
          for (let y = Math.floor(cy - rr) - 1; y <= cy + rr + 1; y++) for (let x = 0; x < N; x++) if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= rr) set(x, y, 'feat');
        });
      },
      mohawk() {
        const half = 1 + stage;
        for (let x = 16 - half; x < 16 + half; x++) { const hh = Math.round((1.5 + stage) - Math.abs(x + 0.5 - 16) * 0.7), t0 = topAt(x); for (let i = 0; i <= hh; i++) set(x, t0 - i, (x + i) % 3 === 0 ? 'featHi' : 'feat'); }
      },
      cat() {
        const bw = 3 + stage, eh = 2 + stage, xc = 16 - Math.round(W * 0.27), yb = topAt(xc) + 1;
        for (let i = 0; i < eh; i++) {
          const wi = Math.max(1, Math.round(bw * (1 - i / eh))), sh = Math.floor(i * 0.4);
          const xs = xc - Math.floor(wi / 2) - sh;
          for (let x = xs; x < xs + wi; x++) setM(x, yb - i, (wi >= 3 && i > 0 && x > xs && x < xs + wi - 1) ? 'inner' : 'body');
        }
      },
      round() {
        const rad = 1.5 + 0.5 * stage, xc = 16 - Math.round(W * 0.3) + 0.5;
        const yc = topAt(Math.floor(xc)) - rad * 0.3 + 0.5;
        for (let y = Math.floor(yc - rad) - 1; y <= yc + rad + 1; y++) for (let x = 0; x < 16; x++) {
          const dd = Math.hypot(x + 0.5 - xc, y + 0.5 - yc);
          if (dd <= rad) setM(x, y, dd <= rad - 1.3 ? 'inner' : 'body');
        }
      },
      long() {
        const ew = stage === 3 ? 4 : 3, eh = 3 + 2 * stage, xc = 16 - Math.round(W * 0.2), yb = topAt(xc) + 1;
        for (let i = 0; i < eh; i++) {
          const lean = Math.floor(i / 3), xs = xc - Math.floor(ew / 2) - lean, tip = i === eh - 1;
          for (let x = xs; x < xs + ew; x++) {
            if (tip && (x === xs || x === xs + ew - 1)) continue;
            const inner = i >= 1 && i <= eh - 3 && x > xs && x < xs + ew - 1;
            setM(x, yb - i, inner ? 'inner' : 'body');
          }
        }
      },
      horns() {
        const hh = 1 + stage, xc = 16 - Math.round(W * 0.24), yb = topAt(xc) + 1;
        for (let i = 0; i <= hh; i++) {
          const x = xc - Math.floor(i * 0.7), y = yb - i;
          setM(x - 1, y, 'horn');
          if (i < hh) setM(x, y, 'horn');
        }
      },
      leaf() {
        const y0 = top - stage;
        for (let y = top; y >= y0; y--) setM(15, y, 'stem');
        const L = 3 + stage * 1.5, b = 0.9 + 0.35 * stage, th = 0.45, cs = Math.cos(th), sn = Math.sin(th);
        const cx = 15 - L / 2 + 0.3, cy = y0 + 0.2;
        for (let y = y0 - 6; y <= y0 + 3; y++) for (let x = 0; x < 16; x++) {
          const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
          const a1 = (dx * cs + dy * sn) / (L / 2), a2 = (-dx * sn + dy * cs) / b;
          if (a1 * a1 + a2 * a2 <= 1) setM(x, y, 'feat');
        }
      },
      flower() {
        const pr = 0.9 + 0.45 * stage, cy = top - pr - 1.2;
        for (let y = top; y > cy; y--) setM(15, y, 'stem');
        const petals = [[16 - pr, cy], [16 + pr, cy], [16, cy - pr], [16, cy + pr]];
        const cr = 0.55 + 0.3 * stage;
        for (let y = Math.floor(cy - 2 * pr) - 1; y <= cy + 2 * pr + 1; y++) for (let x = 0; x < N; x++) {
          const px = x + 0.5, py = y + 0.5;
          if (Math.hypot(px - 16, py - cy) <= cr) set(x, y, 'pollen');
          else if (petals.some(([qx, qy]) => Math.hypot(px - qx, py - qy) <= pr * 0.95)) set(x, y, 'feat');
        }
      },
      flame() {
        const fh = 2 + 2 * stage, fw = 1.6 + 0.9 * stage, base = top + 1.5;
        for (let y = Math.floor(base - fh) - 1; y <= Math.ceil(base); y++) for (let x = 0; x < N; x++) {
          const t = (base - (y + 0.5)) / fh;
          if (t < 0 || t > 1) continue;
          const hw = fw * Math.pow(1 - t, 0.75) * (1 + 0.18 * Math.sin(t * 9));
          const dx = Math.abs(x + 0.5 - 16);
          if (dx <= hw) set(x, y, (dx <= hw * 0.45 && t < 0.75) ? 'featHi' : 'feat');
        }
        const ly = Math.round(base - fh * 0.55), lx = Math.round(16 - fw - 0.6);
        setM(lx, ly, 'feat'); setM(lx, ly - 1, 'feat');
      },
      fin() {
        const fb = 1.6 + 0.8 * stage, fh = 2 + stage, base = top + 1;
        for (let y = Math.floor(base - fh) - 1; y <= base; y++) for (let x = 0; x < N; x++) {
          const t = (base - (y + 0.5)) / fh;
          if (t < 0 || t > 1) continue;
          if (Math.abs(x + 0.5 - 16) <= fb * (1 - t) + 0.2) set(x, y, 'feat');
        }
      },
      antenna() {
        const la = 2 + stage, xa = 16 - Math.max(2, Math.round(W * 0.16)) - 1, y0 = topAt(xa);
        let x = xa, y = y0;
        for (let i = 1; i <= la; i++) { y = y0 - i; x = xa - Math.floor(i / 2); setM(x, y, 'stalk'); }
        setM(x - 1, y - 1, 'ball'); setM(x, y - 1, 'ball'); setM(x - 1, y - 2, 'ball'); setM(x, y - 2, 'ball');
        set(x - 1, y - 2, 'ballHi'); set(N - 1 - x, y - 2, 'ballHi');
      },
      crystal() {
        const off = 2.2 + stage * 1.1;
        const spikes = [[16, 3 + stage, 1.1 + 0.35 * stage, 0],
          [16 - off, 1 + stage, 0.9 + 0.3 * stage, -1], [16 + off, 1 + stage, 0.9 + 0.3 * stage, 1]];
        spikes.forEach(([xc, h, bw, lean]) => {
          const base = topAt(Math.floor(xc)) + 1.5;
          for (let y = Math.floor(base - h) - 1; y <= base; y++) for (let x = 0; x < N; x++) {
            const t = (base - (y + 0.5)) / h;
            if (t < 0 || t > 1) continue;
            if (Math.abs(x + 0.5 - (xc + lean * t * 1.2)) <= bw * (1 - t) + 0.25) set(x, y, 'feat');
          }
        });
      },
      tuft() {
        const th = 2 + stage;
        for (let i = 0; i < th; i++) setM(15, top - i, 'feat');
        for (let j = 1; j < th; j++) setM(13 - Math.floor(j / 2), top + 1 - j, 'feat');
      },
      none() {}
    };
    (head[c.head] || head.none)();

    // --- body ---
    for (let i = 0; i < N * N; i++) if (mask[i]) g[i] = 'body';

    // --- pattern ---
    const eyeStyle = c.pattern === 'mask' ? 'ring' : c.eye;
    const eyeRows = EYES[eyeStyle][stage - 1];
    const ew = eyeRows[0].length, eh = eyeRows.length;
    const eyeY = top + Math.round(H * (c.shape === 'mushroom' ? 0.58 : c.shape === 'drop' ? 0.48 : c.shape === 'star' ? 0.42 : 0.4)) + (eyeStyle === 'sleepy' ? 1 : 0);
    if (c.shape === 'mushroom') for (let i = 0; i < N * N; i++) if (mask[i] && UV[i][1] >= 0.15) g[i] = 'belly';
    if (c.pattern === 'belly') {
      const by = top + H * 0.66, a = W * 0.3, b = H * 0.3;
      for (let y = top; y <= bottom; y++) for (let x = 0; x < N; x++)
        if (isBody(x, y) && ((x + 0.5 - 16) / a) ** 2 + ((y + 0.5 - by) / b) ** 2 <= 1) g[y * N + x] = 'belly';
    } else if (c.pattern === 'spots' && stage > 1) {
      SPOTS.forEach(([u, v]) => {
        const x0 = Math.round(16 + u * W / 2 - 1), y0 = Math.round(cyc + v * H / 2 - 1);
        for (let y = y0; y < y0 + 2; y++) for (let x = x0; x < x0 + 2; x++) if (isBody(x, y)) g[y * N + x] = 'spot';
      });
    } else if (c.pattern === 'stripes') {
      const len = 1 + stage, xs = [15, 15 - (2 + stage)];
      xs.forEach(x => { const t = topAt(x); for (let y = t; y < t + len; y++) if (isBody(x, y)) setM(x, y, 'spot'); });
    } else if (c.pattern === 'freckles') {
      const o2 = Math.max(2, Math.round(W * 0.17)), fx = 16 - o2 - ew, fy = eyeY + eh + 1;
      [[fx - 1, fy], [fx + 1, fy], [fx, fy + 1]].forEach(([x, y]) => { if (isBody(x, y) && isBody(N - 1 - x, y)) setM(x, y, 'spot'); });
    } else if (c.pattern === 'heart') {
      const R = 1 + 0.75 * stage, hy0 = top + H * 0.78;
      for (let y = top; y <= bottom; y++) for (let x = 0; x < N; x++) { const hx = (x + 0.5 - 16) / R, hy = -(y + 0.5 - hy0) / R + 0.2; if (isBody(x, y) && (hx * hx + hy * hy - 1) ** 3 - hx * hx * hy ** 3 < 0) g[y * N + x] = 'belly'; }
    } else if (c.pattern === 'half') {
      for (let i = 0; i < N * N; i++) if (mask[i] && UV[i][1] > 0.3 + ((i % N) % 4 < 2 ? 0.1 : 0)) g[i] = 'belly';
    } else if (c.pattern === 'starmark' && stage > 1) {
      const sy = top + 2 + (stage === 3 ? 3 : 0);
      [[15, sy], [16, sy], [15, sy - 1], [16, sy + 1], [14, sy], [17, sy]].forEach(([x, y]) => { if (isBody(x, y)) g[y * N + x] = 'spot'; });
    } else if (c.pattern === 'mask') {
      for (let y = eyeY - 1; y <= eyeY + eh; y++) for (let x = 0; x < N; x++) {
        const i = y * N + x;
        if (isBody(x, y) && Math.abs(UV[i][0]) <= 0.82) g[i] = 'spot';
      }
    }

    // --- analytic shading (light from the top-left) ---
    for (let i = 0; i < N * N; i++) {
      if (!mask[i]) continue;
      const k = g[i];
      if (k !== 'body' && k !== 'belly') continue;
      const [u, v, r] = UV[i], x = i % N, y = (i / N) | 0, dl = 0.55 * u + 0.83 * v;
      const rim = (r > 0.7 && dl > 0.18) || !isBody(x, y + 1);
      if (rim) g[i] = k === 'body' ? (r > 0.86 && dl > 0.7 && isBody(x, y + 1) ? 'deep' : 'shade') : 'bellyShade';
      else if (k === 'body' && ((u + 0.42) ** 2 + (v + 0.5) ** 2) < 0.012 && stage > 1) g[i] = 'glint';
      else if (k === 'body' && (((u + 0.42) ** 2 + (v + 0.5) ** 2) < 0.05 || (r > 0.8 && dl < -0.58))) g[i] = 'hi';
    }

    // --- stage 3 gem (legendaries always wear one) ---
    if (stage === 3 || c.legendary) {
      const gy = top + 2;
      set(15, gy, 'gemHi'); set(16, gy, 'gem'); set(15, gy + 1, 'gem'); set(16, gy + 1, 'gem');
    }

    // --- face ---
    const off = Math.max(2, Math.round(W * 0.17));
    [16 - off - ew, 16 + off].forEach((x0, side) => {
      if (opts.blink && eh >= 2) {
        for (let dx = 0; dx < ew; dx++) set(x0 + dx, eyeY + eh - 1, 'eye');
      } else {
        eyeRows.forEach((row, dy) => {
          for (let dx = 0; dx < row.length; dx++) if (row[dx] !== '.') set(x0 + dx, eyeY + dy, CH[row[dx]]);
        });
      }
      if (c.angry) {
        for (let dx = -1; dx <= ew; dx++) {
          const t = (dx + 1) / (ew + 1), y = side === 0 ? eyeY - 3 + Math.round(t * 2) : eyeY - 1 - Math.round(t * 2);
          set(x0 + dx, y, 'line');
        }
      }
    });
    const mRows = MOUTHS[c.mouth][stage - 1];
    const my = eyeY + eh + (stage === 1 ? 0 : 1) - (eyeStyle === 'sleepy' ? 1 : 0);
    // 7.6: where the face and the hands are, for the Star Bazaar's glasses, neckwear and things to hold
    const geo = { top, bottom, W, H, cyc: Math.round(cyc), eyeY, eyeL: 16 - off - ew, eyeR: 16 + off + ew - 1, eh, mouthY: my + mRows.length, handY: Math.round(cyc + H * 0.14), sideL: leftAt(Math.round(cyc + H * 0.14)) };
    const mx0 = 16 - mRows[0].length / 2;
    mRows.forEach((row, dy) => {
      for (let dx = 0; dx < row.length; dx++) if (row[dx] !== '.') set(mx0 + dx, my + dy, CH[row[dx]]);
    });
    if (c.blush) {
      const by = eyeY + eh, lx = 16 - off - ew - 1;
      [[lx, by], [lx + 1, by]].forEach(([x, y]) => { if (isBody(x, y)) setM(x, y, 'blush'); });
    }

    // --- directional shading for the parts outside the body ---
    const SHADE = { body: 'shade', feat: 'featShade', horn: 'hornShade', wing: 'wingShade', stem: 'stemShade' };
    const HI = { body: 'hi', feat: 'featHi', horn: 'hornHi', wing: 'wingHi', stem: 'stemHi' };
    const lit = g.slice();
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x, k = g[i];
      if (mask[i] || !SHADE[k]) continue;
      if (!get(x + 1, y) || !get(x, y + 1)) lit[i] = SHADE[k];
      else if (!get(x - 1, y) && !get(x, y - 1)) lit[i] = HI[k];
    }

    // --- outline ---
    const out = lit.slice();
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (lit[y * N + x]) continue;
      const n = (xx, yy) => inb(xx, yy) && lit[yy * N + xx];
      if (n(x - 1, y) || n(x + 1, y) || n(x, y - 1) || n(x, y + 1)) out[y * N + x] = 'line';
    }
    // --- legendary aura: a glowing ring outside the outline ---
    if (c.legendary) {
      const ring = out.slice();
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        if (out[y * N + x]) continue;
        const n = (xx, yy) => inb(xx, yy) && out[yy * N + xx] === 'line';
        if (n(x - 1, y) || n(x + 1, y) || n(x, y - 1) || n(x, y + 1)) {
          if (stage === 1 && (x + y) % 2) continue;
          ring[y * N + x] = ((x * 7 + y * 3) % 11 === 0) ? 'auraHi' : 'aura';
        }
      }
      return { keys: ring, top, geo };
    }
    return { keys: out, top, geo };
  }

  function buildEgg() {
    const c = { h: 42, s: 40, l: 90 };
    const g = new Array(N * N).fill(null), W = 14, H = 17, bottom = 29, top = bottom - H + 1, cyc = top + H / 2;
    const metric = shapeFn('egg');
    const inside = (x, y) => {
      if (x < 0 || y < 0 || x >= N || y >= N) return false;
      return metric((x + 0.5 - 16) / (W / 2), (y + 0.5 - cyc) / (H / 2)) <= 1;
    };
    for (let y = top; y <= bottom; y++) for (let x = 0; x < N; x++) {
      if (!inside(x, y)) continue;
      const u = (x + 0.5 - 16) / (W / 2), v = (y + 0.5 - cyc) / (H / 2), r = metric(u, v), dl = 0.55 * u + 0.83 * v;
      let k = 'body';
      if ((r > 0.7 && dl > 0.18) || !inside(x, y + 1)) k = 'shade';
      else if (((u + 0.4) ** 2 + (v + 0.45) ** 2) < 0.03) k = 'hi';
      g[y * N + x] = k;
    }
    [[12, 15], [18, 18], [13, 22], [19, 24], [16, 13]].forEach(([x, y]) => {
      for (let yy = y; yy < y + 2; yy++) for (let xx = x; xx < x + 2; xx++) if (inside(xx, yy)) g[yy * N + xx] = 'spot';
    });
    const out = g.slice();
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (g[y * N + x]) continue;
      const n = (xx, yy) => xx >= 0 && yy >= 0 && xx < N && yy < N && g[yy * N + xx];
      if (n(x - 1, y) || n(x + 1, y) || n(x, y - 1) || n(x, y + 1)) out[y * N + x] = 'line';
    }
    const p = { body: hsl(c.h, c.s, c.l), shade: hsl(32, 34, 76), hi: '#ffffff', spot: hsl(205, 55, 66), line: hsl(30, 30, 22) };
    return out.map(k => (k ? p[k] : null));
  }

  // ---------- public API ----------
  const cache = new Map();
  const tops = new Map();
  function base(id, stage, blink) {
    if (id == null || !LIST[id]) {
      if (!cache.has('egg')) { cache.set('egg', buildEgg()); tops.set('egg', 13); }
      return { px: cache.get('egg'), top: tops.get('egg') };
    }
    stage = clamp(stage | 0 || 1, 1, 3);
    const key = id + ':' + stage + (blink ? ':b' : '');
    if (!cache.has(key)) {
      const c = LIST[id], p = palette(c), b = build(c, stage, { blink });
      cache.set(key, b.keys.map(k => (k ? p[k] : null)));
      tops.set(key, b.top);
    }
    return { px: cache.get(key), top: tops.get(key) };
  }
  function pixels(id, stage, hat, blink) {
    const b = base(id, stage, blink);
    if (!hat || !HAT_ART[hat] || id == null) return b.px;
    const key = id + ':' + stage + ':' + hat + (blink ? ':b' : '');
    if (!cache.has(key)) {
      const out = b.px.slice(), art = artPixels(HAT_ART[hat], '#1d1f2e');
      const x0 = Math.round(16 - art.w / 2), y0 = b.top + 2 - art.h;
      for (let y = 0; y < art.h; y++) for (let x = 0; x < art.w; x++) {
        const v = art.px[y * art.w + x], X = x0 + x, Y = y0 + y;
        if (v && X >= 0 && Y >= 0 && X < N && Y < N) out[Y * N + X] = v;
      }
      cache.set(key, out);
    }
    return cache.get(key);
  }
  // 7.6: the face of a creature (eyes, mouth, hands) for the Bazaar's clothes. The egg has a made-up one.
  const geoCache = new Map();
  const EGG_GEO = { top: 13, bottom: 29, W: 14, H: 17, cyc: 21, eyeY: 18, eyeL: 11, eyeR: 20, eh: 2, mouthY: 22, handY: 23, sideL: 9 };
  function geometry(id, stage) {
    if (id == null || !LIST[id]) return EGG_GEO;
    stage = clamp(stage | 0 || 1, 1, 3);
    const key = id + ':' + stage;
    if (!geoCache.has(key)) geoCache.set(key, build(LIST[id], stage, {}).geo);
    return geoCache.get(key);
  }
  const boundsCache = new Map();
  function bounds(id, stage, hat) {
    const key = (id == null ? 'egg' : id + ':' + stage) + (hat ? ':' + hat : '');
    if (!boundsCache.has(key)) {
      const px = pixels(id, stage, hat);
      let x0 = N, y0 = N, x1 = -1, y1 = -1;
      px.forEach((v, i) => { if (!v) return; const x = i % N, y = (i / N) | 0; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
      boundsCache.set(key, { x0, y0, x1, y1 });
    }
    return boundsCache.get(key);
  }
  function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }

  function paint(canvas, w, h, px, sil) {
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const ctx = canvas.getContext('2d'), img = ctx.createImageData(w, h);
    for (let i = 0; i < w * h; i++) {
      if (!px[i]) continue;
      const [r, g, b] = sil || hexToRgb(px[i]);
      img.data[i * 4] = r; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255;
    }
    ctx.clearRect(0, 0, w, h);
    ctx.putImageData(img, 0, 0);
  }
  // Draws onto a 32×32 canvas. opts.silhouette paints every pixel one colour; opts.hat adds a hat; opts.blink closes the eyes.
  function draw(canvas, id, stage, opts) {
    opts = opts || {};
    paint(canvas, N, N, pixels(id, stage, opts.silhouette ? null : opts.hat, opts.blink), opts.silhouette ? hexToRgb(opts.silhouette) : null);
  }
  // Cached offscreen canvas for drawing into larger scenes.
  const spriteCache = new Map();
  function sprite(id, stage, silhouette, hat, blink) {
    const key = (id == null ? 'egg' : id + ':' + stage) + ':' + (silhouette || '') + ':' + (hat || '') + (blink ? ':b' : '');
    if (!spriteCache.has(key)) {
      const cv = document.createElement('canvas');
      draw(cv, id, stage, { silhouette, hat, blink });
      spriteCache.set(key, cv);
    }
    return spriteCache.get(key);
  }
  // A creature built from a one-off spec (used for the bosses).
  function renderSpec(spec, stage, canvas, opts) {
    const key = 'spec:' + spec.key + ':' + stage + (opts && opts.blink ? ':b' : '');
    if (!cache.has(key)) {
      const c = Object.assign({ blush: false, f: null, legendary: false }, spec), p = palette(c);
      cache.set(key, build(c, stage, opts).keys.map(k => (k ? p[k] : null)));
    }
    if (canvas) paint(canvas, N, N, cache.get(key), opts && opts.silhouette ? hexToRgb(opts.silhouette) : null);
    return cache.get(key);
  }
  function icon(canvas, key) {
    const art = artPixels(ICON_ART[key], '#2a2230');
    const S = 12, out = new Array(S * S).fill(null), ox = Math.floor((S - art.w) / 2), oy = Math.floor((S - art.h) / 2);
    for (let y = 0; y < art.h; y++) for (let x = 0; x < art.w; x++) if (art.px[y * art.w + x]) out[(y + oy) * S + x + ox] = art.px[y * art.w + x];
    paint(canvas, S, S, out, null);
  }
  function hatPreview(canvas, key) {
    const art = artPixels(HAT_ART[key], '#1d1f2e');
    const S = 16, out = new Array(S * S).fill(null), ox = Math.floor((S - art.w) / 2), oy = Math.floor((S - art.h) / 2);
    for (let y = 0; y < art.h; y++) for (let x = 0; x < art.w; x++) if (art.px[y * art.w + x]) out[(y + oy) * S + x + ox] = art.px[y * art.w + x];
    paint(canvas, S, S, out, null);
  }
  const typeInfo = cr => (cr.legendary ? LEGEND : TYPES[cr.type]);

  // ---------- badge medals (16×16) ----------
  const GLYPHS = {
    egg: ['..#..', '.###.', '#####', '#####', '.###.'], check: ['....#', '...##', '#.##.', '###..', '.#...'],
    star: ['..#..', '.###.', '#####', '.###.', '#.#.#'], hand: ['.#.#.', '.#.#.', '#####', '#####', '.###.'],
    star2: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'], flame: ['..#..', '.##..', '.###.', '#####', '.###.'],
    shield: ['#####', '#####', '#####', '.###.', '..#..'], up: ['..#..', '.###.', '#####', '..#..', '..#..'],
    crown: ['#.#.#', '#####', '#####', '#####', '.....'], trophy: ['#####', '#####', '.###.', '..#..', '.###.'],
    sword: ['....#', '...#.', '#.#..', '.#...', '#.#..'], skull: ['.###.', '#####', '#.#.#', '#####', '.#.#.'],
    flag: ['####.', '#####', '####.', '#....', '#....'], medal: ['.###.', '#...#', '#.#.#', '#...#', '.###.'],
    gem: ['.###.', '#####', '.###.', '..#..', '.....'], heart: ['.#.#.', '#####', '#####', '.###.', '..#..'],
    book: ['##.##', '##.##', '##.##', '#####', '..#..'], nova: ['#.#.#', '.###.', '##.##', '.###.', '#.#.#']
  };
  function medal(canvas, glyph, color) {
    const S = 16, out = new Array(S * S).fill(null);
    const dark = hsl(0, 0, 18), light = '#ffffff';
    const ribL = '#3d7be0', ribR = '#e5484d';
    for (let y = 0; y < 5; y++) { out[y * S + 5 + Math.floor(y / 2)] = ribL; out[y * S + 6 + Math.floor(y / 2)] = ribL; out[y * S + 10 - Math.floor(y / 2)] = ribR; out[y * S + 9 - Math.floor(y / 2)] = ribR; }
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const d = Math.hypot(x + 0.5 - 8, y + 0.5 - 9.5);
      if (d <= 6.2) out[y * S + x] = d > 5.2 ? dark : (d > 4.3 ? '#ffd84a' : color);
    }
    const g = GLYPHS[glyph] || GLYPHS.star;
    g.forEach((row, y) => { for (let x = 0; x < 5; x++) if (row[x] === '#') out[(y + 7) * S + x + 6] = light; });
    paint(canvas, S, S, out, null);
  }

  // ---------- small space scenes behind creatures ----------
  const BACKDROPS = {
    dawn: ['#120f36', '#2a1d5c', '#55307c', '#93468a'], day: ['#0b1440', '#15256c', '#233a90', '#3757b2'],
    dusk: ['#140c32', '#33195a', '#622a6c', '#a0456a'], night: ['#02030c', '#050918', '#080e24', '#0b1430']
  };
  function phaseNow(d) {
    d = d || new Date();
    const h = d.getHours() + d.getMinutes() / 60;
    return h >= 6 && h < 9.5 ? 'dawn' : h >= 9.5 && h < 15.5 ? 'day' : h >= 15.5 && h < 19 ? 'dusk' : 'night';
  }
  const backdropCache = new Map();
  function backdrop(phase, tint) {
    phase = phase || phaseNow();
    const key = phase + ':' + (tint || '');
    if (backdropCache.has(key) || typeof document === 'undefined') return backdropCache.get(key) || '';
    const W2 = 64, H2 = 48, cv = document.createElement('canvas'); cv.width = W2; cv.height = H2;
    const ctx = cv.getContext('2d'), sky = BACKDROPS[phase];
    const px = (x, y, c, w, h) => { ctx.fillStyle = c; ctx.fillRect(x, y, w || 1, h || 1); };
    [0, 9, 18, 27].forEach((y, i) => { px(0, y, sky[i], W2, 10); if (i) for (let x = 0; x < W2; x += 2) px(x + (y % 2), y - 1, sky[i]); });
    for (let i = 0; i < 26; i++) px(Math.floor(hash32(i, 1) * W2), 12 + Math.floor(hash32(i, 2) * 22), hash32(i, 3) > 0.5 ? '#ffffff' : '#9fb4ff');
    // a ringed planet and a little moon
    for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) if (x * x + y * y <= 25) px(51 + x, 21 + y, y < -1 ? '#ffd9a0' : y < 2 ? '#f2b56b' : '#c26a3a');
    px(42, 21, '#e8d0a8', 19, 1); px(44, 22, '#c9a878', 15, 1);
    for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) if (x * x + y * y <= 4) px(12 + x, 20 + y, x + y < 0 ? '#e0e2f2' : '#9a9cc0');
    // alien moss ground on a curved horizon
    const g1 = phase === 'night' ? '#2c7a6a' : '#58c4a7', g2 = phase === 'night' ? '#215e52' : '#36937f', g3 = phase === 'night' ? '#4a9a88' : '#8ae8c9';
    for (let x = 0; x < W2; x++) {
      const y = Math.round(34 + (x - 32) * (x - 32) / 220);
      px(x, y, g1, 1, H2 - y); px(x, y, g3, 1, 1);
      if (hash32(x, 8) < 0.12) px(x, y + 3 + Math.floor(hash32(x, 9) * 8), g2);
      if (hash32(x, 10) < 0.06) px(x, y - 2, '#7ff0ff', 1, 2);
    }
    if (tint) { ctx.fillStyle = tint; ctx.fillRect(0, 0, W2, H2); }
    const url = cv.toDataURL();
    backdropCache.set(key, url);
    return url;
  }
  // ---------- the ASTROVOYAGERS logo: a rocket over a ringed planet (32×32) ----------
  function logoPixels() {
    const S = 32, g = new Array(S * S).fill(null);
    const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < S && y < S) g[y * S + x] = c; };
    // planet with a ring (back half, planet, front half)
    const ring = front => { for (let a = 0; a < 360; a += 2) { const t = a * Math.PI / 180, y = 24 + Math.sin(t) * 4.2; if ((Math.sin(t) >= 0) !== front) continue; set(Math.round(16 + Math.cos(t) * 15), Math.round(y), '#7ff0ff'); set(Math.round(16 + Math.cos(t) * 13), Math.round(y + 0.4), '#3aa8c8'); } };
    ring(false);
    for (let y = -9; y <= 9; y++) for (let x = -9; x <= 9; x++) if (x * x + y * y <= 81) set(16 + x, 23 + y, x + y < -9 ? '#c9b2ff' : Math.floor((y + 9) / 3) % 2 ? '#7a5ad8' : '#9b7bff');
    ring(true);
    // flame
    for (let y = 21; y < 28; y++) { const w = Math.max(0, 3 - Math.floor((y - 21) / 2)); for (let x = -w; x <= w; x++) set(16 + x, y, y < 23 ? '#fff6c8' : Math.abs(x) < w ? '#ffd23f' : '#ff7a1f'); }
    // fins
    for (let y = 14; y < 21; y++) { const w = Math.floor((y - 14) / 2) + 1; for (let i = 0; i < w; i++) { set(11 - i, y, '#e5484d'); set(20 + i, y, '#b23a45'); } }
    // body
    for (let y = 6; y < 21; y++) for (let x = 12; x <= 19; x++) set(x, y, x >= 17 ? '#c9d0e2' : '#f2f5fb');
    for (let x = 12; x <= 19; x++) set(x, 17, '#e5484d');
    // nose
    [1, 1, 2, 2, 3, 3].forEach((w, i) => { for (let x = 16 - w; x < 16 + w; x++) set(x, i + 1, x >= 16 ? '#d23a48' : '#ff6b6b'); });
    // window
    for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) if (x * x + y * y <= 5) set(15 + x + (x >= 0 ? 1 : 0), 11 + y, x * x + y * y >= 4 ? '#3f4fb0' : x < 0 && y < 0 ? '#e6fdff' : '#5ad1ff');
    // stars
    [[3, 4, '#ffe066'], [27, 6, '#ffffff'], [5, 13, '#7ff0ff'], [28, 15, '#ffe066']].forEach(([x, y, c]) => { set(x, y, c); set(x - 1, y, c); set(x + 1, y, c); set(x, y - 1, c); set(x, y + 1, c); });
    // dark outline
    const out = g.slice();
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      if (g[y * S + x]) continue;
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const xx = x + dx, yy = y + dy; return xx >= 0 && yy >= 0 && xx < S && yy < S && g[yy * S + xx] && !['#ffe066', '#ffffff', '#7ff0ff'].includes(g[yy * S + xx]); })) out[y * S + x] = '#141a33';
    }
    return out;
  }
  function logo(canvas) { paint(canvas, 32, 32, logoPixels(), null); }
  function hash32(x, y) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  const API = { N, TYPES, TYPE_ORDER, LEGEND, list: LIST, pixels, bounds, geometry, draw, sprite, renderSpec, icon, hatPreview, medal, backdrop, phaseNow, typeInfo, hsl, logo, logoPixels };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.CQCreatures = API;
})(typeof self !== 'undefined' ? self : globalThis);
