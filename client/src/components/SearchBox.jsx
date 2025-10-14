import React, { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { HiArrowsRightLeft } from "react-icons/hi2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AutocompleteSelect from "./AutoCompleteSelect";
import CustomDateInput from "../components/CustomDateInput";
import LoadingModal from "./LoadingModal";
import axiosClient from "../../axios-client";
import { useNavigate } from "react-router-dom";

// Hook to detect clicks outside an element
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

// Format Date to ISO string for API
const formatDateISO = (date) => date.toISOString().slice(0, 19);

export default function SearchFlight() {
  const navigate = useNavigate();
  const travellerRef = useRef(null);
  useClickOutside(travellerRef, () => setShowTravellerDialog(false));

  const [journeyType, setJourneyType] = useState(1); // 1: OneWay, 2: RoundTrip, 3: Multi
  const [loading, setLoading] = useState(false);
  const [showTravellerDialog, setShowTravellerDialog] = useState(false);

  const [formData, setFormData] = useState(() => {
    const today = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(today.getDate() + 7);

    return {
      origin: null, // Store full airport object
      destination: null, // Store full airport object
      departure: formatDateISO(today),
      returnDate: formatDateISO(oneWeekFromNow),
      adults: 1,
      children: 0,
      infants: 0,
      travellers: 1,
      cabin: "Economy",
      direct: false,
    };
  });

  // Update form data for input changes
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Update departure and return dates
  const handleDepartureChange = (date) =>
    setFormData((prev) => ({ ...prev, departure: formatDateISO(date) }));
  const handleReturnChange = (date) =>
    setFormData((prev) => ({ ...prev, returnDate: formatDateISO(date) }));

  // Update travellers & auto-calculate total
  const updateTravellers = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: Math.max(0, value) };
      updated.travellers = updated.adults + updated.children + updated.infants;
      return updated;
    });
  };

  // Swap origin and destination
  const handleSwap = () => {
    setFormData((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
    }));
  };

  // Handle Search
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build originDestinations
      let originDestinations = [
        {
          origin: formData.origin?.code?.toLowerCase() || "",
          destination: formData.destination?.code?.toLowerCase() || "",
          departureDateTime: formData.departure,
        },
      ];

      // Add return leg for round-trip
      if (journeyType === 2 && formData.returnDate) {
        originDestinations.push({
          origin: formData.destination?.code?.toLowerCase() || "",
          destination: formData.origin?.code?.toLowerCase() || "",
          departureDateTime: formData.returnDate,
        });
      }

      // For multi-city, push additional legs into originDestinations

      const payload = {
        journeyType, // 1: OneWay, 2: RoundTrip, 3: Multi
        originDestinations,
        adultCount: formData.adults,
        childCount: formData.children,
        infantCount: formData.infants,
        cabinClass: formData.cabin,
        directOnly: formData.direct,
      };

      const res = await axiosClient.post("/flights/search", payload);
      const data = res.data?.results || res.data;
      console.log(data);
      navigate("/results", { state: { results: data } });
    } catch (err) {
      console.error("Search failed:", err);
      alert("Failed to fetch flights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center p-12">
      <div className="bg-white w-full max-w-6xl h-fit rounded-2xl shadow p-6">
        {/* Journey Type Tabs */}
        <div className="flex gap-4 mb-6">
          {[
            { id: 1, label: "One Way" },
            { id: 2, label: "Round Trip" },
            { id: 3, label: "Multi City" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setJourneyType(opt.id)}
              className={`px-6 py-2 rounded-full font-medium border transition cursor-pointer ${
                journeyType === opt.id
                  ? "bg-indigo-900 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSubmit}
          className={`grid ${
            journeyType === 1 || journeyType === 2
              ? "grid-cols-5"
              : "grid-cols-4"
          }`}
        >
          {/* Origin & Destination */}
          <div className="col-span-2 relative flex items-center space-x-2">
            <div className="flex-1 rounded-l-2xl  p-4 border-1 border-gray-300">
              <label className="text-xs font-medium text-indigo-900">
                FROM
              </label>
              <AutocompleteSelect
                key={`origin-${formData.origin?.code || "empty"}`}
                type="airport"
                placeholder=""
                value={formData.origin}
                onSelect={(item) => {
                  setFormData((prev) => ({
                    ...prev,
                    origin: item, // Store full object
                  }));
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleSwap}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-md p-3 z-10 transition-colors cursor-pointer"
            >
              <HiArrowsRightLeft className="h-5 w-5 text-yellow-500" />
            </button>

            <div className="flex-1  p-4 border-1 border-gray-300">
              <label className="text-xs font-medium text text-indigo-900">
                TO
              </label>
              <AutocompleteSelect
                key={`destination-${formData.destination?.code || "empty"}`}
                type="airport"
                placeholder=""
                value={formData.destination}
                onSelect={(item) => {
                  setFormData((prev) => ({
                    ...prev,
                    destination: item, // Store full object
                  }));
                }}
              />
            </div>
          </div>

          {/* Departure Date */}
          <div className="p-2 border-t-1 border-b-1 border-gray-300">
            <DatePicker
              selected={new Date(formData.departure)}
              onChange={handleDepartureChange}
              withPortal
              customInput={<CustomDateInput label="DEPARTURE" />}
            />
          </div>

          {/* Return Date (Only for Round Trip) */}
          {journeyType === 2 && (
            <div className="p-2 border-1 border-gray-300">
              <DatePicker
                selected={
                  formData.returnDate ? new Date(formData.returnDate) : null
                }
                onChange={handleReturnChange}
                minDate={new Date(formData.departure)}
                withPortal
                customInput={<CustomDateInput label="RETURN" />}
              />
            </div>
          )}

          {journeyType === 1 && (
            <div className="flex-1 p-2 border-1 border-gray-300">
              <label className="text-xs font-medium text-indigo-900">
                RETURN
              </label>
              <p>Book a roundtrip to save more</p>
            </div>
          )}

          {/* Travellers & Cabin */}
          <div
            ref={travellerRef}
            className="col-span-1 relative  p-2 border-t-1 border-b-1 border-r-1 border-gray-300 rounded-r-2xl"
          >
            <label className="text-xs font-medium text-indigo-900">
              TRAVELLERS & CLASS
            </label>
            <div
              onClick={() => setShowTravellerDialog((prev) => !prev)}
              className="cursor-pointer font-semibold py-2"
            >
              {formData.travellers} Travellers, {formData.cabin}
            </div>

            {showTravellerDialog && (
              <div className="absolute z-10 mt-2 w-80 translate-x-[-25%] bg-white rounded-lg shadow-lg p-4">
                {/* Adults Section */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    Adult
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    on the day of travel
                  </div>
                  <div className="flex space-x-1">
                    {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => {
                      const isSelected = formData.adults === num;
                      const totalOtherTravellers =
                        formData.children + formData.infants;
                      const disable = totalOtherTravellers + num > 9;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() =>
                            !disable && updateTravellers("adults", num)
                          }
                          className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${
                            isSelected
                              ? "bg-indigo-900 text-white"
                              : disable
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                          }`}
                          disabled={disable}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Children Section */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    Child
                  </div>
                  <div className="text-xs text-gray-500 mb-2">(2-12 YRS)</div>
                  <div className="flex space-x-1">
                    {Array.from({ length: 10 }, (_, i) => i).map((num) => {
                      const isSelected = formData.children === num;
                      const totalOtherTravellers =
                        formData.adults + formData.infants;
                      const disable = totalOtherTravellers + num > 9;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() =>
                            !disable && updateTravellers("children", num)
                          }
                          className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${
                            isSelected
                              ? "bg-indigo-900 text-white"
                              : disable
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                          }`}
                          disabled={disable}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Infants Section */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    Infant
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    (Below 2 YRS)
                  </div>
                  <div className="flex space-x-1">
                    {Array.from({ length: 10 }, (_, i) => i).map((num) => {
                      const isSelected = formData.infants === num;
                      const totalOtherTravellers =
                        formData.adults + formData.children;
                      const disable = totalOtherTravellers + num > 9;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() =>
                            !disable && updateTravellers("infants", num)
                          }
                          className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${
                            isSelected
                              ? "bg-indigo-900 text-white"
                              : disable
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                          }`}
                          disabled={disable}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Travel Class Section */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    Choose Travel Class
                  </div>
                  <div className="space-y-2">
                    {[
                      { value: "Economy", label: "Economy" },
                      { value: "PremiumEconomy", label: "Premium Economy" },
                      { value: "Business", label: "Business" },
                      { value: "First", label: "First" },
                      { value: "All", label: "All Classes" },
                    ].map(({ value, label }) => (
                      <label
                        key={value}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="cabin"
                          value={value}
                          checked={formData.cabin === value}
                          onChange={handleChange}
                          className="rounded-full h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Done Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowTravellerDialog(false)}
                    className="bg-indigo-900 text-white px-6 py-2 rounded-md hover:bg-indigo-950 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Direct Flight Option */}
          <div className="col-span-5 flex gap-4 mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="direct"
                checked={formData.direct}
                onChange={handleChange}
                className="w-4 h-4"
              />
              Direct Flights
            </label>
          </div>

          {/* Search Button */}
          <div className="col-span-5 flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-900 hover:bg-indigo-950 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold cursor-pointer"
            >
              <FaSearch /> {"Search"}
            </button>
          </div>
        </form>
      </div>
      <LoadingModal
        loading={loading}
        loadingMessage="Searching for flights..."
      />
    </div>
  );
}
