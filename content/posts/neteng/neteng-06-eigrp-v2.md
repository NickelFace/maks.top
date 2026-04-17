---
title: "Network Engineer — 06. EIGRP for IPv4 (Advanced Features)"
date: 2025-10-09
description: "Lab: advanced EIGRP features — auto-summary, redistribute static, hello/hold timers, bandwidth percent"
tags: ["Networking", "EIGRP", "Routing", "Cisco", "OTUS"]
categories: ["Network Engineer"]
code_toggle: true
lang_pair: "/posts/neteng/ru/neteng-06-eigrp-v2/"
---

# Lab: Advanced EIGRP for IPv4 Configuration

<p class="ru-text">Лабораторная работа. Настройка расширенных функций EIGRP для IPv4</p>

## Topology

​             ![image](/img/neteng/06/2/1.png)                  

### Addressing Table

| Device | Interface | IP Address | Subnet Mask | Default Gateway |
| ------------ | ------------- | --------------- | ---------------- | ----------------- |
| R1 | G0/0 | 192.168.1.1 | 255.255.255.0 | — |
| S0/0/0 (DCE) | 192.168.12.1 | 255.255.255.252 | — | |
| S0/0/1 | 192.168.13.1 | 255.255.255.252 | — | |
| Lo1 | 192.168.11.1 | 255.255.255.252 | N/A | |
| Lo5 | 192.168.11.5 | 255.255.255.252 | — | |
| Lo9 | 192.168.11.9 | 255.255.255.252 | — | |
| Lo13 | 192.168.11.13 | 255.255.255.252 | — | |
| R2 | G0/0 | 192.168.2.1 | 255.255.255.0 | — |
| S0/0/0 | 192.168.12.2 | 255.255.255.252 | — | |
| S0/0/1 (DCE) | 192.168.23.1 | 255.255.255.252 | — | |
| Lo1 | 192.168.22.1 | 255.255.255.252 | — | |
| R3 | G0/0 | 192.168.3.1 | 255.255.255.0 | — |
| S0/0/0 (DCE) | 192.168.13.2 | 255.255.255.252 | — | |
| S0/0/1 | 192.168.23.2 | 255.255.255.252 | — | |
| Lo1 | 192.168.33.1 | 255.255.255.252 | N/A | |
| Lo5 | 192.168.33.5 | 255.255.255.252 | — | |
| Lo9 | 192.168.33.9 | 255.255.255.252 | — | |
| Lo13 | 192.168.33.13 | 255.255.255.252 | — | |
| PC-A | NIC | 192.168.1.3 | 255.255.255.0 | 192.168.1.1 |
| PC-B | NIC | 192.168.2.3 | 255.255.255.0 | 192.168.2.1 |
| PC-C | NIC | 192.168.3.3 | 255.255.255.0 | 192.168.3.1 |

## Objectives

<p class="ru-text">Задачи</p>

**Part 1. Build the Network and Configure Basic Device Settings**

**Part 2. Configure EIGRP and Verify Connectivity**

**Part 3. Configure EIGRP for Automatic Summarization**

**Part 4. Configure and Redistribute a Default Static Route**

**Part 5. Fine-tune EIGRP**

- Configure bandwidth utilization for EIGRP.
- Configure hello interval and hold-time timers.

<p class="ru-text">Часть 1. Создание сети и настройка основных параметров устройства<br>Часть 2. Настройка EIGRP и проверка подключения<br>Часть 3. Настройка EIGRP для автоматического объединения<br>Часть 4. Настройка и распространение статического маршрута по умолчанию<br>Часть 5. Выполнение точной настройки EIGRP</p>

## Build the Network and Configure Basic Settings

<p class="ru-text">Создание сети и настройка основных параметров устройства</p>

R1

```
Enable
configure terminal
hostname R1

interface serial 0/0
ip address 192.168.12.1 255.255.255.252
no shutdown
interface serial 1/0
ip address 192.168.13.1 255.255.255.252
no shutdown
interface gi2/0
ip address 192.168.1.1 255.255.255.0
no shutdown

line console 0
exec-timeout 0 0
exit
no ip domain-lookup
enable secret class
line vty 0 15
logging synchronous
password cisco
login
exit

do copy run start
[Enter]
```

