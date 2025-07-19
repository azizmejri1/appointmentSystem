import axios from "axios";
const API_URL = "http://localhost:8080";

export async function isLoggedIn() {
  try {
    const res = await axios.get(`${API_URL}/auth/profile`, {
      withCredentials: true, 
    });

    console.log(res.data.loggedIn)
    return await res.data.loggedIn;
  } catch (err) {
    console.error(err);
    return { loggedIn: false };
  }
}

export async function logout(): Promise<{ message: string }> {
  try {
    const res = await axios.post(`${API_URL}/auth/logout`, {}, {
      withCredentials: true, // send cookies
    });

    console.log(res.data);
    return res.data; // expected: { message: 'Logged out' }
  } catch (err) {
    console.error(err);
    return { message: "Failed to log out" };
  }
}