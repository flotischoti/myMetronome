# General variables
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "westeurope"
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "myMetronome-rg"
}

# App Service variables
variable "app_service_plan_name" {
  description = "Name of the App Service Plan"
  type        = string
  default     = "myMetronomePlan"
}

variable "app_service_name" {
  description = "Name of the App Service"
  type        = string
  default     = "my-metronome-webapp"
}

variable "app_service_sku" {
  description = "SKU for App Service Plan (F1, B1, B2, S1, etc.)"
  type        = string
  default     = "B1"
}

# Database variables
variable "db_server_name" {
  description = "Name of the PostgreSQL server"
  type        = string
  default     = "mymetronome-db"
}

variable "db_name" {
  description = "Name of the PostgreSQL database"
  type        = string
  default     = "mymetronome"
}

variable "db_location" {
  description = "Azure region for PostgreSQL (can be different from app)"
  type        = string
  default     = "belgiumcentral"
}

variable "db_sku_name" {
  description = "SKU for PostgreSQL server"
  type        = string
  default     = "B_Standard_B1ms"
}

variable "db_admin_username" {
  description = "Administrator username for PostgreSQL"
  type        = string
  default     = "dbadmin"
}

variable "db_admin_password" {
  description = "Administrator password for PostgreSQL"
  type        = string
  sensitive   = true
}

variable "token_key" {
  description = "Secret key for JWT tokens"
  type        = string
  sensitive   = true
}