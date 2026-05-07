---
title: "Lab 12 — The Life of a Packet"
date: 2026-05-07
description: "Отслеживание пути пакета через сеть: ARP, DNS и смена MAC на каждом хопе"
tags: ["CCNA", "Cisco", "Lab", "ARP", "DNS", "Packet Flow"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/ccna-labs/ccna-lab-12-life-of-packet/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Описание

Guided walkthrough — отслеживание пути пакета через сеть. Изучение работы DNS-клиента и ARP-кэша.

## Топология

```
PC1 ---- SW1 ---- R1 ---- R2 ---- SW2 ---- Server (DNS + HTTP)
              10.10.10.0/24    10.10.20.0/24
```

## Задачи

### ARP-кэш
1. На PC1 просмотреть ARP-кэш (пустой изначально)
2. Пинговать default gateway
3. Снова просмотреть ARP-кэш — появится запись для gateway
4. Пинговать удалённый хост (Server)
5. Объяснить: в ARP-кэше PC1 виден только gateway, не Server

### DNS
6. Пинговать Server по имени: `ping server.lab`
7. Проследить DNS-запрос до сервера
8. Просмотреть DNS-кэш на PC (если доступно)

### Путь пакета
9. Использовать `traceroute` для отображения hop-by-hop пути
10. Объяснить изменение MAC-адреса на каждом хопе (L2), при неизменном IP (L3)

## Ключевые команды

```
R1#show ip arp                        ! ARP-таблица роутера
SW1#show mac address-table            ! MAC-таблица коммутатора
R1#show ip route                      ! таблица маршрутизации
PC> ping server.lab                   ! DNS-резолюция + ping
PC> tracert 10.10.20.10               ! путь пакета
```

> **💡 Совет:**
> Ключевая идея: **MAC-адрес меняется на каждом хопе** (L2 перезаписывается роутером), а **IP-адрес остаётся неизменным** от источника до назначения (L3).
