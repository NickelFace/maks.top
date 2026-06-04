---
title: "Frontmatter — Справочник Полей"
date: 2026-04-11
description: "Все поля frontmatter по типам контента с типами, обязательностью и описаниями"
page_lang: "ru"
lang_pair: "/kb/docs/frontmatter/"
pagefind_ignore: true
build:
  list: never
  render: always
tags: ["docs"]
---

## Что такое frontmatter

Frontmatter — блок YAML в начале каждого `.md` файла между `---`. Hugo читает его и делает доступным в шаблонах через `.Params` и встроенные поля.

```yaml
---
title: "Название"        # встроенное поле → .Title
date: 2026-04-11         # встроенное поле → .Date
my_param: "value"        # кастомное → .Params.my_param
---
```

---

## Встроенные поля Hugo (все типы контента)

| Поле | Тип | Доступ в шаблоне | Описание |
|---|---|---|---|
| `title` | string | `.Title` | Заголовок страницы. Используется в `<title>`, h1, breadcrumb, карточках |
| `date` | date | `.Date` | Дата публикации. Формат: `2026-04-11`. Влияет на сортировку |
| `description` | string | `.Description` | Мета-описание. Используется в `<meta description>` и превью карточек |
| `draft` | bool | `.Draft` | `true` — страница не публикуется при `hugo` (только при `hugo -D`) |
| `tags` | []string | `.Params.tags` | Теги. Создают страницы `/tags/{tag-name}/` |
| `categories` | []string | `.Params.categories` | Категории. Создают страницы `/categories/{name}/` |
| `weight` | int | `.Weight` | Ручная сортировка (меньше = выше) |

---

## Поля для постов (`content/posts/*.md`)

### Используемые в шаблонах

| Поле | Тип | Обязательный | Используется в | Описание |
|---|---|---|---|---|
| `title` | string | **да** | h1, карточка, ToC | Название статьи |
| `date` | date | **да** | карточка, сортировка | Дата публикации |
| `description` | string | рекомендуется | meta, карточка, cert-page | Краткое описание (1-2 предложения) |
| `tags` | []string | рекомендуется | post-meta, фильтры, /tags/ | Теги статьи |
| `categories` | []string | нет | фильтр в `certs/single.html` | Категория (напр. "LPIC-2") |
| `readingtime` | int | нет | `.post-meta` в single.html | Время чтения в минутах |

### Пример для статьи LPIC-2

```yaml
---
title: "LPIC-2 200.1 — Measuring and Diagnosing Resource Usage"
date: 2026-04-10
description: "CPU, memory, disk I/O monitoring: top, vmstat, iostat, sar. LPIC-2 topic 200.1."
tags: ["Linux", "Performance", "LPIC-2", "Monitoring"]
categories: ["LPIC-2"]
---
```

### Как `description` используется в разных местах

| Место | Шаблон | Поведение |
|---|---|---|
| Мета-тег страницы | `baseof.html` | `.Description` или `.Site.Params.description` |
| Карточка в листинге | `list.html` | `.Description` → если нет, то `.Summary` (первые 120 символов) |
| Ссылка в cert-accordion | `certs/single.html` | `.Description` под заголовком |
| Результат поиска Pagefind | Pagefind | excerpt из контента страницы |

---

## Поля для страниц сертификатов (`content/certs/*.md`)

Эти поля — кастомные, читаются через `.Params.*` в `certs/single.html`.

