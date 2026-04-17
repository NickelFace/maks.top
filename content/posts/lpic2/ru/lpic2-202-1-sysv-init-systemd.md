---
title: "LPIC-2 202.1 — SysV Init and systemd"
date: 2025-08-31
description: "Настройка запуска системы: уровни выполнения SysV, inittab, init-скрипты, chkconfig, update-rc.d, юниты и цели systemd, mkinitrd, LSB. Тема экзамена LPIC-2 202.1."
tags: ["Linux", "systemd", "SysV", "LPIC-2", "Boot"]
categories: ["LPIC-2"]
page_lang: "ru"
lang_pair: "/posts/lpic2/lpic2-202-1-sysv-init-systemd/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Вес темы: 3 балла.** Необходимо управлять службами через уровни выполнения (SysV) и цели (systemd), понимать последовательность загрузки и знать все утилиты, перечисленные здесь. Экзамен проверяет оба подхода.

---

## SysV Init

### Уровни выполнения и специальные уровни

SysV Init делит состояния системы на уровни. Каждый уровень определяет набор работающих служб.

| Уровень | Описание |
|---|---|
| 0 | Остановка системы, зарезервирован |
| 1 | Однопользовательский режим (обслуживание), зарезервирован |
| 2 | Debian: многопользовательский режим (включая GUI) |
| 3 | Red Hat: многопользовательский текстовый режим |
| 4 | Не определён, доступен для пользовательского использования |
| 5 | Red Hat: многопользовательский графический режим |
| 6 | Перезагрузка, зарезервирован |
| 7–9 | Доступны для пользовательского использования, большинство дистрибутивов их игнорирует |
| s / S | Однопользовательский режим (синонимы). Скрипты из `/etc/rcS.d/` выполняются при загрузке |
| A, B, C | Уровни по запросу: скрипты выполняются, но текущий уровень выполнения не меняется |

> **Подсказка к экзамену:** Debian использует уровень 2 для всех многопользовательских режимов. Red Hat использует уровень 3 для текстового и 5 для графического режима. Это различие часто проверяется.

> **Примечание:** Уровни по запросу A, B, C позволяют запустить группу скриптов без изменения фактического уровня выполнения. Если текущий уровень 2 и вы выполните `init A`, скрипты уровня A запустятся, но `runlevel` по-прежнему покажет 2.

```bash
runlevel
# Вывод: N 3
# N = предыдущий уровень (N = начальная загрузка), 3 = текущий
```

---

### inittab

`init` — родитель всех процессов. При запуске он читает `/etc/inittab` и запускает процессы согласно его содержимому, включая `getty` для входа пользователей.

Формат каждой строки:

```
id:runlevels:action:process
```

- `id` — уникальный идентификатор (1–4 символа). Для `getty` значение `id` должно совпадать с суффиксом tty-устройства, иначе нарушится учёт входов.
- `runlevels` — уровни без разделителей (например, `345` означает уровни 3, 4 и 5)
- `action` — что делать с процессом
- `process` — команда для запуска. Если начинается с `+`, init пропускает учёт в utmp/wtmp.

Пример `/etc/inittab`:

```ini
# Уровень выполнения по умолчанию:
id:2:initdefault:

# Инициализация системы при загрузке (перед всем остальным):
si::sysinit:/etc/init.d/rcS

# Однопользовательский режим:
~~:S:wait:/sbin/sulogin

# rc-скрипты для каждого уровня выполнения:
l0:0:wait:/etc/init.d/rc 0
l1:1:wait:/etc/init.d/rc 1
l2:2:wait:/etc/init.d/rc 2
l3:3:wait:/etc/init.d/rc 3
l4:4:wait:/etc/init.d/rc 4
l5:5:wait:/etc/init.d/rc 5
l6:6:wait:/etc/init.d/rc 6

# Резервный вход при сбое:
z6:6:respawn:/sbin/sulogin

# Getty на виртуальных терминалах:
1:2345:respawn:/sbin/getty 38400 tty1
2:23:respawn:/sbin/getty 38400 tty2
```

