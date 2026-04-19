---
title: "LPIC-1 103.2 — Текстовые фильтры: преобразование, сжатие, контрольные суммы (часть 2)"
date: 2026-04-16
description: "tr, sed, split, wc, zcat, md5sum, sha256sum. Преобразование текста и работа со сжатыми файлами. Тема 103.2 LPIC-1."
tags: ["Linux", "LPIC-1", "sed", "tr", "wc", "gzip", "md5sum", "контрольная сумма"]
categories: ["LPIC-1"]
page_lang: "ru"
lang_pair: "/posts/lpic1/lpic1-103-2-2-transform-compress/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Вес на экзамене: 3** — LPIC-1 v5, Экзамен 101 | Часть 2 из 103.2

## Что нужно знать

- Преобразовывать текст командой `tr`.
- Редактировать потоки данных командой `sed`.
- Разбивать файлы и подсчитывать строки, слова, байты.
- Читать сжатые файлы без распаковки.
- Проверять целостность файлов контрольными суммами.

---

## Преобразование текста

### tr

`tr` (translate) заменяет или удаляет отдельные символы. Работает только с потоком, файлы напрямую не принимает.

```bash
echo "Hello World" | tr 'a-z' 'A-Z'    # перевести в верхний регистр
echo "Hello World" | tr 'A-Z' 'a-z'    # перевести в нижний регистр
echo "Hello   World" | tr -s ' '       # сжать повторяющиеся пробелы в один
echo "abc123" | tr -d '0-9'            # удалить все цифры
echo "abc123" | tr -cd '0-9'           # оставить только цифры
cat file.txt | tr '\t' ' '             # заменить табуляцию пробелами
cat file.txt | tr -s '\n'              # удалить пустые строки
```

`tr` умеет использовать классы символов: `[:alpha:]`, `[:digit:]`, `[:space:]`, `[:upper:]`, `[:lower:]`.

```bash
echo "Hello World 123" | tr -d '[:digit:]'        # удалить цифры
echo "Hello World" | tr '[:lower:]' '[:upper:]'   # в верхний регистр
```

### sed

`sed` (stream editor) — мощный редактор потока. Применяет команды к каждой строке.

Самое частое использование — замена текста (`s` — substitute):

```bash
sed 's/старое/новое/' file.txt          # заменить первое вхождение в каждой строке
sed 's/старое/новое/g' file.txt         # заменить все вхождения (global)
sed 's/старое/новое/i' file.txt         # без учёта регистра
sed 's/старое/новое/2' file.txt         # заменить только второе вхождение
sed -i 's/старое/новое/g' file.txt      # изменить файл на месте (in-place)
sed -i.bak 's/старое/новое/g' file.txt  # изменить файл, сохранить копию .bak
```

Удаление строк:

```bash
sed '3d' file.txt                # удалить 3-ю строку
sed '2,5d' file.txt              # удалить строки 2–5
sed '/pattern/d' file.txt        # удалить строки, содержащие pattern
sed '/^#/d' file.txt             # удалить строки-комментарии
sed '/^$/d' file.txt             # удалить пустые строки
```

Вывод выбранных строк:

```bash
sed -n '5p' file.txt             # вывести только 5-ю строку
sed -n '2,5p' file.txt           # вывести строки 2–5
sed -n '/pattern/p' file.txt     # вывести строки с pattern
sed -n -e '1'p -e '10'p -e '$'p file.txt  # строки 1, 10 и последняя
```

Символ `$` в sed обозначает последнюю строку файла. Трюк `sed -n '$='` выводит номер последней строки — то есть количество строк в файле, как альтернатива `wc -l`.

`sed` принимает файл и через перенаправление ввода:

```bash
sed -n /pattern/p < file.txt
```

---

## Разбивка и подсчёт

### split

`split` делит файл на части. Удобно для больших файлов.

