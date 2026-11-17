"""Makes the recordings of the voyager's page with Kokoro (open source, Apache-2.0).
   python3 gen.py MODEL_DIR jobs.json OUT_DIR [stories|items|items-rev|all]
   Files that exist are left alone, so the script can be stopped and started again."""
import sys, os, re, json, time, subprocess
import numpy as np
from kokoro_onnx import Kokoro

MODEL, JOBS, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
WHAT = sys.argv[4] if len(sys.argv) > 4 else 'all'
VOICE, LANG, SR = 'bf_emma', 'en-gb', 24000
k = Kokoro(MODEL + '/kokoro-v1.0.onnx', MODEL + '/voices-v1.0.bin')
ph = k.tokenizer.phonemize

# words the phonemizer cannot say: their sounds are written by hand
SPECIAL = {'Göbeklitepe': 'ɡəbˈɛklitˌɛpɛ', 'Şanlıurfa': 'ʃˌanlɪˈʊɹfɑː', 'Türkiye': 'tˈɜːkijˌeɪ'}
YEARS = {'1969': 'nineteen sixty-nine', '1896': 'eighteen ninety-six'}

def phonemes(text):
    for a, b in YEARS.items(): text = text.replace(a, b)
    parts = re.split('(' + '|'.join(map(re.escape, SPECIAL)) + ')', text)
    if len(parts) == 1: return None
    out = []
    for p in parts:
        if p in SPECIAL: out.append(SPECIAL[p])
        elif p.strip(): out.append(ph(p.strip(), LANG))
    s = ' '.join(out)
    return re.sub(r'\s+([.,!?:;])', r'\1', s)

def synth(text, speed):
    p = phonemes(text)
    if p is not None: a, sr = k.create(p, voice=VOICE, speed=speed, lang=LANG, is_phonemes=True)
    else:
        for x, y in YEARS.items(): text = text.replace(x, y)
        a, sr = k.create(text, voice=VOICE, speed=speed, lang=LANG)
    assert sr == SR
    a = np.asarray(a, dtype=np.float32).flatten()
    peak = float(np.abs(a).max()) if len(a) else 0
    if peak > 0: a = a * (0.9 / peak)
    return a

def silence(sec): return np.zeros(int(SR * sec), dtype=np.float32)

def save(path, a, rate='48k'):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    a = np.concatenate([silence(0.08), a, silence(0.15)])
    tmp = path + '.%d.part.mp3' % os.getpid()
    r = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-codec:a', 'libmp3lame', '-b:a', rate, '-ar', str(SR), tmp], input=a.tobytes())
    if r.returncode: raise RuntimeError('ffmpeg failed for ' + path)
    os.replace(tmp, path)
    return len(a) / SR

def sentences(text):
    return [s.strip() for s in re.findall(r'[^.!?]+[.!?]+(?:\s|$)', text) if s.strip()]

jobs = json.load(open(JOBS, encoding='utf-8'))
t0 = time.time(); made = 0; secs = 0.0
def note(msg): print(time.strftime('%H:%M:%S'), msg, flush=True)

if WHAT in ('stories', 'all'):
    for s in jobs['stories']:
        path = f"{OUT}/story/{s['id']}.mp3"
        if os.path.exists(path): continue
        parts = [synth(s['title'] + '.', 0.9), silence(0.8)]
        for sen in sentences(s['text']):
            parts += [synth(sen, 0.92), silence(0.42)]
        secs += save(path, np.concatenate(parts[:-1])); made += 1
        note(f"story {s['id']} · {made} made · {round(secs)} s of sound · {round(time.time() - t0)} s")

if WHAT in ('items', 'items-rev', 'all'):
    SPEED = {'word': 0.85, 'sent': 0.92, 'line': 0.92, 'twister': 0.88}
    todo = [x for x in jobs['items'] if not os.path.exists(f"{OUT}/s/{x['k']}.mp3")]
    if WHAT == 'items-rev': todo.reverse()   # a second copy of the script can work from the other end
    note(f"{len(todo)} items to make")
    for n, x in enumerate(todo, 1):
        if os.path.exists(f"{OUT}/s/{x['k']}.mp3"): continue
        text = x['t'] if x['kind'] != 'word' or re.search(r'[.!?]$', x['t']) else x['t'] + '.'
        secs += save(f"{OUT}/s/{x['k']}.mp3", synth(text, SPEED[x['kind']]), '40k'); made += 1
        if n % 25 == 0: note(f"items {n}/{len(todo)} · {round(secs)} s of sound · {round(time.time() - t0)} s")
note(f"done: {made} files, {round(secs)} s of sound in {round(time.time() - t0)} s")
