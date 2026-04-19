---
title: "LPIC-2 212.1 — Configuring a Router"
date: 2026-05-27
description: "Пересылка IP-пакетов, NAT/masquerading, таблицы и цепочки iptables, SNAT/DNAT/MASQUERADE, перенаправление портов, основы nftables, sysctl.conf. Тема экзамена LPIC-2 212.1."
tags: ["Linux", "LPIC-2", "iptables", "nftables", "NAT", "routing", "firewall"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2/lpic2-212-1-configuring-router/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 212.1** — Configuring a Router (вес: 3). Охватывает пересылку IP-пакетов, NAT, фильтрацию пакетов и трансляцию адресов с помощью iptables/nftables.

---

## Приватные адреса (Private Address Ranges)

IANA зарезервировала три блока IPv4-адресов (RFC 1918) для использования внутри частных сетей:

```
10.0.0.0   - 10.255.255.255   (блок /8)
172.16.0.0 - 172.31.255.255   (блок /12)
192.168.0.0 - 192.168.255.255 (блок /16)
```

Эти адреса не маршрутизируются в интернете. Хост с таким адресом не может напрямую общаться с внешними серверами без NAT.

IPv6 аналоги:

- Unique Local Addresses (ULA): диапазон `fc00::/7` (аналог RFC 1918)
- Link-local addresses: диапазон `fe80::/64` — автоматически назначаются при старте интерфейса, не маршрутизируются за пределы сегмента

```
169.254.0.0/16 — link-local в IPv4 (назначается при сбое DHCP)
```

В IPv6 link-local адреса — норма, а не признак сбоя. Каждый IPv6-интерфейс всегда имеет хотя бы один адрес в `fe80::/64`.

---

## IP forwarding

По умолчанию ядро Linux не пересылает пакеты между интерфейсами. Чтобы Linux работал как маршрутизатор, нужно включить ip_forward:

```bash
# Временно (до перезагрузки)
echo 1 > /proc/sys/net/ipv4/ip_forward

# Через sysctl (тоже временно)
sysctl -w net.ipv4.ip_forward=1

# Для IPv6
sysctl -w net.ipv6.conf.all.forwarding=1
```

Чтобы настройка сохранялась после перезагрузки, добавить в `/etc/sysctl.conf`:

```
net.ipv4.ip_forward = 1
```

Применить без перезагрузки:

```bash
sysctl -p    # перезагрузить /etc/sysctl.conf
```

Проверить текущее состояние:

```bash
cat /proc/sys/net/ipv4/ip_forward
# 0 — отключено, 1 — включено

sysctl net.ipv4.ip_forward
```

Без `ip_forward = 1` цепочка FORWARD в iptables не работает. Пакеты не пройдут через маршрутизатор, даже если правила разрешают.

---

## Network Address Translation (NAT)

NAT — механизм подмены IP-адресов (и портов) в заголовках пакетов. Позволяет хостам с приватными адресами выходить в интернет через один публичный IP.

### Как работает NAT: пример из учебника

Топология:

```
Some Host              Internet         Machine 4 (router)       LAN 192.168.0/24
201.202.203.204  <-->  Internet  <-->  101.102.103.104  <-->  Machine1  192.168.0.10
                                        192.168.0.1            Machine2  192.168.0.11
                                                               Machine3  192.168.0.12
```

Machine 2 хочет открыть страницу на Some Host (201.202.203.204). У неё приватный адрес — в интернете такой адрес не маршрутизируется. Здесь подключается NAT.

Шаг за шагом:

1. Machine 2 отправляет пакет с src=`192.168.0.11`, dst=`201.202.203.204`
2. Пакет уходит на шлюз — Machine 4 (router)
3. Machine 4 меняет src=`192.168.0.11` на свой внешний IP `101.102.103.104` и отправляет пакет в интернет
4. Some Host видит запрос от `101.102.103.104` и отвечает на этот адрес
5. Machine 4 получает ответ, смотрит в таблицу трансляций и восстанавливает dst=`192.168.0.11`
6. Пакет доставляется на Machine 2

Machine 4 ведёт таблицу активных соединений, чтобы знать, какому внутреннему хосту вернуть ответ. Это называется connection tracking.

Some Host не знает о существовании Machine 2. Для него весь трафик приходит от `101.102.103.104`. Это и есть смысл слова "masquerade" — внутренние хосты маскируются под один внешний IP.

### Типы NAT в iptables

| Тип | Таблица | Цепочка | Назначение |
|---|---|---|---|
| SNAT / MASQUERADE | nat | POSTROUTING | Меняет адрес источника (исходящий трафик) |
| DNAT | nat | PREROUTING | Меняет адрес назначения (входящий трафик) |

NAT — это прежде всего IPv4-концепция. В IPv6 NAT считается нежелательным и не используется в стандартных схемах. RFC для NAT: RFC 1631.

---

## iptables: архитектура

iptables — утилита для управления netfilter. Netfilter реализован в ядре начиная с версии 2.3.15.

### Netfilter hooks

Netfilter поддерживает пять точек перехвата пакетов (hooks) в стеке протоколов:

```
Сеть --> NF_IP_PREROUTING --> [Route] --> NF_IP_FORWARD --------+
                                                                  |
                         NF_IP_LOCAL_IN --> [Local Process] --> NF_IP_LOCAL_OUT
                                                                  |
                                                             [Route] --> NF_IP_POSTROUTING --> Сеть
```

Соответствие hooks и цепочек iptables:

| Netfilter hook | Цепочка iptables | Когда срабатывает |
|---|---|---|
| NF_IP_PREROUTING | PREROUTING | До решения о маршрутизации |
| NF_IP_LOCAL_IN | INPUT | Пакет адресован самому хосту |
| NF_IP_FORWARD | FORWARD | Пакет проходит транзитом |
| NF_IP_LOCAL_OUT | OUTPUT | Пакет генерируется самим хостом |
| NF_IP_POSTROUTING | POSTROUTING | После решения о маршрутизации, перед отправкой |

Возможные результаты обработки hook:

| Результат | Действие |
|---|---|
| NF_ACCEPT | Продолжить обработку пакета |
| NF_DROP | Отбросить пакет, дальше не обрабатывать |
| NF_QUEUE | Передать пакет в userspace |
| NF_REPEAT | Повторить вызов этого hook |
| NF_STOLEN | Поглотить пакет (не продолжать обработку) |

---

## iptables: таблицы и цепочки

По умолчанию поддерживаются три таблицы и пять цепочек. Не каждая цепочка доступна в каждой таблице:

| Таблица | PREROUTING | INPUT | FORWARD | OUTPUT | POSTROUTING |
|---|:-:|:-:|:-:|:-:|:-:|
| MANGLE | + | - | - | + | - |
| NAT | + | - | - | + | + |
| FILTER | - | + | + | + | - |

**Важно для экзамена:** FILTER не имеет PREROUTING и POSTROUTING. NAT не имеет INPUT и FORWARD. MANGLE имеет только PREROUTING и OUTPUT (до ядра 2.4.17; с 2.4.18 добавлены INPUT, FORWARD, POSTROUTING).

### Таблица filter (пакетная фильтрация)

- `INPUT` — пакеты, адресованные самому хосту
- `FORWARD` — пакеты, проходящие через хост транзитом
- `OUTPUT` — пакеты, генерируемые самим хостом

### Таблица nat (трансляция адресов)

- `PREROUTING` — изменение пакета до принятия решения о маршрутизации (DNAT)
- `OUTPUT` — изменение пакетов, генерируемых хостом
- `POSTROUTING` — изменение пакета перед отправкой (SNAT, MASQUERADE)

Транзитный трафик проходит через PREROUTING и POSTROUTING. Трафик, генерируемый самим хостом, проходит через OUTPUT и POSTROUTING.

### Таблица mangle (манипуляции с заголовком)

Изменение TTL, TOS, mark. NAT и masquerade здесь делать нельзя.

### Таблица raw (исключения из connection tracking)

Используется для настройки исключений из connection tracking через target NOTRACK. Обрабатывается раньше всех остальных таблиц — до ip_conntrack.

Цепочки: `PREROUTING`, `OUTPUT`

### Действия (targets)

| Target | Описание | Ограничения |
|---|---|---|
| ACCEPT | Пропустить пакет | — |
| DROP | Тихо отбросить пакет | — |
| QUEUE | Передать пакет в userspace | — |
| RETURN | Прекратить обход текущей цепочки, вернуться в вызывающую | Если достигнут конец встроенной цепочки — применяется политика цепочки |
| LOG | Записать в лог через printk(), передать следующему правилу | Опции: `--log-level`, `--log-prefix`, `--log-tcp-sequence`, `--log-tcp-options`, `--log-ip-options` |
| MARK | Установить метку netfilter для пакета | Только в таблице mangle |
| TOS | Установить поле Type of Service в IP-заголовке | Только в таблице mangle |
| REJECT | Отбросить пакет и вернуть ICMP-ошибку источнику | Только в INPUT, FORWARD, OUTPUT |
| SNAT | Изменить адрес источника пакета | Только в POSTROUTING таблицы nat |
| DNAT | Изменить адрес назначения пакета | Только в PREROUTING и OUTPUT таблицы nat |
| MASQUERADE | SNAT с автоматическим IP интерфейса; сбрасывает соединения при падении интерфейса | Только в POSTROUTING таблицы nat; только для динамических IP |
| REDIRECT | Перенаправить пакет на сам хост (127.0.0.1 для локальных пакетов) | Только в PREROUTING и OUTPUT таблицы nat |

**Разница DROP и REJECT:** DROP — пакет исчезает без уведомления, REJECT — источник получает ICMP "port unreachable". RETURN — прекращает обход текущей цепочки, не весь обход правил.

**MASQUERADE** сбрасывает connection tracking при падении интерфейса. Для статического IP используй SNAT — он сохраняет состояние соединений.

REJECT нельзя установить как политику по умолчанию (`-P`). Политика поддерживает только ACCEPT и DROP. Чтобы получить поведение REJECT как последнего правила — добавь его вручную в конец цепочки.

### Модули расширения (match extensions)

| Модуль | Загружается при | Назначение |
|---|---|---|
| tcp | `-p tcp` | TCP-специфичные опции |
| udp | `-p udp` | UDP-специфичные опции |
| icmp | `-p icmp` | ICMP-специфичные опции |
| mac | явном указании | Совпадение по MAC-адресу источника; только в PREROUTING, FORWARD, INPUT |
| limit | явном указании | Ограничение частоты совпадений (token bucket); полезно с LOG |
| multiport | явном указании | До 15 портов источника или назначения; только с `-p tcp` или `-p udp` |
| mark | явном указании | Совпадение по метке netfilter (установленной через MARK) |
| owner | явном указании | Совпадение по создателю пакета; только в OUTPUT |
| state | явном указании | Совпадение по состоянию connection tracking |
| tos | явном указании | Совпадение по полю TOS в IP-заголовке |

---

## iptables: stateful filtering

Stateful firewall отслеживает состояние соединений. При stateful firewall правила пишутся только для одного направления — ответный трафик пропускается автоматически catch-all правилом для ESTABLISHED,RELATED.

### Путь пакета через таблицы и цепочки (полная схема)

```
Входящий трафик
      |
   NETWORK (физический приём)
      |
   PREROUTING:
      CONNTRACK  <-- connection tracking
      MANGLE
      NAT (DNAT)
      |
   Routing Decision
      |
   +--+-----------------------------------+
   |                                      |
   INPUT:                             FORWARD:
   FILTER                             FILTER
   |                                  CONNTRACK
   RECV / LOCAL PROCESS / SEND            |
   |                               POSTROUTING:
   OUTPUT:                             NAT (SNAT/MASQUERADE)
   CONNTRACK                           CONNTRACK
   MANGLE                                  |
   NAT                                  NETWORK (отправка)
   FILTER
```

### Состояния соединения (`--state`)

| Состояние | Описание |
|---|---|
| NEW | Первый пакет нового соединения |
| ESTABLISHED | Пакет уже установленного соединения |
| RELATED | Связанное соединение (например, FTP data при активном FTP) |
| INVALID | Пакет не соответствует ни одному известному состоянию |

Модули connection tracking:

- `ip_conntrack` — основной модуль
- `ip_conntrack_ftp` — для FTP (active и passive режимы)

Хуки, в которые встроен connection tracking: PREROUTING, FORWARD, OUTPUT, POSTROUTING.

Пример разрешения ответного трафика:

```bash
iptables -t filter -A INPUT   -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -t filter -A FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -t filter -A OUTPUT  -m state --state ESTABLISHED,RELATED -j ACCEPT
# Разрешить новые соединения на loopback (нужно для локального DNS и др.)
iptables -t filter -A INPUT   -m state --state NEW -i lo -j ACCEPT
```

Современный синтаксис: модуль `-m state --state NEW` считается устаревшим. Современный вариант: `-m conntrack --ctstate NEW`. Состояния те же: `NEW`, `ESTABLISHED`, `RELATED`, `INVALID`, `UNTRACKED`.

---

## iptables: основные команды

### Опции управления правилами

| Опция | Описание |
|---|---|
| `-t table` | Выбрать таблицу (по умолчанию: filter) |
| `-A chain` | Добавить правило в конец цепочки |
| `-I chain [num]` | Вставить правило на позицию (по умолчанию — в начало) |
| `-D chain rule` | Удалить правило по спецификации или номеру |
| `-R chain num` | Заменить правило на позиции |
| `-L [chain]` | Показать правила цепочки (или всех цепочек) |
| `-F [chain]` | Очистить цепочку (или все цепочки таблицы) |
| `-P chain target` | Установить политику по умолчанию (ACCEPT, DROP) |
| `-N chain` | Создать пользовательскую цепочку |
| `-X [chain]` | Удалить пользовательскую цепочку (без аргумента — все) |
| `-v` | Подробный вывод |
| `-n` | Числовой вывод (без разрешения имён) |
| `--line-numbers` | Показать номера строк при `-L` |

`-X` без аргумента удаляет все пользовательские цепочки в таблице. Цепочку можно удалить только если на неё нет ссылок из других правил.

### Примеры команд

```bash
# Показать правила с номерами строк и подробностями
iptables -L -n -v --line-numbers

# Показать правила таблицы nat
iptables -t nat -L -n -v

# Добавить правило в конец цепочки
iptables -t filter -A INPUT -p tcp --dport 22 -j ACCEPT

# Вставить правило на первую позицию
iptables -t filter -I INPUT 1 -p tcp --dport 22 -j ACCEPT

# Удалить правило по спецификации
iptables -t filter -D INPUT -p tcp --dport 22 -j ACCEPT

# Удалить правило по номеру строки
iptables -t filter -D INPUT 3

# Заменить правило на позиции 2
iptables -t filter -R INPUT 2 -p tcp --dport 443 -j ACCEPT

# Очистить все правила таблицы filter
iptables -t filter -F

# Установить политики по умолчанию
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT DROP

# Создать пользовательскую цепочку
iptables -N MY_CHAIN
```

### Фильтрация по критериям

```bash
# По протоколу и порту назначения
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p udp --dport 53 -j ACCEPT

# По нескольким портам (модуль multiport, до 15 портов)
iptables -A INPUT -p tcp -m multiport --dports 80,443,8080 -j ACCEPT

# По адресу источника / назначения
iptables -A INPUT  -s 192.168.1.0/24 -j ACCEPT
iptables -A OUTPUT -d 10.0.0.1 -j ACCEPT

# По входящему / исходящему интерфейсу
iptables -A INPUT  -i eth0 -j ACCEPT
iptables -A OUTPUT -o eth1 -j ACCEPT

# По ICMP-типу
iptables -A INPUT -p icmp --icmp-type echo-request -m state --state NEW -j ACCEPT

# По MAC-адресу источника (только в PREROUTING, FORWARD, INPUT)
iptables -A INPUT -m mac --mac-source 00:11:22:33:44:55 -j ACCEPT

# С ограничением частоты (модуль limit)
iptables -A INPUT -p icmp -m limit --limit 10/minute -j LOG --log-prefix "ICMP: "

# По TCP-флагам: только SYN (без ACK, FIN, RST)
iptables -A FORWARD -p tcp --tcp-flags SYN,ACK,FIN,RST SYN -j ACCEPT
# Короткая запись: --syn эквивалентно --tcp-flags SYN,RST,ACK SYN
iptables -A INPUT -p tcp --syn -j ACCEPT

# Инверсия условия через !
iptables -A INPUT ! -s 192.168.0.0/24 -j DROP
iptables -A INPUT ! -p tcp -j DROP
```

### Параметры спецификации правила

| Параметр | Описание |
|---|---|
| `-p protocol` | Протокол: tcp, udp, icmp, all, номер или имя из /etc/protocols. `!` инвертирует |
| `-s address[/mask]` | Адрес источника: IP, сеть, имя хоста. `!` инвертирует |
| `-d address[/mask]` | Адрес назначения. `!` инвертирует |
| `-j target` | Действие при совпадении правила |
| `-i interface` | Входящий интерфейс. `!` инвертирует |
| `-o interface` | Исходящий интерфейс. `!` инвертирует |
| `-m module` | Загрузить модуль расширения |

Параметры TCP (`-p tcp`):

| Параметр | Описание |
|---|---|
| `--sport port[:port]` | Порт источника или диапазон |
| `--dport port[:port]` | Порт назначения или диапазон |
| `--tcp-flags mask comp` | Совпадение по TCP-флагам: SYN ACK FIN RST URG PSH ALL NONE |
| `--syn` | Только SYN-пакеты (SYN=1, ACK=0, RST=0). Эквивалент `--tcp-flags SYN,RST,ACK SYN` |

В диапазоне портов `port:port` — если первый порт опущен, подставляется 0; если последний опущен, подставляется 65535.

---

## SNAT и MASQUERADE

SNAT используют, когда внешний IP-адрес статичный. Нужно явно указать IP:

```bash
iptables -t nat -A POSTROUTING -o eth1 -j SNAT --to-source 101.102.103.104
```

MASQUERADE используют при динамическом IP (DHCP от провайдера). IP берётся автоматически с указанного интерфейса:

```bash
iptables -t nat -A POSTROUTING -o eth1 -j MASQUERADE
```

MASQUERADE не сохраняет connection tracking при поднятии/опускании интерфейса. SNAT сохраняет. На экзамене: динамический IP — MASQUERADE, статический — SNAT.

---

## DNAT и перенаправление портов

DNAT перенаправляет входящие пакеты на другой адрес/порт. Клиент думает, что подключается к Firewall — но Firewall знает, на какой внутренний сервер передать соединение.

### Три обязательных шага полного port forwarding

1. **Connection tracking** — роутер должен отслеживать сессии, чтобы связать ответные пакеты с исходным запросом
2. **DNAT** (destination NAT) — подмена адреса назначения в `PREROUTING`: с роутера на внутренний сервер
3. **SNAT** (source NAT) — в `POSTROUTING` при ответе от внутреннего сервера наружу подмена source address на адрес роутера, иначе внешний клиент получит ответ с приватного IP, который не маршрутизируется

Полный пример: пробросить `роутер:3306 → 10.222.0.100:3306` (внутренний MySQL):

```bash
# 1. Разрешить новые соединения на 3306 + включить трекинг (только первый пакет)
iptables -A FORWARD -i enp0s6 -o enp0s5 -p tcp --syn --dport 3306 \
  -m conntrack --ctstate NEW -j ACCEPT

# 2. Разрешить ответные и связанные пакеты (established/related)
iptables -A FORWARD -i enp0s6 -o enp0s5 \
  -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# 3. DNAT: переписываем destination с роутера на внутренний сервер
iptables -t nat -A PREROUTING -i enp0s6 -p tcp --dport 3306 \
  -j DNAT --to-destination 10.222.0.100

# 4. SNAT: при выходе пакета наружу подменяем source на публичный IP
iptables -t nat -A POSTROUTING -o enp0s6 -p tcp --dport 3306 \
  -j SNAT --to-source 209.251.133.104
```

В `PREROUTING` используется `-i` (входной интерфейс). В `POSTROUTING` — `-o` (выходной). Перепутать легко — на экзамене это классический подвох.

Флаг `--syn` срабатывает только для TCP-пакета с установленным SYN, без ACK и RST. Это первый пакет handshake'а.

Проверка работы:

```bash
sudo iptables -L FORWARD -n -v              # правила форвардинга
sudo iptables -t nat -L -n -v               # правила NAT
sudo conntrack -L | grep 3306               # активные сессии (пакет conntrack-tools)
```

### Упрощённый DNAT (без source NAT)

Если внешний трафик уже проходит через MASQUERADE для всей подсети, то делать отдельный SNAT для проброшенного порта обычно не нужно:

```bash
# Внешний порт 80 -> внутренний Machine2:2345
iptables -t nat -A PREROUTING -i eth1 -p tcp --destination-port 80 \
  -j DNAT --to-destination 192.168.0.11:2345

# Разрешить пересылку через FORWARD
iptables -t filter -A FORWARD -i eth1 -p tcp --destination-port 2345 \
  -m state --state NEW -j ACCEPT
```

DNAT — это PREROUTING, потому что адрес назначения надо изменить до принятия решения о маршрутизации. Без этого ядро попытается доставить пакет локально.

### Сценарии использования port forwarding

Пример: разные внешние хосты → разные внутренние машины (по source IP):

```bash
# Some Host 1 -> Machine1
iptables -t nat -A PREROUTING -i eth1 -p tcp --dport 22 \
  -s 201.202.203.204 -j DNAT --to-destination 192.168.0.10:22

# Some Host 2 -> Machine2
iptables -t nat -A PREROUTING -i eth1 -p tcp --dport 22 \
  -s 201.202.203.205 -j DNAT --to-destination 192.168.0.11:22

# Разрешить пересылку
iptables -t filter -A FORWARD -i eth1 -p tcp --dport 22 \
  -m state --state NEW -j ACCEPT
```

---

## Практический пример: полная конфигурация межсетевого экрана

Топология "The Firm":

```
Internet  <-->  eth1 [101.102.103.104 / Firewall / 192.168.0.1] eth0  <-->  LAN 192.168.0.0/24
                                                                            Machine1  192.168.0.10
                                                                            Machine2  192.168.0.11
                                                                            Machine3  192.168.0.12
```

Шесть сценариев трафика:

```
1 — Firewall --> Internet
2 — Internet --> Firewall
3 — Firewall --> LAN
4 — LAN      --> Firewall
5 — LAN      --> Internet (через NAT)
6 — Internet --> LAN (через DNAT на конкретный порт)
```

### Шаг 0: очистка и политики по умолчанию

```bash
iptables -t mangle -F && iptables -t mangle -X
iptables -t nat    -F && iptables -t nat    -X
iptables -t filter -F && iptables -t filter -X

iptables -P INPUT   DROP
iptables -P FORWARD DROP
iptables -P OUTPUT  DROP
```

### Полный скрипт (все команды вместе)

```bash
###############################################################################
# FLUSH ALL RULES IN THE MANGLE, NAT AND FILTER TABLES
###############################################################################
iptables -t mangle -F
iptables -t nat    -F
iptables -t filter -F
###############################################################################
# DELETE ALL USER-DEFINED (NOT BUILT-IN) CHAINS IN THE TABLES
###############################################################################
iptables -t mangle -X
iptables -t nat    -X
iptables -t filter -X
###############################################################################
# SET ALL POLICIES FOR ALL BUILT-IN CHAINS TO DROP
###############################################################################
iptables -P INPUT   DROP
iptables -P FORWARD DROP
iptables -P OUTPUT  DROP
###############################################################################
# (1) FIREWALL --> INTERNET: DNS, SSH, RC564, PING
###############################################################################
iptables -t filter -A OUTPUT -o eth1 -p udp  --destination-port dns   \
  -m state --state NEW -j ACCEPT
iptables -t filter -A OUTPUT -o eth1 -p tcp  --destination-port ssh   \
  -m state --state NEW -j ACCEPT
iptables -t filter -A OUTPUT -o eth1 -p tcp  --destination-port 2064  \
  -m state --state NEW -j ACCEPT
iptables -t filter -A OUTPUT -o eth1 -p icmp --icmp-type echo-request \
  -m state --state NEW -j ACCEPT
iptables -t filter -A INPUT  -i eth1 \
  -m state --state ESTABLISHED,RELATED -j ACCEPT
###############################################################################
# (2) INTERNET --> FIREWALL: SSH
###############################################################################
iptables -t filter -A INPUT  -i eth1 -p tcp --destination-port ssh \
  -m state --state NEW -j ACCEPT
iptables -t filter -A OUTPUT -o eth1 -p tcp --destination-port ssh \
  -m state --state ESTABLISHED,RELATED -j ACCEPT
###############################################################################
# (3) FIREWALL --> LAN: SSH
###############################################################################
iptables -t filter -A OUTPUT -o eth0 -p tcp --destination-port ssh \
  -m state --state NEW -j ACCEPT
iptables -t filter -A INPUT  -i eth0 -p tcp --destination-port ssh \
  -m state --state ESTABLISHED,RELATED -j ACCEPT
###############################################################################
# (4) LAN --> FIREWALL: DNS, SSH, RC564, PING
###############################################################################
iptables -t filter -A INPUT -i eth0 -p udp  --destination-port dns   \
  -m state --state NEW -j ACCEPT
iptables -t filter -A INPUT -i eth0 -p tcp  --destination-port ssh   \
  -m state --state NEW -j ACCEPT
iptables -t filter -A INPUT -i eth0 -p tcp  --destination-port 2064  \
  -m state --state NEW -j ACCEPT
iptables -t filter -A INPUT -i eth0 -p icmp --icmp-type echo-request \
  -m state --state NEW -j ACCEPT
iptables -t filter -A OUTPUT -o eth0 \
  -m state --state ESTABLISHED,RELATED -j ACCEPT
###############################################################################
# (5) LAN --> INTERNET: ALL ALLOWED
###############################################################################
iptables -t filter -A FORWARD -i eth0 -o eth1 \
  -m state --state NEW -j ACCEPT
iptables -t filter -A FORWARD -i eth1 -o eth0 \
  -m state --state ESTABLISHED,RELATED -j ACCEPT
###############################################################################
# (6) INTERNET --> LAN: DNAT PORT 80 -> MACHINE2:2345
###############################################################################
iptables -t nat -A PREROUTING -i eth1 -p tcp --destination-port 80 \
  -j DNAT --to-destination 192.168.0.11:2345
iptables -t filter -A FORWARD -i eth1 -p tcp --destination-port 2345 \
  -m state --state NEW -j ACCEPT
###############################################################################
# (!) ОТВЕТНЫЙ ТРАФИК ДЛЯ ВСЕХ УСТАНОВЛЕННЫХ СОЕДИНЕНИЙ
###############################################################################
iptables -t filter -A INPUT   -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -t filter -A FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -t filter -A OUTPUT  -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -t filter -A INPUT   -m state --state NEW -i lo           -j ACCEPT
###############################################################################
# SNAT: MASQUERADE LAN -> INTERNET
###############################################################################
iptables -t nat -A POSTROUTING -o eth1 -j SNAT --to-source 101.102.103.104
###############################################################################
# ENABLE IP FORWARDING
###############################################################################
echo 1 > /proc/sys/net/ipv4/ip_forward
```

Правила ESTABLISHED,RELATED в конце не создают дыр в безопасности: они пропускают только ответный трафик по соединениям, которые были разрешены на этапе NEW выше.

---

## Сохранение и восстановление правил

```bash
# Сохранить в файл
iptables-save > /etc/fwrules.saved

# Восстановить из файла
iptables-restore < /etc/fwrules.saved
```

Чтобы правила применялись при загрузке, команду `iptables-restore` добавляют в SysV init-скрипт или systemd unit.

### iptables-persistent на Debian/Ubuntu

Пакет автоматизирует сохранение и восстановление правил через systemd-юнит `netfilter-persistent.service`:

```bash
sudo apt install iptables-persistent
```

При установке пакет предложит сохранить текущие правила для IPv4 и IPv6. После этого файлы хранятся в фиксированных путях:

| Путь | Содержимое |
|---|---|
| `/etc/iptables/rules.v4` | IPv4-правила |
| `/etc/iptables/rules.v6` | IPv6-правила |

После изменения правил — сохранить:

```bash
sudo iptables-save  | sudo tee /etc/iptables/rules.v4
sudo ip6tables-save | sudo tee /etc/iptables/rules.v6
```

---

## DoS-атаки и защита от них

DoS (Denial of Service) — атака, цель которой исчерпать ресурсы: пропускную способность, процессор или память. Основной метод — "packet flooding".

Типы packet flooding по протоколу:

| Протокол | Метод | Флаги / типы |
|---|---|---|
| TCP | SYN flood, ACK flood, RST flood | SYN, ACK, RST |
| ICMP | Ping flooding | echo-request, echo-reply |
| UDP | chargen/echo flooding | порты chargen и echo |

IP address spoofing: система C отправляет пакеты системе A, подделывая source IP под адрес системы B. Система A шлёт ответы на B. DDoS (Distributed DoS) — та же атака, но с множества источников одновременно.

Ссылки: http://www.cert.org/ — история DoS/DDoS атак. RFC 2827 — Network Ingress Filtering (защита от IP spoofing).

### Защита через /proc/sys/net/ipv4 (sysctl)

| Параметр | Тип | Описание |
|---|---|---|
| `tcp_max_orphans` | INTEGER | Максимальное число TCP-сокетов без файлового дескриптора |
| `tcp_max_tw_buckets` | INTEGER | Максимальное число TIME_WAIT сокетов |
| `rp_filter` | 0/1/2 | Reverse Path Filtering: проверка source IP входящих пакетов |

Значения `rp_filter`:

- `0` — нет проверки источника
- `1` — Strict mode (RFC 3704): пакет проверяется через FIB; если интерфейс не лучший обратный путь — пакет отбрасывается
- `2` — Loose mode (RFC 3704): source IP проверяется через FIB; если адрес недостижим ни через один интерфейс — пакет отбрасывается

```bash
# Включить strict reverse path filtering на всех интерфейсах
sysctl -w net.ipv4.conf.all.rp_filter=1

# Ограничить TIME_WAIT сокеты
sysctl -w net.ipv4.tcp_max_tw_buckets=10000

# Сделать постоянным
echo "net.ipv4.conf.all.rp_filter = 1" >> /etc/sysctl.conf
```

### Защита через iptables: rate limiting

```bash
# Ограничить количество новых соединений с одного IP (модуль recent)
iptables -A INPUT -p tcp --dport 22 -m state --state NEW \
  -m recent --set --name SSH
iptables -A INPUT -p tcp --dport 22 -m state --state NEW \
  -m recent --update --seconds 60 --hitcount 4 --name SSH -j DROP

# Ограничить ping flood через limit
iptables -A INPUT -p icmp --icmp-type echo-request \
  -m limit --limit 1/second -j ACCEPT
iptables -A INPUT -p icmp --icmp-type echo-request -j DROP

# Блокировать SYN flood
iptables -A INPUT -p tcp --syn -m state --state NEW \
  -m limit --limit 10/second --limit-burst 20 -j ACCEPT
iptables -A INPUT -p tcp --syn -j DROP
```

`rp_filter` не предотвращает DoS, но позволяет отследить реальный IP атакующего при IP spoofing. Для экзамена: rp_filter=1 — strict, rp_filter=2 — loose, rp_filter=0 — выключен.

---

## Управление таблицей маршрутизации

### routed и gated

`routed` — демон динамической маршрутизации. Поддерживает только протокол RIP.

Как работает routed:

- Находит интерфейсы, настроенные через `ifconfig` и помеченные как up
- Если несколько интерфейсов — предполагает, что хост пересылает пакеты между сетями
- Отправляет RIP request на каждый интерфейс (broadcast, если поддерживается)
- Слушает RIP request/response от других хостов
- Отправляет RIP update каждые 30 секунд всем напрямую подключённым хостам
- Каждый маршрут помечается метрикой hop-count. Метрика 16 и выше — маршрут недостижим

`gated` — более старый демон маршрутизации. Поддерживает RIPv2, RIPng, OSPF, OSPF6, BGP4+, BGP4-.

### Команда route

`route` управляет таблицей маршрутизации ядра. В современных дистрибутивах используют `ip route`.

```bash
# Показать таблицу маршрутизации
route -n

# Добавить маршрут к сети через интерфейс
route add -net 192.168.10.0 netmask 255.255.255.0 dev eth0

# Добавить маршрут к сети через шлюз
route add -net 192.168.20.0 netmask 255.255.255.0 gw 192.168.1.10

# Добавить маршрут по умолчанию
route add default gw 192.168.1.1 eth1

# Удалить маршрут
route del -net 192.168.10.0 netmask 255.255.255.0 dev eth0
```

Опции команды route:

| Опция | Описание |
|---|---|
| `-v` | Подробный вывод |
| `-net` | Цель — сеть |
| `-host` | Цель — хост |
| `netmask NM` | Маска сети при добавлении сетевого маршрута |
| `gw GW` | Маршрутизировать через шлюз (шлюз должен быть достижим) |
| `metric N` | Установить метрику (используется демонами маршрутизации) |
| `dev If` | Привязать маршрут к интерфейсу |

Столбцы вывода `route -n`:

| Столбец | Описание |
|---|---|
| Destination | Сеть или хост назначения |
| Gateway | Адрес шлюза или `*` если не задан |
| Genmask | Маска: `255.255.255.255` для хоста, `0.0.0.0` для default route |
| Flags | U=up, H=host, G=gateway, R=reinstate, D=dynamic, M=modified, C=cache, !=reject |
| Metric | Расстояние до цели (обычно в хопах) |
| Ref | Число ссылок на маршрут |
| Iface | Интерфейс для отправки пакетов |

Пример вывода:

```
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
192.168.20.0    *               255.255.255.0   U     0      0        0 eth0
link-local      *               255.255.0.0     U     1002   0        0 eth0
default         192.168.20.1    0.0.0.0         UG    0      0        0 eth0
```

### Команда netstat

```bash
# Показать таблицу маршрутизации (-r) без разрешения имён (-n)
netstat -rn
```

### Команда ip route (iproute2)

```bash
# Показать таблицу маршрутизации
ip route show

# Добавить маршрут
ip route add 192.168.2.0/24 via 192.168.1.1

# Удалить маршрут
ip route del 192.168.2.0/24
```

---

## ip6tables

ip6tables — аналог iptables для IPv6. Синтаксис идентичен, отличие только в 128-битных адресах вместо 32-битных.

```bash
# Разрешить ICMPv6 (необходим для работы IPv6)
ip6tables -A INPUT  -p icmpv6 -j ACCEPT
ip6tables -A OUTPUT -p icmpv6 -j ACCEPT
```

iptables и ip6tables работают одновременно и независимо. Правила для IPv4 не влияют на IPv6-трафик.

ICMPv6 нельзя просто заблокировать — он необходим для Neighbor Discovery Protocol (NDP), который делает то, что ARP делал в IPv4.

---

## nftables

nftables заменяет iptables/ip6tables/arptables/ebtables в современных дистрибутивах. Использует единый инструмент `nft` и унифицированный язык правил.

```bash
nft list ruleset           # показать все правила
nft list tables            # список таблиц
nft list table inet filter # показать конкретную таблицу
```

Базовая структура nftables:

```
table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;
        iif lo accept
        ct state established,related accept
        tcp dport 22 accept
        tcp dport { 80, 443 } accept
    }
    chain forward {
        type filter hook forward priority 0; policy drop;
    }
    chain output {
        type filter hook output priority 0; policy accept;
    }
}
```

`inet` = IPv4 + IPv6 вместе. Используйте `ip` только для IPv4, `ip6` только для IPv6.

NAT в nftables:

```bash
table ip nat {
    chain postrouting {
        type nat hook postrouting priority 100;
        oif "eth0" masquerade
    }
    chain prerouting {
        type nat hook prerouting priority -100;
        tcp dport 80 dnat to 192.168.1.100:80
    }
}
```

---

## Шпаргалка для экзамена

### Приватные диапазоны IPv4

```
10.0.0.0/8        (блок /8,  "24-bit block")
172.16.0.0/12     (блок /12, "20-bit block")
192.168.0.0/16    (блок /16, "16-bit block")
```

### IPv6 приватные диапазоны

```
fc00::/7  — Unique Local Addresses (ULA), RFC 4193
fe80::/64 — Link-local (автоматически, не маршрутизируется)
169.254.0.0/16 — Link-local IPv4 (сбой DHCP)
```

### Ключевые файлы и пути

```
/proc/sys/net/ipv4/ip_forward          — включение forwarding
/proc/sys/net/ipv6/conf/all/forwarding — IPv6 forwarding
/proc/sys/net/ipv4/conf/all/rp_filter  — reverse path filter
/etc/sysctl.conf                       — постоянные параметры ядра
/etc/services                          — имена сервисов → порты
/etc/iptables/rules.v4                 — сохранённые правила IPv4 (Debian)
/etc/iptables/rules.v6                 — сохранённые правила IPv6 (Debian)
/etc/nftables.conf                     — набор правил nftables
```

### Таблица targets и где работают

```
ACCEPT       — везде
DROP         — везде
REJECT       — filter: INPUT, FORWARD, OUTPUT
LOG          — везде, передаёт дальше
RETURN       — везде, выходит из текущей цепочки
MARK         — только mangle
TOS          — только mangle
SNAT         — nat: POSTROUTING
MASQUERADE   — nat: POSTROUTING (только динамический IP)
DNAT         — nat: PREROUTING, OUTPUT
REDIRECT     — nat: PREROUTING, OUTPUT
```

### Матрица таблица/цепочка

```
           PREROUTING  INPUT  FORWARD  OUTPUT  POSTROUTING
MANGLE         +         -       -       +          -
NAT            +         -       -       +          +
FILTER         -         +       +       +          -
```

### rp_filter значения

```
0 — нет проверки источника
1 — strict (RFC 3704): лучший обратный путь через FIB
2 — loose (RFC 3704): source IP достижим хоть через один интерфейс
```

### Ключевые команды

```bash
iptables -L -n -v --line-numbers    # список правил с номерами
iptables -t nat -L -n -v            # NAT-правила
iptables -A chain rule              # добавить в конец
iptables -I chain [num] rule        # вставить на позицию
iptables -D chain rule|num          # удалить
iptables -R chain num rule          # заменить
iptables -F [chain]                 # очистить цепочку/таблицу
iptables -P chain target            # политика по умолчанию (ACCEPT|DROP)
iptables -N chain                   # создать цепочку
iptables -X [chain]                 # удалить цепочку
iptables-save > file                # сохранить правила
iptables-restore < file             # восстановить правила
echo 1 > /proc/sys/net/ipv4/ip_forward    # включить forwarding
sysctl -w net.ipv4.ip_forward=1           # то же через sysctl
sysctl -p                                 # применить /etc/sysctl.conf
route -n                            # таблица маршрутизации
netstat -rn                         # таблица маршрутизации
ip route show                       # таблица маршрутизации (iproute2)
route add -net 10.0.0.0 netmask 255.0.0.0 gw 192.168.1.1
route add default gw 192.168.1.1 eth1
nft list ruleset                    # правила nftables
```

### Флаги в выводе route -n

```
U — маршрут активен (up)
H — цель — хост (не сеть)
G — использует шлюз (gateway)
R — восстановлен для динамической маршрутизации
D — установлен демоном или redirect
M — изменён демоном или redirect
C — cache entry
! — reject route
```

### Типичные ошибки на экзамене

- SNAT — POSTROUTING, DNAT — PREROUTING
- MASQUERADE при динамическом IP, SNAT — при статическом
- MASQUERADE сбрасывает соединения при падении интерфейса, SNAT — нет
- Без `ip_forward=1` цепочка FORWARD не работает вообще
- REJECT нельзя поставить как политику `-P`, только как последнее явное правило
- `-X` без аргумента удаляет все пользовательские цепочки таблицы
- ip6tables и iptables — независимые наборы правил
- ICMPv6 нельзя блокировать — нужен для NDP (аналог ARP в IPv6)
- `rp_filter` — защита от IP spoofing, не от DoS
- После DNAT трафик обязательно нужно разрешить через FORWARD
- Connection tracking hooks: PREROUTING, FORWARD, OUTPUT, POSTROUTING
- Метрика 16 и выше в RIP — маршрут недостижим
- `iptables -F` сбрасывает правила, но НЕ сбрасывает политики — политика DROP остаётся
- nftables `inet` — обрабатывает и IPv4, и IPv6 в одной таблице

---

## Практические вопросы

**1. Какая команда включает пересылку пакетов между интерфейсами на Linux?**

`echo 1 > /proc/sys/net/ipv4/ip_forward` или `sysctl -w net.ipv4.ip_forward=1`. Для постоянного эффекта — добавить `net.ipv4.ip_forward = 1` в `/etc/sysctl.conf`.

**2. В чём разница между SNAT и MASQUERADE?**

SNAT требует явного IP, сохраняет connection tracking при перезапуске интерфейса — для статического WAN IP. MASQUERADE берёт IP автоматически с интерфейса, сбрасывает соединения при падении интерфейса — для динамического WAN IP.

**3. В какой цепочке таблицы nat нужно разместить DNAT?**

В PREROUTING — адрес назначения меняется до решения о маршрутизации. Без этого ядро попытается доставить пакет локально.

**4. Почему после правила DNAT обязательно нужно добавить правило в FORWARD?**

DNAT меняет адрес назначения, и пакет теперь идёт на другую машину — то есть проходит транзитом через Firewall. Цепочка FORWARD контролирует транзитный трафик.

**5. Какое состояние connection tracking нужно разрешить для FTP в активном режиме?**

RELATED — FTP data-соединение связано с уже установленным командным соединением. Нужен также модуль `ip_conntrack_ftp`.

**6. Что означает метрика 16 в RIP?**

Маршрут недостижим. Метрика 16 и выше в RIP считается бесконечностью.

**7. Пользователь видит IP 169.254.x.x на интерфейсе. Что это означает?**

DHCP-аренда адреса не удалась. Интерфейс назначил себе link-local адрес из 169.254.0.0/16 автоматически.

**8. Какой диапазон IPv6 аналогичен RFC 1918?**

`fc00::/7` — Unique Local Addresses (ULA), описан в RFC 4193.

**9. REJECT нельзя поставить как политику `-P`. Что делать, если нужно REJECT как последнее правило?**

Добавить явное правило REJECT вручную в конец цепочки: `iptables -A INPUT -j REJECT`.

**10. Что делает `rp_filter = 1`?**

Включает strict reverse path filtering: каждый входящий пакет проверяется через FIB, и если входящий интерфейс не лучший обратный путь к source IP — пакет отбрасывается. Защищает от IP spoofing.

**11. Администратор хочет перенаправить порт 443 на внешнем интерфейсе на внутренний сервер 10.0.0.5:8443. Запишите нужные команды.**

```bash
iptables -t nat -A PREROUTING -i eth1 -p tcp --dport 443 \
  -j DNAT --to-destination 10.0.0.5:8443
iptables -t filter -A FORWARD -i eth1 -p tcp --dport 8443 \
  -m state --state NEW -j ACCEPT
```

**12. Что такое DoS с IP spoofing и какой RFC описывает защиту от него?**

Система C отправляет пакеты системе A с подделанным source IP системы B. A отвечает на B, перегружая её. RFC 2827 описывает Network Ingress Filtering — фильтрацию пакетов с заведомо невозможными source IP на уровне ISP.
