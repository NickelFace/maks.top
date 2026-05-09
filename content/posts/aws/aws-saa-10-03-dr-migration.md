---
title: "AWS SAA — 10.03 Disaster Recovery & Migration"
date: 2026-05-09
draft: true
description: "DR strategies, RPO/RTO, AWS Backup, Snow family, DataSync, Storage Gateway, DMS, and the 7Rs — complete DR and migration coverage for SAA-C03."
tags: ["AWS", "SAA-C03", "disaster recovery", "migration", "DMS", "Snow", "DataSync"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-10-03-dr-migration/"
---

## DR Strategy Fundamentals

### RPO vs RTO

| Term | Definition | Driven by |
|---|---|---|
| **RPO** (Recovery Point Objective) | Maximum acceptable **data loss** measured in time ("how old can the restored data be?") | Backup frequency, replication lag |
| **RTO** (Recovery Time Objective) | Maximum acceptable **downtime** ("how long until systems are back?") | Recovery process speed, automation level |

Lower RPO/RTO = more expensive architecture.

---

## The Four DR Strategies

Listed from lowest cost / highest RPO+RTO to highest cost / lowest RPO+RTO:

### 1. Backup & Restore

- Periodic snapshots / backups shipped to S3 or another region.
- On disaster: spin up new environment, restore from backup.
- **RPO**: hours. **RTO**: hours.
- **Cost**: lowest — pay only for storage of backups.

### 2. Pilot Light

- Minimal "always-on" core (e.g., database replication running, AMIs pre-built).
- Everything else is off or not provisioned until disaster.
- On disaster: provision the full stack, point DNS to DR region.
- **RPO**: minutes to low hours. **RTO**: tens of minutes.

### 3. Warm Standby

- Scaled-down but **fully functional copy** of production running in DR region.
- On disaster: scale up the DR environment to full production capacity.
- **RPO**: seconds to minutes. **RTO**: minutes.

### 4. Multi-Site Active/Active

- Full production workload running simultaneously in two or more regions.
- Traffic is load-balanced across regions (Route 53 / Global Accelerator).
- On disaster: remove failed region from routing; remaining region(s) absorb full load.
- **RPO**: near zero. **RTO**: near zero.
- **Cost**: highest — full infrastructure in every region.

### DR comparison table

| Strategy | RPO | RTO | Cost | Key characteristic |
|---|---|---|---|---|
| Backup & Restore | Hours | Hours | $ | Only backup storage cost |
| Pilot Light | Minutes–Hours | Tens of minutes | $$ | Core services always on |
| Warm Standby | Seconds–Minutes | Minutes | $$$ | Full stack, scaled down |
| Multi-Site Active/Active | ~0 | ~0 | $$$$ | Full stack in every region |

> **📌 Tip:** "Warm standby" ≠ "hot standby" (active/active). Warm standby still requires a scale-up step. Active/active has zero RTO because full capacity already exists.

---

## AWS Backup

Centralized, fully managed backup service across AWS services.

| Feature | Detail |
|---|---|
| **Supported services** | EC2, EBS, RDS, Aurora, DynamoDB, EFS, FSx, S3, Storage Gateway |
| **Backup plans** | Define schedule (daily/weekly), retention, lifecycle (transition to cold storage) |
| **Cross-account / cross-region** | Copy backups to another account or region for DR |
| **Vault Lock (WORM)** | Write-once-read-many; prevents backup deletion even by admins; compliance use cases |
| **On-demand backups** | Immediate backup outside of plan schedule |

> **📌 Tip:** AWS Backup Vault Lock is the answer when the exam asks for **compliance-grade immutable backups** that cannot be deleted.

---

## Elastic Disaster Recovery (DRS)

Replaces the older CloudEndure Disaster Recovery.

- **Continuous block-level replication** from on-premises or AWS to a staging area in the target region.
- Low-cost staging: replicated data held on cheap EBS volumes; no running instances.
- **Failover**: launch recovery instances in minutes with RTO/RPO in **minutes**.
- **Failback**: replicate changes back to source after the disaster.

> **📌 Tip:** DRS = fast (minute-scale) RTO/RPO for servers. Distinct from DMS (which migrates databases) and MGN (lift-and-shift migration). All three use continuous block-level replication but serve different purposes.

---

## Snow Family — Offline Data Transfer

Use Snow when: data > 10 TB, bandwidth is limited/expensive, air-gapped environments.

| Device | Usable Storage | Edge Compute | Use case |
|---|---|---|---|
| **Snowcone** | 8 TB HDD / 14 TB SSD | Yes (2 vCPUs, 4 GB RAM) | Remote/harsh environments, small transfers, IoT edge |
| **Snowball Edge Storage** | 80 TB | Limited | Large-scale data migration |
| **Snowball Edge Compute** | 42 TB | Yes (52 vCPUs, optional GPU) | ML at edge, video analysis |
| **Snowmobile** | Up to 100 PB | No | Exabyte-scale migration (a truck) |

### Order of operations

1. Request device from AWS console.
2. AWS ships device to you.
3. Copy data to device (encrypted with AWS KMS).
4. Ship device back to AWS.
5. AWS uploads data to S3.

> **📌 Tip:** Snowball is for **offline** transfer. For **online** transfer use DataSync. The breakeven point is roughly 10 TB over a slow link or when transfer would take more than a week.

---

## AWS DataSync — Online Data Transfer

Online agent-based data transfer service.

| Feature | Detail |
|---|---|
| **Sources** | On-premises NFS, SMB, HDFS, Lustre, S3-compatible storage |
| **Destinations** | Amazon S3, EFS, FSx for Windows, FSx for Lustre, FSx for OpenZFS |
| **Agent** | Lightweight VM deployed on-premises; connects to DataSync service endpoint |
| **Scheduling** | One-time or recurring (hourly/daily/weekly) |
| **Encryption** | TLS in transit; uses AWS KMS at rest |
| **Bandwidth throttling** | Configure max bandwidth to avoid saturating the link |
| **Data integrity** | Checksums verified end-to-end |

> **📌 Tip:** DataSync is NOT a migration tool for running applications — it transfers file data. For migrating live databases → DMS.

---

## AWS Storage Gateway

Hybrid storage service connecting on-premises applications to AWS storage.

### Gateway types

| Type | Protocol | AWS backend | Use case |
|---|---|---|---|
| **S3 File Gateway** | NFS, SMB | S3 (Standard, IA, Glacier) | File shares → cloud; low-latency local cache |
| **Volume Gateway (Cached)** | iSCSI | S3 + EBS snapshots | On-prem volumes in AWS; cache locally |
| **Volume Gateway (Stored)** | iSCSI | EBS snapshots | Full data on-prem; async backup to S3 |
| **Tape Gateway** | VTL (iSCSI) | S3 + Glacier | Replace physical tape library; virtual tapes |

> **📌 Tip:** Storage Gateway extends on-premises storage to AWS — applications keep using familiar protocols (NFS/SMB/iSCSI). They don't need to know data is in S3/Glacier.

---

## DMS — Database Migration Service

DMS migrates databases to AWS with minimal downtime.

### Migration types

| Type | Example | SCT needed? |
|---|---|---|
| **Homogeneous** | MySQL → RDS MySQL, Oracle → Oracle | No |
| **Heterogeneous** | Oracle → Aurora PostgreSQL, SQL Server → MySQL | Yes — use **Schema Conversion Tool (SCT)** first |

### DMS features

- **Continuous Data Replication (CDC)**: captures ongoing changes from source while migration runs.
- **Full load + CDC**: migrate existing data then apply ongoing changes → minimal cutover window.
- **Source/target combos**: supports on-prem, EC2-based, RDS, Aurora, Redshift, DynamoDB, S3, MongoDB, and more.
- **Replication instance**: an EC2 instance that runs the replication tasks (choose size based on data volume).

> **📌 Tip:** For heterogeneous migrations (different engine types), you MUST run the **Schema Conversion Tool (SCT)** before DMS to convert the schema and stored procedures.

---

## Application Migration Service (MGN)

Lift-and-shift migration for servers (not databases).

- Install lightweight **replication agent** on source servers.
- Continuous block-level replication to low-cost staging area in AWS.
- At cutover: launch fully replicated EC2 instances.
- Minimal downtime; cutover window of minutes.
- Replaces the older Server Migration Service (SMS).

---

## The 7 Rs of Migration

| Strategy | Description | Example |
|---|---|---|
| **Retire** | Decommission — no longer needed | Legacy app no one uses |
| **Retain** | Keep on-premises for now | Compliance requirements |
| **Relocate** | Move to AWS without changes (container-level) | Migrate VMware to VMware Cloud on AWS |
| **Rehost** | Lift-and-shift to EC2 | Move VMs to EC2 using MGN |
| **Replatform** | Lift-tinker-and-shift | MySQL on EC2 → RDS MySQL (managed service benefit) |
| **Refactor / Re-architect** | Re-design using cloud-native services | Monolith → Lambda + SQS + DynamoDB |
| **Repurchase** | Move to SaaS | CRM → Salesforce |

> **📌 Tip:** Rehost = no code changes; Replatform = minor optimizations, no core architecture change; Refactor = significant redesign for cloud benefits.

---

## Exam Traps Summary

| Trap | Correct answer |
|---|---|
| "Snowball for online data transfer" | **False** — Snowball is offline; use **DataSync** for online |
| "DMS for heterogeneous migration without SCT" | **False** — heterogeneous requires **Schema Conversion Tool** first |
| "Warm standby = zero RTO" | **False** — warm standby still needs a scale-up step; **active/active = zero RTO** |
| "Multi-site active/active is cheapest DR" | **False** — it's the most expensive; cheapest is backup & restore |
| "DRS replaces DMS for database migration" | **False** — DRS is server-level (block) replication for DR; DMS is for database migration |
| "Storage Gateway replaces on-prem storage entirely" | **False** — it **extends** it; on-prem apps still use local protocols (NFS/SMB) |
| "AWS Backup Vault Lock can be deleted by admin" | **False** — Vault Lock WORM prevents deletion even by privileged users |
| "DataSync for migrating live application databases" | **False** — DataSync moves file data; use **DMS** for databases |
