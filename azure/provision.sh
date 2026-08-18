#!/usr/bin/env bash
# ============================================================
# Aprovisiona en Azure todo lo necesario para el backend de
# Juan Palma - Alcaldía de Surco, siguiendo el plan de migración:
# Resource Group -> App Service Plan S1 Linux -> App Service Java 17
# (+ slot staging) -> Azure SQL Basic -> Application Insights ->
# App Registration con Federated Credential para GitHub Actions (OIDC).
#
# Requiere: Azure CLI instalado y con sesión iniciada (az login).
# Ejecutar: bash azure/provision.sh
#
# Este script NO lo ejecuté yo (no tengo acceso a tu cuenta de Azure).
# Revísalo y córrelo tú desde tu máquina o Cloud Shell.
# ============================================================
set -euo pipefail

# ---------- VARIABLES: EDITA ESTO ANTES DE CORRER ----------
RESOURCE_GROUP="rg-juanpalma"
LOCATION="brazilsouth"                     # region sugerida en el doc original
APP_NAME="juanpalma-backend"               # debe ser único a nivel global de Azure
PLAN_NAME="plan-juanpalma-s1"
SQL_SERVER_NAME="sql-juanpalma"            # debe ser único a nivel global
SQL_DB_NAME="juanpalma_db"
SQL_ADMIN_USER="juanpalmaadmin"
SQL_ADMIN_PASSWORD="CAMBIA-ESTA-CLAVE-Segura123!"   # cámbiala antes de correr
STORAGE_ACCOUNT_NAME="stjuanpalma$RANDOM"  # debe ser único, minúsculas, sin guiones
LOG_ANALYTICS_NAME="log-juanpalma"
APPINSIGHTS_NAME="ai-juanpalma"

GITHUB_ORG="tu-usuario-o-org"
GITHUB_REPO="Plataforma-web-RP"
APP_REGISTRATION_NAME="sp-github-actions-juanpalma"

FRONTEND_ORIGIN="https://${GITHUB_ORG}.github.io"   # el dominio de tu GitHub Pages
ADMIN_API_KEY_VALUE="genera-una-clave-larga-y-aleatoria-aqui"
# -------------------------------------------------------------

echo "== 1) Resource Group =="
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

echo "== 2) App Service Plan (Linux, S1) =="
az appservice plan create \
  --name "$PLAN_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --is-linux \
  --sku S1

echo "== 3) App Service (Java 17) =="
az webapp create \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --plan "$PLAN_NAME" \
  --runtime "JAVA:17-java17"

az webapp config set \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --always-on true

echo "== 3b) Deployment slot 'staging' =="
az webapp deployment slot create \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --slot staging

echo "== 4) Storage Account (para futura migración de uploads/ a Blob Storage) =="
az storage account create \
  --name "$STORAGE_ACCOUNT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku Standard_LRS

echo "== 5) Azure SQL Server + Database (Basic) =="
az sql server create \
  --name "$SQL_SERVER_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --admin-user "$SQL_ADMIN_USER" \
  --admin-password "$SQL_ADMIN_PASSWORD"

az sql server firewall-rule create \
  --resource-group "$RESOURCE_GROUP" \
  --server "$SQL_SERVER_NAME" \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

az sql db create \
  --resource-group "$RESOURCE_GROUP" \
  --server "$SQL_SERVER_NAME" \
  --name "$SQL_DB_NAME" \
  --edition Basic \
  --capacity 5 \
  --max-size 2GB

echo "== 6) Application Insights + Log Analytics =="
az monitor log-analytics workspace create \
  --resource-group "$RESOURCE_GROUP" \
  --workspace-name "$LOG_ANALYTICS_NAME" \
  --location "$LOCATION"

WORKSPACE_ID=$(az monitor log-analytics workspace show \
  --resource-group "$RESOURCE_GROUP" \
  --workspace-name "$LOG_ANALYTICS_NAME" \
  --query id -o tsv)

