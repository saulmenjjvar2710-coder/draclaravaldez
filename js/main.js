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
