import React, { useState, useEffect } from "react";
import { getUserNotifications, getUnreadCount } from "../api/notification";

const NotificationDebugger = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [userId, setUserId] = useState("");

  useEffect(() => {
    // Check localStorage for user data
    const localStorage =
      typeof window !== "undefined" ? window.localStorage : null;

    const debugData = {
      localStorage: {
        profileId: localStorage?.getItem("profileId"),
        userId: localStorage?.getItem("userId"),
        firstName: localStorage?.getItem("firstName"),
        lastName: localStorage?.getItem("lastName"),
      },
      windowLocation:
        typeof window !== "undefined" ? window.location.href : "Server side",
      environment: {
        API_URL: process.env.NEXT_PUBLIC_API_URL,
        FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
      },
    };

    setDebugInfo(debugData);
    setUserId(localStorage?.getItem("userId") || "");
  }, []);

  const testNotificationFetch = async () => {
    if (!userId) {
      alert("No user ID available");
      return;
    }

    try {
      console.log("🧪 Testing notification fetch for user:", userId);
      const notifications = await getUserNotifications(userId, 10, 0);
      const unreadCount = await getUnreadCount(userId);

      alert(
        `Fetched ${notifications.length} notifications, ${unreadCount} unread`
      );
      console.log("Notifications:", notifications);
    } catch (error) {
      console.error("Error testing notifications:", error);
      alert(
        "Error: " + (error instanceof Error ? error.message : String(error))
      );
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "#f0f0f0",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        fontSize: "12px",
        maxWidth: "400px",
        zIndex: 9999,
      }}
    >
      <h3>Notification Debug Info</h3>
      <pre style={{ whiteSpace: "pre-wrap", fontSize: "10px" }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>

      <div style={{ marginTop: "10px" }}>
        <label>
          User ID:
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ width: "100%", margin: "5px 0" }}
          />
        </label>
        <button onClick={testNotificationFetch} style={{ marginTop: "5px" }}>
          Test Notification Fetch
        </button>
      </div>
    </div>
  );
};

export default NotificationDebugger;
