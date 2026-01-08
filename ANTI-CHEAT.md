# 🔒 Hệ Thống Chống Gian Lận (Anti-Cheat System)

## Tổng quan
Hệ thống thi trực tuyến tích hợp các tính năng chống gian lận để đảm bảo tính công bằng và trung thực trong quá trình thi.

## Tính năng

### 1. **Phát hiện rời tab/cửa sổ** ✅
- **Mô tả**: Hệ thống tự động phát hiện khi thí sinh chuyển sang tab/cửa sổ khác
- **Cơ chế**: 
  - Lắng nghe sự kiện `visibilitychange` và `blur`
  - Tăng bộ đếm `leaveScreenCount` mỗi khi phát hiện
  - Hiển thị cảnh báo popup ngay lập tức
- **Lưu trữ**: Số lần vi phạm được lưu vào database (bảng `exam_results`)

### 2. **Chặn sao chép/dán** ✅  
- **Mô tả**: Vô hiệu hóa chức năng copy/paste trong khi thi
- **Cơ chế**:
  - Chặn sự kiện `copy` và `paste`
  - Hiển thị thông báo lỗi khi thí sinh cố gắng
- **Mục đích**: Ngăn chặn sao chép đề thi ra ngoài hoặc dán câu trả lời từ nguồn khác

### 3. **Vô hiệu hóa chuột phải** ✅
- **Mô tả**: Chặn menu chuột phải (context menu)
- **Cơ chế**: Chặn sự kiện `contextmenu`
- **Mục đích**: Ngăn chặn các thao tác như "Inspect Element", "View Source"

### 4. **Chế độ toàn màn hình (Fullscreen)** ✅
- **Mô tả**: Tự động bật chế độ toàn màn hình khi bắt đầu thi (nếu bật anti-cheat)
- **Cơ chế**:
  - Auto-enter fullscreen khi vào bài thi
  - Hiển thị cảnh báo nếu thoát fullscreen
  - Theo dõi sự kiện `fullscreenchange`
- **Lưu ý**: Người dùng có thể vẫn thoát fullscreen (ESC), nhưng sẽ bị cảnh báo

### 5. **Ghi log vi phạm** ✅
- **Mô tả**: Lưu trữ tất cả hành vi đáng ngờ vào database
- **Dữ liệu lưu**:
  - `leaveScreenCount`: Số lần rời tab
- **Admin**: Có thể xem báo cáo vi phạm trong trang "Kết quả thi"

## Cấu hình

### Bật/Tắt Anti-Cheat cho từng đề thi
Admin có thể bật/tắt chống gian lận khi tạo/sửa đề thi:

```typescript
{
  title: "Đề thi cuối kỳ",
  enableAntiCheat: true, // ← Bật chống gian lận
  // ... các trường khác
}
```

### Giao diện Admin
Trang **Quản lý Đề thi** → **Tạo/Sửa Đề thi**:
- ☑️ **Bật chống gian lận**: Checkbox để enable/disable

## Trải nghiệm người dùng

### Khi Anti-Cheat được BẬT:
1. **Thanh cảnh báo vàng** ở đầu trang thông báo chế độ chống gian lận đang hoạt động
2. **Tự động fullscreen** khi bắt đầu thi
3. **Popup cảnh báo** khi rời tab (hiển thị 3 giây)
4. **Số lần vi phạm** được hiển thị realtime trên thanh cảnh báo
5. **Không thể copy/paste** hay chuột phải

### Khi Anti-Cheat TẮT:
- Thi bình thường, không có hạn chế nào

## Báo cáo Admin

### Trang "Kết quả thi" (`/admin/exam-results`)
Hiển thị cột **"Vi phạm"** với:
- ⚠️ **X lần** (nếu có vi phạm) - màu vàng
- **Không** (nếu không vi phạm) - màu xám

