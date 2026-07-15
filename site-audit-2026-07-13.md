# Аудит maks.top — 13 июля 2026

Проверено: живой сайт (главная, пост, cert-страница, about, RU-версия, robots.txt, sitemap.xml), репозиторий (контент, тема, конфиг, CI), SEO и контент. Ниже — по убыванию важности.

## Критичное

### 1. Сайт застыл на 24 мая — future-dated контент не публикуется

CCNA-статьи в `content/posts/ccna/` датированы 1 июля – 2 октября 2026, лабы в `content/ccna-labs/` — до 28 ноября 2026. Hugo исключает будущие даты при сборке, а сборка происходит только на push. Последний деплой был до 1 июля, поэтому живой сайт показывает: «0 lab walkthroughs» на главной, CCNA «1 / 80 articles», все шесть доменов CCNA — «no articles yet». При этом в репо лежат ~30 готовых CCNA-статей и 25 EN-лаб. Статья от 1 июля уже две недели как должна быть опубликована.

Фикс — одна строка в `.github/workflows/deploy.yml`: добавить `schedule: - cron: '0 20 * * *'` (ежедневно 06:00 Сиднея) в `on:`. Либо отказаться от будущих дат.

### 2. About противоречит главной странице

В `themes/maks/layouts/about/single.html` (строки 165, 170) захардкожено «LPIC-2 · in progress · 57%» и «CCNA · in progress · 45%». Главная при этом показывает LPIC-2 **passed 100%** (credly badge есть) и CCNA **1%**. Рекрутёр, кликнувший «Hire me» с главной, попадает ровно на эту страницу и видит противоречие. Там же устаревшее «available from jun 2026» — июнь прошёл.

Фикс: убрать хардкод из шаблона — либо тянуть данные из `content/certs/*.md` как это делает главная, либо вынести в frontmatter `about.md`. Дату доступности обновить.

## Важное

### 3. Нет og:image — шаринг без превью

`baseof.html` строит `og:image` из `.Params.image | default .Site.Params.og_image`, но ни одна страница не задаёт `image`, а `og_image` в конфиге отсутствует. Все ссылки в LinkedIn/Telegram расшариваются без картинки (`twitter:card: summary` вместо `summary_large_image`). Для сайта, который используется в job search и линкуется из LinkedIn-постов, это заметная потеря. Фикс: одна дефолтная картинка 1200×630 в `static/` + `og_image` в `hugo.toml`.

### 4. Title главной — просто «maks.top»

Ни имени, ни ключевых слов. `<meta description>` хорошая, а title — нет. Фикс в `hugo.toml` или baseof: «Maks Lopunov — Linux & DevOps Knowledge Base».

### 5. AI-краулеры заблокированы Cloudflare

robots.txt (Cloudflare managed) запрещает GPTBot, ClaudeBot, Google-Extended, CCBot и др., плюс `Content-Signal: ai-train=no`. Сайт не будет цитироваться в AI-поиске (ChatGPT, Perplexity, AI Overviews) — а туда всё чаще смотрят и рекрутёры. Это настройка в дашборде Cloudflare (Block AI bots), не в репо. Осознанный выбор — ок, но для personal brand стоит взвесить.

### 6. Нет RSS

`[outputs]` в `hugo.toml` — только HTML. Для технического блога RSS ожидаем (агрегаторы, planet-ы — бесплатный трафик). Фикс: `home = ["HTML", "RSS"]`.

## Мелочи

**robots.txt** — список RU-disallow неполный: `/posts/ccna/ru/`, `/ccna-labs/ru/`, `/roadmap/ru/` не закрыты. Реальной проблемы нет — все RU-страницы имеют `noindex` и canonical на EN, sitemap их не содержит (проверено: 557 URL, RU — 0). Но Disallow мешает роботу увидеть noindex; надёжнее убрать RU-строки из robots.txt целиком и оставить только noindex+canonical.

**Конвенция bilingual** — два отступления: `content/kb/docs/ru/_index.md` без `lang_pair`/`pagefind_ignore`, `content/kb/docs/tags-and-search.md` без `build`-блока.

**Cert-виджет** — `credly_badge_id` заполнен только у lpic-1 и lpic-2; network-engineer/architect показывают «passed» лишь потому, что расчёт дал 100%. AWS SAA на cert-странице «planned Q2 2026» — Q2 прошёл.

**Хардкод счётчиков** — «489 quiz questions» зашито в `index.html:105` и в `certs/ccna.md`, «6 cert tracks active» в `index.html:103`. Разъедется при добавлении контента.

**RU-страницы** — служебные элементы («← Back to posts», хлебные крошки, «5 min read») остаются на английском. Мелко, но глаз цепляет.

**Грамматика** — «1 articles» на cert-страницах (нет ветки singular).

## Что хорошо

Архитектура темы чистая: условная загрузка CSS по секциям, inline critical.css (цвета сверены с global.css — совпадают), кастомный sitemap корректно исключает quiz и RU, схема noindex+canonical для RU-версий рабочая и подтверждена в живом HTML. CI грамотный: submodules, `--minify --gc`, Pagefind, secrets для email/phone, post-build проверка. Контент: 557 md-файлов, 116 опубликованных статей, LPIC-2 закрыт полностью (41/41), 22 AWS-статьи уже написаны в драфтах, RU-пары синхронизированы. Основной актив сайта в отличном состоянии — проблемы почти целиком «витринные»: застывшая сборка и устаревший About.

## Приоритет действий

1. Cron-rebuild в deploy.yml (5 минут, разморозит весь CCNA-контент).
2. Починить About: цифры сертов + дата доступности (15 минут).
3. og:image + title главной (30 минут).
4. RSS, robots.txt, конвенция bilingual, счётчики — по остаточному принципу.
