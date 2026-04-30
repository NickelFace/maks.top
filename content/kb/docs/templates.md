---
title: "Templates — Layout Reference"
date: 2026-04-11
description: "Every Hugo template file: what it renders, data context, block structure"
page_lang: "en"
lang_pair: "/kb/docs/ru/templates/"
tags: ["docs"]
---

## How Hugo templates work

Hugo uses the Go template language. All templates live in `themes/maks/layouts/`.

**Key concepts:**
- `{{ .Field }}` — output a field value
- `{{ range .Items }}...{{ end }}` — loop over a collection
- `{{ if .Condition }}...{{ end }}` — conditional block
- `{{ partial "name.html" . }}` — include a partial, passing current context
- `{{ block "name" . }}...{{ end }}` — define a named block (in baseof)
- `{{ define "name" }}...{{ end }}` — override a block (in child templates)
- `{{ "path" | relURL }}` — convert path to relative URL
- `{{ .Value | funcName }}` — pipe: pass value into a function

---

## baseof.html — master template

**Path:** `themes/maks/layouts/_default/baseof.html`  
**Rendered for:** every page on the site (acts as a wrapper)

This is the foundation of the entire site. Every other template extends `baseof` via `define` blocks.

### Blocks that can be overridden

| Block | Location in baseof | Purpose |
|---|---|---|
| `{{ block "head" . }}` | inside `<head>` | Additional `<link>` or `<meta>` tags |
| `{{ block "main" . }}` | main content area | Page content |
| `{{ block "scripts" . }}` | before `</body>` | Inline JS specific to the page |

### What always renders (cannot be overridden)

- **Desktop nav** `.desk-nav` — logo + links + lang-toggle + theme-toggle
- **Mobile nav** `.mob-nav` — logo + burger
- **Mobile drawer** `.mob-drawer` — slide-out menu
- **Mobile bottom nav** `.mob-bottom-nav` — bottom bar with icons
- **Footer** — logo + stack + location + year
- **`<script>`** — inline: `toggleTheme()`, `setLang()`, `toggleMobMenu()`, `closeMobMenu()`, restore from localStorage

> **Note:** `site.js` is not loaded from baseof! Functions are inlined directly in baseof to guarantee execution order. `site.js` in `static/js/` is a legacy file — its functions are duplicated inline.

### How theme switching works

```html
<html data-theme="dark">   ← attribute on <html>
```

CSS reads the attribute via `[data-theme="light"]` and switches variables. The value is stored in `localStorage.theme`.

---

## index.html — home page

**Path:** `themes/maks/layouts/index.html`  
**Rendered for:** `/`  
**Defines block:** `main`

### Home page sections

| CSS class | Content | Data source |
|---|---|---|
| `.hero` | Heading + description + buttons | Hardcoded in template |
| `.panel .recent-posts` | Last 5 posts | `{{ range first 5 .Site.RegularPages }}` |
| `.panel .kb-section` | KB quick links | Hardcoded links |
| `.panel .certs-section` | Cert widget | `{{ partial "certs-widget.html" . }}` |
| `.cert-grid` | cert cards | `{{ partial "certs-widget.html" . }}` — counts computed dynamically |

---

## _default/single.html — article page

**Path:** `themes/maks/layouts/_default/single.html`  
**Rendered for:** any `single` page without a specific template  
**Used by:** all articles `/posts/*/`, `/kb/*/`, `/kb/docs/*/` (when no own template exists)  
**Defines blocks:** `head` (JSON-LD for EN pages), `main`, `scripts`

### `main` structure

```
.page.prose-page
  breadcrumb.html      ← partial: maks.top / {section} / {title}
  article
    .post-header
      h1               ← .Title
      .post-meta
        .post-date     ← .Date.Format "02/01/2006"  (dd/mm/yyyy)
        .post-meta-tags
          .tag × N     ← range .Params.tags → links to /tags/{tag}/
    .prose             ← {{ .Content }} (markdown body → HTML)
    .back-link         ← ← Back to {section}
  .toc-aside           ← empty div, populated by JS
```

### `head` block — JSON-LD structured data

Injects `<script type="application/ld+json">` with Schema.org `Article` for all EN pages (`page_lang: "en"`). Fields: headline, description, url, datePublished, dateModified, author, publisher.

### `scripts` block

Loads `static/js/article.js` (reading bar, ToC, copy buttons, lightbox). If `code_toggle: true` in frontmatter, sets `document.body.dataset.codeToggle = 'true'` before the script loads.

---

## _default/list.html — page listing

**Path:** `themes/maks/layouts/_default/list.html`  
**Rendered for:** any section without a specific template (`/kb/docs/`, `/certs/` if no own template)  
**Defines block:** `main`

```
.page
  .sec-title           ← .Title | default .Section
  .posts-list
    .post-card × N     ← range .Paginator.Pages
      .post-card-meta  ← date + first 2 tags
      .post-card-title ← .Title
      .post-card-desc  ← .Description or .Summary (truncated to 120 chars)
  pagination.html      ← {{ partial "pagination.html" . }}
```

---

## posts/list.html — blog listing

**Path:** `themes/maks/layouts/posts/list.html`  
**Rendered for:** `/posts/`  
**Overrides:** `_default/list.html`  
**Adds:** Pagefind search

**Difference from `_default/list.html`:** explicit `page_lang ne ru` filter, adds `.tags-header` via `search-box.html` partial, loads `pagefind-search.js`.

**How Pagefind works:**
1. GitHub Actions runs `pagefind --site public` after `hugo build`
2. Pagefind crawls `public/` and creates an index in `public/pagefind/`
3. On the client, `pagefind.js` loads lazily (only on first search input)
4. Results appear in an absolutely positioned div below the input

