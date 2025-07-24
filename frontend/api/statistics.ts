import axios from 'axios';

const API_URL = "http://localhost:8080";

export interface DoctorStatistics {
  overview: {
    totalAppointments: number;
    appointmentsToday: number;
    appointmentsThisWeek: number;
    appointmentsThisMonth: number;
    uniquePatients: number;
  };
  appointmentsByStatus: {
    [key: string]: number;
  };
  monthlyTrends: Array<{
    month: string;
    appointments: number;
  }>;
  recentAppointments: Array<{
    _id: string;
    dateTime: string;
    status: string;
    note?: string;
    patient: {
      _id: string;
      user: {
        firstName: string;
        lastName: string;
        email: string;
      };
    };
  }>;
}

export interface DoctorPerformanceMetrics {
  cancellationRate: number;
  noShowRate: number;
  completionRate: number;
  totalAppointments: number;
}

export async function getDoctorStatistics(doctorId: string): Promise<DoctorStatistics> {
  try {
    const response = await axios.get(`${API_URL}/doctors/${doctorId}/statistics`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor statistics:', error);
    throw error;
  }
}

export async function getDoctorPerformanceMetrics(doctorId: string): Promise<DoctorPerformanceMetrics> {
  try {
    const response = await axios.get(`${API_URL}/doctors/${doctorId}/performance-metrics`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor performance metrics:', error);
    throw error;
  }
}