**Значения поля `action`:**

| Действие | Описание |
|---|---|
| `initdefault` | Задаёт уровень выполнения по умолчанию при загрузке; поле `process` игнорируется |
| `sysinit` | Выполняется при загрузке до всех `boot`/`bootwait`; поле `runlevels` игнорируется |
| `boot` | Выполняется при загрузке; поле `runlevels` игнорируется |
| `bootwait` | Выполняется при загрузке, init ждёт завершения; поле `runlevels` игнорируется |
| `once` | Выполняется один раз при входе в уровень выполнения |
| `wait` | Выполняется один раз при входе в уровень выполнения, init ждёт завершения |
| `respawn` | Выполняется при входе в уровень и автоматически перезапускается при завершении (например, `getty`) |
| `off` | Ничего не делает |
| `ondemand` | Выполняется по запросу для уровней a, b, c без изменения текущего уровня |
| `powerwait` | Выполняется при отключении питания (от ИБП), init ждёт завершения |
| `powerfail` | Выполняется при отключении питания, init не ждёт |
| `powerokwait` | Выполняется при восстановлении питания |
| `powerfailnow` | Выполняется когда батарея ИБП почти разряжена |
| `ctrlaltdel` | Выполняется при SIGINT (Ctrl+Alt+Del на консоли) |
| `kbdrequest` | Выполняется при KeyboardSignal от обработчика клавиатуры |

> **Важно:** Порядок выполнения: сначала все записи `sysinit`, затем `boot`/`bootwait`, затем всё остальное.

> **Внимание:** На системах с systemd файл `/etc/inittab` либо отсутствует, либо игнорируется. Он применяется только к SysV Init.

---

### Init-скрипты

Init-скрипты хранятся в `/etc/init.d/`. Для каждого уровня выполнения существует отдельный каталог `/etc/rcX.d/` (X = номер уровня). При смене уровня выполнения init вызывает `/etc/init.d/rc` с номером уровня:

```
l2:2:wait:/etc/init.d/rc 2
```

Скрипт `rc` перебирает содержимое `/etc/rc2.d/` и вызывает каждую символическую ссылку с соответствующим аргументом. Пример содержимого `/etc/rc2.d/`:

```
K20gpm        S11pcmcia   S20logoutd  S20ssh     S89cron
S10ipchains   S12kerneld  S20lpd      S20xfs     S91apache
S10sysklogd   S14ppp      S20makedev  S22ntpdate S99gdm
```

Соглашение об именовании:

- `S20nginx` — запуск (Start), приоритет 20 → вызывает `nginx start`
- `K80nginx` — завершение (Kill), приоритет 80 → вызывает `nginx stop`

Скрипты выполняются в лексикографическом порядке. Меньший номер выполняется раньше. Запуск и остановка симметричны: что запускается первым (S20), останавливается последним (K80).

Пример структуры init-скрипта:

```bash
#!/bin/sh
case "$1" in
  start)
    gpm_start
    ;;
  stop)
    gpm_stop
    ;;
  force-reload|restart)
    gpm_stop; sleep 3; gpm_start
    ;;
  *)
    echo "Usage: /etc/init.d/gpm {start|stop|restart|force-reload}"
    exit 1
esac
```

---

### chkconfig

`chkconfig` используется в RPM-based дистрибутивах (Red Hat, CentOS, SUSE) для управления символическими ссылками в `/etc/rcX.d/`.

Заголовок скрипта, который читает `chkconfig`:

```bash
# chkconfig: 2345 55 25
#             ^^^^ ^^ ^^
#             |    |  |--- приоритет остановки (K-ссылки)
#             |    |------ приоритет запуска (S-ссылки)
#             |----------- уровни выполнения для запуска
```

