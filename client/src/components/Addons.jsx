import React, { useState } from "react";
import { IoBagRemoveSharp } from "react-icons/io5";
import { GiHotMeal } from "react-icons/gi";
import { MdAirlineSeatReclineExtra } from "react-icons/md";
import axiosClient from "../../axios-client";
import toast from "react-hot-toast";

const Addons = ({traceId, purchaseId}) => {

  const [loading, setLoading] = useState(false);
  const [seatData, setSeatData] = useState(null);

  const handleSeatAndMeals = async () => {
    
    if (!traceId || !purchaseId) {
      toast.error("Missing booking details");
      return;
    }

    setLoading(true);
    try {
      const body = {
        traceId: traceId,
        purchaseIds: [String(purchaseId)],
      };

      const res = await axiosClient.post("/flights/seat", body);
    

      if (res.data) {
        setSeatData(res.data);
        toast.success("Seat layout loaded successfully!");
      } else {
        toast.error("No seat layout available for this flight.");
      }
    } catch (err) {
      console.error("Seat layout error:", err);
      toast.error(
        err.response?.data?.message || "Failed to load seat layout."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="flex flex-row space-x-4">
        <button className="flex items-center justify-center w-full p-3 bg-white border border-indigo-900 text-indigo-900 rounded-lg transition-all duration-200 hover:bg-indigo-900 hover:text-white hover:shadow-md cursor-pointer">
          <IoBagRemoveSharp className="w-5 h-5 mr-2" />
          Add Baggage
        </button>

        <button
          onClick={handleSeatAndMeals}
          className="flex items-center justify-center w-full p-3 bg-white border border-indigo-900 text-indigo-900 rounded-lg transition-all duration-200 hover:bg-indigo-900 hover:text-white hover:shadow-md cursor-pointer"
        >
          <GiHotMeal className="w-5 h-5 mr-2" />
          {loading ? "Loading..." : "Add Meals"}
        </button>

        <button
          onClick={handleSeatAndMeals}
          className="flex items-center justify-center w-full p-3 bg-white border border-indigo-900 text-indigo-900 rounded-lg transition-all duration-200 hover:bg-indigo-900 hover:text-white hover:shadow-md cursor-pointer"
        >
          <MdAirlineSeatReclineExtra className="w-5 h-5 mr-2" />
          {loading ? "Loading..." : "Add Seat"}
        </button>
      </div>

      {/* Optional: Display the seat data */}
      {seatData && (
        <pre className="mt-4 text-sm bg-gray-100 p-3 rounded overflow-x-auto">
          {JSON.stringify(seatData, null, 2)}
        </pre>
      )}

    </div>
  );
};

export default Addons;
