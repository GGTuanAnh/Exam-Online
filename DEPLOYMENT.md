 # Exam Online System - Deployment Guide

## 📋 Yêu cầu trước khi deploy

- Docker & Docker Compose
- Node.js 20+ (nếu build local)
- PostgreSQL 16+ (nếu không dùng Docker)
- Domain name (optional, cho SSL)

---

## 🚀 OPTION 1: Deploy bằng Docker Compose (Khuyến nghị)

### Bước 1: Chuẩn bị Environment Variables

```bash
# Copy file mẫu
cp .env.production.example .env.production

# Chỉnh sửa .env.production với thông tin thực
nano .env.production
```

**Thông tin CẦN thay đổi**:
- `DATABASE_URL`: Connection string database
- `JWT_SECRET`: Random string dài >= 32 ký tự
- `REFRESH_TOKEN_SECRET`: Random string khác với JWT_SECRET
- `EMAIL_USER` & `EMAIL_PASSWORD`: Gmail App Password
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
- `FRONTEND_URL`: URL frontend (https://yourdomain.com)

### Bước 2: Build và chạy

```bash
# Build tất cả services
docker-compose build

# Start tất cả services
docker-compose up -d

# Kiểm tra logs
docker-compose logs -f
```

### Bước 3: Chạy Prisma migrations

```bash
# Chạy migrations trong container
docker-compose exec backend npx prisma migrate deploy

# Tạo admin user (optional)
docker-compose exec backend node scripts/create-admin.js
```

### Bước 4: Kiểm tra

- Frontend: http://localhost
- Backend API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api-docs

---

## 🌐 OPTION 2: Deploy lên Cloud Platforms

### 2A. Deploy lên Railway.app

1. Tạo account tại https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Chọn repository của bạn
4. Railway tự động detect và deploy

**Environment Variables cần thêm trên Railway**:
```
DATABASE_URL=<Railway sẽ tự động tạo PostgreSQL>
JWT_SECRET=<your-secret>
REFRESH_TOKEN_SECRET=<your-secret>
FRONTEND_URL=https://your-app.railway.app
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=<your-gmail>
EMAIL_PASSWORD=<app-password>
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
```

### 2B. Deploy lên Render.com

**Backend (Web Service)**:
1. New Web Service → Connect GitHub repo
2. Build Command: `npm install && npx prisma generate && npm run build`
3. Start Command: `npx prisma migrate deploy && node dist/backend/src/main.js`
4. Environment Variables: Thêm tất cả biến từ `.env.production`

**Frontend (Static Site)**:
1. New Static Site → Connect GitHub repo
2. Build Command: `cd frontend && npm install && npm run build`
3. Publish Directory: `frontend/dist`

**Database**:
1. New PostgreSQL → Copy connection string
2. Add vào `DATABASE_URL` của backend

### 2C. Deploy lên Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel)**:
```bash
cd frontend
vercel --prod
```

**Backend (Railway)**:
- Follow 2A instructions

---

## 🔐 Cấu hình SSL/HTTPS

### Option 1: Sử dụng Nginx + Let's Encrypt

```bash
# Cài đặt Certbot
sudo apt install certbot python3-certbot-nginx

# Lấy SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Option 2: Sử dụng Cloudflare

1. Thêm domain vào Cloudflare
2. Update DNS records:
   - A record: `@` → `<your-server-ip>`
   - CNAME: `www` → `yourdomain.com`
3. Enable "Full (strict)" SSL mode
4. Enable "Always Use HTTPS"

---

## 📊 Monitoring & Logs

### Xem logs Docker

```bash
# Xem logs tất cả services
docker-compose logs -f

# Xem logs backend
docker-compose logs -f backend

# Xem logs frontend
docker-compose logs -f frontend

# Xem logs database
docker-compose logs -f postgres
```

### Health Checks

```bash
# Backend health
curl http://localhost:3000/api-docs

# Database health
docker-compose exec postgres pg_isready

# Frontend health
curl http://localhost
```

---

## 🔄 Update & Maintenance

### Update code mới

```bash
# Pull code mới
git pull origin main

# Rebuild và restart
docker-compose down
docker-compose build
docker-compose up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy
```

### Backup database

```bash
# Backup
docker-compose exec postgres pg_dump -U examuser examonline > backup.sql

# Restore
docker-compose exec -T postgres psql -U examuser examonline < backup.sql
```

---

## 🛑 Troubleshooting

### Lỗi: "EADDRINUSE: address already in use"
```bash
# Stop tất cả containers
docker-compose down

# Xóa port đang dùng (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Lỗi: "Prisma Client not generated"
```bash
docker-compose exec backend npx prisma generate
docker-compose restart backend
```

### Lỗi: Database connection failed
```bash
# Kiểm tra database đang chạy
docker-compose ps postgres

# Kiểm tra logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U examuser -d examonline -c "SELECT 1;"
```

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Logs: `docker-compose logs -f`
2. Environment variables trong `.env.production`
3. Port conflicts (3000, 80, 5432)
4. Docker daemon đang chạy

---

## 🎯 Checklist trước khi deploy Production

- [ ] Đã thay đổi tất cả secrets trong `.env.production`
- [ ] Database backups được setup tự động
- [ ] SSL/HTTPS đã được cấu hình
- [ ] CORS origins chỉ cho phép frontend domain
- [ ] Rate limiting đã được bật
- [ ] Error monitoring (Sentry) đã được setup (optional)
- [ ] Domain DNS đã được cấu hình đúng
- [ ] Email service hoạt động (test forgot password)
- [ ] Google OAuth callback URL đã update
- [ ] Đã test toàn bộ user flows
