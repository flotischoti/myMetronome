# Azure Container Apps Deployment with Terraform and GitHub Actions (AI Generated)

This project can be deployed to **Azure Container Apps** with fully private database connectivity.

## 🏗️ Architecture

```
GitHub Actions (CI/CD)
    ↓
Azure Container Registry (ACR)
    ↓
Azure Container Apps
    ↓ (Private VNet)
PostgreSQL Flexible Server (Private Endpoint)
```

## 📋 Prerequisites

- **Azure Account** with active subscription
- **Azure CLI** installed
- **Terraform** installed
- **GitHub Account** with repository

---

## 🚀 Deployment Steps

### 1. Azure CLI Login

```bash
az login
az account show
```

Note your **Subscription ID**!

---

### 2. Create Service Principal for GitHub Actions

Create a Service Principal with Contributor role:

```bash
az ad sp create-for-rbac \
  --name "myMetronome-github-actions" \
  --role contributor \
  --scopes /subscriptions/{SUBSCRIPTION_ID} \
  --json-auth
```

**Replace `{SUBSCRIPTION_ID}` with your Subscription ID!**

The output looks like this (IMPORTANT - copy it!):

```json
{
  "clientId": "xxx",
  "clientSecret": "xxx",
  "subscriptionId": "xxx",
  "tenantId": "xxx",
  ...
}
```

---

### 3. Register Azure Resource Providers

Register the required resource providers:

```bash
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.OperationalInsights

# Wait until registered (may take 1-2 minutes)
az provider show --namespace Microsoft.App --query "registrationState" --output tsv
```

Should output `Registered`.

---

### 4. Configure Terraform Variables

Create `terraform/terraform.tfvars` with **sensitive data only**:

```hcl
# Database password (CHANGE THIS!)
db_admin_password = "YourSecurePassword123!"

# JWT token key for application (CHANGE THIS!)
token_key = "your-super-secret-jwt-token-key-min-32-chars"
```

**⚠️ IMPORTANT:**

- Change both values to secure passwords/keys!
- This file is in `.gitignore` and **should never be committed**!

**All other configuration** (resource names, SKUs, etc.) is defined in `terraform/variables.tf` with sensible defaults.

If you want to override defaults, you can add them to `terraform.tfvars`:

```hcl
# Optional: Override defaults
resource_group_name = "myMetronome-rg"
location            = "westeurope"
db_location         = "germanywestcentral"
```

**Check `terraform/variables.tf` to see all available variables and their defaults.**

### 5. Initialize and Deploy with Terraform

```bash
cd terraform

# Initialize
terraform init

# Review plan
terraform plan

# Deploy
terraform apply
```

Type `yes` when prompted.

**After deployment, note:**

- ACR Login Server (e.g., `mymetronomeacrbrhvzl1v.azurecr.io`)
- ACR Name (e.g., `mymetronomeacrbrhvzl1v`)

---

### 6. Retrieve ACR Credentials

```bash
# ACR Login Server
az acr show --name {ACR_NAME} --query loginServer --output tsv

# ACR Username
az acr credential show --name {ACR_NAME} --query username --output tsv

# ACR Password
az acr credential show --name {ACR_NAME} --query "passwords[0].value" --output tsv
```

**Replace `{ACR_NAME}` with your ACR name (e.g., `mymetronomeacrbrhvzl1v`)!**

---

### 7. Configure GitHub Secrets

Go to **GitHub Repository → Settings → Secrets and variables → Actions → New repository secret**

Create the following secrets:

| Secret Name         | Value            | Description                               |
| ------------------- | ---------------- | ----------------------------------------- |
| `AZURE_CREDENTIALS` | JSON from Step 2 | Service Principal credentials             |
| `ACR_LOGIN_SERVER`  | From Step 6      | e.g., `mymetronomeacrbrhvzl1v.azurecr.io` |
| `ACR_USERNAME`      | From Step 6      | ACR username                              |
| `ACR_PASSWORD`      | From Step 6      | ACR password                              |

**Example for `AZURE_CREDENTIALS`:**

```json
{
  "clientId": "12345678-1234-1234-1234-123456789abc",
  "clientSecret": "abcdefg~xyz123",
  "subscriptionId": "87654321-4321-4321-4321-cba987654321",
  "tenantId": "11111111-2222-3333-4444-555555555555"
}
```

---

### 8. Activate GitHub Actions

** Pipeline deactivated by default **
in `.github/workflows` change branch to `dev`

