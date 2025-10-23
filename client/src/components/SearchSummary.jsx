import React, { useState, useRef, useEffect } from "react";
import { HiArrowsRightLeft } from "react-icons/hi2";
import AutocompleteSelect from "./AutoCompleteSelect";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDateInput from "./CustomDateInput";

const SearchSummary = ({ value, onModify }) => {
  const [tripType, setTripType] = useState("One Way");
  const [formData, setFormData] = useState(() => {
    // fallback default
    const today = new Date();
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(today.getDate() + 7);

    return {
      origin: {
        code: "DEL",
        city: "New Delhi",
        name: "Indira Gandhi International Airport",
      },
      destination: {
        code: "WAW",
        city: "Warsaw",
        name: "Warsaw Chopin Airport",
      },
      departure: today,
      returnDate: oneWeekFromNow,
      adults: 1,
      children: 0,
      infants: 0,
      travellers: 1,
      cabin: "Economy",
    };
  });
  const [showTravellerDialog, setShowTravellerDialog] = useState(false);
  const travellerRef = useRef(null);

  useEffect(() => {
    if (value) setFormData(value);
  }, [value]);

  const handleSwap = () => {
    setFormData((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
    }));
  };

  const updateTravellers = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: Math.max(0, value) };
      updated.travellers = updated.adults + updated.children + updated.infants;
      return updated;
    });
  };

  const handleTripTypeChange = (type) => {
    setTripType(type);
    if (type === "One Way") {
      setFormData((prev) => ({ ...prev, returnDate: null }));
    } else if (type === "Round Trip" && !formData.returnDate) {
      // Reinitialize returnDate if null (e.g., after switching from One Way)
      const oneWeekFromNow = new Date(formData.departure);
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      setFormData((prev) => ({ ...prev, returnDate: oneWeekFromNow }));
    }
  };

  return (
    <div className="w-full mb-6">
      {/* Trip Type */}
      <div className="flex justify-between items-center mb-4">
        {/* Left: Trip type buttons */}
        <div className="flex items-center gap-3">
          {["One Way", "Round Trip", "Multi City"].map((type) => (
            <button
              key={type}
              onClick={() => handleTripTypeChange(type)} // Updated handler
              className={`px-5 py-2 rounded-3xl cursor-pointer ${
                tripType === type
                  ? "bg-[#15144E] border border-[#15144E] text-white"
                  : "bg-white border border-[#CACACA] text-[#15144E] hover:bg-[#f2f2f2]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Right: Checkboxes */}
        <div className="flex gap-5">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="direct"
              checked={formData.direct}
              // onChange={handleChange}
              className="w-4 h-4"
            />
            Direct Flights
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="nearby"
              checked={formData.nearby}
              // onChange={handleChange}
              className="w-4 h-4"
            />
            Nearby Airport
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="seniorCitizenFare"
              checked={formData.seniorCitizenFare}
              // onChange={handleChange}
              className="w-4 h-4"
            />
            Sr. Citizen Fare
          </label>
        </div>
      </div>

      {/* Flight Summary Row */}
      <div className="bg-white rounded-2xl py-2 px-6 flex flex-wrap md:flex-nowrap items-center justify-between gap-6 text-[#15144E] shadow-sm">
        {/* From */}
        <div className="flex flex-col w-32 md:w-36">
          <p className="text-xs uppercase">From</p>
          <AutocompleteSelect
            type="airport"
            value={formData.origin}
            size="summary"
            onSelect={(item) =>
              setFormData((prev) => ({ ...prev, origin: item }))
            }
          />
        </div>

        {/* Swap */}
        <div className="flex justify-center items-center cursor-pointer">
          <div
            onClick={handleSwap}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#CACACA] hover:bg-gray-50 transition"
          >
            <HiArrowsRightLeft className="w-5 h-5 text-[#15144E]" />
          </div>
        </div>

        {/* To */}
        <div className="flex flex-col w-32 md:w-32">
          <p className="text-xs uppercase">To</p>
          <AutocompleteSelect
            type="airport"
            value={formData.destination}
            size="summary"
            onSelect={(item) =>
              setFormData((prev) => ({ ...prev, destination: item }))
            }
          />
        </div>

        {/* Departure Date */}
        <div className="flex flex-col cursor-pointer w-36">
          <DatePicker
            selected={formData.departure}
            onChange={(date) =>
              setFormData((prev) => ({ ...prev, departure: date }))
            }
            customInput={<CustomDateInput label="DEPARTURE" size="summary" />}
            withPortal
            monthsShown={2}
          />
        </div>

        {/* Return Date (only for Round Trip) */}
        {tripType === "Round Trip" ? (
          <div className="flex flex-col cursor-pointer w-36">
            <DatePicker
              selected={formData.returnDate}
              onChange={(date) =>
                setFormData((prev) => ({ ...prev, returnDate: date }))
              }
              minDate={formData.departure}
              customInput={
                <CustomDateInput
                  label="RETURN"
                  placeholder="Select return"
                  size="summary"
                />
              }
              withPortal
              monthsShown={2}
            />
          </div>
        ) : (
          <div className="flex flex-col cursor-pointer w-36">
            <CustomDateInput
              label="RETURN"
              placeholder="Book a roundtrip to save"
            />
          </div>
        )}

        {/* Travelers */}
        <div ref={travellerRef} className="relative">
          <div
            onClick={() => setShowTravellerDialog((prev) => !prev)}
            className="cursor-pointer py-2 px-4"
          >
            <div className="text-sm font-semibold text-indigo-950">
              {formData.travellers} Travellers
            </div>
            <div className="text-sm text-indigo-950">{formData.cabin}</div>
          </div>

          {showTravellerDialog && (
            <div className="absolute z-10 mt-2 w-80 bg-white rounded-lg shadow-lg p-4">
              {/* Adults Section */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  Adult
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
                <div className="flex space-x-1">
                  {Array.from({ length: formData.adults + 1 }, (_, i) => i).map(
                    (num) => {
                      const isSelected = formData.infants === num;
                      const totalOtherTravellers =
                        formData.adults + formData.children;
                      const disable =
                        totalOtherTravellers + num > 9 || num > formData.adults; // limit infants to adults
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
                    }
                  )}
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
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            cabin: e.target.value,
                          }))
                        }
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
                  className="bg-indigo-950 text-white px-6 py-2 rounded-md hover:bg-indigo-900 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modify Button */}
        <button
          onClick={() => onModify?.(formData, tripType)}
          className="bg-[#15144E] text-sm text-white px-8 py-3 rounded-lg hover:bg-[#0f0e3c] transition cursor-pointer whitespace-nowrap"
        >
          Modify Search
        </button>
      </div>
    </div>
  );
};

export default SearchSummary;
