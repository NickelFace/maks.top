---
title: "AWS SAA — 7.02 ECS, EKS и Fargate"
date: 2026-05-09
description: "Task definitions ECS, типы запуска (EC2 vs Fargate), узловые группы EKS, ECR, автомасштабирование сервисов и выбор между контейнерными сервисами — полный разбор для SAA-C03."
tags: ["AWS", "SAA-C03", "ECS", "EKS", "Fargate", "containers"]
categories: ["AWS SAA"]
page_lang: "ru"
lang_pair: "/posts/aws/aws-saa-7-02-containers/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## Основные концепции ECS

Amazon ECS (Elastic Container Service) — нативная платформа оркестрации контейнеров AWS.

| Концепция | Описание |
|---|---|
| **Cluster** | Логическая группа задач и сервисов; может охватывать несколько AZ |
| **Task Definition** | Чертёж контейнера (образ, CPU, память, переменные среды, тома, логирование, порты) |
| **Task** | Запущенный экземпляр task definition; эфемерный |
| **Service** | Длительно работающие задачи с desired count; интеграция с ALB/NLB |
| **Container Agent** | Работает на каждом EC2-инстансе; регистрирует его в кластере |

### Стратегии размещения задач (только EC2 launch type)
| Стратегия | Поведение |
|---|---|
| `binpack` | Размещать задачи для максимизации утилизации; минимизировать активные инстансы |
| `spread` | Равномерно распределять задачи по инстансам/AZ |
| `random` | Случайное размещение |

Ограничения размещения:
- `distinctInstance` — каждая задача на отдельном EC2
- `memberOf` — размещение на инстансах, соответствующих выражению (например, тип инстанса)

---

## Типы запуска: EC2 vs Fargate

| Функция | EC2 | Fargate |
|---|---|---|
| Управление инстансами | Вы управляете парком EC2 | AWS управляет (serverless) |
| Оплата | EC2 + ECS без доп. стоимости | Per-task vCPU + память в секунду |
| Поддержка Spot | Да (EC2 Spot Instances) | Да (Fargate Spot) |
| Поддержка GPU | Да (G/P-типы инстансов) | Нет |
| SSH к хосту | Да | Нет |
| Видимость хоста | Полная | Никакой |
| Хранилище | EBS/EFS на EC2 | Эфемерное (20 ГБ) + EFS для персистентного |
| Применение | Большие устойчивые нагрузки, GPU, кастомная ОС | Serverless, dev/test, переменные нагрузки |

> **📌 Tip:** Fargate не поддерживает GPU-нагрузки. Любой сценарий с GPU-контейнерами → тип запуска EC2 с G/P-инстансами.

---

## ECS с ALB: Dynamic Port Mapping

На типе EC2 контейнеру можно назначить **случайный host-порт** — ALB target group обнаруживает его динамически:

```yaml
# Port mapping в Task Definition (EC2 launch type)
containerPort: 8080
hostPort: 0        # 0 = динамический порт; ALB обнаруживает через ECS API
```

Это позволяет запускать **несколько копий задачи на одном EC2-хосте** — удобно для bin-packing. На Fargate каждая задача получает свой ENI, поэтому маппинг прямолинейный (containerPort = hostPort).

---

## Автомасштабирование сервиса ECS

ECS Service Auto Scaling использует Application Auto Scaling с тремя политиками:

| Политика | Триггер |
|---|---|
| **Target Tracking** | Держать метрику (CPU/память/ALB requests per target) на целевом значении |
| **Step Scaling** | Масштабировать на фиксированные величины по порогам CloudWatch-алармов |
| **Scheduled Scaling** | Масштабировать до заданного desired count по расписанию |

Ёмкость EC2-кластера: используйте **EC2 Auto Scaling Group** (или **ECS Cluster Auto Scaling** с Capacity Providers) для добавления/удаления инстансов по мере изменения количества задач.

---

## ECS Anywhere

- Запуск ECS-задач на **on-premises серверах** или ВМ вне AWS
- Регистрация внешних инстансов в ECS-кластере через SSM agent + ECS agent
- AWS управляет control plane; вы управляете серверами
- Применение: гибридное облако, требования локализации данных, использование существующего on-prem оборудования

