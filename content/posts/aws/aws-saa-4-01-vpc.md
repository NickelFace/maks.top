---
title: "AWS SAA — 4.01 VPC Fundamentals"
date: 2026-05-09
draft: true
description: "VPC components, subnets, route tables, Internet Gateway, NAT, Security Groups, NACLs, DNS, and Flow Logs — the SAA-C03 networking foundation."
tags: ["AWS", "SAA-C03", "VPC", "Networking"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-4-01-vpc/"
---

## VPC Fundamentals

A Virtual Private Cloud (VPC) is a logically isolated network within AWS. Every AWS account gets a default VPC in each region (CIDR `172.31.0.0/16`).

---

## VPC Components

| Component | Description |
|---|---|
| **CIDR Block** | IP range for the VPC (e.g., `10.0.0.0/16`). Up to 5 CIDRs per VPC (primary + 4 secondary) |
| **Subnet** | Sub-range of VPC CIDR tied to a single AZ; can be public or private |
| **Route Table** | Set of rules (routes) that determine where network traffic is directed |
| **Internet Gateway (IGW)** | Allows internet access for public subnets; horizontally scaled, HA, no bandwidth limit |
| **NAT Gateway / NAT Instance** | Allows private subnet resources to initiate outbound internet traffic |
| **Security Group** | Stateful firewall at the instance (ENI) level |
| **NACL** | Stateless firewall at the subnet level |
| **VPC Endpoints** | Private connectivity to AWS services without IGW (covered in 4.02) |

### CIDR Planning

AWS reserves 5 IPs in each subnet:
- `.0` — Network address
- `.1` — VPC router
- `.2` — DNS server
- `.3` — Reserved for future use
- `.255` — Broadcast (not used, but reserved)

For a `/24` subnet (256 addresses): **251 usable IPs**.

> **📌 Tip:** Exam may ask how many IPs are available in a /28 (16 total − 5 = **11**). Always subtract 5.

---

## Subnets: Public vs Private

| Type | Has Route to IGW | Resources Get Public IP | Typical Use |
|---|---|---|---|
| **Public** | Yes (`0.0.0.0/0 → igw-xxx`) | Yes (if auto-assign enabled) | ALB, bastion hosts, NAT Gateway |
| **Private** | No | No | App servers, databases, Lambda in VPC |

A subnet becomes public by **adding a route to an Internet Gateway** in its route table. The IGW itself must be attached to the VPC.

---

## Route Tables

Every subnet is associated with exactly one route table. Route priority: **most specific route wins**.

**Default (main) route table** — created automatically with the VPC; used by subnets not explicitly associated with another.

**Custom route tables** — create one per subnet type for fine-grained control.

| Destination | Target | Meaning |
|---|---|---|
| `10.0.0.0/16` | `local` | VPC-internal traffic; always present, cannot delete |
| `0.0.0.0/0` | `igw-xxx` | Internet access (public subnet) |
| `0.0.0.0/0` | `nat-xxx` | Outbound internet via NAT (private subnet) |
| `10.1.0.0/16` | `pcx-xxx` | VPC Peering route |

---

## Internet Gateway vs Egress-Only IGW

| Feature | Internet Gateway (IGW) | Egress-Only IGW |
|---|---|---|
| IP version | IPv4 + IPv6 | **IPv6 only** |
| Direction | Inbound + Outbound | **Outbound only** (like NAT for IPv6) |
| Use case | Public-facing resources | IPv6 private instances that need internet access |
| Attached to | VPC | VPC |

> **📌 Tip:** Egress-Only IGW is the IPv6 equivalent of a NAT Gateway — allows IPv6 instances in private subnets to initiate outbound connections without being reachable from the internet.

---

## NAT Gateway vs NAT Instance

| Feature | NAT Gateway | NAT Instance |
|---|---|---|
| Management | **Fully managed** by AWS | Self-managed EC2 instance |
| High Availability | HA **within one AZ** (deploy per AZ for full HA) | Must configure manually (scripts, ASG) |
| Bandwidth | Up to **100 Gbps** (scales automatically) | Limited by instance type |
| Cost | Hourly + per GB (more expensive) | EC2 instance cost (cheaper at low volume) |
| Security Groups | **Cannot** attach SGs | **Can** attach SGs |
| Port Forwarding | Not supported | Supported |
| Bastion Host | No | Can double as bastion |
| Placement | Must be in **public subnet** | Must be in **public subnet** |
| Source/Dest Check | N/A | Must **disable** Source/Dest Check |

**Multi-AZ NAT Gateway architecture:**

```
AZ-A private subnet → NAT GW-A (in AZ-A public subnet) → IGW
AZ-B private subnet → NAT GW-B (in AZ-B public subnet) → IGW
```

One NAT Gateway per AZ for HA. If AZ-A NAT GW fails and you only have one, private instances in AZ-B lose internet too.

> **📌 Tip:** Exam almost always prefers NAT Gateway over NAT Instance for new architectures. Choose NAT Instance only when the question mentions cost optimization, port forwarding, or bastion host in the same instance.

---

## Security Groups

Stateful, instance-level (ENI) firewall. **Allow rules only — no explicit deny**.

| Property | Value |
|---|---|
| State | **Stateful** — return traffic automatically allowed |
| Rules | Allow only (inbound + outbound separately) |
| Level | Instance (ENI) |
| Default inbound | All traffic **denied** (unless rules added) |
| Default outbound | All traffic **allowed** |
| Rule evaluation | All rules evaluated; most permissive wins |

```
# Allow inbound SSH from specific IP
Type: SSH, Protocol: TCP, Port: 22, Source: 203.0.113.10/32

# Allow outbound HTTPS to anywhere
Type: HTTPS, Protocol: TCP, Port: 443, Destination: 0.0.0.0/0
```

**Security Group chaining (reference SG by ID):**

```
Web-SG inbound: allow port 80 from 0.0.0.0/0
App-SG inbound: allow port 8080 from Web-SG  ← references SG, not CIDR
DB-SG  inbound: allow port 3306 from App-SG
```

---

## Network ACLs (NACLs)

Stateless, subnet-level firewall. Supports both **allow and deny** rules.

| Property | Value |
|---|---|
| State | **Stateless** — return traffic needs explicit rule |
| Rules | Allow AND Deny |
| Level | Subnet |
| Rule evaluation | **Lowest rule number first; stops at first match** |
| Default NACL | Allows all inbound and outbound |
| Custom NACL | Denies all by default until rules added |

**Rule evaluation order:**
```
Rule 100: Allow TCP 443 from 0.0.0.0/0  ← evaluated first
Rule 200: Allow TCP 80  from 0.0.0.0/0
Rule *:   Deny all                       ← evaluated last (catch-all)
```

**Ephemeral ports** — NACLs must account for return traffic on ephemeral ports:
- Linux: `1024–65535`
- Windows: `49152–65535`
- AWS recommends: allow `1024–65535` outbound in NACLs for return traffic

| Feature | Security Group | NACL |
|---|---|---|
| Level | Instance | Subnet |
| State | Stateful | Stateless |
| Rules | Allow only | Allow + Deny |
| Evaluation | All rules | In order, first match |
| Default | Allow outbound | Allow all (default NACL) |

> **📌 Tip:** The most common exam pattern: SGs are stateful (return traffic automatic). NACLs are stateless (you must explicitly allow return traffic including ephemeral ports). NACL rules evaluate in order — first match wins.

---

## DNS in VPC

Two VPC-level settings control DNS behavior:

| Setting | Default | Effect |
|---|---|---|
| `enableDnsSupport` | `true` | Enables DNS resolution via Route 53 Resolver at `169.254.169.253` (VPC base + 2) |
| `enableDnsHostnames` | `false` (custom VPCs) | Assigns public DNS hostnames to instances with public IPs |

Both must be `true` for EC2 instances to get public DNS names.

**Route 53 Resolver:** provides DNS for VPC resources. For hybrid architectures use inbound/outbound **Resolver Endpoints** (covered in Route 53 article).

**Private Hosted Zones:** Associate with a VPC to resolve private domain names. Requires `enableDnsSupport = true`.

---

## VPC Flow Logs

Capture IP traffic metadata for VPC, subnet, or ENI level.

**Destinations:** CloudWatch Logs, S3, Kinesis Data Firehose

**What IS captured:**
- Source/destination IP and port
- Protocol, packet count, byte count
- Action (ACCEPT or REJECT)
- Start/end time, log status

**What is NOT captured:**
- Traffic to/from AWS metadata service (`169.254.169.254`)
- DHCP traffic
- DNS traffic to the **Route 53 Resolver** in the VPC (`169.254.169.253`)
- Windows license activation traffic
- Traffic between VPC Endpoints and AWS services

```
version account-id interface-id srcaddr dstaddr srcport dstport
protocol packets bytes start end action log-status
2 123456789012 eni-abc12345 10.0.0.5 10.0.1.6 443 52412 6 10 840 ... ACCEPT OK
```

> **📌 Tip:** Flow Logs capture flow metadata, not packet contents. DNS queries to Route 53 Resolver are not captured in Flow Logs — use Route 53 Resolver query logs separately.

---

## Exam Traps Summary

| Trap | Correct Answer |
|---|---|
| SG is stateless | SG is **stateful** — return traffic auto-allowed |
| NACL allows all by default | Only the **default NACL** allows all; custom NACLs deny all by default |
| NACL rules evaluated randomly | Rules evaluated **in number order** — first match wins |
| NAT Gateway in private subnet | NAT GW must be in a **public subnet** |
| Single NAT GW covers all AZs | For HA you need **one NAT GW per AZ** |
| Flow Logs capture DNS to resolver | Route 53 Resolver traffic is **NOT** captured in Flow Logs |
| IGW handles IPv6 outbound-only | **Egress-Only IGW** for IPv6 outbound-only; regular IGW is bidirectional |
