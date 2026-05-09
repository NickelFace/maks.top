---
title: "AWS SAA — 6.01 RDS & Aurora"
date: 2026-05-09
draft: true
description: "RDS engines, Multi-AZ, Read Replicas, RDS Proxy, Aurora architecture, Aurora Serverless v2, Global Database — everything the SAA-C03 exam tests about managed relational databases."
tags: ["AWS", "SAA-C03", "RDS", "Aurora", "databases"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-6-01-rds-aurora/"
---

## RDS Engines Overview

Amazon RDS is a **managed relational database** service — AWS handles patching, backups, and hardware. You still choose the engine and size.

| Engine | Notes |
|---|---|
| MySQL | Most common; compatible with Aurora MySQL |
| PostgreSQL | Rich feature set; compatible with Aurora PostgreSQL |
| MariaDB | MySQL fork; community edition |
| Oracle | Bring-Your-Own-License or License-Included |
| SQL Server | Express/Web/Standard/Enterprise; Windows auth support |
| IBM Db2 | Added 2023; BYOL |

> **📌 Tip:** Oracle and SQL Server cannot use Aurora. If the exam says "lift Oracle to Aurora," that is wrong.

---

## Multi-AZ (High Availability)

Multi-AZ creates a **synchronous standby** replica in a different AZ. It is an HA feature, not a performance feature.

| Property | Value |
|---|---|
| Replication | Synchronous (zero data loss) |
| Standby readable? | No — it only serves failover |
| Failover trigger | AZ outage, instance failure, manual reboot with failover |
| Failover time | ~60–120 seconds |
| Endpoint | DNS endpoint stays the same — apps reconnect automatically |
| Read scaling | Not supported via standby |

> **📌 Tip:** Multi-AZ ≠ read scaling. To scale reads, use Read Replicas. The exam will try to trick you here.

---

## Read Replicas (Read Scaling)

Read Replicas use **asynchronous replication** — slight lag is possible (eventual consistency for reads).

| Property | Value |
|---|---|
| Max replicas | 5 per source (15 for Aurora) |
| Scope | Same region, cross-region, or cross-account |
| Readable? | Yes — direct reads via replica endpoint |
| Promote | Can be promoted to a standalone DB (breaks replication) |
| Cross-region replica | Creates its own automated backups; extra cost |
| Multi-AZ source | Can create Read Replicas from a Multi-AZ source — replication from standby (no impact on primary) |

A **Read Replica can itself be Multi-AZ** — this is a common exam distractor.

---

## RDS Proxy

RDS Proxy sits between your application and the database and maintains a **connection pool**, reducing the number of connections hitting the DB.

| Feature | Detail |
|---|---|
| Protocol | MySQL, PostgreSQL, MariaDB, SQL Server |
| Auth | IAM authentication + Secrets Manager (no hardcoded passwords) |
| Connection pooling | Reduces DB overhead from burst connections |
| Failover | Proxy reduces failover time by ~66% (keeps connections warm) |
| Lambda use case | Lambda functions create many short-lived connections — Proxy prevents DB exhaustion |
| VPC-only | RDS Proxy is never publicly accessible |

> **📌 Tip:** Any exam scenario involving Lambda + RDS and connection overload → RDS Proxy is the answer.

---

## Backups & Point-in-Time Recovery

### Automated Backups
- Retention: **0–35 days** (0 disables backups)
- Transaction logs backed up every **5 minutes** → PITR to any point in the retention window
- Stored in S3; automatically deleted after retention period
- Happen in the backup window (minor I/O impact on single-AZ)

### Manual Snapshots
- Taken any time, retained **until you delete them**
- Can be copied cross-region (useful for DR) — encrypted snapshots remain encrypted
- Restoring from snapshot creates a **new DB instance**

> **📌 Tip:** Automated backups are deleted when you delete the DB (unless you choose to keep a final snapshot). Manual snapshots persist forever.

---

## Storage

| Type | Use case |
|---|---|
| gp2 | General purpose; burstable IOPS (3 IOPS/GB, burst to 3000) |
| gp3 | Newer; decouple storage and IOPS pricing; baseline 3000 IOPS |
| io1 / io2 | Provisioned IOPS; up to 64,000 IOPS; critical workloads |

**Storage autoscaling**: enabled per instance. Automatically grows when free space < 10%. You set the maximum.

---

## Encryption

| Layer | Mechanism |
|---|---|
| At rest | AWS KMS (AES-256). Must be enabled at creation time. |
| In transit | SSL/TLS certificate. Apps must use `require_ssl`. |
| Snapshots | Encrypted if source DB is encrypted |
| Cross-region snapshot copy | Re-encrypted with KMS key in destination region |

Unencrypted DB → cannot enable encryption in-place. Workaround: take snapshot → copy snapshot with encryption → restore.

---

## Parameter Groups & Option Groups

- **Parameter Group**: engine configuration knobs (e.g., `max_connections`, `innodb_buffer_pool_size`). Changing a static parameter requires a reboot.
- **Option Group**: additional features for specific engines (e.g., Oracle TDE, MSSQL Transparent Data Encryption, MySQL memcached plugin).

---

## Aurora Architecture

Aurora is AWS's re-engineered relational engine — MySQL and PostgreSQL compatible, but with a fundamentally different storage layer.

| Property | Aurora | Standard RDS |
|---|---|---|
| Storage copies | 6 copies across 3 AZs (2 per AZ) | 2 copies (Multi-AZ) |
| Self-healing | Scans data blocks; repairs automatically | N/A |
| Auto-grow | Up to **128 TB** in 10 GB increments | Autoscaling up to 64 TB |
| Storage | Shared cluster volume (not per-instance) | Per-instance EBS |
| Failover | ~30 seconds | ~60–120 seconds |
| Read replicas | Up to 15 | Up to 5 |
| Cost | ~20% more than RDS per unit | Baseline |

> **📌 Tip:** Aurora storage is shared — all instances in the cluster read from the same volume. Adding a read replica does not copy data.

---

## Aurora Endpoints

| Endpoint | Routes to | Use case |
|---|---|---|
| **Cluster (writer)** | Current writer instance | All writes; default endpoint |
| **Reader** | One of the read replicas (round-robin) | Scale reads |
| **Custom** | Subset of instances you define | Route analytics to larger instances |
| **Instance** | Specific instance | Troubleshooting |

---

## Aurora Global Database

- One primary region (read/write) + up to 5 secondary regions (read-only)
- Replication lag: **< 1 second** (RPO)
- Failover (promote secondary): **< 1 minute** (RTO)
- Use case: global low-latency reads, DR with fast failover

---

## Aurora Serverless v2

- No fixed instance size — compute scales in **ACU (Aurora Capacity Units)** increments
- You set min and max ACUs (e.g., 0.5 – 128 ACU)
- Scales **within seconds** (v1 scaled in minutes with a cold start)
- Pay per ACU-second — cost-effective for unpredictable or spiky workloads
- Full Aurora feature set including Multi-AZ, Global, read replicas

---

## Aurora Multi-Master

- Multiple writer instances — all can accept writes simultaneously
- Conflict resolution: first-write-wins
- Rare on the exam; typically used for continuous write availability requirements

> **📌 Tip:** Multi-Master ≠ Global Database. Multi-Master is within a single region with multiple writers. Global Database spans regions.

---

## Exam Traps Summary

| Trap | Correct answer |
|---|---|
| Multi-AZ for read scaling | Wrong — use Read Replicas |
| Read Replica for HA failover | Wrong — use Multi-AZ |
| Lambda + RDS connection exhaustion | RDS Proxy |
| Aurora storage per instance | Wrong — storage is a shared cluster volume |
| Encrypt existing unencrypted RDS | Snapshot → copy with encryption → restore |
| RPO < 1s cross-region | Aurora Global Database |
| Minimum backup retention | 1 day (0 disables backups entirely) |
| Read Replicas can be Multi-AZ | True — a replica can itself be Multi-AZ |
