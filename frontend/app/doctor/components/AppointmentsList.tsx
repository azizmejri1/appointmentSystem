import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
  Edit,
} from "lucide-react";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

interface Patient {
  _id: string;
  user?: User;
  // Support direct properties in case populate doesn't work
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface Appointment {
  _id: string;
  dateTime: string;
  status?: string; // Made optional to handle undefined values
  note?: string;
  doctor: string;
  patient: Patient | string;
}

interface ErrorMessage {
  type: "error" | "warning" | "info";
  title: string;
  message: string;
}

const AppointmentsList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorMessage | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "pending" | "confirmed" | "completed" | "cancelled"
  >("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Fetch appointments for the logged-in doctor
  const fetchAppointments = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Get doctor ID from localStorage (you may need to adjust this based on your auth system)
      const doctorId = localStorage.getItem("profileId");

      if (!doctorId) {
        setError({
          type: "warning",
          title: "Authentication Required",
          message: "Please log in to view your appointments.",
        });
        return;
      }

      const response = await fetch(
        `http://localhost:8080/appointments?doctorId=${doctorId}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("📋 Raw appointments data:", data);
        console.log("📋 First appointment patient data:", data[0]?.patient);
        setAppointments(data);
      } else if (response.status === 401) {
        setError({
          type: "warning",
          title: "Authentication Required",
          message: "Your session has expired. Please log in again.",
        });
      } else if (response.status === 403) {
        setError({
          type: "error",
          title: "Access Denied",
          message: "You don't have permission to view appointments.",
        });
      } else {
        setError({
          type: "error",
          title: "Failed to Load Appointments",
          message: "Unable to fetch your appointments. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError({
        type: "error",
        title: "Network Error",
        message:
          "Unable to connect to the server. Please check your internet connection.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen && !(event.target as Element).closest(".relative")) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Update appointment status
  const updateAppointmentStatus = async (
    appointmentId: string,
    newStatus: string
  ) => {
    try {
      setUpdatingStatus(appointmentId);
      setDropdownOpen(null);

      const response = await fetch(
        `http://localhost:8080/appointments/${appointmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (response.ok) {
        // Update the appointment in the local state
        setAppointments((prev) =>
          prev.map((appointment) =>
            appointment._id === appointmentId
              ? { ...appointment, status: newStatus }
              : appointment
          )
        );

        setError({
          type: "info",
          title: "Status Updated",
          message: `Appointment status changed to ${newStatus}`,
        });

        // Auto-hide success message
        setTimeout(() => setError(null), 3000);
      } else {
        const errorText = await response.text();
        console.error("❌ Status update error:", errorText);

        if (response.status === 404) {
          setError({
            type: "error",
            title: "Appointment Not Found",
            message: "This appointment no longer exists.",
          });
        } else {
          setError({
            type: "error",
            title: "Update Failed",
            message: "Unable to update appointment status. Please try again.",
          });
        }
      }
    } catch (error) {
      console.error("❌ Error updating status:", error);
      setError({
        type: "error",
        title: "Network Error",
        message:
          "Unable to connect to the server. Please check your internet connection.",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Filter appointments based on selected filter
  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === "all") return true;

    // Handle pending: if no status is set, consider it pending
    if (filter === "pending") {
      return (
        !appointment.status || appointment.status.toLowerCase() === "pending"
      );
    }

    // For other statuses, require exact match
    if (!appointment.status) return false;
    return appointment.status.toLowerCase() === filter;
  });