```bash
split file.txt                       # разбить по 1000 строк, имена xaa, xab...
split -l 500 file.txt                # разбить по 500 строк
split -b 1M file.txt                 # разбить по 1 мегабайту
split -b 1M file.txt part_           # части с префиксом part_
split -l 100 -d file.txt chunk_      # числовые суффиксы (chunk_00, chunk_01...)
```

Чтобы собрать файл обратно: `cat part_* > original.txt`

### wc

`wc` (word count) подсчитывает строки, слова и байты.

```bash
wc file.txt                     # строки, слова, байты
wc -l file.txt                  # только строки
wc -w file.txt                  # только слова
wc -c file.txt                  # только байты
wc -m file.txt                  # только символы (с учётом многобайтной кодировки)
wc -L file.txt                  # длина самой длинной строки
wc -l *.txt                     # для нескольких файлов + итого
```

Классический пример: `ls | wc -l` — посчитать количество файлов в каталоге.

---

## Сжатые файлы

Эти утилиты позволяют читать сжатые файлы без явной распаковки. Удобно для просмотра сжатых логов.

### zcat, bzcat, xzcat

```bash
zcat file.gz                    # читать файл gzip без распаковки
zcat file.gz | grep error       # фильтровать сжатый файл
bzcat file.bz2                  # читать файл bzip2
xzcat file.xz                   # читать файл xz
```

Эти команды эквивалентны:

```bash
zcat file.gz      # то же что: gunzip -c file.gz
bzcat file.bz2    # то же что: bunzip2 -c file.bz2
xzcat file.xz     # то же что: xz -dc file.xz
```

Важно: `gzip file.txt` сжимает файл в `file.txt.gz` и удаляет оригинал. Именно поэтому `zcat` удобен: не нужно распаковывать, читать, а потом снова упаковывать.

Можно комбинировать с другими фильтрами:

```bash
zcat access.log.gz | tail -100 | grep "404"
bzcat large_data.bz2 | cut -d, -f3 | sort | uniq -c
```

---

## Контрольные суммы

Контрольные суммы используют для проверки целостности файлов: скачал ISO образ, посчитал сумму, сравнил с официальной. Если совпадает — файл не повреждён.

### md5sum, sha256sum, sha512sum

```bash
md5sum file.txt                  # посчитать MD5 хеш
sha256sum file.txt               # посчитать SHA-256 хеш
sha512sum file.txt               # посчитать SHA-512 хеш

md5sum file1.txt file2.txt       # для нескольких файлов

# Сохранить контрольные суммы в файл
sha256sum *.txt > checksums.sha256

# Проверить файлы по сохранённым суммам
sha256sum -c checksums.sha256
```

MD5 устарел с точки зрения криптографии, но для проверки целостности при скачивании всё ещё встречается. Для серьёзных задач используй SHA-256 или SHA-512.

Вывод `sha256sum`:

```
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  empty.txt
```

Первая часть — хеш, вторая — имя файла.

---

## Полезные команды для экзамена
| Команда | Что делает |
|---------|-------------|
| `tr 'a-z' 'A-Z'` | верхний регистр |
| `tr -d '0-9'` | удалить цифры |
| `tr -s ' '` | сжать повторяющиеся пробелы |
| `sed 's/a/b/g'` | заменить все вхождения a на b |
| `sed -i` | изменить файл на месте |
| `sed -n '5p'` | вывести только 5-ю строку |
| `sed '/pattern/d'` | удалить строки с pattern |
| `nl -b a` | нумеровать все строки |
| `od -c` | символьный дамп |
| `split -l 100` | разбить по 100 строк |
| `split -b 1M` | разбить по 1 мегабайту |
| `zcat file.gz` | читать gzip без распаковки |
| `bzcat file.bz2` | читать bzip2 без распаковки |
| `xzcat file.xz` | читать xz без распаковки |
| `sha256sum -c` | проверить файлы по суммам |

---


---

## Типичные вопросы экзамена
**Какая разница между `uniq -d` и `uniq -u`?**
`-d` выводит только строки, которые встречаются больше одного раза. `-u` выводит только строки, которые встречаются ровно один раз.

