// ===== NAV =====
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');
const navToggle = document.getElementById('nav-toggle');
const navLinksContainer = document.getElementById('nav-links');

function updateActiveLink() {
  let current = '';
  sections.forEach(s => {
    const top = s.offsetTop - 250;
    if (window.scrollY >= top) current = s.getAttribute('id');
  });
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}

window.addEventListener('scroll', updateActiveLink);
window.addEventListener('load', updateActiveLink);

navLinks.forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      navLinksContainer.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.textContent = '☰';
    }
  });
});

// hamburger toggle
navToggle.addEventListener('click', function() {
  const isOpen = navLinksContainer.classList.toggle('open');
  navToggle.classList.toggle('open');
  navToggle.textContent = isOpen ? '✕' : '☰';
});

// close nav on resize back to desktop
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    navLinksContainer.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.textContent = '☰';
  }
});

// ===== HERO PARALLAX (mouse + device orientation) =====
const hf1 = document.querySelector('.hero-flare-1');
const hf2 = document.querySelector('.hero-flare-2');
const hero = document.querySelector('#hero');

hero.addEventListener('mousemove', e => {
  const rect = hero.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  moveFlares(x, y);
});

// touch parallax
hero.addEventListener('touchmove', e => {
  const touch = e.touches[0];
  const rect = hero.getBoundingClientRect();
  const x = (touch.clientX - rect.left) / rect.width - 0.5;
  const y = (touch.clientY - rect.top) / rect.height - 0.5;
  moveFlares(x, y);
}, { passive: true });

function moveFlares(x, y) {
  if (hf1) hf1.style.transform = `translate(${x * 40}px, ${y * 25}px)`;
  if (hf2) hf2.style.transform = `translate(${x * -25}px, ${y * -20}px)`;
}

// 100svh fallback for mobile Safari
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', vh + 'px');
}
setVH();
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);
