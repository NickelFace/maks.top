# maks.top

Personal Linux & DevOps knowledge base and blog.  
Stack: **Hugo** · **GitHub Pages** · **Pagefind** · **Cloudflare DNS**

**Live site:** https://maks.top  
**Working branch:** `hugo`

---

## Quick start

```bash
git clone --recurse-submodules https://github.com/NickelFace/maks.top.git
cd maks.top
git checkout hugo

# Full cycle (build + search index + serve)
./dev.sh

# Fast iteration (no search)
hugo server -D
```

---

## Documentation

| | |
|---|---|
| [Project Overview](https://maks.top/kb/docs/overview/) | Architecture, Hugo pipeline, deployment flow |
| [New Page Guide](https://maks.top/kb/docs/new-page/) | How to add prose, interactive or cert pages |
| [Deploy & Local Dev](https://maks.top/kb/docs/deploy/) | CI/CD pipeline, pitfalls, DNS setup |
| [CSS Reference](https://maks.top/kb/docs/css/) | Variables, load order, class reference |
| [JavaScript](https://maks.top/kb/docs/javascript/) | All JS functions and where they live |
| [Templates](https://maks.top/kb/docs/templates/) | Hugo layout routing and block structure |
| [Frontmatter](https://maks.top/kb/docs/frontmatter/) | All frontmatter fields by content type |
| [Breadcrumbs](https://maks.top/kb/docs/breadcrumbs/) | Per-template breadcrumb implementation |
| [Tags & Search](https://maks.top/kb/docs/tags-and-search/) | Tag filter + Pagefind architecture |

---

## License

Reuse is welcome — the only condition is attribution back to the source.

- **Code** (the `maks` theme, layouts, scripts, styles) — [MIT](LICENSE). Keep the copyright notice.
- **Written content** (articles, docs, and other prose under `content/`) — [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). You may share and adapt it, including commercially, as long as you credit **Maksim Lopunov** and link back to the original page on https://maks.top.
