## 🧪 Testing the Notification System

### Backend API Endpoints (Port 8080):

- `GET /notifications/user/:userId` - Get user notifications
- `POST /notifications/mark-read/:notificationId` - Mark notification as read
- `GET /notifications/unread-count/:userId` - Get unread count
- `POST /notifications/check-upcoming-appointments` - Trigger appointment check
- `POST /notifications/appointment-created` - Create appointment notification

### Frontend Components:

1. **Notification Bell** (in navbar) - Shows unread count and dropdown
2. **Notifications Page** (doctor dashboard) - Full notification management

### How to Test:

1. **Login as a Doctor** on the frontend (http://localhost:3000)
2. **Navigate to Doctor Dashboard**
3. **Check the Notification Bell** in the navbar - it should show no notifications initially
4. **Click on "Notifications"** in the sidebar to see the full notifications page
5. **Create a Test Appointment** (if appointment creation is working)
6. **Click "Check Updates"** on the notifications page to manually trigger appointment checks

### Expected Behavior:

- ✅ Notification bell appears in navbar when logged in
- ✅ Notifications page is accessible from doctor sidebar
- ✅ When appointments are created, notifications are automatically generated
- ✅ Cron job runs every minute to check for upcoming appointments (5-minute reminders)
- ✅ Click to mark notifications as read
- ✅ Unread count updates in real-time

### Troubleshooting:

- Make sure backend is running on port 8080
- Check browser console for any API errors
- Verify user authentication is working (cookies are set)
- Check that MongoDB connection is established

The notification system is now ready for testing! 🎉
