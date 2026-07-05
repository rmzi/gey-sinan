output "zone_id" {
  description = "Route 53 hosted zone ID of the primary domain"
  value       = local.zone_ids[var.domain_name]
}

output "zone_ids" {
  description = "Route 53 hosted zone IDs keyed by domain"
  value       = local.zone_ids
}

output "certificate_arn" {
  description = "ARN of the validated ACM certificate"
  value       = aws_acm_certificate_validation.main.certificate_arn
}
