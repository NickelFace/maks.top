---
title: "Lab 04 — The IOS Operating System"
date: 2026-05-07
description: "Introduction to Cisco IOS CLI: modes, navigation, and configuration management"
tags: ["CCNA", "Cisco", "Lab", "IOS CLI"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-04-ios/"
---

## Overview

Guided walkthrough — step-by-step introduction to the Cisco IOS CLI. One router. No prior knowledge required.

## Topology

```
[ Router0 ]  ← single device, console connection
```

## Tasks

### Basic Navigation
1. Connect to Router0 → CLI tab
2. Enter Privileged Exec mode: `enable`
3. Reload the device: `reload`

### User Exec and Help
4. Explore User Exec commands: `Router>?`
5. Confirm that `show run` does not work in User Exec
6. Enter Privileged Exec: `Router>enable` → `Router#`
7. Return to User Exec: `Router#disable`

### Privileged Exec and Abbreviations
8. Try an abbreviation: `Router>en` → works
9. Try `Router#di` → "Ambiguous command" error
10. Use `Router#di?` to view options (dir/disable/disconnect)
11. Browse all `show` commands: `Router#sh ?`

### Global Configuration Mode
12. Enter Global Config: `Router#configure terminal`
13. Change the hostname: `Router(config)#hostname R1`
14. Explore command history (↑ / ↓ arrow keys)
15. Use `do show ip interface brief` from config mode
16. Enter Interface Config: `R1(config)#interface gigabitEthernet 0/0`
17. Go back: `exit` (one level) or `end` / Ctrl-C (back to Privileged Exec)

### Configuration Management
18. View the config: `R1#show running-config`
19. Filters: `sh run | begin hostname`, `sh run | include interface`, `sh run | exclude interface`
20. Save the config: `R1#copy run start`
21. Back up to flash: `copy run flash:` (name: config-backup)
22. Try a TFTP backup (will time out — that is expected)
23. Reload and confirm the config was saved

## Key Commands

```
Router>enable                        ! Privileged Exec
Router#disable                       ! back to User Exec
Router#configure terminal            ! Global Config mode
R1(config)#hostname R1
R1(config)#interface gigabitEthernet 0/0
R1(config-if)#exit                   ! one level back
R1(config-if)#end                    ! straight to Privileged Exec
R1#show running-config
R1#sh run | begin hostname
R1#copy run start                    ! save config
R1#copy run flash:                   ! backup to flash
R1#reload
```

> **💡 Tip:**
> IOS is case-insensitive for commands but case-sensitive when using `| begin` / `| include`. `begin Hostname` ≠ `begin hostname`.