---

## posts/linux-namespaces.html — interactive page

**Path:** `themes/maks/layouts/posts/linux-namespaces.html`  
**Rendered for:** `/posts/linux-namespaces/`  
**Loads:** `styles/ns.css` via `head` block, `js/ns.js` via `scripts` block

Fully custom layout with a two-column structure:
- Left column: markdown content + namespace map + grid + cheatsheet
- Right column: ToC + progress bar

Namespace data (`nsData`, `cheatData`) is defined in `ns.js`.

---

## about/single.html

**Path:** `themes/maks/layouts/about/single.html`  
**Rendered for:** `/about/`

Renders a profile card `.about-strip` with data from `hugo.toml [params]`:

| HTML | Source |
|---|---|
| `.about-name` | `.Site.Params.author` |
| GitHub / LinkedIn / Telegram links | `.Site.Params.github` / `.Site.Params.linkedin` / `.Site.Params.telegram` |
| `.prose` | `.Content` (body of `about.md`) |

Then inserts `{{ partial "certs-widget.html" . }}` — the same cards as on the home page.

---

## certs/single.html — cert overview page

**Path:** `themes/maks/layouts/certs/single.html`  
**Rendered for:** `/certs/lpic-2/`, `/certs/lpic-1/`, etc.  
**Loads:** `styles/cert.css` via `head` block

### Accordion build algorithm

```
1. $allPosts = all pages in the "posts" section
2. $prefix   = .Params.post_prefix (e.g. "lpic2")
3. For each exam in .Params.exams:
   For each topic in exam.topics:
     $topicPattern = "{prefix}-{topic.num}-"
     $topicPosts   = filter: pages whose BaseFileName starts with $topicPattern
     → if $topicPosts is not empty → render accordion with links
```

**Function `toggleTopic(btn)`:** toggles `.open` class on `.cert-topic`, animates `max-height` on `.cert-topic-body`.

---

## kb/section.html — KB index and sub-sections

**Path:** `themes/maks/layouts/kb/section.html`  
**Rendered for:** `/kb/` (root index) and `/kb/{sub-section}/` (sub-section landing pages)  
**Note:** `kb/single.html` and `kb/list.html` were deleted — KB articles fall through to `_default/single.html`.

Uses `{{ if .Sections }}` to branch between two layouts:

**Root `/kb/` (has child sections):**
```
.page
  breadcrumb.html
  h1 "Knowledge Base"
  .kb-section-title "Site Documentation"
  .kb-cards  ← docs pages
  .kb-section-title {group}  ← for each group: "Linux Core", "Networking", etc.
  .kb-cards
    .kb-card.kb-card-section × N  ← sub-sections (from .Sections)
    .kb-card × N                  ← regular kb pages with Params.group
```

**Sub-section `/kb/{name}/` (no child sections):**
```
.page
  breadcrumb.html
  h1 ← .Title
  p.sec-desc ← .Description
  .kb-cards
    .kb-card × N  ← .Pages.ByTitle
```

---

## taxonomy/tag.html — tags page

**Path:** `themes/maks/layouts/taxonomy/tag.html`  
**Rendered for:** `/tags/`

Embeds `POSTS[]` array and `currentTag` inline (Hugo-generated, EN only), then loads `static/js/taxonomy.js` which handles all filter/render logic. Clicking a tag button filters the array and re-renders `.posts-list` via `innerHTML`.

---

## partials/

### certs-widget.html

Included on the home page (`index.html`) and about (`about/single.html`). Article counts and progress % are computed dynamically from `post_category` + `expected_articles` / `progress_pct` in each cert's frontmatter. See [Frontmatter](/kb/docs/frontmatter/) for cert fields.

### search-box.html

Renders the search input UI. Accepts `.placeholder` param. Used in `index.html`, `posts/list.html`, `taxonomy/tag.html`.

### pagination.html

Accepts a context with `.Paginator`. Always shows first/last page, `cur-1`, `cur`, `cur+1`, inserts `···` for gaps.

---

## shortcodes/

### `code`

```markdown
{{</* code lang="bash" label="example" */>}}
command
{{</* /code */>}}
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `lang` | string | `"bash"` | Language shown in block header |
| `label` | string | — | Additional label (small text) |

Renders `.code-block` with a copy button. `.Inner` — body between tags, passed through `htmlEscape`.

### `ns-card`

```markdown
{{</* ns-card name="PID" flag="CLONE_NEWPID" icon="⚙️" color="#7c3aed"
    summary="Process ID isolation"
    desc="Detailed description..."
    host="PID 84521 on host"
    ns_view="PID 1 inside"
*/>}}
{{</* /ns-card */>}}
```

| Parameter | Required | Description |
|---|---|---|
| `name` | yes | Namespace name (PID, NET, UTS...) |
| `flag` | yes | Kernel flag (CLONE_NEWPID) |
| `icon` | yes | Emoji icon |
| `color` | yes | CSS color (hex), used for `--card-color` |
| `summary` | yes | Short description in the header |
| `desc` | yes | Full description in the expanded body |
| `host` | no | Value on the host side (visual block) |
| `ns_view` | no | Value inside the namespace (visual block) |

`.Inner` — arbitrary markdown inside the tags (e.g. code block).

---

## Related pages

- [Project Overview](/kb/docs/overview/)
- [CSS](/kb/docs/css/)
- [Frontmatter](/kb/docs/frontmatter/)
- [JavaScript](/kb/docs/javascript/)
- [Tags & Search](/kb/docs/tags-and-search/)
