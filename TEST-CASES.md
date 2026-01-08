# 🧪 Test Cases - Hệ Thống Thi Trực Tuyến

## 1. Authentication & Authorization

### TC-AUTH-001: Đăng nhập với Google OAuth
**Mục đích**: Kiểm tra chức năng đăng nhập qua Google  
**Điều kiện tiên quyết**: Có tài khoản Google hợp lệ  
**Các bước thực hiện**:
1. Truy cập `/login`
2. Click nút "Đăng nhập bằng Google"
3. Chọn tài khoản Google
4. Cho phép quyền truy cập

**Kết quả mong đợi**:
- ✅ Redirect về trang chủ phù hợp với role (Admin → `/admin`, User → `/`)
- ✅ Token được lưu vào sessionStorage
- ✅ Hiển thị tên/email người dùng ở header

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-AUTH-002: Auto logout khi đóng browser
**Mục đích**: Đảm bảo sessionStorage xóa token khi đóng trình duyệt  
**Điều kiện tiên quyết**: Đã đăng nhập  
**Các bước thực hiện**:
1. Đăng nhập thành công
2. Đóng toàn bộ browser (không chỉ tab)
3. Mở lại browser
4. Truy cập trang chủ

**Kết quả mong đợi**:
- ✅ Redirect về `/login`
- ✅ sessionStorage trống

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-AUTH-003: Phân quyền Admin/User
**Mục đích**: Kiểm tra routing dựa trên role  
**Điều kiện tiên quyết**: Có tài khoản Admin và User  
**Các bước thực hiện**:
1. **Với User**: Đăng nhập → Truy cập `/admin/users`
2. **Với Admin**: Đăng nhập → Truy cập `/admin/users`

**Kết quả mong đợi**:
- ✅ User: Redirect về `/` hoặc 403 Forbidden
- ✅ Admin: Hiển thị trang quản lý users

**Kết quả thực tế**: _[Ghi chú khi test]_

---

## 2. Quản Lý Đề Thi (Admin)

### TC-EXAM-001: Tạo đề thi mới
**Mục đích**: Admin tạo đề thi với ngân hàng câu hỏi  
**Điều kiện tiên quyết**: Đã có khóa học và ngân hàng câu hỏi  
**Các bước thực hiện**:
1. Admin → `/admin/exams` → Click "Tạo đề thi mới"
2. Nhập thông tin:
   - **Tiêu đề**: "Đề thi cuối kỳ JavaScript"
   - **Mô tả**: "Kiểm tra kiến thức JS cơ bản"
   - **Khóa học**: Chọn "JavaScript Cơ Bản"
   - **Ngân hàng câu hỏi**: Chọn bank có sẵn
   - **Thời gian**: 60 phút
   - **Điểm đạt**: 50
   - **Số câu dễ**: 5
   - **Số câu khó**: 5
   - **Bật chống gian lận**: ✅
3. Click "Tạo đề thi"

**Kết quả mong đợi**:
- ✅ Toast thông báo thành công
- ✅ Đề thi xuất hiện trong danh sách
- ✅ Có đủ 10 câu hỏi (5 dễ + 5 khó)

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-EXAM-002: Chọn ngân hàng câu hỏi theo khóa học
**Mục đích**: Dropdown ngân hàng chỉ hiển thị theo khóa học đã chọn  
**Điều kiện tiên quyết**: Có nhiều khóa học với ngân hàng khác nhau  
**Các bước thực hiện**:
1. Vào trang tạo đề thi
2. Chọn **Khóa học A**
3. Mở dropdown **Ngân hàng câu hỏi**
4. Đổi sang **Khóa học B**
5. Kiểm tra dropdown lại

**Kết quả mong đợi**:
- ✅ Bước 3: Chỉ hiển thị ngân hàng của Khóa học A
- ✅ Bước 5: Dropdown reset, chỉ hiển thị ngân hàng của Khóa học B

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-EXAM-003: Validation khi tạo đề thi
**Mục đích**: Đảm bảo các trường bắt buộc được validate  
**Điều kiện tiên quyết**: Vào trang tạo đề thi  
**Các bước thực hiện**:
1. Để trống tất cả các trường
2. Click "Tạo đề thi"
3. Nhập chỉ tiêu đề, bỏ qua khóa học
4. Click "Tạo đề thi"

**Kết quả mong đợi**:
- ✅ Bước 2: Hiển thị lỗi validation "Tiêu đề là bắt buộc", "Khóa học là bắt buộc", etc.
- ✅ Bước 4: Hiển thị lỗi "Vui lòng chọn khóa học"

