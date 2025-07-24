const axios = require('axios');

async function testProfileUpdate() {
  try {
    console.log('🔄 Testing profile update functionality...');
    
    const profileId = '6881705174a34f1efb1ac77f'; // From the script output above
    
    // Test updating the profile
    const updateData = {
      firstName: 'Jonathan',
      lastName: 'Smith-Updated',
      phoneNumber: '+1234567899',
      gender: 'male'
    };

    console.log('📤 Sending update request:', updateData);
    
    const updateResponse = await axios.put(`http://localhost:8080/patients/${profileId}`, updateData);
    console.log('✅ Update successful:', updateResponse.data);

    // Fetch updated profile to verify
    console.log('\n🔄 Fetching updated profile...');
    const profileResponse = await axios.get(`http://localhost:8080/patients/${profileId}`);
    console.log('✅ Updated profile:', JSON.stringify(profileResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testProfileUpdate();
