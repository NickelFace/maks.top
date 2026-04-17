---
title: "LPIC-1 102.5 — Управление пакетами RPM и YUM"
date: 2026-04-16
description: "rpm, yum, dnf, zypper — установка, запросы, проверка целостности, репозитории, rpm2cpio. Тема 102.5 экзамена LPIC-1."
tags: ["Linux", "LPIC-1", "RPM", "YUM", "dnf", "zypper"]
categories: ["LPIC-1"]
page_lang: "ru"
lang_pair: "/posts/lpic1/lpic1-102-5-rpm-yum-package-management/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Вес на экзамене: 3** — LPIC-1 v5, Экзамен 101

## Что нужно знать

- Устанавливать, переустанавливать, обновлять и удалять пакеты через `rpm`, `yum` и `zypper`.
- Получать информацию о RPM-пакетах: версия, статус, зависимости, целостность, подписи.
- Определять, какие файлы предоставляет пакет, и находить, какому пакету принадлежит конкретный файл.
- Знать о существовании `dnf`.

---

## RPM: установка и управление пакетами

RPM (Red Hat Package Manager) работает напрямую с `.rpm`-файлами. Он не разрешает зависимости автоматически, поэтому устанавливать пакеты через RPM удобно только тогда, когда зависимости уже выполнены. Имя файла пакета выглядит так:

```
bash-5.1.8-6.el9.x86_64.rpm
 ^    ^     ^   ^    ^
 |    |     |   |    архитектура
 |    |     |   дистрибутив
 |    |     release
 |    версия
 имя пакета
```

### Установка и удаление

```bash
# Установка нового пакета
rpm -ivh package.rpm
# -i  install
# -v  verbose (подробный вывод)
# -h  показывать хэш-прогресс ########

# Обновление пакета (устанавливает, если пакет отсутствует)
rpm -Uvh package.rpm

# Обновление только существующего пакета (не устанавливает новый)
rpm -Fvh package.rpm
# -F  freshen — обновляет только если пакет уже установлен

# Удаление пакета (имя пакета, не файл)
rpm -e package_name

# Переустановка
rpm -ivh --replacepkgs package.rpm

# Игнорировать зависимости (опасно)
rpm -ivh --nodeps package.rpm

# Принудительная установка
rpm -ivh --force package.rpm
```

Разница между `-U` и `-F` важна для экзамена. `-U` установит пакет даже если его не было, а `-F` пропустит установку, если пакет отсутствует в системе.

### Запросы к базе данных RPM

Все запросы строятся на основе флага `-q` (query). Можно спрашивать как об установленных пакетах, так и о `.rpm`-файлах на диске.

```bash
# Проверить, установлен ли пакет
rpm -q bash
# Вывод: bash-5.1.8-6.el9.x86_64

# Список всех установленных пакетов
rpm -qa
rpm -qa | grep ssh

# Подробная информация о пакете
rpm -qi bash

# Список файлов пакета
rpm -ql bash

# Найти, какому пакету принадлежит файл
rpm -qf /bin/bash
# Вывод: bash-5.1.8-6.el9.x86_64

# Список конфигурационных файлов пакета
rpm -qc bash

# Список документации пакета
rpm -qd bash

# Список зависимостей (что пакет требует)
rpm -qR bash

# Что пакет предоставляет (capabilities)
rpm -q --provides bash

# Скрипты пре/пост установки
rpm -q --scripts bash

# Changelog пакета
rpm -q --changelog bash | head -20

# Запросы к файлу .rpm (не установленному), добавляй -p
rpm -qip package.rpm    # информация о файле пакета
rpm -qlp package.rpm    # список файлов в пакете
rpm -qRp package.rpm    # зависимости пакета
```

Запоминай суффиксы: `i` = info, `l` = list files, `f` = file (чей файл), `c` = config, `d` = docs, `R` = requires, `p` = package (файл на диске).

### Проверка целостности и подписей

RPM может проверить пакет двумя способами: через MD5/SHA (целостность файлов) и через GPG-подпись (подлинность издателя).

```bash
# Проверить установленный пакет (целостность файлов)
rpm -V bash
# Если всё в порядке, вывода нет
# Если файл изменён: S M 5 D L U G T c /etc/bashrc
# S=размер, M=права, 5=MD5, D=device, L=symlink, U=owner, G=group, T=mtime, c=config

# Проверить все установленные пакеты
rpm -Va

# Проверить подпись пакета .rpm
rpm --checksig package.rpm
rpm -K package.rpm

# Импорт GPG-ключа издателя (нужен для проверки подписей)
rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release
```

Коды вывода `rpm -V` встречаются в экзамене. Буква в выводе означает атрибут, который отличается от ожидаемого.

---

## rpm2cpio: распаковка без установки