R2

```
Enable
configure terminal
hostname R2

interface serial 0/0
ip address 192.168.12.2 255.255.255.252
no shutdown
interface serial 1/0
ip address 192.168.23.1 255.255.255.252
no shutdown
interface gi2/0
ip address 192.168.2.1 255.255.255.0
no shutdown

line console 0
exec-timeout 0 0
exit
no ip domain-lookup
enable secret class
line vty 0 15
logging synchronous
password cisco
login
exit

do copy run start
[Enter]
```

R3

```
Enable
configure terminal
hostname R3

interface serial 0/0
ip address 192.168.13.2 255.255.255.252
no shutdown
interface serial 1/0
ip address 192.168.23.2 255.255.255.252
no shutdown
interface gi2/0
ip address 192.168.3.1 255.255.255.0
no shutdown

line console 0
exec-timeout 0 0
exit
no ip domain-lookup
enable secret class
line vty 0 15
logging synchronous
password cisco
login
exit

do copy run start
[Enter]
```

## Configure EIGRP and Verify Connectivity

<p class="ru-text">Настройка EIGRP и проверка подключения</p>

Configure EIGRP AS 1 on R1 for all directly connected networks:

<p class="ru-text">На маршрутизаторе R1 настройте маршрутизацию EIGRP с номером AS 1 для всех сетей с прямым подключением.</p>

```
router eigrp 1
network 192.168.12.1 0.0.0.3
network 192.168.13.1 0.0.0.3
network 192.168.1.1 0.0.0.255
```

Disable EIGRP hello packets on R1 LAN interface:
<p class="ru-text">Для интерфейса локальной сети маршрутизатора R1 отключите передачу пакетов приветствия EIGRP.</p>

```
passive-interface gigabitEthernet 2/0
```

Set bandwidth on R1: S0/0/0 = 1024 Kbps, S0/0/1 = 64 Kbps. Note: `bandwidth` affects EIGRP metric calculation only, not actual link speed.

<p class="ru-text">На маршрутизаторе R1 настройте пропускную способность: S0/0/0 = 1024 Кбит/с, S0/0/1 = 64 Кбит/с. Примечание: команда bandwidth влияет только на вычисление метрики EIGRP.</p>

R1

```
interface serial 0/0 
bandwidth 1024
interface serial 1/0
bandwidth 64
```

Configure R2 (EIGRP AS 1, passive LAN, S0/0/0 bandwidth 1024 Kbps):

<p class="ru-text">На маршрутизаторе R2 настройте EIGRP с AS 1, отключите hello на LAN, задайте пропускную способность S0/0/0 = 1024.</p>

R2

```
router eigrp 1
network 192.168.2.1 0.0.0.255
network 192.168.12.2 0.0.0.3
network 192.168.23.1 0.0.0.3
passive-interface gigabitEthernet 2/0
interface serial 0/0
bandwidth 1024
```

Configure R3 (EIGRP AS 1, passive LAN, S0/0/0 bandwidth 64 Kbps):

<p class="ru-text">На маршрутизаторе R3 настройте EIGRP с AS 1, отключите hello на LAN, задайте пропускную способность S0/0/0 = 64.</p>

```
router eigrp 1
network 192.168.3.1 0.0.0.255
network 192.168.13.2 0.0.0.3
network 192.168.23.2 0.0.0.3
passive-interface gigabitEthernet 2/0
interface serial 0/0
bandwidth 64
```

### Verify Connectivity

<p class="ru-text">Проверьте связь</p>

From PC-A:

```
C:\>ping 192.168.3.3

Pinging 192.168.3.3 with 32 bytes of data:

Reply from 192.168.3.3: bytes=32 time=2ms TTL=125
Reply from 192.168.3.3: bytes=32 time=2ms TTL=125
Reply from 192.168.3.3: bytes=32 time=2ms TTL=125
Reply from 192.168.3.3: bytes=32 time=2ms TTL=125

Ping statistics for 192.168.3.3:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 2ms, Maximum = 2ms, Average = 2ms
```

