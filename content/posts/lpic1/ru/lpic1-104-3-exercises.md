---
title: "LPIC-1 104.3 — Упражнения и разборы"
date: 2026-04-19
description: "Практические и исследовательские упражнения по теме 104.3: mount, umount, fstab, UUID, systemd mount units. Тема 104.3 экзамена LPIC-1."
tags: ["Linux", "LPIC-1", "mount", "umount", "fstab", "UUID", "systemd", "упражнения"]
categories: ["LPIC-1"]
page_lang: "ru"
lang_pair: "/posts/lpic1/lpic1-104-3-exercises/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема 104.3** — Управление монтированием и отмонтированием файловых систем. Практические и исследовательские разборы.

---

## Практические упражнения (Guided)

### 1. Монтирование ext4 как read-only

**Задача:** смонтировать ext4 на `/dev/sdc1` в `/mnt/external` только для чтения, с опциями `noatime` и `async`.

**Ответ:**

```bash
mount -t ext4 -o noatime,async,ro /dev/sdc1 /mnt/external
```

---

### 2. target is busy

**Задача:** при попытке отмонтировать `/dev/sdd2` появляется `target is busy`. Как узнать, какие файлы открыты?

**Ответ:**

```bash
lsof /dev/sdd2
```

Вывод покажет: имя процесса, PID, пользователя и открытый файл. После закрытия программы ФС можно отмонтировать.

---

### 3. noauto и mount -a

**Задача:** в `/etc/fstab` есть запись:

```
/dev/sdb1  /data  ext4  noatime,noauto,async
```

Будет ли эта система смонтирована командой `mount -a`?

**Ответ:** нет. Параметр `noauto` заставляет `mount -a` пропускать эту запись.

---

### 4. UUID файловой системы

**Задача:** как узнать UUID файловой системы на `/dev/sdb1`?

**Ответ:**

```bash
lsblk -f /dev/sdb1
# или
blkid /dev/sdb1
```

`lsblk -f` выводит таблицей с типом, меткой, UUID, свободным местом и точкой монтирования. `blkid` даёт компактный вывод, удобный для скриптов.

---

### 5. Перемонтирование в read-only

**Задача:** exFAT с UUID `6e2c12e3-472d-4bac-a257-c49ac07f3761` смонтирован в `/mnt/data`. Как перемонтировать только для чтения?

**Ответ:** при `remount` указывать тип и UUID не нужно — достаточно точки монтирования:

```bash
mount -o remount,ro /mnt/data
```

---

### 6. Список ext3 и ntfs

**Задача:** как получить список всех смонтированных систем типа ext3 и ntfs?

**Ответ:**

```bash
mount -t ext3,ntfs
```

---

## Исследовательские упражнения (Explorational)

### 1. nouser и mount /backup

**Задача:** в `/etc/fstab`:

```
/dev/sdc1  /backup  ext4  noatime,nouser,async
```

Может ли обычный пользователь смонтировать эту ФС командой `mount /backup`?

**Ответ:** нет. Опция `nouser` запрещает монтирование обычными пользователями — только root.

Для разрешения пользователям используется опция `user` (позволяет монтировать любому) или `group` (пользователям из группы-владельца устройства).

---

### 2. Недоступная сетевая ФС

**Задача:** сетевая ФС на `/mnt/server` стала недоступна из-за потери связи. Как принудительно отмонтировать её, или, если не получится, перевести в read-only?

**Ответ:**

```bash
umount -f -r /mnt/server
# или в короткой форме
umount -fr /mnt/server
```

`-f` — принудительное отмонтирование. `-r` — если не удалось, перевести в режим только для чтения.

---

### 3. Запись /etc/fstab для btrfs Backup

**Задача:** написать строку fstab, которая монтирует btrfs с меткой `Backup` в `/mnt/backup` с настройками по умолчанию и без права выполнения бинарных файлов.

**Ответ:**

```
LABEL=Backup  /mnt/backup  btrfs  defaults,noexec  0  0
```

Поля DUMP и PASS: `0 0` — не использовать `dump`, не проверять при загрузке.

`defaults` включает `exec`. Чтобы его отменить, явно добавляем `noexec`. Последний параметр побеждает, поэтому `defaults,noexec` эффективно запрещает выполнение.

---

### 4. Эквивалент mount unit в /etc/fstab

**Задача:** дан systemd mount unit:

```ini
[Unit]
Description=External data disk

[Mount]
What=/dev/disk/by-uuid/56C11DCC5D2E1334
Where=/mnt/external
Type=ntfs
Options=defaults

[Install]
WantedBy=multi-user.target
```

Какой будет эквивалентная строка в `/etc/fstab`?

**Ответ:**

```
UUID=56C11DCC5D2E1334  /mnt/external  ntfs  defaults  0  0
```

`What=/dev/disk/by-uuid/UUID` — это путь к симлинку, созданному udev. В fstab тот же UUID записывается через `UUID=`.

---

### 5. Имя и расположение unit-файла

**Задача:** как должен называться unit-файл из предыдущего упражнения и куда его положить?

**Ответ:** `mnt-external.mount` в каталоге `/etc/systemd/system/`.

Правило именования: символы `/` в пути точки монтирования заменяются на `-`:

| Точка монтирования | Имя файла |
|---|---|
| `/mnt/external` | `mnt-external.mount` |
| `/var/log/db` | `var-log-db.mount` |
| `/` | `-.mount` |

То же правило применяется к `.automount`-файлам.