**Как перевести текст в верхний регистр?**
`tr 'a-z' 'A-Z'` или `tr '[:lower:]' '[:upper:]'`

**Как прочитать содержимое файла file.gz без распаковки?**
`zcat file.gz`

**Чем `sha256sum -c` отличается от простого запуска `sha256sum`?**
Без `-c` команда считает хеш. С `-c` читает файл с ранее сохранёнными суммами и проверяет соответствие.

**Как разбить файл на части по 500 строк с префиксом "part_"?**
`split -l 500 file.txt part_`

---


---


## Упражнения

### Практические упражнения (Guided Exercises)

**Упражнение 1 — Подсчёт процессоров**

В файле `/proc/cpuinfo` для каждого процессора есть строка вида `processor : 0`, `processor : 1` и т.д.

**1.1. Подсчитай количество процессоров с помощью `grep` и `wc`.**

<details>
<summary>Ответ</summary>

```bash
grep processor /proc/cpuinfo | wc -l
```

Или через `cat`:
```bash
cat /proc/cpuinfo | grep processor | wc -l
```

> Оба варианта дают одинаковый результат. `grep file` быстрее в скриптах; `cat | grep` нагляднее при интерактивной работе.

</details>

---

**1.2. Сделай то же самое с помощью `sed` вместо `grep`.**

<details>
<summary>Ответ</summary>

```bash
sed -n /processor/p /proc/cpuinfo | wc -l
```

Флаг `-n` отключает вывод всех строк. Команда `p` выводит только строки, совпадающие с шаблоном. Дальше `wc -l` считает их.

Вариант полностью на `sed` без `wc`:
```bash
sed -n /processor/p /proc/cpuinfo | sed -n '$='
```

`'$='` означает: найти последнюю строку (`$`) и вывести её номер (`=`). Результат тот же, что у `wc -l`.

</details>

---

**Упражнение 2 — Исследование /etc/passwd**

**2.1. Какие пользователи имеют доступ к оболочке Bash?**

<details>
<summary>Ответ</summary>

```bash
grep ":/bin/bash$" /etc/passwd
```

Чтобы вывести только имена:
```bash
grep ":/bin/bash$" /etc/passwd | cut -d: -f1
```

`$` в конце регулярного выражения означает конец строки — так избегаем случайного совпадения в других полях.

</details>

---

**2.2. Сколько пользователей в системе не имеют доступа к оболочке (служебные аккаунты)?**

<details>
<summary>Ответ</summary>

```bash
grep -v ":/bin/bash$" /etc/passwd | wc -l
```

Флаг `-v` инвертирует поиск: выводятся строки, где `/bin/bash$` не найден.

</details>

---

**2.3. Сколько уникальных пользователей и групп существует в системе (только /etc/passwd)?**

<details>
<summary>Ответ</summary>

Количество уникальных UID:
```bash
cut -d: -f3 /etc/passwd | sort -u | wc -l
```

Количество уникальных GID:
```bash
cut -d: -f4 /etc/passwd | sort -u | wc -l
```

> Простой `cut | wc -l` без `sort -u` может дать завышенный результат, если несколько пользователей делят один UID. `sort -u` удаляет дубликаты перед подсчётом.

</details>

---

**2.4. Выведи только первую строку, последнюю строку и десятую строку файла /etc/passwd.**

<details>
<summary>Ответ</summary>

```bash
sed -n -e '1'p -e '10'p -e '$'p /etc/passwd
```

Флаг `-n` отключает вывод всех строк. Каждый блок `-e` задаёт отдельную инструкцию: `1p` — первая строка, `10p` — десятая, `'$'p` — последняя.

</details>

---

**Упражнение 3 — Файл mypasswd**

