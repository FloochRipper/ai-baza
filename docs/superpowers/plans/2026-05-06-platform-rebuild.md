# Platform Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild baza-zaniy as a proper 3-column document site with correct brand, 10-page block-00 "Для новичка", and Vercel deployment.

**Architecture:** Static HTML/CSS/JS. Shared CSS design system in `styles.css`. One HTML file per content page in `block-00/`. No frameworks, no build tools. The 3-column layout (left = block nav, center = article, right = anchor TOC) is defined once in the CSS and reused across all pages via copy-paste template.

**Tech Stack:** HTML5, CSS custom properties, vanilla JS (copy-to-clipboard only), Onest + JetBrains Mono (self-hosted), Vercel (static hosting via GitHub).

---

## File Structure

```
baza-zaniy/
├── index.html                  MODIFY — rebuild as hub/landing
├── styles.css                  MODIFY — full rewrite with new design system
├── scripts.js                  MODIFY — keep copy-to-clipboard, remove old accordion JS
├── fonts/
│   ├── onest/                  CREATE — self-hosted Onest weights 400/500/600/700/800
│   └── jetbrains-mono/         CREATE — self-hosted JetBrains Mono weights 400/500/600
├── block-00/
│   ├── 01-intro.html           CREATE
│   ├── 02-ai-llm-neurons.html  CREATE
│   ├── 03-claude-map.html      CREATE
│   ├── 04-chatgpt-vs-claude.html CREATE
│   ├── 05-prompting-racet.html CREATE
│   ├── 06-prompt-techniques.html CREATE
│   ├── 07-glossary.html        CREATE
│   ├── 08-common-mistakes.html CREATE
│   ├── 09-first-day.html       CREATE
│   └── 10-where-next.html      CREATE
├── sitemap.xml                 CREATE
├── llms.txt                    CREATE
├── vercel.json                 CREATE
└── _headers                    MODIFY — keep cache headers, remove Netlify-specific
```

---

## Task 1: Self-host Onest and JetBrains Mono fonts

**Files:**
- Create: `fonts/onest/` (woff2 files)
- Create: `fonts/jetbrains-mono/` (woff2 files)

The current `fonts/` has Bebas Neue + Montserrat — old brand. Download new fonts.

- [ ] **Step 1.1: Download Onest font files**

```bash
mkdir -p fonts/onest fonts/jetbrains-mono

# Download Onest (weights 400, 500, 600, 700, 800 — Cyrillic + Latin)
curl -L "https://fonts.gstatic.com/s/onest/v8/gNMKW3F-SZuj7zOT0IfSjTS16c7MZxNm-A.woff2" -o fonts/onest/onest-400.woff2
curl -L "https://fonts.gstatic.com/s/onest/v8/gNMKW3F-SZuj7zOT0IfSjTS16c7MZxNmMg.woff2" -o fonts/onest/onest-400-ext.woff2
```

Since Google Fonts CDN URLs are version-specific and can change, use the `google-webfonts-helper` approach instead:

```bash
# Use this Python snippet to download all needed Onest variants
python3 << 'EOF'
import urllib.request, os

# These are the stable woff2 URLs from Google Fonts API v2
fonts = {
    "onest-cyrillic-400": "https://fonts.gstatic.com/s/onest/v8/gNMKW3F-SZuj7zOT0IfSjTS16c7MZxNm-A.woff2",
    "onest-cyrillic-500": "https://fonts.gstatic.com/s/onest/v8/gNMKW3F-SZuj7zOT0IfSjTS16c7Ooxxm-A.woff2",
    "onest-cyrillic-700": "https://fonts.gstatic.com/s/onest/v8/gNMKW3F-SZuj7zOT0IfSjTS16c7OAhxm-A.woff2",
    "onest-cyrillic-800": "https://fonts.gstatic.com/s/onest/v8/gNMKW3F-SZuj7zOT0IfSjTS16c7OMRxm-A.woff2",
    "onest-cyrillic-900": "https://fonts.gstatic.com/s/onest/v8/gNMKW3F-SZuj7zOT0IfSjTS16c7OMBxm-A.woff2",
}
os.makedirs("fonts/onest", exist_ok=True)
for name, url in fonts.items():
    path = f"fonts/onest/{name}.woff2"
    print(f"Downloading {name}...")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp, open(path, "wb") as f:
        f.write(resp.read())
    print(f"  -> {os.path.getsize(path)} bytes")
EOF
```

