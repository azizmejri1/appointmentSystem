import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { getUnreadCount } from "../api/notification";
import { useCurrentUser } from "./useCurrentUser";
import { playNotificationSound, unlockAudio } from "../lib/notificationSound";

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  playSound: () => void;
  notificationTrigger: number; // Simple trigger to cause re-renders
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationTrigger, setNotificationTrigger] = useState(0); // Simple trigger for re-renders
  const { user } = useCurrentUser();

  const refreshUnreadCount = async () => {
    if (!user?._id) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await getUnreadCount(user._id);

      console.log("🔔 Notification count check:", {
        newCount: count,
        currentUnreadCount: unreadCount,
      });

      // Play sound ONLY when count increases (new notifications arrived)
      if (count > unreadCount && count > 0) {
        console.log("🔊 New notification detected! Playing sound once...");
        playNotificationSound();

        // Trigger re-render for notification components
        setNotificationTrigger((prev) => prev + 1);
      }

      // Update counts
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const playSound = useCallback(() => {
    playNotificationSound();
  }, []);

  // Poll for new notifications every 5 seconds
  useEffect(() => {
    if (!user?._id) return;

    // Initialize audio on first load
    unlockAudio();

    // Initial fetch
    refreshUnreadCount();

    const interval = setInterval(refreshUnreadCount, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [user?._id]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        refreshUnreadCount,
        playSound,
        notificationTrigger,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
