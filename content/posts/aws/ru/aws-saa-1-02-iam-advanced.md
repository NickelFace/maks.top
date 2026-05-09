---
title: "AWS SAA — 1.02 IAM Advanced: Organizations, SCP, Identity Center, Cognito"
date: 2026-05-09
description: "AWS Organizations, Service Control Policies, IAM Identity Center (SSO), федерация SAML/OIDC, Cognito User Pools vs Identity Pools и RAM — полное покрытие SAA-C03."
tags: ["AWS", "SAA-C03", "IAM", "Organizations", "Cognito", "SSO", "RAM"]
categories: ["AWS SAA"]
page_lang: "ru"
lang_pair: "/posts/aws/aws-saa-1-02-iam-advanced/"
pagefind_ignore: true
build:
  list: never
  render: always
---

## AWS Organizations

AWS Organizations позволяет централизованно управлять **несколькими AWS-аккаунтами** в единой иерархии.

### Структура

```
Root
├── Management Account (master)
├── OU: Production
│   ├── Account: prod-web
│   └── Account: prod-db
├── OU: Development
│   └── Account: dev-sandbox
└── OU: Security
    ├── Account: log-archive
    └── Account: security-tooling
```

| Понятие | Описание |
|---|---|
| **Root** | Верхний уровень иерархии; содержит все OU и аккаунты |
| **Management account** | Создаёт организацию и управляет ею; сюда стекается биллинг |
| **Member account** | Любой аккаунт, кроме management |
| **OU (Organizational Unit)** | Логическая группа аккаунтов; вложенность до 5 уровней |

### Консолидированный биллинг

Расходы всех member-аккаунтов агрегируются в management-аккаунте. Выгода: **скидки за объём** (EC2 RI, S3 тиры) суммируются по всем аккаунтам.

> **📌 Tip:** Management account в старой документации называется «master account». На экзамене оба термина означают одно и то же.

---

## Service Control Policies (SCP)

SCP — это **организационные ограничители**, которые задают максимум того, что могут разрешить IAM-политики в member-аккаунтах. Сами по себе они **не выдают разрешения**.

### Как работают SCP

- Применяются на уровне Root, OU или Account
- **Наследуются вниз**: SCP на OU применяется ко всем дочерним OU и аккаунтам
- Вычисляются **до** identity-based политик
- **Management account всегда исключён** — SCP на него не действуют

### Пример наследования SCP

```
Root SCP: Allow all (по умолчанию FullAWSAccess)
  └── OU: Production  SCP: Deny ec2:TerminateInstances
        └── Account: prod-web  (наследует Deny из OU)
```

### Стратегии: Denylist vs Allowlist

| Стратегия | Принцип | Когда использовать |
|---|---|---|
| **Denylist** (по умолчанию) | FullAWSAccess на Root + Deny-SCP ниже | Максимальная гибкость; запрет конкретных опасных действий |
| **Allowlist** | Убрать FullAWSAccess; явно Allow только нужных сервисов | Высокая безопасность; строгий комплайнс |

```json
// SCP: запретить отключение CloudTrail в любом member-аккаунте
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "DenyCloudTrailDisable",
    "Effect": "Deny",
    "Action": [
      "cloudtrail:StopLogging",
      "cloudtrail:DeleteTrail",
      "cloudtrail:UpdateTrail"
    ],
    "Resource": "*"
  }]
}
```

### Чего SCP не могут

| Не могут | Примечание |
|---|---|
| Выдавать разрешения | SCP только ограничивают |
| Влиять на management account | Всегда исключён |
| Влиять на service-linked roles | SLR обходят SCP |
| Заменять IAM-политики | Оба уровня должны разрешать действие |

> **📌 Tip:** Главная ловушка с SCP: даже если SCP разрешает действие, IAM-политика в аккаунте тоже должна его разрешать. Оба уровня должны Allow. И наоборот: SCP Deny блокирует даже root-пользователя аккаунта (кроме management account).

