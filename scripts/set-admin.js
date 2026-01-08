// Script để đổi role user thành ADMIN
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setAdmin(email) {
  if (!email) {
    console.log('❌ Usage: node scripts/set-admin.js <email>');
    console.log('   Example: node scripts/set-admin.js testadmin@test.com');
    process.exit(1);
  }

  console.log(`🔍 Tìm user với email: ${email}\n`);

  try {
    // Tìm user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ Không tìm thấy user với email: ${email}`);
      process.exit(1);
    }

    console.log('📋 Thông tin user hiện tại:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.fullName || user.firstName + ' ' + user.lastName || 'N/A'}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive ? '✅' : '❌'}\n`);

    if (user.role === 'ADMIN') {
      console.log('✅ User đã là ADMIN rồi!');
      process.exit(0);
    }

    // Update role và activate
    const updated = await prisma.user.update({
      where: { email },
      data: {
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Đã cập nhật thành công!\n');
    console.log('📋 Thông tin user sau khi update:');
    console.log(`   Email: ${updated.email}`);
    console.log(`   Name: ${updated.fullName || updated.firstName + ' ' + updated.lastName || 'N/A'}`);
    console.log(`   Role: ${updated.role}`);
    console.log(`   Active: ${updated.isActive ? '✅' : '❌'}`);
    
    console.log('\n🎉 Bây giờ bạn có thể login với:');
    console.log(`   Email: ${updated.email}`);
    console.log(`   Role: ADMIN`);

    // List all users
    console.log('\n📋 Tất cả users:');
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    allUsers.forEach((u, i) => {
      const name = u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : 'N/A';
      console.log(`   ${i + 1}. ${u.email} - ${u.role} ${u.isActive ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
setAdmin(email);