### Ví dụ:
```
| Student      | Exam           | Score | Status | Vi phạm      | Date       |
|--------------|----------------|-------|--------|--------------|------------|
| Nguyễn A     | Đề thi cuối kỳ | 85    | PASSED | ⚠️ 3 lần    | 07/01/2026 |
| Trần B       | Đề thi giữa kỳ | 72    | PASSED | Không        | 07/01/2026 |
```

## Technical Details

### Frontend Implementation
**File**: `frontend/src/pages/user/TakeExamPage.tsx`

```typescript
// State tracking
const [leaveScreenCount, setLeaveScreenCount] = useState(0);
const [showWarning, setShowWarning] = useState(false);
const [isFullscreen, setIsFullscreen] = useState(false);

// Event listeners
useEffect(() => {
  if (!session?.exam.enableAntiCheat) return;
  
  const handleVisibilityChange = () => {
    if (document.hidden) {
      setLeaveScreenCount(prev => prev + 1);
      setShowWarning(true);
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  // ... more listeners
}, [session?.exam.enableAntiCheat]);
```

### Backend Implementation
**File**: `backend/src/exam-sessions/exam-sessions.service.ts`

```typescript
async submitExam(userId: string, submitExamDto: SubmitExamDto) {
  const { sessionId, answers, leaveScreenCount } = submitExamDto;
  
  // ... chấm điểm logic
  
  const result = await this.prisma.examResult.create({
    data: {
      // ...
      leaveScreenCount: leaveScreenCount || 0,
    },
  });
}
```

### Database Schema
**File**: `prisma/schema.prisma`

```prisma
model ExamResult {
  // ...
  leaveScreenCount Int @default(0) @map("leave_screen_count")
  // ...
}
```

## Hạn chế & Lưu ý

### Hạn chế kỹ thuật:
1. **Không thể chặn hoàn toàn**:
   - Người dùng vẫn có thể dùng điện thoại, máy tính khác
   - Có thể chụp màn hình bằng điện thoại
   - Có thể dùng máy ảo để bypass

2. **Fullscreen**:
   - Người dùng vẫn thoát được bằng ESC
   - Chỉ cảnh báo, không force

3. **Browser compatibility**:
   - Fullscreen API không được hỗ trợ đầy đủ trên Safari iOS
   - Một số event có thể không hoạt động trên trình duyệt cũ

### Best Practices:
1. ✅ **Kết hợp nhiều phương pháp**: Anti-cheat + giám sát qua camera (nếu có)
2. ✅ **Giáo dục thí sinh**: Thông báo rõ quy định trước khi thi
3. ✅ **Review kết quả**: Admin nên xem xét kỹ những thí sinh có nhiều vi phạm
4. ✅ **Đa dạng hóa đề**: Dùng random questions để mỗi người có đề khác nhau

## Demo

### Test Anti-Cheat:
1. Tạo đề thi mới với **"Bật chống gian lận"** = ✅
2. User vào thi
3. Thử các hành động:
   - Chuyển sang tab khác → Popup cảnh báo
   - Bấm Ctrl+C → Toast lỗi
   - Chuột phải → Toast lỗi
   - ESC thoát fullscreen → Toast cảnh báo
4. Nộp bài → Admin xem kết quả thấy số lần vi phạm

## Roadmap (Tương lai)

### Có thể mở rộng:
- [ ] **Webcam monitoring**: Quay video thí sinh trong khi thi
- [ ] **Screen recording**: Ghi màn hình để review sau
- [ ] **AI Face detection**: Phát hiện nhiều người trong khung hình
- [ ] **Keystroke analysis**: Phân tích pattern gõ phím
- [ ] **Browser lockdown**: Chặn tất cả ứng dụng khác khi thi
- [ ] **Eye tracking**: Theo dõi ánh mắt (cần hardware đặc biệt)

---

**Phiên bản**: 1.0  
**Ngày cập nhật**: 07/01/2026  
**Tác giả**: GitHub Copilot