  // Sort appointments by date (newest first)
  const sortedAppointments = [...filteredAppointments].sort(
    (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );

  // Format date and time
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    let dateStr = "";
    if (isToday) {
      dateStr = "Today";
    } else if (isTomorrow) {
      dateStr = "Tomorrow";
    } else {
      dateStr = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return { dateStr, timeStr };
  };

  // Get status color and icon
  const getStatusInfo = (status?: string) => {
    // Handle undefined or null status
    if (!status) {
      return {
        color: "text-gray-700 bg-gray-100",
        icon: <AlertCircle className="w-4 h-4" />,
        label: "Unknown",
      };
    }

    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "confirmed":
        return {
          color: "text-green-700 bg-green-100",
          icon: <CheckCircle className="w-4 h-4" />,
          label: "Confirmed",
        };
      case "pending":
        return {
          color: "text-yellow-700 bg-yellow-100",
          icon: <Clock className="w-4 h-4" />,
          label: "Pending",
        };
      case "completed":
        return {
          color: "text-blue-700 bg-blue-100",
          icon: <CheckCircle className="w-4 h-4" />,
          label: "Completed",
        };
      case "cancelled":
        return {
          color: "text-red-700 bg-red-100",
          icon: <XCircle className="w-4 h-4" />,
          label: "Cancelled",
        };
      default:
        return {
          color: "text-gray-700 bg-gray-100",
          icon: <Clock className="w-4 h-4" />,
          label: status,
        };
    }
  };

  // Get patient name
  const getPatientName = (patient: Patient | string) => {
    console.log("🔍 Patient data:", patient);
    console.log("🔍 Patient type:", typeof patient);

    if (typeof patient === "string") {
      console.log("⚠️ Patient is just a string ID:", patient);
      return "Patient Information Not Available";
    }

    // Check if patient has user property
    if (patient && patient.user) {
      console.log("✅ Patient has user data:", patient.user);
      if (patient.user.firstName && patient.user.lastName) {
        return `${patient.user.firstName} ${patient.user.lastName}`;
      }
    }

    // Check if patient has firstName/lastName directly (in case structure is different)
    if (patient && (patient as any).firstName && (patient as any).lastName) {
      console.log(
        "✅ Patient has direct firstName/lastName:",
        (patient as any).firstName,
        (patient as any).lastName
      );
      return `${(patient as any).firstName} ${(patient as any).lastName}`;
    }

    console.log("❌ Patient structure not recognized:", patient);
    return "Patient Information Not Available";
  };

