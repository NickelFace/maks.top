# maks.top — Project Guide for Claude

## Stack
- **Hugo** static site, custom theme `themes/maks/`
- **Deploy**: GitHub Pages, branch `hugo`
- **Build**: `cd /home/maks/Documents/site/maks.top && hugo`
- **Push**: `git push origin hugo`

## Key directories
```
content/
  posts/              ← EN blog posts (section type: posts)
  posts/ru/           ← RU translations (build: list: never, render: always)
  posts/neteng/       ← Network Engineer course (EN)
  posts/neteng/ru/    ← Network Engineer course (RU)
  posts/ccna/         ← CCNA 200-301 theory articles (EN, 36 files, ccna-N-NN-slug)
  posts/ccna/ru/      ← CCNA theory RU shadow pages (build: list: never, render: always)
  certs/              ← Cert overview pages (type: certs)
  kb/                 ← Knowledge base (flat EN pages + subsections)
  kb/docs/            ← Site documentation (was content/docs/, moved here for breadcrumb consistency)
  kb/docs/ru/         ← RU translations of docs (build: list: never, render: always)
  kb/ru/              ← KB RU translations (build: list: never, render: always)
  ccna-quiz/          ← Quiz pages p01–p49 (type: ccna-quiz)
  ccna-labs/          ← CCNA lab solutions (type: ccna-labs, 24 files)
  ccna-labs/ru/       ← CCNA labs RU shadow pages (build: list: never, render: always)
  about/

themes/maks/
  layouts/            ← Hugo templates per section
  layouts/_default/_markup/render-codeblock-mermaid.html  ← Mermaid render hook
  layouts/ccna-labs/  ← list.html (toggle accordion) for /ccna-labs/
  assets/css/         ← critical.css (inlined at build time via resources.Get)
  static/styles/      ← CSS files (loaded as external <link>)
  static/fonts/       ← Self-hosted woff2 (JetBrains Mono, Unbounded)
  static/img/         ← Images

static/img/neteng/    ← Per-lab folders: 01/, 02/, … 17/
static/img/quiz/      ← 247 JPEG images extracted from CCNA PDF
```

## CSS files and what they cover
| File | Location | Scope |
|---|---|---|
| `critical.css` | `assets/css/` | Inlined in `<head>` via `resources.Get \| minify`. Dark/light `html,body` bg + `no-transition`. **Single source of truth for FOUC colors — update here when changing theme bg.** |
| `global.css` | `static/styles/` | Variables, reset, nav (incl. `.nav-suntime` sunrise/sunset), page, KB cards, tags, pagination, breadcrumb, sticky footer, **404 page** (`.e404-*`). Utility classes: `.eyebrow`, `.serif`, `.mono` |
| `prose.css` | `static/styles/` | Article body typography + **3-col layout** (`.prose-3col`, `.prose-meta-rail`, `.prose-toc-rail`, `.prose-h1`, `.prose-lead`, `.tldr-card`), `.intro-card`, `.ref-panel`, `.cheat-table`, `.tabs`, `.code-block`, `.sec` + **mobile overflow containment for tables, code, ASCII art and topology SVG (≤ 640 px)** |
| `cert.css` | `static/styles/` | New cert page (`.cert-pg-*`, `.cert-res-*`, `.cert-domain-*`); legacy styles kept for fallback |
| `quiz.css` | `static/styles/` | CCNA quiz cards, options, scoring badges |
| `ns.css` | `static/styles/` | linux-namespaces page only (ns-specific: `.ns-card`, `.ns-grid`, `.ns-map*`, `.stag*`) |
| `home.css` | `static/styles/` | Homepage layout |
| `mobile.css` | `static/styles/` | Mobile-specific overrides |
| `fonts.css` | `static/styles/` | @font-face for self-hosted fonts |
| `chroma.css` | `static/styles/` | Hugo syntax highlighting — loaded on `posts`, `kb`, and `ccna-labs` single pages (NOT on ccna-labs list page) |
| `topology.css` | `static/styles/` | `.topology` figure + SVG diagram styles — loaded on `posts`, `kb`, `ccna-labs` single pages |

