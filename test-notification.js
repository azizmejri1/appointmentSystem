const axios = require('axios');

async function createTestNotification() {
  try {
    // Create a test notification for a patient
    const response = await axios.post('http://localhost:8080/notifications/test-notification', {
      userId: '68828a93221a77604241a919', // Patient user ID
      message: 'Test Patient Notification - Your appointment reminder is working! You have an upcoming appointment.'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Patient test notification created:', response.data);
    
    // Create another test notification with appointment reminder type
    const response2 = await axios.post('http://localhost:8080/notifications/test-user-reminder', {
      userId: '68828a93221a77604241a919'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Patient appointment reminder created:', response2.data);
    
  } catch (error) {
    console.error('❌ Error creating patient test notification:', error.response?.data || error.message);
  }
}

createTestNotification();
