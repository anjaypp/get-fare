import React, { useState } from "react";
import airlineLogos from "../utils/airlineLogos";
import { FaAngleDown } from "react-icons/fa";
import { FaAngleUp } from "react-icons/fa";
import OnwardFlights from "./OnwardFlights";
import { GiSchoolBag } from "react-icons/gi";

const FlightCard = ({ flight, onBook }) => {
  const [showFares, setShowFares] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const fare = flight.fareGroups[0]?.fares[0] || {};
  const totalFare =
    fare.base +
    (fare.taxes ? fare.taxes.reduce((sum, t) => sum + t.amt, 0) : 0);

  const baggageData = flight.fareGroups[0]?.baggages?.[0] || {};
  const checkInBag = baggageData.checkInBag || "";
  const cabinBag = baggageData.cabinBag || "";

  // Improved baggage parsing function
  function parseBaggageData(checkInBag, cabinBag) {
    const parseWeight = (str) => {
      const kg = str.match(/(\d+)\s*(?:Kilogram|KG)/i);
      const lb = str.match(/(\d+)\s*(?:Pound|Lb)/i);
      return {
        kg: kg ? parseInt(kg[1]) : null,
        lb: lb ? parseInt(lb[1]) : null
      };
    };

    const parsePieces = (str) => {
      const match = str.match(/(\d+)PC/i);
      return match ? parseInt(match[1]) : null;
    };

    const parseQuantity = (str) => {
      const match = str.match(/Quantity:\s*(\d+)/i);
      return match ? parseInt(match[1]) : null;
    };

    const parseDimensions = (str) => {
      const dimensions = [];

      // Look for dimension patterns like "23cmx40cmx55cm" or "62Inch"
      const dimensionPatterns = [
        /(\d+(?:\.\d+)?)\s*(?:cm|centimeter)(?:x(\d+(?:\.\d+)?)\s*(?:cm|centimeter))?(?:x(\d+(?:\.\d+)?)\s*(?:cm|centimeter))?/gi,
        /(\d+(?:\.\d+)?)\s*(?:in|inch)(?:x(\d+(?:\.\d+)?)\s*(?:in|inch))?(?:x(\d+(?:\.\d+)?)\s*(?:in|inch))?/gi,
        /(\d+)\s*(?:Inch|Centimeter)/gi
      ];

      dimensionPatterns.forEach((pattern) => {
        const matches = [...str.matchAll(pattern)];
        matches.forEach((match) => {
          if (match[0]) dimensions.push(match[0]);
        });
      });

      return dimensions;
    };

    return {
      checkInBag: {
        pieces: parsePieces(checkInBag),
        weight: parseWeight(checkInBag),
        quantity: parseQuantity(checkInBag),
        dimensions: parseDimensions(checkInBag),
        raw: checkInBag
      },
      cabinBag: {
        pieces: parsePieces(cabinBag),
        weight: parseWeight(cabinBag),
        quantity: parseQuantity(cabinBag),
        dimensions: parseDimensions(cabinBag),
        raw: cabinBag
      }
    };
  }

  // Parse the baggage data
  const parsedBaggage = parseBaggageData(checkInBag, cabinBag);

  // Format baggage display text
  const formatBaggageText = (baggageInfo) => {
    if (!baggageInfo.pieces && !baggageInfo.weight.kg) {
      return "Not specified";
    }

    const parts = [];

    if (baggageInfo.pieces) {
      parts.push(
        `${baggageInfo.pieces} piece${baggageInfo.pieces > 1 ? "s" : ""}`
      );
    }

    if (baggageInfo.weight.kg) {
      parts.push(`${baggageInfo.weight.kg}kg`);
    } else if (baggageInfo.weight.lb) {
      parts.push(`${baggageInfo.weight.lb}lbs`);
    }

    return parts.join(", ") || "Available";
  };

  // // Calculate total duration for all segments
  // const calculateTotalDuration = () => {
  //   let totalDuration = 0;
  //   flight.segGroups?.forEach((group) => {
  //     group.segs?.forEach((seg) => {
  //       totalDuration += seg.duration || 0;
  //     });
  //   });
  //   return totalDuration;
  // };

  // // Get total number of stops
  // const getTotalStops = () => {
  //   let totalSegments = 0;
  //   flight.segGroups?.forEach((group) => {
  //     totalSegments += group.segs?.length || 0;
  //   });
  //   return Math.max(0, totalSegments - 1); // stops = segments - 1
  // };

  // // Get first departure and last arrival
  // const getFirstDeparture = () => {
  //   return flight.segGroups?.[0]?.segs?.[0];
  // };

  // const getLastArrival = () => {
  //   const lastGroup = flight.segGroups?.[flight.segGroups.length - 1];
  //   const lastSeg = lastGroup?.segs?.[lastGroup.segs.length - 1];
  //   return lastSeg;
  // };

  // const firstSeg = getFirstDeparture();
  // const lastSeg = getLastArrival();
  // const totalDuration = calculateTotalDuration();
  // const totalStops = getTotalStops();

  const formatStops = (stops) => {
    if (stops === 0) return "Non-stop";
    if (stops === 1) return "1 stop";
    return `${stops} stops`;
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6 flex justify-between items-center">
          {/* Airline Info */}
          <div className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border border-gray-200 rounded-lg flex items-center justify-center">
                <img
                  src={airlineLogos[flight.airline]}
                  alt={flight.airline}
                  className="h-10"
                />
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-600 ml-2 mr-2">
                  {flight.airlineName} ({flight.airline})
                </p>
                <p className="text-xs font-bold text-gray-800">
                  {flight.segGroups[0]?.segs[0]?.flightNum}
                </p>
              </div>
            </div>
          </div>

          {/* Outbound & Return Summary */}
          <div className="flex flex-col items-center space-y-2">
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
                  className="flex items-center space-x-6 border-b border-gray-200 pb-2"
                >
                  <div className="text-sm text-gray-600 font-semibold w-20">
                    {idx === 0 ? "Outbound" : "Return"}
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-lg font-bold">
                      {new Date(firstSeg.departureOn).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                    <p className="text-sm">{firstSeg.origin}</p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <p className="text-sm text-gray-500">{formatStops(stops)}</p>
                    <div className="w-16 border-t border-gray-300 my-1"></div>
                    <p className="text-sm text-gray-500">
                      {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <p className="text-lg font-bold">
                      {new Date(lastSeg.arrivalOn).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                    <p className="text-sm">{lastSeg.destination}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {flight.currency} {Math.round(totalFare)}
            </p>

            {flight.fareGroups.length === 1 &&
            flight.fareGroups[0].fares.length === 1 ? (
              <button
                onClick={() =>
                  onBook(
                    flight,
                    flight.fareGroups[0].purchaseId
                  )
                }
                className="mt-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Book Now
              </button>
            ) : (
              <button
                onClick={() => setShowFares((prev) => !prev)}
                className="mt-2 px-6 py-2 border border-teal-400 text-teal-500 rounded-lg hover:bg-teal-50"
              >
                View Fares
              </button>
            )}
          </div>
        </div>

        {/* Detailed Flight Segments - Show when expanded */}
        {showFares && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <h4 className="font-semibold text-gray-800 mb-3">Fare Options</h4>
            {flight.fareGroups.map((group) => (
              <div key={group.purchaseId} className="mb-4">
                {group.fares.map((fare, fIdx) => {
                  const fareTotal =
                    fare.base +
                    (fare.taxes
                      ? fare.taxes.reduce((sum, t) => sum + t.amt, 0)
                      : 0);
                  return (
                    <div
                      key={fIdx}
                      className="flex justify-between items-center py-2 px-3 bg-white rounded shadow-sm mb-2"
                    >
                      {/* Left: Price class */}
                      <div>
                        <p className="font-medium text-gray-700 mb-0">
                          {group.priceClass} {fare.paxType} (
                          {group.refundable ? "Refundable" : "Non-refundable"})
                        </p>
                      </div>

                      {/* Right: Price + Book button */}
                      <div className="flex items-center gap-4">
                        <p className="font-bold">
                          {flight.currency} {fareTotal.toFixed(2)}
                        </p>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          onClick={() => onBook(flight, group.purchaseId)}
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Bottom: Improved Baggage Display + Details Toggle */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-4">
            {/* Check-in Baggage */}
            <div className="flex items-center text-gray-600">
              <GiSchoolBag className="mr-2 text-green-500" />
              <span className="text-sm">
                Check-in: {formatBaggageText(parsedBaggage.checkInBag)}
              </span>
            </div>

            {/* Cabin Baggage */}
            {parsedBaggage.cabinBag.pieces && (
              <div className="flex items-center text-gray-600">
                <span className="text-sm">
                  Cabin: {formatBaggageText(parsedBaggage.cabinBag)}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowDetails((prev) => !prev)}
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <span className="text-sm font-medium flex items-center gap-1">
              Flight Details
              {showDetails ? (
                <FaAngleUp className="text-xl inline-block" />
              ) : (
                <FaAngleDown className="text-xl inline-block" />
              )}
            </span>
          </button>
        </div>

        {/* Flight Details Section with Baggage Details */}
        {showDetails && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            {/* Baggage Details */}
            <div className="mb-6">
              {/* Flight Details */}
              <OnwardFlights flight={flight} />

              <div className="mt-4 bg-white p-4 rounded-lg">
                <h4 className="bg-gray-100 text-left w-[95%] mx-auto my-2.5 px-2.5 py-1.5 rounded text-base font-semibold text-gray-900">
                  Baggage Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Check-in Baggage Details */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h5 className="font-medium text-gray-700 mb-2">
                      Check-in Baggage
                    </h5>
                    {parsedBaggage.checkInBag.pieces ? (
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Pieces: {parsedBaggage.checkInBag.pieces}</p>
                        {parsedBaggage.checkInBag.weight.kg && (
                          <p>
                            Weight: {parsedBaggage.checkInBag.weight.kg}kg /{" "}
                            {parsedBaggage.checkInBag.weight.lb}lbs
                          </p>
                        )}
                        {parsedBaggage.checkInBag.dimensions.length > 0 && (
                          <p>
                            Dimensions:{" "}
                            {parsedBaggage.checkInBag.dimensions.join(", ")}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Not specified</p>
                    )}
                  </div>

                  {/* Cabin Baggage Details */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h5 className="font-medium text-gray-700 mb-2">
                      Cabin Baggage
                    </h5>
                    {parsedBaggage.cabinBag.pieces ? (
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Pieces: {parsedBaggage.cabinBag.pieces}</p>
                        {parsedBaggage.cabinBag.weight.kg && (
                          <p>
                            Weight: {parsedBaggage.cabinBag.weight.kg}kg /{" "}
                            {parsedBaggage.cabinBag.weight.lb}lbs
                          </p>
                        )}
                        {parsedBaggage.cabinBag.dimensions.length > 0 && (
                          <p>
                            Dimensions:{" "}
                            {parsedBaggage.cabinBag.dimensions.join(", ")}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Not specified</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* // Overlay for no seats
      {!flight.hasSeats && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center rounded-lg pointer-events-none">
          <span className="text-white font-bold text-lg">
            No Seats Available
          </span>
        </div>
      )} */}
    </div>
  );
};

export default FlightCard;