> **Note:** If the URLs above fail (Google rotates them), download manually from [fonts.google.com/specimen/Onest](https://fonts.google.com/specimen/Onest) → "Download family" → extract woff2 files into `fonts/onest/`.

- [ ] **Step 1.2: Download JetBrains Mono**

```bash
python3 << 'EOF'
import urllib.request, os

mono_fonts = {
    "jbmono-400": "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjOg.woff2",
    "jbmono-500": "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8-qxjOg.woff2",
    "jbmono-600": "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8FqtjOg.woff2",
}
os.makedirs("fonts/jetbrains-mono", exist_ok=True)
for name, url in mono_fonts.items():
    path = f"fonts/jetbrains-mono/{name}.woff2"
    print(f"Downloading {name}...")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp, open(path, "wb") as f:
        f.write(resp.read())
    print(f"  -> {os.path.getsize(path)} bytes")
EOF
```

> **Fallback:** Download from [fonts.google.com/specimen/JetBrains+Mono](https://fonts.google.com/specimen/JetBrains+Mono) if URLs fail.

- [ ] **Step 1.3: Verify files exist**

```bash
ls -lh fonts/onest/ fonts/jetbrains-mono/
```

Expected: 5 Onest files + 3 JetBrains Mono files, each 20-80 KB.

- [ ] **Step 1.4: Commit**

```bash
git add fonts/onest/ fonts/jetbrains-mono/
git commit -m "Добавить шрифты Onest и JetBrains Mono (self-host)"
```

---

## Task 2: Rewrite styles.css — новая дизайн-система

**Files:**
- Modify: `styles.css` (full rewrite)

The current styles.css (806 lines) uses old brand: Bebas Neue, Montserrat, dark bg #0a0a0a. Replace entirely.

- [ ] **Step 2.1: Replace styles.css**

Replace the entire content of `styles.css` with:

```css
/* ============================================================
   FONT FACES — Onest (self-hosted)
   ============================================================ */
@font-face {
  font-family: 'Onest';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(fonts/onest/onest-cyrillic-400.woff2) format('woff2');
}
@font-face {
  font-family: 'Onest';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url(fonts/onest/onest-cyrillic-500.woff2) format('woff2');
}
@font-face {
  font-family: 'Onest';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(fonts/onest/onest-cyrillic-700.woff2) format('woff2');
}
@font-face {
  font-family: 'Onest';
  font-style: normal;
  font-weight: 800;
  font-display: swap;
  src: url(fonts/onest/onest-cyrillic-800.woff2) format('woff2');
}
@font-face {
  font-family: 'Onest';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url(fonts/onest/onest-cyrillic-900.woff2) format('woff2');
}

/* ============================================================
   FONT FACES — JetBrains Mono (self-hosted)
   ============================================================ */
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(fonts/jetbrains-mono/jbmono-400.woff2) format('woff2');
}
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url(fonts/jetbrains-mono/jbmono-500.woff2) format('woff2');
}
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url(fonts/jetbrains-mono/jbmono-600.woff2) format('woff2');
}

/* ============================================================
   DESIGN TOKENS
   ============================================================ */
:root {
  --ink:      #0E0E0E;
  --paper:    #FAFAFA;
  --paper-2:  #EDE7DC;
  --line:     #E5E2DC;
  --muted:    #6B6B6B;
  --accent:   #FF4B1F;
  --accent-2: #2563EB;
  --sans:     'Onest', sans-serif;
  --mono:     'JetBrains Mono', monospace;

  --sidebar-w: 180px;
  --toc-w:     160px;
  --gap:       24px;
  --content-max: 680px;
}

/* ============================================================
   RESET + BASE
   ============================================================ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 16px; }

body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 14px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a { color: inherit; text-decoration: none; }

/* ============================================================
   SITE HEADER / TOP NAV
   ============================================================ */
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 48px;
  border-bottom: 1px solid var(--line);
  background: var(--paper);
  position: sticky;
  top: 0;
  z-index: 100;
}

.site-logo {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--sans);
  font-weight: 800;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  color: var(--ink);
}
.site-logo .mark {
  width: 14px;
  height: 14px;
  background: var(--accent);
  border-radius: 50%;
  flex-shrink: 0;
}

.site-nav {
  display: flex;
  gap: 20px;
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.site-nav a {
  color: var(--muted);
  padding-bottom: 3px;
  border-bottom: 2px solid transparent;
  transition: color 0.15s;
}
.site-nav a:hover { color: var(--ink); }
.site-nav a.active {
  color: var(--ink);
  border-bottom-color: var(--accent);
  font-weight: 700;
}

/* ============================================================
   THREE-COLUMN LAYOUT
   ============================================================ */
.layout {
  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr var(--toc-w);
  gap: var(--gap);
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 24px 80px;
  align-items: start;
}

/* ============================================================
   LEFT SIDEBAR — block navigation
   ============================================================ */
.sidebar {
  position: sticky;
  top: 72px;
  align-self: start;
}

.sidebar .section-label {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 500;
  margin-bottom: 4px;
}

.sidebar .section-title {
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-bottom: 14px;
  color: var(--ink);
}

.sidebar-nav a {
  display: block;
  padding: 5px 0 5px 10px;
  font-size: 11px;
  color: var(--muted);
  border-left: 1px solid var(--line);
  line-height: 1.4;
  transition: color 0.15s;
}
.sidebar-nav a:hover { color: var(--ink); }
.sidebar-nav a.active {
  color: var(--ink);
  border-left: 2px solid var(--accent);
  padding-left: 9px;
  font-weight: 600;
}
.sidebar-nav .num {
  font-family: var(--mono);
  font-size: 8px;
  color: var(--muted);
  margin-right: 6px;
  opacity: 0.6;
}
.sidebar-nav a.active .num {
  color: var(--accent);
  opacity: 1;
}

/* ============================================================
   CENTER — article content
   ============================================================ */
.article {
  min-width: 0;
}

.breadcrumbs {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 12px;
}
.breadcrumbs a { color: var(--accent); }
.breadcrumbs span { margin: 0 6px; }

.article-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.copy-page-btn {
  font-family: var(--mono);
  font-size: 9px;
  padding: 4px 8px;
  border: 1px solid var(--line);
  border-radius: 4px;
  color: var(--muted);
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  cursor: pointer;
  background: transparent;
}
.copy-page-btn:hover { border-color: var(--ink); color: var(--ink); }

.article h1 {
  font-family: var(--sans);
  font-weight: 800;
  font-size: 28px;
  line-height: 1.1;
  letter-spacing: -0.025em;
  margin: 0 0 16px;
}
.article h1 .accent { color: var(--accent); }

.article h2 {
  font-family: var(--sans);
  font-weight: 700;
  font-size: 16px;
  line-height: 1.2;
  letter-spacing: -0.015em;
  margin: 24px 0 10px;
}

.article h3 {
  font-family: var(--sans);
  font-weight: 700;
  font-size: 13px;
  margin: 18px 0 8px;
}

.article p {
  font-size: 13px;
  line-height: 1.65;
  color: #222;
  margin: 0 0 10px;
}

.marker {
  background: linear-gradient(180deg, transparent 55%, rgba(255,75,31,.28) 55%);
  padding: 0 1px;
}

/* ============================================================
   CALLOUTS
   ============================================================ */
.callout {
  padding: 12px 16px;
  margin: 14px 0;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.6;
}
.callout .callout-label {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 6px;
  display: block;
}
.callout p { margin: 0; font-size: 12px; color: var(--ink); line-height: 1.6; }

/* key — белый фон, оранжевая полоса */
.callout.key {
  background: #fff;
  border: 1px solid var(--line);
  border-left: 4px solid var(--accent);
  padding-left: 14px;
}
.callout.key .callout-label { color: var(--accent); }

/* analogy — кремовый */
.callout.analogy {
  background: var(--paper-2);
  border: 1px solid transparent;
}
.callout.analogy .callout-label { color: var(--muted); }

/* warn — кремовый, чёрная полоса */
.callout.warn {
  background: var(--paper-2);
  border-left: 4px solid var(--ink);
  padding-left: 14px;
}
.callout.warn .callout-label { color: var(--ink); }

/* ============================================================
   R.A.C.E.T. GRID
   ============================================================ */
.grid-cards {
  display: grid;
  gap: 6px;
  margin: 14px 0;
}
.grid-cards.cols-5 { grid-template-columns: repeat(5, 1fr); }
.grid-cards.cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cards.cols-2 { grid-template-columns: repeat(2, 1fr); }

.card {
  border: 1px solid var(--ink);
  padding: 10px 8px;
  text-align: center;
  background: #fff;
}
.card .card-letter {
  font-family: var(--sans);
  font-weight: 900;
  font-size: 28px;
  color: var(--accent);
  line-height: 1;
  margin-bottom: 4px;
}
.card .card-name {
  font-family: var(--sans);
  font-weight: 700;
  font-size: 9px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.card .card-desc {
  font-size: 9px;
  color: var(--muted);
  line-height: 1.35;
  margin-top: 3px;
}

/* ============================================================
   COMPARE (плохо/хорошо)
   ============================================================ */
.compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 14px 0;
}
.compare-col {
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.5;
}
.compare-col .compare-tag {
  font-family: var(--mono);
  font-size: 8px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 6px;
  display: block;
}
.compare-col.bad {
  background: #fff;
  border: 1px dashed var(--muted);
}
.compare-col.bad .compare-tag { color: var(--muted); }
.compare-col.good {
  background: #fff;
  border: 1px solid var(--line);
  border-left: 4px solid var(--accent);
}
.compare-col.good .compare-tag { color: var(--accent); }

/* ============================================================
   CODE / PROMPT BLOCK
   ============================================================ */
.code-block {
  background: var(--ink);
  border-radius: 4px;
  margin: 14px 0;
  overflow: hidden;
}
.code-block-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 12px;
  background: #1a1a1a;
}
.code-block-head .code-title {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #aaa;
}
.code-block-head .copy-btn {
  font-family: var(--mono);
  font-size: 8px;
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 2px 8px;
  border-radius: 3px;
  cursor: pointer;
  background: transparent;
}
.code-block-head .copy-btn:hover { background: rgba(255,75,31,.1); }
.code-block pre {
  margin: 0;
  padding: 12px;
  font-family: var(--mono);
  font-size: 11px;
  line-height: 1.55;
  color: #e0e0e0;
  white-space: pre-wrap;
  word-break: break-all;
}

/* ============================================================
   TABLE
   ============================================================ */
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin: 14px 0;
  font-size: 11px;
}
.data-table th {
  font-family: var(--mono);
  font-size: 8px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 500;
  text-align: left;
  padding: 7px 10px;
  border-bottom: 1px solid var(--ink);
}
.data-table td {
  padding: 7px 10px;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
  line-height: 1.5;
}
.data-table tr:last-child td { border-bottom: none; }

/* ============================================================
   PAGER
   ============================================================ */
.pager {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  margin-top: 24px;
  border-top: 1px solid var(--line);
  font-family: var(--sans);
  font-size: 11px;
}
.pager-prev, .pager-next {
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 4px;
  flex: 1;
  transition: border-color 0.15s;
}
.pager-prev:hover, .pager-next:hover { border-color: var(--ink); }
.pager-label {
  font-family: var(--mono);
  font-size: 8px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: block;
  margin-bottom: 3px;
}
.pager-title { font-weight: 700; }
.pager-next {
  text-align: right;
  border-color: var(--accent);
}
.pager-next:hover { border-color: var(--ink); }

/* ============================================================
   RIGHT TOC
   ============================================================ */
.toc {
  position: sticky;
  top: 72px;
  align-self: start;
}
.toc h4 {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 500;
  margin-bottom: 10px;
}
.toc a {
  display: block;
  padding: 3px 0;
  font-size: 10px;
  color: var(--muted);
  line-height: 1.45;
  transition: color 0.15s;
}
.toc a:hover { color: var(--ink); }
.toc a.active {
  color: var(--ink);
  font-weight: 600;
}
.toc a.active::before { content: '→ '; color: var(--accent); }

/* ============================================================
   INDEX PAGE — hub cards
   ============================================================ */
.hub-hero {
  padding: 64px 24px 48px;
  max-width: 800px;
  margin: 0 auto;
}
.hub-hero h1 {
  font-family: var(--sans);
  font-weight: 900;
  font-size: 48px;
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin-bottom: 16px;
}
.hub-hero h1 .accent { color: var(--accent); }
.hub-hero .lead {
  font-size: 16px;
  line-height: 1.6;
  color: var(--muted);
  max-width: 540px;
}

.hub-sections {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px 80px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.section-card {
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 20px;
  transition: border-color 0.15s;
}
.section-card:hover { border-color: var(--ink); }
.section-card .card-tag {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  font-weight: 700;
  margin-bottom: 8px;
}
.section-card h3 {
  font-family: var(--sans);
  font-weight: 800;
  font-size: 16px;
  letter-spacing: -0.02em;
  margin-bottom: 6px;
}
.section-card p {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.5;
  margin-bottom: 12px;
}
.section-card .card-cta {
  font-family: var(--mono);
  font-size: 9px;
  color: var(--ink);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
    padding: 16px;
  }
  .sidebar, .toc { display: none; }
  .site-nav { display: none; }
}

@media (max-width: 600px) {
  .hub-sections { grid-template-columns: 1fr; }
  .hub-hero h1 { font-size: 32px; }
  .compare { grid-template-columns: 1fr; }
  .grid-cards.cols-5 { grid-template-columns: repeat(3, 1fr); }
}
```

- [ ] **Step 2.2: Verify styles loaded**

Open any HTML file in browser. Since no content pages exist yet, open `index.html` in browser (file://). Check that the page doesn't error, CSS loads without 404s.

> For now `index.html` will look broken (old markup) — that's fine, CSS errors in console are what we're watching for.

- [ ] **Step 2.3: Commit**

```bash
git add styles.css
git commit -m "Переписать styles.css: новая дизайн-система (Onest, бренд, 3-колонки)"
```

---

## Task 3: Создать HTML-шаблон страницы статьи

**Files:**
- Create: `_template.html` (reference template, not deployed content)

This template is the copy-paste base for all `block-00/` pages. Create it once, copy for each page.

- [ ] **Step 3.1: Create `_template.html`**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TITLE — AI База</title>
  <meta name="description" content="DESCRIPTION">
  <meta property="og:title" content="TITLE — AI База">
  <meta property="og:description" content="DESCRIPTION">
  <meta property="og:type" content="article">
  <link rel="canonical" href="https://YOUR_DOMAIN/block-00/SLUG.html">
  <link rel="stylesheet" href="../styles.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "TITLE",
    "description": "DESCRIPTION",
    "author": {"@type": "Person", "name": "Никита Шлык"},
    "publisher": {"@type": "Organization", "name": "AI База"}
  }
  </script>
</head>
<body>

<header class="site-header">
  <a href="../index.html" class="site-logo">
    <span class="mark"></span>AI БАЗА
  </a>
  <nav class="site-nav">
    <a href="../block-00/01-intro.html" class="active">Для новичка</a>
    <a href="#">Claude Code</a>
    <a href="#">Контент-система</a>
  </nav>
</header>

<div class="layout">

  <!-- LEFT SIDEBAR -->
  <aside class="sidebar">
    <div class="section-label">Раздел</div>
    <div class="section-title">Для новичка</div>
    <nav class="sidebar-nav">
      <a href="01-intro.html"><span class="num">01</span>Зачем этот блок</a>
      <a href="02-ai-llm-neurons.html"><span class="num">02</span>AI, нейросети, LLM</a>
      <a href="03-claude-map.html"><span class="num">03</span>Карта Claude</a>
      <a href="04-chatgpt-vs-claude.html"><span class="num">04</span>ChatGPT vs Claude</a>
      <a href="05-prompting-racet.html"><span class="num">05</span>Промптинг и R.A.C.E.T.</a>
      <a href="06-prompt-techniques.html"><span class="num">06</span>Техники прокачки</a>
      <a href="07-glossary.html"><span class="num">07</span>Словарь терминов</a>
      <a href="08-common-mistakes.html"><span class="num">08</span>Типичные ошибки</a>
      <a href="09-first-day.html"><span class="num">09</span>Первый день</a>
      <a href="10-where-next.html"><span class="num">10</span>Куда идти дальше</a>
    </nav>
  </aside>

  <!-- CENTER ARTICLE -->
  <main class="article">
    <div class="breadcrumbs">
      <a href="../index.html">AI База</a>
      <span>/</span>
      <a href="01-intro.html">Для новичка</a>
      <span>/</span>
      PAGE TITLE
    </div>

    <div class="article-head">
      <h1>H1 TITLE</h1>
      <button class="copy-page-btn" onclick="copyPageUrl()">⧉ Copy link</button>
    </div>

    <!-- CONTENT HERE -->

    <div class="pager">
      <a class="pager-prev" href="PREV.html">
        <span class="pager-label">← Раньше</span>
        <span class="pager-title">PREV TITLE</span>
      </a>
      <a class="pager-next" href="NEXT.html">
        <span class="pager-label">Дальше →</span>
        <span class="pager-title">NEXT TITLE</span>
      </a>
    </div>
  </main>

  <!-- RIGHT TOC -->
  <aside class="toc">
    <h4>На этой странице</h4>
    <a href="#section-1" class="active">Первый раздел</a>
    <a href="#section-2">Второй раздел</a>
  </aside>

</div>

<script>
function copyPageUrl() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = document.querySelector('.copy-page-btn');
    const orig = btn.textContent;
    btn.textContent = '✓ Copied';
    setTimeout(() => btn.textContent = orig, 1500);
  });
}

