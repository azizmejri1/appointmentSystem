import { Doctor } from "@/interface/doctor";
import axios from "axios";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/doctors`;
const PATIENTS_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/patients`;

export async function fetchSpecialities(): Promise<string[]> {
  try {
    const response = await axios.get(`${BASE_URL}/specialities`);
    return response.data.specialities;
  } catch (error) {
    console.error("Error fetching specialities:", error);
    return [];
  }
}

export async function fetchCities(): Promise<string[]> {
  try {
    const response = await axios.get(`${BASE_URL}/cities`);
    return response.data.cities;
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
}

export async function fetchDoctors(
  speciality?: string,
  city?: string
): Promise<Doctor[]> {
  try {
    const params: Record<string, string> = {};
    if (speciality) params.speciality = speciality;
    if (city) params.city = city;

    const response = await axios.get(`${BASE_URL}/search`, { params });
    return response.data as Doctor[];
  } catch (err) {
    console.error('Error fetching doctors:', err);
    return [];
  }
}

export async function fetchAllDoctors(): Promise<Doctor[]> {
  try {
    const response = await axios.get(`${BASE_URL}`);
    return response.data as Doctor[];
  } catch (err) {
    console.error('Error fetching all doctors:', err);
    return [];
  }
}

export async function fetchPatientsByDoctor(doctorId: string) {
  try {
    const response = await axios.get(`${PATIENTS_URL}?doctorId=${doctorId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patients for doctor:', error);
    throw error;
  }
}

export async function fetchDoctorProfile(doctorId: string): Promise<Doctor> {
  try {
    const response = await axios.get(`${BASE_URL}/${doctorId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    throw error;
  }
}

export async function updateDoctorProfile(doctorId: string, data: any): Promise<Doctor> {
  try {
    const response = await axios.put(`${BASE_URL}/${doctorId}`, data, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    throw error;
  }
}

export async function uploadCredentials(doctorId: string, file: File): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('credential', file);
    
    const response = await axios.post(`${BASE_URL}/${doctorId}/upload-credentials`, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading credentials:', error);
    throw error;
  }
}

export async function verifyPhoneNumber(doctorId: string, phoneNumber: string): Promise<any> {
  try {
    const response = await axios.post(`${BASE_URL}/${doctorId}/verify-phone`, 
      { phoneNumber }, 
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error verifying phone number:', error);
    throw error;
  }
}

export async function verifyEmail(doctorId: string): Promise<any> {
  try {
    const response = await axios.post(`${BASE_URL}/verify-email/${doctorId}`, {}, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying email:', error);
    throw error;
  }
}
