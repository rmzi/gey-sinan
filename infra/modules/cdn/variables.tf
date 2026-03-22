variable "name_prefix" {
  description = "Prefix applied to all resource names"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "domain_name" {
  description = "Root domain (e.g. geysinan.com)"
  type        = string
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate (must be in us-east-1)"
  type        = string
}

variable "zone_id" {
  description = "Route 53 hosted zone ID"
  type        = string
}

variable "static_bucket_domain_name" {
  description = "Regional domain name of the static S3 bucket"
  type        = string
}

variable "media_bucket_domain_name" {
  description = "Regional domain name of the media S3 bucket"
  type        = string
}

variable "oai_cloudfront_access_path" {
  description = "CloudFront OAI path string for S3 origins"
  type        = string
}

variable "alb_dns_name" {
  description = "DNS name of the application load balancer"
  type        = string
}

variable "alb_zone_id" {
  description = "Hosted zone ID of the ALB (for Route 53 alias records)"
  type        = string
}
