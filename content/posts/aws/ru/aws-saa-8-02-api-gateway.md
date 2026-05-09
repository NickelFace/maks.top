---
title: "AWS SAA — 8.02 API Gateway и AppSync"
date: 2026-05-09
description: "REST vs HTTP vs WebSocket API, интеграции, троттлинг, кеширование, авторизаторы, VPC Link, AppSync GraphQL — полное покрытие API Gateway для SAA-C03."
tags: ["AWS", "SAA-C03", "API Gateway", "AppSync", "serverless"]
categories: ["AWS SAA"]
page_lang: "ru"
lang_pair: "/posts/aws/aws-saa-8-02-api-gateway/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Типы API

API Gateway поддерживает три типа API — правильный выбор важен для стоимости, функций и задержки.

| Функция | REST API | HTTP API | WebSocket API |
|---|---|---|---|
| Стоимость | Выше | ~70% дешевле REST | За сообщение + соединение |
| Задержка | Стандартная | Ниже (оптимизировано) | Н/Д |
| OIDC/OAuth 2.0 | Через Lambda authorizer | Нативно | Нет |
| API Keys + Usage Plans | Да | Нет | Нет |
| Трансформация запросов/ответов | Да (mapping templates) | Ограниченно | Нет |
| Кеширование | Да | Нет | Нет |
| Интеграция WAF | Да | Да | Нет |
| Приватные интеграции (VPC Link) | Да (NLB) | Да (ALB, NLB, Cloud Map) | Нет |
| Resource policies | Да | Нет | Нет |
| Кастомные домены | Да | Да | Да |
| Применение | Полное управление API, legacy, сложные трансформации | Низкая задержка, экономия, OIDC | Real-time двунаправленный |

> **📌 Tip:** Для новых Lambda/HTTP-бэкендов выбирайте HTTP API, если не нужны кеширование, usage plans или трансформация запросов. REST API — когда эти функции нужны.

---

## Типы интеграций

| Тип | Описание | Применение |
|---|---|---|
| **Lambda Proxy** | Передаёт весь запрос в Lambda; Lambda возвращает полный ответ | Самый распространённый serverless-паттерн |
| **Lambda Custom** | Mapping templates трансформируют запрос/ответ | Сложное формирование payload |
| **HTTP Proxy** | Передаёт на HTTP-эндпоинт без трансформации | Простой HTTP-проброс |
| **HTTP Custom** | Mapping templates + HTTP-эндпоинт | Трансформация перед пересылкой |
| **AWS Service** | Прямая интеграция с сервисом AWS (SQS, DynamoDB и т.д.) | Serverless без Lambda |
| **Mock** | Возвращает статический ответ из API Gateway | Тестирование, заглушки |

### VPC Link

VPC Link позволяет API Gateway обращаться к **приватным ресурсам** внутри VPC:

```
Клиент → API Gateway → VPC Link → NLB (REST API) → Приватный EC2 / ECS / RDS
                               → ALB/NLB/Cloud Map (HTTP API)
```

- REST API: интеграция только с **NLB**
- HTTP API: интеграция с **ALB, NLB или Cloud Map** (service discovery ECS)
- Ресурсам не нужен публичный IP — трафик остаётся внутри AWS

---

## Троттлинг

API Gateway применяет ограничения на нескольких уровнях:

| Уровень | Лимит по умолчанию |
|---|---|
| Аккаунт (все API суммарно) | 10 000 RPS |
| Burst (token bucket) | 5 000 параллельных запросов |
| Per-stage / per-method | Настраивается, в пределах лимита аккаунта |
| Per-client (usage plans) | Rate/quota на API-ключ |

При троттлинге: HTTP 429 `Too Many Requests`.

**Usage Plans + API Keys:**
- Задать rate (RPS) и quota (запросов в день/неделю/месяц) на API-ключ
- Связать API-ключи с usage plans; прикрепить plans к stages
- Применение: сторонний доступ к API, тарифицируемый доступ

---

## Кеширование

```yaml
# Свойства кеша API Gateway
enabled: true
size: 0.5 ГБ – 237 ГБ   # per stage
TTL: 0–3600 секунд (по умолчанию 300 с)
ключ кеша: метод + путь + query strings + headers (настраивается)
```

