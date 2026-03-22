# ---------------------------------------------------------------------------
# CloudFront Origin Access Identity
# Used by static and media buckets to restrict direct S3 access.
# ---------------------------------------------------------------------------

resource "aws_cloudfront_origin_access_identity" "main" {
  comment = "${var.name_prefix} OAI for S3 origins"
}

# ---------------------------------------------------------------------------
# Static Assets Bucket
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "static" {
  bucket = "${var.name_prefix}-static"

  tags = {
    Name    = "${var.name_prefix}-static"
    Purpose = "static-assets"
  }
}

resource "aws_s3_bucket_public_access_block" "static" {
  bucket = aws_s3_bucket.static.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "static_oai" {
  bucket = aws_s3_bucket.static.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "CloudFrontOAIRead"
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.main.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.static.arn}/*"
      }
    ]
  })
}

# ---------------------------------------------------------------------------
# Media Bucket (user-uploaded images etc.)
# Versioning enabled; accessible via CloudFront OAI + CORS for frontend.
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "media" {
  bucket = "${var.name_prefix}-media"

  tags = {
    Name    = "${var.name_prefix}-media"
    Purpose = "user-media"
  }
}

resource "aws_s3_bucket_public_access_block" "media" {
  bucket = aws_s3_bucket.media.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "media" {
  bucket = aws_s3_bucket.media.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_policy" "media_oai" {
  bucket = aws_s3_bucket.media.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "CloudFrontOAIRead"
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.main.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.media.arn}/*"
      }
    ]
  })
}

resource "aws_s3_bucket_cors_configuration" "media" {
  bucket = aws_s3_bucket.media.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["https://*.${var.domain_name}"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# ---------------------------------------------------------------------------
# Recordings Bucket (volunteer audio contributions)
# No public access; no OAI needed — ECS tasks write directly via IAM role.
# Versioning keeps every upload revision.
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "recordings" {
  bucket = "${var.name_prefix}-recordings"

  tags = {
    Name    = "${var.name_prefix}-recordings"
    Purpose = "audio-recordings"
  }
}

resource "aws_s3_bucket_public_access_block" "recordings" {
  bucket = aws_s3_bucket.recordings.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "recordings" {
  bucket = aws_s3_bucket.recordings.id

  versioning_configuration {
    status = "Enabled"
  }
}

# ---------------------------------------------------------------------------
# ML Corpus Bucket (training data, model artifacts)
# Fully private — accessed only by backend / ML pipelines via IAM.
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "ml_corpus" {
  bucket = "${var.name_prefix}-ml-corpus"

  tags = {
    Name    = "${var.name_prefix}-ml-corpus"
    Purpose = "ml-corpus"
  }
}

resource "aws_s3_bucket_public_access_block" "ml_corpus" {
  bucket = aws_s3_bucket.ml_corpus.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
