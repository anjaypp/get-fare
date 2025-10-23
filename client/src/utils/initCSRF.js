import axios from "axios";

axios.defaults.withCredentials = true;

export const initCSRF = async () => {
  try {
    await axios.get(`${import.meta.env.VITE_WEB_BASE_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
  } catch (err) {
    console.error("CSRF init failed:", err);
  }
};
