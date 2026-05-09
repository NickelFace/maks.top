---
title: "AWS SAA — 10.02 Hybrid Connectivity"
date: 2026-05-09
draft: true
description: "Direct Connect, Site-to-Site VPN, Client VPN, and Transit Gateway — hybrid network connectivity for SAA-C03 with key tradeoffs, HA patterns, and exam traps."
tags: ["AWS", "SAA-C03", "Direct Connect", "VPN", "Transit Gateway", "networking"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-10-02-hybrid/"
---

## Direct Connect (DX)

Direct Connect provides a **dedicated private network connection** between your on-premises data center and AWS.

### Connection types

| Type | Bandwidth | Who provides circuit | Lead time |
|---|---|---|---|
| **Dedicated** | 1, 10, or 100 Gbps | You order from AWS; physical cross-connect at DX location | Weeks to months |
| **Hosted** | 50 Mbps – 10 Gbps (sub-1G via AWS partner) | AWS partner provisions the connection | Faster (days to weeks) |

> **📌 Tip:** DX is **NOT encrypted** by default. It's a private connection but not encrypted. For encryption over DX → run a **Site-to-Site VPN tunnel** on top of the DX Private VIF.

### Virtual Interfaces (VIFs)

| VIF type | Connects to | BGP required |
|---|---|---|
| **Private VIF** | Single VPC via VGW | Yes |
| **Public VIF** | AWS public services (S3, DynamoDB, CloudFront endpoints) via public IPs | Yes |
| **Transit VIF** | Transit Gateway (multiple VPCs, multiple regions) | Yes |

### DX Gateway

- Attach **one DX connection** to **multiple VPCs** in different regions (or same region).
- DX Gateway does NOT allow VPC-to-VPC communication. It is only for on-premises → VPC access.
- One DX Gateway can be associated with up to 10 VGWs or one Transit Gateway.

> **📌 Tip:** DX Gateway does NOT route traffic between VPCs. If you need VPC-to-VPC over DX infrastructure, use **Transit VIF → Transit Gateway**.

---

## Direct Connect — High Availability

### HA patterns (weakest → strongest)

| Pattern | Resilience |
|---|---|
| Single DX connection | No redundancy — single point of failure |
| Two DX connections to same DX location | Protects against connection failure, NOT location failure |
| Two DX connections to **two different DX locations** | Recommended HA; survives location failure |
| DX as primary + **Site-to-Site VPN as backup** | Cost-effective HA; VPN is backup path over public internet |

> **📌 Tip:** Two connections to the same DX location is NOT true HA. The exam specifically tests this — you need **two different DX locations** for location-level redundancy.

---

## DX + VPN Backup

Use BGP metrics to prefer DX over VPN:

- DX path: lower BGP local preference (preferred path)
- VPN path: higher BGP MED or lower local preference

When DX fails, BGP reconverges and traffic automatically routes through VPN.

---

## Site-to-Site VPN

Encrypted IPsec tunnel between on-premises and AWS VPC over the public internet.

### Components

| Component | Location | Notes |
|---|---|---|
| **VGW** (Virtual Private Gateway) | AWS side | Attached to a VPC; supports BGP and static routing |
| **CGW** (Customer Gateway) | On-premises side | Represents the on-premises router/firewall in AWS |
| **VPN connection** | Links VGW + CGW | Always creates **2 tunnels** for HA (different AWS endpoints) |

### Limits

| Parameter | Limit |
|---|---|
| Max throughput per tunnel | ~1.25 Gbps |
| Max tunnels per VGW | 10 |
| Routing | BGP (dynamic) or static |

> **📌 Tip:** Site-to-Site VPN maximum throughput is **~1.25 Gbps per tunnel**. To achieve more throughput, create multiple VPN connections and distribute traffic (ECMP). With Transit Gateway, ECMP is natively supported across tunnels.

---

## Client VPN

Managed OpenVPN service for individual user access to AWS resources.

| Feature | Detail |
|---|---|
| **Protocol** | OpenVPN (TCP/UDP) |
| **Authentication** | Active Directory, Cognito (SAML), certificate-based, or mutual auth |
| **Subnet associations** | Attach to one or more VPC subnets; clients get IPs from the CIDR pool |
| **Split tunneling** | Only AWS-destined traffic goes through VPN (reduces bandwidth costs) |
| **Logging** | CloudWatch Logs or S3 |

---

## Transit Gateway (TGW)

Transit Gateway is a **regional hub-and-spoke network transit hub** that connects multiple VPCs, VPN connections, and Direct Connect.

### Attachments

| Attachment type | Notes |
|---|---|
| **VPC** | Up to 5,000 VPC attachments per TGW |
| **VPN** | Site-to-Site VPN connections |
| **DX** | Via **Transit VIF** (replaces Private VIF for multi-VPC DX access) |
| **TGW peering** | Connect TGWs across regions (inter-region) |
| **AWS RAM** | Share TGW across accounts in AWS Organizations |

### Route tables

- Each TGW has one or more route tables.
- Each attachment associates with one route table and can propagate routes to others.
- Default: all attachments in the same route table → full mesh.
- Segmentation: put different VPCs in different route tables → enforce isolation.

### TGW — key use cases

- **Centralized egress**: one NAT Gateway for all VPCs (attach all VPCs to TGW, default route → shared egress VPC with NAT GW).
- **Centralized inspection**: all traffic through a firewall VPC (inspection VPC with Network Firewall or 3rd-party appliance).
- **Multicast**: IP multicast across VPCs (unique to TGW — VPC peering doesn't support multicast).

---

## TGW vs VPC Peering

| Dimension | TGW | VPC Peering |
|---|---|---|
| **Scale** | Hub-and-spoke; 5,000 VPC attachments | 1:1 peering; max 125 active peerings per VPC |
| **Cost** | TGW hourly fee ($0.05/hr) + data processing ($0.02/GB) | No hourly fee; only data transfer costs |
| **Transitive routing** | Yes (A → TGW → B → TGW → C) | No (non-transitive; A→B→C not allowed) |
| **Cross-account** | Yes (via AWS RAM) | Yes (accept peering request) |
| **Cross-region** | Yes (TGW peering) | Yes (inter-region peering) |
| **Best for** | Large-scale (many VPCs), centralized services | Few VPCs, cost-sensitive, simple topology |

> **📌 Tip:** VPC Peering is **non-transitive**. If A peers with B and B peers with C, A cannot reach C through B. TGW enables transitive routing.

---

## Network Manager

- Visual topology of all Transit Gateway attachments globally.
- Global network view across regions and on-premises.
- Integrates with SD-WAN solutions.

---

## Exam Traps Summary

| Trap | Correct answer |
|---|---|
| "DX is encrypted" | **False** — DX is private but NOT encrypted; add VPN for encryption |
| "Two DX connections to same location = HA" | **False** — need two **different DX locations** for location-level HA |
| "DX Gateway routes traffic between VPCs" | **False** — DX Gateway is on-prem → VPC only; VPC-to-VPC requires TGW |
| "VPN throughput is unlimited" | False — max **~1.25 Gbps per tunnel**; use ECMP + TGW for more |
| "TGW allows transitive routing; VPC Peering does not" | **True** — classic exam distinction |
| "Private VIF for access to S3 over DX" | **False** — need a **Public VIF** for S3/DynamoDB (they have public endpoints); Private VIF accesses VPC resources only |
| "TGW is always cheaper than VPC Peering" | **False** — TGW has hourly charge; peering may be cheaper for 2–3 VPCs |
| "Client VPN for site-to-site connectivity" | **False** — Client VPN is for individual users; use Site-to-Site VPN for network-to-network |
