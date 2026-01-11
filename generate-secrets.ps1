# ====================================================
# Generate Secrets for UAT Deployment
# ====================================================
# Script tạo JWT secrets ngẫu nhiên an toàn
# ====================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " GENERATE SECRETS FOR UAT DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to generate random string
function Get-RandomString {
    param(
        [int]$Length = 32
    )
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    $random = 1..$Length | ForEach-Object { Get-Random -Maximum $chars.Length }
    $private:ofs = ""
    return [String]$chars[$random]
}

# Generate secrets
$jwtSecret = Get-RandomString -Length 32
$refreshSecret = Get-RandomString -Length 32

Write-Host "[OK] Generated secure random secrets" -ForegroundColor Green
Write-Host ""
Write-Host "Copy these values to Render.com Environment Variables:" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================================" -ForegroundColor Gray
Write-Host ""
Write-Host "JWT_SECRET" -ForegroundColor Cyan
Write-Host $jwtSecret -ForegroundColor White
Write-Host ""
Write-Host "REFRESH_TOKEN_SECRET" -ForegroundColor Cyan
Write-Host $refreshSecret -ForegroundColor White
Write-Host ""
Write-Host "========================================================" -ForegroundColor Gray
Write-Host ""
Write-Host "These secrets have been generated securely." -ForegroundColor Green
Write-Host "[!] IMPORTANT: Save these somewhere safe!" -ForegroundColor Yellow
Write-Host "[!] Never commit these to Git!" -ForegroundColor Yellow
Write-Host ""

# Option to save to file
$save = Read-Host "Do you want to save to .env.render file? (y/n)"
if ($save -eq "y" -or $save -eq "Y") {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $content = @"
# UAT Environment Variables for Render.com
# Generated: $timestamp
# ⚠️ DO NOT COMMIT THIS FILE TO GIT!

# ============================================
# BƯỚC 1: DATABASE (từ Render PostgreSQL)
# ============================================
DATABASE_URL=postgresql://user:password@host.render.com/dbname
# ⬆️ Lấy "Internal Database URL" từ Render PostgreSQL service

# ============================================
# BƯỚC 2: JWT SECRETS (tự động tạo)
# ============================================
JWT_SECRET=$jwtSecret
REFRESH_TOKEN_SECRET=$refreshSecret
JWT_EXPIRATION=1d
REFRESH_TOKEN_EXPIRATION=7d

# ============================================
# BƯỚC 3: SERVER CONFIG
# ============================================
NODE_ENV=production
PORT=3000

# ============================================
# BƯỚC 4: FRONTEND URL (sau khi deploy frontend)
# ============================================
FRONTEND_URL=https://your-frontend.onrender.com
# ⬆️ Update sau khi frontend đã deploy

# ============================================
# BƯỚC 5: EMAIL (optional cho UAT - có thể skip)
# ============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
# ⬆️ Để test forgot password. Bỏ qua cũng được.

# ============================================
# BƯỚC 6: GOOGLE OAUTH (optional - có thể skip)
# ============================================
GOOGLE_CLIENT_ID=skip-for-uat
GOOGLE_CLIENT_SECRET=skip-for-uat
GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/auth/google/callback
# ⬆️ Để test Google login. Bỏ qua cũng được.

# ============================================
# FRONTEND ENV (cho Static Site)
# ============================================
VITE_API_URL=https://your-backend.onrender.com
# ⬆️ Paste vào Frontend environment variables

# ============================================
# HƯỚNG DẪN SỬ DỤNG
# ============================================
# 1. Copy từng biến môi trường vào Render.com
# 2. Backend: Dashboard → Service → Environment tab
# 3. Frontend: Dashboard → Static Site → Environment tab
# 4. Update DATABASE_URL sau khi tạo PostgreSQL
# 5. Update FRONTEND_URL sau khi frontend deploy
# 6. Update VITE_API_URL sau khi backend deploy
"@
    
    $content | Out-File -FilePath ".env.render" -Encoding UTF8
    
    Write-Host "[OK] Saved to .env.render" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Open .env.render file" -ForegroundColor White
    Write-Host "2. Update DATABASE_URL from Render PostgreSQL" -ForegroundColor White
    Write-Host "3. Copy variables to Render.com" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host "Not saved. Copy the values above manually." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
