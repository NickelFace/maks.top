---
title: "AWS SAA-C03 Roadmap"
description: "AWS SAA-C03 Roadmap: 8 фаз подготовки, 4 экзаменационных домена, трекер прогресса"
page_lang: "ru"
lang_pair: "/roadmap/aws/"
pagefind_ignore: true
build:
  list: never
  render: always
cert_link: "/certs/aws-saa/"
cert_name: "AWS SAA"
store_key: "rdm.aws"
total: 64
total_label: "тем"
---

<div class="rdm-eyebrow">§ AWS SAA-C03 · Solutions Architect Associate</div>
<h1 class="rdm-h1">Облачная <em>архитектура.</em></h1>
<p class="rdm-lead">8 фаз от нулевой настройки аккаунта до финального экзамена. Отмечай темы по мере изучения, прогресс сохраняется в браузере и обновляет карточку на главной странице роадмапа.</p>

<!-- Exam params -->
<div class="params-grid">
<div class="param-card"><div class="param-label">Код</div><div class="param-value">SAA-C03</div></div>
<div class="param-card"><div class="param-label">Вопросов</div><div class="param-value">65 (~50 оцен.)</div></div>
<div class="param-card"><div class="param-label">Время</div><div class="param-value">130 минут</div></div>
<div class="param-card"><div class="param-label">Проходной балл</div><div class="param-value">720 / 1000</div></div>
<div class="param-card"><div class="param-label">Стоимость</div><div class="param-value">$150 USD</div></div>
<div class="param-card"><div class="param-label">Действие</div><div class="param-value">3 года</div></div>
</div>

<!-- Domain weights -->
<div class="domain-weights">
<div class="dw-card"><span class="dw-pct">30%</span><span class="dw-name">Design Secure Architectures</span></div>
<div class="dw-card"><span class="dw-pct">26%</span><span class="dw-name">Design Resilient Architectures</span></div>
<div class="dw-card"><span class="dw-pct">24%</span><span class="dw-name">Design High-Performing Architectures</span></div>
<div class="dw-card"><span class="dw-pct">20%</span><span class="dw-name">Design Cost-Optimized Architectures</span></div>
</div>

<!-- Overall progress -->
<div class="overall-progress">
<div class="op-header">
<span class="op-title">Общий прогресс</span>
<span class="op-count" id="op-count">0 / 64 тем</span>
</div>
<div class="op-bar"><div class="op-fill" id="op-fill" style="width:0%"></div></div>
<div class="op-phases">
<span class="op-phase">Фаза 0 <strong id="p0cnt">0/8</strong></span>
<span class="op-phase">Фаза 1 <strong id="p1cnt">0/18</strong></span>
<span class="op-phase">Фаза 2 <strong id="p2cnt">0/8</strong></span>
<span class="op-phase">Фаза 3 <strong id="p3cnt">0/10</strong></span>
<span class="op-phase">Фаза 4 <strong id="p4cnt">0/12</strong></span>
<span class="op-phase">Фаза 5 <strong id="p5cnt">0/8</strong></span>
</div>
</div>

<hr class="rdm-divider">
<div class="rdm-section-label">Фазы подготовки</div>

