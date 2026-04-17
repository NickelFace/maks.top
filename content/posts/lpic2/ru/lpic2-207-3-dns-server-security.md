---
title: "LPIC-2 207.3 — DNS Server Security"
date: 2026-01-25
description: "Безопасность BIND: скрытие версии, ACL, allow-query/allow-transfer, непривилегированный пользователь, chroot-окружение, split DNS, транзакционные подписи TSIG, DNSSEC (ZSK/KSK, RRSIG/NSEC/NSEC3/DS), записи DANE/TLSA. Тема экзамена LPIC-2 207.3."
tags: ["Linux", "LPIC-2", "DNS", "BIND", "DNSSEC", "TSIG", "security"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2/lpic2-207-3-dns-server-security/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 207.3** — Защита DNS-сервера (вес: 2). Охватывает стратегии безопасности BIND, chroot-окружение, конфигурацию split DNS, аутентификацию передачи зон с помощью TSIG, подпись записей DNSSEC и привязку сертификатов DANE.

---

## Стратегии безопасности DNS

> Принцип «безопасность через неизвестность» не обеспечивает абсолютной защиты, но увеличивает время, необходимое для обнаружения атаки.

### Скрытие версии BIND

Как злоумышленник проверяет версию:

```bash
dig @target chaos version.bind txt
```

Скрыть в `named.conf`:

```
options {
    version "hidden";
};
```

### ACL

```
acl "trusted" {
    localhost;
    192.168.1.0/24;
};
```

> Метки ACL: обновите в одном месте — изменение применится везде.

### Ограничение запросов (allow-query)

```
options {
    allow-query { trusted; };
};

// Или для конкретной зоны:
zone "example.com" IN {
    allow-query { 192.168.1.0/24; };
};
```

### Ограничение передачи зон (allow-transfer)

**Опасность открытой передачи зон:**

```bash
dig axfr @ns.example.com example.com
# Раскрывает ВСЮ инфраструктуру: VPN, офисы, внутренние хосты
host -l example.com ns.example.com
# То же самое, другой формат
```

**Правильная конфигурация:**

```
// Глобально запретить
options {
    allow-transfer { none; };
};

// Разрешить только slave-серверам
acl "my_slave_servers" {
    10.0.1.2;
    10.0.1.3;
};

zone "example.org" IN {
    type master;
    allow-transfer { my_slave_servers; };
};

// На slave — всегда запрещать дальнейшие передачи
zone "example.org" IN {
    type slave;
    allow-transfer { none; };
};
```

> **Внимание:** Не забудьте таким же образом защитить **обратную зону**!

### Ограничение динамических обновлений

```
zone "example.com" IN {
    allow-update { none; };               // запретить всем
    allow-update-forwarding { none; };    // запретить через slave
    allow-notify { 192.168.0.104; };      // только master отправляет NOTIFY
};
```

---

## Запуск BIND от непривилегированного пользователя

**Проблема:** BIND может по умолчанию работать от `root`. При компрометации злоумышленник получает полный доступ к системе.

**Почему не `nobody`?** Многие другие службы уже работают от `nobody` — возможно нежелательное взаимодействие.

**Решение:** создать выделенного пользователя `named`.

```bash
# Ручной запуск
named -u named -g named

# Debian (/etc/init.d/bind):
start-stop-daemon ... --exec /usr/sbin/named -- -u named -g named
# -- отделяет опции start-stop-daemon от опций named

# Red Hat/CentOS (уже настроено по умолчанию):
systemctl status named
# Process: ExecStart=/usr/sbin/named -u named

# Автозапуск (Red Hat):
chkconfig named on
```

Проверить права на каталог зон:

```bash
ls -l /var/named
# drwxrwx---. named named  data/
# -rw-rw----. root  named  named.ca
```

> **Внимание:** Убедитесь, что у `named` есть право **записи** в каталог, указанный в параметре `directory` в `named.conf`.

---

## Chroot-окружение для BIND

Chroot изолирует процесс: указанный каталог становится корневым `/`. Процесс не может выйти за его пределы.

### Подготовка chroot-окружения

Новый корень: `/var/cache/bind`

```bash
# 1. Создать /dev/null
mknod -m 666 /var/cache/bind/dev/null c 1 3

# 2. Скопировать файлы пользователей
cd /var/cache/bind/etc
cp -p /etc/{passwd,group} .
cp /etc/ld.so.cache .
cp /etc/localtime .

# 3. Найти необходимые библиотеки
ldd /usr/sbin/named
# libc.so.6 => /lib/libc.so.6

# 4. Скопировать библиотеки (симлинки + реальные файлы)
cd /var/cache/bind/lib
cp -pd /lib/{libc.so.6,libc-2.1.3.so,ld-linux.so.2,ld-2.1.3.so} .

# 5. Скопировать бинарные файлы BIND
cp -p /usr/sbin/named{,-xfer} /var/cache/bind/usr/sbin
cp -p /usr/sbin/rndc /var/cache/bind/usr/sbin
```

### Структура chroot-окружения:

```
/var/cache/bind/          ← новый корень (/)
├── dev/null
├── etc/
│   ├── passwd            ← копия с пользователем named
│   ├── group
│   ├── ld.so.cache
│   ├── localtime
│   └── bind/
│       ├── named.conf
│       └── example.com.zone
├── lib/                  ← библиотеки BIND
├── usr/sbin/
│   ├── named
│   ├── named-xfer
│   └── rndc
└── var/cache/bind/
    └── bind.log
```

> Все пути в `named.conf` указываются **относительно нового корня**, без префикса `/var/cache/bind`.

### Запуск BIND в chroot

```bash
# Из командной строки
named -t /var/cache/bind

# Debian
start-stop-daemon ... --exec /usr/sbin/named -- -t /var/cache/bind

# Red Hat
daemon ... /sbin/named -t /var/cache/bind

# Использование пакета bind-chroot (CentOS/RHEL — проще):
yum install bind-chroot
/usr/libexec/setup-named-chroot.sh /var/named/chroot on
systemctl stop named && systemctl disable named
systemctl start named-chroot && systemctl enable named-chroot
# Файлы зон теперь в: /var/named/chroot/var/named/
```

> BIND входит в chroot **сразу после разбора аргументов**, до чтения конфигурации.

### Журналирование в chroot

Стандартный syslog не работает — нет доступа к `/dev/log`. Используйте файл:

```
logging {
    channel some_log {
        file "bind.log" versions 3;
        severity info;
    };
    category default { some_log; };
};
// Журнал: /var/cache/bind/bind.log
```

### Комбинирование chroot + непривилегированный пользователь

```bash
named -u named -g named -t /var/cache/bind
```

**Последовательность запуска BIND:**

1. Разбор аргументов командной строки
2. **chroot** (вход в окружение)
3. Запись PID-файла (ещё от root)
4. **Смена пользователя** на `named`

> Пользователь `named` должен существовать в **копии** `/etc/passwd` внутри chroot. Вне окружения его наличие не обязательно.

---

## Split DNS

Используется для: различных ответов внутренним и внешним клиентам; изоляции внутренних зон от интернета.

### Два сервера на разных хостах

```
Интернет ← [liongate 192.168.72.1] ← forwarders → [privdns 192.168.72.2]
              видимый сервер                         внутренний master
```

**`named.conf` на privdns (внутренний master):**

```
// Внутренний корень — только для себя
zone "." IN {
    type master;
    file "/etc/bind/internal.root.zone";
    allow-transfer { none; };
    allow-query    { none; };
};

// Внутренняя зона — только для liongate
zone "exworks" IN {
    type master;
    file "/etc/bind/exworks.zone";
    allow-transfer { none; };
    allow-query    { 192.168.72.1; };
};

options {
    recursion no;
    fetch-glue no;
};
// НЕ включать zone "." type hint!
```

**`named.conf` на liongate (форвардер):**

```
options {
    forwarders {
        192.168.72.2;    // privdns — первый (внутренний)
        224.121.121.99;  // DNS провайдера — для внешних
    };
};
```

### Два сервера на одном хосте

Когда отдельный хост недоступен — оба сервера на `liongate`:

```
[liongate]
├── Внутренний (chroot, порт 5353, пользователь inamed)
│   master для ".", "exworks", обратной зоны
└── Видимый (порт 53, пользователь vnamed)
    slave для "exworks" + forwarders → провайдер
```

**`named.conf` внутреннего сервера:**

```
options {
    directory "/var/cache/bind";
    listen-on port 5353 { 127.0.0.1; };
    recursion no;
    fetch-glue no;
};

zone "exworks" IN {
    type master;
    file "/etc/bind/exworks.zone";
    allow-transfer { 127.0.0.1; };  // только видимый сервер
    allow-query    { 127.0.0.1; };
};
```

**`named.conf` видимого сервера:**

```
options {
    directory "/var/cache/bindVisible";
    forwarders { 224.121.121.99; };  // провайдер для внешних запросов
};

zone "exworks" IN {
    type slave;
    masters port 5353 { 127.0.0.1; };  // master на нестандартном порту
    file "exworks.slave";
    allow-transfer { none; };
    allow-query    { 127.0.0.1; 192.168.72.0/24; };
};
```

> **Проблема NOTIFY:** `also-notify` не поддерживает номера портов. При изменении зоны перезапускайте видимый сервер вручную.

---

## TSIG — транзакционные подписи

TSIG (Transaction SIGnatures) защищает **канал связи между серверами** для передачи зон. Использует общий секрет + HMAC.

**Применяется для:** передачи зон, динамических обновлений, NOTIFY, рекурсивных запросов.

### Генерация ключа

```bash
# На master-сервере:
dnssec-keygen -a HMAC-SHA512 -b 512 -n HOST -r /dev/urandom mykey
# Создаёт: Kmykey.+165+XXXXX.key  и  Kmykey.+165+XXXXX.private
# Для HMAC — оба файла содержат ОДИНАКОВЫЙ ключ

# Не используйте HMAC-MD5 — устарел!
# Рекомендуется: HMAC-SHA256 или HMAC-SHA512
```

### Настройка master-сервера

**Создать `/etc/bind/tsig.key`:**

```
key "TRANSFER" {
    algorithm hmac-sha512;
    secret "XIQDYlGaIbWfyopYHS1vtFr...KJQ==";
};

# Slave-сервер 1
server 10.0.1.2 {
    keys { TRANSFER; };
};

# Slave-сервер 2
server 10.0.1.3 {
    keys { TRANSFER; };
};
```

**Включить в `named.conf`:**

```
include "/etc/bind/tsig.key";
```

**Перезагрузить и проверить:**

```bash
rndc reload
rndc tsig-list   # список активных TSIG-ключей
```

**Ограничить передачу зоны ключом:**

```
zone "example.com" {
    type master;
    file "example.com.zone";
    allow-transfer { key TRANSFER; };
};
```

### Настройка slave-сервера

Тот же файл `tsig.key`, тот же секрет, но `server` указывает на **master**:

```
key "TRANSFER" {
    algorithm hmac-sha512;
    secret "XIQDYlGaIbWfyopYHS1vtFr...KJQ==";  // тот же!
};

# Master-сервер
server 10.0.1.1 {
    keys { TRANSFER; };
};
```

Затем `include` в `named.conf` и `rndc reload`.

> **Внимание:** Файл ключа должен быть доступен только процессу named. Не вводите ключ вручную — скопируйте его из файла `.private`!

---

## DNSSEC — расширения безопасности DNS

DNSSEC защищает от **подмены DNS-ответов** (отравление кэша) с помощью цифровых подписей записей.

### Как это работает

```
Корневые серверы (.) ← якорь доверия (с 6 мая 2010)
    ↓ подписывают KSK дочерней зоны
Серверы .com / .ru / .nl
    ↓ подписывают KSK
Серверы example.com
    ↓ ZSK подписывает записи зоны
Клиент проверяет цепочку снизу вверх
```

Открытый ключ `example.com` публикуется на серверах родительской зоны `.com`.

### Типы записей DNSSEC

| Запись | Назначение |
|---|---|
| `DNSKEY` | Открытый ключ зоны (ZSK или KSK) |
| `RRSIG` | Цифровая подпись набора записей |
| `NSEC` | Доказательство несуществования имени |
| `NSEC3` | То же, но хэшированное (защита от перебора зоны) |
| `DS` | Хэш DNSKEY в родительской зоне |

**NSEC против NSEC3:**
- `NSEC`: уязвим для обхода зоны — раскрывает следующее имя
- `NSEC3`: возвращает **хэш** следующего имени — перебор требует брутфорса

### dnssec-keygen и dnssec-signzone

**Опции `dnssec-keygen`:**

| Опция | Назначение | Значения |
|---|---|---|
| `-a` | Алгоритм | `RSASHA256`, `RSASHA1`, `DSA`, `HMAC-MD5`, `HMAC-SHA512` |
| `-b` | Размер ключа | RSA: 512–4096; DSA: 512–1024 (×64); HMAC-MD5: 1–512 |
| `-n` | Тип имени | `ZONE`, `HOST`, `ENTITY`, `USER`, `OTHER` |
| `-f KSK` | Сгенерировать KSK | — |
| `-r` | Источник случайности | `/dev/urandom` (рекомендуется) |

```bash
# ZSK для зоны
dnssec-keygen -a RSASHA256 -b 1024 -n ZONE example.com
# Создаёт: Kexample.com.+008+XXXXX.key  и  .private

# KSK для зоны
dnssec-keygen -a RSASHA256 -b 2048 -f KSK -n ZONE example.com

# Ключ TSIG (симметричный)
dnssec-keygen -a HMAC-SHA512 -b 512 -n HOST mykey
```

**Формат имени файла:** `K` + имя + `+` + номер алгоритма + `+` + отпечаток + `.key/.private`

```bash
# Подписать зону
dnssec-signzone -K /path/to/keys -o example.com example.com.zone
# Создаёт: example.com.zone.signed (с записями RRSIG)

# Загрузить ключи вручную
rndc loadkeys example.com
```

**Автоматическая подпись (`named.conf`):**

```
zone "example.com" {
    type master;
    file "example.com.zone";
    auto-dnssec maintain;
    inline-signing yes;
    key-directory "/etc/bind/keys";
};
```

### Другие утилиты DNSSEC

| Утилита | Назначение |
|---|---|
| `dnssec-verify` | Проверить подписанную зону |
| `dnssec-checkds` | Проверить записи DS |
| `dnssec-coverage` | Проверить охват ключами |
| `dnssec-dsfromkey` | Сгенерировать DS из DNSKEY |
| `dnssec-settime` | Управлять временными метками ключей |
| `dnssec-revoke` | Отозвать ключ |

> **Внимание:** DNSSEC **не** защищает передачу зон и динамические обновления — для этого используйте TSIG.

---

## DANE — аутентификация именованных объектов на основе DNS

**Проблема с удостоверяющими центрами:** браузеры доверяют любому из 1000+ удостоверяющих центров. Компрометация одного УЦ катастрофична.

**Пример — DigiNotar (2011):** злоумышленники сгенерировали поддельные сертификаты для крупных сайтов. Браузеры принимали их как действительные. DigiNotar обанкротился в течение нескольких недель.

**DANE** использует DNSSEC для привязки TLS-сертификатов к DNS-именам через **записи TLSA**.

**Синтаксис записи TLSA:**

```
_443._tcp.www.example.com. IN TLSA 0 0 1 <hash>
# _порт._протокол.имя_сервера
```

**Три поля (читаются справа налево):**

| Поле | Позиция | Значение | Описание |
|---|---|---|---|
| Matching Type | 3-е | `0` | Данные без хэширования |
| | | `1` | SHA-256 ✓ |
| | | `2` | SHA-512 |
| Selector | 2-е | `0` | Полный сертификат |
| | | `1` | Только открытый ключ |
| Certificate Usage | 1-е | `0` PKIX-TA | Публичный УЦ (X.509) |
| | | `1` PKIX-EE | Конечный сертификат (X.509) |
| | | `2` DANE-TA | Частный УЦ |
| | | `3` DANE-EE | Конечный объект без УЦ ← **максимальная польза** |

> При значении `3` DANE полностью устраняет зависимость от сторонних УЦ. Требует работающего DNSSEC.

---

## Шпаргалка для экзамена

### Директивы безопасности

| Директива | Где | Назначение |
|---|---|---|
| `version "hidden"` | `options` | Скрыть версию BIND |
| `allow-query` | `options`, `zone` | Кто может делать запросы |
| `allow-transfer` | `options`, `zone` | Кто может получить передачу зоны |
| `allow-update` | `zone` | Кто может делать динамические обновления |
| `allow-update-forwarding` | `zone` | Обновления через slave |
| `allow-notify` | `zone` | Кто отправляет сообщения NOTIFY |
| `allow-recursion` | `options` | Кому разрешена рекурсия |
| `recursion no` | `options` | Отключить рекурсию глобально |
| `forwarders` | `options` | Вышестоящие серверы |
| `heartbeat-interval 0` + `dialup yes` | `options` | Отключить WAN-соединения |

### Ключевые команды

```bash
# Скрытие версии BIND (проверка злоумышленником)
dig @server chaos version.bind txt

# Передача зоны (должна быть заблокирована)
dig axfr @server zonename
host -l zonename nameserver

# Генерация ключа TSIG
dnssec-keygen -a HMAC-SHA512 -b 512 -n HOST keyname

# Генерация ZSK
dnssec-keygen -a RSASHA256 -b 1024 -n ZONE example.com

# Генерация KSK
dnssec-keygen -a RSASHA256 -b 2048 -f KSK -n ZONE example.com

# Подписать зону
dnssec-signzone -K /keys -o example.com example.com.zone

# Запустить BIND в chroot от непривилегированного пользователя
named -u named -g named -t /var/cache/bind
```

### Сравнение методов защиты

| Метод | Защищает от | Файлы / Утилиты |
|---|---|---|
| Непривилегированный пользователь | Повышения привилегий | `-u named`, `/etc/passwd` |
| Chroot-окружение | Компрометации системы | `-t /var/cache/bind` |
| ACL + allow-* | Несанкционированного доступа | `named.conf` |
| TSIG | Подмены IP при передачах | `dnssec-keygen`, `key {}` |
| DNSSEC | Подмены DNS-ответов | `dnssec-keygen`, `dnssec-signzone` |
| DANE | Компрометации УЦ | Записи TLSA + DNSSEC |
| Split DNS | Утечки внутренней инфраструктуры | `view {}`, `forwarders {}` |

### Алгоритмы (факты для экзамена)

| Алгоритм | Тип | Применение | Статус |
|---|---|---|---|
| `HMAC-MD5` | Симметричный | TSIG | Устарел |
| `HMAC-SHA256` | Симметричный | TSIG | Рекомендуется |
| `HMAC-SHA512` | Симметричный | TSIG | Рекомендуется |
| `RSASHA1` | Асимметричный | DNSSEC | Устаревает |
| `RSASHA256` | Асимметричный | DNSSEC | Рекомендуется |
| `DSA` | Асимметричный | DNSSEC | Устаревает |

### Быстрые вопросы и ответы

**В:** Как запустить BIND от пользователя named в chroot `/var/cache/bind`?  
**О:** `named -u named -g named -t /var/cache/bind`

**В:** Какая утилита генерирует и ключи TSIG, и ключи DNSSEC?  
**О:** `dnssec-keygen`

**В:** Что нужно сделать на slave при настройке TSIG?  
**О:** Создать `tsig.key` с **тем же** секретом, но `server` указывает на **master**

**В:** Чем TSIG отличается от DNSSEC?  
**О:** TSIG — точка-точка между серверами (передачи, обновления); DNSSEC — сквозное до клиента (подлинность ответов)

**В:** Какое значение Certificate Usage в TLSA даёт максимальную пользу от DANE?  
**О:** `3` (DANE-EE) — нет зависимости ни от какого УЦ

**В:** Почему на slave нужен `allow-transfer { none; }`?  
**О:** Slave не должен перераспределять данные дальше — он только получает от master

**В:** Что такое NSEC3 и зачем он нужен?  
**О:** NSEC3 возвращает хэш следующего имени вместо самого имени — защищает от обхода зоны (перебора)
