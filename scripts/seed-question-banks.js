require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedQuestionBanks() {
  console.log('🌱 Tạo dữ liệu mẫu: Ngân hàng câu hỏi + Câu hỏi\n');

  // 1. Lấy courses
  const courses = await prisma.course.findMany();
  if (courses.length === 0) {
    console.log('❌ Không có khóa học nào. Vui lòng chạy scripts/add-courses.js trước');
    process.exit(1);
  }

  console.log(`📚 Tìm thấy ${courses.length} khóa học\n`);

  for (const course of courses) {
    console.log(`\n📦 Tạo ngân hàng câu hỏi cho: ${course.name}`);

    // Kiểm tra xem đã có ngân hàng chưa
    const existing1 = await prisma.questionBank.findFirst({
      where: {
        name: `Ngân hàng câu hỏi ${course.name} - Phần 1`,
        courseId: course.id
      }
    });

    const bank1 = existing1 || await prisma.questionBank.create({
      data: {
        name: `Ngân hàng câu hỏi ${course.name} - Phần 1`,
        description: `Câu hỏi cơ bản về ${course.name}`,
        courseId: course.id,
      }
    });
    console.log(`   ${existing1 ? '⏭️' : '✅'} ${bank1.name}`);

    const existing2 = await prisma.questionBank.findFirst({
      where: {
        name: `Ngân hàng câu hỏi ${course.name} - Phần 2`,
        courseId: course.id
      }
    });

    const bank2 = existing2 || await prisma.questionBank.create({
      data: {
        name: `Ngân hàng câu hỏi ${course.name} - Phần 2`,
        description: `Câu hỏi nâng cao về ${course.name}`,
        courseId: course.id,
      }
    });
    console.log(`   ${existing2 ? '⏭️' : '✅'} ${bank2.name}`);

    // Kiểm tra đã có câu hỏi chưa
    const existingQuestionsCount = await prisma.question.count({
      where: { questionBankId: bank1.id }
    });

    if (existingQuestionsCount === 0) {
      // Tạo câu hỏi mẫu cho bank 1
      const sampleQuestions = [
        {
          content: `Khái niệm cơ bản nhất về ${course.name} là gì?`,
          options: [
            { content: `${course.name} là một môn học nghiên cứu về lý thuyết và thực hành`, isCorrect: true },
            { content: 'Là một công cụ phần mềm dùng trong doanh nghiệp', isCorrect: false },
            { content: 'Là một phương pháp giải trí và nghỉ ngơi', isCorrect: false },
            { content: 'Là một loại ngôn ngữ lập trình mới', isCorrect: false },
          ]
        },
        {
          content: `Mục tiêu chính khi học ${course.name} là gì?`,
          options: [
            { content: 'Để thi lấy điểm cao', isCorrect: false },
            { content: `Nắm vững kiến thức nền tảng và ứng dụng thực tế`, isCorrect: true },
            { content: 'Để hoàn thành chương trình đào tạo', isCorrect: false },
            { content: 'Để có thêm bằng cấp', isCorrect: false },
          ]
        },
        {
          content: `Phương pháp học tập hiệu quả cho ${course.name}?`,
          options: [
            { content: 'Chỉ đọc giáo trình một lần', isCorrect: false },
            { content: 'Học thuộc lòng tất cả công thức', isCorrect: false },
            { content: `Kết hợp lý thuyết với thực hành và làm bài tập thường xuyên`, isCorrect: true },
            { content: 'Chỉ nghe giảng trên lớp', isCorrect: false },
          ]
        },
        {
          content: `Ứng dụng thực tế của ${course.name} trong đời sống?`,
          options: [
            { content: 'Không có ứng dụng thực tế nào', isCorrect: false },
            { content: 'Chỉ dùng trong nghiên cứu học thuật', isCorrect: false },
            { content: 'Chỉ dùng trong các công ty công nghệ lớn', isCorrect: false },
            { content: `Áp dụng rộng rãi trong nhiều lĩnh vực công việc và cuộc sống`, isCorrect: true },
          ]
        },
        {
          content: `Yếu tố quan trọng nhất khi học ${course.name}?`,
          options: [
            { content: 'Có máy tính cấu hình cao', isCorrect: false },
            { content: `Sự kiên trì, luyện tập thường xuyên và tư duy logic`, isCorrect: true },
            { content: 'Học nhiều ngôn ngữ lập trình', isCorrect: false },
            { content: 'Biết nhiều công thức toán học phức tạp', isCorrect: false },
          ]
        }
      ];

      for (let i = 0; i < sampleQuestions.length; i++) {
        const q = sampleQuestions[i];
        await prisma.question.create({
          data: {
            content: q.content,
            type: 'SINGLE_CHOICE',
            level: 'EASY',
            questionBankId: bank1.id,
            options: {
              create: q.options
            }
          }
        });
      }
      console.log(`   ✅ Đã tạo 5 câu hỏi EASY cho Phần 1`);
    } else {
      console.log(`   ⏭️  Phần 1 đã có ${existingQuestionsCount} câu hỏi`);
    }

    // Tạo câu hỏi cho bank 2
    const existingQuestionsCount2 = await prisma.question.count({
      where: { questionBankId: bank2.id }
    });

    if (existingQuestionsCount2 === 0) {
      const advancedQuestions = [
        {
          content: `Phân tích ưu điểm của ${course.name} trong thực tế (chọn tất cả đáp án đúng)?`,
          options: [
            { content: `Giúp phát triển tư duy logic và phân tích vấn đề`, isCorrect: true },
            { content: `Ứng dụng được trong nhiều lĩnh vực khác nhau`, isCorrect: true },
            { content: 'Không cần học thêm kiến thức bổ trợ', isCorrect: false },
            { content: `Xây dựng nền tảng cho các môn học nâng cao`, isCorrect: true },
          ]
        },
        {
          content: `Những kỹ năng nào cần thiết để học tốt ${course.name} (chọn nhiều đáp án)?`,
          options: [
            { content: `Khả năng tư duy trừu tượng và logic`, isCorrect: true },
            { content: 'Biết sử dụng photoshop', isCorrect: false },
            { content: `Kỹ năng giải quyết vấn đề và tư duy phản biện`, isCorrect: true },
            { content: `Khả năng tự học và nghiên cứu tài liệu`, isCorrect: true },
          ]
        },
        {
          content: `Đâu là những thách thức khi học ${course.name} (chọn tất cả đáp án đúng)?`,
          options: [
            { content: `Lượng kiến thức lớn cần nắm vững`, isCorrect: true },
            { content: 'Cần có máy tính đắt tiền', isCorrect: false },
            { content: `Đòi hỏi thực hành nhiều và kiên trì`, isCorrect: true },
            { content: `Cần liên tục cập nhật kiến thức mới`, isCorrect: true },
          ]
        },
        {
          content: `Phương pháp nào giúp nâng cao kỹ năng ${course.name} (nhiều đáp án)?`,
          options: [
            { content: `Làm bài tập và dự án thực tế`, isCorrect: true },
            { content: 'Chỉ xem video hướng dẫn', isCorrect: false },
            { content: `Tham gia các nhóm học tập và thảo luận`, isCorrect: true },
            { content: `Đọc tài liệu chuyên sâu và nghiên cứu case study`, isCorrect: true },
          ]
        },
        {
          content: `Lợi ích dài hạn khi thành thạo ${course.name} (chọn nhiều đáp án)?`,
          options: [
            { content: `Cơ hội việc làm rộng mở trong nhiều ngành nghề`, isCorrect: true },
            { content: 'Được miễn thi các môn học khác', isCorrect: false },
            { content: `Nền tảng vững chắc cho sự nghiệp chuyên môn`, isCorrect: true },
            { content: `Khả năng tư duy và giải quyết vấn đề tốt hơn`, isCorrect: true },
          ]
        }
      ];

      for (let i = 0; i < advancedQuestions.length; i++) {
        const q = advancedQuestions[i];
        await prisma.question.create({
          data: {
            content: q.content,
            type: 'MULTIPLE_CHOICE',
            level: 'HARD',
            questionBankId: bank2.id,
            options: {
              create: q.options
            }
          }
        });
      }
      console.log(`   ✅ Đã tạo 5 câu hỏi HARD cho Phần 2`);
    } else {
      console.log(`   ⏭️  Phần 2 đã có ${existingQuestionsCount2} câu hỏi`);
    }
  }

  console.log('\n✅ Hoàn thành! Đã tạo ngân hàng câu hỏi và câu hỏi mẫu');
  await prisma.$disconnect();
}

seedQuestionBanks().catch((e) => {
  console.error(e);
  process.exit(1);
});
