---
title: "AWS SAA — 8.01 SQS, SNS, Kinesis & EventBridge"
date: 2026-05-09
draft: true
description: "SQS Standard vs FIFO, SNS fan-out, Kinesis Data Streams vs Firehose, EventBridge rules, Amazon MQ — full messaging and event-driven architecture coverage for SAA-C03."
tags: ["AWS", "SAA-C03", "SQS", "SNS", "Kinesis", "EventBridge", "messaging"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-8-01-messaging/"
---

## SQS (Simple Queue Service)

### Standard vs FIFO

| Feature | Standard | FIFO |
|---|---|---|
| Ordering | Best-effort (not guaranteed) | Strict FIFO (within message group) |
| Delivery | At-least-once (duplicates possible) | Exactly-once processing |
| Throughput | Unlimited | 300 TPS (3,000 with batching) |
| Deduplication | No | Yes — 5-minute deduplication window |
| Message groups | No | Yes — `MessageGroupId` for parallelism within FIFO |
| Cost | Lower | Higher |

### Key SQS Properties

| Property | Value |
|---|---|
| Visibility timeout | 30s default; 0–12 hours; hides message from other consumers during processing |
| Message retention | 1 min – 14 days (default 4 days) |
| Max message size | 256 KB |
| Long polling | Up to 20s; reduces empty responses and cost |
| Delay queues | 0–15 min delay before message becomes visible |
| Dead Letter Queue (DLQ) | After `maxReceiveCount` failures, message moved to DLQ |

### SQS Extended Client Library
- Store large messages (> 256 KB) in **S3**; SQS holds a pointer
- Java library; transparent to consumer

> **📌 Tip:** Visibility timeout must be longer than your processing time. If Lambda processes in 5 minutes, set visibility timeout to at least 6 minutes. Otherwise the message reappears and gets processed twice.

---

## SNS (Simple Notification Service)

### Core Concepts

| Concept | Description |
|---|---|
| **Topic** | Named message channel; publishers send to topic |
| **Subscription** | Endpoint that receives messages from topic |
| **Publisher** | Any AWS service or application that sends to a topic |
| **Message filtering** | Subscribers get only messages matching their filter policy (JSON attribute matching) |

### Subscription Protocols
- HTTP/HTTPS, Email, Email-JSON, SQS, Lambda, Mobile Push (APNs, GCM/FCM, ADM), SMS

### SNS FIFO Topics
- Strict ordering + deduplication — only works with **SQS FIFO subscriptions**
- Lower throughput than standard SNS (same limits as SQS FIFO: 300 TPS / 3,000 with batching)

---

## Fan-Out Pattern: SNS + SQS

The canonical pattern for publishing one event to multiple consumers:

```
Publisher → SNS Topic
               ├── SQS Queue A → Consumer A (process order)
               ├── SQS Queue B → Consumer B (send email)
               └── SQS Queue C → Consumer C (update analytics)
```

Benefits:
- **Decoupled** — publisher doesn't know about consumers
- **Durable** — SQS buffers messages if consumers are slow
- **Filterable** — each SQS subscription can have a filter policy
- S3 event notifications → SNS → multiple SQS queues is a classic exam scenario

> **📌 Tip:** Fan-out = SNS → multiple SQS queues. Not SNS to Lambda directly (no buffering), not SQS alone (single consumer).

---

## Kinesis Data Streams

### Architecture

| Component | Detail |
|---|---|
| **Shard** | Unit of capacity; 1 shard = 1 MB/s write, 2 MB/s read |
| **Partition key** | Determines which shard receives the record |
| **Sequence number** | Unique identifier within a shard; monotonically increasing |
| **Retention** | 1–365 days (default 24h; Extended: 7 days; Long-term: 365 days) |
| **Replay** | Can re-read records within retention window |
| **Ordering** | Guaranteed within a shard (not across shards) |
| **Consumers** | Standard (2 MB/s per shard shared) or Enhanced Fan-Out (2 MB/s per consumer per shard) |

### Capacity
- **Provisioned**: specify shard count; manual scaling with `SplitShard`/`MergeShards`
- **On-Demand**: automatically scales; pay per GB and per shard-hour

### Common Consumers
- Lambda (trigger from Kinesis), Kinesis Data Analytics, Kinesis Data Firehose, custom apps (KCL/SDK)

---

## Kinesis Data Firehose

| Feature | Detail |
|---|---|
| Type | Fully managed, near-real-time delivery |
| Latency | ~60s (minimum buffer time) |
| Replay | No — fire and forget |
| Destinations | S3, Redshift (via S3), OpenSearch, HTTP endpoint, Splunk, Datadog |
| Transform | Lambda function inline transformation |
| Compression | GZIP, Snappy, ZIP for S3 output |
| No shard management | Fully serverless; scales automatically |

> **📌 Tip:** Firehose cannot replay data. If replay/reprocessing is required → use Kinesis Data Streams (store data with retention), then process with Firehose or Lambda.

---

## Kinesis Data Analytics

- Run **SQL queries** or **Apache Flink** applications against streaming data
- Real-time analytics, aggregations, anomaly detection
- Sources: Kinesis Data Streams, Kinesis Data Firehose
- Outputs: Kinesis Data Streams, Kinesis Data Firehose, Lambda

---

## EventBridge (formerly CloudWatch Events)

| Feature | Detail |
|---|---|
| **Event Bus** | Default (AWS service events), custom, partner |
| **Rules** | Pattern-match events → route to targets |
| **Targets** | Lambda, SQS, SNS, Step Functions, EC2, ECS, API Gateway, Kinesis, 20+ services |
| **Schedules** | Cron and rate expressions (e.g., `rate(5 minutes)`) |
| **Schema Registry** | Discover and store event schemas; code bindings for typed access |
| **Partner event sources** | Zendesk, Shopify, Datadog, PagerDuty, etc. |
| **Cross-account** | Ingest events from other accounts via resource-based policy |

EventBridge is the modern replacement for CloudWatch Events — same service, more features, new partner integrations.

---

## Amazon MQ

- Managed **ActiveMQ** and **RabbitMQ** broker
- For **migrating existing MQ workloads** to AWS without rewriting applications
- Supports: AMQP, MQTT, STOMP, OpenWire, JMS (not native AWS APIs)
- Not serverless — you provision a broker instance (single or active/standby HA pair)
- Use case: existing apps using ActiveMQ/RabbitMQ protocols; cannot change to SQS/SNS

> **📌 Tip:** If the exam says "the company has an existing on-premises message broker using AMQP/JMS and wants to migrate to AWS" → Amazon MQ. If it's a new greenfield project → SQS or SNS.

---

## Service Comparison

| Feature | SQS | SNS | Kinesis Streams | EventBridge |
|---|---|---|---|---|
| Pattern | Point-to-point queue | Pub/Sub | Streaming | Event routing |
| Ordering | FIFO only | FIFO topic only | Within shard | No |
| Replay | No | No | Yes (up to 365 days) | No |
| Persistence | Up to 14 days | No | Up to 365 days | No |
| Throughput | Unlimited | Unlimited | Per shard (1 MB/s write) | Unlimited |
| Latency | Seconds | Milliseconds | Milliseconds | Milliseconds |
| Fan-out | No (single consumer) | Yes (multiple subs) | Multiple consumers | Multiple targets |
| Typical use | Work queue, decoupling | Notifications, fan-out | Log/event streaming, analytics | Automation, event routing |

---

## Exam Traps Summary

| Trap | Correct answer |
|---|---|
| Kinesis order guarantee | Only within a single shard |
| SQS FIFO throughput limit | 300 TPS (3000 with batching) |
| Fan-out pattern | SNS → multiple SQS queues |
| Firehose for replay | Wrong — no replay; use Kinesis Data Streams |
| Amazon MQ for new greenfield | Wrong — use SQS/SNS |
| EventBridge vs CloudWatch Events | Same service (EventBridge is the new name) |
| SQS message max size | 256 KB (use Extended Client + S3 for larger) |
| SNS FIFO works with | SQS FIFO subscriptions only |