## CSS variables (defined in global.css)
```css
--accent   /* amber — night: oklch(0.78 0.14 70), day: oklch(0.72 0.14 65) */
--accent2  /* moss green */
--accent3  /* rust */
--bg, --bg2, --bg3  /* night: #16140F,#1F1C16,#2A2620 / day: #F6F3EC,#EFEBE0,#E6E1D2 */
--border, --border2
--text, --text2, --text3
--glow     /* amber glow */
--code-bg  /* night: #100E09 / day: #EDE9DF */
--radius   /* border-radius base: 6px */
```

## Status badges (certs index)

The `/certs/` page uses three pill states with theme-safe tints:
- `.certs-idx-badge-passed`   — `var(--accent2)` (moss) outline + 14% fill
- `.certs-idx-badge-progress` — `var(--accent)`  (amber) outline + 14% fill
- `.certs-idx-badge-planned`  — `var(--text3)` outline, no fill

Tints use `color-mix(in oklab, currentColor 14%, transparent)` so they scale across light/dark themes without per-theme overrides. **Do not hard-code `oklch(...)` backgrounds on these badges** — that was the source of the contrast bug fixed in `fix(certs): badge contrast across themes`.

## Mobile content overflow rules (≤ 640 px)

Wide content inside articles is contained, never page-wide. Single source of truth lives at the bottom of `prose.css` under the `MOBILE OVERFLOW CONTAINMENT` heading. Affected types:

- `.prose table` — flipped to `display: block; overflow-x: auto`. Cells use `white-space: nowrap`. Header and body still align via `display: table; width: max-content`.
- `.prose pre` — explicit `overflow-x: auto` plus tighter font + thin scrollbar hint.
- `.prose pre.ascii-art` / `.ascii-art-wrap pre` — opt-in class for non-network ASCII (filesystem trees, LDAP DITs). Disables ligatures, shrinks font on mobile, scrolls horizontally.
- `.topology` — wraps the SVG in a horizontal scroller; SVG enforces `min-width: 480px` so labels stay legible.
- `.prose p > code, .prose li > code` — long inline code wraps with `overflow-wrap: anywhere`.

Page-level guard: `html, body { overflow-x: clip; }` in `global.css`. `min-width: 0` set on `main, .post, .prose, .kb-section, .cert-pg-header-inner`.

## Tags — non-clickable everywhere except /tags/ page
Tags (`<span class="tag">`) are **decorative only** across the whole site — no hover effect, no links, `pointer-events: none`. The `/tags/` taxonomy page is the only place with interactive tag buttons.
- In `_default/single.html` (handles both posts and KB): tags rendered as `<span>`, not `<a>`
- In `kb/section.html`: `.kb-card-tags .tag` and section-level tags have `cursor:default; pointer-events:none`
- In `global.css`: `.kb-card-tags .tag:hover` resets border/color to non-accent

## FOUC prevention
`themes/maks/assets/css/critical.css` is inlined into `<head>` at build time. Sets `html,body` backgrounds for both themes (night: `#16140F`, day: `#F6F3EC`) and `no-transition`. **Single source of truth — update here when changing theme bg colors.**

Inline `<script>` in `<head>` reads `localStorage('theme')`:
- `'light'` or `'dark'` → use stored value
- absent/`'auto'` → **auto-detect**: day if local hour is 7–20, night otherwise

Theme state is managed by `applyTheme(t, isAuto)` in `baseof.html` body. Sets `data-theme`, `aria-pressed`, and `data-auto` on all `.theme-btn` buttons. Init function calls `applyTheme` once on load; if auto mode, starts a `setInterval` (10 min) to re-evaluate.

## Theme toggle behaviour
- **Default**: auto — reads local time, switches at 07:00 (day) and 20:00 (night)
- **Click**: manual override stored as `'light'` or `'dark'` in `localStorage('theme')`
- `data-auto="true"` on `.theme-btn` indicates auto mode (CSS shows dashed border)
- To reset to auto: clear `localStorage.removeItem('theme')` in browser console

