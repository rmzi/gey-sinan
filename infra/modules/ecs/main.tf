# ---------------------------------------------------------------------------
# ECR Repository
# ---------------------------------------------------------------------------

resource "aws_ecr_repository" "backend" {
  name                 = "geysinan-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "geysinan-backend"
  }
}

# ---------------------------------------------------------------------------
# ECS Cluster
# ---------------------------------------------------------------------------

resource "aws_ecs_cluster" "main" {
  name = "${var.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.name_prefix}-cluster"
  }
}

# ---------------------------------------------------------------------------
# CloudWatch Log Group
# ---------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.name_prefix}"
  retention_in_days = 30

  tags = {
    Name = "/ecs/${var.name_prefix}"
  }
}

# ---------------------------------------------------------------------------
# Security Groups
# Defined before the rules to break the circular dependency between ALB SG
# and ECS SG. Ingress rules are added via separate aws_security_group_rule
# resources so each SG can reference the other by ID without a cycle.
# ---------------------------------------------------------------------------

resource "aws_security_group" "alb" {
  name        = "${var.name_prefix}-alb-sg"
  description = "ALB - allows inbound HTTP and HTTPS from the internet"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.name_prefix}-alb-sg"
  }
}

resource "aws_security_group" "ecs" {
  name        = "${var.name_prefix}-ecs-sg"
  description = "ECS tasks - allows inbound from ALB only"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.name_prefix}-ecs-sg"
  }
}

# ALB ingress rules
resource "aws_security_group_rule" "alb_http_in" {
  type              = "ingress"
  description       = "HTTP from anywhere (redirected to HTTPS)"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.alb.id
}

resource "aws_security_group_rule" "alb_https_in" {
  type              = "ingress"
  description       = "HTTPS from anywhere"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.alb.id
}

resource "aws_security_group_rule" "alb_all_out" {
  type              = "egress"
  description       = "Allow all outbound"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.alb.id
}

# ECS ingress — only from the ALB SG (not from the open internet)
resource "aws_security_group_rule" "ecs_from_alb" {
  type                     = "ingress"
  description              = "App traffic from ALB"
  from_port                = 8000
  to_port                  = 8000
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.ecs.id
}

resource "aws_security_group_rule" "ecs_all_out" {
  type              = "egress"
  description       = "Allow all outbound (ECR pulls, RDS, S3, etc.)"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.ecs.id
}

# ---------------------------------------------------------------------------
# IAM — ECS Execution Role
# Allows ECS to pull images from ECR and write logs to CloudWatch.
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "ecs_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "execution" {
  name               = "${var.name_prefix}-ecs-execution-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json

  tags = {
    Name = "${var.name_prefix}-ecs-execution-role"
  }
}

resource "aws_iam_role_policy_attachment" "execution_basic" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ---------------------------------------------------------------------------
# IAM — ECS Task Role
# Grants the running container access to S3 buckets it needs.
# ---------------------------------------------------------------------------

resource "aws_iam_role" "task" {
  name               = "${var.name_prefix}-ecs-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json

  tags = {
    Name = "${var.name_prefix}-ecs-task-role"
  }
}

data "aws_iam_policy_document" "task_s3" {
  statement {
    sid    = "MediaAndRecordingsAccess"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
    ]
    resources = [
      var.media_bucket_arn,
      "${var.media_bucket_arn}/*",
      var.recordings_bucket_arn,
      "${var.recordings_bucket_arn}/*",
    ]
  }
}

resource "aws_iam_role_policy" "task_s3" {
  name   = "${var.name_prefix}-task-s3-policy"
  role   = aws_iam_role.task.id
  policy = data.aws_iam_policy_document.task_s3.json
}

# ---------------------------------------------------------------------------
# Task Definition
# ---------------------------------------------------------------------------

locals {
  # Fall back to a placeholder image so the task definition can be created
  # before the first real image is pushed to ECR.
  effective_image = var.container_image != "" ? var.container_image : "${aws_ecr_repository.backend.repository_url}:latest"
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.name_prefix}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.ecs_cpu
  memory                   = var.ecs_memory
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = local.effective_image
      essential = true

      portMappings = [
        {
          containerPort = 8000
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "backend"
        }
      }
    }
  ])

  tags = {
    Name = "${var.name_prefix}-backend-task"
  }
}

# ---------------------------------------------------------------------------
# Application Load Balancer
# ---------------------------------------------------------------------------

resource "aws_lb" "main" {
  name               = "${var.name_prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnet_ids

  tags = {
    Name = "${var.name_prefix}-alb"
  }
}

resource "aws_lb_target_group" "backend" {
  name        = "${var.name_prefix}-backend-tg"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip" # Required for Fargate awsvpc mode

  health_check {
    path                = "/api/v1/health/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
  }

  tags = {
    Name = "${var.name_prefix}-backend-tg"
  }
}

# HTTPS listener — primary entry point.
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# HTTP listener — redirect all traffic to HTTPS.
resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# ---------------------------------------------------------------------------
# ECS Service
# ---------------------------------------------------------------------------

resource "aws_ecs_service" "backend" {
  name            = "${var.name_prefix}-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.ecs_desired_count
  launch_type     = "FARGATE"

  # Allow Terraform to update the image without forcing a service replacement.
  force_new_deployment = true

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8000
  }

  depends_on = [
    aws_lb_listener.https,
    aws_iam_role_policy_attachment.execution_basic,
  ]

  tags = {
    Name = "${var.name_prefix}-backend-service"
  }
}
