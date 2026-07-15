# Задание: фиксы по аудиту maks.top (site-audit-2026-07-13.md)

Контекст: Hugo-сайт, тема в `themes/maks/` (git submodule — коммитить изменения темы нужно в submodule, потом обновить указатель в основном репо). Деплой-ветка `hugo`. Перед началом прочитай `CLAUDE.md`. Ничего сверх перечисленного не менять. `public/` не трогать.

## Fix 1 — cron-rebuild (критично)

Файл: `.github/workflows/deploy.yml`.
В блок `on:` добавить:

```yaml
schedule:
  - cron: '0 20 * * *'   # 06:00 Sydney (AEST)
```

Причина: контент в `content/posts/ccna/` и `content/ccna-labs/` датирован будущим (до ноября 2026); без периодической пересборки он никогда не публикуется — сайт застыл на 24 мая.

Проверка: `yamllint` или мысленный парс — `schedule` на одном уровне с `push`; существующие триггеры не сломаны.

## Fix 2 — About: цифры сертов и дата (критично)

Файл: `themes/maks/layouts/about/single.html`, строки ~165 и ~170.
Захардкожено «LPIC-2 · in progress · 57%» и «CCNA · in progress · 45%». Это противоречит главной (LPIC-2 passed 100%, CCNA ~1%).

Правка: заменить хардкод на данные из cert-страниц — по образцу `themes/maks/layouts/index.html` (строки 1–71: расчёт `$l2Pct`, `$ccnaPct`, определение state passed/in progress/planned). LPIC-2 должен показывать «passed» (у `content/certs/lpic-2.md` есть `credly_badge_id` — это признак passed, см. CLAUDE.md). Минимально: продублировать логику расчёта; лучше: вынести в partial и использовать в обоих шаблонах, если это не тянет за собой переписывание index.html.

Там же в `content/about.md` или шаблоне: «available from jun 2026» — устарело, заменить на «available now» (уточнить у Максa, если сомнение — оставить «available now»).

Проверка: `hugo server`, открыть `/about/` — статусы LPIC-2/CCNA совпадают с главной; grep по «57%» и «45%» в теме даёт пусто.

## Fix 3 — og:image + title главной

1. `hugo.toml`: в `[params]` добавить `og_image = "/og-default.png"`. Картинку 1200×630 создать в `static/og-default.png` — тёмный фон `#16140F`, текст «maks.top — Linux & DevOps Knowledge Base» цветом `#ECE7DA` (стиль сайта — dark terminal; можно сгенерировать простым Python/PIL, без внешних ассетов).
2. Title главной: сейчас `<title>` на home — просто «maks.top». В `baseof.html` для home сделать «Maks Lopunov — Linux & DevOps Knowledge Base» (или взять из нового параметра `home_title` в hugo.toml).

Проверка: `hugo` собирается; в `public/index.html` есть `og:image` с абсолютным URL и новый `<title>`; `twitter:card` стал `summary_large_image` (условие уже есть в baseof.html:34).

## Fix 4 — RSS

`hugo.toml`, блок `[outputs]`: `home = ["HTML", "RSS"]`.
Проверка: после сборки существует `public/index.xml`; в нём нет RU-страниц (`page_lang: ru`) — если есть, добавить фильтр в кастомный RSS-шаблон (создать `layouts/rss.xml` по аналогии с `layouts/sitemap.xml`).

## Fix 5 — мелочи (одним коммитом)

1. `static/robots.txt`: удалить все строки `Disallow: /*/ru/...` (RU уже закрыт через noindex + canonical + отсутствие в sitemap; Disallow только мешает роботу увидеть noindex). Оставить `Disallow: /ccna-quiz/` и `Sitemap:`.
2. `content/kb/docs/tags-and-search.md`: добавить `build: {list: never, render: always}`? НЕТ — это EN-страница; ей нужен только штатный EN-frontmatter. Свериться с `content/kb/docs/frontmatter.md` и привести к конвенции (там не хватает build-блока по аудиту — проверить, что именно требуется для EN-страниц в docs, и не сломать листинг).
3. `content/certs/aws-saa.md`: «Q2 2026» в описании/ресурсах заменить на актуальный срок (Q3 2026).
4. Cert-шаблон `themes/maks/layouts/certs/single.html`: «1 articles» → добавить ветку единственного числа («1 article»).

## Что НЕ делать

Не трогать: bilingual-схему (noindex/canonical), Cloudflare-настройки, счётчик «489 quiz questions» (отдельная задача), драфты AWS, `content/posts/neteng|netarch`.

## Финальная проверка

`hugo --minify --gc` без ошибок и warning'ов; `hugo server` — глазами проверить `/`, `/about/`, `/certs/ccna/`. Diff должен касаться только файлов, перечисленных выше. Коммиты: отдельно для submodule темы и для основного репо, сообщения по существу (en).
