---
title: "CSS — Architecture & Class Reference"
date: 2026-04-15
description: "CSS file structure, theme variables, and full class reference for maks.top"
page_lang: "en"
lang_pair: "/docs/ru/css/"
tags: ["docs"]
---

## CSS architecture

Styles are split into 8 files by **scope** (area of application):

| File | Loaded | Purpose |
|---|---|---|
| `global.css` | everywhere | Variables, nav, base components, dot-grid pagination |
| `mobile.css` | everywhere | Mobile nav, breakpoints |
| `fonts.css` | everywhere | `@font-face` for JetBrains Mono and Unbounded |
| `prose.css` | posts, about, kb, docs | Article typography, NS cards/tabs/ref-panel, section divider |
| `home.css` | `/` only | Hero, recent posts, KB grid, cert-grid |
| `cert.css` | `/certs/*` | Cert hero, resource tiles, accordion topics |
| `quiz.css` | `/ccna-quiz/*` | Quiz cards, option states, scoring badges |
| `ns.css` | `/posts/linux-namespaces/` | Two-column page layout, TOC sidebar, progress, filter row |
| `chroma.css` | everywhere | Syntax highlighting (Dracula dark / GitHub light) |

Loading in `baseof.html`:
```html
<link rel="stylesheet" href="/styles/fonts.css">    <!-- always -->
<link rel="stylesheet" href="/styles/global.css">   <!-- always -->
<link rel="stylesheet" href="/styles/chroma.css">   <!-- always -->
{{ if .IsHome }}<link href="/styles/home.css">{{ end }}
{{ if or (eq .Type "posts") (eq .Type "about") (eq .Type "docs") (eq .Type "kb") }}
  <link href="/styles/prose.css">{{ end }}
<link rel="stylesheet" href="/styles/mobile.css">   <!-- always -->
{{ block "head" . }}{{ end }}  <!-- cert.css / quiz.css / ns.css added here -->
```

---

## CSS variables — themes

Variables are declared on `[data-theme="dark"]` and `[data-theme="light"]`:

| Variable | Dark | Light | Purpose |
|---|---|---|---|
| `--accent` | `#00d4ff` | `#00d4ff` | Primary accent (cyan) |
| `--accent2` | `#7c3aed` | `#7c3aed` | Secondary accent (purple) |
| `--accent3` | `#10b981` | `#10b981` | Third accent (green) |
| `--warn` | `#f59e0b` | `#f59e0b` | Warning (amber) |
| `--bg` | `#0a0e17` | `#f5f7fa` | Main background |
| `--bg2` | `#111827` | `#ffffff` | Cards, panels |
| `--bg3` | `#1a2235` | `#eef2f8` | Hover states |
| `--border` | `#1e2d45` | `#d1dbe8` | Borders |
| `--text` | `#e2e8f0` | `#1a2235` | Primary text |
| `--text2` | `#94a3b8` | `#475569` | Secondary text |
| `--text3` | `#64748b` | `#94a3b8` | Muted text (date, meta) |
| `--glow` | `rgba(0,212,255,0.08)` | `rgba(0,150,180,0.08)` | Hover highlight |
| `--tag-bg` | `rgba(0,212,255,0.08)` | `rgba(0,150,180,0.08)` | Tag background |

**Per-component variables** (set via inline `style=""`):
| Variable | Used by | Description |
|---|---|---|
| `--c` | NS cards, map buttons, tabs, filter buttons | Per-card accent color |
| `--cert-color` | Cert hero, resource tiles | Per-cert accent color |

---

## global.css — class reference

### Reset and base styles

| Class / Selector | Description |
|---|---|
| `*, *::before, *::after` | `box-sizing: border-box`, margin/padding reset |
| `body` | `background: var(--bg)`, `color: var(--text)`, system font |
| `a` | `color: inherit`, `text-decoration: none` |

### Navigation (desktop)

| Class | Description |
|---|---|
| `.desk-nav` | Flex container: logo + links + right panel. Sticky, `z-index: 100` |
| `.nav-logo` | Logo with gradient text |
| `.nav-links a.active` | Active link: `color: var(--accent)` |
| `.lang-btn` | EN/RU buttons |
| `.theme-btn` | 🌙/☀️ theme toggle |

### Breadcrumbs

| Class | Description |
|---|---|
| `.breadcrumb` | Flex row with `/` separators. Rendered site-wide via `partial "breadcrumb.html"` |
| `.breadcrumb a` | `color: var(--text3)`, hover → accent |

