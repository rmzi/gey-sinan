output "static_distribution_id" {
  description = "CloudFront distribution ID for static assets"
  value       = aws_cloudfront_distribution.static.id
}

output "api_distribution_id" {
  description = "CloudFront distribution ID for the API"
  value       = aws_cloudfront_distribution.api.id
}

output "static_distribution_domain" {
  description = "CloudFront domain name for the static distribution"
  value       = aws_cloudfront_distribution.static.domain_name
}

output "api_distribution_domain" {
  description = "CloudFront domain name for the API distribution"
  value       = aws_cloudfront_distribution.api.domain_name
}
