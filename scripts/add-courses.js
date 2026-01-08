// Script để thêm các môn học vào database
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const courses = [
  { code: 'FFS703007', name: 'Đại số tuyến tính', credits: 3 },
  { code: 'FFS702001', name: 'Pháp luật đại cương', credits: 2 },
  { code: 'CSE703024', name: 'Toán rời rạc', credits: 3 },
  { code: 'FFS704016', name: 'Vật lý cho công nghệ thông tin', credits: 4 },
  { code: 'FFS703008', name: 'Giải tích', credits: 3 },
  { code: 'CSE702003', name: 'Nhập môn Khoa học dữ liệu và trí tuệ nhân tạo', credits: 2 },
  { code: 'FFS703002', name: 'Triết học Mác - Lê nin', credits: 3 },
  { code: 'FFS703010', name: 'Lý thuyết xác suất thống kê', credits: 3 },
  { code: 'FEL703002', name: 'Tiếng Anh 2', credits: 3 },
  { code: 'FEL702003', name: 'Tiếng Anh 3', credits: 2 },
  { code: 'FFS702004', name: 'Chủ nghĩa xã hội khoa học', credits: 2 },
  { code: 'FEL703001', name: 'Tiếng Anh 1', credits: 3 },
  { code: 'FFS702003', name: 'Kinh tế chính trị Mác - Lênin', credits: 2 },
  { code: 'FFS702006', name: 'Tư tưởng Hồ Chí Minh', credits: 2 },
  { code: 'FFS702005', name: 'Lịch sử Đảng cộng sản Việt Nam', credits: 2 },
  { code: 'CSE703052', name: 'Thuật toán ứng dụng', credits: 3 },
  { code: 'CSE703057', name: 'Tối ưu hóa', credits: 3 },
  { code: 'CSE703066', name: 'Xử lý tín hiệu số cho công nghệ thông tin', credits: 3 },
  { code: 'CSE702040', name: 'Nhập môn Công nghệ thông tin', credits: 2 },
  { code: 'EEE703044', name: 'Kỹ thuật số', credits: 3 },
  { code: 'CSE703038', name: 'Ngôn ngữ lập trình C', credits: 3 },
  { code: 'CSE703006', name: 'Cấu trúc dữ liệu và thuật toán', credits: 3 },
  { code: 'CSE703008', name: 'Cơ sở dữ liệu', credits: 3 },
  { code: 'CSE702017', name: 'Hệ điều hành', credits: 2 },
  { code: 'CSE703023', name: 'Kiến trúc máy tính', credits: 3 },
  { code: 'CSE702036', name: 'Mạng máy tính', credits: 2 },
  { code: 'CSE703029', name: 'Lập trình hướng đối tượng', credits: 3 },
  { code: 'EEE703068', name: 'Thị giác máy tính', credits: 3 },
  { code: 'CSE702011', name: 'Điện toán đám mây', credits: 2 },
  { code: 'CSE702025', name: 'Kỹ thuật phần mềm', credits: 2 },
  { code: 'CSE703064', name: 'Xây dựng ứng dụng web', credits: 3 },
  { code: 'CSE703004', name: 'An toàn và bảo mật thông tin', credits: 3 },
  { code: 'CSE703007', name: 'Chương trình dịch', credits: 3 },
  { code: 'CSE703048', name: 'Phân tích và thiết kế phần mềm', credits: 3 },
  { code: 'CSE702027', name: 'Lập trình cho thiết bị di động', credits: 2 },
  { code: 'FBE702001', name: 'Quản trị học', credits: 2 },
  { code: 'CSE702117', name: 'Kỹ năng viết và thuyết trình bằng Tiếng Anh', credits: 2 },
  { code: 'FTS702003', name: 'Kỹ năng đàm phán, thương lượng', credits: 2 },
  { code: 'FTS702001', name: 'Kỹ năng khởi nghiệp và lãnh đạo', credits: 2 },
  { code: 'FTS702002', name: 'Kỹ năng quản lý dự án', credits: 2 },
  { code: 'FTS702004', name: 'Kỹ năng tư duy sáng tạo và phản biện', credits: 2 },
  { code: 'CSE702026', name: 'Lập trình C nâng cao', credits: 2 },
  { code: 'CSE703018', name: 'Hệ nhúng', credits: 3 },
  { code: 'CSE703010', name: 'Đánh giá và kiểm định chất lượng phần mềm', credits: 3 },
  { code: 'CSE702063', name: 'Ứng dụng phân tán', credits: 2 },
  { code: 'CSE702051', name: 'Thiết kế web nâng cao', credits: 2 },
  { code: 'CSE702033', name: 'Lập trình trò chơi', credits: 2 },
  { code: 'CSE702049', name: 'Quản trị dự án công nghệ thông tin', credits: 2 },
  { code: 'CSE702005', name: 'Bảo mật ứng dụng và hệ thống', credits: 2 },
  { code: 'CSE703009', name: 'Công nghệ .Net', credits: 3 },
  { code: 'CSE703015', name: 'Đồ hoạ máy tính và thực tế ảo', credits: 3 },
  { code: 'CSE703016', name: 'Giao diện người máy', credits: 3 },
  { code: 'CSE702060', name: 'Trực quan hoá dữ liệu', credits: 2 },
  { code: 'CSE702022', name: 'Khai phá dữ liệu', credits: 2 },
  { code: 'CSE703054', name: 'Tích hợp và phân tích dữ liệu lớn', credits: 3 },
  { code: 'CSE703037', name: 'Mạng nơron và học sâu', credits: 3 },
  { code: 'CSE703032', name: 'Lập trình song song', credits: 3 },
  { code: 'CSE702043', name: 'Phân tích dữ liệu', credits: 2 },
  { code: 'CSE702031', name: 'Lập trình phân tích dữ liệu với Python', credits: 2 },
  { code: 'CSE702046', name: 'Phân tích nghiệp vụ kinh doanh', credits: 2 },
  { code: 'CSE703065', name: 'Xử lý ngôn ngữ tự nhiên', credits: 3 },
  { code: 'CSE703112', name: 'Bảo mật hệ thống', credits: 3 },
  { code: 'CSE703102', name: 'Thương mại điện tử', credits: 3 },
  { code: 'FKL703097', name: 'Tiếng Hàn IT 2', credits: 3 },
  { code: 'FKL703096', name: 'Tiếng Hàn IT 1', credits: 3 },
  { code: 'CSE703134', name: 'Xử lý dữ liệu GIS thông minh', credits: 3 },
  { code: 'CSE702013', name: 'Đồ án cơ sở', credits: 2 },
  { code: 'CSE702053', name: 'Thực tập công nghiệp', credits: 2 },
  { code: 'CSE703014', name: 'Đồ án liên ngành', credits: 3 },
  { code: 'CSE704067', name: 'Thực tập tốt nghiệp', credits: 4 },
  { code: 'CSE710068', name: 'Đồ án tốt nghiệp', credits: 10 },
  { code: 'FFS708066', name: 'Giáo dục quốc phòng - an ninh', credits: 8 },
  { code: 'BS11012', name: 'Giáo dục thể chất 1', credits: 1 },
  { code: 'BS11013', name: 'Giáo dục thể chất 2', credits: 1 },
  { code: 'BS12006', name: 'Giáo dục thể chất 3', credits: 2 },
];