```bash
# Список всех служб и их статус на уровнях выполнения:
chkconfig --list

# Список конкретной службы:
chkconfig --list nginx

# Включить на уровнях по умолчанию (2, 3, 4, 5):
chkconfig nginx on

# Отключить на всех уровнях:
chkconfig nginx off

# Включить на конкретных уровнях (синтаксис Red Hat):
chkconfig --levels 2345 nginx on

# Добавить новую службу (скрипт уже находится в /etc/init.d/):
chkconfig --add food

# Удалить все ссылки уровней выполнения (скрипт в /etc/init.d/ остаётся):
chkconfig --del food
```

> **Подсказка:** `chkconfig` только управляет символическими ссылками — он не запускает службу немедленно. Чтобы запустить сейчас, вызовите `/etc/init.d/nginx start` отдельно.

> **Важно:** `chkconfig --del food` удаляет ссылки из всех каталогов `rcX.d/`, но оставляет `/etc/init.d/food` на диске.

---

### update-rc.d

Debian-based системы используют `update-rc.d` вместо `chkconfig`.

```bash
# Добавить службу на стандартные уровни выполнения:
update-rc.d foobar defaults
# Создаёт K-ссылки в rc0.d, rc1.d, rc6.d и S-ссылки в rc2.d, rc3.d, rc4.d, rc5.d

# Удалить все ссылки службы (только если скрипт уже удалён):
update-rc.d dovecot remove

# Принудительное удаление (когда скрипт ещё существует):
update-rc.d -f dovecot remove

# Создать K-ссылки (остановка) на конкретных уровнях, чтобы запретить автозапуск:
update-rc.d -f dovecot stop 24 2 3 4 5 .
# Конечная точка обязательна!
```

> **Внимание:** Если удалить ссылки с помощью `update-rc.d -f dovecot remove`, следующее обновление пакета восстановит их автоматически. Чтобы предотвратить это, создайте K-ссылки (остановка) в соответствующих каталогах.

---

### Смена уровня выполнения: init и telinit

```bash
# Немедленно сменить уровень выполнения (без предупреждений):
init 3
telinit 3      # то же самое через telinit

init 6         # перезагрузка
init 0         # остановка
init 1         # однопользовательский режим
```

`telinit` — обёртка вокруг `init`, посылающая ему сигнал. На системах с systemd обе команды перенаправляются к `systemctl`.

Более удобные команды для многопользовательских систем:

```bash
shutdown -r +15 "Reboot in 15 minutes"
halt
poweroff
reboot
```

---

## systemd

### Юниты и типы

systemd управляет ресурсами через файлы юнитов. Юнит определяет службу или действие и имеет формат `имя.тип`. Существует восемь типов юнитов:

| Тип | Назначение |
|---|---|
| `.service` | Управление демонами (службами) |
| `.target` | Группировка других юнитов (аналог уровня выполнения) |
| `.socket` | Службы, активируемые по сокету |
| `.mount` | Точки монтирования |
| `.automount` | Автоматическое монтирование |
| `.device` | Устройства, распознанные ядром |
| `.path` | Мониторинг файловой системы |
| `.snapshot` | Снимок состояния systemd |

На экзамене чаще всего спрашивают о `.service` и `.target`.

---

### Структура файла юнита

Пример `sshd.service`:

```ini
[Unit]
Description=OpenSSH server daemon
After=syslog.target network.target auditd.service

[Service]
EnvironmentFile=/etc/sysconfig/sshd
ExecStartPre=/usr/sbin/sshd-keygen
ExecStart=/usr/sbin/sshd -D $OPTIONS
ExecReload=/bin/kill -HUP $MAINPID
KillMode=process
Restart=on-failure
RestartSec=42s

[Install]
WantedBy=multi-user.target
```

Пример файла цели `graphical.target`:

```ini
[Unit]
Description=Graphical Interface
Requires=multi-user.target
After=multi-user.target
Conflicts=rescue.target
Wants=display-manager.service
AllowIsolate=yes

[Install]
Alias=default.target
```

