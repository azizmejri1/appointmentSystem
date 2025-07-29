"use client";

import React, { useState, useEffect } from "react";
import {
  fetchDoctorProfile,
  updateDoctorProfile,
  uploadCredentials,
  verifyPhoneNumber,
  verifyEmail,
} from "@/api/doctor";
import { Doctor } from "@/interface/doctor";
import LocationPicker from "@/components/ui/LocationPicker";

interface SettingsTab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const tabs: SettingsTab[] = [
  {
    id: "profile",
    name: "Profile Information",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    id: "credentials",
    name: "Credentials & Verification",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: "location",
    name: "Location & Contact",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    id: "keywords",
    name: "Keywords & Specialties",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    ),
  },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    speciality: "",
    description: "",
  });

  const [locationForm, setLocationForm] = useState({
    city: "",
    adress: "",
    location_maps: "",
  });

  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [credentialFile, setCredentialFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const doctorId = localStorage.getItem("profileId");
      if (!doctorId) {
        setError("Doctor ID not found. Please login again.");
        return;
      }

      const doctorData = await fetchDoctorProfile(doctorId);
      setDoctor(doctorData);

      // Populate forms
      setProfileForm({
        firstName: doctorData.user.firstName || "",
        lastName: doctorData.user.lastName || "",
        email: doctorData.user.email || "",
        phoneNumber: doctorData.user.phoneNumber || "",
        gender: doctorData.user.gender || "",
        speciality: doctorData.speciality || "",
        description: doctorData.description || "",
      });

      setLocationForm({
        city: doctorData.city || "",
        adress: doctorData.adress || "",
        location_maps: doctorData.location_maps || "",
      });

      setKeywords(doctorData.keywords || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch doctor data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const doctorId = localStorage.getItem("profileId");
      if (!doctorId) return;

      await updateDoctorProfile(doctorId, profileForm);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
      await fetchDoctorData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const doctorId = localStorage.getItem("profileId");
      if (!doctorId) return;

      await updateDoctorProfile(doctorId, locationForm);
      setSuccess("Location updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
      await fetchDoctorData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update location");
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordsUpdate = async () => {
    try {
      setLoading(true);
      setError(null);
      const doctorId = localStorage.getItem("profileId");
      if (!doctorId) return;

      await updateDoctorProfile(doctorId, { keywords });
      setSuccess("Keywords updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update keywords");
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleCredentialUpload = async () => {
    if (!credentialFile) return;

    try {
      setLoading(true);
      setError(null);
      const doctorId = localStorage.getItem("profileId");
      if (!doctorId) return;

      // Convert file to base64 or handle file upload
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          await uploadCredentials(doctorId, credentialFile);
          setSuccess("Credentials uploaded successfully!");
          setTimeout(() => setSuccess(null), 3000);
          await fetchDoctorData();
        } catch (err: any) {
          setError(
            err.response?.data?.message || "Failed to upload credentials"
          );
        }
      };
      reader.readAsDataURL(credentialFile);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload credentials");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerification = async () => {
    try {
      setLoading(true);
      setError(null);
      const doctorId = localStorage.getItem("profileId");
      if (!doctorId) return;

      await verifyPhoneNumber(doctorId, profileForm.phoneNumber);
      setSuccess("Phone verification initiated!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to verify phone");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerification = async () => {
    try {
      setLoading(true);
      setError(null);
      const doctorId = localStorage.getItem("profileId");
      if (!doctorId) return;

      await verifyEmail(doctorId);
      setSuccess("Email verification sent!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to verify email");
    } finally {
      setLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        Personal Information
      </h3>

      {/* Profile Picture */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-2xl">
            {profileForm.firstName.charAt(0)}
            {profileForm.lastName.charAt(0)}
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Profile Picture
            </h4>
            <p className="text-sm text-gray-500">Upload a professional photo</p>
            <button className="mt-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              Change Photo
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleProfileUpdate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={profileForm.firstName}
              onChange={(e) =>
                setProfileForm({ ...profileForm, firstName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={profileForm.lastName}
              onChange={(e) =>
                setProfileForm({ ...profileForm, lastName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={profileForm.email}
            onChange={(e) =>
              setProfileForm({ ...profileForm, email: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={profileForm.phoneNumber}
              onChange={(e) =>
                setProfileForm({ ...profileForm, phoneNumber: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              value={profileForm.gender}
              onChange={(e) =>
                setProfileForm({ ...profileForm, gender: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Speciality
          </label>
          <input
            type="text"
            value={profileForm.speciality}
            onChange={(e) =>
              setProfileForm({ ...profileForm, speciality: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Cardiology, Dermatology"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={profileForm.description}
            onChange={(e) =>
              setProfileForm({ ...profileForm, description: e.target.value })
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell patients about yourself, your experience, and approach to healthcare..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );

  const renderCredentialsTab = () => (
    <div className="space-y-6">
      {/* Verification Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Verification Status
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  doctor?.verified ? "bg-green-500" : "bg-yellow-500"
                }`}
              ></div>
              <span className="text-sm font-medium">Account Verification</span>
            </div>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                doctor?.verified
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {doctor?.verified ? "Verified" : "Pending"}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium">Email Verification</span>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  doctor?.emailVerified
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {doctor?.emailVerified ? "Verified" : "Not Verified"}
              </span>
              <button
                onClick={handleEmailVerification}
                disabled={loading}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {doctor?.emailVerified ? "Re-verify" : "Verify Email"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="text-sm font-medium">Phone Verification</span>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  doctor?.phoneVerified
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {doctor?.phoneVerified ? "Verified" : "Not Verified"}
              </span>
              <button
                onClick={handlePhoneVerification}
                disabled={loading || !profileForm.phoneNumber}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {doctor?.phoneVerified ? "Re-verify" : "Verify Phone"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Credentials Upload */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Medical Credentials
        </h3>

        {doctor?.credential_img && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-green-800">
                Credentials uploaded successfully
              </span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Medical License/Certificate
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mt-4">
                <label htmlFor="credential-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload a file
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    PNG, JPG, PDF up to 10MB
                  </span>
                </label>
                <input
                  id="credential-upload"
                  name="credential-upload"
                  type="file"
                  className="sr-only"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={(e) =>
                    setCredentialFile(e.target.files?.[0] || null)
                  }
                />
              </div>
            </div>
          </div>

          {credentialFile && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">
                {credentialFile.name}
              </span>
              <button
                onClick={handleCredentialUpload}
                disabled={loading}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLocationTab = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        Location & Contact Information
      </h3>

      <form onSubmit={handleLocationUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            value={locationForm.city}
            onChange={(e) =>
              setLocationForm({ ...locationForm, city: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your city"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            value={locationForm.adress}
            onChange={(e) =>
              setLocationForm({ ...locationForm, adress: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your full address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Google Maps Link
          </label>
          <input
            type="url"
            value={locationForm.location_maps}
            onChange={(e) =>
              setLocationForm({
                ...locationForm,
                location_maps: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://maps.google.com/..."
          />
          <p className="mt-1 text-sm text-gray-500">
            This will help patients find your clinic location easily
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Updating..." : "Update Location"}
        </button>
      </form>
    </div>
  );

  const renderKeywordsTab = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        Keywords & Specialties
      </h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Keywords
          </label>
          <p className="text-sm text-gray-500 mb-4">
            Add keywords that patients might use to find you (e.g., "heart
            specialist", "skin problems", "pediatric care")
          </p>

          <div className="flex space-x-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addKeyword()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a keyword"
            />
            <button
              type="button"
              onClick={addKeyword}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Keywords Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Keywords ({keywords.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>

          {keywords.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              No keywords added yet
            </p>
          )}
        </div>

        <button
          onClick={handleKeywordsUpdate}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : "Save Keywords"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your profile, credentials, and account settings
        </p>
      </div>

      {/* Success/Error Messages */}
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

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-400 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        </div>
      )}

      <div className="flex space-x-6">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white rounded-lg border border-gray-200 p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                <span className="text-sm font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {loading && !doctor ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : (
            <>
              {activeTab === "profile" && renderProfileTab()}
              {activeTab === "credentials" && renderCredentialsTab()}
              {activeTab === "location" && renderLocationTab()}
              {activeTab === "keywords" && renderKeywordsTab()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