// Highlight active TOC link on scroll
const tocLinks = document.querySelectorAll('.toc a');
const sections = document.querySelectorAll('h2[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 80) current = s.id;
  });
  tocLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
});
</script>

</body>
</html>
```

- [ ] **Step 3.2: Open template in browser**

Open `_template.html` in browser (file://) and verify:
- [x] Paper (#FAFAFA) background, not dark
- [x] Left sidebar shows 10 nav items
- [x] Three columns render (even though empty)
- [x] Logo shows "AI БАЗА" with orange dot

- [ ] **Step 3.3: Commit**

```bash
git add _template.html
git commit -m "Добавить HTML-шаблон для страниц статей"
```

---

## Task 4: block-00/01-intro.html

**Files:**
- Create: `block-00/01-intro.html`

- [ ] **Step 4.1: Create directory and file**

```bash
mkdir -p block-00
```

Create `block-00/01-intro.html` — copy `_template.html`, then fill in the content:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Зачем этот блок — AI База</title>
  <meta name="description" content="Коротко о том, что ты найдёшь в нулевом блоке и зачем он вообще нужен, если ты уже что-то знаешь про AI.">
  <link rel="stylesheet" href="../styles.css">
</head>
<body>

<header class="site-header">
  <a href="../index.html" class="site-logo"><span class="mark"></span>AI БАЗА</a>
  <nav class="site-nav">
    <a href="01-intro.html" class="active">Для новичка</a>
    <a href="#">Claude Code</a>
    <a href="#">Контент-система</a>
  </nav>
</header>

<div class="layout">

  <aside class="sidebar">
    <div class="section-label">Раздел</div>
    <div class="section-title">Для новичка</div>
    <nav class="sidebar-nav">
      <a href="01-intro.html" class="active"><span class="num">01</span>Зачем этот блок</a>
      <a href="02-ai-llm-neurons.html"><span class="num">02</span>AI, нейросети, LLM</a>
      <a href="03-claude-map.html"><span class="num">03</span>Карта Claude</a>
      <a href="04-chatgpt-vs-claude.html"><span class="num">04</span>ChatGPT vs Claude</a>
      <a href="05-prompting-racet.html"><span class="num">05</span>Промптинг и R.A.C.E.T.</a>
      <a href="06-prompt-techniques.html"><span class="num">06</span>Техники прокачки</a>
      <a href="07-glossary.html"><span class="num">07</span>Словарь терминов</a>
      <a href="08-common-mistakes.html"><span class="num">08</span>Типичные ошибки</a>
      <a href="09-first-day.html"><span class="num">09</span>Первый день</a>
      <a href="10-where-next.html"><span class="num">10</span>Куда идти дальше</a>
    </nav>
  </aside>

  <main class="article">
    <div class="breadcrumbs">
      <a href="../index.html">AI База</a> <span>/</span>
      <a href="01-intro.html">Для новичка</a> <span>/</span>
      Зачем этот блок
    </div>

    <div class="article-head">
      <h1>Зачем этот блок</h1>
      <button class="copy-page-btn" onclick="copyPageUrl()">⧉ Copy link</button>
    </div>

    <p>Этот курс построен исключительно на прикладных необходимых вещах. Я не люблю много размусоливать и занимать твоё время.</p>

    <p id="about">Нулевой блок — для тех, кто начинает с нуля. Если ты уже активный пользователь нейросетей — скорее всего, большую часть этого ты уже знаешь. Но я решил оставить этот блок, потому что всегда есть люди, которым нужна точка входа без лишнего шума.</p>

    <div class="callout key">
      <span class="callout-label">⚡ Главная идея блока</span>
      <p>Не нужно знать всё. Нужно понимать архитектуру. А дальше ты учишься ставить задачи AI-агенту, который помогает разбираться, делать и проверять.</p>
    </div>

    <h2 id="what-inside">Что внутри</h2>
    <p>Десять коротких страниц. Каждая закрывает один конкретный вопрос:</p>
    <p>Что такое AI, нейросети и LLM — и почему это не синонимы. Как устроен Claude, какие у него интерфейсы и тарифы. В чём реальная разница между ChatGPT и Claude. Как правильно формулировать задачи — формула R.A.C.E.T. Словарь терминов, которые встретятся в следующих блоках.</p>

    <div class="callout analogy">
      <span class="callout-label">Аналогия</span>
      <p>Это как инструкция к новому инструменту перед тем как начать им работать. Можно пропустить — но потом придётся возвращаться.</p>
    </div>

    <h2 id="who-for">Кому нужен, кому можно пропустить</h2>
    <p>Нужен, если ты только начинаешь или работал с ChatGPT, но Claude для тебя новый. Можно пропустить, если ты уже понимаешь разницу между LLM и нейросетью, работаешь с Projects в Claude и знаешь формулу R.A.C.E.T.</p>

    <div class="pager">
      <div class="pager-prev" style="visibility:hidden;"></div>
      <a class="pager-next" href="02-ai-llm-neurons.html">
        <span class="pager-label">Дальше →</span>
        <span class="pager-title">AI, нейросети, LLM</span>
      </a>
    </div>
  </main>

  <aside class="toc">
    <h4>На этой странице</h4>
    <a href="#about" class="active">О блоке</a>
    <a href="#what-inside">Что внутри</a>
    <a href="#who-for">Кому нужен</a>
  </aside>

</div>

<script>
function copyPageUrl() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = document.querySelector('.copy-page-btn');
    const orig = btn.textContent;
    btn.textContent = '✓ Copied';
    setTimeout(() => btn.textContent = orig, 1500);
  });
}
const tocLinks = document.querySelectorAll('.toc a');
const sections = document.querySelectorAll('[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 80) current = s.id; });
  tocLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
});
</script>
</body>
</html>
```

