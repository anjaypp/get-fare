import React, { useState, useMemo } from "react";
import airlineLogos from "../utils/airlineLogos";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { GiSchoolBag } from "react-icons/gi";
import OnwardFlights from "./OnwardFlights";

// Helper functions
const parseBaggage = (str = "") => {
  const weightMatch = str.match(/(\d+)\s*(?:kg|kilogram)/i);
  const lbMatch = str.match(/(\d+)\s*(?:lb|pound)/i);
  const piecesMatch = str.match(/(\d+)PC/i);
  const dimensionsMatch = [...str.matchAll(/(\d+(?:\.\d+)?)\s*(?:cm|in)(?:x(\d+)?\s*(?:cm|in))?(?:x(\d+)?\s*(?:cm|in))?/gi)].map(m => m[0]);
  return {
    pieces: piecesMatch ? +piecesMatch[1] : null,
    weight: { kg: weightMatch ? +weightMatch[1] : null, lb: lbMatch ? +lbMatch[1] : null },
    dimensions: dimensionsMatch,
    raw: str
  };
};

const formatBaggageText = (b) => {
  const parts = [];
  if (b.pieces) parts.push(`${b.pieces} piece${b.pieces > 1 ? "s" : ""}`);
  if (b.weight.kg) parts.push(`${b.weight.kg}kg`);
  else if (b.weight.lb) parts.push(`${b.weight.lb}lbs`);
  return parts.join(", ") || "Not specified";
};

const formatStops = (stops) => (stops === 0 ? "Non-stop" : stops === 1 ? "1 stop" : `${stops} stops`);

// Subcomponents
const BaggageInfo = ({ title, baggage }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <h5 className="font-medium text-gray-700 mb-2">{title}</h5>
    {baggage.pieces || baggage.weight.kg ? (
      <div className="space-y-1 text-sm text-gray-600">
        {baggage.pieces && <p>Pieces: {baggage.pieces}</p>}
        {(baggage.weight.kg || baggage.weight.lb) && <p>Weight: {baggage.weight.kg ?? "-"}kg / {baggage.weight.lb ?? "-"}lbs</p>}
        {baggage.dimensions.length > 0 && <p>Dimensions: {baggage.dimensions.join(", ")}</p>}
      </div>
    ) : (
      <p className="text-sm text-gray-500">Not specified</p>
    )}
  </div>
);

const FareOption = ({ fare, currency, priceClass, refundable, onBook, purchaseId }) => {
  const fareTotal = fare.base + (fare.taxes?.reduce((sum, t) => sum + t.amt, 0) || 0);
  return (
    <div className="flex justify-between items-center py-2 px-3 bg-white rounded shadow-sm mb-2">
      <div>
        <p className="font-medium text-gray-700 mb-0">{priceClass} {fare.paxType} ({refundable ? "Refundable" : "Non-refundable"})</p>
      </div>
      <div className="flex items-center gap-4">
        <p className="font-bold">{currency} {fareTotal.toFixed(2)}</p>
        <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => onBook(null, purchaseId)}>Book</button>
      </div>
    </div>
  );
};