Push code to the `dev` branch:

```bash
git push origin dev
```

The pipeline will automatically:

1. ✅ Run tests
2. ✅ Build Docker image
3. ✅ Push image to ACR
4. ✅ Run database migrations
5. ✅ Deploy to Container Apps

**Duration:** ~5-7 minutes

---

### 9. Get Container App URL

```bash
az containerapp show \
  --name my-metronome-webapp \
  --resource-group myMetronome-rg \
  --query properties.configuration.ingress.fqdn \
  --output tsv
```

Output example: `my-metronome-webapp.wittybay-5cb5a231.westeurope.azurecontainerapps.io`

Open in browser: `https://{FQDN}`

---

## 🔧 Useful Commands

### View Logs

```bash
# Application Logs (Live)
az containerapp logs show \
  --name my-metronome-webapp \
  --resource-group myMetronome-rg \
  --follow

# Migration Job Logs
az containerapp job execution list \
  --name migration-job \
  --resource-group myMetronome-rg \
  --output table
```

### Run Migration Manually

```bash
az containerapp job start \
  --name migration-job \
  --resource-group myMetronome-rg
```

### Restart Container App

```bash
az containerapp revision list \
  --name my-metronome-webapp \
  --resource-group myMetronome-rg \
  --output table

az containerapp revision restart \
  --name my-metronome-webapp \
  --resource-group myMetronome-rg \
  --revision {REVISION_NAME}
```

### Rollback to Previous Image

```bash
# Show available tags
az acr repository show-tags \
  --name {ACR_NAME} \
  --repository mymetronome \
  --output table

# Rollback to specific tag
az containerapp update \
  --name my-metronome-webapp \
  --resource-group myMetronome-rg \
  --image {ACR_LOGIN_SERVER}/mymetronome:{TAG}
```

---

## 🧹 Cleanup / Delete Everything

```bash
cd terraform
terraform destroy
```

Confirm with `yes`.

**IMPORTANT:** This deletes:

- ✅ Container Apps
- ✅ Container Registry (including all images)
- ✅ PostgreSQL Database (including all data!)
- ✅ VNet and all network resources
- ✅ Log Analytics

**⚠️ Create backups if needed!**

---

## 💰 Estimated Costs (Test Usage)

| Resource                          | Cost/Month  |
| --------------------------------- | ----------- |
| Container Apps (0.25 vCPU, 0.5GB) | ~€5-10      |
| Container Registry (Basic)        | ~€4         |
| PostgreSQL (B1ms)                 | ~€10        |
| VNet                              | Free        |
| Private Endpoint                  | ~€6         |
| Log Analytics (7 days)            | ~€1         |
| **Total**                         | **~€26-31** |

With **inactive usage** (Auto-Scale to 0): **~€21/month**

---

## 🔐 Security

- ✅ PostgreSQL has **no public access** (Private Endpoint)
- ✅ All credentials in GitHub Secrets (not in code)
- ✅ Container runs as **non-root user**
- ✅ HTTPS only (automatic from Container Apps)
- ✅ VNet isolation

---

## 🐛 Troubleshooting

### Problem: "Resource provider not registered"

```bash
az provider register --namespace Microsoft.App
az provider show --namespace Microsoft.App --query "registrationState"
```

Wait until `Registered`.

### Problem: "x-forwarded-host header mismatch"

The middleware corrects this automatically. If not:

- Check `middleware.ts` - header correction should be active
- Check logs: `az containerapp logs show ...`

### Problem: Migration Job fails

```bash
# View job execution logs
az containerapp job execution list \
  --name migration-job \
  --resource-group myMetronome-rg

az containerapp job logs show \
  --name migration-job \
  --resource-group myMetronome-rg
```

### Problem: Container won't start

```bash
# Check system logs
az containerapp logs show \
  --name my-metronome-webapp \
  --resource-group myMetronome-rg \
  --type system
```

---

## 📚 Additional Resources

- [Azure Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [GitHub Actions Documentation](https://docs.github.com/actions)

---

## ✅ Checklist

- [ ] Azure CLI installed and logged in
- [ ] Service Principal created
- [ ] Resource providers registered
- [ ] `terraform.tfvars` configured
- [ ] Terraform deployed
- [ ] GitHub Secrets configured
- [ ] Pipeline successfully completed
- [ ] App accessible via FQDN

---

**For questions or issues:** Check the logs using the commands above! 🔍