- [ ] **Step 4.2: Open in browser, verify**

Open `block-00/01-intro.html` in browser. Verify:
- [x] 3-column layout visible
- [x] "01 Зачем этот блок" is highlighted (orange) in left sidebar
- [x] Paper background, Onest font (or fallback sans if fonts not yet loaded)
- [x] Orange callout "Ключевая идея блока" has left border, white bg
- [x] Cream callout "Аналогия" has paper-2 bg
- [x] Pager shows only "Дальше →" (no prev on first page)

- [ ] **Step 4.3: Commit**

```bash
git add block-00/01-intro.html
git commit -m "Создать block-00/01-intro.html — Зачем этот блок"
```

---

## Task 5: block-00/02-ai-llm-neurons.html

**Files:** Create `block-00/02-ai-llm-neurons.html`

Content source: `_sources/base-00-user-draft.md` (раздел AI, нейросети, LLM)

- [ ] **Step 5.1: Create the file**

Create `block-00/02-ai-llm-neurons.html` using `_template.html` as base. Active nav item: `02`. Prev: `01-intro.html`, Next: `03-claude-map.html`.

Article content:

```html
    <div class="article-head">
      <h1>AI, нейросети и <span class="accent">LLM</span> — это не одно и то же</h1>
      <button class="copy-page-btn" onclick="copyPageUrl()">⧉ Copy link</button>
    </div>

    <p id="ai">AI (искусственный интеллект) — это широкое понятие. Любая программа, которая имитирует «умное» поведение. Сюда входит всё: шахматные движки, системы рекомендаций в Netflix, голосовые ассистенты, распознавание лиц — всё это AI.</p>

    <h2 id="neuron">Нейросеть — один инструмент внутри AI</h2>
    <p>Нейросеть — это конкретный математический подход, вдохновлённый строением мозга: много узлов, связи между ними, обучение на данных.</p>

    <div class="callout analogy">
      <span class="callout-label">Аналогия</span>
      <p>AI — это «транспорт» в целом. Нейросеть — это «двигатель внутреннего сгорания». Двигатель — один из видов транспортных технологий, но не весь транспорт.</p>
    </div>

    <p>На практике сейчас граница почти стёрлась, потому что большинство современных AI-продуктов — ChatGPT, Claude, Midjourney — построены именно на нейросетях. Поэтому люди часто используют эти слова как синонимы, и в бытовом разговоре это нормально. Но технически это не одно и то же.</p>

    <h2 id="llm">Что такое LLM</h2>
    <p>LLM — большая языковая модель. Нейросеть, которую обучили на огромном массиве текстов, кода и данных. Она <span class="marker">не думает</span> — она предсказывает, какой ответ ожидается на твой запрос.</p>
    <p>Представь помощника, который прочитал миллиарды страниц и теперь может ответить, сформулировать, разобрать задачу, написать код. Быстрый, но буквальный — что попросил, то и сделает.</p>

    <div class="callout key">
      <span class="callout-label">⚡ Ключевой факт</span>
      <p>AI не читает мысли. AI следует буквально. Качество результата = качество твоего запроса. Всё.</p>
    </div>

    <h2 id="what-ai-can">Что AI уже умеет в обычной работе</h2>
    <p>Самое полезное понимание для новичка: AI не нужен только «для текстов» и не нужен только «для программистов». Он помогает думать, разбирать, структурировать и ускорять повторяемые задачи.</p>
    <p>В тексте — напишет черновик, упростит объяснение, найдёт слабые места, сделает структуру урока, превратит хаотичные мысли в план. В анализе — прочитает документ, вытащит главное, сравнит варианты. В контенте — найдёт углы подачи, перепридумает хуки, разберёт трендовый ролик. В проектах — поможет писать код, делать страницы, чинить ошибки.</p>

    <div class="callout warn">
      <span class="callout-label">⚠ Что AI не делает за тебя</span>
      <p>Он не заменяет вкус, ответственность, проверку фактов, понимание аудитории и решение — зачем вообще нужна задача. AI усиливает человека, но не отменяет мышление.</p>
    </div>
```

TOC links: `#ai`, `#neuron`, `#llm`, `#what-ai-can`

- [ ] **Step 5.2: Open in browser**

Verify:
- [x] "02 AI, нейросети, LLM" active in sidebar
- [x] `<span class="accent">LLM</span>` in H1 renders orange
- [x] All three callout styles render correctly (key=white+orange, analogy=cream, warn=cream+black)
- [x] `<span class="marker">не думает</span>` has orange underline effect

- [ ] **Step 5.3: Commit**

```bash
git add block-00/02-ai-llm-neurons.html
git commit -m "Создать 02-ai-llm-neurons.html — AI, нейросети, LLM"
```

---

## Task 6: block-00/03-claude-map.html

**Files:** Create `block-00/03-claude-map.html`

- [ ] **Step 6.1: Create the file**

Active nav: `03`. Prev: `02-ai-llm-neurons.html`. Next: `04-chatgpt-vs-claude.html`.

Article content:

```html
    <div class="article-head">
      <h1>Карта <span class="accent">Claude</span></h1>
      <button class="copy-page-btn" onclick="copyPageUrl()">⧉ Copy link</button>
    </div>

    <p id="interfaces">Claude — это продукт компании Anthropic. Он существует в нескольких форматах: веб-интерфейс на claude.ai, мобильное приложение, API для разработчиков и Claude Code — инструмент для работы с кодом прямо в терминале.</p>

    <h2 id="plans">Тарифы: что реально нужно</h2>

    <table class="data-table">
      <thead>
        <tr><th>Тариф</th><th>Цена</th><th>Для кого</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Free</strong></td><td>0$</td><td>Попробовать. Лимиты на количество сообщений.</td></tr>
        <tr><td><strong>Pro</strong></td><td>$20/мес</td><td>Регулярная работа. Приоритет в пиковое время, больше токенов.</td></tr>
        <tr><td><strong>Max</strong></td><td>$100/мес</td><td>Интенсивная работа с кодом, большие контексты.</td></tr>
        <tr><td><strong>Team</strong></td><td>от $25/чел</td><td>Командное использование.</td></tr>
      </tbody>
    </table>

    <div class="callout key">
      <span class="callout-label">⚡ Что выбрать на старте</span>
      <p>Начни с Free — пойми, нужно ли тебе вообще. Если начнёшь использовать регулярно, переходи на Pro. Max нужен, если упрёшься в лимиты при работе с кодом.</p>
    </div>

    <h2 id="projects">Главная фича Claude — Projects</h2>
    <p>Project — это папка с контекстом. Ты один раз загружаешь туда всё про свой проект: кто ты, чем занимаешься, какая аудитория, примеры текста, правила работы. И каждый раз, когда открываешь этот Project, — Claude уже всё знает.</p>

    <div class="compare">
      <div class="compare-col bad">
        <span class="compare-tag">Без Projects</span>
        <div>Каждый новый чат начинаешь с объяснений. «А, мы же делали лендинг для психолога» — и ты снова всё объясняешь с нуля.</div>
      </div>
      <div class="compare-col good">
        <span class="compare-tag">С Projects</span>
        <div>Зашёл в Project «Мой бренд» — Claude уже знает кто ты, над чем работаете и какие правила. Объяснять не нужно.</div>
      </div>
    </div>

    <h2 id="models">Модели Claude</h2>
    <p>Anthropic регулярно выпускает новые версии. На момент написания актуальны:</p>

    <table class="data-table">
      <thead>
        <tr><th>Модель</th><th>Характеристика</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Claude Sonnet</strong></td><td>Баланс скорости и качества. Рабочая лошадка.</td></tr>
        <tr><td><strong>Claude Opus</strong></td><td>Самая мощная. Медленнее и дороже.</td></tr>
        <tr><td><strong>Claude Haiku</strong></td><td>Быстрая и дешёвая. Для простых задач.</td></tr>
      </tbody>
    </table>

    <div class="callout analogy">
      <span class="callout-label">Аналогия</span>
      <p>Sonnet — как обычный автомобиль. Opus — как спорткар: мощнее, но дороже и медленнее разгоняется. Haiku — как скутер: быстро доехать из А в Б.</p>
    </div>
```

TOC: `#interfaces`, `#plans`, `#projects`, `#models`

- [ ] **Step 6.2: Verify in browser** — table renders, compare columns work
- [ ] **Step 6.3: Commit**

```bash
git add block-00/03-claude-map.html
git commit -m "Создать 03-claude-map.html — Карта Claude"
```

---

## Task 7: block-00/04-chatgpt-vs-claude.html

**Files:** Create `block-00/04-chatgpt-vs-claude.html`

Content source: tables and comparison text from `_sources/base-00-user-draft.md`.

