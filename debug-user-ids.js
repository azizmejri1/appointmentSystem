// Debug script to check user IDs and test notification API
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function checkNotifications() {
  console.log('🔍 Debugging user IDs and notifications...\n');

  // Test the user IDs we know from backend logs
  const doctorUserId = '68828a93221a77604241a919';
  const patientUserId = '688286c9221a77604241a868';

  console.log('Backend User IDs:');
  console.log('Doctor User ID:', doctorUserId);
  console.log('Patient User ID:', patientUserId);
  console.log('');

  // Test notifications for doctor
  try {
    console.log('📱 Fetching notifications for DOCTOR...');
    const doctorResponse = await axios.get(`${API_BASE_URL}/notifications/user/${doctorUserId}`);
    console.log(`Doctor notifications (${doctorResponse.data.length}):`, 
      doctorResponse.data.map(n => ({
        id: n._id,
        message: n.message.substring(0, 50) + '...',
        type: n.type,
        isRead: n.isRead,
        time: n.time
      }))
    );
    console.log('');
  } catch (error) {
    console.error('❌ Error fetching doctor notifications:', error.message);
  }

  // Test notifications for patient
  try {
    console.log('📱 Fetching notifications for PATIENT...');
    const patientResponse = await axios.get(`${API_BASE_URL}/notifications/user/${patientUserId}`);
    console.log(`Patient notifications (${patientResponse.data.length}):`, 
      patientResponse.data.map(n => ({
        id: n._id,
        message: n.message.substring(0, 50) + '...',
        type: n.type,
        isRead: n.isRead,
        time: n.time
      }))
    );
    console.log('');
  } catch (error) {
    console.error('❌ Error fetching patient notifications:', error.message);
  }

  // Test unread counts
  try {
    console.log('📊 Checking unread counts...');
    const doctorUnread = await axios.get(`${API_BASE_URL}/notifications/unread-count/${doctorUserId}`);
    const patientUnread = await axios.get(`${API_BASE_URL}/notifications/unread-count/${patientUserId}`);
    
    console.log('Doctor unread count:', doctorUnread.data.unreadCount);
    console.log('Patient unread count:', patientUnread.data.unreadCount);
    console.log('');
  } catch (error) {
    console.error('❌ Error fetching unread counts:', error.message);
  }
}

checkNotifications().catch(console.error);
