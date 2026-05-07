---
title: "Lab 28-1 — ACL Configuration"
date: 2026-05-07
description: "Настройка стандартных и расширенных ACL для фильтрации трафика"
tags: ["CCNA", "Cisco", "Lab", "ACL", "Security"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-28-acl/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Настройка стандартных и расширенных ACL для фильтрации трафика. Применение на интерфейсах (in/out). Named ACL.

## Топология

```
PC1 (10.10.10.10) ----SW1---- R1 (G0/0: 10.10.10.1, G0/1: 10.10.20.1) ---- Server (10.10.20.10)
PC2 (10.10.10.20) ----SW1
```

## Задачи

### Standard ACL (фильтрация по source IP)
1. Запретить PC1 доступ к серверу (Standard ACL #10):
   ```
   R1(config)#access-list 10 deny 10.10.10.10
   R1(config)#access-list 10 permit any
   ```
2. Применить на G0/1 (outbound):
   ```
   R1(config-if)#ip access-group 10 out
   ```
3. Проверить: PC1 → ping server → fail; PC2 → ping server → success
4. Просмотреть ACL с счётчиками: `show access-lists`

### Extended ACL (фильтрация по src+dst+protocol)
5. Разрешить только HTTP от PC2 к серверу, запретить ping:
   ```
   R1(config)#access-list 110 permit tcp 10.10.10.20 0.0.0.0 10.10.20.10 0.0.0.0 eq 80
   R1(config)#access-list 110 deny icmp 10.10.10.20 0.0.0.0 10.10.20.10 0.0.0.0
   R1(config)#access-list 110 permit ip any any
   ```
6. Применить на G0/0 (inbound) — ближе к источнику:
   ```
   R1(config-if)#ip access-group 110 in
   ```

### Named ACL
7. Создать Named Extended ACL:
   ```
   R1(config)#ip access-list extended BLOCK-TELNET
   R1(config-ext-nacl)#deny tcp any any eq 23
   R1(config-ext-nacl)#permit ip any any
   ```
8. Применить и проверить

## Ключевые команды

```
R1(config)#access-list 10 deny 10.10.10.10 0.0.0.0
R1(config)#access-list 10 permit any
R1(config-if)#ip access-group 10 out
R1(config-if)#ip access-group 10 in
R1#show access-lists
R1#show ip interface g0/0            ! показывает применённый ACL
R1(config)#no access-list 10         ! удалить ACL
R1(config)#ip access-list extended MYACL
```

> **📌 Обратите внимание:**
> Wildcard маска обратна subnet маске: 255.255.255.0 → 0.0.0.255. Implicit deny any в конце каждого ACL! Standard ACL применяй **ближе к destination**, Extended — **ближе к source**.
