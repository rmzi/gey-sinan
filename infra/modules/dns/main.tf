# ---------------------------------------------------------------------------
# Hosted Zones
# One per domain (primary + additional). Conditionally created so that teams
# who already own the zones in another account / workspace can set
# create_hosted_zone = false and look them up.
# ---------------------------------------------------------------------------

locals {
  all_domains = concat([var.domain_name], var.additional_domains)
}

resource "aws_route53_zone" "main" {
  for_each = var.create_hosted_zone ? toset(local.all_domains) : toset([])

  name = each.value

  tags = {
    Name = "${var.name_prefix}-zone"
  }
}

data "aws_route53_zone" "existing" {
  for_each = var.create_hosted_zone ? toset([]) : toset(local.all_domains)

  name         = each.value
  private_zone = false
}

locals {
  zone_ids = var.create_hosted_zone ? {
    for d, z in aws_route53_zone.main : d => z.zone_id
    } : {
    for d, z in data.aws_route53_zone.existing : d => z.zone_id
  }
}

# ---------------------------------------------------------------------------
# ACM Certificate
# Must be in us-east-1 for CloudFront (caller passes the us_east_1 provider).
# One cert covers every domain: wildcard + apex per domain (the primary
# domain's wildcard is the certificate CN, everything else rides as SANs).
# ---------------------------------------------------------------------------

resource "aws_acm_certificate" "main" {
  domain_name       = "*.${var.domain_name}"
  validation_method = "DNS"
  subject_alternative_names = concat(
    [var.domain_name],
    flatten([for d in var.additional_domains : ["*.${d}", d]]),
  )

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
# The certificate may emit one or two unique CNAME records per domain (apex +
# wildcard can share the same record). for_each on the
# domain_validation_options set deduplicates them automatically; each record
# lands in the hosted zone that owns its domain.
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

  allow_overwrite = true
  zone_id         = local.zone_ids[trimprefix(each.key, "*.")]
  name            = each.value.name
  type            = each.value.type
  ttl             = 60
  records         = [each.value.record]
}

# Block until AWS has verified the DNS records and issued the certificate.
resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}
