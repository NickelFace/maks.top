---
title: "AWS SAA — 7.01 AWS Lambda"
date: 2026-05-09
draft: true
description: "Lambda execution model, triggers, concurrency, cold starts, VPC networking, Lambda@Edge vs CloudFront Functions, Destinations, and Lambda URLs — full SAA-C03 coverage."
tags: ["AWS", "SAA-C03", "Lambda", "serverless", "compute"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-7-01-lambda/"
---

## Execution Model

AWS Lambda runs **stateless, event-driven functions** — you provide code, AWS manages servers, scaling, and runtime.

| Property | Limit / Value |
|---|---|
| Max timeout | **15 minutes** |
| Memory | 128 MB – **10 GB** (in 1 MB increments) |
| CPU | Proportional to memory; at 1792 MB you get 1 full vCPU |
| Ephemeral storage `/tmp` | 512 MB (default) – **10 GB** |
| Package size | 50 MB zipped / 250 MB unzipped (or container image up to 10 GB) |
| Concurrent executions | **1000 per region** (default; can request increase) |
| Environment variables | Up to 4 KB total |

Lambda scales horizontally — each request can trigger a new execution environment. There is no limit on the number of Lambda functions, only on concurrency.

---

## Triggers & Event Sources

| Source | Invocation model | Notes |
|---|---|---|
| S3 | Async | Event notification on object create/delete/etc. |
| DynamoDB Streams | Poll (stream) | Ordered, exactly-once per shard |
| Kinesis Data Streams | Poll (stream) | Ordered within shard; batch size configurable |
| SQS | Poll (queue) | Lambda scales to drain the queue; batch size up to 10 (standard) or 10 (FIFO) |
| SNS | Async | Fan-out patterns |
| ALB | Sync | Lambda returns response to ALB |
| API Gateway | Sync | REST/HTTP/WebSocket integrations |
| EventBridge | Async | Rules and schedules |
| Cognito | Sync | User pool triggers (pre-signup, pre-token, etc.) |
| IoT Rules | Async | IoT Core action |

---

## Runtimes & Lambda Layers

### Managed Runtimes
- Node.js, Python, Java, Go, Ruby, .NET (C#/PowerShell), custom runtime (Amazon Linux 2 / AL2023)

### Lambda Layers
- A ZIP archive with libraries, custom runtimes, or configuration
- Up to **5 layers** per function
- Shared across multiple functions; reduces deployment package size
- Layer version is immutable — create a new version to update

### Container Images
- Package function as a Docker image (ECR) up to **10 GB**
- Must implement Lambda Runtime Interface
- Useful for functions with large dependencies (ML models, etc.)

---

## Lambda@Edge vs CloudFront Functions

Both run at CloudFront edge locations to manipulate HTTP requests/responses.

| Feature | CloudFront Functions | Lambda@Edge |
|---|---|---|
| Location | 200+ edge locations | ~13 regional edge caches |
| Latency | Sub-millisecond startup | Millisecond startup |
| Max duration | 1 ms | 5 s (viewer) / 30 s (origin) |
| Memory | 2 MB | 128 MB – 10 GB |
| Runtime | JS only (ECMAScript 5.1) | Node.js, Python |
| Network access | No | Yes |
| File system access | No | No |
| Request body | No | Yes (origin only) |
| Use case | Simple header manipulation, URL rewrites, A/B testing | Complex logic, auth, third-party calls |

> **📌 Tip:** CloudFront Functions for lightweight transforms; Lambda@Edge for anything requiring network calls or complex logic.

---

## Concurrency

### Reserved Concurrency
- **Guarantees** and **limits** concurrency for a function
- Set reserved = 100 → function can never exceed 100 concurrent executions
- Protects other functions in the account from being starved
- When reserved concurrency = 0, the function is throttled completely (can use for emergency stop)

### Provisioned Concurrency
- Pre-initializes execution environments — **eliminates cold starts**
- You pay for provisioned concurrency even when idle
- Can use Application Auto Scaling to adjust provisioned concurrency based on schedule or utilization
- Use for: latency-sensitive APIs, functions with slow initialization (JVM, .NET)

### Account-Level Concurrency
- Default: **1000 concurrent executions per region**
- Burst limit: 500–3000 concurrent executions immediately, then +500/minute
- Throttled requests return `429 TooManyRequests`

---

## Cold Starts

A cold start occurs when Lambda creates a new execution environment.

| Phase | Time |
|---|---|
| Environment provisioning | ~100–500 ms |
| Runtime initialization | JVM/C#: ~1–10 s; Node.js/Python: ~100 ms |
| Function initialization (`init`) | Depends on your code |
| Handler execution | Your business logic |

**Cold start mitigation:**
- Use provisioned concurrency for predictable latency
- Keep functions warm with scheduled pings (less reliable)
- Avoid VPC Lambda if not needed (adds ~10s on first cold start historically; improved with Hyperplane ENI)
- Use lighter runtimes (Node.js/Python) for latency-sensitive functions

---

## Lambda in VPC

By default, Lambda runs outside your VPC and cannot access private resources.

When Lambda is deployed into a VPC:
- Lambda creates an **ENI (Elastic Network Interface)** per subnet/SG pair
- Function can access RDS, ElastiCache, EC2, etc. in the VPC
- **No internet access by default** — even though Lambda normally has it
- For internet: add a **NAT Gateway** in a public subnet + route from Lambda's private subnet

```yaml
# Lambda VPC network flow for internet access:
Lambda (private subnet) → NAT Gateway (public subnet) → Internet Gateway → Internet
```

> **📌 Tip:** Lambda in VPC needs a NAT Gateway for internet access. A public subnet alone does not give Lambda internet access — Lambda doesn't get a public IP even in a public subnet.

For AWS service access from VPC Lambda:
- Use **VPC Endpoints** (Interface or Gateway) to avoid NAT costs and keep traffic within AWS

---

## Lambda Destinations

Asynchronous invocations can route results to:

| Destination | Success | Failure |
|---|---|---|
| SQS | ✓ | ✓ |
| SNS | ✓ | ✓ |
| Lambda | ✓ | ✓ |
| EventBridge | ✓ | ✓ |

Destinations replace the older DLQ pattern for async invocations — they provide more context (full event + response payload) than a DLQ.

---

## Lambda URLs

- Built-in **HTTPS endpoint** for a Lambda function — no API Gateway required
- URL format: `https://<url-id>.lambda-url.<region>.on.aws`
- Auth: `NONE` (public) or `AWS_IAM`
- Supports CORS configuration
- Use case: simple webhooks, single-function APIs
- Does **not** support custom domain names natively (use CloudFront in front for that)

---

## Environment Variables & Secrets

```python
import os
db_host = os.environ['DB_HOST']  # plain env var
```

For secrets: integrate with **AWS Secrets Manager** or **SSM Parameter Store**:
- Lambda execution role needs `secretsmanager:GetSecretValue` permission
- Use Lambda Extension for caching (avoids a Secrets Manager call on every invocation)

---

## ALB vs API Gateway as Lambda Trigger

| Feature | ALB | API Gateway (REST) |
|---|---|---|
| Protocol | HTTP/HTTPS | HTTP/HTTPS |
| WebSocket | No | Yes |
| Auth | Cognito, OIDC (via listener rules) | Lambda authorizer, Cognito, IAM |
| Cost | Per LCU | Per request |
| Target group | Lambda function | Lambda function / stage |
| Request format | ALB-specific JSON | API GW-specific JSON |
| Use case | L7 load balancing with Lambda as one target | Full API management |

---

## Exam Traps Summary

| Trap | Correct answer |
|---|---|
| Lambda max timeout | 15 minutes |
| Lambda in VPC needs NAT for internet | True — no automatic internet from VPC |
| Provisioned concurrency eliminates cold starts | True — but costs money even when idle |
| Reserved concurrency = 0 | Completely throttles the function |
| Lambda@Edge for sub-ms logic | Wrong — use CloudFront Functions |
| Lambda container image max size | 10 GB |
| Default concurrent execution limit | 1000 per region |
| Lambda@Edge runs closer to user than Lambda | True — regional edge caches, not all PoPs |