- Кеш **per-stage** — один кеш на stage, не на API и не на метод
- Per-method переопределения: можно включить/отключить кеш или изменить TTL для отдельного метода
- Сброс: вручную (`FLUSH_ALL`) или клиент отправляет `Cache-Control: max-age=0` (требует разрешения `InvalidateCache`)
- Дополнительная стоимость: почасовая оплата per ГБ

> **📌 Tip:** Кеш API Gateway — per-stage. Для разного поведения кеша по путям используйте per-method переопределения внутри stage.

---

## Авторизаторы

### Lambda Authorizer
- Кастомная функция проверяет токен (JWT, OAuth, кастомный) и возвращает IAM-политику
- Два типа:
  - **Token-based**: получает bearer-токен в заголовке `Authorization`
  - **Request-based**: получает весь контекст запроса (заголовки, query-параметры, путь)
- Результат кешируется API Gateway (TTL настраивается: 0–3600 с)

### Cognito User Pool Authorizer
- API Gateway напрямую валидирует JWT-токен из Cognito User Pool
- Кастомный код не нужен; встроен в API Gateway
- Только валидирует токен — авторизация (что пользователь может делать) на вашей стороне

### IAM-авторизация
- Клиенты подписывают запросы с AWS Signature V4
- Для внутреннего service-to-service или AWS SDK клиентов
- Без управления пользователями — клиентам нужна IAM-идентичность

| Авторизатор | Лучше для |
|---|---|
| Lambda | Кастомная логика, сторонний IdP, API-ключи в заголовках |
| Cognito | Пользовательские приложения с Cognito User Pools |
| IAM | Внутренние AWS-сервисы, SDK-клиенты |

---

## Stages и деплои

- Изменения API Gateway не активируются до **деплоя на stage**
- Stage: именованный снимок API (например, `dev`, `staging`, `prod`)
- **Stage variables**: key-value пары, доступные в mapping templates и ARN Lambda (например, разные Lambda aliases на разных stages)
- **Canary deployments**: направить настраиваемый % трафика на новый деплой; продвинуть или откатить

```yaml
# Пример stage variable в ARN Lambda
arn:aws:lambda:us-east-1:123456789012:function:MyFunction:${stageVariables.lambdaAlias}
```

---

## CORS

Cross-Origin Resource Sharing необходим для браузерных клиентов:
- Включить CORS в REST API: API Gateway отвечает на `OPTIONS` preflight с корректными заголовками
- HTTP API: встроенная конфигурация CORS (проще)
- Lambda proxy интеграции: Lambda сама должна возвращать CORS-заголовки в ответе

---

## AppSync (управляемый GraphQL)

| Функция | Детали |
|---|---|
| Протокол | GraphQL (query, mutation, subscription) |
| Real-time | WebSocket-подписки — данные push-ом к клиентам при mutation |
| Источники данных | DynamoDB, Lambda, HTTP, Relational DB (Aurora Serverless), OpenSearch |
| Auth | API key, Cognito User Pools, OIDC, IAM, Lambda |
| Кеширование | Server-side кеш per resolver |
| Обнаружение конфликтов | Optimistic concurrency для оффлайн-синхронизации |
| Применение | Мобильные/веб-приложения с real-time синхронизацией, федеративный GraphQL |

AppSync vs API Gateway:
- AppSync: GraphQL, real-time подписки, оффлайн-синхронизация, несколько источников в одном запросе
- API Gateway: REST/HTTP/WebSocket, ресурсо-ориентированные эндпоинты, не GraphQL

---

## Ловушки на экзамене

| Ловушка | Правильный ответ |
|---|---|
| HTTP API поддерживает кеширование | Ложь — только REST API |
| HTTP API поддерживает usage plans | Ложь — только REST API |
| HTTP API всегда лучше | Ложь — REST API нужен при кеш/usage plans/трансформациях |
| VPC Link для приватных ресурсов | Верно — REST API использует NLB; HTTP API — ALB/NLB/Cloud Map |
| Область кеша API Gateway | Per-stage (не per-API, не per-method по умолчанию) |
| Cognito authorizer проверяет разрешения | Ложь — только валидирует токен; авторизация — ваша логика |
| WebSocket API для real-time push | Верно — двунаправленный, сервер может пушить |
| Сценарий AppSync | GraphQL API с real-time подписками и несколькими источниками данных |
