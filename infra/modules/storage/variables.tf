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
  description = "Origins allowed to PUT directly to the recordings bucket via presigned URLs"
  type        = list(string)
  default = [
    "https://volunteer.geysinan.com",
    "https://volunteer-dev.geysinan.com",
    "https://geysinan.com",
    "https://dev.geysinan.com",
    "http://localhost:8081",
  ]
}
