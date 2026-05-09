---
title: "AWS SAA — 6.02 DynamoDB"
date: 2026-05-09
draft: true
description: "DynamoDB data model, capacity modes, RCU/WCU math, GSI vs LSI, Streams, DAX, Global Tables, transactions, and TTL — the SAA-C03 NoSQL deep dive."
tags: ["AWS", "SAA-C03", "DynamoDB", "NoSQL", "databases"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-6-02-dynamodb/"
---

## Data Model

DynamoDB is a **fully managed, serverless, key-value and document NoSQL database** with single-digit millisecond performance at any scale.

| Concept | Description |
|---|---|
| **Table** | Top-level container; no schema enforcement beyond the primary key |
| **Item** | Single row; up to **400 KB** |
| **Attribute** | Field within an item; can be any type (string, number, binary, list, map, set, boolean, null) |
| **Simple PK** | Partition key only — must be unique across all items |
| **Composite PK** | Partition key + sort key — combination must be unique; items with same PK grouped together |

DynamoDB distributes data by hashing the partition key. Choosing a high-cardinality partition key is critical for even distribution and avoiding "hot partitions."

---

## Capacity Modes

### Provisioned Mode
- You specify **RCU (Read Capacity Units)** and **WCU (Write Capacity Units)**
- Predictable workloads; can use **auto-scaling** to adjust based on utilization targets
- **Reserved Capacity**: commit 1 or 3 years → up to 77% savings
- Burst: DynamoDB allows brief bursts above provisioned capacity using burst credits (300 seconds of saved capacity)

### On-Demand Mode
- Pay per request; **no capacity planning**
- Scales instantly to any traffic level
- Roughly **2× more expensive** than provisioned at high sustained load
- Best for: new tables with unknown traffic, spiky/unpredictable workloads, dev/test

> **📌 Tip:** On-Demand can be ~2× the cost of Provisioned at steady high traffic. Use Provisioned + auto-scaling for predictable workloads.

---

## RCU / WCU Math

### Read Capacity Units (RCU)
| Read type | Capacity consumed |
|---|---|
| Strongly consistent read (≤ 4 KB) | **1 RCU** |
| Eventually consistent read (≤ 4 KB) | **0.5 RCU** |
| Transactional read (≤ 4 KB) | **2 RCU** |

Items > 4 KB: round up to nearest 4 KB multiple.

**Example**: 10 strongly consistent reads/sec of 6 KB items = 10 × ceil(6/4) = 10 × 2 = **20 RCU**

### Write Capacity Units (WCU)
| Write type | Capacity consumed |
|---|---|
| Standard write (≤ 1 KB) | **1 WCU** |
| Transactional write (≤ 1 KB) | **2 WCU** |

Items > 1 KB: round up to nearest 1 KB.

**Example**: 5 writes/sec of 4.5 KB items = 5 × ceil(4.5/1) = 5 × 5 = **25 WCU**

---

## Indexes

### Local Secondary Index (LSI)
- Same **partition key** as the base table; different **sort key**
- Must be created **at table creation** — cannot add later
- Up to 5 LSIs per table
- Shares capacity with the base table
- Supports strongly consistent reads (unlike GSI)

### Global Secondary Index (GSI)
- **Any attributes** as partition key and sort key — completely independent of the base table PK
- Can be created or deleted **at any time**
- Up to 20 GSIs per table (default limit, can increase)
- Has its **own separate RCU/WCU capacity**
- Only **eventually consistent** reads

| Feature | LSI | GSI |
|---|---|---|
| Partition key | Same as table | Any attribute |
| Sort key | Different from table | Any attribute |
| Created at | Table creation only | Any time |
| Capacity | Shares with table | Separate |
| Consistent reads | Strongly + eventually | Eventually only |
| Max per table | 5 | 20 |

> **📌 Tip:** LSI must be created at table creation. GSI uses its own capacity — provision it separately or throttling occurs independently of the main table.

---

## DynamoDB Streams

- Captures **item-level changes** (INSERT, MODIFY, REMOVE) in near real-time
- Retention: **24 hours** (cannot be extended)
- Each record contains: the key, the old image, the new image, or both (configurable)
- Integrate with **Lambda** for event-driven processing (exactly-once, ordered within shard)
- Use cases: replication, audit trail, cross-region aggregation, triggering workflows

Stream view types:
| Type | What is captured |
|---|---|
| `KEYS_ONLY` | PK attributes of modified items |
| `NEW_IMAGE` | Entire item after modification |
| `OLD_IMAGE` | Entire item before modification |
| `NEW_AND_OLD_IMAGES` | Both before and after |

---

## DAX (DynamoDB Accelerator)

DAX is a **fully managed, in-memory cache** built specifically for DynamoDB.

| Property | Detail |
|---|---|
| Latency | Microsecond (vs single-digit ms for DynamoDB) |
| Cache type | Write-through (writes go to both DAX and DynamoDB) |
| Strongly consistent reads | Not cached — passes through to DynamoDB |
| Cluster | Multi-node; primary + read replicas |
| API | Drop-in compatible — same DynamoDB API calls |
| Use case | Read-heavy workloads, repeated reads of same data |

**DAX vs ElastiCache for DynamoDB:**
- DAX: DynamoDB-specific, handles DynamoDB API, simpler setup
- ElastiCache: generic; use when you need custom caching logic, query result caching, or non-DynamoDB sources

> **📌 Tip:** DAX does NOT cache strongly consistent reads — those always go directly to DynamoDB. If the use case demands strong consistency, DAX provides no benefit.

---

## Global Tables

- **Multi-region, active-active** replication — all tables can accept writes
- Conflict resolution: **last-write-wins** (based on timestamp)
- Sub-second replication latency
- Requires DynamoDB Streams to be enabled
- Use case: global apps with low-latency reads and writes in multiple regions

---

## TTL (Time to Live)

- Automatically **expires and deletes items** based on a timestamp attribute
- No additional cost; deleted items are removed within 48 hours of expiry
- Expired items do not consume WCUs
- TTL deletions appear in DynamoDB Streams (for audit/archiving)

```yaml
# Example: item with TTL attribute
{
  "userId": "abc123",
  "sessionData": "...",
  "expiresAt": 1748736000   # Unix timestamp; DynamoDB deletes when current time > this value
}
```

---

## Transactions

- **ACID transactions** across multiple items and multiple tables
- Two operations: `TransactGetItems` (reads) and `TransactWriteItems` (writes)
- Up to **100 items** per transaction
- Consumes **2× RCU/WCU** (one for preparation, one for commit)
- Use case: banking transfers, order placement (debit inventory + create order atomically)

---

## Backup & Restore

### On-Demand Backup
- Full table backup at a specific point in time
- Retained until manually deleted; stored in DynamoDB (not S3 directly)
- Restore creates a **new table** — cannot restore in-place

### Continuous Backup (PITR)
- **Point-in-Time Recovery** up to **35 days** back
- Enabled per table; small additional cost
- Granularity: per second
- Restores to a new table

---

## Exam Traps Summary

| Trap | Correct answer |
|---|---|
| LSI can be added after table creation | False — must be at creation |
| GSI shares capacity with table | False — GSI has separate RCU/WCU |
| DAX caches strongly consistent reads | False — passes through to DynamoDB |
| On-Demand is always cheaper | False — 2× cost at high sustained traffic |
| DynamoDB Streams retention > 24h | False — 24h max |
| Global Tables conflict resolution | Last-write-wins |
| Transactions cost | 2× RCU/WCU |
| Max item size | 400 KB |
