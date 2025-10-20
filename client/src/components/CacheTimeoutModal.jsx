import React, { useState, useEffect } from "react";
import { GiSandsOfTime } from "react-icons/gi";
import { useNavigate } from "react-router-dom";

const CacheTimeoutModal = ({ fromCity, toCity, cacheTTL = 15 * 60 * 1000 }) => {
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

  if (!showModal) return null; // Don’t render anything until modal is triggered

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg max-w-md text-center shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Session Expired</h2>
        <GiSandsOfTime className="mx-auto my-4" size={70}/>
        <p className="mb-2 font-semibold">Timed Out</p>
        <p className="mb-4">
          Still interested in flying from <strong>{fromCity}</strong> to <strong>{toCity}</strong>?
        </p>
        <p className="mb-6">
          We noticed you have been inactive for a while. Please go back to homepage to search again.
        </p>
        <button
          onClick={handleGoHome}
          className="bg-indigo-950 text-white px-4 py-2 rounded hover:bg-indigo-900 transition"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
};

export default CacheTimeoutModal;
