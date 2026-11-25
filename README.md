# Старо Скопје

Web edition of the 2001 multimedia CD-ROM *Старо Скопје*: the city through old postcards, films, a narrated
chronology and an old orientation map. The site is in Macedonian, using the CD's own content and wording.

**Site:** open `index.html`, or the GitHub Pages address once Pages is enabled.

## Sections

- **Разгледници**: 21 topics with 697 old postcards and photos; each topic has Дескрипција, Ориентација,
  Фото албум, Филм and Тема
- **Стара ориентациона карта**: the CD's illustrated city map with 38 landmarks
- **Филмски материјал**: 35 documentary films (1916–1977) with their credits
- **Хронологија** and **Аудио табела**: the chronology text and the 112-period narrated table
- **Историјат**: 10 narrated stories and pictures by year (1835–1990), plus **Детали од црквата Св Богородица**
- **Археологија**: 45 archaeological items
- **За проектот**: credits, music and rights

## Credits and rights

Ова CD е изработено од **Веселин Стефановски**; сите авторски права му припаѓаат на Веселин Стефановски.
Обновено од **Бојан Божиновски**.

The photographs, texts and films belong to their authors. The film credits are listed on the За проектот page.

## How it was made

This is plain static HTML, CSS and a little JavaScript, with WebP images, MP4 films and MP3 audio, and no build step
needed to serve it. It was generated from the decoded CD by `tools/build_modern.py` in the restoration project
(not part of this repository).
