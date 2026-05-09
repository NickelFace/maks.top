---
title: "AWS SAA — 7.01 AWS Lambda"
date: 2026-05-09
description: "Модель выполнения Lambda, триггеры, параллелизм, холодные старты, сетевая работа в VPC, Lambda@Edge vs CloudFront Functions, Destinations и Lambda URLs — полное покрытие SAA-C03."
tags: ["AWS", "SAA-C03", "Lambda", "serverless", "compute"]
categories: ["AWS SAA"]
page_lang: "ru"
lang_pair: "/posts/aws/aws-saa-7-01-lambda/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Модель выполнения

AWS Lambda запускает **stateless, событийно-ориентированные функции** — вы предоставляете код, AWS управляет серверами, масштабированием и runtime.

| Свойство | Лимит / Значение |
|---|---|
| Максимальный timeout | **15 минут** |
| Память | 128 МБ – **10 ГБ** (с шагом 1 МБ) |
| CPU | Пропорционально памяти; при 1792 МБ — 1 полный vCPU |
| Временное хранилище `/tmp` | 512 МБ (по умолчанию) – **10 ГБ** |
| Размер пакета | 50 МБ zip / 250 МБ распакованный (или контейнер до 10 ГБ) |
| Параллельные выполнения | **1000 на регион** (по умолчанию; можно запросить увеличение) |
| Переменные среды | До 4 КБ суммарно |

Lambda масштабируется горизонтально — каждый запрос может запустить новое execution environment. Ограничений на количество функций нет, только на параллелизм.

---

## Триггеры и источники событий

| Источник | Модель вызова | Особенности |
|---|---|---|
| S3 | Async | Уведомление при создании/удалении объекта и т.д. |
| DynamoDB Streams | Poll (поток) | Упорядоченный, exactly-once на шард |
| Kinesis Data Streams | Poll (поток) | Порядок внутри шарда; batch size настраивается |
| SQS | Poll (очередь) | Lambda масштабируется для опустошения очереди; batch до 10 |
| SNS | Async | Fan-out паттерны |
| ALB | Sync | Lambda возвращает ответ в ALB |
| API Gateway | Sync | Интеграции REST/HTTP/WebSocket |
| EventBridge | Async | Правила и расписания |
| Cognito | Sync | Триггеры User Pool (pre-signup, pre-token и т.д.) |
| IoT Rules | Async | Действие IoT Core |

---

## Runtime и Lambda Layers

