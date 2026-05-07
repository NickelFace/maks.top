---
title: "Lab 26-1 — EtherChannel Configuration"
date: 2026-05-07
description: "Configuring EtherChannel: LACP, PAgP, and static mode with load balancing"
tags: ["CCNA", "Cisco", "Lab", "EtherChannel", "LACP", "PAgP"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-26-etherchannel/"
---

## Overview

Configure EtherChannel using LACP, PAgP, and static mode. Verify the bundle and configure load balancing.

## Topology

```
SW1 ----F0/1,F0/2,F0/3 (bundle) ---- SW2
        PortChannel1
```

## Tasks

### LACP EtherChannel
1. Configure EtherChannel on SW1 (active) and SW2 (passive):
   ```
   SW1(config)#interface range f0/1-3
   SW1(config-if-range)#channel-group 1 mode active
   SW2(config)#interface range f0/1-3
   SW2(config-if-range)#channel-group 1 mode passive
   ```
2. Configure the Port-Channel interface as trunk:
   ```
   SW1(config)#interface port-channel 1
   SW1(config-if)#switchport mode trunk
   ```
3. Verify the state: `show etherchannel summary`
4. Confirm the flags: **P** (in bundle), **U** (in use)

### PAgP EtherChannel
5. Remove the LACP configuration
6. Configure PAgP (desirable/auto):
   ```
   SW1(config-if-range)#channel-group 1 mode desirable
   SW2(config-if-range)#channel-group 1 mode auto
   ```

### Static EtherChannel
7. Use `on` mode — no negotiation protocol:
   ```
   SW1(config-if-range)#channel-group 1 mode on
   ```

### Load Balancing
8. Change the load-balancing method: `port-channel load-balance src-dst-mac`
9. View the current method: `show etherchannel load-balance`

## Key Commands

```
SW1(config-if-range)#channel-group 1 mode active    ! LACP
SW1(config-if-range)#channel-group 1 mode passive   ! LACP
SW1(config-if-range)#channel-group 1 mode desirable ! PAgP
SW1(config-if-range)#channel-group 1 mode auto      ! PAgP
SW1(config-if-range)#channel-group 1 mode on        ! Static
SW1#show etherchannel summary
SW1#show etherchannel port-channel
SW1#show interfaces port-channel 1
SW1(config)#port-channel load-balance src-dst-mac
```

> **💡 Tip:**
> Mode compatibility: **LACP**: active+active, active+passive. **PAgP**: desirable+desirable, desirable+auto. **Static**: on+on. Mixing LACP and PAgP is not supported.
