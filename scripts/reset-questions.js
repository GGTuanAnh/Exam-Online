require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetQuestions() {
  console.log('🗑️  Xóa tất cả câu hỏi và đáp án cũ...\n');

  try {
    // Xóa các bảng theo thứ tự (tránh lỗi foreign key)
    await prisma.examResultDetail.deleteMany({});
    console.log('✅ Đã xóa exam result details');
    
    await prisma.examQuestion.deleteMany({});
    console.log('✅ Đã xóa exam questions');
    
    await prisma.questionOption.deleteMany({});
    console.log('✅ Đã xóa question options');
    
    await prisma.question.deleteMany({});
    console.log('✅ Đã xóa questions');
    
    console.log('\n✅ Hoàn thành! Đã xóa sạch dữ liệu câu hỏi cũ');
    console.log('💡 Bây giờ chạy: node scripts/seed-question-banks.js để tạo lại với nội dung mới');
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetQuestions();
