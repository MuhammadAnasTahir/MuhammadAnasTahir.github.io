/* ═══════════════════════════════════════
   THEME TOGGLE
═══════════════════════════════════════ */

const html        = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');

/* SVG icons — sun shown in dark mode (click → go light)
                moon shown in light mode (click → go dark)
   stroke="currentColor" inline so they always inherit button color */
const SUN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>';

const MOON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

function setThemeIcon(theme) {
    themeIcon.innerHTML = theme === 'dark' ? SUN_SVG : MOON_SVG;
}

const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
setThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setThemeIcon(next);
});


/* ═══════════════════════════════════════
   MOBILE HAMBURGER
═══════════════════════════════════════ */

const hamburger  = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    navLinksEl.classList.toggle('open');
    hamburger.classList.toggle('open');
});


/* ═══════════════════════════════════════
   SPA PAGE NAVIGATION
═══════════════════════════════════════ */

const navLinkEls   = document.querySelectorAll('.nav-link[data-page]');
const pageSections = document.querySelectorAll('.page-section');

function switchPage(pageId) {
    // Hide all pages
    pageSections.forEach(p => p.classList.remove('active'));

    // Show target page
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');

    // Highlight active nav link
    navLinkEls.forEach(l => l.classList.remove('active'));
    const matchingLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (matchingLink) matchingLink.classList.add('active');

    // Close mobile menu
    navLinksEl.classList.remove('open');
    hamburger.classList.remove('open');

    // Jump to top
    window.scrollTo(0, 0);

    // Canvas only runs on home page
    if (pageId === 'home') neuralCanvas.start();
    else                   neuralCanvas.stop();
}

// Wire up every [data-page] element
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
   ─────────────────────────────────────
   • Stagnant by default — particles freeze
     until the mouse enters the hero area.
   • On hover: mouse pushes nearby nodes.
     Strong damping returns them to rest.
   • Dense web: COUNT=150, CONNECT=210px.
   • Fills the full hero background.
═══════════════════════════════════════ */

const neuralCanvas = (() => {
    const el = document.getElementById('neural-canvas');
    if (!el) return { start() {}, stop() {} };
    const ctx = el.getContext('2d');

    /* ── Tuning knobs ─────────────────── */
    const COUNT        = 190;   // more particles fill empty gaps
    const CONNECT      = 210;   // max distance to draw a line (px)
    const REPEL_DIST   = 140;   // mouse influence radius (px)
    const REPEL_FORCE  = 0.028; // how hard the mouse pushes
    const DAMPING      = 0.88;  // friction per frame (lower = stops faster)
    const SPEED_CAP    = 1.8;   // max particle speed
    const DOT_R_MIN    = 0.8;   // smaller dots = more subtle
    const DOT_R_MAX    = 2.0;
    /* ──────────────────────────────────── */

    let particles  = [];
    let rafId      = null;
    let isHovering = false;         // tracks whether mouse is over hero
    const mouse    = { x: -9999, y: -9999 };

    /* Resize canvas to match hero element */
    function resize() {
        el.width  = el.offsetWidth  || window.innerWidth;
        el.height = el.offsetHeight || window.innerHeight;
    }

    /* Create one particle — starts with zero velocity */
    function makeParticle() {
        return {
            x:  Math.random() * el.width,
            y:  Math.random() * el.height,
            vx: 0,
            vy: 0,
            r:  DOT_R_MIN + Math.random() * (DOT_R_MAX - DOT_R_MIN),
        };
    }

    function init() {
        resize();
        particles = Array.from({ length: COUNT }, makeParticle);
    }

    /* Physics step for one particle */
    function step(p) {
        /* Mouse repulsion — only while hovering */
        if (isHovering) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < REPEL_DIST * REPEL_DIST && d2 > 0.01) {
                const d = Math.sqrt(d2);
                const f = (REPEL_DIST - d) / REPEL_DIST * REPEL_FORCE;
                p.vx += (dx / d) * f;
                p.vy += (dy / d) * f;
            }
        }

        /* Damping: slows particles; they come to a near-stop after mouse leaves */
        p.vx *= DAMPING;
        p.vy *= DAMPING;

        /* Speed cap */
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > SPEED_CAP) {
            p.vx = (p.vx / spd) * SPEED_CAP;
            p.vy = (p.vy / spd) * SPEED_CAP;
        }

        /* Snap to rest if moving imperceptibly */
        if (spd < 0.005) { p.vx = 0; p.vy = 0; }

        p.x += p.vx;
        p.y += p.vy;

        /* Bounce off edges (keeps particles spread across canvas) */
        if (p.x < p.r)            { p.x = p.r;              p.vx *= -0.5; }
        if (p.x > el.width  - p.r){ p.x = el.width  - p.r;  p.vx *= -0.5; }
        if (p.y < p.r)            { p.y = p.r;              p.vy *= -0.5; }
        if (p.y > el.height - p.r){ p.y = el.height - p.r;  p.vy *= -0.5; }
    }

    /* Choose particle/line color based on current theme */
    function colors() {
        const isDark = html.getAttribute('data-theme') !== 'light';
        return {
            /* Lower opacity = blends into background, less attention-grabbing */
            dot:  isDark ? 'rgba(200, 218, 255, 0.38)' : 'rgba(74, 108, 247, 0.30)',
            line: isDark ? 'rgba(190, 210, 255, '      : 'rgba(74, 108, 247, ',
        };
    }

    function draw() {
        ctx.clearRect(0, 0, el.width, el.height);
        const c = colors();

        /* Draw connection lines first (below dots) */
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx   = particles[i].x - particles[j].x;
                const dy   = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECT) {
                    /* Line opacity fades with distance — kept subtle */
                    const alpha = (1 - dist / CONNECT) * 0.28;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = c.line + alpha + ')';
                    ctx.lineWidth   = 0.7;
                    ctx.stroke();
                }
            }
        }

        /* Draw dots on top */
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = c.dot;
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

    /* ── Mouse tracking ──
       canvas has pointer-events:none so we listen on the hero section */
    const hero = document.getElementById('hero');
    if (hero) {
        hero.addEventListener('mousemove', e => {
            isHovering = true;
            const r    = el.getBoundingClientRect();
            mouse.x    = e.clientX - r.left;
            mouse.y    = e.clientY - r.top;
        }, { passive: true });

        hero.addEventListener('mouseleave', () => {
            isHovering  = false;
            mouse.x     = -9999;
            mouse.y     = -9999;
        });
    }

    /* Refit canvas on window resize */
    window.addEventListener('resize', () => {
        resize();
        /* Keep particles in bounds after resize */
        particles.forEach(p => {
            p.x = Math.min(p.x, el.width  - p.r);
            p.y = Math.min(p.y, el.height - p.r);
        });
    }, { passive: true });

    /* Boot — home is the default active page */
    init();
    start();

    return { start, stop };
})();