**Kết quả thực tế**: _[Ghi chú khi test]_

---

## 3. Làm Bài Thi (User)

### TC-TAKE-001: Bắt đầu bài thi
**Mục đích**: User vào thi và nhận session  
**Điều kiện tiên quyết**: Có đề thi available  
**Các bước thực hiện**:
1. User đăng nhập → Vào trang chủ
2. Click "Bắt đầu thi" trên một đề thi
3. Xác nhận popup (nếu có)

**Kết quả mong đợi**:
- ✅ Redirect sang `/take-exam/:examId`
- ✅ Hiển thị câu hỏi đầu tiên
- ✅ Timer đếm ngược bắt đầu
- ✅ Thanh tiến độ hiển thị 1/10

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-TAKE-002: Trả lời câu hỏi single choice
**Mục đích**: Chọn đáp án cho câu hỏi 1 đáp án  
**Điều kiện tiên quyết**: Đang trong bài thi  
**Các bước thực hiện**:
1. Ở câu hỏi single choice
2. Chọn đáp án A
3. Chọn đáp án B (ghi đè)
4. Click "Câu tiếp theo"

**Kết quả mong đợi**:
- ✅ Bước 2: Radio button A được check
- ✅ Bước 3: Radio button B được check, A bỏ check
- ✅ Bước 4: Chuyển sang câu 2, câu 1 đã lưu đáp án B

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-TAKE-003: Trả lời câu hỏi multiple choice
**Mục đích**: Chọn nhiều đáp án cho câu hỏi khó  
**Điều kiện tiên quyết**: Đang ở câu hỏi HARD (multiple choice)  
**Các bước thực hiện**:
1. Chọn checkbox A
2. Chọn checkbox C
3. Bỏ chọn A
4. Chọn D
5. Click "Câu tiếp theo"

**Kết quả mong đợi**:
- ✅ Có thể chọn nhiều checkbox cùng lúc
- ✅ Bước 5: Lưu đáp án C và D

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-TAKE-004: Auto-save câu trả lời
**Mục đích**: Hệ thống tự động lưu sau mỗi 30 giây  
**Điều kiện tiên quyết**: Đang làm bài thi  
**Các bước thực hiện**:
1. Trả lời câu 1
2. Đợi 30 giây
3. Kiểm tra console hoặc Network tab

**Kết quả mong đợi**:
- ✅ Console log "Auto-saved answers"
- ✅ Network có request POST `/exam-sessions/save-answers`

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-TAKE-005: Hết giờ tự động nộp bài
**Mục đích**: Khi timer = 0, tự động submit  
**Điều kiện tiên quyết**: Đang làm bài thi (có thể set duration ngắn để test)  
**Các bước thực hiện**:
1. Vào bài thi có thời gian ngắn (VD: 1 phút)
2. Không làm gì, đợi hết giờ
3. Quan sát hành vi

**Kết quả mong đợi**:
- ✅ Timer về 00:00
- ✅ Tự động submit bài thi
- ✅ Redirect sang trang kết quả

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-TAKE-006: Navigate giữa các câu hỏi
**Mục đích**: Kiểm tra nút điều hướng  
**Điều kiện tiên quyết**: Đang làm bài thi  
**Các bước thực hiện**:
1. Ở câu 1 → Click "Câu tiếp theo"
2. Ở câu 2 → Click "Câu trước"
3. Ở câu 1 → Click "Câu trước" (edge case)
4. Ở câu 10 → Click "Câu tiếp theo" (edge case)

**Kết quả mong đợi**:
- ✅ Bước 1: Chuyển sang câu 2
- ✅ Bước 2: Quay lại câu 1
- ✅ Bước 3: Vẫn ở câu 1 (hoặc nút disable)
- ✅ Bước 4: Vẫn ở câu 10 (hoặc nút disable)

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-TAKE-007: Nộp bài thành công
**Mục đích**: Submit bài thi và xem kết quả  
**Điều kiện tiên quyết**: Đã trả lời ít nhất 1 câu  
**Các bước thực hiện**:
1. Click "Nộp bài"
2. Xác nhận popup
3. Đợi chấm điểm

**Kết quả mong đợi**:
- ✅ Hiển thị popup xác nhận
- ✅ Loading spinner khi đang chấm
- ✅ Redirect sang trang kết quả
- ✅ Hiển thị điểm số, trạng thái PASSED/FAILED

**Kết quả thực tế**: _[Ghi chú khi test]_

---

## 4. Anti-Cheat System

