# maks.top — Hugo site

Personal Linux & DevOps knowledge base.
Stack: **Hugo** + **GitHub Pages** + **Cloudflare DNS** + **Pagefind**

---

## Quick start (local)

```bash
# 1. Clone
git clone https://github.com/NickelFace/maks.top.git
cd maks.top

# 2. Run dev server
hugo server -D
# → http://localhost:1313
```

## Project structure

```
maks-top/
├── hugo.toml                   ← site config (baseURL, params)
├── content/
│   ├── posts/                  ← blog articles (.md)
│   ├── kb/                     ← quick references (.md)
│   └── certs/                  ← certification notes (.md)
├── static/
│   └── CNAME                   ← custom domain (maks.top)
├── themes/maks/
│   ├── theme.toml
│   ├── layouts/
│   │   ├── index.html          ← homepage
│   │   ├── _default/
│   │   │   ├── baseof.html     ← master layout (nav, footer, scripts)
│   │   │   ├── single.html     ← article page with ToC sidebar
│   │   │   └── list.html       ← generic listing page
│   │   ├── posts/
│   │   │   ├── list.html       ← blog listing with Pagefind search
│   │   │   └── linux-namespaces.html ← interactive namespace explorer
│   │   ├── about/
│   │   │   └── single.html     ← about page with certs widget
│   │   ├── taxonomy/
│   │   │   └── tag.html        ← tags page with interactive filtering
│   │   ├── shortcodes/
│   │   │   ├── ns-card.html    ← interactive namespace card
│   │   │   └── code.html       ← code block with copy button
│   │   └── partials/
│   │       ├── certs-widget.html
│   │       ├── pagination.html
│   │       └── search.html
│   └── static/
│       ├── js/
│       │   ├── site.js         ← theme toggle, mobile menu
│       │   └── ns.js           ← namespace explorer logic
│       └── styles/
│           ├── global.css      ← variables, nav, panels, tags, about
│           ├── home.css        ← homepage-specific styles
│           ├── prose.css       ← article typography + components
│           ├── ns.css          ← namespace explorer styles
│           └── mobile.css      ← responsive breakpoints + mobile nav
└── .github/workflows/
    └── deploy.yml              ← auto-deploy on push to hugo branch
```

## Writing a new post

```bash
hugo new posts/my-post-title.md
```

Frontmatter fields:

```yaml
---
title: "iptables vs nftables"
date: 2026-04-08
description: "Comparison of Linux firewall frameworks"
tags: ["Linux", "Networking", "iptables"]
---
```

## Interactive components in Markdown

### Namespace card

```markdown
{{< ns-card
  name="PID"
  flag="CLONE_NEWPID"
  icon="⚙️"
  color="#7c3aed"
  summary="Process ID isolation"
  desc="First process gets PID 1..."
  host="PID 84521 on host"
  ns_view="PID 1 inside"
>}}
{{< /ns-card >}}
```

### Code block with copy button

```markdown
{{< code lang="bash" label="example" >}}
sudo unshare --pid --fork --mount-proc bash
{{< /code >}}
```

## Deploy: GitHub Pages setup

1. Create repo `NickelFace/maks.top`
2. Push this project to `hugo` branch
3. **Settings → Pages → Source: GitHub Actions**
4. GitHub Actions runs on every push → builds Hugo → runs Pagefind → deploys `public/`

## Cloudflare DNS setup

After adding your site to Cloudflare (Free plan):

| Type  | Name | Value                  | Proxy |
|-------|------|------------------------|-------|
| A     | @    | 185.199.108.153        | ON    |
| A     | @    | 185.199.109.153        | ON    |
| A     | @    | 185.199.110.153        | ON    |
| A     | @    | 185.199.111.153        | ON    |
| CNAME | www  | nickelface.github.io   | ON    |

Then: **GitHub repo → Settings → Pages → Custom domain → `maks.top`**

GitHub auto-issues Let's Encrypt TLS. Cloudflare SSL/TLS → set to **Full** (not Flexible).