- [ ] **Step 7.1: Create the file**

Active nav: `04`. Prev: `03-claude-map.html`. Next: `05-prompting-racet.html`.

Article content:

```html
    <div class="article-head">
      <h1><span class="accent">ChatGPT</span> vs Claude — в чём реальная разница</h1>
      <button class="copy-page-btn" onclick="copyPageUrl()">⧉ Copy link</button>
    </div>

    <p id="surface">На базовом уровне ChatGPT и Claude делают примерно одно и то же: пишут код, анализируют документы, отвечают на вопросы. В большинстве повседневных задач разница почти не ощущается.</p>

    <p>Я долго сидел на ChatGPT и мне казалось, что Claude — это тот же чат, только от другой компании. Это не так. У них разная философия работы. Пока её не поймёшь — будешь недоиспользовать Claude <span class="marker">минимум на 80%.</span></p>

    <h2 id="philosophy">Главное различие: философия работы</h2>

    <div class="compare">
      <div class="compare-col bad">
        <span class="compare-tag">ChatGPT — это чаты</span>
        <div>Открыл, задал вопрос, получил ответ. Закрыл — забыл. Память есть, но она общая на весь аккаунт. Контекст проекта держишь в голове сам.</div>
      </div>
      <div class="compare-col good">
        <span class="compare-tag">Claude — это проекты</span>
        <div>Любая серьёзная задача — это отдельный Project со своим контекстом, файлами и инструкциями. Зашёл в нужный — Claude уже знает всё.</div>
      </div>
    </div>

    <div class="callout key">
      <span class="callout-label">⚡ Смена мышления</span>
      <p>Перестаёшь думать «сейчас задам вопрос AI». Начинаешь думать «работаю внутри проекта X — Claude уже в курсе». Это другая модель работы. И с неё вся польза от Claude начинается.</p>
    </div>

    <h2 id="strengths">Где каждый выигрывает</h2>

    <table class="data-table">
      <thead>
        <tr><th></th><th>ChatGPT</th><th>Claude</th></tr>
      </thead>
      <tbody>
        <tr><td>Разработчик</td><td>OpenAI</td><td>Anthropic</td></tr>
        <tr><td>Сильная сторона</td><td>Быстрые ответы, маркетплейс GPTs, картинки (DALL-E)</td><td>Длинные тексты, аккуратный код, большой контекст</td></tr>
        <tr><td>Маркетплейс</td><td>GPT Store — тысячи готовых агентов</td><td>Нет маркетплейса. Свой агент = свой Project</td></tr>
        <tr><td>Код</td><td>Хорош для быстрых скриптов</td><td>Для больших проектов — отдельный Claude Code</td></tr>
        <tr><td>Философия</td><td>Универсальный помощник</td><td>Вдумчивый эксперт</td></tr>
      </tbody>
    </table>

    <h2 id="how-think">Как мыслить о работе с каждым</h2>

    <table class="data-table">
      <thead>
        <tr><th></th><th>ChatGPT</th><th>Claude</th></tr>
      </thead>
      <tbody>
        <tr><td>Подход</td><td>Каждый разговор — новый запуск</td><td>Каждая задача — отдельный проект</td></tr>
        <tr><td>Контекст</td><td>В твоей голове или в настройках аккаунта</td><td>Внутри Project — для всех чатов этого проекта</td></tr>
        <tr><td>Файлы</td><td>Загружаешь в каждый чат заново</td><td>Один раз в Project — работает везде внутри</td></tr>
        <tr><td>Переключение</td><td>Вкладки в истории чатов</td><td>Разные Projects в меню слева</td></tr>
      </tbody>
    </table>

    <div class="callout analogy">
      <span class="callout-label">Как я использую оба</span>
      <p>Для работы с текстом и кодом я чаще открываю Claude. Для быстрых задач с готовыми ассистентами и генерации картинок — ChatGPT. На практике полезно использовать оба.</p>
    </div>
```

TOC: `#surface`, `#philosophy`, `#strengths`, `#how-think`

- [ ] **Step 7.2: Verify** — Two tables render, compare columns work
- [ ] **Step 7.3: Commit**

```bash
git add block-00/04-chatgpt-vs-claude.html
git commit -m "Создать 04-chatgpt-vs-claude.html — ChatGPT vs Claude"
```

---

## Task 8: block-00/05-prompting-racet.html

**Files:** Create `block-00/05-prompting-racet.html`

Content source: Nikita's draft + R.A.C.E.T. grid from final mockup v7.

- [ ] **Step 8.1: Create the file**

Active nav: `05`. Prev: `04-chatgpt-vs-claude.html`. Next: `06-prompt-techniques.html`.

Article content:

```html
    <div class="article-head">
      <h1>Промптинг и формула <span class="accent">R.A.C.E.T.</span></h1>
      <button class="copy-page-btn" onclick="copyPageUrl()">⧉ Copy link</button>
    </div>

    <p id="what">Промпт — это не заклинание. Это текст-команда, которую ты даёшь AI. Тема <span class="marker">заезженная</span>, но её нужно понимать. Чем точнее задача — тем меньше модель угадывает.</p>

    <div class="callout key">
      <span class="callout-label">⚡ Ключевой факт</span>
      <p>AI не читает мысли. AI следует буквально. Качество результата = качество твоего запроса.</p>
    </div>

    <h2 id="formula">5 элементов формулы</h2>

    <div class="grid-cards cols-5">
      <div class="card">
        <div class="card-letter">R</div>
        <div class="card-name">Role</div>
        <div class="card-desc">Кем выступает AI</div>
      </div>
      <div class="card">
        <div class="card-letter">A</div>
        <div class="card-name">Action</div>
        <div class="card-desc">Что сделать</div>
      </div>
      <div class="card">
        <div class="card-letter">C</div>
        <div class="card-name">Context</div>
        <div class="card-desc">Ситуация, данные</div>
      </div>
      <div class="card">
        <div class="card-letter">E</div>
        <div class="card-name">Expectation</div>
        <div class="card-desc">Каким будет результат</div>
      </div>
      <div class="card">
        <div class="card-letter">T</div>
        <div class="card-name">Tone</div>
        <div class="card-desc">Как звучит</div>
      </div>
    </div>

    <h2 id="template">Готовый шаблон</h2>

    <div class="code-block">
      <div class="code-block-head">
        <span class="code-title">▸ R.A.C.E.T. — базовый шаблон</span>
        <button class="copy-btn" onclick="copyCode(this)">⧉ Копировать</button>
      </div>
      <pre>Role: работай как [роль].
Action: сделай [конкретное действие].
Context: мой проект — [контекст], аудитория — [кто].
Expectation: формат — [формат], с примерами и проверкой.
Tone: пиши простым языком, без воды, как для новичка.</pre>
    </div>

    <h2 id="example">Плохо vs хорошо</h2>

    <div class="compare">
      <div class="compare-col bad">
        <span class="compare-tag">Плохой промпт</span>
        <div>Напиши продающий текст о курсе по фотографии.</div>
      </div>
      <div class="compare-col good">
        <span class="compare-tag">По R.A.C.E.T.</span>
        <div>Role: фотограф-преподаватель с 10-летним опытом. Action: напиши продающий пост для Instagram. Context: новички 25–35 лет, хотят научиться снимать на телефон. Expectation: 3 абзаца, с болью и оффером. Tone: живой, без клише.</div>
      </div>
    </div>

    <div class="callout analogy">
      <span class="callout-label">Аналогия</span>
      <p>Промпт — как рецепт для повара. Написал «торт» — получишь что попало. Написал «шоколадный торт с вишней, 3 слоя, без орехов» — шанс получить нужное сильно выше.</p>
    </div>

    <div class="callout warn">
      <span class="callout-label">⚠ Важно</span>
      <p>С каждым обновлением LLM-модели становятся умнее. Возможно, в будущем огромные промпты не нужны. Но сейчас — чем конкретнее, тем лучше.</p>
    </div>
```

Also add `copyCode` function in the `<script>` block:

```js
function copyCode(btn) {
  const pre = btn.closest('.code-block').querySelector('pre');
  navigator.clipboard.writeText(pre.textContent).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓ Скопировано';
    setTimeout(() => btn.textContent = orig, 1500);
  });
}
```

TOC: `#what`, `#formula`, `#template`, `#example`

- [ ] **Step 8.2: Verify** — R.A.C.E.T. grid (5 cards), code block, compare columns all render
- [ ] **Step 8.3: Commit**

```bash
git add block-00/05-prompting-racet.html
git commit -m "Создать 05-prompting-racet.html — Промптинг и R.A.C.E.T."
```

---

## Task 9: block-00/06-prompt-techniques.html

**Files:** Create `block-00/06-prompt-techniques.html`

Content source: `block-01.html` (existing) has prompting techniques — reuse in new voice.

- [ ] **Step 9.1: Create the file**

Active nav: `06`. Prev: `05-prompting-racet.html`. Next: `07-glossary.html`.

Article content:

```html
    <div class="article-head">
      <h1>Техники прокачки <span class="accent">промптов</span></h1>
      <button class="copy-page-btn" onclick="copyPageUrl()">⧉ Copy link</button>
    </div>

    <p id="basics">R.A.C.E.T. — это база. Но есть несколько техник, которые дают серьёзный прирост к качеству ответов. Разбираем самые полезные.</p>

    <h2 id="chain">Цепочка мышления (Chain of Thought)</h2>
    <p>Попроси AI думать вслух перед ответом. Это снижает количество ошибок на сложных задачах.</p>

    <div class="code-block">
      <div class="code-block-head">
        <span class="code-title">▸ Промпт</span>
        <button class="copy-btn" onclick="copyCode(this)">⧉ Копировать</button>
      </div>
      <pre>Перед ответом — подумай шаг за шагом. Объясни свою логику, потом дай финальный ответ.</pre>
    </div>

    <h2 id="examples">Примеры внутри промпта</h2>
    <p>Дай AI пример того, что хочешь получить. Один хороший пример стоит трёх абзацев объяснения.</p>

    <div class="code-block">
      <div class="code-block-head">
        <span class="code-title">▸ Промпт с примером</span>
        <button class="copy-btn" onclick="copyCode(this)">⧉ Копировать</button>
      </div>
      <pre>Напиши три хука для Reels. Стиль — как в этом примере:
«Вот почему 90% людей не могут выучить английский — и как я перестал быть одним из них»
Моя тема: продажи через контент.</pre>
    </div>

    <h2 id="persona">Задай роль через личность</h2>
    <p>Вместо «работай как маркетолог» — задай конкретную личность с опытом и точкой зрения. Ответ станет более живым.</p>

    <div class="code-block">
      <div class="code-block-head">
        <span class="code-title">▸ Промпт с личностью</span>
        <button class="copy-btn" onclick="copyCode(this)">⧉ Копировать</button>
      </div>
      <pre>Ты — директор по маркетингу в B2C-стартапе. 10 лет опыта. Привык говорить прямо и не любишь пустые слова. Проанализируй мой оффер и скажи, что не так.</pre>
    </div>

    <h2 id="iterate">Итерация вместо одного запроса</h2>
    <p>Не жди идеального ответа с первого раза. Попроси улучшить конкретный элемент. «Сделай хук агрессивнее». «Укороти вдвое». «Добавь конкретный пример».</p>

    <div class="callout key">
      <span class="callout-label">⚡ Главный принцип</span>
      <p>Работа с AI — это диалог, не одиночный запрос. Лучшие результаты получаются через 2–4 итерации, а не из одного «магического» промпта.</p>
    </div>

    <h2 id="constraints">Ограничения работают лучше запросов</h2>
    <p>Сказать «не используй клише» эффективнее, чем «пиши оригинально». Ограничения задают конкретный фильтр.</p>

    <div class="callout analogy">
      <span class="callout-label">Аналогия</span>
      <p>Редактор говорит не «пиши хорошо», а «убери все слова "уникальный", "инновационный" и "экосистема"». Второй вариант работает.</p>
    </div>
```

TOC: `#basics`, `#chain`, `#examples`, `#persona`, `#iterate`, `#constraints`

- [ ] **Step 9.2: Verify** — code blocks render correctly, copy buttons present
- [ ] **Step 9.3: Commit**

```bash
git add block-00/06-prompt-techniques.html
git commit -m "Создать 06-prompt-techniques.html — Техники прокачки промптов"
```

---

## Task 10: block-00/07-glossary.html

**Files:** Create `block-00/07-glossary.html`

Content source: full glossary from `_sources/base-00-user-draft.md` (два словаря — объединить, убрать дубли).

- [ ] **Step 10.1: Create the file**

Active nav: `07`. Prev: `06-prompt-techniques.html`. Next: `08-common-mistakes.html`.

The glossary renders as a definition list with `.callout.analogy` for each analogy. Use a clean layout: term as `h3`, definition as `p`, analogy as callout.

Article content (first 8 terms — full list in source file, all 20 terms must be included):

```html
    <div class="article-head">
      <h1>Словарь <span class="accent">терминов</span></h1>
      <button class="copy-page-btn" onclick="copyPageUrl()">⧉ Copy link</button>
    </div>

    <p id="intro">Термины, которые встретятся в следующих блоках. Здесь — простыми словами, с аналогиями.</p>

    <h2 id="ai-terms">AI и модели</h2>

    <h3>LLM</h3>
    <p>Большая языковая модель. Claude, ChatGPT, Gemini — это LLM. Особенно хорошо работает с текстом, смыслом, инструкциями, кодом и объяснениями.</p>
    <div class="callout analogy"><span class="callout-label">Аналогия</span><p>Как очень начитанный собеседник, который прочёл миллионы книг и может поддержать любую тему.</p></div>

    <h3>Промпт</h3>
    <p>Текст-команда, которую ты пишешь AI. Главный инструмент получения нужного результата.</p>
    <div class="callout analogy"><span class="callout-label">Аналогия</span><p>Как рецепт для повара: написал «торт» — получишь что попало. Написал «шоколадный торт с вишней, 3 слоя» — получишь именно это.</p></div>

    <h3>Токен</h3>
    <p>Единица обработки текста AI. Ориентир — 1 слово ≈ 1–2 токена. За токены платят деньги.</p>
    <div class="callout analogy"><span class="callout-label">Аналогия</span><p>Как минуты на телефоне: чем дольше говоришь — тем больше тратишь.</p></div>

    <h3>R.A.C.E.T.</h3>
    <p>Формула промпта: Role, Action, Context, Expectation, Tone.</p>

    <h3>Агент (AI-агент)</h3>
    <p>AI, который сам выполняет задачи: ищет информацию, пишет код, отвечает на вопросы. Делает цепочку шагов сам.</p>
    <div class="callout analogy"><span class="callout-label">Аналогия</span><p>Как личный помощник, который работает без перерывов и не забывает задачи.</p></div>

    <h2 id="dev-terms">Разработка и инфраструктура</h2>

    <h3>Скилл</h3>
    <p>Готовая инструкция на конкретную задачу. Вызывается через /команду внутри Claude Code.</p>

    <h3>MCP</h3>
    <p>Model Context Protocol — способ подключать к Claude внешние инструменты: браузер, файловую систему, базы данных.</p>

    <h3>CLAUDE.md</h3>
    <p>Файл правил проекта. Claude читает его при каждом запуске сессии — там лежит контекст, правила и инструкции.</p>

    <h3>Git / Commit</h3>
    <p>Сохранение версии кода. Как чекпоинт в видеоигре.</p>
    <div class="callout analogy"><span class="callout-label">Аналогия</span><p>Машина времени для файлов: сохранил 100 версий, можно вернуться к любой.</p></div>

    <h3>Push</h3>
    <p>Отправка сохранений в облако (GitHub). Защита от поломки компьютера.</p>

    <h3>Деплой</h3>
    <p>Когда выкладываешь свой сайт в интернет — его может увидеть любой человек.</p>
    <div class="callout analogy"><span class="callout-label">Аналогия</span><p>Как открытие магазина: вывеска повешена, двери открыты — заходите.</p></div>

    <h2 id="web-terms">Веб</h2>

    <h3>Фронтенд</h3>
    <p>Всё, что видит пользователь: кнопки, тексты, картинки, цвета.</p>
    <div class="callout analogy"><span class="callout-label">Аналогия</span><p>Витрина магазина — красивая, привлекает покупателей.</p></div>

    <h3>Бэкенд</h3>
    <p>Скрытая часть сайта: где хранятся данные, проверяются пароли, считаются заказы.</p>
    <div class="callout analogy"><span class="callout-label">Аналогия</span><p>Кухня ресторана и склад — посетители не видят, но без них ничего не работает.</p></div>

    <h3>API</h3>
    <p>Способ, которым программы разговаривают друг с другом и передают данные.</p>
    <div class="callout analogy"><span class="callout-label">Аналогия</span><p>Официант в ресторане: берёт твой заказ, несёт на кухню, приносит блюдо.</p></div>

    <h3>MVP</h3>
    <p>Минимальная рабочая версия продукта. Сначала самокат, потом машина.</p>

    <h3>Вайбкодинг</h3>
    <p>Ты говоришь AI, что хочешь — он пишет код за тебя. Никакого программирования руками.</p>
    <div class="callout analogy"><span class="callout-label">Аналогия</span><p>Как заказать еду в ресторане: говоришь официанту что хочешь, а повар готовит.</p></div>

    <h3>Хостинг</h3>
    <p>Компьютер в интернете, на котором живёт твой сайт 24/7.</p>
    <div class="callout analogy"><span class="callout-label">Аналогия</span><p>Аренда квартиры для сайта: платишь за место, сайт там «живёт».</p></div>

    <h3>Домен</h3>
    <p>Имя твоего сайта, которое люди вводят в браузере. Например: mybrand.ru.</p>

    <h3>Парсинг</h3>
    <p>Робот заходит на сайты и собирает нужную информацию автоматически.</p>
    <div class="callout analogy"><span class="callout-label">Аналогия</span><p>Помощник, который обходит 50 магазинов и записывает все цены в табличку за тебя.</p></div>

    <h3>Фреймворк</h3>
    <p>Набор готовых инструментов, чтобы не писать всё с нуля. Next.js, React, Vue — это фреймворки.</p>
    <div class="callout analogy"><span class="callout-label">Аналогия</span><p>Готовый каркас дома: стены уже стоят, тебе остаётся сделать ремонт и расставить мебель.</p></div>
```

