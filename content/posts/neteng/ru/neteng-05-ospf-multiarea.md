---
title: "Network Engineer — 05. OSPF Multiarea"
date: 2025-09-22
description: "Лабораторная работа: настройка OSPFv2 для нескольких зон. ABR, ASBR, межзональная суммаризация, аутентификация MD5."
tags: ["Networking", "OSPF", "Multiarea", "Routing", "Cisco"]
categories: ["Network Engineer"]
code_toggle: true
page_lang: "ru"
lang_pair: "/posts/neteng/neteng-05-ospf-multiarea/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Лабораторная работа: Настройка OSPFv2 для нескольких зон

### Топология

![OSPFv2 multiarea topology](/img/neteng/05/OSPFv2.png)

### Таблица адресации

| Устройство | Интерфейс    | IP-адрес        | Маска подсети   |
| ---------- | ------------ | --------------- | --------------- |
| R1         | Lo0          | 209.165.200.225 | 255.255.255.252 |
|            | Lo1          | 192.168.1.1     | 255.255.255.0   |
|            | Lo2          | 192.168.2.1     | 255.255.255.0   |
|            | S0/0/0 (DCE) | 192.168.12.1    | 255.255.255.252 |
| R2         | Lo6          | 192.168.6.1     | 255.255.255.0   |
|            | S0/0/0       | 192.168.12.2    | 255.255.255.252 |
|            | S0/0/1 (DCE) | 192.168.23.1    | 255.255.255.252 |
| R3         | Lo4          | 192.168.4.1     | 255.255.255.0   |
|            | Lo5          | 192.168.5.1     | 255.255.255.0   |
|            | S0/0/1       | 192.168.23.2    | 255.255.255.252 |

### Роли маршрутизаторов

| Маршрутизатор | Роль |
| ------------- | ---- |
| R1            | ASBR, ABR, магистральный маршрутизатор |
| R2            | ABR, магистральный маршрутизатор |
| R3            | Внутренний маршрутизатор (Area 3) |

### Цели

- **Часть 1.** Построить сеть, настроить базовые параметры устройств
- **Часть 2.** Настроить OSPFv2 multiarea (process ID 1)
- **Часть 3.** Настроить межзональные суммарные маршруты

---

### Часть 1 — Базовая настройка устройств

<details>
<summary>R1</summary>
<pre><code>
Enable
Configure terminal
hostname R1
interface Loopback0
 ip address 209.165.200.225 255.255.255.252
interface Loopback1
 ip address 192.168.1.1 255.255.255.0
interface Loopback2
 ip address 192.168.2.1 255.255.255.0
interface Serial0/0
 ip address 192.168.12.1 255.255.255.252
 clock rate 128000
 no shutdown
no ip domain-lookup
enable secret class
line vty 0 15
 logging synchronous
 password cisco
 login
line con 0
 logging synchronous
 password cisco
 login
Banner motd "This is a secure system. Authorized Access Only!"
do copy run start
</code></pre>
</details>
<details>
<summary>R2</summary>
<pre><code>
Enable
Configure terminal
hostname R2
interface Loopback6
 ip address 192.168.6.1 255.255.255.0
interface Serial0/0
 ip address 192.168.12.2 255.255.255.252
 no shutdown
interface Serial1/0
 ip address 192.168.23.1 255.255.255.252
 clock rate 128000
 no shutdown
no ip domain-lookup
enable secret class
line vty 0 4
 logging synchronous
 password cisco
 login
line con 0
 logging synchronous
 password cisco
 login
Banner motd "This is a secure system. Authorized Access Only!"
do copy run start
</code></pre>
</details>
<details>
<summary>R3</summary>
<pre><code>
enable
configure terminal
hostname R3
interface Serial0/0
 ip address 192.168.23.2 255.255.255.252
 no shutdown
interface Loopback4
 ip address 192.168.4.1 255.255.255.0
interface Loopback5
 ip address 192.168.5.1 255.255.255.0
no ip domain-lookup
enable secret class
line vty 0 4
 logging synchronous
 password cisco
 login
line con 0
 logging synchronous
 password cisco
 login
Banner motd "This is a secure system. Authorized Access Only!"
do copy run start
</code></pre>
</details>

Проверьте состояние интерфейсов:

<details>
<summary>Вывод R1 — show ip interface brief</summary>
<pre><code>
Interface      IP-Address       OK? Status    Protocol
Serial1/0      192.168.12.1     YES up        up
Loopback0      209.165.200.225  YES up        up
Loopback1      192.168.1.1      YES up        up
Loopback2      192.168.2.1      YES up        up
</code></pre>
</details>

---

### Часть 2 — Настройка OSPF multiarea

