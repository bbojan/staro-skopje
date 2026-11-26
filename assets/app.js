/* Старо Скопје — small progressive enhancements. Everything works without JS (links open the full images). */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // the few strings the script writes itself (the pages are translated at build time by tools/i18n_en.py)
  const STR = {   // music on, music off, show map, hide map
    mk: ['Музика во позадина: вклучена', 'Музика во позадина: исклучена', 'Прикажи ја ориентационата мапа', 'Скриј ја ориентационата мапа'],
    en: ['Background music: on', 'Background music: off', 'Show the orientation map', 'Hide the orientation map'],
    sq: ['Muzika në sfond: e ndezur', 'Muzika në sfond: e fikur', 'Shfaq hartën orientuese', 'Fshih hartën orientuese'],
    tr: ['Arka plan müziği: açık', 'Arka plan müziği: kapalı', 'Yönlendirme haritasını göster', 'Yönlendirme haritasını gizle'],
    sr: ['Музика у позадини: укључена', 'Музика у позадини: искључена', 'Прикажи оријентациону мапу', 'Сакриј оријентациону мапу'],
    hr: ['Glazba u pozadini: uključena', 'Glazba u pozadini: isključena', 'Prikaži orijentacijsku kartu', 'Sakrij orijentacijsku kartu'],
    de: ['Hintergrundmusik: an', 'Hintergrundmusik: aus', 'Orientierungskarte anzeigen', 'Orientierungskarte ausblenden'],
    el: ['Μουσική υπόκρουση: ενεργή', 'Μουσική υπόκρουση: ανενεργή', 'Εμφάνιση χάρτη προσανατολισμού', 'Απόκρυψη χάρτη προσανατολισμού'],
    bg: ['Фонова музика: включена', 'Фонова музика: изключена', 'Покажи ориентировъчната карта', 'Скрий ориентировъчната карта'],
    sl: ['Glasba v ozadju: vklopljena', 'Glasba v ozadju: izklopljena', 'Pokaži orientacijski zemljevid', 'Skrij orientacijski zemljevid'],
    fr: ['Musique de fond : activée', 'Musique de fond : désactivée', "Afficher la carte d'orientation", "Masquer la carte d'orientation"],
    es: ['Música de fondo: activada', 'Música de fondo: desactivada', 'Mostrar el mapa de orientación', 'Ocultar el mapa de orientación'],
    ru: ['Фоновая музыка: включена', 'Фоновая музыка: выключена', 'Показать ориентировочную карту', 'Скрыть ориентировочную карту'],
  };
  const LANG = STR[document.documentElement.lang] || STR.mk;
  const T = { musicOn: LANG[0], musicOff: LANG[1], mapShow: LANG[2], mapHide: LANG[3] };
  // close the language menu when clicking elsewhere
  document.addEventListener('click', e => { const m = $('details.langs[open]'); if (m && !m.contains(e.target)) m.open = false; });

  // ---------------------------------------------------------------- topic orientation map
  // one CD marker per photo; ‹ › step through them, a postcard's link selects its own, and the lightbox
  // shows the same map in its corner with the marker of the photo on screen
  const loc = document.getElementById('loc');
  let markPhoto = () => false;        // markPhoto(n): show photo n's marker (postcard number); true if it has one
  if (loc) {
    const marks = [...loc.querySelectorAll('.mk')], n = loc.querySelector('.loc-n');
    const total = n ? n.textContent.split('/')[1].trim() : '';
    let cur = 0;
    const show = k => {
      cur = (k + marks.length) % marks.length;
      marks.forEach((m, j) => { m.hidden = j !== cur; });
      if (n) { const i = marks[cur].dataset.i; n.textContent = `${i} / ${total}`; n.href = `#r${i}`; }
    };
    markPhoto = i => { const j = marks.findIndex(m => m.dataset.i === String(i)); if (j >= 0) show(j); return j >= 0; };
    const prev = loc.querySelector('.loc-prev'), next = loc.querySelector('.loc-next');
    prev && prev.addEventListener('click', () => show(cur - 1));
    next && next.addEventListener('click', () => show(cur + 1));
    $$('.pc-loc').forEach(a => a.addEventListener('click', () => markPhoto(a.dataset.mk)));
  }

  // ---------------------------------------------------------------- lightbox for every a.zoom on the page
  const lb = $('dialog.lightbox');
  const allZooms = $$('a.zoom'), zooms = [];
  for (const a of allZooms) if (!zooms.some(z => z.href === a.href)) zooms.push(a);   // postcard + album = one photo
  if (lb && zooms.length) {
    const img = $('img', lb), cap = $('figcaption', lb), count = $('.lb-count', lb);
    // topic pages: a copy of the orientation map, kept in step with the photo on screen
    const lbMap = loc ? loc.querySelector('.locator-map').cloneNode(true) : null;
    if (lbMap) {
      lbMap.className = 'lb-map';
      lbMap.querySelector(':scope > img').loading = 'eager';
      lb.append(lbMap);
    }
    // the corner map can be hidden: a map button next to ✕, or a tap on the map; remembered across pages
    const mapBtn = lbMap ? document.createElement('button') : null;
    let mapOn = true;
    try { mapOn = localStorage.getItem('lbmap') !== 'off'; } catch (e) { }
    const setMap = on => {
      mapOn = on;
      try { localStorage.setItem('lbmap', on ? 'on' : 'off'); } catch (e) { }
      lb.classList.toggle('map-off', !on);
      mapBtn.setAttribute('aria-pressed', String(on));
      mapBtn.title = mapBtn.ariaLabel = on ? T.mapHide : T.mapShow;
    };
    if (mapBtn) {
      mapBtn.type = 'button'; mapBtn.className = 'lb-maptoggle';
      mapBtn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" '
        + 'stroke-width="2" stroke-linejoin="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg>';
      lb.append(mapBtn);
      mapBtn.addEventListener('click', () => setMap(!mapOn));
      lbMap.addEventListener('click', () => setMap(false));
      setMap(mapOn);
    }
    const photoNo = a => {                                  // postcard number of a zoom link (postcard or album thumb)
      const f = a.closest('figure.postcard');
      if (f) return +f.id.slice(1);
      return +(a.title || '').split('/')[0].trim() || 0;
    };
    let i = 0;
    const show = k => {
      i = (k + zooms.length) % zooms.length;
      const a = zooms[i], fig = a.closest('figure, article');
      img.src = a.href; img.alt = $('img', a)?.alt || '';
      const fc = fig && (fig.querySelector('figcaption') || fig.querySelector('h3'));
      cap.innerHTML = fc ? fc.innerHTML : '';
      $$('.pc-loc', cap).forEach(x => x.replaceWith(''));   // the corner map already shows it
      count.textContent = zooms.length > 1 ? `${i + 1} / ${zooms.length}` : '';
      if (lbMap) {
        const no = photoNo(a);
        const mks = [...lbMap.querySelectorAll('.mk')], on = mks.find(m => m.dataset.i === String(no));
        mks.forEach(m => { m.hidden = m !== on; });
        lbMap.hidden = !on;
        mapBtn.hidden = !on;                               // nothing to toggle for a photo without a marker
        if (on) markPhoto(no);                             // the page's own map follows too
      }
      // preload neighbours
      [i - 1, i + 1].forEach(n => { const z = zooms[(n + zooms.length) % zooms.length]; if (z) new Image().src = z.href; });
    };
    allZooms.forEach(a => a.addEventListener('click', e => { e.preventDefault(); show(zooms.findIndex(z => z.href === a.href)); lb.showModal(); }));
    $('.lb-prev', lb).onclick = () => show(i - 1);
    $('.lb-next', lb).onclick = () => show(i + 1);
    lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1); });
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    let x0 = null;
    lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1));
    });
    lb.addEventListener('close', () => { img.removeAttribute('src'); });
  }

  // ---------------------------------------------------------------- film player dialog
  const pl = $('dialog.player');
  if (pl) {
    const v = $('video', pl), t = $('.player-title', pl), cr = $('.player-credits', pl);
    $$('.film-play').forEach(b => b.addEventListener('click', () => {
      v.src = b.dataset.src; v.poster = b.dataset.poster; t.textContent = b.dataset.title;
      const body = b.closest('.film')?.querySelector('.film-body');
      if (cr) cr.innerHTML = body ? [...body.children].filter(e => e.tagName !== 'H3').map(e => e.outerHTML).join('') : '';
      pl.showModal(); v.play().catch(() => { });
    }));
    pl.addEventListener('close', () => { v.pause(); v.removeAttribute('src'); v.load(); });
    pl.addEventListener('click', e => { if (e.target === pl) pl.close(); });
  } else {
    // topic pages: play films inline in place of the poster
    $$('.film-play').forEach(b => b.addEventListener('click', () => {
      const v = document.createElement('video');
      Object.assign(v, { src: b.dataset.src, poster: b.dataset.poster, controls: true, playsInline: true, autoplay: true });
      v.setAttribute('aria-label', b.dataset.title);
      b.replaceWith(v); v.play().catch(() => { });
    }));
  }

  // ---------------------------------------------------------------- city map: hotspot <-> landmark card
  const spots = $$('.spot');
  if (spots.length) {
    const select = (id, scroll) => {
      spots.forEach(s => s.classList.toggle('on', s.dataset.target === id));
      $$('.lm').forEach(c => c.classList.toggle('on', c.id === id));
      const card = document.getElementById(id);
      if (card && scroll) card.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
      history.replaceState(null, '', '#' + id);
    };
    spots.forEach(s => s.addEventListener('click', () => select(s.dataset.target, true)));
    $$('.lm').forEach(c => {
      c.addEventListener('mouseenter', () => spots.forEach(s => s.classList.toggle('on', s.dataset.target === c.id)));
      c.addEventListener('mouseleave', () => spots.forEach(s => s.classList.remove('on')));
    });
    if (location.hash.length > 1) select(location.hash.slice(1), true);
  }

  // ---------------------------------------------------------------- audio table
  const cells = $$('.at-cell');
  if (cells.length) {
    const hint = $('.at-hint');
    const open = (k, play) => {
      cells.forEach((c, j) => c.setAttribute('aria-pressed', String(j === k)));
      $$('.at-text').forEach(p => {
        const on = +p.dataset.i === k; p.hidden = !on;
        const a = $('audio', p); if (a && !on) a.pause();
        if (on && a && play) a.play().catch(() => { });
      });
      if (hint) hint.hidden = true;
      history.replaceState(null, '', '#g' + k);
      if (matchMedia('(max-width: 860px)').matches) $('#at-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    cells.forEach((c, k) => c.addEventListener('click', () => open(k, true)));
    const m = location.hash.match(/^#g(\d+)$/);
    if (m) open(+m[1], false);
  }

  // topic section tabs: highlight the section in view
  const tabs = $$('.tabs a');
  if (tabs.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) tabs.forEach(t => t.classList.toggle('on', t.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-40% 0px -55% 0px' });
    $$('.tsec').forEach(s => io.observe(s));
  }

  // ---------------------------------------------------------------- background music (the CD's looping instrumental)
  // On by default like the CD; the choice is remembered. Browsers only allow sound after a user gesture, so it
  // starts on the first click/tap/key. It pauses while any narration or film plays and resumes after.
  const bgm = $('#bgm'), toggle = $('.sound-toggle');
  const others = () => $$('audio, video').filter(m => m !== bgm);
  const busy = () => others().some(m => !m.paused && !m.ended);
  let wanted = localStorage.getItem('bgm') !== 'off';
  const setUi = () => {
    if (!toggle) return;
    toggle.setAttribute('aria-pressed', String(wanted));
    toggle.title = wanted ? T.musicOn : T.musicOff;
    toggle.classList.toggle('off', !wanted);
    // pulse while the music is wanted but the browser hasn't let it start yet (it needs a click/tap first)
    toggle.classList.toggle('hint', wanted && !!bgm && bgm.paused && !busy());
  };
  if (bgm) ['play', 'pause', 'playing'].forEach(ev => bgm.addEventListener(ev, setUi));
  const startBgm = () => {
    if (!bgm || !wanted || busy() || !bgm.paused) return;
    const t = +sessionStorage.getItem('bgmT') || 0;
    if (t && !bgm.currentTime) { try { bgm.currentTime = t; } catch (e) { } }
    bgm.volume = 0.45;
    bgm.play().catch(() => { });
  };
  if (bgm) {
    setUi();
    // Try on every kind of gesture until the browser allows sound. Browsers only grant it for clicks, key presses and
    // touches (the end of a touch, including a swipe/scroll on phones counts in most browsers); a mouse-wheel or
    // trackpad scroll never does, so on desktop the first click or key press starts it.
    const GESTURES = ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'click', 'keydown', 'wheel', 'scroll'];
    const firstGesture = () => {
      startBgm();
      setTimeout(() => {
        if (!bgm.paused || !wanted) GESTURES.forEach(g => removeEventListener(g, firstGesture, true));
      }, 250);
    };
    GESTURES.forEach(g => addEventListener(g, firstGesture, { capture: true, passive: true }));
    // try right away too: works when the browser already allows sound for this site (e.g. after earlier clicks)
    if (sessionStorage.getItem('bgmT')) startBgm();
    const save = () => { if (!bgm.paused || bgm.currentTime) sessionStorage.setItem('bgmT', String(bgm.currentTime)); };
    addEventListener('pagehide', save);
    setInterval(save, 2000);
    toggle && toggle.addEventListener('click', e => {
      e.stopPropagation();
      wanted = !wanted; localStorage.setItem('bgm', wanted ? 'on' : 'off'); setUi();
      if (wanted) startBgm(); else bgm.pause();
    });
  }

  // only one narration/film at a time; the background music steps aside while one plays
  document.addEventListener('play', e => {
    if (e.target === bgm) { if (busy()) bgm.pause(); return; }
    others().forEach(m => { if (m !== e.target) m.pause(); });
    if (bgm) bgm.pause();
  }, true);
  const resume = () => setTimeout(() => { if (!busy()) startBgm(); }, 300);
  document.addEventListener('pause', e => { if (e.target !== bgm) resume(); }, true);
  document.addEventListener('ended', e => { if (e.target !== bgm) resume(); }, true);
  document.addEventListener('close', e => { if (e.target.matches && e.target.matches('dialog.player')) resume(); }, true);
})();
