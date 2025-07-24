"use client";
import { useState, useEffect } from "react";
import ScheduleCalendar from "../components/ScheduleCalendar";
import Sidebar from "../components/Sidebar";
import Statistics from "../components/statistics";
import AppointmentsList from "../components/AppointmentsList";
import Patients from "../components/patients";
import WaitingList from "../components/WaitingList";
import Settings from "../components/settings";
import Notifications from "../components/Notifications";
import { NotificationProvider } from "../../../hooks/useNotifications";

export default function Dashboard() {
  const [activeItem, setActiveItem] = useState<string>("dashboard");

  useEffect(() => {
    const getTitleByActiveItem = (item: string) => {
      switch (item) {
        case "dashboard":
          return "Dashboard - MedSchedule Doctor";
        case "statistics":
          return "Statistics - MedSchedule Doctor";
        case "appointments":
          return "Appointments - MedSchedule Doctor";
        case "patients":
          return "Patients - MedSchedule Doctor";
        case "notifications":
          return "Notifications - MedSchedule Doctor";
        case "settings":
          return "Settings - MedSchedule Doctor";
        case "waiting-list":
          return "Waiting List - MedSchedule Doctor";
        default:
          return "Dashboard - MedSchedule Doctor";
      }
    };

    document.title = getTitleByActiveItem(activeItem);
  }, [activeItem]);

  const renderContent = () => {
    switch (activeItem) {
      case "dashboard":
        return <ScheduleCalendar />;
      case "statistics":
        return <Statistics />;
      case "appointments":
        return <AppointmentsList />;
      case "patients":
        return <Patients />;
      case "notifications":
        return <Notifications />;
      case "settings":
        return <Settings />;
      case "waiting-list":
        return <WaitingList />;
      default:
        return <ScheduleCalendar />;
    }
  };

  return (
    <NotificationProvider>
      <div className="flex">
        <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />
        <div className="flex-1">{renderContent()}</div>
      </div>
    </NotificationProvider>
  );
}