| Поле | Тип | Обязательный | Описание |
|---|---|---|---|
| `title` | string | **да** | Название сертификата (напр. "LPIC-2") |
| `cert_badge` | string | **да** | Emoji-иконка (напр. "🖥️") |
| `cert_color` | string | **да** | CSS-цвет (hex). Используется для `--cert-color` и border |
| `description` | string | **да** | Подзаголовок в hero-блоке |
| `post_prefix` | string | **да** | Префикс для поиска постов по slug (напр. `"lpic2"`) |
| `post_category` | string | **да** | Категория Hugo из постов курса (напр. `"LPIC-2"`). Используется `certs-widget.html` для подсчёта статей |
| `expected_articles` | int | нет | Плановое количество статей — включает авторасчёт % прогресса |
| `progress_pct` | int | нет | Ручной % прогресса, когда `expected_articles` не задан |
| `credly_badge_id` | string | нет | ID бейджа Credly — помечает сертификат как **сданный** |
| `cert_url` | string | нет | Альтернатива `credly_badge_id` — любой URL помечает сертификат как сданный |
| `cert_labs_done` | int | нет | Количество выполненных лаб, отображается в столбце «Статьи» в индексе сертификатов |
| `exams` | []Exam | нет | Список экзаменов с темами. Без него — страница "coming soon" |

### Структура `exams`

```yaml
exams:
  - code: "201"              # Код экзамена (строка)
    title: "Advanced Linux"  # Название экзамена
    topics:
      - num: "200"           # Номер темы (строка!)
        title: "Capacity Planning"
      - num: "201"
        title: "Linux Kernel"
```

> **Важно:** `num` должен быть строкой (без кавычек YAML может интерпретировать как int). В шаблоне он используется для формирования паттерна: `"{post_prefix}-{num}-"`.

### Как `post_prefix` связывает посты с темами

```
post_prefix = "lpic2"
topic.num   = "200"
──────────────────────────────────────────────
Паттерн: "lpic2-200-"

Совпадёт:  lpic2-200-1-capacity-planning.md  ✓
           lpic2-200-2-predict-future.md      ✓
Не совпадёт: lpic2-201-1-kernel.md           ✗
```

Таким образом, **slug файла статьи определяет к какой теме она принадлежит**.

---

## Поля двуязычного контента

Все EN-страницы с RU-копией используют следующие поля. Применяется к постам, KB, docs, ccna-labs.

| Поле | Тип | Страница | Описание |
|---|---|---|---|
| `page_lang` | string | EN + RU | `"en"` или `"ru"` — язык страницы |
| `lang_pair` | string | EN + RU | URL парной страницы на другом языке |
| `pagefind_ignore` | bool | **только RU** | `true` — исключает страницу из поискового индекса Pagefind |
| `build.list` | string | **только RU** | `never` — скрывает страницу из листингов разделов |
| `build.render` | string | **только RU** | `always` — Hugo рендерит страницу, даже если она скрыта из списков |

### Пример EN-страницы
```yaml
page_lang: "en"
lang_pair: "/posts/neteng/ru/neteng-07-ipv4-ipv6/"
```

### Пример RU-страницы
```yaml
page_lang: "ru"
lang_pair: "/posts/neteng/neteng-07-ipv4-ipv6/"
pagefind_ignore: true
build:
  list: never
  render: always
```

> **Без `build: {list: never}`** RU-страница появляется в листинге `/posts/` и удваивает счётчик. Без `pagefind_ignore: true` дублирует контент в поиске.

---

## Поля для страниц KB (`content/kb/*.md`)

### Плоские страницы (прямо в `content/kb/`)

| Поле | Тип | Обязательно | Описание |
|---|---|---|---|
| `title` | string | **да** | Заголовок страницы |
| `description` | string | **да** | Показывается в карточке KB на `/kb/` |
| `icon` | string | нет | Emoji-иконка в карточке |
| `group` | string | **да** | Группа раздела KB. Одно из: `"Linux Core"`, `"Networking"`, `"Cloud & DevOps"`, `"Security"`, `"Cases"` |
| `tags` | []string | рекомендуется | Теги для фильтрации |
| `date` | date | **да** | Должна быть прошедшей — Hugo пропускает будущие/сегодняшние даты |

### `_index.md` подраздела (`content/kb/{name}/_index.md`)

Те же поля, что и у плоских страниц. Дочерние статьи подраздела **не** имеют `group:` — он берётся только из `_index.md`.

---

## Поля постов курса Network Engineer

Посты Network Engineer — двуязычные посты курса с особым форматом. Файлы: `content/posts/neteng/` (EN), `content/posts/neteng/ru/` (RU).