**Ключевые директивы:**

| Секция | Директива | Значение |
|---|---|---|
| `[Unit]` | `After=` | Запускать после этих юнитов |
| `[Unit]` | `Requires=` | Жёсткая зависимость |
| `[Unit]` | `Wants=` | Мягкая зависимость |
| `[Unit]` | `Conflicts=` | Не могут работать одновременно |
| `[Service]` | `ExecStart=` | Команда запуска |
| `[Service]` | `Restart=` | Политика перезапуска |
| `[Install]` | `WantedBy=` | В какую цель включён данный юнит. `WantedBy=multi-user.target` означает, что служба работает как в текстовом, так и в графическом режиме |

---

### Каталоги файлов юнитов

systemd читает файлы из трёх мест с разными приоритетами:

| Каталог | Автор записи | Приоритет |
|---|---|---|
| `/usr/lib/systemd/system/` | Менеджер пакетов (вендор) | Низкий |
| `/run/systemd/system/` | Временные переопределения (теряются при перезагрузке) | Средний |
| `/etc/systemd/system/` | Администратор | Высокий |

> **Важно:** Никогда не редактируйте файлы непосредственно в `/usr/lib/systemd/system/`. Все настройки вносятся в `/etc/systemd/system/`. Изменения в `/usr/lib/` будут перезаписаны при обновлении пакетов.

Способы переопределения юнита:

```bash
# 1. Полная замена: создать файл с тем же именем в /etc/systemd/system/
cp /usr/lib/systemd/system/nginx.service /etc/systemd/system/nginx.service

# 2. Частичное переопределение через drop-in каталог:
mkdir /etc/systemd/system/nginx.service.d/
cat > /etc/systemd/system/nginx.service.d/override.conf << EOF
[Service]
Restart=always
EOF

# 3. Через systemctl (автоматически создаёт drop-in):
systemctl edit nginx.service

# 4. Редактировать полный юнит через systemctl:
systemctl edit --full nginx.service

# После любых изменений — перезагрузить конфигурацию:
systemctl daemon-reload
```

---

### systemd-delta

`systemd-delta` показывает все активные переопределения файлов юнитов, сравнивая три каталога.

```bash
systemd-delta                        # показать все переопределения с различиями
systemd-delta --type=overridden      # фильтр по типу
systemd-delta --type=masked
systemd-delta --type=extended
systemd-delta --diff=false           # только список, без различий
systemd-delta --no-pager
```

**Типы переопределений:**

| Тип | Описание |
|---|---|
| `masked` | Юниты, заблокированные символической ссылкой на `/dev/null` |
| `equivalent` | Переопределённые файлы без фактических изменений |
| `redirected` | Символические ссылки, указывающие на другие файлы юнитов |
| `overridden` | Полностью замещённые файлы юнитов |
| `extended` | Юниты с drop-in файлами `.conf` |

---

### Цели (targets)

Цели в systemd определяют состояния системы, аналогичные уровням выполнения SysV. Ключевое отличие: одновременно может быть активно несколько целей.

Иерархия зависимостей: `graphical.target` зависит от `multi-user.target`, который зависит от `basic.target`.

```bash
systemctl get-default                        # текущая цель по умолчанию
systemctl set-default multi-user.target      # задать цель по умолчанию
# Создаёт символическую ссылку /etc/systemd/system/default.target

systemctl list-units --type=target           # все активные цели
systemctl list-unit-files --type=target      # все доступные цели
```

```bash
ls -al /etc/systemd/system/default.target
# lrwxrwxrwx ... default.target -> /usr/lib/systemd/system/graphical.target
```

---

### Соответствие уровней выполнения и целей

| Уровень SysV | Цель systemd | Описание |
|---|---|---|
| 0 | `poweroff.target` | Выключение |
| 1 | `rescue.target` | Однопользовательский режим |
| 2 | `multi-user.target` | Многопользовательский, без GUI |
| 3 | `multi-user.target` | Многопользовательский, без GUI |
| 4 | `multi-user.target` | Многопользовательский, без GUI |
| 5 | `graphical.target` | Многопользовательский с GUI |
| 6 | `reboot.target` | Перезагрузка |

Для обратной совместимости существуют псевдонимы `runlevel0.target` — `runlevel6.target`.

---

### systemctl

```bash
# --- Запуск / остановка ---
systemctl start nginx.service
systemctl stop nginx.service
systemctl restart nginx.service
systemctl reload nginx.service           # перезагрузить конфигурацию без перезапуска
systemctl reload-or-restart nginx.service

# --- Статус ---
systemctl status nginx.service
systemctl is-active nginx.service        # active или inactive
systemctl is-enabled nginx.service       # enabled или disabled
systemctl is-failed nginx.service

# --- Автозапуск ---
systemctl enable nginx.service           # добавить в автозапуск
systemctl disable nginx.service          # удалить из автозапуска

# --- Маскировка ---
systemctl mask nginx.service             # символическая ссылка на /dev/null
systemctl unmask nginx.service

# --- Переключение целей ---
systemctl isolate multi-user.target      # переключиться на многопользовательский (без GUI)
systemctl isolate rescue.target          # переключиться в режим восстановления (без уведомления)
systemctl rescue                         # переключиться в режим восстановления (уведомляет пользователей)
systemctl rescue --no-wall               # переключиться без уведомления
systemctl emergency                      # аварийный режим (сломанная система)
systemctl default                        # вернуться к цели по умолчанию

# --- Информация о юнитах ---
systemctl list-units                     # все активные юниты
systemctl list-units --all               # все юниты включая неактивные
systemctl list-units --type=service      # только службы
systemctl list-unit-files                # все файлы юнитов с состоянием
systemctl cat nginx.service              # вывести содержимое файла юнита
systemctl show nginx.service             # низкоуровневые свойства
systemctl show sshd.service -p Conflicts # конкретное свойство
systemctl list-dependencies nginx.service  # дерево зависимостей

# --- Перезагрузка конфигурации systemd ---
systemctl daemon-reload
```

> **Важно:** `systemctl enable` добавляет службу в автозапуск при следующей загрузке, но не запускает её сейчас. Чтобы одновременно включить и запустить: выполните обе команды `systemctl enable` и `systemctl start`.

> **Примечание:** `systemctl isolate rescue.target` переключается тихо, не уведомляя вошедших пользователей. `systemctl rescue` сначала рассылает сообщение всем пользователям (wall), затем переключается. `systemctl emergency` загружает минимальное окружение без сетевых служб — для случаев, когда режим восстановления уже не работает.

> **Внимание:** Разница между `mask` и `disable`: `disable` удаляет из автозапуска, но службу всё ещё можно запустить вручную. `mask` создаёт символическую ссылку на `/dev/null` и полностью блокирует любой запуск, включая ручной и через зависимости.

---

## mkinitrd и mkinitramfs

При загрузке ядро не может получить доступ к корневой файловой системе, если она находится на LVM, RAID или требует специального драйвера. Решение — начальный ramdisk (initrd) — временная файловая система в памяти, которую ядро монтирует первой и которая содержит необходимые модули.

### mkinitrd (RPM-based дистрибутивы)

`mkinitrd` используется на Red Hat, CentOS и SUSE. Автоматически включает модули, необходимые для доступа к корневой ФС, на основе `/etc/fstab` и `/etc/raidtab`.

```bash
mkinitrd /boot/initrd-4.18.0-305.img 4.18.0-305.el8.x86_64
```

| Опция | Действие |
|---|---|
| `--version` | Показать версию |
| `-f` | Перезаписать существующий образ с тем же именем |
| `--builtin=module` | Считать модуль встроенным в ядро, исключить из образа |
| `--omit-lvm-modules` | Исключить модули LVM |
| `--omit-raid-modules` | Исключить модули RAID |
| `--omit-scsi-modules` | Исключить модули SCSI |

> **Важно:** Пересобирайте initrd каждый раз при ручной перекомпиляции ядра или установке патча модуля ядра. Пропуск этого шага приведёт к невозможности загрузки системы после обновления.

### mkinitramfs (Debian-based дистрибутивы)

```bash
mkinitramfs -o /boot/initrd.img-$(uname -r) $(uname -r)

# Опции:
mkinitramfs -d /etc/initramfs-tools -o outfile   # альтернативный каталог конфигурации
mkinitramfs -k -o outfile                         # сохранить временный каталог
mkinitramfs -r /dev/sda1 -o outfile               # переопределить ROOT из конфигурации
```

Файл конфигурации: `/etc/initramfs-tools/initramfs.conf`

> **Внимание:** На Debian-based дистрибутивах `mkinitrd` не работает с современными ядрами. Используйте только `mkinitramfs`.

---

## Настройка корневого устройства

Корневое устройство может быть задано несколькими способами, каждый из которых имеет приоритет над предыдущим:

1. Значения по умолчанию из исходного кода ядра
2. Значения, заданные командой `rdev`
3. Параметры, переданные ядру при загрузке (`root=/dev/xyz`)
4. Параметры в конфигурационном файле GRUB

Из среды initrd корневое устройство можно изменить через `/proc`:

```bash
# Изменить корневое устройство на /dev/hda1 (0x301):
echo 0x301 > /proc/sys/kernel/real-root-dev

# Настроить корневую NFS-систему:
echo /var/nfsroot > /proc/sys/kernel/nfs-root-name
echo 193.8.232.2:193.8.232.7::255.255.255.0:myhost > /proc/sys/kernel/nfs-root-addrs
echo 255 > /proc/sys/kernel/real-root-dev   # 0xff = NFS
```

| Файл | Назначение |
|---|---|
| `/proc/sys/kernel/real-root-dev` | Номер устройства корневой ФС |
| `/proc/sys/kernel/nfs-root-name` | Путь к NFS-корню |
| `/proc/sys/kernel/nfs-root-addrs` | Адреса NFS-корня |

---

## Процесс загрузки Linux

| Фаза | Описание |
|---|---|
| 1 | Загрузка, настройка и запуск загрузчика ядра |
| 2 | Регистрация настроек |
| 3 | Декомпрессия ядра |
| 4 | Инициализация ядра и памяти |
| 5 | Настройка ядра |
| 6 | Включение дополнительных процессоров (SMP) |
| 7 | Создание процесса init |

Ядро пытается запустить `init` по следующим путям по порядку, пока один из них не завершится успехом:

```
/sbin/init
/etc/init
/bin/init
/bin/sh
```

> **Важно:** Если ни один из этих путей не работает, ядро завершается паникой с сообщением `Kernel panic - not syncing`. На экзамене могут спросить, какой путь проверяется первым и что происходит при неудаче.

---

## Linux Standard Base (LSB)

LSB определяет стандарт совместимости между дистрибутивами Linux. Программа, собранная в LSB-совместимой среде, будет работать на любом дистрибутиве, поддерживающем LSB.

Что определяет LSB:

- Стандартные библиотеки: `libdl`, `libcrypt`, `libpthread`, `libc`, `libm`, включая пути поиска, формат (ELF) и динамическую компоновку
- 130+ команд с соглашениями о вызове: `cp`, `tar`, `kill`, `gzip`, `perl`, `python`
- Поведение системы init, функции init-скриптов и расположение файлов
- Определения уровней выполнения, соглашения об именах пользователей/групп и диапазоны UID/GID
- Стандарт пакетов: LSB использует формат RPM. В Debian `alien` позволяет читать RPM-пакеты

> **Примечание:** LSB — это семейство спецификаций, а не одна спецификация. Существует общая часть (LSB-generic) и архитектурно-специфичная часть (LSB-arch). Бинарный файл для Intel не запустится на Alpha, даже если оба дистрибутива поддерживают LSB.

