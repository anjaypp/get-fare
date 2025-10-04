import React from "react";
import { useLocation } from "react-router-dom";

const BookingConfirmation = ({ booking }) => {
  const location = useLocation();
  
  // Get booking data from location state if not passed as prop
  const bookingData = booking || location.state?.booking;
  
  console.log("Location state:", location.state); // Debug log
  console.log("Booking prop:", booking); // Debug log
  console.log("Final booking data:", bookingData); // Debug log

  if (!bookingData) {
    return (
      <div className="p-6 text-center">
        <p>No booking data available.</p>
        <p className="text-sm text-gray-500 mt-2">
          Debug: Location state = {JSON.stringify(location.state)}
        </p>
      </div>
    );
  }

  // Handle API Errors
  if (bookingData.errors && bookingData.errors.length > 0) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-red-50 rounded-2xl shadow-md text-center">
        <h2 className="text-2xl font-bold text-red-700">Booking Failed ❌</h2>
        {bookingData.errors.map((err, i) => (
          <p key={i} className="text-red-600 mt-2">
            {err.errorCode}: {err.errorDetail}
          </p>
        ))}
        <p className="mt-4 text-gray-600">
          Please try again with a new OrderRefId or contact support.
        </p>
      </div>
    );
  }

  // Check if we have flights data
  if (!bookingData.flights || bookingData.flights.length === 0) {
    // Acknowledgement - when we have orderId but no flights yet
    if (bookingData.orderRefId) {
      return (
        <div className="max-w-3xl mx-auto p-8 bg-yellow-50 rounded-2xl shadow-md text-center">
          <h2 className="text-2xl font-bold text-yellow-700">
            Booking Request Received ⏳
          </h2>
          <p className="mt-2">
            Order Ref ID: <span className="font-mono">{bookingData.orderRefId}</span>
          </p>
          <p className="mt-2 text-gray-600">
            We are verifying availability with the airline. Please wait...
          </p>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto p-8 bg-gray-50 rounded-2xl shadow-md text-center">
        <h2 className="text-2xl font-bold">No Flight Data Available</h2>
        <p className="text-gray-600 mt-2">
          We couldn't find flight details for this booking.
        </p>
      </div>
    );
  }

  // Get the first flight
  const flight = bookingData.flights[0];
  
  const isFailed = flight.currentStatus === "Booking_Failed";
  const isConfirmed = flight.currentStatus === "Confirmed" || flight.currentStatus === "Ticketed";

  const formatDateTime = (dt) => {
    if (!dt) return "N/A";
    try {
      return new Date(dt).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dt;
    }
  };

  const getStatusIcon = () => {
    if (isConfirmed) return "✅";
    if (isFailed) return "❌";
    return "⏳";
  };

  const getStatusText = () => {
    if (isConfirmed) return "Booking Confirmed!";
    if (isFailed) return "Booking Failed";
    return "Booking Pending";
  };

  const getStatusMessage = () => {
    if (isConfirmed) return "Your flight booking is confirmed. Thank you for booking with us!";
    if (isFailed) return "We couldn't complete your booking. See details below.";
    return "We are waiting for airline confirmation. Please check back soon.";
  };

  const getStatusColor = () => {
    if (isConfirmed) return "text-green-600";
    if (isFailed) return "text-red-600";
    return "text-yellow-600";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Booking Header */}
      <div className="p-8 bg-white shadow-lg rounded-2xl text-center">
        <div className="text-4xl mb-3">{getStatusIcon()}</div>
        <h2 className={`text-2xl font-bold ${getStatusColor()}`}>
          {getStatusText()}
        </h2>
        <p className="mt-2 text-gray-600">{getStatusMessage()}</p>
        <p className="mt-4 text-gray-500">
          Booking Reference:{" "}
          <span className="font-mono text-blue-600">{bookingData.orderRefId}</span>
        </p>

        <p className="mt-4 text-gray-500">
          PNR: {" "}
          <span className="font-mono text-blue-600">{bookingData.flights[0]?.pnr || 'Not available'}</span>
          </p>

        {bookingData.createdOn && (
          <p className="text-sm text-gray-400 mt-2">
            Created: {formatDateTime(bookingData.createdOn)}
          </p>
        )}
      </div>

      {/* Flight Summary */}
      <div className="p-6 bg-white shadow-md rounded-xl">
        <h3 className="font-semibold text-lg mb-3">✈️ Flight Summary</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Airline:</span> {flight.validatingAirline} | 
            <span className="font-semibold ml-2">Status:</span> {flight.currentStatus} |
            <span className="font-semibold ml-2">Passengers:</span> {flight.adultCount} Adult(s)
            {flight.childCount > 0 && `, ${flight.childCount} Child(ren)`}
            {flight.infantCount > 0 && `, ${flight.infantCount} Infant(s)`}
          </p>
        </div>
        
        {flight.segGroups && flight.segGroups.map((group, i) => (
          <div key={i} className="p-4 mb-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg">
                  {group.origin} → {group.destination}
                </p>
                {group.segments && group.segments.map((segment, segIndex) => (
                  <div key={segIndex} className="mt-2 pl-4 border-l-2 border-blue-200">
                    <p className="text-sm font-medium">
                      {segment.origin} → {segment.destination}
                    </p>
                    <p className="text-sm text-gray-600">
                      {segment.mrkAirline} {segment.flightNum} • {segment.eqpType} • {segment.cabinClass}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-500 mt-1">
                      <span>Dep: {formatDateTime(segment.departureOn)}</span>
                      <span>Arr: {formatDateTime(segment.arrivalOn)}</span>
                      <span>Duration: {Math.floor(segment.duration / 60)}h {segment.duration % 60}m</span>
                    </div>
                    {segment.depTerminal && (
                      <p className="text-xs text-gray-500">
                        Terminal: {segment.depTerminal} → {segment.arrTerminal || 'N/A'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Passenger Info */}
      {flight.passengers && flight.passengers.length > 0 && (
        <div className="p-6 bg-white rounded-xl shadow-md">
          <h3 className="font-semibold text-lg mb-3">👤 Passengers</h3>
          {flight.passengers.map((p, i) => (
            <div key={i} className="mb-3 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">
                {p.title} {p.firstName} {p.lastName}
              </p>
              <div className="text-sm text-gray-600 mt-1">
                <span>Gender: {p.genderType} | </span>
                <span>DOB: {p.dob ? p.dob.split("T")[0] : 'N/A'} | </span>
                <span>Type: {p.paxType}</span>
              </div>
              {p.email && (
                <p className="text-sm text-gray-600">Email: {p.email}</p>
              )}
              {p.mobile && (
                <p className="text-sm text-gray-600">Mobile: {p.mobile}</p>
              )}
              {p.passportNumber && (
                <p className="text-sm text-gray-600">Passport: {p.passportNumber}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Baggage */}
      {flight.baggages && flight.baggages.length > 0 && (
        <div className="p-6 bg-white rounded-xl shadow-md">
          <h3 className="font-semibold text-lg mb-3">🧳 Baggage Allowance</h3>
          {flight.baggages.map((bag, i) => (
            <div key={i} className="mb-3 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">
                {bag.cityPair}: {bag.checkInBag}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Cabin:</span> {bag.cabinBag}
              </p>
              {bag.amount > 0 && (
                <p className="text-sm text-green-600">
                  Additional: ₹{bag.amount}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Fare Rules */}
      {flight.miniRules && flight.miniRules.length > 0 && (
        <div className="p-6 bg-white rounded-xl shadow-md">
          <h3 className="font-semibold text-lg mb-3">📋 Fare Rules</h3>
          {flight.miniRules.map((rule, i) => (
            <div key={i} className="mb-2 p-3 bg-gray-50 rounded-lg text-sm">
              <p className="font-medium text-gray-800">{rule.apply}:</p>
              <div className="mt-1 text-gray-600">
                {rule.changeAllowed && (
                  <span className="mr-4">
                    ✅ Changes allowed (Fee: ₹{rule.exgAmt?.toFixed(2) || '0'})
                  </span>
                )}
                {rule.cancelAllowed && (
                  <span>
                    ✅ Cancellation allowed (Fee: ₹{rule.canAmt?.toFixed(2) || '0'})
                  </span>
                )}
                {!rule.changeAllowed && !rule.cancelAllowed && (
                  <span className="text-red-600">❌ No changes or cancellations allowed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flight Fares */}
      {flight.flightFares && flight.flightFares.length > 0 && (
        <div className="p-6 bg-white shadow-md rounded-xl">
          <h3 className="font-semibold text-lg mb-3">💳 Fare Breakdown</h3>
          {flight.flightFares.map((fare, i) => (
            <div key={i} className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">
                {fare.paxType === 'ADT' ? 'Adult' : fare.paxType === 'CHD' ? 'Child' : 'Infant'}
              </p>
              <div className="text-sm text-gray-600 mt-2">
                <p>Base Fare: ₹{fare.baseFare?.toLocaleString() || 'N/A'}</p>
                {fare.taxes && fare.taxes.map((tax, taxIndex) => (
                  <p key={taxIndex}>
                    {tax.code}: ₹{tax.amt?.toLocaleString() || 'N/A'}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Actions */}
      <div className="text-center">
        {isConfirmed ? (
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            View / Print E-Ticket
          </button>
        ) : isFailed ? (
          <div className="space-x-4">
            <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Try Again
            </button>
            <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Contact Support
            </button>
          </div>
        ) : (
          <button className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
            Check Status
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingConfirmation;