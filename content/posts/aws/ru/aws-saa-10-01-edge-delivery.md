---
title: "AWS SAA — 10.01 Edge Delivery и CloudFront"
date: 2026-05-09
description: "CloudFront CDN, Lambda@Edge vs CloudFront Functions, Global Accelerator, S3 Transfer Acceleration — все edge-сервисы доставки для SAA-C03 с ключевыми отличиями и ловушками экзамена."
tags: ["AWS", "SAA-C03", "CloudFront", "Global Accelerator", "CDN", "edge"]
categories: ["AWS SAA"]
page_lang: "ru"
lang_pair: "/posts/aws/aws-saa-10-01-edge-delivery/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## CloudFront — обзор CDN

CloudFront — глобальная сеть доставки контента AWS. Кэширует контент в **edge locations** (400+) и **региональных кэшах** для снижения задержки и нагрузки на origin.

### Origins

| Тип origin | Примечания |
|---|---|
| **S3 bucket** | Используйте OAC (Origin Access Control) для ограничения прямого доступа; поддерживает Transfer Acceleration |
| **ALB** | Origin должен разрешать IP-диапазоны CloudFront в security group |
| **EC2 инстанс** | Должен быть публично доступен или за ALB |
| **Custom HTTP** | Любой публично доступный HTTP/HTTPS endpoint (on-prem, другие облака) |

### Дистрибуции и поведения (behaviors)

- Одна дистрибуция может иметь несколько **origins** и несколько **cache behaviors** (шаблоны путей).
- Behaviors сопоставляются по порядку; поведение по умолчанию (`*`) — последнее.
- Пример: `/api/*` → ALB; `/static/*` → S3; `*` → ALB.

---

## Кэширование CloudFront

### TTL и Cache-Control

| Заголовок / Настройка | Эффект |
|---|---|
| `Cache-Control: max-age=3600` | Браузер и CloudFront кэшируют на 1 час |
| `Cache-Control: no-cache` | CloudFront ревалидирует с origin при каждом запросе |
| **Minimum TTL** | Нижняя граница кэширования CloudFront (перекрывает меньший `max-age`) |
| **Maximum TTL** | Верхняя граница (перекрывает больший `max-age`) |
| **Default TTL** | Используется при отсутствии заголовка `Cache-Control` (по умолчанию: 86400s = 24ч) |

### Cache keys

По умолчанию CloudFront использует только URL-путь. Расширение cache key:
- **Query strings** (форвард всех или конкретных)
- **Headers** (например, `Accept-Language` для мультиязычного контента)
- **Cookies** (только конкретные — форвард всех cookies отключает кэширование)

> **📌 Совет:** Форвард всех заголовков на origin = фактическое отключение кэширования CloudFront. Форвардируйте только те заголовки, которые нужны origin для вариации ответа.

---

## Безопасность CloudFront

### HTTPS

- **Viewer protocol**: только HTTP, только HTTPS, или редирект HTTP → HTTPS
- **Origin protocol**: HTTP или HTTPS (с учётом сертификата origin)
- **Кастомный TLS-сертификат**: через ACM — должен быть в **us-east-1** для CloudFront
- **SNI** (Server Name Indication): по умолчанию, бесплатно; один сертификат на дистрибуцию
- **Dedicated IP**: $600/мес на дистрибуцию — для legacy-клиентов без поддержки SNI

### Гео-ограничение

- **Allowlist**: только указанные страны могут получать доступ
- **Denylist**: блокировать конкретные страны
- На основе геолокации по IP (не по декларируемому местоположению пользователя)

### Signed URLs vs Signed Cookies

| Функция | Signed URL | Signed Cookie |
|---|---|---|
| **Охват** | Один файл | Несколько файлов / весь путь дистрибуции |
| **Случай использования** | Одноразовая ссылка на скачивание, поток видео | Подписка на платный контент |
| **Реализация** | URL содержит параметры `Expires`, `Signature`, `Key-Pair-Id` | Cookie отправляется со всеми запросами |
| **Trusted key group** | Требуется (заменяет устаревший CloudFront key pair) | То же |

> **📌 Совет:** Signed URLs для **отдельных файлов**; Signed Cookies для **нескольких файлов** (например, весь контент в `/premium/`).

---

## OAC vs OAI — ограничение доступа к S3

| | OAI (устаревший) | OAC (текущий) |
|---|---|---|
| **Полное название** | Origin Access Identity | Origin Access Control |
| **Статус** | Deprecated (ещё работает) | Рекомендуется |
| **Поддержка SSE-KMS** | Нет | Да |
| **HTTP-методы** | Только GET | Все (PUT, DELETE для загрузок) |
| **Политика S3-bucket** | `Principal: arn:aws:iam::cloudfront:user/OAI-ID` | `Principal: cloudfront.amazonaws.com` + условие `aws:SourceArn` |

---

## Lambda@Edge vs CloudFront Functions

Оба запускают код на edge locations для манипуляции HTTP-запросами/ответами.