### LSB init-скрипты

LSB-совместимый init-скрипт должен поддерживать следующие аргументы:

| Аргумент | Обязательный |
|---|---|
| `start` | Обязательный |
| `stop` | Обязательный |
| `restart` | Обязательный |
| `force-reload` | Обязательный |
| `status` | Обязательный |
| `reload` | Необязательный |
| `try-restart` | Необязательный |

Функции из `/lib/lsb/init-functions`:

```bash
# Запустить программу как демон (проверяет, не запущена ли уже):
start_daemon [-f] [-n nicelevel] [-p pidfile] pathname [args...]
# -f: запускать, даже если уже запущена
# -n: задать уровень приоритета nice

# Остановить процесс (пробует указанный сигнал, при неудаче использует SIGTERM):
killproc [-p pidfile] pathname [signal]

# Получить PID(ы) демона:
pidofproc [-p pidfile] pathname
```

Пример LSB-заголовка в скрипте:

```bash
### BEGIN INIT INFO
# Provides:          myservice
# Required-Start:    $network $remote_fs $syslog
# Required-Stop:     $network $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: My custom service
# Description:       Long description of the service
### END INIT INFO
```

> **Подсказка:** `Required-Start` определяет зависимости. `$network`, `$remote_fs`, `$syslog` — виртуальные средства LSB. Как `chkconfig`, так и `update-rc.d` читают этот заголовок для создания символических ссылок с правильными номерами приоритетов.

---

## Шпаргалка к экзамену

### Пути и файлы

| Путь | Назначение |
|---|---|
| `/etc/inittab` | Конфигурация SysV Init: уровень по умолчанию, процессы |
| `/etc/init.d/` | SysV init-скрипты |
| `/etc/rc.d/` | Каталоги rcX.d с символическими ссылками |
| `/etc/rcX.d/` | Символические ссылки на скрипты для уровня X (SXXname, KXXname) |
| `/usr/lib/systemd/system/` | Файлы юнитов от менеджера пакетов (не редактировать!) |
| `/etc/systemd/system/` | Файлы юнитов и переопределения администратора |
| `/run/systemd/system/` | Временные переопределения (теряются при перезагрузке) |
| `/etc/initramfs-tools/initramfs.conf` | Конфигурация mkinitramfs (Debian) |

### Ключевые команды

| Команда | Что делает |
|---|---|
| `runlevel` | Показать текущий и предыдущий уровень выполнения |
| `init N` / `telinit N` | Сменить уровень выполнения (SysV) |
| `chkconfig --list` | Список служб и уровней выполнения (RPM) |
| `chkconfig nginx on` | Включить службу на уровнях по умолчанию |
| `update-rc.d foobar defaults` | Добавить службу в автозапуск (Debian) |
| `update-rc.d -f dovecot remove` | Принудительно удалить ссылки службы |
| `mkinitrd /boot/initrd.img version` | Создать initrd (RPM) |
| `mkinitramfs -o /boot/initrd.img version` | Создать initrd (Debian) |
| `systemctl get-default` | Текущая цель по умолчанию |
| `systemctl set-default graphical.target` | Задать цель по умолчанию |
| `systemctl isolate rescue.target` | Немедленно переключить цель |
| `systemctl enable/disable` | Автозапуск вкл./выкл. |
| `systemctl mask/unmask` | Полностью заблокировать / разблокировать |
| `systemctl daemon-reload` | Перезагрузить файлы юнитов после изменений |
| `systemctl edit nginx.service` | Создать drop-in переопределение |
| `systemctl edit --full nginx.service` | Редактировать полный юнит |
| `systemd-delta` | Показать все переопределения файлов юнитов |

### Типичные ошибки

