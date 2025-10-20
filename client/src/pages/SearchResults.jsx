import React, { Suspense, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../axios-client";
import LoadingModal from "../components/LoadingModal";
import SearchSummary from "../components/SearchSummary";
import FlightSortBar from "../components/FlightSortBar";
import CacheTimeoutModal from "../components/CacheTimeoutModal";
const FlightCard = React.lazy(() => import("../components/FlightCard"));
import FlightFilter from "../components/FlightFilter";
import toast from "react-hot-toast";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results } = location.state || {};
  const [currentResults, setCurrentResults] = useState(results || null);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, order: "asc" });

  useEffect(() => {
    if (currentResults && currentResults.flights) {
      setFlights(currentResults.flights);
    }
  }, [currentResults]);

  if (!currentResults || !currentResults.flights) {
    return <p className="p-6">No results found. Please search again.</p>;
  }

  const handleModifySearch = async (formData, tripType) => {
    const journeyType = tripType === "One Way" ? 1 : tripType === "Round Trip" ? 2 : 3;

    setLoading(true);

    try {
      const originDestinations = [
        {
          origin: formData.origin?.code?.toLowerCase() || "",
          destination: formData.destination?.code?.toLowerCase() || "",
          departureDateTime: formData.departure,
        },
      ];

      if (journeyType === 2 && formData.returnDate) {
        originDestinations.push({
          origin: formData.destination?.code?.toLowerCase() || "",
          destination: formData.origin?.code?.toLowerCase() || "",
          departureDateTime: formData.returnDate,
        });
      }

      const payload = {
        journeyType,
        originDestinations,
        adultCount: formData.adults,
        childCount: formData.children,
        infantCount: formData.infants,
        cabinClass: formData.cabin,
        directOnly: formData.direct || false,
      };

      const res = await axiosClient.post("/flights/search", payload);
      const data = res.data?.results || res.data;
      setCurrentResults(data);
      setSortConfig({ key: null, order: "asc" }); // Reset sort on new search
    } catch (err) {
      console.error("Search failed:", err);
      toast.error("Failed to fetch flights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = async (key) => {
    const order = sortConfig.key === key && sortConfig.order === "asc" ? "desc" : "asc";
    setSortConfig({ key, order });

    try {
      const res = await axiosClient.post("/flights/sort", {
        traceId: currentResults.traceId,
        sortBy: key,
        order,
      });
      console.log(res.data.flights);
      setFlights(res.data.flights);
    } catch (err) {
      console.error("Sort failed:", err);
      toast.error("Sorting failed. Please try again.");
    } 
  };

  const handleBook = async (flight, purchaseId) => {
    try {
      setLoading(true);

      const response = await axiosClient.post("/flights/revalidate", {
        traceId: currentResults.traceId,
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
        error.response?.data?.message ||
          "Network or server error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const firstSegGroup = flights[0]?.segGroups?.[0];
  const fromCity = firstSegGroup?.origin || "Origin";
  const toCity = firstSegGroup?.destination || "Destination";


  return (
    <div className="bg-[linear-gradient(300.13deg,#D9D9D9_8.16%,#FAF3DB_52.55%,#F4F4FF_106.01%)]">
    <div className="pt-12 pb-18 max-w-6xl mx-auto">
      <SearchSummary onModify={handleModifySearch} />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters on left */}
        <div className="md:w-1/4">
          <FlightFilter />
        </div>

        {/* Flight cards on right */}
        <div className="md:w-3/4 flex flex-col gap-4">
          <FlightSortBar
            totalFlights={flights.length}
            sortConfig={sortConfig}
            onSort={handleSort}
          />

          {loading ? (
            <p className="p-6 text-center">Loading flights...</p>
          ) : flights.length > 0 ? (
            flights.map((flight, idx) => (
              <Suspense key={flight.id || idx}>
                <FlightCard flight={flight} onBook={handleBook} />
              </Suspense>
            ))
          ) : (
            <p className="p-6">
              No flights with available seats. Try different dates or
              destinations.
            </p>
          )}
        </div>
      </div>

      <LoadingModal
        loading={loading}
        loadingMessage="Checking fare availability..."
      />

      <CacheTimeoutModal fromCity={fromCity} toCity={toCity} cacheTTL={15 * 60 * 1000} />

    </div>
    </div>
  );
};

export default SearchResults;