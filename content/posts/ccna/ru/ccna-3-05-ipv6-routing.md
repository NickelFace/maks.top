---
title: "CCNA — 3.5 IPv6 маршрутизация"
date: 2026-08-21
description: "Включение IPv6 маршрутизации на Cisco IOS, статические IPv6-маршруты, верификация, основы OSPFv3 и протокол NDP как замена ARP."
tags: ["CCNA", "Cisco", "IPv6", "OSPFv3", "статическая маршрутизация"]
categories: ["CCNA"]
page_lang: "ru"
lang_pair: "/posts/ccna/ccna-3-05-ipv6-routing/"
pagefind_ignore: true
build:
  list: never
  render: always
---

**Экзаменационные темы:** 3.3 Configure and verify IPv6 static routing, 3.4 OSPFv2/v3

---

## Включение IPv6 маршрутизации

По умолчанию IPv6-маршрутизация **отключена** на Cisco IOS:

```
ipv6 unicast-routing
```

Без этой команды роутер не пересылает IPv6-пакеты между интерфейсами.

---

## Настройка IPv6-адресов на интерфейсах

```
interface GigabitEthernet0/1
 ipv6 address 2001:DB8:1:1::1/64
 ipv6 address FE80::1 link-local          ! Явная link-local (опционально)
 no shutdown

! Автоматическая генерация link-local:
interface GigabitEthernet0/2
 ipv6 enable                              ! Только link-local, без global unicast
```

---

## Статическая IPv6-маршрутизация

```
! Маршрут через next-hop IPv6 адрес:
ipv6 route 2001:DB8:2::/48 2001:DB8:1::2

! Маршрут через выходной интерфейс (только point-to-point):
ipv6 route 2001:DB8:2::/48 GigabitEthernet0/0

! Маршрут через интерфейс + next-hop (рекомендуется для Ethernet):
ipv6 route 2001:DB8:2::/48 GigabitEthernet0/0 2001:DB8:1::2

! Маршрут через link-local (нужно указывать исходящий интерфейс):
ipv6 route 2001:DB8:2::/48 GigabitEthernet0/0 FE80::2

! Default route IPv6:
ipv6 route ::/0 GigabitEthernet0/0 FE80::1
```

---

## Верификация IPv6-маршрутизации

```
show ipv6 route                   ! Таблица IPv6-маршрутизации
show ipv6 route static            ! Только статические маршруты
show ipv6 interface brief         ! IPv6-адреса всех интерфейсов
show ipv6 interface Gi0/1         ! Детали IPv6-интерфейса

ping ipv6 2001:DB8:2::1           ! IPv6 ping
traceroute ipv6 2001:DB8:2::1     ! IPv6 трассировка
```

**Коды маршрутов:**
- `S` — Static
- `O` — OSPF
- `L` — Local (адрес интерфейса /128)
- `C` — Connected
- `ND` — Neighbor Discovery

---

## OSPFv3 для IPv6

**OSPFv2** → только IPv4. **OSPFv3** → IPv6 (и IPv4 через address families).

```
! Базовая настройка OSPFv3:
ipv6 unicast-routing

ipv6 router ospf 1
 router-id 1.1.1.1          ! Router ID обязателен (нет IPv4 = нет автовыбора)

interface GigabitEthernet0/0
 ipv6 ospf 1 area 0          ! Активация OSPFv3 на интерфейсе
```

**Отличия OSPFv3 от OSPFv2:**

| Параметр | OSPFv2 | OSPFv3 |
|---|---|---|
| IP-версия | IPv4 | IPv6 |
| Активация | `network` в router ospf | `ipv6 ospf` на интерфейсе |
| Router ID | IPv4-адрес или вручную | **Всегда** вручную (32-bit) |
| Hello src | IPv4 интерфейса | Link-local адрес |
| Аутентификация | MD5 в router ospf | IPsec на интерфейсе |

**Верификация OSPFv3:**
```
show ipv6 ospf neighbor
show ipv6 ospf interface
show ipv6 route ospf
```

---

## NDP — замена ARP в IPv6

**Neighbor Discovery Protocol** выполняет функции ARP, router discovery и SLAAC:

| Тип сообщения | ICMPv6 тип | Функция |
|---|---|---|
| Router Solicitation (RS) | 133 | Хост запрашивает роутер |
| Router Advertisement (RA) | 134 | Роутер объявляет префикс/шлюз |
| Neighbor Solicitation (NS) | 135 | Запрос MAC-адреса (аналог ARP Request) |
| Neighbor Advertisement (NA) | 136 | Ответ с MAC-адресом |
| Redirect | 137 | Перенаправление на лучший шлюз |

```
show ipv6 neighbors          ! Таблица соседей (аналог ARP-таблицы)
```
