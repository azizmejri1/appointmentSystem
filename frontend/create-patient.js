const axios = require('axios');

async function createPatientAndLogin() {
  try {
    console.log('🔄 Creating patient account...');
    
    // Create patient account
    const signupResponse = await axios.post('http://localhost:8080/patients/signup', {
      firstName: 'John',
      lastName: 'Smith', 
      email: 'john.smith@example.com',
      password: 'password123',
      phoneNumber: '+1234567890',
      gender: 'male'
    });

    console.log('✅ Patient created:', signupResponse.data);

    // Login to get tokens
    const loginResponse = await axios.post('http://localhost:8080/auth/login', {
      email: 'john.smith@example.com',
      password: 'password123'
    });

    console.log('✅ Login successful:', loginResponse.data);
    
    const { userId, profileId, firstName, lastName, role } = loginResponse.data;
    
    console.log('\n📋 Patient Account Details:');
    console.log(`   User ID: ${userId}`);
    console.log(`   Profile ID: ${profileId}`);
    console.log(`   Name: ${firstName} ${lastName}`);
    console.log(`   Role: ${role}`);
    console.log(`   Email: john.smith@example.com`);
    
    // Fetch patient profile
    console.log('\n🔄 Fetching patient profile...');
    const profileResponse = await axios.get(`http://localhost:8080/patients/${profileId}`);
    console.log('✅ Profile data:', JSON.stringify(profileResponse.data, null, 2));

    console.log('\n🎯 Ready to test! Open http://localhost:3000/profile in your browser');
    console.log('💡 Use these credentials to login:');
    console.log('   Email: john.smith@example.com');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createPatientAndLogin();
