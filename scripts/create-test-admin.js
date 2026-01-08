// Script để tạo test admin user
const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function createTestAdmin() {
  console.log('🔧 Creating test admin user...\n');
  
  const testUser = {
    email: 'testadmin@test.com',
    password: 'Test123456',
    fullName: 'Test Admin',
  };
  
  try {
    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('✅ User created successfully!');
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Password:', testUser.password);
    console.log('\n📋 Response:', JSON.stringify(response.data, null, 2));
    
    console.log('\n⚠️  Note: You may need to verify email or change role to ADMIN in database');
    console.log('   Run: node scripts/set-admin.js testadmin@test.com');
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

createTestAdmin();
