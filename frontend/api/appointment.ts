import axiosInstance from "@/lib/axiosConfig";

interface CreateAppointmentData {
  patient: string;
  doctor: string | null;
  dateTime: FormDataEntryValue | null;
  note?: string;
}

export const createAppointment = async (appointmentData: CreateAppointmentData) => {
  try {
    console.log("🚀 Creating appointment with data:", appointmentData);
    
    // Validate required fields
    if (!appointmentData.patient) {
      throw new Error("Patient ID is required");
    }
    
    if (!appointmentData.doctor) {
      throw new Error("Doctor ID is required");
    }
    
    if (!appointmentData.dateTime) {
      throw new Error("Appointment date and time is required");
    }

    // Clean and format the data
    const cleanData = {
      patient: appointmentData.patient,
      doctor: appointmentData.doctor,
      dateTime: appointmentData.dateTime.toString(),
      ...(appointmentData.note && { note: appointmentData.note }),
    };

    console.log("📤 Sending cleaned data:", cleanData);

    const response = await axiosInstance.post("/appointments", cleanData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Appointment created successfully:", response.data);
    console.log("✅ Response status:", response.status);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error in createAppointment API:", error);
    
    if (error.response) {
      console.error("❌ Response error:", error.response.data);
      console.error("❌ Response status:", error.response.status);
      throw error; // Re-throw to preserve the original error
    } else if (error.request) {
      console.error("❌ Request error:", error.request);
      throw new Error("Network error - unable to reach server");
    } else {
      console.error("❌ Setup error:", error.message);
      throw error;
    }
  }
};
