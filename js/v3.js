// ============================================================
// Dra. Clara Valdez — Versión 3 · interacciones
// ============================================================

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Preloader
window.addEventListener('load', () => setTimeout(() => document.body.classList.add('is-loaded'), 450));
setTimeout(() => document.body.classList.add('is-loaded'), 2600);

// Header: fondo al hacer scroll + color según capítulo
const header = $('#header');
const darkSections = $$('.hero, .chapter--dark');
const dots = $('#dots');
const onScroll = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 24);
  const y = window.scrollY + 40;
  const onDark = darkSections.some((s) => y >= s.offsetTop && y < s.offsetTop + s.offsetHeight);
  header.classList.toggle('is-on-dark', onDark);
  const mid = window.scrollY + window.innerHeight / 2;
  const onDarkMid = darkSections.some((s) => mid >= s.offsetTop && mid < s.offsetTop + s.offsetHeight);
  if (dots) dots.classList.toggle('on-dark', onDarkMid);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Progreso de lectura
const progress = $('#progress');
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
};
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// Aparición
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
$$('.reveal, .section__title').forEach((el) => observer.observe(el));

// Menú móvil
const nav = $('#nav'), navToggle = $('#nav-toggle');
const setNav = (open) => {
  nav.classList.toggle('is-open', open);
  document.body.classList.toggle('nav-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
};
navToggle.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
$$('.nav__link').forEach((l) => l.addEventListener('click', () => setNav(false)));

// Capítulo activo (menú + puntos)
const sectionIds = ['inicio', 'primera-cita', 'diseno', 'servicios', 'test', 'cambio', 'historia', 'clinica', 'agenda'];
const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    $$('.nav__link').forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + id));
    $$('[data-dot]').forEach((d) => d.classList.toggle('is-active', d.dataset.dot === id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sectionIds.map((id) => document.getElementById(id)).filter(Boolean).forEach((s) => spy.observe(s));

// Barra móvil: aparece después del hero
const mbar = $('#mbar');
const hero = $('#inicio');
new IntersectionObserver((entries) => {
  mbar.classList.toggle('is-on', !entries[0].isIntersecting);
}, { threshold: 0.15 }).observe(hero);

// Título hero: palabras una a una
$$('[data-split]').forEach((el) => {
  let i = 0;
  const wrap = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const w = document.createElement('span'); w.className = 'w';
        const inner = document.createElement('span'); inner.textContent = part; inner.style.setProperty('--i', i++);
        w.appendChild(inner); frag.appendChild(w);
      });
      node.replaceWith(frag);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
      [...node.childNodes].forEach(wrap);
    }
  };
  [...el.childNodes].forEach(wrap);
});

// Frases del hero, una a una
const lines = $$('#hero-lines p');
if (lines.length && !reduced) {
  let k = 0;
  const show = () => { lines.forEach((p, i) => p.classList.toggle('is-on', i === k)); k = (k + 1) % lines.length; };
  setTimeout(() => { show(); setInterval(show, 2600); }, 900);
} else if (lines.length) { lines[0].classList.add('is-on'); }

// Botones magnéticos
if (!reduced && matchMedia('(hover: hover)').matches) {
  $$('.magnetic').forEach((b) => {
    b.addEventListener('mousemove', (e) => {
      const r = b.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18, y = (e.clientY - r.top - r.height / 2) * 0.28;
      b.style.transform = `translate(${x}px, ${y}px)`;
    });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  });
}

// ---------- Capítulo 1: el video avanza con el scroll ----------
const storyVideo = $('#story-video'), storyBar = $('#story-bar');
const steps = $$('.story__step');
if (storyVideo && steps.length) {
  let current = null;
  const playSegment = (step) => {
    const start = +step.dataset.start, end = +step.dataset.end;
    const run = () => {
      storyVideo.currentTime = start;
      storyVideo.play().catch(() => {});
    };
    if (storyVideo.readyState >= 1) run(); else storyVideo.addEventListener('loadedmetadata', run, { once: true });
    storyVideo.ontimeupdate = () => {
      if (storyVideo.currentTime >= end) storyVideo.currentTime = start;
      storyBar.style.width = `${(storyVideo.currentTime / (storyVideo.duration || 42)) * 100}%`;
    };
  };
  const stepObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      if (current === e.target) return;
      current = e.target;
      steps.forEach((s) => s.classList.toggle('is-active', s === current));
      playSegment(current);
    });
  }, { rootMargin: '-40% 0px -45% 0px' });
  steps.forEach((s) => stepObs.observe(s));
  // pausar cuando el capítulo no se ve
  new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) storyVideo.pause();
    else if (current) storyVideo.play().catch(() => {});
  }, { threshold: 0 }).observe($('#primera-cita'));
}

