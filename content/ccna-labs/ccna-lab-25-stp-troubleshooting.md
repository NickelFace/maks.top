---
title: "Lab 25-1 — Spanning Tree Troubleshooting"
date: 2026-11-05
description: "STP diagnostics: identifying the Root Bridge and optimizing the topology"
tags: ["CCNA", "Cisco", "Lab", "STP", "Troubleshooting"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-25-stp-troubleshooting/"
---

## Overview

STP diagnostics: identifying the Root Bridge, analyzing port roles and states, fixing a suboptimal topology.

## Topology

```
SW1 (Priority 32768) ----SW2 (Priority 32768)
 \                          /
  SW3 (Priority 32768, lowest MAC = Root?)
```

## Tasks

1. Check the current STP state: `show spanning-tree`
2. Identify the Root Bridge (flag `This bridge is the root`)
3. View ports and their roles (Root/Designated/Blocked)
4. Determine whether the topology is optimal (Root Bridge should be closest to the servers)
5. Change the Root Bridge — set SW1 as Primary Root:
   ```
   SW1(config)#spanning-tree vlan 1 priority 4096
   ```
   or automatically:
   ```
   SW1(config)#spanning-tree vlan 1 root primary
   ```
6. Verify the Root Bridge change: `show spanning-tree`
7. Confirm correct port roles after the switch

## Key Commands

```
SW1#show spanning-tree
SW1#show spanning-tree vlan 1
SW1#show spanning-tree summary
SW1(config)#spanning-tree vlan 1 priority 4096
SW1(config)#spanning-tree vlan 1 root primary     ! automatically sets priority below current root
SW1(config)#spanning-tree vlan 1 root secondary   ! priority 28672
```

> **💡 Tip:**
> Bridge ID = Priority (16 bits) + MAC (48 bits). Lower Bridge ID = Root Bridge. Default priority = 32768. Priority must be a multiple of 4096. `root primary` = 24576, `root secondary` = 28672.
