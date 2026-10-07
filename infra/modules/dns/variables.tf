variable "name_prefix" {
  description = "Prefix applied to all resource names"
  type        = string
}

variable "domain_name" {
  description = "Root domain (e.g. geysinan.com)"
  type        = string
}

variable "additional_domains" {
  description = "Extra root domains served identically to domain_name (each gets a hosted-zone lookup and wildcard + apex SANs on the certificate)"
  type        = list(string)
  default     = []
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
