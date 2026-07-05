# ---------------------------------------------------------------------------
# Presign Lambda Package
# ---------------------------------------------------------------------------

data "archive_file" "presign" {
  type        = "zip"
  source_dir  = "${path.module}/src"
  output_path = "${path.module}/dist/presign.zip"
}

# ---------------------------------------------------------------------------
# IAM — Lambda Execution Role
# Basic CloudWatch logging plus scoped write access to uploads/* in the
# recordings bucket (the browser performs the actual PUT via presigned URL).
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "presign" {
  name               = "${var.name_prefix}-presign-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = {
    Name = "${var.name_prefix}-presign-role"
  }
}

resource "aws_iam_role_policy_attachment" "presign_basic_logging" {
  role       = aws_iam_role.presign.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "presign_s3" {
  statement {
    sid       = "PutUploadedRecordings"
    effect    = "Allow"
    actions   = ["s3:PutObject"]
    resources = ["${var.recordings_bucket_arn}/uploads/*"]
  }
}

resource "aws_iam_role_policy" "presign_s3" {
  name   = "${var.name_prefix}-presign-s3-policy"
  role   = aws_iam_role.presign.id
  policy = data.aws_iam_policy_document.presign_s3.json
}

# ---------------------------------------------------------------------------
# Lambda Function
# ---------------------------------------------------------------------------

resource "aws_lambda_function" "presign" {
  function_name = "${var.name_prefix}-presign"
  role          = aws_iam_role.presign.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"

  filename         = data.archive_file.presign.output_path
  source_code_hash = data.archive_file.presign.output_base64sha256

  timeout = 10

  environment {
    variables = {
      RECORDINGS_BUCKET = var.recordings_bucket_name
    }
  }

  tags = {
    Name = "${var.name_prefix}-presign"
  }
}

# ---------------------------------------------------------------------------
# Lambda Function URL
# Public GET endpoint issuing presigned PUT URLs; CORS allows the volunteer
# web app origins (dev + prod + local) to call it directly.
# ---------------------------------------------------------------------------

resource "aws_lambda_function_url" "presign" {
  function_name      = aws_lambda_function.presign.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = false
    allow_methods     = ["GET"]
    allow_origins = [
      "https://volunteer.geysinan.com",
      "https://volunteer-dev.geysinan.com",
      "https://geysinan.com",
      "https://dev.geysinan.com",
      "http://localhost:8081",
    ]
    allow_headers = ["content-type"]
    max_age       = 3600
  }
}
