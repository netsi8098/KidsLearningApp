# ══════════════════════════════════════════════════════════════════════════════
# Kids Learning App - Production Environment Variables
# ══════════════════════════════════════════════════════════════════════════════
# Usage: terraform apply -var-file=environments/production.tfvars
# IMPORTANT: Always run `terraform plan` first and review before applying.
# ══════════════════════════════════════════════════════════════════════════════

environment = "production"
aws_region  = "us-east-1"

# ── Application ───────────────────────────────────────────────────────────────
cors_origin    = "https://kidslearningfun.app"
log_level      = "info"
rate_limit_max = 200

# ── ECS API (production scale) ───────────────────────────────────────────────
api_cpu           = 1024
api_memory        = 2048
api_desired_count = 4
api_max_count     = 20
enable_autoscaling = true

# ── ECS Worker (production scale) ────────────────────────────────────────────
worker_cpu              = 1024
worker_memory           = 2048
worker_desired_count    = 2
worker_media_concurrency = 4
worker_ai_concurrency    = 2

# ── RDS (production: multi-AZ, higher capacity) ──────────────────────────────
rds_engine_version = "15.4"
rds_instance_count = 2        # Multi-AZ: writer + reader
rds_min_capacity   = 2
rds_max_capacity   = 16
db_name            = "kids_learning"

# ── Redis (production: multi-AZ, failover) ───────────────────────────────────
redis_node_type          = "cache.r6g.large"
redis_num_cache_clusters = 2  # Multi-AZ with automatic failover
redis_engine_version     = "7.0"

# ── Networking ────────────────────────────────────────────────────────────────
vpc_cidr             = "10.2.0.0/16"
public_subnet_cidrs  = ["10.2.1.0/24", "10.2.2.0/24"]
private_subnet_cidrs = ["10.2.10.0/24", "10.2.11.0/24"]
data_subnet_cidrs    = ["10.2.20.0/24", "10.2.21.0/24"]
enable_nat_gateway   = true

# ── TLS ──────────────────────────────────────────────────────────────────────
acm_certificate_arn = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERTIFICATE_ID"
domain_name         = "kidslearningfun.app"

# ── Monitoring (strict for production) ────────────────────────────────────────
enable_container_insights  = true
log_retention_days         = 90
alarm_5xx_threshold        = 10
alarm_latency_p95_threshold = 2.0
sns_alarm_topic_arn        = "arn:aws:sns:us-east-1:ACCOUNT_ID:kids-learning-production-alerts"