TOC: `#intro`, `#ai-terms`, `#dev-terms`, `#web-terms`

- [ ] **Step 10.2: Verify** — all callouts render, long page scrolls correctly
- [ ] **Step 10.3: Commit**

```bash
git add block-00/07-glossary.html
git commit -m "Создать 07-glossary.html — Словарь терминов"
```

---

## Task 11: Pages 08, 09, 10

**Files:** Create `block-00/08-common-mistakes.html`, `09-first-day.html`, `10-where-next.html`

These three pages share the same structure as above. Create each using the template.

- [ ] **Step 11.1: Create 08-common-mistakes.html**

Active nav: `08`. Prev: `07-glossary.html`. Next: `09-first-day.html`.
Title: `Типичные ошибки новичков`

Content — 5 common mistakes, each as `h3` + `p` + `.callout.warn` with the fix:

```html
    <div class="article-head">
      <h1>Типичные ошибки <span class="accent">новичков</span></h1>
      <button class="copy-page-btn" onclick="copyPageUrl()">⧉ Copy link</button>
    </div>

    <p id="intro">Собрал самые частые — те, которые сам проходил или видел у других. Большинство лечится одним правилом.</p>

    <h2 id="mistakes">Ошибки</h2>

    <h3 id="vague">«Сделай красиво»</h3>
    <p>Расплывчатый запрос даёт расплывчатый результат. AI берёт самый усреднённый вариант из обучающих данных.</p>
    <div class="callout warn"><span class="callout-label">Как чинить</span><p>Добавляй конкретику: формат, аудитория, длина, тон, что нельзя использовать.</p></div>

    <h3 id="first-reply">Принять первый ответ как финальный</h3>
    <p>Первый ответ — черновик, не финал. AI не знает, что именно тебе нужно, пока ты не скажешь что не так.</p>
    <div class="callout warn"><span class="callout-label">Как чинить</span><p>Давай конкретный фидбэк: «сделай агрессивнее», «укороти вдвое», «добавь пример из жизни».</p></div>

    <h3 id="no-context">Каждый раз объяснять всё с нуля</h3>
    <p>Если ты объясняешь один и тот же проект в каждом новом чате — ты теряешь время. Это решается за 10 минут.</p>
    <div class="callout warn"><span class="callout-label">Как чинить</span><p>Создай Project в Claude и один раз загрузи туда контекст проекта, правила и примеры. Всё — больше не нужно объяснять.</p></div>

    <h3 id="trust">Доверять ответу без проверки</h3>
    <p>AI уверенно пишет неправильные факты, выдуманные цитаты, устаревшие данные. Уверенность в голосе — не признак правоты.</p>
    <div class="callout warn"><span class="callout-label">Как чинить</span><p>Всё, что касается фактов, статистики, дат, имён — проверяй вручную. AI — не энциклопедия.</p></div>

    <h3 id="overcomplicate">Пытаться написать «идеальный» промпт</h3>
    <p>Новички часто тратят час на составление промпта вместо того, чтобы за 5 минут написать нормальный и потом итерировать.</p>
    <div class="callout warn"><span class="callout-label">Как чинить</span><p>Начни с простого запроса. Посмотри что получилось. Скажи что не так. Повтори 2–3 раза. Это быстрее.</p></div>
```

TOC: `#intro`, `#mistakes`, `#vague`, `#first-reply`, `#no-context`, `#trust`, `#overcomplicate`

- [ ] **Step 11.2: Create 09-first-day.html**

Active nav: `09`. Prev: `08-common-mistakes.html`. Next: `10-where-next.html`.
Title: `Что сделать в первый день`

Content — a practical checklist of 7 actions to do on day one:

```html
    <div class="article-head">
      <h1>Что сделать в <span class="accent">первый день</span></h1>
      <button class="copy-page-btn" onclick="copyPageUrl()">⧉ Copy link</button>
    </div>

    <p id="intro">Конкретный список без лишних слов. Выполни всё — и у тебя будет рабочая настройка, а не просто аккаунт.</p>

    <h2 id="checklist">Чек-лист первого дня</h2>

    <h3>1. Зарегистрируйся на claude.ai</h3>
    <p>Если ты из России — нужен VPN и иностранный номер. Подойдут Outline, Mullvad или любой другой VPN. Для номера — sms-activate.org или 5sim.net.</p>

    <h3>2. Выбери тариф</h3>
    <p>Начни с Free. Если почувствуешь лимиты — переходи на Pro ($20/мес). Max нужен только при интенсивной работе с кодом.</p>

    <h3>3. Создай первый Project</h3>
    <p>Назови по задаче, которую решаешь чаще всего: «Контент», «Мой бизнес», «Клиент Х». Напиши в Project Instructions 3–5 предложений: кто ты, чем занимаешься, что важно. Это всё.</p>

    <div class="callout key">
      <span class="callout-label">⚡ Главный шаг</span>
      <p>Project с инструкциями — это базовая настройка. Без неё ты каждый раз объясняешь контекст заново.</p>
    </div>

    <h3>4. Сделай тестовый запрос по R.A.C.E.T.</h3>
    <p>Возьми реальную задачу из своей работы. Сформулируй по формуле из прошлого блока. Посмотри на разницу с обычным запросом.</p>

    <h3>5. Подключи Google Drive (опционально)</h3>
    <p>В настройках Claude можно подключить Google Drive и Gmail. Тогда Claude может читать твои документы напрямую. Не обязательно, но удобно.</p>

    <h3>6. Попробуй итерацию</h3>
    <p>Возьми любой ответ Claude. Скажи что не так. Попроси переделать конкретный элемент. Убедись, что AI работает в диалоге, а не в режиме «одного запроса».</p>

    <h3>7. Сохрани эту страницу в закладки</h3>
    <p>База знаний пополняется. Следующие блоки — про Claude Code, контент-систему и практические кейсы. Возвращайся.</p>

    <div class="callout analogy">
      <span class="callout-label">Итого</span>
      <p>Аккаунт + Project + первый запрос по R.A.C.E.T. — это всё, что нужно для старта. Остальное придёт в процессе.</p>
    </div>
```

TOC: `#intro`, `#checklist`

- [ ] **Step 11.3: Create 10-where-next.html**

Active nav: `10`. Prev: `09-first-day.html`. No next (last in block).
Title: `Куда идти дальше`

```html
    <div class="article-head">
      <h1>Куда идти <span class="accent">дальше</span></h1>
      <button class="copy-page-btn" onclick="copyPageUrl()">⧉ Copy link</button>
    </div>

    <p id="done">Ты прошёл нулевой блок. Теперь у тебя есть базовая картина: что такое AI, как устроен Claude, как формулировать задачи и что делать с результатами.</p>

    <h2 id="next-blocks">Следующие блоки</h2>

    <table class="data-table">
      <thead><tr><th>Блок</th><th>Что внутри</th><th>Для кого</th></tr></thead>
      <tbody>
        <tr>
          <td><strong>Claude Code</strong></td>
          <td>VS Code, первый проект, скиллы, MCP, деплой</td>
          <td>Кто хочет делать сайты и инструменты руками AI</td>
        </tr>
        <tr>
          <td><strong>Контент-система</strong></td>
          <td>Хуки, сценарии для Reels, контент-план через AI</td>
          <td>Кто ведёт соцсети и хочет ускорить производство контента</td>
        </tr>
      </tbody>
    </table>

    <div class="callout key">
      <span class="callout-label">⚡ Рекомендация</span>
      <p>Если ты хочешь делать сайты и инструменты — иди в Claude Code. Если главная задача — контент и аудитория — иди в Контент-систему. Оба блока независимы.</p>
    </div>

    <h2 id="mindset">Главная мысль</h2>
    <p>Понимать архитектуру важнее, чем знать каждую команду. AI-инструменты меняются каждые несколько месяцев. Меняться вместе с ними проще, если понимаешь принципы, а не только кнопки.</p>

    <div class="callout analogy">
      <span class="callout-label">Финальная аналогия</span>
      <p>Водитель, который понимает как работает машина, справится с любой моделью. Тот, кто запомнил только одну кнопку — потеряется на другом автомобиле.</p>
    </div>

    <div class="pager">
      <a class="pager-prev" href="09-first-day.html">
        <span class="pager-label">← Раньше</span>
        <span class="pager-title">Первый день</span>
      </a>
      <div class="pager-next" style="visibility:hidden;"></div>
    </div>
```

TOC: `#done`, `#next-blocks`, `#mindset`

- [ ] **Step 11.4: Verify all three pages in browser**
- [ ] **Step 11.5: Commit all three**

```bash
git add block-00/08-common-mistakes.html block-00/09-first-day.html block-00/10-where-next.html
git commit -m "Создать страницы 08-10: ошибки, первый день, куда идти дальше"
```

---

## Task 12: Rebuild index.html — хаб-страница

**Files:** Modify `index.html` (full rewrite)

- [ ] **Step 12.1: Rewrite index.html**