| Функция | Lambda@Edge | CloudFront Functions |
|---|---|---|
| **Runtime** | Node.js, Python | JavaScript (ES5.1) |
| **Макс. время выполнения** | Viewer: 5с / Origin: 30с | 1 мс |
| **Память** | 128 МБ – 10 ГБ | 2 МБ |
| **Фазы запроса/ответа** | Viewer request, viewer response, origin request, origin response | Только viewer request, viewer response |
| **Доступ к сети** | Да (может вызывать внешние API) | Нет |
| **Стоимость** | Выше (цены Lambda) | Ниже (1/6 от Lambda@Edge) |
| **Случаи использования** | A/B тестирование, JWT-валидация, динамический выбор origin, сложные перезаписи | Манипуляция заголовками, URL-перезаписи/редиректы, простые проверки авторизации |

> **📌 Совет:** Lambda@Edge для **сложной логики** (авторизация, A/B тестирование, маршрутизация на origin). CloudFront Functions для **простых, высокочастотных трансформаций** (добавление заголовков, нормализация URL). CloudFront Functions не могут вызывать внешние сервисы.

---

## Логи CloudFront

| Тип логов | Назначение | Задержка |
|---|---|---|
| **Standard logs** | S3 (пакетная доставка) | Задержка в минутах |
| **Real-time logs** | Kinesis Data Streams | Задержка в секундах; настраиваемая частота выборки |

---

## Global Accelerator

Global Accelerator использует магистральную сеть AWS для маршрутизации трафика к оптимальному endpoint.

### Как работает

1. Вы получаете **2 статических Anycast IP-адреса** (неизменны независимо от изменений бэкенда).
2. Клиент подключается к ближайшей AWS edge location через Anycast.
3. Трафик идёт по магистрали AWS (не по публичному интернету) до целевого региона.
4. Цели: ALB, NLB, EC2, Elastic IP — в одном или нескольких регионах.

### Health checks и failover

- Непрерывные проверки работоспособности endpoint.
- При сбое: трафик автоматически переключается на здоровые endpoint в других регионах примерно за 30 секунд.
- **Traffic dials**: контроль процента трафика на каждую группу endpoint.
- **Weights**: распределение трафика внутри группы endpoint.

---

## CloudFront vs Global Accelerator

| Параметр | CloudFront | Global Accelerator |
|---|---|---|
| **Протокол** | HTTP/HTTPS (Layer 7) | TCP, UDP (Layer 4) |
| **Кэширование** | Да — кэширует контент на edge | Нет кэширования |
| **Случай использования** | Веб-контент, API, потоковое видео | Игры, IoT, VoIP, не-HTTP, статический IP |
| **IP-адреса** | Динамические (домен, не статические IP) | 2 статических Anycast IP |
| **DDoS-защита** | Shield Standard + поддержка WAF | Shield Standard |
| **Источник снижения задержки** | Кэширование контента рядом с пользователями | Маршрутизация по магистрали AWS |

> **📌 Совет:** Экзамен спрашивает про "статический IP для глобальной балансировки" или "не-HTTP протокол" → **Global Accelerator**. "HTTP-кэширование на edge" → **CloudFront**.

---

## S3 Transfer Acceleration

Ускоряет загрузки в S3 через маршрутизацию по edge locations CloudFront.

- Клиент загружает в edge location CloudFront (например, `bucket.s3-accelerate.amazonaws.com`).
- Данные идут по магистрали AWS до региона S3-bucket.
- Полезно при загрузке из отдалённых географических мест в конкретный регион.
- Дополнительная стоимость: ~$0.04/ГБ поверх стандартной цены S3 PUT.

> **📌 Совет:** Transfer Acceleration для **загрузок в S3**, не для скачиваний. Для быстрых скачиваний используйте CloudFront.

---

## Edge Locations vs Regional Edge Caches

| | Edge Location | Regional Edge Cache |
|---|---|---|
| **Количество** | 400+ по всему миру | ~13 по всему миру |
| **Назначение** | Ближайшая точка к пользователям; первая проверка кэша | Промежуточный кэш; больший размер, менее популярный контент |
| **TTL** | Короче | Длиннее; хранит контент, вытесненный из edge |

Поток: Пользователь → Edge Location → (cache miss) → Regional Edge Cache → (cache miss) → Origin

---

## Ловушки экзамена

| Ловушка | Правильный ответ |
|---|---|
| "ACM-сертификат для CloudFront в любом регионе" | Должен быть в **us-east-1** |
| "Global Accelerator для HTTP-кэширования" | Global Accelerator **не кэширует** — используйте CloudFront |
| "CloudFront для статического IP" | IP CloudFront динамические — используйте **Global Accelerator** для статических IP |
| "Lambda@Edge для простого добавления заголовков" | Излишне — используйте **CloudFront Functions** (дешевле, быстрее, проще) |
| "CloudFront Functions может вызывать внешние API" | **Не может** — используйте Lambda@Edge для внешних вызовов |
| "OAI для S3 с SSE-KMS шифрованием" | OAI не поддерживает SSE-KMS — используйте **OAC** |
| "Signed URL для подписки на платный контент (много файлов)" | Используйте **Signed Cookies** |
| "S3 Transfer Acceleration для быстрого скачивания" | Transfer Acceleration только для загрузки; используйте **CloudFront** для скачивания |
