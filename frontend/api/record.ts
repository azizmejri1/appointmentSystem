import axios from "axios";

const BASE_URL = "http://localhost:8080/records";

export interface Consultation {
  _id?: string;
  symptoms: string;
  vitalSigns: string;
  diagnosis: string;
  prescription: string;
  visitDate: Date;
  visitType: string;
}

export interface MedicalRecord {
  _id: string;
  consultations: Consultation[];
  doctor: string;
  patient: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchRecordsByPatient(patientId: string): Promise<MedicalRecord[]> {
  try {
    const response = await axios.get(`${BASE_URL}/${patientId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching medical records:", error);
    throw error;
  }
}

export async function createRecord(
  patientId: string,
  consultation: Consultation
): Promise<MedicalRecord> {
  try {
    const doctorId = localStorage.getItem("profileId"); // Get doctor ID from localStorage
    
    if (!doctorId) {
      throw new Error("Doctor ID not found. Please login again.");
    }
    
    const response = await axios.post(`${BASE_URL}/${patientId}/${doctorId}`, consultation, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating medical record:", error);
    throw error;
  }
}

export async function updateConsultation(
  recordId: string,
  consultationId: string,
  updatedConsultation: Consultation
): Promise<MedicalRecord> {
  try {
    const response = await axios.patch(
      `${BASE_URL}/${recordId}/${consultationId}`,
      updatedConsultation,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating consultation:", error);
    throw error;
  }
}

export async function deleteConsultation(
  recordId: string,
  consultationId: string
): Promise<MedicalRecord> {
  try {
    const response = await axios.delete(`${BASE_URL}/${recordId}/${consultationId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting consultation:", error);
    throw error;
  }
}
