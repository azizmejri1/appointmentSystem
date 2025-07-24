"use client";

import React, { useState } from "react";
import { X, Mail, Shield, CheckCircle, AlertCircle } from "lucide-react";

interface EmailVerificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  userType: "doctor" | "patient";
  userId: string;
  onVerificationSuccess: () => void;
}

const EmailVerificationPopup: React.FC<EmailVerificationPopupProps> = ({
  isOpen,
  onClose,
  email,
  userType,
  userId,
  onVerificationSuccess,
}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint =
        userType === "doctor"
          ? `http://localhost:8080/doctors/${userId}/verify-email-code`
          : `http://localhost:8080/patients/${userId}/verify-email-code`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onVerificationSuccess();
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Invalid verification code");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError("");

    try {
      const endpoint =
        userType === "doctor"
          ? `http://localhost:8080/doctors/${userId}/resend-verification`
          : `http://localhost:8080/patients/${userId}/resend-verification`;

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setError("");
        // Show success message temporarily
        setError("New verification code sent to your email!");
        setTimeout(() => setError(""), 3000);
      } else {
        setError("Failed to resend code. Please try again.");
      }
    } catch (error) {
      console.error("Resend error:", error);
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    if (error) setError("");
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Email Verified!
          </h2>
          <p className="text-gray-600">
            Your email has been successfully verified. Welcome to MedSchedule!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Verify Your Email
              </h2>
              <p className="text-sm text-gray-500">Enter the 6-digit code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Email Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Verification code sent to:
            </span>
          </div>
          <p className="text-blue-800 font-mono text-sm">{email}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-digit verification code
            </label>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="000000"
              className="w-full p-4 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tracking-widest"
              maxLength={6}
              autoComplete="off"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                loading || code.length !== 6
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend verification code"}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 text-xs">
            <strong>Note:</strong> The verification code expires in 10 minutes
            for security reasons.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPopup;
