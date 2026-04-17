---
title: "Network Engineer — 04. OSPF Basics"
date: 2025-09-14
description: "Лабораторная работа: настройка OSPFv2 для одной зоны. Идентификаторы маршрутизаторов, пассивные интерфейсы, соседи, таблица маршрутизации, метрика OSPF."
tags: ["Networking", "OSPF", "Routing", "Cisco"]
categories: ["Network Engineer"]
code_toggle: true
page_lang: "ru"
lang_pair: "/posts/neteng/neteng-04-ospf-basics/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Лабораторная работа: Настройка OSPFv2 для одной зоны

### Топология

![OSPFv2 topology](/img/neteng/04/OSPFv2.png)

### Таблица адресации

| Устройство | Интерфейс    | IP-адрес     | Маска подсети   | Шлюз        |
| ---------- | ------------ | ------------ | --------------- | ----------- |
| R1         | G0/0         | 192.168.1.1  | 255.255.255.0   | —           |
|            | S0/0/0 (DCE) | 192.168.12.1 | 255.255.255.252 | —           |
|            | S0/0/1       | 192.168.13.1 | 255.255.255.252 | —           |
| R2         | G0/0         | 192.168.2.1  | 255.255.255.0   | —           |
|            | S0/0/0       | 192.168.12.2 | 255.255.255.252 | —           |
|            | S0/0/1 (DCE) | 192.168.23.1 | 255.255.255.252 | —           |
| R3         | G0/0         | 192.168.3.1  | 255.255.255.0   | —           |
|            | S0/0/0 (DCE) | 192.168.13.2 | 255.255.255.252 | —           |
|            | S0/0/1       | 192.168.23.2 | 255.255.255.252 | —           |
| PC-A       | NIC          | 192.168.1.3  | 255.255.255.0   | 192.168.1.1 |
| PC-B       | NIC          | 192.168.2.3  | 255.255.255.0   | 192.168.2.1 |
| PC-C       | NIC          | 192.168.3.3  | 255.255.255.0   | 192.168.3.1 |

### Цели

- **Часть 1.** Соберите топологию, настройте базовые параметры устройств
- **Часть 2.** Настройте и проверьте маршрутизацию OSPF
- **Часть 3.** Измените идентификаторы маршрутизаторов
- **Часть 4.** Настройте пассивные интерфейсы
- **Часть 5.** Измените метрику OSPF

---

### Часть 1 — Базовая настройка устройств

<details>
<summary>R1</summary>
<pre><code>
Enable
Configure terminal
no ip domain-lookup
hostname R1
enable secret class
line vty 0 4
 logging synchronous
 password cisco
 login
line con 0
 exec-timeout 0 0
 logging synchronous
 password cisco
 login
Banner motd "This is a secure system. Authorized Access Only!"
interface Ethernet0/0
 ip address 192.168.1.1 255.255.255.0
 no shutdown
interface Serial1/0
 clock rate 128000
 ip address 192.168.12.1 255.255.255.252
 no shutdown
interface Serial1/1
 ip address 192.168.13.1 255.255.255.252
 no shutdown
end
write
</code></pre>
</details>
<details>
<summary>R2</summary>
<pre><code>
Enable
Configure terminal
hostname R2
no ip domain-lookup
enable secret class
line vty 0 4
 logging synchronous
 password cisco
 login
line con 0
 exec-timeout 0 0
 logging synchronous
 password cisco
 login
Banner motd "This is a secure system. Authorized Access Only!"
interface Serial1/0
 ip address 192.168.12.2 255.255.255.252
 no shutdown
interface Serial1/1
 clock rate 128000
 ip address 192.168.23.1 255.255.255.252
 no shutdown
interface Ethernet0/0
 ip address 192.168.2.1 255.255.255.0
 no shutdown
end
write
</code></pre>
</details>
<details>
<summary>R3</summary>
<pre><code>
Enable
Configure terminal
no ip domain-lookup
hostname R3
enable secret class
line vty 0 4
 logging synchronous
 password cisco
 login
line con 0
 exec-timeout 0 0
 logging synchronous
 password cisco
 login
Banner motd "This is a secure system. Authorized Access Only!"
interface Serial1/0
 clock rate 128000
 ip address 192.168.13.2 255.255.255.252
 no shutdown
interface Serial1/1
 ip address 192.168.23.2 255.255.255.252
 no shutdown
interface Ethernet0/0
 ip address 192.168.3.1 255.255.255.0
 no shutdown
do write
</code></pre>
</details>
<details>
<summary>PC-A / PC-B / PC-C</summary>
<pre><code>
set pcname PC-A
ip 192.168.1.3 24 192.168.1.1

