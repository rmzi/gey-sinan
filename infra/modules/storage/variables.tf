variable "name_prefix" {
  description = "Prefix applied to all resource names"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "domain_name" {
  description = "Root domain (used in CORS origin patterns)"
  type        = string
}
