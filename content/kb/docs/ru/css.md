---
title: "CSS: Архитектура и Справочник Классов"
date: 2026-04-15
description: "Структура CSS файлов, переменные темы и полный справочник классов maks.top"
page_lang: "ru"
lang_pair: "/kb/docs/css/"
pagefind_ignore: true
build:
  list: never
  render: always
tags: ["docs"]
---

## Архитектура CSS

Стили разбиты на 11 файлов по принципу **scope** (область применения):

| Файл | Расположение | Загружается | Назначение |
|---|---|---|---|
| `critical.css` | `themes/maks/assets/css/` | инлайн в `<head>` | Предотвращение FOUC: фон `html,body` для обеих тем + правило `no-transition` |
| `global.css` | `themes/maks/static/styles/` | везде | Переменные, nav, базовые компоненты, dot-grid пагинация |
| `mobile.css` | `themes/maks/static/styles/` | везде | Мобильная навигация, breakpoints |
| `fonts.css` | `themes/maks/static/styles/` | везде | `@font-face` для Inter (body), JetBrains Mono. Fraunces загружается через Google Fonts `<link>` в `baseof.html` |
| `prose.css` | `themes/maks/static/styles/` | posts, about, kb, ccna-labs singles | Типографика, NS-карточки/tabs/ref-panel, section divider, mobile overflow containment |
| `home.css` | `themes/maks/static/styles/` | только `/` | Hero, recent posts, KB grid, cert-grid |
| `cert.css` | `themes/maks/static/styles/` | `/certs/*` | Cert hero, плитки ресурсов, аккордеон тем, индекс /certs/ |
| `ns.css` | `themes/maks/static/styles/` | `/kb/linux-namespaces/` | Двухколоночный layout, TOC sidebar, прогресс чтения, строка фильтров читшита |
| `topology.css` | `themes/maks/static/styles/` | posts, kb, ccna-labs singles | Стили SVG-диаграмм `.topology` |
| `chroma.css` | `themes/maks/static/styles/` | posts, kb, ccna-labs singles | Подсветка синтаксиса. Здесь же **объявляется палитра токенов `--code-*`**, которую читают `prose.css` и `ns.css` |

Загрузка в `baseof.html`:
```html
<!-- Инлайн через Hugo asset pipeline — единственный источник правды для FOUC-цветов -->
{{ with resources.Get "css/critical.css" | minify }}<style>{{ .Content | safeCSS }}</style>{{ end }}

<link rel="stylesheet" href="/styles/fonts.css">    <!-- всегда -->
<link rel="stylesheet" href="/styles/global.css">   <!-- всегда -->
{{ if or (eq .Type "posts") (eq .Type "kb") (and (eq .Type "ccna-labs") .IsPage) }}
  <link rel="stylesheet" href="/styles/chroma.css">{{ end }}
{{ if .IsHome }}<link rel="stylesheet" href="/styles/home.css">{{ end }}
{{ if or (eq .Type "posts") (eq .Type "about") (eq .Type "kb") (and (eq .Type "ccna-labs") .IsPage) }}
  <link rel="stylesheet" href="/styles/prose.css">{{ end }}
{{ if or (eq .Type "posts") (eq .Type "kb") (and (eq .Type "ccna-labs") .IsPage) }}
  <link rel="stylesheet" href="/styles/topology.css">{{ end }}
<link rel="stylesheet" href="/styles/mobile.css">   <!-- всегда -->
{{ block "head" . }}{{ end }}  <!-- cert.css / ns.css добавляются здесь -->
```

> **Зачем `critical.css` инлайнится:** цвета фона тёмной/светлой темы должны применяться до загрузки любого внешнего CSS, чтобы предотвратить белую вспышку при навигации. `critical.css` находится в `assets/`, поэтому Hugo может прочитать и встроить его во время сборки через `resources.Get`. **При изменении цветов темы обновляй `critical.css` И переменные `:root` в `global.css` — они должны совпадать.**

