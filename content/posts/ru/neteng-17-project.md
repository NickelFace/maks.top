---
title: "Network Engineer — 17. Corporate Office Network"
date: 2026-01-09
description: "Проектирование и настройка корпоративной сети по трёхуровневой иерархической модели Cisco с использованием OSPF, HSRP, STP, DHCP, PAT и средств защиты L2"
tags: ["Networking", "OSPF", "HSRP", "STP", "DHCP", "NAT", "Cisco", "OTUS"]
categories: ["Network Engineer"]
code_toggle: true
page_lang: "ru"
lang_pair: "/posts/neteng-17-project/"
pagefind_ignore: true
build:
  list: never
  render: always
---

# «Организация сети офиса»

![](/img/neteng/17/Corporate.png)

В этом файле я укажу настроенные конфигурации устройств, а темы как защита сети, почему настраивал так или иначе буду разбивать на более мелкие файлы, для удобства восприятия.

## Разбиваем на части:

1. [Адресация сети](#1)
2. [OSPF и проверка связности](#2)
3. [STP](#3)
4. [DHCP и защита L2](#4)
5. [ISP и выход в интернет, PAT, FTP, 3-й блок Distribution (Server Farm), NTP](#5)

### <a name="1">Адресация сети предприятия</a>

Из частного диапазона адресов была выбрана **172.16.0.0/16** и **10.0.0.0/8**, чтобы избежать пересечения сетей, когда будем в будущем настраивать удаленную работу сотрудникам предприятия.

При построении будущей модели предприятия было решено строить 3х уровневую иерархическую модель предприятия, предложенную компанией Cisco: **Enterprise Campus Architecture**. Так как планируется, что 80% трафика будет задействовано внутри предприятия и 20% внешнего трафика.

**Access Layer** — подразумевает, что на 1 устройство ляжет не более 5% от общего трафика всего предприятия в среднем.

**Distribution Layer** — подразумевает, что на 1 устройство ляжет не более 20% от общего трафика всего предприятия в среднем.

**Core Layer** — подразумевает, что на 1 устройство ляжет не более 80% от общего трафика всего предприятия в среднем (но может и под 100% и это будет тоже нормально).

Далее трафик был поделен на 9 VLAN-ов:

```
2    ENGINEER
3    ACCOUNTING
4    LAWYER 
5    SKLAD
6    PROVISION
7    IT
20   MANAGEMENT
21   MANAGEMENT
```

А также 20 VLAN MANAGEMENT был добавлен, когда разворачивал Windows Server в 3 distribution блоке. Всю сеть предприятия можно поделить на **3 блока** Distribution, которые объединены иерархически.

*Блок 1*: D-SW1 и D-SW2

*Блок 2*: D-SW3 и D-SW4

*Блок 3*: FarmDistSW1 и FarmDistSW2

Всё что ниже этих устройств — это L2, всё что выше этих устройств — L3.

#### <a name="3">Создание VLAN, работа с HSRP и STP.</a>

Для первых 2х блоков и перехода в L3 использовался протокол резервирования первого перехода — **HSRP**. И первая проблема, с которой столкнулся, это STP, а точнее PVST, который строит дерево за каждый VLAN. Проблема в том, что STP блокирует порты, и вследствие чего трафик идет через Access коммутатор, нарушая идеологию иерархического построения сети.

За первый блок D-SW1 и D-SW2 у нас 3 домена трафика: VLAN 2, 3, 20. Это означает, что у нас будет 3 STP дерева, которые должны строиться согласно иерархической идеологии. Именно поэтому мы обязаны вручную прописать Root Primary, а также Root Secondary.

![](/img/neteng/17/DistributionBlock1.png)

Аналогичная ситуация складывается и во 2ом блоке, где уже 5 STP деревьев нужно построить.

![](/img/neteng/17/DistributionBlock2.png)

Укажу команды по данной настройке и для примера возьму **D-SW1**

**D-SW1**

```
! Set root per VLAN:

spanning-tree vlan 2,20 priority 24576
spanning-tree vlan 3 priority 28672

! Did not restrict specific VLANs on trunk ports since D-SW access is physically restricted
! (server room locked with a key).
 
! HSRP per VLAN + ip helper-address to forward DHCP requests to the server
! (which may be across multiple L2 segments):

interface Vlan2
 ip address 172.16.2.251 255.255.255.0
 ip helper-address 5.5.5.11
 standby 0 ip 172.16.2.1
 standby 0 priority 150
 standby 0 preempt
 
 interface Vlan3
 ip address 172.16.3.251 255.255.255.0
 ip helper-address 5.5.5.11
 standby 0 ip 172.16.3.1
 standby 0 preempt
 
! Loopback assigned on every device participating in OSPF:
 
interface Loopback0
  ip address 5.5.5.1 255.255.255.255 
```

Аналогичная настройка присутствует на остальных L3 Switch уровня Distribution.

### <a name="2">OSPF и проверка связности</a>

Далее было прописан адрес на каждом интерфейсе Router или Switch L3 в режиме роутера. И организован протокол динамической маршрутизации OSPF.

**D-SW1**

```
router ospf 1
 router-id 1.1.1.1
 network 5.5.5.1 0.0.0.0 area 0  
 network 10.0.1.0 0.0.0.3 area 0
 network 10.0.2.0 0.0.0.3 area 0
 network 172.16.2.0 0.0.0.255 area 0  
 network 172.16.3.0 0.0.0.255 area 0
 network 172.16.20.0 0.0.0.255 area 0

! Reduced dead-interval to 20 for faster convergence on link failure:

interface Ethernet1/2
 no switchport
 ip address 10.0.1.1 255.255.255.252
 ip ospf dead-interval 20
 duplex auto
!         
interface Ethernet1/3
 no switchport
 ip address 10.0.2.1 255.255.255.252
 ip ospf dead-interval 20
 duplex auto
 
! Considered adding an additional OSPF area but decided against it
! since the network has relatively few devices.
```

На этом этапе была проведено тестирование оборудования на отказоустойчивость и на скорость сходимости в случае сбоя.

### <a name="4">DHCP, а также настройка L2 Security</a>

![](/img/neteng/17/Corporate.png)

**DHCP**

```
! Exclude default gateways and VLAN interface addresses from DHCP pool:

ip dhcp excluded-address 172.16.2.1
ip dhcp excluded-address 172.16.3.1
ip dhcp excluded-address 172.16.4.1
ip dhcp excluded-address 172.16.5.1
ip dhcp excluded-address 172.16.6.1
ip dhcp excluded-address 172.16.7.1
ip dhcp excluded-address 172.16.20.1 172.16.20.5
ip dhcp excluded-address 172.16.21.1
ip dhcp excluded-address 172.16.21.5 172.16.21.8
ip dhcp excluded-address 172.16.2.251 172.16.2.252
ip dhcp excluded-address 172.16.3.251 172.16.3.252
ip dhcp excluded-address 172.16.3.253 172.16.3.254
ip dhcp excluded-address 172.16.4.253 172.16.4.254
ip dhcp excluded-address 172.16.5.253 172.16.5.254
ip dhcp excluded-address 172.16.6.253 172.16.6.254
ip dhcp excluded-address 172.16.7.253 172.16.7.254
!         
ip dhcp pool VLAN2
 network 172.16.2.0 255.255.255.0
 default-router 172.16.2.1 
 dns-server 192.168.1.1 
!         
ip dhcp pool VLAN3
 network 172.16.3.0 255.255.255.0
 default-router 172.16.3.1 
 dns-server 192.168.1.1 
!         
ip dhcp pool VLAN4
 network 172.16.4.0 255.255.255.0
 default-router 172.16.4.1 
 dns-server 192.168.1.1 
!         
ip dhcp pool VLAN5
 network 172.16.5.0 255.255.255.0
 default-router 172.16.5.1 
 dns-server 192.168.1.1 
!         
ip dhcp pool VLAN6
 network 172.16.6.0 255.255.255.0
 default-router 172.16.6.1 
 dns-server 192.168.1.1 
!         
ip dhcp pool VLAN7
 network 172.16.7.0 255.255.255.0
 default-router 172.16.7.1 
 dns-server 192.168.1.1 
```

Проверим работу DHCP

```
VPCS> ip dhcp
DORA IP 172.16.2.2/24 GW 172.16.2.1

VPCS> show ip

NAME        : VPCS[1]
IP/MASK     : 172.16.2.2/24
GATEWAY     : 172.16.2.1
DNS         : 192.168.1.1  
DHCP SERVER : 10.0.19.1
DHCP LEASE  : 86394, 86400/43200/75600
MAC         : 00:50:79:66:68:1d
LPORT       : 20000
RHOST:PORT  : 127.0.0.1:30000
MTU         : 1500
```

Далее приступим к настройке коммутируемой среды:

1. **Port-security**
2. **~~Storm Control~~**
3. **DHCP Snooping**
4. **~~IP Source Guard~~**
5. **Dynamic ARP Inspection**

К сожалению, мне придется отказаться от некоторых технологий по причине не поддержки в данной прошивке устройства.

#### Port-security

Это функция коммутатора, позволяющая указать MAC-адреса хостов, которым разрешено передавать данные через порт. Основная её функция — это защита от атаки на переполнение MAC коммутатора. Поэтому sticky считаю использовать нецелесообразно, так как каждый порт ограничили 2 MAC адресами. Второй вариант — ограничиться 10 адресами и добавить sticky, тогда в этом случае можно забыть про это минимум на полгода. Я выбрал первый вариант, так как его можно настроить единожды, а потом не вспоминать про sticky.

**AccSW1**

```
interface Ethernet0/2
 switchport access vlan 2
 switchport mode access
 switchport port-security maximum 2
 switchport port-security
!         
interface Ethernet0/3
 switchport access vlan 2
 switchport mode access
 switchport port-security maximum 2
 switchport port-security
```

Данной настройкой указал максимальное количество устройств за портом. Прописывается это безусловно *только на access портах* коммутаторов уровня доступа.

#### ~~Storm Control~~

Эта технология позволяет защититься от широковещательного шторма. Его принцип — срезать такой трафик при его увеличении на определенный уровень загрузки порта или коммутатора. Настраивается на всех портах коммутатора. К сожалению, данная технология не поддерживается на этих образах.

#### DHCP Snooping

Это функция коммутатора, предназначенная для защиты от атак с использованием протокола DHCP.

**AccSW1**

```
! Mark uplink ports as trusted — DHCP Offers are expected only from these:

interface Ethernet0/0
 ip dhcp snooping trust
         
interface Ethernet0/1
 ip dhcp snooping trust
 
! Enable globally and per VLAN:
ip dhcp snooping 
ip dhcp snooping vlan 2
no ip dhcp snooping information option
! Removes DHCP option 82 added by snooping — without this, DHCP Discover frames get
! option 82 appended and are dropped at the Distribution layer.

ip dhcp relay information trust-all
! Marks the upstream DHCP server (outside the local segment) as trusted.

! Rate-limit DHCP requests on access ports:

interface Ethernet0/2
 ip dhcp snooping limit rate 10
         
interface Ethernet0/3
 ip dhcp snooping limit rate 10
```

#### ~~IP Source Guard~~

Функция коммутатора, которая ограничивает IP-трафик на интерфейсах 2го уровня, фильтруя трафик на основании таблицы привязок DHCP snooping и статических соответствий. Функция используется для борьбы с IP-spoofing.

```
AccSW1(config-if)#ip verify source port-security 
```

Так как после ввода данной команды у меня перестаёт ходить трафик, а troubleshooting не дал результата, то я отказался от данной технологии.

#### Dynamic ARP Inspection

Функция коммутатора, предназначенная для защиты от атак с использованием протокола ARP.

**AccSW1**

```
ip arp inspection vlan 2

interface Ethernet0/0
 ip arp inspection trust
!         
interface Ethernet0/1
 ip arp inspection trust
!         
interface Ethernet0/2
 ip arp inspection limit rate 2
!         
interface Ethernet0/3
 ip arp inspection limit rate 2
```

### <a name="5">FTP, AAA server (Tacacs+), 3 Distribution block, ISP, PAT</a>

![](/img/neteng/17/DistributionBlock3.png)

Выход в интернет реализован через 3 Distribution block, который выходит к Edge роутерам. Edge роутеры в свою очередь реализуют механизм PAT для преобразования серых адресов в один публичный. Для резервирования к провайдеру подключаемся по схеме dual homed.

#### PAT

**E-R1**

```
! PAT configuration:

interface Ethernet0/0
 ip address 10.0.12.2 255.255.255.252
 ip nat inside
         
interface Ethernet0/1
 ip address 10.0.13.2 255.255.255.252
 ip nat inside
         
interface Ethernet0/2
 ip address 212.22.48.6 255.255.255.252
 ip nat outside

ip nat inside source list 1 interface Ethernet0/2 overload
ip route 0.0.0.0 0.0.0.0 212.22.48.5
                
access-list 1 permit 172.16.0.0 0.0.15.255
access-list 1 permit 172.20.20.0 0.0.0.255
```

Провайдер в свою очередь тоже использует NAT(PAT), но нас это не интересует.

Далее поднимаем Windows Server 2012 и на нём FTP Server. Данную машину резервируем 2-мя сетевыми адаптерами типа мост. И на её основе реализуем отказоустойчивый переход HSRP.

```
interface Vlan20
 ip address 172.20.20.251 255.255.255.0
 standby 1 ip 172.20.20.1
 standby 1 priority 150
 standby 1 preempt

interface Ethernet1/3
 switchport access vlan 20
 switchport mode access
```

Также на каждом блоке организован **Etherchannel**:

#### LACP

```
interface Port-channel1
 switchport trunk encapsulation dot1q
 switchport mode trunk
 
interface Ethernet1/0
 switchport trunk encapsulation dot1q
 switchport mode trunk
 channel-group 1 mode active
!         
interface Ethernet1/1
 switchport trunk encapsulation dot1q
 switchport mode trunk
 channel-group 1 mode active
 
 port-channel load-balance src-dst-mac
-------------------------------------------------------------------------------- 
D-SW4#show etherchannel summary
Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
        H - Hot-standby (LACP only)
        R - Layer3      S - Layer2
        U - in use      f - failed to allocate aggregator

        M - not in use, minimum links not met
        u - unsuitable for bundling
        w - waiting to be aggregated
        d - default port


Number of channel-groups in use: 1
Number of aggregators:           1

Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SU)         LACP      Et1/0(P)    Et1/1(P)
```

#### FTP

Пропишем на всех устройствах доступ к FTP серверу

**login**: admin  
**password**: cisco

```
archive   
 path ftp://admin:cisco@172.20.20.5/FarmDistSW1.txt
 write-memory
 time-period 360
```

#### NTP

На Edge роутерах поднимем NTP-server

```
ntp source Loopback0
ntp master 5
ntp peer 5.5.5.8
ntp server ntp3.stratum2.ru
ntp server 1.ru.pool.ntp.org prefer
```

На клиентах

```
ntp update-calendar
ntp server 5.5.5.8
ntp server 5.5.5.7 prefer
```