// ---------- Reproductor con sonido (modal) ----------
const vmodal = $('#vmodal'), vmVideo = $('#vmodal-video'), vmTitle = $('#vmodal-title');
function openVideo(src, title) {
  $$('video').forEach((v) => { if (v !== vmVideo) v.pause(); });
  vmVideo.src = src; vmTitle.textContent = title || '';
  vmodal.hidden = false; document.body.classList.add('modal-open');
  vmVideo.play().catch(() => {});
}
function closeVideo() {
  vmVideo.pause(); vmVideo.removeAttribute('src'); vmVideo.load();
  vmodal.hidden = true; document.body.classList.remove('modal-open');
  if (storyVideo && $('#primera-cita').getBoundingClientRect().top < window.innerHeight) storyVideo.play().catch(() => {});
}
document.addEventListener('click', (e) => {
  const trig = e.target.closest('[data-video]:not(.treat)');
  if (trig) { e.preventDefault(); openVideo(trig.dataset.video, trig.dataset.videoTitle); return; }
  if (e.target === vmodal || e.target.id === 'vmodal-close') closeVideo();
});

// ---------- Capítulo 3: quiz ----------
const quiz = $('#quiz');
if (quiz) {
  const answers = {};
  const qs = $$('.quiz__q', quiz);
  const bars = $$('.quiz__progress i', quiz);
  const result = $('#quiz-result');
  const RESULTS = {
    porcelana: { t: 'Carillas de porcelana', x: 'Lo que describes suele resolverse con carillas: corrigen forma, color y proporción en pocas citas y están pensadas para durar muchos años. En la valoración diseñamos tu sonrisa en digital y la ves antes de empezar.', img: 'assets/img/porcelana-f-frontal.jpg', wa: 'carillas de porcelana' },
    micro: { t: 'Microdiseño de sonrisa', x: 'Para cambios de color y forma sin desgastar tus dientes, el microdiseño es el camino más conservador: añadimos en vez de quitar. Empieza con un blanqueamiento y termina con resinas elegidas a tu tono.', img: 'assets/img/poster-caso-diseno.jpg', wa: 'microdiseño de sonrisa' },
    orto: { t: 'Ortodoncia invisible', x: 'Si lo que quieres es alinear, los alineadores removibles son discretos y se planifican en 3D: ves cómo se moverá cada pieza antes del primer alineador. Nadie lo nota, tú sí.', img: 'assets/img/poster-ortodoncia-caso.jpg', wa: 'ortodoncia invisible' },
    implante: { t: 'Implantes dentales', x: 'Cuando falta una pieza, el implante devuelve función y estética de forma fija y natural. En la valoración revisamos tu caso con un escaneo y te explico el proceso completo.', img: 'assets/img/poster-implantes.jpg', wa: 'implantes dentales' },
  };
  const decide = () => {
    const { q1, q2 } = answers;
    if (q1 === 'alineacion') return 'orto';
    if (q1 === 'piezas') return 'implante';
    if (q1 === 'forma') return q2 === 'conservador' ? 'micro' : 'porcelana';
    if (q1 === 'color') return q2 === 'duradero' ? 'porcelana' : 'micro';
    return 'porcelana';
  };
  const go = (n) => {
    qs.forEach((q) => q.classList.toggle('is-active', +q.dataset.q === n));
    bars.forEach((b, i) => b.classList.toggle('is-done', i < n - 1));
  };
  const finish = () => {
    qs.forEach((q) => q.classList.remove('is-active'));
    bars.forEach((b) => b.classList.add('is-done'));
    const r = RESULTS[decide()];
    $('#qr-title').textContent = r.t;
    $('#qr-text').textContent = r.x;
    const img = $('#qr-img'); img.src = r.img; img.alt = r.t;
    const when = { ya: 'lo antes posible', meses: 'en los próximos meses', info: 'primero quiero informarme' }[answers.q3] || '';
    const msg = `Hola Dra. Clara, hice el test de su página y me salió ${r.wa}. Me gustaría empezar ${when}. ¿Me puede orientar?`;
    $('#qr-wa').href = 'https://wa.me/50672110934?text=' + encodeURIComponent(msg);
    result.hidden = false;
    result.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
  };
  qs.forEach((q) => {
    $$('button', q).forEach((b) => b.addEventListener('click', () => {
      const n = +q.dataset.q;
      answers['q' + n] = b.dataset.v;
      if (n < qs.length) go(n + 1); else finish();
    }));
  });
  $('#quiz-restart').addEventListener('click', () => {
    Object.keys(answers).forEach((k) => delete answers[k]);
    result.hidden = true; go(1);
  });
}

