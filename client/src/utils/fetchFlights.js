// src/utils/fetchFlights.js
import axiosClient from "../../axios-client";
import toast from "react-hot-toast";

const fetchFlights = async (payload, setCurrentResults, setLoading) => {
  if (!payload) return;

  setLoading(true);
  try {
    const res = await axiosClient.post("/flights/search", payload);
    const data = res.data?.results || res.data;
    console.log("Fetched flight results:", data);
    setCurrentResults(data);
  } catch (err) {
    console.error("Search failed:", err);
    toast.error("Failed to fetch flights. Please try again.");
  } finally {
    setLoading(false);
  }
};


export default fetchFlights;