<!-- PHASE 0 -->
<div class="phase-acc">
<details>
<summary class="phase-header">
<span class="phase-num">Фаза 0</span>
<span class="phase-name">Фундамент и среда</span>
<span class="phase-time-tag">1 неделя</span>
<span class="phase-prog-bar">
<span class="ppb-track"><span class="ppb-fill" id="p0-bar" style="width:0%"></span></span>
<span class="ppb-text" id="p0-txt">0/8</span>
</span>
<span class="phase-arrow">›</span>
</summary>
<div class="phase-body">
<div class="sub-section">
<div class="topic-item" data-phase="p0" data-key="aws-p0-01"><input type="checkbox" class="topic-cb" data-key="aws-p0-01" data-domain="p0"><span class="topic-text">Создать AWS аккаунт, задать регион</span></div>
<div class="topic-item" data-phase="p0" data-key="aws-p0-02"><input type="checkbox" class="topic-cb" data-key="aws-p0-02" data-domain="p0"><span class="topic-text">Включить MFA на root, больше root не использовать</span></div>
<div class="topic-item" data-phase="p0" data-key="aws-p0-03"><input type="checkbox" class="topic-cb" data-key="aws-p0-03" data-domain="p0"><span class="topic-text">Создать IAM-пользователя для повседневной работы + Admin-роль</span></div>
<div class="topic-item" data-phase="p0" data-key="aws-p0-04"><input type="checkbox" class="topic-cb" data-key="aws-p0-04" data-domain="p0"><span class="topic-text">Поставить AWS CLI v2, настроить named profiles, проверить <code>aws sts get-caller-identity</code></span></div>
<div class="topic-item" data-phase="p0" data-key="aws-p0-05"><input type="checkbox" class="topic-cb" data-key="aws-p0-05" data-domain="p0"><span class="topic-text">Установить Billing Alerts ($5, $20, $50) + Budget</span></div>
<div class="topic-item" data-phase="p0" data-key="aws-p0-06"><input type="checkbox" class="topic-cb" data-key="aws-p0-06" data-domain="p0"><span class="topic-text">Изучить Free Tier: что входит и что НЕ входит (EC2 t2.micro, S3 5GB, RDS 750h)</span></div>
<div class="topic-item" data-phase="p0" data-key="aws-p0-07"><input type="checkbox" class="topic-cb" data-key="aws-p0-07" data-domain="p0"><span class="topic-text">AWS Global Infrastructure: Regions, AZs, Edge Locations, Local Zones, Wavelength</span></div>
<div class="topic-item" data-phase="p0" data-key="aws-p0-08"><input type="checkbox" class="topic-cb" data-key="aws-p0-08" data-domain="p0"><span class="topic-text">Cloud Practitioner Essentials: опциональный вводный курс (~6 часов)</span></div>
</div>
</div>
</details>
</div>

<!-- PHASE 1 -->
<div class="phase-acc">
<details>
<summary class="phase-header">
<span class="phase-num">Фаза 1</span>
<span class="phase-name">Identity · Compute · Storage · Networking</span>
<span class="phase-time-tag">3–4 недели</span>
<span class="phase-prog-bar">
<span class="ppb-track"><span class="ppb-fill" id="p1-bar" style="width:0%"></span></span>
<span class="ppb-text" id="p1-txt">0/18</span>
</span>
<span class="phase-arrow">›</span>
</summary>
<div class="phase-body">
<div class="sub-section">
<div class="sub-title">IAM</div>
<div class="topic-item" data-phase="p1" data-key="aws-p1-01"><input type="checkbox" class="topic-cb" data-key="aws-p1-01" data-domain="p1"><span class="topic-text">Users, Groups, Roles, Policies: Identity-based, Resource-based, SCPs</span></div>
<div class="topic-item" data-phase="p1" data-key="aws-p1-02"><input type="checkbox" class="topic-cb" data-key="aws-p1-02" data-domain="p1"><span class="topic-text">Policy evaluation logic, explicit deny, permission boundaries</span></div>
<div class="topic-item" data-phase="p1" data-key="aws-p1-03"><input type="checkbox" class="topic-cb" data-key="aws-p1-03" data-domain="p1"><span class="topic-text">Cross-account access через AssumeRole + IAM Identity Center, SAML/OIDC federation</span></div>

