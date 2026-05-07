---
title: "Lab 19-1 — IGP Interior Gateway Protocol Fundamentals"
date: 2026-05-07
description: "Configuring EIGRP: neighbor relationships, topology table, and Feasible Successor"
tags: ["CCNA", "Cisco", "Lab", "EIGRP", "IGP"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-19-igp-fundamentals/"
---

## Overview

Configure and verify EIGRP as an Interior Gateway Protocol. Analyze metrics, neighbor relationships, and the topology table.

## Topology

```
R1 (10.10.10.1) ----10.10.20.0/24---- R2 ----10.10.30.0/24---- R3
     Loopback: 1.1.1.1/32                   Loopback: 3.3.3.3/32
```

## Tasks

1. Configure IP addresses on interfaces and loopbacks
2. Configure EIGRP AS 100 on all routers:
   ```
   R1(config)#router eigrp 100
   R1(config-router)#network 10.10.10.0 0.0.0.255
   R1(config-router)#network 10.10.20.0 0.0.0.255
   R1(config-router)#network 1.1.1.1 0.0.0.0
   R1(config-router)#no auto-summary
   ```
3. Verify neighbor relationships are established: `show ip eigrp neighbors`
4. View the topology table: `show ip eigrp topology`
5. Verify the routing table (D = EIGRP): `show ip route eigrp`
6. Analyze EIGRP metrics: Feasible Distance (FD) vs. Reported Distance (RD)
7. Configure passive-interface on Loopback: `passive-interface Loopback0`
8. Ping R3's loopback from R1

## Key Commands

```
R1(config)#router eigrp 100
R1(config-router)#network 10.10.10.0 0.0.0.255
R1(config-router)#no auto-summary
R1(config-router)#passive-interface Loopback0
R1#show ip eigrp neighbors
R1#show ip eigrp topology
R1#show ip eigrp topology all-links
R1#show ip route eigrp
R1#show ip protocols
```

> **💡 Tip:**
> EIGRP Successor = best route (installed in the routing table). Feasible Successor = backup route (in the topology table, FD > neighbor's RD). If the Successor goes down → instant failover to the FS without recalculation.
