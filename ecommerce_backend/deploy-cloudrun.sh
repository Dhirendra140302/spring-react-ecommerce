#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  SmartCart — Google Cloud Run Deployment Script
#  Run: bash deploy-cloudrun.sh
# ═══════════════════════════════════════════════════════════
set -e

# ── CONFIG — change these ──────────────────────────────────
PROJECT_ID=""          # your GCP project ID
REGION="us-central1"
SERVICE_NAME="smartcart-backend"
IMAGE="gcr.io/$PROJECT_ID/$SERVICE_NAME"
DB_INSTANCE=""         # Cloud SQL instance name (leave empty to use external DB)
DB_URL=""              # Full JDBC URL e.g. jdbc:mysql://...
DB_USER="root"
DB_PASS=""
JWT_SECRET="SmartCartSecretKey2024SmartCartSecretKey2024SmartCartSecretKey2024"
ALLOWED_ORIGINS="https://ecommerce-iota-red-20.vercel.app"
RAZORPAY_KEY_ID="YOUR_RAZORPAY_KEY_ID"
RAZORPAY_KEY_SECRET="YOUR_RAZORPAY_KEY_SECRET"
# ──────────────────────────────────────────────────────────

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Set PROJECT_ID in this script first"
  exit 1
fi

echo "🔧 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

echo "🔌 Enabling required APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  sqladmin.googleapis.com \
  --quiet

echo "🐳 Building Docker image..."
gcloud builds submit \
  --tag $IMAGE:latest \
  --project $PROJECT_ID \
  .

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE:latest \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars "\
DATABASE_URL=$DB_URL,\
DATABASE_USERNAME=$DB_USER,\
DATABASE_PASSWORD=$DB_PASS,\
JWT_SECRET=$JWT_SECRET,\
DDL_AUTO=create,\
ALLOWED_ORIGINS=$ALLOWED_ORIGINS,\
RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID,\
RAZORPAY_KEY_SECRET=$RAZORPAY_KEY_SECRET" \
  --quiet

echo ""
echo "✅ Deployed! Getting service URL..."
URL=$(gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --format 'value(status.url)')

echo ""
echo "═══════════════════════════════════════════════"
echo "  🌐 Backend URL: $URL"
echo "  📋 Next steps:"
echo "  1. Test: curl $URL/api/products"
echo "  2. Set VITE_API_URL=$URL in Vercel"
echo "  3. Change DDL_AUTO=update after first deploy"
echo "═══════════════════════════════════════════════"