## EN/RU translation system
Applies to both posts and KB pages.
- EN file: `page_lang: "en"` + `lang_pair: "/section/ru/slug/"`
- RU file: `page_lang: "ru"` + `lang_pair: "/section/slug/"` + `pagefind_ignore: true` + `build: {list: never, render: always}`
- Toggle in `baseof.html` calls `setLang()` which navigates to `lang_pair`
- KB RU pages live in `content/kb/ru/` — `_index.md` has `build: {render: never, list: never}`
- KB pages currently translated: bash, linux-network, text-processing, iptables-nftables

## Network Engineer course post format

Posts live in `content/posts/neteng/` (EN) and `content/posts/neteng/ru/` (RU).

### Frontmatter — EN
```yaml
title: "Network Engineer — NN. Title"
date: DD-MM-YYYY
description: "..."
tags: [...]
categories: ["Network Engineer"]
code_toggle: true
page_lang: "en"
lang_pair: "/posts/neteng/ru/neteng-NN-slug/"
```

### Frontmatter — RU
```yaml
title: "Network Engineer — NN. Title"
date: DD-MM-YYYY
description: "..."
tags: [...]
categories: ["Network Engineer"]
code_toggle: true
page_lang: "ru"
lang_pair: "/posts/neteng/neteng-NN-slug/"
pagefind_ignore: true
build:
  list: never
  render: always
```

### Content conventions
- Top heading is **`##`** (h2), never `#` (h1)
- CLI outputs go in `<details>` blocks — never bare fenced code blocks for long outputs:
  ```html
  <details>
  <summary>RouterName — command description</summary>
  <pre><code>
  ... output ...
  </code></pre>
  </details>
  ```
- Short config snippets (≤5 lines) can use plain ` ``` ` blocks
- Sections separated with `---`
- Footer on last line: `*Network Engineer Course | Lab NN*`
- No `<p class="ru-text">` — old bilingual inline format, fully phased out

### Images
- One folder per lab: `static/img/neteng/NN/`
- Files named sequentially: `1.png`, `2.png`, `3.png`
- Lab 09's topology image (`09/1.png`) is reused in lab 10 — reference it directly, do not copy
- Lab 11's full topology (`11/1.png`) is reused in labs 12–16 — same rule
- Before deleting any image, verify it is not referenced in any other post:
  `grep -r "img/neteng/NN" content/`

### Migration checklist (old → new format)
When rewriting an old bilingual EN post:
1. Add `page_lang: "en"` to frontmatter
2. Change `# Title` → `## Title`
3. Remove all `<p class="ru-text">...</p>` blocks
4. Wrap CLI outputs in `<details>` blocks
5. Add `---` section separators
6. Add footer `*Network Engineer Course | Lab NN*`
7. Rewrite or verify the matching RU post in `ru/` using same structure

## Tags page (`/tags/`)

Template: `themes/maks/layouts/taxonomy/tag.html`

- Tag grid and counts are built **client-side from the `POSTS[]` JS array** (EN posts only) — do not use Hugo `range .Site.Taxonomies.tags` for the grid, as it would include RU posts and inflate counts.
- `POSTS[]` is populated server-side but filtered: `{{ if ne .Params.page_lang "ru" }}`.
- Arriving at `/tags/<slug>/` pre-selects that tag: grid collapses, matching articles shown immediately.
- UI elements in `.tags-bar`:
  - Toggle button: `.tag.tag-lg` — shows/hides the tag grid, text updates to reflect count.
  - Active pill: `.tag.tag-lg.active` — shows current tag + count + `×`; clicking it clears the filter.
- No separate "clear" / "All posts" button — the pill itself is the clear action.
- CSS classes reused from global tag system (`.tag`, `.tag-lg`, `.tag.active`) — no custom button styles.

## Cert pages
- `content/certs/<name>.md` — frontmatter: `post_prefix`, `post_category`, `exams[].topics[]`
- `post_category` — Hugo category string used in posts (e.g. `"Network Engineer"`); used by certs-widget to count articles
- `expected_articles` — planned total article count; drives auto-calculated progress % in the widget
- `progress_pct` — manual fallback % when course has no articles yet (e.g. AWS SAA, CCNA)
- JSON-LD `Article` schema is injected in `<head>` by `_default/single.html` for all EN pages; uses `safeJS` to prevent Go `html/template` from double-encoding the JSON
- Template matches posts by: `strings.HasPrefix .File.BaseFileName (printf "%s-%s-" $prefix $topic.num)`
- Articles show under their topic accordion in the cert page
- List view uses `_default/list.html` — zero dates (`0001-01-01`) are hidden via `{{ if not .Date.IsZero }}`

