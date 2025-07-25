import axios from 'axios';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/waiting-list`;

export async function joinWaitingList(doctorId: string, patientId: string) {
  try {
    const response = await axios.post(`${BASE_URL}/join`, { doctorId, patientId });
    return response.data;
  } catch (error) {
    console.error('Error joining waiting list:', error);
    throw error;
  }
}

export async function getWaitingList(doctorId: string) {
  try {
    const response = await axios.get(`${BASE_URL}?doctorId=${doctorId}`);
    return response;
  } catch (error) {
    console.error('Error fetching waiting list:', error);
    throw error;
  }
}

export async function leaveWaitingList(doctorId: string, patientId: string) {
  try {
    const response = await axios.delete(`${BASE_URL}/leave`, { data: { doctorId, patientId } });
    return response.data;
  } catch (error) {
    console.error('Error leaving waiting list:', error);
    throw error;
  }
}
