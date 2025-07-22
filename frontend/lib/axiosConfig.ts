import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/", // Updated to match backend URL
});

export default axiosInstance;
