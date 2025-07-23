"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Clock,
  User,
  CheckCircle,
  RefreshCw,
  Volume2,
} from "lucide-react";
import {
  getUserNotifications,
  markNotificationAsRead,
  triggerUpcomingAppointmentCheck,
  Notification,
} from "../../../api/notification";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { useNotifications } from "../../../hooks/useNotifications";
import {
  playNotificationSound,
  playNotificationSoundManual,
} from "../../../lib/notificationSound";

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useCurrentUser();
  const { unreadCount, refreshUnreadCount, notificationTrigger } =
    useNotifications();

  const fetchNotifications = useCallback(async () => {
    if (!user?._id) return;

    console.log(
      "📋 NotificationsPage - Fetching notifications for user._id:",
      user._id
    );
    setLoading(true);
    try {
      const notificationData = await getUserNotifications(user._id, 50, 0);
      console.log(
        "📬 NotificationsPage - Received notifications:",
        notificationData.length
      );
      setNotifications(notificationData);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    }
  }, [user?._id, fetchNotifications]);

  // Re-fetch notifications when new notifications are detected
  useEffect(() => {
    if (notificationTrigger > 0) {
      console.log(
        "📋 New notification trigger detected, refreshing notification list..."
      );
      fetchNotifications();
    }
  }, [notificationTrigger, fetchNotifications]);

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
      await refreshUnreadCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);

    try {
      await Promise.all(
        unreadNotifications.map((notification) =>
          markNotificationAsRead(notification._id)
        )
      );
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
      await refreshUnreadCount();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleTriggerCheck = async () => {
    setRefreshing(true);
    try {
      await triggerUpcomingAppointmentCheck();
      await fetchNotifications();
      await refreshUnreadCount();
    } catch (error) {
      console.error("Error triggering appointment check:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment_created":
        return <User className="w-5 h-5 text-blue-500" />;
      case "appointment_reminder":
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
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
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return formatDate(notificationTime);
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Please log in to view notifications.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "All caught up!"}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={async () => {
              console.log("🧪 Testing notification sound from button...");
              await playNotificationSoundManual();
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Volume2 className="w-4 h-4" />
            <span>Test Sound</span>
          </button>
          <button
            onClick={handleTriggerCheck}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Check Updates</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
            <p>
              You'll see notifications here when patients book appointments or
              when you have upcoming appointments.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.isRead
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
                onClick={() =>
                  !notification.isRead && handleMarkAsRead(notification._id)
                }
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
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
                      <div className="flex items-center space-x-2">
                        {notification.type === "appointment_created" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            New Appointment
                          </span>
                        )}
                        {notification.type === "appointment_reminder" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Reminder
                          </span>
                        )}
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