<div class="sub-title">EC2 · Storage</div>
<div class="topic-item" data-phase="p1" data-key="aws-p1-04"><input type="checkbox" class="topic-cb" data-key="aws-p1-04" data-domain="p1"><span class="topic-text">Типы инстансов: On-Demand, Reserved, Savings Plans, Spot, Dedicated Host</span></div>
<div class="topic-item" data-phase="p1" data-key="aws-p1-05"><input type="checkbox" class="topic-cb" data-key="aws-p1-05" data-domain="p1"><span class="topic-text">AMI, snapshot, User Data, метаданные IMDSv2, Placement Groups</span></div>
<div class="topic-item" data-phase="p1" data-key="aws-p1-06"><input type="checkbox" class="topic-cb" data-key="aws-p1-06" data-domain="p1"><span class="topic-text">EBS типы: gp3/gp2, io2/io1, st1, sc1; Snapshots, encryption, multi-attach</span></div>
<div class="topic-item" data-phase="p1" data-key="aws-p1-07"><input type="checkbox" class="topic-cb" data-key="aws-p1-07" data-domain="p1"><span class="topic-text">EFS: Standard/IA, Performance modes; FSx: Windows/Lustre/ONTAP; Instance Store</span></div>

<div class="sub-title">S3</div>
<div class="topic-item" data-phase="p1" data-key="aws-p1-08"><input type="checkbox" class="topic-cb" data-key="aws-p1-08" data-domain="p1"><span class="topic-text">Bucket policies vs ACL vs IAM; Storage Classes: Standard, Intelligent-Tiering, IA, Glacier</span></div>
<div class="topic-item" data-phase="p1" data-key="aws-p1-09"><input type="checkbox" class="topic-cb" data-key="aws-p1-09" data-domain="p1"><span class="topic-text">Lifecycle rules, Versioning, MFA Delete, Object Lock (governance/compliance)</span></div>
<div class="topic-item" data-phase="p1" data-key="aws-p1-10"><input type="checkbox" class="topic-cb" data-key="aws-p1-10" data-domain="p1"><span class="topic-text">Encryption: SSE-S3, SSE-KMS, SSE-C, DSSE-KMS; Replication CRR/SRR; presigned URLs</span></div>

<div class="sub-title">VPC</div>
<div class="topic-item" data-phase="p1" data-key="aws-p1-11"><input type="checkbox" class="topic-cb" data-key="aws-p1-11" data-domain="p1"><span class="topic-text">CIDR, subnets (public/private), Route Tables, IGW, NAT Gateway vs NAT Instance</span></div>
<div class="topic-item" data-phase="p1" data-key="aws-p1-12"><input type="checkbox" class="topic-cb" data-key="aws-p1-12" data-domain="p1"><span class="topic-text">Security Groups (stateful) vs NACL (stateless): ключевое различие</span></div>
<div class="topic-item" data-phase="p1" data-key="aws-p1-13"><input type="checkbox" class="topic-cb" data-key="aws-p1-13" data-domain="p1"><span class="topic-text">VPC Endpoints: Gateway (S3, DynamoDB) vs Interface (PrivateLink); VPC Peering vs Transit Gateway</span></div>
<div class="topic-item" data-phase="p1" data-key="aws-p1-14"><input type="checkbox" class="topic-cb" data-key="aws-p1-14" data-domain="p1"><span class="topic-text">Site-to-Site VPN, Direct Connect, DX Gateway; VPC Flow Logs</span></div>

<div class="sub-title">ELB · Route 53</div>
<div class="topic-item" data-phase="p1" data-key="aws-p1-15"><input type="checkbox" class="topic-cb" data-key="aws-p1-15" data-domain="p1"><span class="topic-text">ALB (L7) vs NLB (L4) vs GWLB (L3): когда какой; Target Groups, Cross-Zone LB</span></div>
<div class="topic-item" data-phase="p1" data-key="aws-p1-16"><input type="checkbox" class="topic-cb" data-key="aws-p1-16" data-domain="p1"><span class="topic-text">Auto Scaling Group: Launch Templates, scaling policies, Lifecycle hooks, warm pools</span></div>
<div class="topic-item" data-phase="p1" data-key="aws-p1-17"><input type="checkbox" class="topic-cb" data-key="aws-p1-17" data-domain="p1"><span class="topic-text">Route 53 routing policies: Simple/Weighted/Latency/Failover/Geolocation/Geoproximity</span></div>
<div class="topic-item" data-phase="p1" data-key="aws-p1-18"><input type="checkbox" class="topic-cb" data-key="aws-p1-18" data-domain="p1"><span class="topic-text">Alias vs CNAME (alias бесплатный, работает на root domain); Health checks</span></div>
</div>
</div>
</details>
</div>

