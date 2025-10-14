import React from "react";
import { IoIosArrowDown } from "react-icons/io";
// import calenderIcon from "../images/calendar_icon.svg"; 
import { FaCalendarDays } from "react-icons/fa6";

const FlightSortBar = ({ totalFlights = 733 }) => {
  return (
    <div className="bg-white rounded-xl px-4 py-3 flex flex-wrap justify-between items-center mb-4 shadow-sm">
      <h2 className="text-lg md:text-xl font-normal text-[#7C7C7C]">
        {totalFlights} Flights
      </h2>

      <div className="flex flex-wrap items-center space-x-4 text-[#15144E] font-normal text-sm mt-2 md:mt-0">
        <label>Sort by:</label>

        {/* Dropdown */}
        <div className="relative w-32">
          <select className="appearance-none border border-[#CACACA] px-4 py-2 pr-10 rounded focus:outline-none w-full">
            <option>Price</option>
            <option>Airline</option>
            <option>Departure</option>
            <option>Duration</option>
            <option>Best Value</option>
            <option>Arrival</option>
          </select>
          <IoIosArrowDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7E7E7E] cursor-pointer" />
        </div>

        {/* Fare Calendar */}
        <button className="text-[#15144E] flex items-center gap-2 md:gap-3 hover:opacity-90 transition">
         <FaCalendarDays className="w-5 h-5 md:w-6 md:h-6 text-[#E5BC3B]" />
          <span className="text-sm md:text-base">Show Fare Calendar</span>
          <div className="w-5 h-5 rounded-full border border-[#15144E] flex items-center justify-center">
            <IoIosArrowDown className="text-[#15144E] w-3.5 h-3.5" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default FlightSortBar;