// ---------- Capítulo 4: visor de casos ----------
const CASES = {
  f: [
    { src: 'assets/img/porcelana-f-frontal.jpg', name: 'Frontal', alt: 'Caso 01 de carillas de porcelana — sonrisa de frente' },
    { src: 'assets/img/porcelana-f-detalle.jpg', name: 'Detalle', alt: 'Caso 01 de carillas de porcelana — detalle de las piezas' },
    { src: 'assets/img/porcelana-f-lateral.jpg', name: 'Perfil', alt: 'Caso 01 de carillas de porcelana — vista de perfil' },
    { src: 'assets/img/porcelana-f-retrato.jpg', name: 'Retrato', alt: 'Caso 01 de carillas de porcelana — retrato del paciente sonriendo' },
  ],
  m: [
    { src: 'assets/img/porcelana-m-frontal.jpg', name: 'Frontal', alt: 'Caso 02 de carillas de porcelana — sonrisa de frente' },
    { src: 'assets/img/porcelana-m-lateral.jpg', name: 'Perfil', alt: 'Caso 02 de carillas de porcelana — vista de perfil' },
    { src: 'assets/img/porcelana-m-retrato.jpg', name: 'Retrato', alt: 'Caso 02 de carillas de porcelana — retrato de la paciente sonriendo' },
    { src: 'assets/img/porcelana-m-retrato-2.jpg', name: 'Retrato II', alt: 'Caso 02 de carillas de porcelana — segundo retrato' },
  ],
};
const viewer = $('#viewer');
if (viewer) {
  const mainImg = $('#viewer-img'), thumbs = $('#viewer-thumbs'), tabs = $$('.viewer__tab', viewer);
  const show = (shot) => {
    if (mainImg.getAttribute('src') === shot.src) return;
    mainImg.classList.add('is-fading');
    const next = new Image(); next.src = shot.src;
    const swap = () => { mainImg.src = shot.src; mainImg.alt = shot.alt; requestAnimationFrame(() => mainImg.classList.remove('is-fading')); };
    next.decode ? next.decode().then(swap, swap) : (next.onload = swap);
  };
  const render = (key) => {
    thumbs.innerHTML = '';
    CASES[key].forEach((shot, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'listitem');
      b.innerHTML = `<img src="${shot.src}" alt="" loading="lazy"><span>${shot.name}</span>`;
      if (i === 0) b.classList.add('is-active');
      b.addEventListener('click', () => { $$('button', thumbs).forEach((x) => x.classList.remove('is-active')); b.classList.add('is-active'); show(shot); });
      thumbs.appendChild(b);
    });
    show(CASES[key][0]);
    CASES[key].slice(1).forEach((s) => { const im = new Image(); im.src = s.src; });
  };
  tabs.forEach((t) => t.addEventListener('click', () => {
    tabs.forEach((x) => { x.classList.remove('is-active'); x.setAttribute('aria-selected', 'false'); });
    t.classList.add('is-active'); t.setAttribute('aria-selected', 'true'); render(t.dataset.case);
  }));
  render('f');
}

