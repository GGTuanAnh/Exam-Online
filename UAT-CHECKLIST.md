# ====================================================
# UAT DEPLOYMENT CHECKLIST
# ====================================================
# Quick reference cho deploy UAT lên Render.com
# ====================================================

## 🎯 PHƯƠNG ÁN ĐỀ XUẤT: RENDER.COM (MIỄN PHÍ)

### ⏱️ THỜI GIAN DỰ KIẾN: 10 PHÚT

---

## ✅ CHECKLIST TRƯỚC KHI DEPLOY

### 1. CODE ĐÃ SẴN SÀNG
- [ ] Đã sửa tất cả lỗi critical (duplicate route, prisma schema)
- [ ] Code đã commit lên Git
- [ ] Đã push lên GitHub repository

```bash
git status  # Kiểm tra có thay đổi chưa commit không
git add .
git commit -m "Ready for UAT deployment"
git push origin main
```

### 2. TÀI KHOẢN RENDER.COM
- [ ] Đã tạo account tại https://render.com
- [ ] Đã connect với GitHub account
- [ ] Render đã có quyền truy cập repository

---

## 📝 DEPLOYMENT STEPS (10 PHÚT)

### BƯỚC 1: DATABASE (2 phút)
- [ ] Tạo PostgreSQL service trên Render
- [ ] Chọn Free plan
- [ ] Copy Internal Database URL
- [ ] Database status = "Available" (màu xanh)

**Database URL format:**
```
postgresql://user:password@host.render.com/database
```

---

### BƯỚC 2: BACKEND (4 phút)

#### A. Tạo Web Service
- [ ] New → Web Service
- [ ] Connect GitHub repo
- [ ] Chọn Free plan

#### B. Build Configuration
```
Build Command:
npm install && npx prisma generate && npm run build

Start Command:
npx prisma migrate deploy && node dist/backend/src/main.js
```

#### C. Environment Variables (QUAN TRỌNG!)

**Bắt buộc:**
```bash
DATABASE_URL=<paste từ bước 1>
JWT_SECRET=<random 32 ký tự>
REFRESH_TOKEN_SECRET=<random 32 ký tự khác>
NODE_ENV=production
PORT=3000
```

**Tùy chọn (có thể skip cho UAT):**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=skip
EMAIL_PASSWORD=skip
GOOGLE_CLIENT_ID=skip
GOOGLE_CLIENT_SECRET=skip
```

#### D. Deploy và Kiểm tra
- [ ] Click "Create Web Service"
- [ ] Đợi build hoàn thành (3-5 phút)
- [ ] Status = "Live" (màu xanh)
- [ ] Copy backend URL
- [ ] Test: Truy cập `https://your-backend.onrender.com/api-docs`

---

### BƯỚC 3: FRONTEND (3 phút)

#### A. Tạo file config (LOCAL)

**Tạo: `frontend/.env.production`**
```bash
VITE_API_URL=https://your-backend.onrender.com
```

**Commit và push:**
```bash
git add frontend/.env.production
git commit -m "Add production API config"
git push origin main
```

#### B. Tạo Static Site
- [ ] New → Static Site
- [ ] Connect GitHub repo
- [ ] Chọn Free plan

#### C. Build Configuration
```
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

#### D. Environment Variables
```bash
VITE_API_URL=https://your-backend.onrender.com
```

#### E. Deploy và Kiểm tra
- [ ] Click "Create Static Site"
- [ ] Đợi build hoàn thành (2-3 phút)
- [ ] Status = "Live"
- [ ] Copy frontend URL
- [ ] Test: Truy cập `https://your-frontend.onrender.com`

---

### BƯỚC 4: CẬP NHẬT CORS (1 phút)
- [ ] Quay lại Backend service
- [ ] Environment → Edit
- [ ] Thêm/Update:
  ```bash
  FRONTEND_URL=https://your-frontend.onrender.com
  ```
- [ ] Save Changes (backend tự động redeploy)

---

## 🧪 TESTING (POST-DEPLOYMENT)

### Test cơ bản:
- [ ] Frontend hiển thị giao diện đúng
- [ ] API Docs accessible: `/api-docs`
- [ ] Đăng ký tài khoản thành công
- [ ] Đăng nhập hoạt động
- [ ] Có thể tạo course
- [ ] Có thể tạo exam
- [ ] Có thể làm bài thi

### Test URLs:
```
Frontend:   https://exam-online-frontend.onrender.com
Backend:    https://exam-online-backend.onrender.com
API Docs:   https://exam-online-backend.onrender.com/api-docs
```

---

## 🎯 TẠO ADMIN ACCOUNT

### Cách 1: Qua Frontend
```
Email: admin@edu.vn
Password: Admin123
```

### Cách 2: Qua Backend Shell
1. Vào Backend service trên Render
2. Click tab "Shell"
3. Run:
```bash
node scripts/create-admin.js
```

---

## 📊 MONITORING

### Xem Logs realtime:
- [ ] Render Dashboard → Service → Logs tab

### Check Database:
- [ ] PostgreSQL service → Connect tab

### Performance:
- [ ] Response time < 2s (free tier sleep sau 15 phút)

---

## 🔄 UPDATE CODE (AUTO DEPLOY)

Mỗi khi push code mới:
```bash
git add .
git commit -m "Update feature X"
git push origin main

# Render tự động build & deploy!
```

---

## 🆘 TROUBLESHOOTING

### Backend không start
```
1. Check Logs tab
2. Verify DATABASE_URL có đúng không
3. Verify build command đã chạy migration
```

### Frontend không load
```
1. Check console errors (F12)
2. Verify VITE_API_URL đúng không
3. Build lại: Manual Deploy button
```

### CORS errors
```
1. Check FRONTEND_URL trong backend env
2. Restart backend service
```

---

## 💡 TIPS

### Giảm cold start time:
- Truy cập app mỗi 10 phút (free tier sleep sau 15 phút)
- Hoặc dùng UptimeRobot để ping

### Faster deploys:
- Chỉ commit code cần thiết
- Dùng cache khi build

### Debug:
- Luôn check Logs tab trước
- Test API endpoint trực tiếp
- Dùng Postman/Insomnia để test API

---

## 📞 LINKS HỮU ÍCH

- Render Dashboard: https://dashboard.render.com
- Render Docs: https://render.com/docs
- PostgreSQL: Xem trong Render Dashboard

---

## ✅ DEPLOYMENT HOÀN TẤT KHI:

- [ ] ✅ Tất cả services màu xanh (Live)
- [ ] ✅ Frontend accessible và hiển thị UI
- [ ] ✅ Backend API Docs hoạt động
- [ ] ✅ Có thể đăng ký/đăng nhập
- [ ] ✅ Database có dữ liệu
- [ ] ✅ Team có thể truy cập URL để test

---

## 🎉 DONE!

**Giờ bạn có một ứng dụng LIVE, MIỄN PHÍ để test UAT!**

Share link với team:
```
🌐 Frontend: https://your-app.onrender.com
📚 API Docs: https://your-api.onrender.com/api-docs
```

**CHÚC UAT THÀNH CÔNG!** 🚀
