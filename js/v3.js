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
const sectionIds = ['inicio', 'primera-cita', 'servicios', 'disena', 'cambio', 'clinica', 'agenda'];
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

// ---------- Capítulo 2: tratamientos (hover reproduce sin sonido) ----------
$$('.treat').forEach((card) => {
  const v = $('video', card);
  const canHover = matchMedia('(hover: hover)').matches;
  if (canHover) {
    card.addEventListener('mouseenter', () => { v.play().catch(() => {}); });
    card.addEventListener('mouseleave', () => { v.pause(); });
  }
  $('.treat__media', card).addEventListener('click', () => openVideo(card.dataset.video, card.dataset.videoTitle));
});

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
