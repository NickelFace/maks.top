---
title: "Network Engineer — 01. VLAN"
date: 2025-08-03
description: "Лабораторная работа: настройка расширенных VLAN, VTP и STP. Транковые каналы, DTP, VLAN расширенного диапазона."
tags: ["Networking", "VLAN", "VTP", "Cisco"]
categories: ["Network Engineer"]
code_toggle: true
page_lang: "ru"
lang_pair: "/posts/neteng-01-vlan/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Лабораторная работа: Настройка расширенных VLAN, VTP и STP

### Топология

![VLAN topology](/img/neteng/01/VLAN.png)

### Таблица адресации

| Устройство | Интерфейс | IP-адрес     | Маска подсети |
| ---------- | --------- | ------------ | ------------- |
| S1         | VLAN 99   | 192.168.99.1 | 255.255.255.0 |
| S2         | VLAN 99   | 192.168.99.2 | 255.255.255.0 |
| S3         | VLAN 99   | 192.168.99.3 | 255.255.255.0 |
| PC-A       | NIC       | 192.168.10.1 | 255.255.255.0 |
| PC-B       | NIC       | 192.168.20.1 | 255.255.255.0 |
| PC-C       | NIC       | 192.168.10.2 | 255.255.255.0 |

### Цели

- Настройте VTP, DTP и транковые каналы между коммутаторами
- S2 выступает в роли VTP-сервера; S1 и S3 — клиенты
- Добавьте VLAN и назначьте порты
- Настройте VLAN расширенного диапазона на S1 в режиме VTP transparent

---

### Часть 1 — Базовая настройка устройств

1. Соберите топологию согласно схеме.

<details>
<summary>S1</summary>
<pre><code>
Enable
Configure terminal
interface vlan 1
ip address 192.168.1.1 255.255.255.0
no shutdown
exit
hostname S1
do copy run start
</code></pre>
</details>
<details>
<summary>S2</summary>
<pre><code>
Enable
Configure terminal
interface vlan 1
ip address 192.168.1.2 255.255.255.0
no shutdown
exit
hostname S2
do copy run start
</code></pre>
</details>
<details>
<summary>S3</summary>
<pre><code>
Enable
Configure terminal
interface vlan 1
ip address 192.168.1.3 255.255.255.0
no shutdown
exit
hostname S3
do copy run start
</code></pre>
</details>

2. Отключите DNS-поиск на каждом коммутаторе:

```
no ip domain-lookup
```

3. Задайте привилегированный и консольный пароли, включите logging synchronous:

<details>
<summary>S1, S2, S3</summary>
<pre><code>
no ip domain-lookup
enable secret cisco
line console 0
password cisco
login
logging synchronous
</code></pre>
</details>

4. Задайте баннер входа:

<details>
<summary>S1, S2, S3</summary>
<pre><code>
Banner motd "**This is a secure system. Authorized Access Only!
</code></pre>
</details>

---

### Часть 2 — Настройка VTP

<details>
<summary>S1 (client)</summary>
<pre><code>
vtp domain CCNA
vtp password cisco
vtp version 3
vtp mode client
</code></pre>
</details>
<details>
<summary>S2 (server)</summary>
<pre><code>
vtp domain CCNA
vtp password cisco
vtp version 3
vtp mode server
end
vtp primary server force
</code></pre>
</details>
<details>
<summary>S3 (client)</summary>
<pre><code>
vtp domain CCNA
vtp password cisco
vtp version 3
vtp mode client
</code></pre>
</details>

---

### Часть 3 — Транковые порты

Переведите порты коммутатора в режим транка, чтобы VTP мог распространять обновления:

<details>
<summary>S1, S2, S3</summary>
<pre><code>
interface Ethernet 0/3
switchport trunk encapsulation dot1q
switchport mode trunk
interface Ethernet 0/1
switchport trunk encapsulation dot1q
switchport mode trunk
</code></pre>
</details>

```
show interfaces trunk
```

<details>
<summary>Вывод S3</summary>
<pre><code>
Port        Mode             Encapsulation  Status        Native vlan
Et0/1       on               802.1q         trunking      1
Et0/3       on               802.1q         trunking      1
</code></pre>
</details>

---

### Часть 4 — Создание VLAN на сервере

<details>
<summary>S2</summary>
<pre><code>
vlan 999
name VTP_Lab
vlan 10
name Red
vlan 20
name Blue
vlan 30
name Yellow
vlan 99
name Management
</code></pre>
</details>

Проверьте, что VLAN распространились на клиентов:

<details>
<summary>S1 — show vlan brief</summary>
<pre><code>
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Et0/0, Et0/2
10   Red                              active
20   Blue                             active
30   Yellow                           active
999  VTP_Lab                          active
</code></pre>
</details>
<details>
<summary>S3 — show vlan brief</summary>
<pre><code>
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Et0/0, Et0/2
10   Red                              active
20   Blue                             active
30   Yellow                           active
999  VTP_Lab                          active
</code></pre>
</details>

---

### Часть 5 — Проверка связности

<details>
<summary>PC-A</summary>
<pre><code>
VPCS> ping 192.168.10.2
84 bytes from 192.168.10.2 icmp_seq=1 ttl=64 time=0.722 ms
84 bytes from 192.168.10.2 icmp_seq=2 ttl=64 time=1.135 ms
84 bytes from 192.168.10.2 icmp_seq=3 ttl=64 time=1.121 ms
</code></pre>
</details>
<details>
<summary>PC-C</summary>
<pre><code>
VPCS> ping 192.168.10.1
84 bytes from 192.168.10.1 icmp_seq=1 ttl=64 time=0.822 ms
84 bytes from 192.168.10.1 icmp_seq=2 ttl=64 time=1.187 ms
84 bytes from 192.168.10.1 icmp_seq=3 ttl=64 time=1.427 ms
</code></pre>
</details>

---

*Network Engineer Course | Лабораторная работа 01*