## Certs index page (`/certs/`)

Template: `themes/maks/layouts/certs/list.html`
CSS: `.certs-idx-*` classes appended to `themes/maks/static/styles/cert.css`

Two-zone layout:
- **Hero** (`certs-idx-hero`): breadcrumb + Fraunces h1 + description + stats sidebar (passed/in-progress/planned/total articles)
- **Track table** (`certs-idx-table`): column headers + one `<a>` row per cert page

### Row columns
`40px 1fr 150px 160px 130px 24px` → `# · Track · Status · Articles · Progress · →`

- **Track**: Fraunces cert title + mono sub-line with exam codes (filters `exams[].code` where `len > 2` to skip section numbers like "1"; falls back to `.Description | truncate 64`)
- **Status badge**: `PASSED` (green tint) / `IN PROGRESS` (amber tint) / `PLANNED` (muted) — same logic as cert single.html
- **Articles**: `written / expected` + optional labs count from `cert_labs_done` param
- **Progress**: large Fraunces `$pct%` + 2px bar colored with `cert_color`

### Status / progress logic (mirrors cert single.html)
```
credly_badge_id OR cert_url → "passed"
pct > 0                     → "in progress"
else                        → "planned"

pct = round(written / expected × 100)  -- if both > 0
    | progress_pct param                -- fallback
    | 0
```

### Responsive breakpoints
- `≤1024px`: 5-col grid (drops ARTICLES label column)
- `≤860px`: single-col hero (stats left-aligned)
- `≤640px`: 2-col row (name + badge + arrow only; `#`, articles, progress hidden)

## CCNA Quiz
- 489 questions, 49 pages (p01–p49), 10 per page
- Questions parsed from `CCNA-200-301-dumps-v8.6.pdf` — community dump, not official
- Images: `static/img/quiz/img-NNN.jpg`, mapped to questions by PDF page range (131 questions have images)
- Image mapping may have errors — user will verify manually
- Layout: `themes/maks/layouts/ccna-quiz/single.html` and `list.html`
- Breadcrumb: `maks.top / CCNA / Quiz / Page N` — CCNA links to `/certs/ccna/`

## CCNA Theory Articles
- 36 articles in `content/posts/ccna/`, named `ccna-N-NN-slug.md` (e.g. `ccna-1-01-network-components.md`)
- Naming: `ccna-{domain}-{zero-padded-num}-{slug}` — sorts correctly, cert template prefix `ccna-N-` matches per domain
- EN files: English content, `page_lang: "en"`, `lang_pair: "/posts/ccna/ru/{slug}/"`
- RU shadow pages: `content/posts/ccna/ru/`, Russian content, `pagefind_ignore: true`, `build: {list: never, render: always}`
- `content/posts/ccna/_index.md` has `build: {render: never, list: never}` — section itself does not render
- Domains: 1 (11 articles), 2 (5), 3 (5), 4 (6), 5 (5), 6 (4)
- Cert page `/certs/ccna/` shows these under topic accordions via `post_prefix: "ccna"` + `expected_articles: 80`
- Mermaid diagrams in some articles — rendered via hook + CDN JS (see Mermaid section below)

## CCNA Lab Solutions
- 24 labs in `content/ccna-labs/`, named `ccna-lab-NN-slug.md`
- Standalone section at `/ccna-labs/` (not under `/posts/`)
- EN files: English content, `page_lang: "en"`, `lang_pair: "/ccna-labs/ru/{slug}/"`
- RU shadow pages: `content/ccna-labs/ru/`, Russian content, same build flags as other RU pages
- List page (`/ccna-labs/`): flat grid — `grid-template-columns: 80px 1fr 140px 100px 24px` — no accordion
  - Columns: `LAB NN` (amber), title + tags, tool (default "Packet Tracer"), duration (default "—"), `→`
  - Template: `themes/maks/layouts/ccna-labs/list.html` with inline CSS (no external dependency)
