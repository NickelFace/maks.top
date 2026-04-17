---
title: "LPIC-2 207.2 — Creating and Managing DNS Zones"
date: 2026-01-17
description: "Синтаксис файлов зон, запись SOA, типы ресурсных записей (A/AAAA/PTR/MX/NS/CNAME), прямые и обратные зоны, конфигурация master/slave/stub, делегирование зон, glue-записи, named-checkzone, named-compilezone. Тема экзамена LPIC-2 207.2."
tags: ["Linux", "LPIC-2", "DNS", "BIND", "zones", "SOA"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2/lpic2-207-2-dns-zone-management/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 207.2** — Создание и сопровождение DNS-зон (вес: 3). Охватывает синтаксис файлов зон, записи SOA, типы ресурсных записей, прямые и обратные зоны, конфигурацию master/slave, делегирование зон и инструменты проверки зон.

---

## Типы зон в BIND

Зона определяет область ответственности DNS-сервера. Каждая зона объявляется директивой `zone` в `named.conf`:

| Тип | Описание |
|---|---|
| `master` | Первичный авторитетный сервер зоны |
| `slave` | Вторичный сервер, копирует данные с master |
| `forward` | Перенаправляет запросы по этой зоне на другой сервер |
| `hint` | Список корневых серверов (только для зоны `.`) |
| `redirect` | Отвечает при получении NXDOMAIN |
| `stub` | Как slave, но реплицирует только NS-записи |

---

## Стандартные зоны

### db.local — зона localhost

**Запись в `named.conf`:**

```
zone "localhost" {
    type master;
    file "/etc/bind/db.local";
};
```

**Файл `/etc/bind/db.local`:**

```
$TTL    604800
@   IN  SOA localhost. root.localhost. (
              1         ; Serial
         604800         ; Refresh
          86400         ; Retry
        2419200         ; Expire
         604800 )       ; Negative Cache TTL
;
@   IN  NS      localhost.
@   IN  A       127.0.0.1
```

> `@` = текущий источник = имя зоны из `named.conf` = `localhost`.  
> `root.localhost.` = email администратора `root@localhost` (`.` заменяет `@`).

### db.127 — обратная зона 127.in-addr.arpa

**Запись в `named.conf`:**

```
zone "127.in-addr.arpa" {
    type master;
    file "/etc/bind/db.127";
};
```

**Файл `/etc/bind/db.127`:**

```
$TTL    604800
@   IN  SOA localhost. root.localhost. (
              1         ; Serial
         604800         ; Refresh
          86400         ; Retry
        2419200         ; Expire
         604800 )       ; Negative Cache TTL
;
@       IN  NS      localhost.
1.0.0   IN  PTR     localhost.
```

> **Ключевое правило:** все имена хостов **без завершающей точки** автоматически получают текущий источник в качестве суффикса. `1.0.0` → `1.0.0.127.in-addr.arpa.` (соответствует `127.0.0.1`). Обычные IP-адреса (`127.0.0.1`) суффикс **не** получают.

### db.root — подсказки корневых серверов

**Запись в `named.conf`:**

```
zone "." {
    type hint;
    file "/etc/bind/db.root";    ; Ubuntu
    ; или /var/named/named.ca   ; CentOS/RHEL
};
```

**Фрагмент `db.root`:**

```
.                        3600000  IN  NS    A.ROOT-SERVERS.NET.
A.ROOT-SERVERS.NET.      3600000      A     198.41.0.4
.                        3600000      NS    B.ROOT-SERVERS.NET.
B.ROOT-SERVERS.NET.      3600000      A     128.9.0.107
```

**Обновление файла подсказок:**

```bash
dig @a.root-servers.net . ns > /etc/bind/db.root   # получить текущий список корней
dig @a.root-servers.net . SOA                       # проверить серийный номер SOA
```

> Тип `hint` используется **только** для корневой зоны `.`. Файл не обновляется динамически.

---

## Синтаксис файлов зон

### Директивы

Директивы начинаются с `$`, регистр важен:

| Директива | Синтаксис | Описание |
|---|---|---|
| `$TTL` | `$TTL 86400` | Время жизни записи в кэше по умолчанию |
| `$ORIGIN` | `$ORIGIN example.org.` | Добавляется к именам без завершающей точки |
| `$INCLUDE` | `$INCLUDE filename` | Включает содержимое из другого файла |

**Единицы времени:**

```
604800    ; секунды
7D        ; дни
2H        ; часы
30M       ; минуты
2W        ; недели
```

> Начиная с BIND 8.2 каждый файл зоны **должен** начинаться с `$TTL` (RFC 2308).

### Запись SOA

SOA — **обязательная первая запись** в каждом файле зоны:

```
@  IN  SOA  master-ns.example.org.  admin.example.org. (
    2024031501    ; Serial    — yyyymmddee
         28800    ; Refresh   — как часто slave проверяет master
          3600    ; Retry     — пауза при неудачной проверке
        604800    ; Expiration — когда slave прекращает обслуживание зоны
          3600 )  ; Negative Cache TTL — как долго помнить NXDOMAIN
```

**Пять чисел SOA:**

| # | Название | Рекомендация RFC 1537 | Описание |
|---|---|---|---|
| 1 | **Serial** | формат `yyyymmddee` | Увеличивать при каждом изменении |
| 2 | **Refresh** | 24ч | Как часто slave проверяет master |
| 3 | **Retry** | 2ч | Пауза перед повторной попыткой при неудаче |
| 4 | **Expiration** | 30д | Когда slave прекращает обслуживание зоны |
| 5 | **Negative Cache TTL** | 1ч (3600с) | Как долго кэшировать NXDOMAIN |

**Формат серийного номера:**

```
2024031500  →  15 марта 2024, 1-е изменение (ee=00)
2024031501  →  15 марта 2024, 2-е изменение (ee=01)
2024031600  →  16 марта 2024, 1-е изменение
```

> **Внимание:** Серийный номер **должен** увеличиваться при каждом изменении — иначе slave-серверы не узнают об обновлениях.

### Типы ресурсных записей

| Тип | Описание | RFC |
|---|---|---|
| `A` | IPv4-адрес хоста | 1035 |
| `AAAA` | IPv6-адрес хоста | 1886 |
| `PTR` | Обратное разрешение IP → имя | 1035 |
| `NS` | Авторитетный сервер имён | 1035 |
| `MX` | Почтовый сервер (с приоритетом) | 974, 1035 |
| `CNAME` | Псевдоним (каноническое имя) | 1035 |
| `SOA` | Start of Authority | 1035 |
| `TXT` | Произвольный текст | 1035 |

**Ограничения CNAME в BIND 9:**
- `MX` и `SOA` **не должны** указывать на CNAME
- CNAME **не должен** указывать на другой CNAME
- Только на записи `A`/`AAAA`

**Приоритет MX:** меньшее число = более высокий приоритет (0 = наивысший)

---

## Пример прямой зоны

**Запись в `named.conf`:**

```
zone "example.org" IN {
    type master;
    file "/etc/bind/exampleorg.zone";
};
```

**Файл зоны `/etc/bind/exampleorg.zone`:**

```
$TTL 86400
@      IN  SOA lion.example.org. dnsmaster.lion.example.org. (
           2001110700    ; Serial: yyyymmddee
                28800    ; Refresh
                 3600    ; Retry
               604800    ; Expiration
                86400 )  ; Negative caching TTL
       IN  NS       lion.example.org.
       IN  NS       cat.example.org.

       IN  MX   0   lion.example.org.    ; основной почтовый сервер
       IN  MX  10   cat.example.org.     ; резервный

lion   IN   A       224.123.240.1
       IN  MX   0   lion.example.org.
       IN  MX  10   cat.example.org.

doggy  IN   A       224.123.240.2
cat    IN   A       224.123.240.3
www    IN  CNAME    cat.example.org.     ; псевдоним для cat

bird   IN   A       224.123.240.4
```

> Пустое поле имени слева означает, что текущий источник из предыдущей записи остаётся в силе.

---

## Обратная зона

### Обратная зона IPv4

Преобразует IP → FQDN. Первые три октета **в обратном порядке** + `.in-addr.arpa`.

IP `224.123.240.x` → зона **`240.123.224.in-addr.arpa`**

**Запись в `named.conf`:**

```
zone "240.123.224.in-addr.arpa" IN {
    type master;
    file "/etc/bind/exampleorg.rev";
};
```

**Файл `/etc/bind/exampleorg.rev`:**

```
$TTL 86400
@      IN  SOA lion.example.org. dnsmaster.lion.example.org. (
           2001110700  28800  3600  604800  3600 )
       IN  NS   lion.example.org.
       IN  NS   cat.example.org.

1      IN  PTR  lion.example.org.    ; 224.123.240.1
2      IN  PTR  doggy.example.org.   ; 224.123.240.2
3      IN  PTR  cat.example.org.     ; 224.123.240.3
4      IN  PTR  bird.example.org.    ; 224.123.240.4
```

> **Только последний октет** в записи PTR. FQDN **с завершающей точкой**! `4` + источник `240.123.224.in-addr.arpa.` = `4.240.123.224.in-addr.arpa.`

### Обратная зона IPv6

**Формат IPv6-адреса:**

```
Полный:        2001:0db8:0000:0000:0000:ff00:0042:8329
Сокращённый:   2001:db8::ff00:42:8329   (:: заменяет одну группу нулей)
Петлевой:      ::1
```

**Запись AAAA (прямая зона):**

```
lion   IN   AAAA   2001:db8::ff00:42:8329
```

**Построение PTR для IPv6:**

```
Шаг 1 — полная форма:
  2001:0db8:0000:0000:0000:ff00:0042:8329

Шаг 2 — каждый шестнадцатеричный символ, разделённый точками:
  2.0.0.1.0.d.b.8.0.0.0.0.0.0.0.0.0.0.0.0.f.f.0.0.0.0.4.2.8.3.2.9

Шаг 3 — перевернуть + добавить ip6.arpa:
  9.2.3.8.2.4.0.0.0.0.f.f.0.0.0.0.0.0.0.0.0.0.0.0.8.b.d.0.1.0.0.2.ip6.arpa
```

| | IPv4 | IPv6 |
|---|---|---|
| Домен | `in-addr.arpa` | `ip6.arpa` |
| Формат | Октеты в обратном порядке | Каждый hex-символ, разделённый точками, перевёрнут |

---

## Серверы master и slave

- Каждая зона должна иметь **как минимум один master** и желательно один slave
- Оба являются **авторитетными** для зоны и дают одинаковые ответы
- **Два независимых** сервера: разные сети, разные источники питания
- Данные **всегда берутся** с master; slave **копирует** с master

### Конфигурация master

```
zone "example.org" IN {
    type master;
    file "/etc/bind/exampleorg.zone";
    notify yes;          ; уведомить slave при изменении (по умолчанию)
    allow-update { none; };
};
```

**Как master находит slave-серверы:** смотрит на **NS-записи** зоны. Дополнительные серверы — через `also-notify`.

> Старые версии BIND использовали `primary` вместо `master`.

### Конфигурация slave

```
zone "example.org" IN {
    type slave;
    masters { 224.123.240.1; };    ; IP master-сервера
    file "db.example.org";         ; создаётся автоматически slave-сервером
};
```

- Файл зоны **создаётся самим slave** — не нужно создавать его вручную
- Путь без каталога → записывается в рабочий каталог BIND (`/var/cache/bind` или `/var/named`)
- У BIND должны быть **права на запись**

> Старые версии BIND использовали `secondary` вместо `slave`.

### Stub-зона

Как slave, но реплицирует **только NS-записи**:

```
zone "example.org" IN {
    type stub;
    masters { 224.123.240.1; };
    file "stub.example.org";
};
```

**Назначение:**
- Поддерживать актуальность списка NS-записей дочерней зоны
- Ускорить разрешение имён без обращения к корневым серверам

---

## Делегирование зон

Зона является авторитетной **только если родительская зона делегировала** ей полномочия.

**Пример:** `example.org` делегирует `scripts.example.org`

**Файл дочерней зоны для `scripts.example.org`:**

```
$ORIGIN scripts.example.org.

ctl  IN  A     224.123.240.16
     IN  MX  0  ctl
     IN  MX 10  lion.example.org.
www  IN  CNAME  ctl

perl IN  A     224.123.240.17
bash IN  A     224.123.240.18
sh   IN  CNAME  bash
```

**Делегирование в родительской зоне `example.org`:**

```
; NS-записи выполняют само делегирование
scripts  2d IN NS ctl.scripts.example.org.
         2d IN NS bash.scripts.example.org.

; Glue-записи — ОБЯЗАТЕЛЬНЫ для нахождения серверов
ctl.scripts.example.org.   2d IN A 224.123.240.16
bash.scripts.example.org.  2d IN A 224.123.240.18
```

> **Glue-записи** обязательны, потому что серверы `ctl` и `bash` находятся **внутри** делегируемой зоны. Без A-записей в родительской зоне их невозможно найти.

---

## Инструменты проверки зон

### named-checkzone

```bash
named-checkzone example.org /etc/bind/exampleorg.zone
# zone example.org/IN: loaded serial 0
# OK

named-checkzone 240.123.224.in-addr.arpa /etc/bind/exampleorg.rev

# Завершающая точка необязательна — оба варианта допустимы
named-checkzone example.org  /etc/bind/exampleorg.zone
named-checkzone example.org. /etc/bind/exampleorg.zone
```

Ошибки `ignoring out-of-zone data` или `has 0 SOA records` означают, что в команде указано неправильное имя домена.

### named-compilezone

Начиная с BIND 9.9 slave-серверы по умолчанию сохраняют зоны в **бинарном формате**:

```bash
# Бинарный → текстовый
named-compilezone -f raw -F text -o zone.txt example.org zone.raw

# Текстовый → бинарный
named-compilezone -f text -F raw -o zone.raw example.org zone.txt
```

Чтобы slave сохранял зоны в **текстовом** формате, добавьте в `named.conf`:

```
zone "example.org" IN {
    type slave;
    masters { 224.123.240.1; };
    file "db.example.org";
    masterfile-format text;
};
```

---

## DNS-утилиты

### dig

Основной инструмент диагностики DNS. Вывод близок к формату файла зоны.

```bash
dig bird.example.org A               # запись A
dig example.org MX                   # записи MX
dig example.org NS                   # записи NS
dig example.org SOA                  # запись SOA
dig @cat.example.org bird.example.org A   # запрос к конкретному серверу
dig @192.168.0.101 +short example.org

dig 4.240.123.224.in-addr.arpa PTR   # явный запрос PTR
dig -x 224.123.240.4                 # автоматически строит in-addr.arpa

dig +short example.org               # только IP
dig +short +identify example.org     # IP + какой сервер ответил
dig example.org | grep status        # NOERROR / NXDOMAIN / REFUSED
dig example.org | grep "Query time"  # время запроса
```

**Секции вывода:**

```
;; ANSWER SECTION:
bird.example.org.    1D IN A    224.123.240.4    ← ответ

;; AUTHORITY SECTION:
example.org.         1D IN NS   lion.example.org. ← авторитетный сервер

;; ADDITIONAL SECTION:
lion.example.org.    1D IN A    224.123.240.1     ← glue-запись
```

> Если вместо записи A возвращается SOA → домен существует, но **хост не найден**.

**Внимание — отсутствующая завершающая точка в записях PTR:**

```
; Неверно:
4  IN  PTR  lion.example.org    ; к имени добавится источник — ОШИБКА!

; Верно:
4  IN  PTR  lion.example.org.   ; завершающая точка обязательна
```

### host

Простой и краткий вывод. Особенно удобен для обратных запросов.

```bash
host bird.example.org               # прямой запрос
host 224.123.240.4                  # обратный запрос
host 4.240.123.224.in-addr.arpa     # явный PTR
host -t MX example.org              # записи MX
host -t NS example.org              # записи NS
```

### nslookup

**Устарел** — используйте `dig` и `host`. Всё ещё встречается на экзамене.

```bash
nslookup example.org
nslookup -type=MX example.org
nslookup -type=NS example.org
nslookup 224.123.240.4              # обратный запрос

nslookup                            # интерактивный режим
> ls -d example.org.               # передача зоны (формат файла зоны)
> help                             # список команд
```

### dnswalk

Отладчик DNS. Выполняет передачу зоны и проверяет её согласованность.

```bash
dnswalk zoneedit.com.
# WARN: zoneedit.com A 64.85.73.107: no PTR record
# 0 failures, 15 warnings, 0 errors.
```

> Используйте с осторожностью — пытается выполнить передачу зоны со всех серверов.

---

## Шпаргалка для экзамена

### Расположение файлов

| Файл/Каталог | Назначение | Дистрибутив |
|---|---|---|
| `/etc/named.conf` | Основной конфиг BIND | CentOS/RHEL |
| `/etc/bind/named.conf` | Основной конфиг BIND | Ubuntu/Debian |
| `/etc/bind/named.conf.local` | Пользовательские зоны | Ubuntu |
| `/etc/bind/named.conf.default-zones` | Зоны по умолчанию | Ubuntu |
| `/etc/named.rfc1912.zones` | Зоны по умолчанию | CentOS |
| `/var/named/*.zone` | Файлы базы данных зон | CentOS |
| `/etc/bind/db.*` | Файлы базы данных зон | Ubuntu |
| `/var/named/named.ca` | Корневые серверы (hints) | CentOS |
| `/etc/bind/db.root` | Корневые серверы (hints) | Ubuntu |
| `/var/cache/bind/` | Рабочий каталог BIND | Ubuntu |
| `/var/named/` | Рабочий каталог BIND | CentOS |

### Быстрые факты

```
@ = текущий источник = имя зоны из named.conf

FQDN должен заканчиваться точкой:
  example.org.   ← абсолютное (есть завершающая точка)
  example.org    ← относительное (к нему добавится источник)

Обратная зона IPv4:
  192.168.64.x → 64.168.192.in-addr.arpa

Обратная зона IPv6:
  2001:db8::... → ...ip6.arpa (каждый hex-символ, разделённый точками, перевёрнут)

Приоритет MX: МЕНЬШЕ = ВАЖНЕЕ (0 = наивысший)

SOA Serial: формат yyyymmddee, ДОЛЖЕН увеличиваться при каждом изменении

Тип hint: ТОЛЬКО для корневой зоны "."

CNAME запрещён: как цель MX/SOA, указывающий на другой CNAME
```

### SOA — пять чисел

```
@  IN  SOA  ns1.example.org.  admin.example.org. (
    2024031501    ; 1. Serial    — увеличивать при изменении (yyyymmddee)
         86400    ; 2. Refresh   — slave проверяет master (рек: 24ч)
          3600    ; 3. Retry     — повторная попытка при неудаче (рек: 2ч)
        604800    ; 4. Expire    — slave прекращает обслуживание зоны (рек: 30д)
          3600 )  ; 5. Neg.Cache — время кэширования NXDOMAIN (рек: 1ч)
```

### Типичные ошибки

| Ошибка | Последствие |
|---|---|
| Нет завершающей точки в FQDN в записи PTR | К имени добавится источник → неверное имя |
| Серийный номер SOA не увеличен | Slave не подхватит изменения |
| CNAME указывает на CNAME | Нарушение стандарта BIND 9 |
| MX/SOA указывает на CNAME | Запрещено RFC |
| Нет glue-записей при делегировании | Невозможно найти NS-серверы дочерней зоны |
