import { SignInData } from "@/interface/signInData";
import { SignUpData } from "@/interface/signUpData";
import axios from "axios";


const API_URL = "http://localhost:8080";

export async function handleSignIn(data: SignInData) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, data, {
      withCredentials: true,
    });

    console.log("✅ Sign in successful:", response.data);

    const { userId, profileId,firstName,lastName,role } = response.data;

    if (userId) {
      localStorage.setItem('userId', userId);
      localStorage.setItem('profileId',profileId);
      localStorage.setItem('firstName',firstName);
      localStorage.setItem('lastName',lastName);
      localStorage.setItem('role',role);
    }

    return response.data;
  } catch (error) {
    console.error("❌ Sign in failed:", error);
    throw error;
  }
}



export async function handleSignUp(data: SignUpData) {
  const { role, ...rest } = data;

  // prepare payload to match DTO
  const payload = {
    firstName: rest.firstName,
    lastName: rest.lastName,
    email: rest.email,
    password: rest.password,
    gender: rest.gender,
    phoneNumber: rest.phone,
    // ignoring dateOfBirth since DTO does not expect it
  };

  let endpoint = "";

  if (role === "patient") {
    endpoint = "/patients/signup";
  } else if (role === "doctor") {
    endpoint = "/doctors/signup";
  } else {
    throw new Error("Invalid role. Must be 'patient' or 'doctor'.");
  }

  try {
    const response = await axios.post(`${API_URL}${endpoint}`, payload);
    console.log("✅ Sign up success:", response.data);
    return handleSignIn({email: payload.email,password:payload.password});
  } catch (err) {
    console.error("❌ Sign up error:", err);
    throw err;
  }
}
