# ARCADE VOID 🎮

A browser-based gaming platform hosted on GitHub Pages. No installs, no plugins — pure HTML5 & JavaScript.

## 🚀 Live Site
> `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

---

## 📁 Directory Structure

```
/
├── index.html          ← Homepage (game grid)
├── css/
│   └── main.css        ← Global styles
├── js/
│   └── main.js         ← Global scripts
├── images/             ← Shared images / icons
├── videos/             ← Shared video assets
├── graphics/           ← Shared graphic assets
└── snake/
    ├── index.html      ← Snake game page
    ├── css/
    │   └── game.css
    ├── js/
    │   └── game.js
    └── images/
```

Each game lives in its own folder and is fully self-contained.

---

## 🕹️ Adding a New Game

1. Create a new folder: `/your-game-name/`
2. Inside it, add `index.html` + subfolders (`css/`, `js/`, `images/`)
3. In the root `index.html`, find an empty card slot and update it:

```html
<a href="your-game-name/index.html" class="game-card active">
  <div class="card-number">02</div>
  <div class="card-icon">🎯</div>
  <div class="card-info">
    <h2 class="card-title">YOUR GAME</h2>
    <p class="card-desc">Short description here.</p>
    <div class="card-tags">
      <span class="tag">GENRE</span>
    </div>
  </div>
  <div class="card-status">PLAY NOW ▶</div>
  <div class="card-border-anim"></div>
</a>
```

4. Push to GitHub — done!

---

## 🌐 Hosting on GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, root `/`
4. Your site will be live at `https://username.github.io/repo/`

---

## 🎨 Theme

- **Background:** `#000000` pure black
- **Foreground:** `#f5c400` yellow / amber family
- **Font Stack:** Orbitron · Bebas Neue · Share Tech Mono
