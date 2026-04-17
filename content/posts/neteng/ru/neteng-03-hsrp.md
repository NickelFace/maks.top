---
title: "Network Engineer — 03. HSRP"
date: 2025-09-06
description: "Лабораторная работа: настройка резервирования первого перехода с помощью HSRP. Активный/резервный маршрутизатор, виртуальный IP, приоритет и вытеснение."
tags: ["Networking", "HSRP", "Redundancy", "Cisco"]
categories: ["Network Engineer"]
code_toggle: true
page_lang: "ru"
lang_pair: "/posts/neteng/neteng-03-hsrp/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Лабораторная работа: Настройка HSRP (резервирование первого перехода)

### Топология

![HSRP topology](/img/neteng/03/HSRP.png)

### Таблица адресации

| Устройство | Интерфейс    | IP-адрес        | Маска подсети   | Шлюз        |
| ---------- | ------------ | --------------- | --------------- | ----------- |
| R1         | G0/1         | 192.168.1.1     | 255.255.255.0   | —           |
|            | S0/0/0 (DCE) | 10.1.1.1        | 255.255.255.252 | —           |
| R2         | S0/0/0       | 10.1.1.2        | 255.255.255.252 | —           |
|            | S0/0/1 (DCE) | 10.2.2.2        | 255.255.255.252 | —           |
|            | Lo1          | 209.165.200.225 | 255.255.255.224 | —           |
| R3         | G0/1         | 192.168.1.3     | 255.255.255.0   | —           |
|            | S0/0/1       | 10.2.2.1        | 255.255.255.252 | —           |
| PC-A       | NIC          | 192.168.1.31    | 255.255.255.0   | 192.168.1.1 |
| PC-C       | NIC          | 192.168.1.33    | 255.255.255.0   | 192.168.1.3 |

### Цели

- **Часть 1.** Соберите топологию и проверьте связность
- **Часть 2.** Настройте резервирование первого перехода HSRP

---

### Часть 1 — Базовая настройка маршрутизаторов

<details>
<summary>R1</summary>
<pre><code>
Enable
Configure terminal
no ip domain-lookup
hostname R1
enable secret class
service password-encryption
banner motd "This is a secure system. Authorized Access Only!"
line vty 0 4
 logging synchronous
 password cisco
 login
line con 0
 exec-timeout 0 0
 logging synchronous
 password cisco
 login
interface Serial1/0
 ip address 10.1.1.1 255.255.255.252
 clock rate 128000
 no shutdown
interface Ethernet0/0
 ip address 192.168.1.1 255.255.255.0
 duplex full
 no shutdown
do copy run start
</code></pre>
</details>
<details>
<summary>R2</summary>
<pre><code>
Enable
Configure terminal
no ip domain-lookup
hostname R2
enable secret class
service password-encryption
banner motd "This is a secure system. Authorized Access Only!"
line vty 0 4
 logging synchronous
 password cisco
 login
line con 0
 exec-timeout 0 0
 logging synchronous
 password cisco
 login
interface Serial1/0
 ip address 10.1.1.2 255.255.255.252
 no shutdown
interface Serial1/1
 ip address 10.2.2.2 255.255.255.252
 clock rate 128000
 no shutdown
interface Loopback0
 ip address 209.165.200.225 255.255.255.224
do copy run start
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
service password-encryption
banner motd "This is a secure system. Authorized Access Only!"
line vty 0 4
 logging synchronous
 password cisco
 login
line con 0
 exec-timeout 0 0
 logging synchronous
 password cisco
 login
interface Serial1/1
 ip address 10.2.2.1 255.255.255.252
 no shutdown
interface Ethernet0/0
 ip address 192.168.1.3 255.255.255.0
 duplex full
 no shutdown