az monitor app-insights component create \
  --app "$APPINSIGHTS_NAME" \
  --location "$LOCATION" \
  --resource-group "$RESOURCE_GROUP" \
  --workspace "$WORKSPACE_ID"

APPINSIGHTS_CONNECTION_STRING=$(az monitor app-insights component show \
  --app "$APPINSIGHTS_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query connectionString -o tsv)

echo "== 7) Variables de entorno (App Settings) en produccion y staging =="
DB_URL="jdbc:sqlserver://${SQL_SERVER_NAME}.database.windows.net:1433;database=${SQL_DB_NAME};encrypt=true;trustServerCertificate=false;loginTimeout=30"

for SLOT_FLAG in "" "--slot staging"; do
  az webapp config appsettings set \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    $SLOT_FLAG \
    --settings \
      SPRING_PROFILES_ACTIVE=sqlserver \
      DB_URL="$DB_URL" \
      DB_USERNAME="$SQL_ADMIN_USER" \
      DB_PASSWORD="$SQL_ADMIN_PASSWORD" \
      CORS_ALLOWED_ORIGINS="$FRONTEND_ORIGIN" \
      ADMIN_API_KEY="$ADMIN_API_KEY_VALUE" \
      APPLICATIONINSIGHTS_CONNECTION_STRING="$APPINSIGHTS_CONNECTION_STRING" \
      WEBSITES_PORT=8080
done

echo "== 8) App Registration + Federated Credential (OIDC para GitHub Actions) =="
APP_ID=$(az ad app create --display-name "$APP_REGISTRATION_NAME" --query appId -o tsv)
az ad sp create --id "$APP_ID"

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
TENANT_ID=$(az account show --query tenantId -o tsv)

# Credencial para pushes a la rama main
az ad app federated-credential create --id "$APP_ID" --parameters '{
  "name": "github-main-branch",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:'"$GITHUB_ORG"'/'"$GITHUB_REPO"':ref:refs/heads/main",
  "audiences": ["api://AzureADTokenExchange"]
}'

# Credenciales para los GitHub Environments "staging" y "production"
# (los usa el workflow .github/workflows/backend-deploy.yml)
az ad app federated-credential create --id "$APP_ID" --parameters '{
  "name": "github-env-staging",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:'"$GITHUB_ORG"'/'"$GITHUB_REPO"':environment:staging",
  "audiences": ["api://AzureADTokenExchange"]
}'

az ad app federated-credential create --id "$APP_ID" --parameters '{
  "name": "github-env-production",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:'"$GITHUB_ORG"'/'"$GITHUB_REPO"':environment:production",
  "audiences": ["api://AzureADTokenExchange"]
}'

echo "== 9) Rol RBAC (Contributor) sobre el Resource Group =="
az role assignment create \
  --assignee "$APP_ID" \
  --role "Contributor" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP"

echo ""
echo "======================================================================"
echo " LISTO. Configura esto en GitHub -> Settings -> Secrets and variables:"
echo "======================================================================"
echo ""
echo "Secrets (Actions > Secrets):"
echo "  AZURE_CLIENT_ID       = $APP_ID"
echo "  AZURE_TENANT_ID       = $TENANT_ID"
echo "  AZURE_SUBSCRIPTION_ID = $SUBSCRIPTION_ID"
echo ""
echo "Variables (Actions > Variables):"
echo "  AZURE_APP_SERVICE_NAME = $APP_NAME"
echo "  AZURE_RESOURCE_GROUP   = $RESOURCE_GROUP"
echo ""
echo "URL backend produccion: https://${APP_NAME}.azurewebsites.net"
echo "URL backend staging:    https://${APP_NAME}-staging.azurewebsites.net"
echo ""
echo "No olvides crear los 'Environments' staging y production en"
echo "GitHub -> Settings -> Environments (el workflow los usa)."
echo "======================================================================"