set pcname PC-B
ip 192.168.2.3 24 192.168.2.1

set pcname PC-C
ip 192.168.3.3 24 192.168.3.1
</code></pre>
</details>

---

### Часть 2 — Настройка и проверка OSPF

<details>
<summary>R1</summary>
<pre><code>
router ospf 1
network 192.168.1.0 0.0.0.255 area 0
network 192.168.12.0 0.0.0.3 area 0
network 192.168.13.0 0.0.0.3 area 0
</code></pre>
</details>
<details>
<summary>R2</summary>
<pre><code>
router ospf 1
network 192.168.2.0 0.0.0.255 area 0
network 192.168.12.0 0.0.0.3 area 0
network 192.168.23.0 0.0.0.3 area 0
</code></pre>
</details>
<details>
<summary>R3</summary>
<pre><code>
router ospf 1
network 192.168.3.0 0.0.0.255 area 0
network 192.168.13.0 0.0.0.3 area 0
network 192.168.23.0 0.0.0.3 area 0
</code></pre>
</details>

Проверьте соседей и таблицу маршрутизации:

```
show ip ospf neighbor
show ip route
show ip protocols
show ip ospf interface brief
```

<details>
<summary>R1 — show ip ospf neighbor</summary>
<pre><code>
Neighbor ID     Pri   State           Dead Time   Address         Interface
192.168.23.2      0   FULL/  -        00:00:34    192.168.13.2    Serial1/1
192.168.23.1      0   FULL/  -        00:00:39    192.168.12.2    Serial1/0
</code></pre>
</details>
<details>
<summary>R1 — show ip route</summary>
<pre><code>
      192.168.1.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.1.0/24 is directly connected, Ethernet0/0
O     192.168.2.0/24 [110/74] via 192.168.12.2, Serial1/0
O     192.168.3.0/24 [110/74] via 192.168.13.2, Serial1/1
      192.168.12.0/30 is directly connected, Serial1/0
      192.168.13.0/30 is directly connected, Serial1/1
O        192.168.23.0 [110/128] via 192.168.13.2, Serial1/1
</code></pre>
</details>
<details>
<summary>R1 — show ip ospf interface brief</summary>
<pre><code>
Interface    PID   Area    IP Address/Mask      Cost  State  Nbrs F/C
Se1/1        1     0       192.168.13.1/30      64    P2P    1/1
Se1/0        1     0       192.168.12.1/30      64    P2P    1/1
Et0/0        1     0       192.168.1.1/24       10    DR     0/0
</code></pre>
</details>

Проверьте сквозную связность:

<details>
<summary>Ping с PC-A</summary>
<pre><code>
PC-A> ping 192.168.2.3
84 bytes from 192.168.2.3 icmp_seq=1 ttl=62 time=10.127 ms
PC-A> ping 192.168.3.3
84 bytes from 192.168.3.3 icmp_seq=1 ttl=62 time=11.863 ms
</code></pre>
</details>

---

### Часть 3 — Идентификаторы маршрутизаторов

OSPF использует Router ID для идентификации каждого маршрутизатора в процессе. Порядок выбора:
1. Явно заданная команда `router-id`
2. Наибольший IP-адрес loopback-интерфейса
3. Наибольший IP-адрес активного физического интерфейса

Назначьте явные Router ID:

```
R1(config)# router ospf 1
R1(config-router)# router-id 1.1.1.1
R1(config-router)# end
R1# clear ip ospf process
```

Повторите для R2 (`2.2.2.2`) и R3 (`3.3.3.3`).

---

### Часть 4 — Пассивные интерфейсы

Пассивный интерфейс прекращает отправку OSPF hello-пакетов — полезно для LAN-интерфейсов без соседей OSPF:

```
R1(config)# router ospf 1
R1(config-router)# passive-interface GigabitEthernet0/0
```

Чтобы сделать все интерфейсы пассивными по умолчанию и затем выборочно включить:

```
passive-interface default
no passive-interface Serial1/0
no passive-interface Serial1/1
```

---

### Часть 5 — Метрика OSPF (стоимость)

Стоимость OSPF = эталонная пропускная способность / пропускная способность интерфейса. Эталон по умолчанию: 100 Мбит/с.

Измените эталонную пропускную способность (применить на всех маршрутизаторах):

```
router ospf 1
auto-cost reference-bandwidth 1000
```

Переопределите стоимость на конкретном интерфейсе:

```
interface Serial1/0
ip ospf cost 50
```

---

*Network Engineer Course | Лабораторная работа 04*
