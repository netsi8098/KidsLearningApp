# ══════════════════════════════════════════════════════════════════════════════
# Kids Learning App - Terraform Outputs
# ══════════════════════════════════════════════════════════════════════════════

# ── Networking ────────────────────────────────────────────────────────────────

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

# ── Load Balancer ─────────────────────────────────────────────────────────────

output "alb_dns_name" {
  description = "ALB DNS name for CNAME records"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "ALB hosted zone ID for Route 53 alias records"
  value       = aws_lb.main.zone_id
}

output "api_url" {
  description = "Full API URL"
  value       = "https://${aws_lb.main.dns_name}"
}

# ── ECS ──────────────────────────────────────────────────────────────────────

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "api_service_name" {
  description = "API ECS service name"
  value       = aws_ecs_service.api.name
}

output "worker_service_name" {
  description = "Worker ECS service name"
  value       = aws_ecs_service.worker.name
}

# ── ECR ──────────────────────────────────────────────────────────────────────

output "ecr_repository_url" {
  description = "ECR repository URL for pushing Docker images"
  value       = aws_ecr_repository.api.repository_url
}

# ── Database ──────────────────────────────────────────────────────────────────

output "rds_cluster_endpoint" {
  description = "RDS cluster writer endpoint"
  value       = aws_rds_cluster.main.endpoint
  sensitive   = true
}

output "rds_cluster_reader_endpoint" {
  description = "RDS cluster reader endpoint"
  value       = aws_rds_cluster.main.reader_endpoint
  sensitive   = true
}

# ── Redis ─────────────────────────────────────────────────────────────────────

output "redis_primary_endpoint" {
  description = "ElastiCache Redis primary endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}

# ── Storage ───────────────────────────────────────────────────────────────────

output "media_bucket_name" {
  description = "S3 media bucket name"
  value       = aws_s3_bucket.media.bucket
}

output "media_bucket_arn" {
  description = "S3 media bucket ARN"
  value       = aws_s3_bucket.media.arn
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.media.id
}

output "cloudfront_domain_name" {
  description = "CloudFront domain name for media URLs"
  value       = aws_cloudfront_distribution.media.domain_name
}

# ── Secrets ───────────────────────────────────────────────────────────────────

output "database_url_secret_arn" {
  description = "Secrets Manager ARN for DATABASE_URL"
  value       = aws_secretsmanager_secret.database_url.arn
}

output "redis_url_secret_arn" {
  description = "Secrets Manager ARN for REDIS_URL"
  value       = aws_secretsmanager_secret.redis_url.arn
}

output "jwt_secret_arn" {
  description = "Secrets Manager ARN for JWT_SECRET"
  value       = aws_secretsmanager_secret.jwt_secret.arn
}

# ── Monitoring ────────────────────────────────────────────────────────────────

output "cloudwatch_log_group" {
  description = "CloudWatch log group name for ECS logs"
  value       = aws_cloudwatch_log_group.ecs.name
}
