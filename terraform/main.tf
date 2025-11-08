# Configure the Azure Provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
  required_version = ">= 1.0"
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

# Random suffix for globally unique names
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    environment = var.environment
    project     = "myMetronome"
    managed_by  = "terraform"
  }
}

# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = var.app_service_plan_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = var.app_service_sku

  tags = {
    environment = var.environment
    project     = "myMetronome"
  }
}

# App Service
resource "azurerm_linux_web_app" "main" {
  name                = var.app_service_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = var.app_service_sku == "B1" ? true : false
    
    application_stack {
      node_version = "20-lts"
    }
  }

  app_settings = {
    "WEBSITE_NODE_DEFAULT_VERSION"       = "~20"
    "NODE_ENV"                           = "production"
    "SCM_DO_BUILD_DURING_DEPLOYMENT"     = "false"
    "ENABLE_ORYX_BUILD"                  = "false"
    "WEBSITE_RUN_FROM_PACKAGE"           = "0"
    "POST_DEPLOYMENT_COMMAND"            = "cd /home/site/wwwroot && npx prisma migrate deploy"
    "TOKEN_KEY"                          = var.token_key
    "POSTGRES_PRISMA_URL"                = "postgresql://${var.db_admin_username}:${var.db_admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${azurerm_postgresql_flexible_server_database.main.name}?sslmode=require"
    "POSTGRES_URL_NON_POOLING"           = "postgresql://${var.db_admin_username}:${var.db_admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${azurerm_postgresql_flexible_server_database.main.name}?sslmode=require"
  }

  tags = {
    environment = var.environment
    project     = "myMetronome"
  }
}

# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "main" {
  name                = var.db_server_name
  location            = var.db_location
  resource_group_name = azurerm_resource_group.main.name

  administrator_login    = var.db_admin_username
  administrator_password = var.db_admin_password

  sku_name   = var.db_sku_name
  version    = "16"
  storage_mb = 32768

  backup_retention_days = 7
  geo_redundant_backup_enabled = false

  tags = {
    environment = var.environment
    project     = "myMetronome"
  }
}

# PostgreSQL Database
resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = var.db_name
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# Firewall rule to allow Azure services
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

