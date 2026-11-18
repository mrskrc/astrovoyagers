// Writes audio/index.js: the list of the recordings that exist.   node tools/voice/manifest.js
const fs = require('fs'), path = require('path');
const A = path.join(__dirname, '..', '..', 'audio');
const ls = d => (fs.existsSync(path.join(A, d)) ? fs.readdirSync(path.join(A, d)).filter(f => /^[\w-]+\.mp3$/.test(f)).map(f => f.slice(0, -4)).sort() : []);
// node tools/voice/manifest.js "<voice name>"  ·  v changes on every run, so browsers fetch the new files
const s = ls('s'), story = ls('story');
const voice = process.argv[2] || 'OmniVoice · AstroVoyagers B404';
const v = new Date().toISOString().slice(0, 16).replace(/\D/g, '');
fs.writeFileSync(path.join(A, 'index.js'), '/* made by tools/voice/manifest.js */\nself.AVAudio = ' + JSON.stringify({ voice, v, story, s: s.join(' ') }) + ';\n');
console.log(story.length + ' stories, ' + s.length + ' other recordings');
