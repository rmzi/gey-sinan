locals {
  db_name = replace(var.name_prefix, "-", "_") # PostgreSQL identifiers cannot contain hyphens
}

# ---------------------------------------------------------------------------
# Subnet Group
# ---------------------------------------------------------------------------

resource "aws_db_subnet_group" "main" {
  name       = "${var.name_prefix}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.name_prefix}-db-subnet-group"
  }
}

# ---------------------------------------------------------------------------
# Security Group
# Ingress from ECS tasks is wired via a separate rule resource to avoid
# the circular dependency that arises when ECS and DB SGs reference each other
# inside their inline ingress/egress blocks.
# ---------------------------------------------------------------------------

resource "aws_security_group" "db" {
  name        = "${var.name_prefix}-db-sg"
  description = "RDS PostgreSQL - ingress from ECS tasks only"
  vpc_id      = var.vpc_id

  egress {
    description = "Allow all outbound (needed for patch downloads)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name_prefix}-db-sg"
  }
}

# Separate rule avoids circular dependency with the ECS security group.
resource "aws_security_group_rule" "db_from_ecs" {
  type                     = "ingress"
  description              = "PostgreSQL from ECS tasks"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.db.id
  source_security_group_id = var.ecs_security_group_id
}

# ---------------------------------------------------------------------------
# RDS Instance
# ---------------------------------------------------------------------------

resource "aws_db_instance" "main" {
  identifier = "${var.name_prefix}-postgres"

  engine         = "postgres"
  engine_version = "16"
  instance_class = var.db_instance_class

  db_name  = local.db_name
  username = var.db_username
  password = var.db_password

  allocated_storage     = 20
  storage_type          = "gp3"
  storage_encrypted     = true

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false

  backup_retention_period = var.db_backup_retention
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  # Skip final snapshot in dev to allow easy teardown;
  # in prod this is overridden by db_backup_retention being higher
  # and teams should take a manual snapshot before destroying.
  skip_final_snapshot = var.environment == "dev" ? true : false
  final_snapshot_identifier = var.environment == "dev" ? null : "${var.name_prefix}-final-snapshot"

  deletion_protection = var.environment == "prod" ? true : false

  tags = {
    Name = "${var.name_prefix}-postgres"
  }
}
