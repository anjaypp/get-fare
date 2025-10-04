import React, { useState, Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../axios-client";
const FlightCard = React.lazy(() => import('../components/FlightCard'));
import toast, { Toaster } from "react-hot-toast";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const { results } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  if (!results || !results.flights) {
    return <p className="p-6">No results found. Please search again.</p>;
  }

  const handleBook = async (flight, purchaseId) => {
    try {
      setLoading(true);
      setLoadingMessage("Checking fare availability...");

      const response = await axiosClient.post("/flights/revalidate", {
        traceId: results.traceId,
        purchaseIds: [String(purchaseId)],
      });

      console.log(purchaseId);

      const revalidation = response.data;

      // Defensive check
      if (!revalidation?.flights?.length) {
        toast.error("Unable to validate fare. Please try again.");
        console.log("Revalidation response:", revalidation);
        return;
      }

      const fareGroup = revalidation.flights[0]?.fareGroups?.[0];
      const segInfos = fareGroup?.segInfos || [];

      const hasSeats = segInfos.every((seg) => seg.seatRemaining > 0);

      if (!hasSeats) {
        toast(
          "This flight currently has no available seats. Please proceed with caution or select another option."
        );
      }

      navigate("/flight-review", {
        state: { revalidation, selectedFlight: flight, purchaseId },
      });
    } catch (error) {
      if (error.response) {
        toast.error(
          error.response.data.message || "Server error. Please try again."
        );
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const allFlights = Array.isArray(results.flights[0])
    ? results.flights.flat()
    : results.flights;

  // Apply filter
  const filteredFlights = allFlights.filter((flight) => {
    if (filter === "all") return true;
    if (filter === "direct") return flight.isDirect;
    if (filter === "connecting") return !flight.isDirect;
    return true;
  });

  const flightsToShow = filteredFlights;

  return (
    <div className="relative max-w-4xl mx-auto mt-2">
      <Toaster position="top-center" reverseOrder={false} />

      <h2 className="text-2xl font-bold mb-4">
        Search Results ({flightsToShow.length})
      </h2>

      <div className="mb-4">
        <label className="mr-2 font-medium">Show:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="all">All Flights</option>
          <option value="direct">Direct Flights</option>
          <option value="connecting">Connecting Flights</option>
        </select>
      </div>

      {flightsToShow.length > 0 ? (
        flightsToShow.map((flight, idx) => (
          <FlightCard
            key={flight.id || idx}
            flight={flight}
            onBook={handleBook}
          />
        ))
      ) : (
        <p className="p-6">
          No flights with available seats. Try different dates or destinations.
        </p>
      )}

      {loading && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium">{loadingMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
