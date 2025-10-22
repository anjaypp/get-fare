import React, { useState, useEffect } from "react";
import { GiSandsOfTime } from "react-icons/gi";
import { useNavigate } from "react-router-dom";

const CacheTimeoutModal = ({
  fromCity,
  toCity,
  cacheTTL = 15 * 60 * 1000,
  onRefresh,
}) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Start the timer when component mounts
    const timer = setTimeout(() => {
      setShowModal(true);
    }, cacheTTL);

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [cacheTTL]);

  const handleGoHome = () => {
    navigate("/"); // Go back to homepage
  };

  const handleRefresh = () => {
  if (typeof onRefresh === "function") {
    onRefresh(); // Run the refresh logic
  }
  setShowModal(false); // Close the modal
};


  if (!showModal) return null; // Don’t render anything until modal is triggered

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg max-w-md text-center shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Session Expired</h2>
        <GiSandsOfTime className="mx-auto my-4" size={70} />
        <p className="mb-2 font-semibold">Timed Out</p>
        <p className="mb-4">
          Still interested in flying from <strong>{fromCity}</strong> to{" "}
          <strong>{toCity}</strong>?
        </p>
        <p className="mb-6">
          We noticed you have been inactive for a while. Please go back to
          homepage to search again.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleGoHome}
            className="border border-indigo-950 bg-white text-indigo-950 px-4 py-2 rounded hover:bg-indigo-900 hover:text:white transition"
          >
            Go to Homepage
          </button>
          <button
            className="px-4 py-2 bg-indigo-950 text-white rounded hover:bg-indigo-900 transition"
            onClick={handleRefresh}
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default CacheTimeoutModal;
