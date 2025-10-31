import React, { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { HiArrowsRightLeft } from "react-icons/hi2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AutocompleteSelect from "./AutoCompleteSelect";
import CustomDateInput from "../components/CustomDateInput";
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
  const [showTravellerDialog, setShowTravellerDialog] = useState(false);

  const [formData, setFormData] = useState(() => {
    const today = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(today.getDate() + 7);

    return {
      origin: {
        code: "DEL",
        city: "Delhi",
        name: "Indira Gandhi International Airport",
      },
      destination: {
        code: "WAW",
        city: "Warsaw",
        name: "Warsaw Chopin Airport",
      },

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

    // Build originDestinations
    let originDestinations = [
      {
        origin: formData.origin?.code?.toLowerCase() || "",
        destination: formData.destination?.code?.toLowerCase() || "",
        departureDateTime: formData.departure,
        originCity: formData.origin.city,
        destinationCity: formData.destination.city,
      },
    ];

    // Add return leg for round-trip
    if (journeyType === 2 && formData.returnDate) {
      originDestinations.push({
        origin: formData.destination?.code?.toLowerCase() || "",
        destination: formData.origin?.code?.toLowerCase() || "",
        departureDateTime: formData.returnDate,
        originCity: formData.destination.city,
        destinationCity: formData.origin.city,
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

    navigate("/results", { state: payload });
  };

  return (
    <div className="min-h-screen flex justify-center p-12">
      <div className="bg-white w-full max-w-6xl h-fit rounded-2xl shadow p-6 border border-gray-200">
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
                  ? "bg-indigo-950 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit}>
          {/* Single container holding 5 sections — responsive: stacked on mobile, columns on md+ */}
          <div
            className={`grid grid-cols-1 ${
              journeyType === 1 || journeyType === 2
                ? "md:grid-cols-5"
                : "md:grid-cols-4"
            } divide-y md:divide-y-0 md:divide-x divide-gray-200 rounded-lg overflow-visible border border-gray-200 bg-white items-stretch`}
          >
            {/* Origin & Destination */}
            <div className="md:col-span-2 relative flex items-stretch">
              {/* FROM & TO wrapper without vertical padding */}
              <div className="flex w-full h-full items-stretch md:divide-x md:divide-gray-200">
                {/* FROM */}
                <div className="flex-1 flex flex-col justify-center px-4 py-6">
                  <label className="text-xs font-medium text-indigo-950 mb-1">
                    FROM
                  </label>
                  <AutocompleteSelect
                    key={`origin-${formData.origin?.code || "empty"}`}
                    type="airport"
                    placeholder=""
                    value={formData.origin}
                    onSelect={(item) =>
                      setFormData((prev) => ({ ...prev, origin: item }))
                    }
                  />
                  {formData.origin && (
                    <div className="mt-1 cursor-default text-sm text-indigo-950">
                      {formData.origin.name}
                    </div>
                  )}
                </div>

                {/* TO */}
                <div className="flex-1 flex flex-col justify-center py-6 ml-8">
                  <label className="text-xs font-medium text-indigo-950 mb-1">
                    TO
                  </label>
                  <AutocompleteSelect
                    key={`destination-${formData.destination?.code || "empty"}`}
                    type="airport"
                    placeholder=""
                    value={formData.destination}
                    onSelect={(item) =>
                      setFormData((prev) => ({ ...prev, destination: item }))
                    }
                  />
                  {formData.destination && (
                    <div className="mt-1 cursor-default text-sm text-indigo-950">
                      {formData.destination.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Swap Button */}
              <button
                type="button"
                onClick={handleSwap}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
           bg-white border border-gray-300 rounded-full shadow-md
           p-3 z-20 cursor-pointer hover:bg-gray-50 transition"
              >
                <HiArrowsRightLeft className="h-5 w-5 text-yellow-500" />
              </button>
            </div>

            {/* Departure Date */}
            <div className="p-4 bg-white h-full">
              <DatePicker
                selected={new Date(formData.departure)}
                onChange={handleDepartureChange}
                withPortal
                monthsShown={2}
                customInput={<CustomDateInput label="DEPARTURE" />}
              />
            </div>

            {/* Return Date (Only for Round Trip) */}
            {journeyType === 2 && (
              <div className="p-4 bg-white h-full">
                <DatePicker
                  selected={
                    formData.returnDate ? new Date(formData.returnDate) : null
                  }
                  onChange={handleReturnChange}
                  minDate={new Date(formData.departure)}
                  withPortal
                  monthsShown={2}
                  customInput={<CustomDateInput label="RETURN" />}
                />
              </div>
            )}

            {journeyType === 1 && (
              <div className="flex-1 p-4 bg-white h-full">
                <label className="text-xs font-medium text-indigo-950 mb-2">
                  RETURN
                </label>
                <p className="text-sm text-indigo-950 pt-3">
                  Book a roundtrip to save more
                </p>
              </div>
            )}

            {/* Travellers & Cabin */}
            <div
              ref={travellerRef}
              className="md:col-span-1 relative p-4 bg-white h-full"
            >
              <label className="text-xs font-medium text-indigo-950 mb-2">
                TRAVELLERS & CLASS
              </label>
              <div
                onClick={() => setShowTravellerDialog((prev) => !prev)}
                className="cursor-pointer py-2"
              >
                <label className="text-[26px] font-semibold text-indigo-950">
                  {formData.travellers} Travellers{" "}
                </label>
                <label className="text-sm text-indigo-950">
                  {formData.cabin}
                </label>
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
                                ? "bg-indigo-950 text-white"
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
                                ? "bg-indigo-950 text-white"
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
                  {/* Infants Section */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      Infant
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      (Below 2 YRS)
                    </div>
                    <div className="flex space-x-1">
                      {Array.from(
                        { length: formData.adults + 1 },
                        (_, i) => i
                      ).map((num) => {
                        const isSelected = formData.infants === num;
                        const totalOtherTravellers =
                          formData.adults + formData.children;
                        // Still prevent total > 9
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
                                ? "bg-indigo-950 text-white"
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
                      className="bg-indigo-950 text-white px-6 py-2 rounded-md hover:bg-indigo-950 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Direct Flight Option */}
          <div className="col-span-5 flex justify-between items-center mt-4">
            {/* Left: Checkboxes */}
            <div className="flex gap-5">
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

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="nearby"
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                Nearby Airport
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="seniorCitizenFare"
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                Sr.Citizen Fare
              </label>
            </div>

            {/* Right: Search Button */}
            <button
              type="submit"
              className="bg-indigo-950 hover:bg-indigo-950 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold cursor-pointer"
            >
              <FaSearch /> Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