---

## CSS переменные — темы

Палитра — **Slate**: холодная сине-серая база с одним синим акцентом. Тёмная тема
объявлена по умолчанию на `:root`, светлая перекрывает её на `[data-theme="light"]`.
Обе темы построены на одном тоновом семействе (акцентный hue 232), поэтому сайт не
меняет характер, когда авто-переключатель день/ночь срабатывает вечером.

| Переменная | Dark (`:root`) | Light | Назначение |
|---|---|---|---|
| `--accent` | `oklch(0.75 0.10 232)` | `oklch(0.51 0.12 232)` | Ссылки, фокус, прогресс, статус **in progress** |
| `--accent2` | `oklch(0.74 0.09 168)` | `oklch(0.52 0.09 168)` | Только статус **passed** |
| `--accent3` | `#838F9C` | `#616E78` | Статус **planned** — алиас `--text3`, а не отдельный тон |
| `--warn` | `#f59e0b` | `#f59e0b` | Предупреждение (amber) |
| `--danger` | `#ef4444` | `#ef4444` | Ошибка / опасность (красный) |
| `--bg` | `#0E1319` | `#F7F9FB` | Фон страницы |
| `--bg2` | `#141B23` | `#EFF3F7` | Поверхности, панели, база nav-blur, полоса «Writing» |
| `--bg3` | `#1C242E` | `#E4EAF1` | Приподнятое: inline-код, hover-строки |
| `--border` | `#242D38` | `#D8E0E9` | Волосяные линии, зазоры сетки |
| `--border2` | `#33404E` | `#BFCAD6` | Инпуты, контуры пилюль |
| `--text` | `#E6EBF1` | `#131A21` | Основной текст |
| `--text2` | `#A2AEBB` | `#48555F` | Текст статей, лиды |
| `--text3` | `#838F9C` | `#616E78` | Мета, mono-метки, описания карточек |
| `--glow` | `oklch(0.75 0.10 232 / 0.14)` | `oklch(0.51 0.12 232 / 0.14)` | Кольцо фокуса, hover тегов |
| `--tag-bg` | `oklch(0.75 0.10 232 / 0.10)` | `oklch(0.51 0.12 232 / 0.10)` | Фон тегов |
| `--shadow` | `0 1px 0 rgba(0,0,0,0.4), 0 16px 40px -20px rgba(0,0,0,0.5)` | `0 1px 0 rgba(19,26,33,0.04), 0 12px 32px -16px rgba(19,26,33,0.18)` | Box shadow |
| `--nav-blur` | `rgba(14,19,25,0.90)` | `rgba(247,249,251,0.92)` | Фон навигации (backdrop blur) |
| `--code-bg` | `#0A0E13` | `#E9EEF3` | Фон блоков кода |
| `--grid-line` | `transparent` | `transparent` | Зарезервировано |
| `--radius` | `6px` | `6px` | Базовый border-radius |

`--h1-hero`, `--h1-page` и `--h1-article` тоже объявлены на `:root` и от темы не зависят —
см. типографическую шкалу в [Шаблонах](/kb/docs/ru/templates/).

> **Контраст измерен, а не подобран на глаз.** `--text3` красит описания карточек в 12.5 px,
> подписи сертификатов и даты постов — то есть это текст статьи, и он обязан проходить
> WCAG AA на всех трёх поверхностях. Тёмный `#838F9C` даёт 5.6 / 5.2 / 4.7:1 на
> `--bg` / `--bg2` / `--bg3`; светлый `#616E78` — 4.96 / 4.70. Светлый `--accent` стоит на
> L 0.51, а не на L 0.75 тёмной темы, потому что `prose.css` рисует inline-`code` акцентом
> на `--bg3` — это и есть ограничивающий случай, 4.55:1. Эти значения не «причёсывать».

**Переменные компонентов** (задаются через inline `style=""`):

