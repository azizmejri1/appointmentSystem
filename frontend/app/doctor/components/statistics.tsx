"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
} from "lucide-react";
import {
  getDoctorStatistics,
  getDoctorPerformanceMetrics,
  DoctorStatistics,
  DoctorPerformanceMetrics,
} from "@/api/statistics";

export default function Statistics() {
  const [statistics, setStatistics] = useState<DoctorStatistics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] =
    useState<DoctorPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const doctorId = localStorage.getItem("profileId");

      if (!doctorId) {
        setError("Doctor ID not found");
        return;
      }

      const [statsData, metricsData] = await Promise.all([
        getDoctorStatistics(doctorId),
        getDoctorPerformanceMetrics(doctorId),
      ]);

      setStatistics(statsData);
      setPerformanceMetrics(metricsData);
    } catch (err) {
      setError("Failed to fetch statistics");
      console.error("Statistics error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        <AlertCircle className="mx-auto h-12 w-12 mb-4" />
        <p>{error}</p>
        <button
          onClick={fetchStatistics}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtitle,
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    subtitle?: string;
  }) => (
    <div
      className="bg-white rounded-lg shadow-md p-6 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <Icon className="h-8 w-8" style={{ color }} />
      </div>
    </div>
  );

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Statistics Dashboard
        </h1>
        <button
          onClick={fetchStatistics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Appointments"
          value={statistics?.overview.totalAppointments || 0}
          icon={Calendar}
          color="#3B82F6"
        />
        <StatCard
          title="Today's Appointments"
          value={statistics?.overview.appointmentsToday || 0}
          icon={Clock}
          color="#10B981"
        />
        <StatCard
          title="This Week"
          value={statistics?.overview.appointmentsThisWeek || 0}
          icon={TrendingUp}
          color="#F59E0B"
        />
        <StatCard
          title="Unique Patients"
          value={statistics?.overview.uniquePatients || 0}
          icon={Users}
          color="#8B5CF6"
        />
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          Performance Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">
              {formatPercentage(performanceMetrics?.completionRate || 0)}
            </div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500">
              {formatPercentage(performanceMetrics?.cancellationRate || 0)}
            </div>
            <div className="text-sm text-gray-600">Cancellation Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500">
              {formatPercentage(performanceMetrics?.noShowRate || 0)}
            </div>
            <div className="text-sm text-gray-600">No-Show Rate</div>
          </div>
        </div>
      </div>

      {/* Appointment Status Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Appointments by Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statistics?.appointmentsByStatus || {}).map(
            ([status, count]) => (
              <div
                key={status}
                className="text-center p-4 bg-gray-50 rounded-lg"
              >
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{status}</div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Monthly Trends</h2>
        <div className="space-y-2">
          {statistics?.monthlyTrends.map((trend, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-2 border-b border-gray-100"
            >
              <span className="text-gray-600">{trend.month}</span>
              <span className="font-semibold">
                {trend.appointments} appointments
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Appointments</h2>
        <div className="space-y-3">
          {statistics?.recentAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <div className="font-medium">
                  {appointment.patient?.user?.firstName}{" "}
                  {appointment.patient?.user?.lastName}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(appointment.dateTime).toLocaleDateString()} at{" "}
                  {new Date(appointment.dateTime).toLocaleTimeString()}
                </div>
                {appointment.note && (
                  <div className="text-sm text-gray-500">
                    {appointment.note}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : appointment.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : appointment.status === "scheduled"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {appointment.status}
                </span>
                {appointment.status === "completed" && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {appointment.status === "cancelled" && (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
