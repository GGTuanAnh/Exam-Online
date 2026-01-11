# 🚀 DEPLOY UAT MIỄN PHÍ - CHỈ 10 PHÚT

## 🎯 Phương án: Deploy lên Render.com (100% FREE)

**Thời gian:** 10 phút  
**Chi phí:** ₫0 (Hoàn toàn miễn phí)  
**Kết quả:** URL public để test UAT

---

## 📋 CHUẨN BỊ (1 phút)

### Bước 0: Push code lên GitHub (nếu chưa)

```bash
# Nếu chưa có git repo
git init
git add .
git commit -m "Ready for UAT deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

---

## 🗄️ PHẦN 1: DEPLOY DATABASE (2 phút)

### 1. Tạo account Render.com

1. Truy cập: https://render.com
2. Click **"Get Started"** → Đăng nhập bằng GitHub
3. Authorize Render để truy cập repos

### 2. Tạo PostgreSQL Database

1. Click **"New +"** → Chọn **"PostgreSQL"**
2. Điền thông tin:
   ```
   Name: exam-online-db
   Database: examonline
   User: examuser
   Region: Singapore (gần Việt Nam nhất)
   ```
3. Chọn **"Free"** plan
4. Click **"Create Database"**

### 3. Lấy Database URL

1. Sau khi tạo xong, vào tab **"Info"**
2. Copy **"Internal Database URL"** (dạng: `postgresql://...`)
3. Lưu lại, sẽ dùng ở bước sau

---

## 🔧 PHẦN 2: DEPLOY BACKEND (4 phút)

### 1. Tạo Web Service cho Backend

1. Click **"New +"** → Chọn **"Web Service"**
2. Connect GitHub repository của bạn
3. Điền thông tin:
   ```
   Name: exam-online-backend
   Region: Singapore
   Branch: main
   Root Directory: (để trống)
   Runtime: Node
   Build Command: npm install && npx prisma generate && npm run build
   Start Command: npx prisma migrate deploy && node dist/main.js
   ```
4. Chọn **"Free"** plan

### 2. Thêm Environment Variables

Trong phần **Environment**, bạn không cần nhập thủ công từng biến.

1. Mở file `.env.render` trên máy của bạn (tôi đã điền sẵn Email, Google, JWT).
2. **Copy toàn bộ nội dung file.**
3. Paste vào khung "Environment Variables" trên Render.
4. **QUAN TRỌNG:** Sửa dòng `DATABASE_URL` thành URL của database bạn vừa tạo ở bước trên (Internal Database URL).

Các biến đã có sẵn trong file `.env.render`:
- `DATABASE_URL` (Cần update)
- `JWT_SECRET` / `REFRESH_TOKEN_SECRET` (Đã có)
- `EMAIL_HOST` / `USER` / `PASS` (Đã dùng từ máy bạn)
- `GOOGLE_...` (Đã dùng từ máy bạn)
- `FRONTEND_URL` (Đã điền sẵn dự kiến)

### 3. Deploy Backend

1. Click **"Create Web Service"**
2. Đợi 3-5 phút để build và deploy
3. Kiểm tra logs để đảm bảo không có lỗi
4. Copy URL backend (dạng: `https://exam-online-backend.onrender.com`)

---

## 🎨 PHẦN 3: DEPLOY FRONTEND (3 phút)

### 1. Cập nhật Frontend Config

Trước khi deploy frontend, cần tạo file config:

**Tạo file:** `frontend/.env.production`
```bash
VITE_API_URL=https://exam-online-backend.onrender.com
```

Commit và push:
```bash
git add frontend/.env.production
git commit -m "Add production API URL"
git push origin main
```

### 2. Tạo Static Site cho Frontend

1. Click **"New +"** → Chọn **"Static Site"**
2. Connect same GitHub repository
3. Điền thông tin:
   ```
   Name: exam-online-frontend
   Region: Singapore
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```
4. Chọn **"Free"** plan

### 3. Thêm Environment Variable cho Frontend