## Configure EIGRP for Automatic Summarization

<p class="ru-text">Настройка EIGRP для автоматического объединения</p>

### Check Auto-Summary Default

<p class="ru-text">Настройте EIGRP для автоматического объединения.</p>

Run `show ip protocols` on R1. How is auto-summary configured by default?
<p class="ru-text">Введите команду show ip protocols на R1. Как по умолчанию настроено автоматическое объединение в EIGRP?</p>

```
R1#show ip protocols 

Routing Protocol is "eigrp  1 " 
  Outgoing update filter list for all interfaces is not set 
  Incoming update filter list for all interfaces is not set 
  Default networks flagged in outgoing updates  
  Default networks accepted from incoming updates 
  EIGRP metric weight K1=1, K2=0, K3=1, K4=0, K5=0
  EIGRP maximum hopcount 100
  EIGRP maximum metric variance 1
Redistributing: eigrp 1
  Automatic network summarization is in effect  
  Automatic address summarization: 
    192.168.12.0/24 for GigabitEthernet2/0, Serial1/0
      Summarizing with metric 3011840
    192.168.13.0/24 for GigabitEthernet2/0, Serial0/0
      Summarizing with metric 40512000
  Maximum path: 4
  Routing for Networks:  
     192.168.12.0/30
     192.168.13.0/30
     192.168.1.0
  Passive Interface(s): 
    GigabitEthernet2/0
  Routing Information Sources:  
    Gateway         Distance      Last Update 
    192.168.12.2    90            4397620    
    192.168.13.2    90            5983078    
  Distance: internal 90 external 170
```

Auto-summary is **enabled** by default.
<p class="ru-text">Автоматическое объединение в EIGRP включено по умолчанию.</p>

### Configure Loopback Addresses on R1

<p class="ru-text">Настройте loopback-адреса на R1.</p>

```
interface loopback1
ip address 192.168.11.1 255.255.255.252
interface loopback 5
ip address 192.168.11.5 255.255.255.252
interface loopback 9
ip address 192.168.11.9 252.255.255.252
interface loopback 13
ip address 192.168.11.13 255.255.255.252
```

### Add Network Statements for EIGRP on R1

<p class="ru-text">Добавьте соответствующие инструкции network для процесса EIGRP на маршрутизаторе R1.</p>

```
router eigrp 1
network 192.168.11.1 0.0.0.3
network 192.168.11.5 0.0.0.3
network 192.168.11.9 0.0.0.3
network 192.168.11.13 0.0.0.3
```

### How are loopback networks represented on R2?

<p class="ru-text">На маршрутизаторе R2 выполните команду show ip route eigrp. Как сети loopback представлены в результатах этой команды?</p>

```
R2(config-if)#do sh ip route eigrp
D    192.168.1.0/24 [90/3014400] via 192.168.12.1, 00:39:04, Serial0/0
D    192.168.3.0/24 [90/2172416] via 192.168.23.2, 00:12:37, Serial1/0
D    192.168.11.0/24 [90/3139840] via 192.168.12.1, 00:00:12, Serial0/0
     192.168.12.0/24 is variably subnetted, 2 subnets, 2 masks
D       192.168.12.0/24 is a summary, 00:39:05, Null0
D    192.168.13.0/24 [90/41024000] via 192.168.12.1, 00:14:19, Serial0/0
                     [90/41024000] via 192.168.23.2, 00:12:37, Serial1/0
     192.168.23.0/24 is variably subnetted, 2 subnets, 2 masks
D       192.168.23.0/24 is a summary, 00:12:40, Null0
```

Auto-summary aggregated the loopbacks into 192.168.11.0/24.
<p class="ru-text">Сработала автосуммаризация сетей на 192.168.11.0/24</p>

### Disable auto-summary on R1 with `no auto-summary`

<p class="ru-text">На маршрутизаторе R1 выполните команду no auto-summary в рамках процесса EIGRP.</p>

