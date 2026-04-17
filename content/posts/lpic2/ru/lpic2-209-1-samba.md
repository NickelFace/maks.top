---
title: "LPIC-2 209.1 — Samba Server Configuration"
date: 2026-03-10
description: "Демоны Samba (smbd/nmbd/winbindd), структура smb.conf, глобальные директивы, настройка общих ресурсов, уровни безопасности, бэкенды passdb, ACL, сопоставление имён пользователей, монтирование CIFS-ресурсов, WINS, присоединение к домену AD. Тема экзамена LPIC-2 209.1."
tags: ["Linux", "LPIC-2", "Samba", "SMB", "CIFS", "Winbind", "Active Directory", "file sharing"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2/lpic2-209-1-samba/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 209.1** — Конфигурация сервера Samba (вес: 5). Охватывает настройку Samba как автономного сервера файлов/печати или сервера-участника AD, управление доступом, управление пользователями и монтирование SMB-ресурсов.

---

## Что такое Samba

Samba реализует протокол **SMB (Server Message Block)** — протокол Microsoft для совместного использования файлов и принтеров. Установка Samba на Linux позволяет системам Windows (и любым SMB-совместимым клиентам) обращаться к ресурсам Linux. Общие ресурсы называются **shares** (общие ресурсы) или **services** (службы).

Samba работает в двух основных режимах:
- **Автономный сервер** — независимый, без домена
- **Сервер-участник** — участник домена Windows Active Directory

---

## Демоны Samba

| Демон | Назначение |
|---|---|
| `smbd` | Управляет SMB-ресурсами, блокировкой файлов, аутентификацией пользователей. Всегда запущен на сервере. |
| `nmbd` | Обрабатывает запросы имён NetBIOS и WINS. Нужен в устаревших смешанных средах. |
| `winbindd` | Связывает Linux с контроллером домена Windows. Требуется для интеграции с AD или доменом NT4. |

```bash
systemctl start smbd nmbd
systemctl enable smbd nmbd
systemctl status smbd
```

> На контроллере домена AD НЕ запускайте `smbd` отдельно. Для серверов-участников или автономных серверов: запускайте `smbd`, `nmbd`, `winbindd`. Служба `samba` (не `smbd`) предназначена только для AD DC.

---

## Файлы конфигурации

| Файл | Назначение |
|---|---|
| `/etc/samba/smb.conf` | Основная конфигурация Samba |
| `/etc/samba/smbpasswd` | База данных паролей (устаревший бэкенд) |
| `/etc/samba/lmhosts` | Файл хостов NetBIOS |
| `/var/log/samba/` | Директория логов |
| `/var/log/samba/log.smbd` | Логи демона SMB |
| `/var/log/samba/log.nmbd` | Логи демона NetBIOS |
| `/var/log/samba/log.%m` | Лог для каждого клиента (`%m` = NetBIOS-имя клиента) |

---

## Структура smb.conf

`smb.conf` разделён на секции. Названия секций заключены в квадратные скобки (без учёта регистра). Комментарии начинаются с `#` или `;`.

| Секция | Назначение |
|---|---|
| `[global]` | Глобальные параметры сервера (сеть, логирование, безопасность) |
| `[homes]` | Автоматически создаёт ресурс домашней директории для каждого пользователя |
| `[printers]` | Доступ ко всем принтерам сервера без отдельных секций для каждого принтера |
| `[netlogon]` | Директивы DC для ответов на запросы аутентификации домена |
| `[profiles]` | Перемещаемые профили пользователей |
| `[share-name]` | Любой пользовательский общий ресурс |

---

## Глобальные директивы

```ini
[global]
    workgroup = FIREFLYGROUP         # Workgroup or domain name (not FQDN, uppercase)
    server string = Samba Server %v  # Server description
    netbios name = MYSERVER          # NetBIOS name (default = hostname)
    netbios aliases = MYALIAS        # Additional NetBIOS names
    realm = EXAMPLE.COM              # Kerberos realm for AD (uppercase only)
    interfaces = enp0s*              # Interfaces for Samba
    hosts allow = 192.168.1.0/24    # Allowed hosts (CIDR, hostname, space/comma-separated)
    hosts deny = 192.168.1.99       # Denied hosts
    disable netbios = no             # Disable NetBIOS (yes = nmbd won't start)
    wins support = no                # Enable WINS server (yes = act as WINS)
    smb ports = 445 139              # SMB ports
    log file = /var/log/samba/log.%m # Log file path
    max log size = 50                # Max log size (KB)
    security = user                  # Security level
    passdb backend = tdbsam          # Password storage backend
    username map = /etc/samba/username.map
    encrypt passwords = yes
    unix password sync = yes
    guest ok = no
    map to guest = Bad User          # Never / Bad User / Bad Password
```

> `workgroup` должен содержать имя рабочей группы или домена Windows — не FQDN. Иначе системы Windows не найдут сервер в сетевом окружении.

> `%m` в пути к файлу лога подставляет NetBIOS-имя клиента — каждый клиент получает свой файл лога.

---

## Макросы smb.conf

Samba поддерживает макросы, динамически подставляемые при каждом подключении:

| Макрос | Подставляет |
|---|---|
| `%S` | Текущее имя службы (ресурса) |
| `%U` | Имя пользователя сессии |
| `%G` | Основная группа пользователя сессии |
| `%u` | Пользователь текущей службы |
| `%g` | Основная группа пользователя текущей службы |
| `%H` | Домашняя директория `%u` |
| `%L` | NetBIOS-имя сервера |
| `%m` | NetBIOS-имя клиентской машины |
| `%M` | DNS-имя клиентской машины |
| `%I` | IP-адрес клиента |
| `%h` | Имя хоста сервера (DNS) |
| `%v` | Версия Samba |

```ini
server string = Linux Samba Server %L
log file = /var/log/samba/log.%m
path = /home/%S          # In [homes]: %S expands to username
```

> В секции `[homes]` `%S` раскрывается до имени запрошенной службы — то есть имени пользователя. Таким образом `path = /home/%S` даёт каждому пользователю его собственную директорию.

---

## Конфигурация общего ресурса

```ini
[ssharea]
    comment = Server Share A
    path = /srv/ssharea
    browseable = yes          # visible in share list
    public = no               # yes = no password; no = password required
    writable = yes            # equivalent to: read only = no
    read only = no            # antonym of writable
    valid users = alice bob @group   # allowed users/groups
    invalid users = baduser          # denied users (overrides valid users)
    write list = alice               # can write even if share is read-only
    guest ok = no
    create mask = 0644
    directory mask = 0755
    printable = no
    hosts allow = 192.168.2.0/24
    hosts deny = 192.168.2.99
```

### Секция [homes] — домашние директории:

```ini
[homes]
    comment = Home Directories
    path = /home/%S    # %S = username
    browseable = no    # hide from share list
    writable = yes
```

```bash
smbclient //sambaserver/alice -U alice   # access via username
smbclient //sambaserver/homes -U alice   # access via [homes] section
```

---

## Уровни безопасности

### Безопасность на уровне пользователя (рекомендуется):

| Режим | Директива | Описание |
|---|---|---|
| Автономный | `security = user` | Локальная база паролей на сервере |
| Участник AD | `security = ads` | Участник Active Directory |
| Домен NT4 | `security = domain` | Проверка через NT4 PDC/BDC |

### Безопасность на уровне ресурса (устарело):

```ini
security = share
```

Каждый ресурс защищён паролем, не привязанным к пользователю. Удалено в Samba 4. Знайте как концепцию для экзамена.

---

## Бэкенды паролей (passdb backend)

| Бэкенд | Описание |
|---|---|
| `smbpasswd` | Текстовый файл. Устарел. Нет масштабирования, нет Windows-атрибутов. |
| `tdbsam` | Локальная TDB-база данных. Хранит Windows-атрибуты. Рекомендован для автономных серверов до ~250 пользователей. |
| `ldapsam` | LDAP-бэкенд. Необходим для крупных окружений. |

```ini
passdb backend = tdbsam
# or with explicit path:
passdb backend = tdbsam:/etc/samba/private/passdb.tdb
passdb backend = smbpasswd:/etc/samba/smbpasswd
passdb backend = ldapsam:ldap://localhost
```

---

## Утилиты Samba

| Команда | Назначение |
|---|---|
| `testparm` | Проверить синтаксис `smb.conf` |
| `testparm -s` | Вывести конфиг без запроса (для скриптов) |
| `testparm -v` | Показать все параметры, включая значения по умолчанию |
| `smbstatus` | Показать текущие подключения и блокировки файлов |
| `smbpasswd -a username` | Добавить пользователя в базу данных Samba |
| `smbpasswd -x username` | Удалить пользователя из базы данных |
| `pdbedit -L` | Список пользователей Samba |
| `pdbedit -L -v` | Подробный список пользователей |
| `nmblookup hostname` | Разрешить NetBIOS-имя в IP |
| `nmblookup -M workgroup` | Найти мастер-браузер |
| `smbclient -L //server -U user` | Список ресурсов на сервере |
| `smbclient //server/share -U user` | Подключиться к ресурсу |
| `net -S server -U user share` | Список ресурсов через net |
| `net ads join -U admin` | Присоединиться к домену AD |
| `net ads leave -U admin` | Покинуть домен AD |
| `net ads info` | Информация о домене AD |
| `net rpc join -U admin` | Присоединиться к домену NT4 |
| `wbinfo --ping-dc` | Проверить подключение winbind к DC |
| `wbinfo -u` | Список пользователей домена |
| `wbinfo -g` | Список групп домена |
| `smbd -b \| grep CONFIGFILE` | Найти путь к smb.conf |
| `samba-tool` | Инструмент администрирования Samba 4 (главным образом для AD DC) |

---

## Монтирование ресурсов Samba на Linux

### Современный метод (cifs):

```bash
mount -t cifs //server/sharename /mnt/point \
  -o username=alice,password=secret

# Better: use credentials file
mount -t cifs //server/sharename /mnt/point \
  -o credentials=/etc/samba/credentials
```

`/etc/samba/credentials`:
```
username=alice
password=secret
```
```bash
chmod 600 /etc/samba/credentials
```

### Постоянное монтирование через /etc/fstab:

```
//server/sharename  /mnt/point  cifs  credentials=/etc/samba/credentials,uid=1000,gid=1000,rw  0  0
```

### Устаревший метод: smbmount (устарел, но присутствует на экзамене):

```bash
smbmount //windows/winshare2 /opt/winshare2 \
  -o username=alice.jones,password=Alice,uid=nobody,gid=nobody,fmask=775,dmask=775,rw,hard
```

`/etc/fstab` с smbfs:
```
//windows/winshare2  /opt/winshare2  smbfs  username=alice.jones,...  0  0
```

### Параметры монтирования:

| Параметр | Описание |
|---|---|
| `username=` | Имя пользователя для аутентификации |
| `password=` | Пароль (лучше использовать файл учётных данных) |
| `credentials=` | Файл с именем пользователя и паролем |
| `uid=` | UID для локального представления файлов |
| `gid=` | GID для локального представления файлов |
| `fmask=` | Права для файлов (не маска — реальные права) |
| `dmask=` | Права для директорий (не маска — реальные права) |
| `rw` / `ro` | Чтение-запись или только чтение |

---

## Сопоставление имён пользователей

Когда имена пользователей на сервере Samba и клиенте Windows различаются, настройте файл сопоставления.

В `smb.conf` секция `[global]`:
```ini
username map = /etc/samba/username.map
```

Формат файла:
```
# unix_username = client_username [client_username2 ...]
root = administrator admin
nobody = guest pcguest smbguest
alice.jones = alice
readonly = glen fred terry sarah
lachlan = "Lachlan Smith"    # spaces in client name — use quotes
users = @sales               # @group: all members of group sales
admin = *                    # * wildcard: any unknown user
!root = administrator        # ! — stop processing on match
```

Правила:
- `@group` — соответствует любому члену группы UNIX
- `+group` — поиск через nsswitch
- `&group` — только поиск через NIS
- `*` — маска, соответствует любому неизвестному имени
- `!` в начале строки — прекратить обработку при совпадении

> Поместите строку с маской `*` в **конец** файла. Если перед ней нет `!`, все имена будут совпадать с маской и последующие строки не будут обработаны.

---

## WINS-сервер

WINS (Windows Internet Name Service) переводит NetBIOS-имена в IP-адреса через UDP-запросы.

```ini
[global]
    wins support = yes
```

```bash
service smb restart
service nmb restart
```

> В сети должен быть только **один** WINS-сервер. Если установлено `wins support = yes`, НЕ устанавливайте `wins server` — это конфликт.

---

## Сценарии входа

Сценарии входа выполняются при входе пользователя или клиентской машины. Типичное использование: подключение домашней директории как сетевого диска, подключение принтеров.

Сценарии представляют собой пакетные файлы Windows. Каждая строка должна заканчиваться `\r\n` (стиль Windows).

```ini
[global]
    logon server = yes

[netlogon]
    comment = Netlogon for Windows clients
    path = /home/netlogon
    browseable = no
    guest ok = no
    writeable = no
    logon script = %U.bat    # script by username
    # logon script = %m.bat  # script by client machine name
```

---

## Присоединение к домену Active Directory

### Предварительные требования:

1. `/etc/resolv.conf` должен указывать на DC:
```
nameserver 192.168.1.2
search example.com
```

2. `/etc/hosts` НЕ должен разрешать имя хоста в `127.0.0.1`:
```
192.168.1.3 server2.example.com server2
```

3. `/etc/krb5.conf` (минимальный для Samba):
```ini
[libdefaults]
    default_realm = EXAMPLE.COM
    dns_lookup_realm = false
    dns_lookup_kdc = true
```

4. NTP должен быть синхронизирован на всех участниках домена.

### smb.conf для сервера-участника AD:

```ini
[global]
    security = ADS
    workgroup = EXAMPLE
    realm = EXAMPLE.COM           # uppercase always
    log file = /var/log/samba/%m.log
    log level = 1
    idmap config * : backend = tdb
    idmap config * : range = 3000-7999
```

### Команды присоединения:

```bash
# AD domain:
net ads join -U administrator
# Output: Joined 'server2' to dns domain 'example.com'

# NT4 domain:
net rpc join -U administrator
# Output: Joined domain EXAMPLE.
```

### После присоединения:

```ini
# /etc/nsswitch.conf
passwd:  files winbind
group:   files winbind
```

```bash
systemctl start winbind smbd nmbd
wbinfo --ping-dc    # check DC connectivity
wbinfo -u           # list domain users
wbinfo -g           # list domain groups
```

---

## Порты Samba

| Порт | Протокол | Описание |
|---|---|---|
| 137 | UDP | Служба имён NetBIOS |
| 138 | UDP | Служба датаграмм NetBIOS |
| 139 | TCP | Служба сессий NetBIOS (устаревший SMB) |
| 445 | TCP | SMB через TCP (основной, без NetBIOS) |
| 389 | TCP/UDP | LDAP |
| 88 | TCP/UDP | Kerberos |
| 636 | TCP | LDAPS |

---

## Шпаргалка к экзамену

### Файлы и пути

| Что | Где |
|---|---|
| Основной конфиг | `/etc/samba/smb.conf` |
| Устаревшие пароли | `/etc/samba/smbpasswd` |
| Хосты NetBIOS | `/etc/samba/lmhosts` |
| Логи | `/var/log/samba/` |
| Сопоставление пользователей | `/etc/samba/username.map` |
| Конфигурация Kerberos | `/etc/krb5.conf` |

### Типичные ошибки на экзамене

| Ошибка | Правило |
|---|---|
| `wins support = yes` + `wins server = ...` | Конфликт — используйте только одно |
| `workgroup` | Не FQDN — используйте `WORKGROUP`, а не `workgroup.local` |
| `realm` | Всегда в верхнем регистре: `EXAMPLE.COM`, а не `example.com` |
| `writable = yes` | То же, что `read only = no` |
| `public = yes` | Пароль не нужен |
| `invalid users` | Переопределяет `valid users` — отказывает даже тем, кто в списке valid |
| `smbmount` | Устарело — используйте `mount -t cifs` |
| `fmask`/`dmask` | Это реальные права, не маски (вводящие в заблуждение имена) |
| `testparm` | Проверяет только синтаксис, а не операционную корректность |
| `share-level security` | Удалено в Samba 4 |
| `[homes]` без `path` | Использует системную домашнюю директорию |
| Явный `[PrinterName]` | Имеет приоритет над `[printers]` |
| `samba-tool` | Только для AD DC, не для автономного сервера |
| После изменения smb.conf | Сначала запустите `testparm`, затем перезапустите службу |

### Сводка уровней безопасности

| `security = ` | Вариант использования |
|---|---|
| `user` | Автономный, локальные пароли |
| `ads` | Участник Active Directory |
| `domain` | Участник домена NT4 |
| `share` | Устарело (удалено в Samba 4) |

### Сводка бэкендов passdb

| Бэкенд | Лучше для |
|---|---|
| `tdbsam` | Автономный, до ~250 пользователей (рекомендован) |
| `ldapsam` | Крупные окружения |
| `smbpasswd` | Только legacy — не рекомендуется |
