output "static_bucket_name" {
  description = "Name of the static assets bucket"
  value       = aws_s3_bucket.static.bucket
}

output "static_bucket_arn" {
  description = "ARN of the static assets bucket"
  value       = aws_s3_bucket.static.arn
}

output "static_bucket_regional_domain" {
  description = "Regional domain name for the static bucket (CloudFront origin)"
  value       = aws_s3_bucket.static.bucket_regional_domain_name
}

output "media_bucket_name" {
  description = "Name of the media bucket"
  value       = aws_s3_bucket.media.bucket
}

output "media_bucket_arn" {
  description = "ARN of the media bucket"
  value       = aws_s3_bucket.media.arn
}

output "media_bucket_regional_domain" {
  description = "Regional domain name for the media bucket (CloudFront origin)"
  value       = aws_s3_bucket.media.bucket_regional_domain_name
}

output "recordings_bucket_name" {
  description = "Name of the recordings bucket"
  value       = aws_s3_bucket.recordings.bucket
}

output "recordings_bucket_arn" {
  description = "ARN of the recordings bucket"
  value       = aws_s3_bucket.recordings.arn
}

output "ml_corpus_bucket_name" {
  description = "Name of the ML corpus bucket"
  value       = aws_s3_bucket.ml_corpus.bucket
}

output "ml_corpus_bucket_arn" {
  description = "ARN of the ML corpus bucket"
  value       = aws_s3_bucket.ml_corpus.arn
}

output "oai_iam_arn" {
  description = "IAM ARN of the CloudFront Origin Access Identity"
  value       = aws_cloudfront_origin_access_identity.main.iam_arn
}

output "oai_cloudfront_path" {
  description = "CloudFront path for the OAI (used in distribution origin config)"
  value       = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
}
