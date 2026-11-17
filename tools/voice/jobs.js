// Collects every text the voyager's page speaks, with the key the page will ask for.
global.self = global;
const SITE = process.argv[2], fs = require('fs');
['meb5', 'harmonize1', 'harmonize2', 'discover1'].forEach(f => require(SITE + '/shared/books/' + f + '.js'));
require(SITE + '/shared/books.js'); require(SITE + '/stories.js'); require(SITE + '/shared/speak.js');
const { akey } = require(SITE + '/voicekey.js');
const B = self.CQBook, K = self.CQSpeak;
const items = new Map();
const add = (t, kind, pr) => { t = String(t).trim(); if (!t) return; const k = akey(t); if (items.has(k) && items.get(k).t !== t) throw new Error('key clash: ' + t + ' / ' + items.get(k).t); if (!items.has(k) || items.get(k).pr > pr) items.set(k, { k, t, kind: items.has(k) ? items.get(k).kind : kind, pr }); };
// Captain Speaking
K.TOPICS.forEach(tp => tp.lines.forEach(l => add(l.replace(/\*/g, ''), 'line', 1)));
K.QUESTIONS.forEach(q => add(q[0], 'line', 1));
K.TWISTERS.forEach(t => add(t, 'twister', 1));
// vocabulary: the word and its sentence (word of the day, Listen and spell, Memory match, the quiz's Listen)
B.books().forEach(b => b.units.forEach(u => u.q.forEach(q => {
  if (q[0] !== 'v' || !q[1].includes('___')) return;
  const ox = b.publisher === 'Oxford';
  if (q[2].split(' ').length <= 3) add(q[2], 'word', ox ? 2 : 3);
  add(q[1].replace('___', q[2]), 'sent', ox ? 2 : 4);
})));
const list = [...items.values()].sort((a, b) => a.pr - b.pr);
const stories = self.AVStories.map(s => ({ id: s.id, title: s.title, text: s.text }));
fs.writeFileSync(process.argv[3], JSON.stringify({ stories, items: list }));
const by = {}; list.forEach(x => { by[x.kind] = (by[x.kind] || 0) + 1; });
console.log('stories', stories.length, 'items', list.length, JSON.stringify(by), 'chars', list.reduce((a, x) => a + x.t.length, 0) + stories.reduce((a, s) => a + s.text.length, 0));