<!-- PHASE 2 -->
<div class="phase-acc">
<details>
<summary class="phase-header">
<span class="phase-num">Фаза 2</span>
<span class="phase-name">Databases и кэширование</span>
<span class="phase-time-tag">2 недели</span>
<span class="phase-prog-bar">
<span class="ppb-track"><span class="ppb-fill" id="p2-bar" style="width:0%"></span></span>
<span class="ppb-text" id="p2-txt">0/8</span>
</span>
<span class="phase-arrow">›</span>
</summary>
<div class="phase-body">
<div class="sub-section">
<div class="sub-title">RDS · Aurora</div>
<div class="topic-item" data-phase="p2" data-key="aws-p2-01"><input type="checkbox" class="topic-cb" data-key="aws-p2-01" data-domain="p2"><span class="topic-text">RDS Multi-AZ (HA, sync) vs Read Replicas (scale read, async): ключевое различие</span></div>
<div class="topic-item" data-phase="p2" data-key="aws-p2-02"><input type="checkbox" class="topic-cb" data-key="aws-p2-02" data-domain="p2"><span class="topic-text">RDS Proxy, Performance Insights, Backups, PITR; RDS Custom</span></div>
<div class="topic-item" data-phase="p2" data-key="aws-p2-03"><input type="checkbox" class="topic-cb" data-key="aws-p2-03" data-domain="p2"><span class="topic-text">Aurora архитектура: storage layer, 6 копий через 3 AZ; Serverless v2, Global Database, Backtrack</span></div>

<div class="sub-title">DynamoDB · ElastiCache</div>
<div class="topic-item" data-phase="p2" data-key="aws-p2-04"><input type="checkbox" class="topic-cb" data-key="aws-p2-04" data-domain="p2"><span class="topic-text">Partition key, sort key, LSI vs GSI: когда что использовать</span></div>
<div class="topic-item" data-phase="p2" data-key="aws-p2-05"><input type="checkbox" class="topic-cb" data-key="aws-p2-05" data-domain="p2"><span class="topic-text">DynamoDB On-Demand vs Provisioned, DAX, Streams + Lambda triggers, Global Tables, TTL</span></div>
<div class="topic-item" data-phase="p2" data-key="aws-p2-06"><input type="checkbox" class="topic-cb" data-key="aws-p2-06" data-domain="p2"><span class="topic-text">ElastiCache Redis vs Memcached: стратегии кэширования (lazy loading, write-through)</span></div>

<div class="sub-title">Аналитика</div>
<div class="topic-item" data-phase="p2" data-key="aws-p2-07"><input type="checkbox" class="topic-cb" data-key="aws-p2-07" data-domain="p2"><span class="topic-text">Redshift, Athena, EMR: когда что; Redshift vs RDS для аналитики</span></div>
<div class="topic-item" data-phase="p2" data-key="aws-p2-08"><input type="checkbox" class="topic-cb" data-key="aws-p2-08" data-domain="p2"><span class="topic-text">OpenSearch Service: сценарии использования, интеграция с Kinesis/CloudWatch</span></div>
</div>
</div>
</details>
</div>

<!-- PHASE 3 -->
<div class="phase-acc">
<details>
<summary class="phase-header">
<span class="phase-num">Фаза 3</span>
<span class="phase-name">Serverless и App Integration</span>
<span class="phase-time-tag">2–3 недели</span>
<span class="phase-prog-bar">
<span class="ppb-track"><span class="ppb-fill" id="p3-bar" style="width:0%"></span></span>
<span class="ppb-text" id="p3-txt">0/10</span>
</span>
<span class="phase-arrow">›</span>
</summary>
<div class="phase-body">
<div class="sub-section">
<div class="sub-title">Lambda · API Gateway</div>
<div class="topic-item" data-phase="p3" data-key="aws-p3-01"><input type="checkbox" class="topic-cb" data-key="aws-p3-01" data-domain="p3"><span class="topic-text">Lambda: триггеры, Concurrency (reserved/provisioned/throttling), cold starts</span></div>
<div class="topic-item" data-phase="p3" data-key="aws-p3-02"><input type="checkbox" class="topic-cb" data-key="aws-p3-02" data-domain="p3"><span class="topic-text">Lambda Layers, container images, Lambda@Edge vs CloudFront Functions</span></div>
<div class="topic-item" data-phase="p3" data-key="aws-p3-03"><input type="checkbox" class="topic-cb" data-key="aws-p3-03" data-domain="p3"><span class="topic-text">API Gateway: REST vs HTTP vs WebSocket, Authorizers, Throttling, Endpoints types</span></div>