- Single lab pages use `_default/single.html` — `prose.css` + `chroma.css` load via `baseof.html` (`.IsPage` check)
- Breadcrumb: `maks.top / CCNA / Labs / Lab Title` — CCNA links to `/certs/ccna/`
- `ccna-labs/` section added to `$certMap` in breadcrumb partial

## Mermaid diagrams
- Render hook: `themes/maks/layouts/_default/_markup/render-codeblock-mermaid.html`
  - Wraps ` ```mermaid ` blocks in `<pre class="mermaid">`, sets `hasMermaid` page store flag
- JS loader in `_default/single.html` scripts block: loads Mermaid ESM from CDN only when `hasMermaid` is true
  - Theme: `dark` to match site

## KB section structure

### Groups
Five groups render on `/kb/` root: `"Linux Core"`, `"Networking"`, `"Cloud & DevOps"`, `"Security"`, `"Cases"`. These must match exactly the `slice` in `layouts/kb/section.html`.

### Flat pages (directly in `content/kb/`)
Must have `group:` to appear in the correct KB section block:
```yaml
title: "..."
description: "..."
icon: "emoji"
group: "Linux Core"   # one of the five groups above
tags: [...]
date: DD-MM-YYYY
```

### Subsections (`content/kb/{name}/`)
`_index.md` has `group:` (same as flat pages). Child articles do **NOT** have `group:` — it's only on `_index.md`.
```yaml
# _index.md
title: "Section Title"
description: "..."
icon: "emoji"
group: "Networking"
tags: [...]
date: DD-MM-YYYY   # must be a past date — Hugo skips future/today dates by default
```

### KB template notes
- `layouts/kb/section.html` handles both root `/kb/` and sub-section landing pages (via `{{ if .Sections }}`)
- KB article single pages fall through to `layouts/_default/single.html` — `layouts/kb/single.html` was deleted (was identical)
- `layouts/kb/list.html` — deleted (was dead code, Hugo never used it)
- `$kbPages` in the root template filters to **direct children only** (`.File.Dir == "kb/"`) — subsection articles do not appear in the root listing

### Network Labs section (Cases group)
Personal lab notes live in `content/kb/network-labs/`. EN only, no RU translations. Group: `"Cases"`.

## CCNA section layout
`themes/maks/layouts/_default/ccna-section.html` — used for section landing pages under CCNA (e.g. `/ccna-labs/`, `/ccna-quiz/` list overviews). Renders a section-based header + child page grid.

## 404 page

Template: `themes/maks/layouts/404.html`

Two-column layout (`1fr 1fr`) matching the editorial design system:
- **Left**: eyebrow `§ Error 404` → big Fraunces "Lost" + italic amber "packet." → mono `TTL EXPIRED · NO ROUTE TO HOST` → italic serif description → nav buttons (dark filled Home + outlined Blog / KB)
- **Right**: eyebrow `§ Diagnostic` → `$ traceroute <path>` (path filled by JS from `window.location.pathname`) → dark terminal block with fake traceroute output → search input

Search input: pressing `/` focuses it; submitting redirects to `/posts/?q=<term>`.
CSS classes: `.e404-page`, `.e404-left`, `.e404-right`, `.e404-terminal`, `.e404-search` — all in `global.css`.

## Breadcrumb partial

Shared partial at `themes/maks/layouts/partials/breadcrumb.html`. Called via `{{ partial "breadcrumb.html" . }}` in all templates.
- Handles: certs (2-segment), sections (current as plain text), KB sub-pages (links to parent section via `.Parent.Title`), ccna-quiz pages (Page N), ccna-labs pages, regular pages (section link + title)
- `$certMap` maps post sub-folders (neteng, lpic1, lpic2, ccna…) to cert page URLs
- `ccna-quiz` and `ccna-labs` sections both show `CCNA →` link pointing to `/certs/ccna/`

## Sticky footer

`body { display: flex; flex-direction: column }` + `footer { margin-top: auto }`.
Footer is hidden on mobile (`display: none`) — replaced by `.mob-bottom-nav`.

## Contact info (phone / email)

`phone` and `email` in `hugo.toml` are set to `""`. Values are injected at build time via env vars:
- Locally: `.env` file (gitignored) with `HUGO_PARAMS_PHONE` and `HUGO_PARAMS_EMAIL`
- CI: GitHub Secrets `CONTACT_PHONE` / `CONTACT_EMAIL`, passed to hugo build step
- `dev.sh` loads `.env` automatically before running hugo

In `about/single.html` the values are rendered as base64 `data-v` attributes and decoded by inline JS — plain text never appears in HTML output.

## Git rules
- Branch: `hugo`
- **Never add Claude co-authorship to commits**
- Commit message: concise, what + why
- Always build (`hugo`) before committing to catch errors

## Fonts
- **Fraunces** (display/logo, serif) — loaded via Google Fonts link in `baseof.html`
- **Inter** (body text, wt 400–600) — self-hosted woff2
- **JetBrains Mono** (monospace/code/labels) — self-hosted woff2
- Unbounded woff2 files remain in `static/fonts/` but are no longer referenced in CSS
Inter subsets: `Inter-latin.woff2`, `Inter-latin-ext.woff2`, `Inter-cyrillic.woff2`, `Inter-cyrillic-ext.woff2`.

## Pagefind
Search index built during `hugo`. RU pages excluded with `pagefind_ignore: true`.

## JS files (`static/js/`)

| File | Loaded by | Purpose |
|---|---|---|
| `article.js` | `_default/single.html` scripts block | Reading progress bar (`#readingBar`), desktop+mobile ToC, copy buttons, image lightbox |
| `pagefind-search.js` | `posts/list.html`, `taxonomy/tag.html` scripts block | Pagefind search UI — renders into `#searchResults`, uses `.search-result-item` CSS classes |
| `taxonomy.js` | `taxonomy/tag.html` scripts block | Tag filter logic + article grid. Reads `POSTS[]` and `currentTag` from inline `<script>` above it |

