# ---------------------------------------------------------------------------
# Hosted Zone
# Conditionally created so that teams who already own the zone in another
# account / workspace can set create_hosted_zone = false and look it up.
# ---------------------------------------------------------------------------

resource "aws_route53_zone" "main" {
  count = var.create_hosted_zone ? 1 : 0

  name = var.domain_name

  tags = {
    Name = "${var.name_prefix}-zone"
  }
}

data "aws_route53_zone" "existing" {
  count = var.create_hosted_zone ? 0 : 1

  name         = var.domain_name
  private_zone = false
}

locals {
  zone_id = var.create_hosted_zone ? aws_route53_zone.main[0].zone_id : data.aws_route53_zone.existing[0].zone_id
}

# ---------------------------------------------------------------------------
# ACM Certificate
# Must be in us-east-1 for CloudFront (caller passes the us_east_1 provider).
# Wildcard covers all subdomains; the apex domain is added as a SAN.
# ---------------------------------------------------------------------------

resource "aws_acm_certificate" "main" {
  domain_name               = "*.${var.domain_name}"
  validation_method         = "DNS"
  subject_alternative_names = [var.domain_name]

  # Allow replacement without downtime — create new cert before destroying old.
  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.name_prefix}-cert"
  }
}

# ---------------------------------------------------------------------------
# DNS Validation Records
# The certificate may emit one or two unique CNAME records (apex + wildcard
# can share the same record). for_each on the domain_validation_options set
# deduplicates them automatically.
# ---------------------------------------------------------------------------

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options :
    dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id = local.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

# Block until AWS has verified the DNS records and issued the certificate.
resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}
