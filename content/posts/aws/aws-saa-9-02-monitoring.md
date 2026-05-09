---
title: "AWS SAA — 9.02 Monitoring & Observability"
date: 2026-05-09
draft: true
description: "CloudWatch, CloudTrail, AWS Config, Trusted Advisor, X-Ray, and AWS Health — complete monitoring stack for SAA-C03 with key differences and exam traps."
tags: ["AWS", "SAA-C03", "CloudWatch", "CloudTrail", "Config", "X-Ray", "monitoring"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-9-02-monitoring/"
---

## CloudWatch Metrics

CloudWatch collects and tracks metrics from AWS services and custom sources.

### Core concepts

| Concept | Description |
|---|---|
| **Namespace** | Container for metrics (e.g., `AWS/EC2`, `AWS/RDS`). Custom metrics go in your own namespace. |
| **Dimension** | Name/value pair that identifies a metric (e.g., `InstanceId=i-1234`). Up to 30 per metric. |
| **Standard monitoring** | Default for most services — data points every **5 minutes** |
| **Detailed monitoring** | Extra cost — data points every **1 minute** (enable per resource) |
| **High-resolution metrics** | Custom metrics at 1-second granularity via `--storage-resolution 1` |
| **Retention** | `< 60s` resolution: 3 hours; `60s`: 15 days; `300s`: 63 days; `1 hour`: 15 months |

### Custom metrics

```bash
# Publish a custom metric
aws cloudwatch put-metric-data \
  --namespace "MyApp/Performance" \
  --metric-name "ActiveUsers" \
  --value 42 \
  --dimensions Environment=prod
```

> **📌 Tip:** RAM utilization and disk space are NOT collected by CloudWatch by default on EC2. Install the **CloudWatch Agent** to push these as custom metrics.

---

## CloudWatch Logs

### Structure

| Component | Description |
|---|---|
| **Log group** | Container for log streams (e.g., `/aws/lambda/my-function`) |
| **Log stream** | Sequence of log events from a single source |
| **Retention** | Never expire (default) → configurable from 1 day to 10 years |
| **Metric filter** | Scans log events for patterns and increments a CloudWatch metric |
| **Subscription filter** | Streams log data in near-real-time to Kinesis Data Streams, Kinesis Data Firehose, or Lambda |

### CloudWatch Logs Insights

SQL-like query language for interactive analysis:

```sql
fields @timestamp, @message
| filter @message like /ERROR/
| stats count(*) as errorCount by bin(5m)
| sort errorCount desc
| limit 20
```

- Supports cross-account and cross-region log queries (requires log group data sharing).
- Query results can be saved and visualized in CloudWatch dashboards.

---

## CloudWatch Alarms

### Alarm states

| State | Meaning |
|---|---|
| `OK` | Metric is within the defined threshold |
| `ALARM` | Metric has breached the threshold |
| `INSUFFICIENT_DATA` | Not enough data points yet (common on new resources) |

### Alarm actions

- **SNS notification** — email, HTTP endpoint, SQS, Lambda, etc.
- **EC2 action** — stop, terminate, reboot, recover an instance
- **Auto Scaling** — scale out or scale in a group
- **Systems Manager OpsCenter** — create an OpsItem

### Composite alarms

Combine multiple alarms using AND/OR logic. Useful to reduce alarm noise:

```
Composite ALARM = (CPU_Alarm AND Memory_Alarm) OR DiskIO_Alarm
```

> **📌 Tip:** Composite alarms reduce alert noise ("alarm storms") by requiring multiple conditions to be true simultaneously.

---

## Amazon EventBridge (formerly CloudWatch Events)

EventBridge is the modern event bus for AWS.

| Feature | Detail |
|---|---|
| **Default bus** | Receives events from all AWS services |
| **Custom bus** | For your own application events |
| **Partner bus** | SaaS integration (Zendesk, Datadog, etc.) |
| **Rules** | Match events by pattern; route to one or more targets |
| **Scheduled rules** | Cron or rate expressions (replaces CloudWatch Scheduled Events) |
| **Targets** | Lambda, Step Functions, SQS, SNS, Kinesis, ECS Task, CodePipeline, and 20+ others |

---

## CloudWatch Container / Lambda / Application Insights

| Feature | Monitors |
|---|---|
| **Container Insights** | ECS, EKS, Kubernetes — CPU, memory, network, disk, pod/task level |
| **Lambda Insights** | Cold starts, invocation duration, errors, memory usage |
| **Application Insights** | .NET and SQL Server apps — anomaly detection, correlated findings |

---

## CloudTrail

CloudTrail records **every API call** made in your AWS account.

### Event types

| Type | Examples | Default logged? | Cost |
|---|---|---|---|
| **Management events** | CreateBucket, RunInstances, PutRolePolicy | Yes (free, 90-day Event History) | Free for first copy per region |
| **Data events** | S3 GetObject/PutObject, Lambda Invoke | No (high-volume, opt-in) | Extra cost |
| **Insights events** | Unusual API call volume/error rate | No (opt-in) | Extra cost |

### Trail configuration

- **Single-region trail** — logs events in one region only
- **All-region trail** — recommended; logs all regions to a single S3 bucket
- **Delivery**: S3 (always) + optionally CloudWatch Logs + SNS notification
- **Log file integrity**: SHA-256 digest files; detects tampering

### CloudTrail Lake

Immutable, fully managed event data store with SQL-based query support. Retention up to 7 years. Replaces the need to query S3-stored JSON logs.

> **📌 Tip:** CloudTrail Event History = 90 days free in the console. For longer retention or custom queries → create a trail to S3 or use CloudTrail Lake.

---

## AWS Config

Config records **configuration state** of AWS resources over time and evaluates compliance.

### Core concepts

| Concept | Description |
|---|---|
| **Configuration item** | Snapshot of a resource's configuration at a point in time |
| **Configuration history** | Timeline of all configuration changes |
| **Config rule** | Evaluates whether a resource configuration is compliant |
| **Managed rules** | Pre-built (e.g., `encrypted-volumes`, `restricted-ssh`, `s3-bucket-public-read-prohibited`) |
| **Custom rules** | Lambda functions for custom compliance logic |
| **Remediation** | Automatic (SSM Automation) or manual; fix non-compliant resources |
| **Aggregator** | Collect Config data across accounts and regions into one view |

### Config vs CloudTrail

| Question | Use |
|---|---|
| "What is the current / past configuration of this resource?" | **AWS Config** |
| "Who made this API call and when?" | **CloudTrail** |
| "Did this security group change and what did it look like before?" | **AWS Config** (shows the diff) |
| "Which IAM user deleted this S3 bucket?" | **CloudTrail** |

> **📌 Tip:** AWS Config is **NOT free**. Charged per configuration item recorded (~$0.003) and per Config rule evaluation (~$0.001). Enable only what you need.

> **📌 Tip:** Config Rules evaluate compliance and can trigger remediation, but they **cannot deny** resource creation in real time. For prevention → use SCPs or IAM.

---

## Trusted Advisor

Trusted Advisor provides **best-practice recommendations** across five categories.

### Categories

| Category | Example checks |
|---|---|
| **Cost Optimization** | Idle EC2 instances, underutilized RDS, unassociated EIP |
| **Performance** | EC2 provisioned IOPS utilization, CloudFront TTL settings |
| **Security** | S3 bucket permissions, MFA on root, security group wide-open ports |
| **Fault Tolerance** | Multi-AZ RDS, EBS snapshots older than 7 days, Route 53 health checks |
| **Service Limits** | VPCs per region, EC2 On-Demand limits, EBS volumes |

### Support plan requirements

| Check tier | Required plan |
|---|---|
| **7 core checks** (basic security + service limits) | Free (all plans) |
| **All checks** + automated refresh + CloudWatch alarms for limits | **Business** or **Enterprise** support |

> **📌 Tip:** Full Trusted Advisor access requires Business or Enterprise support — not Developer or free-tier.

---

## AWS Health Dashboard

| View | Purpose |
|---|---|
| **Service Health** (public) | Global AWS infrastructure events (public status page) |
| **Personal Health Dashboard** | Events affecting **your specific resources** (e.g., EC2 scheduled maintenance in your account) |

Personal Health integrates with EventBridge: trigger Lambda when a maintenance event affects your instances.

---

## X-Ray — Distributed Tracing

X-Ray traces requests as they flow through distributed applications (microservices, Lambda, API Gateway, etc.).

### Concepts

| Concept | Description |
|---|---|
| **Trace** | End-to-end record of a single request; composed of segments |
| **Segment** | Work done by a single service |
| **Subsegment** | Breakdown within a segment (DB call, HTTP request) |
| **Service map** | Visual graph of all services and their connections |
| **Sampling** | Not every request is traced (configurable rate, default 5% + 1 req/s reservoir) |
| **Annotation** | Key-value pair indexed for filtering (used in filter expressions) |
| **Group** | Filter expression that scopes traces for dashboards/alerts |

### Integration

- **Lambda**: enable active tracing in function config
- **EC2/ECS**: install X-Ray daemon; SDK in application code
- **API Gateway**: enable X-Ray tracing on the stage
- **Elastic Beanstalk**: X-Ray daemon installed automatically

> **📌 Tip:** X-Ray is for **microservice / distributed tracing**. Not for log analysis (CloudWatch Logs) or audit (CloudTrail). If a question asks "how to find which downstream service is causing latency" → X-Ray.

---

## Exam Traps Summary

| Trap | Correct answer |
|---|---|
| "CloudTrail stores logs for 1 year by default" | False — Event History is **90 days**; create a trail for longer retention |
| "AWS Config is free" | False — charged per config item + per rule evaluation |
| "Config Rules can block non-compliant resource creation" | False — Config is **detective only**, not preventive |
| "Trusted Advisor full checks on free tier" | False — requires **Business or Enterprise** support |
| "RAM/disk metrics in CloudWatch by default on EC2" | False — need the **CloudWatch Agent** |
| "X-Ray for API audit logging" | False — X-Ray is for **distributed tracing**; CloudTrail for API audit |
| "CloudWatch Events vs EventBridge" | Same thing — EventBridge is the **new name** |
| "Detailed monitoring is default" | False — default is **5-minute** standard monitoring |
