import React from "react";
import { IoIosArrowDown } from "react-icons/io";
import { FaCalendarDays } from "react-icons/fa6";
import { Listbox } from "@headlessui/react"; // Import Listbox

const FlightSortBar = ({ totalFlights = 733 }) => {
  const options = [
    { id: 1, name: "Price" },
    { id: 2, name: "Airline" },
    { id: 3, name: "Departure" },
    { id: 4, name: "Duration" },
    { id: 5, name: "Best Value" },
    { id: 6, name: "Arrival" },
  ];

  const [selected, setSelected] = React.useState(options[0]); // Default to "Price"

  return (
    <div className="bg-white rounded-xl px-4 py-3 flex flex-wrap justify-between items-center mb-4 shadow-sm">
      <h2 className="text-md md:text-xl font-bold text-[#15144E]">
        {totalFlights} Flights
      </h2>

      <div className="flex flex-wrap items-center space-x-4 text-[#15144E] font-normal text-sm mt-2 md:mt-0">
        <label>Sort by:</label>

        {/* Custom Dropdown with Listbox */}
        <Listbox value={selected} onChange={setSelected}>
          <div className="relative w-32">
            <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white rounded focus:outline-none focus:ring-1 focus:ring-[#15144E] cursor-default border border-gray-200">
              <span className="block truncate text-sm">{selected.name}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <IoIosArrowDown
                  className="h-4 w-4 text-[#7E7E7E]"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg focus:outline-none">
              {options.map((option) => (
                <Listbox.Option
                  key={option.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-4 pr-4 ${
                      active ? "text-[#15144E] bg-gray-100" : "text-gray-900"
                    }`
                  }
                  value={option}
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {option.name}
                    </span>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>

        {/* Fare Calendar (unchanged) */}
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
