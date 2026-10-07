variable "name_prefix" {
  description = "Prefix applied to all resource names"
  type        = string
}

variable "allowed_origins" {
  description = "Browser origins allowed to request presigned upload URLs"
  type        = list(string)
}

variable "recordings_bucket_name" {
  description = "Name of the recordings S3 bucket the presign Lambda targets"
  type        = string
}

variable "recordings_bucket_arn" {
  description = "ARN of the recordings S3 bucket the presign Lambda targets"
  type        = string
}
