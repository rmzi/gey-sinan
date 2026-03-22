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
}

# ---------------------------------------------------------------------------
# Networking
# ---------------------------------------------------------------------------

module "networking" {
  source = "./modules/networking"

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
  environment        = var.environment
  create_hosted_zone = var.create_hosted_zone
}

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

module "database" {
  source = "./modules/database"

  name_prefix           = local.name_prefix
  environment           = var.environment
  private_subnet_ids    = module.networking.private_subnet_ids
  vpc_id                = module.networking.vpc_id
  ecs_security_group_id = module.ecs.ecs_sg_id

  db_instance_class    = var.db_instance_class
  db_username          = var.db_username
  db_password          = var.db_password
  db_backup_retention  = var.db_backup_retention
}

# ---------------------------------------------------------------------------
# Storage (S3 + OAI)
# ---------------------------------------------------------------------------

module "storage" {
  source = "./modules/storage"

  name_prefix = local.name_prefix
  environment = var.environment
  domain_name = var.domain_name
}

# ---------------------------------------------------------------------------
# ECS (ECR, Cluster, ALB, Service)
# ---------------------------------------------------------------------------

module "ecs" {
  source = "./modules/ecs"

  name_prefix        = local.name_prefix
  environment        = var.environment
  vpc_id             = module.networking.vpc_id
  public_subnet_ids  = module.networking.public_subnet_ids
  private_subnet_ids = module.networking.private_subnet_ids
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

  name_prefix     = local.name_prefix
  environment     = var.environment
  domain_name     = var.domain_name
  certificate_arn = module.dns.certificate_arn
  zone_id         = module.dns.zone_id

  static_bucket_domain_name  = module.storage.static_bucket_regional_domain
  media_bucket_domain_name   = module.storage.media_bucket_regional_domain
  oai_cloudfront_access_path = module.storage.oai_cloudfront_path

  alb_dns_name = module.ecs.alb_dns_name
  alb_zone_id  = module.ecs.alb_zone_id
}
