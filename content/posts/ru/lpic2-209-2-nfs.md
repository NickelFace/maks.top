---
title: "LPIC-2 209.2 — NFS Server Configuration"
date: 2026-03-19
description: "Архитектура NFSv3 и демоны, формат и параметры /etc/exports, exportfs, showmount, rpcinfo, nfsstat, монтирование на стороне клиента, squashing, TCP Wrappers для NFS, обзор NFSv4. Тема экзамена LPIC-2 209.2."
tags: ["Linux", "LPIC-2", "NFS", "file sharing", "exports", "rpcbind"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2-209-2-nfs/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема экзамена 209.2** — Конфигурация NFS-сервера (вес: 3). Охватывает настройку NFSv3, конфигурацию `/etc/exports`, утилиты NFS, монтирование на стороне клиента и управление доступом. LPIC-2 сосредоточен на **NFSv3**.

---

## Что такое NFS

**NFS (Network File System)** — протокол для монтирования удалённых файловых систем как локальных. Сервер публикует (экспортирует) директорию; клиент монтирует её с помощью стандартной команды `mount`.

---

## Версии NFS

| Версия | Год | Протокол | Возможности |
|---|---|---|---|
| NFSv2 | 1989 | Только UDP | 32-битные файлы, устарел |
| NFSv3 | 1995 | UDP или TCP | 64-битные файлы, асинхронная запись, слабая согласованность кэша |
| NFSv4 | 2000/2015 | TCP (основной) | Kerberos, единственный порт 2049, встроенная блокировка |

NFSv3 использует **RPC (Remote Procedure Call)** для монтирования, блокировки и квот — требуя несколько портов, что усложняет настройку межсетевого экрана.

```bash
# Disable NFSv4 on Red Hat — /etc/sysconfig/nfs
RPCNFSDARGS='--no-nfs-version 4'

# Debian — /etc/default/nfs-kernel-server
# add --no-nfs-version 4 to RPCMOUNTDOPTS

# Force NFSv3 on mount
mount -o vers=3 server:/share /mnt
```

---

## Архитектура и демоны

NFSv3 работает через набор демонов и сервисов ядра, все зарегистрированные через portmapper.

| Демон | Псевдоним | Роль | Где нужен |
|---|---|---|---|
| `rpc.nfsd` / `nfsd` | nfsd | Основной демон NFS, передача данных | Сервер |
| `rpc.mountd` | mountd | Обрабатывает запросы монтирования | Сервер |
| `rpcbind` | portmapper | Отображает RPC-службы на порты | Сервер и клиент |
| `rpc.lockd` | lockd | Протокол NLM, блокировка файлов | Оба (не нужен в NFSv4) |
| `rpc.statd` | statd | Мониторинг состояния, восстановление блокировок | Оба |
| `rpc.rquotad` | rquotad | Управление квотами на экспортах | Сервер |
| `idmapd` | rpc.idmapd | Сопоставление UID/GID по имени | Только NFSv4 |

```bash
# Start NFS (CentOS/RHEL)
systemctl start nfs rpcbind

# Start NFS (Debian/Ubuntu)
systemctl start nfs-kernel-server rpcbind
```

> На системах с NFS в пространстве ядра сервер отображается в списке процессов как `[nfsd]`. На старых системах с NFS в пространстве пользователя — как `rpc.nfsd`.

---

## /etc/exports

Основной файл конфигурации NFS-сервера. Каждая строка — одна запись:

```
/path/to/directory  client(options)  client2(options)
```

Дополнительные файлы `.exports` можно размещать в `/etc/exports.d/`.

### Форматы указания клиентов:

| Тип | Пример | Описание |
|---|---|---|
| Одиночный хост | `192.168.1.10` или `client.example.com` | Один IP или FQDN |
| Подсеть | `192.168.1.0/24` или `192.168.1.0/255.255.255.0` | CIDR или маска |
| Маска | `192.168.56.*` | IP-маска (использовать осторожно) |
| Домен | `*.example.com` | Маска имени хоста |
| Группа NIS | `@groupname` | Группа NIS netgroup |

> **Критическое правило синтаксиса:** Между именем клиента и круглой скобкой с параметрами НЕ должно быть пробела. Пробел превращает остаток строки в отдельное правило, применяемое ко ВСЕМ хостам.
>
> Правильно: `/share client(rw)`
> Неправильно: `/share client (rw)` — `(rw)` будет применено ко ВСЕМ хостам!

### Параметры /etc/exports:

| Параметр | Описание | По умолчанию |
|---|---|---|
| `ro` | Только чтение | да |
| `rw` | Чтение-запись | нет |
| `sync` | Записать на диск перед ответом. Обязателен для rw-экспортов. | нет |
| `async` | Не ждать сброса кэша. Ускоряет ro-экспорты, опасен для rw. | да |
| `root_squash` | root на клиенте отображается на nobody на сервере | да |
| `no_root_squash` | root на клиенте действует как root на сервере | нет |
| `all_squash` | Все пользователи (включая root) отображаются на nobody | нет |
| `no_all_squash` | Обычные пользователи отображаются по UID/GID | да |
| `anonuid=N` | UID для анонимного пользователя | 65534 |
| `anongid=N` | GID для анонимной группы | 65534 |
| `subtree_check` | Проверяет права в родительских директориях | нет |
| `no_subtree_check` | Отключает проверку поддерева. Повышает надёжность. | да |
| `fsid=N` | Идентификатор файловой системы. В NFSv4 `fsid=0` или `fsid=root` = корень псевдофайловой системы. | — |

```bash
# /etc/exports examples
/srv/data        192.168.1.10(rw,sync,no_root_squash)
/srv/data        192.168.1.0/24(ro,async)
/srv/public      *(ro,all_squash)
/home            client5.example.com(rw,sync,root_squash)
```

> `root_squash` **включён по умолчанию**. Это защищает от скомпрометированного root клиента. `no_root_squash` нужен, например, для резервного копирования через NFS.

---

## Утилиты управления

### exportfs

Читает `/etc/exports` и управляет экспортами без перезапуска NFS.

| Команда | Описание |
|---|---|
| `exportfs` | Показать текущие экспорты |
| `exportfs -v` | Показать с подробными параметрами |
| `exportfs -r` | Перечитать /etc/exports и переэкспортировать всё |
| `exportfs -a` | Экспортировать всё из /etc/exports |
| `exportfs -u host:/path` | Отменить экспорт конкретного пути |
| `exportfs -ua` | Отменить все экспорты |
| `exportfs -o opts IP:/path` | Временный экспорт из командной строки |

```bash
# Apply changes in /etc/exports
exportfs -r

# Temporary export without modifying /etc/exports
exportfs -o rw,no_root_squash 192.168.1.10:/srv/temp

# Remove temporary export
exportfs -u 192.168.1.10:/srv/temp
```

Данные об экспортах хранятся в:
- `/var/lib/nfs/etab` — подробный список с параметрами по умолчанию
- `/var/lib/nfs/xtab` — активные экспорты
- `/proc/fs/nfs/exports` — таблица экспортов ядра

### showmount

Показывает информацию об экспортах NFS-сервера. Работает удалённо.

| Команда | Описание |
|---|---|
| `showmount -e` | Список текущих экспортов |
| `showmount -e server` | Экспорты на удалённом сервере |
| `showmount -a` | Клиенты и что они смонтировали |
| `showmount -d` | Директории, смонтированные клиентами |
| `showmount` (без аргументов) | Имена подключённых хостов |

> `showmount -e` НЕ работает с серверами NFSv4. Используйте вместо него `exportfs -v`.

### rpcinfo

Запрашивает portmapper и проверяет RPC-сервисы.

```bash
# List all registered RPC services
rpcinfo -p

# Query a remote server
rpcinfo -p server

# Check NFS availability via UDP (null request)
rpcinfo -u server nfs

# Check via TCP
rpcinfo -t server nfs
```

> portmapper слушает на порту **111**; nfsd слушает на порту **2049**.

### nfsstat

Показывает статистику NFS-клиента и сервера из `/proc/net/rpc/`.

| Флаг | Описание |
|---|---|
| `nfsstat -s` | Статистика сервера |
| `nfsstat -c` | Статистика клиента |
| `nfsstat -n` | Статистика NFS (без RPC) |
| `nfsstat -r` | Статистика RPC |
| `nfsstat -sn` | Только статистика NFS сервера |
| `nfsstat -cn` | Только статистика NFS клиента |

---

## Монтирование на клиенте

### Временное монтирование:

```bash
mkdir /mnt/nfs_share
mount -t nfs -o vers=3 192.168.1.100:/srv/data /mnt/nfs_share
```

### Постоянное монтирование через /etc/fstab:

```
192.168.1.100:/srv/data  /mnt/nfs_share  nfs  ro,hard,intr,bg  0  0
```

### Параметры монтирования на клиенте:

| Параметр | Описание |
|---|---|
| `ro` / `rw` | Только чтение / чтение-запись |
| `hard` | При недоступности сервера — бесконечные повторные попытки (по умолчанию) |
| `soft` | При недоступности — возвращает ошибку после таймаута |
| `intr` | Разрешить прерывание зависшего монтирования (Ctrl+C) |
| `nointr` | Запретить прерывание |
| `bg` | Повторять монтирование в фоновом режиме |
| `fg` | Все повторные попытки в приоритетном режиме (по умолчанию) |
| `tcp` | Использовать TCP (рекомендуется) |
| `udp` | Использовать UDP |
| `vers=3` | Принудительно NFSv3 |
| `rsize=N` | Размер блока чтения в байтах |
| `wsize=N` | Размер блока записи в байтах |
| `noatime` | Не обновлять atime при чтениях |
| `nosuid` | Игнорировать биты SUID/SGID на смонтированной ФС |
| `noexec` | Запретить выполнение бинарных файлов |
| `port=N` | Указать порт NFS-сервера |

> Рекомендуемая комбинация: `hard,intr,bg` — монтирование не зависает навсегда, но продолжает попытки.

### Проверка смонтированных NFS-ресурсов:

```bash
cat /proc/mounts              # all mounted filesystems
cat /var/lib/nfs/rmtab        # clients and their mounts (server-side)
showmount -a                  # clients with mount paths
```

---

## Безопасность NFS

NFSv3 использует два механизма: записи `/etc/exports` (кто что может монтировать) и AUTH_SYS/AUTH_UNIX (клиент отправляет UID/GID — легко подделать).

### Рекомендации:

Использовать TCP вместо UDP:
```bash
mount -o tcp server:/share /mnt
```

Избегать маск в `/etc/exports` — указывать конкретные IP.

Применять squashing для публичных экспортов:
```bash
/srv/public  192.168.1.0/24(ro,sync,all_squash,anonuid=65534,anongid=65534)
```

Проверять порты с помощью межсетевого экрана:
```bash
rpcinfo -p    # see all NFS ports
```

---

## TCP Wrappers для NFS

TCP Wrappers управляют доступом к службам через `/etc/hosts.allow` и `/etc/hosts.deny`. Порядок проверки: сначала `hosts.allow`, затем `hosts.deny`.

```bash
# Check if a daemon supports TCP Wrappers
ldd /sbin/rpcbind | grep libwrap
# libwrap.so.0 => ... means supported

ldd /sbin/rpc.nfsd | grep libwrap
# empty = rpc.nfsd doesn't directly support TCP Wrappers
```

Формат:
```
daemon: client_list
```

```bash
# /etc/hosts.deny — block everything
portmap: ALL
mountd: ALL
statd: ALL

# /etc/hosts.allow — allow specific hosts
portmap: 192.168.1.10, 192.168.1.20
mountd: 192.168.1.0/255.255.255.0
statd: .example.com

# Subnet with mask
portmap: 192.168.24.16/255.255.255.248

# Whole domain
portmap: .example.com

# NIS group
portmap: @workstations
```

> Перезапуск после изменения `hosts.allow` и `hosts.deny` не требуется — изменения вступают в силу немедленно.

> Стратегия: запретить всё в `hosts.deny` (`portmap: ALL`), затем разрешить конкретные хосты в `hosts.allow`.

---

## NFSv4 — Краткий обзор

Экзамен требует **осведомлённости**, а не глубоких знаний.

Ключевые отличия от NFSv3:
- Единственный фиксированный порт **2049** (вместо нескольких динамических)
- TCP по умолчанию
- Встроенная блокировка файлов (NLM не нужен)
- Kerberos для аутентификации и шифрования
- Псевдофайловая система — клиент видит экспорты как единое дерево
- `idmapd` для сопоставления UID/GID по имени
- portmapper (rpcbind) не требуется (но может присутствовать для совместимости)

```bash
# In NFSv4 /etc/exports, use fsid=0 (or fsid=root) for the pseudo-FS root
/exports        192.168.1.0/24(rw,sync,fsid=0,no_subtree_check)
/exports/data   192.168.1.0/24(rw,sync,fsid=1,no_subtree_check)
```

---

## Шпаргалка к экзамену

### Ключевые файлы

| Файл/Путь | Назначение |
|---|---|
| `/etc/exports` | Конфигурация экспортов NFS-сервера |
| `/etc/exports.d/*.exports` | Дополнительные файлы экспортов |
| `/etc/fstab` | Постоянные монтирования NFS на клиенте |
| `/etc/hosts.allow` | TCP Wrappers — разрешённые хосты |
| `/etc/hosts.deny` | TCP Wrappers — запрещённые хосты |
| `/var/lib/nfs/etab` | Подробная таблица экспортов с параметрами по умолчанию |
| `/var/lib/nfs/xtab` | Активные экспорты |
| `/var/lib/nfs/rmtab` | Текущие клиенты и смонтированные пути |
| `/proc/fs/nfs/exports` | Таблица экспортов ядра |
| `/proc/mounts` | Все смонтированные файловые системы |

### Ключевые команды

```bash
exportfs -r                                    # apply /etc/exports
exportfs -v                                    # show exports with details
exportfs -o rw 192.168.1.10:/srv/data          # temporary export
exportfs -ua                                   # unexport all
showmount -e                                   # list exports (NFSv3 only)
rpcinfo -p                                     # list RPC services and ports
nfsstat -sn                                    # server NFS statistics
mount -t nfs -o vers=3,tcp server:/path /mnt   # mount NFSv3 with TCP
cat /proc/mounts                               # check mounted filesystems
```

### Типичные ошибки на экзамене

| Ошибка | Правило |
|---|---|
| `root_squash` | Включён **по умолчанию** — `no_root_squash` должен быть явным |
| `sync` | НЕ является значением по умолчанию — должен быть указан для rw-экспортов |
| Пробел перед `(` в /etc/exports | Критическая ошибка — открывает доступ ВСЕМ хостам |
| `showmount -e` с NFSv4 | Не работает — используйте `exportfs -v` |
| Порт portmapper | **111** |
| Порт nfsd | **2049** |
| TCP Wrappers | Применяются к `rpcbind`, а не непосредственно к `rpc.nfsd` |
| Тип файловой системы в /etc/fstab | `nfs`, а не `nfs3` |
| Корень псевдо-ФС NFSv4 | `fsid=0` или `fsid=root` |
