# ═══════════════════════════════════════════════════════════
#  SmartCart — Google Cloud Run Deploy (Windows PowerShell)
#  Run: .\deploy-cloudrun.ps1
# ═══════════════════════════════════════════════════════════
$ErrorActionPreference = "Stop"

$PROJECT_ID    = "ecommerce-492713"
$REGION        = "us-central1"
$SERVICE_NAME  = "smartcart-backend"
$IMAGE         = "gcr.io/$PROJECT_ID/$SERVICE_NAME"
$DB_INSTANCE   = "smartcart-mysql"
$DB_NAME       = "smartcart"
$DB_USER       = "root"
$DB_PASS       = "SmartCart@2024"
$JWT_SECRET    = "SmartCartSecretKey2024SmartCartSecretKey2024SmartCartSecretKey2024"
$ALLOWED_ORIGINS = "https://ecommerce-iota-red-20.vercel.app"
$RAZORPAY_KEY_ID     = "YOUR_RAZORPAY_KEY_ID"
$RAZORPAY_KEY_SECRET = "YOUR_RAZORPAY_KEY_SECRET"

$gcloud = "C:\Users\$env:USERNAME\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"

Write-Host "`n📋 Setting project: $PROJECT_ID" -ForegroundColor Cyan
& $gcloud config set project $PROJECT_ID

Write-Host "`n🔌 Enabling APIs..." -ForegroundColor Cyan
& $gcloud services enable `
    run.googleapis.com `
    cloudbuild.googleapis.com `
    containerregistry.googleapis.com `
    sqladmin.googleapis.com `
    --quiet

Write-Host "`n🗄️  Creating Cloud SQL MySQL instance (takes ~5 min)..." -ForegroundColor Cyan
$instanceExists = & $gcloud sql instances list --filter="name=$DB_INSTANCE" --format="value(name)" 2>$null
if (-not $instanceExists) {
    & $gcloud sql instances create $DB_INSTANCE `
        --database-version=MYSQL_8_0 `
        --tier=db-f1-micro `
        --region=$REGION `
        --storage-type=SSD `
        --storage-size=10GB `
        --no-backup `
        --quiet
    Write-Host "   ✅ Instance created" -ForegroundColor Green
} else {
    Write-Host "   Instance already exists, skipping..." -ForegroundColor Yellow
}

Write-Host "`n📦 Creating database..." -ForegroundColor Cyan
& $gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE --quiet 2>$null
Write-Host "   ✅ Done" -ForegroundColor Green

Write-Host "`n👤 Setting root password..." -ForegroundColor Cyan
& $gcloud sql users set-password $DB_USER `
    --instance=$DB_INSTANCE `
    --password=$DB_PASS `
    --quiet

$DB_IP = & $gcloud sql instances describe $DB_INSTANCE --format="value(ipAddresses[0].ipAddress)"
$DB_URL = "jdbc:mysql://${DB_IP}:3306/${DB_NAME}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
Write-Host "   DB IP: $DB_IP" -ForegroundColor Green

Write-Host "`n🐳 Building Docker image via Cloud Build..." -ForegroundColor Cyan
& $gcloud builds submit --tag "${IMAGE}:latest" --project $PROJECT_ID .

Write-Host "`n🚀 Deploying to Cloud Run..." -ForegroundColor Cyan
& $gcloud run deploy $SERVICE_NAME `
    --image "${IMAGE}:latest" `
    --region $REGION `
    --platform managed `
    --allow-unauthenticated `
    --port 8080 `
    --memory 512Mi `
    --cpu 1 `
    --min-instances 0 `
    --max-instances 3 `
    --set-env-vars "DATABASE_URL=$DB_URL,DATABASE_USERNAME=$DB_USER,DATABASE_PASSWORD=$DB_PASS,JWT_SECRET=$JWT_SECRET,DDL_AUTO=create,ALLOWED_ORIGINS=$ALLOWED_ORIGINS,RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID,RAZORPAY_KEY_SECRET=$RAZORPAY_KEY_SECRET" `
    --quiet

$URL = & $gcloud run services describe $SERVICE_NAME --region $REGION --format "value(status.url)"

Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "  🌐 Backend URL : $URL" -ForegroundColor White
Write-Host "  🗄️  Database IP : $DB_IP" -ForegroundColor White
Write-Host ""
Write-Host "  📋 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test: Invoke-RestMethod $URL/api/products"
Write-Host "  2. Set in Vercel: VITE_API_URL=$URL"
Write-Host "  3. Change DDL_AUTO to 'update' after first deploy:"
Write-Host "     & `$gcloud run services update $SERVICE_NAME --region $REGION --update-env-vars DDL_AUTO=update"
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
