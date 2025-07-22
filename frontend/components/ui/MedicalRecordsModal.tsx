import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import {
  fetchRecordsByPatient,
  createRecord,
  updateConsultation,
  deleteConsultation,
  MedicalRecord,
  Consultation,
} from "@/api/record";

interface Patient {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: string;
  };
}

interface MedicalRecordsModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
}

interface ConsultationFormData {
  symptoms: string;
  vitalSigns: string;
  diagnosis: string;
  prescription: string;
  visitDate: string;
  visitType: string;
}

const MedicalRecordsModal: React.FC<MedicalRecordsModalProps> = ({
  patient,
  isOpen,
  onClose,
}) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<{
    recordId: string;
    consultation: Consultation;
  } | null>(null);
  const [formData, setFormData] = useState<ConsultationFormData>({
    symptoms: "",
    vitalSigns: "",
    diagnosis: "",
    prescription: "",
    visitDate: new Date().toISOString().slice(0, 16),
    visitType: "consultation",
  });

  useEffect(() => {
    if (isOpen && patient) {
      fetchRecords();
    }
  }, [isOpen, patient]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRecordsByPatient(patient._id);
      setRecords(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to fetch medical records"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const consultationData = {
        ...formData,
        visitDate: new Date(formData.visitDate),
      };

      if (editingConsultation) {
        await updateConsultation(
          editingConsultation.recordId,
          editingConsultation.consultation._id!,
          consultationData
        );
      } else {
        await createRecord(patient._id, consultationData);
      }

      await fetchRecords();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save consultation");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordId: string, consultationId: string) => {
    if (window.confirm("Are you sure you want to delete this consultation?")) {
      try {
        setLoading(true);
        await deleteConsultation(recordId, consultationId);
        await fetchRecords();
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to delete consultation"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (recordId: string, consultation: Consultation) => {
    setEditingConsultation({ recordId, consultation });
    setFormData({
      symptoms: consultation.symptoms,
      vitalSigns: consultation.vitalSigns,
      diagnosis: consultation.diagnosis,
      prescription: consultation.prescription,
      visitDate: new Date(consultation.visitDate).toISOString().slice(0, 16),
      visitType: consultation.visitType,
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      symptoms: "",
      vitalSigns: "",
      diagnosis: "",
      prescription: "",
      visitDate: new Date().toISOString().slice(0, 16),
      visitType: "consultation",
    });
    setShowAddForm(false);
    setEditingConsultation(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAllConsultations = () => {
    return records
      .flatMap((record) =>
        record.consultations.map((consultation) => ({
          ...consultation,
          recordId: record._id,
        }))
      )
      .sort(
        (a, b) =>
          new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
      );
  };

  if (!isOpen) return null;

  return (
    <Modal
      onClose={onClose}
      title={`Medical Records - ${patient.user.firstName} ${patient.user.lastName}`}
      size="xl"
    >
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Patient Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-lg">
              {patient.user.firstName.charAt(0)}
              {patient.user.lastName.charAt(0)}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                {patient.user.firstName} {patient.user.lastName}
              </h3>
              <p className="text-sm text-gray-500">{patient.user.email}</p>
              <p className="text-sm text-gray-500">
                {patient.user.phoneNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Add Record Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            {showAddForm ? "Cancel" : "Add New Record"}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              {editingConsultation
                ? "Edit Consultation"
                : "Add New Consultation"}
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visit Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.visitDate}
                    onChange={(e) =>
                      setFormData({ ...formData, visitDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visit Type
                  </label>
                  <select
                    value={formData.visitType}
                    onChange={(e) =>
                      setFormData({ ...formData, visitType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="consultation">Consultation</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="emergency">Emergency</option>
                    <option value="routine">Routine Check-up</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symptoms
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) =>
                    setFormData({ ...formData, symptoms: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe the patient's symptoms..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vital Signs
                </label>
                <textarea
                  value={formData.vitalSigns}
                  onChange={(e) =>
                    setFormData({ ...formData, vitalSigns: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Blood pressure, temperature, pulse, etc..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis
                </label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) =>
                    setFormData({ ...formData, diagnosis: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Medical diagnosis and findings..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prescription
                </label>
                <textarea
                  value={formData.prescription}
                  onChange={(e) =>
                    setFormData({ ...formData, prescription: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Prescribed medications and instructions..."
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading
                    ? "Saving..."
                    : editingConsultation
                    ? "Update"
                    : "Save"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Records List */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Medical History ({getAllConsultations().length} records)
          </h4>

          {loading && !showAddForm ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Loading records...</span>
            </div>
          ) : getAllConsultations().length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No medical records found
              </h3>
              <p className="text-gray-500">
                Start by adding the first consultation record for this patient.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {getAllConsultations().map((consultation, index) => (
                <div
                  key={consultation._id}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {consultation.visitType}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(consultation.visitDate.toString())}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          handleEdit(consultation.recordId, consultation)
                        }
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(consultation.recordId, consultation._id!)
                        }
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">
                        Symptoms
                      </h5>
                      <p className="text-gray-700 mb-3">
                        {consultation.symptoms}
                      </p>

                      <h5 className="font-medium text-gray-900 mb-1">
                        Vital Signs
                      </h5>
                      <p className="text-gray-700">{consultation.vitalSigns}</p>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">
                        Diagnosis
                      </h5>
                      <p className="text-gray-700 mb-3">
                        {consultation.diagnosis}
                      </p>

                      <h5 className="font-medium text-gray-900 mb-1">
                        Prescription
                      </h5>
                      <p className="text-gray-700">
                        {consultation.prescription}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default MedicalRecordsModal;
