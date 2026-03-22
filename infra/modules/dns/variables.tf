variable "name_prefix" {
  description = "Prefix applied to all resource names"
  type        = string
}

variable "domain_name" {
  description = "Root domain (e.g. geysinan.com)"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "create_hosted_zone" {
  description = "Set to false to look up an existing hosted zone instead of creating one"
  type        = bool
  default     = true
}
