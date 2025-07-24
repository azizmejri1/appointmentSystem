"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

export default function VerifyEmail() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    document.title = "Email Verification - MedSchedule";

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/doctors/verify-email/${verificationToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
      } else {
        setStatus("error");
        setMessage(data.message || "Verification failed. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  };

  const resendVerification = async () => {
    // This would require the doctor ID, which we don't have here
    // In a real implementation, you might want to redirect to a resend page
    setMessage("Please contact support for a new verification email.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Header */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email Verification
            </h1>
            <p className="text-gray-600">
              We're verifying your email address...
            </p>
          </div>

          {/* Status Content */}
          <div className="mb-6">
            {status === "loading" && (
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Verifying your email...</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-green-600 mb-2">
                  Verification Successful!
                </h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <p className="text-sm text-gray-500 mb-4">
                  Your account is now verified and you can start using
                  MedSchedule.
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-red-600 mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <p className="text-sm text-gray-500 mb-4">
                  The verification link may be expired or invalid.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === "success" && (
              <a
                href="/doctor/dashboard"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Go to Dashboard
              </a>
            )}

            {status === "error" && (
              <div className="space-y-3">
                <button
                  onClick={resendVerification}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Request New Verification Email
                </button>
                <a
                  href="/auth/signin"
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors inline-block"
                >
                  Back to Sign In
                </a>
              </div>
            )}

            <a
              href="/"
              className="w-full text-gray-600 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors inline-block"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