<div class="sub-title">Messaging · Streaming</div>
<div class="topic-item" data-phase="p3" data-key="aws-p3-04"><input type="checkbox" class="topic-cb" data-key="aws-p3-04" data-domain="p3"><span class="topic-text">SQS: Standard vs FIFO, Visibility Timeout, DLQ, long polling, delay queues</span></div>
<div class="topic-item" data-phase="p3" data-key="aws-p3-05"><input type="checkbox" class="topic-cb" data-key="aws-p3-05" data-domain="p3"><span class="topic-text">SNS Fan-out, Message Filtering; EventBridge: event buses, rules, schedules</span></div>
<div class="topic-item" data-phase="p3" data-key="aws-p3-06"><input type="checkbox" class="topic-cb" data-key="aws-p3-06" data-domain="p3"><span class="topic-text">Step Functions: Standard vs Express, Map/Choice/Parallel states</span></div>
<div class="topic-item" data-phase="p3" data-key="aws-p3-07"><input type="checkbox" class="topic-cb" data-key="aws-p3-07" data-domain="p3"><span class="topic-text">Kinesis Data Streams vs Firehose. Ключевое: Firehose буферизует 60s, Streams real-time</span></div>

<div class="sub-title">Контейнеры</div>
<div class="topic-item" data-phase="p3" data-key="aws-p3-08"><input type="checkbox" class="topic-cb" data-key="aws-p3-08" data-domain="p3"><span class="topic-text">ECS: EC2 vs Fargate, Task Definitions, Service, ALB integration, IAM Task Role</span></div>
<div class="topic-item" data-phase="p3" data-key="aws-p3-09"><input type="checkbox" class="topic-cb" data-key="aws-p3-09" data-domain="p3"><span class="topic-text">EKS: managed K8s, node groups vs Fargate; ECR: image scanning, lifecycle</span></div>
<div class="topic-item" data-phase="p3" data-key="aws-p3-10"><input type="checkbox" class="topic-cb" data-key="aws-p3-10" data-domain="p3"><span class="topic-text">App Runner: managed containers без кластера; сравнение ECS/EKS/AppRunner/Lambda</span></div>
</div>
</div>
</details>
</div>

<!-- PHASE 4 -->
<div class="phase-acc">
<details>
<summary class="phase-header">
<span class="phase-num">Фаза 4</span>
<span class="phase-name">Security · Monitoring · Governance</span>
<span class="phase-time-tag">2 недели</span>
<span class="phase-prog-bar">
<span class="ppb-track"><span class="ppb-fill" id="p4-bar" style="width:0%"></span></span>
<span class="ppb-text" id="p4-txt">0/12</span>
</span>
<span class="phase-arrow">›</span>
</summary>
<div class="phase-body">
<div class="sub-section">
<div class="sub-title">Шифрование и секреты</div>
<div class="topic-item" data-phase="p4" data-key="aws-p4-01"><input type="checkbox" class="topic-cb" data-key="aws-p4-01" data-domain="p4"><span class="topic-text">KMS: CMK vs AWS Managed, symmetric/asymmetric, key policies, automatic rotation</span></div>
<div class="topic-item" data-phase="p4" data-key="aws-p4-02"><input type="checkbox" class="topic-cb" data-key="aws-p4-02" data-domain="p4"><span class="topic-text">CloudHSM vs KMS: когда что; Secrets Manager vs SSM Parameter Store</span></div>
<div class="topic-item" data-phase="p4" data-key="aws-p4-03"><input type="checkbox" class="topic-cb" data-key="aws-p4-03" data-domain="p4"><span class="topic-text">ACM: публичные/приватные сертификаты, интеграция с ALB/CloudFront</span></div>

