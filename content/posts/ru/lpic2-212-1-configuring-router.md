---
title: "LPIC-2 212.1 — Configuring a Router"
date: 2026-05-27
description: "Пересылка IP-пакетов, NAT/masquerading, таблицы и цепочки iptables, SNAT/DNAT/MASQUERADE, перенаправление портов, основы nftables, sysctl.conf. Тема экзамена LPIC-2 212.1."
tags: ["Linux", "LPIC-2", "iptables", "nftables", "NAT", "routing", "firewall"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2-212-1-configuring-router/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 212.1** — Configuring a Router (вес: 3). Охватывает пересылку IP-пакетов, NAT, фильтрацию пакетов и трансляцию адресов с помощью iptables/nftables.

---

## Пересылка IP-пакетов

По умолчанию Linux отбрасывает пакеты, не предназначенные для него самого. Чтобы работать как маршрутизатор, необходимо включить пересылку IP.

**Временно (сбрасывается при перезагрузке):**

```bash
echo 1 > /proc/sys/net/ipv4/ip_forward
# или
sysctl -w net.ipv4.ip_forward=1
```

**Постоянно (сохраняется после перезагрузки):**

```ini
# /etc/sysctl.conf
net.ipv4.ip_forward = 1
```

```bash
sysctl -p    # немедленно перезагрузить /etc/sysctl.conf
```

Пересылка IPv6:

```ini
net.ipv6.conf.all.forwarding = 1
```

Проверить текущее состояние:

```bash
cat /proc/sys/net/ipv4/ip_forward    # 0 = выключено, 1 = включено
sysctl net.ipv4.ip_forward
```

---

## Обзор iptables

iptables проверяет и изменяет сетевые пакеты. Использует **таблицы** (тип работы) и **цепочки** (когда применяется правило).

### Таблицы

| Таблица | Назначение |
|---|---|
| `filter` | По умолчанию. Разрешить/запретить пакеты (INPUT, OUTPUT, FORWARD) |
| `nat` | Трансляция адресов (PREROUTING, OUTPUT, POSTROUTING) |
| `mangle` | Изменение полей пакета (TTL, ToS) |
| `raw` | Обход отслеживания соединений (PREROUTING, OUTPUT) |
| `security` | Обязательный контроль доступа (SELinux/secmark) |

### Цепочки

| Цепочка | Когда применяется |
|---|---|
| `INPUT` | Пакеты, предназначенные этому хосту |
| `OUTPUT` | Пакеты, исходящие от этого хоста |
| `FORWARD` | Пакеты, проходящие через этот хост (маршрутизация) |
| `PREROUTING` | До принятия решения о маршрутизации (используется для DNAT) |
| `POSTROUTING` | После принятия решения о маршрутизации (используется для SNAT/MASQUERADE) |

### Поток пакетов:

```
Входящий пакет
    → PREROUTING (nat)
        → решение о маршрутизации
            → локальный процесс? → INPUT (filter) → локальный процесс
            → пересылка?         → FORWARD (filter) → POSTROUTING (nat) → исходящий
Исходящий пакет (от локального)
    → OUTPUT (filter/nat) → POSTROUTING (nat) → исходящий
```

---

## Синтаксис iptables

```bash
iptables [опции] -t <таблица> -A|-I|-D|-R <цепочка> [совпадения] -j <цель>
```

| Опция | Значение |
|---|---|
| `-t table` | Указать таблицу (по умолчанию: filter) |
| `-A chain` | Добавить правило в конец цепочки |
| `-I chain [n]` | Вставить правило на позицию n (по умолчанию: 1 = начало) |
| `-D chain n` | Удалить правило по номеру позиции |
| `-D chain rule` | Удалить правило, соответствующее спецификации |
| `-R chain n` | Заменить правило на позиции n |
| `-F [chain]` | Сбросить (удалить все правила в цепочке или во всех цепочках) |
| `-P chain target` | Установить политику по умолчанию для цепочки |
| `-L [chain]` | Вывести список правил |
| `-n` | Не разрешать адреса (более быстрый вывод) |
| `-v` | Подробный вывод (показать счётчики) |
| `--line-numbers` | Показывать номера правил при выводе |

### Распространённые совпадения

| Совпадение | Пример | Значение |
|---|---|---|
| `-s` | `-s 192.168.1.0/24` | Исходный IP/сеть |
| `-d` | `-d 10.0.0.1` | Целевой IP |
| `-p` | `-p tcp` | Протокол: tcp, udp, icmp, all |
| `--dport` | `--dport 80` | Целевой порт (требует `-p tcp/udp`) |
| `--sport` | `--sport 1024:65535` | Диапазон исходного порта |
| `-i` | `-i eth0` | Входящий интерфейс |
| `-o` | `-o eth1` | Исходящий интерфейс |
| `-m state --state` | `--state NEW,ESTABLISHED` | Состояние соединения |
| `! -s` | `! -s 10.0.0.0/8` | Отрицание |

### Цели (действия)

| Цель | Значение |
|---|---|
| `ACCEPT` | Разрешить пакет |
| `DROP` | Тихо отбросить |
| `REJECT` | Отбросить и отправить обратно ошибку ICMP |
| `LOG` | Записать в syslog и продолжить |
| `MASQUERADE` | Source NAT с динамическим IP (для POSTROUTING) |
| `SNAT --to-source` | Source NAT на конкретный IP |
| `DNAT --to-destination` | Destination NAT (перенаправление портов) |
| `REDIRECT` | Перенаправить на локальный порт |

---

## Базовые правила брандмауэра

```bash
# Политики по умолчанию
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Разрешить loopback
iptables -A INPUT -i lo -j ACCEPT

# Разрешить установленные соединения
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Разрешить SSH
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Разрешить HTTP, HTTPS
iptables -A INPUT -p tcp -m multiport --dports 80,443 -j ACCEPT

# Записать и отбросить всё остальное
iptables -A INPUT -j LOG --log-prefix "DROPPED: "
```

```bash
# Вывести все правила с номерами
iptables -L -n -v --line-numbers

# Удалить правило #3 из INPUT
iptables -D INPUT 3

# Сбросить все правила в таблице filter
iptables -F

# Сохранить и восстановить правила
iptables-save > /etc/iptables/rules.v4
iptables-restore < /etc/iptables/rules.v4
```

---

## NAT — трансляция сетевых адресов

### MASQUERADE (динамический SNAT)

Используется когда исходящий IP динамический (например, PPPoE/DHCP). Исходный IP заменяется текущим IP исходящего интерфейса.

```bash
# Включить MASQUERADE на исходящем интерфейсе eth0
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
```

В сочетании с пересылкой IP это превращает Linux-хост в NAT-маршрутизатор:

```bash
echo 1 > /proc/sys/net/ipv4/ip_forward
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
iptables -A FORWARD -i eth1 -o eth0 -j ACCEPT
iptables -A FORWARD -i eth0 -o eth1 -m state --state ESTABLISHED,RELATED -j ACCEPT
```

`eth0` = внешний (интернет); `eth1` = внутренний (LAN).

### SNAT (статический source NAT)

Используется когда внешний IP фиксированный:

```bash
iptables -t nat -A POSTROUTING -o eth0 -j SNAT --to-source 203.0.113.5
```

### MASQUERADE vs SNAT

| | MASQUERADE | SNAT |
|---|---|---|
| Источник IP | Динамический (текущий IP интерфейса) | Статический (указанный) |
| Применение | Динамический IP (PPPoE, DHCP) | Статический/выделенный IP |
| Производительность | Чуть медленнее (ищет IP для каждого пакета) | Быстрее |

---

## Перенаправление портов (DNAT)

Перенаправить входящий трафик на одном порту на другой хост/порт:

```bash
# Перенаправить внешний порт 80 на внутренний хост 192.168.1.100:80
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 \
  -j DNAT --to-destination 192.168.1.100:80

# Также разрешить перенаправленный трафик
iptables -A FORWARD -p tcp -d 192.168.1.100 --dport 80 -j ACCEPT
```

Перенаправить на другой порт:

```bash
# Внешний 8080 → внутренний 192.168.1.100:80
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 8080 \
  -j DNAT --to-destination 192.168.1.100:80
```

REDIRECT — перенаправить на локальный порт (прозрачный прокси):

```bash
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3128
```

---

## IPv6 — ip6tables

ip6tables имеет тот же синтаксис, что и iptables, но работает с IPv6. NAT для IPv6 применяется редко (адреса глобально маршрутизируемы), но фильтрация работает идентично:

```bash
ip6tables -A INPUT -p tcp --dport 22 -j ACCEPT
ip6tables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
ip6tables -P INPUT DROP
```

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

```bash
nft add table inet filter
nft add chain inet filter input '{ type filter hook input priority 0; policy drop; }'
nft add rule inet filter input tcp dport 22 accept

# Загрузить из файла
nft -f /etc/nftables.conf

# Сохранить
nft list ruleset > /etc/nftables.conf
```

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

## Команда ip — маршрутизация

```bash
# Показать таблицу маршрутизации
ip route show
ip route

# Добавить статический маршрут
ip route add 10.0.0.0/8 via 192.168.1.1
ip route add 10.0.0.0/8 via 192.168.1.1 dev eth0

# Добавить шлюз по умолчанию
ip route add default via 192.168.1.1

# Удалить маршрут
ip route del 10.0.0.0/8

# Постоянные маршруты: /etc/network/interfaces (Debian) или /etc/sysconfig/network-scripts/ (RHEL)
```

```bash
# Устаревшая команда route (всё ещё встречается на экзамене)
route -n                              # показать таблицу маршрутизации (числовой формат)
route add -net 10.0.0.0/8 gw 192.168.1.1
route add default gw 192.168.1.1
route del -net 10.0.0.0/8
```

---

## Шпаргалка для экзамена

### Файлы и пути

| Путь | Описание |
|---|---|
| `/proc/sys/net/ipv4/ip_forward` | Переключатель пересылки IP (0/1) |
| `/etc/sysctl.conf` | Постоянные параметры ядра |
| `/etc/iptables/rules.v4` | Сохранённые правила iptables (Debian) |
| `/etc/nftables.conf` | Набор правил nftables |

### Ключевые команды

```bash
sysctl -w net.ipv4.ip_forward=1      # включить пересылку временно
sysctl -p                            # перезагрузить sysctl.conf
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 192.168.1.100
iptables -L -n -v --line-numbers     # вывести правила
iptables-save > /etc/iptables/rules.v4
nft list ruleset
```

### Типичные ошибки на экзамене

| Ошибка | Правило |
|---|---|
| MASQUERADE vs SNAT | MASQUERADE = динамический IP; SNAT = статический IP |
| PREROUTING vs POSTROUTING | DNAT идёт в PREROUTING; SNAT/MASQUERADE — в POSTROUTING |
| ip_forward | Должен быть 1 для маршрутизации/NAT — правил iptables недостаточно |
| `iptables -F` | Сбрасывает правила, но НЕ сбрасывает политики — политика DROP остаётся |
| nftables `inet` | Обрабатывает и IPv4, и IPv6 в одной таблице |
| Перенаправление портов | Одного правила DNAT недостаточно — цепочка FORWARD тоже должна ACCEPT |
