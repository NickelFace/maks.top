---
title: "AWS SAA — 5.01 Elastic Load Balancing & Auto Scaling"
date: 2026-05-09
draft: true
description: "ALB, NLB, GWLB, CLB differences, cross-zone load balancing, Auto Scaling policies, lifecycle hooks, and instance refresh — complete SAA-C03 guide."
tags: ["AWS", "SAA-C03", "ELB", "Auto Scaling", "ALB", "NLB"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-5-01-elb-asg/"
---

## Elastic Load Balancing & Auto Scaling

ELB distributes incoming traffic across targets. ASG automatically adjusts the number of EC2 instances based on demand. Together they form the core of AWS horizontal scaling.

---

## Load Balancer Types

| LB Type | OSI Layer | Protocols | Key Feature | Targets |
|---|---|---|---|---|
| **ALB** (Application) | L7 | HTTP, HTTPS, gRPC | Path/host/header routing, WebSockets | EC2, Lambda, IP, containers |
| **NLB** (Network) | L4 | TCP, UDP, TLS | Ultra-low latency, static IP per AZ | EC2, IP, ALB |
| **GWLB** (Gateway) | L3/L4 | IP (all) | Transparent inline inspection | Virtual appliances (firewalls, IDS) |
| **CLB** (Classic) | L4/L7 | TCP, HTTP, HTTPS | **Legacy** — avoid for new designs | EC2-Classic (deprecated) |

### Quick Selection Guide

| Scenario | Answer |
|---|---|
| Route `/api/` to one service, `/web/` to another | **ALB** |
| Need fixed/Elastic IP for whitelisting by clients | **NLB** |
| Firewall / IDS / DLP inline traffic inspection | **GWLB** |
| Expose service via PrivateLink | **NLB** (behind PrivateLink) |
| Handle millions of req/s, ultra-low latency | **NLB** |
| Authenticate users before hitting backend | **ALB** + Cognito/OIDC |
| gRPC microservices | **ALB** |

---

## ALB — Application Load Balancer

### Listener Rules

Rules evaluated in priority order. Each rule has conditions + action.

**Conditions:** path pattern, host header, HTTP header, query string, source IP

**Actions:** forward (to target group), redirect, fixed response, authenticate (Cognito / OIDC)

```
Rule 1: IF path = /api/*       THEN forward → api-target-group
Rule 2: IF host = admin.*      THEN authenticate-cognito + forward → admin-tg
Rule 3: IF header X-Beta = true THEN forward → beta-target-group
Default: forward → main-target-group
```

### Target Groups

| Target Type | Use Case |
|---|---|
| **Instance** | EC2 instances by instance ID |
| **IP** | Any IP (including on-premises via DX/VPN) |
| **Lambda** | Serverless targets (HTTP → JSON event) |
| **ALB** | NLB → ALB chaining |

### Sticky Sessions

Routes the same client to the same target using a cookie.

| Cookie Type | Name | Duration |
|---|---|---|
| Application cookie | Custom name (not AWSALB*) | Set by application |
| Duration-based | `AWSALB` | Configured on target group (1s – 7d) |

### Additional ALB Features

- **WAF integration:** Attach AWS WAF Web ACL to filter malicious requests
- **Authentication:** Built-in OIDC and Amazon Cognito integration in listener rules
- **gRPC:** Supported (unlike NLB and CLB)
- **WebSocket:** Supported

---

## NLB — Network Load Balancer

### Key Characteristics

- Operates at L4 — no HTTP header awareness
- **One static Elastic IP per AZ** — clients can whitelist specific IPs
- **Ultra-low latency** (~100μs vs ~400ms for ALB)
- TLS termination supported (offload to NLB)
- Can register **ALB as a target** (chain NLB → ALB)

### Cross-Zone Load Balancing (NLB)

| LB Type | Default | Cost |
|---|---|---|
| ALB | **ON** | Free |
| NLB | **OFF** | Charged when enabled |
| GWLB | **OFF** | Charged when enabled |
| CLB | OFF | Free when enabled |

> **📌 Tip:** ALB cross-zone is on by default and free. NLB/GWLB is off by default — enabling it costs extra per AZ data transfer. This difference is tested.

### Zonal DNS

NLB provides a zonal DNS name per AZ (`<az>.<name>.<region>.elb.amazonaws.com`) for clients that want AZ-local routing (reduces cross-AZ charges).

---

## GWLB — Gateway Load Balancer

Used to deploy, scale, and manage third-party virtual network appliances (firewalls, IDS/IPS, DLP, packet inspection).

**How it works:**
```
Client → GWLB (entry point)
          ↓ (GENEVE tunnel, port 6081)
       Firewall appliance (inspects + returns traffic)
          ↓
        GWLB → routes to destination
```

- Uses **GENEVE** encapsulation protocol (not HTTP)
- Traffic is transparent to source/destination — no re-IP needed
- Target group: virtual appliances (EC2 instances)

> **📌 Tip:** If the exam mentions "inline traffic inspection," "bump-in-the-wire," or "third-party firewall/IDS in AWS" — the answer is **GWLB**.

---

## Auto Scaling Group (ASG)

Maintains a desired number of EC2 instances, replacing unhealthy ones and scaling in/out.

### Launch Template vs Launch Configuration

| Feature | Launch Template | Launch Configuration |
|---|---|---|
| Status | **Preferred** | Legacy |
| Versioning | **Yes** (multiple versions) | No |
| Multiple instance types | **Yes** (mixed instances) | No |
| Spot + On-Demand mix | **Yes** | Limited |
| Required for | Latest EC2 features | — |

Always use **Launch Templates** for new ASGs.

### Health Checks

| Type | What Is Checked | Default |
|---|---|---|
| **EC2** | Instance status check (system + instance) | Default |
| **ELB** | Target group health check (HTTP response) | Optional, enable for app-level health |

Enable ELB health checks to replace instances that pass EC2 health but fail app health.

### Cooldown, Warm-up, and Scaling

| Concept | Purpose | Default |
|---|---|---|
| **Cooldown** | Wait after scale-out/in before next action | 300s |
| **Instance Warm-up** | Time for new instance to be ready (not counted in metrics) | Configurable |

---

## Scaling Policies

| Policy Type | How It Works | Use Case |
|---|---|---|
| **Target Tracking** | Maintain a target metric value; ASG scales automatically | CpuUtilization 60%, ALBRequestCountPerTarget 1000 |
| **Step Scaling** | Different adjustment sizes per alarm breach range | CPU 70–80% → add 2; 80–90% → add 4 |
| **Simple Scaling** | One adjustment when alarm triggers; waits for cooldown | Simpler but slower than step |
| **Scheduled** | Scale on a known time pattern | Scale up 8am Mon–Fri, scale down 6pm |
| **Predictive** | ML-based forecast; pre-scales ahead of demand | Recurring load patterns (e.g., daily traffic spikes) |

**Recommended:** Target Tracking for most workloads. Predictive for predictable cyclical traffic.

### ASG Termination Policy

Default termination order:
1. AZ with most instances
2. Oldest Launch Template / Launch Configuration
3. Instance closest to next billing hour

---

## Lifecycle Hooks

Pause instance launch/termination to run custom actions.

| State | Hook Point | Use Case |
|---|---|---|
| `EC2_INSTANCE_LAUNCHING` | Before instance enters service | Install software, pull config from S3, run tests |
| `EC2_INSTANCE_TERMINATING` | Before instance is terminated | Drain connections, archive logs, deregister from service discovery |

```
Launch: Pending → Pending:Wait (hook) → Pending:Proceed → InService
Terminate: Terminating → Terminating:Wait (hook) → Terminating:Proceed → Terminated
```

Hook timeout: 1 hour default (max 48h). Complete with `complete-lifecycle-action`.

---

## Instance Refresh

Rolling update mechanism to replace ASG instances after changing launch template.

- Set **minimum healthy percentage** (e.g., 90%) — ASG maintains this during refresh
- Set **warm-up time** — time to wait before counting new instance as healthy
- Supports automatic rollback on health check failures

```bash
aws autoscaling start-instance-refresh \
  --auto-scaling-group-name my-asg \
  --preferences '{"MinHealthyPercentage": 90, "InstanceWarmup": 300}'
```

---

## Exam Traps Summary

| Trap | Correct Answer |
|---|---|
| NLB supports HTTP path-based routing | **ALB** routes by path; NLB is L4 only |
| ALB has static IP | **NLB** has static IP per AZ; ALB has dynamic IP |
| ALB supports UDP | ALB does **not** support UDP; NLB does |
| GWLB for CDN/caching | GWLB is for **inline traffic inspection** (firewalls, IDS) |
| Cross-zone is free on NLB | Cross-zone on NLB is **charged** when enabled |
| ASG replaces on EC2 health check failure | Only if **ELB health check is enabled** will app-level failures trigger replacement |
| Launch Configuration is current best practice | Use **Launch Templates** — LC is legacy |
