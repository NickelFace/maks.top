---
title: "AWS SAA — 8.01 SQS, SNS, Kinesis и EventBridge"
date: 2026-05-09
description: "SQS Standard vs FIFO, SNS fan-out, Kinesis Data Streams vs Firehose, правила EventBridge, Amazon MQ — полное покрытие событийно-ориентированной архитектуры для SAA-C03."
tags: ["AWS", "SAA-C03", "SQS", "SNS", "Kinesis", "EventBridge", "messaging"]
categories: ["AWS SAA"]
page_lang: "ru"
lang_pair: "/posts/aws/aws-saa-8-01-messaging/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## SQS (Simple Queue Service)

### Standard vs FIFO

| Функция | Standard | FIFO |
|---|---|---|
| Порядок | Best-effort (не гарантирован) | Строгий FIFO (внутри группы сообщений) |
| Доставка | At-least-once (возможны дубли) | Exactly-once processing |
| Пропускная способность | Неограниченная | 300 TPS (3000 с батчингом) |
| Дедупликация | Нет | Да — 5-минутное окно |
| Группы сообщений | Нет | Да — `MessageGroupId` для параллелизма |
| Стоимость | Ниже | Выше |

### Ключевые свойства SQS

| Свойство | Значение |
|---|---|
| Visibility timeout | 30 сек по умолчанию; 0–12 часов; скрывает сообщение от других потребителей |
| Retention сообщений | 1 мин – 14 дней (по умолчанию 4 дня) |
| Максимальный размер сообщения | 256 КБ |
| Long polling | До 20 сек; снижает пустые ответы и стоимость |
| Delay queues | 0–15 мин задержка до появления сообщения |
| Dead Letter Queue (DLQ) | После `maxReceiveCount` неудач сообщение перемещается в DLQ |

### SQS Extended Client Library
- Хранить большие сообщения (> 256 КБ) в **S3**; SQS держит указатель
- Java-библиотека; прозрачна для потребителя

> **📌 Tip:** Visibility timeout должен быть больше времени обработки. Если Lambda обрабатывает 5 минут, поставьте не менее 6 минут. Иначе сообщение снова станет видимым и будет обработано дважды.

---

## SNS (Simple Notification Service)

### Основные концепции

| Концепция | Описание |
|---|---|
| **Topic** | Именованный канал сообщений; издатели отправляют в topic |
| **Subscription** | Эндпоинт, получающий сообщения из topic |
| **Publisher** | Любой сервис AWS или приложение |
| **Message filtering** | Подписчики получают только сообщения, соответствующие политике фильтрации (JSON-атрибуты) |

### Протоколы подписки
- HTTP/HTTPS, Email, Email-JSON, SQS, Lambda, Mobile Push (APNs, GCM/FCM, ADM), SMS

### SNS FIFO Topics
- Строгий порядок + дедупликация — работает только с **SQS FIFO-подписками**
- Меньшая пропускная способность (те же лимиты, что у SQS FIFO: 300 TPS / 3000 с батчингом)

---

## Fan-Out паттерн: SNS + SQS

Канонический паттерн публикации одного события нескольким потребителям:

```
Издатель → SNS Topic
               ├── SQS Queue A → Потребитель A (обработать заказ)
               ├── SQS Queue B → Потребитель B (отправить email)
               └── SQS Queue C → Потребитель C (обновить аналитику)
```

Преимущества:
- **Развязка** — издатель не знает о потребителях
- **Надёжность** — SQS буферизует, если потребители медленные
- **Фильтрация** — у каждой SQS-подписки может быть своя политика фильтрации
- S3 event notifications → SNS → несколько SQS-очередей — классический сценарий на экзамене

> **📌 Tip:** Fan-out = SNS → несколько SQS-очередей. Не SNS прямо в Lambda (нет буферизации), не только SQS (один потребитель).

---

## Kinesis Data Streams

### Архитектура

| Компонент | Детали |
|---|---|
| **Shard** | Единица ёмкости; 1 шард = 1 МБ/с запись, 2 МБ/с чтение |
| **Partition key** | Определяет, в какой шард попадёт запись |
| **Sequence number** | Уникальный идентификатор внутри шарда; монотонно возрастает |
| **Retention** | 1–365 дней (по умолчанию 24 ч; Extended: 7 дней; Long-term: 365 дней) |
| **Replay** | Можно перечитать записи в пределах окна retention |
| **Порядок** | Гарантирован внутри шарда (не между шардами) |
| **Потребители** | Standard (2 МБ/с на шард, разделённые) или Enhanced Fan-Out (2 МБ/с на потребителя на шард) |