### Panels

| Class | Description |
|---|---|
| `.panel` | Card: `background: var(--bg2)`, border, `border-radius: 10px`, `padding: 20px` |
| `.panel-head` | Flex panel header: `.panel-title` + `.panel-more` |
| `.sec-title` | H2 section heading (Unbounded font, gradient) |

### Articles (post-card)

| Class | Description |
|---|---|
| `.posts-list` | Flex column with gap |
| `.post-card` | Article card: lifts 2px on hover |
| `.post-card-meta` | Row: date + tags |
| `.post-card-title` | Article title in card |
| `.post-card-desc` | Short description |

### Tags

| Class | Description |
|---|---|
| `.tag` | `display: inline-flex`, `background: var(--tag-bg)`, `border-radius: 4px` |
| `.tag:hover` | `border-color: var(--accent)`, `color: var(--accent)` |
| `.tag.active` | Active filter on `/tags/` |
| `.tag-lg` | Larger tag on `/tags/` page |

### Pagination (dot-grid)

Shared by both blog (`pagination.html` partial) and quiz (hardcoded in `ccna-quiz/single.html`).

| Class | Description |
|---|---|
| `.pg-dot-nav` | Flex container: Prev button + dot grid + Next button |
| `.pg-dot-grid` | Flex-wrap row of page number links |
| `.pg-dot` | Individual page link: small square tile |
| `.pg-dot.cur` | Current page: `background: var(--accent)`, white text |
| `.pg-btn` | Prev / Next arrow button |
| `.pg-btn.disabled` | Inactive arrow (first/last page) |

### Search

| Class | Description |
|---|---|
| `.search-wrap` | Container for absolutely positioned results |
| `.search-input` | Search input: `background: var(--bg2)` |
| `#searchResults` | Created by JS dynamically |

### Certifications grid (home / about)

| Class | Description |
|---|---|
| `.cert-grid` | 4-column grid |
| `.cert-card` | Card with `--cert-color` custom variable |
| `.cert-badge` | Emoji icon |
| `.cert-name` | Name (Unbounded font, `color: var(--cert-color)`) |
| `.cert-sub` | Subtitle |

---

## mobile.css — class reference

| Class | Description |
|---|---|
| `.mob-nav` | Mobile top nav (hidden on desktop) |
| `.burger` | Hamburger menu button (3 lines → X on open) |
| `.mob-drawer` | Slide-out menu |
| `.mob-bottom-nav` | Bottom navigation bar |
| `.mob-bnav-item.active` | `color: var(--accent)` |

| Breakpoint | What changes |
|---|---|
| `max-width: 860px` | Desktop nav hidden, mobile nav + bottom bar visible |
| `max-width: 560px` | Reduced padding; `.cert-grid` → 2 columns |

---

## prose.css — article content + shared components

Applied to `.prose` (article body) and available in any post, KB, or docs page.

### Article body

| Selector | Description |
|---|---|
| `.prose h2, .prose h3` | Headings with `border-bottom` |
| `.prose code` | Inline code: `background: var(--bg3)` |
| `.prose blockquote` | Quote: `border-left: 3px solid var(--accent)` |
| `.prose table` | Full-width, collapsed borders |
| `.prose a` | `color: var(--accent)` with underline |

### Shared components

| Class | Description |
|---|---|
| `.intro-card` | Highlighted intro block: `border-left: 3px solid var(--accent)` |
| `.sec` | Section divider: uppercase label + full-width line after |
| `.code-block` | Code wrapper: label bar + Chroma content |
| `.code-label` | Bar: language + copy button |
| `.copy-btn` | "copy" → "ok!" (resets after 1.5s) |
| `.ns-grid` | Card grid for NS cards |
| `.ns-card` | Expandable card with `--c` color variable. Animated via `@keyframes fadeUp` |
| `.ns-card.active` | Expanded: `border-color: var(--c)` |
| `.ns-header` | Card header: icon + name + flag + toggle chevron |
| `.ns-body` | Hidden body, shown when `.active` |
| `.ns-map` | Namespace map widget |
| `.ns-map-btn` | Map tile: flex-column, icon + name + flag. Hover uses `color-mix(--c)` |
| `.tabs` | Tab button row |
| `.tab-btn` | Tab button. Active/hover uses `--c` |
| `.tab-content.active` | Visible tab panel |
| `.ref-panel` | Reference table wrapper |
| `.ref-panel-head` | Uppercase panel heading |
| `.ref-panel-body` | Scrollable table area |
| `.cheat-table` | Data table inside `.ref-panel` |
| `.cheat-table .mono` | `color: var(--accent)` |
| `.stag` | Inline namespace type badge |
| `.stag-uts/.stag-pid/.stag-net/…` | Per-type color variants |
| `.back-link` | "← Back to posts" link at page bottom |

