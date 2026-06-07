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
   MOBILE HAMBURGER
═══════════════════════════════════════ */

const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    navLinksEl.classList.toggle('open');
    hamburger.classList.toggle('open');
});


/* ═══════════════════════════════════════
   SPA PAGE NAVIGATION
   Every element with [data-page] switches
   to that page when clicked.
   No scroll-based switching at all.
═══════════════════════════════════════ */

const navLinkEls   = document.querySelectorAll('.nav-link[data-page]');
const pageSections = document.querySelectorAll('.page-section');

function switchPage(pageId) {
    // 1. Hide every page section
    pageSections.forEach(p => p.classList.remove('active'));

    // 2. Show only the requested one
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');

    // 3. Update nav tab highlight
    navLinkEls.forEach(l => l.classList.remove('active'));
    const matchingLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (matchingLink) matchingLink.classList.add('active');

    // 4. Close mobile menu
    navLinksEl.classList.remove('open');
    hamburger.classList.remove('open');

    // 5. Jump to top
    window.scrollTo(0, 0);

    // 6. Canvas only runs on home page
    if (pageId === 'home') {
        neuralCanvas.start();
    } else {
        neuralCanvas.stop();
    }
}

// Wire up every [data-page] element (nav links, brand, hero buttons)
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
        ? '0 2px 24px rgba(0,0,0,0.4)'
        : 'none';
}, { passive: true });


/* ═══════════════════════════════════════
   NEURAL NETWORK CANVAS
   White particles on dark navy.
   Large connection distance = dense net.
   Mouse repels nearby nodes.
═══════════════════════════════════════ */

const neuralCanvas = (() => {
    const el  = document.getElementById('neural-canvas');
    if (!el) return { start() {}, stop() {} };
    const ctx = el.getContext('2d');

    // ── Tuning knobs ──────────────────────
    const COUNT       = 100;   // number of particles
    const CONNECT     = 190;   // max px distance to draw a line (bigger = denser web)
    const REPEL_DIST  = 130;   // mouse push radius
    const REPEL_FORCE = 0.022;
    const SPEED_CAP   = 1.1;
    const DOT_MIN_R   = 1.2;
    const DOT_MAX_R   = 2.5;
    // ─────────────────────────────────────

    let particles = [];
    let rafId     = null;
    const mouse   = { x: -9999, y: -9999 };

    function resize() {
        el.width  = el.offsetWidth  || window.innerWidth;
        el.height = el.offsetHeight || window.innerHeight;
    }

    function makeParticle() {
        return {
            x:  Math.random() * el.width,
            y:  Math.random() * el.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            r:  DOT_MIN_R + Math.random() * (DOT_MAX_R - DOT_MIN_R),
        };
    }

    function init() {
        resize();
        particles = Array.from({ length: COUNT }, makeParticle);
    }

    function step(p) {
        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < REPEL_DIST * REPEL_DIST && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (REPEL_DIST - d) / REPEL_DIST * REPEL_FORCE;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
        }
        // Speed cap
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > SPEED_CAP) { p.vx = (p.vx / spd) * SPEED_CAP; p.vy = (p.vy / spd) * SPEED_CAP; }

        p.x += p.vx;  p.y += p.vy;

        // Wrap edges
        if (p.x < 0)         p.x = el.width;
        if (p.x > el.width)  p.x = 0;
        if (p.y < 0)         p.y = el.height;
        if (p.y > el.height) p.y = 0;
    }

    function colors() {
        // White lines/dots on dark navy; subtle blue-white on light
        const dark = html.getAttribute('data-theme') !== 'light';
        return {
            dot:  dark ? 'rgba(220, 230, 255, 0.75)' : 'rgba(74, 108, 247, 0.55)',
            line: dark ? 'rgba(200, 220, 255, '       : 'rgba(74, 108, 247, ',
        };
    }

    function draw() {
        ctx.clearRect(0, 0, el.width, el.height);
        const c = colors();

        // Lines (behind dots)
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx   = particles[i].x - particles[j].x;
                const dy   = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECT) {
                    const alpha = (1 - dist / CONNECT) * 0.45;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = c.line + alpha + ')';
                    ctx.lineWidth   = 0.75;
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
        resize();
        loop();
    }

    function stop() {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }

    // Mouse tracking on the hero section (canvas has pointer-events:none)
    const hero = document.getElementById('hero');
    if (hero) {
        hero.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            mouse.x = e.clientX - r.left;
            mouse.y = e.clientY - r.top;
        }, { passive: true });
        hero.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
    }

    window.addEventListener('resize', resize, { passive: true });

    // Boot — home is the default active page
    init();
    start();

    return { start, stop };
})();
