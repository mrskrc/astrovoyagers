/* ASTROVOYAGERS · the Star Bazaar, 7.6: a much bigger catalogue
   Loaded after shopdata.js. It keeps every item of 7.4 (the same ids: voyagers may own them) and adds
   about 700 more, each with a look of its own:
   - the Shipyard: every hull has its own factory colours, every wing its own colour; new hull forms
     (saucer, twin hull, ring, crystal, fish, rocket, hammerhead…), wings, engines, trails, paints,
     and stickers with every letter and number;
   - the Wardrobe: many more hats, and three new places to dress: glasses and masks (face), neckwear,
     and things to hold; animal and alien buddies next to the robots;
   - the Card Gallery: three new sets (Animals in Space and Star Types, with true facts, and
     Alien Worlds, made-up planets);
   - the Cabin Studio: more of everything, and two new places: a pet and something on the ceiling;
   - more frames, titles and signature treasures.
   Glyphs: rows of letters, one per pixel; '.' is empty. Half rows (6 letters) are mirrored. */
(function (root) {
  'use strict';
  const D = root.CQShopData;
  if (!D) return;
  const { items, byId, PRICE } = D;
  const add = o => { o.price = o.price != null ? o.price : PRICE[o.rarity]; o.nu = true; items.push(o); byId.set(o.id, o); return o; };
  const pad = n => String(n).padStart(2, '0');
  const at = (list, i) => list[i % list.length];
  const low = s => String(s).toLowerCase();
  const an = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;
  const next = prefix => { let n = 0; items.forEach(i => { const m = i.id.startsWith(prefix + '-') && /^\d+$/.test(i.id.slice(prefix.length + 1)) ? +i.id.slice(prefix.length + 1) : -1; if (m >= n) n = m + 1; }); return n; };
  const mirror = rows => rows.map(r => (r.length <= 7 && !r.includes('|') ? r + r.split('').reverse().join('') : r.replace('|', '')));
  const RARE5 = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

  // ---------- the Shipyard: factory colours ----------
  const FACTORY = {
    'hull-01': ['#ff5a4a', '#ffffff', 'band'], 'hull-02': ['#5ad1ff', '#2a6fd0', 'fade'], 'hull-03': ['#6fe36f', '#ffe066', 'dots'],
    'hull-04': ['#24407a', '#3dffb0', 'stripes'], 'hull-05': ['#ffd23f', '#1d1f2e', 'band'], 'hull-06': ['#3a7fd8', '#e8f4ff', 'belly'],
    'hull-07': ['#c98a4a', '#ff9a3d', 'fade'], 'hull-08': ['#ffd23f', '#fff6c8', 'shine'], 'hull-09': ['#8a94b8', '#e5484d', 'band'],
    'hull-10': ['#3a2a6a', '#9a6bff', 'fade'], 'hull-11': ['#5a6680', '#ff8a3d', 'bolt']
  };
  Object.keys(FACTORY).forEach(id => { const [c1, c2, pattern] = FACTORY[id]; byId.get(id).art.paint = { c1, c2, pattern }; });
  const WING_COL = ['#8a94b8', '#5ab4ff', '#ff5a5a', '#ffd23f', '#bff8ff', '#9a6bff', '#ff9ad8', '#7ff0ff', '#3a2a40', '#c9d0e2', '#ff7ad9', '#ffe066'];
  for (let i = 1; i < 12; i++) byId.get('wing-' + pad(i)).art.col = WING_COL[i];

  // ---------- new hulls ----------
  const HULLS = [
    ['Saucer', 'rare', { len: 28, n: 2, m: 4, t: 2, nose: 'round', fin: 0, cp: 0.5, form: 'saucer' }, ['#c9d0e2', '#7ff0ff', 'shine'], 'A flying saucer! It spins a little when it flies.'],
    ['Twin Hull', 'epic', { len: 30, n: 1, m: 3, t: 2, nose: 'point', fin: 2, cp: 0.6, form: 'twin' }, ['#ff7a3d', '#ffffff', 'band'], 'Two thin hulls side by side. Very steady in a storm.'],
    ['Ring Runner', 'epic', { len: 30, n: 2, m: 4, t: 3, nose: 'point', fin: 3, cp: 0.62, form: 'ring' }, ['#3a4fd8', '#ffe066', 'solid'], 'A big ring goes around this ship. It makes a shield.'],
    ['Crystal', 'epic', { len: 28, n: 1, m: 7, t: 1, nose: 'point', fin: 0, cp: 0.55, form: 'crystal' }, ['#7ff0ff', '#b18cff', 'fade'], 'A ship made of space crystal. It shines in every colour.'],
    ['Goldfish', 'rare', { len: 26, n: 3, m: 6, t: 2, nose: 'round', fin: 3, cp: 0.68, form: 'fish' }, ['#ff8a3d', '#ffe066', 'solid'], 'It looks like a goldfish swimming in space.'],
    ['Rocket', 'uncommon', { len: 30, n: 1, m: 4, t: 4, nose: 'point', fin: 6, cp: 0.62, form: 'rocket' }, ['#eef2ff', '#e5484d', 'band'], 'A classic rocket with big fins. Three, two, one, go!'],
    ['Bubble', 'uncommon', { len: 24, n: 5, m: 7, t: 4, nose: 'round', fin: 2, cp: 0.55, dome: 1 }, ['#ff9ad8', '#ffffff', 'dots'], 'A round ship with a big glass bubble on top.'],
    ['Hammerhead', 'rare', { len: 30, n: 2, m: 5, t: 3, nose: 'hammer', fin: 4, cp: 0.55 }, ['#6f7fa0', '#bff8ff', 'stripes'], 'Its nose is like the head of a hammerhead shark.'],
    ['Needle', 'uncommon', { len: 36, n: 0, m: 3, t: 3, nose: 'point', fin: 3, cp: 0.72 }, ['#c9d0e2', '#5a6fd8', 'band'], 'The thinnest ship in the galaxy. It slips through anything.'],
    ['Brick', 'common', { len: 24, n: 6, m: 6, t: 6, nose: 'blunt', fin: 2, cp: 0.6 }, ['#c0603a', '#ffd6a8', 'solid'], 'A box with engines. Not pretty, but very, very strong.'],
    ['Shark', 'rare', { len: 32, n: 1, m: 5, t: 2, nose: 'point', fin: 7, cp: 0.7, holes: 3 }, ['#5a6f8a', '#e8f4ff', 'belly'], 'A fast ship with a tall fin, like a shark.'],
    ['Seed', 'common', { len: 22, n: 3, m: 5, t: 2, nose: 'round', fin: 1, cp: 0.6 }, ['#8fd35a', '#4f8a2a', 'solid'], 'A tiny ship shaped like a seed. Small but brave.'],
    ['Submarine', 'uncommon', { len: 30, n: 3, m: 5, t: 4, nose: 'round', fin: 3, cp: 0.4, holes: 3, antenna: 1 }, ['#ffd23f', '#3a4766', 'solid'], 'A yellow submarine for the space ocean.'],
    ['Dragon', 'legendary', { len: 34, n: 1, m: 6, t: 2, nose: 'split', fin: 5, cp: 0.6, spikes: 1 }, ['#3f9a4e', '#ffd23f', 'scales'], 'A ship with the spikes of a dragon. Roar!'],
    ['Star Hopper', 'common', { len: 26, n: 2, m: 5, t: 3, nose: 'round', fin: 3, cp: 0.6, antenna: 1 }, ['#5ab4ff', '#ffe066', 'band'], 'A small ship for short jumps between stars.'],
    ['Bumblebee', 'uncommon', { len: 26, n: 3, m: 6, t: 3, nose: 'round', fin: 2, cp: 0.62 }, ['#ffd23f', '#1d1f2e', 'stripesV'], 'Yellow and black, like a busy bee. Buzz!'],
    ['Ice Breaker', 'rare', { len: 32, n: 3, m: 6, t: 4, nose: 'blunt', fin: 4, cp: 0.68, spikes: 1 }, ['#e8f4ff', '#5ab4ff', 'stripes'], 'It breaks through ice comets. Brrr!'],
    ['Cloud Cruiser', 'rare', { len: 30, n: 4, m: 7, t: 5, nose: 'round', fin: 2, cp: 0.6, puffs: 1 }, ['#ffffff', '#bff8ff', 'shine'], 'A soft, white ship. It floats like a cloud.']
  ];
  let n = next('hull');
  HULLS.forEach(([name, rarity, a, [c1, c2, pattern], desc]) => add({ id: 'hull-' + pad(n++), shop: 'ship', slot: 'hull', name: name + ' Hull', rarity, art: Object.assign(a, { paint: { c1, c2, pattern } }), desc }));

  // ---------- new wings ----------
  const WINGS = [
    ['Solar', 'solar', '#2a4fa8', 'rare', 'Solar panels give the ship free energy from the Sun.'],
    ['Dragonfly', 'insect', '#bff8ff', 'rare', 'See-through wings, like a dragonfly.'],
    ['Jet', 'jet', '#c9d0e2', 'epic', 'Wings with two tiny engines. Extra speed!'],
    ['Hexagon', 'hex', '#ffd23f', 'rare', 'Wings made of hexagons, like a honeycomb.'],
    ['Leaf', 'leaf', '#6fe36f', 'uncommon', 'Green leaf wings from a space garden.'],
    ['Crescent', 'arc', '#b18cff', 'rare', 'Wings shaped like the Moon at night.'],
    ['Triple Fin', 'fins3', '#ff8a3d', 'uncommon', 'Three small fins on each side.'],
    ['Cloud', 'cloud', '#ffffff', 'epic', 'Fluffy cloud wings. Soft landings!'],
    ['Red Delta', 'delta', '#e5484d', 'uncommon', 'Big triangle wings in racing red.'],
    ['Gold Swept', 'swept', '#ffd23f', 'rare', 'Shiny gold wings that go back.'],
    ['Night Bat', 'bat', '#2a2a40', 'rare', 'Dark bat wings for secret night flights.'],
    ['Pink Twin', 'twin', '#ff7ad9', 'uncommon', 'Two pink wings on each side.'],
    ['Ice Blade', 'blade', '#bff8ff', 'epic', 'Sharp wings made of blue ice.'],
    ['Sunset Butterfly', 'butterfly', '#ff8a3d', 'epic', 'Butterfly wings with the colours of a sunset.'],
    ['Green Glider', 'glider', '#3f9a4e', 'uncommon', 'Long green wings for quiet flying.'],
    ['Silver Star', 'star', '#c9d0e2', 'legendary', 'Silver star wings that sparkle in the dark.']
  ];
  n = next('wing');
  WINGS.forEach(([name, shape, col, rarity, desc]) => add({ id: 'wing-' + pad(n++), shop: 'ship', slot: 'wing', name: name + ' Wings', rarity, art: { shape, col }, desc }));

  // ---------- new engines ----------
  const ENGINES = [
    ['Twin Bell', 'rare', { n: 2, size: 3, glow: '#ff6a3d', bell: true }, 'Two big bell engines. Very loud!'],
    ['Quad', 'epic', { n: 4, size: 2, glow: '#ffb24a' }, 'Four engines working together.'],
    ['Nuclear', 'epic', { n: 1, size: 5, glow: '#6fe36f' }, 'A green engine with a lot of power.'],
    ['Frost', 'rare', { n: 2, size: 3, glow: '#bff8ff' }, 'An icy blue flame. Cool!'],
    ['Rainbow', 'legendary', { n: 1, size: 5, glow: '#ff5a5a', rainbow: true }, 'Its flame has every colour of the rainbow.'],
    ['Heart', 'rare', { n: 1, size: 4, glow: '#ff7ad9', hearts: true }, 'A pink engine that leaves little hearts.'],
    ['Star', 'epic', { n: 1, size: 4, glow: '#ffd23f', stars: true }, 'A golden engine that throws out stars.'],
    ['Ghost', 'rare', { n: 1, size: 4, glow: '#b18cff', ghost: true }, 'A quiet purple engine. Spooky!']
  ];
  n = next('engine');
  ENGINES.forEach(([name, rarity, a, desc]) => add({ id: 'engine-' + pad(n++), shop: 'ship', slot: 'engine', name: name + ' Engine', rarity, art: a, desc }));

  // ---------- stickers: every letter and number, and more ----------
  n = next('decal');
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((ch, i) => add({ id: 'decal-' + pad(n++), shop: 'ship', slot: 'decal', name: 'Letter ' + ch + ' Sticker', rarity: 'common', price: 40,
    art: { shape: 'ch:' + ch, color: at(['#ffd23f', '#7ff0ff', '#ff7ad9', '#ffffff', '#6fe36f', '#ff8a3d'], i) }, desc: 'The letter ' + ch + ' for the side of your ship. Is it your first letter?' }));
  '0123456789'.split('').forEach((ch, i) => add({ id: 'decal-' + pad(n++), shop: 'ship', slot: 'decal', name: 'Number ' + ch + ' Sticker', rarity: 'common', price: 40,
    art: { shape: 'ch:' + ch, color: at(['#ffffff', '#ffd23f', '#7ff0ff', '#ff7ad9'], i) }, desc: 'A number ' + ch + ' sticker. What is your lucky number?' }));
  [['Rocket', 'rocket', '#ff5a5a'], ['Alien', 'alien', '#6fe36f'], ['Ghost', 'ghost', '#ffffff'], ['Cat Face', 'cat', '#ffd23f'], ['Sun', 'sun', '#ffb24a'], ['Snowflake', 'snow', '#bff8ff'],
    ['Saturn', 'saturn', '#ffd23f'], ['UFO', 'ufo', '#7ff0ff'], ['Thumbs Up', 'thumb', '#ffd6a8'], ['Peace Dove', 'dove', '#ffffff'], ['Apple', 'apple', '#ff5a5a'], ['Pizza', 'pizza', '#ffd23f']].forEach(([name, shape, color], i) =>
    add({ id: 'decal-' + pad(n++), shop: 'ship', slot: 'decal', name: name + ' Sticker', rarity: at(['uncommon', 'rare'], i), art: { shape: 'g:' + shape, color }, desc: an(low(name)) + ' sticker for your ship.' }));

  // ---------- new trails ----------
  const TRAILS = [['Gold Stars', '#ffd23f', 'stars', 'rare'], ['Pink Bubbles', '#ff9ad8', 'bubbles', 'uncommon'], ['Snowflakes', '#ffffff', 'snow', 'rare'], ['Lightning', '#ffe066', 'zap', 'epic'],
    ['Smoke', '#9aa0ac', 'smoke', 'common'], ['Coins', '#ffd23f', 'coins', 'epic'], ['Flower Petals', '#ff9ad8', 'petals', 'rare'], ['Butterflies', '#ffb24a', 'butterflies', 'epic'],
    ['Plasma Rings', '#7ff0ff', 'rings', 'rare'], ['Confetti', '#ff5a5a', 'confetti', 'rare'], ['Neon Line', '#ff5ad9', 'neon', 'uncommon'], ['Dotted Line', '#ffffff', 'dotted', 'common']];
  n = next('trail');
  TRAILS.forEach(([name, color, style, rarity]) => add({ id: 'trail-' + pad(n++), shop: 'ship', slot: 'trail', name: name + ' Trail', rarity, art: { color, style }, desc: 'Your ship leaves ' + low(name) + ' behind it.' }));

  // ---------- new paints ----------
  const PAINTS = [['Zebra', '#ffffff', '#1d1f2e', 'zebra', 'rare'], ['Leopard', '#ffcf7a', '#6a4a20', 'leopard', 'rare'], ['Tiger', '#ff9a3d', '#1d1f2e', 'tiger', 'epic'],
    ['Hearts', '#ff9ad8', '#e5484d', 'hearts', 'rare'], ['Ocean Waves', '#2a8fd8', '#bff8ff', 'waves', 'rare'], ['Hot Flames', '#e5484d', '#ffd23f', 'flames', 'epic'],
    ['Marble', '#eef2ff', '#9aa0ac', 'marble', 'epic'], ['Half and Half', '#5ab4ff', '#ffd23f', 'split', 'uncommon'], ['Neon Edge', '#14143a', '#ff5ad9', 'edge', 'epic'],
    ['Circuit', '#1d3a3a', '#3dffb0', 'circuit', 'epic'], ['Honeycomb', '#ffd23f', '#c49a10', 'hexes', 'rare'], ['Desert Camo', '#d8b880', '#9a7a4a', 'camo', 'uncommon'],
    ['Arctic Camo', '#e8f4ff', '#9aa6c8', 'camo', 'uncommon'], ['Pastel Pink', '#ffc4e6', '#ffffff', 'solid', 'common'], ['Pastel Mint', '#c4f4dc', '#ffffff', 'solid', 'common'],
    ['Copper', '#c8743a', '#ffc49a', 'shine', 'rare'], ['Ruby', '#c4123a', '#ff9aa8', 'shine', 'epic'], ['Emerald', '#13a05a', '#a8ffd0', 'shine', 'epic'],
    ['Sapphire', '#1f3fc4', '#a8c4ff', 'shine', 'epic'], ['Amethyst', '#7a3fc4', '#e0c4ff', 'shine', 'epic'], ['Night Sky', '#0d1440', '#ffffff', 'galaxy', 'rare'],
    ['Lava Flow', '#3a0a0a', '#ff6a3d', 'flames', 'epic'], ['Ocean Fade', '#1f6fd0', '#3dffb0', 'fade', 'uncommon'], ['Candy Fade', '#ff7ad9', '#7ff0ff', 'fade', 'rare']];
  n = next('paint');
  PAINTS.forEach(([name, c1, c2, pattern, rarity]) => add({ id: 'paint-' + pad(n++), shop: 'ship', slot: 'paint', name: name + ' Paint', rarity, art: { c1, c2, pattern }, desc: 'A ' + low(name) + ' paint job for your ship.' }));

  // ---------- the Wardrobe: hats ----------
  // a main, A dark, b accent, w white, y gold, k ink, g glass; R O Y G U P = rainbow colours
  const HATS = {
    crown: ['y...y.', 'yy..yy', 'yyyyyy', 'yybyyy', 'AAAAAA'],
    wizard: ['.....a', '....ab', '....aa', '...aaa', '...aba', '..aaaa', '.aaaaa', 'AAAAAA'],
    pirate: ['..AAAA', '.aaaaa', 'aaaaaw', 'aaaaaa', 'AAAAAA'],
    cowboy: ['...aaa', '..aaaa', '..abbb', 'a.aaaa', 'aaaaaa', '.AAAAA'],
    viking: ['w.....', 'ww....', '.wwaaa', '..aaaa', '.aaaaa', 'AyAyAy'],
    astro: ['...ggg', '..gwgg', '.ggggg', '.ggggg', 'aaaaaa', 'AAAAAA'],
    headphones: ['...aaa', '..a...', '.a....', 'bb....', 'bb....', 'bb....'],
    gradcap: ['.aaaaaaaaaa.|', 'aaaaaaaaaaaa|', '..AAAAAAAAy.|', '..AAAAAAAA.y|', '...........y|'],
    cap: ['....aaaa....|', '...aaaaaa...|', '..aabaaaaa..|', '..aaaaaaaaAA|', '..AAAAAAAAAA|'],
    bucket: ['..aaaa', '.aaaaa', '.abbbb', 'aaaaaa', 'aAAAAA'],
    knight: ['.....b', '....bb', '..aaaa', '.aaaaa', 'aakkkk', 'aaaaaa', 'AAAAAA'],
    jester: ['y.....', 'bb....', '.bb..a', '..baaa', '.aaaaa', 'AAAAAA'],
    mushroom: ['...aaa', '.aawaa', 'aaaaaw', 'aawaaa', 'AAAAAA'],
    sprout: ['aa....', 'aaa...', '.aaa.A', '....AA'],
    fishbowl: ['...ggg', '.ggggg', 'ggbbgg', 'gggggg', 'aaaaaa'],
    laurel: ['a.....', 'aa....', '.a....', '.aa...', '..a...'],
    unicorn: ['.....y', '....yy', '....wy', '.a..yy', 'aaaaaa'],
    antennae: ['b.....', '.a....', '..a...', '..a...', 'aaaaaa'],
    catears: ['a.....', 'aa....', 'aba...', 'abba..', 'aaaaaa'],
    bunny: ['.aa...', '.ab...', '.ab...', '.ab...', '.aa...', 'aaaaaa'],
    firehelmet: ['...aaa', '..aaya', '.aaaaa', 'aaaaaa', 'AAAAAA', 'A.....'],
    hardhat: ['...aaa', '..aaaa', '.aaAaa', 'aaaaaa', 'AAAAAA'],
    sailor: ['..wwww', '.wwwww', '.bbbbb', 'wwwwww'],
    aviator: ['..aaaa', '.aaaaa', 'agwgaa', 'aaaaaa', 'a.....'],
    cake: ['.....y', '.....b', '..wwww', '.aaaaa', '.wwwww', '.aaaaa'],
    rainbow: ['...RRR', '..ROOO', '.ROYYY', 'ROYG..', 'ROYG..'],
    beanieEars: ['a.....', 'aa.aaa', 'aaaaaa', 'abbbbb', 'aaaaaa'],
    sunhat: ['...aaa', '..aaaa', '..bbbb', 'aaaaaa', 'AAAAAA', '.A....']
  };
  Object.keys(HATS).forEach(k => { D.HAT_SHAPES[k] = mirror(HATS[k]); });
  const PAL = (a, A, b) => ({ a, A, b, w: '#ffffff', y: '#ffd23f', k: '#1d1f2e', g: '#bff8ff', R: '#ff5a5a', O: '#ff9a3d', Y: '#ffd23f', G: '#6fe36f', U: '#5ab4ff', P: '#9a6bff' });
  const HAT_LIST = [
    ['Crown', 'crown', [['Gold', '#ffd23f', '#c49a10', '#e5484d', 'epic'], ['Silver', '#c9d0e2', '#858fab', '#5ad1ff', 'rare'], ['Rose Gold', '#ffb0a0', '#c47a6a', '#7ff0ff', 'epic']]],
    ['Wizard Hat', 'wizard', [['Blue', '#3a4fd8', '#25348f', '#ffe066', 'rare'], ['Purple', '#7a3fc4', '#4a2380', '#ffe066', 'rare'], ['Green', '#3f9a4e', '#2a6a35', '#ffffff', 'uncommon']]],
    ['Pirate Hat', 'pirate', [['Black', '#2a2a40', '#14141f', '#ffd23f', 'rare'], ['Red', '#b8343a', '#7a1a20', '#ffd23f', 'rare']]],
    ['Cowboy Hat', 'cowboy', [['Brown', '#c98a4a', '#8a5a2a', '#3a2a1a', 'uncommon'], ['White', '#eef2ff', '#b8c0d8', '#e5484d', 'uncommon'], ['Black', '#2a2a40', '#14141f', '#ffd23f', 'rare']]],
    ['Viking Helmet', 'viking', [['Steel', '#9aa6c8', '#5a6680', '#ffd23f', 'rare'], ['Gold', '#ffd23f', '#c49a10', '#ffffff', 'epic']]],
    ['Space Helmet', 'astro', [['White', '#eef2ff', '#9aa6c8', '#5ab4ff', 'rare'], ['Orange', '#ff8a3d', '#c45a1a', '#ffffff', 'rare'], ['Gold', '#ffd23f', '#c49a10', '#ffffff', 'epic']]],
    ['Headphones', 'headphones', [['Black', '#2a2a40', '#14141f', '#ff5a5a', 'uncommon'], ['Pink', '#ff9ad8', '#c2459c', '#ffffff', 'uncommon'], ['Neon', '#7ff0ff', '#2a8fd8', '#ff5ad9', 'rare']]],
    ['Graduation Cap', 'gradcap', [['Black', '#2a2a40', '#14141f', '#ffd23f', 'rare'], ['Blue', '#25348f', '#14205a', '#ffd23f', 'rare']]],
    ['Cap', 'cap', [['Red', '#e5484d', '#9a2a30', '#ffffff', 'common'], ['Blue', '#3a6fd8', '#25348f', '#ffd23f', 'common'], ['Green', '#3f9a4e', '#2a6a35', '#ffffff', 'common']]],
    ['Bucket Hat', 'bucket', [['Yellow', '#ffd23f', '#c49a10', '#3a2a1a', 'common'], ['Denim', '#5a7ab8', '#3a5080', '#eef2ff', 'common'], ['Flower', '#ff9ad8', '#c2459c', '#ffe066', 'uncommon']]],
    ['Knight Helmet', 'knight', [['Silver', '#c9d0e2', '#858fab', '#e5484d', 'epic'], ['Dark', '#5a6680', '#2a3040', '#9a6bff', 'epic']]],
    ['Jester Hat', 'jester', [['Red and Gold', '#e5484d', '#9a2a30', '#ffd23f', 'rare'], ['Purple and Green', '#7a3fc4', '#4a2380', '#6fe36f', 'rare']]],
    ['Mushroom Cap', 'mushroom', [['Red', '#e5484d', '#9a2a30', '#ffffff', 'uncommon'], ['Blue', '#3a6fd8', '#25348f', '#ffffff', 'rare']]],
    ['Sprout', 'sprout', [['Green', '#6fe36f', '#3f9a4e', '#ffffff', 'common'], ['Golden', '#ffd23f', '#c49a10', '#ffffff', 'rare']]],
    ['Fish Bowl Helmet', 'fishbowl', [['Goldfish', '#c9d0e2', '#858fab', '#ff8a3d', 'epic'], ['Blue Fish', '#c9d0e2', '#858fab', '#5ab4ff', 'epic']]],
    ['Laurel Wreath', 'laurel', [['Green', '#6fe36f', '#3f9a4e', '#ffffff', 'rare'], ['Gold', '#ffd23f', '#c49a10', '#ffffff', 'epic']]],
    ['Unicorn Horn', 'unicorn', [['Pink', '#ff9ad8', '#c2459c', '#ffffff', 'epic'], ['Blue', '#7ff0ff', '#2a8fd8', '#ffffff', 'epic']]],
    ['Alien Antennae', 'antennae', [['Green', '#6fe36f', '#3f9a4e', '#ff5ad9', 'uncommon'], ['Purple', '#9a6bff', '#5a3bb0', '#ffe066', 'uncommon']]],
    ['Cat Ears', 'catears', [['Black', '#2a2a40', '#14141f', '#ff9ad8', 'uncommon'], ['Orange', '#ff9a3d', '#c45a1a', '#ffd6e0', 'uncommon'], ['White', '#eef2ff', '#b8c0d8', '#ff9ad8', 'uncommon']]],
    ['Bunny Ears', 'bunny', [['White', '#eef2ff', '#b8c0d8', '#ff9ad8', 'uncommon'], ['Brown', '#c98a4a', '#8a5a2a', '#ffd6e0', 'uncommon']]],
    ['Fire Helmet', 'firehelmet', [['Red', '#e5484d', '#9a2a30', '#ffd23f', 'rare'], ['Yellow', '#ffd23f', '#c49a10', '#e5484d', 'rare']]],
    ['Hard Hat', 'hardhat', [['Yellow', '#ffd23f', '#c49a10', '#ffffff', 'common'], ['Orange', '#ff8a3d', '#c45a1a', '#ffffff', 'common']]],
    ['Sailor Hat', 'sailor', [['Navy', '#ffffff', '#c9d0e2', '#25348f', 'common'], ['Red', '#ffffff', '#c9d0e2', '#e5484d', 'common']]],
    ['Aviator Cap', 'aviator', [['Brown', '#8a5a2a', '#5a3a1a', '#bff8ff', 'rare'], ['Green', '#4f6a3a', '#2f4a2a', '#bff8ff', 'rare']]],
    ['Birthday Cake', 'cake', [['Strawberry', '#ff9ad8', '#c2459c', '#e5484d', 'rare'], ['Chocolate', '#8a5a2a', '#5a3a1a', '#ffd23f', 'rare']]],
    ['Rainbow Band', 'rainbow', [['Bright', '#ff5a5a', '#c43a3a', '#ffffff', 'epic']]],
    ['Bear Beanie', 'beanieEars', [['Brown', '#c98a4a', '#8a5a2a', '#ffd6a8', 'uncommon'], ['Panda', '#eef2ff', '#2a2a40', '#2a2a40', 'rare']]],
    ['Sun Hat', 'sunhat', [['Straw', '#ffcf7a', '#c49a4a', '#e5484d', 'common'], ['Pink', '#ff9ad8', '#c2459c', '#ffffff', 'uncommon']]]
  ];
  n = next('hat');
  HAT_LIST.forEach(([name, shape, ways]) => ways.forEach(([colour, a, A, b, rarity]) => add({ id: 'hat-' + pad(n++), shop: 'wear', slot: 'hat', name: colour + ' ' + name, rarity, art: { shape, pal: PAL(a, A, b) },
    desc: an(low(colour)) + ' ' + low(name) + ' for your creature.' })));

  // ---------- glasses and masks (on the eyes) ----------
  // dy: rows from the eyes' top row (negative: higher); alpha 'g' is see-through glass
  D.FACE_SHAPES = {
    round: { dy: -1, rows: ['.aaa...aaa.', 'agggaaaggga', '.aaa...aaa.'] },
    square: { dy: -1, rows: ['aaaa..aaaa', 'aggaaaagga', 'agga..agga', 'aaaa..aaaa'] },
    sun: { dy: -1, rows: ['aaaaaaaaaaaa', 'akkkkaakkkka', '.kkkk..kkkk.', '..kk....kk..'] },
    star: { dy: -2, rows: ['..a......a..', '.aaa....aaa.', 'aaaaaaaaaaaa', '.aaa....aaa.', '.a.a....a.a.'] },
    heart: { dy: -1, rows: ['.a.a....a.a.', 'aaaaaaaaaaaa', '.aaa....aaa.', '..a......a..'] },
    goggles: { dy: -1, rows: ['b.AAAA..AAAA.b', 'bAgggAAAAgggAb', 'bAgggA..AgggAb', '..AAAA..AAAA..'] },
    monocle: { dy: -1, rows: ['.......aaa.', '......aggga', '.......aaa.', '........a..', '........a..'] },
    threed: { dy: -1, rows: ['aaaaaaaaaaaa', 'aRRRaaaaUUUa', 'aaaa....aaaa'] },
    visor: { dy: -1, rows: ['aaaaaaaaaaaaaa', 'aggggggggggggA', 'aaaaaaaaaaaaaa'] },
    heromask: { dy: -1, rows: ['..aaaaaaaa..', 'aaa..aa..aaa', '.aaaaaaaaaa.'] },
    eyepatch: { dy: -2, rows: ['k.......kkk.', '.k.....kkkkk', '..k....kkkkk', '.......kkk..'] },
    mustache: { dy: 99, rows: ['.aa....aa.', 'aaaaaaaaaa', 'a..aaaa..a'] },
    clownnose: { dy: 98, rows: ['.aa.', 'aaaa', '.aa.'] },
    vr: { dy: -1, rows: ['aaaaaaaaaaaa', 'abbbbbbbbbba', 'abbbbbbbbbba', 'aaaaaaaaaaaa'] }
  };
  const FACES = [
    ['Round Glasses', 'round', [['Black', '#2a2a40', '#bff8ff'], ['Gold', '#ffd23f', '#bff8ff'], ['Red', '#e5484d', '#ffd6e0']], 'uncommon', 'Round glasses. You look very clever!'],
    ['Square Glasses', 'square', [['Black', '#2a2a40', '#bff8ff'], ['Blue', '#3a6fd8', '#bff8ff']], 'uncommon', 'Square glasses for a smart voyager.'],
    ['Sunglasses', 'sun', [['Black', '#2a2a40', '#14141f'], ['Pink', '#ff7ad9', '#3a1a30'], ['Gold', '#ffd23f', '#2a2a40']], 'rare', 'Cool sunglasses for sunny planets.'],
    ['Star Glasses', 'star', [['Gold', '#ffd23f', '#ffd23f'], ['Pink', '#ff7ad9', '#ff7ad9']], 'rare', 'Glasses shaped like stars. Party time!'],
    ['Heart Glasses', 'heart', [['Red', '#e5484d', '#e5484d'], ['Pink', '#ff9ad8', '#ff9ad8']], 'rare', 'Heart glasses. You love everything!'],
    ['Goggles', 'goggles', [['Brass', '#c98a4a', '#bff8ff'], ['Space', '#c9d0e2', '#7ff0ff']], 'rare', 'Goggles for flying and diving.'],
    ['Monocle', 'monocle', [['Gold', '#ffd23f', '#bff8ff']], 'epic', 'One glass, very fancy. Indeed!'],
    ['3D Glasses', 'threed', [['Classic', '#eef2ff', '#ffffff']], 'uncommon', 'Watch space movies in 3D!'],
    ['Visor', 'visor', [['Cyan', '#5a6680', '#7ff0ff'], ['Pink', '#5a6680', '#ff7ad9'], ['Gold', '#5a6680', '#ffd23f']], 'epic', 'A future visor. It shows maps of the stars.'],
    ['Hero Mask', 'heromask', [['Red', '#e5484d', '#ffffff'], ['Blue', '#3a6fd8', '#ffffff'], ['Black', '#2a2a40', '#ffffff']], 'rare', 'A mask for a secret space hero.'],
    ['Eye Patch', 'eyepatch', [['Pirate', '#1d1f2e', '#1d1f2e']], 'uncommon', 'Arr! A pirate eye patch.'],
    ['Moustache', 'mustache', [['Brown', '#6a4a30', '#6a4a30'], ['Black', '#2a2a30', '#2a2a30'], ['Orange', '#c45a1a', '#c45a1a']], 'common', 'A big moustache. Very grown-up!'],
    ['Clown Nose', 'clownnose', [['Red', '#e5484d', '#e5484d']], 'common', 'Honk! A funny red nose.'],
    ['VR Headset', 'vr', [['White', '#eef2ff', '#3a4fd8'], ['Black', '#2a2a40', '#ff5ad9']], 'epic', 'Play games in a virtual world.']
  ];
  n = 0;
  FACES.forEach(([name, shape, ways, rarity, desc]) => ways.forEach(([colour, a, g]) => add({ id: 'face-' + pad(n++), shop: 'wear', slot: 'face', name: (ways.length > 1 ? colour + ' ' : '') + name, rarity, art: { shape, pal: { a, A: a, b: g, g, k: '#1d1f2e', w: '#ffffff', R: '#ff5a5a', U: '#5ab4ff' } }, desc })));

  // ---------- neckwear ----------
  D.NECK_SHAPES = {
    bowtie: ['aa...aa', 'aaabaaa', 'aa...aa'],
    scarf: ['aaaaaaaaaaaa', 'bbbbbbbbbbbb', '........ab..', '........ba..', '........ab..'],
    medal: ['.a...a.', '..a.a..', '...y...', '..yyy..', '..yAy..', '...y...'],
    pearls: ['w.........w', '.ww.....ww.', '...wwwww...'],
    bandana: ['aaaaaaaaaa', '.awawawaa.', '..aaaaaa..', '...aaaa...', '....aa....'],
    tie: ['.aaa.', '..a..', '.aaa.', '.aba.', '.aaa.', '..a..'],
    lei: ['b.w.b.w.b.w', '.b.w.b.w.b.'],
    bell: ['aaaaaaaaaa', '....yy....', '....yy....'],
    pendant: ['a.......a', '.a.....a.', '..a.y.a..', '...yyy...', '..y.y.y..'],
    phones: ['b.aaaaaa.b', 'bb......bb'],
    camera: ['a........a', '.a......a.', '..kkkkkk..', '..kwgkkk..', '..kkkkkk..'],
    whistle: ['a......a', '.a....a.', '..a..a..', '...yy...', '..yyyy..']
  };
  const NECKS = [
    ['Bow Tie', 'bowtie', [['Red', '#e5484d', '#ffd23f'], ['Blue', '#3a6fd8', '#ffffff'], ['Gold', '#ffd23f', '#e5484d']], 'common', 'A smart bow tie for special days.'],
    ['Scarf', 'scarf', [['Red and White', '#e5484d', '#ffffff'], ['Green and Gold', '#3f9a4e', '#ffd23f'], ['Blue and White', '#3a6fd8', '#ffffff']], 'common', 'A warm scarf for cold planets.'],
    ['Medal', 'medal', [['Gold', '#e5484d', '#ffd23f'], ['Blue Ribbon', '#3a6fd8', '#ffd23f']], 'rare', 'A shiny medal for a champion.'],
    ['Pearl Necklace', 'pearls', [['White', '#ffffff', '#ffffff']], 'rare', 'A necklace of round, shiny pearls.'],
    ['Bandana', 'bandana', [['Red', '#e5484d', '#ffffff'], ['Blue', '#3a6fd8', '#ffffff']], 'uncommon', 'A bandana for space cowboys.'],
    ['Tie', 'tie', [['Blue', '#3a6fd8', '#ffd23f'], ['Red', '#e5484d', '#ffffff']], 'uncommon', 'A long tie. Ready for a meeting!'],
    ['Flower Lei', 'lei', [['Tropical', '#ff7ad9', '#ffe066']], 'uncommon', 'A necklace of flowers. Aloha!'],
    ['Bell Collar', 'bell', [['Red', '#e5484d', '#ffd23f'], ['Blue', '#3a6fd8', '#ffd23f']], 'common', 'Ding, ding! A little bell.'],
    ['Star Pendant', 'pendant', [['Gold', '#c9d0e2', '#ffd23f']], 'epic', 'A golden star on a chain.'],
    ['Neck Headphones', 'phones', [['Black', '#2a2a40', '#ff5a5a'], ['White', '#eef2ff', '#5ab4ff']], 'uncommon', 'Headphones around your neck. Music is ready.'],
    ['Camera', 'camera', [['Explorer', '#8a5a2a', '#bff8ff']], 'rare', 'Take photos of every new planet.'],
    ['Whistle', 'whistle', [['Coach', '#e5484d', '#ffd23f']], 'common', 'Tweet! The team captain\'s whistle.']
  ];
  n = 0;
  NECKS.forEach(([name, shape, ways, rarity, desc]) => ways.forEach(([colour, a, b]) => add({ id: 'neck-' + pad(n++), shop: 'wear', slot: 'neck', name: (ways.length > 1 ? colour + ' ' : '') + name, rarity, art: { shape, pal: { a, A: a, b, y: '#ffd23f', w: '#ffffff', k: '#1d1f2e', g: '#bff8ff' } }, desc })));

  // ---------- things to hold ----------
  D.HOLD_SHAPES = {
    wand: ['....y.', '...yyy', '....y.', '...a..', '..a...', '.a....', 'a.....'],
    lollipop: ['.bbb.', 'bwbwb', 'bbwbb', '.bbb.', '..a..', '..a..', '..a..'],
    balloon: ['.bbb.', 'bbbbb', 'bwbbb', 'bbbbb', '.bbb.', '..b..', '..a..', '..a..', '...a.', '..a..'],
    flag: ['kbbbb', 'kbbbb', 'kbbb.', 'k....', 'k....', 'k....'],
    lantern: ['..k..', '.kkk.', '.yyy.', 'kyyyk', '.yyy.', '.kkk.'],
    umbrella: ['..bbb..', '.bbbbb.', 'bbwbwbb', '...a...', '...a...', '...a...', '..aa...'],
    book: ['bbbbb', 'bwwwb', 'bwkwb', 'bwwwb', 'bbbbb'],
    trophy: ['yyyyy', 'yyyyy', '.yyy.', '..y..', '.yyy.'],
    icecream: ['.bb.', 'bbbb', 'bwbb', 'yyyy', '.yy.', '.yy.', '..y.'],
    rocket: ['..w..', '.www.', '.wbw.', '.www.', 'bwwwb', 'b.y.b'],
    teddy: ['a...a', 'aaaaa', 'akaka', 'aabaa', '.aaa.', 'aa.aa'],
    flower: ['.b.b.', 'bbybb', '.b.b.', '..a..', '..a..', '.aa..'],
    mic: ['.kk.', 'kwwk', 'kwwk', '.kk.', '.a..', '.a..'],
    brush: ['...bb', '...bb', '..a..', '.a...', 'a....'],
    pizza: ['aaaaa', 'ybyRy', '.yyy.', '.yRy.', '..y..'],
    net: ['.www.', 'w...w', 'w...w', '.www.', '..a..', '..a..', '..a..'],
    kite: ['..b..', '.bbb.', 'bbwbb', '.bbb.', '..b..', '..a..', '...a.', '..a..'],
    map: ['wwwww', 'wbwkw', 'wwbww', 'wkwbw', 'wwwww']
  };
  const HOLDS = [
    ['Magic Wand', 'wand', [['Star', '#6a4a30', '#ffd23f']], 'rare', 'Wave it and make a wish!'],
    ['Lollipop', 'lollipop', [['Swirl', '#c9d0e2', '#ff7ad9'], ['Blue Swirl', '#c9d0e2', '#5ab4ff']], 'common', 'A sweet, swirly lollipop.'],
    ['Balloon', 'balloon', [['Red', '#c9d0e2', '#e5484d'], ['Blue', '#c9d0e2', '#5ab4ff'], ['Gold', '#c9d0e2', '#ffd23f']], 'common', 'A balloon that floats in space.'],
    ['Flag', 'flag', [['Red', '#1d1f2e', '#e5484d'], ['Blue', '#1d1f2e', '#5ab4ff'], ['Green', '#1d1f2e', '#6fe36f']], 'common', 'Plant your flag on a new planet!'],
    ['Lantern', 'lantern', [['Gold', '#1d1f2e', '#ffd23f']], 'uncommon', 'A lantern for dark caves on the Moon.'],
    ['Umbrella', 'umbrella', [['Rainbow', '#6a4a30', '#ff7ad9'], ['Blue', '#6a4a30', '#5ab4ff']], 'uncommon', 'For meteor showers. Just in case!'],
    ['Book', 'book', [['Blue', '#1d1f2e', '#3a6fd8'], ['Red', '#1d1f2e', '#e5484d']], 'common', 'A good book. Reading is a superpower.'],
    ['Trophy', 'trophy', [['Gold', '#c49a10', '#ffd23f']], 'epic', 'A golden cup for the best voyager.'],
    ['Ice Cream', 'icecream', [['Strawberry', '#c49a10', '#ff9ad8'], ['Mint', '#c49a10', '#6fe3b4']], 'common', 'Space ice cream. It never melts!'],
    ['Toy Rocket', 'rocket', [['Red', '#c9d0e2', '#e5484d']], 'uncommon', 'A little rocket to play with.'],
    ['Teddy Bear', 'teddy', [['Brown', '#c98a4a', '#ffd6a8'], ['Pink', '#ff9ad8', '#ffffff']], 'uncommon', 'A soft friend for long trips.'],
    ['Flower', 'flower', [['Pink', '#3f9a4e', '#ff7ad9'], ['Blue', '#3f9a4e', '#5ab4ff']], 'common', 'A flower from the space garden.'],
    ['Microphone', 'mic', [['Star', '#6a4a30', '#ffffff']], 'rare', 'Sing a song for the whole galaxy!'],
    ['Paintbrush', 'brush', [['Rainbow', '#6a4a30', '#ff7ad9']], 'uncommon', 'Paint the stars in new colours.'],
    ['Pizza Slice', 'pizza', [['Pepperoni', '#c98a4a', '#e5484d']], 'common', 'Yum! A slice of pizza.'],
    ['Butterfly Net', 'net', [['Explorer', '#6a4a30', '#ffffff']], 'uncommon', 'Catch space butterflies. Then let them go!'],
    ['Kite', 'kite', [['Red', '#6a4a30', '#e5484d'], ['Rainbow', '#6a4a30', '#9a6bff']], 'uncommon', 'Fly a kite in the solar wind.'],
    ['Treasure Map', 'map', [['Old', '#1d1f2e', '#e5484d']], 'rare', 'X marks the spot!']
  ];
  n = 0;
  HOLDS.forEach(([name, shape, ways, rarity, desc]) => ways.forEach(([colour, a, b]) => add({ id: 'hold-' + pad(n++), shop: 'wear', slot: 'hold', name: (ways.length > 1 ? colour + ' ' : '') + name, rarity, art: { shape, pal: { a, A: a, b, y: '#ffd23f', w: '#ffffff', k: '#1d1f2e', R: '#e5484d' } }, desc })));

  // ---------- more capes and auras ----------
  const CAPES = [['Hearts', '#e5484d', '#ff9ad8', 'hearts', 'rare'], ['Checker', '#1d1f2e', '#ffffff', 'checker', 'uncommon'], ['Flame', '#e5484d', '#ffd23f', 'flames', 'epic'],
    ['Moonlight', '#25348f', '#fff3a0', 'moon', 'rare'], ['Ocean', '#2a8fd8', '#bff8ff', 'waves', 'rare'], ['Sunset', '#ff7a3d', '#9a3bff', 'fade', 'epic']];
  n = next('cape');
  CAPES.forEach(([name, c1, c2, pattern, rarity]) => add({ id: 'cape-' + pad(n++), shop: 'wear', slot: 'cape', name: name + ' Cape', rarity, art: { c1, c2, pattern }, desc: 'A ' + low(name) + ' cape that flaps in the solar wind.' }));
  const AURAS = [['Bubble', '#bff8ff', 'bubbles', 'rare'], ['Music', '#b18cff', 'notes', 'rare'], ['Snow', '#ffffff', 'snow', 'rare'], ['Leaf', '#6fe36f', 'leaves', 'uncommon'], ['Gold Star', '#ffd23f', 'stars', 'epic'], ['Pixel', '#7ff0ff', 'pixels', 'epic']];
  n = next('aura');
  AURAS.forEach(([name, color, style, rarity]) => add({ id: 'aura-' + pad(n++), shop: 'wear', slot: 'aura', name: name + ' Aura', rarity, art: { color, style }, desc: 'A ' + low(name) + ' aura dances around your creature.' }));

  // ---------- animal and alien buddies ----------
  // kind: an animal head (ears: pointy, round, floppy, long, tufts, mouse, none), or a space friend
  const PETS = [
    ['Comet Cat', 'cat', '#ff9a3d', '#ffd6a8', 'Comet Cat purrs when the stars come out.'],
    ['Astro Pup', 'dog', '#c98a4a', '#ffe9c8', 'Astro Pup wags its tail at every planet.'],
    ['Nova Fox', 'fox', '#ff6a3d', '#ffffff', 'Nova Fox is fast and very clever.'],
    ['Moon Bear', 'bear', '#8a5a34', '#d8b080', 'Moon Bear loves honey from space bees.'],
    ['Panda Pilot', 'panda', '#ffffff', '#2a2a40', 'Panda Pilot eats space bamboo.'],
    ['Star Bunny', 'bunny', '#eef2ff', '#ff9ad8', 'Star Bunny can jump from star to star.'],
    ['Jumpy Frog', 'frog', '#6fe36f', '#c4f4a0', 'Jumpy Frog says "ribbit" in English.'],
    ['Night Owl', 'owl', '#9a7a5a', '#ffe9a8', 'Night Owl knows the name of every star.'],
    ['Pip Penguin', 'penguin', '#2a2a40', '#ffffff', 'Pip Penguin loves icy moons.'],
    ['Mini Mouse', 'mouse', '#9aa0ac', '#ffc4d6', 'Mini Mouse is small but very brave.'],
    ['Hammy', 'hamster', '#ffb070', '#fff4e6', 'Hammy runs in a wheel to power the ship.'],
    ['Cheeky Monkey', 'monkey', '#a8743a', '#ffd6a8', 'Cheeky Monkey swings on the antennas.'],
    ['Koko Koala', 'koala', '#9aa6b8', '#e8ecf8', 'Koko Koala sleeps most of the day.'],
    ['Piggy', 'pig', '#ff9ac2', '#ffc4dc', 'Piggy loves muddy planets.'],
    ['Leo Lion', 'lion', '#ffb24a', '#c45a1a', 'Leo Lion is the king of the space jungle.'],
    ['Zip Alien', 'alien', '#6fe36f', '#1d1f2e', 'Zip comes from a planet far, far away.'],
    ['Inky Octopus', 'octo', '#b18cff', '#ffd6ff', 'Inky can hold eight things at once.'],
    ['Blob', 'slime', '#7ff0ff', '#ffffff', 'Blob is made of space jelly. Wobble!'],
    ['Boo Ghost', 'ghost', '#eef2ff', '#bff8ff', 'Boo is a friendly ghost. Not scary at all!'],
    ['Twinkle Star', 'star', '#ffd23f', '#fff6c8', 'Twinkle is a little star with a big smile.'],
    ['Luna Moon', 'moon', '#fff3a0', '#c9b870', 'Luna is a small moon who loves night time.'],
    ['Sunny', 'sun', '#ffb24a', '#ffe066', 'Sunny is warm and always happy.'],
    ['Puff Cloud', 'cloud', '#ffffff', '#bff8ff', 'Puff is a cloud who sometimes rains.'],
    ['Planetoid', 'planet', '#5ab4ff', '#6fe36f', 'Planetoid is a tiny planet with its own ring.']
  ];
  n = next('buddy');
  PETS.forEach(([name, kind, c1, c2, desc], i) => {
    add({ id: 'buddy-' + pad(n++), shop: 'wear', slot: 'buddy', name, rarity: at(['uncommon', 'rare', 'rare', 'epic'], i), art: { kind, c1, c2 }, desc });
  });
  PETS.slice(0, 16).forEach(([name, kind, c1, c2]) => {
    add({ id: 'buddy-' + pad(n++), shop: 'wear', slot: 'buddy', name: name + ' in a Helmet', rarity: 'epic', art: { kind, c1, c2, helmet: 1 }, desc: name + ' wears a space helmet. Safe and ready to fly!' });
  });

  // ---------- the Card Gallery: three new sets ----------
  Object.assign(D.SETS, {
    animals: { name: 'Animals in Space', title: 'Animal Astronaut' },
    startypes: { name: 'Star Types', title: 'Star Expert' },
    alien: { name: 'Alien Worlds', title: 'World Builder' }
  });
  const ANIMALS = [
    ['Fruit Flies', 'fly', 'rare', 'Fruit flies were the first animals in space, in 1947.'],
    ['Belka and Strelka', 'dog', 'epic', 'In 1960 two dogs, Belka and Strelka, flew around the Earth and came home safely.'],
    ['Ham the Chimp', 'monkey', 'epic', 'In 1961 Ham the chimpanzee flew to space and pressed buttons there.'],
    ['Félicette', 'cat', 'rare', 'Félicette, a French cat, went to space in 1963.'],
    ['Tortoises', 'tortoise', 'rare', 'In 1968 two tortoises flew around the Moon and came back to Earth.'],
    ['Spiders', 'spider', 'common', 'In 1973 two spiders spun webs on the Skylab space station.'],
    ['Fish', 'fish', 'common', 'Small fish swam in a tank on the Skylab space station in 1973.'],
    ['Jellyfish', 'jelly', 'common', 'In 1991 thousands of baby jellyfish flew on the Space Shuttle.'],
    ['Tardigrades', 'tardigrade', 'legendary', 'Tiny water bears called tardigrades lived through a trip outside a spaceship in 2007.'],
    ['Mice', 'mouse', 'common', 'Mice live on the space station so scientists can learn about health in space.'],
    ['Frogs', 'frog', 'common', 'In 1970 two frogs flew in space to help scientists learn about balance.'],
    ['Bees', 'bee', 'rare', 'In 1984 bees on the Space Shuttle built honeycombs with no gravity.']
  ];
  n = 0;
  ANIMALS.forEach(([name, kind, rarity, desc]) => add({ id: 'card-an-' + pad(n++), shop: 'cards', slot: 'card', set: 'animals', name, rarity, art: { kind: 'animal', w: kind }, desc }));
  const STARTYPES = [
    ['Red Dwarf', '#ff6a4a', 6, 'common', 'Red dwarfs are small, cool stars. They are the most common stars in our galaxy.'],
    ['Yellow Dwarf', '#ffe066', 9, 'rare', 'Our Sun is a yellow dwarf. It is a medium-sized star.'],
    ['Blue Giant', '#9ad0ff', 14, 'epic', 'Blue giants are very big and very hot. They shine blue-white.'],
    ['Red Supergiant', '#ff5a3d', 17, 'epic', 'Red supergiants are some of the biggest stars. Betelgeuse in Orion is one.'],
    ['White Dwarf', '#eef6ff', 4, 'rare', 'A white dwarf is what is left of a star like the Sun. It is about as big as the Earth.'],
    ['Neutron Star', '#bff8ff', 3, 'legendary', 'A neutron star is as small as a city, but it is heavier than the Sun.'],
    ['Brown Dwarf', '#a8643a', 7, 'common', 'A brown dwarf is too small to be a real star. It glows only a little.'],
    ['Binary Stars', '#ffd23f', 6, 'rare', 'Binary stars are two stars that go around each other.'],
    ['Star Cluster', '#ffffff', 2, 'rare', 'A star cluster is a big family of stars born together, like the Pleiades.'],
    ['Protostar', '#ff9ad8', 6, 'uncommon', 'A protostar is a baby star. It is still growing inside a cloud of gas and dust.'],
    ['Variable Star', '#ffb24a', 8, 'uncommon', 'The light of a variable star gets brighter and darker again.'],
    ['Polaris', '#fff6c8', 7, 'epic', 'Polaris is the North Star. It shows sailors and explorers where north is.']
  ];
  n = 0;
  STARTYPES.forEach(([name, color, size, rarity, desc]) => add({ id: 'card-sy-' + pad(n++), shop: 'cards', slot: 'card', set: 'startypes', name, rarity, art: { kind: 'startype', w: low(name).replace(/\s+/g, ''), color, size }, desc }));
  const ALIEN = [
    ['Zorbix', '#7a3fc4', '#ff7ad9', { bands: 1, ring: 1 }, 'An imaginary planet where it rains purple glitter.'],
    ['Glimmer-9', '#7ff0ff', '#ffffff', { cracks: 1 }, 'An imaginary ice planet. The ice sings when the wind blows.'],
    ['Pebbleton', '#a8743a', '#6a4a20', { craters: 1 }, 'An imaginary rocky world full of bouncy stones.'],
    ['Aquara', '#1f6fd0', '#3dffb0', { land: 1 }, 'An imaginary ocean planet with floating islands.'],
    ['Lemonia', '#ffe066', '#fff6c8', { spots: 1 }, 'An imaginary yellow planet that smells of lemons.'],
    ['Volcara', '#e5484d', '#ffb24a', { spots: 1, haze: 1 }, 'An imaginary planet with a thousand small volcanoes.'],
    ['Mintwood', '#6fe3b4', '#2a7a62', { land: 1 }, 'An imaginary forest planet. Its trees are minty green.'],
    ['Candyball', '#ff9ad8', '#ffffff', { bands: 1 }, 'An imaginary planet with stripes like a candy.'],
    ['Thunderon', '#3a4766', '#ffe066', { bands: 1, spot: 1 }, 'An imaginary storm planet with lightning every second.'],
    ['Twin Moons', '#d0d4dc', '#9aa0ac', { craters: 1, moons: 2 }, 'An imaginary world with two little moons.'],
    ['Ringo', '#ffb24a', '#c45a1a', { ring: 1 }, 'An imaginary planet with a ring you could skate on.'],
    ['Crystalis', '#b18cff', '#ffffff', { cracks: 1, ring: 2 }, 'An imaginary planet made of crystal.'],
    ['Cocoa', '#8a5a34', '#c98a4a', { bands: 1 }, 'An imaginary planet with chocolate-coloured clouds.'],
    ['Heartland', '#ff7ad9', '#ffd6ff', { heart: 1 }, 'An imaginary planet with a big heart-shaped sea.'],
    ['Nebulon', '#3a2a8a', '#ff7ad9', { haze: 1, spots: 1 }, 'An imaginary planet inside a pink cloud.'],
    ['Emerald Eye', '#13a05a', '#a8ffd0', { spot: 1, bands: 1 }, 'An imaginary green giant with one big storm.']
  ];
  n = 0;
  ALIEN.forEach(([name, c, c2, extra, desc], i) => add({ id: 'card-al-' + pad(n++), shop: 'cards', slot: 'card', set: 'alien', name, rarity: at(['common', 'common', 'rare', 'common', 'epic', 'common', 'rare', 'legendary'], i), art: Object.assign({ kind: 'planet', c, c2 }, extra), desc }));
  const CARD_PRICE = { common: 30, uncommon: 45, rare: 60, epic: 120, legendary: 240 };
  items.forEach(it => { if (it.shop === 'cards' && it.nu) it.price = CARD_PRICE[it.rarity]; });

  // ---------- the Cabin Studio ----------
  const WALLS = [['Bricks', '#8a3a2a', '#c0603a', 'bricks'], ['Blue Tiles', '#2f4a8a', '#7ff0ff', 'tiles'], ['Chevron', '#3a2a6a', '#ffd23f', 'chevron'], ['Clouds', '#5ab4ff', '#ffffff', 'clouds'],
    ['Ocean', '#1f4f8a', '#5ad1ff', 'waves'], ['Plaid', '#8a2a3a', '#ffd23f', 'plaid'], ['Zigzag', '#2a6a5a', '#ffffff', 'zigzag'], ['Space Station', '#3a5a4a', '#6fe3b4', 'panels'],
    ['Forest', '#1f4a2a', '#6fe36f', 'trees'], ['Pastel Stripes', '#ffc4e6', '#c4f4dc', 'stripes'], ['Triangles', '#25348f', '#ff7ad9', 'triangles'], ['Cockpit', '#14203a', '#7ff0ff', 'circuit'],
    ['Candy', '#ff9ad8', '#ffffff', 'dots'], ['Sunrise', '#ff8a3d', '#ffe066', 'fade']];
  n = next('wall');
  WALLS.forEach(([name, c1, c2, pattern], i) => add({ id: 'wall-' + pad(n++), shop: 'cabin', slot: 'wall', name: name + ' Wall', rarity: at(['common', 'uncommon', 'rare', 'uncommon'], i), art: { c1, c2, pattern }, desc: 'Make your cabin walls ' + low(name) + '.' }));
  const FLOORS = [['Hexagon', '#3a4766', '#5a6680', 'hex'], ['Marble', '#e8ecf8', '#9aa0ac', 'marble'], ['Lava', '#3a0a0a', '#ff6a3d', 'lava'], ['Water', '#1f6fd0', '#bff8ff', 'water'],
    ['Sand', '#e8c880', '#c8a860', 'rock'], ['Starry', '#14143a', '#ffffff', 'stars'], ['Red Carpet', '#a8243a', '#ffd23f', 'plain'], ['Metal Plates', '#6a7690', '#9aa6c8', 'grid']];
  n = next('floor');
  FLOORS.forEach(([name, c1, c2, pattern], i) => add({ id: 'floor-' + pad(n++), shop: 'cabin', slot: 'floor', name: name + ' Floor', rarity: at(['common', 'uncommon', 'rare', 'epic'], i), art: { c1, c2, pattern }, desc: 'A ' + low(name) + ' floor for your cabin.' }));
  const WINDOWS = [['Jupiter', 'jupiter'], ['The Sun', 'sun'], ['Meteor Shower', 'meteors'], ['Pulsar', 'pulsar'], ['Asteroid Belt', 'asteroids'], ['Eclipse', 'eclipse'], ['Red Giant', 'redgiant'], ['Space Station', 'station']];
  n = next('window');
  WINDOWS.forEach(([name, view], i) => add({ id: 'window-' + pad(n++), shop: 'cabin', slot: 'window', name: name + ' Window', rarity: at(['uncommon', 'rare', 'rare', 'epic'], i), art: { view }, desc: 'Look out of your window and see ' + low(name).replace(/^the /, 'the ') + '.' }));
  const FURN = [
    ['bed', 'Camping Tent', 'tent', '#ff8a3d', 'uncommon'], ['bed', 'Rocket Bed', 'rocketbed', '#e5484d', 'epic'], ['bed', 'Cloud Bed', 'cloud', '#ffffff', 'rare'], ['bed', 'Bird Nest', 'nest', '#c98a4a', 'rare'],
    ['bed', 'Blue Tent', 'tent', '#3a6fd8', 'uncommon'], ['bed', 'Galaxy Bed', 'bunk', '#7a3fc4', 'rare'], ['bed', 'Mint Pod', 'pod', '#6fe3b4', 'rare'], ['bed', 'Golden Bed', 'bunk', '#ffd23f', 'epic'],
    ['desk', 'Art Desk', 'easel', '#c98a4a', 'uncommon'], ['desk', 'Lab Desk', 'lab', '#6fe3b4', 'rare'], ['desk', 'Music Desk', 'piano', '#2a2a40', 'rare'], ['desk', 'Cockpit Desk', 'console', '#5a6680', 'epic'],
    ['desk', 'Pink Computer Desk', 'computer', '#ff9ad8', 'uncommon'], ['desk', 'Green Study Desk', 'books', '#3f9a4e', 'common'], ['desk', 'Science Lab', 'lab', '#b18cff', 'rare'], ['desk', 'Painter Desk', 'easel', '#ff8a3d', 'uncommon'],
    ['lamp', 'Neon Star', 'neon', '#ff5ad9', 'rare'], ['lamp', 'Plasma Ball', 'plasma', '#b18cff', 'epic'], ['lamp', 'Fairy Jar', 'jar', '#ffe066', 'uncommon'], ['lamp', 'Green Lava Lamp', 'lava', '#6fe36f', 'common'],
    ['lamp', 'Red Floor Lamp', 'floor', '#e5484d', 'common'], ['lamp', 'Blue Neon Star', 'neon', '#5ad1ff', 'rare'], ['lamp', 'Sun Lamp', 'moon', '#ffb24a', 'rare'], ['lamp', 'Rainbow Plasma', 'plasma', '#ff7ad9', 'epic'],
    ['plant', 'Bonsai Tree', 'bonsai', '#3f9a4e', 'rare'], ['plant', 'Sunflower', 'sunflower', '#ffd23f', 'uncommon'], ['plant', 'Space Flytrap', 'flytrap', '#6fe36f', 'epic'], ['plant', 'Crystal Tree', 'crystal', '#b18cff', 'epic'],
    ['plant', 'Tulips', 'tulips', '#e5484d', 'common'], ['plant', 'Pink Tulips', 'tulips', '#ff9ad8', 'common'], ['plant', 'Golden Bonsai', 'bonsai', '#ffd23f', 'epic'], ['plant', 'Ice Crystal', 'crystal', '#bff8ff', 'rare'],
    ['plant', 'Red Cactus', 'cactus', '#e5484d', 'uncommon'], ['plant', 'Blue Fern', 'fern', '#5ab4ff', 'uncommon'],
    ['shelf', 'Plushie Shelf', 'plush', '#ff9ad8', 'uncommon'], ['shelf', 'Crystal Shelf', 'crystals', '#b18cff', 'rare'], ['shelf', 'Potion Shelf', 'potions', '#6fe36f', 'rare'], ['shelf', 'Record Shelf', 'records', '#2a2a40', 'uncommon'],
    ['shelf', 'Blue Bookshelf', 'books', '#3a6fd8', 'common'], ['shelf', 'Gold Trophy Shelf', 'trophy', '#ffd23f', 'epic'], ['shelf', 'Robot Model Shelf', 'models', '#e5484d', 'rare'],
    ['poster', 'Astronaut Poster', 'astronaut', '#3a6fd8', 'uncommon'], ['poster', 'Robot Poster', 'robot', '#6fe3b4', 'common'], ['poster', 'Alien Poster', 'alien', '#6fe36f', 'uncommon'], ['poster', 'UFO Poster', 'ufo', '#b18cff', 'uncommon'],
    ['poster', 'Eclipse Poster', 'eclipse', '#ffe066', 'rare'], ['poster', 'Aurora Poster', 'aurora', '#3dffb0', 'rare'], ['poster', 'Nebula Poster', 'nebula', '#ff7ad9', 'rare'], ['poster', 'Black Hole Poster', 'blackhole', '#ff9a3d', 'epic'],
    ['poster', 'Sun Poster', 'sun', '#ffb24a', 'common'], ['poster', 'Satellite Poster', 'satellite', '#5ab4ff', 'common'], ['poster', 'Space Station Poster', 'station', '#c9d0e2', 'uncommon'], ['poster', 'Mars Rover Poster', 'rover', '#c0603a', 'rare'],
    ['rug', 'Hexagon Rug', 'hex', '#ffd23f', 'uncommon'], ['rug', 'Checker Rug', 'checker', '#2a2a40', 'common'], ['rug', 'Paw Rug', 'paw', '#c98a4a', 'uncommon'], ['rug', 'Heart Rug', 'heart', '#ff7ad9', 'rare'],
    ['rug', 'Moon Rug', 'moon', '#fff3a0', 'rare'], ['rug', 'Blue Star Rug', 'star', '#5ab4ff', 'uncommon'], ['rug', 'Red Round Rug', 'round', '#e5484d', 'common'], ['rug', 'Rainbow Stripes', 'stripes', '#ff9a3d', 'rare'],
    ['gadget', 'Drum Kit', 'drums', '#e5484d', 'rare'], ['gadget', 'Microscope', 'microscope', '#c9d0e2', 'rare'], ['gadget', 'Snack Machine', 'vending', '#3a6fd8', 'epic'], ['gadget', 'Hologram', 'hologram', '#7ff0ff', 'epic'],
    ['gadget', 'Jukebox', 'jukebox', '#ff7ad9', 'epic'], ['gadget', 'Chess Table', 'chess', '#c98a4a', 'rare'], ['gadget', 'Gumball Machine', 'gumball', '#e5484d', 'uncommon'], ['gadget', 'Robot Arm', 'robotarm', '#ffd23f', 'epic'],
    ['gadget', 'Keyboard Piano', 'keys', '#2a2a40', 'rare'], ['gadget', 'Space Globe', 'globe', '#7a3fc4', 'rare'], ['gadget', 'Pink Arcade', 'arcade', '#ff7ad9', 'epic'], ['gadget', 'Gold Telescope', 'telescope', '#ffd23f', 'epic']
  ];
  const FDESC = { bed: 'Sleep well and dream of the stars.', desk: 'A good place to do your homework.', lamp: 'A little light for your cabin.', plant: 'A plant that grows in space.', shelf: 'Keep your favourite things here.',
    poster: 'Put it on the wall of your cabin.', rug: 'Soft and warm for your feet.', gadget: 'Something fun to have in your cabin.' };
  const counters = {};
  FURN.forEach(([slot, name, kind, color, rarity]) => { if (counters[slot] == null) counters[slot] = next(slot); add({ id: slot + '-' + pad(counters[slot]++), shop: 'cabin', slot, name, rarity, art: { kind, color }, desc: an(low(name)) + '. ' + FDESC[slot] }); });
  const PETS2 = [['Goldfish Bowl', 'fishbowl', '#ff8a3d', 'uncommon', 'A goldfish swims round and round. Blub!'], ['Hamster Cage', 'hamster', '#ffb070', 'uncommon', 'A hamster runs in its wheel all night.'],
    ['Space Slug', 'slug', '#b18cff', 'rare', 'A friendly slug from the Moon. Very slow, very cute.'], ['Robot Dog', 'robodog', '#c9d0e2', 'epic', 'A robot dog. It never needs a walk!'],
    ['Sleepy Cat', 'catbed', '#ff9a3d', 'rare', 'A cat sleeping in its basket. Shh!'], ['Bird Cage', 'birdcage', '#ffe066', 'uncommon', 'A little bird sings space songs.'],
    ['Turtle Tank', 'turtle', '#6fe36f', 'rare', 'A small turtle in its tank. Hello, turtle!'], ['Ant Farm', 'ants', '#c98a4a', 'common', 'Watch the ants build tunnels.']];
  PETS2.forEach(([name, kind, color, rarity, desc], i) => add({ id: 'pet-' + pad(i), shop: 'cabin', slot: 'pet', name, rarity, art: { kind, color }, desc }));
  const CEIL = [['Planet Mobile', 'mobile', '#ffb24a', 'rare', 'Little planets turn slowly above your bed.'], ['Disco Ball', 'disco', '#c9d0e2', 'epic', 'Party time! Lights everywhere.'],
    ['Fairy Lights', 'lights', '#ffe066', 'uncommon', 'Small lights like stars on your ceiling.'], ['Paper Lanterns', 'lanterns', '#ff5a5a', 'uncommon', 'Red and gold lanterns.'],
    ['Hanging Plant', 'hangplant', '#6fe36f', 'common', 'A plant in a basket on the ceiling.'], ['Model Rocket', 'rocket', '#e5484d', 'rare', 'A model rocket flying on a string.'],
    ['Star Garland', 'garland', '#ffd23f', 'common', 'A string of paper stars.'], ['Space Chandelier', 'chandelier', '#7ff0ff', 'epic', 'A fancy light made of crystal.']];
  CEIL.forEach(([name, kind, color, rarity, desc], i) => add({ id: 'ceiling-' + pad(i), shop: 'cabin', slot: 'ceiling', name, rarity, art: { kind, color }, desc }));

  // ---------- frames and titles ----------
  const FRAMES = [['Brackets', 'uncommon', '#7ff0ff', '#3a4fd8', 'brackets'], ['Dashed', 'common', '#ffe066', '#ffffff', 'dashed'], ['Checker', 'uncommon', '#ffffff', '#1d1f2e', 'checker'],
    ['Hearts', 'rare', '#ff7ad9', '#ffd6ff', 'hearts'], ['Flame', 'epic', '#ff6a3d', '#ffe066', 'flame'], ['Circuit', 'epic', '#3dffb0', '#14203a', 'circuit'],
    ['Leafy', 'rare', '#6fe36f', '#2a6a35', 'leafy'], ['Candy', 'rare', '#ff7ad9', '#ffffff', 'candy'], ['Cockpit', 'epic', '#7ff0ff', '#ff7ad9', 'brackets'],
    ['Lemon', 'common', '#ffe066', '#c49a10', 'line'], ['Ocean', 'uncommon', '#2a8fd8', '#bff8ff', 'glow'], ['Grape', 'common', '#9a6bff', '#5a3bb0', 'line'],
    ['Copper', 'uncommon', '#c8743a', '#ffc49a', 'double'], ['Aurora', 'legendary', '#3dffb0', '#9a6bff', 'rainbow']];
  n = next('frame');
  FRAMES.forEach(([name, rarity, c1, c2, style]) => add({ id: 'frame-' + pad(n++), shop: 'profile', slot: 'frame', name: name + ' Frame', rarity, art: { c1, c2, style }, desc: 'A ' + low(name) + ' frame for your voyager card.' }));
  const TITLES = [
    ['Rookie Pilot', 'common'], ['Sky Surfer', 'common'], ['Star Dreamer', 'common'], ['Word Wizard', 'uncommon'], ['Grammar Ninja', 'uncommon'], ['Space Poet', 'uncommon'],
    ['Moon Dancer', 'uncommon'], ['Planet Painter', 'rare'], ['Comet Rider', 'rare'], ['Robot Friend', 'common'], ['Alien Whisperer', 'rare'], ['Quiz Champion', 'rare'],
    ['Super Speller', 'uncommon', { level: 4 }], ['Galaxy Hero', 'epic', { level: 10 }], ['Living Legend', 'legendary', { level: 15 }],
    ['First Reader', 'common', { books: 1 }], ['Bookworm Pilot', 'uncommon', { books: 5 }], ['Book Collector', 'epic', { books: 100 }],
    ['Homework Star', 'rare', { hw: 5 }], ['Never Late', 'epic', { hw: 40 }],
    ['Animal Astronaut', 'rare', { set: 'animals' }], ['Star Expert', 'rare', { set: 'startypes' }], ['World Builder', 'rare', { set: 'alien' }],
    ['Hand Up Hero', 'uncommon', { badge: 'answers25' }], ['On Fire', 'uncommon', { badge: 'streak5' }], ['Always Here', 'uncommon', { badge: 'attend' }],
    ['Team Player', 'uncommon', { badge: 'team' }], ['Boss Slayer', 'rare', { badge: 'bossFinal' }], ['Voyager of the Week', 'rare', { badge: 'eow' }],
    ['Excellent!', 'uncommon', { badge: 'star10' }], ['Champion', 'epic', { badge: 'lv15' }], ['Explorer', 'common'], ['Navigator', 'uncommon'], ['Commander', 'epic', { level: 6 }],
    ['Admiral', 'legendary', { level: 18 }], ['Space Scientist', 'rare']
  ];
  n = next('title');
  TITLES.forEach(([name, rarity, req]) => add({ id: 'title-' + pad(n++), shop: 'profile', slot: 'title', name, rarity, art: { text: name }, req: req || null,
    desc: 'A title for your voyager card: "' + name + '".' + (req ? ' It is for voyagers who have ' + D.reqText(req) + '.' : '') }));

  // ---------- more signature treasures ----------
  const SIGS = [
    ['Royal Crown', 'hat', { shape: 'crown', pal: PAL('#ffd23f', '#c49a10', '#ff3b8a') }, 'The crown of the galaxy\'s king or queen.'],
    ['Phoenix Wings', 'wing', { shape: 'dragon', col: '#ff6a3d' }, 'Burning wings of a space phoenix.'],
    ['Golden Monocle', 'face', { shape: 'monocle', pal: { a: '#ffd23f', A: '#ffd23f', b: '#fff6c8', g: '#fff6c8', k: '#1d1f2e', w: '#ffffff' } }, 'A golden monocle. Very, very fancy.'],
    ['Galaxy Medal', 'neck', { shape: 'medal', pal: { a: '#9a6bff', A: '#9a6bff', b: '#ffd23f', y: '#ffd23f', w: '#ffffff', k: '#1d1f2e' } }, 'The medal of the galaxy\'s best explorer.'],
    ['Comet Wand', 'hold', { shape: 'wand', pal: { a: '#7ff0ff', A: '#7ff0ff', b: '#ffffff', y: '#7ff0ff', w: '#ffffff', k: '#1d1f2e' } }, 'A wand with a real comet on top.'],
    ['Baby Dragon', 'buddy', { kind: 'dragon', c1: '#3f9a4e', c2: '#ffd23f' }, 'A baby space dragon. It sneezes little stars.'],
    ['Royal Throne', 'gadget', { kind: 'throne', color: '#ffd23f' }, 'A golden throne for your cabin.'],
    ['Galaxy Aquarium', 'pet', { kind: 'fishbowl', color: '#ff7ad9', big: 1 }, 'Fish from every planet in one big tank.'],
    ['Comet Chandelier', 'ceiling', { kind: 'chandelier', color: '#ffd23f' }, 'A chandelier with a real comet tail.'],
    ['Rainbow Rocket Hull', 'hull', { len: 34, n: 1, m: 5, t: 4, nose: 'point', fin: 7, cp: 0.62, form: 'rocket', paint: { c1: '#ff5a5a', c2: '#5ab4ff', pattern: 'rainbow' } }, 'A rainbow rocket. Everyone looks up when it flies.'],
    ['Star Map Wall', 'wall', { c1: '#0d1440', c2: '#ffd23f', pattern: 'starmap' }, 'Your walls show a map of every star.'],
    ['Captain of the Galaxy', 'title', { text: 'Captain of the Galaxy' }, 'Only one voyager can be the Captain of the Galaxy.']
  ];
  n = next('sig');
  SIGS.forEach(([name, slot, art, desc]) => add({ id: 'sig-' + pad(n++), shop: 'vault', slot, name, rarity: 'signature', art, desc, signature: true }));

  // ---------- the shops and their shelves ----------
  D.SHOPS.splice(0, D.SHOPS.length,
    { key: 'ship', name: 'Shipyard', sub: 'Build your own spaceship', groups: [['hull', 'Hulls'], ['wing', 'Wings'], ['engine', 'Engines'], ['paint', 'Paint'], ['decal', 'Stickers'], ['trail', 'Trails']] },
    { key: 'wear', name: 'Wardrobe', sub: 'Dress up your creature', groups: [['hat', 'Hats'], ['face', 'Glasses & masks'], ['neck', 'Neckwear'], ['hold', 'Things to hold'], ['cape', 'Capes'], ['aura', 'Auras'], ['buddy', 'Buddies']] },
    { key: 'cards', name: 'Card Gallery', sub: 'Collect the ' + Object.keys(D.SETS).length + ' sets', groups: Object.keys(D.SETS).map(k => ['set:' + k, D.SETS[k].name]) },
    { key: 'cabin', name: 'Cabin Studio', sub: 'Your own room in space', groups: [['wall', 'Walls'], ['floor', 'Floors'], ['window', 'Windows'], ['bed', 'Beds'], ['desk', 'Desks'], ['lamp', 'Lamps'], ['plant', 'Plants'], ['shelf', 'Shelves'], ['poster', 'Posters'], ['rug', 'Rugs'], ['gadget', 'Gadgets'], ['pet', 'Pets'], ['ceiling', 'Ceiling']] },
    { key: 'profile', name: 'Frames & Titles', sub: 'For your voyager card', groups: [['frame', 'Frames'], ['title', 'Titles']] },
    { key: 'vault', name: 'Signature Vault', sub: 'One of a kind in each class', groups: [['vault', 'Signature treasures']] }
  );
  D.WEAR_SLOTS = ['hat', 'face', 'neck', 'hold', 'cape', 'aura', 'buddy'];
  D.SHIP_SLOTS = ['hull', 'wing', 'engine', 'paint', 'decal', 'trail'];
  D.CABIN_SLOTS = ['wall', 'floor', 'window', 'bed', 'desk', 'lamp', 'plant', 'shelf', 'poster', 'rug', 'gadget', 'pet', 'ceiling'];
  D.RARE5 = RARE5;

  // ---------- 7.7: today's offers, ship names and collector ranks ----------
  const hash = t => { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rngOf = seed => { let x = seed || 0x9e3779b9; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; };
  D.dayKey = d => { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  // Six things are cheaper every day, the same six for the whole class (and on the voyagers' pages at home).
  const offerCache = new Map();
  D.offers = (c, day) => {
    day = day || D.dayKey();
    const key = c + '|' + day;
    if (!offerCache.has(key)) {
      if (offerCache.size > 40) offerCache.clear();
      const r = rngOf(hash('offers|' + key)), out = new Map();
      const ok = i => !i.signature && i.rarity !== 'starter' && !i.req && i.price >= 60;
      const take = pool => { for (let n = 0; n < 20 && pool.length; n++) { const it = pool[Math.floor(r() * pool.length)]; if (!out.has(it.id)) { out.set(it.id, [20, 25, 25, 30, 40][hash(it.id + key) % 5]); return; } } };
      ['ship', 'wear', 'cards', 'cabin', 'wear', 'ship'].forEach(sh => take(items.filter(i => i.shop === sh && ok(i))));
      offerCache.set(key, out);
    }
    return offerCache.get(key);
  };
  D.offOf = (it, c, day) => D.offers(c, day).get(it.id) || 0;
  D.priceOf = (it, c, day) => { const o = D.offOf(it, c, day); return o ? Math.max(10, Math.round((it.price * (100 - o)) / 500) * 5) : it.price; };
  // A ship's name is two English words the voyager chooses: "The Brave Comet".
  D.SHIP_ADJ = ['Brave', 'Happy', 'Silver', 'Golden', 'Fast', 'Quiet', 'Lucky', 'Clever', 'Mighty', 'Tiny', 'Shiny', 'Friendly', 'Funny', 'Sleepy', 'Wild', 'Cosmic', 'Bright', 'Frozen', 'Royal', 'Secret'];
  D.SHIP_NOUN = ['Comet', 'Star', 'Falcon', 'Dolphin', 'Dragon', 'Rocket', 'Moon', 'Tiger', 'Arrow', 'Whale', 'Eagle', 'Storm', 'Panda', 'Voyager', 'Dream', 'Thunder', 'Rainbow', 'Planet', 'Wizard', 'Explorer'];
  D.shipName = eq => { const m = /^(\d+)\|(\d+)$/.exec((eq && eq.shipname) || ''); return m && D.SHIP_ADJ[+m[1]] && D.SHIP_NOUN[+m[2]] ? 'The ' + D.SHIP_ADJ[+m[1]] + ' ' + D.SHIP_NOUN[+m[2]] : ''; };
  // Collector ranks: by the number of things a voyager owns (the starter things do not count).
  D.RANKS = [[0, 'New Shopper'], [3, 'Collector'], [10, 'Star Trader'], [25, 'Treasure Hunter'], [50, 'Space Merchant'], [100, 'Galaxy Tycoon'], [200, 'Legend of the Bazaar']];
  D.rankOf = n => { let i = 0; D.RANKS.forEach((r, k) => { if (n >= r[0]) i = k; }); const next = D.RANKS[i + 1] || null; return { i, name: D.RANKS[i][1], n, from: D.RANKS[i][0], next: next ? next[0] : null, nextName: next ? next[1] : '' }; };
})(typeof self !== 'undefined' ? self : globalThis);
