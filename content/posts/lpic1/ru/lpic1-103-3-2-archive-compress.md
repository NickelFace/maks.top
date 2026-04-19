---
title: "LPIC-1 103.3 — Архивирование, сжатие и dd (часть 2)"
date: 2026-04-16
description: "tar, cpio, dd, gzip, bzip2, xz. Архивирование и сжатие файлов в Linux. Тема 103.3 LPIC-1."
tags: ["Linux", "LPIC-1", "tar", "cpio", "dd", "gzip", "bzip2", "xz"]
categories: ["LPIC-1"]
page_lang: "ru"
lang_pair: "/posts/lpic1/lpic1-103-3-2-archive-compress/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Вес на экзамене: 4** — LPIC-1 v5, Экзамен 101 | Часть 2 из 103.3

## Что нужно знать

- Создавать и распаковывать архивы командой `tar`.
- Использовать `cpio` для архивирования из списков файлов.
- Копировать сырые данные между устройствами командой `dd`.
- Сжимать и распаковывать с помощью `gzip`, `bzip2`, `xz`.

---

## Архивирование: tar и cpio

### tar

`tar` (Tape ARchive) создаёт архивы из файлов и каталогов.

#### Создание архива

```bash
tar -cf archive.tar dir/        # создать архив
tar -czf archive.tar.gz dir/    # создать + сжать через gzip
tar -cjf archive.tar.bz2 dir/   # создать + сжать через bzip2
tar -cJf archive.tar.xz dir/    # создать + сжать через xz
tar -cvf archive.tar dir/       # создать с подробным выводом
```

#### Просмотр содержимого

```bash
tar -tf archive.tar             # список файлов в архиве
tar -tvf archive.tar            # подробный список
```

#### Извлечение

```bash
tar -xf archive.tar             # распаковать в текущий каталог
tar -xzf archive.tar.gz         # распаковать .tar.gz
tar -xjf archive.tar.bz2        # распаковать .tar.bz2
tar -xf archive.tar -C /dest/   # распаковать в указанный каталог
tar -xf archive.tar file.txt    # извлечь только один файл
```

#### Ключи tar (запомни)

| Ключ | Значение |
|------|----------|
| `-c` | create (создать) |
| `-x` | extract (распаковать) |
| `-t` | list (список) |
| `-f` | file (имя архива) |
| `-z` | gzip |
| `-j` | bzip2 |
| `-J` | xz |
| `-v` | verbose (подробный вывод) |
| `-C` | change directory (куда распаковывать) |
| `-p` | сохранить права доступа |
| `--exclude` | исключить файл/каталог |

Флаг `-f` почти всегда нужен. Имя файла после `-f` идёт сразу за этим флагом.

### cpio

`cpio` (copy in/out) работает со списком файлов из stdin.

```bash
# Создание архива
find . -name "*.conf" | cpio -ov > backup.cpio

# Просмотр содержимого
cpio -tv < backup.cpio

# Извлечение
cpio -idv < backup.cpio

# Извлечение в другой каталог
(mkdir -p /dest && cd /dest && cpio -idv < /path/backup.cpio)
```

Режимы `cpio`:
- `-o` (out) — создание архива
- `-i` (in) — извлечение
- `-p` (pass-through) — копирование без создания архива

---

## Копирование данных: dd

`dd` копирует данные побайтово. Работает с блочными устройствами и файлами.

```bash
# Создать образ диска
dd if=/dev/sda of=/backup/disk.img

# Восстановить образ
dd if=/backup/disk.img of=/dev/sda

# Создать образ раздела
dd if=/dev/sda1 of=partition.img

# Создать файл заданного размера (заполненный нулями)
dd if=/dev/zero of=test.img bs=1M count=100

# Создать файл случайными данными
dd if=/dev/urandom of=random.bin bs=1M count=10

# Создать загрузочный USB
dd if=linux.iso of=/dev/sdb bs=4M status=progress

# Конвертировать регистр
dd if=input.txt of=output.txt conv=ucase
```

Параметры `dd`:

| Параметр | Значение |
|----------|----------|
| `if=` | input file (источник) |
| `of=` | output file (назначение) |
| `bs=` | block size (размер блока) |
| `count=` | количество блоков |
| `skip=` | пропустить блоков в начале входного файла |
| `seek=` | пропустить блоков в начале выходного файла |
| `conv=` | конвертация (ucase, lcase, notrunc, sync...) |
| `status=progress` | показывать прогресс |

---

## Сжатие файлов

### gzip и gunzip

`gzip` сжимает файлы, заменяя оригинал на `.gz`.

```bash
gzip file.txt           # создаёт file.txt.gz, удаляет file.txt
gzip -k file.txt        # сохранить исходный файл
gzip -d file.txt.gz     # распаковать (= gunzip)
gzip -1 file.txt        # быстрое сжатие (слабое)
gzip -9 file.txt        # максимальное сжатие (медленное)
gzip -l file.txt.gz     # показать информацию об архиве
gunzip file.txt.gz      # распаковать
zcat file.txt.gz        # прочитать без распаковки
```

### bzip2 и bunzip2

`bzip2` даёт лучшее сжатие, чем gzip, но работает медленнее.

```bash
bzip2 file.txt          # создаёт file.txt.bz2, удаляет file.txt
bzip2 -k file.txt       # сохранить исходный файл
bzip2 -d file.txt.bz2   # распаковать (= bunzip2)
bzip2 -1 file.txt       # быстрое сжатие
bzip2 -9 file.txt       # максимальное сжатие
bunzip2 file.txt.bz2    # распаковать
bzcat file.txt.bz2      # прочитать без распаковки
```