*Note: auto-summary is enabled by default — assumed typo in the lab guide.*
<p class="ru-text">Так как автосуммаризация включена по умолчанию, то предположу, что тут была опечатка.</p>

```
R1(config-router)#no auto-summary 
R1(config-router)#
%DUAL-5-NBRCHANGE: IP-EIGRP 1: Neighbor 192.168.12.2 (Serial0/0) resync: summary configured
%DUAL-5-NBRCHANGE: IP-EIGRP 1: Neighbor 192.168.13.2 (Serial1/0) resync: summary configured
```

Routing table on R2 after disabling auto-summary on R1:
<p class="ru-text">Как изменилась таблица маршрутизации на R2?</p>

```
R2(config)#do show ip route eigrp
D    192.168.1.0/24 [90/3014400] via 192.168.12.1, 00:00:29, Serial0/0
D    192.168.3.0/24 [90/2172416] via 192.168.23.2, 00:38:45, Serial1/0
     192.168.11.0/30 is subnetted, 3 subnets
D       192.168.11.0 [90/3139840] via 192.168.12.1, 00:00:29, Serial0/0
D       192.168.11.4 [90/3139840] via 192.168.12.1, 00:00:29, Serial0/0
D       192.168.11.12 [90/3139840] via 192.168.12.1, 00:00:29, Serial0/0
     192.168.12.0/24 is variably subnetted, 2 subnets, 2 masks
D       192.168.12.0/24 is a summary, 01:05:13, Null0
     192.168.13.0/24 is variably subnetted, 2 subnets, 2 masks
D       192.168.13.0/24 [90/41024000] via 192.168.23.2, 00:38:45, Serial1/0
D       192.168.13.0/30 [90/41024000] via 192.168.12.1, 00:00:29, Serial0/0
     192.168.23.0/24 is variably subnetted, 2 subnets, 2 masks
D       192.168.23.0/24 is a summary, 00:38:48, Null0
```

Add loopback interfaces and EIGRP network statements on R3, then disable auto-summary:
<p class="ru-text">Повторите подшаги б–д, добавив интерфейсы обратной петли, сети процесса EIGRP и автоматическое объединение на маршрутизаторе R3.</p>

```
interface loopback 1
ip address 192.168.33.1 255.255.255.252
interface loopback 5 
ip address 192.168.33.5 255.255.255.252
interface loopback 9
ip address 192.168.33.9 255.255.255.252
interface loopback 13
ip address 192.168.33.13 255.255.255.252

router eigrp 1
network 192.168.33.1 0.0.0.3
network 192.168.33.5 0.0.0.3
network 192.168.33.9 0.0.0.3
network 192.168.33.13 0.0.0.3
```

## Configure and Redistribute a Default Static Route

<p class="ru-text">Настройка и распространение статического маршрута по умолчанию</p>

Configure a loopback on R2 and redistribute a default static route via EIGRP:
<p class="ru-text">В части 4 необходимо настроить статический маршрут по умолчанию на R2 и распространить его на все остальные маршрутизаторы.</p>

```
interface loopback1
ip address 192.168.22.1 255.255.255.252
```

```
R2(config)# ip route 0.0.0.0 0.0.0.0 Lo1
```

```
R2(config)# router eigrp 1
R2(config-router)# redistribute static
```

Verify with `show ip protocols` on R2:
<p class="ru-text">Используйте команду show ip protocols на маршрутизаторе R2, чтобы проверить, распространился ли этот статический маршрут.</p>

```
R2#show ip protocols

Routing Protocol is "eigrp  1 " 
  Outgoing update filter list for all interfaces is not set 
  Incoming update filter list for all interfaces is not set 
  Default networks flagged in outgoing updates  
  Default networks accepted from incoming updates 
  EIGRP metric weight K1=1, K2=0, K3=1, K4=0, K5=0
  EIGRP maximum hopcount 100
  EIGRP maximum metric variance 1
Redistributing: eigrp 1, static 
  ...
```

Check default route on R1 with `show ip route eigrp | include 0.0.0.0`:
<p class="ru-text">На маршрутизаторе R1 выполните команду show ip route eigrp| include 0.0.0.0, чтобы просмотреть инструкции, относящиеся к маршруту по умолчанию.</p>