### EN-пост
```yaml
---
title: "Network Engineer — NN. Заголовок"
date: 2026-01-01
description: "..."
tags: [...]
categories: ["Network Engineer"]
code_toggle: true
page_lang: "en"
lang_pair: "/posts/neteng/ru/neteng-NN-slug/"
---
```

### RU-пост
```yaml
---
title: "Network Engineer — NN. Заголовок"
date: 2026-01-01
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
---
```

| Поле | Примечание |
|---|---|
| `code_toggle` | `true` — включает JS-сворачивание `<details>`-блоков с длинным CLI-выводом |
| `categories` | Должно совпадать с `post_category` в frontmatter страницы сертификации |

---

## Поля теоретических статей CCNA

Статьи: `content/posts/ccna/ccna-{domain}-{num}-{slug}.md` (EN), `content/posts/ccna/ru/` (RU).

Пример имени файла: `ccna-1-01-network-components.md` → домен 1, тема 01.

```yaml
# EN
---
title: "CCNA 200-301 — Заголовок"
date: 2026-01-01
tags: [...]
categories: ["CCNA 200-301"]
page_lang: "en"
lang_pair: "/posts/ccna/ru/ccna-1-01-network-components/"
---

# RU shadow
---
title: "CCNA 200-301 — Заголовок"
page_lang: "ru"
lang_pair: "/posts/ccna/ccna-1-01-network-components/"
pagefind_ignore: true
build:
  list: never
  render: always
---
```

Файл `content/posts/ccna/_index.md` имеет `build: {render: never, list: never}` — сам раздел не рендерится.

---

## Поля лабораторных работ CCNA

Лабы: `content/ccna-labs/ccna-lab-NN-slug.md` (EN), `content/ccna-labs/ru/` (RU).

```yaml
# EN
---
title: "CCNA Lab NN — Title"
date: 2026-01-01
description: "..."
tags: [...]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-NN-slug/"
tool: "Packet Tracer"
duration: "30 min"
---

# RU shadow
---
title: "CCNA Лаб NN — Заголовок"
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-NN-slug/"
pagefind_ignore: true
build:
  list: never
  render: always
---
```

| Поле | По умолчанию | Примечание |
|---|---|---|
| `tool` | `"Packet Tracer"` | ПО для лабы, отображается в сетке `/ccna-labs/` |
| `duration` | `"—"` | Расчётное время, отображается в сетке |

---

## Поля для страницы About (`content/about.md`)

`about.md` не использует кастомных полей frontmatter — данные профиля (имя, ссылки) берутся из `hugo.toml [params]`.

```yaml
---
title: "About"
date: 2026-04-01
---
```

Тело `.md` рендерится в `.prose` в `about/single.html`.

---

## Поля для документации (`content/kb/docs/*.md`)

```yaml
---
title: "Название страницы"
date: 2026-04-11
description: "Описание для meta"
page_lang: "en"
lang_pair: "/kb/docs/ru/frontmatter/"
tags: ["docs"]
---
```

Используют стандартный `_default/single.html` с ToC sidebar.

---

## Глобальные параметры сайта (`hugo.toml [params]`)

Доступны в шаблонах как `.Site.Params.*`:

| Параметр | Доступ | Используется в |
|---|---|---|
| `author` | `.Site.Params.author` | `about/single.html` → `.about-name` |
| `description` | `.Site.Params.description` | `baseof.html` → `<meta description>` fallback |
| `location` | `.Site.Params.location` | `about/single.html`, `footer` |
| `github` | `.Site.Params.github` | `about/single.html` → ссылка GH |
| `linkedin` | `.Site.Params.linkedin` | `about/single.html` → ссылка in |
| `telegram` | `.Site.Params.telegram` | `about/single.html` → ссылка ✈ |

---

## Связанные страницы

- [Обзор проекта](/kb/docs/ru/overview/)
- [Шаблоны](/kb/docs/ru/templates/)
- [CSS](/kb/docs/ru/css/)
- [JavaScript](/kb/docs/ru/javascript/)
