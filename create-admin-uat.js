// Quick script to create admin user for UAT
// Run: node create-admin-uat.js

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function createAdmin() {
    const email = 'admin@edu.vn';
    const password = '123';

    // Check if exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log('✅ Admin already exists:', email);
        // Update to ensure active
        await prisma.user.update({
            where: { email },
            data: { isActive: true, password: await bcrypt.hash(password, 10) }
        });
        console.log('✅ Password updated to: 123');
        process.exit(0);
    }

    // Create new admin
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            isActive: true,
            provider: 'local'
        }
    });

    console.log('✅ Admin created!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', user.role);

    await prisma.$disconnect();
}

createAdmin().catch(console.error);
