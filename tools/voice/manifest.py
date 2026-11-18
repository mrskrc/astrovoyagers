# Same as manifest.js, for a computer without Node:   python tools/voice/manifest.py ["<voice name>"]
# Writes audio/index.js: the list of the recordings that exist. v changes on every run, so browsers fetch the new files.
import os, re, sys, json, datetime
A = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'audio')
def ls(d):
    p = os.path.join(A, d)
    return sorted(f[:-4] for f in os.listdir(p) if re.fullmatch(r'[\w-]+\.mp3', f, re.A)) if os.path.isdir(p) else []
s, story = ls('s'), ls('story')
voice = sys.argv[1] if len(sys.argv) > 1 else 'OmniVoice · AstroVoyagers B404'
v = re.sub(r'\D', '', datetime.datetime.now(datetime.timezone.utc).isoformat()[:16])
data = json.dumps({'voice': voice, 'v': v, 'story': story, 's': ' '.join(s)}, ensure_ascii=False, separators=(',', ':'))
with open(os.path.join(A, 'index.js'), 'w', encoding='utf-8', newline='\n') as f:
    f.write('/* made by tools/voice/manifest.js */\nself.AVAudio = ' + data + ';\n')
print(len(story), 'stories,', len(s), 'other recordings')
