import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  X,
  User,
  MapPin,
  Stethoscope,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import WaitingList from "@/app/patient/components/WaitingList";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  location: string;
}

interface Schedule {
  _id: string;
  doctorId: string;
  availability: {
    day: string;
    startTime: string;
    endTime: string;
    pauses: { start: string; end: string }[];
  }[];
  appointmentDuration: number;
}

interface AppointmentBookingModalProps {
  doctor: Doctor;
  isOpen: boolean;
  onClose: () => void;
  onBookAppointment: (appointmentData: {
    doctorId: string;
    dateTime: Date;
    duration: number;
  }) => void;
}

interface ErrorMessage {
  type: "error" | "warning" | "info" | "success";
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  doctor,
  isOpen,
  onClose,
  onBookAppointment,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorMessage | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const doctorId = doctor._id;
  const patientId = localStorage.getItem("profileId") || "";

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const now = new Date();
    // Normalize today to start of day for accurate comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentMonthDate = currentMonth.getMonth();
    const currentYear = currentMonth.getFullYear();
    const firstDay = new Date(currentYear, currentMonthDate, 1);
    const lastDay = new Date(currentYear, currentMonthDate + 1, 0);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentYear, currentMonthDate, day);
      // Only allow future dates or today
      if (date >= today) {
        days.push(date);
      } else {
        days.push(null); // Past dates
      }
    }

    return days;
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);

    // Don't allow going to past months
    const today = new Date();
    const currentMonthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    if (newMonth >= currentMonthStart) {
      setCurrentMonth(newMonth);
      setSelectedDate(null); // Clear selected date when changing months
      setSelectedTime(null);
    }
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);

    // Allow up to 6 months in the future
    const maxMonth = new Date();
    maxMonth.setMonth(maxMonth.getMonth() + 6);

    if (newMonth <= maxMonth) {
      setCurrentMonth(newMonth);
      setSelectedDate(null); // Clear selected date when changing months
      setSelectedTime(null);
    }
  };

  // Check if navigation buttons should be disabled
  const isPreviousDisabled = () => {
    const today = new Date();
    const currentMonthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(currentMonth.getMonth() - 1);
    return prevMonth < currentMonthStart;
  };

  const isNextDisabled = () => {
    const maxMonth = new Date();
    maxMonth.setMonth(maxMonth.getMonth() + 6);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(currentMonth.getMonth() + 1);
    return nextMonth > maxMonth;
  };

  // Fetch doctor's schedule
  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔍 Fetching schedule for doctor:", doctor._id);
      console.log("👨‍⚕️ Full doctor object:", doctor);

      // Fixed URL to match ScheduleCalendar
      const response = await fetch(
        `${API_URL}/schedules?doctorId=${doctor._id}`,
        {
          credentials: "include",
        }
      );

      console.log("📡 Response status:", response.status);
      console.log(
        "📡 Request URL:",
        `${API_URL}/schedules?doctorId=${doctor._id}`
      );

      if (response.ok) {
        const schedulesData = await response.json();
        console.log("📋 Raw schedules response:", schedulesData);
        console.log(
          "📋 Array length:",
          Array.isArray(schedulesData) ? schedulesData.length : "Not an array"
        );

        if (Array.isArray(schedulesData) && schedulesData.length > 0) {
          console.log("✅ Setting schedules from array:", schedulesData);
          setSchedules(schedulesData);
        } else if (schedulesData && !Array.isArray(schedulesData)) {
          console.log("✅ Setting schedule from single object:", schedulesData);
          setSchedules([schedulesData]);
        } else {
          console.log("❌ No valid schedule data found - Empty array or null");
          console.log(
            "💡 This means the doctor hasn't created a schedule yet!"
          );
          setSchedules([]);
          setError({
            type: "warning",
            title: "No Schedule Available",
            message: `Dr. ${doctor.firstName} ${doctor.lastName} hasn't created their availability schedule yet. Please contact the doctor directly or try again later.`,
          });
        }
      } else {
        const errorText = await response.text();
        console.log("❌ Response not ok:", errorText);
        setSchedules([]);

        if (response.status === 404) {
          setError({
            type: "warning",
            title: "Doctor Not Found",
            message:
              "We couldn't find schedule information for this doctor. They may not have set up their availability yet.",
          });
        } else if (response.status >= 500) {
          setError({
            type: "error",
            title: "Server Error",
            message:
              "Our servers are experiencing issues. Please try again in a few minutes.",
          });
        } else {
          setError({
            type: "error",
            title: "Connection Error",
            message:
              "Unable to load doctor's schedule. Please check your internet connection and try again.",
          });
        }
      }
    } catch (error) {
      console.error("❌ Error fetching schedule:", error);
      setSchedules([]);
      setError({
        type: "error",
        title: "Network Error",
        message:
          "Unable to connect to our servers. Please check your internet connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to find schedule for a specific date
  const findScheduleForDate = (date: Date): Schedule | null => {
    if (schedules.length === 0) return null;

    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const dateString = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    const fullDateString = `${dayName} ${dateString}`;

    console.log("🔍 Looking for schedule for:", fullDateString);

    // Search through all schedules to find one that has availability for this date
    for (const schedule of schedules) {
      if (schedule.availability) {
        const hasAvailability = schedule.availability.some((slot) => {
          const slotDay = slot.day.toLowerCase().trim();
          const targetDay = dayName.toLowerCase().trim();
          const targetFullDate = fullDateString.toLowerCase().trim();

          // Use exact matching only to prevent false positives
          const exactMatch = slotDay === targetDay;
          const fullDateMatch = slotDay === targetFullDate;

          // Only allow "starts with" for full date strings (e.g., "Monday January 15")
          const startsWithDateMatch =
            slotDay.startsWith(targetDay) &&
            slotDay.includes(dateString.toLowerCase());

          return exactMatch || fullDateMatch || startsWithDateMatch;
        });

        if (hasAvailability) {
          console.log(
            "✅ Found schedule:",
            schedule._id,
            "for date:",
            fullDateString
          );
          return schedule;
        }
      }
    }

    console.log("❌ No schedule found for date:", fullDateString);
    return null;
  };

  // Check if a date is available based on doctor's schedules
  const isDateAvailable = (date: Date) => {
    return findScheduleForDate(date) !== null;
  };

  // Generate time slots for selected date - ENHANCED DEBUGGING
  const generateTimeSlots = (date: Date) => {
    const schedule = findScheduleForDate(date);

    if (!schedule) {
      console.log("❌ No schedule available for this date");
      return [];
    }

    console.log("🗓️ Generating slots for date:", date);
    console.log("📅 Using schedule:", schedule._id);
    console.log("📅 Available schedule days:", schedule.availability);

    // Try multiple day matching strategies to handle ScheduleCalendar format
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const dateString = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });

    console.log("🔍 Target day name:", dayName);
    console.log("🔍 Target date string:", dateString);
    console.log("🔍 Full target date string:", `${dayName} ${dateString}`);

    // Check all available days in the schedule
    console.log("🔍 All schedule days:");
    schedule.availability.forEach((slot, index) => {
      console.log(`  ${index}: "${slot.day}" (type: ${typeof slot.day})`);
    });

    // Find matching availability - handle multiple formats
    const daySchedule = schedule.availability.find((slot) => {
      const slotDay = slot.day.toLowerCase().trim();
      const targetDay = dayName.toLowerCase().trim();

      // Use strict matching to prevent false positives
      const exactMatch = slotDay === targetDay;

      // Also try matching with the full date string
      const fullDateTarget = `${dayName} ${dateString}`.toLowerCase().trim();
      const fullDateMatch = slotDay === fullDateTarget;

      // Only allow "starts with" for full date strings (e.g., "Monday January 15")
      const startsWithDateMatch =
        slotDay.startsWith(targetDay) &&
        slotDay.includes(dateString.toLowerCase());

      console.log(`🔍 Comparing "${slotDay}" with "${targetDay}":`, {
        exactMatch,
        fullDateMatch,
        startsWithDateMatch,
        fullDateTarget,
      });

      return exactMatch || fullDateMatch || startsWithDateMatch;
    });

    console.log("📋 Found day schedule:", daySchedule);

    if (!daySchedule) {
      console.log("❌ No schedule found for this day");
      console.log(
        "💡 Available days in schedule:",
        schedule.availability.map((s) => s.day)
      );
      return [];
    }

    console.log("✅ Day schedule found:", JSON.stringify(daySchedule, null, 2));

    const slots: string[] = [];

    // Parse start and end times
    console.log(
      "⏰ Parsing times - Start:",
      daySchedule.startTime,
      "End:",
      daySchedule.endTime
    );

    const [startHour, startMinute] = daySchedule.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = daySchedule.endTime.split(":").map(Number);

    console.log(
      "⏰ Parsed times - Start:",
      `${startHour}:${startMinute}`,
      "End:",
      `${endHour}:${endMinute}`
    );

    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);

    console.log("⏰ Time range:", startTime, "to", endTime);

    const current = new Date(startTime);
    const duration = schedule.appointmentDuration || 30;

    console.log("⏰ Appointment duration:", duration, "minutes");
    console.log("⏰ Pauses:", daySchedule.pauses);

    let slotCount = 0;
    while (current < endTime && slotCount < 50) {
      // Safety limit
      const timeString = current.toTimeString().slice(0, 5);

      // Check if this time is not in pauses
      const isInPause = daySchedule.pauses?.some((pause) => {
        const pauseStart = pause.start;
        const pauseEnd = pause.end;
        const inPause = timeString >= pauseStart && timeString < pauseEnd;

        if (inPause) {
          console.log(
            `⏸️  Time ${timeString} is in pause: ${pauseStart}-${pauseEnd}`
          );
        }

        return inPause;
      });

      if (!isInPause) {
        slots.push(timeString);
        console.log(`✅ Added slot: ${timeString}`);
      }

      current.setMinutes(current.getMinutes() + duration);
      slotCount++;
    }

    console.log("⏰ Final generated time slots:", slots);
    console.log("⏰ Total slots generated:", slots.length);

    return slots;
  };

  useEffect(() => {
    if (isOpen && doctor._id) {
      fetchSchedule();
    }
    // Clear error when modal is closed
    if (!isOpen) {
      setError(null);
    }
  }, [isOpen, doctor._id]);

  useEffect(() => {
    if (selectedDate && schedules.length > 0) {
      const slots = generateTimeSlots(selectedDate);
      setAvailableSlots(slots);
      setSelectedTime(null);
    }
  }, [selectedDate, schedules]);

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);

    // If date is not available, check if we can join waiting list
    if (!isDateAvailable(date)) {
      console.log("📅 Date not available, checking waiting list options...");
      await checkAvailabilityAndPromptWaitingList(date);
    }
  };

  // Check availability and prompt for waiting list if needed
  const checkAvailabilityAndPromptWaitingList = async (date: Date) => {
    try {
      const schedule = findScheduleForDate(date);
      const response = await fetch(
        `${API_URL}/appointments/check-availability`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            doctorId: doctor._id,
            dateTime: date.toISOString(),
            duration: schedule?.appointmentDuration || 30,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.log("❌ Availability check error:", errorData);

        if (errorData.canJoinWaitingList && errorData.requestedDate) {
          setError({
            type: "info",
            title: "Doctor Not Available",
            message: `Dr. ${doctor.firstName} ${doctor.lastName} is not available on ${errorData.requestedDate}. Would you like to join the waiting list for this date?`,
            action: {
              label: "Join Waiting List",
              onClick: () => handleJoinWaitingList(errorData),
            },
          });
        } else {
          setError({
            type: "warning",
            title: "Date Not Available",
            message: `Dr. ${doctor.firstName} ${doctor.lastName} is not available on this date.`,
          });
        }
      }
    } catch (error) {
      console.error("❌ Error checking availability:", error);
      setError({
        type: "error",
        title: "Connection Error",
        message: "Unable to check availability. Please try again.",
      });
    }
  };

  // Handle joining waiting list
  const handleJoinWaitingList = async (errorData: any) => {
    try {
      const patientId = localStorage.getItem("profileId");
      if (!patientId) {
        setError({
          type: "error",
          title: "Authentication Required",
          message: "Please log in to join the waiting list.",
        });
        return;
      }

      const response = await fetch(`${API_URL}/waiting-list/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          doctorId: doctor._id,
          patientId: patientId,
          preferredDate: errorData.requestedDate,
          preferredTime: "Any",
          reason: `Patient wants appointment on ${errorData.requestedDate}`,
        }),
      });

      if (response.ok) {
        setError({
          type: "success",
          title: "Added to Waiting List!",
          message: `You've been added to the waiting list for Dr. ${doctor.firstName} ${doctor.lastName} on ${errorData.requestedDate}. We'll notify you if a slot becomes available.`,
        });
      } else {
        const errorText = await response.text();
        console.error("❌ Waiting list error:", errorText);
        setError({
          type: "error",
          title: "Failed to Join Waiting List",
          message: "Unable to add you to the waiting list. Please try again.",
        });
      }
    } catch (error) {
      console.error("❌ Error joining waiting list:", error);
      setError({
        type: "error",
        title: "Network Error",
        message: "Unable to connect to our servers. Please try again.",
      });
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBookAppointment = () => {
    if (selectedDate && selectedTime && schedules.length > 0) {
      const schedule = findScheduleForDate(selectedDate);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const appointmentDateTime = new Date(selectedDate);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      onBookAppointment({
        doctorId: doctor._id,
        dateTime: appointmentDateTime,
        duration: schedule?.appointmentDuration || 30,
      });

      onClose();
    }
  };

  if (!isOpen) return null;

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

    const getButtonColor = () => {
      switch (error.type) {
        case "error":
          return "bg-red-600 hover:bg-red-700 text-white";
        case "warning":
          return "bg-amber-600 hover:bg-amber-700 text-white";
        case "info":
          return "bg-blue-600 hover:bg-blue-700 text-white";
        case "success":
          return "bg-green-600 hover:bg-green-700 text-white";
        default:
          return "bg-red-600 hover:bg-red-700 text-white";
      }
    };

    return (
      <div className={`${getBgColor()} border rounded-lg p-4 mb-4`}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <h4 className={`font-semibold ${getTextColor()} mb-1`}>
              {error.title}
            </h4>
            <p
              className={`text-sm ${getTextColor().replace("800", "700")} mb-3`}
            >
              {error.message}
            </p>
            {error.action && (
              <button
                onClick={error.action.onClick}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${getButtonColor()}`}
              >
                {error.action.label}
              </button>
            )}
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
                : "hover:bg-green-600 text-green-400 hover:text-green-600"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Book Appointment
              </h2>
              <p className="text-gray-600">
                Choose your preferred date and time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Doctor Info */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {doctor.firstName[0]}
              {doctor.lastName[0]}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Dr. {doctor.firstName} {doctor.lastName}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Stethoscope className="w-4 h-4" />
                  <span>{doctor.specialty}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{doctor.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="px-6">
            <ErrorMessage error={error} onClose={() => setError(null)} />
          </div>
        )}

        <div className="flex flex-col lg:flex-row">
          {/* Calendar Section */}
          <div className="flex-1 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Date
            </h3>

            {/* Show available days info */}
            {schedules.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Available days:</strong>{" "}
                  {schedules
                    .flatMap((schedule) =>
                      schedule.availability.map((slot: any) => slot.day)
                    )
                    .filter((day, index, arr) => arr.indexOf(day) === index) // Remove duplicates
                    .join(", ")}
                </p>
              </div>
            )}

            {/* Calendar Legend */}
            <div className="mb-4 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span className="text-gray-600">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-dashed border-orange-300 rounded"></div>
                <span className="text-gray-600">Join waiting list</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <span>• Navigate up to 6 months ahead</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={goToPreviousMonth}
                  disabled={isPreviousDisabled()}
                  className={`p-2 rounded-lg transition-colors ${
                    isPreviousDisabled()
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Previous month"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <h4 className="text-center font-medium text-gray-900">
                  {monthNames[currentMonth.getMonth()]}{" "}
                  {currentMonth.getFullYear()}
                </h4>

                <button
                  onClick={goToNextMonth}
                  disabled={isNextDisabled()}
                  className={`p-2 rounded-lg transition-colors ${
                    isNextDisabled()
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Next month"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const isAvailable = date ? isDateAvailable(date) : false;
                return (
                  <button
                    key={index}
                    onClick={() => date && handleDateSelect(date)}
                    disabled={!date}
                    className={`
                      h-10 text-sm rounded-lg transition-all duration-200
                      ${
                        !date
                          ? "invisible"
                          : !isAvailable
                          ? "text-gray-500 hover:bg-orange-50 hover:text-orange-700 border border-dashed border-orange-300"
                          : selectedDate?.toDateString() === date.toDateString()
                          ? "bg-blue-600 text-white font-semibold"
                          : "hover:bg-blue-50 text-gray-700"
                      }
                    `}
                    title={
                      date && !isAvailable
                        ? "Doctor is not available on this day - Click to join waiting list"
                        : date && isAvailable
                        ? "Available day - Click to see time slots"
                        : undefined
                    }
                  >
                    {date?.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots Section */}
          <div className="flex-1 p-6 border-l border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Available Times
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading available times...</p>
              </div>
            ) : !selectedDate ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Please select a date first</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">
                  No available slots for this date
                </p>
                <WaitingList doctorId={doctorId} patientId={patientId} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={`
                      p-3 text-sm rounded-lg border transition-all duration-200
                      ${
                        selectedTime === time
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                      }
                    `}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedDate && selectedTime && schedules.length > 0 && (
              <span>
                Appointment duration:{" "}
                {findScheduleForDate(selectedDate)?.appointmentDuration || 30}{" "}
                minutes
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBookAppointment}
              disabled={!selectedDate || !selectedTime}
              className={`
                px-6 py-2 rounded-lg font-medium transition-colors
                ${
                  selectedDate && selectedTime
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBookingModal;
