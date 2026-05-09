---
title: "AWS SAA — 2.02 EC2 Storage: EBS, EFS, FSx, Instance Store"
date: 2026-05-09
draft: true
description: "EBS volume types and when to use them, EFS performance modes, FSx family comparison, Instance Store tradeoffs — complete SAA-C03 storage coverage."
tags: ["AWS", "SAA-C03", "EBS", "EFS", "FSx", "storage", "EC2"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-2-02-ec2-storage/"
---

## EBS — Elastic Block Store

EBS provides **persistent block storage** for EC2 instances. Volumes are AZ-specific — they exist in one AZ and must be in the same AZ as the EC2 instance they attach to.

### EBS Volume Types

| Type | Category | Max IOPS | Max Throughput | Max Size | Use case |
|---|---|---|---|---|---|
| **gp3** | SSD General Purpose | 16,000 | 1,000 MB/s | 16 TiB | Boot, general workloads — **default choice** |
| **gp2** | SSD General Purpose | 16,000 | 250 MB/s | 16 TiB | Legacy; burst-based IOPS |
| **io2 Block Express** | SSD Provisioned IOPS | 256,000 | 4,000 MB/s | 64 TiB | Mission-critical DBs (Oracle, SAP HANA) |
| **io1** | SSD Provisioned IOPS | 64,000 | 1,000 MB/s | 16 TiB | High-IOPS apps needing consistent performance |
| **st1** | HDD Throughput | 500 | 500 MB/s | 16 TiB | Big data, data warehouses, log processing |
| **sc1** | HDD Cold | 250 | 250 MB/s | 16 TiB | Infrequently accessed; lowest cost HDD |

### gp3 vs gp2

| | **gp2** | **gp3** |
|---|---|---|
| Baseline IOPS | 3 IOPS/GiB (min 100, max 16,000) | **3,000 IOPS always (free)** |
| Burst | Up to 3,000 (using credit bucket) | No burst concept; flat 3,000 baseline |
| Throughput | 128–250 MB/s (tied to size) | **Up to 1,000 MB/s (independently provisioned)** |
| Cost | Higher | ~20% cheaper; IOPS and throughput provisioned separately |

> **📌 Tip:** gp3 is almost always the better choice over gp2. It's cheaper AND provides 3,000 IOPS regardless of volume size. gp2 IOPS scale with size — a 100 GiB gp2 only gets 300 IOPS baseline.

### Provisioned IOPS: io1 vs io2

| | **io1** | **io2** | **io2 Block Express** |
|---|---|---|---|
| Max IOPS | 64,000 | 64,000 | 256,000 |
| Durability | 99.8–99.9% | **99.999%** | **99.999%** |
| IOPS:GiB ratio | 50:1 | 500:1 | 1000:1 |
| Multi-Attach | Yes | Yes | Yes |

> **📌 Tip:** For new deployments, always prefer **io2** over io1 — higher durability (99.999%), higher IOPS:GiB ratio, same price.

---

## EBS Features

### Multi-Attach

Allows a single EBS volume (io1 or io2 only) to be attached to **up to 16** EC2 instances in the same AZ simultaneously.

**Requirements:**
- Instance must use Nitro System
- Cluster-aware filesystem required (e.g., GFS2, OCFS2) — NOT ext4/XFS
- All instances must be in the same AZ

> **📌 Tip:** Multi-Attach is for applications managing concurrent write access themselves (e.g., Oracle RAC). Standard filesystems like ext4 will corrupt data. The exam may list Multi-Attach as an answer for "shared block storage" — but watch for the AZ constraint and filesystem requirement.

### EBS Encryption

- **At rest**: AES-256, using AWS KMS key (default or CMK)
- **In transit**: encrypted between EC2 and EBS (no configuration needed)
- Encrypting an existing unencrypted volume: create a snapshot → copy snapshot with encryption enabled → create new volume from encrypted snapshot
- All snapshots of an encrypted volume are encrypted
- Volumes created from encrypted snapshots are encrypted

```bash
# Enable encryption by default for new volumes in a region
aws ec2 enable-ebs-encryption-by-default --region us-east-1
```

### EBS Snapshots

- Snapshots are **incremental** and stored in S3 (AWS-managed)
- Snapshots are **region-specific** but can be copied cross-region
- **Fast Snapshot Restore (FSR)**: pre-warms snapshot to eliminate latency on first use (costs extra)
- **EBS Snapshot Archive**: cheaper storage tier for snapshots; restore takes 24–72 h

```bash
# Create a snapshot
aws ec2 create-snapshot \
  --volume-id vol-0abc123 \
  --description "Pre-deploy backup"

# Copy snapshot cross-region
aws ec2 copy-snapshot \
  --source-region us-east-1 \
  --source-snapshot-id snap-0abc123 \
  --region eu-west-1 \
  --description "DR copy"
```

---

## Instance Store (Ephemeral Storage)

Instance store provides **temporary block storage** on physical disks attached directly to the host.

| Property | Value |
|---|---|
| **Persistence** | **Non-persistent** — data lost on stop, terminate, or hardware failure |
| **Performance** | Highest possible IOPS and throughput (NVMe SSD on some types) |
| **Cost** | Included in instance price — no extra charge |
| **Size** | Fixed; determined by instance type |
| **Encryption** | At-rest encryption on Nitro instances (hardware level) |

**Instance types with large instance store:**
- `i3`, `i4i` — NVMe SSD, up to 7.5M IOPS (i4i.32xlarge) — NoSQL, caching
- `d2`, `d3` — HDD, high sequential throughput — Hadoop, data lakes
- `h1` — HDD — MapReduce, HDFS

> **📌 Tip:** Instance store survives a **reboot** but NOT a stop or terminate. The exam loves this distinction. "Highest IOPS, ephemeral, lost on stop" → instance store. "Persistent, can snapshot, survives stop" → EBS.

---

## EFS — Elastic File System

EFS provides a **managed NFS v4 file system** that can be mounted on multiple EC2 instances simultaneously, across multiple AZs.

### Key properties

| Property | Value |
|---|---|
| **Protocol** | NFS v4.0 / v4.1 |
| **OS support** | **Linux only** (POSIX-compliant) |
| **Availability** | Multi-AZ by default (Regional mode) |
| **Scaling** | Automatic; scales to petabytes |
| **Mount** | Mount targets per AZ; use Security Groups |

### Storage tiers

| Tier | Cost | Access pattern |
|---|---|---|
| **Standard** | Higher | Frequently accessed files |
| **Standard-IA** | ~92% cheaper | Infrequently accessed (moved by lifecycle policy) |
| **One Zone** | Lower than Standard | Single AZ; less durable |
| **One Zone-IA** | Lowest | Infrequent access + single AZ |

### Performance modes

| Mode | Best for | Tradeoff |
|---|---|---|
| **General Purpose** (default) | Latency-sensitive apps (web serving, CMS) | Lower latency; max 35,000 IOPS |
| **Max I/O** | Highly parallelized workloads (big data, media) | Higher latency; unlimited IOPS |

### Throughput modes

| Mode | How throughput is determined |
|---|---|
| **Bursting** | Based on storage size (1 MB/s per GiB + burst credits) |
| **Provisioned** | Set throughput independently of storage size |
| **Elastic** | Automatically scales up/down; recommended for variable workloads |

> **📌 Tip:** EFS is **Linux-only** — if an exam scenario mentions Windows instances needing shared file storage, EFS is wrong. Use FSx for Windows File Server instead. EFS = Linux NFS; FSx for Windows = Windows SMB.

---

## FSx Family

Amazon FSx provides fully managed third-party file systems.

| FSx flavor | Protocol | OS | Best for |
|---|---|---|---|
| **FSx for Windows File Server** | SMB 3.0 | Windows (+ Linux via SMB) | AD-integrated Windows file shares, DFS |
| **FSx for Lustre** | Lustre (POSIX) | Linux | HPC, ML training, video rendering, S3 integration |
| **FSx for NetApp ONTAP** | NFS, SMB, iSCSI | Linux + Windows | Enterprise storage; multi-protocol; data tiering |
| **FSx for OpenZFS** | NFS | Linux | Low-latency workloads; ZFS features (snapshots, clones) |

### FSx for Lustre — S3 integration

```
S3 Bucket ←→ FSx for Lustre (lazy load from S3 on first access)
                       ↓ (after processing)
             write results back to S3
```

- Lazy loading: files loaded from S3 only when first accessed
- Data repository tasks: bulk import/export between Lustre and S3
- Use case: ML training where data lives in S3 but needs POSIX filesystem access

### FSx for Windows — Active Directory integration

- Supports Microsoft AD (self-managed or AWS Managed AD)
- Supports DFS (Distributed File System) namespaces and replication
- Supports Windows ACLs, shadow copies (VSS), Microsoft DFS-R

> **📌 Tip:** "Windows application needs shared storage with Active Directory integration" → **FSx for Windows File Server**, never EFS. EFS doesn't support Windows NTFS/ACLs or SMB.

---

## Storage Comparison Table

| | **EBS gp3** | **EBS io2** | **Instance Store** | **EFS** | **FSx Lustre** | **FSx Windows** |
|---|---|---|---|---|---|---|
| **Protocol** | Block | Block | Block | NFS | Lustre | SMB |
| **OS** | Linux/Win | Linux/Win | Linux/Win | Linux only | Linux only | Windows + Linux |
| **Multi-instance** | No (1 per AZ) | Yes (Multi-Attach) | No | Yes (unlimited) | Yes (limited) | Yes |
| **Multi-AZ** | No | No | No | Yes | No (single AZ) | Yes (Multi-AZ option) |
| **Persistence** | Yes | Yes | No | Yes | Yes | Yes |
| **Snapshots** | Yes | Yes | No | Backups only | Backups only | VSS/Backups |
| **Cost** | $ | $$$ | Included | $$ | $$ | $$$ |
| **Max throughput** | 1 GB/s | 4 GB/s | Very high | Elastic | 100s GB/s | High |

---

## When to Use What — Decision Guide

```
Need block storage for ONE instance:
  ├── Boot volume / general → gp3
  ├── High IOPS database    → io2 Block Express
  ├── Log/sequential reads  → st1 (HDD)
  ├── Archive/cold data     → sc1 (HDD)
  └── Highest IOPS, temporary → Instance Store

Need shared file storage:
  ├── Linux, multi-AZ, auto-scale → EFS
  ├── Windows + AD integration   → FSx for Windows
  ├── HPC / ML / S3 integration  → FSx for Lustre
  ├── Multi-protocol enterprise  → FSx for NetApp ONTAP
  └── ZFS features + NFS         → FSx for OpenZFS
```

---

## Key Exam Traps

| Trap | Correct understanding |
|---|---|
| "EFS works with Windows" | False — EFS is Linux (NFS) only |
| "st1/sc1 can be boot volumes" | False — only SSD types (gp2, gp3, io1, io2) can boot |
| "gp3 baseline is 100 IOPS" | False — gp3 baseline is always **3,000 IOPS**, regardless of size |
| "Instance store persists after stop" | False — data is lost on stop/terminate; survives reboot only |
| "EBS snapshots are full backups" | False — after first snapshot, subsequent are incremental |
| "Multi-Attach works with any volume type" | False — only io1 and io2 support Multi-Attach |
| "Multi-Attach works with any filesystem" | False — requires cluster-aware filesystem (not ext4/XFS) |
| "EBS volumes survive instance termination" | By default root volume is deleted; data volumes persist (default) |
| "FSx for Lustre stores data permanently" | By default, no — pair with S3 for durability; Lustre is scratch-fast |