```bash
VITE_API_URL=https://exam-online-backend.onrender.com
```

### 4. Deploy Frontend

1. Click **"Create Static Site"**
2. Đợi 2-3 phút để build
3. Copy URL frontend (dạng: `https://exam-online-frontend.onrender.com`)

---

## 🔄 PHẦN 4: CẬP NHẬT CORS (1 phút)

### Update Backend Environment

1. Quay lại **Backend service** trên Render
2. Vào tab **"Environment"**
3. Update biến `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://exam-online-frontend.onrender.com
   ```
4. Click **"Save Changes"** → Backend sẽ tự động redeploy

---

## ✅ HOÀN THÀNH!

### 🎉 Ứng dụng của bạn đã LIVE!

**Frontend:** https://exam-online-frontend.onrender.com  
**Backend API:** https://exam-online-backend.onrender.com  
**API Docs:** https://exam-online-backend.onrender.com/api-docs

---

## 🧪 TEST UAT

### 1. Tạo tài khoản Admin

Truy cập backend service terminal trên Render và chạy:

```bash
# Vào tab "Shell" của backend service
node scripts/create-admin.js
```

Hoặc đăng ký thủ công qua frontend:
- Email: `admin@edu.vn`
- Password: `Admin123`

### 2. Test các tính năng

✅ Đăng ký tài khoản  
✅ Đăng nhập  
✅ Tạo khóa học  
✅ Tạo ngân hàng câu hỏi  
✅ Tạo đề thi  
✅ Làm bài thi  
✅ Xem kết quả  

### 3. Chia sẻ link với team

Gửi link frontend cho team để cùng test UAT!

---

## 📊 MONITORING

### Xem Logs

1. Vào service trên Render.com
2. Click tab **"Logs"**
3. Xem realtime logs

### Xem Database

1. Vào PostgreSQL service
2. Click **"Connect"**
3. Dùng tool như TablePlus hoặc pgAdmin

---

## 🔄 UPDATE CODE MỚI

Cực kỳ đơn giản:

```bash
# Sửa code
git add .
git commit -m "Fix bug XXX"
git push origin main

# Render tự động deploy!
```

---

## ⚠️ GIỚI HẠN FREE TIER

- Database: 1GB storage
- Backend: 750 giờ/tháng (ngủ sau 15 phút không dùng)
- Frontend: 100GB bandwidth/tháng
- **Đủ cho UAT và demo!** ✅

---

## 🆘 TROUBLESHOOTING

### Backend không start được

1. Kiểm tra logs trên Render
2. Đảm bảo `DATABASE_URL` đúng
3. Kiểm tra build command đã chạy prisma migrate

### Frontend không kết nối được Backend

1. Kiểm tra `VITE_API_URL` đã đúng chưa
2. Kiểm tra CORS trong backend
3. Xem Network tab trong Chrome DevTools

### Database connection error

1. Copy lại `Internal Database URL` (không phải External)
2. Đảm bảo database đã ready (xanh trên dashboard)

---

## 💰 NÂng CẤP (KHI CẦN)

Nếu cần performance tốt hơn:

- **Starter Plan ($7/tháng):** Không sleep, faster
- **Pro Plan ($25/tháng):** Multiple instances, auto-scaling

**Nhưng FREE tier đủ cho UAT rồi!** 🎉

---

## 📞 SUPPORT

Có vấn đề? Check:
1. Render Dashboard → Logs
2. Chrome DevTools → Network/Console
3. Backend `/api-docs` có hoạt động không

---

## 🎯 CHECKLIST DEPLOY THÀNH CÔNG

- [x] Database đã tạo và status = "Available"
- [x] Backend deploy thành công (màu xanh)
- [x] Frontend deploy thành công (màu xanh)
- [x] Truy cập frontend URL thấy giao diện
- [x] API Docs hiển thị đúng
- [x] Test đăng ký/đăng nhập thành công
- [x] Chia sẻ link cho team

**DONE! Giờ có thể test UAT rồi!** 🚀
