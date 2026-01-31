# TRƯỜNG ĐẠI HỌC ………………… 
## KHOA …………………

---

# BÁO CÁO ĐỒ ÁN / DỰ ÁN

# HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN
## (EXAM ONLINE SYSTEM)

---

**Nhóm:** ………

| STT | Mã sinh viên | Họ và tên | Vai trò |
|-----|--------------|-----------|---------|
| 1   |              |           |         |
| 2   |              |           |         |
| 3   |              |           |         |

**Giáo viên hướng dẫn:** …………………………………

**Địa điểm, ngày … tháng … năm …**

---

## Nhận xét và đánh giá của giảng viên hướng dẫn
*(Trang dành cho GVHD)*

---

## Bảng phân công công việc

| Họ và tên | Chức vụ | Nhiệm vụ | Tỷ lệ đóng góp |
|-----------|---------|----------|----------------|
|           |         |          |                |

---

## Lời cảm ơn

Trong quá trình thực hiện đồ án, nhóm chúng em đã nhận được sự hướng dẫn tận tình từ giảng viên hướng dẫn, sự hỗ trợ từ nhà trường và khoa. Chúng em xin gửi lời cảm ơn chân thành đến:
- Giảng viên hướng dẫn đã tận tâm chỉ dạy, định hướng và góp ý trong suốt quá trình thực hiện đồ án.
- Quý thầy cô trong khoa đã truyền đạt kiến thức nền tảng vững chắc.
- Các thành viên trong nhóm đã cùng nhau nỗ lực, hợp tác để hoàn thành dự án.

---

## Lời cam đoan

Nhóm sinh viên xin cam đoan toàn bộ nội dung trong báo cáo này là kết quả nghiên cứu, phân tích và thực hiện của nhóm. Các tài liệu tham khảo đều được trích dẫn rõ ràng và không vi phạm bản quyền. Nhóm xin chịu hoàn toàn trách nhiệm về tính trung thực của nội dung báo cáo.

---

## Tóm tắt

**Hệ thống Thi Trắc Nghiệm Trực Tuyến (Exam Online System)** là một ứng dụng web được phát triển nhằm số hóa quy trình tổ chức và quản lý các kỳ thi trắc nghiệm trong môi trường giáo dục.

**Mục tiêu chính:**
- Xây dựng hệ thống thi trực tuyến hoàn chỉnh với đầy đủ chức năng cho giáo viên và học sinh
- Đảm bảo tính bảo mật và chống gian lận trong quá trình thi
- Cung cấp trải nghiệm người dùng thân thiện và chuyên nghiệp

**Công nghệ sử dụng:** NestJS, React, TypeScript, PostgreSQL, Prisma, Tailwind CSS, JWT, Google OAuth 2.0

**Kết quả đạt được:** Hệ thống hoàn chỉnh với 2 role (Giáo viên/Học sinh), quản lý môn học, ngân hàng câu hỏi, đề thi, ca thi, chức năng làm bài với anti-cheat, chấm điểm tự động.

---

## Mục lục

