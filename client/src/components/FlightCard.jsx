import React, { useState } from "react";
import airlineLogos from "../utils/airlineLogos";
import { GoDotFill } from "react-icons/go";
import { IoAirplane } from "react-icons/io5";
import { BsBagDashFill } from "react-icons/bs";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { MdOutlineAirlineSeatReclineExtra, MdBackpack } from "react-icons/md";
import FareDetails from "./FareDetails";
import OnwardFlights from "./OnwardFlights";

const FlightCard = ({ flight, onBook }) => {
  const [showFares, setShowFares] = useState(false);
  const [showFlightDetails, setShowFlightDetails] = useState(false);

  // Extract weight in kg from string
  const extractWeightKg = (text) => {
    if (!text) return null;
    const match = text.match(/(\d+)\s*(?:kg|kilogram)/i);
    return match ? parseInt(match[1], 10) : null;
  };

  // Format baggage allowance
  const formatBaggageAllowance = (text) => {
    if (!text) return "No allowance";
    if (/onallowance/i.test(text)) return "On allowance";
    const weight = extractWeightKg(text);
    if (weight) return `${weight} kg`;
    return "No allowance";
  };

  // Filter fare groups with fares
  const availableFareGroups =
    flight.fareGroups?.filter((fg) => fg.fares?.length > 0) || [];

  // Calculate total fare for the first fare group
  const firstGroup = availableFareGroups[0];
  let totalFare = 0;

  if (firstGroup && firstGroup.fares && firstGroup.fares.length > 0) {
    const firstFare = firstGroup.fares[0]; // take only the first fare
    const base = firstFare.base || 0;
    const tax = firstFare.taxes
      ? firstFare.taxes.reduce((sum, t) => sum + (t.amt || 0), 0)
      : 0;

    totalFare = base + tax;
  }

  // Calculate total seats remaining across all segments in all fare groups
  const totalSeats =
    availableFareGroups.length > 0
      ? Math.min(
          ...availableFareGroups.flatMap((fg) =>
            fg.segInfos.map((seg) => seg.seatRemaining || 0)
          )
        )
      : 0;
  const seatsRemaining = totalSeats === Infinity ? 0 : totalSeats;

  return (
    <div className="relative">
      <div className="bg-white rounded-xl shadow-md mb-2">
        {/* Top section */}
        <div className="p-6 flex justify-between items-center">
          <div className="flex-col items-center space-x-4">
            <div className="w-14 h-14 border border-gray-100 rounded-sm flex items-center justify-center mb-2">
              <img
                src={airlineLogos[flight.airline]}
                alt={flight.airline}
                className="h-8"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-[#15144E] font-semibold text-sm">
                {flight.airlineName}
              </p>
              <p className="text-[#15144E] font-semibold text-base">
                {flight.airline}-{flight.segGroups[0]?.segs[0]?.flightNum}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-3 mr-5">
            {flight.segGroups.map((group, idx) => {
              const firstSeg = group.segs[0];
              const lastSeg = group.segs[group.segs.length - 1];
              const totalDuration = group.segs.reduce(
                (sum, seg) => sum + (seg.duration || 0),
                0
              );
              const stops = Math.max(0, group.segs.length - 1);

              return (
                <div
                  key={idx}
                  className="flex items-center space-x-8 border-b border-gray-200 pb-3 last:border-none"
                >
                  {/* Departure */}
                  <div className="flex flex-col items-center">
                    <p className="text-lg font-bold text-[#15144E]">
                      {new Date(firstSeg.departureOn).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm text-[#6E6E6E]">{firstSeg.origin}</p>
                  </div>

                  {/* Flight Path */}
                  <div className="flex flex-col items-center text-center text-[#6E6E6E]">
                    <p className="text-sm">
                      {stops === 0
                        ? "Non-stop"
                        : `${stops} stop${stops > 1 ? "s" : ""}`}
                    </p>
                    <div className="flex items-center my-1">
                      <GoDotFill className="text-[#15144E]" />
                      <div className="w-16 border-t border-gray-300 mx-2"></div>
                      <IoAirplane className="text-[#15144E]" />
                    </div>
                    <p className="text-sm">
                      {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                    </p>
                  </div>

                  {/* Arrival */}
                  <div className="flex flex-col items-center">
                    <p className="text-lg font-bold text-[#15144E]">
                      {new Date(lastSeg.arrivalOn).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm text-[#6E6E6E]">
                      {lastSeg.destination}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fare & Book button */}
          <div className="text-center">
            <p className="font-bold text-[#15144E]">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: flight.currency,
                maximumFractionDigits: 0,
              }).format(totalFare)}
            </p>

            {availableFareGroups.length === 1 ? (
              <button
                onClick={() =>
                  onBook(flight, availableFareGroups[0].purchaseId)
                }
                className="mt-2 px-6 py-2 bg-indigo-950 text-white text-sm rounded-md hover:bg-indigo-900 cursor-pointer"
              >
                Book Now
              </button>
            ) : (
              <button
                onClick={() => setShowFares((prev) => !prev)}
                className="border border-[#15144E] text-[#15144E] text-sm px-6 py-2 rounded-md mt-2 cursor-pointer"
              >
                View Fares
              </button>
            )}
          </div>
        </div>

        {/* Fare details modal */}
        {showFares && (
          <FareDetails
            flight={flight}
            onBook={onBook}
            formatBaggageAllowance={formatBaggageAllowance}
          />
        )}

        {/* Bottom section */}
        {/* Bottom Section: Info + Toggle */}
        <div className="border-t border-gray-200 p-2 px-6 flex flex-col md:flex-row justify-between items-center bg-gray-50 rounded-b-xl">
          {/* Left group: Check-In, Cabin, Seat Remaining */}
          <div className="flex space-x-7 items-center text-sm text-gray-600">
            <div className="flex items-center">
              <MdBackpack className="text-[#E5BC3B] mr-1" />
              <span>
                Check-In:{" "}
                {formatBaggageAllowance(
                  flight?.fareGroups[0].baggages?.[0].checkInBag
                )}
              </span>
            </div>

            <div className="flex items-center">
              <BsBagDashFill className="text-[#E5BC3B] mr-1" />
              <span>
                Cabin:{" "}
                {formatBaggageAllowance(
                  flight?.fareGroups[0].baggages?.[0].cabinBag
                )}
              </span>
            </div>

            <div className="flex items-center">
              <MdOutlineAirlineSeatReclineExtra className="mr-1 text-[#E5BC3B]" />
              Seat Remaining: {seatsRemaining}
            </div>
          </div>

          {/* Right: Flight Details toggle */}
          <button
            onClick={() => setShowFlightDetails((prev) => !prev)}
            className="mt-2 md:mt-0 flex items-center space-x-1 text-sm text-indigo-950 font-medium focus:outline-none hover:text-indigo-800"
          >
            <span>Flight Details</span>
            {showFlightDetails ? (
              <IoIosArrowUp className="text-indigo-950" />
            ) : (
              <IoIosArrowDown className="text-indigo-950" />
            )}
          </button>
        </div>

        {/* Flight Details section BELOW the bottom bar */}
        {showFlightDetails && (
          <div className="p-1 bg-gray-50 border-t border-gray-100 rounded-b-xl">
            <OnwardFlights flight={flight} />
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightCard;
