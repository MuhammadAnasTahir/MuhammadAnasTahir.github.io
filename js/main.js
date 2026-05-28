/* ═══════════════════════════════════════
   THEME TOGGLE (Dark / Light)
   Saves preference in localStorage so
   the choice persists across visits.
═══════════════════════════════════════ */

const html        = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');

// Load saved preference, or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
themeIcon.textContent = savedTheme === 'dark' ? '☀' : '☽'; // ☀ or ☽

themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeIcon.textContent = next === 'dark' ? '☀' : '☽';
});


/* ═══════════════════════════════════════
   MOBILE HAMBURGER MENU
═══════════════════════════════════════ */

const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
});

// Close the menu when a nav link is clicked
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
    });
});


/* ═══════════════════════════════════════
   ACTIVE NAV HIGHLIGHT ON SCROLL
   Watches which section is in view and
   highlights the matching nav link.
═══════════════════════════════════════ */

const sections    = document.querySelectorAll('section[id]');
const navLinkEls  = document.querySelectorAll('.nav-link');

function updateActiveNav() {
    const scrollY = window.scrollY + 80; // offset for fixed navbar height

    sections.forEach(section => {
        const top    = section.offsetTop;
        const height = section.offsetHeight;
        const id     = section.getAttribute('id');
        const link   = document.querySelector(`.nav-link[href="#${id}"]`);

        if (!link) return;

        if (scrollY >= top && scrollY < top + height) {
            navLinkEls.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });


/* ═══════════════════════════════════════
   SCROLL FADE-IN ANIMATIONS
   IntersectionObserver triggers when
   an element enters the viewport — much
   more efficient than a scroll listener.
═══════════════════════════════════════ */

const animatedEls = document.querySelectorAll(
    '.card, .highlight-card, .about-text, .contact-links, .section-title'
);

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Stop watching once the element has animated in
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
});

animatedEls.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});


/* ═══════════════════════════════════════
   NAVBAR SHADOW ON SCROLL
   Adds a subtle drop shadow once the
   user scrolls past the hero section.
═══════════════════════════════════════ */

const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.2)';
    } else {
        navbar.style.boxShadow = 'none';
    }
}, { passive: true });
