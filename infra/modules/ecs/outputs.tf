output "alb_dns_name" {
  description = "DNS name of the application load balancer"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Hosted zone ID of the ALB (for Route 53 alias records)"
  value       = aws_lb.main.zone_id
}

output "ecr_url" {
  description = "ECR repository URL for the backend image"
  value       = aws_ecr_repository.backend.repository_url
}

output "cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.backend.name
}

output "ecs_sg_id" {
  description = "Security group ID of the ECS tasks"
  value       = aws_security_group.ecs.id
}