- [Chương 1. TỔNG QUAN VỀ ĐỀ TÀI](#chương-1-tổng-quan-về-đề-tài)
- [Chương 2. PHÂN TÍCH HỆ THỐNG](#chương-2-phân-tích-hệ-thống)
- [Chương 3. THIẾT KẾ HỆ THỐNG](#chương-3-thiết-kế-hệ-thống)
- [Chương 4. TRIỂN KHAI VÀ KIỂM THỬ](#chương-4-triển-khai-và-kiểm-thử)
- [Chương 5. TÍCH HỢP CÔNG NGHỆ NÂNG CAO](#chương-5-tích-hợp-công-nghệ-nâng-cao)
- [Chương 6. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN](#chương-6-kết-luận-và-hướng-phát-triển)

---

# Chương 1. TỔNG QUAN VỀ ĐỀ TÀI

## 1.1. Giới thiệu đề tài

Trong bối cảnh chuyển đổi số đang diễn ra mạnh mẽ trong lĩnh vực giáo dục, việc tổ chức các kỳ thi trực tuyến ngày càng trở nên phổ biến và cần thiết. **Hệ thống Thi Trắc Nghiệm Trực Tuyến** được xây dựng nhằm đáp ứng nhu cầu này, cung cấp một giải pháp toàn diện cho việc:
- Quản lý ngân hàng câu hỏi theo môn học
- Tạo và quản lý đề thi với nhiều cấu hình linh hoạt
- Tổ chức ca thi với kiểm soát thời gian và mật khẩu
- Theo dõi quá trình làm bài và chống gian lận
- Chấm điểm tự động và thống kê kết quả

## 1.2. Lý do chọn đề tài

### 1.2.1. Xu hướng công nghệ
- **Chuyển đổi số trong giáo dục:** Các trường học đang dần chuyển sang hình thức thi online
- **E-learning phát triển:** Sự bùng nổ của các nền tảng học trực tuyến
- **Web technologies hiện đại:** React, Node.js cho phép xây dựng ứng dụng real-time mạnh mẽ

### 1.2.2. Nhu cầu thực tế
- Giảm chi phí in ấn đề thi giấy
- Tiết kiệm thời gian chấm bài cho giáo viên
- Học sinh có thể thi bất cứ đâu có internet
- Kết quả được công bố ngay lập tức

## 1.3. Mục tiêu và phạm vi nghiên cứu

### 1.3.1. Mục tiêu
**Mục tiêu tổng quát:** Xây dựng hệ thống thi trắc nghiệm trực tuyến hoàn chỉnh, đáp ứng các yêu cầu cơ bản của việc tổ chức thi trong môi trường giáo dục.

**Mục tiêu cụ thể:**
1. Phát triển module quản lý người dùng với phân quyền rõ ràng
2. Xây dựng chức năng quản lý môn học và ngân hàng câu hỏi
3. Thiết kế module tạo đề thi với ma trận độ khó
4. Phát triển giao diện làm bài thi với các tính năng anti-cheat
5. Triển khai hệ thống chấm điểm tự động

### 1.3.2. Phạm vi nghiên cứu
**Phạm vi thực hiện:** Web application, 2 role (ADMIN/USER), 4 loại câu hỏi, anti-cheat cơ bản, chấm điểm tự động

**Phạm vi không thực hiện:** Mobile app native, webcam proctoring, LMS integration, đa ngôn ngữ

## 1.4. Ý nghĩa thực tiễn

- **Đối với giáo dục:** Góp phần hiện đại hóa phương pháp đánh giá học sinh
- **Đối với người dùng:** Giảm chi phí, tiết kiệm thời gian, lưu trữ dữ liệu có hệ thống
- **Đối với sinh viên:** Nắm vững quy trình phát triển phần mềm full-stack

## 1.5. Phương pháp thực hiện

- **Quy trình:** Agile/Scrum với các sprint 2 tuần
- **Nghiên cứu:** Tìm hiểu các hệ thống thi online hiện có, khảo sát thực tế

---

# Chương 2. PHÂN TÍCH HỆ THỐNG

## 2.1. Khảo sát hiện trạng

### 2.1.1. Vấn đề hiện tại
| Vấn đề | Mô tả |
|--------|-------|
| Chi phí cao | In ấn đề thi, phiếu trả lời |
| Thời gian chấm bài | Giáo viên mất nhiều thời gian |
| Khó quản lý | Ngân hàng câu hỏi lưu trữ rời rạc |
| Gian lận | Học sinh dễ trao đổi bài |

### 2.1.2. Các giải pháp hiện có
| Hệ thống | Ưu điểm | Nhược điểm |
|----------|---------|------------|
| Google Forms | Miễn phí, dễ dùng | Không có anti-cheat |
| Moodle | Mã nguồn mở | Cài đặt phức tạp |
| Quizizz | Gamification | Giới hạn miễn phí |

## 2.2. Mô tả nghiệp vụ

```
LUỒNG THI TRẮC NGHIỆM:
1. Giáo viên tạo Môn học → 2. Tạo Ngân hàng câu hỏi → 3. Nhập Câu hỏi
→ 4. Tạo Đề thi → 5. Tạo Ca thi → 6. Học sinh vào thi
→ 7. Làm bài (timer + anti-cheat) → 8. Nộp bài → 9. Chấm điểm → 10. Xem kết quả
```

## 2.3. Phân tích yêu cầu

### 2.3.1. Yêu cầu chức năng
| ID | Chức năng | Actor |
|----|-----------|-------|
| FR01 | Đăng ký/Đăng nhập | All |
| FR02 | Quản lý môn học | Admin |
| FR03 | Quản lý ngân hàng câu hỏi | Admin |
| FR04 | Quản lý câu hỏi (Import Excel) | Admin |
| FR05 | Quản lý đề thi (ma trận) | Admin |
| FR06 | Quản lý ca thi | Admin |
| FR07 | Làm bài thi | User |
| FR08 | Nộp bài | User |
| FR09 | Xem kết quả | User |
| FR10 | Chấm tự luận | Admin |

### 2.3.2. Yêu cầu phi chức năng
| ID | Yêu cầu | Metric |
|----|---------|--------|
| NFR01 | Performance | Page load < 3s |
| NFR02 | Security | bcrypt, JWT, HTTPS |
| NFR03 | Usability | Mobile responsive |
| NFR04 | Scalability | 100+ concurrent users |

## 2.4. Xác định tác nhân và Use Case

### Actors:
- **Admin (Giáo viên):** Quản lý hệ thống, tạo đề thi, quản lý ca thi
- **User (Học sinh):** Tham gia thi, làm bài, xem kết quả
- **System:** Auto-save, auto-submit, chấm điểm tự động

### Use Cases chính:
1. **UC01:** Đăng nhập hệ thống
2. **UC02:** Tạo đề thi
3. **UC03:** Làm bài thi
4. **UC04:** Xem kết quả thi

---

# Chương 3. THIẾT KẾ HỆ THỐNG

## 3.1. Thiết kế kiến trúc tổng thể

Hệ thống được thiết kế theo kiến trúc **3-tier**:

```
┌─────────────────────────────────────────────┐
│         PRESENTATION LAYER                  │
│         React + Vite Frontend               │
├─────────────────────────────────────────────┤
│          BUSINESS LAYER                     │
│          NestJS Backend                     │
├─────────────────────────────────────────────┤
│           DATA LAYER                        │
│         PostgreSQL + Prisma                 │
└─────────────────────────────────────────────┘
```

### Tech Stack:
| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Shadcn/UI |
| Backend | NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT, Passport.js, bcrypt, Google OAuth |
| Container | Docker, Docker Compose |

## 3.2. Thiết kế cơ sở dữ liệu

### ERD - Entity Relationship Diagram:

```
User ──1:N── ExamSession ──1:1── ExamResult
  │                │
  │                │
  │            Exam ──N:M── Question (via ExamQuestion)
  │              │              │
  │              │              │
  │          ExamShift    QuestionBank ──1:N── Question
  │                              │
  │                           Course
  └────────────────────────────────┘
```

### Các bảng chính:
| Bảng | Mô tả |
|------|-------|
| User | Thông tin người dùng (GV/HS) |
| Course | Môn học |
| QuestionBank | Ngân hàng câu hỏi |
| Question | Câu hỏi chi tiết |
| Exam | Đề thi |
| ExamShift | Ca thi |
| ExamSession | Phiên làm bài |
| ExamResult | Kết quả thi |

## 3.3. Thiết kế giao diện

### Trang đăng nhập:
- Form email/password
- Nút đăng nhập Google
- Animated background

### Trang làm bài thi:
- Timer countdown
- Navigation panel (grid câu hỏi)
- Question display area
- Submit button

---

# Chương 4. TRIỂN KHAI VÀ KIỂM THỬ

## 4.1. Công nghệ sử dụng

| Thành phần | Công nghệ | Phiên bản |
|------------|-----------|-----------|
| Runtime | Node.js | 18.x LTS |
| Backend | NestJS | 10.x |
| Frontend | React | 18.x |
| Build Tool | Vite | 5.x |
| ORM | Prisma | 5.x |
| Database | PostgreSQL | 15.x |
| CSS | Tailwind CSS | 3.x |
| UI | Shadcn/UI | Latest |

## 4.2. Cấu trúc project

```
exam-online-system/
├── backend/
│   ├── src/
│   │   ├── auth/           # Authentication
│   │   ├── courses/        # Course CRUD
│   │   ├── questions/      # Question CRUD
│   │   ├── exams/          # Exam management
│   │   ├── exam-sessions/  # Exam taking
│   │   └── exam-results/   # Results
│   └── prisma/             # Database schema
│
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── public/
│
└── docker-compose.yml
```

## 4.3. Các chức năng đã thực hiện

| Module | Chức năng | Status |
|--------|-----------|--------|
| Auth | Đăng ký, Đăng nhập, Google OAuth | ✅ |
| Courses | CRUD môn học | ✅ |
| Question Banks | CRUD ngân hàng | ✅ |
| Questions | CRUD, Import Excel | ✅ |
| Exams | Tạo đề, ma trận độ khó | ✅ |
| Exam Sessions | Làm bài, anti-cheat | ✅ |
| Exam Results | Chấm điểm, thống kê | ✅ |

## 4.4. Code tiêu biểu

### Anti-Cheat Detection:
```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      setLeaveScreenCount(prev => prev + 1);
      showWarning('Cảnh báo: Bạn đã rời khỏi màn hình thi!');
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

### Auto Score Calculation:
```typescript
calculateScore(question, userAnswer, maxPoint) {
  const correctOptions = question.options.filter(opt => opt.isCorrect);
  if (question.type === 'SINGLE_CHOICE') {
    return userAnswer === correctOptions[0].id ? maxPoint : 0;
  }
  // ... more logic
}
```

## 4.5. Kiểm thử

| Test Case | Expected | Result |
|-----------|----------|--------|
| Đăng nhập đúng | Thành công | ✅ PASS |
| Đăng nhập sai | Hiển thị lỗi | ✅ PASS |
| Tạo đề thi | Tạo thành công | ✅ PASS |
| Làm bài | Lưu đáp án | ✅ PASS |
| Nộp bài | Chấm điểm | ✅ PASS |
| Tab switch | Cảnh báo | ✅ PASS |

---

# Chương 5. TÍCH HỢP CÔNG NGHỆ NÂNG CAO

## 5.1. Hệ thống chống gian lận (Anti-Cheat)

| Biện pháp | Mô tả | Hiệu quả |
|-----------|-------|----------|
| Tab Detection | Phát hiện chuyển tab | ⭐⭐⭐ |
| Copy/Paste Block | Vô hiệu hóa copy, paste | ⭐⭐ |
| Fullscreen Mode | Yêu cầu toàn màn hình | ⭐⭐⭐ |
| Violation Counter | Đếm số lần vi phạm | ⭐⭐⭐ |
| Shift Password | Mật khẩu ca thi | ⭐⭐⭐⭐ |

## 5.2. JWT Authentication

```
Login → Verify credentials → Generate Access Token + Refresh Token
    → Store tokens → Use Access Token for API calls
    → Token expired? → Use Refresh Token → Get new Access Token
```

## 5.3. Auto-Save & Resume

- **Auto-save:** Lưu đáp án tự động mỗi 30 giây
- **Resume:** Khi refresh, load lại session đang làm dở, tính thời gian còn lại

## 5.4. Ma trận đề thi

Giáo viên có thể tạo đề theo ma trận:
- Chọn số câu Dễ/Trung bình/Khó
- Hệ thống tự động shuffle và chọn ngẫu nhiên
- Tự động tính điểm mỗi câu

---

# Chương 6. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## 6.1. Kết luận

Nhóm đã hoàn thành xây dựng **Hệ thống Thi Trắc Nghiệm Trực Tuyến** với đầy đủ các chức năng cơ bản:

✅ Quản lý người dùng với 2 role  
✅ Quản lý môn học, ngân hàng câu hỏi, import Excel  
✅ Tạo đề thi với ma trận độ khó  
✅ Tổ chức ca thi với password và time window  
✅ Làm bài với anti-cheat, auto-save  
✅ Chấm điểm tự động, xem kết quả chi tiết  

## 6.2. Kết quả đạt được

| Thành phần | Số lượng |
|------------|----------|
| Backend APIs | 40+ endpoints |
| Frontend Pages | 15+ pages |
| Database Tables | 12 tables |
| UI Components | 20+ components |

## 6.3. Hạn chế

- Anti-cheat chỉ ở client-side, có thể bypass
- Chưa có webcam proctoring
- Chưa có unit tests đầy đủ
- Chưa tích hợp CI/CD

## 6.4. Hướng phát triển

**Ngắn hạn:** DevTools detection, violation logging, auto-submit khi vi phạm nhiều

**Trung hạn:** Session heartbeat, IP fingerprinting, advanced statistics

**Dài hạn:** Webcam proctoring, screen recording, AI plagiarism detection

## 6.5. Bài học kinh nghiệm

1. TypeScript giúp phát hiện lỗi sớm
2. Planning database và API quan trọng
3. Viết documentation song song với code
4. Code review cải thiện chất lượng

---

## Tài liệu tham khảo

1. NestJS Documentation - https://docs.nestjs.com/
2. React Documentation - https://react.dev/
3. Prisma Documentation - https://www.prisma.io/docs/
4. Tailwind CSS - https://tailwindcss.com/
5. Shadcn/UI - https://ui.shadcn.com/
6. PostgreSQL - https://www.postgresql.org/docs/
7. JWT.io - https://jwt.io/

---

## Phụ lục

### A. Hướng dẫn cài đặt

```bash
# Clone repository
git clone https://github.com/your-repo/exam-online-system.git

# Install dependencies
npm install

# Setup database
cd backend
npx prisma db push

# Run servers
cd backend && npm run start:dev
cd frontend && npm run dev
```

### B. Environment Variables

```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="your-jwt-secret"
FRONTEND_URL="http://localhost:5173"
```

---

**Nhóm sinh viên thực hiện**

*Địa điểm, ngày ... tháng ... năm ...*