<div class="sub-title">Защита и обнаружение</div>
<div class="topic-item" data-phase="p4" data-key="aws-p4-04"><input type="checkbox" class="topic-cb" data-key="aws-p4-04" data-domain="p4"><span class="topic-text">WAF: managed rules, rate-based, geo blocking; Shield Standard vs Advanced</span></div>
<div class="topic-item" data-phase="p4" data-key="aws-p4-05"><input type="checkbox" class="topic-cb" data-key="aws-p4-05" data-domain="p4"><span class="topic-text">GuardDuty: threat intelligence, anomaly detection; Inspector: vulnerability scanning</span></div>
<div class="topic-item" data-phase="p4" data-key="aws-p4-06"><input type="checkbox" class="topic-cb" data-key="aws-p4-06" data-domain="p4"><span class="topic-text">Macie: S3 sensitive data discovery; Detective; Security Hub</span></div>

<div class="sub-title">Мониторинг и аудит</div>
<div class="topic-item" data-phase="p4" data-key="aws-p4-07"><input type="checkbox" class="topic-cb" data-key="aws-p4-07" data-domain="p4"><span class="topic-text">CloudWatch: Metrics, Logs, Alarms, Logs Insights, Container Insights</span></div>
<div class="topic-item" data-phase="p4" data-key="aws-p4-08"><input type="checkbox" class="topic-cb" data-key="aws-p4-08" data-domain="p4"><span class="topic-text">CloudTrail: Management/Data events, Insights, organization trail</span></div>
<div class="topic-item" data-phase="p4" data-key="aws-p4-09"><input type="checkbox" class="topic-cb" data-key="aws-p4-09" data-domain="p4"><span class="topic-text">AWS Config: rules, remediation, conformance packs; X-Ray distributed tracing</span></div>

<div class="sub-title">Governance</div>
<div class="topic-item" data-phase="p4" data-key="aws-p4-10"><input type="checkbox" class="topic-cb" data-key="aws-p4-10" data-domain="p4"><span class="topic-text">AWS Organizations: OUs, SCPs, delegated admin; Control Tower</span></div>
<div class="topic-item" data-phase="p4" data-key="aws-p4-11"><input type="checkbox" class="topic-cb" data-key="aws-p4-11" data-domain="p4"><span class="topic-text">IAM Identity Center (SSO): permission sets, application assignments</span></div>
<div class="topic-item" data-phase="p4" data-key="aws-p4-12"><input type="checkbox" class="topic-cb" data-key="aws-p4-12" data-domain="p4"><span class="topic-text">Resource Access Manager (RAM): sharing VPC subnets, Transit Gateway, Route 53 Resolver</span></div>
</div>
</div>
</details>
</div>

<!-- PHASE 5 -->
<div class="phase-acc">
<details>
<summary class="phase-header">
<span class="phase-num">Фаза 5</span>
<span class="phase-name">Hybrid · Migration · Edge · DR</span>
<span class="phase-time-tag">2 недели</span>
<span class="phase-prog-bar">
<span class="ppb-track"><span class="ppb-fill" id="p5-bar" style="width:0%"></span></span>
<span class="ppb-text" id="p5-txt">0/8</span>
</span>
<span class="phase-arrow">›</span>
</summary>
<div class="phase-body">
<div class="sub-section">
<div class="sub-title">Hybrid</div>
<div class="topic-item" data-phase="p5" data-key="aws-p5-01"><input type="checkbox" class="topic-cb" data-key="aws-p5-01" data-domain="p5"><span class="topic-text">Direct Connect: dedicated/hosted, virtual interfaces, DX Gateway; Client VPN</span></div>
<div class="topic-item" data-phase="p5" data-key="aws-p5-02"><input type="checkbox" class="topic-cb" data-key="aws-p5-02" data-domain="p5"><span class="topic-text">Transit Gateway: route tables, peering, multicast; PrivateLink подробно</span></div>

