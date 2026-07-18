const header = document.querySelector('.site-header');
const reveals = document.querySelectorAll('.reveal');
const navLinks = [...document.querySelectorAll('.nav-link[href^="#"]')];
const sections = [...document.querySelectorAll('main section[id]')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const onScroll = () => {
  header?.classList.toggle('scrolled', window.scrollY > 20);

  if (!reduceMotion) {
    const y = window.scrollY;
    document.documentElement.style.setProperty('--scroll-y', `${y}px`);
    document.querySelectorAll('.hero-orbit').forEach((orbit, index) => {
      orbit.style.transform = `translate3d(0, ${y * (index ? 0.035 : 0.02)}px, 0)`;
    });
  }

  let current = '';
  sections.forEach((section) => {
    const top = section.offsetTop - 150;
    if (window.scrollY >= top) current = section.id;
  });
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if ('IntersectionObserver' in window && !reduceMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.11, rootMargin: '0px 0px -4% 0px' });
  reveals.forEach((element) => observer.observe(element));
} else {
  reveals.forEach((element) => element.classList.add('is-visible'));
}

document.querySelectorAll('.navbar-collapse a').forEach((link) => {
  link.addEventListener('click', () => {
    const menu = document.querySelector('.navbar-collapse');
    if (menu?.classList.contains('show') && window.bootstrap) {
      bootstrap.Collapse.getOrCreateInstance(menu).hide();
    }
  });
});
