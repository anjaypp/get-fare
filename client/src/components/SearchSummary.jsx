import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
// import biDirectionalArrow from "../images/bidirectional_arrow.svg";
import { HiArrowsRightLeft } from "react-icons/hi2";
import DepartDate from "./DepartDate";

const SearchSummary = () => {
  const [tripType, setTripType] = useState("One Way");
  const [fromCity] = useState({ code: "WAW", city: "Warsaw" });
  const [toCity] = useState({ code: "DEL", city: "New Delhi" });
  //   const [departDate] = useState({ date: "13 Oct'25", day: "Mon" });
  const [returnDate] = useState(null);
  const [travelers] = useState({ count: 1, class: "Economy" });
  const [filters] = useState({
    directFlight: true,
    nearbyAirport: false,
    studentFare: false,
    seniorCitizenFare: false,
  });

  return (
    <div className="w-full mb-6">
      {/* Top buttons and filters */}
      <div className="flex flex-wrap justify-between items-center gap-4 text-[#15144E]">
        {/* Trip Type Buttons */}
        <div className="flex items-center gap-3">
          {["One Way", "Round Trip", "Multi City"].map((type) => (
            <button
              key={type}
              onClick={() => setTripType(type)}
              className={`px-5 py-2 sm:text-sm md:text-base rounded-3xl cursor-pointer ${
                tripType === type
                  ? "bg-[#15144E] border border-[#15144E] text-white"
                  : "bg-white border border-[#CACACA] text-[#15144E] hover:bg-[#f2f2f2]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-5 text-sm">
          {[
            { label: "Direct Flight", checked: filters.directFlight },
            { label: "Nearby Airport", checked: filters.nearbyAirport },
            { label: "Student Fare", checked: filters.studentFare },
            { label: "Sr.Citizen Fare", checked: filters.seniorCitizenFare },
          ].map((filter) => (
            <label
              key={filter.label}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filter.checked}
                readOnly
                className="appearance-none w-4 h-4 border border-[#15144E] rounded bg-white checked:bg-white cursor-pointer"
                style={{
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "100%",
                  backgroundImage: filter.checked
                    ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' stroke='%23FCBE00' stroke-width='4' fill='none' viewBox='0 0 24 24'%3E%3Cpath d='M5 12l5 5L20 7'/%3E%3C/svg%3E\")"
                    : "none",
                }}
              />
              <span className="font-medium">{filter.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Summary row */}
      <div className="bg-white mt-5 rounded-2xl py-5 px-6 flex flex-wrap md:flex-nowrap items-center justify-between gap-6 text-[#15144E] shadow-sm">
        {/* From */}
        <div className="flex flex-col cursor-pointer">
          <p className="text-xs uppercase">From</p>
          <p>
            <span className="font-semibold text-base md:text-lg">
              {fromCity.city}
            </span>
            ,{" "}
            <span className="font-normal text-sm uppercase">
              {fromCity.code}
            </span>
          </p>
        </div>

        {/* Arrow */}
        <div className="flex justify-center items-center cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-[#CACACA]">
            <HiArrowsRightLeft className="w-5 h-5 text-[#15144E]" />
          </div>
        </div>

        {/* To */}
        <div className="flex flex-col cursor-pointer">
          <p className="text-xs uppercase">To</p>
          <p>
            <span className="font-semibold text-base md:text-lg">
              {toCity.city}
            </span>
            ,{" "}
            <span className="font-normal text-sm uppercase">{toCity.code}</span>
          </p>
        </div>

        {/* Depart */}
        <DepartDate />

        {/* Return */}
        <div className="flex flex-col cursor-pointer">
          <div className="flex items-center gap-1">
            <span className="text-xs uppercase">Return</span>
            <IoIosArrowDown className="cursor-pointer" />
          </div>
          <p className="text-sm">
            {returnDate ? returnDate.date : <span>Add Return</span>}
          </p>
        </div>

        {/* Travelers */}
        <div className="flex flex-col cursor-pointer">
          <p className="text-xs uppercase">{travelers.count} Traveler(s)</p>
          <p className="text-sm">{travelers.class}</p>
        </div>

        {/* Modify Button */}
        <button className="bg-[#15144E] text-white px-6 py-3 rounded-lg hover:bg-[#0f0e3c] transition cursor-pointer">
          Modify Search
        </button>
      </div>
    </div>
  );
};

export default SearchSummary;