<div class="sub-title">Migration · Storage</div>
<div class="topic-item" data-phase="p5" data-key="aws-p5-03"><input type="checkbox" class="topic-cb" data-key="aws-p5-03" data-domain="p5"><span class="topic-text">Storage Gateway: File/Volume (cached/stored)/Tape; DataSync; Transfer Family</span></div>
<div class="topic-item" data-phase="p5" data-key="aws-p5-04"><input type="checkbox" class="topic-cb" data-key="aws-p5-04" data-domain="p5"><span class="topic-text">Snow Family: Snowcone/Snowball Edge/Snowmobile; AWS Backup централизованный</span></div>
<div class="topic-item" data-phase="p5" data-key="aws-p5-05"><input type="checkbox" class="topic-cb" data-key="aws-p5-05" data-domain="p5"><span class="topic-text">DMS + SCT; Application Migration Service (MGN); Migration Hub</span></div>

<div class="sub-title">Edge · DR</div>
<div class="topic-item" data-phase="p5" data-key="aws-p5-06"><input type="checkbox" class="topic-cb" data-key="aws-p5-06" data-domain="p5"><span class="topic-text">CloudFront: origins, behaviors, OAI/OAC, signed URLs, Functions, Lambda@Edge</span></div>
<div class="topic-item" data-phase="p5" data-key="aws-p5-07"><input type="checkbox" class="topic-cb" data-key="aws-p5-07" data-domain="p5"><span class="topic-text">Global Accelerator vs CloudFront: non-HTTP low latency = Global Accelerator</span></div>
<div class="topic-item" data-phase="p5" data-key="aws-p5-08"><input type="checkbox" class="topic-cb" data-key="aws-p5-08" data-domain="p5"><span class="topic-text">DR стратегии: Backup & Restore → Pilot Light → Warm Standby → Multi-Site. RPO vs RTO</span></div>
</div>
</div>
</details>
</div>

<!-- PHASE 6-7 -->
<div class="phase-acc">
<details>
<summary class="phase-header">
<span class="phase-num">Фазы 6–7</span>
<span class="phase-name">Practice Exams и финальный обзор</span>
<span class="phase-time-tag">3–4 недели</span>
<span class="phase-prog-bar">
<span class="ppb-track"><span class="ppb-fill" id="p6-bar" style="width:0%"></span></span>
<span class="ppb-text" id="p6-txt">0/4</span>
</span>
<span class="phase-arrow">›</span>
</summary>
<div class="phase-body">
<div class="sub-section">
<div class="topic-item" data-phase="p6" data-key="aws-p6-01"><input type="checkbox" class="topic-cb" data-key="aws-p6-01" data-domain="p6"><span class="topic-text">Tutorials Dojo: пройти все наборы вопросов, review mode для ошибок</span></div>
<div class="topic-item" data-phase="p6" data-key="aws-p6-02"><input type="checkbox" class="topic-cb" data-key="aws-p6-02" data-domain="p6"><span class="topic-text">Добиться стабильных 85%+ на Tutorials Dojo перед записью на экзамен</span></div>
<div class="topic-item" data-phase="p6" data-key="aws-p6-03"><input type="checkbox" class="topic-cb" data-key="aws-p6-03" data-domain="p6"><span class="topic-text">Финальный чеклист повторения: пройтись по ключевым "капканам" (таблица ниже)</span></div>
<div class="topic-item" data-phase="p6" data-key="aws-p6-04"><input type="checkbox" class="topic-cb" data-key="aws-p6-04" data-domain="p6"><span class="topic-text">Сдать SAA-C03: 50% скидка на следующий экзамен AWS после получения</span></div>
</div>
</div>
</details>
</div>

<hr class="rdm-divider">

