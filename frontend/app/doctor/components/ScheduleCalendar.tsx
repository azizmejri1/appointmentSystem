"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Save,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Type definitions
interface Doctor {
  id: string | null;
}
interface PauseDto {
  start: string;
  end: string;
}
interface DaySchedule {
  startTime: string;
  endTime: string;
  pauses: PauseDto[];
}
interface Schedules {
  [day: string]: DaySchedule;
}
interface AvailabilityDto {
  day: string;
  startTime: string;
  endTime: string;
  pauses?: PauseDto[];
}
interface CreateScheduleDto {
  doctorId: string | null;
  availability: AvailabilityDto[];
  appointmentDuration: number;
}
type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

const ScheduleCalendar: React.FC = () => {
  const [appointmentDuration, setAppointmentDuration] = useState<number>(30);
  const [schedules, setSchedules] = useState<Schedules>({});
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    setProfileId(localStorage.getItem("profileId"));
  }, []);

  const currentDoctor: Doctor = { id: profileId };

  const daysOfWeek: DayOfWeek[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const timeSlots: string[] = Array.from(
    { length: 24 },
    (_, i) => `${i.toString().padStart(2, "0")}:00`
  );

  const getWeekDates = (date: Date): Date[] => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    return daysOfWeek.map((_, index) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + index);
      return d;
    });
  };

  const weekDates: Date[] = getWeekDates(currentWeek);

  const addTimeSlot = (day: DayOfWeek): void => {
    if (!schedules[day]) {
      setSchedules((prev) => ({
        ...prev,
        [day]: { startTime: "09:00", endTime: "17:00", pauses: [] },
      }));
    }
  };

  const updateTimeSlot = (
    day: DayOfWeek,
    field: keyof Omit<DaySchedule, "pauses">,
    value: string
  ): void => {
    setSchedules((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const addPause = (day: DayOfWeek): void => {
    setSchedules((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        pauses: [...prev[day].pauses, { start: "12:00", end: "13:00" }],
      },
    }));
  };

  const updatePause = (
    day: DayOfWeek,
    pauseIndex: number,
    field: keyof PauseDto,
    value: string
  ): void => {
    setSchedules((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        pauses: prev[day].pauses.map((p, i) =>
          i === pauseIndex ? { ...p, [field]: value } : p
        ),
      },
    }));
  };

  const removePause = (day: DayOfWeek, pauseIndex: number): void => {
    setSchedules((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        pauses: prev[day].pauses.filter((_, i) => i !== pauseIndex),
      },
    }));
  };

  const removeDay = (day: DayOfWeek): void => {
    setSchedules((prev) => {
      const newSchedules = { ...prev };
      delete newSchedules[day];
      return newSchedules;
    });
  };

  const handleSubmit = async (): Promise<void> => {
    if (!currentDoctor.id) {
      setErrorMessage("Doctor ID not found. Please log in again.");
      return;
    }

    if (Object.keys(schedules).length === 0) {
      setErrorMessage("Please add at least one day to the schedule");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const availability: AvailabilityDto[] = Object.entries(schedules).map(
      ([day, schedule]) => {
        const dayIndex = daysOfWeek.indexOf(day as DayOfWeek);
        const date = weekDates[dayIndex];
        const formattedDay = `${day} ${date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        })}`;

        return {
          day: formattedDay,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          pauses: schedule.pauses.length > 0 ? schedule.pauses : undefined,
        };
      }
    );

    const payload: CreateScheduleDto = {
      doctorId: currentDoctor.id,
      availability,
      appointmentDuration,
    };

    console.log("Submitting payload:", payload);

    try {
      await axios.post(`${API_URL}/schedules`, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      setSuccessMessage("Schedule created successfully!");
      setSchedules({});
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage("Error creating schedule. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateWeek = (direction: number): void => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + direction * 7);
    setCurrentWeek(newDate);
  };

  const formatDate = (date: Date): string =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 bg-blue-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-white" />
            <h2 className="text-white font-semibold text-lg">My Schedule</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-md mb-6">
            <label className="block text-sm font-medium mb-2">
              Appointment Duration (minutes)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={appointmentDuration}
                onChange={(e) => setAppointmentDuration(Number(e.target.value))}
                min={15}
                max={180}
                step={15}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-800 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex justify-between mb-6">
            <button
              onClick={() => navigateWeek(-1)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <h3 className="text-lg font-semibold">
              {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
            </h3>
            <button
              onClick={() => navigateWeek(1)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {daysOfWeek.map((day, index) => {
              const hasSchedule = schedules[day];
              const date = weekDates[index];

              return (
                <div
                  key={day}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="p-3 text-center bg-blue-600 text-white">
                    <p className="font-medium text-sm">{day}</p>
                    <p className="text-xs opacity-80">{formatDate(date)}</p>
                  </div>

                  <div className="p-3">
                    {!hasSchedule ? (
                      <button
                        onClick={() => addTimeSlot(day)}
                        className="w-full py-3 border-2 border-dashed text-gray-500 rounded-lg"
                      >
                        <Plus className="w-4 h-4 inline" /> Add Schedule
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <select
                            value={hasSchedule.startTime}
                            onChange={(e) =>
                              updateTimeSlot(day, "startTime", e.target.value)
                            }
                            className="flex-1 p-2 border border-gray-300 rounded text-xs"
                          >
                            {timeSlots.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                          <select
                            value={hasSchedule.endTime}
                            onChange={(e) =>
                              updateTimeSlot(day, "endTime", e.target.value)
                            }
                            className="flex-1 p-2 border border-gray-300 rounded text-xs"
                          >
                            {timeSlots.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>

                        {hasSchedule.pauses.map((pause, i) => (
                          <div key={i} className="flex space-x-2">
                            <select
                              value={pause.start}
                              onChange={(e) =>
                                updatePause(day, i, "start", e.target.value)
                              }
                              className="flex-1 p-1 border border-gray-300 rounded text-xs"
                            >
                              {timeSlots.map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                            <select
                              value={pause.end}
                              onChange={(e) =>
                                updatePause(day, i, "end", e.target.value)
                              }
                              className="flex-1 p-1 border border-gray-300 rounded text-xs"
                            >
                              {timeSlots.map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => removePause(day, i)}
                              className="text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={() => addPause(day)}
                          className="w-full py-2 text-xs border rounded-lg text-blue-600"
                        >
                          + Add Break
                        </button>
                        <button
                          onClick={() => removeDay(day)}
                          className="w-full py-2 text-xs border border-red-300 rounded-lg text-red-600"
                        >
                          Remove Day
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isClient || !currentDoctor.id}
              className="text-white font-semibold py-3 px-8 rounded-lg shadow-md bg-blue-600 hover:shadow-lg disabled:opacity-50"
            >
              <Save className="w-4 h-4 inline" />{" "}
              {isSubmitting ? "Creating..." : "Create Schedule"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;
