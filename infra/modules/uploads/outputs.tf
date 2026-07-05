output "function_url" {
  description = "Public Lambda function URL for the presign endpoint"
  value       = aws_lambda_function_url.presign.function_url
}
