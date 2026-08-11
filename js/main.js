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
    // Hide all pages and reset animation state
    pageSections.forEach(p => p.classList.remove('active', 'page-visible'));

    // Show target page, then trigger blur-fade on next frame so transition fires
    const target = document.getElementById('page-' + pageId);
    if (target) {
        target.classList.add('active');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => target.classList.add('page-visible'));
        });
    }

    // Highlight active nav link
    navLinkEls.forEach(l => l.classList.remove('active'));
    const matchingLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (matchingLink) matchingLink.classList.add('active');

    // Close mobile menu
    navLinksEl.classList.remove('open');
    hamburger.classList.remove('open');

    // Jump to top
    window.scrollTo(0, 0);
}

// Wire up every [data-page] element
document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => {
        e.preventDefault();
        switchPage(el.getAttribute('data-page'));
    });
});

// Animate in the initial active page on first load
requestAnimationFrame(() => {
    requestAnimationFrame(() => {
        document.querySelectorAll('.page-section.active').forEach(p => p.classList.add('page-visible'));
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
   SEE MORE EXPERIENCES
═══════════════════════════════════════ */

const expMoreBtn  = document.getElementById('expMoreBtn');
const expProGrid  = document.getElementById('expProGrid');

if (expMoreBtn && expProGrid) {
    const expExtraCount = expProGrid.querySelectorAll('.exp-card--extra').length;
    const expMoreLabel  = expMoreBtn.querySelector('span');

    const setExpLabel = open => {
        expMoreLabel.textContent = open ? 'Show less' : `Show more (${expExtraCount} more)`;
    };
    setExpLabel(false);

    expMoreBtn.addEventListener('click', () => {
        const open = expProGrid.classList.toggle('exp-grid--expanded');
        expMoreBtn.classList.toggle('open', open);
        setExpLabel(open);
    });
}


/* ═══════════════════════════════════════
   EXP CARD EXPAND / COLLAPSE
═══════════════════════════════════════ */

const CHEV_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';

document.querySelectorAll('.exp-card').forEach(card => {
    const body = card.querySelector('.exp-body');
    if (!body) return;
    const ul = body.querySelector('ul');
    if (!ul) return;
    const items = [...ul.querySelectorAll(':scope > li')];
    if (items.length <= 1) return;

    // Hide bullets beyond the first
    items.slice(1).forEach(li => { li.hidden = true; });

    // Hide the tags block initially
    const tagsEl = card.querySelector('.exp-tags-block') || card.querySelector('.exp-tags');
    if (tagsEl) tagsEl.hidden = true;

    // Build small toggle button
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'exp-expand-btn';
    btn.innerHTML = `<span>Show more</span>${CHEV_SVG}`;

    let open = false;
    btn.addEventListener('click', () => {
        open = !open;
        items.slice(1).forEach(li => { li.hidden = !open; });
        if (tagsEl) tagsEl.hidden = !open;
        btn.querySelector('span').textContent = open ? 'Show less' : 'Show more';
        btn.classList.toggle('open', open);

        // Collapsed: sits right under the single visible bullet.
        // Expanded: moves below the skills block, so "Show less" reads last.
        if (open) {
            card.appendChild(btn);
        } else {
            body.insertAdjacentElement('afterend', btn);
        }
    });

    body.insertAdjacentElement('afterend', btn);
});