Создай файл `mypasswd` со следующим содержимым:

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
nvidia-persistenced:x:121:128:NVIDIA Persistence Daemon,,,:/nonexistent:/sbin/nologin
libvirt-qemu:x:64055:130:Libvirt Qemu,,,:/var/lib/libvirt:/usr/sbin/nologin
libvirt-dnsmasq:x:122:133:Libvirt Dnsmasq,,,:/var/lib/libvirt/dnsmasq:/usr/sbin/nologin
carol:x:1000:2000:Carol Smith,Finance,,,Main Office:/home/carol:/bin/bash
dave:x:1001:1000:Dave Edwards,Finance,,,Main Office:/home/dave:/bin/ksh
emma:x:1002:1000:Emma Jones,Finance,,,Main Office:/home/emma:/bin/bash
frank:x:1003:1000:Frank Cassidy,Finance,,,Main Office:/home/frank:/bin/bash
grace:x:1004:1000:Grace Kearns,Engineering,,,Main Office:/home/grace:/bin/ksh
henry:x:1005:1000:Henry Adams,Sales,,,Main Office:/home/henry:/bin/bash
john:x:1006:1000:John Chapel,Sales,,,Main Office:/home/john:/bin/bash
```

**3.1. Выведи всех пользователей из группы 1000 с помощью `sed`.**

<details>
<summary>Ответ</summary>

```bash
sed -n /:1000:[A-Z]/p mypasswd
```

Наивный вариант `sed -n /1000/p mypasswd` тоже выдаст carol, потому что её UID равен 1000. Регулярное выражение `/:1000:[A-Z]/` требует, чтобы после `1000:` сразу шла заглавная буква — это поле GECOS, что однозначно указывает на GID.

</details>

---

**3.2. Выведи только полные имена пользователей из группы 1000.**

<details>
<summary>Ответ</summary>

```bash
sed -n /:1000:[A-Z]/p mypasswd | cut -d: -f5 | cut -d, -f1
```

Пятое поле содержит `Dave Edwards,Finance,,,Main Office`, поэтому второй `cut` по `,` извлекает только имя.

Результат:
```
Dave Edwards
Emma Jones
Frank Cassidy
Grace Kearns
Henry Adams
John Chapel
```

</details>

---

### Исследовательские упражнения (Explorational Exercises)

**Упражнение 1 — Розыгрыш призов**

Выбери случайного сотрудника Main Office для розыгрыша, используя `sed`, `cut` и `sort -R`.

<details>
<summary>Ответ</summary>

```bash
sed -n /'Main Office'/p mypasswd | cut -d: -f5 | cut -d, -f1 | sort -R | head -1
```

Разбор:
- `sed -n /'Main Office'/p mypasswd` — строки только с "Main Office"
- `cut -d: -f5` — пятое поле (полное имя + должность)
- `cut -d, -f1` — только имя и фамилия до первой запятой
- `sort -R` — случайная сортировка (каждый запуск даёт разный порядок)
- `head -1` — берём только первое имя

</details>

---

**Упражнение 2 — Подсчёт по отделам**

Сколько человек работает в Finance, Engineering и Sales?

<details>
<summary>Ответ</summary>

```bash
sed -n /'Main Office'/p mypasswd | cut -d, -f2 | uniq -c
```

Результат:
```
4 Finance
1 Engineering
2 Sales
```

> `uniq` работает только со смежными строками. Если данные не упорядочены, нужно добавить `sort` перед `uniq`. В данном случае строки уже идут подряд по отделу.

</details>

---

**Упражнение 3 — Создание CSV-файла**

Подготовь файл `names.csv` для импорта в LibreOffice в формате:

```
First Name,Last Name,Position
Carol,Smith,Finance
...
John,Chapel,Sales
```

<details>
<summary>Ответ</summary>

Сначала собираем три отдельных файла:
```bash
sed -n /'Main Office'/p mypasswd | cut -d: -f5 | cut -d" " -f1 > firstname
sed -n /'Main Office'/p mypasswd | cut -d: -f5 | cut -d" " -f2 | cut -d, -f1 > lastname
sed -n /'Main Office'/p mypasswd | cut -d: -f5 | cut -d, -f2 > department
```

Склеиваем через `paste` и заменяем табуляцию на запятую:
```bash
paste firstname lastname department | tr '\t' , > names.csv
```

Или короче:
```bash
paste -d, firstname lastname department > names.csv
```

Самый компактный вариант без промежуточных файлов:
```bash
sed -n /'Main Office'/p mypasswd | cut -d: -f5 | cut -d, -f1,2 | tr ' ' , > names.csv
```

</details>

---

**Упражнение 4 — Проверка целостности md5sum**

Убедись, что файл `names.csv` не был изменён при передаче.

<details>
<summary>Ответ</summary>

Считаем хеш:
```bash
md5sum names.csv
# 61f0251fcab61d9575b1d0cbf0195e25  names.csv
```

Если изменить файл, хеш полностью изменится:
```bash
sed -i.backup s/Jones/James/ names.csv
md5sum names.csv
# f44a0d68cb480466099021bf6d6d2e65  names.csv
```

Передавать файл и хеш лучше по разным каналам. Тот же принцип используют дистрибутивы Linux: рядом с ISO-образом публикуют файлы `SHA256SUMS` или `MD5SUMS`. Для реальной безопасности используй SHA-256 или SHA-512 — MD5 криптографически ненадёжен.

</details>

---

**Упражнение 5 — Разбивка книги на части**

Разбей текстовый файл книги на части по 100 строк.

<details>
<summary>Ответ</summary>

Скачать книгу с Project Gutenberg:
```bash
wget https://www.gutenberg.org/files/50461/50461-0.txt
```

Разбить на части по 100 строк с числовыми суффиксами:
```bash
split -l 100 -d 50461-0.txt melville
```

Флаги: `-l 100` — по 100 строк, `-d` — числовые суффиксы (melville00, melville01...).

Проверить количество строк в файле:
```bash
nl melville00 | tail -1
```

</details>

---

**Упражнение 6 — ls -l, tr и cut**

Выводи информацию о файлах из `/etc`, комбинируя `ls -l`, `tr` и `cut`.

<details>
<summary>Ответ</summary>

Проблема `ls -l`: несколько пробелов между полями мешают `cut`. Сжимаем их с помощью `tr -s ' '`:

```bash
ls -l /etc | tr -s ' '
```

Только имена файлов (9-е поле):
```bash
ls -l /etc | tr -s ' ' | cut -d" " -f9
```

Имя файла и владелец (поля 9 и 3):
```bash
ls -l /etc | tr -s ' ' | cut -d" " -f9,3
```

Только каталоги с их владельцами:
```bash
ls -l /etc | grep ^d | tr -s ' ' | cut -d" " -f9,3
```

`grep ^d` оставляет только строки, начинающиеся с `d` (признак каталога в `ls -l`).

</details>

---

**Упражнение 7 — Мониторинг лога и USB-накопитель**

Используй `tail -f` для мониторинга `/var/log/syslog` и вставь USB-накопитель. Найди модель, производителя и объём памяти устройства.

<details>
<summary>Ответ</summary>

```bash
tail -f /var/log/syslog | grep -i 'product\:\|blocks\|manufacturer'
```

Пример вывода:
```
Nov  8 06:01:35 hostname kernel: usb 1-4.3: Product: Cruzer Blade
Nov  8 06:01:35 hostname kernel: usb 1-4.3: Manufacturer: SanDisk
Nov  8 06:01:37 hostname kernel: sd 2:0:0:0: [sdc] 61056064 512-byte logical blocks: (31.3 GB/29.1 GiB)
```

Флаг `-i` у `grep` игнорирует регистр. Символ `|` внутри кавычек работает как логическое ИЛИ. Обратный слеш экранирует `|` от интерпретации оболочкой.

</details>

---


## Связанные темы

- [103.1 Работа в командной строке](/posts/ru/lpic1-103-1-work-on-command-line/) — перенаправление ввода-вывода, конвейеры
- 103.3 Управление файлами — управление файлами
- 103.4 Потоки, конвейеры и перенаправления
- 103.7 Текстовые редакторы — vi и nano

---

*Конспекты LPIC-1 | Тема 103: Команды GNU и Unix*
