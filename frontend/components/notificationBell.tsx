"use client";

import React, { useState, useEffect } from "react";
import { Bell, X, Clock, User, CheckCircle } from "lucide-react";
import {
  getUserNotifications,
  markNotificationAsRead,
  Notification,
} from "../api/notification";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useNotifications } from "../hooks/useNotifications";
import { unlockAudio } from "../lib/notificationSound";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onMarkAsRead: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  userId,
  onMarkAsRead,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchNotifications();
    }
  }, [isOpen, userId]);

  const fetchNotifications = async () => {
    if (!userId) return;

    console.log(
      "🔔 NotificationBell - Fetching notifications for userId:",
      userId
    );
    setLoading(true);
    try {
      const notificationData = await getUserNotifications(userId, 10, 0);
      console.log(
        "📩 NotificationBell - Received notifications:",
        notificationData.length
      );
      setNotifications(notificationData);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      // Notify parent to refresh unread count
      onMarkAsRead();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment_created":
        return <User className="w-4 h-4 text-blue-500" />;
      case "appointment_reminder":
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (time: Date) => {
    const now = new Date();
    const notificationTime = new Date(time);
    const diffInMinutes = Math.floor(
      (now.getTime() - notificationTime.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                !notification.isRead ? "bg-blue-50" : ""
              }`}
              onClick={() =>
                !notification.isRead && handleMarkAsRead(notification._id)
              }
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      !notification.isRead
                        ? "font-semibold text-gray-900"
                        : "text-gray-700"
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(notification.time)}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 text-center">
          <a
            href="/doctor/notifications"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            onClick={onClose}
          >
            View all notifications
          </a>
        </div>
      )}
    </div>
  );
};

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useCurrentUser();
  const { unreadCount, refreshUnreadCount } = useNotifications();

  // Remove duplicate polling - now using central notification system

  const handleToggle = () => {
    // Unlock audio on user interaction
    unlockAudio();

    setIsOpen(!isOpen);
    if (!isOpen) {
      // Refresh unread count when opening
      refreshUnreadCount();
    }
  };

  const handleMarkAsRead = () => {
    // Refresh unread count when a notification is marked as read
    refreshUnreadCount();
  };

  // Don't render if user is not loaded or not authenticated
  if (loading || !user) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userId={user._id}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
};

export default NotificationBell;