// Comparador antes / después
$$('.compare').forEach((box) => {
  const range = $('.compare__range', box);
  range.addEventListener('input', () => { box.style.setProperty('--pos', `${range.value}%`); box.classList.add('is-touched'); });
});

// Lightbox de imágenes
const lightbox = $('#lightbox'), lbImg = $('#lightbox-img'), lbCap = $('#lightbox-caption');
document.addEventListener('click', (e) => {
  const img = e.target.closest('[data-lightbox]');
  if (img) { lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt; lbCap.textContent = img.alt; lightbox.hidden = false; document.body.classList.add('modal-open'); return; }
  if (e.target === lightbox || e.target.id === 'lightbox-close') { lightbox.hidden = true; document.body.classList.remove('modal-open'); lbImg.src = ''; }
});
window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!vmodal.hidden) closeVideo();
  if (!lightbox.hidden) { lightbox.hidden = true; document.body.classList.remove('modal-open'); }
  setNav(false);
});

// ============================================================
// V3.1 · cursor, diseño en vivo, tratamientos ilustrados,
// reveal con cursor, contadores
// ============================================================

// Cursor personalizado
const cursor = $('#cursor');
if (cursor && matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced) {
  let cx = -100, cy = -100, tx = cx, ty = cy;
  window.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; cursor.classList.add('is-on'); }, { passive: true });
  document.addEventListener('mouseleave', () => cursor.classList.remove('is-on'));
  const HOVER = 'a, button, [data-lightbox], .compare, .viewer__thumbs button, .treat__media';
  document.addEventListener('pointerover', (e) => cursor.classList.toggle('is-hover', !!e.target.closest(HOVER)));
  const tick = () => { cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22; cursor.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(tick); };
  tick();
}

// ---------- Capítulo 2: la sonrisa se diseña con el scroll ----------
const pin = $('#design-pin'), frame = $('#design-smile');
if (pin && frame) {
  const svg = $('svg', frame);
  const lips = $$('.smile__lip', svg), teeth = $$('.t', svg), lower = $$('.tl', svg);
  const guides = $$('.smile__guides path', svg), scan = $('.smile__scan', svg), sheen = $('.sheen', svg);
  const stepsEl = $$('#design-steps li'), badge = $('#design-badge'), hint = $('#design-hint');
  const upper = $('.smile__upper', svg), lowerG = $('.smile__lower', svg);
  const order = [...teeth].sort((a, b) => (+a.className.baseVal.match(/t-(\d)/)[1]) - (+b.className.baseVal.match(/t-(\d)/)[1]));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const labels = ['Escaneo 3D', 'Diseño digital', 'Porcelana'];
  let last = -1;
  const render = () => {
    const r = pin.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    const p = clamp(-r.top / total);
    // Fase A · escaneo: labios + línea de escaneo
    const lipP = ease(seg(p, 0, 0.18));
    lips.forEach((l) => { l.style.strokeDashoffset = 1 - lipP; });
    const sc = seg(p, 0.06, 0.34);
    scan.style.opacity = sc > 0 && sc < 1 ? 1 : 0;
    const y = 110 + sc * 230; scan.setAttribute('y1', y); scan.setAttribute('y2', y);
    // Fase B · dibujo diente por diente (del centro hacia afuera)
    order.forEach((t, i) => {
      const k = Math.floor(i / 2);
      const tp = ease(seg(p, 0.28 + k * 0.045, 0.28 + k * 0.045 + 0.16));
      t.style.strokeDashoffset = 1 - tp;
    });
    const lp = ease(seg(p, 0.5, 0.62));
    lower.forEach((t) => { t.style.strokeDashoffset = 1 - lp; });
    const gp = ease(seg(p, 0.34, 0.5)), gf = 1 - seg(p, 0.78, 0.86);
    guides.forEach((g) => { g.style.strokeDashoffset = 1 - gp; g.style.opacity = gf; });
    // Fase C · porcelana: relleno + brillo
    const fp = ease(seg(p, 0.66, 0.84));
    upper.style.setProperty('--fill', fp);
    teeth.forEach((t) => { t.style.fill = `rgba(247,241,220,${fp})`; t.style.stroke = fp > 0.5 ? 'rgba(199,160,122,0.55)' : ''; });
    lower.forEach((t) => { t.style.fill = `rgba(233,220,194,${fp})`; });
    const sp = seg(p, 0.84, 1);
    sheen.style.opacity = sp > 0 && sp < 1 ? 1 : 0;
    sheen.setAttribute('transform', `skewX(-20) translate(${sp * 1000} 0)`);
    // textos
    const phase = p < 0.3 ? 0 : p < 0.66 ? 1 : 2;
    if (phase !== last) {
      last = phase;
      frame.dataset.phase = phase;
      stepsEl.forEach((li, i) => li.classList.toggle('is-on', i === phase));
      badge.textContent = labels[phase];
    }
    hint.classList.toggle('is-done', p > 0.9);
  };
  let raf = null;
  const onS = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = null; render(); }); };
  window.addEventListener('scroll', onS, { passive: true });
  window.addEventListener('resize', onS);
  render();
  if (reduced) { // sin animación: todo dibujado y relleno
    [...lips, ...teeth, ...lower].forEach((e) => { e.style.strokeDashoffset = 0; });
    teeth.forEach((t) => { t.style.fill = '#F7F1DC'; });
  }
}

