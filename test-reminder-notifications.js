// Test if reminder notifications were actually created
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080';

async function testReminderNotifications() {
  console.log('🔍 Testing reminder notifications...\n');

  const doctorUserId = '68828a93221a77604241a919';
  const patientUserId = '688286c9221a77604241a868';

  try {
    // Check doctor notifications (reminder target)
    console.log('📱 Checking doctor notifications...');
    const doctorResponse = await axios.get(`${API_BASE_URL}/notifications/user/${doctorUserId}`);
    
    const reminderNotifications = doctorResponse.data.filter(n => n.type === 'appointment_reminder');
    console.log(`Doctor has ${reminderNotifications.length} reminder notifications:`);
    
    reminderNotifications.forEach(notification => {
      console.log(`  - ${notification.message}`);
      console.log(`    Created: ${notification.time}`);
      console.log(`    Read: ${notification.isRead}`);
      console.log('');
    });

    // Check patient notifications (reminder target) 
    console.log('📱 Checking patient notifications...');
    const patientResponse = await axios.get(`${API_BASE_URL}/notifications/user/${patientUserId}`);
    
    const patientReminderNotifications = patientResponse.data.filter(n => n.type === 'appointment_reminder');
    console.log(`Patient has ${patientReminderNotifications.length} reminder notifications:`);
    
    patientReminderNotifications.forEach(notification => {
      console.log(`  - ${notification.message}`);
      console.log(`    Created: ${notification.time}`);
      console.log(`    Read: ${notification.isRead}`);
      console.log('');
    });

    // Test unread counts
    const doctorUnread = await axios.get(`${API_BASE_URL}/notifications/unread-count/${doctorUserId}`);
    const patientUnread = await axios.get(`${API_BASE_URL}/notifications/unread-count/${patientUserId}`);
    
    console.log('📊 Unread counts:');
    console.log(`Doctor: ${doctorUnread.data.unreadCount}`);
    console.log(`Patient: ${patientUnread.data.unreadCount}`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testReminderNotifications();
