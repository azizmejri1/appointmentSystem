import { Dispatch, SetStateAction, useState } from "react";
import { X, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { handleSignIn } from "@/api/auth";
import { useRouter } from "next/navigation";

export default function SignIn({
  setShowSignIn,
  setShowSignUp,
}: {
  setShowSignIn: Dispatch<SetStateAction<boolean>>;
  setShowSignUp: Dispatch<SetStateAction<boolean>>;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();
  const switchToSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors

    try {
      const data = await handleSignIn(signInData);
      setShowSignIn(false);
      if (data.role == "patient") {
        window.location.reload();
      } else {
        router.push("/doctor/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      // Set user-friendly error message
      if (err.response?.status === 401) {
        setErrorMessage("Invalid email or password. Please try again.");
      } else if (err.response?.status === 403) {
        setErrorMessage(
          "Account not verified. Please check your email for verification link."
        );
      } else if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full mx-4">
        {/* Header */}
        <div
          className="px-6 py-4 flex justify-between items-center"
          style={{ backgroundColor: "#0d78d3" }}
        >
          <h2 className="text-white font-semibold text-xl">Sign In</h2>
          <button
            onClick={() => setShowSignIn(false)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSignInSubmit} className="p-6">
          <div className="space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={signInData.email}
                  onChange={(e) =>
                    setSignInData({ ...signInData, email: e.target.value })
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

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={signInData.password}
                  onChange={(e) =>
                    setSignInData({ ...signInData, password: e.target.value })
                  }
                  placeholder="Enter your password"
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
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm"
                style={{ color: "#0d78d3" }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: "#0d78d3" }}
            >
              Sign In
            </button>

            {/* Switch to Sign Up */}
            <div className="text-center">
              <span className="text-gray-600">Don't have an account? </span>
              <button
                type="button"
                onClick={switchToSignUp}
                className="font-semibold hover:underline"
                style={{ color: "#0d78d3" }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
