import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import AppointmentBookingModal from "./AppointmentBookingModal";

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  location: string;
}

interface NotificationMessage {
  type: "success" | "error" | "warning";
  title: string;
  message: string;
}

interface DoctorProfileCardProps {
  doctor?: Doctor;
  name?: string;
  specialty?: string;
  location?: string;
  description?: string;
  keywords?: string[];
  profileImage?: string | null;
  onAppointmentClick?: () => void;
}

const DoctorProfileCard: React.FC<DoctorProfileCardProps> = ({
  doctor,
  name = "Dr Doctor's Name",
  specialty = "Specialty",
  location = "Location",
  description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eu molestie orci.",
  keywords = [
    "Keyword",
    "Keyword",
    "Keyword",
    "Keyword",
    "Keyword",
    "Keyword",
    "Keyword",
    "Keyword",
  ],
  profileImage = null,
  onAppointmentClick = () => console.log("Appointment clicked"),
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<NotificationMessage | null>(
    null
  );

  const handleAppointmentClick = () => {
    setIsModalOpen(true);
  };

  const handleBookAppointment = async (appointmentData: {
    doctorId: string;
    dateTime: Date;
    duration: number;
  }) => {
    try {
      console.log("📅 Booking appointment:", appointmentData);

      // Get patient ID from localStorage (you may need to adjust this)
      const patientId = localStorage.getItem("profileId");

      if (!patientId) {
        setNotification({
          type: "warning",
          title: "Authentication Required",
          message: "Please log in to book an appointment.",
        });
        return;
      }

      const response = await fetch("http://localhost:8080/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // For authentication
        body: JSON.stringify({
          doctor: appointmentData.doctorId,
          patient: patientId,
          dateTime: appointmentData.dateTime.toISOString(),
          reason: "Regular checkup",
        }),
      });

      console.log("📡 Appointment response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Appointment created:", result);
        setNotification({
          type: "success",
          title: "Appointment Booked!",
          message: `Your appointment with Dr. ${
            doctor ? doctor.firstName + " " + doctor.lastName : "the doctor"
          } has been successfully scheduled.`,
        });
        // Auto-close notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      } else {
        const errorText = await response.text();
        console.error("❌ Appointment error:", errorText);

        if (response.status === 409) {
          setNotification({
            type: "warning",
            title: "Time Slot Unavailable",
            message:
              "This appointment slot is no longer available. Please choose a different time.",
          });
        } else if (response.status === 400) {
          setNotification({
            type: "error",
            title: "Invalid Request",
            message:
              "There was an issue with your appointment request. Please try again.",
          });
        } else {
          setNotification({
            type: "error",
            title: "Booking Failed",
            message:
              "Unable to book your appointment. Please try again or contact support.",
          });
        }
      }
    } catch (error) {
      console.error("❌ Error booking appointment:", error);
      setNotification({
        type: "error",
        title: "Network Error",
        message:
          "Unable to connect to our servers. Please check your internet connection and try again.",
      });
    }
  };

  // Use doctor data if provided, otherwise use props
  const displayName = doctor
    ? `Dr. ${doctor.firstName} ${doctor.lastName}`
    : name;
  const displaySpecialty = doctor?.specialty || specialty;
  const displayLocation = doctor?.location || location;

  // Notification Component
  const NotificationToast: React.FC<{
    notification: NotificationMessage;
    onClose: () => void;
  }> = ({ notification, onClose }) => {
    const getIcon = () => {
      switch (notification.type) {
        case "success":
          return <CheckCircle className="w-5 h-5 text-green-500" />;
        case "error":
          return <AlertCircle className="w-5 h-5 text-red-500" />;
        case "warning":
          return <AlertTriangle className="w-5 h-5 text-amber-500" />;
        default:
          return <AlertCircle className="w-5 h-5 text-red-500" />;
      }
    };

    const getBgColor = () => {
      switch (notification.type) {
        case "success":
          return "bg-green-50 border-green-200";
        case "error":
          return "bg-red-50 border-red-200";
        case "warning":
          return "bg-amber-50 border-amber-200";
        default:
          return "bg-red-50 border-red-200";
      }
    };

    const getTextColor = () => {
      switch (notification.type) {
        case "success":
          return "text-green-800";
        case "error":
          return "text-red-800";
        case "warning":
          return "text-amber-800";
        default:
          return "text-red-800";
      }
    };

    return (
      <div
        className={`fixed top-4 right-4 z-50 max-w-sm w-full ${getBgColor()} border rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out`}
      >
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <h4 className={`font-semibold ${getTextColor()} mb-1`}>
              {notification.title}
            </h4>
            <p className={`text-sm ${getTextColor().replace("800", "700")}`}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-opacity-20 ${
              notification.type === "success"
                ? "hover:bg-green-600 text-green-400 hover:text-green-600"
                : notification.type === "error"
                ? "hover:bg-red-600 text-red-400 hover:text-red-600"
                : "hover:bg-amber-600 text-amber-400 hover:text-amber-600"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Notification Toast */}
      {notification && (
        <NotificationToast
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Doctor Profile Card */}
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex gap-6">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                alt={`${name} profile`}
                className="w-32 h-32 rounded-2xl object-cover shadow-inner"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center shadow-inner">
                <div className="w-16 h-16 bg-gray-400 rounded-full mb-2"></div>
                <div className="w-20 h-10 bg-gray-400 rounded-t-full -mt-6"></div>
              </div>
            )}
          </div>

          {/* Doctor Information */}
          <div className="flex-1 min-w-0">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {displayName}
              </h2>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="text-sm font-medium">{displaySpecialty}</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{displayLocation}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              {description}
            </p>

            {/* Keywords */}
            <div className="flex flex-wrap gap-2 mb-6">
              {keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors duration-200"
                >
                  {keyword}
                </span>
              ))}
            </div>

            {/* Appointment Button */}
            <div className="flex justify-end">
              <button
                onClick={handleAppointmentClick}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Calendar className="w-4 h-4" />
                Take an appointment
              </button>
            </div>
          </div>
        </div>

        {/* Appointment Booking Modal */}
        <AppointmentBookingModal
          doctor={
            doctor || {
              _id: "1",
              firstName:
                displayName.replace("Dr. ", "").split(" ")[0] || "Doctor",
              lastName:
                displayName.replace("Dr. ", "").split(" ").slice(1).join(" ") ||
                "Name",
              specialty: displaySpecialty,
              location: displayLocation,
            }
          }
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onBookAppointment={handleBookAppointment}
        />
      </div>
    </div>
  );
};

export default DoctorProfileCard;