### TC-ANTICHEAT-001: Phát hiện chuyển tab
**Mục đích**: Hệ thống đếm số lần rời tab  
**Điều kiện tiên quyết**: Đề thi có bật anti-cheat  
**Các bước thực hiện**:
1. Bắt đầu thi (đề có enableAntiCheat = true)
2. Quan sát thanh cảnh báo vàng "Chế độ chống gian lận đang hoạt động"
3. Bấm Alt+Tab chuyển sang ứng dụng khác
4. Quay lại trang thi
5. Lặp lại 2 lần nữa (tổng 3 lần)
6. Nộp bài

**Kết quả mong đợi**:
- ✅ Bước 2: Thanh cảnh báo vàng hiển thị
- ✅ Bước 4: Popup cảnh báo "⚠️ Phát hiện rời khỏi màn hình thi!"
- ✅ Bước 4: Thanh info hiển thị "Vi phạm: 1 lần"
- ✅ Bước 5: "Vi phạm: 3 lần"
- ✅ Bước 6: Admin thấy cột "Vi phạm" = "⚠️ 3 lần"

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-ANTICHEAT-002: Chặn copy/paste
**Mục đích**: Ngăn sao chép đề thi  
**Điều kiện tiên quyết**: Đang thi với anti-cheat ON  
**Các bước thực hiện**:
1. Bôi đen text câu hỏi
2. Bấm Ctrl+C
3. Bấm Ctrl+V vào ô input (nếu có)

**Kết quả mong đợi**:
- ✅ Bước 2: Toast lỗi "Không được phép sao chép nội dung trong khi thi"
- ✅ Bước 3: Toast lỗi "Không được phép dán nội dung trong khi thi"

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-ANTICHEAT-003: Chặn chuột phải
**Mục đích**: Vô hiệu hóa context menu  
**Điều kiện tiên quyết**: Đang thi với anti-cheat ON  
**Các bước thực hiện**:
1. Click chuột phải vào bất kỳ đâu
2. Thử click chuột phải vào câu hỏi

**Kết quả mong đợi**:
- ✅ Toast lỗi "Chuột phải đã bị vô hiệu hóa"
- ✅ Context menu không hiển thị

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-ANTICHEAT-004: Fullscreen mode
**Mục đích**: Tự động vào fullscreen khi thi  
**Điều kiện tiên quyết**: Đề thi có anti-cheat  
**Các bước thực hiện**:
1. Click "Bắt đầu thi"
2. Đợi trang load
3. Bấm ESC để thoát fullscreen
4. Quan sát thông báo

**Kết quả mong đợi**:
- ✅ Bước 2: Tự động vào fullscreen
- ✅ Bước 4: Toast "⚠️ Vui lòng quay lại chế độ toàn màn hình!"
- ✅ Có thể thoát được (không force)

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-ANTICHEAT-005: Không có anti-cheat
**Mục đích**: Kiểm tra khi tắt anti-cheat  
**Điều kiện tiên quyết**: Đề thi có enableAntiCheat = false  
**Các bước thực hiện**:
1. Bắt đầu thi
2. Chuyển tab
3. Copy/paste
4. Chuột phải

**Kết quả mong đợi**:
- ✅ Không có thanh cảnh báo vàng
- ✅ Không vào fullscreen
- ✅ Không có popup cảnh báo
- ✅ Có thể copy/paste bình thường
- ✅ Chuột phải hoạt động bình thường

**Kết quả thực tế**: _[Ghi chú khi test]_

---

## 5. Kết Quả Thi

### TC-RESULT-001: Xem kết quả cá nhân (User)
**Mục đích**: User xem kết quả bài thi của mình  
**Điều kiện tiên quyết**: Đã nộp bài thi  
**Các bước thực hiện**:
1. Vào `/my-results`
2. Tìm bài thi vừa làm
3. Click "Xem chi tiết"

**Kết quả mong đợi**:
- ✅ Danh sách hiển thị tất cả bài thi đã làm
- ✅ Hiển thị điểm số, trạng thái PASSED/FAILED
- ✅ Chi tiết: Xem từng câu hỏi, đáp án đúng/sai

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-RESULT-002: Admin xem kết quả tất cả thí sinh
**Mục đích**: Admin theo dõi vi phạm  
**Điều kiện tiên quyết**: Có user đã thi (có vi phạm)  
**Các bước thực hiện**:
1. Admin → `/admin/exam-results`
2. Tìm bài thi có `leaveScreenCount > 0`
3. Kiểm tra cột "Vi phạm"

**Kết quả mong đợi**:
- ✅ Hiển thị danh sách tất cả kết quả
- ✅ Cột "Vi phạm" hiển thị "⚠️ X lần" (màu vàng) hoặc "Không" (xám)
- ✅ Có thể filter/sort theo vi phạm (tùy chọn)

