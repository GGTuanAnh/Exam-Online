# 🧪 MANUAL TEST PLAN (KẾ HOẠCH KIỂM THỬ)

Tài liệu này hướng dẫn bạn cách kiểm tra thủ công toàn bộ hệ thống để đảm bảo mọi chức năng hoạt động đúng cho cả 2 role: **Admin (Giáo viên)** và **Student (Học sinh/Sinh viên)**.

---

## 🛠️ PHẦN 1: CHUẨN BỊ MÔI TRƯỜNG (PRE-REQ)

Trước khi test, hãy đảm bảo hệ thống đang chạy sạch sẽ:

1.  **Dữ liệu**: Nên dùng database sạch hoặc ít nhất là biết rõ tài khoản Admin.
2.  **Khởi động Server**:
    *   Backend: `npm start:dev` (chạy tại port 3000)
    *   Frontend: `npm run dev` (chạy tại port 5173 - hoặc port khác tùy máy)
3.  **Tài khoản Test**:
    *   **Admin**: `admin@edu.vn` / `123` (Nếu chưa có, chạy script `node create-admin-uat.js`)
    *   **Student 1**: `student1@st.edu.vn` (Sẽ tạo trong quá trình test)
    *   **Student 2**: `student2@st.edu.vn` (Sẽ tạo trong quá trình test)

---

## 🧑‍🏫 PHẦN 2: TEST CASE CHO ADMIN (GIÁO VIÊN)

**Mục tiêu**: Đảm bảo Admin có thể thiết lập toàn bộ quy trình thi.

### 1. Đăng nhập & Quản lý User
- [ ] Truy cập trang Login.
- [ ] Nhập `admin@edu.vn` / `123` -> Login thành công -> Chuyển hướng về Dashboard Admin.
- [ ] Vào menu **Users (Người dùng)**.
- [ ] Thêm mới User (Student):
    - Email: `student1@st.edu.vn`
    - Tên: Nguyễn Văn A
    - Mật khẩu: `123123`
    - Role: `STUDENT`
- [ ] **Kết quả mong đợi**: User mới hiện trong danh sách.

### 2. Quản lý Môn học (Courses)
- [ ] Vào menu **Courses**.
- [ ] Tạo mới môn học:
    - Mã: `INT3306`
    - Tên: `Kiểm thử phần mềm`
- [ ] **Kết quả mong đợi**: Môn học xuất hiện trong bảng.

### 3. Ngân hàng câu hỏi (Question Banks)
- [ ] Vào menu **Question Banks**.
- [ ] Tạo ngân hàng mới:
    - Chọn môn: `Kiểm thử phần mềm`
    - Tên: `Chương 1 - Nhập môn`
- [ ] **Kết quả mong đợi**: Ngân hàng được tạo thành công.

### 4. Soạn Câu hỏi (Questions)
- [ ] Vào menu **Questions**.
- [ ] Chọn ngân hàng `Chương 1 - Nhập môn`.
- [ ] Thêm 2-3 câu hỏi (Trắc nghiệm):
    - Câu 1: 1 đáp án đúng (Single Choice).
    - Câu 2: Nhiều đáp án đúng (Multiple Choice) - *Nếu hệ thống hỗ trợ*.
- [ ] **Kết quả mong đợi**: Câu hỏi hiển thị đúng trong danh sách.

### 5. Tạo Đề thi (Exams)
- [ ] Vào menu **Exams**.
- [ ] Tạo Exam mới:
    - Tiêu đề: `Thi Giữa Kỳ - Test Shift`
    - Môn: `Kiểm thử phần mềm`
    - Thời gian làm bài: `30 phút`.
    - Chọn các câu hỏi vừa tạo từ ngân hàng.
    - **Quan trọng**: Bật "Chống gian lận" (Anti-cheat) để test tính năng này.
- [ ] **Kết quả mong đợi**: Đề thi được tạo.

### 6. Tạo Ca thi (Exam Shifts) - **TÍNH NĂNG MỚI**
- [ ] Tại danh sách đề thi, tìm đề `Thi Giữa Kỳ - Test Shift`.
- [ ] Bấm icon **Lịch (Manage Shifts)**.
- [ ] Tạo Ca thi mới:
    - Tên: `Ca Sáng - Có Pass`
    - Bắt đầu: *Thời gian hiện tại hoặc trước đó 1-2 phút*.
    - Kết thúc: *Thời gian hiện tại + 1 tiếng*.
    - Mật khẩu: `pass123` (Để test tính năng pass).
- [ ] **Kết quả mong đợi**: Ca thi hiện trạng thái "Đang diễn ra" (màu xanh).

---

## 👨‍🎓 PHẦN 3: TEST CASE CHO STUDENT (HỌC SINH)

**Mục tiêu**: Đảm bảo Học sinh vào thi được đúng ca, đúng pass và ko bị lỗi.

### 1. Đăng nhập
- [ ] Mở trình duyệt ẩn danh (Incognito) hoặc đăng xuất Admin.
- [ ] Login bằng `student1@st.edu.vn` / `123123`.
- [ ] **Kết quả mong đợi**: Vào Dashboard User.

### 2. Xem Danh sách Ca thi
- [ ] Tại trang chủ (Available Exams), tìm ca `Ca Sáng - Có Pass`.
- [ ] **Kết quả mong đợi**:
    - Thấy tên Ca thi, Môn học.
    - Trạng thái nút bấm: **"Vào Thi Ngay"** (Sáng màu).
    - Có icon "Yêu cầu mật khẩu".

### 3. Vào thi (Join Shift)
- [ ] Bấm "Vào Thi Ngay".
- [ ] Popup nhập pass hiện ra -> Nhập sai pass (`wrong`) -> Báo lỗi.
- [ ] Nhập đúng pass (`pass123`) -> Enter.
- [ ] **Kết quả mong đợi**: Chuyển trang sang màn hình làm bài (`/take-exam/session/...`).

### 4. Làm bài thi (Taking Exam)
- [ ] Kiểm tra đồng hồ đếm ngược: Phải khớp với thời gian còn lại của Ca thi (Nếu ca thi sắp hết giờ thì đồng hồ phải ngắn hơn thời gian làm bài quy định).
- [ ] Test **Anti-cheat**:
    - Thử chuyển tab sang Youtube hoặc bật file Word.
    - Quay lại tab thi -> **Kết quả mong đợi**: Xuất hiện cảnh báo vàng "Cảnh báo vi phạm!", số lần vi phạm tăng lên 1.
- [ ] Chọn đáp án cho các câu hỏi.
- [ ] Bấm "Nộp bài".

### 5. Xem Kết quả (Result)
- [ ] Sau khi nộp, hệ thống chuyển sang trang **Kết quả của tôi**.
- [ ] **Kết quả mong đợi**:
    - Thấy điểm số tương ứng.
    - Thấy số lần vi phạm (nếu có).

---

## 📊 PHẦN 4: TEST CASE CHECK LẠI BỞI ADMIN

### 1. Xem Lịch sử thi
- [ ] Login lại bằng **Admin**.
- [ ] Vào menu **Exam Results** (hoặc Exam Sessions).
- [ ] **Kết quả mong đợi**: Thấy bài thi của `student1` vừa nộp. Check xem có ghi nhận đúng số lần vi phạm màn hình không.

---

## ✅ KẾT LUẬN

Nếu bạn chạy hết các bước trên mà không gặp lỗi đỏ (Crash app) hoặc lỗi logic (nhập đúng pass mà không vào được...), thì chúc mừng! Dự án của bạn đã hoạt động trơn tru.
