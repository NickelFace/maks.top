---
title: "Breadcrumbs"
date: 2026-04-13
description: "Реализация breadcrumbs в шаблонах — партиал, CSS и поддержка KB-подразделов"
page_lang: "ru"
lang_pair: "/kb/docs/breadcrumbs/"
pagefind_ignore: true
build:
  list: never
  render: always
tags: ["docs"]
---

## Обзор

Breadcrumbs реализованы как **общий партиал** в `themes/maks/layouts/partials/breadcrumb.html`.

Все шаблоны, которым нужны breadcrumbs, вызывают:
```html
{{ partial "breadcrumb.html" . }}
```

**Шаблоны, использующие партиал:**

| Шаблон | Страницы |
|---|---|
| `_default/single.html` | Все посты, docs, KB страницы, ccna-labs singles |
| `kb/section.html` | Индекс KB и лендинги подразделов |
| `certs/single.html` | Страницы обзора сертификаций |
| `certs/list.html` | Индекс `/certs/` |
| `ccna-labs/list.html` | Список `/ccna-labs/` |
| `posts/linux-namespaces.html` | Статья Linux namespaces |

---

## Логика партиала

```
themes/maks/layouts/partials/breadcrumb.html
```

Партиал рендерит разные сегменты в зависимости от типа страницы:

| Случай | Вывод |
|---|---|
| `eq .Section "certs"` | `maks.top / certs / Заголовок страницы` |
| `eq .Section "ccna-quiz"` | `maks.top / CCNA / Quiz / Страница N` (CCNA — ссылка на `/certs/ccna/`) |
| `eq .Section "ccna-labs"` | `maks.top / CCNA / Labs / Заголовок` (CCNA — ссылка на `/certs/ccna/`) |
| `.IsSection` | `maks.top / название-раздела` (индекс раздела — текущая страница как обычный текст) |
| KB подстраница (`Section=kb`, depth=2) | `maks.top / kb / Заголовок раздела / Заголовок страницы` |
| Пост с префиксом cert-раздела (`neteng`, `lpic1` и т.д.) | `maks.top / Название сертификата / Заголовок` (ссылка на страницу сертификации) |
| Обычные страницы | `maks.top / раздел / Заголовок страницы` |

---

## Поддержка KB-подразделов

Для страниц вида `/kb/cisco-services/nat-dhcp/` партиал определяет второй сегмент пути из `.File.Dir` и проверяет, является ли он известным cert-разделом (`$certMap`) или KB-страницей:

```go
{{ if eq $.Section "kb" }}
  <a href="{{ (printf "/%s/%s/" $.Section $sub) | relURL }}">{{ $.Parent.Title | default $sub }}</a>
{{ end }}
```

Это делает средний сегмент (`Cisco — Network Services`) кликабельной ссылкой на индекс подраздела.

---

## CSS (определён в `global.css`)

```css
.breadcrumb       { font-size: 11px; color: var(--text3); margin-bottom: 24px; }
.breadcrumb a     { color: var(--text3); text-decoration: none; }
.breadcrumb a:hover { color: var(--accent); }
.breadcrumb span  { margin: 0 6px; }
```

Все ссылки breadcrumb — `--text3` (приглушённый) по умолчанию, при наведении — `--accent`.

---

## Карта cert-разделов

Партиал содержит словарь `$certMap`, который сопоставляет имена подпапок постов с URL страниц сертификатов:

```go
{{ $certMap := dict
    "neteng"  "/certs/network-engineer/"
    "netarch" "/certs/network-architect/"
    "lpic1"   "/certs/lpic-1/"
    "lpic2"   "/certs/lpic-2/"
    "ccna"    "/certs/ccna/"
}}
```

Используется для постов в `/posts/neteng/`, `/posts/lpic1/` и т.д. — средний сегмент breadcrumb ссылается на соответствующую страницу сертификата вместо подпапки posts.

---

## Связанные страницы

- [Шаблоны](/kb/docs/ru/templates/)
- [CSS](/kb/docs/ru/css/)
