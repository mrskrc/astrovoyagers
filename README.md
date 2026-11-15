# ASTROVOYAGERS · student portal

The home page of the ASTROVOYAGERS classroom extension (Özel Manisa Ülkem Koleji, Mr. Şekerci).

- `index.html`: a voyager opens their own page with the code on their card: level, Star Coins,
  homework, practice at home and the Star Bazaar.
- `t.html`: teachers unlock a classroom board with their phone (the QR code on the board's lock).

There is no student data in this repository. The class boards keep each voyager's record in the
teacher's own Google Apps Script, encrypted with a key made from that voyager's code; this site only
opens it in the browser. The address of the script travels in the link's `#` part, which browsers
never send to GitHub.

`shared/`, `fonts/` and `icons/` are copied from the extension with `build.sh`.
Fonts: Exo 2, Figtree and Orbitron (SIL Open Font License). QR codes: none on this site.
