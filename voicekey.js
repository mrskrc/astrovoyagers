/* ASTROVOYAGERS · the name of a recording (source in sinif-paneli; the site's build.sh copies it)
   A text → a short key (10 hex letters). The recordings in audio/s/ are named with it, so the page
   and the script that makes the recordings must use the same function. */
(function (root) {
  'use strict';
  function akey(text) {
    const b = new TextEncoder().encode(String(text).trim());
    let h1 = 0x811c9dc5, h2 = 0x9747b28c;
    for (let i = 0; i < b.length; i++) {
      h1 = Math.imul(h1 ^ b[i], 0x01000193);
      h2 = Math.imul(h2 ^ b[i], 0x5bd1e995); h2 = (h2 << 13) | (h2 >>> 19);
    }
    return (h1 >>> 0).toString(16).padStart(8, '0') + ((h2 >>> 0) & 0xff).toString(16).padStart(2, '0');
  }
  root.AVKey = akey;
  if (typeof module !== 'undefined' && module.exports) module.exports = { akey };
})(typeof self !== 'undefined' ? self : globalThis);
