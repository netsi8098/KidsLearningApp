# ══════════════════════════════════════════════════════════════════════════════
# Kids Learning App - Terraform Variables
# ══════════════════════════════════════════════════════════════════════════════

# ── General ───────────────────────────────────────────────────────────────────

variable "project_name" {
  description = "Project name used for resource naming and tagging"
  type        = string
  default     = "kids-learning"
}

variable "environment" {
  description = "Deployment environment (dev, staging, production)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

# ── Networking ────────────────────────────────────────────────────────────────

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (ALB, NAT)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (ECS tasks)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "data_subnet_cidrs" {
  description = "CIDR blocks for data subnets (RDS, Redis)"
  type        = list(string)
  default     = ["10.0.20.0/24", "10.0.21.0/24"]
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets (required for ECS Fargate)"
  type        = bool
  default     = true
}

# ── Application ───────────────────────────────────────────────────────────────

variable "app_port" {
  description = "Port the application listens on"
  type        = number
  default     = 4000
}

variable "cors_origin" {
  description = "Allowed CORS origin"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}

variable "log_level" {
  description = "Application log level"
  type        = string
  default     = "info"
  validation {
    condition     = contains(["debug", "info", "warn", "error"], var.log_level)
    error_message = "Log level must be debug, info, warn, or error."
  }
}

variable "rate_limit_max" {
  description = "Maximum requests per rate limit window"
  type        = number
  default     = 200
}

# ── ECS API Service ──────────────────────────────────────────────────────────

variable "api_cpu" {
  description = "CPU units for API task (1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "api_memory" {
  description = "Memory (MiB) for API task"
  type        = number
  default     = 1024
}

variable "api_desired_count" {
  description = "Number of API task instances"
  type        = number
  default     = 2
}

variable "api_max_count" {
  description = "Maximum number of API tasks for autoscaling"
  type        = number
  default     = 10
}

variable "enable_autoscaling" {
  description = "Enable ECS service autoscaling"
  type        = bool
  default     = false
}

# ── ECS Worker Service ───────────────────────────────────────────────────────

variable "worker_cpu" {
  description = "CPU units for worker task"
  type        = number
  default     = 512
}

variable "worker_memory" {
  description = "Memory (MiB) for worker task"
  type        = number
  default     = 1024
}

variable "worker_desired_count" {
  description = "Number of worker task instances"
  type        = number
  default     = 1
}

variable "worker_media_concurrency" {
  description = "Concurrency for media processing worker"
  type        = number
  default     = 2
}

variable "worker_ai_concurrency" {
  description = "Concurrency for AI generation worker"
  type        = number
  default     = 1
}

# ── RDS PostgreSQL ────────────────────────────────────────────────────────────

variable "rds_engine_version" {
  description = "Aurora PostgreSQL engine version"
  type        = string
  default     = "15.4"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "kids_learning"
}

variable "db_master_username" {
  description = "Master username for the database"
  type        = string
  default     = "kidslearning_admin"
  sensitive   = true
}

variable "db_master_password" {
  description = "Master password for the database"
  type        = string
  sensitive   = true
}

variable "rds_instance_count" {
  description = "Number of Aurora instances (1 for dev, 2+ for multi-AZ)"
  type        = number
  default     = 1
}

variable "rds_min_capacity" {
  description = "Minimum Aurora Serverless v2 ACU capacity"
  type        = number
  default     = 0.5
}

variable "rds_max_capacity" {
  description = "Maximum Aurora Serverless v2 ACU capacity"
  type        = number
  default     = 4
}

# ── ElastiCache Redis ─────────────────────────────────────────────────────────

variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_cache_clusters" {
  description = "Number of Redis cache clusters (1 for dev, 2+ for multi-AZ)"
  type        = number
  default     = 1
}

variable "redis_engine_version" {
  description = "Redis engine version"
  type        = string
  default     = "7.0"
}

# ── TLS & DNS ─────────────────────────────────────────────────────────────────

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate for HTTPS"
  type        = string
}

variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = ""
}

# ── Monitoring & Alerts ──────────────────────────────────────────────────────

variable "enable_container_insights" {
  description = "Enable CloudWatch Container Insights for ECS"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

variable "sns_alarm_topic_arn" {
  description = "SNS topic ARN for CloudWatch alarm notifications"
  type        = string
  default     = ""
}

variable "alarm_5xx_threshold" {
  description = "Number of 5xx errors in 5 minutes to trigger alarm"
  type        = number
  default     = 10
}

variable "alarm_latency_p95_threshold" {
  description = "P95 latency threshold in seconds to trigger alarm"
  type        = number
  default     = 2.0
}
