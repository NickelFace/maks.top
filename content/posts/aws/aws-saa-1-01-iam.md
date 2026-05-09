---
title: "AWS SAA — 1.01 IAM Fundamentals"
date: 2026-05-09
draft: true
description: "IAM users, groups, roles, policies, policy evaluation logic, instance profiles, permission boundaries, cross-account access, and STS — everything the SAA-C03 exam tests."
tags: ["AWS", "SAA-C03", "IAM", "security", "STS"]
categories: ["AWS SAA"]
page_lang: "en"
lang_pair: "/posts/aws/ru/aws-saa-1-01-iam/"
---

## IAM Core Components

AWS Identity and Access Management (IAM) is a **global service** (not region-scoped) that controls who can do what in your AWS account.

| Component | Description | Key point |
|---|---|---|
| **Root account** | Created with the AWS account; has unrestricted access | Never use for daily tasks; protect with MFA |
| **IAM User** | Long-term identity for a person or service | Gets access keys (programmatic) or password (console) |
| **IAM Group** | Collection of users; policies attach to the group | Cannot nest groups inside groups |
| **IAM Role** | Temporary identity assumed by a principal | No permanent credentials; uses STS tokens |
| **IAM Policy** | JSON document defining permissions | Attached to users, groups, or roles |

---

## IAM Policies

### Policy types

| Type | Attached to | Notes |
|---|---|---|
| **Identity-based** | User / Group / Role | Grants permissions to the identity |
| **Resource-based** | Resource (S3 bucket, KMS key…) | Grants access TO the resource; inline only |
| **Permission boundary** | User / Role | Sets the maximum allowed permissions |
| **Organizations SCP** | OU / Account | Organization-wide guardrail |
| **Session policy** | AssumeRole call | Narrows permissions for a specific session |
| **ACL** | S3, VPC | Legacy; limited; cross-account only |

### Policy structure (JSON)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3Read",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::my-bucket",
        "arn:aws:s3:::my-bucket/*"
      ],
      "Condition": {
        "StringEquals": { "aws:RequestedRegion": "us-east-1" }
      }
    }
  ]
}
```

> **📌 Tip:** Always use `"Version": "2012-10-17"` — it enables policy variables like `${aws:username}`. The older 2008 date is a common exam distractor.

---

## Policy Evaluation Logic

AWS evaluates policies in this order when a principal makes a request:

1. **Explicit Deny** — any matching Deny in any policy → **DENY** (final, no override)
2. **SCPs** (if Organizations) — if no Allow in SCP → DENY
3. **Resource-based policy** — cross-account: must Allow in both identity AND resource policy
4. **Identity-based policy** — if no Allow → DENY (implicit)
5. **Permission boundary** — Allow in identity policy AND in boundary → ALLOW
6. **Session policy** — must also Allow

```
Default = DENY → check explicit DENY → check ALLOW → grant or deny
```

> **📌 Tip:** The single most-tested rule: **explicit Deny always wins**, even if another policy allows the same action. "Deny overrides Allow" is a near-certain exam question.

---

## IAM Roles and Instance Profiles

### Why roles beat access keys for EC2

| | Access Keys on EC2 | IAM Role (Instance Profile) |
|---|---|---|
| **Storage** | Hard-coded in code / env var | Never stored; fetched via IMDS |
| **Rotation** | Manual; easy to forget | Automatic (STS rotates) |
| **Exposure risk** | High (leak = permanent) | Low (tokens expire ≤ 1 h) |
| **Audit** | Harder (static key ID) | Full CloudTrail per-role |

**Instance Profile** is the container that holds one IAM Role and is attached to an EC2 instance. The SDK/CLI retrieves credentials automatically from `http://169.254.169.254/latest/meta-data/iam/security-credentials/<role-name>`.

```bash
# Retrieve role credentials from EC2 metadata (IMDSv2)
TOKEN=$(curl -sX PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
curl -sH "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/iam/security-credentials/MyRole
```

> **📌 Tip:** The exam often asks: "An EC2 app is failing to access S3 — what is the BEST practice fix?" Answer: attach an IAM role with the required policy, not create an IAM user and embed access keys.

---

## Permission Boundaries

A permission boundary defines the **maximum** permissions an identity-based policy can grant. It does **not** grant permissions by itself — it only restricts them.

```
Effective permissions = identity_policy ∩ permission_boundary
```