<!-- RESOURCES -->
<div class="rdm-section-label">Ресурсы</div>
<div class="res-wrap">
<table class="res-table">
<thead><tr><th>Ресурс</th><th>Тип</th><th>Ссылка</th></tr></thead>
<tbody>
<tr><td>Adrian Cantrill (рекомендован)</td><td>Курс</td><td><a href="https://learn.cantrill.io" target="_blank" rel="noopener">learn.cantrill.io</a></td></tr>
<tr><td>Stephane Maarek (популярный)</td><td>Курс</td><td><a href="https://udemy.com" target="_blank" rel="noopener">udemy.com</a></td></tr>
<tr><td>Tutorials Dojo</td><td>Practice exams</td><td><a href="https://tutorialsdojo.com" target="_blank" rel="noopener">tutorialsdojo.com</a></td></tr>
<tr><td>AWS Skill Builder</td><td>Официально</td><td><a href="https://skillbuilder.aws" target="_blank" rel="noopener">skillbuilder.aws</a></td></tr>
<tr><td>Jayendra's Blog</td><td>Шпаргалки</td><td><a href="https://jayendrapatil.com" target="_blank" rel="noopener">jayendrapatil.com</a></td></tr>
<tr><td>Well-Architected Framework</td><td>Whitepaper</td><td><a href="https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html" target="_blank" rel="noopener">docs.aws.amazon.com</a></td></tr>
</tbody>
</table>
</div>

<!-- TRAPS -->
<div class="rdm-section-label" style="margin-top:24px">Ключевые «капканы» экзамена</div>
<div class="trap-wrap">
<div class="trap-header"><div>Если в вопросе…</div><div>…правильный ответ</div></div>
<div class="trap-row"><div class="trap-cell">LEAST operational overhead</div><div class="trap-cell"><strong>Lambda, Fargate, Aurora Serverless, DynamoDB</strong></div></div>
<div class="trap-row"><div class="trap-cell">MOST cost-effective infrequent access</div><div class="trap-cell"><strong>S3 IA / Intelligent-Tiering / Glacier</strong> по порогам</div></div>
<div class="trap-row"><div class="trap-cell">real-time streaming</div><div class="trap-cell"><strong>Kinesis Data Streams</strong> (не Firehose, буфер 60s)</div></div>
<div class="trap-row"><div class="trap-cell">decouple компоненты</div><div class="trap-cell"><strong>SQS / SNS / EventBridge</strong></div></div>
<div class="trap-row"><div class="trap-cell">highly available БД</div><div class="trap-cell"><strong>RDS Multi-AZ / Aurora</strong></div></div>
<div class="trap-row"><div class="trap-cell">read scaling БД</div><div class="trap-cell"><strong>Read Replicas / Aurora Replicas / DAX</strong> для DynamoDB</div></div>
<div class="trap-row"><div class="trap-cell">static content глобально</div><div class="trap-cell"><strong>CloudFront + S3</strong></div></div>
<div class="trap-row"><div class="trap-cell">non-HTTP low latency global</div><div class="trap-cell"><strong>Global Accelerator</strong> (не CloudFront)</div></div>
<div class="trap-row"><div class="trap-cell">доступ EC2 к S3 без secrets</div><div class="trap-cell"><strong>IAM Role на инстансе</strong>, никогда не access keys</div></div>
<div class="trap-row"><div class="trap-cell">private connection к S3/DynamoDB</div><div class="trap-cell"><strong>Gateway VPC Endpoint</strong></div></div>
<div class="trap-row"><div class="trap-cell">migration &lt; 10 TB через интернет</div><div class="trap-cell"><strong>DataSync</strong></div></div>
<div class="trap-row"><div class="trap-cell">migration &gt; 10 TB / плохой канал</div><div class="trap-cell"><strong>Snowball / Snowcone</strong></div></div>
<div class="trap-row"><div class="trap-cell">Cross-account access</div><div class="trap-cell"><strong>IAM Role + AssumeRole</strong>, не sharing access keys</div></div>
</div>
