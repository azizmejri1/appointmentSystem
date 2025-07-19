import { Dispatch, SetStateAction, useState } from "react";
import { X, Mail, Lock, User, Eye, Phone, Calendar } from "lucide-react";
import { handleSignUp } from "@/api/auth";
import { useRouter } from "next/navigation";

export default function SignUp({
  setShowSignIn,
  setShowSignUp,
}: {
  setShowSignIn: Dispatch<SetStateAction<boolean>>;
  setShowSignUp: Dispatch<SetStateAction<boolean>>;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    role: "",
  });

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sign Up:", signUpData);
    // Handle sign up logic here
    const data = await handleSignUp(signUpData);
    if (data.role == "patient") {
      window.location.reload();
    } else {
      router.push("/doctor/dashboard");
    }
  };

  const switchToSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className="px-6 py-4 flex justify-between items-center"
          style={{ backgroundColor: "#0d78d3" }}
        >
          <h2 className="text-white font-semibold text-xl">Create Account</h2>
          <button
            onClick={() => setShowSignUp(false)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSignUpSubmit} className="p-6">
          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={signUpData.firstName}
                    onChange={(e) =>
                      setSignUpData({
                        ...signUpData,
                        firstName: e.target.value,
                      })
                    }
                    placeholder="First name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    onFocus={(e) =>
                      (e.target.style.boxShadow = `0 0 0 2px rgba(13, 120, 211, 0.2)`)
                    }
                    onBlur={(e) => (e.target.style.boxShadow = "")}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={signUpData.lastName}
                    onChange={(e) =>
                      setSignUpData({ ...signUpData, lastName: e.target.value })
                    }
                    placeholder="Last name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    onFocus={(e) =>
                      (e.target.style.boxShadow = `0 0 0 2px rgba(13, 120, 211, 0.2)`)
                    }
                    onBlur={(e) => (e.target.style.boxShadow = "")}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={signUpData.email}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, email: e.target.value })
                  }
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  onFocus={(e) =>
                    (e.target.style.boxShadow = `0 0 0 2px rgba(13, 120, 211, 0.2)`)
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "")}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={signUpData.phone}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, phone: e.target.value })
                  }
                  placeholder="Enter your phone number"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  onFocus={(e) =>
                    (e.target.style.boxShadow = `0 0 0 2px rgba(13, 120, 211, 0.2)`)
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={signUpData.password}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, password: e.target.value })
                  }
                  placeholder="Create a password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  onFocus={(e) =>
                    (e.target.style.boxShadow = `0 0 0 2px rgba(13, 120, 211, 0.2)`)
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <div className="relative">
                <select
                  value={signUpData.gender}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, gender: e.target.value })
                  }
                  className="appearance-none w-full py-3 pl-4 pr-10 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0d78d3] focus:border-transparent transition-all duration-200 hover:border-gray-400"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="relative">
                <select
                  value={signUpData.role}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, role: e.target.value })
                  }
                  className="appearance-none w-full py-3 pl-4 pr-10 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0d78d3] focus:border-transparent transition-all duration-200 hover:border-gray-400"
                >
                  <option value="">Select role</option>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: "#0d78d3" }}
            >
              Create Account
            </button>

            {/* Switch */}
            <div className="text-center">
              <span className="text-gray-600">Already have an account? </span>
              <button
                type="button"
                onClick={switchToSignIn}
                className="font-semibold hover:underline"
                style={{ color: "#0d78d3" }}
              >
                Sign In
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
