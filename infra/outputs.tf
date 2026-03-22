# ---------------------------------------------------------------------------
# Networking
# ---------------------------------------------------------------------------

output "vpc_id" {
  description = "ID of the application VPC"
  value       = module.networking.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.networking.private_subnet_ids
}

# ---------------------------------------------------------------------------
# DNS
# ---------------------------------------------------------------------------

output "zone_id" {
  description = "Route 53 hosted zone ID"
  value       = module.dns.zone_id
}

output "certificate_arn" {
  description = "ARN of the ACM wildcard certificate"
  value       = module.dns.certificate_arn
}

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

output "db_endpoint" {
  description = "RDS instance endpoint (host:port)"
  value       = module.database.endpoint
  sensitive   = true
}

output "db_name" {
  description = "Name of the application database"
  value       = module.database.db_name
}

# ---------------------------------------------------------------------------
# Storage
# ---------------------------------------------------------------------------

output "static_bucket_name" {
  description = "Name of the static-assets S3 bucket"
  value       = module.storage.static_bucket_name
}

output "media_bucket_name" {
  description = "Name of the user-media S3 bucket"
  value       = module.storage.media_bucket_name
}

output "recordings_bucket_name" {
  description = "Name of the audio-recordings S3 bucket"
  value       = module.storage.recordings_bucket_name
}

output "ml_corpus_bucket_name" {
  description = "Name of the ML-corpus S3 bucket"
  value       = module.storage.ml_corpus_bucket_name
}

# ---------------------------------------------------------------------------
# ECS / Compute
# ---------------------------------------------------------------------------

output "alb_dns_name" {
  description = "DNS name of the application load balancer"
  value       = module.ecs.alb_dns_name
}

output "ecr_url" {
  description = "ECR repository URL for the backend image"
  value       = module.ecs.ecr_url
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = module.ecs.service_name
}

# ---------------------------------------------------------------------------
# CDN
# ---------------------------------------------------------------------------

output "static_distribution_id" {
  description = "CloudFront distribution ID for static assets"
  value       = module.cdn.static_distribution_id
}

output "api_distribution_id" {
  description = "CloudFront distribution ID for the API"
  value       = module.cdn.api_distribution_id
}

output "static_distribution_domain" {
  description = "CloudFront domain for the static distribution"
  value       = module.cdn.static_distribution_domain
}

output "api_distribution_domain" {
  description = "CloudFront domain for the API distribution"
  value       = module.cdn.api_distribution_domain
}
