---
title: "AWS SAA — 10.01 Edge Delivery & CloudFront"
date: 2026-05-09
draft: true
description: "CloudFront CDN, Lambda@Edge vs CloudFront Functions, Global Accelerator, S3 Transfer Acceleration — all edge delivery services for SAA-C03 with key tradeoffs and exam traps."
tags: ["AWS", "SAA-C03", "CloudFront", "Global Accelerator", "CDN", "edge"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-10-01-edge-delivery/"
---

## CloudFront — CDN Overview

CloudFront is AWS's global Content Delivery Network. It caches content at **edge locations** (400+) and **regional edge caches** to reduce latency and origin load.

### Origins

| Origin type | Notes |
|---|---|
| **S3 bucket** | Use OAC (Origin Access Control) to restrict direct access; supports Transfer Acceleration |
| **ALB** | Origin must allow CloudFront IP ranges in security group |
| **EC2 instance** | Must be publicly accessible or behind ALB |
| **Custom HTTP** | Any publicly reachable HTTP/HTTPS endpoint (on-prem, other clouds) |

### Distributions and behaviors

- One distribution can have multiple **origins** and multiple **cache behaviors** (path patterns).
- Behaviors are matched in order; the default behavior (`*`) is matched last.
- Example: `/api/*` → ALB; `/static/*` → S3; `*` → ALB.

---

## CloudFront Caching

### TTL and Cache-Control

| Header / Setting | Effect |
|---|---|
| `Cache-Control: max-age=3600` | Browser and CloudFront cache for 1 hour |
| `Cache-Control: no-cache` | CloudFront revalidates with origin on every request |
| **Minimum TTL** | Floor for CloudFront caching (overrides lower `max-age`) |
| **Maximum TTL** | Ceiling (overrides higher `max-age`) |
| **Default TTL** | Used when no `Cache-Control` header present (default: 86400s = 24h) |

### Cache keys

By default CloudFront uses only the URL path. Extend the cache key with:
- **Query strings** (forward all or specific)
- **Headers** (e.g., `Accept-Language` for multi-language content)
- **Cookies** (specific cookies only — forwarding all cookies disables caching)

> **📌 Tip:** Forwarding all headers to origin = effectively disabling CloudFront caching. Only forward the headers your origin needs to vary the response.

---

## CloudFront Security

### HTTPS

- **Viewer protocol**: HTTP only, HTTPS only, or redirect HTTP → HTTPS
- **Origin protocol**: HTTP or HTTPS (match origin's certificate)
- **Custom TLS cert**: via ACM — must be in **us-east-1** for CloudFront
- **SNI** (Server Name Indication): default, free; one cert per distribution
- **Dedicated IP**: $600/month per distribution — for legacy clients that don't support SNI

### Geo-restriction

- **Allowlist**: only specified countries can access
- **Denylist**: block specific countries
- Based on IP geolocation (not user-declared location)

### Signed URLs vs Signed Cookies

| Feature | Signed URL | Signed Cookie |
|---|---|---|
| **Scope** | Single file | Multiple files / entire distribution path |
| **Use case** | One-time download link, video stream | Premium content subscription |
| **Implementation** | URL contains `Expires`, `Signature`, `Key-Pair-Id` params | Cookie sent with all requests |
| **Trusted key group** | Required (replaces deprecated CloudFront key pair) | Same |

> **📌 Tip:** Signed URLs for **individual files**; Signed Cookies for **multiple files** (e.g., all content in `/premium/`).

---

## OAC vs OAI — Restricting S3 Access

| | OAI (legacy) | OAC (current) |
|---|---|---|
| **Full name** | Origin Access Identity | Origin Access Control |
| **Status** | Deprecated (still works) | Recommended |
| **SSE-KMS support** | No | Yes |
| **HTTP methods** | GET only | All (PUT, DELETE for upload use cases) |
| **S3 bucket policy** | `Principal: arn:aws:iam::cloudfront:user/OAI-ID` | `Principal: cloudfront.amazonaws.com` + `aws:SourceArn` condition |

---

## Lambda@Edge vs CloudFront Functions

Both run code at edge locations to manipulate HTTP requests/responses.

| Feature | Lambda@Edge | CloudFront Functions |
|---|---|---|
| **Runtime** | Node.js, Python | JavaScript (ES5.1) |
| **Max execution time** | Viewer: 5s / Origin: 30s | 1 ms |
| **Memory** | 128 MB – 10 GB | 2 MB |
| **Request/response phases** | Viewer request, viewer response, origin request, origin response | Viewer request, viewer response only |
| **Network access** | Yes (can call external APIs) | No |
| **File system access** | No | No |
| **Cost** | Higher (Lambda pricing) | Lower (1/6 of Lambda@Edge) |
| **Use cases** | A/B testing, JWT validation, dynamic origin selection, complex rewrites | Header manipulation, URL rewrites/redirects, simple auth checks |

> **📌 Tip:** Lambda@Edge for **complex logic** (auth, A/B testing, origin routing). CloudFront Functions for **simple, high-frequency transformations** (header adds, URL normalization). CloudFront Functions cannot call external services.

---

## CloudFront Logs

| Log type | Destination | Latency |
|---|---|---|
| **Standard logs** | S3 (batch delivery) | Minutes delay |
| **Real-time logs** | Kinesis Data Streams | Seconds delay; configurable sampling rate |

---

## Global Accelerator

Global Accelerator uses the AWS global network backbone to route traffic to the optimal endpoint.

### How it works

1. You get **2 static Anycast IP addresses** (unchanged, regardless of backend changes).
2. Client connects to nearest AWS edge location via Anycast.
3. Traffic travels over AWS backbone (not public internet) to the target region.
4. Targets: ALB, NLB, EC2, Elastic IP — in one or multiple regions.

### Health checks and failover

- Continuous health checks on endpoints.
- On failure: traffic automatically shifts to healthy endpoints in other regions within ~30 seconds.
- **Traffic dials**: control what percentage of traffic goes to each endpoint group.
- **Weights**: distribute traffic within an endpoint group.

---

## CloudFront vs Global Accelerator

| Dimension | CloudFront | Global Accelerator |
|---|---|---|
| **Protocol** | HTTP/HTTPS (Layer 7) | TCP, UDP (Layer 4) |
| **Caching** | Yes — edge caches content | No caching |
| **Use case** | Web content, APIs, video streaming | Gaming, IoT, VoIP, non-HTTP, static IP requirement |
| **IP addresses** | Dynamic (uses domain, not static IPs) | 2 static Anycast IPs |
| **DDoS protection** | Shield Standard + WAF support | Shield Standard |
| **Latency source** | Reduced by caching near users | Reduced by AWS backbone routing |

> **📌 Tip:** If the exam asks for "static IP for global load balancing" or "non-HTTP protocol" → **Global Accelerator**. If it asks for "HTTP caching at edge" → **CloudFront**.

---

## S3 Transfer Acceleration

Speeds up S3 uploads by routing through CloudFront edge locations.

- Client uploads to a CloudFront edge location (e.g., `bucket.s3-accelerate.amazonaws.com`).
- Data travels over AWS backbone to the S3 bucket region.
- Useful when uploading from distant geographic locations to a specific region.
- Extra cost: ~$0.04/GB on top of standard S3 PUT pricing.

> **📌 Tip:** Transfer Acceleration is for **uploads to S3**, not downloads. For faster downloads use CloudFront.

---

## Edge Locations vs Regional Edge Caches

| | Edge Location | Regional Edge Cache |
|---|---|---|
| **Count** | 400+ worldwide | ~13 worldwide |
| **Purpose** | Closest point to end users; first cache check | Mid-tier cache; larger, less frequent content |
| **TTL** | Shorter | Longer; holds less popular content evicted from edge |

Flow: User → Edge Location → (cache miss) → Regional Edge Cache → (cache miss) → Origin

---

## Exam Traps Summary

| Trap | Correct answer |
|---|---|
| "ACM cert for CloudFront in any region" | Must be in **us-east-1** |
| "Global Accelerator for HTTP caching" | Global Accelerator does **not cache** — use CloudFront |
| "CloudFront for static IP requirement" | CloudFront IPs are dynamic — use **Global Accelerator** for static IPs |
| "Lambda@Edge for simple header adds" | Overkill — use **CloudFront Functions** (cheaper, faster, simpler) |
| "CloudFront Functions can call external APIs" | **Cannot** — use Lambda@Edge for external calls |
| "OAI for SSE-KMS encrypted S3" | OAI doesn't support SSE-KMS — use **OAC** |
| "Signed URL for premium subscription (many files)" | Use **Signed Cookies** instead |
| "S3 Transfer Acceleration for faster downloads" | Transfer Acceleration is upload-only; use **CloudFront** for downloads |