async function main() {
  console.log('🚀 Bắt đầu thêm các môn học vào database...\n');

  let added = 0;
  let skipped = 0;
  let errors = 0;

  for (const course of courses) {
    try {
      // Kiểm tra xem môn học đã tồn tại chưa
      const existing = await prisma.course.findUnique({
        where: { code: course.code }
      });

      if (existing) {
        console.log(`⏭️  Bỏ qua: ${course.code} - ${course.name} (đã tồn tại)`);
        skipped++;
        continue;
      }

      // Thêm môn học mới
      await prisma.course.create({
        data: {
          code: course.code,
          name: course.name,
          description: `Môn học thuộc Khoa Công nghệ thông tin`,
          credits: course.credits,
        }
      });

      console.log(`✅ Đã thêm: ${course.code} - ${course.name} (${course.credits} tín chỉ)`);
      added++;

    } catch (err) {
      console.error(`❌ Lỗi khi thêm ${course.code}:`, err.message);
      errors++;
    }
  }

  console.log('\n📊 Kết quả:');
  console.log(`   ✅ Đã thêm: ${added} môn học`);
  console.log(`   ⏭️  Bỏ qua: ${skipped} môn học (đã tồn tại)`);
  console.log(`   ❌ Lỗi: ${errors} môn học`);
  console.log(`\n✨ Hoàn thành! Tổng cộng có ${added + skipped} môn học trong database.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
