import React from "react";

const FlightSortBar = ({ totalFlights, sortConfig, onSort }) => {
  const sortOptions = [
    { label: "Depart", key: "departure" },
    { label: "Arrive", key: "arrival" },
    { label: "Duration", key: "duration" },
    { label: "Price Per Adult", key: "price" },
    { label: "Non Stop First", key: "stops" },
  ];

  return (
    <div className="bg-white rounded-xl px-4 py-3 flex flex-wrap justify-between items-center mb-4 shadow-sm">
      <h3 className="font-bold text-[#15144E]">
        {totalFlights} <label className="font-normal">Flights</label>
      </h3>

      <div className="flex flex-wrap items-center space-x-16 text-[#15144E] font-normal text-sm mt-2 md:mt-0">
        <label>Sort by:</label>
        {sortOptions.map((opt) => (
          <p
            key={opt.key}
            onClick={() => onSort(opt.key)}
            className={`cursor-pointer ${
              sortConfig.key === opt.key ? "font-bold" : ""
            }`}
          >
            {opt.label}{" "}
            {sortConfig.key === opt.key
              ? sortConfig.order === "asc"
                ? "▲"
                : "▼"
              : ""}
          </p>
        ))}
      </div>
    </div>
  );
};

export default FlightSortBar;