  // Status Dropdown Component
  const StatusDropdown: React.FC<{
    appointment: Appointment;
    currentStatus: string;
    isUpdating: boolean;
  }> = ({ appointment, currentStatus, isUpdating }) => {
    const statusOptions = [
      { value: "pending", label: "Pending", color: "text-yellow-700" },
      { value: "confirmed", label: "Confirmed", color: "text-green-700" },
      { value: "completed", label: "Completed", color: "text-blue-700" },
      { value: "cancelled", label: "Cancelled", color: "text-red-700" },
    ];

    const currentStatusInfo = getStatusInfo(currentStatus);
    const isOpen = dropdownOpen === appointment._id;

    return (
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(isOpen ? null : appointment._id)}
          disabled={isUpdating}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
            isUpdating
              ? "opacity-50 cursor-not-allowed bg-gray-50"
              : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {currentStatusInfo.icon}
            <span className="text-sm font-medium text-gray-700">
              {isUpdating ? "Updating..." : currentStatusInfo.label}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-40">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  updateAppointmentStatus(appointment._id, option.value)
                }
                disabled={option.value === currentStatus}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  option.value === currentStatus
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                }`}
              >
                {getStatusInfo(option.value).icon}
                <span>{option.label}</span>
                {option.value === currentStatus && (
                  <span className="ml-auto text-xs text-gray-500">Current</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Error Message Component
  const ErrorMessage: React.FC<{
    error: ErrorMessage;
    onClose: () => void;
  }> = ({ error, onClose }) => {
    const getIcon = () => {
      switch (error.type) {
        case "error":
          return <AlertCircle className="w-5 h-5 text-red-500" />;
        case "warning":
          return <AlertCircle className="w-5 h-5 text-amber-500" />;
        case "info":
          return <AlertCircle className="w-5 h-5 text-blue-500" />;
        default:
          return <AlertCircle className="w-5 h-5 text-red-500" />;
      }
    };

    const getBgColor = () => {
      switch (error.type) {
        case "error":
          return "bg-red-50 border-red-200";
        case "warning":
          return "bg-amber-50 border-amber-200";
        case "info":
          return "bg-blue-50 border-blue-200";
        default:
          return "bg-red-50 border-red-200";
      }
    };

    const getTextColor = () => {
      switch (error.type) {
        case "error":
          return "text-red-800";
        case "warning":
          return "text-amber-800";
        case "info":
          return "text-blue-800";
        default:
          return "text-red-800";
      }
    };

    return (
      <div className={`${getBgColor()} border rounded-lg p-4 mb-6`}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <h4 className={`font-semibold ${getTextColor()} mb-1`}>
              {error.title}
            </h4>
            <p className={`text-sm ${getTextColor().replace("800", "700")}`}>
              {error.message}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-opacity-20 ${
              error.type === "error"
                ? "hover:bg-red-600 text-red-400 hover:text-red-600"
                : error.type === "warning"
                ? "hover:bg-amber-600 text-amber-400 hover:text-amber-600"
                : "hover:bg-blue-600 text-blue-400 hover:text-blue-600"
            }`}
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Appointments
            </h1>
            <p className="text-gray-600">Manage your scheduled appointments</p>
          </div>
        </div>

        <button
          onClick={() => fetchAppointments(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage error={error} onClose={() => setError(null)} />}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { key: "all", label: "All", count: appointments.length },
          {
            key: "pending",
            label: "Pending",
            count: appointments.filter(
              (a) => !a.status || a.status.toLowerCase() === "pending"
            ).length,
          },
          {
            key: "confirmed",
            label: "Confirmed",
            count: appointments.filter(
              (a) => a.status && a.status.toLowerCase() === "confirmed"
            ).length,
          },
          {
            key: "completed",
            label: "Completed",
            count: appointments.filter(
              (a) => a.status && a.status.toLowerCase() === "completed"
            ).length,
          },
          {
            key: "cancelled",
            label: "Cancelled",
            count: appointments.filter(
              (a) => a.status && a.status.toLowerCase() === "cancelled"
            ).length,
          },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === key
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                filter === key
                  ? "bg-blue-200 text-blue-800"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your appointments...</p>
        </div>
      ) : sortedAppointments.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === "all"
              ? "No appointments found"
              : `No ${filter} appointments`}
          </h3>
          <p className="text-gray-500">
            {filter === "all"
              ? "You don't have any scheduled appointments yet."
              : `You don't have any ${filter} appointments.`}
          </p>
        </div>
      ) : (
        /* Appointments List */
        <div className="space-y-4">
          {sortedAppointments.map((appointment) => {
            const { dateStr, timeStr } = formatDateTime(appointment.dateTime);
            const statusInfo = getStatusInfo(appointment.status);
            const patientName = getPatientName(appointment.patient);

            return (
              <div
                key={appointment._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {typeof appointment.patient !== "string" &&
                        appointment.patient
                          ? appointment.patient.user
                            ? `${appointment.patient.user.firstName[0]}${appointment.patient.user.lastName[0]}`
                            : appointment.patient.firstName &&
                              appointment.patient.lastName
                            ? `${appointment.patient.firstName[0]}${appointment.patient.lastName[0]}`
                            : "P"
                          : "P"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {patientName}
                        </h3>
                        {typeof appointment.patient !== "string" &&
                          appointment.patient &&
                          (appointment.patient.user?.email ||
                            appointment.patient.email) && (
                            <p className="text-sm text-gray-600">
                              {appointment.patient.user?.email ||
                                appointment.patient.email}
                            </p>
                          )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{dateStr}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{timeStr}</span>
                      </div>
                    </div>

                    {appointment.note && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{appointment.note}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    {/* Status Management Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">
                        Status:
                      </span>
                      <StatusDropdown
                        appointment={appointment}
                        currentStatus={appointment.status || "pending"}
                        isUpdating={updatingStatus === appointment._id}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;
