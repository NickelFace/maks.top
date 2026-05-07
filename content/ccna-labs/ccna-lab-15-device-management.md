---
title: "Lab 15 — Cisco Device Management"
date: 2026-05-07
description: "Factory reset, password recovery, configuration and IOS backup via TFTP"
tags: ["CCNA", "Cisco", "Lab", "Password Recovery", "TFTP", "IOS Upgrade"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-15-device-management/"
---

## Overview

Factory reset, password recovery, configuration and IOS image backup via TFTP, and IOS upgrade on a switch.

## Topology

```
R1 (2911, G0/0: 10.10.10.1/24) ----F0/1-[ SW1 (2960-24TT, Vlan1: 10.10.10.2) ]-F0/2---- TFTP-Server (10.10.10.10/24)
```

## Tasks

### Factory Reset
1. View the running-config on R1 and copy it to a text editor
2. Factory reset: `R1#write erase` → `reload`
3. Observe the boot process in the console
4. After boot: decline the Setup Wizard (`no`)
5. Paste the saved config back via the console and save it

### Password Recovery
6. Set the enable secret: `R1(config)#enable secret Cisco123!`
7. Save the config
8. Configure the device to boot into rommon: `R1(config)#config-register 0x2142` → `reload`
9. In rommon: ignore the startup-config during boot
10. After boot: copy startup-config to running: `copy start run`
11. Bring up interface G0/0: `no shutdown`
12. Remove the enable secret: `no enable secret`
13. Restore the normal config-register: `config-register 0x2102`
14. Save the config

### Configuration Backup
15. Back up to flash: `R1#copy run flash:` (name: `config-backup`)
16. Back up to TFTP: `R1#copy startup-config tftp:` → address: 10.10.10.10
17. Verify the files on the TFTP server

### IOS Image Backup and Upgrade
18. Back up the IOS image to TFTP: `R1#copy flash: tftp:`
19. Delete the IOS image from flash: `delete flash:c2911-...`
20. Reload → the router boots into rommon (no image present)
21. Restore the image via TFTP in rommon
22. Verify SW1 is running `C2960-LANBASE-M Version 12.2(25)FX`
23. Upgrade the IOS on SW1 to `c2960-lanbasek9-mz.150-2.SE4.bin` via TFTP
24. Reload and verify the new version

## Key Commands

```
R1#write erase                           ! factory reset
R1#reload
R1(config)#enable secret Cisco123!
R1(config)#config-register 0x2142       ! boot into rommon
rommon> confreg 0x2142
rommon> reset
R1#copy startup-config running-config    ! restore config
R1(config)#config-register 0x2102       ! normal boot
R1#copy run flash:                       ! config backup
R1#copy startup-config tftp:
R1#copy flash: tftp:                     ! IOS backup
SW1#show version                         ! verify IOS version
SW1#copy tftp: flash:                    ! download new IOS
SW1(config)#boot system flash:c2960-lanbasek9-mz.150-2.SE4.bin
```

> **⚠️ Note:**
> During Password Recovery, do NOT run `write erase`! Use `copy start run` to restore the configuration — otherwise the config will be deleted.
