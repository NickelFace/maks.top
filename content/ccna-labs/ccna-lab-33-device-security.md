---
title: "Lab 33-1 — Cisco Device Security Configuration"
date: 2026-05-07
description: "Comprehensive device security configuration: SSH, AAA, passwords, and hardening"
tags: ["CCNA", "Cisco", "Lab", "SSH", "AAA", "Hardening"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/ccna-labs/ru/ccna-lab-33-device-security/"
---

## Overview

Comprehensive device security configuration: AAA, SSH, banner, service password-encryption, and privilege levels.

## Tasks

### Passwords and Encryption
1. Set the enable secret:
   ```
   R1(config)#enable secret Cisco123!
   ```
2. Encrypt all plaintext passwords:
   ```
   R1(config)#service password-encryption
   ```
3. Configure console and VTY passwords:
   ```
   R1(config)#line console 0
   R1(config-line)#password cisco
   R1(config-line)#login
   ```

### Local Users
4. Create a local user:
   ```
   R1(config)#username admin privilege 15 secret Admin1!
   ```
5. Configure VTY for local login:
   ```
   R1(config)#line vty 0 15
   R1(config-line)#login local
   R1(config-line)#transport input ssh
   ```

### SSH
6. Configure the hostname and domain:
   ```
   R1(config)#hostname R1
   R1(config)#ip domain-name lab.local
   ```
7. Generate an RSA key (2048 bits):
   ```
   R1(config)#crypto key generate rsa modulus 2048
   ```
8. Enable SSHv2:
   ```
   R1(config)#ip ssh version 2
   ```
9. Connect via SSH: `ssh -l admin 10.10.10.1`
10. Verify SSH sessions: `show ssh`

### Banner
11. Configure a MOTD banner:
    ```
    R1(config)#banner motd # Authorized access only! #
    ```

### Hardening
12. Disable unnecessary services:
    ```
    R1(config)#no ip http server
    R1(config)#no ip http secure-server
    R1(config)#no cdp run              ! if CDP is not needed
    ```
13. Configure exec-timeout:
    ```
    R1(config)#line vty 0 15
    R1(config-line)#exec-timeout 5 0
    ```

## Key Commands

```
R1(config)#enable secret Cisco123!
R1(config)#service password-encryption
R1(config)#username admin privilege 15 secret Admin1!
R1(config)#ip domain-name lab.local
R1(config)#crypto key generate rsa modulus 2048
R1(config)#ip ssh version 2
R1(config)#line vty 0 15
R1(config-line)#login local
R1(config-line)#transport input ssh
R1(config-line)#exec-timeout 5 0
R1#show ssh
R1#show users
```

> **⚠️ Note:**
> `enable password` is stored with MD5 when `service password-encryption` is used. `enable secret` uses a stronger hash (MD5/SHA). Always use `enable secret` instead of `enable password`.