**Kết quả thực tế**: _[Ghi chú khi test]_

---

## 6. Ngân Hàng Câu Hỏi

### TC-QB-001: Tạo câu hỏi dễ (EASY)
**Mục đích**: Thêm câu hỏi single choice  
**Điều kiện tiên quyết**: Có ngân hàng câu hỏi  
**Các bước thực hiện**:
1. Admin → `/admin/questions` → "Tạo câu hỏi mới"
2. Nhập:
   - **Ngân hàng**: Chọn bank
   - **Nội dung**: "JavaScript là gì?"
   - **Độ khó**: EASY
   - **Đáp án A**: "Ngôn ngữ lập trình" (✅ Đúng)
   - **Đáp án B**: "Framework"
   - **Đáp án C**: "Database"
   - **Đáp án D**: "OS"
3. Click "Tạo câu hỏi"

**Kết quả mong đợi**:
- ✅ Toast thành công
- ✅ Câu hỏi xuất hiện trong danh sách
- ✅ Chỉ cho phép chọn 1 đáp án đúng

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-QB-002: Tạo câu hỏi khó (HARD)
**Mục đích**: Thêm câu hỏi multiple choice  
**Điều kiện tiên quyết**: Có ngân hàng câu hỏi  
**Các bước thực hiện**:
1. Tương tự TC-QB-001 nhưng chọn **Độ khó = HARD**
2. Đánh dấu đúng 2-3 đáp án

**Kết quả mong đợi**:
- ✅ Cho phép chọn nhiều đáp án đúng
- ✅ Khi user làm bài, hiển thị checkbox thay vì radio

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-QB-003: Seed data 770 câu hỏi
**Mục đích**: Tạo dữ liệu mẫu  
**Điều kiện tiên quyết**: Đã có 77 khóa học  
**Các bước thực hiện**:
```bash
node scripts/seed-question-banks.js
```

**Kết quả mong đợi**:
- ✅ Tạo 154 ngân hàng (2 bank/course)
- ✅ Tạo 770 câu hỏi (5 EASY + 5 HARD mỗi bank)
- ✅ Nội dung câu hỏi realistic, không phải "Đáp án A", "Đáp án B"

**Kết quả thực tế**: _[Ghi chú khi test]_

---

## 7. Edge Cases & Error Handling

### TC-EDGE-001: Refresh trang trong khi thi
**Mục đích**: Kiểm tra trạng thái session sau F5  
**Điều kiện tiên quyết**: Đang làm bài thi, đã trả lời 5/10 câu  
**Các bước thực hiện**:
1. Trả lời câu 1-5
2. Bấm F5
3. Kiểm tra trạng thái

**Kết quả mong đợi**:
- ✅ Session vẫn còn (nếu dùng sessionStorage)
- ✅ Câu trả lời đã lưu vẫn hiển thị
- ✅ Timer tiếp tục đếm (hoặc reset - tùy logic)

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-EDGE-002: Thi 2 lần cùng đề
**Mục đích**: Kiểm tra logic tạo session mới  
**Điều kiện tiên quyết**: Đã thi 1 lần  
**Các bước thực hiện**:
1. Làm bài thi lần 1 → Nộp bài
2. Quay lại trang chủ
3. Click "Bắt đầu thi" lại đề cũ
4. Kiểm tra câu hỏi

**Kết quả mong đợi**:
- ✅ Tạo session mới (ID khác)
- ✅ Câu hỏi random lại (nếu có logic random)
- ✅ Timer reset về ban đầu

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-EDGE-003: Không đủ câu hỏi trong bank
**Mục đích**: Xử lý khi yêu cầu 10 câu nhưng bank chỉ có 5  
**Điều kiện tiên quyết**: Tạo ngân hàng chỉ có 3 câu hỏi  
**Các bước thực hiện**:
1. Admin tạo đề thi yêu cầu 5 câu dễ + 5 câu khó
2. Nhưng bank chỉ có 3 câu

**Kết quả mong đợi**:
- ✅ Backend trả lỗi 400 "Không đủ câu hỏi"
- ✅ Frontend hiển thị toast lỗi rõ ràng

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-EDGE-004: Network error khi submit
**Mục đích**: Xử lý lỗi mạng  
**Điều kiện tiên quyết**: Đang làm bài thi  
**Các bước thực hiện**:
1. Tắt backend server
2. Click "Nộp bài"

**Kết quả mong đợi**:
- ✅ Loading spinner dừng
- ✅ Toast lỗi "Không thể nộp bài, vui lòng thử lại"
- ✅ Không mất dữ liệu câu trả lời

