# Muhammad Anas Tahir — Personal Website

My personal portfolio website, built from scratch as a learning project. Covers HTML, CSS, JavaScript fundamentals, Git/GitHub workflow, and static site deployment.

**Live site:** `https://MuhammadAnasTahir.github.io`

---

## What This Site Includes

- Hero section with photo, tagline, and CTA buttons
- About section with key highlights
- Education — DKU & Duke dual degree
- Research & Projects — LLM4AD, Coffee Chemistry
- Experience & Leadership — all roles from resume
- Skills — programming, tools, languages, certificates
- Contact section with email and GitHub links
- Dark / Light mode toggle (preference saved in browser)
- Fully responsive (mobile, tablet, desktop)

---

## Project Structure

```
personal-website/
├── index.html        ← All page content (HTML structure)
├── css/
│   └── style.css     ← All visual styling + theme variables
├── js/
│   └── main.js       ← Theme toggle, mobile menu, scroll effects
├── assets/
│   └── profile.png   ← Profile photo
└── README.md
```

---

## Tech Stack & Why

| Technology | Role | Why I chose it |
|---|---|---|
| **HTML5** | Page structure & content | Semantic tags (section, article, nav) help SEO and screen readers |
| **CSS3** | Styling + theming | CSS Variables make dark/light mode trivial; Flexbox & Grid handle layouts |
| **Vanilla JavaScript** | Interactivity | No frameworks needed — keeps load time near zero |
| **Google Fonts (Inter)** | Typography | Clean, modern, professional sans-serif |
| **GitHub Pages** | Hosting | Free, tied to the repo, auto-deploys on push |

---

## Key Concepts Used

### CSS Custom Properties (Variables)
```css
:root {
    --accent: #4a7fe8;
    --bg:     #0a0b14;
}
[data-theme="light"] {
    --accent: #2563eb;
    --bg:     #f0f2f8;
}
```
One attribute change on `<html>` — `data-theme="light"` — swaps every color on the page instantly.

### localStorage (Theme Persistence)
```js
localStorage.setItem('theme', 'light');
localStorage.getItem('theme'); // 'light'
```
Saves the user's theme preference in the browser so it survives page refreshes.

### Intersection Observer API
```js
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
});
```
Detects when elements scroll into view and triggers animations — far more efficient than listening to the scroll event.

### CSS `clamp()` for Fluid Typography
```css
font-size: clamp(2.2rem, 5vw, 3.4rem);
```
The font size scales smoothly with viewport width — no breakpoints needed for the heading.

### `backdrop-filter` (Frosted Glass Navbar)
```css
backdrop-filter: blur(12px);
```
Makes the navbar semi-transparent with a blur effect over content scrolling behind it.

---

## Running Locally

No build step required. Just open `index.html` in any browser:

```
Right-click index.html → Open with → Your Browser
```

Or if you have VS Code, install the **Live Server** extension and click "Go Live" for auto-reload on save.

---

## Deploying to GitHub Pages

1. Create a GitHub repository named exactly: `MuhammadAnasTahir.github.io`
2. Push all files to the `main` branch
3. Go to **Settings → Pages → Source → Deploy from branch → main → / (root)**
4. Wait ~60 seconds — your site is live at `https://MuhammadAnasTahir.github.io`

Every time you push a commit, the site automatically updates.

---

## Things Still To Do

- [ ] Add real LinkedIn URL in the contact section (`index.html`, look for `<!-- TODO -->`)
- [ ] Add more projects as they are completed
- [ ] Consider adding a blog section later

---

## Git Workflow Used

```bash
git init
git add .
git commit -m "Initial commit: personal website"
git remote add origin https://github.com/MuhammadAnasTahir/MuhammadAnasTahir.github.io.git
git push -u origin main
```

---

*Built with HTML, CSS & JavaScript. Hosted on GitHub Pages.*
