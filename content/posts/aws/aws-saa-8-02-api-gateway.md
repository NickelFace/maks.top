---
title: "AWS SAA — 8.02 API Gateway & AppSync"
date: 2026-05-09
draft: true
description: "REST vs HTTP vs WebSocket APIs, integrations, throttling, caching, authorizers, VPC Link, AppSync GraphQL — full API Gateway coverage for SAA-C03."
tags: ["AWS", "SAA-C03", "API Gateway", "AppSync", "serverless"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-8-02-api-gateway/"
---

## API Types

API Gateway supports three API types — choosing the right one matters for cost, features, and latency.

| Feature | REST API | HTTP API | WebSocket API |
|---|---|---|---|
| Cost | Higher | ~70% cheaper than REST | Per-message + connection |
| Latency | Standard | Lower (optimized) | N/A |
| OIDC/OAuth 2.0 | Via Lambda authorizer | Native | No |
| API Keys + Usage Plans | Yes | No | No |
| Request/Response transformation | Yes (mapping templates) | Limited | No |
| Caching | Yes | No | No |
| WAF integration | Yes | Yes | No |
| Private integrations (VPC Link) | Yes (NLB) | Yes (ALB, NLB, Cloud Map) |  No |
| Resource policies | Yes | No | No |
| Custom domains | Yes | Yes | Yes |
| Use case | Full API management, legacy, complex transforms | Low-latency, cost-optimized, OIDC | Real-time bidirectional |

> **📌 Tip:** Default to HTTP API for new Lambda/HTTP backends where you don't need caching, usage plans, or request transformation. Use REST API when you need those features.

---

## Integration Types

| Type | Description | Use case |
|---|---|---|
| **Lambda Proxy** | Forwards entire request to Lambda; Lambda returns full response | Most common serverless pattern |
| **Lambda Custom** | Mapping templates transform request/response | Complex payload shaping |
| **HTTP Proxy** | Forwards to HTTP endpoint; no transformation | Simple HTTP passthrough |
| **HTTP Custom** | Mapping templates + HTTP endpoint | Transform before forwarding |
| **AWS Service** | Direct AWS service integration (e.g., SQS, DynamoDB) | Serverless without Lambda |
| **Mock** | Returns static response from API Gateway itself | Testing, stubs |

### VPC Link

VPC Link allows API Gateway to access **private resources** inside a VPC:

```
Client → API Gateway → VPC Link → NLB (REST API) → Private EC2 / ECS / RDS
                               → ALB/NLB/Cloud Map (HTTP API)
```

- REST API: integrates with **NLB** only
- HTTP API: integrates with **ALB, NLB, or Cloud Map** (ECS service discovery)
- Resources never need a public IP — traffic stays within AWS network

---

## Throttling

API Gateway applies throttling at multiple levels:

| Level | Default limit |
|---|---|
| Account-level (all APIs combined) | 10,000 RPS (requests per second) |
| Burst (token bucket) | 5,000 concurrent requests |
| Per-stage / per-method | Configurable, up to account limit |
| Per-client (usage plans) | API key–based rate/quota |

When throttled: HTTP 429 `Too Many Requests`.

**Usage Plans + API Keys:**
- Assign rate limits (RPS) and quotas (requests per day/week/month) per API key
- Associate API keys with usage plans; attach plans to stages
- Use case: third-party API access, metered billing

---

## Caching

```yaml
# API Gateway Cache properties
enabled: true
size: 0.5 GB to 237 GB   # per stage
TTL: 0–3600 seconds (default 300s)
cache key: method + path + query strings + headers (configurable)
```

- Cache is **per-stage** — one cache per stage, not per API or method
- Per-method overrides: can enable/disable cache or change TTL per method within a stage
- Flush: manual (`FLUSH_ALL`) or client sends `Cache-Control: max-age=0` (requires `InvalidateCache` permission)
- Additional cost: charged hourly per GB provisioned

> **📌 Tip:** API Gateway caching is per-stage. If you want different cache behavior per path, use per-method overrides within the stage.

---

## Authorizers

### Lambda Authorizer
- Custom function validates a token (JWT, OAuth, custom) and returns an IAM policy
- Two types:
  - **Token-based**: receives bearer token in `Authorization` header
  - **Request-based**: receives full request context (headers, query params, path)
- Result cached by API Gateway (TTL configurable, 0 to 3600s)

### Cognito User Pool Authorizer
- API Gateway validates the JWT token from a Cognito User Pool directly
- No custom code required; built-in
- Only validates the token — authorization (what the user can do) is your responsibility

### IAM Authorization
- Callers sign requests with AWS Signature V4
- Use for internal service-to-service or AWS SDK callers
- No user management — callers need an IAM identity

| Authorizer | Best for |
|---|---|
| Lambda | Custom logic, third-party IdP, API keys in headers |
| Cognito | User-facing apps with Cognito user pools |
| IAM | Internal AWS services, SDK clients |

---

## Stages & Deployments

- Changes to API Gateway are not live until **deployed to a stage**
- Stage: a named snapshot of the API (e.g., `dev`, `staging`, `prod`)
- **Stage variables**: key-value pairs available in mapping templates and Lambda ARNs (e.g., point to different Lambda aliases per stage)
- **Canary deployments**: route a configurable % of traffic to a new deployment; promote or roll back

```yaml
# Stage variable example in Lambda ARN
arn:aws:lambda:us-east-1:123456789012:function:MyFunction:${stageVariables.lambdaAlias}
```

---

## CORS

Cross-Origin Resource Sharing must be configured for browser clients:
- Enable CORS on REST API: API Gateway responds to `OPTIONS` preflight with correct headers
- HTTP API: built-in CORS configuration (simpler)
- Lambda proxy integrations: Lambda itself must return CORS headers in the response

---

## AppSync (Managed GraphQL)

| Feature | Detail |
|---|---|
| Protocol | GraphQL (query, mutation, subscription) |
| Real-time | WebSocket subscriptions — data pushed to clients on mutation |
| Data sources | DynamoDB, Lambda, HTTP, Relational DB (Aurora Serverless), OpenSearch |
| Auth | API key, Cognito User Pools, OIDC, IAM, Lambda |
| Caching | Server-side caching per resolver |
| Conflict detection | Optimistic concurrency for offline sync |
| Use case | Mobile/web apps needing real-time data sync, federated GraphQL |

AppSync vs API Gateway:
- AppSync: GraphQL, real-time subscriptions, offline sync, multiple data sources in one query
- API Gateway: REST/HTTP/WebSocket, per-resource endpoints, not GraphQL

---

## Exam Traps Summary

| Trap | Correct answer |
|---|---|
| HTTP API supports caching | False — only REST API has caching |
| HTTP API supports usage plans | False — REST API only |
| HTTP API is always better | False — REST API when you need caching/usage plans/transforms |
| VPC Link for private resources | Correct — REST API uses NLB; HTTP API uses ALB/NLB/Cloud Map |
| API Gateway cache scope | Per-stage (not per API, not per method by default) |
| Cognito authorizer validates permissions | False — validates token only; authorization is your logic |
| WebSocket API for real-time push | Correct — bidirectional, server can push |
| AppSync use case | GraphQL API with real-time subscriptions and multiple data sources |