---

## IAM Identity Center (ранее AWS SSO)

IAM Identity Center обеспечивает **централизованный SSO** для всех AWS-аккаунтов в Organizations и сторонних SaaS-приложений.

### Основные компоненты

| Компонент | Описание |
|---|---|
| **Identity source** | Источник пользователей и групп: встроенный каталог, Active Directory (через AD Connector или AWS Managed AD), или внешний IdP |
| **Permission set** | Набор IAM-политик, определяющий доступ в AWS-аккаунте |
| **Account assignment** | Связывает пользователя/группу + permission set с конкретным аккаунтом |
| **AWS access portal** | Self-service веб-портал, где пользователи выбирают аккаунт и роль |

### Permission Sets

Permission set — это не IAM-роль, но при подготовке (provisioning) в аккаунте становится ею. Identity Center создаёт роли вида `AWSReservedSSO_<PermissionSetName>_<hash>`.

```yaml
# Пример permission set (концептуально)
Name: ReadOnlyAccess
ManagedPolicies:
  - arn:aws:iam::aws:policy/ReadOnlyAccess
SessionDuration: PT8H   # 8 часов
```

### Attribute-Based Access Control (ABAC)

Пробросить атрибуты пользователя (отдел, команда, costCenter) из identity source в IAM condition keys. Одна политика работает для всех команд:

```json
{
  "Condition": {
    "StringEquals": {
      "aws:ResourceTag/Project": "${aws:PrincipalTag/Project}"
    }
  }
}
```

> **📌 Tip:** Экзамен предпочитает Identity Center управлению IAM-пользователями в каждом аккаунте. Любой сценарий «сотни аккаунтов, централизованный вход, единые credentials» → IAM Identity Center.

---

## Федерация SAML 2.0 и OIDC

### SAML 2.0 (корпоративный IdP → AWS)

Используется, когда в организации уже есть Identity Provider (Active Directory, Okta, Ping).

```
Пользователь → Корп. IdP → SAML assertion → STS:AssumeRoleWithSAML → Временные credentials
```

**Необходимая настройка:**
1. Настроить доверие между AWS и IdP (загрузить метаданные IdP)
2. Создать IAM-роль с SAML trust policy
3. IdP выдаёт SAML assertion с ARN роли и ARN провайдера

### OIDC (OpenID Connect)

Используется для workload-идентичностей с OIDC-токеном (GitHub Actions, Kubernetes IRSA, мобильные приложения).

```bash
# GitHub Actions — без статичных credentials
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
    aws-region: us-east-1
```

| Тип федерации | Когда использовать |
|---|---|
| SAML 2.0 | Корпоративные пользователи, AD/LDAP, существующий IdP |
| OIDC | Workload identity, GitHub Actions, EKS pods |
| Identity Center | Лучший выбор, когда возможен; внутри использует SAML/OIDC |
| Cognito | Клиентские приложения с социальным входом |

---

## Amazon Cognito

Cognito обеспечивает **аутентификацию и авторизацию пользователей приложений** (не пользователей AWS-аккаунта).

### User Pools vs Identity Pools

| | **User Pool** | **Identity Pool** |
|---|---|---|
| **Назначение** | Каталог пользователей; регистрация и вход | Обмен токенов на временные AWS-credentials |
| **Результат** | JWT-токены (ID token, access token, refresh token) | STS credentials (Access Key + Secret + Token) |
| **Возможности** | Пароли, MFA, подтверждение email, соцсети | Маппинг аутент./неаутент. пользователей на IAM-роли |
| **Сценарий** | «Войти в моё приложение» | «Пользователи приложения напрямую вызывают S3/DynamoDB» |

### Комбинированный сценарий (наиболее распространён)

```
Пользователь → Cognito User Pool (аутентификация) → JWT
             → Cognito Identity Pool (обмен JWT) → STS credentials
             → Приложение вызывает AWS API (например, загрузка в S3)
```

