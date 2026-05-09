---
title: "Lab 27-1 — Port Security Configuration"
date: 2026-11-13
description: "Configuring Port Security: violation modes and Sticky MAC"
tags: ["CCNA", "Cisco", "Lab", "Port Security", "Layer 2 Security"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-27-port-security/"
---

## Overview

Configure Port Security to protect against unauthorized devices. Violation modes: shutdown, restrict, protect. Sticky MAC.

## Tasks

### Basic Port Security
1. Enable Port Security on an access port:
   ```
   SW1(config-if)#switchport port-security
   ```
2. Set the maximum to 1 MAC address (default)
3. Add a static MAC address:
   ```
   SW1(config-if)#switchport port-security mac-address 0090.2B82.AB01
   ```
4. Verify: `show port-security interface f0/1`

### Violation Modes
5. **shutdown** mode (default): port → err-disable on a violation
6. **restrict** mode: violating traffic is dropped, counter increments, port stays up
7. **protect** mode: violating traffic is dropped, counter does NOT increment
   ```
   SW1(config-if)#switchport port-security violation restrict
   ```
8. Connect a different device → simulate a violation
9. Check the violation counter: `show port-security`

### Sticky MAC
10. Enable Sticky MAC — automatically learns connected devices:
    ```
    SW1(config-if)#switchport port-security mac-address sticky
    ```
11. Connect a PC — the MAC is automatically added to the config
12. Verify: `show run` → the config will contain `mac-address sticky XXXX.XXXX.XXXX`

### Recovering from err-disable
13. Manually: `shutdown` → `no shutdown` on the port
14. Automatically:
    ```
    SW1(config)#errdisable recovery cause psecure-violation
    SW1(config)#errdisable recovery interval 30
    ```

## Key Commands

```
SW1(config-if)#switchport port-security
SW1(config-if)#switchport port-security maximum 2
SW1(config-if)#switchport port-security mac-address sticky
SW1(config-if)#switchport port-security violation shutdown
SW1(config-if)#switchport port-security violation restrict
SW1(config-if)#switchport port-security violation protect
SW1#show port-security
SW1#show port-security interface f0/1
SW1#show port-security address
SW1(config)#errdisable recovery cause psecure-violation
```

> **💡 Tip:**
> | Mode | Block | Syslog | Counter | Port |
> |---|:---:|:---:|:---:|---|
> | Shutdown | ✓ | ✓ | ✓ | err-disable |
> | Restrict | ✓ | ✓ | ✓ | Up |
> | Protect | ✓ | ✗ | ✗ | Up |
