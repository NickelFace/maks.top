---
title: "Network Engineer — 03. EtherChannel"
date: 2025-08-20
description: "Лабораторная работа: настройка EtherChannel с LACP и PAgP. Настройка port-channel, транкинг VLAN через агрегированные каналы."
tags: ["Networking", "EtherChannel", "LACP", "PAgP", "Cisco"]
categories: ["Network Engineer"]
code_toggle: true
page_lang: "ru"
lang_pair: "/posts/neteng/neteng-03-etherchannel/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Лабораторная работа: Настройка EtherChannel

### Топология

![EtherChannel topology](/img/neteng/03/Etherchannel.png)

### Таблица адресации

| Устройство | Интерфейс | IP-адрес      | Маска подсети |
| ---------- | --------- | ------------- | ------------- |
| S1         | VLAN 99   | 192.168.99.11 | 255.255.255.0 |
| S2         | VLAN 99   | 192.168.99.12 | 255.255.255.0 |
| S3         | VLAN 99   | 192.168.99.13 | 255.255.255.0 |
| PC-A       | NIC       | 192.168.10.1  | 255.255.255.0 |
| PC-B       | NIC       | 192.168.10.2  | 255.255.255.0 |
| PC-C       | NIC       | 192.168.10.3  | 255.255.255.0 |

### Цели

- **Часть 1.** Настройте базовые параметры коммутаторов
- **Часть 2.** Настройте EtherChannel PAgP (S1–S3)
- **Часть 3.** Настройте EtherChannel LACP (S1–S2)

---

### Часть 1 — Базовая настройка коммутаторов

<details>
<summary>S1</summary>
<pre><code>
enable
conf t
hostname S1
no ip domain-lookup
enable secret class
line console 0
exec-timeout 0 0
password cisco
logging synchronous
login
exit
line vty 0 15
password cisco
login
exit
interface range f0/1-24, g0/1-2
shutdown
exit
vlan 10
name Users
vlan 99
name Management
interface vlan 99
ip address 192.168.99.11 255.255.255.0
do copy run start
</code></pre>
</details>
<details>
<summary>S2</summary>
<pre><code>
enable
conf t
hostname S2
no ip domain-lookup
enable secret class
line console 0
exec-timeout 0 0
password cisco
logging synchronous
login
exit
line vty 0 15
password cisco
login
exit
interface range f0/1-24, g0/1-2
shutdown
exit
vlan 10
name Users
vlan 99
name Management
interface vlan 99
ip address 192.168.99.12 255.255.255.0
do copy run start
</code></pre>
</details>
<details>
<summary>S3</summary>
<pre><code>
enable
conf t
hostname S3
no ip domain-lookup
enable secret class
line console 0
exec-timeout 0 0
password cisco
logging synchronous
login
exit
line vty 0 15
password cisco
login
exit
interface range f0/1-24, g0/1-2
shutdown
exit
vlan 10
name Users
vlan 99
name Management
interface vlan 99
ip address 192.168.99.13 255.255.255.0
do copy run start
</code></pre>
</details>

---

### Часть 2 — EtherChannel PAgP (S1–S3)

PAgP (Port Aggregation Protocol) — проприетарный протокол Cisco. Режимы: `desirable` (активное согласование) и `auto` (пассивный).

<details>
<summary>S1</summary>
<pre><code>
interface range f0/3-4
channel-group 1 mode desirable
switchport mode trunk
switchport trunk native vlan 99
no shutdown
exit
interface port-channel 1
switchport mode trunk
switchport trunk native vlan 99
switchport trunk allowed vlan 1,10,99
</code></pre>
</details>
<details>
<summary>S3</summary>
<pre><code>
interface range f0/3-4
channel-group 1 mode auto
switchport mode trunk
switchport trunk native vlan 99
no shutdown
exit
interface port-channel 1
switchport mode trunk
switchport trunk native vlan 99
switchport trunk allowed vlan 1,10,99
</code></pre>
</details>

Проверьте:

```
show etherchannel summary
show etherchannel port-channel
```

---

### Часть 3 — EtherChannel LACP (S1–S2)

LACP (Link Aggregation Control Protocol) — открытый стандарт (802.3ad). Режимы: `active` и `passive`.

<details>
<summary>S1</summary>
<pre><code>
interface range f0/1-2
channel-group 2 mode active
switchport mode trunk
switchport trunk native vlan 99
no shutdown
exit
interface port-channel 2
switchport mode trunk
switchport trunk native vlan 99
switchport trunk allowed vlan 1,10,99
</code></pre>
</details>
<details>
<summary>S2</summary>
<pre><code>
interface range f0/1-2
channel-group 2 mode passive
switchport mode trunk
switchport trunk native vlan 99
no shutdown
exit
interface port-channel 2
switchport mode trunk
switchport trunk native vlan 99
switchport trunk allowed vlan 1,10,99
</code></pre>
</details>

---

*Network Engineer Course | Лабораторная работа 03*
