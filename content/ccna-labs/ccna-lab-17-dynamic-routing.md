---
title: "Lab 17 — Dynamic Routing Protocols"
date: 2026-10-18
description: "Configuring dynamic routing: RIPv2 and EIGRP"
tags: ["CCNA", "Cisco", "Lab", "RIP", "EIGRP"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-17-dynamic-routing/"
---

## Overview

Introduction to dynamic routing: RIP and EIGRP. Comparison with manual static routing.

## Topology

```
R1 (10.10.10.1) ---- R2 (10.10.20.1/10.10.20.2) ---- R3 (10.10.30.1)
     10.10.10.0/24       10.10.20.0/24                    10.10.30.0/24
```

## Tasks

### RIPv2
1. Configure RIPv2 on all routers:
   ```
   R1(config)#router rip
   R1(config-router)#version 2
   R1(config-router)#network 10.0.0.0
   R1(config-router)#no auto-summary
   ```
2. Verify the routing table (R = RIP): `show ip route`
3. Check the RIP database: `show ip rip database`
4. Confirm that routes have propagated

### EIGRP
5. Remove RIP: `no router rip`
6. Configure EIGRP on all routers:
   ```
   R1(config)#router eigrp 1
   R1(config-router)#network 10.0.0.0
   R1(config-router)#no auto-summary
   ```
7. Verify neighbors: `show ip eigrp neighbors`
8. Check the topology table: `show ip eigrp topology`
9. Verify the routing table (D = EIGRP): `show ip route`

## Key Commands

```
! RIPv2
R1(config)#router rip
R1(config-router)#version 2
R1(config-router)#network 10.0.0.0
R1(config-router)#no auto-summary
R1#show ip rip database

! EIGRP
R1(config)#router eigrp 1
R1(config-router)#network 10.0.0.0
R1(config-router)#no auto-summary
R1#show ip eigrp neighbors
R1#show ip eigrp topology
R1#show ip route eigrp
```

> **💡 Tip:**
> **RIP** — distance-vector, metric = hop count, slow convergence. **EIGRP** — Cisco enhanced distance-vector, fast convergence, composite metric. Administrative Distance: RIP=120, EIGRP internal=90.
