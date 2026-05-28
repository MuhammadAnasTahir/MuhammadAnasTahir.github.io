/* ═══════════════════════════════════════
   THEME TOGGLE
═══════════════════════════════════════ */

const html        = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');

const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
themeIcon.textContent = savedTheme === 'dark' ? '☀' : '☽';

themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
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


/* ═══════════════════════════════════════
   SPA PAGE NAVIGATION
   Clicking any element with data-page
   shows only that page-section and hides
   all others. No scroll-based switching.
═══════════════════════════════════════ */

const navLinkEls   = document.querySelectorAll('.nav-link[data-page]');
const pageSections = document.querySelectorAll('.page-section');

function switchPage(pageId) {
    // Hide all pages
    pageSections.forEach(p => p.classList.remove('active'));

    // Show the requested page
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');

    // Update which nav link looks active
    navLinkEls.forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Close mobile menu
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');

    // Scroll to top of page
    window.scrollTo(0, 0);

    // Start or stop the canvas animation
    if (pageId === 'home') {
        canvas.start();
    } else {
        canvas.stop();
    }
}

// Attach click handler to every element that has a data-page attribute
document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => {
        e.preventDefault();
        switchPage(el.getAttribute('data-page'));
    });
});


/* ═══════════════════════════════════════
   NAVBAR SHADOW ON SCROLL
═══════════════════════════════════════ */

const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.style.boxShadow = window.scrollY > 40
        ? '0 2px 24px rgba(0, 0, 0, 0.35)'
        : 'none';
}, { passive: true });


/* ═══════════════════════════════════════
   NEURAL NETWORK CANVAS
   Particles connected by lines — classic
   ML/data visualization aesthetic.
   Reacts to mouse position.
═══════════════════════════════════════ */

const canvas = (() => {
    const el  = document.getElementById('neural-canvas');
    const ctx = el.getContext('2d');

    const PARTICLE_COUNT  = 72;
    const MAX_DIST        = 130;   // max distance to draw a line
    const MOUSE_REPEL     = 110;   // mouse pushes particles this far
    const SPEED_CAP       = 1.2;

    let particles = [];
    let rafId     = null;
    let active    = true;
    const mouse   = { x: -9999, y: -9999 };

    // Keep canvas pixel dimensions in sync with its CSS size
    function resize() {
        el.width  = el.offsetWidth  || window.innerWidth;
        el.height = el.offsetHeight || window.innerHeight;
    }

    function makeParticle() {
        return {
            x:  Math.random() * el.width,
            y:  Math.random() * el.height,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            r:  Math.random() * 1.5 + 0.8,
        };
    }

    function init() {
        resize();
        particles = Array.from({ length: PARTICLE_COUNT }, makeParticle);
    }

    function step(p) {
        // Repel from mouse cursor
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < MOUSE_REPEL * MOUSE_REPEL && d2 > 0) {
            const d = Math.sqrt(d2);
            const f = ((MOUSE_REPEL - d) / MOUSE_REPEL) * 0.018;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
        }
        // Clamp speed
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > SPEED_CAP) { p.vx = (p.vx / spd) * SPEED_CAP; p.vy = (p.vy / spd) * SPEED_CAP; }
        p.x += p.vx;
        p.y += p.vy;
        // Wrap around edges
        if (p.x < 0)        p.x = el.width;
        if (p.x > el.width) p.x = 0;
        if (p.y < 0)        p.y = el.height;
        if (p.y > el.height) p.y = 0;
    }

    // Pick particle/line colors based on current theme
    function colors() {
        const dark = html.getAttribute('data-theme') !== 'light';
        return {
            dot:  dark ? 'rgba(93, 162, 252, 0.75)' : 'rgba(37, 99, 235, 0.55)',
            line: dark ? 'rgba(93, 162, 252, '       : 'rgba(37, 99, 235, ',
        };
    }

    function draw() {
        ctx.clearRect(0, 0, el.width, el.height);
        const c = colors();

        // Lines first (behind dots)
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx   = particles[i].x - particles[j].x;
                const dy   = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = c.line + ((1 - dist / MAX_DIST) * 0.35) + ')';
                    ctx.lineWidth   = 0.7;
                    ctx.stroke();
                }
            }
        }

        // Dots
        ctx.fillStyle = c.dot;
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function loop() {
        particles.forEach(step);
        draw();
        rafId = requestAnimationFrame(loop);
    }

    function start() {
        if (rafId) return;
        active = true;
        resize();
        loop();
    }

    function stop() {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        active = false;
    }

    // Track mouse over the hero section (canvas has pointer-events:none)
    const hero = document.getElementById('hero');
    if (hero) {
        hero.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            mouse.x = e.clientX - r.left;
            mouse.y = e.clientY - r.top;
        }, { passive: true });
        hero.addEventListener('mouseleave', () => {
            mouse.x = -9999;
            mouse.y = -9999;
        });
    }

    window.addEventListener('resize', () => {
        resize();
    }, { passive: true });

    // Boot — home is active on load
    init();
    start();

    return { start, stop };
})();
