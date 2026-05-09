---
title: "Lab 30-1 — IPv6 Configuration"
date: 2026-11-20
description: "Настройка IPv6: ручная адресация, EUI-64, SLAAC и статические маршруты"
tags: ["CCNA", "Cisco", "Lab", "IPv6", "SLAAC"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-30-ipv6/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Настройка IPv6-адресации (вручную и EUI-64), статических маршрутов IPv6, SLAAC для автоконфигурации хостов.

## Топология

```
PC1 ----SW1---- R1 (G0/0: 2001:db8:0:1::1/64, G0/1: 2001:db8:0:2::1/64) ---- R2 (G0/0: 2001:db8:0:2::2/64)
                     Link-local: FE80::1                                              Link-local: FE80::2
```

## Задачи

### Включение IPv6
1. Включить IPv6 unicast routing:
   ```
   R1(config)#ipv6 unicast-routing
   ```
2. Настроить IPv6-адреса вручную:
   ```
   R1(config-if)#ipv6 address 2001:db8:0:1::1/64
   R1(config-if)#ipv6 address FE80::1 link-local
   ```
3. Настроить EUI-64 (автоматически из MAC):
   ```
   R1(config-if)#ipv6 address 2001:db8:0:1::/64 eui-64
   ```
4. Проверить IPv6-адреса: `show ipv6 interface brief`

### SLAAC для хостов
5. На R1 настроить Router Advertisement (RA) — включено по умолчанию при `ipv6 unicast-routing`
6. PC автоматически получит Global Unicast из prefix RA + EUI-64 MAC
7. Проверить адрес PC

### IPv6 Static Routes
8. Настроить статический маршрут:
   ```
   R1(config)#ipv6 route 2001:db8:0:3::/64 2001:db8:0:2::2
   ```
9. Default route IPv6:
   ```
   R1(config)#ipv6 route ::/0 FE80::2 g0/1
   ```
10. Проверить таблицу: `show ipv6 route`
11. Пинговать IPv6-адрес R2: `ping 2001:db8:0:2::2`

## Ключевые команды

```
R1(config)#ipv6 unicast-routing
R1(config-if)#ipv6 address 2001:db8:0:1::1/64
R1(config-if)#ipv6 address FE80::1 link-local
R1(config-if)#ipv6 address 2001:db8:0:1::/64 eui-64
R1(config)#ipv6 route 2001:db8:0:3::/64 2001:db8:0:2::2
R1(config)#ipv6 route ::/0 FE80::2 g0/1
R1#show ipv6 interface brief
R1#show ipv6 route
R1#ping ipv6 2001:db8:0:2::2
```

> **💡 Совет:**
> EUI-64: берётся MAC (xx:xx:xx:xx:xx:xx), вставляется **FF:FE** в середину, инвертируется 7-й бит. Результат — 64-битный interface identifier. Link-local всегда начинается с FE80::/10.
