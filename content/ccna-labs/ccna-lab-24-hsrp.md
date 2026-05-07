---
title: "Lab 24-1 — HSRP Configuration"
date: 2026-05-07
description: "Configuring HSRP for default gateway redundancy with preemption and interface tracking"
tags: ["CCNA", "Cisco", "Lab", "HSRP", "FHRP", "Redundancy"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-24-hsrp/"
---

## Overview

Configure HSRP (Hot Standby Router Protocol) for default gateway redundancy. Preemption and interface tracking.

## Topology

```
PC1 (GW: 10.10.10.254)
 |
SW1
 /  \
R1   R2      ← both routers claim 10.10.10.254 (virtual IP)
(10.10.10.1) (10.10.10.2)
 |           |
 +----WAN----+
```

HSRP Virtual IP: 10.10.10.254  
HSRP Group: 1

## Tasks

### Basic HSRP Configuration
1. Configure IP addresses on R1 and R2 interfaces
2. Configure HSRP on R1 (Active):
   ```
   R1(config-if)#standby 1 ip 10.10.10.254
   R1(config-if)#standby 1 priority 110
   R1(config-if)#standby 1 preempt
   ```
3. Configure HSRP on R2 (Standby, default priority 100):
   ```
   R2(config-if)#standby 1 ip 10.10.10.254
   R2(config-if)#standby 1 preempt
   ```
4. Verify HSRP state: `show standby brief`
5. Confirm R1 = Active, R2 = Standby

### Failover Test
6. Shut down the interface on R1: `interface g0/0` → `shutdown`
7. Verify that R2 became Active: `show standby brief`
8. Ping the virtual IP from PC — should work through R2
9. Bring R1 interface back up: `no shutdown`
10. With preempt enabled — R1 becomes Active again

### Interface Tracking
11. Configure a track object:
    ```
    R1(config)#track 1 interface g0/1 line-protocol
    R1(config-if)#standby 1 track 1 decrement 20
    ```
12. If R1's WAN interface goes down → priority decreases by 20 → R2 takes over

## Key Commands

```
R1(config-if)#standby 1 ip 10.10.10.254
R1(config-if)#standby 1 priority 110
R1(config-if)#standby 1 preempt
R1(config-if)#standby 1 track 1 decrement 20
R1(config)#track 1 interface g0/1 line-protocol
R1#show standby
R1#show standby brief
```

> **💡 Tip:**
> HSRP v1 virtual MAC address: **0000.0C07.ACxx** (xx = group in hex). The PC uses this MAC as its gateway. When the Active router changes, the MAC stays the same — the PC does not need to update its ARP cache.