`article.js` checks `document.body.dataset.codeToggle === 'true'` to conditionally activate code-toggle UI. Set via `{{ if .Params.code_toggle }}<script>document.body.dataset.codeToggle='true';</script>{{ end }}` in the page scripts block.

## Partials

| File | Purpose |
|---|---|
| `partials/breadcrumb.html` | Shared breadcrumb — used in all templates |
| `partials/search-box.html` | Search input UI — used in index.html, posts/list.html, taxonomy/tag.html. Accepts `.placeholder` param |
| `partials/certs-widget.html` | Cert widget on homepage — article counts and progress % computed dynamically from `post_category` + `expected_articles` / `progress_pct` in cert frontmatter |

## Shortcodes

| File | Usage |
|---|---|
| `shortcodes/topology.html` | Declarative SVG network diagram. Replaces ASCII art in posts/kb/labs. |
| `shortcodes/code.html` | Code block with copy button |
| `shortcodes/ns-card.html` | Namespace isolation visualisation card |

### topology shortcode syntax
```
{{</* topology cols="4" rows="3" caption="OSPF baseline" */>}}
  cloud  ISP    "AS 64512"   at 0,1
  router R1     "GW · BGP"   at 1,1
  switch CORE   "VLAN 10/20" at 2,1
  server srv-01 "10.0.10.4"  at 3,0
  server srv-02 "10.0.10.5"  at 3,2
  pc     lab-pc "VLAN 20"    at 2,2

  ISP  — R1
  R1   — CORE  label="trunk · 1G"
  CORE — srv-01
  CORE — srv-02
  CORE — lab-pc
{{</* /topology */>}}
```
Node kinds: `router` `switch` `server` `cloud` `pc` `fw` (and fallback generic rect).
Coordinates: `at col,row` (0-indexed). Links: `A — B` or `A — B label="text"`.

### Migration policy: ASCII art → topology shortcode

Network diagrams expressed as ASCII inside fenced code blocks are considered legacy. Each post migrated to the shortcode also migrates its `ru/` shadow in the same commit. Conversion rules:

- Boxes-and-lines diagrams → `topology` (preferred).
- Filesystem / DIT / config trees → keep as code block with language `ascii`, or wrap in `<div class="ascii-art-wrap">`. Mobile CSS handles the rest.
- Timing / sequence / frame-structure diagrams → keep as code block, no migration; the same `.ascii-art-wrap` works.

Audit grep:
```bash
grep -rln --include='*.md' -E '(├──|└──|│   ├)' content/
```