const SegmentSummary = ({ group, type }) => {
  const firstSeg = group.segs[0];
  const lastSeg = group.segs[group.segs.length - 1];
  const totalDuration = group.segs.reduce((sum, seg) => sum + (seg.duration || 0), 0);
  const stops = Math.max(0, group.segs.length - 1);

  return (
    <div className="flex items-center space-x-6 border-b border-gray-200 pb-2">
      <div className="text-sm text-gray-600 font-semibold w-20">{type}</div>
      <div className="flex flex-col items-center">
        <p className="text-lg font-bold">{new Date(firstSeg.departureOn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
        <p className="text-sm">{firstSeg.origin}</p>
      </div>
      <div className="flex flex-col items-center text-center">
        <p className="text-sm text-gray-500">{formatStops(stops)}</p>
        <div className="w-16 border-t border-gray-300 my-1"></div>
        <p className="text-sm text-gray-500">{Math.floor(totalDuration/60)}h {totalDuration%60}m</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-lg font-bold">{new Date(lastSeg.arrivalOn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
        <p className="text-sm">{lastSeg.destination}</p>
      </div>
    </div>
  );
};

// Main Component
const FlightCard = ({ flight, onBook }) => {
  const [showFares, setShowFares] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const totalFare = useMemo(() => {
    const fare = flight.fareGroups[0]?.fares[0] || {};
    return fare.base + (fare.taxes?.reduce((sum, t) => sum + t.amt, 0) || 0);
  }, [flight]);

  const parsedBaggage = useMemo(() => {
    const baggageData = flight.fareGroups[0]?.baggages?.[0] || {};
    return {
      checkInBag: parseBaggage(baggageData.checkInBag),
      cabinBag: parseBaggage(baggageData.cabinBag)
    };
  }, [flight]);

  return (
    <div className="relative">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6 flex justify-between items-center">
          {/* Airline Info */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border border-gray-200 rounded-lg flex items-center justify-center">
              <img src={airlineLogos[flight.airline]} alt={flight.airline} className="h-10"/>
            </div>
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-600 ml-2 mr-2">{flight.airlineName} ({flight.airline})</p>
              <p className="text-xs font-bold text-gray-800">{flight.segGroups[0]?.segs[0]?.flightNum}</p>
            </div>
          </div>

          {/* Flight Segments */}
          <div className="flex flex-col items-center space-y-2">
            {flight.segGroups.map((group, idx) => <SegmentSummary key={idx} group={group} type={idx === 0 ? "Outbound" : "Return"} />)}
          </div>

          {/* Price & Action */}
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{flight.currency} {Math.round(totalFare)}</p>
            {flight.fareGroups.length === 1 && flight.fareGroups[0].fares.length === 1 ? (
              <button onClick={() => onBook(flight, flight.fareGroups[0].purchaseId)} className="mt-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Book Now</button>
            ) : (
              <button onClick={() => setShowFares(p => !p)} className="mt-2 px-6 py-2 border border-teal-400 text-teal-500 rounded-lg hover:bg-teal-50">View Fares</button>
            )}
          </div>
        </div>

        {/* Fare Options */}
        {showFares && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <h4 className="font-semibold text-gray-800 mb-3">Fare Options</h4>
            {flight.fareGroups.map(group => (
              <div key={group.purchaseId} className="mb-4">
                {group.fares.map((fare, idx) => (
                  <FareOption key={idx} fare={fare} currency={flight.currency} priceClass={group.priceClass} refundable={group.refundable} onBook={onBook} purchaseId={group.purchaseId} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Baggage & Details Toggle */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600"><GiSchoolBag className="mr-2 text-green-500" />Check-in: {formatBaggageText(parsedBaggage.checkInBag)}</div>
            {parsedBaggage.cabinBag.pieces && <div className="flex items-center text-gray-600">Cabin: {formatBaggageText(parsedBaggage.cabinBag)}</div>}
          </div>
          <button onClick={() => setShowDetails(p => !p)} className="flex items-center text-gray-700 hover:text-gray-900">
            <span className="text-sm font-medium flex items-center gap-1">Flight Details {showDetails ? <FaAngleUp className="text-xl inline-block"/> : <FaAngleDown className="text-xl inline-block"/>}</span>
          </button>
        </div>

        {showDetails && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <OnwardFlights flight={flight} />
            <div className="mt-4 bg-white p-4 rounded-lg">
              <h4 className="bg-gray-100 text-left w-[95%] mx-auto my-2.5 px-2.5 py-1.5 rounded text-base font-semibold text-gray-900">Baggage Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaggageInfo title="Check-in Baggage" baggage={parsedBaggage.checkInBag} />
                <BaggageInfo title="Cabin Baggage" baggage={parsedBaggage.cabinBag} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(FlightCard);

