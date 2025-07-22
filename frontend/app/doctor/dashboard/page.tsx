"use client";
import { useState } from "react";
import ScheduleCalendar from "../components/ScheduleCalendar";
import Sidebar from "../components/Sidebar";
import Statistics from "../components/statistics";
import AppointmentsList from "../components/AppointmentsList";
import Patients from "../components/patients";
import WaitingList from "../components/WaitingList";

const Settings = () => <div className="p-8 text-xl">Settings Component</div>;

export default function Dashboard() {
  const [activeItem, setActiveItem] = useState<string>("dashboard");

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
      case "settings":
        return <Settings />;
      case "waiting-list":
        return <WaitingList />;
      default:
        return <ScheduleCalendar />;
    }
  };

  return (
    <div className="flex">
      <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />
      <div className="flex-1">{renderContent()}</div>
    </div>
  );
}
