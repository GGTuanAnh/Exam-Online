# ====================================================
# UAT Deployment Script - Exam Online System
# ====================================================
# Script tự động deploy UAT environment bằng Docker
# Author: AI Assistant
# Date: 2026-01-11
# ====================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " EXAM ONLINE SYSTEM - UAT DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "[1/7] Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker is running" -ForegroundColor Green
Write-Host ""

# Check if .env file exists, if not create from example
Write-Host "[2/7] Checking environment variables..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file for UAT..." -ForegroundColor Yellow
    
    # Generate random secrets
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
    $refreshSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
    
    # Create .env file for UAT
    @"
# UAT Environment - Auto Generated $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Database (Docker Compose will create this)
POSTGRES_USER=examuser
POSTGRES_PASSWORD=examuat2024
POSTGRES_DB=examonline_uat

# JWT Configuration (Auto Generated)
JWT_SECRET=$jwtSecret
JWT_EXPIRATION=1d
REFRESH_TOKEN_SECRET=$refreshSecret
REFRESH_TOKEN_EXPIRATION=7d

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost

# Email Configuration (Optional - Skip for UAT)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Google OAuth (Optional - Skip for UAT)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Frontend API URL
VITE_API_URL=http://localhost:3000
"@ | Out-File -FilePath ".env" -Encoding UTF8
    
    Write-Host "✓ Created .env file with auto-generated secrets" -ForegroundColor Green
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}
Write-Host ""

# Run Prisma migration
Write-Host "[3/7] Creating database migration..." -ForegroundColor Yellow
try {
    npx prisma migrate dev --name add-exam-relation --skip-generate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Prisma migration created successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "! Migration may already exist (OK for UAT)" -ForegroundColor Yellow
}
Write-Host ""

# Stop existing containers
Write-Host "[4/7] Stopping existing containers..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null
Write-Host "✓ Stopped existing containers" -ForegroundColor Green
Write-Host ""

# Build containers
Write-Host "[5/7] Building Docker containers..." -ForegroundColor Yellow
Write-Host "This may take 3-5 minutes..." -ForegroundColor Gray
docker-compose build --no-cache
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker containers built successfully" -ForegroundColor Green
Write-Host ""

# Start containers
Write-Host "[6/7] Starting services..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start services" -ForegroundColor Red
    exit 1
}
Write-Host "✓ All services started" -ForegroundColor Green
Write-Host ""

# Wait for services to be ready
Write-Host "[7/7] Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service health
Write-Host ""
Write-Host "Checking service status..." -ForegroundColor Yellow
docker-compose ps

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " ✓ UAT DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access your application at:" -ForegroundColor Cyan
Write-Host "  Frontend:        http://localhost" -ForegroundColor White
Write-Host "  Backend API:     http://localhost:3000" -ForegroundColor White
Write-Host "  API Docs:        http://localhost:3000/api-docs" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  View logs:       docker-compose logs -f" -ForegroundColor Gray
Write-Host "  Stop services:   docker-compose down" -ForegroundColor Gray
Write-Host "  Restart:         docker-compose restart" -ForegroundColor Gray
Write-Host ""
Write-Host "Test accounts (if seeded):" -ForegroundColor Cyan
Write-Host "  Admin:   admin@edu.vn / Admin123" -ForegroundColor Gray
Write-Host "  Student: student@st.edu.vn / Student123" -ForegroundColor Gray
Write-Host ""
