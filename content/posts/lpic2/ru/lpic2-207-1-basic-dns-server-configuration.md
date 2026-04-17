---
title: "LPIC-2 207.1 — Basic DNS Server Configuration"
date: 2026-01-08
description: "Компоненты BIND, структура named.conf (options/logging/zone), кэширующий сервер, rndc, named-checkconf/named-checkzone, dig и host. Альтернативные DNS-серверы: dnsmasq, djbdns, PowerDNS. Тема экзамена LPIC-2 207.1."
tags: ["Linux", "LPIC-2", "DNS", "BIND", "named", "dig"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2/lpic2-207-1-basic-dns-server-configuration/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 207.1** — Базовая конфигурация DNS-сервера (вес: 3). Охватывает настройку BIND как кэширующего DNS-сервера, структуру `named.conf`, типы зон, управление через `rndc` и диагностические утилиты DNS.

---

## История и основы DNS

В ранние дни интернета все соответствия имён хостов IP-адресам хранились в едином файле **`HOSTS.TXT`**, который поддерживался NIC и распространялся через FTP. По мере роста числа хостов была разработана распределённая система **DNS (Domain Name System)** с локальным кэшированием и распределёнными обновлениями данных.

**DNS слушает порт `53`** (UDP и TCP) и выполняет:
- **Прямое разрешение имён**: имя → IP (запись A)
- **Обратное разрешение (rDNS)**: IP → имя (запись PTR)

---

## Ключевые термины

| Термин | Описание |
|---|---|
| **Зона** | Эквивалент домена; файл зоны содержит имена хостов и IP-адреса |
| **Запись PTR** | Требуется для обратного DNS (rDNS) |
| **Авторитетный сервер** | Управляет конфигурацией зоны — «хозяин зоны» |
| **Рекурсивный сервер** | Разрешает имена для зон, за которые не является авторитетным |
| **Резолвер** | Библиотека/программный компонент, выполняющий DNS-запросы на клиенте |
| **FQDN** | Полностью квалифицированное доменное имя |

> Порядок разрешения имён управляется файлом **`/etc/nsswitch.conf`**.

---

## Компоненты BIND

**BIND (Berkeley Internet Name Domain)** — наиболее популярный DNS-сервер в Linux.

| Компонент | Описание |
|---|---|
| `/usr/sbin/named` | Основной демон DNS-сервера |
| `/usr/sbin/rndc` | Инструмент управления демоном |
| `/usr/sbin/named-checkconf` | Проверка синтаксиса `named.conf` |
| `named.conf` | Основной файл конфигурации BIND |
| `/etc/init.d/bind` | Скрипт запуска/остановки (зависит от дистрибутива) |
| `/var/named/` | Рабочий каталог named (файлы зон) |

**Расположение `named.conf` по дистрибутивам:**

| Дистрибутив | Путь |
|---|---|
| RHEL / CentOS | `/etc/named.conf` |
| Debian / Ubuntu | `/etc/bind/named.conf` |

**Расположение файлов зон:**

| Дистрибутив | Путь к файлам зон |
|---|---|
| CentOS / RHEL | `/var/named/named.*` |
| Debian / Ubuntu | `/etc/bind/db.*` |

---

## named.conf

**`named.conf`** — основной файл конфигурации BIND, первый файл, читаемый демоном `named`.

### Синтаксис

```
keyword {
    parameters;
};
```

- Операторы могут быть **вложенными**
- Простые параметры заканчиваются **`;`**
- Комментарии: `//`, `#`, `/* ... */`

> **Внимание:** `;` — это **не** комментарий в `named.conf`. Это комментарий в **файлах зон** BIND.

### Структура файла (Ubuntu — всё через include):

```
include "/etc/bind/named.conf.options";
include "/etc/bind/named.conf.local";
include "/etc/bind/named.conf.default-zones";
```

---

## Кэширующий сервер

Кэширующий сервер разрешает имена и **сохраняет результаты в кэш**. Он **не обслуживает собственные зоны** (кроме нескольких внутренних).

### Полный пример `named.conf` (Debian):

```
options {
    directory "/var/named";
    // forwarders {
    //     0.0.0.0;
    // };
};

logging {
    category lame-servers { null; };
    category cname { null; };
};

// Корневые серверы:
zone "." {
    type hint;
    file "/etc/bind/db.root";
};

// Внутренние зоны (обязательны):
zone "localhost" {
    type master;
    file "/etc/bind/db.local";
};

zone "127.in-addr.arpa" {
    type master;
    file "/etc/bind/db.127";
};

zone "0.in-addr.arpa" {
    type master;
    file "/etc/bind/db.0";
};

zone "255.in-addr.arpa" {
    type master;
    file "/etc/bind/db.255";
};
```

---

## Секция options

> **Внимание:** В `named.conf` допускается только **один** оператор `options`.

### Ключевые параметры:

| Параметр | Описание |
|---|---|
| `directory` | Рабочий каталог для файлов зон (`/var/named`) |
| `listen-on` | Порт и адреса для входящих запросов |
| `recursion` | Разрешить/запретить рекурсию (`yes`/`no`) |
| `allow-query` | Список IP, которым разрешены запросы |
| `forwarders` | IP-адреса вышестоящих DNS-серверов |
| `forward` | Режим пересылки: `first` или `only` |
| `version` | Версия BIND в ответах (можно скрыть) |
| `dialup` | Для серверов за межсетевым экраном/коммутируемым соединением |

### Пример с форвардерами:

```
options {
    directory "/var/named";
    listen-on port 53 { 127.0.0.1; };
    recursion yes;
    allow-query { localhost; 192.168.1.0/24; };

    forwarders {
        123.12.134.2;
        123.12.134.3;
    };
    forward only;    // только к форвардерам
    // forward first; // сначала форвардеры, затем остальные (по умолчанию)

    version "not revealed";  // скрыть версию BIND
};
```

### Скрытие версии BIND:

```
version "not revealed";
// или:
version none;
```

Запрос версии:

```bash
dig @ns.example.com version.bind chaos txt
```

---

## Секция logging

> **Внимание:** В `named.conf` допускается только **один** оператор `logging`.

**Channel** — куда писать журналы  
**Category** — тип сообщений  
**Severity** — уровень детализации: от `critical` (минимум) до `dynamic` (максимум)

```
logging {
    channel my_channel {
        file "data/named.log";
        severity dynamic;
    };

    // Направить в канал:
    category security { my_channel; };
    category queries  { my_channel; };

    // Отключить категории:
    category lame-servers { null; };
    category cname        { null; };
};
```

### Важные категории журналирования:

| Категория | Описание |
|---|---|
| `client` | Запросы клиентов |
| `security` | Разрешения и отказы |
| `queries` | DNS-запросы |
| `update` | Динамические обновления DNS |
| `xfer-in` | Входящие передачи зон |
| `xfer-out` | Исходящие передачи зон |
| `lame-servers` | Некорректно настроенные серверы |
| `general` | Всё остальное (catch-all) |
| `default` | Все сообщения без категории |

> BIND 9 применяет конфигурацию журналирования **после** разбора всего файла (в отличие от BIND 8). Секция `logging` необязательна — существуют разумные значения по умолчанию.

---

## Секция zone

### Типы зон:

| Тип | Значение |
|---|---|
| `master` | Первичный авторитетный сервер зоны |
| `slave` | Вторичный сервер зоны |
| `hint` | Список корневых серверов (для зоны `"."`) |
| `forward` | Перенаправление запросов на другой сервер |
| `redirect` | Отвечает при получении NXDOMAIN |

### Примеры зон:

```
// Корневая зона:
zone "." {
    type hint;
    file "named.ca";
};

// Прямая авторитетная зона:
zone "example.com" {
    type master;
    file "db.example.com";
    allow-update { none; };
};

// Обратная зона:
zone "1.168.192.in-addr.arpa" {
    type master;
    file "db.192.168.1";
};

// Slave-зона:
zone "example.com" {
    type slave;
    masters { 192.168.1.1; };
    file "slaves/db.example.com";
};
```

### Символ `@` в файлах зон:

`@` означает «текущий источник» — имя зоны из `named.conf`:

```
zone "127.in-addr.arpa" {
    type master;
    file "/etc/bind/db.127";
};
// Внутри db.127 символ @ = 127.in-addr.arpa
```

---

## Управление демоном named

### rndc (Remote Name Daemon Control)

Управляет `named` локально и **удалённо**. Требует общего секретного ключа (`/etc/rndc.key`).

**`/etc/rndc.key`:**

```
key "rndc-key" {
    algorithm hmac-md5;
    secret "tyZqsLtPHCNna5SFBLT0Eg==";
};

options {
    default-key "rndc-key";
    default-server 127.0.0.1;
    default-port 953;
};
```

**В `named.conf`:**

```
key "rndc-key" {
    algorithm hmac-md5;
    secret "tyZqsLtPHCNna5SFBLT0Eg==";
};

controls {
    inet 127.0.0.1 port 953
        allow { 127.0.0.1; } keys { "rndc-key"; };
};
```

> Секрет никогда не передаётся по сети — обе стороны вычисляют **хэш** и сравнивают. Права на `rndc.key`: владелец `root:bind`, режим `640`. Для генерации: `rndc-confgen`.

### Команды rndc:

| Команда | Действие |
|---|---|
| `rndc reload` | Перезагрузить все зоны и конфигурацию |
| `rndc reload example.com` | Перезагрузить только одну зону |
| `rndc status` | Статус сервера |
| `rndc flush` | Очистить кэш |
| `rndc stop` | Остановить named |
| `rndc help` | Список всех команд |

### Сигналы через `kill`:

```bash
kill -HUP  <PID>   # SIGHUP: перезагрузить конфигурацию и зоны
kill -TERM <PID>   # остановить named
kill -INT  <PID>   # остановить named
```

### Через systemd / SysV:

```bash
systemctl reload  named      # перезагрузить конфигурацию
systemctl restart named      # перезапустить
systemctl stop    named      # остановить
systemctl start   named      # запустить

service named reload         # альтернатива SysV
/etc/init.d/bind reload      # Debian
```

---

## named-checkconf и named-checkzone

Проверяет синтаксис `named.conf` **без** перезапуска сервера.

```bash
named-checkconf                                  # расположение по умолчанию
named-checkconf /etc/bind/named.conf             # нестандартное расположение
named-checkzone example.com /var/named/db.example.com  # проверить файл зоны
```

- При отсутствии ошибок — возвращает **без вывода**
- При ошибке: `/etc/named.conf:56: unknown option 'nclude'`

> **Внимание:** Файлы, включённые через `include`, **не проверяются автоматически** — их нужно явно передавать как аргумент.

---

## Альтернативные DNS-серверы

### dnsmasq

Лёгкий **форвардер DNS + DHCP-сервер**. Поддерживает:
- Статические и динамические аренды DHCP
- Протоколы BOOTP/TFTP/PXE
- Идеален для локальных сетей и встроенных систем

### djbdns

Создан Дэниелом Бернштейном в ответ на уязвимости BIND. Включает:
- Кэш DNS, DNS-сервер, DNS-клиент
- Инструменты отладки DNS
- Исходный код — **общественное достояние с 2007 года**
- Форк для Debian: **dbndns**

### PowerDNS

Нидерландский поставщик DNS-программного обеспечения (лицензия: **GPL**). Пакеты: `pdns`, `pdns-server`.

Поддерживаемые бэкенды:

```bash
pdns-backend-mysql     # MySQL
pdns-backend-pgsql     # PostgreSQL
pdns-backend-ldap      # LDAP
pdns-backend-sqlite    # SQLite
pdns-backend-lua       # Lua
pdns-backend-geo       # Geo
pdns-backend-pipe      # Pipe/coprocess
pdns-recursor          # Рекурсивный резолвер
```

### Сравнение:

| Сервер | Лицензия | Особенности |
|---|---|---|
| **BIND** | ISC | Наиболее широко используется, полнофункциональный |
| **dnsmasq** | GPL | Лёгкий DNS+DHCP, для локальных сетей |
| **djbdns** | Public Domain | Высокая безопасность, инструменты отладки |
| **PowerDNS** | GPL | Множество бэкендов (MySQL, LDAP, SQLite…) |

---

## dig и host

ISC официально **признал `nslookup` устаревшим** в пользу `host` и `dig`. `nslookup` по-прежнему доступен в большинстве дистрибутивов.

### host

Простой инструмент для базового разрешения имён.

```bash
host example.com               # прямой запрос
host -t MX example.com         # запрос конкретного типа записи
host -t NS example.com
host 217.147.180.162            # обратный запрос
host -C example.com            # сравнить SOA на всех NS-серверах
host -l example.com            # список всех хостов (AXFR)
```

**Ключевые опции:**

| Опция | Описание |
|---|---|
| `-t type` | Тип записи (A, MX, NS, SOA…) |
| `-a` | Эквивалент `-v -t ANY` |
| `-C` | Сравнить SOA на авторитетных серверах |
| `-l` | Все хосты домена (AXFR) |
| `-r` | Отключить рекурсию |
| `-T` | Использовать TCP |
| `-v` | Подробный вывод |

### dig

Более гибкий инструмент с подробным выводом.

```bash
dig example.com                    # запись A
dig -t NS  example.com             # записи NS
dig -t MX  example.com             # записи MX
dig -t SOA example.com             # запись SOA
dig -t ANY example.com             # все записи

dig @8.8.8.8 example.com           # запрос к конкретному серверу
dig -x 217.147.180.162             # обратный запрос PTR
dig +trace example.com             # трассировка от корня
dig +short example.com             # краткий вывод
dig +noall +answer example.com     # только секция ответа
dig @ns.example.com version.bind chaos txt  # запрос версии BIND
```

**Секции вывода dig:**

| Секция | Содержимое |
|---|---|
| `QUESTION` | Что было запрошено |
| `ANSWER` | Ответ на запрос |
| `AUTHORITY` | NS-серверы зоны |
| `ADDITIONAL` | Дополнительная информация (IP для NS-серверов) |
| Statistics | Время запроса, сервер, размер |

**Ключевые опции dig:**

| Опция | Описание |
|---|---|
| `-t type` | Тип записи: A, MX, NS, TXT, ANY… |
| `@server` | Указать DNS-сервер |
| `-x addr` | Обратный запрос (PTR) |
| `+trace` | Трассировка от корня |
| `+short` | Краткий вывод |
| `+norecurse` | Отключить рекурсию |
| `+tcp` | Использовать TCP |
| `+dnssec` | Запросить записи DNSSEC |
| `-4` / `-6` | Только IPv4 / IPv6 |
| `-f file` | Пакетный режим |
| `-k keyfile` | Ключ TSIG |

---

## Шпаргалка для экзамена

### Файлы и пути

```
/etc/named.conf               # основной конфиг BIND (RHEL)
/etc/bind/named.conf          # основной конфиг BIND (Debian/Ubuntu)
/var/named/                   # файлы зон (RHEL/CentOS)
/etc/bind/db.*                # файлы зон (Debian/Ubuntu)
/etc/rndc.key                 # ключ rndc (права: root:bind, 640)
/var/run/named/named.pid      # PID-файл named
/etc/nsswitch.conf            # управляет порядком разрешения имён
```

### Утилиты

```bash
named-checkconf                              # проверить синтаксис named.conf
named-checkconf /etc/bind/named.conf         # нестандартный путь
named-checkzone zone file                    # проверить файл зоны
rndc-confgen                                 # сгенерировать rndc.key
```

### Управление named

```bash
rndc reload                  # перезагрузить конфигурацию и все зоны
rndc reload example.com      # перезагрузить одну зону
rndc flush                   # очистить кэш
rndc status                  # статус сервера
rndc stop                    # остановить

kill -HUP  <PID>             # SIGHUP: перезагрузить конфигурацию
kill -TERM <PID>             # остановить named

systemctl reload  named      # перезагрузить (systemd)
systemctl restart named      # перезапустить (systemd)
service named reload         # перезагрузить (SysV)
```

### Ключевые правила named.conf

| Правило | Примечание |
|---|---|
| Только **1** блок `options` | Иначе синтаксическая ошибка |
| Только **1** блок `logging` | Иначе синтаксическая ошибка |
| `;` — это **не** комментарий | В отличие от файлов зон |
| `@` в зонах | Текущий источник |
| Файлы `include` не проверяются | `named-checkconf` их игнорирует |

### Типы зон

| Тип | Назначение |
|---|---|
| `master` | Первичный авторитетный |
| `slave` | Вторичный авторитетный |
| `hint` | Корневые серверы (зона `"."`) |
| `forward` | Перенаправление запросов |

### Альтернативные серверы (факты для экзамена)

| Сервер | Ключевые факты |
|---|---|
| **dnsmasq** | Лёгкий, DNS+DHCP, локальные сети |
| **djbdns** | Бернштейн, безопасность, Public Domain 2007 |
| **PowerDNS** | GPL, множество бэкендов (MySQL, LDAP…) |