Note: the `include` pipe doesn't work in Packet Tracer, but without it:
<p class="ru-text">Команда не работает в Packet Tracer, но без include 0.0.0.0 всё работает.</p>

```
R1(config-router)#do show ip route eigrp
D    192.168.2.0/24 [90/3014400] via 192.168.12.2, 00:18:18, Serial0/0
D    192.168.3.0/24 [90/3526400] via 192.168.12.2, 00:13:13, Serial0/0
     ...
D*EX 0.0.0.0/0 [170/4291840] via 192.168.12.2, 00:02:08, Serial0/0
```

The default route shows as EIGRP external (EX), with AD = 170.
<p class="ru-text">Указан как EIGRP полученный извне, а административная дистанция (AD) распространяемого маршрута равна 170.</p>

## Fine-Tune EIGRP

<p class="ru-text">Подгонка EIGRP</p>

### Configure EIGRP Bandwidth Percent

<p class="ru-text">Настройте параметры использования пропускной способности для EIGRP.</p>

Allow EIGRP to use 75% of bandwidth on R1–R2 link:
<p class="ru-text">Настройте последовательный канал между R1 и R2, чтобы разрешить трафику EIGRP использовать только 75% пропускной способности канала.</p>

```
R1(config)# interface s0/0
R1(config-if)# ip bandwidth-percent eigrp 1 75

R2(config)# interface s0/0
R2(config-if)# ip bandwidth-percent eigrp 1 75
```

Note: this command is not implemented in Packet Tracer.
<p class="ru-text">В Packet Tracer опять же не реализована эта команда.</p>

```
R1(config-router)#interface s0/0
R1(config-if)#ip bandwidth-percent eigrp 1 75
                 ^
% Invalid input detected at '^' marker.
```

### Configure Hello and Hold-Time Timers

<p class="ru-text">Настройте интервал отправки пакетов приветствия (hello) и таймер удержания для EIGRP.</p>

Check current values with `show ip eigrp interfaces detail` (not available in PT):
<p class="ru-text">На маршрутизаторе R2 используйте команду show ip eigrp interfaces detail. К сожалению, эта команда тоже не реализована в PacketTracer.</p>

```
EIGRP-IPv4 Interfaces for AS(1)
...
Hello-interval is 5, Hold-time is 15
...
Interface BW percentage is 75
```

Set hello-interval = 60s and hold-time = 180s on R1 serial interfaces:
<p class="ru-text">Для интерфейсов S0/0 и S1/0 маршрутизатора R1 настройте интервал приветствия = 60 сек, таймер удержания = 180 сек.</p>

```
R1(config)# interface s0/0
R1(config-if)# ip hello-interval eigrp 1 60
R1(config-if)# ip hold-time eigrp 1 180
R1(config)# interface s1/0
R1(config-if)# ip hello-interval eigrp 1 60
R1(config-if)# ip hold-time eigrp 1 180
```

Could not apply hold-time on R2/R3 — not supported in Packet Tracer.
<p class="ru-text">Повторить не удалось, по причине того, что в PT не реализовано изменение hold-time интервала.</p>

## Review Questions

<p class="ru-text">Вопросы для повторения</p>

1. What are the benefits of route summarization?
<p class="ru-text">В чем заключаются преимущества объединения маршрутов?</p>

Reduces the routing table size. (Best practice recommends disabling it in most cases.)
<p class="ru-text">Уменьшение таблицы маршрутизации. (Best practices говорит, что нужно отключать его.)</p>

2. Why must the hold-time be set equal to or greater than the hello interval in EIGRP?
<p class="ru-text">Почему при настройке таймеров EIGRP необходимо настраивать значение времени удержания равным или больше интервала приветствия?</p>

Routers won't form a neighbor relationship otherwise. Hello packets check if a neighbor is alive; after hold-time expires the router considers the neighbor dead.
<p class="ru-text">Роутеры не подружатся. Хелло интервалы проверяют, жив ли роутер. После истечения времени удержания роутер будет считать его нерабочим.</p>