Replace entire content of `index.html` with:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI База — практические знания по AI и вайбкодингу</title>
  <meta name="description" content="База знаний по AI, Claude и вайбкодингу. Для новичков и практиков — от основ до Claude Code и контент-системы.">
  <meta property="og:title" content="AI База — практические знания по AI">
  <meta property="og:description" content="База знаний по AI, Claude и вайбкодингу. От основ до Claude Code.">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="styles.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AI База",
    "description": "База знаний по AI, Claude и вайбкодингу",
    "author": {"@type": "Person", "name": "Никита Шлык"}
  }
  </script>
</head>
<body>

<header class="site-header">
  <a href="index.html" class="site-logo"><span class="mark"></span>AI БАЗА</a>
  <nav class="site-nav">
    <a href="block-00/01-intro.html">Для новичка</a>
    <a href="#">Claude Code</a>
    <a href="#">Контент-система</a>
  </nav>
</header>

<section class="hub-hero">
  <h1>Собери свою<br><span class="accent">AI-систему</span></h1>
  <p class="lead">Практическая база знаний по AI, Claude и вайбкодингу. Без воды — только то, что реально работает.</p>
</section>

<div class="hub-sections">

  <a class="section-card" href="block-00/01-intro.html">
    <div class="card-tag">Блок 01</div>
    <h3>Для новичка</h3>
    <p>AI, нейросети, LLM, ChatGPT vs Claude, промптинг, R.A.C.E.T., словарь. Точка входа без лишнего шума.</p>
    <span class="card-cta">Читать →</span>
  </a>

  <a class="section-card" href="#" style="opacity:.5; pointer-events:none;">
    <div class="card-tag">Блок 02 · Скоро</div>
    <h3>Claude Code</h3>
    <p>VS Code + Claude Code, первый проект, скиллы, MCP, деплой. Для тех, кто хочет делать сайты руками AI.</p>
    <span class="card-cta">Скоро →</span>
  </a>

  <a class="section-card" href="#" style="opacity:.5; pointer-events:none;">
    <div class="card-tag">Блок 03 · Скоро</div>
    <h3>Контент-система</h3>
    <p>Хуки, сценарии для Reels, контент-план через AI. Для тех, кто ведёт соцсети и хочет ускориться.</p>
    <span class="card-cta">Скоро →</span>
  </a>

</div>

</body>
</html>
```

- [ ] **Step 12.2: Verify in browser**

Open `index.html`. Verify:
- [x] Hero section with large H1, orange "AI-систему"
- [x] 3 section cards in 2-column grid
- [x] "Для новичка" card is clickable, leads to block-00/01-intro.html
- [x] Other cards appear disabled (opacity 0.5)

- [ ] **Step 12.3: Commit**

```bash
git add index.html
git commit -m "Пересобрать index.html: хаб-страница с разделами"
```

---

## Task 13: SEO — sitemap.xml и llms.txt

**Files:**
- Create: `sitemap.xml`
- Create: `llms.txt`

- [ ] **Step 13.1: Create sitemap.xml**

Replace `YOUR_DOMAIN` with the actual Vercel URL once known (or `baza-zaniy.vercel.app`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://baza-zaniy.vercel.app/</loc><priority>1.0</priority></url>
  <url><loc>https://baza-zaniy.vercel.app/block-00/01-intro.html</loc><priority>0.8</priority></url>
  <url><loc>https://baza-zaniy.vercel.app/block-00/02-ai-llm-neurons.html</loc><priority>0.8</priority></url>
  <url><loc>https://baza-zaniy.vercel.app/block-00/03-claude-map.html</loc><priority>0.8</priority></url>
  <url><loc>https://baza-zaniy.vercel.app/block-00/04-chatgpt-vs-claude.html</loc><priority>0.8</priority></url>
  <url><loc>https://baza-zaniy.vercel.app/block-00/05-prompting-racet.html</loc><priority>0.8</priority></url>
  <url><loc>https://baza-zaniy.vercel.app/block-00/06-prompt-techniques.html</loc><priority>0.8</priority></url>
  <url><loc>https://baza-zaniy.vercel.app/block-00/07-glossary.html</loc><priority>0.8</priority></url>
  <url><loc>https://baza-zaniy.vercel.app/block-00/08-common-mistakes.html</loc><priority>0.8</priority></url>
  <url><loc>https://baza-zaniy.vercel.app/block-00/09-first-day.html</loc><priority>0.8</priority></url>
  <url><loc>https://baza-zaniy.vercel.app/block-00/10-where-next.html</loc><priority>0.8</priority></url>
</urlset>
```

- [ ] **Step 13.2: Create llms.txt**

```
# AI База — База знаний по AI, Claude и вайбкодингу

> Практические знания по AI для новичков и практиков.

## Разделы

- [Для новичка](https://baza-zaniy.vercel.app/block-00/01-intro.html): AI, нейросети, LLM, ChatGPT vs Claude, промптинг, R.A.C.E.T.
- Claude Code (скоро): VS Code, первый проект, скиллы, MCP, деплой
- Контент-система (скоро): хуки, сценарии для Reels, контент-план

## Автор

Никита Шлык — предприниматель, занимается вайбкодингом и AI-системами.
```

- [ ] **Step 13.3: Commit**

```bash
git add sitemap.xml llms.txt
git commit -m "Добавить sitemap.xml и llms.txt"
```

---

## Task 14: Vercel — настройка деплоя

**Files:** Create `vercel.json`

- [ ] **Step 14.1: Create vercel.json**

```json
{
  "headers": [
    {
      "source": "/fonts/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)\\.css",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=86400" }
      ]
    },
    {
      "source": "/(.*)\\.html",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=3600" }
      ]
    }
  ]
}
```

- [ ] **Step 14.2: Push to GitHub**

```bash
git add vercel.json
git commit -m "Добавить vercel.json: кэш для шрифтов и статики"
git push origin main
```

- [ ] **Step 14.3: Connect to Vercel**

In Vercel dashboard (vercel.com):
1. Click "Add New Project"
2. Import from GitHub: `FloochRipper/baza-zaniy`
3. Framework Preset: **Other** (not Next.js)
4. Root Directory: `/` (default)
5. No build command needed
6. Click Deploy

- [ ] **Step 14.4: Verify deployment**

After deploy, open the Vercel URL and verify:
- [x] `index.html` loads with correct brand
- [x] Navigation to `block-00/01-intro.html` works
- [x] Fonts load (Onest visible — not fallback sans-serif)
- [x] Mobile: sidebar and TOC hidden, single column

---

## Task 15: Rewrite scripts.js

**Files:** Modify `scripts.js`

Current `scripts.js` has old accordion logic and dark theme code. Replace with the minimal copy-to-clipboard functions that all pages now inline. Keep it as a fallback global script.

- [ ] **Step 15.1: Replace scripts.js**

```javascript
// Global copy utilities — also defined inline per-page for reliability
function copyPageUrl() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = document.querySelector('.copy-page-btn');
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = '✓ Copied';
    setTimeout(() => btn.textContent = orig, 1500);
  });
}

function copyCode(btn) {
  const pre = btn.closest('.code-block').querySelector('pre');
  navigator.clipboard.writeText(pre.textContent.trim()).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓ Скопировано';
    setTimeout(() => btn.textContent = orig, 1500);
  });
}

// Active TOC highlighting
document.addEventListener('DOMContentLoaded', () => {
  const tocLinks = document.querySelectorAll('.toc a');
  const headings = document.querySelectorAll('h2[id], h3[id]');
  if (!tocLinks.length || !headings.length) return;

  window.addEventListener('scroll', () => {
    let current = '';
    headings.forEach(h => {
      if (window.scrollY >= h.offsetTop - 90) current = h.id;
    });
    tocLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  });
});
```

- [ ] **Step 15.2: Commit**

```bash
git add scripts.js
git commit -m "Упростить scripts.js: только copy-to-clipboard и TOC highlight"
git push origin main
```

---

## Self-Review

**Spec coverage check:**
- ✅ 3-column layout (Task 3 template + Task 2 CSS)
- ✅ Brand: Onest + JetBrains Mono, Paper/Ink/Accent (Tasks 1-2)
- ✅ 10 content pages with real content from source (Tasks 4-11)
- ✅ Index.html hub (Task 12)
- ✅ SEO: sitemap, llms.txt (Task 13). Note: JSON-LD per page is in the template (Task 3), needs to be filled per page during Task 4-11 execution.
- ✅ Vercel deployment (Task 14)
- ✅ scripts.js cleanup (Task 15)
- ✅ Fonts self-hosted (Task 1)

**Placeholder check:**
- Task 13 sitemap uses `baza-zaniy.vercel.app` — update once actual Vercel URL is known
- JSON-LD in template has placeholders (TITLE, DESCRIPTION) — must be filled in each content page during Tasks 4-11
- `YOUR_DOMAIN` in canonical links — fill after Task 14

**Type consistency:** No type system (HTML project). CSS class names consistent throughout: `.callout.key`, `.callout.analogy`, `.callout.warn`, `.code-block`, `.data-table`, `.compare`, `.grid-cards`, `.pager` — used consistently.
