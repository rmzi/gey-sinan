output "endpoint" {
  description = "RDS instance endpoint (host:port)"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "port" {
  description = "Port the database listens on"
  value       = aws_db_instance.main.port
}

output "db_name" {
  description = "Name of the application database"
  value       = aws_db_instance.main.db_name
}

output "security_group_id" {
  description = "ID of the database security group"
  value       = aws_security_group.db.id
}
