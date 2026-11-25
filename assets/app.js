/* Старо Скопје — small progressive enhancements. Everything works without JS (links open the full images). */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------------------------------------------------------------- lightbox for every a.zoom on the page
  const lb = $('dialog.lightbox');
  const allZooms = $$('a.zoom'), zooms = [];
  for (const a of allZooms) if (!zooms.some(z => z.href === a.href)) zooms.push(a);   // postcard + album = one photo
  if (lb && zooms.length) {
    const img = $('img', lb), cap = $('figcaption', lb), count = $('.lb-count', lb);
    let i = 0;
    const show = k => {
      i = (k + zooms.length) % zooms.length;
      const a = zooms[i], fig = a.closest('figure, article');
      img.src = a.href; img.alt = $('img', a)?.alt || '';
      const fc = fig && (fig.querySelector('figcaption') || fig.querySelector('h3'));
      cap.innerHTML = fc ? fc.innerHTML : '';
      count.textContent = zooms.length > 1 ? `${i + 1} / ${zooms.length}` : '';
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

  // only one audio/video playing at a time
  document.addEventListener('play', e => $$('audio, video').forEach(m => { if (m !== e.target) m.pause(); }), true);
})();
