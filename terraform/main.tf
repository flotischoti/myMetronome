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

# Container Registry
resource "azurerm_container_registry" "main" {
  name                = "${var.container_registry_name}${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = var.container_registry_sku
  admin_enabled       = true

  tags = {
    environment = var.environment
    project     = "myMetronome"
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

# App Service (Container-based)
resource "azurerm_linux_web_app" "main" {
  name                = var.app_service_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = var.app_service_sku == "B1" ? true : false
    
    application_stack {
      docker_image_name        = "${var.container_image_name}:latest"
      docker_registry_url      = "https://${azurerm_container_registry.main.login_server}"
      docker_registry_username = azurerm_container_registry.main.admin_username
      docker_registry_password = azurerm_container_registry.main.admin_password
    }
  }

  app_settings = {
    # Container-specific settings
    "WEBSITES_PORT"                       = "3000"
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    
    # Application settings
    "NODE_ENV"                 = "production"
    "TOKEN_KEY"                = var.token_key
    "POSTGRES_PRISMA_URL"      = "postgresql://${var.db_admin_username}:${var.db_admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${azurerm_postgresql_flexible_server_database.main.name}?sslmode=require"
    "POSTGRES_URL_NON_POOLING" = "postgresql://${var.db_admin_username}:${var.db_admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${azurerm_postgresql_flexible_server_database.main.name}?sslmode=require"
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
  zone       = "1"

  backup_retention_days        = 7
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

# Firewall rule to allow GitHub Actions (and other public access)
# WARNING: This allows access from anywhere. For production, use Private Link or VNet integration.
resource "azurerm_postgresql_flexible_server_firewall_rule" "github_actions" {
  name             = "AllowPublicAccess"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "255.255.255.255"
}