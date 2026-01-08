// Script để xem tất cả users trong DB
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('📋 Danh sách tất cả users trong hệ thống:\n');
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      provider: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  if (users.length === 0) {
    console.log('  (Chưa có user nào trong database)');
    return;
  }

  users.forEach((user, idx) => {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'N/A';
    const status = user.isActive ? '✅ Active' : '❌ Inactive';
    
    console.log(`${idx + 1}. ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username || 'N/A'}`);
    console.log(`   Name: ${fullName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${status}`);
    console.log(`   Provider: ${user.provider}`);
    console.log(`   Created: ${user.createdAt.toLocaleString('vi-VN')}`);
    console.log('');
  });

  console.log(`\nTổng cộng: ${users.length} user(s)`);
  console.log(`  - Admin: ${users.filter(u => u.role === 'ADMIN').length}`);
  console.log(`  - User: ${users.filter(u => u.role === 'USER').length}`);
  console.log(`  - Active: ${users.filter(u => u.isActive).length}`);
  console.log(`  - Inactive: ${users.filter(u => !u.isActive).length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
