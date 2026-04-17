---
title: "LPIC-2 210.1 — DHCP Configuration"
date: 2026-03-27
description: "Настройка ISC DHCPd: структура dhcpd.conf, глобальные параметры, subnet/range, статические хосты, группы, BOOTP/PXE, DHCP-ретранслятор (dhcrelay), файл аренд, логирование, IPv6 и radvd. Тема экзамена LPIC-2 210.1."
tags: ["Linux", "LPIC-2", "DHCP", "ISC DHCPd", "networking", "radvd"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2/lpic2-210-1-dhcp/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 210.1** — DHCP Configuration (вес: 2). Охватывает настройку сервера ISC DHCPd, структуру `dhcpd.conf`, управление арендами, поддержку BOOTP, ретрансляторы и IPv6 с radvd.

---

## Что такое DHCP

**DHCP (Dynamic Host Configuration Protocol)** позволяет клиентам получать сетевую конфигурацию от сервера. Адреса выдаются в виде **аренд (leases)** на определённый период.

- Сервер слушает на **UDP 67**; отвечает на **UDP 68**
- Флаг `-p` меняет порт прослушивания; порт ответа всегда на единицу больше

Для IPv6 существует DHCPv6, однако **NDP (Neighbour Discovery Protocol)** подходит для этого лучше — им занимается демон `radvd`.

---

## Процесс аренды (DORA)

1. Клиент рассылает широковещательный **DHCPDISCOVER**
2. Серверы получают запрос и решают, какой адрес предложить (на основе подсети и MAC)
3. Каждый сервер отправляет **DHCPOFFER**
4. Клиент выбирает одно предложение и отправляет **DHCPREQUEST**
5. Сервер записывает аренду и отправляет **DHCPACK**

> **Проблема маршрутизатора:** DHCP использует широковещание. Маршрутизаторы по умолчанию не пересылают широковещательные пакеты между подсетями. Клиент в одной подсети не может достичь DHCP-сервер в другой без **DHCP-ретранслятора**.

---

## Установка

```bash
# Debian/Ubuntu
apt-get install isc-dhcp-server

# RHEL/CentOS
yum install dhcp
```

---

## Структура dhcpd.conf

Файл конфигурации: `/etc/dhcp/dhcpd.conf`

Элементы структуры:
- **Глобальные параметры** — значения по умолчанию для всех клиентов
- `shared-network` — несколько подсетей на одном физическом интерфейсе
- `subnet` — определяет сетевой сегмент
- `group` — объединяет хосты с общими настройками
- `host` — настройки для конкретного клиента

> Приоритет параметров: глобальный → subnet → group → host (более конкретный перекрывает более широкий).

---

## Глобальные параметры

```bash
# Параметры с ключевым словом "option" — передаются клиентам
option domain-name-servers 10.0.0.10 10.0.0.11;
option domain-name "example.com";

# Параметры без "option" — управляют поведением сервера
default-lease-time 600;       # время аренды по умолчанию (секунды)
max-lease-time 7200;          # максимальное время аренды
```

### Распространённые коды опций:

| Код | Имя | Описание |
|---|---|---|
| 1 | `subnet-mask` | Маска подсети |
| 3 | `routers` | Шлюз по умолчанию |
| 6 | `domain-name-servers` | DNS-серверы |
| 12 | `host-name` | Имя хоста |
| 15 | `domain-name` | Имя домена |
| 51 | `ip-address-lease-time` | Срок аренды |
| 66 | `tftp-server` | TFTP-сервер (для BOOTP/PXE) |
| 67 | `bootfile-name` | Имя загрузочного файла |

---

## Подсеть и диапазоны адресов

```bash
subnet 192.168.1.0 netmask 255.255.255.0 {
    option routers 192.168.1.1;
    option broadcast-address 192.168.1.255;
    option domain-name-servers 192.168.1.1;
    range 192.168.1.100 192.168.1.200;   # пул динамических адресов
}
```

Блок `subnet` должен содержать хотя бы один `range`. Без `range` подсеть объявлена, но адреса не выдаются.

### Несколько подсетей на одном интерфейсе (`shared-network`):

```bash
shared-network OFFICE {
    option domain-name "office.example.com";
    subnet 10.1.0.0 netmask 255.255.255.0 {
        range 10.1.0.50 10.1.0.150;
    }
    subnet 10.1.1.0 netmask 255.255.255.0 {
        range 10.1.1.50 10.1.1.150;
    }
}
```

---

## Статические хосты

Для серверов и принтеров, которым нужен постоянный IP — привяжите конкретный IP к MAC-адресу через блок `host`:

```bash
host webserver {
    hardware ethernet 00:11:22:33:44:55;
    fixed-address 192.168.1.10;
    option host-name "webserver";
}
```

> `hardware ethernet` и `fixed-address` — два обязательных поля для статического хоста.

Имя хоста в `host webserver {}` — лишь уникальный внутренний идентификатор, клиенту оно не передаётся.

`fixed-address` может быть вне диапазона `range` — это нормально.

---

## Группы хостов

Блок `group` объединяет несколько записей `host` с общими параметрами:

```bash
group {
    option routers 192.168.1.1;
    option broadcast-address 192.168.1.255;
    netmask 255.255.255.0;

    host printer1 {
        hardware ethernet 00:AA:BB:CC:DD:EE;
        fixed-address 192.168.1.20;
    }

    host printer2 {
        hardware ethernet 00:AA:BB:CC:DD:FF;
        fixed-address 192.168.1.21;
    }
}
```

---

## Поддержка BOOTP

**BOOTP (Bootstrap Protocol, 1985)** — предшественник DHCP. Используется для бездисковых станций, загружающих ОС из сети. DHCP обратно совместим с BOOTP.

```
Клиент (без ОС) ──UDP 67──► BOOTP/DHCP-сервер
                ◄──UDP 68── IP + имя загрузочного файла
                     ↓
               TFTP-сервер → клиент загружает образ ОС
```

### allow bootp и allow booting:

| Директива | Что включает |
|---|---|
| `allow bootp;` | Принимать BOOTP-запросы от клиентов, идентифицированных по MAC в записи `host {}` |
| `allow booting;` | Отправлять клиенту информацию о загрузочном файле (`filename` и `next-server`) |

> Для обычного DHCP-сервера ни одна директива не нужна. Они требуются только для PXE-загрузки или устаревших BOOTP-клиентов.

### Конфигурация PXE:

```bash
subnet 192.168.1.0 netmask 255.255.255.0 {
    range 192.168.1.100 192.168.1.200;

    allow bootp;
    allow booting;

    next-server 192.168.1.1;   # IP TFTP-сервера
    filename "pxelinux.0";     # файл загрузчика
}
```

### Статический BOOTP-хост:

```bash
host diskless01 {
    hardware ethernet 00:01:02:FE:DC:BA;
    fixed-address 192.168.1.50;
    option host-name "diskless01";
    filename "/mybootfile.img";
    server-name "tftpserver";
    next-server "backup-tftpserver";
}
```

> Если `next-server` не указан, клиент запрашивает файл у самого DHCP-сервера.

---

## DHCP-ретранслятор

Маршрутизаторы не пересылают широковещательные пакеты между подсетями. **Агент ретрансляции** (`dhcrelay`) перехватывает DHCP/BOOTP-запросы в своём сегменте и перенаправляет их юникастом на DHCP-сервер. Он также добавляет информацию об исходной подсети, чтобы сервер знал, из какого пула выдавать адрес.

```bash
# Перенаправить на DHCP-сервер по адресу 21.31.0.1
dhcrelay 21.31.0.1

# Слушать только на конкретном интерфейсе
dhcrelay -i eth1 21.31.0.1
```

> `dhcrelay` корректно передаёт MAC клиента в поле `chaddr` — поэтому идентификация статических хостов по `hardware ethernet` по-прежнему работает через ретранслятор.

> Большинство современных маршрутизаторов имеют встроенный DHCP-ретранслятор (`ip helper-address` в Cisco). `dhcrelay` нужен только если маршрутизатор этого не поддерживает.

---

## Логирование и мониторинг

### Файл аренд (сервер):

```bash
cat /var/lib/dhcp/dhcpd.leases
```

Хранит все активные аренды: IP, MAC, время начала и окончания. Если файл пуст — скорее всего, в конфигурации нет `range`, только статические хосты.

На клиенте выданный адрес хранится в `dhclient.leases`.

### Настройка логирования:

```bash
# В dhcpd.conf
log-facility local7;

# В /etc/rsyslog.conf
local7.debug /var/log/dhcpd.log
```

### Просмотр логов:

```bash
# Системы с syslog
tail -f /var/log/messages
tail -f /var/log/daemon.log

# systemd
journalctl -u isc-dhcp-server -f
journalctl | grep dhcpd
```

### Ограничение по интерфейсу:

```bash
# Слушать только на конкретном интерфейсе
dhcpd eth0
```

### Проверка синтаксиса:

```bash
dhcpd -t
dhcpd -t -cf /path/to/dhcpd.conf
```

### Перезапуск после изменения конфигурации:

```bash
/etc/init.d/dhcp restart
```

---

## IPv6 и radvd

В IPv6 хосты самостоятельно назначают себе локальные адреса без DHCP. **NDP (Neighbour Discovery Protocol)** распределяет префиксы, а не полные адреса. Хост строит свой полный IPv6-адрес через SLAAC.

**`radvd` (Router Advertisement Daemon)** отвечает на запросы маршрутизатора от клиентов.

Конфигурация: `/etc/radvd.conf`

```bash
interface eth0 {
    AdvSendAdvert on;           # периодически отправлять объявления
    MinRtrAdvInterval 3;
    MaxRtrAdvInterval 10;

    prefix 2001:0db8:0100:f101::/64 {
        AdvOnLink on;           # префикс доступен на этом канале
        AdvAutonomous on;       # клиент может использовать SLAAC
        AdvRouterAddr on;       # включить адрес маршрутизатора в объявление
    };
};
```

> У radvd нет концепции пулов и аренд. Клиент самостоятельно строит свой адрес из полученного префикса с помощью SLAAC (Stateless Address Autoconfiguration).

---

## Шпаргалка для экзамена

### Файлы

| Путь | Назначение |
|---|---|
| `/etc/dhcp/dhcpd.conf` | Конфигурация DHCP-сервера |
| `/var/lib/dhcp/dhcpd.leases` | Файл активных аренд |
| `/var/log/messages` | Логи DHCP (системы с syslog) |
| `/var/log/daemon.log` | Альтернативный лог демона |
| `/etc/radvd.conf` | Конфигурация radvd для IPv6 |

### Команды

| Команда | Действие |
|---|---|
| `dhcpd` | Исполняемый файл DHCP-сервера |
| `dhcpd -t` | Проверить синтаксис dhcpd.conf |
| `dhcpd -cf /path/to/dhcpd.conf` | Использовать нестандартный путь к конфигурации |
| `dhcrelay -i eth1 <server-IP>` | Запустить DHCP-ретранслятор |
| `arp -n` | Показать таблицу ARP |
| `radvd` | Демон объявлений IPv6-маршрутизатора |

### Порты

- Сервер слушает: **UDP 67**
- Клиент получает: **UDP 68**

### Ключевые директивы dhcpd.conf

```
range 10.0.0.1 10.0.0.100;            # пул адресов
fixed-address 10.0.0.5;               # статический IP
hardware ethernet AA:BB:CC:DD:EE:FF;  # MAC-адрес (два слова!)
option routers 10.0.0.1;              # шлюз
option subnet-mask 255.255.255.0;     # маска (без неё — классовое поведение)
option domain-name-servers 8.8.8.8;   # DNS
option domain-search "lab.local";     # домен поиска
default-lease-time 600;               # время аренды в секундах
max-lease-time 7200;
log-facility local7;                  # facility syslog
allow booting;                        # включить обслуживание BOOTP-файлов
allow bootp;                          # принимать BOOTP-запросы
filename "/boot.img";                 # загрузочный файл BOOTP
next-server 10.0.0.5;                # TFTP-сервер
```

### Типичные ошибки на экзамене

| Ошибка | Правило |
|---|---|
| `hardware ethernet` | Два слова, без дефиса |
| Расположение файла аренд | `/var/lib/dhcp/dhcpd.leases`, не `/etc/dhcp/` |
| `dhcrelay` против `dhcpd` | Разные бинарные файлы — ретранслятор запускается отдельно |
| radvd | Работает с префиксами, а не адресами — пула нет |
| `allow booting` | Включает доставку `filename`/`next-server` |
| `allow bootp` | Включает приём BOOTP-запросов |
| Если файл аренд отсутствует | `touch /var/lib/dhcp/dhcpd.leases` |
