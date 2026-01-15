# Hướng dẫn sửa bug Exam Content

## Vấn đề
Câu hỏi không hiển thị nội dung khi làm bài (chỉ thấy số thứ tự và đáp án trống).

## Nguyên nhân
Code hiện tại:
```typescript
).map(eq => ({
  ...eq,
  question: {
    ...eq.question,
    correctAnswer: undefined,
    options: eq.question.options,
  },
}));
```

Vấn đề: `correctAnswer: undefined` có thể bị serialize sai, làm mất data.

## Giải pháp

### Bước 1: Mở file
```
backend/src/exam-sessions/exam-sessions.service.ts
```

### Bước 2: Tìm và thay thế (2 chỗ)

**Chỗ 1: Dòng ~87-95** (ongoing session)
**Chỗ 2: Dòng ~129-137** (new session)

**Tìm:**
```typescript
).map(eq => ({
  ...eq,
  question: {
    ...eq.question,
    correctAnswer: undefined, // Hide correct answer
    options: eq.question.options,
  },
}));
```

**Thay bằng:**
```typescript
).map(eq => {
  const { correctAnswer, ...questionData } = eq.question;
  return {
    ...eq,
    question: {
      ...questionData,
      options: eq.question.options.map(({ isCorrect, ...opt }) => opt),
    },
  };
});
```

### Bước 3: Lưu file

### Bước 4: Push code
```bash
git add backend/src/exam-sessions/exam-sessions.service.ts
git commit -m "Fix: Properly exclude correctAnswer while preserving question content"
git push origin main
```

### Bước 5: Đợi deploy (2-3 phút)

### Bước 6: Test
1. Vào trang làm bài
2. Kiểm tra câu hỏi hiển thị đầy đủ content
3. Kiểm tra đáp án hiển thị text
4. Verify không thấy đáp án đúng

## Giải thích code mới

```typescript
const { correctAnswer, ...questionData } = eq.question;
```
- Tách `correctAnswer` ra khỏi object
- `questionData` chứa tất cả fields còn lại (id, content, type, options...)

```typescript
options: eq.question.options.map(({ isCorrect, ...opt }) => opt)
```
- Loại bỏ `isCorrect` khỏi mỗi option
- Giữ lại `id`, `text`

## Kết quả mong đợi

✅ Câu hỏi hiển thị đầy đủ nội dung
✅ Đáp án hiển thị text
❌ Không thấy đáp án đúng (correctAnswer)
❌ Không thấy isCorrect flag
