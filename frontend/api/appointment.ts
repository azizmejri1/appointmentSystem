import axiosInstance from "@/lib/axiosConfig";

export const createAppointment = async (appointmentData: {
  patient: string;
  doctor: string | null;
  dateTime: FormDataEntryValue | null;
}) => {
  const response = await axiosInstance.post("/appointments", appointmentData);
  return response.data;
};
