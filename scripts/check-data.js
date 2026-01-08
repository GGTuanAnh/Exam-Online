require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 Kiểm tra dữ liệu trong database...\n');

  // 1. Courses
  const courses = await prisma.course.findMany();
  console.log(`📚 Số lượng Khóa học: ${courses.length}`);
  courses.forEach(c => console.log(`   - ${c.name} (${c.code})`));

  // 2. Question Banks
  const questionBanks = await prisma.questionBank.findMany({
    include: { course: true }
  });
  console.log(`\n🏦 Số lượng Ngân hàng câu hỏi: ${questionBanks.length}`);
  questionBanks.forEach(qb => console.log(`   - ${qb.title} (Khóa: ${qb.course?.name || 'N/A'})`));

  // 3. Questions
  const questions = await prisma.question.findMany({
    include: { questionBank: true }
  });
  console.log(`\n❓ Số lượng Câu hỏi: ${questions.length}`);
  const groupedByBank = questions.reduce((acc, q) => {
    const bankName = q.questionBank?.title || 'Không thuộc ngân hàng';
    acc[bankName] = (acc[bankName] || 0) + 1;
    return acc;
  }, {});
  Object.entries(groupedByBank).forEach(([bank, count]) => 
    console.log(`   - ${bank}: ${count} câu`)
  );

  // 4. Exams
  const exams = await prisma.exam.findMany({
    include: { 
      course: true,
      questions: true 
    }
  });
  console.log(`\n📝 Số lượng Đề thi: ${exams.length}`);
  exams.forEach(e => console.log(`   - ${e.title} (${e.questions.length} câu hỏi)`));

  await prisma.$disconnect();
}

checkData().catch(console.error);
