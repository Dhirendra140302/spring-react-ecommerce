#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  SmartCart — Cloud SQL MySQL Setup Script
#  Run ONCE before deploying: bash setup-cloudsql.sh
# ═══════════════════════════════════════════════════════════
set -e

PROJECT_ID=""          # your GCP project ID
REGION="us-central1"
INSTANCE_NAME="smartcart-mysql"
DB_NAME="smartcart"
DB_USER="smartcart"
DB_PASS="SmartCart@2024"   # change this

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Set PROJECT_ID first"
  exit 1
fi

gcloud config set project $PROJECT_ID

echo "🗄️  Creating Cloud SQL MySQL instance (takes ~5 min)..."
gcloud sql instances create $INSTANCE_NAME \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=$REGION \
  --storage-type=SSD \
  --storage-size=10GB \
  --no-backup \
  --quiet

echo "📦 Creating database..."
gcloud sql databases create $DB_NAME \
  --instance=$INSTANCE_NAME

echo "👤 Creating user..."
gcloud sql users create $DB_USER \
  --instance=$INSTANCE_NAME \
  --password=$DB_PASS

# Get connection info
IP=$(gcloud sql instances describe $INSTANCE_NAME \
  --format='value(ipAddresses[0].ipAddress)')

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✅ Cloud SQL ready!"
echo "  Host: $IP"
echo "  DATABASE_URL: jdbc:mysql://$IP:3306/$DB_NAME?useSSL=false&serverTimezone=UTC"
echo "  DATABASE_USERNAME: $DB_USER"
echo "  DATABASE_PASSWORD: $DB_PASS"
echo "  Copy these into deploy-cloudrun.sh"
echo "═══════════════════════════════════════════════"
