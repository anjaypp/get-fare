import React, { Suspense, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import axiosClient from "../../axios-client";
import LineLoader from "../components/LineLoader";
import SearchSummary from "../components/SearchSummary";
import FlightSkeleton from "../components/FlightSkeleton";
import FlightSortBar from "../components/FlightSortBar";
import CacheTimeoutModal from "../components/CacheTimeoutModal";
import fetchFlights from "../utils/fetchFlights";
const FlightCard = React.lazy(() => import("../components/FlightCard"));
import FlightFilter from "../components/FlightFilter";
import toast from "react-hot-toast";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const payload = location.state; // payload from homepage or modified search
  const [searchPayload, setSearchPayload] = useState(location.state); // store both initial and modified payload
  const [currentResults, setCurrentResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, order: "asc" });

  // Infinite scroll sentinel
  const { ref: sentinelRef, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
    rootMargin: "100px",
  });

  // Infinite query for pagination (starts after initial fetch)
  const queryResult = useInfiniteQuery({
    queryKey: ["flights-paginate", currentResults?.traceId, sortConfig],
    queryFn: async ({ pageParam = 2 }) => {
      const params = {
        traceId: currentResults.traceId,
        page: pageParam,
        limit: 10,
      };
      const res = await axiosClient.get("/flights/paginate", { params });
      return res.data;
    },
    initialPageParam: 2,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.pagination?.totalPages > pages.length + 1
        ? pages.length + 2
        : undefined;
    },
    enabled: !!currentResults?.traceId,
  });

  const {
    data: paginatedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error: queryError,
  } = queryResult;

  // Flatten paginated flights (appended to initial)
  const paginatedFlights =
    paginatedData?.pages?.flatMap((page, idx) =>
      idx === 0 ? [] : page.flights
    ) || [];

  const flights = [...(currentResults?.flights || []), ...paginatedFlights];

  const totalFlights = currentResults?.pagination?.total || 0;

  // Trigger next page on sentinel view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Fetch flights when payload is available (initial call)
  useEffect(() => {
    if (payload) {
      fetchFlights(payload, setCurrentResults, setLoading);
    }
  }, [payload]);

  // Update flights whenever currentResults changes (initial)
  useEffect(() => {
    if (currentResults?.flights) {
      // Invalidate pagination query to reset on new initial
      queryClient.invalidateQueries({ queryKey: ["flights-paginate"] });
    }
  }, [currentResults, queryClient]);

  const handleModifySearch = async (formData, tripType) => {
    const journeyType =
      tripType === "One Way" ? 1 : tripType === "Round Trip" ? 2 : 3;

    setLoading(true);

    const originDestinations = [
      {
        origin: formData.origin?.code?.toLowerCase() || "",
        destination: formData.destination?.code?.toLowerCase() || "",
        originCity: formData.origin?.city || "",
        destinationCity: formData.destination?.city || "",
        departureDateTime: formData.departure,
      },
    ];

    if (journeyType === 2 && formData.returnDate) {
      originDestinations.push({
        origin: formData.destination?.code?.toLowerCase() || "",
        destination: formData.origin?.code?.toLowerCase() || "",
        originCity: formData.origin?.city || "",
        destinationCity: formData.destination?.city || "",
        departureDateTime: formData.returnDate,
      });
    }

    const newPayload = {
      journeyType,
      originDestinations,
      adultCount: formData.adults,
      childCount: formData.children,
      infantCount: formData.infants,
      cabinClass: formData.cabin,
      directOnly: formData.direct || false,
    };

    setSearchPayload(newPayload);
    setSortConfig({ key: null, order: "asc" });
    await fetchFlights(newPayload, setCurrentResults, setLoading);
  };

  const handleSort = async (key) => {
    const order =
      sortConfig.key === key && sortConfig.order === "asc" ? "desc" : "asc";
    setSortConfig({ key, order });

    try {
      const res = await axiosClient.post("/flights/sort", {
        traceId: currentResults.traceId,
        sortBy: key,
        order,
      });
      setCurrentResults((prev) => ({ ...prev, flights: res.data.flights })); // Update initial flights for sort
      // Invalidate pagination to re-append with new order (if backend sort updates cache)
      queryClient.invalidateQueries({ queryKey: ["flights-paginate"] });
    } catch (err) {
      console.error("Sort failed:", err);
      toast.error("Sorting failed. Please try again.");
    }
  };

  const handleBook = async (flight, purchaseId) => {
    navigate("/flight-review", {
      state: {
        traceId: currentResults.traceId,
        purchaseId,
        selectedFlight: flight
      },
    });
  };

  const summaryData = searchPayload
    ? {
        origin: {
          code: searchPayload.originDestinations[0].origin.toUpperCase(),
          city: searchPayload.originDestinations[0].originCity, // use city from payload
        },
        destination: {
          code: searchPayload.originDestinations[0].destination.toUpperCase(),
          city: searchPayload.originDestinations[0].destinationCity,

        },
        departure: new Date(
          searchPayload.originDestinations[0].departureDateTime
        ),
        returnDate:
          searchPayload.journeyType === 2 && searchPayload.originDestinations[1]
            ? new Date(searchPayload.originDestinations[1].departureDateTime)
            : null,
        adults: searchPayload.adultCount,
        children: searchPayload.childCount,
        infants: searchPayload.infantCount,
        travellers:
          searchPayload.adultCount +
          searchPayload.childCount +
          searchPayload.infantCount,
        cabin: searchPayload.cabinClass || "Economy",
        direct: searchPayload.directOnly || false,
      }
    : null;

  const firstSegGroup = flights[0]?.segGroups?.[0];
  const fromCity = firstSegGroup?.origin || "Origin";
  const toCity = firstSegGroup?.destination || "Destination";

  return (
    <div className="bg-[linear-gradient(300.13deg,#D9D9D9_8.16%,#FAF3DB_52.55%,#F4F4FF_106.01%)]">
      <LineLoader loading={loading || isFetchingNextPage} />
      <div className="pt-12 pb-18 max-w-6xl mx-auto">
        <SearchSummary value={summaryData} onModify={handleModifySearch} />

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters on left */}
          <div className="md:w-1/4">
            <FlightFilter />
          </div>

          {/* Flight cards on right */}
          <div className="md:w-3/4 flex flex-col gap-4">
            <FlightSortBar
              totalFlights={currentResults?.totalFlights || totalFlights}
              sortConfig={sortConfig}
              onSort={handleSort}
            />

            {loading ? (
              <FlightSkeleton count={3} />
            ) : flights.length > 0 ? (
              <>
                {flights.map((flight, idx) => (
                  <Suspense key={flight.id || idx}>
                    <FlightCard flight={flight} onBook={handleBook} />
                  </Suspense>
                ))}
                {/* Sentinel for infinite scroll */}
                {hasNextPage && (
                  <div ref={sentinelRef} className="w-full">
                    {isFetchingNextPage && (
                      <>
                        <div className="mt-4">
                          <FlightSkeleton count={2} />
                        </div>
                        <div className="pb-12"></div>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : isError ? (
              <p className="p-6 text-center text-red-500">
                {queryError?.message || "Unknown error"}. Please try again.
              </p>
            ) : (
              <p className="p-6">
                No flights with available seats. Try different dates or
                destinations.
              </p>
            )}
          </div>
        </div>

        <CacheTimeoutModal
          fromCity={fromCity}
          toCity={toCity}
          cacheTTL={15 * 60 * 1000}
          onRefresh={() =>
            fetchFlights(searchPayload, setCurrentResults, setLoading)
          }
        />
      </div>
    </div>
  );
};

export default SearchResults;