**Use case:** Allow developers to create IAM roles for their Lambda functions, but prevent them from escalating privileges beyond a defined scope.

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:*", "cloudwatch:*", "logs:*"],
    "Resource": "*"
  }]
}
```

Attaching this as a boundary means the role can never exceed S3 + CloudWatch + Logs, even if the identity policy allows EC2 or IAM.

> **📌 Tip:** Permission boundaries apply only to **IAM users and roles** — not to groups or resource-based policies. An SCP is the organizational equivalent.

---

## Cross-Account Access via AssumeRole

The standard pattern for granting access across AWS accounts:

1. **Account B (resource account)** creates a role with a trust policy allowing Account A to assume it.
2. **Account A principal** calls `sts:AssumeRole` → receives temporary credentials.
3. Principal uses credentials to act in Account B.

```json
// Trust policy on the role in Account B
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "AWS": "arn:aws:iam::111122223333:root" },
    "Action": "sts:AssumeRole",
    "Condition": {
      "StringEquals": { "sts:ExternalId": "unique-external-id" }
    }
  }]
}
```

**External ID** prevents the "confused deputy" problem — a third party can't trick your account into assuming a role on their behalf.

---

## STS — Security Token Service

STS issues **temporary security credentials** (Access Key ID + Secret Access Key + Session Token).

| STS API | Use case |
|---|---|
| `AssumeRole` | Cross-account or same-account role assumption |
| `AssumeRoleWithSAML` | SAML 2.0 identity federation (corp IdP) |
| `AssumeRoleWithWebIdentity` | OIDC federation (Cognito, Google, GitHub Actions) |
| `GetFederationToken` | Long-lived federated session for broker apps |
| `GetSessionToken` | MFA enforcement; short-term credentials for IAM user |

**Token lifetime:** configurable 15 min – 12 h (default 1 h for AssumeRole). Tokens cannot be revoked but expire automatically.

> **📌 Tip:** `AssumeRoleWithWebIdentity` is used by **GitHub Actions OIDC** and **EKS service accounts (IRSA)**. The exam may present a scenario with containers needing AWS access — roles + OIDC is the answer, not access keys.

---

## IAM Best Practices (Exam Checklist)

| Practice | Why it matters |
|---|---|
| Lock root account; enable MFA on root | Root cannot be restricted by SCPs or policies |
| Enable MFA for all privileged users | Credential compromise doesn't equal account takeover |
| Use roles instead of long-term keys | Keys rotate automatically; no storage risk |
| Apply least privilege | Reduce blast radius of compromise |
| Use permission boundaries for delegated admin | Prevent privilege escalation by developers |
| Use Access Analyzer | Identifies resources exposed externally |
| Rotate access keys regularly | 90-day rotation recommended |
| Never hard-code credentials | Use Secrets Manager, Parameter Store, or roles |
| Use IAM groups for permission assignment | Easier to manage than per-user policies |
| Enable CloudTrail | Full audit log of all API calls |

---

## Key Exam Traps

| Trap | Correct understanding |
|---|---|
| "Add an Allow to override a Deny" | Impossible — explicit Deny is always final |
| "Root account can be restricted by SCPs" | False — root is always exempt from SCPs |
| "IAM is regional" | False — IAM is global |
| "Groups can be nested" | False — groups cannot contain other groups |
| "Access keys on EC2 = best practice" | False — always use IAM roles via instance profiles |
| "Permission boundary grants permissions" | False — it only limits; needs identity policy too |
| "STS tokens are permanent" | False — they expire (15 min – 12 h) |
| "Resource-based policy alone grants cross-account access" | Partially true for S3; for most services, identity policy also required |

---

## Quick Reference: IAM Decision Tree

```
Need AWS access for...
├── Human user (AWS console/CLI) → IAM User + MFA, or SSO via Identity Center
├── EC2 / Lambda / ECS task       → IAM Role (instance profile / execution role)
├── External identity (corp AD)   → SAML 2.0 federation via IAM Identity Center
├── Mobile/web app users          → Amazon Cognito Identity Pools → IAM Role
├── CI/CD (GitHub Actions)        → OIDC + AssumeRoleWithWebIdentity
└── Cross-account automation      → IAM Role in target account + AssumeRole
```

> **📌 Tip:** When the exam says "least privilege" + "temporary credentials" + "no long-term keys" — the answer is always **IAM Role**. Remember: roles are for machines; users are for humans; groups are for organizing users.
