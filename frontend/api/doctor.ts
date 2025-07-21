import { Doctor } from "@/interface/doctor";
import axios from "axios";

const BASE_URL = "http://localhost:8080/doctors";
const PATIENTS_URL = "http://localhost:8080/patients";

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
