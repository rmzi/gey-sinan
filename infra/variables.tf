variable "environment" {
  description = "Deployment environment (dev, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "environment must be 'dev' or 'prod'."
  }
}

variable "project_name" {
  description = "Project identifier used in resource names"
  type        = string
  default     = "geysinan"
}

variable "region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Root domain for the application"
  type        = string
  default     = "geysinan.com"
}

variable "create_hosted_zone" {
  description = "Whether to create the Route 53 hosted zone (false if zone already exists)"
  type        = bool
  default     = true
}

# --- Database ---

variable "db_instance_class" {
  description = "RDS instance type (e.g. db.t4g.micro)"
  type        = string
}

variable "db_username" {
  description = "Master username for the RDS database"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Master password for the RDS database"
  type        = string
  sensitive   = true
}

variable "db_backup_retention" {
  description = "Number of days to retain automated database backups"
  type        = number
  default     = 7
}

# --- ECS / Compute ---

variable "ecs_cpu" {
  description = "Fargate task CPU units (256 = 0.25 vCPU)"
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
  description = "Full ECR image URI for the backend container (e.g. 123456789.dkr.ecr.us-east-1.amazonaws.com/geysinan-backend:latest)"
  type        = string
  default     = ""
}
