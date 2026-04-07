# Infrastructure Guide

This document covers the AWS infrastructure architecture, Terraform workflow, resource inventory, secret management, and cost estimation for the Kids Learning App.

## Table of Contents

1. [Architecture Diagram](#architecture-diagram)
2. [Resource Inventory](#resource-inventory)
3. [Terraform Workflow](#terraform-workflow)
4. [Secret Management](#secret-management)
5. [Migration from Manual to IaC](#migration-from-manual-to-iac)
6. [Cost Estimation](#cost-estimation)
7. [Networking](#networking)
8. [Security](#security)
9. [Disaster Recovery](#disaster-recovery)
10. [Operational Procedures](#operational-procedures)

---

## Architecture Diagram

```
                   Internet
                      |
               +------+------+
               | Route 53    |  DNS: kidslearningfun.app
               +------+------+
                      |
               +------+------+
               | CloudFront  |  CDN (media/assets only)
               +------+------+
                      |
                  S3 Bucket     Media storage (encrypted, versioned)


                   Internet
                      |
               +------+------+
               | ACM (TLS)   |  TLS termination
               +------+------+
                      |
             +--------+--------+
             | ALB (public)    |  Application Load Balancer
             +--------+--------+
                      |
         +------------+------------+
         |                         |
   +-----+-----+            +-----+-----+
   | Public     |            | Public     |   AZ-a, AZ-b
   | Subnet a   |            | Subnet b   |
   +-----+-----+            +-----+-----+
         |                         |
    NAT Gateway                    |
         |                         |
   +-----+-----+            +-----+-----+
   | Private    |            | Private    |   ECS Fargate tasks
   | Subnet a   |            | Subnet b   |
   +-----+-----+            +-----+-----+
         |                         |
         |    +-------+-------+    |
         |    |  ECS Cluster  |    |
         |    |               |    |
         |    | API Service   |    |   2-20 tasks (autoscaled)
         |    | Worker Service|    |   1-4 tasks
         |    +-------+-------+    |
         |            |            |
   +-----+-----+-----+------+-----+-----+
   | Data       |            | Data       |   Isolated data tier
   | Subnet a   |            | Subnet b   |
   +-----+-----+            +-----+-----+
         |                         |
   +-----+-----+            +-----+-----+
   | RDS Aurora |            | ElastiCache|
   | PostgreSQL |            | Redis 7    |
   | (Multi-AZ) |           | (Multi-AZ) |
   +------------+            +------------+
```

### Data Flow

1. **Client requests** hit Route 53 DNS, which routes to the ALB
2. **ALB** terminates TLS (via ACM certificate) and forwards to ECS API tasks
3. **API tasks** read/write to RDS PostgreSQL and enqueue jobs to Redis (via BullMQ)
4. **Worker tasks** pull jobs from Redis, process media via Sharp, store results in S3
5. **Media assets** are served through CloudFront CDN backed by S3
6. **Logs** are shipped to CloudWatch via the awslogs driver

---

## Resource Inventory

### Per-Environment Resources

| Resource | Dev | Staging | Production |
|----------|-----|---------|------------|
| **VPC** | 1 (10.0.0.0/16) | 1 (10.1.0.0/16) | 1 (10.2.0.0/16) |
| **Subnets** | 6 (2 public, 2 private, 2 data) | 6 | 6 |
| **NAT Gateway** | 1 | 1 | 1 |
| **ALB** | 1 | 1 | 1 |
| **ECS Cluster** | 1 | 1 | 1 |
| **API Tasks** | 1 (256 CPU, 512 MiB) | 2 (512 CPU, 1 GiB) | 4 (1024 CPU, 2 GiB) |
| **Worker Tasks** | 1 (256 CPU, 512 MiB) | 1 (512 CPU, 1 GiB) | 2 (1024 CPU, 2 GiB) |
| **RDS Aurora** | 1 instance (0.5-2 ACU) | 1 instance (0.5-4 ACU) | 2 instances (2-16 ACU, Multi-AZ) |
| **ElastiCache** | 1 node (t3.micro) | 1 node (t3.small) | 2 nodes (r6g.large, Multi-AZ) |
| **S3 Bucket** | 1 (media) | 1 (media) | 1 (media, versioned) |
| **CloudFront** | 1 (PriceClass_100) | 1 (PriceClass_100) | 1 (PriceClass_All) |
| **ECR Repository** | 1 (shared) | 1 (shared) | 1 (shared) |
| **Secrets** | 3 (DB, Redis, JWT) | 3 | 3 |
| **CloudWatch Alarms** | 4 (relaxed thresholds) | 4 | 4 (strict thresholds) |
| **Autoscaling** | Disabled | Enabled (2-4 tasks) | Enabled (4-20 tasks) |

### Shared Resources (not per-environment)

| Resource | Purpose |
|----------|---------|
| S3 bucket: `kids-learning-terraform-state` | Terraform state storage |
| DynamoDB table: `terraform-locks` | Terraform state locking |
| ECR repository: `kids-learning-api` | Docker image registry |
| Route 53 hosted zone | DNS management |
| ACM certificates | TLS certificates per domain |

---

## Terraform Workflow

### Directory Structure

```
infra/terraform/
  main.tf                    # All resource definitions
  variables.tf               # Input variable declarations
  outputs.tf                 # Output value definitions
  environments/
    dev.tfvars               # Dev-specific variable values
    staging.tfvars           # Staging-specific variable values
    production.tfvars        # Production-specific variable values
```

### Workspace Strategy

Each environment uses a Terraform workspace to isolate state:

```bash
terraform workspace list
# * dev
#   staging
#   production
```

### Standard Workflow

#### 1. Initialize

```bash
cd infra/terraform
terraform init
```

#### 2. Select Environment

```bash
terraform workspace select dev
```

#### 3. Plan

```bash
terraform plan -var-file=environments/dev.tfvars -out=plan.tfplan
```

Review the plan output carefully. Pay attention to:
- Resources being destroyed (red)
- Resources being replaced (yellow)
- Changes to security groups, IAM roles, or database configuration

#### 4. Apply

```bash
# Dev: apply directly
terraform apply plan.tfplan

# Staging/Production: require explicit approval
terraform apply -var-file=environments/staging.tfvars
# Type 'yes' after reviewing the plan
```

#### 5. Verify

After applying:
1. Check the ECS service deployment status in the AWS Console
2. Verify the health check endpoint: `curl https://<alb-dns>/health`
3. Check CloudWatch for any new error logs
4. Run a smoke test against the API

### CI/CD Integration

```yaml
# In GitHub Actions / GitLab CI:

# On every PR:
- terraform init
- terraform workspace select $ENVIRONMENT
- terraform plan -var-file=environments/$ENVIRONMENT.tfvars
- Post plan output as PR comment

# On merge to main (dev auto-deploy):
- terraform apply -auto-approve -var-file=environments/dev.tfvars

# On release tag (staging/production):
- terraform plan -var-file=environments/$ENVIRONMENT.tfvars -out=plan.tfplan
- Manual approval gate
- terraform apply plan.tfplan
```

### Terraform State Management

| Setting | Value |
|---------|-------|
| Backend | S3 (`kids-learning-terraform-state`) |
| Locking | DynamoDB (`terraform-locks`) |
| Encryption | Enabled (AES-256) |
| Versioning | Enabled (for state recovery) |

**State recovery**: If state becomes corrupted, previous versions are available in S3 bucket versioning.

**Importing existing resources**: When migrating from manual to IaC:
```bash
terraform import aws_rds_cluster.main kids-learning-production
```

---

## Secret Management

### How Secrets Are Managed

Secrets are stored in **AWS Secrets Manager** and injected into ECS containers as environment variables at task startup. They are never stored in code, environment files, or Terraform state.

### Secret Inventory

| Secret Name | Service | Rotation |
|-------------|---------|----------|
| `kids-learning/<env>/database-url` | PostgreSQL connection string | Manual (on credential change) |
| `kids-learning/<env>/redis-url` | Redis connection string | Manual (on credential change) |
| `kids-learning/<env>/jwt-secret` | JWT signing key | Quarterly |
| `kids-learning/<env>/openai-api-key` | OpenAI API key | On regeneration |
| `kids-learning/<env>/anthropic-api-key` | Anthropic API key | On regeneration |

### Creating / Updating Secrets

```bash
# Create a new secret
aws secretsmanager create-secret \
  --name "kids-learning/production/database-url" \
  --secret-string "postgresql://user:pass@host:5432/db"

# Update an existing secret
aws secretsmanager update-secret \
  --secret-id "kids-learning/production/jwt-secret" \
  --secret-string "new-secret-value"
```

After updating a secret, redeploy the ECS service to pick up the new value:
```bash
aws ecs update-service --cluster kids-learning-production \
  --service kids-learning-production-api --force-new-deployment
```

### Access Control

- ECS tasks access secrets via the **execution role** (`kids-learning-<env>-ecs-execution`)
- The role policy restricts access to secrets under the `kids-learning/<env>/` prefix
- Developers do not have direct access to production secrets
- Secret access is logged via CloudTrail

---

## Migration from Manual to IaC

### Migration Strategy

The migration from manually managed infrastructure to Terraform-managed IaC follows an incremental approach:

#### Phase 1: State Import (Week 1)

Import existing AWS resources into Terraform state without changing them:

```bash
# Import existing VPC
terraform import aws_vpc.main vpc-abc123

# Import existing RDS cluster
terraform import aws_rds_cluster.main kids-learning-production

# Import existing ElastiCache
terraform import aws_elasticache_replication_group.main kids-learning-production

# Import existing S3 bucket
terraform import aws_s3_bucket.media kids-learning-production-media
```

After import, run `terraform plan` and ensure it shows **no changes**. If it does, adjust the Terraform configuration to match the existing resource settings.

#### Phase 2: Non-Critical Resources (Week 2)

Start managing new or non-critical resources with Terraform:
- CloudWatch alarms
- CloudWatch log groups
- S3 lifecycle rules
- IAM policies (read-only first)

#### Phase 3: Core Resources (Week 3-4)

Gradually bring core resources under Terraform management:
- ECS task definitions and services
- Security groups
- ALB and target groups

#### Phase 4: Data Resources (Week 5+)

Bring stateful resources under management (with extreme care):
- RDS configuration (not data)
- ElastiCache configuration
- S3 bucket policies

**Important**: Never let Terraform recreate stateful resources (RDS, ElastiCache). Use `lifecycle { prevent_destroy = true }` during migration.

---

## Cost Estimation

### Monthly Cost by Environment

| Resource | Dev | Staging | Production |
|----------|-----|---------|------------|
| **ECS Fargate** (API) | $9 (256 CPU, 1 task) | $37 (512 CPU, 2 tasks) | $148 (1024 CPU, 4 tasks) |
| **ECS Fargate** (Worker) | $9 (256 CPU, 1 task) | $18 (512 CPU, 1 task) | $74 (1024 CPU, 2 tasks) |
| **RDS Aurora Serverless v2** | $12 (0.5-2 ACU) | $24 (0.5-4 ACU) | $200 (2-16 ACU, Multi-AZ) |
| **ElastiCache Redis** | $13 (t3.micro) | $26 (t3.small) | $340 (r6g.large x2) |
| **NAT Gateway** | $32 (fixed) | $32 | $32 |
| **ALB** | $16 | $16 | $16 |
| **S3** | $1 | $2 | $10 (versioned) |
| **CloudFront** | $1 | $2 | $30 |
| **CloudWatch** | $2 | $5 | $15 |
| **Secrets Manager** | $2 | $2 | $2 |
| **ECR** | $1 | $1 | $1 |
| **Data Transfer** | $1 | $3 | $20 |
| **Total** | **~$99/mo** | **~$168/mo** | **~$888/mo** |

### Cost Optimization Tips

1. **Dev environment**: Use Aurora Serverless v2 min capacity 0 (scales to zero when idle)
2. **NAT Gateway**: The single largest fixed cost. Consider NAT instances for dev ($4/mo vs $32/mo)
3. **Reserved instances**: For production ElastiCache, reserve for 1 year (saves ~30%)
4. **Spot Fargate**: Use Spot capacity for non-critical workers (saves ~70%)
5. **S3 lifecycle rules**: Already configured to transition to Standard-IA after 90 days
6. **CloudFront**: Cache hit ratio above 90% reduces S3 transfer costs significantly
7. **Right-sizing**: Review ECS task CPU/memory utilization monthly and adjust

---

## Networking

### CIDR Allocation

| Environment | VPC CIDR | Public Subnets | Private Subnets | Data Subnets |
|-------------|----------|----------------|-----------------|--------------|
| Dev | 10.0.0.0/16 | 10.0.1.0/24, 10.0.2.0/24 | 10.0.10.0/24, 10.0.11.0/24 | 10.0.20.0/24, 10.0.21.0/24 |
| Staging | 10.1.0.0/16 | 10.1.1.0/24, 10.1.2.0/24 | 10.1.10.0/24, 10.1.11.0/24 | 10.1.20.0/24, 10.1.21.0/24 |
| Production | 10.2.0.0/16 | 10.2.1.0/24, 10.2.2.0/24 | 10.2.10.0/24, 10.2.11.0/24 | 10.2.20.0/24, 10.2.21.0/24 |

### Subnet Tiers

| Tier | Purpose | Internet Access | Contains |
|------|---------|-----------------|----------|
| Public | Load balancers, NAT gateway | Direct (IGW) | ALB, NAT Gateway |
| Private | Application workloads | Outbound only (NAT) | ECS Fargate tasks |
| Data | Databases, caches | None | RDS, ElastiCache |

### Security Group Rules

| SG | Inbound | Outbound | Source |
|----|---------|----------|--------|
| ALB | 443 (HTTPS), 80 (HTTP redirect) | All | Internet (0.0.0.0/0) |
| ECS | 4000 (app port) | All | ALB SG only |
| RDS | 5432 (PostgreSQL) | N/A | ECS SG only |
| Redis | 6379 (Redis) | N/A | ECS SG only |

---

## Security

### Encryption

| Resource | At Rest | In Transit |
|----------|---------|------------|
| RDS | AES-256 (AWS managed key) | TLS required |
| ElastiCache | AES-256 | TLS required |
| S3 | AES-256 (SSE-S3) | HTTPS enforced |
| Secrets Manager | AES-256 (AWS managed key) | HTTPS API only |
| ALB | N/A | TLS 1.3 (ELBSecurityPolicy-TLS13-1-2-2021-06) |

### IAM Principles

- **Least privilege**: Each service gets only the permissions it needs
- **No wildcard resources**: IAM policies specify exact resource ARNs
- **Separate execution and task roles**: Execution role (pull images, get secrets) vs task role (application permissions like S3 access)
- **No long-lived credentials**: Use IAM roles for ECS tasks, not access keys

---

## Disaster Recovery

### RTO and RPO Targets

| Environment | RTO (Recovery Time) | RPO (Recovery Point) |
|-------------|---------------------|---------------------|
| Dev | 4 hours | 24 hours |
| Staging | 2 hours | 1 hour |
| Production | 30 minutes | 5 minutes |

### Backup Strategy

| Resource | Backup Method | Retention | Recovery |
|----------|---------------|-----------|----------|
| RDS | Automated snapshots | 7 days (dev), 30 days (prod) | Point-in-time restore |
| Redis | Automated snapshots | 1 day (dev), 7 days (prod) | Restore from snapshot |
| S3 | Versioning (prod only) | Indefinite | Restore previous version |
| Terraform State | S3 versioning | Indefinite | Restore from S3 version |

### Recovery Procedures

**Database recovery**:
```bash
# Restore RDS to point in time
aws rds restore-db-cluster-to-point-in-time \
  --source-db-cluster-identifier kids-learning-production \
  --db-cluster-identifier kids-learning-production-restored \
  --restore-to-time "2026-03-26T10:00:00Z"
```

**Full environment rebuild**:
```bash
terraform workspace select production
terraform apply -var-file=environments/production.tfvars
# Then restore data from backups
```

---

## Operational Procedures

### Deploying a New Version

```bash
# 1. Build and push Docker image
docker build -t kids-learning-api:v1.2.3 ./backend
docker tag kids-learning-api:v1.2.3 <ECR_URL>:v1.2.3
docker push <ECR_URL>:v1.2.3

# 2. Update Terraform image tag
terraform apply -var-file=environments/production.tfvars \
  -var="image_tag=v1.2.3"

# 3. Monitor deployment
aws ecs describe-services --cluster kids-learning-production \
  --services kids-learning-production-api \
  --query 'services[0].deployments'
```

### Scaling the API

```bash
# Temporary manual scaling
aws ecs update-service --cluster kids-learning-production \
  --service kids-learning-production-api --desired-count 8

# Permanent scaling via Terraform
# Update api_desired_count and api_max_count in production.tfvars
terraform apply -var-file=environments/production.tfvars
```

### Database Migrations

```bash
# 1. Run migration against staging first
DATABASE_URL=$STAGING_DB_URL npx prisma migrate deploy

# 2. Verify staging is healthy
curl https://staging.kidslearningfun.app/health/ready

# 3. Run migration against production
DATABASE_URL=$PROD_DB_URL npx prisma migrate deploy

# 4. Deploy new application version
terraform apply -var-file=environments/production.tfvars -var="image_tag=v1.2.3"
```

### Accessing Logs

```bash
# Stream live logs
aws logs tail /ecs/kids-learning-production --follow

# Query with CloudWatch Insights
aws logs start-query \
  --log-group-name /ecs/kids-learning-production \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, @message | filter level >= 40 | sort @timestamp desc | limit 50'
```