---

## ECR (Elastic Container Registry)

| Функция | Детали |
|---|---|
| Приватный реестр | Per-account, per-region |
| Сканирование образов | Basic (CVE при push) и Enhanced (непрерывно, на базе Inspector) |
| Lifecycle-политики | Автоматическое удаление старых/непомеченных образов для управления стоимостью |
| Cross-region репликация | Репликация образов в другие регионы для мультирегиональных деплоев |
| Cross-account | Общий доступ через resource-based policy |
| Шифрование | KMS в покое |
| Pull-аутентификация | `aws ecr get-login-password` → Docker login |

> **📌 Tip:** ECR хранит образы; ECS/EKS тянет их из ECR. ECR — нативная AWS-альтернатива Docker Hub. Используйте ECR для production-образов в AWS.

---

## EKS (Elastic Kubernetes Service)

EKS — **управляемый control plane Kubernetes**: AWS запускает etcd и API-сервер; вы управляете worker-узлами.

### Типы узловых групп
| Тип | Описание |
|---|---|
| **Managed Node Group** | AWS провижнит/обновляет EC2; использует Launch Templates; cordon/drain при обновлении |
| **Self-Managed Nodes** | Вы вручную провижните и подключаете EC2 или через CloudFormation |
| **Fargate Profiles** | Serverless-поды — без управления узлами; задаёте selectors namespace/label |

### EKS Anywhere
- Запуск EKS **on-premises** на bare metal или VMware
- Тот же Kubernetes API, инструменты AWS, модель control plane
- Применение: единый Kubernetes в гибридной среде, локальная обработка данных

### EKS Add-ons
- Управляемые AWS add-ons: CoreDNS, kube-proxy, Amazon VPC CNI, EBS CSI driver
- Обновляются независимо от версии кластера

---

## App Mesh

- Управляемый AWS **service mesh** на базе Envoy-прокси
- Предоставляет: управление трафиком, retry, timeout, circuit breaker, mutual TLS между сервисами
- Работает с: ECS, EKS, EC2, Lambda
- Применение: микросервисы с наблюдаемостью и управлением трафиком без изменений кода

---

## AWS Copilot

- CLI-инструмент, оборачивающий best practices ECS в простые команды
- `copilot init`, `copilot deploy`, `copilot svc logs`
- Автоматически создаёт: ECS service, task definition, ALB, ECR repo, VPC (при необходимости)
- Целевая аудитория: разработчики, которым нужен ECS без прямого управления инфраструктурой

---

## Что выбрать

| Сценарий | Рекомендуемый сервис |
|---|---|
| Простое контейнерное API, K8s не нужен | ECS + Fargate |
| Kubernetes-нагрузки, переносимость, экосистема | EKS |
| Без управления инстансами, оплата per-task | Fargate (ECS или EKS) |
| GPU-контейнеры для ML-инференса | ECS EC2 (G/P-тип инстанса) |
| On-premises контейнеры под управлением AWS | ECS Anywhere / EKS Anywhere |
| Микросервисы с управлением трафиком | ECS/EKS + App Mesh |
| CI/CD push, простой workflow разработчика | AWS Copilot |
| Пиковые/Spot контейнерные нагрузки | ECS EC2 со Spot Instances |

---

## Ловушки на экзамене

| Ловушка | Правильный ответ |
|---|---|
| Fargate поддерживает GPU | Ложь — нужен тип запуска EC2 |
| Task role ECS = instance role | Ложь — task role per-task IAM; instance role — для EC2-хоста |
| Полный контроль ОС в EKS managed node group | Ограничен — AWS управляет патчингом; для полного контроля — self-managed |
| Lifecycle-политики ECR удаляют образы | Верно — используйте для контроля стоимости хранилища |
| Dynamic port mapping на Fargate | Не нужен — каждая Fargate-задача имеет свой ENI |
| ECS Anywhere требует агентов | SSM agent + ECS agent на каждом внешнем инстансе |
| Модель оплаты Fargate | Per vCPU + память в секунду (не per EC2-инстанс) |
