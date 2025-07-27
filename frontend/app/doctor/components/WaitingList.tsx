"use client";

import React, { useEffect, useState } from "react";
import { getWaitingList, leaveWaitingList } from "@/api/waitingList";
import {
  Users,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  RefreshCw,
  AlertCircle,
  XCircle,
  Plus,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

import Modal from "@/components/ui/Modal";
import { createAppointment } from "@/api/appointment";

interface Patient {
  _id: string;
  patient: {
    _id: string;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
    };
  };
  preferredDate?: string;
  preferredTime?: string;
  reason?: string;
  createdAt?: string;
}

interface ErrorMessage {
  type: "error" | "warning" | "info" | "success";
  title: string;
  message: string;
}

const WaitingList: React.FC = () => {
  const [waitingList, setWaitingList] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorMessage | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [creatingAppointment, setCreatingAppointment] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDoctorId(localStorage.getItem("profileId"));
    }
  }, []);

  useEffect(() => {
    const fetchWaitingList = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!doctorId) {
          setError({
            type: "warning",
            title: "Authentication Required",
            message: "Doctor ID not found. Please login again.",
          });
          setLoading(false);
          return;
        }

        console.log("Doctor ID:", doctorId); // Debugging log

        const response = await getWaitingList(doctorId);
        console.log("API Response:", response.data); // Log the API response
        console.log("Full API Response:", response); // Log the full API response object for debugging
        setWaitingList(response.data);
      } catch (err: any) {
        console.error("Error fetching waiting list:", err);
        if (err.response?.status === 409) {
          setError({
            type: "warning",
            title: "Duplicate Entry",
            message: "Patient is already on the waiting list.",
          });
        } else if (err.response?.data?.message) {
          setError({
            type: "error",
            title: "Failed to Load Waiting List",
            message: err.response.data.message,
          });
        } else {
          setError({
            type: "error",
            title: "Network Error",
            message: err.message || "Failed to load waiting list.",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchWaitingList();
    }
  }, [doctorId]);

  // Fetch waiting list with optional refresh loader
  const fetchWaitingList = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      if (!doctorId) {
        setError({
          type: "warning",
          title: "Authentication Required",
          message: "Doctor ID not found. Please login again.",
        });
        return;
      }

      console.log("Doctor ID:", doctorId);

      const response = await getWaitingList(doctorId);
      console.log("API Response:", response.data);
      setWaitingList(response.data);
    } catch (err: any) {
      console.error("Error fetching waiting list:", err);
      if (err.response?.status === 409) {
        setError({
          type: "warning",
          title: "Duplicate Entry",
          message: "Patient is already on the waiting list.",
        });
      } else if (err.response?.data?.message) {
        setError({
          type: "error",
          title: "Failed to Load Waiting List",
          message: err.response.data.message,
        });
      } else {
        setError({
          type: "error",
          title: "Network Error",
          message: err.message || "Failed to load waiting list.",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateAppointment = (patient: Patient) => {
    console.log("🎯 Selected patient for appointment:", patient);
    console.log("🆔 Patient structure:", {
      entryId: patient._id,
      patientId: patient.patient._id,
      userId: patient.patient.user._id,
      fullStructure: patient,
    });
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPatient(null);
    setIsModalOpen(false);
  };

  const handleSubmitAppointment = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const patientId = selectedPatient?.patient._id; // Fixed: Use patient._id instead of selectedPatient._id
    const notes = formData.get("notes") as string;
    const dateTimeValue = formData.get("dateTime") as string;

    if (!patientId) {
      console.error("❌ Patient ID is missing:", selectedPatient);
      setError({
        type: "error",
        title: "Missing Patient Information",
        message: "Patient ID is missing. Cannot create appointment.",
      });
      return;
    }

    if (!doctorId) {
      console.error("❌ Doctor ID is missing:", doctorId);
      setError({
        type: "error",
        title: "Missing Doctor Information",
        message: "Doctor ID is missing. Please login again.",
      });
      return;
    }

    if (!dateTimeValue) {
      console.error("❌ DateTime is missing");
      setError({
        type: "error",
        title: "Missing Date and Time",
        message: "Please select a date and time for the appointment.",
      });
      return;
    }

    // Convert the datetime-local value to proper ISO format
    const appointmentDate = new Date(dateTimeValue);
    const isoDateTime = appointmentDate.toISOString();

    console.log("🕐 Original datetime value:", dateTimeValue);
    console.log("🕐 Converted to Date object:", appointmentDate);
    console.log("🕐 ISO string:", isoDateTime);
    console.log(
      "🕐 Formatted for backend:",
      appointmentDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    );

    const appointmentData = {
      patient: patientId,
      doctor: doctorId,
      dateTime: isoDateTime, // Use proper ISO format
      ...(notes && notes.trim() && { note: notes.trim() }), // Only include notes if not empty
    };

    console.log("📝 Final Appointment Data Payload:", appointmentData);
    console.log("👨‍⚕️ Doctor ID:", doctorId);
    console.log("🏥 Patient ID:", patientId);

    // Get patient name for success message
    const patientName = `${selectedPatient.patient.user.firstName} ${selectedPatient.patient.user.lastName}`;
    const appointmentDateTime = appointmentDate.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    setCreatingAppointment(true);
    
    // Close modal immediately so user can see the messages
    closeModal();

    try {
      // Step 1: Create the appointment
      console.log("🏥 Creating appointment...");
      const response = await createAppointment(appointmentData);
      console.log("✅ Appointment created successfully:", response);

      // Step 2: Remove patient from waiting list
      console.log("🗑️ Removing patient from waiting list...");
      try {
        await leaveWaitingList(doctorId, patientId);
        console.log("✅ Patient removed from waiting list successfully");

        // Update local state to remove the patient immediately
        setWaitingList((prevList) =>
          prevList.filter((entry) => entry.patient._id !== patientId)
        );

        // Show comprehensive success message
        setError({
          type: "success",
          title: "✅ Appointment Created Successfully!",
          message: `Appointment scheduled for ${patientName} on ${appointmentDateTime}. Patient has been removed from the waiting list.`,
        });
      } catch (waitingListError) {
        console.warn(
          "⚠️ Failed to remove patient from waiting list:",
          waitingListError
        );

        // Still show success for appointment, but mention waiting list issue
        setError({
          type: "success",
          title: "✅ Appointment Created!",
          message: `Appointment scheduled for ${patientName} on ${appointmentDateTime}. Note: Please manually remove the patient from the waiting list.`,
        });

        // Refresh the waiting list to get updated data
        fetchWaitingList(true);
      }

      // Auto-hide success message after 5 seconds
      setTimeout(() => setError(null), 5000);
    } catch (error: any) {
      console.error("❌ Error creating appointment:", error);
      console.error("❌ Error response:", error?.response);
      console.error("❌ Error response data:", error?.response?.data);
      console.error("❌ Error message:", error?.message);

      let errorMessage = "Failed to create appointment. Please try again.";
      let errorTitle = "❌ Failed to Create Appointment";

      // Handle different types of errors
      if (error?.response?.data) {
        const responseData = error.response.data;
        
        // Check if the error response has a message
        if (typeof responseData.message === "string") {
          errorMessage = responseData.message;
        } else if (responseData.message && typeof responseData.message === "object") {
          // Handle nested message objects
          if (responseData.message.message) {
            errorMessage = responseData.message.message;
          } else if (Array.isArray(responseData.message)) {
            // Handle validation error arrays
            errorMessage = responseData.message.join(", ");
          }
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }

        // Customize error titles and messages based on specific backend errors
        if (errorMessage.includes("does not have an active schedule")) {
          errorTitle = "❌ No Schedule Available";
          errorMessage = "This doctor hasn't set up their availability schedule yet. Please create a schedule first before booking appointments.";
        } else if (errorMessage.includes("not available on")) {
          errorTitle = "❌ Date Not Available";
          errorMessage = `${errorMessage} Please choose a date when the doctor is available.`;
        } else if (errorMessage.includes("only available between")) {
          errorTitle = "❌ Time Not Available";
          errorMessage = `${errorMessage} Please select a time within the doctor's working hours.`;
        } else if (errorMessage.includes("conflicts with an existing appointment")) {
          errorTitle = "❌ Time Slot Conflict";
          errorMessage = `${errorMessage} Please choose a different time slot.`;
        } else if (errorMessage.includes("on a break at this time")) {
          errorTitle = "❌ Doctor Unavailable";
          errorMessage = "The doctor is on a break at the selected time. Please choose a different time slot.";
        } else if (errorMessage.includes("Patient ID is required") || errorMessage.includes("Doctor ID is required")) {
          errorTitle = "❌ Missing Information";
          errorMessage = "Required patient or doctor information is missing. Please try again.";
        } else if (errorMessage.includes("dateTime") && errorMessage.includes("required")) {
          errorTitle = "❌ Invalid Date/Time";
          errorMessage = "Please select a valid date and time for the appointment.";
        }
      } else if (error?.response?.status === 400) {
        errorTitle = "❌ Invalid Request";
        errorMessage = "The appointment data is invalid. Please check all fields and try again.";
      } else if (error?.response?.status === 401) {
        errorTitle = "❌ Authentication Required";
        errorMessage = "Your session has expired. Please log in again.";
      } else if (error?.response?.status === 403) {
        errorTitle = "❌ Access Denied";
        errorMessage = "You don't have permission to create appointments.";
      } else if (error?.response?.status === 404) {
        errorTitle = "❌ Not Found";
        errorMessage = "The doctor or patient could not be found. Please verify the information.";
      } else if (error?.response?.status === 409) {
        errorTitle = "❌ Conflict";
        errorMessage = "There's a conflict with the selected appointment time. Please choose a different time.";
      } else if (error?.response?.status >= 500) {
        errorTitle = "❌ Server Error";
        errorMessage = "Our servers are experiencing issues. Please try again in a few minutes.";
      } else if (error?.code === "NETWORK_ERROR" || error?.message?.includes("Network Error")) {
        errorTitle = "❌ Connection Error";
        errorMessage = "Unable to connect to the server. Please check your internet connection and try again.";
      } else if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
        errorTitle = "❌ Request Timeout";
        errorMessage = "The request took too long to complete. Please try again.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Show the error message
      setError({
        type: "error",
        title: errorTitle,
        message: errorMessage,
      });

      // Keep the modal open so user can correct the issue
      // Don't close the modal on error
    } finally {
      setCreatingAppointment(false);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No preference";

    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) {
      return "Today";
    } else if (isTomorrow) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  // Get patient initials
  const getPatientInitials = (patient: Patient) => {
    const firstName = patient.patient?.user?.firstName || "";
    const lastName = patient.patient?.user?.lastName || "";
    return `${firstName[0] || ""}${lastName[0] || ""}` || "P";
  };

  // Error Message Component
  const ErrorMessage: React.FC<{
    error: ErrorMessage;
    onClose: () => void;
  }> = ({ error, onClose }) => {
    // Auto-dismiss success messages after 5 seconds
    useEffect(() => {
      if (error.type === "success") {
        const timer = setTimeout(() => {
          onClose();
        }, 5000);
        return () => clearTimeout(timer);
      }
    }, [error.type, onClose]);
    const getIcon = () => {
      switch (error.type) {
        case "error":
          return <AlertCircle className="w-5 h-5 text-red-500" />;
        case "warning":
          return <AlertTriangle className="w-5 h-5 text-amber-500" />;
        case "info":
          return <Info className="w-5 h-5 text-blue-500" />;
        case "success":
          return <CheckCircle className="w-5 h-5 text-green-500" />;
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
        case "success":
          return "bg-green-50 border-green-200";
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
        case "success":
          return "text-green-800";
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
                : error.type === "info"
                ? "hover:bg-blue-600 text-blue-400 hover:text-blue-600"
                : error.type === "success"
                ? "hover:bg-green-600 text-green-400 hover:text-green-600"
                : "hover:bg-red-600 text-red-400 hover:text-red-600"
            }`}
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading waiting list...</p>
        </div>
      </div>
    );
  }

  console.log("Waiting List Data:", waitingList); // Debugging log for waitingList data

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Waiting List</h1>
            <p className="text-gray-600">
              Manage patients waiting for appointments
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchWaitingList(true)}
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

      {/* Waiting List Content */}
      {Array.isArray(waitingList) && waitingList.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No patients on waiting list
          </h3>
          <p className="text-gray-500">
            Patients who join your waiting list will appear here.
          </p>
        </div>
      ) : Array.isArray(waitingList) ? (
        /* Waiting List Cards */
        <div className="space-y-4">
          {waitingList.map((entry) => (
            <div
              key={entry._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {getPatientInitials(entry)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {entry.patient?.user?.firstName || "N/A"}{" "}
                        {entry.patient?.user?.lastName || "N/A"}
                      </h3>
                      {entry.patient?.user?.email && (
                        <p className="text-sm text-gray-600">
                          {entry.patient.user.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                    {entry.patient?.user?.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{entry.patient.user.phoneNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Preferred: {formatDate(entry.preferredDate)}</span>
                    </div>
                    {entry.preferredTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{entry.preferredTime}</span>
                      </div>
                    )}
                  </div>

                  {entry.reason && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{entry.reason}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => handleCreateAppointment(entry)}
                  >
                    <Plus className="w-4 h-4" />
                    Create Appointment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Loading State for Data */
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading data...</p>
        </div>
      )}

      {/* Modal for Creating Appointment */}
      {isModalOpen && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Create Appointment
                  </h2>
                  <p className="text-sm text-gray-600">
                    Schedule a new appointment
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Patient Info Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Patient Information
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {getPatientInitials(selectedPatient)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedPatient.patient.user.firstName}{" "}
                      {selectedPatient.patient.user.lastName}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      {selectedPatient.patient.user.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{selectedPatient.patient.user.email}</span>
                        </div>
                      )}
                      {selectedPatient.patient.user.phoneNumber && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>
                            {selectedPatient.patient.user.phoneNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Patient Preferences */}
                {(selectedPatient.preferredDate ||
                  selectedPatient.preferredTime ||
                  selectedPatient.reason) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">
                      Patient Preferences
                    </h4>
                    <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                      {selectedPatient.preferredDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Preferred Date:{" "}
                            {formatDate(selectedPatient.preferredDate)}
                          </span>
                        </div>
                      )}
                      {selectedPatient.preferredTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>
                            Preferred Time: {selectedPatient.preferredTime}
                          </span>
                        </div>
                      )}
                      {selectedPatient.reason && (
                        <div className="flex items-start gap-2">
                          <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>Reason: {selectedPatient.reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Appointment Form */}
              <form onSubmit={handleSubmitAppointment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Appointment Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="dateTime"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Select the date and time for the appointment
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Add any additional notes for this appointment..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    className="px-6 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingAppointment}
                    className={`px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors ${
                      creatingAppointment
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {creatingAppointment ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </div>
                    ) : (
                      "Create Appointment"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitingList;