do copy run start
</code></pre>
</details>
<details>
<summary>PC-A</summary>
<pre><code>
set pcname PC-A
ip 192.168.1.31 192.168.1.1 24
</code></pre>
</details>
<details>
<summary>PC-C</summary>
<pre><code>
set pcname PC-C
ip 192.168.1.33 192.168.1.3 24
</code></pre>
</details>

---

### RIP для доступа в интернет

<details>
<summary>R1</summary>
<pre><code>
router rip
 version 2
 network 10.0.0.0
 network 192.168.1.0
 no auto-summary
</code></pre>
</details>
<details>
<summary>R2</summary>
<pre><code>
router rip
 version 2
 network 10.0.0.0
 default-information originate
 no auto-summary
ip route 0.0.0.0 0.0.0.0 Loopback0
</code></pre>
</details>
<details>
<summary>R3</summary>
<pre><code>
router rip
 version 2
 network 10.0.0.0
 network 192.168.1.0
 no auto-summary
</code></pre>
</details>

Проверьте таблицы маршрутизации и выполните ping с компьютеров до `209.165.200.225`.

<details>
<summary>Трассировка с PC-A</summary>
<pre><code>
PC-A> trace 209.165.200.225
1   192.168.1.1   1.555 ms
2   10.1.1.2      10.647 ms
</code></pre>
</details>

---

### Часть 2 — Настройка HSRP

HSRP предоставляет виртуальный IP-адрес, общий для R1 и R3. R1 становится активным с приоритетом 150; R3 — резервным.

<details>
<summary>R1 (Active)</summary>
<pre><code>
interface Ethernet0/0
 standby 1 ip 192.168.1.254
 standby version 2
 standby 1 priority 150
 standby 1 preempt
</code></pre>
</details>
<details>
<summary>R3 (Standby)</summary>
<pre><code>
interface Ethernet0/0
 standby 1 ip 192.168.1.254
 standby version 2
</code></pre>
</details>

Смените шлюз по умолчанию на ПК и коммутаторах на виртуальный IP **192.168.1.254**:

<details>
<summary>PC-A</summary>
<pre><code>
ip 192.168.1.31 192.168.1.254 24
</code></pre>
</details>
<details>
<summary>PC-C</summary>
<pre><code>
ip 192.168.1.33 192.168.1.254 24
</code></pre>
</details>
<details>
<summary>S1, S3 (шлюз управления)</summary>
<pre><code>
ip default-gateway 192.168.1.254
</code></pre>
</details>

---

### Проверка

```
show standby brief
```

<details>
<summary>R1</summary>
<pre><code>
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Et0/0       1    150 P Active  local           unknown         192.168.1.254
</code></pre>
</details>
<details>
<summary>R3</summary>
<pre><code>
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Et0/0       1    100   Standby 192.168.1.1     local           192.168.1.254
</code></pre>
</details>

Тест отказоустойчивости — непрерывный ping в интернет с отключением R1:

<details>
<summary>Непрерывный ping с PC-A</summary>
<pre><code>
PC-A> ping 209.165.200.225 -t
84 bytes icmp_seq=1  time=12 ms
...
209.165.200.225 icmp_seq=9 timeout   ← R1 отключён
209.165.200.225 icmp_seq=10 timeout
84 bytes icmp_seq=11 time=11 ms      ← R3 перехватил управление
</code></pre>
</details>

---

### Изменение приоритетов HSRP

Повысьте приоритет R3 до 200 и сделайте его активным:

```
R3(config)# interface Ethernet0/0
R3(config-if)# standby 1 priority 200
R3(config-if)# standby 1 preempt
```

<details>
<summary>R3 после изменения</summary>
<pre><code>
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Et0/0       1    200 P Active  local           unknown         192.168.1.254
</code></pre>
</details>

**Важное замечание:** Без `preempt` маршрутизатор с более высоким приоритетом не перехватит управление у текущего активного маршрутизатора. Необходимы оба параметра: `priority` и `preempt`.

---

*Network Engineer Course | Лабораторная работа 03*
