provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# ACM certificates for CloudFront must live in us-east-1, so we always
# need a provider alias pointing there regardless of the primary region.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"

  # Browser origins allowed to hit the presign Lambda and PUT to the
  # recordings bucket, across every served domain.
  web_cors_origins = concat(
    flatten([for d in concat([var.domain_name], var.additional_domains) : [
      "https://${d}",
      "https://dev.${d}",
      "https://volunteer.${d}",
      "https://volunteer-dev.${d}",
    ]]),
    ["http://localhost:8081"],
  )
}

# ---------------------------------------------------------------------------
# Networking
# Backend stack (VPC + NAT, RDS, ECS/ALB, API CloudFront) is gated behind
# var.enable_backend. It costs ~$75/mo idle, so keep it off until a backend
# image actually ships to ECR.
# ---------------------------------------------------------------------------

module "networking" {
  source = "./modules/networking"
  count  = var.enable_backend ? 1 : 0

  name_prefix = local.name_prefix
  environment = var.environment
}

# ---------------------------------------------------------------------------
# DNS + TLS
# ---------------------------------------------------------------------------

module "dns" {
  source = "./modules/dns"

  providers = {
    aws = aws.us_east_1
  }

  name_prefix        = local.name_prefix
  domain_name        = var.domain_name
  additional_domains = var.additional_domains
  environment        = var.environment
  create_hosted_zone = var.create_hosted_zone
}

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

module "database" {
  source = "./modules/database"
  count  = var.enable_backend ? 1 : 0

  name_prefix           = local.name_prefix
  environment           = var.environment
  private_subnet_ids    = module.networking[0].private_subnet_ids
  vpc_id                = module.networking[0].vpc_id
  ecs_security_group_id = module.ecs[0].ecs_sg_id

  db_instance_class   = var.db_instance_class
  db_username         = var.db_username
  db_password         = var.db_password
  db_backup_retention = var.db_backup_retention
}

# ---------------------------------------------------------------------------
# Storage (S3 + OAI)
# ---------------------------------------------------------------------------

module "storage" {
  source = "./modules/storage"

  name_prefix = local.name_prefix
  environment = var.environment
  domain_name = var.domain_name

  recordings_cors_origins = local.web_cors_origins
}

# ---------------------------------------------------------------------------
# Uploads (presign Lambda for volunteer recording contributions)
# ---------------------------------------------------------------------------

module "uploads" {
  source = "./modules/uploads"

  name_prefix     = local.name_prefix
  allowed_origins = local.web_cors_origins

  recordings_bucket_name = module.storage.recordings_bucket_name
  recordings_bucket_arn  = module.storage.recordings_bucket_arn
}

# ---------------------------------------------------------------------------
# ECS (ECR, Cluster, ALB, Service)
# ---------------------------------------------------------------------------

module "ecs" {
  source = "./modules/ecs"
  count  = var.enable_backend ? 1 : 0

  name_prefix        = local.name_prefix
  environment        = var.environment
  vpc_id             = module.networking[0].vpc_id
  public_subnet_ids  = module.networking[0].public_subnet_ids
  private_subnet_ids = module.networking[0].private_subnet_ids
  certificate_arn    = module.dns.certificate_arn

  ecs_cpu           = var.ecs_cpu
  ecs_memory        = var.ecs_memory
  ecs_desired_count = var.ecs_desired_count
  container_image   = var.container_image

  media_bucket_arn      = module.storage.media_bucket_arn
  recordings_bucket_arn = module.storage.recordings_bucket_arn
}

# ---------------------------------------------------------------------------
# CDN (CloudFront distributions + Route 53 records)
# ---------------------------------------------------------------------------

module "cdn" {
  source = "./modules/cdn"

  providers = {
    aws = aws.us_east_1
  }

  name_prefix        = local.name_prefix
  environment        = var.environment
  domain_name        = var.domain_name
  additional_domains = var.additional_domains
  certificate_arn    = module.dns.certificate_arn
  zone_ids           = module.dns.zone_ids

  static_bucket_domain_name  = module.storage.static_bucket_regional_domain
  media_bucket_domain_name   = module.storage.media_bucket_regional_domain
  oai_cloudfront_access_path = module.storage.oai_cloudfront_path

  enable_api   = var.enable_backend
  alb_dns_name = var.enable_backend ? module.ecs[0].alb_dns_name : ""
  alb_zone_id  = var.enable_backend ? module.ecs[0].alb_zone_id : ""
}