### xz

`xz` обеспечивает наилучшее сжатие из трёх, но медленнее всех.

```bash
xz file.txt             # создаёт file.txt.xz
xz -d file.txt.xz       # распаковать
xz -k file.txt          # сохранить оригинал
xzcat file.txt.xz       # прочитать без распаковки
```

---
## Шпаргалка для экзамена

```bash
# tar - запомни порядок флагов: операция, затем модификаторы, затем -f
tar -czf backup.tar.gz /home/user/
tar -xzf backup.tar.gz -C /restore/
tar -tf archive.tar

# dd - копирование диска
dd if=/dev/sda of=disk.img bs=4M status=progress

# gzip/bzip2
gzip -k largefile.log        # сжать, оставив оригинал
tar -czf backup.tar.gz dir/  # чаще используют через tar
```

---


---

## Типичные вопросы экзамена
**Создать архив и сжать через bzip2:** `tar -cjf arch.tar.bz2 dir/`.

**Распаковать .tar.gz в /tmp:** `tar -xzf arch.tar.gz -C /tmp/`.

**Просмотреть содержимое архива без распаковки:** `tar -tf arch.tar`.

**Отличие mtime, atime, ctime:**
- `mtime` — время последнего изменения содержимого файла.
- `atime` — время последнего доступа к файлу.
- `ctime` — время последнего изменения метаданных (прав, владельца).

**Что делает `touch` с существующим файлом:** обновляет временные метки до текущего времени.

**Отличие `cpio` от `tar`:** `cpio` принимает список файлов через stdin, `tar` принимает имена файлов напрямую.

**`dd conv=notrunc`:** не усекать выходной файл при записи.

---


---

## Упражнения

### Практические упражнения (Guided Exercises)

#### 7. Недостающий флаг tar

Пользователь хочет создать сжатый архив:

```bash
tar cvf /home/frank/backup.tar.gz /home/frank/dir1
```

**Какой флаг пропущен для сжатия через gzip?**

<details><summary>Ответ</summary>

`-z`. Без него `tar` создаёт обычный несжатый архив, несмотря на расширение `.gz`. Правильная команда:

```bash
tar -czvf /home/frank/backup.tar.gz /home/frank/dir1
```

</details>

---

### Исследовательские упражнения (Explorational Exercises)

#### 6. Список конкретных архивов

**Задание:** Каталог `/home/lpi/databases` содержит много файлов, среди которых есть `db-1.tar.gz`, `db-2.tar.gz` и `db-3.tar.gz`. Какой одной командой вывести только их?

<details><summary>Ответ</summary>

```bash
ls db-[1-3].tar.gz
```

`[1-3]` совпадает ровно с одним символом из диапазона 1-3, что точно отсекает лишние файлы.

</details>

---

#### 7. Удалить только pdf

**Задание:** Дан каталог:

```
cne1222223.pdf  cne12349.txt  cne1234.pdf
```

Удали только `.pdf` файлы, используя один глобинг-символ.

<details><summary>Ответ</summary>

```bash
rm *.pdf
```

`*` совпадает с любым именем перед `.pdf`. Файл `.txt` не затронут.

</details>

---

#### 8. Поиск и удаление объёмных backup-файлов

**Задание:** В каталоге `/var` нужно найти файлы с расширением `.backup`.

<details><summary>Ответ</summary>

```bash
find /var -name "*.backup"
```

</details>

**Задание:** Уточни поиск: найти только те `.backup` файлы, размер которых от 100M до 1000M.

<details><summary>Ответ</summary>

```bash
find /var -name "*.backup" -size +100M -size -1000M
```

Два условия `-size` объединяются как AND: файл должен быть строго больше 100M и строго меньше 1000M.

</details>

**Задание:** Добавь к предыдущей команде удаление найденных файлов.

<details><summary>Ответ</summary>

```bash
find /var -name "*.backup" -size +100M -size -1000M -delete
```

`-delete` удаляет каждый найденный файл напрямую, без запуска внешнего процесса. Используй это только убедившись, что результаты поиска именно те файлы, которые нужно удалить.

</details>

---

#### 9. Архивирование нескольких файлов

В каталоге `/var` лежат четыре файла:
```
db-jan-2018.backup
db-feb-2018.backup
db-march-2018.backup
db-apr-2018.backup
```

**Задание:** Создай архив `db-first-quarter-2018.backup.tar` из всех четырёх файлов.

<details><summary>Ответ</summary>

```bash
tar -cvf db-first-quarter-2018.backup.tar db-jan-2018.backup db-feb-2018.backup db-march-2018.backup db-apr-2018.backup
```

`tar` принимает несколько файлов через пробел. Все они войдут в один архив.

</details>

**Задание:** Создай тот же архив, но сжатый через gzip. Имя файла должно оканчиваться на `.gz`.

<details><summary>Ответ</summary>

```bash
tar -zcvf db-first-quarter-2018.backup.tar.gz db-jan-2018.backup db-feb-2018.backup db-march-2018.backup db-apr-2018.backup
```

Добавляется флаг `-z` для gzip-сжатия. Расширение `.tar.gz` указывает, что это tar-архив, сжатый через gzip.

</details>

---

---

*Тема 103: Команды GNU и Unix*