### Социальные провайдеры в Cognito

User Pools поддерживают федерацию с:
- Google, Facebook, Apple (встроенные)
- Любым OIDC или SAML провайдером
- Amazon

### Неаутентифицированный (гостевой) доступ

Identity Pools могут выдавать AWS credentials **неаутентифицированным** пользователям — полезно для анонимного чтения публичных ресурсов S3 или DynamoDB.

> **📌 Tip:** Ловушка экзамена: **User Pool аутентифицирует** (нет AWS credentials); **Identity Pool авторизует доступ к AWS** (выдаёт credentials). «Мобильное приложение должно обращаться к DynamoDB» → нужны оба, или только Identity Pool с внешним IdP. «Добавить социальный вход в веб-приложение» → User Pool.

---

## Resource Access Manager (RAM)

AWS RAM позволяет **делиться ресурсами между AWS-аккаунтами** (внутри организации или за её пределами) без дублирования.

### Ресурсы, которые можно шарить (часто на экзамене)

| Ресурс | Примечание |
|---|---|
| Подсети VPC | Поделиться подсетью между аккаунтами в Org — инстансы в разных аккаунтах в одном VPC |
| Transit Gateway | Поделиться TGW-вложением между аккаунтами |
| Route 53 Resolver rules | Централизованное DNS-разрешение |
| License Manager configurations | Централизованный учёт BYOL-лицензий |
| AWS Glue Data Catalog | Общий каталог метаданных между аккаунтами |

### Шаринг подсетей VPC (ключевой сценарий)

```
Аккаунт A: владелец VPC + подсетей (resource owner)
Аккаунт B: запускает EC2-инстансы в подсетях аккаунта A
           (EC2 биллится аккаунту B; ресурсы подсети — в аккаунте A)
```

Преимущества: не нужен VPC peering; security groups в аккаунте B; централизованное управление сетью.

> **📌 Tip:** RAM vs VPC Peering: шаринг подсетей через RAM предпочтителен для организационных workload — проще, чем peerить каждую пару VPC. Вопрос «несколько аккаунтов, одна сеть VPC, без лишних соединений» → RAM subnet sharing.

---

## Сравнение: паттерны кросс-аккаунтного доступа

| Паттерн | Когда использовать | Механизм |
|---|---|---|
| IAM Role + AssumeRole | Любой кросс-аккаунтный AWS API доступ | Trust policy + STS |
| RAM | Шаринг инфраструктуры (VPC, TGW) | Resource sharing, без обмена credentials |
| S3 bucket policy | Дать другому аккаунту доступ к S3 | Resource-based policy |
| VPC Peering | Сетевое соединение между VPC | Route table + SG правила |
| IAM Identity Center | Человеческий SSO в много аккаунтов | Permission sets |
| Cognito Identity Pools | Пользователи приложений вызывают AWS API | JWT → STS обмен |

---

## Типичные ловушки на экзамене

| Ловушка | Правильное понимание |
|---|---|
| «SCP применяется к management account» | Неверно — management account всегда исключён |
| «SCP выдаёт разрешения как IAM-политика» | Неверно — SCP только ограничивает; IAM-политика тоже должна Allow |
| «SCP на Root применяется только к Root» | Неверно — наследуется вниз по всем OU и аккаунтам |
| «Identity Center заменяет IAM» | Неверно — управляет доступом к аккаунтам; IAM внутри аккаунтов остаётся |
| «Cognito User Pool выдаёт AWS credentials» | Неверно — User Pool выдаёт JWT; Identity Pool выдаёт STS credentials |
| «RAM копирует ресурсы в каждый аккаунт» | Неверно — ресурсы шарятся на месте; биллятся владельцу |
| «SAML-федерация требует IAM-пользователей» | Неверно — федеративные пользователи принимают IAM-роли; IAM user не нужен |
| «SLR блокируются SCP» | Неверно — service-linked roles обходят SCP |
