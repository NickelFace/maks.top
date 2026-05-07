---
title: "CCNA — 3.5 IPv6 маршрутизация"
date: 2026-05-07
description: "Enabling IPv6 routing on Cisco IOS, IPv6 static routes, verification, OSPFv3 basics and NDP as the IPv6 replacement for ARP."
tags: ["CCNA", "Cisco", "IPv6", "OSPFv3", "статическая маршрутизация"]
categories: ["CCNA"]
page_lang: "en"
lang_pair: "/posts/ccna/ru/ccna-3-05-ipv6-routing/"
---

**Exam topics:** 3.3 Configure and verify IPv6 static routing, 3.4 OSPFv2/v3

---

## Enabling IPv6 Routing

By default, IPv6 routing is **disabled** on Cisco IOS:

```
ipv6 unicast-routing
```

Without this command, the router will not forward IPv6 packets between interfaces.

---

## Configuring IPv6 Addresses on Interfaces

```
interface GigabitEthernet0/1
 ipv6 address 2001:DB8:1:1::1/64
 ipv6 address FE80::1 link-local          ! Explicit link-local (optional)
 no shutdown

! Automatic link-local generation:
interface GigabitEthernet0/2
 ipv6 enable                              ! Link-local only, no global unicast
```

---

## IPv6 Static Routing

```
! Route via IPv6 next-hop address:
ipv6 route 2001:DB8:2::/48 2001:DB8:1::2

! Route via exit interface (point-to-point only):
ipv6 route 2001:DB8:2::/48 GigabitEthernet0/0

! Route via interface + next-hop (recommended for Ethernet):
ipv6 route 2001:DB8:2::/48 GigabitEthernet0/0 2001:DB8:1::2

! Route via link-local (must specify exit interface):
ipv6 route 2001:DB8:2::/48 GigabitEthernet0/0 FE80::2

! IPv6 default route:
ipv6 route ::/0 GigabitEthernet0/0 FE80::1
```

---

## Verifying IPv6 Routing

```
show ipv6 route                   ! IPv6 routing table
show ipv6 route static            ! Static routes only
show ipv6 interface brief         ! IPv6 addresses on all interfaces
show ipv6 interface Gi0/1         ! IPv6 interface details

ping ipv6 2001:DB8:2::1           ! IPv6 ping
traceroute ipv6 2001:DB8:2::1     ! IPv6 traceroute
```

**Route codes:**
- `S` — Static
- `O` — OSPF
- `L` — Local (interface address /128)
- `C` — Connected
- `ND` — Neighbor Discovery

---

## OSPFv3 for IPv6

**OSPFv2** → IPv4 only. **OSPFv3** → IPv6 (and IPv4 via address families).

```
! Basic OSPFv3 configuration:
ipv6 unicast-routing

ipv6 router ospf 1
 router-id 1.1.1.1          ! Router ID is required (no IPv4 = no auto-selection)

interface GigabitEthernet0/0
 ipv6 ospf 1 area 0          ! Activate OSPFv3 on interface
```

**OSPFv3 vs OSPFv2 differences:**

| Parameter | OSPFv2 | OSPFv3 |
|---|---|---|
| IP version | IPv4 | IPv6 |
| Activation | `network` in router ospf | `ipv6 ospf` on interface |
| Router ID | IPv4 address or manual | **Always** manual (32-bit) |
| Hello source | IPv4 interface address | Link-local address |
| Authentication | MD5 in router ospf | IPsec on interface |

**OSPFv3 verification:**
```
show ipv6 ospf neighbor
show ipv6 ospf interface
show ipv6 route ospf
```

---

## NDP — IPv6 Replacement for ARP

**Neighbor Discovery Protocol** performs ARP, router discovery and SLAAC functions:

| Message Type | ICMPv6 Type | Function |
|---|---|---|
| Router Solicitation (RS) | 133 | Host requests router |
| Router Advertisement (RA) | 134 | Router announces prefix/gateway |
| Neighbor Solicitation (NS) | 135 | MAC address request (analogous to ARP Request) |
| Neighbor Advertisement (NA) | 136 | Reply with MAC address |
| Redirect | 137 | Redirect to better gateway |

```
show ipv6 neighbors          ! Neighbor table (analogous to ARP table)
```
