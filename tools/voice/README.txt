ASTROVOYAGERS · the recorded voice

The listening parts of the voyager's page play MP3 recordings from audio/. They are made here, on a
computer, with Kokoro, an open-source voice model (Apache-2.0): https://github.com/thewh1teagle/kokoro-onnx
Voice: bf_emma (British English).

To make the recordings again (after new stories or new book questions):

  pip install kokoro-onnx soundfile          (ffmpeg is needed too)
  download kokoro-v1.0.onnx and voices-v1.0.bin from the model-files-v1.0 release of that project
  node tools/voice/jobs.js "$PWD" jobs.json                 every text the page speaks
  python3 tools/voice/gen.py MODEL_FOLDER jobs.json audio   only the missing files are made
  node tools/voice/manifest.js                              the list the page reads (audio/index.js)

A text without a recording is spoken by the device's own voice, as before.
A story's recording is named by its id (audio/story/ID.mp3): when a story's text changes, delete its file first.