| Переменная | Кем задаётся | Описание |
|---|---|---|
| `--cert-color` | `certs/single.html`, `partials/certs-widget.html` | Цвет **статуса** трека, а не фирменный цвет сертификата. Разрешается в `var(--accent2)` (passed), `var(--accent)` (in progress) или `var(--text3)` (planned) через словарь `$stateFor` |

Старая переменная `--c` — персональный тон NS-карточки, map-кнопки, вкладки и фильтра —
удалена вместе с девятью цветами `--ns-*`. Эти компоненты теперь красятся по **состоянию**
от `--accent`; см. [Общие компоненты](#общие-компоненты) ниже.

`cert_color` всё ещё лежит во frontmatter `content/certs/*.md`, но ни один шаблон его не читает.

---

## Палитра токенов кода (`chroma.css`)

Подсветка синтаксиса построена на одной таблице токенов, общей для обеих тем, — второго
блока `[data-theme]`, который надо держать в синхроне, больше нет. `prose.css` и `ns.css`
читают те же переменные вместо захардкоженных hex. Настроено под Bash: это 3 400+ из всех
блоков кода на сайте.

| Переменная | Dark | Light | Роль | Контраст (dark) |
|---|---|---|---|---|
| `--code-fg` | `#D6DEE8` | `#1B2530` | Обычный текст, пути, флаги | 19.0:1 |
| `--code-cmd` | `#7FD1DE` | `#0B5D78` | Команды, builtins, функции | 11.0:1 |
| `--code-str` | `#D5C08A` | `#8A5A00` | Строки, heredoc | 10.7:1 |
| `--code-kw` | `#B49BE8` | `#7A3EA8` | Ключевые слова, операторы, пайпы | 8.1:1 |
| `--code-var` | `#9DC1F0` | `#1A4E9B` | `$VAR`, `${expansion}` | 10.3:1 |
| `--code-num` | `#8FD6B4` | `#0F6B4F` | Числа, добавленные строки | 11.4:1 |
| `--code-out` | `#94A3B4` | `#4A5764` | Вывод программ, приглашения | 7.4:1 |
| `--code-cmt` | `#7E8C9E` | `#5A6672` | Комментарии — нижняя граница контраста | 5.5:1 |
| `--code-err` | `#F08C8C` | `#A32020` | Ошибки, удалённые строки | 9.5:1 |
| `--code-gut` | `#4C596A` | `#97A3AE` | Номера строк (не текст) | — |
| `--code-hl` | `#16202D` | — | Фон подсвеченной строки | — |

Всё, кроме строк, — холодное. Строки оставлены тёплыми намеренно: один тёплый тон внутри
блока кода — самый дешёвый способ отбить закавыченный аргумент, и это единственное место,
где тепло вообще уцелело в палитре Slate.

> **Подводный камень порядка загрузки:** `--code-*` объявлены в `chroma.css`, который
> грузится только для `posts`, `kb` и singles `ccna-labs`. При этом `prose.css` грузится
> ещё и на `about`, где `chroma.css` **нет**. Блок кода на `/about/` разрешил бы
> `var(--code-fg)` в пустоту и получил унаследованный цвет. Сегодня блоков кода там нет;
> если появятся — переносить объявление `--code-*` в `global.css`.

---

## global.css — справочник классов

### Reset и базовые стили

| Класс / Селектор | Описание |
|---|---|
| `*, *::before, *::after` | `box-sizing: border-box`, сброс margin/padding |
| `body` | `background: var(--bg)`, `font-family: 'Inter', system-ui, sans-serif` |
| `a` | `color: inherit`, без подчёркивания |

### Навигация (десктоп)

| Класс | Описание |
|---|---|
| `.desk-nav` | Flex-контейнер: логотип + ссылки + правая панель. Sticky, `z-index: 100` |
| `.nav-logo` | Логотип с gradient-текстом |
| `.nav-links a.active` | Активная ссылка: `background: var(--text)`, `color: var(--bg)` (чернильная пилюля). `white-space: nowrap` не даёт «Knowledge Base» переноситься |
| `.lang-btn` | Кнопки EN/RU |
| `.theme-btn` | Круглая кнопка смены темы 28 px. Внутри инлайн `<svg><use href="/img/icons.svg#power">` — глиф питания в `currentColor`, поэтому работает без правок на обеих темах. Пунктирная рамка при `[data-auto="true"]`, акцентное кольцо в активном состоянии |

### Хлебные крошки

| Класс | Описание |
|---|---|
| `.breadcrumb` | Flex-строка с разделителями `/`. Рендерится через `partial "breadcrumb.html"` |
| `.breadcrumb a` | `color: var(--text3)`, hover → accent |

### Панели

| Класс | Описание |
|---|---|
| `.panel` | Карточка: `background: var(--bg2)`, border, `border-radius: 10px` |
| `.panel-head` | Flex-заголовок панели |
| `.sec-title` | Заголовок секции H2 (gradient) |

### Карточки статей

| Класс | Описание |
|---|---|
| `.posts-list` | Flex-колонка |
| `.post-card` | Карточка статьи: поднимается на 2px при hover |
| `.post-card-meta` | Строка: дата + теги |
| `.post-card-title` | Заголовок в карточке |
| `.post-card-desc` | Краткое описание |

### Теги

| Класс | Описание |
|---|---|
| `.tag` | `display: inline-flex`, `background: var(--tag-bg)`, `border-radius: 4px` |
| `.tag:hover` | `border-color: var(--accent)`, `color: var(--accent)` |
| `.tag.active` | Активный фильтр на `/tags/` |
| `.tag-lg` | Увеличенный тег на странице `/tags/` |

### Карточки Knowledge Base

Объявлены в блоке `{{ define "head" }}` внутри `themes/maks/layouts/kb/section.html`,
а не в `global.css`. Сетка волосяная (`gap: 1px` поверх фона `--border`), а не набор
плавающих карточек.

| Класс | Описание |
|---|---|
| `.kb-pg-header` / `.kb-pg-header-inner` | Шапка страницы, `max-width: 1200px`, волосяная линия снизу |
| `.kb-pg-body` / `.kb-pg-body-inner` | Обёртка тела страницы |
| `.kb-group` | Одна доменная группа (например, «Linux Core») |
| `.kb-group-hd` | Строка заголовка группы: название + счётчик, `border-bottom: 1px solid var(--text)` |
| `.kb-group-name` | Заголовок группы, Fraunces 24 px |
| `.kb-group-count` | Счётчик страниц, JetBrains Mono 11 px, `var(--text3)` |
| `.kb-edit-grid` | Волосяная сетка 4 колонки → 3 при ≤1024px, 2 при ≤640px, 1 при ≤400px |
| `.kb-edit-card` | Ячейка: `background: var(--bg)`, hover → `var(--bg2)` |
| `.kb-edit-mark` | Фирменный знак: `<svg><use href="/img/icons.svg#…">`, `height: 26px`, `var(--text3)` → `var(--accent)` при hover карточки. Управляется полем frontmatter `mark:` через `partials/kb-mark.html` |
| `.kb-edit-letter` | Фолбэк, когда у страницы нет `mark:` — первая буква заголовка в Fraunces 30 px, `line-height: 0.86`, `height: 26px`, чтобы оптическая высота совпала с 26-пиксельными знаками и смешанные ряды не прыгали |
| `.kb-edit-title` | Заголовок 15 px, semi-bold |
| `.kb-edit-desc` | Описание 12.5 px, `var(--text3)` |
| `.kb-edit-tags` / `.kb-edit-tag` | Строка тегов, mono 10 px |
| `.kb-edit-meta` | Счётчик страниц, mono 10 px, `var(--accent)` |
| `.kb-sub-header` / `.kb-sub-body` / `.kb-sub-h1` | Обёртки лендинга подраздела |

На главной свой отдельный KB-блок в `home.css`: `.home-kb-grid`, `.home-kb-col`,
`.home-kb-col-hd`, `.home-kb-num`, `.home-kb-count`, `.home-kb-colname`, `.home-kb-list`,
`.home-kb-more`.

> Фирменные знаки — Simple Icons (CC0); товарные знаки остаются за их владельцами. Спрайт
> лежит в `themes/maks/static/img/icons.svg` и подключается внешней ссылкой
> (`/img/icons.svg#docker`) — один кэшируемый запрос вместо ~20 КБ инлайном на каждой
> странице. Страницы, знака которых в спрайте нет — AWS CLI, SSH, Filesystem, Cheat Sheets,
> Processes, Network Labs, IP Calculator — сохраняют букву Fraunces.

### Пагинация (dot-grid)

Используется в блоге (`pagination.html`).

| Класс | Описание |
|---|---|
| `.pg-dot-nav` | Flex-контейнер: кнопка Prev + сетка + кнопка Next |
| `.pg-dot-grid` | Flex-строка с переносом для номеров страниц |
| `.pg-dot` | Отдельная плитка номера страницы |
| `.pg-dot.pg-active` | Текущая страница: `background: var(--accent)`, `color: var(--bg)`. **Не** `#000` — так было написано под старый янтарный акцент, на синем средней светлоты это нечитаемо |
| `.pg-btn` | Кнопки Prev / Next |
| `.pg-btn.pg-disabled` | Неактивная стрелка (первая/последняя страница) |

### Поиск

| Класс | Описание |
|---|---|
| `.search-wrap` | Контейнер для результатов |
| `.search-input` | Поле ввода: `background: var(--bg2)` |
| `#searchResults` | Создаётся динамически через JS |

### Сетка сертификаций (главная / About)

| Класс | Описание |
|---|---|
| `.cert-grid` | Сетка из 4 колонок |
| `.cert-card` | Карточка, несущая `--cert-color` — цвет **статуса** |
| `.cert-badge` | Emoji-иконка |
| `.cert-name` | Название (`color: var(--cert-color, var(--accent))`) |

### Страница 404

| Класс | Описание |
|---|---|
| `.e404-page` | Двухколоночная grid-обёртка (`1fr 1fr`) |
| `.e404-left` | Левая колонка: заголовок, описание, кнопки навигации |
| `.e404-right` | Правая колонка: терминал traceroute, поле поиска |
| `.e404-terminal` | Тёмный терминальный блок с имитацией traceroute |
| `.e404-search` | Поле поиска: отправляет на `/posts/?q=<term>` |

---

## mobile.css — справочник классов

| Класс | Описание |
|---|---|
| `.mob-nav` | Мобильная верхняя навигация (скрыта на десктопе) |
| `.burger` | Кнопка-гамбургер (3 линии → X при открытии) |
| `.mob-drawer` | Выдвижное меню |
| `.mob-bottom-nav` | Нижняя навигационная панель |
| `.mob-bnav-item.active` | `color: var(--accent)` |

| Breakpoint | Что изменяется |
|---|---|
| `max-width: 860px` | Десктопная навигация скрыта, мобильная + нижняя панель видны |
| `max-width: 560px` | Уменьшены отступы; `.cert-grid` → 2 колонки |
| `max-width: 480px` | `.pg-dot` уменьшены до 22px для 49 плиток квиза |

---

## prose.css — типографика статей + общие компоненты

Применяется к `.prose` (тело статьи) и доступна в любом посте, KB или docs.

### Тело статьи

| Селектор | Описание |
|---|---|
| `.prose h2, .prose h3` | Заголовки с `border-bottom` |
| `.prose code` | Inline-код: `background: var(--bg3)` |
| `.prose blockquote` | Цитата: `border-left: 3px solid var(--accent)` |
| `.prose table` | Таблица на всю ширину |
| `.prose a` | `color: var(--accent)` с подчёркиванием |

### Общие компоненты

| Класс | Описание |
|---|---|
| `.intro-card` | Выделенный вводный блок: `border-left: 3px solid var(--accent)` |
| `.sec` | Разделитель секции: uppercase-метка + горизонтальная линия |
| `.code-block` | Обёртка кода: строка с меткой + содержимое Chroma |
| `.code-label` | Строка: язык + кнопка копирования |
| `.copy-btn` | "copy" → "ok!" (сбрасывается через 1.5с) |
| `.ns-grid` | Сетка NS-карточек |
| `.ns-card` | Раскрывающаяся карточка. Анимация через `@keyframes fadeUp`. Своего цвета нет |
| `.ns-card.active` | Раскрытая: `border-color: var(--accent)`; иконка и название тоже уходят в акцент |
| `.ns-header` | Заголовок карточки: иконка + название + флаг + chevron |
| `.ns-icon` | Плитка 38 px со спрайтовой иконкой: `var(--bg3)` + `var(--border)`, `var(--text3)` → `var(--text2)` на hover → `var(--accent)` в активном состоянии |
| `.ns-body` | Скрытое тело, показывается при `.active` |
| `.ns-map` | Виджет карты namespace |
| `.ns-map-btn` | Плитка карты: flex-column, иконка + название + флаг. Hover → `--border2` / `--text2`; `.sel` → акцент |
| `.tabs` | Строка кнопок вкладок |
| `.tab-btn` | Кнопка вкладки. Hover → `--border2` / `--text2`; `.active` → акцент. Hover и active намеренно **разные**, чтобы наведение на неактивную вкладку не выглядело как выбор |
| `.tab-content.active` | Видимая панель вкладки |
| `.ref-panel` | Обёртка справочной таблицы |
| `.ref-panel-head` | Заголовок панели (uppercase) |
| `.ref-panel-body` | Область таблицы с горизонтальной прокруткой |
| `.cheat-table` | Таблица данных внутри `.ref-panel` |
| `.cheat-table .mono` | `color: var(--accent)` |
| `.stag` | Inline-значок типа namespace: одна нейтральная mono-пилюля в uppercase на `var(--bg3)`. Категория и так написана словом, отдельный тон ей не нужен |
| `.stag-general` | Catch-all — прозрачный фон, opacity 0.75, на шаг позади восьми настоящих типов namespace |
| `.back-link` | Ссылка "← Back to posts" внизу страницы |

### Mobile overflow containment (≤ 640 пx)

Широкий контент внутри статей никогда не вызывает горизонтальный скролл страницы. Единый источник правил — под заголовком `MOBILE OVERFLOW CONTAINMENT` в конце `prose.css`.

| Селектор | Правило |
|---|---|
| `.prose table` | `display: block; overflow-x: auto`. Ячейки: `white-space: nowrap` |
| `.prose pre` | `overflow-x: auto`, уменьшенный шрифт, тонкая полоска прокрутки |
| `.prose pre.ascii-art` / `.ascii-art-wrap pre` | Opt-in для нетопологических ASCII (деревья, LDAP). Горизонтальная прокрутка, меньший шрифт на мобиле |
| `.topology` | Горизонтальный скроллер-обёртка. SVG имеет `min-width: 480px` для читаемости |
| `.prose p > code, .prose li > code` | `overflow-wrap: anywhere` для длинного inline-кода |

Защита страницы: `html, body { overflow-x: clip; }` в `global.css`. `min-width: 0` на `main, .post, .prose, .kb-section, .cert-pg-header-inner`.

### TOC sidebar (в `_default/single.html`)

| Класс | Описание |
|---|---|
| `.prose-page.has-toc` | `display: grid; grid-template-columns: 1fr 240px` |
| `.toc-aside` | Правая колонка TOC, sticky |
| `.toc-item` | Ссылка на заголовок |
| `.toc-item.hl` | Активный заголовок: `color: var(--text2)`, `background: var(--bg3)`; его `.toc-dot` уходит в `var(--accent)` |

---

## cert.css — страницы сертификаций

| Класс | Описание |
|---|---|
| `.cert-hero` | Hero-блок. `--cert-color` задаёт цвет границы и текста |
| `.cert-hero-badge` | Emoji-иконка |
| `.cert-hero-name` | Название сертификата |
| `.cert-hero-desc` | Текст описания |
| `.cert-resources` | Flex-строка плиток ресурсов |
| `.cert-resource-card` | Плитка: flex-column, иконка + заголовок + описание |
| `.cert-resource-icon` | Emoji-иконка вверху плитки |
| `.cert-resource-body` | Flex-column обёртка для заголовка и описания |
| `.cert-resource-title` | Заголовок плитки (JetBrains Mono, жирный) |
| `.cert-resource-desc` | Описание плитки |
| `.cert-stats` | Строка статистики: N экзаменов · N тем · N статей |
| `.exam-block` | Группа тем для одного кода экзамена |
| `.exam-label` | Заголовок экзамена (uppercase) |
| `.cert-topic` | Один элемент аккордеона |
| `.cert-topic.open` | Раскрытый: `border-color: var(--accent)` |
| `.cert-topic:not(.has-posts)` | Тема без статей — некликабельна, chevron приглушён |
| `.cert-topic-head` | Кнопка-заголовок аккордеона |
| `.topic-num` | Номер темы: `color: var(--accent)` |
| `.topic-chevron` | `›`, поворачивается на 90° при `.open` |
| `.cert-topic-body` | Тело аккордеона: `max-height: 0` → `scrollHeight` через JS |
| `.cert-post-link` | Ссылка на статью внутри темы |
| `.cert-post-title` | Заголовок статьи: `color: var(--accent)` |

---

## ns.css — layout страницы linux-namespaces

Загружается только для `/kb/linux-namespaces/` — через блок `head` в
`themes/maks/layouts/kb/linux-namespaces.html`. Все общие компоненты (NS-карточки, tabs,
map-кнопки, ref-panel, stags) находятся в `prose.css`.

Страница подчинена одному правилу: **цвет обозначает состояние, иконка — тип.** Акцент
один, и он появляется только на раскрытой карточке, выбранной кнопке карты, активной
вкладке, активном фильтре и подсвеченной точке TOC. В покое всё — `--text2` / `--text3`.

| Класс | Описание |
|---|---|
| `.ns-page-wrap` | Двухколоночная сетка: `1fr 240px` |
| `.ns-page-main` | Левая колонка контента |
| `.ns-page-aside` | Правая боковая панель (sticky, скрыта на мобильном) |
| `.toc-box` | Панель содержания в sidebar |
| `.toc-item` | Ссылка на заголовок в TOC |
| `.toc-item.hl` | Активный заголовок; вложенная `.toc-dot` уходит в акцент |
| `.toc-dot` | Точка рейла, в покое `var(--border)` |
| `.progress-box` | Панель прогресса чтения |
| `.progress-fill` | Анимированная заливка |
| `.filter-row` | Строка кнопок фильтра для таблицы |
| `.f-btn` | Кнопка фильтра. Hover → `--border2` / `--text2` |
| `.f-btn.on` | Активный фильтр: акцент |
| `.ns-pre` | Размеченный вручную блок кода. `ns.css` его больше не стилизует — он наследует от `.code-block pre:not(.chroma)`, а спаны `.cm` / `.out` берут `--code-cmt` / `--code-out` |

---

## Связанные страницы

- [Обзор проекта](/kb/docs/ru/overview/)
- [Шаблоны](/kb/docs/ru/templates/)
- [Frontmatter](/kb/docs/ru/frontmatter/)
- [JavaScript](/kb/docs/ru/javascript/)
