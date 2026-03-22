variable "name_prefix" {
  description = "Prefix applied to all resource names"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs for the ALB"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for ECS tasks"
  type        = list(string)
}

variable "certificate_arn" {
  description = "ACM certificate ARN for the HTTPS ALB listener"
  type        = string
}

variable "ecs_cpu" {
  description = "Fargate task CPU units"
  type        = number
  default     = 256
}

variable "ecs_memory" {
  description = "Fargate task memory in MiB"
  type        = number
  default     = 512
}

variable "ecs_desired_count" {
  description = "Desired number of running ECS task instances"
  type        = number
  default     = 1
}

variable "container_image" {
  description = "Full image URI for the backend container"
  type        = string
  default     = ""
}

variable "media_bucket_arn" {
  description = "ARN of the media S3 bucket (task role gets read/write access)"
  type        = string
}

variable "recordings_bucket_arn" {
  description = "ARN of the recordings S3 bucket (task role gets read/write access)"
  type        = string
}
