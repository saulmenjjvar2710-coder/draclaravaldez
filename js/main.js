// ============================================================
// Dra. Clara Valdez — interacciones
// ============================================================

// Preloader: se desvanece al cargar
window.addEventListener('load', () => {
  setTimeout(() => document.body.classList.add('is-loaded'), 500);
});
// Respaldo por si 'load' tarda (videos, fuentes)
setTimeout(() => document.body.classList.add('is-loaded'), 2600);

// Header: fondo al hacer scroll
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Animaciones de aparición
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal, .section__title').forEach((el) => observer.observe(el));

// Parallax sutil del video hero
const heroMedia = document.querySelector('.hero__media');
if (heroMedia && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.2) {
      heroMedia.style.transform = `translateY(${y * 0.08}px)`;
    }
  }, { passive: true });
}

// Reproductores de video: un solo video sonando a la vez
const frames = document.querySelectorAll('.video-frame');

frames.forEach((frame) => {
  const video = frame.querySelector('video');
  const playBtn = frame.querySelector('.video-play');
  if (!video || !playBtn) return;

  const pauseOthers = () => {
    frames.forEach((other) => {
      if (other === frame) return;
      const v = other.querySelector('video');
      if (v && !v.paused) {
        v.pause();
        other.classList.remove('is-playing');
      }
    });
  };

  playBtn.addEventListener('click', () => {
    pauseOthers();
    video.play();
    frame.classList.add('is-playing');
  });

  video.addEventListener('click', () => {
    if (!video.paused) {
      video.pause();
      frame.classList.remove('is-playing');
    }
  });

  video.addEventListener('ended', () => {
    frame.classList.remove('is-playing');
    video.currentTime = 0;
  });
});

// Menú móvil: abrir/cerrar y cerrar al elegir una sección
const nav = document.getElementById('nav');
const navToggle = document.getElementById('nav-toggle');
if (nav && navToggle) {
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  navToggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  nav.querySelectorAll('.nav__link').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
}

// Resaltar en el menú la sección visible
const navLinks = [...document.querySelectorAll('.nav__link')];
const targets = navLinks.map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);
if (targets.length) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  targets.forEach((t) => spy.observe(t));
}

// ============================================================
// Versión 2.0 — interacciones nuevas
// ============================================================

// Barra de progreso de lectura
const progress = document.getElementById('progress');
if (progress) {
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// Título del hero: separar en palabras para animarlas una a una
document.querySelectorAll('[data-split]').forEach((el) => {
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

// Comparador antes / después
document.querySelectorAll('.compare').forEach((box) => {
  const range = box.querySelector('.compare__range');
  if (!range) return;
  const set = (v) => box.style.setProperty('--pos', `${v}%`);
  range.addEventListener('input', () => { set(range.value); box.classList.add('is-touched'); });
  range.addEventListener('pointerdown', () => { box.classList.add('is-active', 'is-touched'); });
  const release = () => box.classList.remove('is-active');
  range.addEventListener('pointerup', release);
  range.addEventListener('pointercancel', release);
  range.addEventListener('blur', release);
});

// Visor de casos de porcelana
const CASES = {
  f: {
    label: 'Caso 01',
    shots: [
      { src: 'assets/img/porcelana-f-frontal.jpg', name: 'Frontal',  alt: 'Caso 01 de carillas de porcelana — sonrisa de frente' },
      { src: 'assets/img/porcelana-f-detalle.jpg', name: 'Detalle',  alt: 'Caso 01 de carillas de porcelana — detalle de las piezas' },
      { src: 'assets/img/porcelana-f-lateral.jpg', name: 'Perfil',   alt: 'Caso 01 de carillas de porcelana — vista de perfil' },
      { src: 'assets/img/porcelana-f-retrato.jpg', name: 'Retrato',  alt: 'Caso 01 de carillas de porcelana — retrato del paciente sonriendo' },
    ],
  },
  m: {
    label: 'Caso 02',
    shots: [
      { src: 'assets/img/porcelana-m-frontal.jpg',   name: 'Frontal', alt: 'Caso 02 de carillas de porcelana — sonrisa de frente' },
      { src: 'assets/img/porcelana-m-lateral.jpg',   name: 'Perfil',  alt: 'Caso 02 de carillas de porcelana — vista de perfil' },
      { src: 'assets/img/porcelana-m-retrato.jpg',   name: 'Retrato', alt: 'Caso 02 de carillas de porcelana — retrato de la paciente sonriendo' },
      { src: 'assets/img/porcelana-m-retrato-2.jpg', name: 'Retrato II', alt: 'Caso 02 de carillas de porcelana — segundo retrato' },
    ],
  },
};
const viewer = document.getElementById('viewer');
if (viewer) {
  const mainImg = document.getElementById('viewer-img');
  const thumbs = document.getElementById('viewer-thumbs');
  const tabs = viewer.querySelectorAll('.viewer__tab');
  const show = (shot) => {
    if (mainImg.getAttribute('src') === shot.src) return;
    mainImg.classList.add('is-fading');
    const next = new Image();
    next.src = shot.src;
    const swap = () => {
      mainImg.src = shot.src; mainImg.alt = shot.alt;
      requestAnimationFrame(() => mainImg.classList.remove('is-fading'));
    };
    next.decode ? next.decode().then(swap, swap) : (next.onload = swap);
  };
  const render = (key) => {
    const c = CASES[key];
    thumbs.innerHTML = '';
    c.shots.forEach((shot, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'listitem');
      b.innerHTML = `<img src="${shot.src}" alt="" loading="lazy"><span>${shot.name}</span>`;
      if (i === 0) b.classList.add('is-active');
      b.addEventListener('click', () => {
        thumbs.querySelectorAll('button').forEach((x) => x.classList.remove('is-active'));
        b.classList.add('is-active'); show(shot);
      });
      thumbs.appendChild(b);
    });
    show(c.shots[0]);
    // precargar el resto
    c.shots.slice(1).forEach((s) => { const im = new Image(); im.src = s.src; });
  };
  tabs.forEach((t) => t.addEventListener('click', () => {
    tabs.forEach((x) => { x.classList.remove('is-active'); x.setAttribute('aria-selected', 'false'); });
    t.classList.add('is-active'); t.setAttribute('aria-selected', 'true');
    render(t.dataset.case);
  }));
  render('f');
}

// Lightbox para galería y visor
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lbImg = document.getElementById('lightbox-img');
  const lbCap = document.getElementById('lightbox-caption');
  const open = (src, alt) => {
    lbImg.src = src; lbImg.alt = alt || ''; lbCap.textContent = alt || '';
    lightbox.hidden = false; document.body.classList.add('lightbox-open');
  };
  const close = () => { lightbox.hidden = true; document.body.classList.remove('lightbox-open'); lbImg.src = ''; };
  document.addEventListener('click', (e) => {
    const img = e.target.closest('[data-lightbox]');
    if (img) { open(img.currentSrc || img.src, img.alt); return; }
    if (e.target === lightbox || e.target.id === 'lightbox-close') close();
  });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lightbox.hidden) close(); });
}
