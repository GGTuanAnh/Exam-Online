# 🚀 QUICKSTART - DEPLOY UAT 10 PHÚT

> **PHƯƠNG ÁN:** Deploy lên Render.com (100% miễn phí)  
> **THỜI GIAN:** 10 phút (Sử dụng config có sẵn)  
> **CHI PHÍ:** ₫0  

---

## 🎯 3 BƯỚC NHANH (ĐÃ CẬP NHẬT CREDENTIALS)

### 1️⃣ CHUẨN BỊ (2 phút)

```bash
# Push code lên GitHub (credentials đã sẵn sàng trong .env.render)
git add .
git commit -m "Ready for UAT"
git push origin main
```

### 2️⃣ DEPLOY (5 phút)

1. **Tạo account:** https://render.com → Sign in với GitHub
2. **Database:** New → PostgreSQL → Free → Create
   - ⚠️ Copy URL của Database này (Internal URL) -> Paste vào `.env.render` thay thế dòng `DATABASE_URL`
3. **Backend:** New → Web Service → Connect repo → Free
   - Build: `npm install && npx prisma generate && npm run build`
   - Start: `npx prisma migrate deploy && node dist/main.js`
   - **Environment Variables:**
     - Mở file `.env.render` (đã có đủ Email/Google/JWT)
     - Copy TOÀN BỘ nội dung paste vào Render (nhớ update `DATABASE_URL` trước)
4. **Frontend:** New → Static Site → Connect repo
   - Root: `frontend`
   - Build: `npm install && npm run build`
   - Publish: `dist`
   - Env: `VITE_API_URL=https://exam-online-backend.onrender.com` (Sửa link nếu tên khác)

### 3️⃣ TEST (3 phút)

- ✅ Truy cập frontend URL
- ✅ Đăng ký tài khoản (Email thật sẽ hoạt động!)
- ✅ Đăng nhập (Google Login đã được cấu hình!)
- ✅ Test tạo exam

---

## 🆘 LƯU Ý QUAN TRỌNG

> **DATABASE:** Bạn PHẢI tạo Database trên Render. 
> URL `postgres:123456@localhost` trong máy bạn **KHÔNG THỂ** chạy trên web.

> **DOMAIN:** Nếu tên APP trên Render khác với dự kiến (`exam-online-backend`), nhớ sửa lại URL trong `.env.render` ở dòng `GOOGLE_CALLBACK_URL` và `FRONTEND_URL`.

---

## ✅ DONE!

Bạn đã có file `.env.render` full cấu hình. Chỉ cần copy-paste!
