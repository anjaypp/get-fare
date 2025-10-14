import React, { useState, Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../axios-client";
import LoadingModal from "../components/LoadingModal";
import SearchSummary from "../components/SearchSummary";
import FlightSortBar from "../components/FlightSortBar";
const FlightCard = React.lazy(() => import("../components/FlightCard"));
import FlightFilter from "../components/FlightFliter";
import toast from "react-hot-toast";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const { results } = location.state || {};
  const [loading, setLoading] = useState(false);

  if (!results || !results.flights) {
    return <p className="p-6">No results found. Please search again.</p>;
  }

  const handleBook = async (flight, purchaseId) => {
    try {
      setLoading(true);

      const response = await axiosClient.post("/flights/revalidate", {
        traceId: results.traceId,
        purchaseIds: [String(purchaseId)],
      });

      const revalidation = response.data;

      if (!revalidation?.flights?.length) {
        toast.error("Unable to validate fare. Please try again.");
        return;
      }

      navigate("/flight-review", {
        state: { revalidation, selectedFlight: flight, purchaseId },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Network or server error. Please try again."
      );
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
    <div className="w-full min-h-screen p-12 bg-[linear-gradient(300.13deg,#D9D9D9_8.16%,#FAF3DB_52.55%,#F4F4FF_106.01%)]">
      
      <SearchSummary />
      

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters on left */}
        <div className="md:w-1/4">
          <FlightFilter />
        </div>

        {/* Flight cards on right */}
        <div className="md:w-3/4 flex flex-col gap-4">
          {/* <div className="mb-4">
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
          </div> */}
          <FlightSortBar totalFlights={flightsToShow.length} />

          {flightsToShow.length > 0 ? (
            flightsToShow.map((flight, idx) => (
              <Suspense key={flight.id || idx} fallback={<p>Loading flight...</p>}>
                <FlightCard flight={flight} onBook={handleBook} />
              </Suspense>
            ))
          ) : (
            <p className="p-6">
              No flights with available seats. Try different dates or destinations.
            </p>
          )}
        </div>
      </div>

      <LoadingModal loading={loading} loadingMessage="Checking fare availability..." />
    </div>
  );
};

export default SearchResults;
