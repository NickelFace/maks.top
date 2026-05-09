---
title: "Lab 23-1 — DHCP Configuration"
date: 2026-10-31
description: "Настройка DHCP-сервера на роутере и DHCP Relay (ip helper-address)"
tags: ["CCNA", "Cisco", "Lab", "DHCP", "Relay"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-23-dhcp/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Настройка DHCP-сервера на роутере, DHCP-клиента, DHCP Relay (ip helper-address). Верификация выдачи адресов.

## Топология

```
PC1 ----SW1---- R1 (DHCP Server, G0/0: 10.10.10.1) ----G0/1---- R2 (G0/0: 10.10.20.1)
                                                                    |
                                                                   PC2 (другой subnet)
```

## Задачи

### DHCP Server на R1
1. Настроить DHCP-пул для VLAN 10:
   ```
   R1(config)#ip dhcp pool VLAN10
   R1(dhcp-config)#network 10.10.10.0 255.255.255.0
   R1(dhcp-config)#default-router 10.10.10.1
   R1(dhcp-config)#dns-server 8.8.8.8
   R1(dhcp-config)#lease 7
   ```
2. Исключить адреса роутера: `ip dhcp excluded-address 10.10.10.1 10.10.10.10`
3. Настроить PC1 на автоматическое получение адреса
4. Проверить выданные аренды: `R1#show ip dhcp binding`
5. Проверить статистику: `R1#show ip dhcp server statistics`

### DHCP Relay (ip helper-address)
6. PC2 находится в другой сети (10.10.20.0/24), DHCP-сервер — R1
7. На R2 настроить relay на интерфейсе, смотрящем в сеть PC2:
   ```
   R2(config-if)#ip helper-address 10.10.10.1
   ```
8. Создать пул для 10.10.20.0/24 на R1
9. Убедиться, что PC2 получает адрес через relay

## Ключевые команды

```
R1(config)#ip dhcp excluded-address 10.10.10.1 10.10.10.10
R1(config)#ip dhcp pool VLAN10
R1(dhcp-config)#network 10.10.10.0 255.255.255.0
R1(dhcp-config)#default-router 10.10.10.1
R1(dhcp-config)#dns-server 8.8.8.8
R1(dhcp-config)#lease 7
R1#show ip dhcp binding
R1#show ip dhcp server statistics
R2(config-if)#ip helper-address 10.10.10.1
```

> **💡 Совет:**
> `ip helper-address` перехватывает broadcast DHCP-запросы и пересылает их как unicast на DHCP-сервер. Без relay DHCP работает только в пределах одного broadcast-домена.
