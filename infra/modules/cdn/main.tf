locals {
  all_domains = concat([var.domain_name], var.additional_domains)

  # Subdomains served by the static distribution vary by environment.
  # Prod: apex + dictionary + volunteer; dev: prefixed equivalents.
  # Every domain (primary + additional) gets the same alias set.
  static_aliases = flatten([
    for d in local.all_domains : (
      var.environment == "prod" ? [
        d,
        "dictionary.${d}",
        "volunteer.${d}",
        ] : [
        "dev.${d}",
        "dictionary-dev.${d}",
        "volunteer-dev.${d}",
      ]
    )
  ])

  api_aliases = flatten([
    for d in local.all_domains : (
      var.environment == "prod" ? [
        "api.${d}",
        "admin.${d}",
        ] : [
        "api-dev.${d}",
        "admin-dev.${d}",
      ]
    )
  ])

  # Which root domain (and therefore hosted zone) owns each alias.
  alias_domain = {
    for a in concat(local.static_aliases, local.api_aliases) :
    a => [for d in local.all_domains : d if a == d || endswith(a, ".${d}")][0]
  }
}

# ---------------------------------------------------------------------------
# CloudFront Function — Subdomain Routing
# Rewrites the request URI based on the incoming Host header so that a single
# S3 origin can serve multiple "apps" stored under different key prefixes.
# ---------------------------------------------------------------------------

resource "aws_cloudfront_function" "subdomain_router" {
  name    = "${var.name_prefix}-subdomain-router"
  runtime = "cloudfront-js-1.0"
  comment = "Rewrite URI based on subdomain so dictionary and volunteer paths are served correctly"
  publish = true

  code = <<-EOF
    function handler(event) {
      var request = event.request;
      var host = request.headers.host.value;
      if (host.indexOf('dictionary') !== -1) {
        request.uri = '/dictionary' + request.uri;
      } else if (host.indexOf('volunteer') !== -1) {
        request.uri = '/volunteer' + request.uri;
      }
      return request;
    }
  EOF
}

# ---------------------------------------------------------------------------
# Static Distribution (S3 Origin)
# ---------------------------------------------------------------------------

resource "aws_cloudfront_distribution" "static" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # US, Canada, Europe only — lowest cost
  aliases             = local.static_aliases
  comment             = "${var.name_prefix} static assets"

  origin {
    domain_name = var.static_bucket_domain_name
    origin_id   = "s3-static"

    s3_origin_config {
      origin_access_identity = var.oai_cloudfront_access_path
    }
  }

  default_cache_behavior {
    target_origin_id       = "s3-static"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # Use the AWS-managed CachingOptimized policy for static assets.
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.subdomain_router.arn
    }
  }

  # Return a 200 with index.html for 403/404 so the SPA router handles paths.
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "${var.name_prefix}-static-cf"
  }
}

# ---------------------------------------------------------------------------
# API Distribution (ALB Origin)
# No caching — all requests pass through to the backend.
# ---------------------------------------------------------------------------

resource "aws_cloudfront_distribution" "api" {
  enabled         = true
  is_ipv6_enabled = true
  price_class     = "PriceClass_100"
  aliases         = local.api_aliases
  comment         = "${var.name_prefix} API / admin"

  origin {
    domain_name = var.alb_dns_name
    origin_id   = "alb-api"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "alb-api"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # AWS-managed CachingDisabled policy — zero TTL, passes everything through.
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    origin_request_policy_id = "b689b0a8-53d0-40ab-baf2-68738e2966ac" # AllViewerExceptHostHeader
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "${var.name_prefix}-api-cf"
  }
}

# ---------------------------------------------------------------------------
# Route 53 Alias Records — Static Distribution
# ---------------------------------------------------------------------------

resource "aws_route53_record" "static" {
  for_each = toset(local.static_aliases)

  zone_id = var.zone_ids[local.alias_domain[each.value]]
  # Strip the domain suffix to get the subdomain label (or "@" for apex).
  name = each.value == local.alias_domain[each.value] ? "" : trimsuffix(each.value, ".${local.alias_domain[each.value]}")
  type = "A"

  alias {
    name                   = aws_cloudfront_distribution.static.domain_name
    zone_id                = aws_cloudfront_distribution.static.hosted_zone_id
    evaluate_target_health = false
  }
}

# ---------------------------------------------------------------------------
# Route 53 Alias Records — API Distribution
# ---------------------------------------------------------------------------

resource "aws_route53_record" "api" {
  for_each = toset(local.api_aliases)

  zone_id = var.zone_ids[local.alias_domain[each.value]]
  name    = trimsuffix(each.value, ".${local.alias_domain[each.value]}")
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.api.domain_name
    zone_id                = aws_cloudfront_distribution.api.hosted_zone_id
    evaluate_target_health = false
  }
}
