---
title: "Lab 25-2 — Spanning Tree Configuration"
date: 2026-11-08
description: "Configuring Rapid PVST+, PortFast, and BPDU Guard for port protection"
tags: ["CCNA", "Cisco", "Lab", "STP", "RSTP", "PortFast", "BPDU Guard"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-25b-stp-config/"
---

## Overview

Configure RSTP (Rapid Spanning Tree), PortFast, and BPDU Guard. Verify fast convergence.

## Tasks

### RSTP
1. Enable Rapid PVST+ (default on newer IOS):
   ```
   SW1(config)#spanning-tree mode rapid-pvst
   ```
2. Verify the mode: `show spanning-tree` (Protocol: rstp)
3. Compare convergence speed: STP (30–50 sec) vs. RSTP (< 1 sec)

### PortFast
4. Configure PortFast on access ports to end devices:
   ```
   SW1(config-if)#spanning-tree portfast
   ```
5. Enable globally for all access ports:
   ```
   SW1(config)#spanning-tree portfast default
   ```
6. PortFast skips Listening/Learning → goes straight to Forwarding
7. Confirm PortFast is NOT configured on trunk ports!

### BPDU Guard
8. Configure BPDU Guard on PortFast ports:
   ```
   SW1(config-if)#spanning-tree bpduguard enable
   ```
9. Enable globally:
   ```
   SW1(config)#spanning-tree portfast bpduguard default
   ```
10. Connect a switch to a BPDU Guard port → port goes into err-disable
11. Recover the port:
    ```
    SW1(config-if)#shutdown
    SW1(config-if)#no shutdown
    ```
    or automatically: `SW1(config)#errdisable recovery cause bpduguard`

### Root Guard
12. Configure Root Guard on designated ports facing client-side switches:
    ```
    SW1(config-if)#spanning-tree guard root
    ```

## Key Commands

```
SW1(config)#spanning-tree mode rapid-pvst
SW1(config-if)#spanning-tree portfast
SW1(config)#spanning-tree portfast default
SW1(config-if)#spanning-tree bpduguard enable
SW1(config)#spanning-tree portfast bpduguard default
SW1(config-if)#spanning-tree guard root
SW1(config)#errdisable recovery cause bpduguard
SW1#show spanning-tree
SW1#show spanning-tree summary
SW1#show errdisable recovery
```

> **⚠️ Note:**
> PortFast is only for access ports connected to end devices (PCs, servers). Enabling PortFast on a trunk port can create an STP loop when another switch is connected.