### Ёмкость
- **Provisioned**: задаёте количество шардов; ручное масштабирование через `SplitShard`/`MergeShards`
- **On-Demand**: автоматически масштабируется; оплата per GB и per shard-hour

### Типичные потребители
- Lambda (триггер из Kinesis), Kinesis Data Analytics, Kinesis Data Firehose, кастомные приложения (KCL/SDK)

---

## Kinesis Data Firehose

| Функция | Детали |
|---|---|
| Тип | Полностью управляемая, почти real-time доставка |
| Задержка | ~60 сек (минимальное время буфера) |
| Replay | Нет — fire and forget |
| Назначения | S3, Redshift (через S3), OpenSearch, HTTP-эндпоинт, Splunk, Datadog |
| Трансформация | Inline-преобразование через Lambda |
| Сжатие | GZIP, Snappy, ZIP для вывода в S3 |
| Без управления шардами | Полностью serverless; масштабируется автоматически |

> **📌 Tip:** Firehose не умеет replay. Если нужна повторная обработка → используйте Kinesis Data Streams (с retention), затем обрабатывайте через Firehose или Lambda.

---

## Kinesis Data Analytics

- Выполнение **SQL-запросов** или приложений **Apache Flink** на потоковых данных
- Real-time аналитика, агрегации, обнаружение аномалий
- Источники: Kinesis Data Streams, Kinesis Data Firehose
- Выходы: Kinesis Data Streams, Kinesis Data Firehose, Lambda

---

## EventBridge (ранее CloudWatch Events)

| Функция | Детали |
|---|---|
| **Event Bus** | Default (события AWS-сервисов), custom, партнёрский |
| **Rules** | Сопоставление паттернов событий → маршрутизация в targets |
| **Targets** | Lambda, SQS, SNS, Step Functions, EC2, ECS, API Gateway, Kinesis, 20+ сервисов |
| **Schedules** | Cron и rate-выражения (например, `rate(5 minutes)`) |
| **Schema Registry** | Обнаружение и хранение схем событий; генерация привязок кода |
| **Партнёрские источники** | Zendesk, Shopify, Datadog, PagerDuty и др. |
| **Cross-account** | Приём событий из других аккаунтов через resource-based policy |

EventBridge — современная замена CloudWatch Events: тот же сервис, больше функций, новые партнёрские интеграции.

---

## Amazon MQ

- Управляемый брокер **ActiveMQ** и **RabbitMQ**
- Для **миграции существующих MQ-нагрузок** в AWS без переписывания приложений
- Поддерживает: AMQP, MQTT, STOMP, OpenWire, JMS (не нативные AWS API)
- Не serverless — провижните инстанс брокера (single или active/standby HA-пара)
- Применение: существующие приложения с ActiveMQ/RabbitMQ-протоколами

> **📌 Tip:** Если на экзамене написано «у компании есть on-premises message broker на AMQP/JMS» → Amazon MQ. Новый greenfield-проект → SQS или SNS.

---

## Сравнение сервисов

| Функция | SQS | SNS | Kinesis Streams | EventBridge |
|---|---|---|---|---|
| Паттерн | Point-to-point очередь | Pub/Sub | Стриминг | Маршрутизация событий |
| Порядок | Только FIFO | Только FIFO topic | Внутри шарда | Нет |
| Replay | Нет | Нет | Да (до 365 дней) | Нет |
| Хранение | До 14 дней | Нет | До 365 дней | Нет |
| Пропускная способность | Неограниченная | Неограниченная | Per шард (1 МБ/с запись) | Неограниченная |
| Задержка | Секунды | Миллисекунды | Миллисекунды | Миллисекунды |
| Fan-out | Нет (один потребитель) | Да (несколько подписок) | Несколько потребителей | Несколько targets |
| Типичное применение | Рабочая очередь, развязка | Уведомления, fan-out | Стриминг логов/событий, аналитика | Автоматизация, маршрутизация |

---

## Ловушки на экзамене

| Ловушка | Правильный ответ |
|---|---|
| Гарантия порядка Kinesis | Только внутри одного шарда |
| Лимит пропускной способности SQS FIFO | 300 TPS (3000 с батчингом) |
| Fan-out паттерн | SNS → несколько SQS-очередей |
| Firehose для replay | Неверно — нет replay; используйте Kinesis Data Streams |
| Amazon MQ для нового greenfield | Неверно — используйте SQS/SNS |
| EventBridge vs CloudWatch Events | Тот же сервис (EventBridge — новое название) |
| Максимальный размер SQS-сообщения | 256 КБ (Extended Client + S3 для больших) |
| SNS FIFO работает с | Только с SQS FIFO-подписками |
