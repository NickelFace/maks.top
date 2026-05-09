---
title: "AWS SAA — 3.01 S3 Fundamentals"
date: 2026-05-09
draft: true
description: "S3 buckets, storage classes, versioning, access control, encryption, static hosting — everything the SAA-C03 exam tests."
tags: ["AWS", "SAA-C03", "S3", "Storage"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-3-01-s3/"
---

## S3 Fundamentals

Amazon S3 (Simple Storage Service) is an object store with 99.999999999% (11 9s) durability. Objects are stored in **buckets**, addressed by **keys** (full path within the bucket).

---

## Buckets, Objects, Keys

| Concept | Detail |
|---|---|
| Bucket name | Globally unique across **all** AWS accounts and regions |
| Bucket region | Chosen at creation — data stays in that region (unless you set up replication) |
| Object key | Full path: `folder/subfolder/file.txt` — there are no real folders, only key prefixes |
| Object size | 0 B – 5 TB; single PUT ≤ 5 GB; use Multipart for > 5 GB |
| Object metadata | System metadata (content-type, ETag) + user-defined key/value pairs |

S3 provides a **global namespace** — bucket names are unique worldwide — but **buckets are regional**. Accessing a bucket always hits the region it was created in (unless Transfer Acceleration or replication is used).

> **📌 Tip:** The exam may describe a solution that needs a globally unique identifier for an S3 bucket — that's a property of S3 by design. But don't confuse "global namespace" with "global replication" — replication requires explicit configuration.

---

## Storage Classes

Choose based on access frequency, retrieval time requirements, and cost.

| Class | Durability | Availability | Min Duration | Retrieval | Use Case |
|---|---|---|---|---|---|
| **S3 Standard** | 11 9s | 99.99% | None | Immediate | Frequent access |
| **Intelligent-Tiering** | 11 9s | 99.9% | None | Immediate (frequent/infrequent); minutes (Archive) | Unknown or changing access |
| **Standard-IA** | 11 9s | 99.9% | 30 days | Immediate | Infrequent, but fast when needed |
| **One Zone-IA** | 11 9s* | 99.5% | 30 days | Immediate | Infrequent, non-critical, single AZ |
| **Glacier Instant Retrieval** | 11 9s | 99.9% | 90 days | Milliseconds | Archives accessed once a quarter |
| **Glacier Flexible Retrieval** | 11 9s | 99.99% | 90 days | Minutes–12 hrs | Archives accessed 1–2×/year |
| **Glacier Deep Archive** | 11 9s | 99.99% | 180 days | 12–48 hrs | Long-term retention (7–10 years) |

*One Zone-IA data is stored in a single AZ — data is **lost** if that AZ is destroyed.

**Intelligent-Tiering tiers (automatic):**
- Frequent Access (default)
- Infrequent Access (after 30 days without access)
- Archive Instant Access (after 90 days)
- Archive Access (configurable: 90–730 days, opt-in)
- Deep Archive Access (configurable: 180–730 days, opt-in)

> **📌 Tip:** Exam trap — "Glacier" alone is ambiguous. Glacier **Instant** Retrieval = milliseconds. Glacier **Flexible** Retrieval = minutes to hours. Glacier **Deep Archive** = 12–48 hours. Match the retrieval SLA to the right class.

---

## Versioning

Versioning is set at the bucket level. A bucket can be in one of three states:

| State | Behavior |
|---|---|
| **Unversioned** (default) | No version IDs; objects overwrite each other |
| **Enabled** | Every PUT creates a new version; DELETE adds a delete marker (object not immediately gone) |
| **Suspended** | No new versions created for new objects; existing versions preserved |

Once enabled, versioning **cannot be disabled** — only suspended.

**MFA Delete** — adds extra protection:
- Requires MFA token to permanently delete a version or change versioning state
- Can only be enabled/disabled by the **root account** via CLI
- Requires versioning to be enabled first

> **📌 Tip:** Versioning + MFA Delete is the exam answer for "protect against accidental deletion."

---

## Access Control Hierarchy

S3 uses a layered access model. An action is allowed only if **no explicit DENY** exists and at least **one explicit ALLOW** is present.

```
IAM Policy (identity-based)
  └─ Bucket Policy (resource-based, JSON)
       └─ ACL (legacy, per-object or per-bucket)
            └─ Block Public Access (account/bucket level override)
```

### Bucket Policies

JSON resource-based policies attached to the bucket. Support conditions (IP ranges, VPC endpoints, MFA, TLS). Example — enforce HTTPS only:

```json
{
  "Effect": "Deny",
  "Principal": "*",
  "Action": "s3:*",
  "Resource": ["arn:aws:s3:::my-bucket/*"],
  "Condition": { "Bool": { "aws:SecureTransport": "false" } }
}
```

### ACLs (Legacy)

Object-level and bucket-level XML ACLs. Predefined grants: `READ`, `WRITE`, `FULL_CONTROL`. ACLs are now **disabled by default** via S3 Object Ownership.

### Block Public Access

Four settings (can be set at account or bucket level):

| Setting | Blocks |
|---|---|
| BlockPublicAcls | New public ACLs |
| IgnorePublicAcls | All public ACLs (even existing) |
| BlockPublicPolicy | New public bucket policies |
| RestrictPublicBuckets | All public bucket policies |

Enable all four for maximum protection. **Account-level settings override bucket-level** — even if a bucket policy allows public access, if the account blocks it, access is denied.

### S3 Object Ownership

Since April 2023, ACLs are **disabled by default** on new buckets. `BucketOwnerEnforced` is the default — the bucket owner automatically owns all objects, regardless of who uploaded them. ACLs cannot be used when this is set.

> **📌 Tip:** Cross-account upload scenario: if ACLs are disabled (default), the bucket owner always owns uploaded objects. If you need the uploader to control objects, you'd need to re-enable ACLs — but that's the legacy path.

---

## Encryption

S3 encrypts all new objects by default (since January 2023). Options:

| Type | Who Manages Key | KMS API Calls | Exam Signal |
|---|---|---|---|
| **SSE-S3** | AWS (AES-256) | No | Default; "no overhead" |
| **SSE-KMS** | AWS KMS (CMK) | Yes — logged in CloudTrail | Audit trail, key rotation, compliance |
| **DSSE-KMS** | AWS KMS (dual-layer) | Yes | Regulatory/compliance requiring 2 layers |
| **SSE-C** | Customer (you send key) | No | Customer retains key control; must use HTTPS |
| **Client-side** | Customer (before upload) | No | Encrypt before leaving your network |

**SSE-KMS gotcha:** Every S3 PUT and GET calls KMS `GenerateDataKey` / `Decrypt`. High-throughput workloads can **hit KMS API throttle limits** (default 5,500–30,000 req/s depending on region). Use S3 Bucket Keys to reduce KMS calls by ~99%.

> **📌 Tip:** SSE-C requires HTTPS — AWS will reject SSE-C requests over HTTP. SSE-KMS gives you CloudTrail audit trail — use it when compliance requires proof of who accessed what.

---

## Static Website Hosting

Enable via bucket properties. S3 serves HTML/CSS/JS directly via HTTP.

- Bucket name **must match the domain** if using a custom domain via Route 53
- Website endpoint format: `<bucket>.s3-website-<region>.amazonaws.com`
- Must set objects to **publicly readable** (Block Public Access must be off)
- HTTPS on custom domain requires **CloudFront** in front (S3 website endpoint doesn't support HTTPS)

### CORS

Cross-Origin Resource Sharing is configured on the bucket that contains the resources, not the requester.

```json
[{
  "AllowedOrigins": ["https://example.com"],
  "AllowedMethods": ["GET"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3000
}]
```

> **📌 Tip:** If the exam says "JS in browser can't load resources from another S3 bucket," the answer is **configure CORS on the resource bucket**.

---

## Exam Traps Summary

| Trap | Correct Answer |
|---|---|
| One Zone-IA loses data | AZ failure destroys it — don't use for critical data |
| "Use Glacier" for archive | Specify: Glacier Instant / Flexible / Deep Archive — "Glacier" is a family, not one class |
| SSE-KMS in high-throughput | Can hit KMS throttle — enable S3 Bucket Keys |
| HTTPS on S3 static website | Need CloudFront — S3 website endpoint is HTTP only |
| Cross-account upload ownership | With Object Ownership = BucketOwnerEnforced, bucket owner gets ownership automatically |
| MFA Delete enabled by | Root account only, via CLI — not IAM users, not Console |
