# 📋 BỘ TEST CASES - HỆ THỐNG THI TRỰC TUYẾN

**Ngày tạo:** 31/01/2026  
**Phiên bản:** 1.0  
**Tổng số Test Cases:** 85+

---

## 📑 MỤC LỤC

1. [Module Authentication (Xác thực)](#1-module-authentication-xác-thực)
2. [Module User Management (Quản lý người dùng)](#2-module-user-management-quản-lý-người-dùng)
3. [Module Course (Học phần)](#3-module-course-học-phần)
4. [Module Question Bank (Ngân hàng câu hỏi)](#4-module-question-bank-ngân-hàng-câu-hỏi)
5. [Module Question (Câu hỏi)](#5-module-question-câu-hỏi)
6. [Module Exam (Đề thi)](#6-module-exam-đề-thi)
7. [Module Exam Session (Phiên thi)](#7-module-exam-session-phiên-thi)
8. [Module Exam Result (Kết quả thi)](#8-module-exam-result-kết-quả-thi)
9. [Module Anti-Cheat (Chống gian lận)](#9-module-anti-cheat-chống-gian-lận)
10. [Module Security (Bảo mật)](#10-module-security-bảo-mật)
11. [Module UI/UX](#11-module-uiux)

---

## 1. MODULE AUTHENTICATION (XÁC THỰC)

### 1.1 Đăng ký (Register)

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| AUTH-001 | Đăng ký thành công | Email chưa tồn tại | 1. Nhập email hợp lệ<br>2. Nhập password (>= 6 ký tự)<br>3. Submit | Tạo tài khoản, gửi email xác thực | High |
| AUTH-002 | Đăng ký với email đã tồn tại | Email đã được đăng ký | 1. Nhập email đã tồn tại<br>2. Submit | Báo lỗi "Email đã tồn tại" | High |
| AUTH-003 | Đăng ký với email không hợp lệ | - | 1. Nhập email không đúng định dạng<br>2. Submit | Validation error | High |
| AUTH-004 | Đăng ký với password yếu | - | 1. Nhập password < 6 ký tự<br>2. Submit | Validation error | Medium |
| AUTH-005 | Rate limiting đăng ký | - | 1. Gửi request đăng ký > 3 lần trong 60s | Request thứ 4 bị block (429) | High |

### 1.2 Xác thực Email

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| AUTH-006 | Xác thực email thành công | Có token hợp lệ | 1. Click link từ email<br>2. Token được verify | Tài khoản được kích hoạt | High |
| AUTH-007 | Xác thực với token không hợp lệ | - | 1. Truy cập với token sai | Báo lỗi "Token không hợp lệ" | High |
| AUTH-008 | Xác thực với token đã sử dụng | Token đã dùng | 1. Click lại link cũ | Báo lỗi phù hợp | Medium |

### 1.3 Đăng nhập (Login)

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| AUTH-009 | Đăng nhập thành công | Tài khoản đã kích hoạt | 1. Nhập email/password đúng<br>2. Submit | Đăng nhập thành công, nhận access_token + refresh_token | High |
| AUTH-010 | Đăng nhập với password sai | - | 1. Nhập password sai<br>2. Submit | Báo lỗi "Email hoặc mật khẩu không đúng" | High |
| AUTH-011 | Đăng nhập với email không tồn tại | - | 1. Nhập email không tồn tại<br>2. Submit | Báo lỗi "Email hoặc mật khẩu không đúng" | High |
| AUTH-012 | Đăng nhập tài khoản chưa kích hoạt | Email chưa verify | 1. Đăng nhập | Báo lỗi "Tài khoản chưa được kích hoạt" | High |
| AUTH-013 | Rate limiting đăng nhập | - | 1. Gửi request login > 5 lần trong 60s | Request thứ 6 bị block (429) | High |

### 1.4 Google OAuth

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| AUTH-014 | Đăng nhập Google lần đầu | Google account valid | 1. Click "Đăng nhập bằng Google"<br>2. Chọn tài khoản Google | Tạo user mới + đăng nhập | High |
| AUTH-015 | Đăng nhập Google tài khoản đã liên kết | - | 1. Click "Đăng nhập bằng Google" | Đăng nhập thành công | High |

### 1.5 Single Device Login (Đăng nhập 1 thiết bị)

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| AUTH-016 | Đăng nhập thiết bị thứ 2 | Đã login ở thiết bị 1 | 1. Login từ thiết bị 2 | Thành công, thiết bị 1 bị kick | High |
| AUTH-017 | API call sau khi bị kick | Thiết bị 1 đã bị kick | 1. Gọi API từ thiết bị 1 | 401 + redirect về Login với thông báo | High |
| AUTH-018 | Hiển thị thông báo bị kick | Bị kick khỏi hệ thống | 1. Mở trang Login | Hiển thị alert "đăng nhập ở thiết bị khác" | Medium |

### 1.6 Refresh Token

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| AUTH-019 | Refresh token thành công | Có refresh_token hợp lệ | 1. Access token hết hạn<br>2. Gọi /auth/refresh | Nhận access_token mới | High |
| AUTH-020 | Refresh với token hết hạn | Refresh token expired | 1. Gọi /auth/refresh | 401 + redirect về Login | High |

### 1.7 Quên mật khẩu (Forgot Password)

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| AUTH-021 | Gửi email reset password | Email tồn tại | 1. Nhập email<br>2. Submit | Gửi email reset link | High |
| AUTH-022 | Gửi reset cho email không tồn tại | - | 1. Nhập email không tồn tại | Báo lỗi "Email không tồn tại" | Medium |
| AUTH-023 | Rate limiting forgot password | - | 1. Gửi > 3 request trong 60s | Request thứ 4 bị block (429) | High |

### 1.8 Reset Password

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| AUTH-024 | Reset password thành công | Token hợp lệ, chưa hết hạn | 1. Click link từ email<br>2. Nhập password mới<br>3. Submit | Password được cập nhật | High |
| AUTH-025 | Reset với token hết hạn | Token > 1 giờ | 1. Click link cũ | Báo lỗi "Token đã hết hạn" | High |
| AUTH-026 | Reset với token không hợp lệ | - | 1. Dùng token sai | Báo lỗi | High |

### 1.9 Đổi mật khẩu (Change Password)

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| AUTH-027 | Đổi password thành công | Đã đăng nhập | 1. Nhập old password đúng<br>2. Nhập new password<br>3. Submit | Password được đổi | High |
| AUTH-028 | Đổi password với old password sai | - | 1. Nhập old password sai | Báo lỗi | High |

---

## 2. MODULE USER MANAGEMENT (QUẢN LÝ NGƯỜI DÙNG)

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| USER-001 | Xem danh sách users (Admin) | Role = ADMIN | 1. Truy cập trang Users | Hiển thị danh sách users | High |
| USER-002 | Tìm kiếm user | Role = ADMIN | 1. Nhập từ khóa tìm kiếm | Filter kết quả theo từ khóa | Medium |
| USER-003 | Xem profile bản thân | Đã đăng nhập | 1. Truy cập Profile | Hiển thị thông tin user | High |
| USER-004 | Cập nhật profile | Đã đăng nhập | 1. Sửa thông tin<br>2. Save | Thông tin được cập nhật | High |
| USER-005 | Cập nhật avatar | Đã đăng nhập | 1. Upload ảnh mới | Avatar được cập nhật | Medium |

---

## 3. MODULE COURSE (HỌC PHẦN)

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| COURSE-001 | Tạo học phần mới | Role = ADMIN | 1. Nhập code + name<br>2. Submit | Tạo học phần thành công | High |
| COURSE-002 | Tạo học phần với code trùng | Code đã tồn tại | 1. Nhập code đã có | Báo lỗi "Code đã tồn tại" | High |
| COURSE-003 | Xem danh sách học phần | Role = ADMIN | 1. Truy cập trang Courses | Hiển thị danh sách | High |
| COURSE-004 | Tìm kiếm học phần | - | 1. Nhập từ khóa | Filter kết quả | Medium |
| COURSE-005 | Cập nhật học phần | Role = ADMIN | 1. Sửa thông tin<br>2. Save | Thông tin được cập nhật | High |
| COURSE-006 | Xóa học phần không có đề thi | Role = ADMIN | 1. Click Delete | Xóa thành công | High |
| COURSE-007 | Xóa học phần có đề thi | Có exam liên kết | 1. Click Delete | Báo lỗi hoặc confirm | High |

---

## 4. MODULE QUESTION BANK (NGÂN HÀNG CÂU HỎI)

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| QB-001 | Tạo ngân hàng câu hỏi mới | Role = ADMIN | 1. Chọn course<br>2. Nhập tên<br>3. Submit | Tạo thành công | High |
| QB-002 | Xem danh sách ngân hàng | - | 1. Truy cập trang | Hiển thị danh sách | High |
| QB-003 | Xem chi tiết ngân hàng | - | 1. Click vào ngân hàng | Hiển thị danh sách câu hỏi | High |
| QB-004 | Cập nhật ngân hàng | Role = ADMIN | 1. Sửa thông tin<br>2. Save | Cập nhật thành công | Medium |
| QB-005 | Xóa ngân hàng rỗng | Không có câu hỏi | 1. Click Delete | Xóa thành công | Medium |
| QB-006 | Xóa ngân hàng có câu hỏi | Có questions | 1. Click Delete | Confirm trước khi xóa | High |

---

## 5. MODULE QUESTION (CÂU HỎI)

### 5.1 CRUD Câu hỏi

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| Q-001 | Tạo câu hỏi SINGLE_CHOICE | Role = ADMIN | 1. Chọn loại<br>2. Nhập content<br>3. Thêm options (1 correct)<br>4. Save | Tạo thành công | High |
| Q-002 | Tạo câu hỏi MULTIPLE_CHOICE | Role = ADMIN | 1. Chọn loại<br>2. Thêm options (nhiều correct)<br>3. Save | Tạo thành công | High |
| Q-003 | Tạo câu hỏi TRUE_FALSE | Role = ADMIN | 1. Chọn loại<br>2. Chọn đáp án đúng | Tạo thành công | High |
| Q-004 | Tạo câu hỏi ESSAY | Role = ADMIN | 1. Chọn loại<br>2. Nhập nội dung | Tạo thành công | Medium |
| Q-005 | Tạo câu hỏi không có đáp án đúng | - | 1. Không chọn option correct | Báo lỗi validation | High |
| Q-006 | Cập nhật câu hỏi | Role = ADMIN | 1. Sửa nội dung<br>2. Save | Cập nhật thành công | High |
| Q-007 | Xóa câu hỏi chưa dùng | Không trong đề thi | 1. Click Delete | Xóa thành công | High |
| Q-008 | Xóa câu hỏi đang dùng | Đang trong exam | 1. Click Delete | Xóa hoặc báo lỗi | High |

### 5.2 Import Câu hỏi

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| Q-009 | Import từ Excel thành công | File đúng format | 1. Upload file Excel<br>2. Confirm | Import thành công | High |
| Q-010 | Import file sai format | File không đúng | 1. Upload file sai | Báo lỗi format | High |
| Q-011 | Import file có lỗi dữ liệu | Dữ liệu không hợp lệ | 1. Upload file | Báo chi tiết lỗi từng dòng | Medium |

---

## 6. MODULE EXAM (ĐỀ THI)

### 6.1 CRUD Đề thi

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| EXAM-001 | Tạo đề thi mới | Role = ADMIN | 1. Chọn course<br>2. Nhập title, duration<br>3. Chọn câu hỏi<br>4. Save | Tạo thành công | High |
| EXAM-002 | Tạo đề thi với thời gian = 0 | - | 1. Duration = 0 | Báo lỗi validation | High |
| EXAM-003 | Tạo đề thi không có câu hỏi | - | 1. Không chọn câu hỏi | Báo lỗi validation | High |
| EXAM-004 | Xem danh sách đề thi (Admin) | Role = ADMIN | 1. Truy cập trang Exams | Hiển thị tất cả đề thi | High |
| EXAM-005 | Xem danh sách đề thi (User) | Role = USER | 1. Truy cập Dashboard | Hiển thị đề thi được publish | High |
| EXAM-006 | Cập nhật đề thi | Role = ADMIN | 1. Sửa thông tin<br>2. Save | Cập nhật thành công | High |
| EXAM-007 | Publish đề thi | Role = ADMIN | 1. Click Publish | Status = PUBLISHED | High |
| EXAM-008 | Unpublish đề thi | Đang PUBLISHED | 1. Click Unpublish | Status = DRAFT | Medium |
| EXAM-009 | Xóa đề thi chưa có ai thi | Không có session | 1. Click Delete | Xóa thành công | High |
| EXAM-010 | Xóa đề thi đã có người thi | Có sessions | 1. Click Delete | Soft delete hoặc báo lỗi | High |

### 6.2 Cấu hình đề thi

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| EXAM-011 | Bật shuffle questions | - | 1. Enable shuffle questions | Câu hỏi được xáo trộn khi thi | High |
| EXAM-012 | Bật shuffle answers | - | 1. Enable shuffle answers | Đáp án được xáo trộn khi thi | High |
| EXAM-013 | Bật anti-cheat | - | 1. Enable anti-cheat | Anti-cheat hoạt động khi thi | High |
| EXAM-014 | Cấu hình số lần thi tối đa | - | 1. Set maxAttempts = 2 | User chỉ được thi tối đa 2 lần | High |
| EXAM-015 | Cấu hình điểm đạt | - | 1. Set passing score | Kết quả PASSED/FAILED dựa trên điểm | Medium |

---

## 7. MODULE EXAM SESSION (PHIÊN THI)

### 7.1 Bắt đầu thi

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| SESSION-001 | Bắt đầu thi thành công | Exam = PUBLISHED | 1. Click "Bắt đầu thi" | Tạo session, vào trang thi | High |
| SESSION-002 | Bắt đầu thi - đề chưa publish | Exam = DRAFT | 1. Truy cập URL thi | Báo lỗi "Đề thi không khả dụng" | High |
| SESSION-003 | Bắt đầu thi - hết số lần | Đã thi hết attempts | 1. Click "Bắt đầu thi" | Báo lỗi "Đã hết số lần thi" | High |
| SESSION-004 | Bắt đầu thi - đã có session | Có session IN_PROGRESS | 1. Click "Bắt đầu thi" | Resume session cũ | High |
| SESSION-005 | Race condition - click 2 lần | - | 1. Double click nhanh | Chỉ tạo 1 session | High |

### 7.2 Làm bài thi

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| SESSION-006 | Chọn đáp án single choice | Đang trong phiên thi | 1. Click option | Option được chọn | High |
| SESSION-007 | Chọn nhiều đáp án multiple choice | - | 1. Click nhiều options | Các options được chọn | High |
| SESSION-008 | Đổi đáp án | Đã chọn đáp án | 1. Click option khác | Đáp án được đổi | High |
| SESSION-009 | Navigation giữa câu hỏi | - | 1. Click Next/Prev | Chuyển câu hỏi | High |
| SESSION-010 | Jump đến câu hỏi bất kỳ | - | 1. Click số câu hỏi ở sidebar | Jump đến câu đó | Medium |
| SESSION-011 | Auto-save câu trả lời | - | Đợi 30s | Answers được save lên server | High |
| SESSION-012 | LocalStorage backup | - | 1. Trả lời câu hỏi | Answers được lưu localStorage | High |

### 7.3 Timer

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| SESSION-013 | Timer countdown | Đang thi | Quan sát timer | Timer đếm ngược chính xác | High |
| SESSION-014 | Timer sync với server | - | 1. Đợi 60s | Timer được sync với server | High |
| SESSION-015 | Auto-submit khi hết giờ | Timer = 0 | Đợi hết giờ | Tự động nộp bài | High |
| SESSION-016 | Resume - timer chính xác | Refresh trang | 1. F5 | Timer hiển thị đúng thời gian còn lại | High |

### 7.4 Nộp bài

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| SESSION-017 | Nộp bài thành công | Đã trả lời một số câu | 1. Click "Nộp bài"<br>2. Confirm | Submit thành công, tạo result | High |
| SESSION-018 | Confirm trước khi nộp | Có câu chưa trả lời | 1. Click "Nộp bài" | Hiển thị số câu chưa trả lời | High |
| SESSION-019 | Race condition - nộp 2 lần | - | 1. Double click nộp bài | Chỉ tạo 1 result (transaction) | High |
| SESSION-020 | Nộp bài sau khi hết giờ | Timer đã = 0 | 1. Click nộp bài | Báo lỗi "Đã hết thời gian" | High |
| SESSION-021 | Clear localStorage sau khi nộp | - | 1. Nộp bài xong | localStorage được clear | Medium |

### 7.5 Resume Session

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| SESSION-022 | Resume session - F5 | Đang thi | 1. F5 refresh | Resume đúng session, giữ answers | High |
| SESSION-023 | Resume - merge localStorage | localStorage có data | 1. Resume session | Answers được merge | High |
| SESSION-024 | Resume - session hết hạn | Session đã timeout | 1. Truy cập lại URL | Báo lỗi, không cho tiếp tục | High |

---

## 8. MODULE EXAM RESULT (KẾT QUẢ THI)

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| RESULT-001 | Xem kết quả sau khi nộp | Vừa nộp bài | 1. Nộp bài xong | Redirect đến trang kết quả | High |
| RESULT-002 | Hiển thị điểm số | - | 1. Xem kết quả | Hiển thị score, correct/total | High |
| RESULT-003 | Hiển thị trạng thái PASSED | Score >= passing | 1. Xem kết quả | Status = PASSED (màu xanh) | High |
| RESULT-004 | Hiển thị trạng thái FAILED | Score < passing | 1. Xem kết quả | Status = FAILED (màu đỏ) | High |
| RESULT-005 | Xem chi tiết từng câu | - | 1. Xem kết quả | Hiển thị đáp án đã chọn vs đúng | Medium |
| RESULT-006 | Xem lịch sử các lần thi | Đã thi nhiều lần | 1. Vào My Results | Hiển thị tất cả lần thi | High |
| RESULT-007 | Admin xem kết quả học sinh | Role = ADMIN | 1. Vào trang Results | Xem tất cả kết quả | High |
| RESULT-008 | Export kết quả (Admin) | Role = ADMIN | 1. Click Export | Download file Excel | Medium |

---

## 9. MODULE ANTI-CHEAT (CHỐNG GIAN LẬN)

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| AC-001 | Fullscreen mode tự động | Anti-cheat = ON | 1. Bắt đầu thi | Vào fullscreen | High |
| AC-002 | Cảnh báo thoát fullscreen | Đang fullscreen | 1. ESC | Hiển thị cảnh báo | High |
| AC-003 | Detect tab switch | Đang thi | 1. Alt+Tab | Tăng leaveScreenCount, cảnh báo | High |
| AC-004 | Detect visibility change | Đang thi | 1. Click desktop | Tăng leaveScreenCount, cảnh báo | High |
| AC-005 | Block copy | Anti-cheat = ON | 1. Ctrl+C | Không copy được | Medium |
| AC-006 | Block paste | Anti-cheat = ON | 1. Ctrl+V | Không paste được | Medium |
| AC-007 | Block right click | Anti-cheat = ON | 1. Chuột phải | Không hiện context menu | Medium |
| AC-008 | Ghi log violations | Có violations | 1. Nộp bài | leaveScreenCount được lưu | High |
| AC-009 | Anti-cheat OFF | enableAntiCheat = false | 1. Bắt đầu thi | Không có các restrictions | Medium |

---

## 10. MODULE SECURITY (BẢO MẬT)

### 10.1 Authorization

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| SEC-001 | USER truy cập trang Admin | Role = USER | 1. Truy cập /admin | Redirect về / hoặc 403 | High |
| SEC-002 | ADMIN truy cập trang Admin | Role = ADMIN | 1. Truy cập /admin | Truy cập thành công | High |
| SEC-003 | Gọi API không có token | - | 1. Gọi protected API | 401 Unauthorized | High |
| SEC-004 | Gọi API với token hết hạn | Token expired | 1. Gọi API | Auto refresh hoặc 401 | High |
| SEC-005 | USER gọi API admin-only | Role = USER | 1. POST /courses | 403 Forbidden | High |

### 10.2 Rate Limiting

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| SEC-006 | Global rate limit | - | 1. Gọi > 100 req/60s | Block (429) | High |
| SEC-007 | Login rate limit | - | 1. Login > 5 lần/60s | Block (429) | High |
| SEC-008 | Register rate limit | - | 1. Register > 3 lần/60s | Block (429) | High |

### 10.3 Data Protection

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| SEC-009 | User A xem result của User B | Different users | 1. Truy cập URL result khác | 403 Forbidden | High |
| SEC-010 | User A submit session của User B | Different users | 1. POST với session khác | 403 Forbidden | High |
| SEC-011 | Password được hash | - | Check database | Password = bcrypt hash | High |

---

## 11. MODULE UI/UX

### 11.1 Responsive

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| UI-001 | Desktop view | Màn hình >= 1024px | 1. Mở trang | Layout đúng | High |
| UI-002 | Tablet view | Màn hình 768-1023px | 1. Resize | Responsive đúng | Medium |
| UI-003 | Mobile view | Màn hình < 768px | 1. Resize | Responsive đúng | Medium |

### 11.2 Loading States

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| UI-004 | Loading khi fetch data | - | 1. Vào trang | Hiển thị loading spinner | Medium |
| UI-005 | Button loading state | Click submit | 1. Click button | Button disabled + spinner | Medium |

### 11.3 Error Handling

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| UI-006 | Toast success | Action thành công | 1. Submit form | Toast success hiển thị | Medium |
| UI-007 | Toast error | Action thất bại | 1. Submit lỗi | Toast error hiển thị | Medium |
| UI-008 | 404 page | URL không tồn tại | 1. Truy cập /xyz | Hiển thị 404 page | Low |

### 11.4 Accessibility

| ID | Test Case | Precondition | Steps | Expected Result | Priority |
|----|-----------|--------------|-------|-----------------|----------|
| UI-009 | Keyboard navigation | - | 1. Dùng Tab | Navigate được bằng keyboard | Medium |
| UI-010 | Form labels | - | Check forms | Mọi input có label | Medium |

---

## 📊 THỐNG KÊ

| Module | Số Test Cases | High Priority | Medium Priority | Low Priority |
|--------|---------------|---------------|-----------------|--------------|
| Authentication | 28 | 22 | 5 | 1 |
| User Management | 5 | 3 | 2 | 0 |
| Course | 7 | 5 | 2 | 0 |
| Question Bank | 6 | 4 | 2 | 0 |
| Question | 11 | 8 | 3 | 0 |
| Exam | 15 | 12 | 3 | 0 |
| Exam Session | 24 | 19 | 5 | 0 |
| Exam Result | 8 | 6 | 2 | 0 |
| Anti-Cheat | 9 | 5 | 4 | 0 |
| Security | 11 | 11 | 0 | 0 |
| UI/UX | 10 | 2 | 6 | 2 |
| **TỔNG** | **134** | **97** | **34** | **3** |

---

## 📝 GHI CHÚ

### Môi trường test
- **Browser:** Chrome (latest), Firefox, Safari
- **Database:** PostgreSQL (test database riêng)
- **Backend:** Node.js + NestJS
- **Frontend:** React + Vite

### Quy trình test
1. **Setup:** Clear test database, seed test data
2. **Execute:** Chạy test cases theo thứ tự priority
3. **Report:** Ghi nhận PASS/FAIL và bugs
4. **Cleanup:** Clear test data

### Template báo cáo bug
```markdown
**Bug ID:** BUG-XXX
**Test Case:** SESSION-019
**Severity:** High/Medium/Low
**Steps to Reproduce:**
1. ...
2. ...
**Expected:** ...
**Actual:** ...
**Screenshot:** [link]
**Environment:** Chrome 120, Windows 11
```

---

*Tài liệu được tạo tự động - Cập nhật: 31/01/2026*
