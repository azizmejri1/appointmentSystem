"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  User,
  Edit,
  Save,
  X,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/navbar";
import SignIn from "@/components/signIn";
import SignUp from "@/components/signUp";

const API_URL = "http://localhost:8080";

interface PatientProfile {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: string;
  };
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

interface Appointment {
  _id: string;
  dateTime: string;
  status: string;
  reason?: string;
  doctor: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const router = useRouter();

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    gender: "",
  });

  useEffect(() => {
    document.title = "My Profile - MedSchedule";

    const checkAuth = () => {
      const role = localStorage.getItem("role");
      const userId = localStorage.getItem("userId");
      const profileId = localStorage.getItem("profileId");

      if (role !== "patient" || !userId || !profileId) {
        router.push("/");
        return false;
      }
      return true;
    };

    if (checkAuth()) {
      fetchProfile();
      fetchAppointments();
    }
  }, [router]);

  const fetchProfile = async () => {
    try {
      const profileId = localStorage.getItem("profileId");
      const response = await axios.get(`${API_URL}/patients/${profileId}`);
      setProfile(response.data.data);

      // Initialize edit form with current data
      setEditForm({
        firstName: response.data.data.user.firstName,
        lastName: response.data.data.user.lastName,
        phoneNumber: response.data.data.user.phoneNumber,
        gender: response.data.data.user.gender,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const profileId = localStorage.getItem("profileId");
      const response = await axios.get(
        `${API_URL}/patients/${profileId}/appointments`
      );
      setAppointments(response.data.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const profileId = localStorage.getItem("profileId");
      await axios.put(`${API_URL}/patients/${profileId}`, editForm);
      setMessage("Profile updated successfully");
      setEditing(false);
      fetchProfile();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleResendVerification = async () => {
    try {
      const profileId = localStorage.getItem("profileId");
      await axios.post(`${API_URL}/patients/${profileId}/resend-verification`);
      setMessage("Verification email sent! Check your inbox.");
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      console.error("Error resending verification:", error);
      setError("Failed to send verification email");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleVerifyPhone = async () => {
    try {
      const profileId = localStorage.getItem("profileId");
      await axios.post(`${API_URL}/patients/${profileId}/verify-phone`, {
        phoneNumber: profile?.user.phoneNumber,
      });
      setMessage("Phone number verified successfully");
      fetchProfile();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error verifying phone:", error);
      setError("Failed to verify phone number");
      setTimeout(() => setError(""), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-500";

    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar setShowSignIn={setShowSignIn} setShowSignUp={setShowSignUp} />
        {showSignIn && (
          <SignIn setShowSignIn={setShowSignIn} setShowSignUp={setShowSignUp} />
        )}
        {showSignUp && (
          <SignUp setShowSignIn={setShowSignIn} setShowSignUp={setShowSignUp} />
        )}
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto p-8">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Loading profile...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <Navbar setShowSignIn={setShowSignIn} setShowSignUp={setShowSignUp} />
        {showSignIn && (
          <SignIn setShowSignIn={setShowSignIn} setShowSignUp={setShowSignUp} />
        )}
        {showSignUp && (
          <SignUp setShowSignIn={setShowSignIn} setShowSignUp={setShowSignUp} />
        )}
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto p-8">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unable to load profile. Please try again later.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar setShowSignIn={setShowSignIn} setShowSignUp={setShowSignUp} />
      {showSignIn && (
        <SignIn setShowSignIn={setShowSignIn} setShowSignUp={setShowSignUp} />
      )}
      {showSignUp && (
        <SignUp setShowSignIn={setShowSignIn} setShowSignUp={setShowSignUp} />
      )}

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center text-blue-900 mb-2">
              My Profile
            </h1>
            <p className="text-center text-blue-600">
              Manage your account settings and view your appointments
            </p>
          </div>

          {message && (
            <Alert className="mb-6 border-blue-500 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6 border-red-500 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-blue-100">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-blue-50 p-1">
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  Profile Information
                </TabsTrigger>
                <TabsTrigger
                  value="verification"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  Verification
                </TabsTrigger>
                <TabsTrigger
                  value="appointments"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  My Appointments
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="profile" className="mt-0 space-y-6">
                  <Card className="border-0 shadow-none">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-blue-900">
                            <User className="h-5 w-5 text-blue-600" />
                            Personal Information
                          </CardTitle>
                          <CardDescription>
                            Update your personal details and contact information
                          </CardDescription>
                        </div>
                        {!editing ? (
                          <Button
                            onClick={() => setEditing(true)}
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              onClick={handleUpdateProfile}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditing(false)}
                              variant="outline"
                              size="sm"
                              className="border-gray-300"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          {editing ? (
                            <Input
                              id="firstName"
                              value={editForm.firstName}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  firstName: e.target.value,
                                })
                              }
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-md border">
                              {profile.user.firstName}
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          {editing ? (
                            <Input
                              id="lastName"
                              value={editForm.lastName}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  lastName: e.target.value,
                                })
                              }
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-md border">
                              {profile.user.lastName}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label>Email Address</Label>
                        <div className="p-3 bg-blue-50 rounded-md border border-blue-200 flex items-center justify-between">
                          <span>{profile.user.email}</span>
                          <Badge
                            variant={
                              profile.isEmailVerified ? "default" : "secondary"
                            }
                            className={
                              profile.isEmailVerified ? "bg-blue-600" : ""
                            }
                          >
                            {profile.isEmailVerified
                              ? "Verified"
                              : "Unverified"}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        {editing ? (
                          <Input
                            id="phoneNumber"
                            value={editForm.phoneNumber}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                phoneNumber: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <div className="p-3 bg-blue-50 rounded-md border border-blue-200 flex items-center justify-between">
                            <span>{profile.user.phoneNumber}</span>
                            <Badge
                              variant={
                                profile.isPhoneVerified
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                profile.isPhoneVerified ? "bg-blue-600" : ""
                              }
                            >
                              {profile.isPhoneVerified
                                ? "Verified"
                                : "Unverified"}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        {editing ? (
                          <select
                            id="gender"
                            value={editForm.gender}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                gender: e.target.value,
                              })
                            }
                            className="w-full p-3 border border-blue-200 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        ) : (
                          <div className="p-3 bg-blue-50 rounded-md border border-blue-200 capitalize">
                            {profile.user.gender}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="verification" className="mt-0 space-y-6">
                  <Card className="border-0 shadow-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-900">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        Account Verification
                      </CardTitle>
                      <CardDescription>
                        Verify your email and phone number for enhanced security
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-blue-900">
                              Email Verification
                            </div>
                            <div className="text-sm text-blue-700">
                              {profile.user.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              profile.isEmailVerified ? "default" : "secondary"
                            }
                            className={
                              profile.isEmailVerified ? "bg-blue-600" : ""
                            }
                          >
                            {profile.isEmailVerified
                              ? "✓ Verified"
                              : "Unverified"}
                          </Badge>
                          {!profile.isEmailVerified && (
                            <Button
                              onClick={handleResendVerification}
                              variant="outline"
                              size="sm"
                              className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              Send Verification Email
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Phone className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-blue-900">
                              Phone Verification
                            </div>
                            <div className="text-sm text-blue-700">
                              {profile.user.phoneNumber}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              profile.isPhoneVerified ? "default" : "secondary"
                            }
                            className={
                              profile.isPhoneVerified ? "bg-blue-600" : ""
                            }
                          >
                            {profile.isPhoneVerified
                              ? "✓ Verified"
                              : "Unverified"}
                          </Badge>
                          {!profile.isPhoneVerified && (
                            <Button
                              onClick={handleVerifyPhone}
                              variant="outline"
                              size="sm"
                              className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              Verify Phone
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="appointments" className="mt-0 space-y-6">
                  <Card className="border-0 shadow-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-900">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        My Appointments
                      </CardTitle>
                      <CardDescription>
                        View all your past and upcoming appointments
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {appointments.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="p-4 bg-blue-50 rounded-full inline-flex mb-4">
                            <Calendar className="h-8 w-8 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-medium text-blue-900 mb-2">
                            No appointments found
                          </h3>
                          <p className="text-blue-600 mb-4">
                            You haven't made any appointments yet.
                          </p>
                          <Button
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Browse Doctors
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {appointments.map((appointment) => (
                            <div
                              key={appointment._id}
                              className="border border-blue-200 rounded-lg p-6 bg-blue-50 hover:bg-blue-100 transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <h4 className="font-semibold text-lg text-blue-900">
                                      Dr. {appointment.doctor.user.firstName}{" "}
                                      {appointment.doctor.user.lastName}
                                    </h4>
                                    <Badge
                                      className={`${getStatusColor(
                                        appointment.status
                                      )} text-white`}
                                    >
                                      {appointment.status
                                        ? appointment.status
                                            .charAt(0)
                                            .toUpperCase() +
                                          appointment.status.slice(1)
                                        : "Unknown"}
                                    </Badge>
                                  </div>
                                  <div className="text-blue-700 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      <span>
                                        {formatDate(appointment.dateTime)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4" />
                                      <span>
                                        {appointment.doctor.user.email}
                                      </span>
                                    </div>
                                    {appointment.reason && (
                                      <div className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 mt-0.5" />
                                        <span>
                                          <strong>Reason:</strong>{" "}
                                          {appointment.reason}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