### ToC sidebar (in `_default/single.html`)

| Class | Description |
|---|---|
| `.prose-page.has-toc` | `display: grid; grid-template-columns: 1fr 240px` |
| `.toc-aside` | Right ToC column, sticky |
| `.toc-item` | Link to a heading |
| `.toc-item.cur` | Active heading: `color: var(--accent)` |

---

## cert.css — certification pages

| Class | Description |
|---|---|
| `.cert-hero` | Hero block. `--cert-color` sets border and text color |
| `.cert-hero-badge` | Emoji icon |
| `.cert-hero-name` | Cert name (Unbounded font) |
| `.cert-hero-desc` | Description text |
| `.cert-resources` | Flex row of resource tiles |
| `.cert-resource-card` | Tile: flex-column, icon + title + desc. Hover uses `color-mix(--cert-color)` |
| `.cert-resource-icon` | Emoji icon at top of tile |
| `.cert-resource-body` | Flex-column wrapper for title + desc |
| `.cert-resource-title` | Tile title (JetBrains Mono, bold) |
| `.cert-resource-desc` | Tile description |
| `.cert-stats` | Stats row: N exams · N topics · N articles |
| `.exam-block` | Group of topics for one exam code |
| `.exam-label` | Exam heading (uppercase) |
| `.cert-topic` | One accordion item |
| `.cert-topic.open` | Expanded: `border-color: var(--accent)` |
| `.cert-topic-head` | Accordion header button |
| `.topic-num` | Topic number: `color: var(--accent)` |
| `.topic-chevron` | `›`, rotates 90° with `.open` |
| `.cert-topic-body` | Accordion body: `max-height: 0` → `scrollHeight` via JS |
| `.cert-post-link` | Link to an article inside a topic |
| `.cert-post-title` | Article title: `color: var(--accent)` |

---

## quiz.css — CCNA quiz

| Class | Description |
|---|---|
| `.quiz-disclaimer` | Warning notice at the top of quiz pages |
| `.quiz-index-grid` | Grid of 49 page tiles |
| `.quiz-index-tile` | Page tile with number |
| `.quiz-page-header` | Page title + progress bar |
| `.quiz-progress-bar` | Thin accent-colored progress indicator |
| `.q-card` | Question card wrapper |
| `.q-num` | Question number badge |
| `.q-text` | Question body text |
| `.q-image` | Question image (`max-width: 100%`) |
| `.q-multi-hint` | "Choose N" badge for multi-answer questions |
| `.q-options` | List of answer options |
| `.q-option` | Single option: radio/checkbox + label |
| `.q-option.selected` | User-selected option |
| `.q-option.correct` | Correct option (after reveal): green |
| `.q-option.wrong` | Wrong selected option: red |
| `.q-option.missed` | Correct option user missed: yellow |
| `.reveal-btn` | "Show Answer" / "Hide Answer" toggle |
| `.score-badge` | Inline score: correct / total |
| `.q-explanation` | Explanation text shown after reveal |

---

## ns.css — linux-namespaces page layout

Loads only for `/posts/linux-namespaces/`. All shared components (NS cards, tabs, map buttons, ref-panel, stags) are in `prose.css`.

| Class | Description |
|---|---|
| `.ns-page-wrap` | Two-column grid: `1fr 240px` |
| `.ns-page-main` | Left content column |
| `.ns-page-aside` | Right sidebar (sticky, hidden on mobile) |
| `.toc-box` | Contents panel in sidebar |
| `.toc-item` | Heading link in TOC |
| `.toc-item.hl` | Active heading |
| `.progress-box` | Reading progress panel |
| `.progress-fill` | Animated fill bar |
| `.filter-row` | Filter buttons row for cheatsheet |
| `.f-btn` | Filter button, uses `--c` |
| `.f-btn.on` | Active filter |
| `.ns-pre` | Code output area with custom syntax colors |

---

## Related pages

- [Project Overview](/docs/overview/)
- [Templates](/docs/templates/)
- [Frontmatter](/docs/frontmatter/)
- [JavaScript](/docs/javascript/)