// ---------- Capítulo 3: tratamientos (hover o al entrar en pantalla) ----------
const treats = $$('.treat');
if (treats.length) {
  const canHover = matchMedia('(hover: hover)').matches;
  const treatObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (canHover) return; // en escritorio manda el hover
      e.target.classList.toggle('is-on', e.isIntersecting);
    });
  }, { threshold: 0.6 });
  treats.forEach((card) => {
    treatObs.observe(card);
    if (canHover) {
      card.addEventListener('mouseenter', () => card.classList.add('is-on'));
      card.addEventListener('mouseleave', () => card.classList.remove('is-on'));
    }
  });
}

// ---------- Capítulo 5: el después aparece donde llevas el cursor ----------
const spot = $('#spot');
if (spot) {
  const set = (x, y, on) => {
    const r = spot.getBoundingClientRect();
    spot.style.setProperty('--x', `${((x - r.left) / r.width) * 100}%`);
    spot.style.setProperty('--y', `${((y - r.top) / r.height) * 100}%`);
    spot.style.setProperty('--r', on ? `${Math.max(90, r.width * 0.22)}px` : '0px');
    spot.classList.toggle('is-live', on);
  };
  spot.addEventListener('pointermove', (e) => { set(e.clientX, e.clientY, true); spot.classList.add('is-touched'); });
  spot.addEventListener('pointerdown', (e) => set(e.clientX, e.clientY, true));
  spot.addEventListener('pointerleave', (e) => set(e.clientX, e.clientY, false));
  spot.addEventListener('pointerup', () => { if (!matchMedia('(hover: hover)').matches) setTimeout(() => spot.classList.remove('is-live'), 1200); });
  // demo automática una vez, si nadie lo ha tocado
  new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting || spot.classList.contains('is-touched') || reduced) return;
    const r = spot.getBoundingClientRect();
    let t = 0; const dur = 2600, start = performance.now();
    const run = (now) => {
      if (spot.classList.contains('is-touched')) return;
      t = Math.min(1, (now - start) / dur);
      const x = r.left + r.width * (0.3 + 0.4 * t), y = r.top + r.height * 0.55;
      set(x, y, t < 0.95);
      if (t < 1) requestAnimationFrame(run); else spot.classList.remove('is-live');
    };
    requestAnimationFrame(run);
  }, { threshold: 0.6 }).observe(spot);
}

// ---------- Contadores ----------
$$('.count').forEach((el) => {
  const target = +el.dataset.count;
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    if (reduced) { el.textContent = target; return; }
    const t0 = performance.now(), dur = 1400;
    const step = (now) => { const k = Math.min(1, (now - t0) / dur); el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, { threshold: 0.5 }).observe(el);
});
