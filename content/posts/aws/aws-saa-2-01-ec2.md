---
title: "AWS SAA — 2.01 EC2 Instances: Types, Purchasing, AMI, Metadata"
date: 2026-05-09
draft: true
description: "EC2 instance families, purchasing options with cost tradeoffs, AMI types, IMDSv2, placement groups, and key exam traps — complete SAA-C03 coverage."
tags: ["AWS", "SAA-C03", "EC2", "compute", "AMI", "Spot"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-2-01-ec2/"
---

## EC2 Instance Families

Instances are grouped by the **primary resource they optimize**. The naming convention is: `<family><generation>.<size>` e.g. `m7g.xlarge`.

| Family | Letter | Optimized for | Common use cases |
|---|---|---|---|
| **General Purpose** | M, T | Balance of CPU/RAM/network | Web servers, app servers, dev/test |
| **Compute Optimized** | C | High CPU-to-RAM ratio | Batch processing, HPC, gaming, video encoding |
| **Memory Optimized** | R, X, z | Large RAM | In-memory DBs (Redis, SAP HANA), real-time analytics |
| **Storage Optimized** | I, D, H | High IOPS or sequential throughput | NoSQL DBs, data warehouses, Hadoop |
| **Accelerated Computing** | P, G, Inf, Trn | GPU / ML accelerators | ML training, inference, 3D rendering, HPC |
| **HPC Optimized** | Hpc | Ultra-low latency networking (EFA) | Tightly coupled HPC, simulations |

### T-series burstable instances

T instances earn **CPU credits** when idle and spend them during bursts.

| Mode | Behavior |
|---|---|
| `standard` | Cannot burst beyond earned credits |
| `unlimited` | Can burst beyond credits; charged for surplus CPU |

> **📌 Tip:** T instances with `unlimited` mode can incur unexpected charges during sustained high CPU. The exam may ask about cost surprises on T instances — unlimited mode is the culprit.

---

## Purchasing Options

Choosing the right purchasing option is one of the highest-yield topics on the SAA-C03 exam.

| Option | Payment | Discount vs OD | Best for |
|---|---|---|---|
| **On-Demand** | Per second/hour; no commitment | 0% (baseline) | Unpredictable workloads; dev/test; short-term |
| **Reserved (Standard)** | 1 or 3 yr; all/partial/no upfront | Up to 72% | Steady-state, known workloads |
| **Reserved (Convertible)** | 1 or 3 yr | Up to 66% | Steady-state; may need to change instance type |
| **Savings Plans (Compute)** | $/hr commitment; 1 or 3 yr | Up to 66% | Flexible: any instance family, region, OS, tenancy |
| **Savings Plans (EC2 Instance)** | $/hr commitment; specific family+region | Up to 72% | Less flexible; locked to family+region |
| **Spot** | Bid on spare capacity | Up to 90% | Fault-tolerant, stateless, flexible workloads |
| **Dedicated Host** | Per host; on-demand or reserved | — | BYOL per-socket/per-core; compliance |
| **Dedicated Instance** | Per instance | ~10% premium | Workload isolation; no hardware sharing |
| **Capacity Reservation** | Pay OD rate; guaranteed capacity | 0% | Ensures capacity in a specific AZ |

### Cost comparison: 1-year, m5.xlarge, us-east-1 (approximate)

| Option | Monthly cost |
|---|---|
| On-Demand | ~$140 |
| Reserved Standard (no upfront) | ~$72 |
| Compute Savings Plan | ~$79 |
| Spot (variable) | ~$14–$42 |

### Spot deep dive

- **Interruption:** AWS can reclaim Spot with 2-minute warning
- **Spot Block:** (deprecated) was used to reserve for 1–6 h without interruption
- **Spot Fleet:** mix of instance types; maintains target capacity; can combine Spot + On-Demand
- **EC2 Auto Scaling with Spot:** use multiple instance types and AZs; set `capacity-optimized` allocation strategy

```bash
# Request a Spot instance with interruption handling
aws ec2 request-spot-instances \
  --spot-price "0.05" \
  --instance-count 1 \
  --type "one-time" \
  --launch-specification file://spec.json
```

> **📌 Tip:** Dedicated Host vs Dedicated Instance: **Dedicated Host** gives you visibility into physical sockets/cores — required for **BYOL (Bring Your Own License)** for Windows Server, SQL Server, Oracle. Dedicated Instance just guarantees no hardware sharing; you don't control placement.

---

## Amazon Machine Images (AMI)

An AMI is a template containing the OS, application server, and applications for launching EC2 instances.

### AMI types

| Type | Source | Notes |
|---|---|---|
| **AWS-provided** | Amazon (Amazon Linux 2023, Windows, Ubuntu) | Maintained by AWS; free to use |
| **AWS Marketplace** | Third-party vendors | May include additional licensing fees |
| **Community** | Public contributions | Use with caution; not vetted by AWS |
| **Custom (private)** | You create from EC2 instance or snapshot | Owned by your account; can share with others |

### AMI scope and copying

- AMIs are **region-specific** — to use in another region, you must **copy** them
- Copying an encrypted AMI to another region: the copy is encrypted with the destination region's KMS key
- AMIs can be shared with specific AWS accounts or made public

```bash
# Copy AMI to another region
aws ec2 copy-image \
  --source-region us-east-1 \
  --source-image-id ami-0abcd1234 \
  --region eu-west-1 \
  --name "MyApp-v2-eu"
```

### AMI and EBS snapshots

- AMIs backed by EBS consist of one or more EBS snapshots
- Snapshots are stored in S3 (managed by AWS; not directly accessible as S3 objects)
- Encrypted instance → encrypted AMI; encrypted AMI → new instances inherit encryption

> **📌 Tip:** AMIs are regional. If an exam question describes a DR scenario copying instances to another region — you must copy the AMI first, then launch from the copy. You cannot launch an AMI in a region it doesn't exist in.

---

## User Data and Instance Metadata

### User Data (cloud-init)

Script executed **once at first launch** as root. Used to bootstrap instances.

```bash
#!/bin/bash
yum update -y
amazon-linux-extras install nginx1 -y
systemctl start nginx
systemctl enable nginx
echo "<h1>Hello from $(hostname)</h1>" > /usr/share/nginx/html/index.html
```

- Runs at launch only (unless modified to run on every boot)
- Accessible via IMDS at `http://169.254.169.254/latest/user-data`
- Max size: 16 KB (base64 encoded: ~21 KB)

### Instance Metadata Service (IMDS)

Provides instance information to code running on the instance.

| Version | How to query | Security |
|---|---|---|
| **IMDSv1** | Simple GET request; no auth | Vulnerable to SSRF attacks |
| **IMDSv2** | Requires session token (PUT first) | SSRF-safe; recommended |

```bash
# IMDSv2 — step 1: get token
TOKEN=$(curl -sX PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# IMDSv2 — step 2: use token
curl -sH "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/instance-id

# Common metadata paths
# /latest/meta-data/instance-id
# /latest/meta-data/instance-type
# /latest/meta-data/placement/availability-zone
# /latest/meta-data/iam/security-credentials/<role-name>
# /latest/dynamic/instance-identity/document
```

> **📌 Tip:** IMDSv2 is the exam-preferred answer for any question about securing IMDS. A common scenario: web application on EC2 is vulnerable to SSRF — attackers can steal IAM credentials via IMDSv1. Mitigation: enforce IMDSv2 (requires token header).

---

## Placement Groups

Placement groups control how instances are distributed across underlying hardware.

| Type | Layout | Max per AZ | Use case | Tradeoff |
|---|---|---|---|---|
| **Cluster** | Same rack, same AZ | No hard limit | HPC, low-latency 10 Gbps+ | Single point of failure (rack) |
| **Spread** | Different racks, different AZs | **7 per AZ** | Critical instances (ZooKeeper, Kafka brokers) | Hard limit of 7 per AZ |
| **Partition** | Groups of instances on separate partitions (racks) | 7 partitions per AZ | Hadoop, HDFS, HBase, Cassandra | Instances share partition risk |

```bash
# Create a cluster placement group
aws ec2 create-placement-group \
  --group-name my-hpc-cluster \
  --strategy cluster
```

> **📌 Tip:** Spread placement group → max 7 instances per AZ. This is a hard limit. If an exam scenario has 8+ instances that must all be on different hardware, Spread can't do it alone — consider multiple AZs.

---

## Instance Lifecycle: Stop, Hibernate, Terminate

| Action | RAM | EBS root | Instance store | Billing |
|---|---|---|---|---|
| **Stop** | Cleared | Persists | Lost | No compute charge; EBS charged |
| **Hibernate** | Saved to EBS | Persists | Lost | No compute charge; EBS charged |
| **Terminate** | Cleared | Deleted (default) | Lost | No charges after termination |
| **Reboot** | Preserved | Persists | Persists | Continuous billing |

**Hibernate requirements:**
- Instance must be EBS-backed
- RAM must be ≤ 150 GB
- Root EBS volume must be encrypted and large enough to hold RAM dump
- Not supported on bare metal instances
- Maximum hibernate duration: 60 days

> **📌 Tip:** Hibernate is often tested as "preserve application state across Stop/Start without re-initializing." Key requirement: **encrypted root EBS volume**. If the exam asks about in-memory data surviving a stop — hibernate is the answer.

---

## Key Exam Traps

| Trap | Correct understanding |
|---|---|
| "Spot instances are always available" | False — they can be interrupted with 2-min notice |
| "Dedicated Instance = BYOL" | False — Dedicated HOST gives socket/core visibility needed for BYOL |
| "Reserved Instances lock you to one AZ" | Standard RI can be AZ-specific (capacity reserved) or regional (flexible) |
| "AMIs are global" | False — AMIs are region-specific; must be copied to use elsewhere |
| "User data runs on every boot" | False — by default runs once at first launch |
| "IMDSv1 is fine" | False — IMDSv2 is the secure option; IMDSv1 is SSRF-vulnerable |
| "Cluster placement group spans AZs" | False — cluster group is within ONE AZ only |
| "Spread group allows any number" | False — max 7 instances per AZ |
| "T instances never incur extra charges" | False — unlimited mode can charge for burst CPU |