Каждый loopback-интерфейс LAN должен быть пассивным. MD5-аутентификация с ключом **Cisco123** на всех последовательных интерфейсах.

<details>
<summary>R1 (Area 0 + Area 1, ASBR)</summary>
<pre><code>
router ospf 1
 router-id 1.1.1.1
 network 192.168.1.0 0.0.0.255 area 1
 network 192.168.2.0 0.0.0.255 area 1
 network 192.168.12.0 0.0.0.3 area 0
 passive-interface Loopback1
 passive-interface Loopback2
 default-information originate
ip route 0.0.0.0 0.0.0.0 Loopback0
do clear ip ospf process
</code></pre>
</details>
<details>
<summary>R2 (Area 0 + Area 3, ABR)</summary>
<pre><code>
router ospf 1
 router-id 2.2.2.2
 network 192.168.6.0 0.0.0.255 area 3
 network 192.168.12.0 0.0.0.3 area 0
 network 192.168.23.0 0.0.0.3 area 3
 passive-interface Loopback6
do clear ip ospf process
</code></pre>
</details>
<details>
<summary>R3 (Area 3, внутренний)</summary>
<pre><code>
router ospf 1
 router-id 3.3.3.3
 network 192.168.23.0 0.0.0.3 area 3
 network 192.168.4.0 0.0.0.255 area 3
 network 192.168.5.0 0.0.0.255 area 3
 passive-interface Loopback4
 passive-interface Loopback5
do clear ip ospf process
</code></pre>
</details>

Проверьте установку соседства:

<details>
<summary>Вывод R1 — show ip ospf neighbor</summary>
<pre><code>
Neighbor ID  Pri  State      Dead Time  Address        Interface
2.2.2.2        0  FULL/ -    00:00:33   192.168.12.2   Serial1/0
</code></pre>
</details>
<details>
<summary>Вывод R2 — show ip ospf neighbor</summary>
<pre><code>
Neighbor ID  Pri  State      Dead Time  Address        Interface
1.1.1.1        0  FULL/ -    00:00:39   192.168.12.1   Serial1/0
3.3.3.3        0  FULL/ -    00:00:37   192.168.23.2   Serial1/1
</code></pre>
</details>

Проверьте стоимость интерфейсов:

<details>
<summary>Вывод R1 — show ip ospf interface brief</summary>
<pre><code>
Interface  PID  Area  IP Address/Mask    Cost  State  Nbrs F/C
Se1/0      1    0     192.168.12.1/30    64    P2P    1/1
Lo1        1    1     192.168.1.1/24     1     LOOP   0/0
Lo2        1    1     192.168.2.1/24     1     LOOP   0/0
</code></pre>
</details>

---

### MD5-аутентификация на последовательных интерфейсах

<details>
<summary>R1</summary>
<pre><code>
interface Serial1/0
 ip ospf authentication message-digest
 ip ospf message-digest-key 1 md5 Cisco123
</code></pre>
</details>
<details>
<summary>R2</summary>
<pre><code>
interface Serial0/0
 ip ospf authentication message-digest
 ip ospf message-digest-key 1 md5 Cisco123
interface Serial1/0
 ip ospf authentication message-digest
 ip ospf message-digest-key 1 md5 Cisco123
</code></pre>
</details>
<details>
<summary>R3</summary>
<pre><code>
interface Serial1/0
 ip ospf authentication message-digest
 ip ospf message-digest-key 1 md5 Cisco123
</code></pre>
</details>

Проверьте, что соседство восстановилось после применения аутентификации:

<details>
<summary>Вывод R2 — show ip ospf neighbor</summary>
<pre><code>
Neighbor ID  Pri  State      Dead Time  Address        Interface
1.1.1.1        0  FULL/ -    00:00:39   192.168.12.1   Serial1/0
3.3.3.3        0  FULL/ -    00:00:37   192.168.23.2   Serial1/1
</code></pre>
</details>

---

### Часть 3 — Межзональная суммаризация

Без суммаризации каждая loopback-сеть в Area 1 анонсируется отдельно. Добавьте суммарный маршрут на R1 (ABR для Area 1):

```
R1(config)# router ospf 1
R1(config-router)# area 1 range 192.168.0.0 255.255.252.0
```

Это отправит единственный суммарный маршрут `192.168.0.0/22` в Area 0 вместо отдельных записей /24.

Аналогично на R2 для Area 3:

```
R2(config)# router ospf 1
R2(config-router)# area 3 range 192.168.4.0 255.255.254.0
```

Проверьте, что таблица маршрутизации на R3 сократилась — межзональные маршруты `O IA` должны быть суммаризованы.

---

*Курс Network Engineer | Лабораторная работа 05*
