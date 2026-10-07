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

variable "recordings_cors_origins" {
  description = "Origins allowed to PUT directly to the recordings bucket via presigned URLs (computed from the served domains in the root module)"
  type        = list(string)
}
