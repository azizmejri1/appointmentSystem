"use client";

import React, { useEffect, useState } from "react";
import { getWaitingList } from "@/api/waitingList";

import Modal from "@/components/ui/Modal";
import { createAppointment } from "@/api/appointment";

interface Patient {
  _id: string;
  patient: {
    _id: string;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
    };
  };
}

const WaitingList: React.FC = () => {
  const [waitingList, setWaitingList] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDoctorId(localStorage.getItem("profileId"));
    }
  }, []);

  useEffect(() => {
    const fetchWaitingList = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!doctorId) {
          setError("Doctor ID not found. Please login again.");
          setLoading(false);
          return;
        }

        console.log("Doctor ID:", doctorId); // Debugging log

        const response = await getWaitingList(doctorId);
        console.log("API Response:", response.data); // Log the API response
        console.log("Full API Response:", response); // Log the full API response object for debugging
        setWaitingList(response.data);
      } catch (err: any) {
        console.error("Error fetching waiting list:", err);
        if (err.response?.status === 409) {
          setError("Patient is already on the waiting list.");
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError(err.message || "Failed to load waiting list.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchWaitingList();
    }
  }, [doctorId]);

  const handleCreateAppointment = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPatient(null);
    setIsModalOpen(false);
  };

  const handleSubmitAppointment = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const patientId = selectedPatient?._id;
    if (!patientId) {
      alert("Patient ID is missing. Cannot create appointment.");
      return;
    }

    const appointmentData = {
      patient: patientId,
      doctor: doctorId,
      dateTime: formData.get("dateTime"),
    };

    console.log("Appointment Data Payload:", appointmentData); // Debugging log

    try {
      await createAppointment(appointmentData);
      alert("Appointment created successfully!");
      closeModal();
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Failed to create appointment. Please try again.");
    }
  };

  if (loading) {
    return <div className="p-4">Loading waiting list...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  console.log("Waiting List Data:", waitingList); // Debugging log for waitingList data

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Waiting List</h1>
      {Array.isArray(waitingList) && waitingList.length === 0 ? (
        <p>No patients on the waiting list.</p>
      ) : Array.isArray(waitingList) ? (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Full Name</th>
              <th className="px-4 py-2 border-b">Email</th>
              <th className="px-4 py-2 border-b">Phone Number</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {waitingList.map((entry) => (
              <tr key={entry._id}>
                <td className="px-4 py-2 border-b">
                  {entry.patient?.user?.firstName || "N/A"}{" "}
                  {entry.patient?.user?.lastName || "N/A"}
                </td>
                <td className="px-4 py-2 border-b">
                  {entry.patient?.user?.email || "N/A"}
                </td>
                <td className="px-4 py-2 border-b">
                  {entry.patient?.user?.phoneNumber || "N/A"}
                </td>
                <td className="px-4 py-2 border-b">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={() => handleCreateAppointment(entry)}
                  >
                    Create Appointment
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading data...</p>
      )}

      {isModalOpen && selectedPatient && (
        <Modal onClose={closeModal}>
          <h2 className="text-xl font-bold mb-4">Create Appointment</h2>
          <form onSubmit={handleSubmitAppointment}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Patient Name
              </label>
              <input
                type="text"
                value={`${selectedPatient.patient.user.firstName} ${selectedPatient.patient.user.lastName}`}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Appointment Date & Time
              </label>
              <input
                type="datetime-local"
                name="dateTime"
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Save Appointment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default WaitingList;
