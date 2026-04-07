# Kids Learning App - Infrastructure

This directory contains all Infrastructure as Code (IaC) for the Kids Learning App backend, managed via Terraform on AWS.

## Directory Structure

```
infra/
  environments/         # Environment-specific configuration (non-secret values)
    local.env           # Local development
    dev.env             # Shared development / CI
    staging.env         # Pre-production / QA
    production.env      # Live production
  terraform/
    main.tf             # Core infrastructure resources
    variables.tf        # Input variable definitions
    outputs.tf          # Output values (URLs, ARNs, etc.)
    environments/       # Terraform variable files per environment
      dev.tfvars
      staging.tfvars
      production.tfvars
```

## Architecture Overview

```
                          CloudFront (CDN)
                               |
                          ALB (HTTPS)
                           /       \
                     ECS Fargate    ECS Fargate
                     (API tasks)    (Worker tasks)
                       |     |          |
                    RDS PG  ElastiCache Redis
                       |
                    S3 (media)
```

### AWS Services Used

| Service | Purpose |
|---------|---------|
| VPC + Subnets | Network isolation (public, private, data tiers) |
| ECS Fargate | Containerized API and worker services |
| ALB | HTTPS load balancing with health checks |
| RDS PostgreSQL | Primary database |
| ElastiCache Redis | Queue backend (BullMQ) and caching |
| S3 | Media/asset storage |
| CloudFront | CDN for static assets and media |
| ACM | TLS certificates |
| Route 53 | DNS management |
| Secrets Manager | Secret storage (DB passwords, API keys, JWT) |
| CloudWatch | Logs, metrics, and alarms |
| ECR | Docker image registry |

## Quick Start

### Prerequisites

- [Terraform >= 1.6](https://www.terraform.io/downloads)
- [AWS CLI v2](https://aws.amazon.com/cli/) configured with appropriate credentials
- Docker (for building images)

### Deploy to Dev

```bash
cd infra/terraform
terraform init
terraform workspace select dev || terraform workspace new dev
terraform plan -var-file=environments/dev.tfvars
terraform apply -var-file=environments/dev.tfvars
```

### Deploy to Staging / Production

```bash
terraform workspace select staging
terraform plan -var-file=environments/staging.tfvars -out=plan.tfplan
# Review the plan carefully
terraform apply plan.tfplan
```

## Secret Management

Secrets are stored in AWS Secrets Manager and injected into ECS task definitions as environment variables. **Never commit secrets to this repository.**

Secrets managed externally:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - ElastiCache connection string
- `JWT_SECRET` - Authentication signing key
- `OPENAI_API_KEY` - AI generation service
- `ANTHROPIC_API_KEY` - AI generation service
- `STORAGE_S3_ACCESS_KEY` / `STORAGE_S3_SECRET_KEY` - S3 credentials (if not using IAM roles)

## Environments

| Environment | Purpose | Scale | Estimated Cost |
|-------------|---------|-------|---------------|
| dev | Development & CI | Minimal (1 task, db.t3.micro) | ~$50/mo |
| staging | Pre-production QA | Medium (2 tasks, db.t3.small) | ~$150/mo |
| production | Live users | Full (4+ tasks, db.r6g.large, multi-AZ) | ~$800/mo |

## Terraform State

State is stored in an S3 backend with DynamoDB locking:

```hcl
backend "s3" {
  bucket         = "kids-learning-terraform-state"
  key            = "infra/terraform.tfstate"
  region         = "us-east-1"
  dynamodb_table = "terraform-locks"
  encrypt        = true
}
```

## Workflow

1. **Plan**: `terraform plan -var-file=environments/<env>.tfvars`
2. **Review**: Inspect the plan output for unexpected changes
3. **Apply**: `terraform apply` (requires approval for staging/production)
4. **Verify**: Check CloudWatch dashboards and health endpoints

CI/CD runs `terraform plan` on every PR and `terraform apply` on merge to main.
