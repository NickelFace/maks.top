---
title: "AWS SAA — 4.02 VPC Advanced — Connectivity"
date: 2026-05-09
draft: true
description: "VPC Endpoints, Peering, Transit Gateway, Site-to-Site VPN, Direct Connect, PrivateLink — hybrid and cross-VPC connectivity for SAA-C03."
tags: ["AWS", "SAA-C03", "VPC", "Networking", "Direct Connect", "Transit Gateway"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-4-02-vpc-advanced/"
---

## VPC Advanced — Connectivity

This article covers how VPCs connect to each other and to on-premises networks — a major focus area of SAA-C03.

---

## VPC Endpoints

Access AWS services privately without traffic leaving the AWS network (no IGW, NAT, or public IP needed).

### Gateway Endpoints

| Property | Value |
|---|---|
| Supported services | **S3 and DynamoDB only** |
| Cost | **Free** |
| Implementation | Entry in **route table** |
| Scope | Regional — no AZ preference |
| DNS | No DNS change; route table directs traffic |

```
Route Table:
  10.0.0.0/16  → local
  pl-68a54001   → vpce-xxxxx   ← S3 prefix list → Gateway Endpoint
  0.0.0.0/0     → igw-xxxxx
```

### Interface Endpoints (AWS PrivateLink)

| Property | Value |
|---|---|
| Supported services | Most AWS services (100+) + custom services |
| Cost | **Hourly fee + per GB** |
| Implementation | **ENI** in your subnet (private IP) |
| DNS | Private DNS overrides service endpoint |
| Security Groups | Can attach SGs to ENI |

```bash
# After creating interface endpoint for S3, private DNS resolves:
s3.us-east-1.amazonaws.com → 10.0.1.25 (ENI in your subnet)
```

> **📌 Tip:** Gateway Endpoint = free, route table, S3/DynamoDB only. Interface Endpoint = paid, ENI, DNS, supports almost everything. Exam will describe "private connectivity to SQS from a Lambda in VPC" → Interface Endpoint.

---

## VPC Peering

Connects two VPCs using private IP addresses (same or different region, same or different account).

| Property | Value |
|---|---|
| Routing | Both VPCs must add routes to each other |
| Overlapping CIDRs | **Not allowed** — peering fails if CIDRs overlap |
| Transitivity | **NOT transitive** — A↔B, B↔C does not give A↔C |
| Cross-region | Supported |
| Cross-account | Supported |
| Bandwidth | No bandwidth limit; charged as inter-AZ or inter-region data transfer |

**Non-transitivity diagram:**
```
VPC-A ←→ VPC-B ←→ VPC-C
           ↑
    A cannot reach C without a direct peering connection A↔C
```

> **📌 Tip:** With many VPCs, peering becomes a full mesh problem (N×(N-1)/2 connections). For ≥ 3 VPCs that all need to communicate, **Transit Gateway** is the better answer.

---

## Transit Gateway (TGW)

Hub-and-spoke model — a regional router connecting VPCs, VPNs, and Direct Connect attachments.

| Feature | Detail |
|---|---|
| Attachments | VPC, Site-to-Site VPN, Direct Connect Gateway, TGW peering |
| Routing | Each attachment associated with a **TGW route table** |
| Transitivity | **Supports transitive routing** — key differentiator from VPC Peering |
| Cross-region | TGW peering across regions |
| Multicast | Supported (unique among AWS networking services) |
| Bandwidth | Up to 50 Gbps per attachment |
| Cost | Per attachment/hour + per GB processed |

**Route table isolation example:**

```
Shared-RT:    knows VPC-A, VPC-B, VPC-C (full mesh)
Prod-RT:      knows Prod-VPC, Corp-VPN only (isolated from Dev)
Dev-RT:       knows Dev-VPC only
```

This allows granular segmentation — dev VPCs don't see prod traffic.

> **📌 Tip:** TGW is the answer when the question involves connecting many VPCs, or when "transitive routing" is needed. VPC Peering for simple 2-VPC direct connection. TGW for hub-and-spoke at scale.

---

## Site-to-Site VPN

Encrypted IPSec tunnel between your on-premises network and AWS VPC.

| Component | Role |
|---|---|
| **Virtual Private Gateway (VGW)** | AWS-side VPN endpoint, attached to VPC |
| **Customer Gateway (CGW)** | On-premises VPN device (physical or software) |
| **VPN Connection** | Two IPSec tunnels (HA — both must be configured on CGW) |

**Routing options:**
- **Static:** Manually define routes on both sides
- **BGP (Dynamic):** Preferred — supports route propagation

| Feature | Virtual Private Gateway | Transit Gateway |
|---|---|---|
| VPCs supported | One VPC per VGW | Many VPCs via TGW |
| BGP | Supported | Supported |
| ECMP | Not supported | **Supported** — aggregate bandwidth across tunnels |

**VPN throughput:** each tunnel = up to 1.25 Gbps. With TGW + ECMP, aggregate multiple tunnels.

> **📌 Tip:** VPN is quick to set up (minutes to hours), encrypted by default, but uses the public internet — latency and bandwidth vary. Direct Connect is dedicated but takes weeks to provision.

---

## Direct Connect (DX)

Dedicated private network connection from on-premises to AWS.

### Connection Types

| Type | Speed Options | Provider |
|---|---|---|
| **Dedicated** | 1, 10, 100 Gbps | AWS Direct Connect Partners |
| **Hosted** | 50 Mbps – 10 Gbps (sub-1G available) | AWS Partners |

**Lead time:** weeks to months for physical provisioning.

### Virtual Interfaces (VIFs)

| VIF Type | Connects To | Use Case |
|---|---|---|
| **Private VIF** | VPC (via VGW or TGW) | Access private resources |
| **Public VIF** | AWS public endpoints | S3, DynamoDB, public APIs |
| **Transit VIF** | Transit Gateway | Multiple VPCs via one DX |

### Encryption

**DX is NOT encrypted by default.** Options to add encryption:
- Site-to-Site VPN over DX (IPSec over private VIF)
- MACsec (physical layer encryption, supported on dedicated 10/100G)

> **📌 Tip:** Exam will often test: "you need private, consistent bandwidth to AWS" → Direct Connect. "You need encrypted private connectivity" → VPN over Direct Connect, or MACsec.

### Direct Connect Gateway

Connects **one DX connection to multiple VPCs** in different regions via a single gateway.

```
On-Premises ──DX──→ Direct Connect Gateway ──→ VGW-us-east-1 (VPC-A)
                                              ──→ VGW-eu-west-1 (VPC-B)
                                              ──→ VGW-ap-southeast-1 (VPC-C)
```

- Cannot be used to route traffic between VPCs through DX Gateway
- Supports up to 10 VGWs per DX Gateway

---

## AWS PrivateLink

Expose a service in your VPC to other VPCs or accounts **without VPC Peering, IGW, or NAT**.

| Component | Role |
|---|---|
| **Service provider** | NLB in front of the service; creates VPC Endpoint Service |
| **Service consumer** | Creates Interface Endpoint pointing to the service |

```
Consumer VPC ──Interface Endpoint (ENI)──→ NLB in Provider VPC
```

**Use cases:**
- Share a SaaS-style service across accounts/VPCs
- AWS services that use Interface Endpoints (SQS, SNS, etc.) are powered by PrivateLink internally
- Secure marketplace integrations — no peering, no route table changes

> **📌 Tip:** PrivateLink is the answer when you need to expose a service to many consumers without giving them access to the whole VPC. Peering grants full CIDR-level access; PrivateLink exposes only one service endpoint.

---

## Connectivity Decision Guide

| Scenario | Solution |
|---|---|
| Private access to S3 from EC2 (free) | **Gateway Endpoint** |
| Private access to SQS from Lambda in VPC | **Interface Endpoint** |
| Connect 2 VPCs | **VPC Peering** |
| Connect 10 VPCs + on-prem VPN | **Transit Gateway** |
| On-prem to AWS, < 1.25 Gbps, quick setup | **Site-to-Site VPN** |
| On-prem to AWS, dedicated bandwidth, low latency | **Direct Connect** |
| One DX to many regional VPCs | **DX Gateway** |
| Share a service across accounts, not full VPC access | **PrivateLink** |

---

## Exam Traps Summary

| Trap | Correct Answer |
|---|---|
| VPC Peering is transitive | Peering is **NOT transitive** — need direct connection for each pair |
| DX is encrypted | **DX is NOT encrypted** by default — add VPN or MACsec |
| TGW does NOT support transitive routing | TGW **does** support transitive routing — main advantage over peering |
| Gateway Endpoints cost money | **Free** — only Interface Endpoints cost money |
| VPN over DX vs VPN via internet | VPN over DX = private + encrypted; VPN via internet = encrypted but variable latency |
| PrivateLink vs Peering | PrivateLink exposes one service; Peering exposes entire VPC CIDR |