### Управляемые Runtime
- Node.js, Python, Java, Go, Ruby, .NET (C#/PowerShell), custom runtime (Amazon Linux 2 / AL2023)

### Lambda Layers
- ZIP-архив с библиотеками, кастомными runtime или конфигурацией
- До **5 слоёв** на функцию
- Используются несколькими функциями; уменьшают размер deployment-пакета
- Версия слоя неизменна — для обновления создайте новую версию

### Container Images
- Упакуйте функцию как Docker-образ (ECR) до **10 ГБ**
- Должен реализовывать Lambda Runtime Interface
- Удобно для функций с большими зависимостями (ML-модели и т.д.)

---

## Lambda@Edge vs CloudFront Functions

Оба запускаются на edge-локациях CloudFront для манипуляции HTTP-запросами/ответами.

| Функция | CloudFront Functions | Lambda@Edge |
|---|---|---|
| Расположение | 200+ edge-локаций | ~13 regional edge caches |
| Задержка запуска | Субмиллисекунды | Миллисекунды |
| Максимальная длительность | 1 мс | 5 с (viewer) / 30 с (origin) |
| Память | 2 МБ | 128 МБ – 10 ГБ |
| Runtime | Только JS (ECMAScript 5.1) | Node.js, Python |
| Доступ к сети | Нет | Да |
| Доступ к файловой системе | Нет | Нет |
| Тело запроса | Нет | Да (только origin) |
| Применение | Простая манипуляция заголовками, перезапись URL, A/B-тесты | Сложная логика, аутентификация, внешние вызовы |

> **📌 Tip:** CloudFront Functions — для лёгких преобразований; Lambda@Edge — для всего, что требует сетевых вызовов или сложной логики.

---

## Параллелизм (Concurrency)

### Reserved Concurrency
- **Гарантирует** и **ограничивает** параллелизм функции
- Reserved = 100 → функция никогда не превысит 100 параллельных выполнений
- Защищает другие функции аккаунта от исчерпания лимита
- При reserved = 0 функция полностью throttle-ится (аварийная остановка)

### Provisioned Concurrency
- Заранее инициализирует execution environments — **устраняет холодные старты**
- Оплачивается даже в простое
- Можно использовать Application Auto Scaling для регулировки по расписанию или утилизации
- Применение: latency-sensitive API, функции с медленной инициализацией (JVM, .NET)

### Параллелизм на уровне аккаунта
- По умолчанию: **1000 параллельных выполнений на регион**
- Burst limit: 500–3000 мгновенно, затем +500/мин
- Throttled-запросы возвращают `429 TooManyRequests`

---

## Холодные старты

Холодный старт происходит при создании нового execution environment.

| Фаза | Время |
|---|---|
| Provisioning environment | ~100–500 мс |
| Инициализация runtime | JVM/C#: ~1–10 с; Node.js/Python: ~100 мс |
| Инициализация функции (`init`) | Зависит от вашего кода |
| Выполнение handler | Ваша бизнес-логика |

**Снижение холодных стартов:**
- Используйте provisioned concurrency для предсказуемой задержки
- Прогрев функций по расписанию (менее надёжно)
- Избегайте VPC Lambda без необходимости (добавляет ~10 с исторически; улучшено с Hyperplane ENI)
- Используйте лёгкие runtime (Node.js/Python) для latency-sensitive функций

---

## Lambda в VPC

По умолчанию Lambda работает вне VPC и не имеет доступа к приватным ресурсам.

При размещении Lambda в VPC:
- Lambda создаёт **ENI (Elastic Network Interface)** на пару subnet/SG
- Функция может обращаться к RDS, ElastiCache, EC2 и т.д. в VPC
- **Доступа в интернет нет по умолчанию**
- Для интернета: **NAT Gateway** в публичной подсети + маршрут из приватной подсети Lambda

```yaml
# Сетевой путь Lambda в VPC для доступа в интернет:
Lambda (приватная подсеть) → NAT Gateway (публичная подсеть) → Internet Gateway → Интернет
```

> **📌 Tip:** Lambda в VPC требует NAT Gateway для выхода в интернет. Публичная подсеть сама по себе не даёт Lambda доступа в интернет — Lambda не получает публичный IP даже в публичной подсети.

Для доступа к сервисам AWS из VPC Lambda:
- Используйте **VPC Endpoints** (Interface или Gateway) — без NAT и в пределах AWS

---

## Lambda Destinations

Результаты асинхронных вызовов можно направить в:

| Назначение | Успех | Сбой |
|---|---|---|
| SQS | ✓ | ✓ |
| SNS | ✓ | ✓ |
| Lambda | ✓ | ✓ |
| EventBridge | ✓ | ✓ |

Destinations заменяют старый паттерн DLQ для асинхронных вызовов — предоставляют больше контекста (полное событие + payload ответа).

---

## Lambda URLs

- Встроенный **HTTPS endpoint** для Lambda — API Gateway не нужен
- Формат URL: `https://<url-id>.lambda-url.<region>.on.aws`
- Auth: `NONE` (публичный) или `AWS_IAM`
- Поддержка CORS-конфигурации
- Применение: простые webhooks, single-function API
- Кастомные домены нативно **не поддерживаются** (поставьте CloudFront перед ним)

---

## Переменные среды и секреты

```python
import os
db_host = os.environ['DB_HOST']  # обычная переменная среды
```

Для секретов: интеграция с **AWS Secrets Manager** или **SSM Parameter Store**:
- Execution role Lambda требует разрешения `secretsmanager:GetSecretValue`
- Используйте Lambda Extension для кеширования (избегает вызова Secrets Manager на каждый вызов)

---

## ALB vs API Gateway как триггер Lambda

| Функция | ALB | API Gateway (REST) |
|---|---|---|
| Протокол | HTTP/HTTPS | HTTP/HTTPS |
| WebSocket | Нет | Да |
| Auth | Cognito, OIDC (через правила listener) | Lambda authorizer, Cognito, IAM |
| Стоимость | Per LCU | Per request |
| Target group | Lambda-функция | Lambda / stage |
| Формат запроса | ALB-специфичный JSON | API GW-специфичный JSON |
| Применение | L7-балансировка с Lambda как одним из target | Полное управление API |

---

## Ловушки на экзамене

| Ловушка | Правильный ответ |
|---|---|
| Максимальный timeout Lambda | 15 минут |
| Lambda в VPC нужен NAT для интернета | Верно — нет автоматического интернета из VPC |
| Provisioned concurrency устраняет холодные старты | Верно — но оплачивается даже в простое |
| Reserved concurrency = 0 | Полностью throttle-ит функцию |
| Lambda@Edge для субмиллисекундной логики | Неверно — используйте CloudFront Functions |
| Максимальный размер контейнера Lambda | 10 ГБ |
| Лимит параллельных выполнений по умолчанию | 1000 на регион |
| Lambda@Edge ближе к пользователю, чем Lambda | Верно — regional edge caches, не все PoP |
