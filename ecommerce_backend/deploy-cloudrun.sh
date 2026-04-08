#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  SmartCart — Google Cloud Run Full Auto Deploy
#  Project: ecommerce-492713
#  Run: bash deploy-cloudrun.sh
# ═══════════════════════════════════════════════════════════
set -e

PROJECT_ID="ecommerce-492713"
REGION="us-central1"
SERVICE_NAME="smartcart-backend"
IMAGE="gcr.io/$PROJECT_ID/$SERVICE_NAME"
DB_INSTANCE="smartcart-mysql"
DB_NAME="smartcart"
DB_USER="root"
DB_PASS="SmartCart@2024"
JWT_SECRET="SmartCartSecretKey2024SmartCartSecretKey2024SmartCartSecretKey2024"
ALLOWED_ORIGINS="https://ecommerce-iota-red-20.vercel.app"
RAZORPAY_KEY_ID="YOUR_RAZORPAY_KEY_ID"
RAZORPAY_KEY_SECRET="YOUR_RAZORPAY_KEY_SECRET"

echo "📋 Project: $PROJECT_ID"
gcloud config set project $PROJECT_ID

echo ""
echo "🔌 Enabling APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  sqladmin.googleapis.com \
  --quiet

echo ""
echo "🗄️  Creating Cloud SQL MySQL instance..."
# Check if instance already exists
if gcloud sql instances describe $DB_INSTANCE --quiet 2>/dev/null; then
  echo "   Instance already exists, skipping..."
else
  gcloud sql instances create $DB_INSTANCE \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=$REGION \
    --storage-type=SSD \
    --storage-size=10GB \
    --no-backup \
    --quiet
  echo "   ✅ Instance created"
fi

echo ""
echo "📦 Creating database..."
gcloud sql databases create $DB_NAME \
  --instance=$DB_INSTANCE \
  --quiet 2>/dev/null || echo "   Database already exists"

echo ""
echo "👤 Setting root password..."
gcloud sql users set-password $DB_USER \
  --instance=$DB_INSTANCE \
  --password=$DB_PASS \
  --quiet

# Get Cloud SQL public IP
DB_IP=$(gcloud sql instances describe $DB_INSTANCE \
  --format='value(ipAddresses[0].ipAddress)')
DB_URL="jdbc:mysql://$DB_IP:3306/$DB_NAME?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"

echo ""
echo "🐳 Building & pushing Docker image via Cloud Build..."
gcloud builds submit \
  --tag $IMAGE:latest \
  --project $PROJECT_ID \
  .

echo ""
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
echo "🌐 Getting service URL..."
URL=$(gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --format 'value(status.url)')

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅ DEPLOYMENT COMPLETE!"
echo ""
echo "  🌐 Backend URL : $URL"
echo "  🗄️  Database IP : $DB_IP"
echo ""
echo "  📋 Next steps:"
echo "  1. Test API  : curl $URL/api/products"
echo "  2. Vercel env: VITE_API_URL=$URL"
echo "  3. After test: change DDL_AUTO to 'update'"
echo "     gcloud run services update $SERVICE_NAME \\"
echo "       --region $REGION \\"
echo "       --update-env-vars DDL_AUTO=update"
echo "═══════════════════════════════════════════════════════"