**Kết quả thực tế**: _[Ghi chú khi test]_

---

## 8. Performance & UX

### TC-PERF-001: Load time trang chủ
**Mục đích**: Đo thời gian load danh sách đề thi  
**Công cụ**: Chrome DevTools → Network tab  
**Các bước thực hiện**:
1. Clear cache
2. Truy cập `/` (đã đăng nhập)
3. Đo thời gian từ request đến render

**Kết quả mong đợi**:
- ✅ < 2 giây cho lần đầu
- ✅ < 500ms cho lần sau (cache)

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-PERF-002: Chuyển câu hỏi mượt mà
**Mục đích**: Không bị lag khi navigate  
**Các bước thực hiện**:
1. Click "Câu tiếp theo" 10 lần liên tục

**Kết quả mong đợi**:
- ✅ Chuyển câu < 100ms
- ✅ UI không bị giật lag

**Kết quả thực tế**: _[Ghi chú khi test]_

---

## 9. Browser Compatibility

### TC-COMPAT-001: Chrome
**Browser**: Chrome 131+  
**OS**: Windows/Mac/Linux  
**Các chức năng test**: Đăng nhập, Thi, Anti-cheat, Fullscreen  
**Kết quả**: _[PASS/FAIL]_

---

### TC-COMPAT-002: Firefox
**Browser**: Firefox 133+  
**OS**: Windows/Mac/Linux  
**Lưu ý**: Fullscreen API có thể khác  
**Kết quả**: _[PASS/FAIL]_

---

### TC-COMPAT-003: Edge
**Browser**: Edge 131+  
**OS**: Windows  
**Kết quả**: _[PASS/FAIL]_

---

### TC-COMPAT-004: Safari (Mobile)
**Browser**: Safari iOS 18+  
**Lưu ý**: Fullscreen không hỗ trợ tốt  
**Kết quả**: _[PASS/FAIL với ghi chú]_

---

## 10. Security

### TC-SEC-001: JWT Token expiration
**Mục đích**: Kiểm tra refresh token flow  
**Các bước thực hiện**:
1. Đăng nhập → Lấy access token (expires 15m)
2. Đợi 16 phút
3. Gọi API bất kỳ

**Kết quả mong đợi**:
- ✅ Auto refresh token thành công
- ✅ Hoặc redirect về login nếu refresh token hết hạn

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-SEC-002: SQL Injection prevention
**Mục đích**: Đảm bảo Prisma escape input  
**Các bước thực hiện**:
1. Tạo câu hỏi với nội dung: `'; DROP TABLE users; --`
2. Lưu và kiểm tra DB

**Kết quả mong đợi**:
- ✅ Lưu thành công với nội dung y nguyên
- ✅ Không thực thi SQL command

**Kết quả thực tế**: _[Ghi chú khi test]_

---

### TC-SEC-003: XSS prevention
**Mục đích**: Không render script tags  
**Các bước thực hiện**:
1. Tạo câu hỏi: `<script>alert('XSS')</script>`
2. User làm bài thi, xem câu hỏi đó

**Kết quả mong đợi**:
- ✅ Hiển thị text thuần, không execute script
- ✅ React tự động escape HTML

**Kết quả thực tế**: _[Ghi chú khi test]_

---

## Tổng Kết

**Tổng số test cases**: 40+  
**Độ ưu tiên**:
- 🔴 **Critical** (P0): AUTH, TAKE-EXAM, SUBMIT, ANTICHEAT
- 🟡 **High** (P1): EXAM CRUD, RESULTS, QUESTION BANKS
- 🟢 **Medium** (P2): EDGE CASES, PERFORMANCE
- 🔵 **Low** (P3): BROWSER COMPAT, ADVANCED FEATURES

**Báo cáo kết quả**:
```
| Module          | Pass | Fail | Skip | Coverage |
|-----------------|------|------|------|----------|
| Authentication  | __   | __   | __   | __%      |
| Exam Management | __   | __   | __   | __%      |
| Take Exam       | __   | __   | __   | __%      |
| Anti-Cheat      | __   | __   | __   | __%      |
| Results         | __   | __   | __   | __%      |
| Question Banks  | __   | __   | __   | __%      |
| Edge Cases      | __   | __   | __   | __%      |
| Performance     | __   | __   | __   | __%      |
| Security        | __   | __   | __   | __%      |
| **TOTAL**       | __   | __   | __   | __%      |
```

---

**Người test**: _[Tên]_  
**Ngày test**: _[DD/MM/YYYY]_  
**Version**: v1.0.0  
**Environment**: Development / Staging / Production