- Забыть `systemctl daemon-reload` после редактирования файла юнита
- Путать `enable` (автозапуск) со `start` (запустить сейчас)
- Путать `disable` (удаляет автозапуск, ручной запуск всё ещё работает) с `mask` (блокирует всё)
- Редактировать файлы непосредственно в `/usr/lib/systemd/system/`
- Забывать конечную точку в `update-rc.d -f dovecot stop 24 2 3 4 5 .`
- Путать поведение уровней выполнения Red Hat и Debian (уровни 2–5)

---

## Практические вопросы

**Q1.** На сервере Debian с SysV Init нужно отключить автозапуск `apache2`. Какая команда это делает?

A. `chkconfig apache2 off`
B. `update-rc.d -f apache2 remove`
C. `systemctl disable apache2`
D. `service apache2 stop`

**Ответ:** B. `chkconfig` предназначен для RPM-based систем. `update-rc.d -f apache2 remove` удаляет символические ссылки в Debian. `systemctl disable` работает только с systemd.

---

**Q2.** В каком файле хранится уровень выполнения по умолчанию в SysV Init?

A. `/etc/rc.local` B. `/etc/default/init` C. `/etc/inittab` D. `/etc/init.d/defaults`

**Ответ:** C. Строка `id:3:initdefault:` в `/etc/inittab` задаёт уровень выполнения при загрузке.

---

**Q3.** Администратор запустил `systemctl edit nginx.service`, сохранил изменения, но поведение службы не изменилось. Что нужно сделать?

A. `systemctl restart nginx.service`
B. `systemctl reload nginx.service`
C. `systemctl daemon-reload`
D. `systemctl reset nginx.service`

**Ответ:** C. После изменения файлов юнитов systemd должен перезагрузить свою конфигурацию с помощью `systemctl daemon-reload`. Только после этого изменения вступят в силу.

---

**Q4.** Что происходит с файлами в `/run/systemd/system/` при перезагрузке?

A. Они копируются в `/etc/systemd/system/`
B. Они сохраняются без изменений
C. Они удаляются
D. Они перемещаются в `/usr/lib/systemd/system/`

**Ответ:** C. Каталог `/run/` содержит временные данные, которые не сохраняются при перезагрузке. Файлы переопределений там удаляются.

---

**Q5.** Какая команда показывает, какие файлы юнитов переопределены в системе?

A. `systemctl list-overrides` B. `systemd-delta` C. `systemctl diff` D. `systemctl show --changed`

**Ответ:** B. `systemd-delta` сравнивает все три каталога файлов юнитов и показывает расхождения с метками типов: masked, overridden, extended и т.д.

---

**Q6.** Администратор хочет, чтобы `myapp.service` никогда не запускалась, даже если её запустят вручную или через зависимость. Что следует сделать?

A. `systemctl disable myapp.service`
B. `systemctl stop myapp.service`
C. `systemctl mask myapp.service`
D. `systemctl remove myapp.service`

**Ответ:** C. `mask` создаёт символическую ссылку на `/dev/null`, полностью блокируя любой запуск. `disable` только удаляет из автозапуска.

---

**Q7.** Какая цель systemd соответствует уровню выполнения SysV 5 на системах Red Hat?

A. `multi-user.target` B. `rescue.target` C. `graphical.target` D. `runlevel5.target`

**Ответ:** C. Уровень 5 на Red Hat — это многопользовательский графический режим, соответствующий `graphical.target`. `runlevel5.target` — псевдоним, указывающий на `graphical.target`.

---

**Q8.** Что делает `systemctl isolate multi-user.target`?

A. Запускает все юниты из multi-user.target, не трогая остальные
B. Запускает юниты из multi-user.target и останавливает все юниты за пределами его дерева зависимостей
C. Устанавливает multi-user.target как цель по умолчанию
D. Выводит список юнитов в multi-user.target

**Ответ:** B. `isolate` переключает систему на указанную цель: запускает всё необходимое и останавливает всё остальное. Это эквивалент смены уровня выполнения в SysV.
