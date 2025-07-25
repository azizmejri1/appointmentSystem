import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export interface Notification {
  _id: string;
  message: string;
  time: Date;
  type: 'appointment_created' | 'appointment_reminder' | 'general';
  relatedId?: string;
  isRead: boolean;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  notification?: Notification;
  notifications?: Notification[];
  unreadCount?: number;
}

// Get notifications for the current user
export const getUserNotifications = async (userId: string, limit = 20, offset = 0): Promise<Notification[]> => {
  try {
    console.log("🌐 API - Fetching notifications:", { userId, limit, offset, apiUrl: API_BASE_URL });
    const response = await api.get(`/notifications/user/${userId}?limit=${limit}&offset=${offset}`);
    console.log("🌐 API - Response status:", response.status);
    console.log("🌐 API - Response data:", response.data);
    return response.data || [];
  } catch (error) {
    console.error('❌ API - Error fetching notifications:', error);
    throw error;
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<NotificationResponse> => {
  try {
    const response = await api.post(`/notifications/mark-read/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    console.log("🌐 API - Fetching unread count for userId:", userId);
    const response = await api.get(`/notifications/unread-count/${userId}`);
    console.log("🌐 API - Unread count response:", response.data);
    return response.data.unreadCount || 0;
  } catch (error) {
    console.error('❌ API - Error fetching unread count:', error);
    return 0;
  }
};

// Manually trigger upcoming appointment check (for testing)
export const triggerUpcomingAppointmentCheck = async (): Promise<NotificationResponse> => {
  try {
    const response = await api.post('/notifications/check-upcoming-appointments');
    return response.data;
  } catch (error) {
    console.error('Error triggering appointment check:', error);
    throw error;
  }
};