`rpm2cpio` преобразует `.rpm`-файл в `cpio`-архив. Это полезно, когда нужно достать один файл из пакета без установки всего пакета.

```bash
# Извлечь содержимое пакета в текущий каталог
rpm2cpio package.rpm | cpio -idmv
# -i  extract
# -d  создавать каталоги автоматически
# -m  сохранять время модификации
# -v  verbose

# Просмотреть список файлов в пакете без извлечения
rpm2cpio package.rpm | cpio -tv

# Извлечь один конкретный файл
rpm2cpio package.rpm | cpio -idmv ./usr/bin/bash
```

Типичный сценарий: случайно удалил системный файл и нужно его восстановить, не переустанавливая весь пакет.

---

## YUM: высокоуровневый менеджер пакетов

YUM (Yellowdog Updater, Modified) работает поверх RPM и автоматически разрешает зависимости. Он скачивает пакеты из репозиториев и устанавливает всё необходимое сам.

### Управление пакетами через yum

```bash
# Установка пакета
yum install package_name
yum install -y package_name    # без подтверждения

# Удаление пакета
yum remove package_name
yum erase package_name         # то же самое

# Обновление конкретного пакета
yum update package_name

# Обновление всех пакетов
yum update

# Проверить, есть ли обновление (без установки)
yum check-update package_name

# Проверить обновления для всех пакетов (без установки)
yum check-update

# Переустановка пакета
yum reinstall package_name

# Откат пакета до предыдущей версии
yum downgrade package_name

# Установка конкретной версии
yum install package_name-version
```

### Поиск и информация

```bash
# Поиск пакета по имени или описанию
yum search keyword

# Подробная информация о пакете
yum info package_name

# Список всех доступных пакетов
yum list

# Список установленных пакетов
yum list installed

# Список доступных (но не установленных) пакетов
yum list available

# Найти, какой пакет предоставляет файл или утилиту
yum provides /bin/bash
yum whatprovides /bin/bash    # то же самое

# Список зависимостей пакета
yum deplist package_name

# История операций yum
yum history
yum history info 5            # подробности транзакции №5
yum history undo 5            # отменить транзакцию №5

# Очистить кэш
yum clean all
yum clean packages
yum clean metadata

# Установить пакет из локального .rpm файла (с разрешением зависимостей)
yum localinstall package.rpm
```

`yum provides` особенно полезна: ты говоришь "мне нужен файл `/usr/bin/nmap`", а yum отвечает, из какого пакета его получить.

### Настройка YUM: yum.conf и репозитории

Главный конфигурационный файл: `/etc/yum.conf`. В нём глобальные настройки для всех репозиториев.

```ini
# /etc/yum.conf (пример)
[main]
cachedir=/var/cache/yum/$basearch/$releasever
keepcache=0
debuglevel=2
logfile=/var/log/yum.log
exactarch=1
obsoletes=1
gpgcheck=1
plugins=1
installonly_limit=3
```

Репозитории хранятся в каталоге `/etc/yum.repos.d/` в файлах с расширением `.repo`. Каждый файл может содержать один или несколько репозиториев. Добавлять репозитории вручную можно через создание `.repo`-файла, но рекомендованный способ — утилита `yum-config-manager`.

```ini
# /etc/yum.repos.d/myrepo.repo (пример)
[myrepo]
name=My Custom Repository
baseurl=http://repo.example.com/centos/7/os/x86_64/
enabled=1
gpgcheck=1
gpgkey=http://repo.example.com/RPM-GPG-KEY-myrepo
```

Поля репозитория:

- `[section]` — идентификатор репозитория, уникальный
- `name` — человекочитаемое название
- `baseurl` — адрес репозитория (http, ftp, file://)
- `mirrorlist` — альтернатива baseurl, ссылка на список зеркал
- `enabled` — 1 включён, 0 выключен
- `gpgcheck` — 1 проверять GPG-подпись, 0 не проверять
- `gpgkey` — путь или URL к GPG-ключу

```bash
# Добавить репозиторий через yum-config-manager
yum-config-manager --add-repo https://rpms.remirepo.net/enterprise/remi.repo

# Включить репозиторий
yum-config-manager --enable updates

# Отключить репозиторий
yum-config-manager --disable updates

# Список всех репозиториев
yum repolist
yum repolist all        # включая отключённые

# Временно использовать отключённый репозиторий для одной команды
yum --enablerepo=epel install htop
```

ID репозитория в выводе `yum repolist all` берётся из первого столбца, до первого символа `/`. Для строки `updates/7/x86_64` ID — это `updates`.

---

## DNF: преемник YUM

DNF (Dandified YUM) пришёл на смену YUM в Fedora 22 и стал менеджером пакетов по умолчанию в RHEL 8 и CentOS 8. Синтаксис команд практически идентичен YUM.

```bash
# Основные операции
dnf install package_name
dnf remove package_name
dnf upgrade                      # обновить все пакеты
dnf upgrade package_name         # обновить один пакет

# Поиск и информация
dnf search keyword
dnf info package_name
dnf provides /bin/bash

# Список установленных пакетов
dnf list --installed

# Список файлов пакета
dnf repoquery -l package_name

# Управление репозиториями
dnf repolist
dnf repolist --enabled
dnf repolist --disabled
dnf config-manager --add_repo https://example.url/repo.repo
dnf config-manager --set-enabled REPO_ID
dnf config-manager --set-disabled REPO_ID
```

Репозитории DNF хранятся в тех же `.repo`-файлах в `/etc/yum.repos.d/` — формат полностью совпадает с YUM. DNF исправляет ряд проблем YUM: лучше разрешение зависимостей, поддержка модульных пакетов, более точная логика обновлений. Встроенная справка: `dnf help install`.

---

## Zypper: менеджер пакетов openSUSE

Zypper работает в openSUSE и SUSE Linux Enterprise и тоже использует RPM-пакеты под капотом. Синтаксис немного отличается от YUM.

```bash
# Обновить список пакетов из репозиториев
zypper refresh
zypper ref                 # короткая форма

# Установка пакета
zypper install package_name
zypper in package_name     # короткая форма

# Установка локального .rpm файла с разрешением зависимостей из репозиториев
zypper in /home/user/package.rpm

# Удаление пакета (удаляет также зависящие от него пакеты)
zypper remove package_name
zypper rm package_name

# Обновление всех пакетов
zypper update

# Показать доступные обновления без установки
zypper list-updates

# Поиск пакета по имени
zypper search keyword
zypper se keyword

# Список установленных пакетов
zypper se -i

# Проверить, установлен ли конкретный пакет
zypper se -i unzip

# Поиск только среди неустановленных пакетов
zypper se -u keyword

# Информация о пакете
zypper info package_name

# Найти, какой пакет предоставляет файл
zypper se --provides /usr/bin/bash
zypper se --provides /usr/lib64/libgimpmodule-2.0.so.0

# Список репозиториев
zypper repos

# Добавить репозиторий
zypper addrepo http://packman.inode.at/suse/openSUSE_Leap_15.1/ packman
zypper ar URL alias

# Удалить репозиторий
zypper removerepo packman

# Включить или отключить репозиторий
zypper modifyrepo -e repo-non-oss    # включить
zypper modifyrepo -d repo-non-oss    # отключить

# Управление авто-обновлением метаданных репозитория
zypper modifyrepo -f repo-non-oss    # включить автообновление
zypper modifyrepo -F repo-non-oss    # отключить автообновление
```

У zypper есть авто-обновление метаданных на уровне каждого репозитория: когда флаг `-f` включён, zypper сам запустит `refresh` перед работой с этим репозиторием.

---

## Полезные команды для экзамена

| Задача | RPM | YUM | Zypper |
|---|---|---|---|
| Установить пакет | `rpm -ivh pkg.rpm` | `yum install pkg` | `zypper in pkg` |
| Обновить пакет | `rpm -Uvh pkg.rpm` | `yum update pkg` | `zypper up pkg` |
| Удалить пакет | `rpm -e pkg` | `yum remove pkg` | `zypper rm pkg` |
| Переустановить | `rpm -ivh --replacepkgs` | `yum reinstall pkg` | `zypper in -f pkg` |
| Информация о пакете | `rpm -qi pkg` | `yum info pkg` | `zypper info pkg` |
| Список файлов пакета | `rpm -ql pkg` | `dnf repoquery -l pkg` | `rpm -ql pkg` |
| Чей это файл | `rpm -qf /path/file` | `yum whatprovides /path` | `zypper se --provides /path` |
| Зависимости | `rpm -qR pkg` | `yum deplist pkg` | `zypper info pkg` |
| Проверить целостность | `rpm -V pkg` | | |
| Список установленных | `rpm -qa` | `yum list installed` | `zypper se -i` |
| Добавить репо | | `yum-config-manager --add-repo URL` | `zypper addrepo URL alias` |
| Вкл/откл репо | | `yum-config-manager --enable/--disable ID` | `zypper modifyrepo -e/-d alias` |
| Распаковать пакет | `rpm2cpio pkg.rpm \| cpio -idmv` | | |

**Ключевые флаги rpm:**
```
-i   install          -q   query
-U   upgrade          -a   all
-F   freshen          -l   list files
-e   erase            -i   info
-v   verbose          -f   find package for file
-h   hash marks       -c   config files
-V   verify           -d   documentation
-K   check signature  -R   requires (dependencies)
-p   query package file (не установленного)
```

---

## Типичные вопросы экзамена

**Какая команда покажет, какому пакету принадлежит файл `/usr/bin/ssh`?**
`rpm -qf /usr/bin/ssh`

**Как установить пакет через RPM с отображением прогресса?**
`rpm -ivh package.rpm`

**Чем отличается `rpm -U` от `rpm -F`?**
`-U` устанавливает пакет даже если его нет в системе, а `-F` обновляет только уже установленный пакет.

**Какой файл содержит глобальные настройки YUM?**
`/etc/yum.conf`

**Где хранятся конфигурации репозиториев YUM?**
В каталоге `/etc/yum.repos.d/`, файлы с расширением `.repo`.

**Как извлечь файлы из `.rpm`-пакета без его установки?**
`rpm2cpio package.rpm | cpio -idmv`

**Какая команда YUM найдёт пакет, предоставляющий файл `/bin/traceroute`?**
`yum provides /bin/traceroute`

**Как проверить целостность установленного пакета?**
`rpm -V package_name`

**Что означает буква `S` в выводе `rpm -V`?**
Размер файла отличается от ожидаемого.

**Какая команда zypper обновляет список пакетов из репозиториев?**
`zypper refresh` или `zypper ref`

---

## Упражнения

### Практические упражнения (Guided Exercises)

**1. Установи пакет `file-roller-3.28.1-2.el7.x86_64.rpm` через `rpm` с отображением прогресс-бара.**

<details>
<summary>Ответ</summary>

```bash
rpm -ih file-roller-3.28.1-2.el7.x86_64.rpm
```

Флаг `-h` включает отображение прогресса в виде символов `#`. Флаг `-v` можно добавить для подробного текстового вывода, но для прогресс-бара достаточно `-ih`.

</details>

---

**2. Используя `rpm`, найди, какой пакет содержит файл `/etc/redhat-release`.**

<details>
<summary>Ответ</summary>

```bash
rpm -qf /etc/redhat-release
```

Флаг `-qf` расшифровывается как "query file" — запрос о принадлежности файла пакету.

</details>

---

**3. Как через `yum` проверить наличие обновлений для всех пакетов в системе?**

<details>
<summary>Ответ</summary>

```bash
yum check-update
```

Команда показывает список пакетов, для которых есть обновления, но ничего не устанавливает. Если нужно проверить только один пакет, передай его имя аргументом.

</details>

---

**4. Отключи репозиторий `repo-extras` через `zypper`.**

<details>
<summary>Ответ</summary>

```bash
zypper modifyrepo -d repo-extras
```

`modifyrepo` изменяет параметры существующего репозитория. `-d` отключает его, `-e` включает обратно.

</details>

---

**5. Есть готовый `.repo`-файл с описанием нового репозитория. Куда его нужно положить, чтобы DNF его подхватил?**

<details>
<summary>Ответ</summary>

В каталог `/etc/yum.repos.d/`.

DNF и YUM используют один и тот же каталог для репозиториев. Формат `.repo`-файлов тоже идентичен.

</details>

---

### Исследовательские упражнения (Explorational Exercises)

**1. Как через `zypper` узнать, какой пакет содержит файл `/usr/sbin/swapon`?**

<details>
<summary>Ответ</summary>

```bash
zypper se --provides /usr/sbin/swapon
```

Оператор `se` (search) с флагом `--provides` ищет пакеты, предоставляющие указанный файл или capability.

</details>

---

**2. Как получить список всех установленных пакетов через `dnf`?**

<details>
<summary>Ответ</summary>

```bash
dnf list --installed
```

</details>

---

**3. Добавь через `dnf` репозиторий, расположенный по адресу `https://www.example.url/home:reponame.repo`.**

<details>
<summary>Ответ</summary>

```bash
dnf config-manager --add_repo https://www.example.url/home:reponame.repo
```

Обрати внимание на подчёркивание в `--add_repo` — именно так, не через дефис. Добавленные репозитории включены по умолчанию.

</details>

---

**4. Как через `zypper` проверить, установлен ли пакет `unzip`?**

<details>
<summary>Ответ</summary>

```bash
zypper se -i unzip
```

Флаг `-i` ограничивает поиск только установленными пакетами. Если `unzip` установлен, он появится в результатах со статусом `i` в первом столбце.

</details>

---

**5. Через `yum` найди, какой пакет предоставляет файл `/bin/wget`.**

<details>
<summary>Ответ</summary>

```bash
yum whatprovides /bin/wget
```

`yum whatprovides` работает как по полному пути к файлу, так и по имени библиотеки или capability (например, `libgimpui-2.0.so.0`).

</details>

---

## Связанные темы

- [102.4 Управление пакетами Debian](/posts/ru/lpic1-102-4-debian-package-management/) — dpkg и apt
- 103.1 Работа в командной строке — основы shell

---

*Конспекты LPIC-1 | Тема 101: Архитектура системы*
