# ══════════════════════════════════════════════════════════════════════════════
# Kids Learning App - Staging Environment Variables
# ══════════════════════════════════════════════════════════════════════════════
# Usage: terraform apply -var-file=environments/staging.tfvars
# ══════════════════════════════════════════════════════════════════════════════

environment = "staging"
aws_region  = "us-east-1"

# ── Application ───────────────────────────────────────────────────────────────
cors_origin    = "https://staging.kidslearningfun.app"
log_level      = "info"
rate_limit_max = 300

# ── ECS API ──────────────────────────────────────────────────────────────────
api_cpu           = 512
api_memory        = 1024
api_desired_count = 2
api_max_count     = 4
enable_autoscaling = true

# ── ECS Worker ───────────────────────────────────────────────────────────────
worker_cpu              = 512
worker_memory           = 1024
worker_desired_count    = 1
worker_media_concurrency = 4
worker_ai_concurrency    = 2

# ── RDS (moderate for staging) ───────────────────────────────────────────────
rds_engine_version = "15.4"
rds_instance_count = 1
rds_min_capacity   = 0.5
rds_max_capacity   = 4
db_name            = "kids_learning_staging"

# ── Redis (moderate for staging) ─────────────────────────────────────────────
redis_node_type          = "cache.t3.small"
redis_num_cache_clusters = 1
redis_engine_version     = "7.0"

# ── Networking ────────────────────────────────────────────────────────────────
vpc_cidr             = "10.1.0.0/16"
public_subnet_cidrs  = ["10.1.1.0/24", "10.1.2.0/24"]
private_subnet_cidrs = ["10.1.10.0/24", "10.1.11.0/24"]
data_subnet_cidrs    = ["10.1.20.0/24", "10.1.21.0/24"]
enable_nat_gateway   = true

# ── TLS ──────────────────────────────────────────────────────────────────────
acm_certificate_arn = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERTIFICATE_ID"

# ── Monitoring ────────────────────────────────────────────────────────────────
enable_container_insights  = true
log_retention_days         = 14
alarm_5xx_threshold        = 20
alarm_latency_p95_threshold = 3.0
sns_alarm_topic_arn        = "arn:aws:sns:us-east-1:ACCOUNT_ID:kids-learning-staging-alerts"
