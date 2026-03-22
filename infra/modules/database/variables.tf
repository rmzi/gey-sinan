variable "name_prefix" {
  description = "Prefix applied to all resource names"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC where the database will be placed"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for the DB subnet group"
  type        = list(string)
}

variable "ecs_security_group_id" {
  description = "Security group ID of the ECS tasks (allowed to reach port 5432)"
  type        = string
}

variable "db_instance_class" {
  description = "RDS instance type"
  type        = string
}

variable "db_username" {
  description = "Master database username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Master database password"
  type        = string
  sensitive   = true
}

variable "db_backup_retention" {
  description = "Days to retain automated backups"
  type        = number
  default     = 7
}
