---
title: "AWS SAA — 6.03 ElastiCache & Caching Strategies"
date: 2026-05-09
draft: true
description: "Redis vs Memcached deep dive, caching patterns (lazy loading, write-through), cluster mode, security, and CloudFront/API Gateway edge caching for SAA-C03."
tags: ["AWS", "SAA-C03", "ElastiCache", "Redis", "caching"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-6-03-elasticache/"
---

## Redis vs Memcached — Feature Comparison

ElastiCache offers two engines. Knowing the difference is a guaranteed exam topic.

| Feature | Redis | Memcached |
|---|---|---|
| Data structures | Strings, Hash, List, Set, Sorted Set, Bitmap, HyperLogLog, Streams | String / simple key-value only |
| Persistence | RDB snapshots + AOF (Append Only File) | None |
| Replication | Yes — primary + read replicas | None |
| Multi-AZ + auto-failover | Yes | No |
| Pub/Sub | Yes | No |
| Lua scripting | Yes | No |
| Cluster mode (sharding) | Yes — up to 500 nodes | Yes — horizontal sharding only |
| RBAC / AUTH | Yes — Redis AUTH token, RBAC (6.x+) | SASL optional |
| Backup/Restore | Yes | No |
| Transactions | Yes (`MULTI/EXEC`) | No |
| Geospatial commands | Yes | No |

> **📌 Tip:** If the exam mentions any of: persistence, HA, replication, pub/sub, leaderboards, session store with HA — the answer is **Redis**. Memcached is only the answer when you need simple caching with multi-thread horizontal scaling and nothing else.

---

## Redis Architecture Details

### Cluster Mode Disabled (Replication Group)
- One primary node + up to 5 read replicas
- All data on every node (full dataset replication)
- Multi-AZ: replicas in different AZs; auto-failover promotes a replica on primary failure

### Cluster Mode Enabled (Sharding)
- Data partitioned across up to **500 shards**; each shard = 1 primary + up to 5 replicas
- Supports up to **500 nodes total**
- Write scaling — distribute writes across shards
- Cannot run all commands that require multiple keys across shards (use hash tags `{key}` to co-locate)

### Redis AUTH
- Password/token required to connect (set at cluster creation)
- In-transit encryption (TLS) required together with AUTH
- RBAC (Role-Based Access Control) available in Redis 6.x — fine-grained per-user ACLs

---

## Memcached Architecture Details

- Pure in-memory, no persistence
- Multi-threaded architecture — better CPU utilization than Redis for simple caching
- Horizontal scaling: add nodes to increase total cache capacity
- No replication — losing a node loses cached data
- No HA — when a node fails, cache misses spike until refilled

---

## Caching Strategies

### Lazy Loading (Cache-Aside)
```
1. App queries cache
2. Cache HIT → return data
3. Cache MISS → query DB → write result to cache → return data
```
- Only caches what is actually requested
- Cache can contain stale data (until TTL expires)
- Additional latency on first request (3 round trips on cache miss)

### Write-Through
```
1. App writes to DB
2. App (or cache library) simultaneously writes to cache
```
- Cache always up-to-date with DB
- Write penalty (every write hits both DB and cache)
- Can cache data that is never read (waste of memory)

### Write-Behind (Write-Back)
```
1. App writes only to cache
2. Cache asynchronously flushes to DB
```
- Lowest write latency
- Risk of data loss if cache fails before flush
- Complex to implement correctly

### TTL (Time to Live)
- Apply TTL to all cached items to prevent unbounded memory use
- Balance between freshness (short TTL) and cache efficiency (long TTL)
- Critical for Lazy Loading to reduce stale data window

---

## Common Use Cases

| Use case | Engine | Pattern |
|---|---|---|
| Database query caching | Redis or Memcached | Lazy Loading with TTL |
| Session store (shared across instances) | Redis | Write-Through or Lazy Loading |
| Leaderboards | Redis (Sorted Sets) | Direct Redis data structure |
| Real-time analytics counters | Redis (INCR/INCRBY) | Direct Redis data structure |
| Pub/Sub messaging | Redis | Native Pub/Sub |
| Rate limiting | Redis | INCR + TTL per key |
| Sticky session replacement | Redis | Centralized session store |

> **📌 Tip:** When an exam scenario says "users are being logged out when routed to different EC2 instances" (session affinity problem), the answer is ElastiCache for Redis as a centralized session store — not sticky sessions (which are a single-point-of-failure workaround).

---

## Security

| Layer | Mechanism |
|---|---|
| Network | Deploy in VPC; Security Group controls access |
| Encryption in transit | TLS (must enable at cluster creation for Redis AUTH) |
| Encryption at rest | KMS-managed keys (Redis only) |
| Authentication | Redis AUTH token; RBAC for Redis 6.x+ |
| IAM | Used for cluster management API calls; not for data-plane access |

---

## ElastiCache vs DAX

| Factor | ElastiCache | DAX |
|---|---|---|
| Target database | Any (DB, app-level) | DynamoDB only |
| Data access model | App-level caching (explicit cache calls) | Transparent DynamoDB API proxy |
| Strongly consistent reads | Possible (by not caching them) | Not cached — pass through |
| Use case | Multi-source, custom caching, session store | Transparent DynamoDB read acceleration |

---

## CloudFront as Edge Cache

- **CDN** with global points of presence (PoPs / edge locations)
- Caches static and dynamic content at the edge
- Reduces origin load; reduces latency for geographically distributed users
- TTL configurable per behavior; `Cache-Control` headers respected
- Works with: S3, ALB, EC2, Lambda@Edge, API Gateway origins

---

## API Gateway Caching

- **Per-stage** cache; size 0.5 GB to 237 GB; TTL 0–3600 seconds (default 300s)
- Reduces calls to backend; lowers cost at high traffic
- Cache key: method + path + optional query params/headers
- Can be flushed manually or via `Cache-Control: max-age=0` header (if permitted)

> **📌 Tip:** API Gateway caching is per-stage, not per-method. Enabling it on a stage applies to all methods unless you explicitly configure per-method overrides.

---

## Exam Traps Summary

| Trap | Correct answer |
|---|---|
| Memcached for HA caching | Wrong — no replication; use Redis |
| Memcached for session store with HA | Wrong — Redis; no data loss on failover |
| ElastiCache instead of sticky sessions | Correct — centralized session store |
| Redis cluster mode required for write scaling | True — sharding distributes writes |
| DAX vs ElastiCache for DynamoDB | DAX is simpler; ElastiCache for custom logic |
| API Gateway cache location | Per-stage; not global |
| Redis persistence options | RDB (snapshot) + AOF (log); Memcached has none |
