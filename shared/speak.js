/* ASTROVOYAGERS · Your Captain Speaking (7.11)
   Speaking practice at A2 level. A voyager listens, says the sentence into the microphone and the
   browser checks it word by word. Five kinds of round:
     echo     listen and repeat
     gap      say the whole sentence with the missing word
     order    the words are mixed up: say them in the right order
     answer   answer a question with a short answer
     twister  tongue twisters, for fun
   It lives on the student portal (a voyager signs in with the voyager code); Star Base only shows who spoke. No Turkish anywhere.
   In a sentence, the word between * * is the one taken out in a "gap" round. */
(() => {
  'use strict';
  const TOPICS = [
    { key: 'routine', name: 'My day', icon: '⏰', lines: [
      'I *get* up at seven o\'clock.', 'I *brush* my teeth every morning.', 'She has *breakfast* with her family.', 'We go to school by *bus*.',
      'He does his *homework* after dinner.', 'I usually go to *bed* at ten.', 'My father *drives* to work.', 'They watch TV in the *evening*.',
      'I *always* make my bed.', 'She never *drinks* coffee.', 'We have lunch at *half* past twelve.', 'I take a *shower* before school.',
      'My mum *wakes* me up every day.', 'He sometimes *walks* to school.'] },
    { key: 'school', name: 'At school', icon: '🏫', lines: [
      'My favourite *subject* is science.', 'We have English on *Monday*.', 'Can I *borrow* your pencil, please?', 'Open your *books* at page ten.',
      'The *library* is next to the canteen.', 'Our teacher is very *kind*.', 'I am *good* at maths.', 'We play football at *break* time.',
      'May I go to the *toilet*, please?', 'I do not *understand* this question.', 'Can you *repeat* that, please?', 'There are twenty *students* in my class.',
      'We *wear* a school uniform.', 'I sit *next* to my best friend.'] },
    { key: 'food', name: 'Food and drink', icon: '🍎', lines: [
      'I would like a *glass* of water, please.', 'She likes *cheese* sandwiches.', 'We *need* some eggs and milk.', 'There is some *bread* on the table.',
      'Are there any *apples* in the fridge?', 'I do not like *spicy* food.', 'He eats fruit every *day*.', 'How *much* is this pizza?',
      'Can I have the *menu*, please?', 'My mother *cooks* delicious soup.', 'I am very *hungry* today.', 'Let us *make* a chocolate cake.',
      'We have fish for *dinner* on Fridays.', 'This orange juice is very *sweet*.'] },
    { key: 'hobby', name: 'Free time', icon: '⚽', lines: [
      'I like *playing* basketball.', 'She loves *reading* comic books.', 'We go *swimming* every weekend.', 'He can *play* the guitar.',
      'I am *interested* in space.', 'They often *ride* their bikes in the park.', 'My hobby is *drawing* animals.', 'Do you *want* to play chess?',
      'I enjoy *listening* to music.', 'She is *good* at dancing.', 'We watch a *film* on Saturday night.', 'He collects old *coins*.',
      'I *play* computer games with my cousin.', 'Let us go *camping* this summer.'] },
    { key: 'family', name: 'Family and friends', icon: '👪', lines: [
      'My sister is *older* than me.', 'I have two *brothers* and one sister.', 'My grandmother *lives* in a village.', 'He is my best *friend*.',
      'My uncle is a *doctor*.', 'She has long brown *hair*.', 'My cousin is very *funny*.', 'We *visit* our grandparents on Sundays.',
      'My father is *taller* than my mother.', 'Her eyes are *green*.', 'I *help* my parents at home.', 'My friend is *friendly* and clever.',
      'They *live* in a big house.', 'My aunt *works* in a hospital.'] },
    { key: 'weather', name: 'Weather and seasons', icon: '🌦', lines: [
      'It is *sunny* and warm today.', 'It often *rains* in spring.', 'Winter is the *coldest* season.', 'Take your *umbrella* with you.',
      'It is *snowing* outside.', 'I wear a *coat* when it is cold.', 'Summer is *hotter* than autumn.', 'The sky is *cloudy* this morning.',
      'What is the *weather* like today?', 'It is very *windy* at the beach.', 'We go skiing in *winter*.', 'The leaves *fall* in autumn.',
      'I like *hot* weather.', 'It was *foggy* yesterday.'] },
    { key: 'town', name: 'In town', icon: '🏙', lines: [
      'The bank is *opposite* the post office.', 'Go *straight* on and turn left.', 'Excuse me, where is the *station*?', 'The museum is *near* the park.',
      'There is a *cinema* in my town.', 'Turn *right* at the traffic lights.', 'The supermarket is *between* the café and the school.', 'How can I *get* to the hospital?',
      'It is *next* to the bakery.', 'We live in a *quiet* street.', 'The bus *stops* in front of the library.', 'There are many *shops* in the city centre.',
      'Cross the *road* carefully.', 'My house is not *far* from here.'] },
    { key: 'past', name: 'Yesterday', icon: '📅', lines: [
      'I *visited* my grandparents last weekend.', 'She *watched* a film yesterday.', 'We *went* to the beach last summer.', 'He *played* football after school.',
      'I *did* my homework last night.', 'They *were* at home yesterday.', 'I *had* pasta for lunch.', 'She *bought* a new dress.',
      'We *saw* a big elephant at the zoo.', 'It *was* a wonderful day.', 'I did not *go* to school yesterday.', 'Did you *have* a good weekend?',
      'He *read* an interesting book.', 'We *made* a snowman in the garden.'] },
    { key: 'future', name: 'Plans', icon: '🚀', lines: [
      'I am *going* to visit my aunt tomorrow.', 'We are going to *have* a picnic on Sunday.', 'She is going to *study* for the exam.', 'I *will* help you with your homework.',
      'It will be *sunny* tomorrow.', 'They are going to *travel* by plane.', 'What are you going to *do* this weekend?', 'I think it will *rain* tonight.',
      'He is going to *buy* a new bike.', 'We will *meet* at the cinema.', 'I want to be an *astronaut* one day.', 'I am going to *learn* to swim.',
      'She will *call* you later.', 'We are going to *watch* the stars tonight.'] },
    { key: 'can', name: 'Can and must', icon: '💪', lines: [
      'I can *swim* very well.', 'She cannot *ride* a horse.', 'Can you *speak* English?', 'You must *wear* a helmet.',
      'We must not *run* in the corridor.', 'He can *jump* very high.', 'You should *drink* more water.', 'Can I *open* the window, please?',
      'You must *listen* to your teacher.', 'Birds can *fly*, but penguins cannot.', 'I can *count* to one hundred.', 'You should not *eat* too many sweets.',
      'We have to *do* our homework.', 'Can you *help* me, please?'] },
    { key: 'feel', name: 'Feelings and health', icon: '🙂', lines: [
      'I am very *happy* today.', 'She feels *tired* after school.', 'I have a *headache*.', 'He is *afraid* of spiders.',
      'I am *excited* about the trip.', 'My tooth *hurts*.', 'You should *see* a doctor.', 'She is *worried* about the exam.',
      'I feel *better* today.', 'He has a bad *cold*.', 'Why are you *sad*?', 'I am *thirsty*. Can I have some water?',
      'We were *surprised* by the news.', 'I am *proud* of my friend.'] },
    { key: 'space', name: 'Space', icon: '🪐', lines: [
      'The Earth goes *around* the Sun.', 'The Moon is *smaller* than the Earth.', 'There are eight *planets* in our solar system.', 'Jupiter is the *biggest* planet.',
      'Astronauts *wear* special suits.', 'A rocket *flies* very fast.', 'We can see many *stars* at night.', 'Mars is called the *red* planet.',
      'The Sun is a very big *star*.', 'I want to *travel* to the Moon.', 'Saturn has beautiful *rings*.', 'There is no *air* in space.',
      'A telescope *helps* us see far away.', 'Our galaxy is *called* the Milky Way.'] },
    { key: 'animal', name: 'Animals', icon: '🐘', lines: [
      'Elephants are *bigger* than horses.', 'A cheetah can *run* very fast.', 'Dolphins *live* in the sea.', 'My cat *sleeps* on my bed.',
      'Giraffes have very long *necks*.', 'Bees *make* honey.', 'The lion is a *wild* animal.', 'I *feed* my dog every morning.',
      'Penguins cannot *fly*.', 'A snake has no *legs*.', 'Monkeys *eat* bananas.', 'Whales are the *largest* animals.',
      'We saw a *bear* in the forest.', 'Owls *hunt* at night.'] },
    { key: 'shop', name: 'Shopping and clothes', icon: '🛍', lines: [
      'How *much* are these shoes?', 'I am *looking* for a blue jacket.', 'Can I *try* this on, please?', 'This T-shirt is too *small*.',
      'I would like to *buy* this hat.', 'These jeans are *cheaper* than those.', 'She is *wearing* a red dress.', 'Do you have a *bigger* size?',
      'It costs ten *pounds*.', 'I need new *trainers* for sports.', 'Here is your *change*.', 'That scarf is very *expensive*.',
      'He wears *glasses*.', 'Put on your *gloves*. It is cold.'] }
  ];
  // short questions with the answers we accept (the first one is shown as the model)
  const QUESTIONS = [
    ['What is your name?', ['My name is', 'I am']], ['How old are you?', ['I am eleven years old', 'I am ten years old', 'I am eleven', 'I am ten', 'I am twelve years old', 'I am twelve']],
    ['Can you swim?', ['Yes, I can', 'No, I cannot']], ['Do you like pizza?', ['Yes, I do', 'No, I do not']],
    ['Are you a student?', ['Yes, I am', 'No, I am not']], ['Is it raining today?', ['No, it is not', 'Yes, it is']],
    ['Have you got a pet?', ['Yes, I have', 'No, I have not']], ['Did you watch TV yesterday?', ['Yes, I did', 'No, I did not']],
    ['How are you today?', ['I am fine, thank you', 'I am fine thanks', 'I am very well, thank you', 'I am good, thank you']],
    ['What is your favourite colour?', ['My favourite colour is blue', 'My favourite colour is red', 'My favourite colour is green', 'My favourite colour is yellow', 'My favourite colour is purple', 'My favourite colour is pink', 'My favourite colour is orange', 'My favourite colour is black', 'My favourite colour is white']],
    ['Where are you from?', ['I am from Turkey', 'I am from Manisa']], ['What day is it today?', ['It is Monday', 'It is Tuesday', 'It is Wednesday', 'It is Thursday', 'It is Friday', 'It is Saturday', 'It is Sunday']],
    ['Can you ride a bike?', ['Yes, I can', 'No, I cannot']], ['Does your friend like football?', ['Yes, he does', 'Yes, she does', 'No, he does not', 'No, she does not']],
    ['Is there a library in your school?', ['Yes, there is', 'No, there is not']], ['Are there any books in your bag?', ['Yes, there are', 'No, there are not']],
    ['Will you help me?', ['Yes, I will', 'No, I will not']], ['Were you at school yesterday?', ['Yes, I was', 'No, I was not']],
    ['What time do you get up?', ['I get up at seven o\'clock', 'I get up at six o\'clock', 'I get up at eight o\'clock', 'I get up at half past seven', 'I get up at half past six']],
    ['Do you play a musical instrument?', ['Yes, I do', 'No, I do not']], ['Is your school big?', ['Yes, it is', 'No, it is not']],
    ['Are you going to study tonight?', ['Yes, I am', 'No, I am not']], ['Thank you very much!', ['You are welcome']], ['Nice to meet you!', ['Nice to meet you too']]
  ];
  const TWISTERS = [
    'She sells sea shells by the sea shore.', 'Red lorry, yellow lorry.', 'A big black bug bit a big black bear.', 'Six sticky skeletons.',
    'Four fine fresh fish for you.', 'I scream, you scream, we all scream for ice cream.', 'Fresh fried fish.', 'Blue glue gun, green glue gun.',
    'Zebras zig and zebras zag.', 'Three free throws.', 'He threw three balls.', 'Six sleek swans swam swiftly south.',
    'Peter Piper picked a pepper.', 'A proper copper coffee pot.', 'Eleven elves licked eleven little lollipops.', 'Which witch is which?',
    'Good blood, bad blood.', 'Toy boat, toy boat, toy boat.'
  ];
  const MODES = [
    { key: 'echo', name: 'Echo', sub: 'Listen and repeat', how: 'Listen, then say the sentence.' },
    { key: 'gap', name: 'Fill the gap', sub: 'Say it with the missing word', how: 'One word is missing. Say the whole sentence.' },
    { key: 'order', name: 'Word order', sub: 'Put the words in order', how: 'The words are mixed up. Say the sentence in the right order.' },
    { key: 'answer', name: 'Quick answers', sub: 'Answer the question', how: 'Listen to the question and answer it.' },
    { key: 'twister', name: 'Tongue twisters', sub: 'Say it fast!', how: 'Say the tongue twister. Can you do it without a mistake?' }
  ];

  // ---------- checking ----------
  const SHORT = { "i'm": 'i am', "you're": 'you are', "he's": 'he is', "she's": 'she is', "it's": 'it is', "we're": 'we are', "they're": 'they are', "that's": 'that is', "there's": 'there is', "what's": 'what is', "where's": 'where is', "who's": 'who is', "let's": 'let us',
    "don't": 'do not', "doesn't": 'does not', "didn't": 'did not', "can't": 'cannot', "isn't": 'is not', "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not', "won't": 'will not', "haven't": 'have not', "hasn't": 'has not', "mustn't": 'must not', "shouldn't": 'should not', "couldn't": 'could not',
    "i'd": 'i would', "i'll": 'i will', "we'll": 'we will', "you'll": 'you will', "she'll": 'she will', "he'll": 'he will', "it'll": 'it will', "they'll": 'they will', "i've": 'i have', "we've": 'we have', "you've": 'you have', "they've": 'they have' };
  const SAME = { color: 'colour', favorite: 'favourite', mom: 'mum', theater: 'theatre', center: 'centre', traveling: 'travelling', okay: 'ok', oclock: "o'clock", their: 'there', "they're": 'there', too: 'to', two: 'to', '2': 'to', for: 'four', '4': 'four', ate: 'eight', '8': 'eight', won: 'one', '1': 'one', see: 'sea', c: 'sea', which: 'witch', threw: 'through', tshirt: 't-shirt', 'tee': 't-shirt', tv: 'tv', television: 'tv', hi: 'hi',
    '0': 'zero', '3': 'three', '5': 'five', '6': 'six', '7': 'seven', '9': 'nine', '10': 'ten', '11': 'eleven', '12': 'twelve', '20': 'twenty', '100': 'hundred', "can not": 'cannot' };
  function words(text) {
    let t = String(text || '').toLowerCase().replace(/[’‘`]/g, "'").replace(/\bo'clock\b/g, 'oclock').replace(/\bt-shirt\b/g, 'tshirt').replace(/\bcan not\b/g, 'cannot');
    t = t.split(/\s+/).map(w => SHORT[w.replace(/[^a-z0-9']/g, '')] || w).join(' ');
    return t.replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).map(w => w.replace(/^'+|'+$/g, '')).filter(Boolean).map(w => SAME[w] || w);
  }
  // how much of the target was said, in order (longest common run of words)
  function compare(target, heard) {
    const a = words(target), joins = new Map();
    for (let q = 0; q + 1 < a.length; q++) joins.set(a[q] + a[q + 1], [a[q], a[q + 1]]);
    // "seashells" was heard for "sea shells": the same thing
    const b = [].concat(...words(heard).map(w => (a.includes(w) ? [w] : joins.get(w) || [w]))), n = a.length, m = b.length;
    const T = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) T[i][j] = a[i - 1] === b[j - 1] ? T[i - 1][j - 1] + 1 : Math.max(T[i - 1][j], T[i][j - 1]);
    const hit = new Array(n).fill(false);
    let i = n, j = m;
    while (i > 0 && j > 0) { if (a[i - 1] === b[j - 1]) { hit[i - 1] = true; i--; j--; } else if (T[i - 1][j] >= T[i][j - 1]) i--; else j--; }
    const extra = Math.max(0, m - n);
    return { ratio: n ? T[n][m] / n : 0, hit, extra, n, m };
  }
  // targets: one or more sentences we accept; alts: what the microphone heard (a few guesses)
  function score(targets, alts, need) {
    need = need || 0.8;
    let best = null;
    (Array.isArray(targets) ? targets : [targets]).forEach(t => (alts || []).forEach(h => {
      const c = compare(t, h), val = c.ratio - Math.min(0.3, c.extra * 0.04);
      if (!best || val > best.val) best = { val, ratio: c.ratio, hit: c.hit, target: t, heard: h, extra: c.extra, n: c.n };
    }));
    if (!best) return { ok: false, ratio: 0, hit: [], target: Array.isArray(targets) ? targets[0] : targets, heard: '' };
    // short answers must be all there; a long sentence may miss a little
    const must = best.n <= 3 ? 1 : need;
    best.ok = best.ratio >= must && best.extra <= Math.max(2, Math.ceil(best.n * 0.6));
    best.perfect = best.ratio === 1 && best.extra === 0;
    return best;
  }

  // ---------- rounds ----------
  const rnd = n => Math.floor(Math.random() * n);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const plain = line => line.replace(/\*/g, '');
  function makeRound(topicKey, mode, n) {
    n = n || 5;
    if (mode === 'twister') return shuffle(TWISTERS).slice(0, n).map(t => ({ mode, say: t, targets: [t], show: t, need: 0.7 }));
    if (mode === 'answer') return shuffle(QUESTIONS).slice(0, n).map(q => ({ mode, say: q[0], targets: q[1], show: q[0], model: q[1].slice(0, 2).join('  /  '), need: 0.8, open: /^(My name is|I am)$/.test(q[1][0]) }));
    const topic = TOPICS.find(t => t.key === topicKey) || TOPICS[rnd(TOPICS.length)];
    let lines = shuffle(topic.lines);
    if (mode === 'order') lines = lines.filter(l => { const k = plain(l).split(' ').length; return k >= 4 && k <= 8; });
    return lines.slice(0, n).map(l => {
      const full = plain(l);
      if (mode === 'gap') { const m = /\*([^*]+)\*/.exec(l); return { mode, say: full, targets: [full], show: l.replace(/\*[^*]+\*/, '_____'), answer: m ? m[1] : '', full, need: 0.85, key: m ? m[1] : '' }; }
      if (mode === 'order') { const ws = full.replace(/[.?!,]/g, '').split(' '); let mix = shuffle(ws); if (mix.join(' ') === ws.join(' ')) mix = ws.slice().reverse(); return { mode, say: full, targets: [full], chips: mix, full, need: 0.9, strict: true }; }
      return { mode, say: full, targets: [full], show: full, need: 0.8 };
    });
  }

  // ---------- the microphone ----------
  const RecOf = () => self.SpeechRecognition || self.webkitSpeechRecognition || null;
  let rec = null, asked = false;
  const canListen = () => !!RecOf();
  // the first time, ask for the microphone the usual way, so the browser shows its question
  async function askMic() {
    if (asked || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    asked = true;
    try { const st = await navigator.mediaDevices.getUserMedia({ audio: true }); st.getTracks().forEach(t => t.stop()); } catch (e) { asked = false; }
  }
  async function listen(onState) {
    const Rec = RecOf();
    if (Rec && !self.__cqMockMic) await askMic();
    return new Promise((resolve, reject) => {
      if (!Rec) { reject(new Error('none')); return; }
      try { if (rec) rec.abort(); } catch (e) { /* ignore */ }
      let done = false, got = null;
      const r = rec = new Rec();
      r.lang = 'en-GB'; r.maxAlternatives = 5; r.interimResults = false; r.continuous = false;
      const stop = setTimeout(() => { try { r.stop(); } catch (e) { /* ignore */ } }, 9000);
      r.onstart = () => onState && onState('listening');
      r.onspeechend = () => onState && onState('checking');
      r.onresult = e => { got = []; const res = e.results[e.results.length - 1]; for (let i = 0; i < res.length; i++) got.push(res[i].transcript); };
      r.onerror = e => { if (done) return; done = true; clearTimeout(stop); if (e.error === 'no-speech' || e.error === 'aborted') resolve([]); else reject(new Error(e.error || 'error')); };
      r.onend = () => { if (done) return; done = true; clearTimeout(stop); resolve(got || []); };
      try { r.start(); } catch (e) { done = true; clearTimeout(stop); reject(e); }
    });
  }
  function stopListening() { try { if (rec) rec.abort(); } catch (e) { /* ignore */ } }
  function speakOut(text, slow) {
    if (!text || !self.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text), vs = speechSynthesis.getVoices();
      const v = vs.find(x => /^en(-|_)GB/i.test(x.lang)) || vs.find(x => /^en/i.test(x.lang));
      if (v) u.voice = v;
      u.lang = v ? v.lang : 'en-GB'; u.rate = slow ? 0.6 : 0.88;
      speechSynthesis.speak(u);
    } catch (e) { /* speech is optional */ }
  }

  // ---------- the screen ----------
  // opts: { judge: a teacher may decide (the board), onRound({ n, right, mode, topic }) → a line of text or a promise of one, title() → who is speaking }
  function mount(root, opts) {
    opts = opts || {};
    const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
    const btn = (text, cls, fn) => { const b = el('button', cls, text); b.type = 'button'; b.addEventListener('click', fn); return b; };
    let topic = TOPICS[0].key, mode = 'echo', items = [], at = 0, right = 0, tries = 0, state = 'menu', last = null, busy = false, marks = [], micState = '', micBroken = !canListen(), endText = '';
    const TRIES = 3;
    root.classList.add('sk');
    root.textContent = '';
    const menu = el('div', 'sk-menu'), stage = el('div', 'sk-stage');
    root.append(menu, stage);

    function start() { items = makeRound(topic, mode, 5); at = 0; right = 0; tries = 0; marks = []; last = null; state = 'play'; endText = ''; draw(); if (mode !== 'gap' && mode !== 'order') setTimeout(() => speakOut(items[0].say), 350); }
    function next() { stopListening(); at++; tries = 0; last = null; if (at >= items.length) finish(); else { draw(); const it = items[at]; if (mode !== 'gap' && mode !== 'order') setTimeout(() => speakOut(it.say), 250); } }
    function finish() {
      state = 'end'; draw();
      const r = opts.onRound ? opts.onRound({ n: items.length, right, mode, topic, checked: !micBroken }) : '';
      Promise.resolve(r).then(t => { endText = t || ''; draw(); }).catch(() => {});
    }
    function pass(perfect) { right++; marks[at] = perfect ? 'star' : 'ok'; }
    async function hear() {
      if (busy) return;
      busy = true; micState = 'listening'; last = null; draw();
      try {
        speechSynthesis && speechSynthesis.cancel();
        const alts = await listen(s => { micState = s; drawMic(); });
        busy = false; micState = '';
        const it = items[at];
        if (!alts.length) { last = { none: true }; draw(); return; }
        const sc = it.open ? openAnswer(it, alts) : score(it.targets, alts, it.need);
        tries++; last = sc;
        if (sc.ok) { pass(sc.perfect && tries === 1); if (opts.sound) opts.sound('good'); }
        else { if (opts.sound) opts.sound('bad'); if (tries >= TRIES) marks[at] = 'no'; }
        draw();
      } catch (e) {
        busy = false; micState = '';
        micBroken = true; last = { error: String(e.message || e) }; draw();
      }
    }
    // "What is your name?": any answer that starts the right way and has a name after it
    function openAnswer(it, alts) {
      let best = null;
      alts.forEach(h => { const w = words(h); it.targets.forEach(t => { const tw = words(t); const ok = w.length > tw.length && tw.every((x, i) => w[i] === x); if (ok && !best) best = { ok: true, perfect: true, ratio: 1, hit: tw.map(() => true), target: h, heard: h, n: tw.length, extra: 0 }; }); });
      return best || Object.assign(score(it.targets, alts, 1), { ok: false });
    }
    function drawMenu() {
      menu.textContent = '';
      const ms = el('div', 'sk-modes');
      MODES.forEach(m => { const b = btn('', 'sk-mode', () => { mode = m.key; state = 'menu'; stopListening(); draw(); }); b.setAttribute('aria-pressed', String(m.key === mode)); b.append(el('b', '', m.name), el('small', '', m.sub)); ms.appendChild(b); });
      menu.appendChild(ms);
      if (mode !== 'answer' && mode !== 'twister') {
        const ts = el('div', 'sk-topics');
        TOPICS.forEach(t => { const b = btn(t.icon + ' ' + t.name, 'sk-topic', () => { topic = t.key; state = 'menu'; stopListening(); draw(); }); b.setAttribute('aria-pressed', String(t.key === topic)); ts.appendChild(b); });
        menu.appendChild(ts);
      }
    }
    let micBtn = null, micLabel = null;
    function drawMic() {
      if (!micBtn) return;
      micBtn.dataset.state = micState || 'idle';
      micLabel.textContent = micState === 'listening' ? 'Listening… speak now!' : micState === 'checking' ? 'Checking…' : tries ? 'Tap and try again' : 'Tap and speak';
    }
    function draw() {
      drawMenu();
      root.classList.toggle('sk-playing', state === 'play');
      stage.textContent = ''; micBtn = null;
      const M = MODES.find(m => m.key === mode);
      if (state === 'menu') {
        const card = el('div', 'sk-card sk-intro');
        card.append(el('p', 'sk-kick', M.name), el('h2', 'sk-big', M.how));
        const who = opts.title ? opts.title() : '';
        if (who) card.appendChild(el('p', 'sk-who', who));
        if (opts.intro) card.appendChild(el('p', 'sk-who', opts.intro));
        card.appendChild(el('p', 'sk-note', micBroken ? (opts.judge ? 'This computer cannot hear. The teacher decides with the two buttons.' : 'This device cannot check your voice. You can still listen and repeat.') : 'Five sentences. Three tries for each one. Speak clearly and not too fast.'));
        card.appendChild(btn('Start', 'btn btn-gold sk-start', start));
        stage.appendChild(card);
        return;
      }
      if (state === 'end') {
        const card = el('div', 'sk-card sk-end');
        const stars = right >= 5 ? 3 : right >= 3 ? 2 : right >= 1 ? 1 : 0;
        card.append(el('p', 'sk-kick', 'Round finished'), el('h2', 'sk-big', right + ' of ' + items.length + (right === items.length ? ' · Perfect!' : right >= 3 ? ' · Well done!' : ' · Keep trying!')));
        card.appendChild(el('p', 'sk-stars', '★'.repeat(stars) + '☆'.repeat(3 - stars)));
        if (endText) card.appendChild(el('p', 'sk-xp', endText));
        const row = el('div', 'sk-row'); row.append(btn('Play again', 'btn btn-gold', start), btn('Choose another', 'btn btn-ghost', () => { state = 'menu'; draw(); }));
        card.appendChild(row); stage.appendChild(card);
        return;
      }
      const it = items[at], done = marks[at] === 'ok' || marks[at] === 'star' || marks[at] === 'no';
      const card = el('div', 'sk-card');
      const dots = el('div', 'sk-dots'); items.forEach((x, i) => dots.appendChild(el('i', 'sk-dot ' + (marks[i] || (i === at ? 'now' : '')))));
      card.append(dots, el('p', 'sk-kick', M.name + ' · ' + (at + 1) + ' of ' + items.length));
      card.appendChild(btn('✕ Stop', 'sk-stop', () => { stopListening(); state = 'menu'; draw(); }));
      // the prompt
      if (it.chips) { const cw = el('div', 'sk-chips'); it.chips.forEach(w => cw.appendChild(el('span', 'sk-chip', w))); card.appendChild(cw); if (done) card.appendChild(el('h2', 'sk-big sk-solve', it.full)); }
      else if (mode === 'gap') card.appendChild(el('h2', 'sk-big', done ? it.full : it.show));
      else card.appendChild(el('h2', 'sk-big', it.show));
      if (mode === 'answer') card.appendChild(el('p', 'sk-model', done || tries >= 1 ? 'You can say: ' + it.model : 'Answer with a short sentence.'));
      const tools = el('div', 'sk-row');
      if (mode !== 'gap' && mode !== 'order' || done || tries >= 2) { tools.appendChild(btn('🔊 Listen', 'btn btn-ghost', () => speakOut(it.say))); tools.appendChild(btn('🐢 Slowly', 'btn btn-ghost', () => speakOut(it.say, true))); }
      else if (mode === 'gap' && tries >= 1 && it.key) tools.appendChild(el('span', 'sk-hint', 'The word starts with "' + it.key[0] + '" and has ' + it.key.length + ' letters.'));
      card.appendChild(tools);
      // what was heard
      if (last && last.none) card.appendChild(el('p', 'sk-heard bad', 'I could not hear you. Come closer and try again.'));
      else if (last && last.error) card.appendChild(el('p', 'sk-heard bad', last.error === 'not-allowed' || last.error === 'service-not-allowed' ? 'The microphone is not allowed. Allow it in the browser, then try again.' : last.error === 'network' ? 'The voice check needs the internet. It is not working now.' : 'The microphone is not working on this device.'));
      else if (last) {
        const fb = el('div', 'sk-fb ' + (last.ok ? 'ok' : 'bad'));
        const line = el('p', 'sk-words');
        if (!it.open) words(last.target).forEach((w, i) => line.appendChild(el('span', last.hit[i] ? 'hit' : 'miss', w)));
        fb.append(el('b', '', last.ok ? (last.perfect ? 'Perfect!' : 'Good!') : tries >= TRIES ? 'Not this time. Listen once more.' : 'Almost! Try again.'), line, el('p', 'sk-said', 'I heard: "' + last.heard + '"'));
        card.appendChild(fb);
      }
      // the microphone, or the buttons
      if (!done) {
        if (!micBroken) {
          micBtn = btn('', 'sk-mic', hear); micBtn.setAttribute('aria-label', 'Speak');
          micBtn.append(el('span', 'sk-mic-ic', '🎤'), el('i', ''), el('i', ''), el('i', ''));
          micLabel = el('p', 'sk-mic-l', '');
          card.append(micBtn, micLabel); drawMic();
          card.appendChild(el('p', 'sk-tries', 'Tries left: ' + (TRIES - tries)));
        }
        if (micBroken && canListen()) card.appendChild(btn('🎤 Try the microphone again', 'btn btn-ghost', () => { micBroken = false; last = null; draw(); }));
        if (micBroken && opts.judge) { const row = el('div', 'sk-row'); row.append(btn('✓ Well said', 'btn btn-gold', () => { pass(false); draw(); }), btn('✗ Not yet', 'btn btn-ghost', () => { tries++; if (tries >= TRIES) marks[at] = 'no'; last = null; draw(); })); card.appendChild(row); }
        else if (micBroken) card.appendChild(btn('I said it →', 'btn btn-gold', () => { marks[at] = 'no'; next(); }));
        else if (opts.judge) { const row = el('div', 'sk-row sk-judge'); row.append(btn('Teacher: ✓ count it', 'btn btn-ghost', () => { pass(false); draw(); }), btn('Skip', 'btn btn-ghost', () => { marks[at] = 'no'; next(); })); card.appendChild(row); }
      } else card.appendChild(btn(at + 1 >= items.length ? 'Finish' : 'Next →', 'btn btn-gold sk-next', next));
      stage.appendChild(card);
    }
    draw();
    return { reset() { stopListening(); state = 'menu'; draw(); }, redraw: draw, stop: stopListening };
  }

  self.CQSpeak = { TOPICS, MODES, QUESTIONS, TWISTERS, makeRound, score, compare, words, canListen, listen, speakOut, mount };
})();
