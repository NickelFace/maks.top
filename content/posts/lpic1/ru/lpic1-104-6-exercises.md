---
title: "LPIC-1 104.6 — Упражнения и разборы"
date: 2026-04-19
description: "Практические и исследовательские упражнения по теме 104.6: жёсткие и символьные ссылки, ln, ls -li, битые ссылки. Тема 104.6 экзамена LPIC-1."
tags: ["Linux", "LPIC-1", "ln", "symlink", "hardlink", "ссылки", "упражнения"]
categories: ["LPIC-1"]
page_lang: "ru"
lang_pair: "/posts/lpic1/lpic1-104-6-exercises/"
pagefind_ignore: true
build:
  list: never
  render: always
---

> **Тема 104.6** — Создание и изменение жёстких и символьных ссылок. Практические и исследовательские разборы.

---

## Практические упражнения (Guided)

### 1. Параметр chmod для sticky bit

**Вопрос:** какой параметр в символьном режиме `chmod` включает sticky bit на каталоге?

**Ответ:**

```bash
chmod +t /path/to/dir
# или явно для остальных:
chmod o+t /path/to/dir
```

Символ sticky bit — `t`. Чтобы включить — передаётся `+t`.

---

### 2. Команда для создания символьной ссылки

**Задача:** в каталоге `/home/carol/Documents` лежит файл `document.txt`. Создать в текущем каталоге символьную ссылку на него с именем `text.txt`.

**Ответ:**

```bash
ln -s /home/carol/Documents/document.txt text.txt
```

Флаг `-s` создаёт символьную ссылку. Так как файл лежит не в текущем каталоге, указываем полный путь — иначе относительная ссылка сломается при перемещении.

---

### 3. Жёсткая ссылка против копии

**Вопрос:** объясни разницу между жёсткой ссылкой на файл и копией этого файла.

**Ответ:**

**Жёсткая ссылка** — второе имя для одного и того же файла. Ссылка и оригинал указывают на одни данные на диске. Изменения через любое из имён видны через остальные.

**Копия** — полностью независимая сущность: новый инод, новые блоки на диске. Изменения в копии не влияют на оригинал.

---

## Исследовательские упражнения (Explorational)

### 1. Удаление цели и судьба символьной ссылки

**Сценарий:** создаём файл, жёсткую ссылку и символьную ссылку:

```bash
touch recipes.txt
ln recipes.txt receitas.txt
ln -s receitas.txt rezepte.txt
```

```
5388833 -rw-r--r-- 2 carol carol  0 recipes.txt
5388833 -rw-r--r-- 2 carol carol  0 receitas.txt
5388837 lrwxrwxrwx 1 carol carol 12 rezepte.txt -> receitas.txt
```

**Вопрос:** что произойдёт с `rezepte.txt` после `rm receitas.txt`?

**Ответ:** `rezepte.txt` станет **битой ссылкой**. Символьные ссылки указывают на **имена**, а не на иноды. Имени `receitas.txt` больше нет — ссылка ведёт в никуда.

Сами данные на диске сохранились: они доступны через `recipes.txt` (жёсткую ссылку с тем же инодом), но символьная ссылка об этом ничего не знает.

---

### 2. Жёсткая ссылка на флешку

**Сценарий:** флешка смонтирована в `/media/youruser/FlashA`. Выполняем:

```bash
ln /media/youruser/FlashA/esquema.pdf ~/schematics.pdf
```

**Вопрос:** что произойдёт? Почему?

**Ответ:** ошибка `Invalid cross-device link`. Жёсткие ссылки не работают между разными устройствами/разделами: инод имеет смысл только внутри своей ФС.

Решение — символьная ссылка:

```bash
ln -s /media/youruser/FlashA/esquema.pdf ~/schematics.pdf
```

---

### 3. Анализ вывода ls -lah

**Сценарий:**

```
-rw-rw-r-- 1 carol carol 2,8M jun 17 15:45 compressed.zip
-rw-r--r-- 4 carol carol  77K jun 17 17:25 document.txt
-rw-rw-r-- 1 carol carol 216K jun 17 17:25 image.png
-rw-r--r-- 4 carol carol  77K jun 17 17:25 text.txt
```

**Вопросы:**

- Сколько ссылок указывает на `document.txt`?
- Это жёсткие или символьные ссылки?
- Какой параметр `ls` покажет инод?

**Ответы:**

На `document.txt` указывает **4 имени** (link count = 4). Стартовый счётчик = 1 (само имя), значит добавлено **3 жёсткие ссылки**.

Это **жёсткие** ссылки — символьные не увеличивают link count цели.

Параметр **`-i`**:

```bash
ls -lahi
# 5388833 -rw-r--r-- 4 carol carol  77K document.txt
# 5388833 -rw-r--r-- 4 carol carol  77K text.txt
```

`document.txt` и `text.txt` имеют одинаковый инод `5388833` → `text.txt` одна из тех жёстких ссылок.

---

### 4. Перемещение относительной символьной ссылки

**Сценарий:**

```
~/Documents/
├── clients.txt          ("John, Michael, Bob")
└── somedir/
    ├── clients.txt      ("Bill, Luke, Karl")
    └── partners.txt -> clients.txt   (относительная ссылка)
```

```bash
mv ~/Documents/somedir/partners.txt ~/Documents/
less ~/Documents/partners.txt
```

**Вопрос:** ссылка сработает? Чьё содержимое покажет `less`?

**Ответ:** ссылка сработает, но покажет `~/Documents/clients.txt` со строкой `John, Michael, Bob` — **не тот файл, что ожидался**.

Почему: `partners.txt` указывает на `clients.txt` **относительно своего расположения**. После перемещения из `somedir/` в `Documents/` ссылка ищет `clients.txt` рядом с собой — и находит `Documents/clients.txt` вместо `somedir/clients.txt`.

Решение: всегда используй **абсолютный путь** при создании символьной ссылки:

```bash
ln -s /home/carol/Documents/somedir/clients.txt partners.txt
```

---

### 5. Права доступа символьной ссылки

**Сценарий:**

```
-rw-r--r-- 1 carol carol 19 Jun 24 11:12 clients.txt
lrwxrwxrwx 1 carol carol 11 Jun 24 11:13 partners.txt -> clients.txt
```

**Вопрос:** какие фактические права доступа у `partners.txt`?

**Ответ:** `rw-r--r--` — права цели (`clients.txt`).

Символьная ссылка всегда показывает `lrwxrwxrwx` в `ls -l`, но это её собственные атрибуты. Реальный доступ через ссылку определяется **правами цели**.
