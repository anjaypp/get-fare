import React, { useState } from "react";
import { WiSunrise, WiDaySunny, WiSunset, WiNightClear } from "react-icons/wi";

const FlightFilter = () => {
  const [stops, setStops] = useState([]);
  const [priceRange, setPriceRange] = useState([7566, 93066]);
  const [fareTypes, setFareTypes] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [connectingAirports, setConnectingAirports] = useState([]);

  const toggleItem = (arr, item, setter) => {
    if (arr.includes(item)) setter(arr.filter((i) => i !== item));
    else setter([...arr, item]);
  };

  const timeOptions = [
    { icon: <WiSunrise className="text-[#E5BC3B]" size={24} />, label: "05-12" },
    { icon: <WiDaySunny className="text-[#E5BC3B]" size={24} />, label: "12-18" },
    { icon: <WiSunset className="text-[#E5BC3B]" size={24} />, label: "18-24" },
    { icon: <WiNightClear className="text-[#E5BC3B]" size={24} />, label: "00-05" },
  ];

  return (
    <div className="bg-white h-min w-full p-6 rounded-xl shadow-md text-[#15144E] flex flex-col">
      <h3 className="text-lg font-semibold mb-5 border-b border-[#B5B5B5] pb-2">
        Filters
      </h3>

      {/* Stops */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-base">Stops</h4>
        <div className="flex flex-row gap-2">
          {["0 Stop", "1 Stop", "1+ Stop"].map((stop) => (
            <label key={stop} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={stops.includes(stop)}
                onChange={() => toggleItem(stops, stop, setStops)}
              />
              {stop}
            </label>
          ))}
        </div>
      </div>

      {/* Departure Time */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-base">Departure Time</h4>
        <div className="grid grid-cols-4 gap-3 text-center">
          {timeOptions.map((time) => (
            <div key={time.label} className="flex flex-col items-center">
              <div className="w-10 h-10 flex items-center justify-center border border-[#9D9DAD] rounded-md">
                {time.icon}
              </div>
              <p className="mt-2 text-sm font-normal">{time.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Arrival Time */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-base">Arrival Time</h4>
        <div className="grid grid-cols-4 gap-3 text-center">
          {timeOptions.map((time) => (
            <div key={time.label} className="flex flex-col items-center">
              <div className="w-10 h-10 flex items-center justify-center border border-[#9D9DAD] rounded-md">
                {time.icon}
              </div>
              <p className="mt-2 text-sm font-normal">{time.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-base">Price Range</h4>
        <input
          type="range"
          min="7566"
          max="93066"
          value={priceRange[1]}
          onChange={(e) =>
            setPriceRange([priceRange[0], parseInt(e.target.value)])
          }
          className="w-full h-1 accent-[#15144E] bg-[#E5E7EB] rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-sm font-semibold">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>

      {/* Fare Type */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-base">Fare Type</h4>
        {["Normal Fare", "Branded Fare", "Published Fare", "Non-ref Fare", "Others"].map(
          (fare) => (
            <label key={fare} className="flex items-center mb-2 text-sm">
              <input
                type="checkbox"
                className="mr-3"
                checked={fareTypes.includes(fare)}
                onChange={() => toggleItem(fareTypes, fare, setFareTypes)}
              />
              {fare}
            </label>
          )
        )}
      </div>

      {/* Airlines */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-base">Airlines</h4>
        {[
          { name: "Austrian (5)", price: 7306 },
          { name: "Air France (2)", price: 8906 },
          { name: "British Airways (11)", price: 9006 },
          { name: "Eurowings (1)", price: 93210 },
          { name: "Abu Dhabi", price: 9415 },
        ].map((airline) => (
          <label key={airline.name} className="flex items-center justify-between mb-2 text-sm">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="mr-3"
                checked={airlines.includes(airline.name)}
                onChange={() => toggleItem(airlines, airline.name, setAirlines)}
              />
              {airline.name}
            </div>
            <span className="font-semibold">₹{airline.price}</span>
          </label>
        ))}
      </div>

      {/* Connecting Airports */}
      <div className="mb-2">
        <h4 className="font-semibold mb-3 text-base">Connecting Airports</h4>
        {["Abu Dhabi", "Amsterdam", "Athens", "Bangalore", "Berlin"].map(
          (airport) => (
            <label key={airport} className="flex items-center mb-2 text-sm">
              <input
                type="checkbox"
                className="mr-3"
                checked={connectingAirports.includes(airport)}
                onChange={() =>
                  toggleItem(connectingAirports, airport, setConnectingAirports)
                }
              />
              {airport}
            </label>
          )
        )}
      </div>
    </div>
  );
};

export default FlightFilter;
