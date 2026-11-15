/* ASTROVOYAGERS · the Star Bazaar catalogue (7.4)
   Everything a voyager can collect with Star Coins (the `dust` fields in the store), in six shops: the Shipyard (their own spaceship),
   the Wardrobe (hats, capes, auras and robot buddies for their creature), the Card Gallery (planets,
   constellations, space wonders, spacecraft and every creature, in sets), the Cabin Studio (their own
   room in space), Frames & Titles (for their voyager card) and the Signature Vault (one of a kind: only
   one voyager in each class can own each treasure, and each voyager can own one).
   No random boxes: every item has its price. All the art is original (shopart.js draws it), and every
   item has a short, simple English description. Plain data: also used by the student portal later. */
(function (root) {
  'use strict';

  const PRICE = { starter: 0, common: 60, uncommon: 120, rare: 220, epic: 400, legendary: 750, signature: 1800 };
  const items = [];
  const add = o => { o.price = o.price != null ? o.price : PRICE[o.rarity]; items.push(o); return o; };
  const pad = n => String(n).padStart(2, '0');

  // ---------- SHIPYARD ----------
  // hull: len, nose (round/point/blunt/split), half-heights nose/mid/tail, fin, cockpit position
  const HULLS = [
    ['Scout', 'starter', { len: 26, n: 2, m: 5, t: 4, nose: 'round', fin: 3, cp: 0.62 }, 'A small, friendly ship. Every voyager starts with one.'],
    ['Dart', 'common', { len: 30, n: 1, m: 4, t: 3, nose: 'point', fin: 4, cp: 0.66 }, 'Long and thin, like an arrow. It is very fast.'],
    ['Comet', 'common', { len: 28, n: 3, m: 6, t: 3, nose: 'round', fin: 2, cp: 0.6 }, 'Round at the front and thin at the back, like a comet.'],
    ['Beetle', 'common', { len: 24, n: 4, m: 7, t: 5, nose: 'round', fin: 2, cp: 0.55 }, 'Short and round. It is small but very strong.'],
    ['Manta', 'uncommon', { len: 30, n: 1, m: 6, t: 2, nose: 'point', fin: 1, cp: 0.5 }, 'Flat and wide, like a manta ray in the sea.'],
    ['Arrow', 'uncommon', { len: 34, n: 1, m: 4, t: 4, nose: 'point', fin: 5, cp: 0.7 }, 'The longest racing hull. Hold on tight!'],
    ['Whale', 'rare', { len: 34, n: 4, m: 8, t: 5, nose: 'round', fin: 3, cp: 0.72 }, 'A big ship for long trips. There is room for friends.'],
    ['Falcon', 'rare', { len: 30, n: 2, m: 5, t: 3, nose: 'split', fin: 4, cp: 0.58 }, 'Its nose opens like a bird\'s beak.'],
    ['Lantern', 'rare', { len: 26, n: 5, m: 7, t: 5, nose: 'blunt', fin: 2, cp: 0.5 }, 'A round ship with big windows. It glows at night.'],
    ['Cruiser', 'epic', { len: 36, n: 3, m: 6, t: 6, nose: 'blunt', fin: 4, cp: 0.75 }, 'A strong ship for captains. It never gets tired.'],
    ['Phantom', 'epic', { len: 32, n: 1, m: 5, t: 2, nose: 'point', fin: 6, cp: 0.6 }, 'A sharp, dark ship. You can hardly see it in space.'],
    ['Titan', 'legendary', { len: 36, n: 5, m: 9, t: 6, nose: 'blunt', fin: 5, cp: 0.7 }, 'The biggest hull in the shipyard. Very, very strong.']
  ];
  HULLS.forEach(([name, rarity, art, desc], i) => add({ id: 'hull-' + pad(i), shop: 'ship', slot: 'hull', name: name + ' Hull', rarity, art, desc }));
  const WINGS = [
    ['Basic', 'starter', 'basic', 'Small, simple wings. They do the job.'],
    ['Swept', 'common', 'swept', 'The wings go back, so the ship looks fast.'],
    ['Delta', 'common', 'delta', 'Big triangle wings. Very steady.'],
    ['Twin', 'common', 'twin', 'Two wings on each side. Double the power!'],
    ['Glider', 'uncommon', 'glider', 'Long, thin wings for slow, quiet flying.'],
    ['Spike', 'uncommon', 'spike', 'Pointy wings with spikes. They look brave.'],
    ['Feather', 'rare', 'feather', 'Wings with feathers, like a bird.'],
    ['Ring', 'rare', 'ring', 'A round ring around the ship. Very unusual!'],
    ['Bat', 'rare', 'bat', 'Wings like a bat. Good for night flights.'],
    ['Blade', 'epic', 'blade', 'Sharp wings like two swords.'],
    ['Butterfly', 'epic', 'butterfly', 'Round, colourful wings like a butterfly.'],
    ['Star', 'legendary', 'star', 'Wings shaped like a star. They sparkle.']
  ];
  WINGS.forEach(([name, rarity, shape, desc], i) => add({ id: 'wing-' + pad(i), shop: 'ship', slot: 'wing', name: name + ' Wings', rarity, art: { shape }, desc }));
  const ENGINES = [
    ['Puff', 'starter', { n: 1, size: 2, glow: '#ffb24a' }, 'A little engine that goes puff, puff, puff.'],
    ['Twin Jet', 'common', { n: 2, size: 2, glow: '#ff8a3d' }, 'Two jets push the ship forward.'],
    ['Ion', 'common', { n: 1, size: 3, glow: '#5ad1ff' }, 'A quiet blue engine. It saves energy.'],
    ['Plasma', 'uncommon', { n: 1, size: 4, glow: '#ff5ad9' }, 'A hot pink engine. Whoosh!'],
    ['Turbo', 'uncommon', { n: 2, size: 3, glow: '#ffe066' }, 'Press the button and go twice as fast.'],
    ['Rocket Bell', 'rare', { n: 1, size: 5, glow: '#ff6a3d', bell: true }, 'A big bell-shaped rocket engine.'],
    ['Ring Drive', 'rare', { n: 1, size: 4, glow: '#7ff0ff', ring: true }, 'A glowing ring pushes the ship.'],
    ['Quantum', 'epic', { n: 3, size: 2, glow: '#b18cff' }, 'Three small engines that hum together.'],
    ['Solar', 'epic', { n: 2, size: 3, glow: '#fff3a0', solar: true }, 'It gets its energy from the Sun.'],
    ['Warp', 'legendary', { n: 2, size: 5, glow: '#ffffff', warp: true }, 'The fastest engine. The stars become lines!']
  ];
  ENGINES.forEach(([name, rarity, art, desc], i) => add({ id: 'engine-' + pad(i), shop: 'ship', slot: 'engine', name: name + ' Engine', rarity, art, desc }));
  // paint: main colour, accent colour, pattern
  const PAINTS = [
    ['Moon White', 'starter', ['#e8ecf8', '#5a6fd8', 'solid']], ['Sky Blue', 'common', ['#5ab4ff', '#ffffff', 'solid']], ['Mint', 'common', ['#6fe3b4', '#2a7a62', 'solid']],
    ['Lava Red', 'common', ['#ff5a4a', '#ffd166', 'solid']], ['Sunflower', 'common', ['#ffd23f', '#7a4a00', 'solid']], ['Grape', 'common', ['#9a6bff', '#ffd6ff', 'solid']],
    ['Coral', 'common', ['#ff8a7a', '#fff1e0', 'solid']], ['Midnight', 'uncommon', ['#2a3070', '#7ff0ff', 'solid']], ['Forest', 'uncommon', ['#3f9a4e', '#e8ffd6', 'solid']],
    ['Bubblegum', 'uncommon', ['#ff8ad8', '#ffffff', 'solid']], ['Ocean Stripes', 'uncommon', ['#2a8fd8', '#bff8ff', 'stripes']], ['Racing Stripes', 'uncommon', ['#ff3b3b', '#ffffff', 'band']],
    ['Checkers', 'rare', ['#ffffff', '#1d1f2e', 'check']], ['Galaxy', 'rare', ['#2a1f6a', '#ff7ad9', 'galaxy']], ['Sunset Fade', 'rare', ['#ff7a3d', '#9a3bff', 'fade']],
    ['Aurora Fade', 'rare', ['#3dffb0', '#3d6bff', 'fade']], ['Ice', 'rare', ['#bff8ff', '#5ab4ff', 'stripes']], ['Gold Plate', 'epic', ['#ffd23f', '#fff6c8', 'shine']],
    ['Silver Chrome', 'epic', ['#c9d0e2', '#ffffff', 'shine']], ['Candy Stripes', 'epic', ['#ffffff', '#ff4a8a', 'stripes']], ['Polka Stars', 'epic', ['#3a4fd8', '#ffe066', 'dots']],
    ['Moss Camo', 'uncommon', ['#5f8a4a', '#2f4a2a', 'camo']], ['Lightning', 'epic', ['#2a2a40', '#ffe066', 'bolt']], ['Rainbow', 'legendary', ['#ff5a5a', '#5ab4ff', 'rainbow']]
  ];
  PAINTS.forEach(([name, rarity, [c1, c2, pattern]], i) => add({ id: 'paint-' + pad(i), shop: 'ship', slot: 'paint', name: name + ' Paint', rarity, art: { c1, c2, pattern },
    desc: pattern === 'solid' ? 'Paint your ship ' + name.toLowerCase() + '. Simple and smart.' : 'A ' + name.toLowerCase() + ' paint job. Everyone will look at your ship!' }));
  const DECALS = ['Star', 'Bolt', 'Heart', 'Planet', 'Moon', 'Flame', 'Wave', 'Number Five', 'Smile', 'Paw', 'Leaf', 'Diamond', 'Crown', 'Music Note', 'Eye', 'Flag'];
  DECALS.forEach((name, i) => add({ id: 'decal-' + pad(i), shop: 'ship', slot: 'decal', name: name + ' Sticker', rarity: i < 8 ? 'common' : i < 13 ? 'uncommon' : 'rare', art: { shape: name.toLowerCase().replace(/\s+/g, '') },
    desc: 'A ' + name.toLowerCase() + ' sticker for the side of your ship.' }));
  const TRAILS = [
    ['Spark Dust', '#ffe066', 'dots'], ['Rainbow', '#ff5a5a', 'rainbow'], ['Bubbles', '#bff8ff', 'bubbles'], ['Hearts', '#ff7ad9', 'hearts'],
    ['Stars', '#fff3a0', 'stars'], ['Fire', '#ff6a3d', 'fire'], ['Ice Crystals', '#7ff0ff', 'ice'], ['Leaves', '#6fe36f', 'leaves'],
    ['Music Notes', '#b18cff', 'notes'], ['Comet Tail', '#ffffff', 'comet'], ['Pixels', '#5ad1ff', 'pixels'], ['Galaxy Swirl', '#ff7ad9', 'swirl']
  ];
  TRAILS.forEach(([name, color, style], i) => add({ id: 'trail-' + pad(i), shop: 'ship', slot: 'trail', name: name + ' Trail', rarity: ['uncommon', 'epic', 'uncommon', 'rare', 'rare', 'rare', 'rare', 'uncommon', 'rare', 'epic', 'uncommon', 'legendary'][i], art: { color, style },
    desc: 'Your ship leaves ' + (style === 'rainbow' ? 'a rainbow' : name.toLowerCase()) + ' behind it.' }));

  // ---------- WARDROBE ----------
  // hats: 12 shapes × 2 colours (a = main, A = dark, b = accent, w = white, y = gold)
  const HAT_SHAPES = {
    cone: ['.....b......', '....aaa.....', '....aba.....', '...aaaaa....', '...abaaba...', '..aaaaaaaa..', '..abaabaab..', '.AAAAAAAAAA.'],
    beanie: ['....bbb.....', '...bwbbb....', '....bbb.....', '..aaaaaaaa..', '.aawaaaawaa.', '.aaaaaaaaaa.', 'AbAbAbAbAbAb'],
    tophat: ['..aaaaaaaa..', '..aaaaaaaa..', '..aaaaaaaa..', '..aaaaaaaa..', '..bbbbbbbb..', 'AAAAAAAAAAAA'],
    propeller: ['.bbbb..bbbb.', '.....yy.....', '.....yy.....', '...aaaaaa...', '..awaaaabaa.', '.aaaaaaaaaa.', 'AAAAAAAAAAAA'],
    ranger: ['....aaaa....', '...aaaaaa...', '...abbbbba..', 'AAAAAAAAAAAA', '.AAAAAAAAAA.'],
    beret: ['......b.....', '..aaaaaaaa..', '.aaaawaaaaa.', 'aaaaaaaaaaaa', '.AAAAAAAAAA.'],
    bow: ['.aa......aa.', 'aaaa....aaaa', 'aawaa..aawaa', 'aaaaabbaaaaa', 'aaaaabbaaaaa', 'AAAA....AAAA'],
    tiara: ['.....w......', '..y..b..y...', '.yyy.y.yyy..', 'yyyyyyyyyyy.', 'AyAyAbAyAyA.'],
    chef: ['.wwwwwwwww..', 'wwwwwwwwwww.', 'wwwwwwwwwww.', '.wwwwwwwww..', '.aaaaaaaaa..', '.AAAAAAAAA..'],
    horns: ['a..........a', 'aa........aa', '.aa......aa.', '.aaA....Aaa.', '..AA....AA..'],
    halo: ['..yyyyyyyy..', '.y........y.', '..yyyyyyyy..'],
    flowers: ['.b..w..b..w.', 'bwb.wyw.bwb.', '.b..w..b..w.', 'aaaaaaaaaaaa']
  };
  const HAT_LIST = [
    ['Party Cone', 'cone', ['#ff7ad9', '#c2459c', '#ffe066'], ['#5ad1ff', '#2a8fd8', '#ffffff']],
    ['Pompom Beanie', 'beanie', ['#ff5a5a', '#b83434', '#ffffff'], ['#6fe3b4', '#2a7a62', '#ffffff']],
    ['Top Hat', 'tophat', ['#2a2a40', '#14141f', '#ff5a5a'], ['#9a6bff', '#5a3bb0', '#ffe066']],
    ['Propeller Cap', 'propeller', ['#ffd23f', '#c49a10', '#ff5a5a'], ['#5ab4ff', '#2a6fd0', '#6fe36f']],
    ['Ranger Hat', 'ranger', ['#c98a4a', '#8a5a2a', '#3a2a1a'], ['#6f7fa0', '#3f4a66', '#7ff0ff']],
    ['Beret', 'beret', ['#ff5a5a', '#b83434', '#2a2a40'], ['#3a4fd8', '#25348f', '#ffe066']],
    ['Big Bow', 'bow', ['#ff7ad9', '#c2459c', '#ffe066'], ['#7ff0ff', '#2a8fd8', '#ffffff']],
    ['Tiara', 'tiara', ['#ffd23f', '#c49a10', '#ff5ad9'], ['#c9d0e2', '#858fab', '#5ad1ff']],
    ['Chef Hat', 'chef', ['#ff5a5a', '#b83434', '#ffffff'], ['#3a4fd8', '#25348f', '#ffffff']],
    ['Horns', 'horns', ['#ff6a3d', '#b8432a', '#ffffff'], ['#c9d0e2', '#858fab', '#ffffff']],
    ['Halo', 'halo', ['#ffe066', '#c49a10', '#ffffff'], ['#7ff0ff', '#2a8fd8', '#ffffff']],
    ['Flower Crown', 'flowers', ['#6fe36f', '#3f9a4e', '#ff7ad9'], ['#6fe36f', '#3f9a4e', '#5ad1ff']]
  ];
  const HAT_COLOURS = [['Pink', 'Blue'], ['Red', 'Mint'], ['Black', 'Purple'], ['Yellow', 'Blue'], ['Brown', 'Steel'], ['Red', 'Navy'], ['Pink', 'Ice'], ['Gold', 'Silver'], ['Red', 'Navy'], ['Fire', 'Silver'], ['Gold', 'Ice'], ['Pink', 'Blue']];
  HAT_LIST.forEach(([name, shape, c1, c2], i) => [c1, c2].forEach((col, j) => add({
    id: 'hat-' + pad(i * 2 + j), shop: 'wear', slot: 'hat', name: HAT_COLOURS[i][j] + ' ' + name, rarity: ['common', 'uncommon', 'rare'][(i + j) % 3], art: { shape, pal: { a: col[0], A: col[1], b: col[2], w: '#ffffff', y: '#ffd23f' } },
    desc: 'A ' + HAT_COLOURS[i][j].toLowerCase() + ' ' + name.toLowerCase() + ' for your creature. It looks great!'
  })));
  const CAPES = [
    ['Hero Red', '#e5484d', '#ffd23f', 'solid'], ['Night Blue', '#25348f', '#7ff0ff', 'solid'], ['Royal Purple', '#6a3bb0', '#ffd23f', 'trim'], ['Star', '#2a3070', '#ffe066', 'stars'],
    ['Galaxy', '#2a1f6a', '#ff7ad9', 'galaxy'], ['Stripes', '#ffffff', '#3a4fd8', 'stripes'], ['Leaf', '#3f9a4e', '#b8f5a0', 'trim'], ['Ice', '#bff8ff', '#5ab4ff', 'stripes'],
    ['Gold', '#ffd23f', '#fff6c8', 'trim'], ['Rainbow', '#ff5a5a', '#5ab4ff', 'rainbow']
  ];
  CAPES.forEach(([name, c1, c2, pattern], i) => add({ id: 'cape-' + pad(i), shop: 'wear', slot: 'cape', name: name + ' Cape', rarity: ['common', 'common', 'uncommon', 'rare', 'epic', 'uncommon', 'common', 'rare', 'epic', 'legendary'][i], art: { c1, c2, pattern },
    desc: 'A ' + name.toLowerCase() + ' cape. Every hero needs one!' }));
  const AURAS = [
    ['Blue Glow', '#5ad1ff', 'glow'], ['Pink Glow', '#ff7ad9', 'glow'], ['Gold Glow', '#ffd23f', 'glow'], ['Green Sparks', '#6fe36f', 'sparks'],
    ['Fire', '#ff6a3d', 'fire'], ['Frost', '#bff8ff', 'sparks'], ['Rainbow', '#ff5a5a', 'rainbow'], ['Sparkle', '#ffffff', 'sparks'],
    ['Shadow', '#5a3bb0', 'glow'], ['Electric', '#ffe066', 'zap'], ['Heart Bubbles', '#ff7ad9', 'hearts'], ['Star Ring', '#fff3a0', 'ring']
  ];
  AURAS.forEach(([name, color, style], i) => add({ id: 'aura-' + pad(i), shop: 'wear', slot: 'aura', name: name + ' Aura', rarity: ['uncommon', 'uncommon', 'rare', 'rare', 'epic', 'rare', 'legendary', 'rare', 'epic', 'epic', 'rare', 'epic'][i], art: { color, style },
    desc: 'A ' + name.toLowerCase() + ' around your creature. It shines in the dark.' }));
  // buddies: little robots and drones (head, eye, antenna, hue)
  const BUDDIES = [
    ['Bolt', 'box', 'round', 'bolt', 205], ['Pip', 'round', 'dot', 'ball', 330], ['Zuzu', 'tv', 'wide', 'twin', 120], ['Blink', 'dome', 'one', 'ball', 45],
    ['Gizmo', 'box', 'wide', 'twin', 15], ['Orbi', 'round', 'one', 'ring', 260], ['Echo', 'tv', 'round', 'bolt', 175], ['Widget', 'dome', 'dot', 'twin', 95],
    ['Beep', 'box', 'dot', 'ball', 290], ['Tinkle', 'round', 'round', 'star', 50], ['Moxie', 'tv', 'one', 'star', 345], ['Dot', 'dome', 'round', 'ring', 190],
    ['Fuzz', 'round', 'wide', 'bolt', 140], ['Kiki', 'box', 'one', 'star', 310], ['Rumble', 'tv', 'dot', 'ring', 25], ['Lumo', 'dome', 'wide', 'star', 220]
  ];
  BUDDIES.forEach(([name, head, eye, ant, hue], i) => add({ id: 'buddy-' + pad(i), shop: 'wear', slot: 'buddy', name: name, rarity: i < 6 ? 'uncommon' : i < 12 ? 'rare' : 'epic', art: { head, eye, ant, hue },
    desc: name + ' is a little robot friend. It flies next to your creature and says "beep!"' }));

  // ---------- CARD GALLERY ----------
  const SETS = {
    planets: { name: 'Planets & Moons', title: 'Planet Hunter' },
    stars: { name: 'Constellations', title: 'Star Mapper' },
    wonders: { name: 'Space Wonders', title: 'Wonder Seeker' },
    craft: { name: 'Spacecraft', title: 'Rocket Engineer' },
    creatures: { name: 'Creatures', title: 'Creature Keeper' }
  };
  const PLANETS = [
    ['Mercury', 'common', { c: '#a8a39a', c2: '#7a756c', craters: 1 }, 'Mercury is the closest planet to the Sun. A year there is only 88 days.'],
    ['Venus', 'common', { c: '#f0c87a', c2: '#d9a04a', bands: 1 }, 'Venus is the hottest planet. Its thick clouds keep the heat in.'],
    ['Earth', 'rare', { c: '#3a7fd8', c2: '#4fb35a', land: 1 }, 'Earth is our home. It is the only planet we know with life.'],
    ['Mars', 'common', { c: '#d9663a', c2: '#a8432a', craters: 1 }, 'Mars is the red planet. It has the tallest volcano in the solar system.'],
    ['Jupiter', 'rare', { c: '#e0b48a', c2: '#b8784a', bands: 1, spot: 1 }, 'Jupiter is the biggest planet. A storm on it is bigger than the Earth.'],
    ['Saturn', 'epic', { c: '#f0d48a', c2: '#c9a85a', bands: 1, ring: 1 }, 'Saturn has beautiful rings made of ice and rock.'],
    ['Uranus', 'common', { c: '#9ae6ef', c2: '#6ac0d0', ring: 2 }, 'Uranus spins on its side, like a rolling ball.'],
    ['Neptune', 'common', { c: '#3a5fd8', c2: '#2a3fa8', bands: 1 }, 'Neptune is very cold and very windy. It is far from the Sun.'],
    ['Pluto', 'rare', { c: '#d8c0a8', c2: '#b8987a', heart: 1 }, 'Pluto is a dwarf planet. It has a big heart shape on it.'],
    ['The Moon', 'common', { c: '#d0d4dc', c2: '#9aa0ac', craters: 1 }, 'The Moon goes around the Earth. People first walked on it in 1969.'],
    ['The Sun', 'epic', { c: '#ffd23f', c2: '#ff8a3d', sun: 1 }, 'The Sun is a star. It gives us light and warmth.'],
    ['Io', 'common', { c: '#f0e070', c2: '#d98a3a', spots: 1 }, 'Io is a moon of Jupiter. It has hundreds of volcanoes.'],
    ['Europa', 'rare', { c: '#e8dcc8', c2: '#b88a6a', cracks: 1 }, 'Europa is an icy moon. There may be an ocean under the ice.'],
    ['Titan', 'common', { c: '#e0a84a', c2: '#c0843a', haze: 1 }, 'Titan is Saturn\'s biggest moon. It has lakes, but not of water.'],
    ['Ganymede', 'common', { c: '#a8a090', c2: '#7a7060', craters: 1 }, 'Ganymede is the biggest moon in the solar system.'],
    ['Phobos', 'common', { c: '#8a7a6a', c2: '#5a4a3a', potato: 1 }, 'Phobos is a small moon of Mars. It looks like a potato.']
  ];
  PLANETS.forEach(([name, rarity, art, desc], i) => add({ id: 'card-pl-' + pad(i), shop: 'cards', slot: 'card', set: 'planets', name, rarity, art: Object.assign({ kind: 'planet' }, art), desc }));
  // constellation star points (0..1) and lines
  const STARS = [
    ['Orion', [[0.3, 0.12], [0.7, 0.15], [0.42, 0.5], [0.5, 0.52], [0.58, 0.54], [0.28, 0.88], [0.72, 0.85]], [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]], 'Orion looks like a hunter. Find the three stars of his belt.'],
    ['The Great Bear', [[0.08, 0.3], [0.25, 0.28], [0.4, 0.34], [0.55, 0.42], [0.6, 0.62], [0.85, 0.66], [0.88, 0.45]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]], 'The Great Bear has seven bright stars. They look like a big spoon.'],
    ['The Little Bear', [[0.12, 0.2], [0.3, 0.3], [0.45, 0.42], [0.58, 0.55], [0.85, 0.52], [0.88, 0.75], [0.62, 0.78]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]], 'The North Star is at the end of the Little Bear\'s tail.'],
    ['Cassiopeia', [[0.08, 0.35], [0.3, 0.7], [0.5, 0.42], [0.7, 0.72], [0.92, 0.3]], [[0, 1], [1, 2], [2, 3], [3, 4]], 'Cassiopeia looks like the letter W in the sky.'],
    ['The Swan', [[0.5, 0.08], [0.5, 0.35], [0.5, 0.62], [0.5, 0.9], [0.15, 0.4], [0.85, 0.32]], [[0, 1], [1, 2], [2, 3], [4, 1], [1, 5]], 'The Swan flies along the Milky Way. It looks like a big cross.'],
    ['Leo', [[0.2, 0.3], [0.28, 0.15], [0.42, 0.12], [0.4, 0.32], [0.35, 0.5], [0.7, 0.45], [0.9, 0.62], [0.68, 0.7]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 4]], 'Leo is the lion. Its head looks like a backwards question mark.'],
    ['Scorpius', [[0.1, 0.2], [0.2, 0.3], [0.32, 0.38], [0.42, 0.5], [0.5, 0.65], [0.6, 0.8], [0.75, 0.85], [0.88, 0.75], [0.9, 0.6]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]], 'Scorpius looks like a scorpion with a long, curved tail.'],
    ['Taurus', [[0.1, 0.15], [0.35, 0.4], [0.5, 0.55], [0.62, 0.48], [0.9, 0.2], [0.7, 0.75]], [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5]], 'Taurus is the bull. It has a red star called Aldebaran.'],
    ['Gemini', [[0.3, 0.1], [0.65, 0.12], [0.3, 0.5], [0.65, 0.48], [0.25, 0.9], [0.7, 0.88]], [[0, 2], [2, 4], [1, 3], [3, 5], [2, 3]], 'Gemini means twins. Two bright stars are their heads.'],
    ['Lyra', [[0.5, 0.12], [0.4, 0.4], [0.62, 0.42], [0.35, 0.8], [0.6, 0.82]], [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4]], 'Lyra is a small harp. Its star Vega is very bright.'],
    ['Pegasus', [[0.2, 0.3], [0.6, 0.3], [0.6, 0.7], [0.2, 0.7], [0.85, 0.12], [0.92, 0.5]], [[0, 1], [1, 2], [2, 3], [3, 0], [1, 4], [2, 5]], 'Pegasus is a flying horse. Look for a big square of stars.'],
    ['Draco', [[0.1, 0.8], [0.25, 0.6], [0.45, 0.65], [0.6, 0.45], [0.5, 0.25], [0.7, 0.12], [0.85, 0.2], [0.82, 0.38]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 5]], 'Draco is a long dragon. It winds around the Little Bear.']
  ];
  STARS.forEach(([name, pts, lines, desc], i) => add({ id: 'card-st-' + pad(i), shop: 'cards', slot: 'card', set: 'stars', name, rarity: i < 4 ? 'rare' : 'common', art: { kind: 'stars', pts, lines }, desc }));
  const WONDERS = [
    ['Comet', 'comet', 'common', 'A comet is a ball of ice and dust. It grows a long tail near the Sun.'],
    ['Nebula', 'nebula', 'rare', 'A nebula is a giant cloud of gas and dust. New stars are born there.'],
    ['Black Hole', 'blackhole', 'legendary', 'A black hole pulls very strongly. Even light cannot escape it.'],
    ['Spiral Galaxy', 'galaxy', 'epic', 'A galaxy is a huge family of stars. Ours is called the Milky Way.'],
    ['Aurora', 'aurora', 'rare', 'Auroras are colourful lights in the sky near the North and South Poles.'],
    ['Meteor Shower', 'meteors', 'common', 'In a meteor shower, many shooting stars fall in one night.'],
    ['Supernova', 'supernova', 'epic', 'A supernova is a giant star exploding. It can shine brighter than a galaxy.'],
    ['Solar Eclipse', 'eclipse', 'rare', 'In a solar eclipse, the Moon hides the Sun for a few minutes.'],
    ['Asteroid Belt', 'asteroids', 'common', 'Between Mars and Jupiter, millions of rocks go around the Sun.'],
    ['Red Giant', 'redgiant', 'common', 'A red giant is an old star. It is very big but not very hot.'],
    ['Pulsar', 'pulsar', 'rare', 'A pulsar is a tiny star. It spins very fast and flashes like a lighthouse.'],
    ['Milky Way', 'milkyway', 'common', 'On a dark night, the Milky Way looks like a river of light.']
  ];
  WONDERS.forEach(([name, kind, rarity, desc], i) => add({ id: 'card-wo-' + pad(i), shop: 'cards', slot: 'card', set: 'wonders', name, rarity, art: { kind: 'wonder', w: kind }, desc }));
  const CRAFT = [
    ['Rocket', 'rocket', 'common', 'A rocket pushes fire down, so it can fly up into space.'],
    ['Space Station', 'station', 'rare', 'Astronauts live and work on a space station for months.'],
    ['Mars Rover', 'rover', 'rare', 'A rover is a robot car. It drives on Mars and takes photos.'],
    ['Space Telescope', 'telescope', 'epic', 'A space telescope sees far stars with no clouds in the way.'],
    ['Satellite', 'satellite', 'common', 'Satellites go around the Earth. They help with weather, TV and maps.'],
    ['Moon Lander', 'lander', 'common', 'A lander comes down slowly and stands on the Moon on its legs.'],
    ['Space Shuttle', 'shuttle', 'rare', 'The space shuttle flew to space and landed like a plane.'],
    ['Deep Space Probe', 'probe', 'epic', 'Probes travel very far. Some have left our solar system.'],
    ['Capsule', 'capsule', 'common', 'A capsule brings astronauts home. Big parachutes slow it down.'],
    ['Solar Sail', 'sail', 'rare', 'A solar sail moves with light from the Sun, like a boat with wind.'],
    ['Space Suit', 'suit', 'common', 'A space suit gives astronauts air and keeps them warm or cool.'],
    ['Cargo Ship', 'cargo', 'common', 'Cargo ships bring food, water and tools to the space station.']
  ];
  CRAFT.forEach(([name, kind, rarity, desc], i) => add({ id: 'card-cr-' + pad(i), shop: 'cards', slot: 'card', set: 'craft', name, rarity, art: { kind: 'craft', w: kind }, desc }));
  const CREATURES = root.CQCreatures ? root.CQCreatures.list : [];
  const LORE = root.CQLore || {};
  CREATURES.forEach((c, i) => add({ id: 'card-cx-' + pad(i), shop: 'cards', slot: 'card', set: 'creatures', name: c.name, rarity: c.legendary ? 'legendary' : i % 5 === 4 ? 'rare' : 'common', art: { kind: 'creature', cid: c.id },
    desc: LORE[c.name] || c.name + ' is a ' + c.type + ' creature from the ASTROVOYAGERS galaxy.' }));
  const CARD_PRICE = { common: 30, rare: 60, epic: 120, legendary: 240 };
  items.forEach(it => { if (it.shop === 'cards') it.price = CARD_PRICE[it.rarity]; });

  // ---------- CABIN STUDIO ----------
  const WALLS = [['Steel Panels', '#3a4766', '#2a3550', 'panels'], ['Cosy Blue', '#2f4a8a', '#3a5aa0', 'stripes'], ['Mint', '#2f7a6a', '#3a8a7a', 'panels'], ['Starry', '#1d2350', '#ffe066', 'stars'],
    ['Honeycomb', '#4a3a6a', '#5a4a80', 'hex'], ['Sunset', '#8a3a5a', '#c0604a', 'fade'], ['Polka', '#2a3a6a', '#7ff0ff', 'dots'], ['Wood', '#6a4a30', '#5a3a24', 'planks'],
    ['Circuit', '#1d3a3a', '#3dffb0', 'circuit'], ['Galaxy', '#2a1f5a', '#ff7ad9', 'galaxy']];
  WALLS.forEach(([name, c1, c2, pattern], i) => add({ id: 'wall-' + pad(i), shop: 'cabin', slot: 'wall', name: name + ' Wall', rarity: i === 0 ? 'starter' : ['common', 'common', 'uncommon', 'uncommon', 'uncommon', 'common', 'common', 'rare', 'rare'][i - 1], art: { c1, c2, pattern },
    desc: 'Make your cabin walls ' + name.toLowerCase() + '.' }));
  const FLOORS = [['Metal', '#5a6680', '#4a5570', 'grid'], ['Carpet Blue', '#3a4fa8', '#3346a0', 'plain'], ['Checker', '#e8ecf8', '#2a2a40', 'check'], ['Wood', '#8a5a34', '#74492a', 'planks'],
    ['Moon Rock', '#9aa0ac', '#7a808c', 'rock'], ['Grass', '#4f9a4a', '#3f8a3a', 'grass'], ['Glow Tiles', '#2a2a5a', '#7ff0ff', 'tiles'], ['Rainbow', '#ff5a5a', '#5ab4ff', 'rainbow']];
  FLOORS.forEach(([name, c1, c2, pattern], i) => add({ id: 'floor-' + pad(i), shop: 'cabin', slot: 'floor', name: name + ' Floor', rarity: i === 0 ? 'starter' : ['common', 'common', 'common', 'uncommon', 'uncommon', 'rare', 'epic'][i - 1], art: { c1, c2, pattern },
    desc: 'A ' + name.toLowerCase() + ' floor for your cabin.' }));
  const WINDOWS = [['Stars', 'stars'], ['Earth', 'earth'], ['The Moon', 'moon'], ['Nebula', 'nebula'], ['Saturn', 'saturn'], ['Red Planet', 'mars'], ['Galaxy', 'galaxy'], ['Aurora', 'aurora'], ['Comet', 'comet'], ['Sunrise', 'sunrise']];
  WINDOWS.forEach(([name, view], i) => add({ id: 'window-' + pad(i), shop: 'cabin', slot: 'window', name: name + ' Window', rarity: i === 0 ? 'starter' : ['common', 'common', 'uncommon', 'uncommon', 'common', 'rare', 'rare', 'uncommon', 'epic'][i - 1], art: { view },
    desc: 'Look out of your window and see ' + name.toLowerCase().replace(/^the /, 'the ') + '.' }));
  const FURN = [
    ['bed', 'Bunk Bed', 'bunk', '#5a6fd8', 'common'], ['bed', 'Pod Bed', 'pod', '#7ff0ff', 'uncommon'], ['bed', 'Cosy Bed', 'bunk', '#ff7ad9', 'common'], ['bed', 'Sleep Pod', 'pod', '#ffd23f', 'rare'],
    ['desk', 'Computer Desk', 'computer', '#8a94b8', 'common'], ['desk', 'Study Desk', 'books', '#c98a4a', 'common'], ['desk', 'Gamer Desk', 'computer', '#ff5ad9', 'uncommon'], ['desk', 'Science Desk', 'books', '#6fe3b4', 'uncommon'],
    ['lamp', 'Lava Lamp', 'lava', '#ff7ad9', 'common'], ['lamp', 'Floor Lamp', 'floor', '#ffe066', 'common'], ['lamp', 'Blue Lava Lamp', 'lava', '#5ad1ff', 'uncommon'], ['lamp', 'Moon Lamp', 'moon', '#fff3a0', 'rare'],
    ['plant', 'Space Cactus', 'cactus', '#6fe36f', 'common'], ['plant', 'Glow Fern', 'fern', '#3dffb0', 'uncommon'], ['plant', 'Blue Cactus', 'cactus', '#5ad1ff', 'uncommon'], ['plant', 'Star Flower', 'fern', '#ff7ad9', 'rare'],
    ['shelf', 'Bookshelf', 'books', '#c98a4a', 'common'], ['shelf', 'Trophy Shelf', 'trophy', '#8a94b8', 'rare'], ['shelf', 'Model Shelf', 'models', '#5a6fd8', 'uncommon'],
    ['poster', 'Planet Poster', 'planet', '#ff8a3d', 'common'], ['poster', 'Rocket Poster', 'rocket', '#5ab4ff', 'common'], ['poster', 'Creature Poster', 'creature', '#6fe36f', 'uncommon'], ['poster', 'Galaxy Poster', 'galaxy', '#b18cff', 'uncommon'],
    ['poster', 'Moon Poster', 'moon', '#c9d0e2', 'common'], ['poster', 'Saturn Poster', 'saturn', '#ffd23f', 'uncommon'], ['poster', 'Comet Poster', 'comet', '#7ff0ff', 'rare'], ['poster', 'Star Map Poster', 'starmap', '#ffe066', 'rare'],
    ['rug', 'Round Rug', 'round', '#5a6fd8', 'common'], ['rug', 'Star Rug', 'star', '#ffd23f', 'uncommon'], ['rug', 'Planet Rug', 'planet', '#ff7ad9', 'uncommon'], ['rug', 'Stripy Rug', 'stripes', '#6fe3b4', 'common'],
    ['gadget', 'Telescope', 'telescope', '#c9d0e2', 'rare'], ['gadget', 'Mini Robot', 'robot', '#5ad1ff', 'uncommon'], ['gadget', 'Space Jelly Tank', 'tank', '#ff7ad9', 'epic'],
    ['gadget', 'Arcade Machine', 'arcade', '#9a6bff', 'epic'], ['gadget', 'Globe', 'globe', '#3a7fd8', 'uncommon'], ['gadget', 'Guitar', 'guitar', '#ff6a3d', 'rare']
  ];
  const FDESC = { bed: 'Sleep well and dream of the stars.', desk: 'A good place to do your homework.', lamp: 'A little light for your cabin.', plant: 'A plant that grows in space.', shelf: 'Keep your favourite things here.',
    poster: 'Put it on the wall of your cabin.', rug: 'Soft and warm for your feet.', gadget: 'Something fun to have in your cabin.' };
  const fcount = {};
  FURN.forEach(([slot, name, kind, color, rarity]) => { fcount[slot] = (fcount[slot] || 0) + 1; add({ id: slot + '-' + pad(fcount[slot] - 1), shop: 'cabin', slot, name, rarity, art: { kind, color }, desc: 'A ' + name.toLowerCase() + '. ' + FDESC[slot] }); });

  // ---------- FRAMES & TITLES ----------
  const FRAMES = [
    ['Simple', 'starter', '#5a6fd8', '#5a6fd8', 'line'], ['Sky', 'common', '#5ab4ff', '#bff8ff', 'line'], ['Mint', 'common', '#6fe3b4', '#2a7a62', 'line'], ['Rose', 'common', '#ff7ad9', '#ffd6f0', 'line'],
    ['Double Gold', 'uncommon', '#ffd23f', '#c49a10', 'double'], ['Pixel', 'uncommon', '#7ff0ff', '#2a8fd8', 'pixel'], ['Neon', 'rare', '#ff5ad9', '#7ff0ff', 'glow'], ['Sunset', 'rare', '#ff8a3d', '#b18cff', 'glow'],
    ['Starry', 'rare', '#ffe066', '#2a3070', 'stars'], ['Ice', 'uncommon', '#bff8ff', '#5ab4ff', 'pixel'], ['Lava', 'rare', '#ff6a3d', '#ffd23f', 'glow'], ['Forest', 'uncommon', '#6fe36f', '#3f9a4e', 'double'],
    ['Galaxy', 'epic', '#b18cff', '#ff7ad9', 'stars'], ['Rainbow', 'epic', '#ff5a5a', '#5ab4ff', 'rainbow'], ['Royal', 'epic', '#ffd23f', '#9a6bff', 'double'], ['Diamond', 'legendary', '#ffffff', '#7ff0ff', 'rainbow']
  ];
  FRAMES.forEach(([name, rarity, c1, c2, style], i) => add({ id: 'frame-' + pad(i), shop: 'profile', slot: 'frame', name: name + ' Frame', rarity, art: { c1, c2, style }, desc: 'A ' + name.toLowerCase() + ' frame for your voyager card.' }));
  // req: books (BookR books, all time), hw (homework done), set (a card set), badge, level
  const TITLES = [
    ['Space Cadet', 'starter'], ['Comet Chaser', 'common'], ['Moon Walker', 'common'], ['Star Pilot', 'common'], ['Nebula Dreamer', 'uncommon'], ['Orbit Master', 'uncommon'],
    ['Cosmic Explorer', 'rare'], ['Galaxy Guardian', 'rare'], ['Captain', 'epic'], ['Rocket Scientist', 'epic', { level: 8 }],
    ['Star Reader', 'uncommon', { books: 10 }], ['Book Astronaut', 'rare', { books: 25 }], ['Library Legend', 'epic', { books: 50 }],
    ['Homework Hero', 'uncommon', { hw: 10 }], ['Always Ready', 'rare', { hw: 25 }],
    ['Planet Hunter', 'rare', { set: 'planets' }], ['Star Mapper', 'rare', { set: 'stars' }], ['Wonder Seeker', 'rare', { set: 'wonders' }], ['Rocket Engineer', 'rare', { set: 'craft' }], ['Creature Keeper', 'legendary', { set: 'creatures' }],
    ['Rising Star', 'uncommon', { badge: 'rising' }], ['Supernova', 'uncommon', { badge: 'supernova' }], ['Bookworm', 'uncommon', { badge: 'bookworm' }], ['Legend', 'epic', { level: 12 }]
  ];
  TITLES.forEach(([name, rarity, req], i) => add({ id: 'title-' + pad(i), shop: 'profile', slot: 'title', name, rarity, art: { text: name }, req: req || null,
    desc: 'A title for your voyager card: "' + name + '".' + (req ? ' It is for voyagers who have ' + reqText(req) + '.' : '') }));
  function reqText(r) {
    if (r.books) return 'read ' + r.books + ' books on BookR Next';
    if (r.hw) return 'done ' + r.hw + ' homework tasks';
    if (r.set) return 'the whole ' + SETS[r.set].name + ' card set';
    if (r.badge) return 'the ' + r.badge.replace(/^./, ch => ch.toUpperCase()) + ' badge';
    if (r.level) return 'reached level ' + r.level;
    return '';
  }

  // ---------- SIGNATURE VAULT ----------
  // One owner in each class; each voyager can own one. They use the art of their slot, with a special finish.
  const SIGS = [
    ['Golden Phoenix Hull', 'hull', { len: 34, n: 2, m: 7, t: 3, nose: 'split', fin: 6, cp: 0.6, gold: 1 }, 'A golden hull shaped like a phoenix. There is only one in your class.'],
    ['Star Whale Hull', 'hull', { len: 36, n: 5, m: 9, t: 4, nose: 'round', fin: 4, cp: 0.74, glow: '#7ff0ff' }, 'A huge, gentle space whale. It sings to the stars.'],
    ['Dragon Wings', 'wing', { shape: 'dragon' }, 'Wings of a space dragon. Only one voyager can fly with them.'],
    ['Pulsar Heart Engine', 'engine', { n: 1, size: 6, glow: '#7ff0ff', ring: true, pulse: true }, 'An engine with the heart of a pulsar. It flashes like a lighthouse.'],
    ['Supernova Paint', 'paint', { c1: '#ffd23f', c2: '#ff3b8a', pattern: 'supernova' }, 'The colours of an exploding star. Bright and bold!'],
    ['Nebula Pearl Paint', 'paint', { c1: '#e8dcff', c2: '#7ff0ff', pattern: 'pearl' }, 'A shiny paint that changes colour like a pearl.'],
    ['Comet Crown Trail', 'trail', { color: '#ffd23f', style: 'crown' }, 'Your ship leaves little golden crowns behind it.'],
    ['Crown of Andromeda', 'hat', { shape: 'tiara', pal: { a: '#ffd23f', A: '#c49a10', b: '#ff3b8a', w: '#ffffff', y: '#fff6c8' }, big: true }, 'The crown of a faraway galaxy. Only one creature can wear it.'],
    ['Ace Pilot Helmet', 'hat', { shape: 'propeller', pal: { a: '#e8ecf8', A: '#858fab', b: '#ffd23f', w: '#ffffff', y: '#ff5a5a' } }, 'The helmet of the best pilot in the class.'],
    ['Cloak of Stars', 'cape', { c1: '#2f2f7a', c2: '#ffffff', pattern: 'stars', long: true }, 'A long cloak full of tiny stars.'],
    ['Solar Flare Aura', 'aura', { color: '#ffb24a', style: 'flare' }, 'Your creature shines like the Sun.'],
    ['Aurora Halo', 'aura', { color: '#3dffb0', style: 'aurora' }, 'Green and blue lights dance around your creature.'],
    ['Captain Nova', 'buddy', { head: 'dome', eye: 'wide', ant: 'star', hue: 48, gold: 1 }, 'A golden robot captain. It salutes when you arrive.'],
    ['Little Comet', 'buddy', { head: 'round', eye: 'round', ant: 'ball', hue: 190, comet: 1 }, 'A tiny comet friend with a sparkly tail.'],
    ['Black Hole Window', 'window', { view: 'blackhole' }, 'Your window shows a real black hole. Wow!'],
    ['Golden Telescope', 'gadget', { kind: 'telescope', color: '#ffd23f' }, 'A golden telescope. You can see other galaxies with it.'],
    ['Time Machine', 'gadget', { kind: 'timemachine', color: '#7ff0ff' }, 'A strange machine with clocks. Where will you go?'],
    ['Map of the Universe', 'poster', { kind: 'universe', color: '#ffd23f' }, 'A giant map of the whole universe.'],
    ['Moon Hammock', 'bed', { kind: 'hammock', color: '#fff3a0' }, 'Sleep in a hammock under the Moon.'],
    ['Galaxy Rug', 'rug', { kind: 'galaxy', color: '#b18cff' }, 'A spiral galaxy on your floor.'],
    ['Legend Frame', 'frame', { c1: '#ffd23f', c2: '#ff3b8a', style: 'legend' }, 'A golden frame for a real legend.'],
    ['Constellation Frame', 'frame', { c1: '#7ff0ff', c2: '#ffffff', style: 'constellation' }, 'A frame made of stars and lines.'],
    ['Captain of the Stars', 'title', { text: 'Captain of the Stars' }, 'The most famous title in the galaxy. Only one voyager can have it.'],
    ['Keeper of the Galaxy', 'title', { text: 'Keeper of the Galaxy' }, 'The galaxy needs a keeper. Is it you?']
  ];
  SIGS.forEach(([name, slot, art, desc], i) => add({ id: 'sig-' + pad(i), shop: 'vault', slot, name, rarity: 'signature', art, desc, signature: true }));

  // ---------- shops and lookups ----------
  const SHOPS = [
    { key: 'ship', name: 'Shipyard', sub: 'Build your own spaceship', groups: [['hull', 'Hulls'], ['wing', 'Wings'], ['engine', 'Engines'], ['paint', 'Paint'], ['decal', 'Stickers'], ['trail', 'Trails']] },
    { key: 'wear', name: 'Wardrobe', sub: 'Dress up your creature', groups: [['hat', 'Hats'], ['cape', 'Capes'], ['aura', 'Auras'], ['buddy', 'Robot buddies']] },
    { key: 'cards', name: 'Card Gallery', sub: 'Collect the five sets', groups: Object.keys(SETS).map(k => ['set:' + k, SETS[k].name]) },
    { key: 'cabin', name: 'Cabin Studio', sub: 'Your own room in space', groups: [['wall', 'Walls'], ['floor', 'Floors'], ['window', 'Windows'], ['bed', 'Beds'], ['desk', 'Desks'], ['lamp', 'Lamps'], ['plant', 'Plants'], ['shelf', 'Shelves'], ['poster', 'Posters'], ['rug', 'Rugs'], ['gadget', 'Gadgets']] },
    { key: 'profile', name: 'Frames & Titles', sub: 'For your voyager card', groups: [['frame', 'Frames'], ['title', 'Titles']] },
    { key: 'vault', name: 'Signature Vault', sub: 'One of a kind in each class', groups: [['vault', 'Signature treasures']] }
  ];
  const byId = new Map(items.map(it => [it.id, it]));
  const RARITY = {
    starter: { name: 'Starter', color: '#8a94b8' }, common: { name: 'Common', color: '#9aa6c8' }, uncommon: { name: 'Uncommon', color: '#6fe3b4' },
    rare: { name: 'Rare', color: '#5ab4ff' }, epic: { name: 'Epic', color: '#b18cff' }, legendary: { name: 'Legendary', color: '#ffd23f' }, signature: { name: 'Signature', color: '#ff7ad9' }
  };
  // What every voyager has from the start (and wears when nothing else is chosen).
  const STARTER = {};
  items.forEach(it => { if (it.rarity === 'starter' && !STARTER[it.slot]) STARTER[it.slot] = it.id; });

  // A little English at the Bazaar: the polite sentence to buy something, and two that are not quite right.
  function buyLines(it) {
    const n = it.name, the = /^(the|a|an) /i.test(n) ? '' : 'the ';
    const right = [
      'Can I have ' + the + n + ', please?',
      'I\'d like ' + the + n + ', please.',
      'Could I buy ' + the + n + ', please?'
    ];
    const wrong = [
      'Can I has ' + the + n + ', please?',
      'I like buy ' + the + n + ', please.',
      'Give me ' + the + n + '. Now!',
      'Can you have ' + the + n + ' for me buy?',
      'I want ' + the + n + ' yesterday.',
      'Please me ' + the + n + ' can?'
    ];
    const h = [...it.id].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
    return { right: right[h % right.length], wrong: [wrong[h % wrong.length], wrong[(h >> 3) % wrong.length === h % wrong.length ? (h + 1) % wrong.length : (h >> 3) % wrong.length]] };
  }
  const SHOPKEEPER = { name: 'Zib', hello: ['Welcome to the Star Bazaar!', 'What can I get you today?', 'Look around and take your time.', 'Nice to see you again!', 'Beep boop! Try anything on.'],
    thanks: ['Here you are! Enjoy it.', 'Great choice! Here you go.', 'Thank you! Come back soon.', 'It\'s yours now. Have fun!'],
    tryAgain: ['Hmm, say it the polite way.', 'Almost! Try another sentence.', 'Beep? I don\'t understand. Try again.'] };

  root.CQShopData = { items, byId, SHOPS, SETS, RARITY, STARTER, PRICE, HAT_SHAPES, buyLines, SHOPKEEPER, reqText };
})(typeof self !== 'undefined' ? self : globalThis);
