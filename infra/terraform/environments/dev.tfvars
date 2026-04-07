# ══════════════════════════════════════════════════════════════════════════════
# Kids Learning App - Development Environment Variables
# ══════════════════════════════════════════════════════════════════════════════
# Usage: terraform apply -var-file=environments/dev.tfvars
# ══════════════════════════════════════════════════════════════════════════════

environment = "dev"
aws_region  = "us-east-1"

# ── Application ───────────────────────────────────────────────────────────────
cors_origin    = "https://dev.kidslearningfun.app"
log_level      = "debug"
rate_limit_max = 500

# ── ECS API ──────────────────────────────────────────────────────────────────
api_cpu           = 256
api_memory        = 512
api_desired_count = 1
enable_autoscaling = false

# ── ECS Worker ───────────────────────────────────────────────────────────────
worker_cpu              = 256
worker_memory           = 512
worker_desired_count    = 1
worker_media_concurrency = 2
worker_ai_concurrency    = 1

# ── RDS (minimal for dev) ────────────────────────────────────────────────────
rds_engine_version = "15.4"
rds_instance_count = 1
rds_min_capacity   = 0.5
rds_max_capacity   = 2
db_name            = "kids_learning_dev"

# ── Redis (minimal for dev) ──────────────────────────────────────────────────
redis_node_type          = "cache.t3.micro"
redis_num_cache_clusters = 1
redis_engine_version     = "7.0"

# ── Networking ────────────────────────────────────────────────────────────────
vpc_cidr             = "10.0.0.0/16"
public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs = ["10.0.10.0/24", "10.0.11.0/24"]
data_subnet_cidrs    = ["10.0.20.0/24", "10.0.21.0/24"]
enable_nat_gateway   = true

# ── TLS (use a dev certificate) ──────────────────────────────────────────────
acm_certificate_arn = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERTIFICATE_ID"

# ── Monitoring (relaxed for dev) ──────────────────────────────────────────────
enable_container_insights  = false
log_retention_days         = 7
alarm_5xx_threshold        = 50
alarm_latency_p95_threshold = 5.0
sns_alarm_topic_arn        = ""
