---
title: "AWS SAA — 5.02 Route 53"
date: 2026-05-09
draft: true
description: "DNS record types, Alias vs CNAME, all routing policies, health checks, private hosted zones, and Route 53 Resolver — SAA-C03 complete reference."
tags: ["AWS", "SAA-C03", "Route 53", "DNS", "Networking"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-5-02-route53/"
---

## Route 53

Route 53 is AWS's highly available, scalable DNS service. It also supports domain registration and health checking.

---

## DNS Record Types

| Record | Purpose | Example |
|---|---|---|
| **A** | Maps hostname → IPv4 | `api.example.com → 1.2.3.4` |
| **AAAA** | Maps hostname → IPv6 | `api.example.com → 2001:db8::1` |
| **CNAME** | Maps hostname → another hostname | `www.example.com → lb.example.com` |
| **MX** | Mail server (with priority) | `example.com → 10 mail.example.com` |
| **NS** | Name servers for a hosted zone | Delegated name servers |
| **SOA** | Start of Authority — zone metadata | Auto-managed by Route 53 |
| **TXT** | Arbitrary text — SPF, DKIM, domain verification | `"v=spf1 include:...` |
| **CAA** | Authorized certificate authorities for domain | `example.com 0 issue "letsencrypt.org"` |
| **SRV** | Service location (port + host) | Used by SIP, XMPP, Minecraft |
| **PTR** | Reverse DNS (IP → hostname) | Managed separately, used for email |

---

## Alias vs CNAME

Critical distinction — appears on almost every exam.

| Feature | Alias Record | CNAME Record |
|---|---|---|
| Works at zone apex (root domain) | **Yes** — `example.com` | **No** — only subdomains |
| Resolves to | AWS resource hostname | Any hostname |
| Cost | **Free** — no query charges | Standard DNS query charge |
| Visible to clients | **No** — transparent; client sees resolved IP | Yes — clients see the CNAME target |
| Health check integration | Supported | Not directly |
| TTL | Set by Route 53 (not user-configurable) | User-configurable |

**Supported Alias targets:**
- ELB (ALB, NLB, CLB)
- CloudFront distributions
- S3 static website endpoints
- API Gateway
- Elastic Beanstalk
- VPC Interface Endpoints
- Global Accelerator
- **Another Route 53 record in the same hosted zone**

> **📌 Tip:** You **cannot** set a CNAME for the root domain (`example.com`). Always use Alias for root domain pointing to AWS resources. Also: Alias records are free; CNAME resolution adds a query cost.

---

## Routing Policies

| Policy | Health Check | Use Case | Notes |
|---|---|---|---|
| **Simple** | Optional | One resource | Multiple values → client picks randomly |
| **Weighted** | Optional | A/B testing, blue/green | Weight 0 = no traffic; all 0 = equal distribution |
| **Latency** | Optional | Multi-region, lowest latency | Based on AWS latency measurements, not geography |
| **Failover** | **Required** | Active-passive DR | Primary + secondary; secondary used when primary unhealthy |
| **Geolocation** | Optional | Legal/content compliance | Route by country or continent; default record for unmatched |
| **Geoproximity** | Optional | Shift traffic by bias | Requires Traffic Flow; bias -99 to +99 to shrink/expand region |
| **Multi-Value** | **Required** | Client-side load balance | Up to 8 healthy records returned; NOT a substitute for ELB |
| **IP-Based** | Optional | ISP / CIDR-based routing | Route by client's CIDR; useful for different ISP handling |

### Weighted Routing

```
api.example.com → server-A  Weight: 70  (70% of traffic)
api.example.com → server-B  Weight: 20  (20%)
api.example.com → server-C  Weight: 10  (10%)
```

Weight is relative — percentages are calculated proportionally.

### Failover Routing

```
Primary record:   api.example.com → ALB-in-us-east-1  (with health check)
Secondary record: api.example.com → ALB-in-eu-west-1  (failover target)
```

When the primary health check fails, Route 53 routes all traffic to the secondary.

### Geolocation vs Latency

| | Geolocation | Latency |
|---|---|---|
| Basis | User's **geographic location** (country/continent) | AWS-measured **network latency** |
| Deterministic | Yes — user in Germany → EU | No — user in Germany may get us-east if latency is lower |
| Use case | Legal compliance, language, content restriction | Best user experience (speed) |
| Default record | Needed for unmatched locations | N/A |

> **📌 Tip:** Geolocation ≠ Latency. If the requirement is "users in Germany must use EU servers" → Geolocation. If "users should get the fastest response" → Latency-based.

### Geoproximity

- Routes traffic based on geographic location **with a bias adjustment**
- Bias positive (+1 to +99): expand the region's coverage area
- Bias negative (-1 to -99): shrink the region's coverage area
- **Requires Route 53 Traffic Flow** (visual policy editor, additional cost)

---

## Health Checks

### Types

| Type | What It Monitors |
|---|---|
| **Endpoint** | HTTP, HTTPS, or TCP check against an IP or domain |
| **Calculated** | Combines multiple health checks (AND/OR logic) |
| **CloudWatch Alarm** | Monitors a CloudWatch alarm state |

### Endpoint Health Check Details

- Checks from multiple AWS global locations
- Threshold: 3/5 checkers must agree on healthy/unhealthy (configurable)
- HTTP/HTTPS: Route 53 expects 2xx or 3xx within 2s; checks the first 5,120 bytes of response
- Supports string matching in response body

### Health Checks with Private Resources

Route 53 health checkers are on the public internet — they **cannot** reach private VPC resources directly. Solution: create a CloudWatch metric + alarm monitoring the private resource, then use a **CloudWatch alarm health check** in Route 53.

---

## Private Hosted Zones

- Resolves DNS names within one or more VPCs
- Must have `enableDnsSupport = true` on associated VPCs
- Same structure as public hosted zones; records not visible outside VPC
- Can be associated with VPCs across accounts (requires CLI/API)

```bash
# Associate hosted zone with VPC in another account
aws route53 associate-vpc-with-hosted-zone \
  --hosted-zone-id Z1234567890ABC \
  --vpc VPCRegion=us-east-1,VPCId=vpc-abc12345
```

---

## Route 53 Resolver

Provides DNS resolution for hybrid cloud architectures.

| Endpoint Type | Direction | Use Case |
|---|---|---|
| **Inbound Resolver Endpoint** | On-premises → AWS | On-prem DNS resolves AWS private hosted zone records |
| **Outbound Resolver Endpoint** | AWS → On-premises | EC2 instances resolve on-premises domain names |

**Resolver Rules** control forwarding:
- **Forwarding rule:** forward queries for specific domains to on-premises DNS
- **System rule:** Route 53 Resolver handles (default for AWS domains)
- **Auto-defined rule:** AWS adds rules for private hosted zones and Reverse DNS

```
VPC EC2 queries corp.internal.example.com
  → Outbound Resolver Endpoint
    → Forwarding Rule: corp.internal → 192.168.1.1 (on-prem DNS)
      → On-premises DNS answers
```

---

## Traffic Flow

Visual editor for creating complex routing configurations combining multiple policies.

- Supports versioning of routing policies
- Can combine Geoproximity + Latency + Weighted in a tree structure
- Additional cost per policy record (~$50/month per policy)

---

## Exam Traps Summary

| Trap | Correct Answer |
|---|---|
| CNAME on root domain | **Not allowed** — use Alias instead |
| Alias record costs per query | **Alias is free** — only CNAMEs have per-query charges |
| Geolocation = Latency | Different: Geolocation is geography-based, Latency is network-measurement-based |
| Multi-Value = Load Balancer | Multi-Value is NOT an ELB replacement — it's client-side random selection from up to 8 records |
| Failover doesn't need health check | **Failover requires health check** on the primary record |
| Route 53 resolves private zone without VPC settings | Requires `enableDnsSupport = true` on the VPC |
| Health checks reach private IPs | Route 53 checkers are public — use **CloudWatch alarm health check** for private resources |
