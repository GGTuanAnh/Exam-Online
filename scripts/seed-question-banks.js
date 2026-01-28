require('dotenv').config();
const { PrismaClient, QuestionType, QuestionLevel } = require('@prisma/client');

const prisma = new PrismaClient();

// --- BỘ DỮ LIỆU CÂU HỎI THỰC TẾ (SAMPLE CHO CÁC MÔN CỐT LÕI) ---
// Bạn có thể mở rộng danh sách này
const REAL_QUESTIONS = {
  'CSE703008': { // Cơ sở dữ liệu
    EASY: [
      { content: 'SQL là viết tắt của từ gì?', options: ['Structured Query Language', 'Strong Question Language', 'Structured Question List', 'Simple Query Language'], correct: 0 },
      { content: 'Câu lệnh nào dùng để lấy dữ liệu từ bảng?', options: ['GET', 'EXTRACT', 'SELECT', 'PULL'], correct: 2 },
      { content: 'Khóa chính (Primary Key) có đặc điểm gì?', options: ['Có thể trùng lặp', 'Có thể NULL', 'Duy nhất và không NULL', 'Duy nhất và có thể NULL'], correct: 2 },
      { content: 'RDBMS là viết tắt của?', options: ['Relational Database Management System', 'Real Database Modeling System', 'Rapid Database Management System', 'Relational Data Model System'], correct: 0 },
      { content: 'Câu lệnh DELETE dùng để làm gì?', options: ['Xóa bảng', 'Xóa CSDL', 'Xóa dòng dữ liệu', 'Xóa cột'], correct: 2 },
    ],
    MEDIUM: [
      { content: 'Để kết hợp dữ liệu từ 2 bảng dựa trên điều kiện chung, ta dùng?', options: ['COMBINE', 'JOIN', 'MERGE', 'CONNECT'], correct: 1 },
      { content: 'Dạng chuẩn 3NF yêu cầu điều gì?', options: ['Đạt 2NF và không có phụ thuộc bắc cầu', 'Dữ liệu không trùng lặp', 'Mỗi cột chứa 1 giá trị đơn', 'Có khóa chính'], correct: 0 },
      { content: 'Hàm nào đếm số lượng bản ghi?', options: ['SUM()', 'TOTAL()', 'COUNT()', 'NUMBER()'], correct: 2 },
      { content: 'Transaction (Giao dịch) trong CSDL cần đảm bảo tính chất nào?', options: ['ACID', 'BASE', 'SOLID', 'CRUD'], correct: 0 },
    ],
    HARD: [
      { content: 'Phantom Read là hiện tượng gì trong Transaction?', options: ['Đọc dữ liệu chưa commit', 'Đọc dữ liệu bị sửa đổi bởi transaction khác', 'Một transaction đọc các dòng thỏa mãn điều kiện, nhưng transaction khác chèn thêm dòng mới', 'Không đọc được dữ liệu'], correct: 2 },
      { content: 'Trong chỉ mục B-Tree, độ phức tạp tìm kiếm trung bình là?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correct: 1 },
      { content: 'Sự khác biệt chính giữa WHERE và HAVING là gì?', options: ['WHERE dùng cho nhóm, HAVING dùng cho dòng', 'WHERE dùng trước GROUP BY, HAVING dùng sau GROUP BY', 'Không có khác biệt', 'HAVING nhanh hơn WHERE'], correct: 1 },
    ],
  },
  'CSE703038': { // Lập trình C
    EASY: [
      { content: 'Hàm chính trong chương trình C là?', options: ['start()', 'main()', 'init()', 'program()'], correct: 1 },
      { content: 'Để in ra màn hình trong C, ta dùng?', options: ['cin', 'printf', 'System.out.println', 'print'], correct: 1 },
      { content: 'Kiểu dữ liệu `int` thường chiếm bao nhiêu byte?', options: ['1 byte', '2 byte', '4 byte', '8 byte'], correct: 2 },
    ],
    MEDIUM: [
      { content: 'Con trỏ (Pointer) lưu trữ giá trị gì?', options: ['Giá trị của biến', 'Địa chỉ bộ nhớ của biến', 'Tên biến', 'Kiểu dữ liệu'], correct: 1 },
      { content: 'Kết quả của 5 / 2 trong C là bao nhiêu (nếu chia số nguyên)?', options: ['2.5', '2', '2.0', '3'], correct: 1 },
    ],
    HARD: [
      { content: 'Lỗi Segmentation Fault thường xảy ra khi nào?', options: ['Chia cho 0', 'Truy cập vùng nhớ không được phép', 'Đặt tên biến sai', 'Thiếu dấu chấm phẩy'], correct: 1 },
      { content: 'Từ khóa `static` trước biến toàn cục có ý nghĩa gì?', options: ['Giữ giá trị sau khi hàm kết thúc', 'Giới hạn phạm vi biến trong file hiện tại', 'Làm biến không thể thay đổi', 'Không có ý nghĩa'], correct: 1 },
    ]
  }
};

// --- HÀM TẠO CÂU HỎI GIẢ LẬP (NẾU KHÔNG CÓ DỮ LIỆU THỰC) ---
function generateMockQuestions(courseName, level, count, existingRealCount = 0) {
  const questions = [];
  const realCountNeeded = Math.max(0, count - existingRealCount);
  
  for (let i = 0; i < realCountNeeded; i++) {
    const num = existingRealCount + i + 1;
    let content = '';
    let options = [];
    
    // Tạo nội dung câu hỏi "trông có vẻ thật" dựa trên môn học và độ khó
    if (level === 'EASY') {
      content = `[${courseName}] Câu hỏi cơ bản số ${num}: Khái niệm nào sau đây là đúng về nhập môn ${courseName}?`;
      options = [
        { content: `Là kiến thức nền tảng quan trọng của ${courseName}`, isCorrect: true },
        { content: `Là một khái niệm sai về ${courseName}`, isCorrect: false },
        { content: `Không liên quan đến ${courseName}`, isCorrect: false },
        { content: `Là phương pháp nâng cao`, isCorrect: false },
      ];
    } else if (level === 'MEDIUM') {
      content = `[${courseName}] Câu hỏi vận dụng số ${num}: Khi giải quyết bài toán X trong ${courseName}, phương pháp nào tối ưu nhất?`;
      options = [
        { content: `Sử dụng giải thuật tham lam`, isCorrect: false },
        { content: `Áp dụng quy trình chuẩn của ${courseName}`, isCorrect: true },
        { content: `Bỏ qua các bước phân tích`, isCorrect: false },
        { content: `Dùng phương pháp thử sai ngẫu nhiên`, isCorrect: false },
      ];
    } else { // HARD
      content = `[${courseName}] Câu hỏi nâng cao số ${num}: Phân tích tình huống ngoại lệ Y trong hệ thống ${courseName}?`;
      options = [
        { content: `Hệ thống sẽ dừng hoạt động ngay lập tức`, isCorrect: false },
        { content: `Cần xử lý bất đồng bộ và tối ưu bộ nhớ`, isCorrect: true },
        { content: `Không ảnh hưởng gì đến hiệu năng`, isCorrect: false },
        { content: `Chỉ xảy ra ở môi trường lý tưởng`, isCorrect: false },
      ];
    }

    questions.push({
      content,
      type: 'SINGLE_CHOICE',
      level: level,
      options: options
    });
  }
  return questions;
}

async function seedQuestionBanks() {
  console.log('🚀 BẮT ĐẦU TẠO DỮ LIỆU CÂU HỎI LỚN (50/50/50)...\n');

  // 1. Lấy tất cả môn học
  const courses = await prisma.course.findMany();
  if (courses.length === 0) {
    console.log('❌ Chưa có môn học nào. Vui lòng chạy "node scripts/add-courses.js" trước.');
    return;
  }
  console.log(`📚 Tìm thấy ${courses.length} môn học.`);

  // Cấu hình số lượng
  const TARGET_COUNTS = {
    EASY: 50,
    MEDIUM: 50,
    HARD: 50
  };

  for (const course of courses) {
    console.log(`\n📦 Xử lý môn: ${course.code} - ${course.name}`);

    // Tạo (hoặc lấy) Ngân hàng câu hỏi
    // Ta tạo 1 ngân hàng "Chung" cho môn này để chứa hết 150 câu
    let bank = await prisma.questionBank.findFirst({
      where: { 
        courseId: course.id,
        name: `Ngân hàng câu hỏi tổng hợp - ${course.name}` 
      }
    });

    if (!bank) {
      bank = await prisma.questionBank.create({
        data: {
          name: `Ngân hàng câu hỏi tổng hợp - ${course.name}`,
          description: `Ngân hàng dữ liệu đầy đủ 150 câu cho môn ${course.name}`,
          courseId: course.id,
          totalQuestions: 0 // Sẽ update sau
        }
      });
      console.log(`   + Đã tạo ngân hàng mới.`);
    }

    // Lấy dữ liệu thực nếu có
    const realData = REAL_QUESTIONS[course.code] || { EASY: [], MEDIUM: [], HARD: [] };

    // Xử lý từng level
    for (const level of ['EASY', 'MEDIUM', 'HARD']) {
      // Đếm số câu hiện có của level này trong bank này
      const currentCount = await prisma.question.count({
        where: {
          questionBankId: bank.id,
          level: level
        }
      });

      if (currentCount >= TARGET_COUNTS[level]) {
        console.log(`   ✅ Level ${level}: Đã đủ ${currentCount} câu.`);
        continue;
      }

      console.log(`   ⏳ Level ${level}: Đang tạo thêm ${TARGET_COUNTS[level] - currentCount} câu...`);

      // 1. Thêm câu hỏi thực (nếu chưa thêm)
      const realQuestions = realData[level] || [];
      const questionsToAdd = [];

      // Logic: Nếu số câu hiện có < số câu thực -> thêm câu thực còn thiếu
      // Sau đó nếu vẫn thiếu -> thêm câu mock
      
      // Đơn giản hóa: Thêm câu hỏi thực vào danh sách chờ insert (nếu database trống thì insert hết)
      // Để tránh trùng lặp phức tạp, ở đây ta sẽ dùng mock generator cho phần thiếu hụt
      // TRỪ KHI ta đang chạy lần đầu.
      
      // Kết hợp Real + Mock
      const realQToAdd = realQuestions.slice(currentCount); // Chỉ lấy những câu chưa (giả định insert tuần tự)
      
      // Map Real Questions sang format chung
      realQToAdd.forEach(q => {
        questionsToAdd.push({
          content: q.content,
          type: 'SINGLE_CHOICE',
          level: level,
          options: q.options.map((optContent, idx) => ({
            content: optContent,
            isCorrect: idx === q.correct
          }))
        });
      });

      // Sinh thêm Mock Questions nếu chưa đủ
      const remainingNeeded = TARGET_COUNTS[level] - currentCount - questionsToAdd.length;
      if (remainingNeeded > 0) {
        // Ta truyền vào (currentCount + questionsToAdd.length) để đánh số tiếp theo
        const mocks = generateMockQuestions(course.name, level, remainingNeeded, currentCount + questionsToAdd.length);
        questionsToAdd.push(...mocks);
      }

      // Thực hiện Insert (Batch hoặc loop)
      // Prisma createMany không hỗ trợ nested relation (options), nên phải loop create
      let savedCount = 0;
      for (const q of questionsToAdd) {
        await prisma.question.create({
          data: {
            content: q.content,
            type: q.type,
            level: q.level,
            questionBankId: bank.id,
            options: {
              create: q.options
            }
          }
        });
        savedCount++;
        if (savedCount % 10 === 0) process.stdout.write('.'); // Loading effect
      }
      console.log(` -> Xong!`);
    }
    
    // Update total count
    const total = await prisma.question.count({ where: { questionBankId: bank.id } });
    await prisma.questionBank.update({
      where: { id: bank.id },
      data: { totalQuestions: total }
    });
  }

  console.log('\n✨ HOÀN THÀNH TẤT CẢ!');
}

seedQuestionBanks()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
