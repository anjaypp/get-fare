import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

// Create an Axios instance
const axiosClient = axios.create({
  baseURL: baseURL, 
  headers: {
    "Content-Type": "application/json",
  },
    withCredentials: true,
});


// Response interceptor (optional: handle errors globally)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response.data);
    } else {
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
