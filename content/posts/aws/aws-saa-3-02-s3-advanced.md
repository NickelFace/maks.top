---
title: "AWS SAA — 3.02 S3 Advanced"
date: 2026-05-09
draft: true
description: "Lifecycle rules, replication, performance optimization, event notifications, Object Lock, pre-signed URLs, S3 Select, and Access Points — SAA-C03 deep dive."
tags: ["AWS", "SAA-C03", "S3", "Storage"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-3-02-s3-advanced/"
---

## S3 Advanced Features

This article covers features that appear heavily in SAA-C03 scenario questions: how data moves, how it performs at scale, and how it's protected.

---

## Lifecycle Rules

Lifecycle rules automate transitions between storage classes and expiration of objects.

### Transition Actions

| Rule Type | What It Does |
|---|---|
| Transition | Move object to a cheaper storage class after N days |
| Expiration | Delete objects (or versions) after N days |
| Abort incomplete multipart uploads | Clean up partial uploads after N days |

**Timing constraints (minimum days before transition):**

| From | To | Min Days |
|---|---|---|
| Standard | Standard-IA or One Zone-IA | **30 days** |
| Standard | Glacier Instant Retrieval | **90 days** |
| Standard-IA | Glacier | 0 (no extra minimum from IA) |
| Any class | Glacier Deep Archive | 0 (but object must meet class min duration) |

> **📌 Tip:** The 30-day minimum for Standard → Standard-IA is a common exam trap. You cannot transition to IA sooner than 30 days regardless of lifecycle rule configuration.

**Lifecycle rules apply to:**
- Current object versions
- Non-current versions (when versioning is enabled)
- Incomplete multipart uploads

**Practical pattern — tiered archival:**
```
Day 0:   Upload → Standard
Day 30:  Auto-transition → Standard-IA
Day 90:  Auto-transition → Glacier Instant Retrieval
Day 365: Auto-transition → Glacier Deep Archive
Day 730: Expire (delete)
```

---

## Replication

### CRR vs SRR

| Feature | CRR (Cross-Region Replication) | SRR (Same-Region Replication) |
|---|---|---|
| Destination region | Different region | Same region |
| Use case | Compliance, latency reduction, DR | Log aggregation, live copy between accounts |
| Versioning required | **Both** source and destination must have versioning enabled | Same requirement |
| Latency | Higher (inter-region) | Lower |

**Key behaviors:**
- Only **new objects** are replicated after replication is configured — existing objects are **not replicated retroactively** (use S3 Batch Operations for that)
- Delete markers are optionally replicated (not by default)
- Deletion of a specific version is **not replicated** (prevents accidental cascading deletes)
- Replication is **not transitive**: if A replicates to B and B replicates to C, A does not replicate to C

### Replication Time Control (RTC)

- SLA: 99.99% of objects replicated **within 15 minutes**
- Costs extra (additional per-GB and per-object charges)
- Includes replication metrics in CloudWatch

> **📌 Tip:** Default replication has no time guarantee. RTC is the answer when an exam scenario requires a specific replication latency bound.

---

## S3 Performance

### Baseline Throughput

S3 automatically scales to high request rates. Baseline per prefix:

| Operation | Requests/Second per Prefix |
|---|---|
| PUT/COPY/POST/DELETE | **3,500** |
| GET/HEAD | **5,500** |

**Prefix parallelism:** Spread objects across multiple prefixes to multiply throughput. Four prefixes = 22,000 GET/s.

```
bucket/2024-01/images/...
bucket/2024-02/images/...
bucket/2024-03/images/...
```

### Multipart Upload

| Threshold | Recommendation |
|---|---|
| > 100 MB | Recommended |
| > 5 GB | **Required** |

Benefits: parallel upload, retry individual parts, resume interrupted uploads.

```bash
# Initiate
aws s3api create-multipart-upload --bucket my-bucket --key large-file.zip

# Upload parts (each ≥ 5 MB except last)
aws s3api upload-part --bucket my-bucket --key large-file.zip \
  --part-number 1 --upload-id <id> --body part1.bin

# Complete
aws s3api complete-multipart-upload --bucket my-bucket --key large-file.zip \
  --upload-id <id> --multipart-upload file://parts.json
```

### Transfer Acceleration

- Routes uploads through **CloudFront edge locations** → AWS backbone → S3 bucket
- Faster for uploads from geographically distant clients
- Uses distinct endpoint: `<bucket>.s3-accelerate.amazonaws.com`
- Costs extra per GB transferred

> **📌 Tip:** Transfer Acceleration benefits **uploads** (PUT) — not necessarily downloads. The exam often tests this direction. Also, it's only useful for cross-region or long-distance uploads — local users get no benefit.

### Byte-Range Fetches

Request only a portion of an object using HTTP `Range` header. Enables:
- Parallel downloads (split large file, download parts concurrently)
- Retrieve just the header of a file (e.g., first 256 bytes)

---

## Event Notifications

S3 can trigger downstream processing when objects are created, deleted, or restored.

| Destination | Use Case |
|---|---|
| **SNS** | Fan-out to multiple subscribers |
| **SQS** | Queue for decoupled processing |
| **Lambda** | Serverless immediate processing |
| **EventBridge** | Advanced routing, multiple targets, filtering, archiving |

**EventBridge advantages over native S3 events:**
- Filter on metadata, object size, prefix/suffix patterns
- Route to 18+ target types
- Event replay, archiving
- Cross-account delivery

> **📌 Tip:** For complex routing or when you need more than one consumer of the same event — use EventBridge. For simple single-destination processing — native S3 events (Lambda/SQS/SNS) are fine and have lower latency.

---

## S3 Select & Glacier Select

Query data inside objects using SQL-like expressions — without downloading the entire object.

- Supports CSV, JSON, Parquet
- Server-side filtering — only matching rows returned
- Up to 400% faster and 80% cheaper than downloading + client-side filter
- Glacier Select: same concept but for objects in Glacier Flexible Retrieval

```sql
SELECT s.name, s.age FROM S3Object s WHERE s.age > 30
```

---

## Access Points

Simplify access to shared S3 buckets in large organizations.

- Each Access Point has its own **DNS hostname** and **access point policy**
- Policies can be scoped to a specific VPC (VPC-only access point)
- Simplifies bucket policy management — instead of one enormous bucket policy, each team/app has its own access point

```
Bucket Policy (baseline)
  └─ Access Point: data-science-ap → VPC vpc-abc, IAM role data-science-role
  └─ Access Point: finance-ap → IAM role finance-role
```

---

## Object Lambda

Transform S3 objects on-the-fly as they're retrieved — without storing modified copies.

Use cases:
- Redact PII from documents before returning to caller
- Convert image format on request
- Add watermarks
- Enrich data with DynamoDB lookup

Architecture: `Caller → S3 Object Lambda Access Point → Lambda function → S3 bucket`

---

## S3 Object Lock

Prevent objects from being deleted or overwritten for a specified period (WORM — Write Once Read Many).

| Mode | Who Can Override | Use Case |
|---|---|---|
| **Governance** | Users with `s3:BypassGovernanceRetention` permission | Internal compliance with override escape hatch |
| **Compliance** | **Nobody** — not even root | Regulatory requirements (SEC 17a-4, FINRA) |

**Retention Period:** Fixed duration. Objects cannot be deleted until it expires.

**Legal Hold:** Independent of retention period. Toggle on/off at any time by users with `s3:PutObjectLegalHold`. Blocks deletion regardless of retention status.

> **📌 Tip:** Compliance mode = nobody can delete, even root. Governance mode = privileged users can bypass. Legal Hold overrides both — it's an additional lock you can add/remove.

---

## Pre-signed URLs

Grant time-limited access to a private S3 object without making it public.

```bash
# Generate a pre-signed URL valid for 1 hour
aws s3 presign s3://my-bucket/private-file.pdf --expires-in 3600
```

- URL carries the signer's credentials — access is validated against the creator's permissions at request time
- Works for GET (download) and PUT (upload)
- Expiration: up to 12 hours (console/CLI), up to 7 days (SDK with SigV4)

**Use cases:** secure file download from a web app, direct upload to S3 bypassing your server, time-limited sharing.

---

## Exam Traps Summary

| Trap | Correct Answer |
|---|---|
| Transfer Acceleration speeds up downloads | It helps **uploads** primarily; cross-region/long-distance use case |
| Replication Time Control (RTC) is free | RTC **costs extra** — standard replication has no time SLA |
| Replication is retroactive | **Not retroactive** — only new objects after config; use S3 Batch Ops for existing |
| Standard → Standard-IA anytime | **30-day minimum** must pass first |
| Object Lock Compliance = admin can override | Nobody can override Compliance mode — not even root |
| S3 Select downloads whole object | It filters server-side — only matching data returned |
