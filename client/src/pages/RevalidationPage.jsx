import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../axios-client";
import PassengerForm from "../components/PassengerForm";

const RevalidationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { revalidation, selectedFlight } = location.state || {};

  // Collapsible sections state
  const [isBaggageOpen, setIsBaggageOpen] = useState(false);
  const [isFareRulesOpen, setIsFareRulesOpen] = useState(false);
  const [isAddonsOpen, setIsAddonsOpen] = useState(false);

  // Passenger form state
  const [passengerData, setPassengerData] = useState({});

  if (!revalidation) {
    return <p className="p-6">No revalidation data. Please search again.</p>;
  }

  const flight = revalidation.flights?.[0];
  const fareGroup = flight?.fareGroups?.[0];
  const passengerFields = revalidation.passengerRequiredFields || [];

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  };

  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const calculateLayover = (arrivalTime, departureTime) => {
    if (!arrivalTime || !departureTime) return "N/A";
    const arrival = new Date(arrivalTime);
    const departure = new Date(departureTime);
    const layoverMinutes = Math.floor((departure - arrival) / (1000 * 60));
    return formatDuration(layoverMinutes);
  };

  const getAirlineName = (code) => {
    const airlines = {
      "6E": "IndiGo",
      AI: "Air India",
      SG: "SpiceJet",
      "9W": "Jet Airways",
      UK: "Vistara",
      G8: "GoFirst"
    };
    return airlines[code] || code;
  };

  const handlePassengerDataChange = (data) => setPassengerData(data);

  const handleProceedToBooking = async () => {
    const errors = [];

    if (!passengerData?.passengers || passengerData.passengers.length === 0) {
      alert("Please fill in passenger information");
      return;
    }

    const requiredFieldsMap = {};
    passengerFields.forEach((pax) => {
      requiredFieldsMap[pax.paxType] = Object.keys(pax).filter(
        (key) => key !== "paxType" && pax[key] === true
      );
    });

    const passengersByType = {};
    passengerData.passengers.forEach((passenger, index) => {
      if (!passengersByType[passenger.paxType])
        passengersByType[passenger.paxType] = [];
      passengersByType[passenger.paxType].push({
        ...passenger,
        originalIndex: index
      });
    });

    Object.keys(requiredFieldsMap).forEach((paxType) => {
      const requiredFields = requiredFieldsMap[paxType];
      const expectedCount = flight[`${paxType.toLowerCase()}Num`] || 0;
      const actualPassengers = passengersByType[paxType] || [];

      if (actualPassengers.length !== expectedCount) {
        errors.push(
          `Expected ${expectedCount} ${paxType} passengers, but found ${actualPassengers.length}`
        );
        return;
      }

      actualPassengers.forEach((passenger, passengerIndex) => {
        requiredFields.forEach((field) => {
          const fieldMap = {
            salutation: "title",
            firstName: "firstName",
            lastName: "lastName",
            email: "email",
            dob: "dob",
            gender: "genderType",
            areaCode: "areaCode",
            ffNumber: "ffNumber",
            mobile: "mobile",
            passportNumber: "passportNumber",
            passengerNationality: "passengerNationality",
            passportDOI: "passportDOI",
            passportDOE: "passportDOE",
            passportIssuedCountry: "passportIssuedCountry",
            seatPref: "seatPref",
            mealPref: "mealPref",
            ktn: "ktn",
            redressNo: "redressNo"
          };

          const passengerFieldName = fieldMap[field] || field;
          const fieldValue = passenger[passengerFieldName];

          if (!fieldValue || fieldValue.toString().trim() === "") {
            const fieldDisplayName = field
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase());
            errors.push(
              `${fieldDisplayName} is required for ${paxType} passenger ${
                passengerIndex + 1
              }`
            );
          }
        });
      });
    });

    if (errors.length > 0) {
      alert("Please fill in all required fields:\n" + errors.join("\n"));
      return;
    }

    const payload = {
      traceId: revalidation.traceId,
      purchaseIds: [selectedFlight.fareGroups?.[0]?.purchaseId],
      isHold: false,
      passengers: passengerData.passengers
    };

    console.log("The response to booking:", payload);
    const res = await axiosClient.post("/flights/booking", payload);
    console.log(res.data);

    if (res.data.success) {
      navigate("/flight-booking", { state: { booking: res.data.data } });
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-2 mb-2 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Review Your Flight</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-2 space-y-6">
          {flight?.isFareChange && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              ⚠️ Fare has changed. Please confirm the new price.
            </div>
          )}

          {/* Render all segGroups dynamically */}
          {flight?.segGroups?.map((segGroup, groupIndex) => {
            const segments = segGroup?.segs || [];
            const totalSegments = segments.length;
            const isReturn = groupIndex > 0;

            return (
              <div
                key={groupIndex}
                className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="bg-blue-600 text-white p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {isReturn ? "Return: " : "Outbound: "} {segGroup.origin}{" "}
                        → {segGroup.destination}
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {formatDate(segGroup.departureOn)} •{" "}
                        {totalSegments === 1
                          ? "Non-stop"
                          : `${totalSegments - 1} stop${
                              totalSegments > 2 ? "s" : ""
                            }`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-100 text-sm">Total Duration</p>
                      <p className="text-lg font-semibold">
                        {formatDuration(
                          segments.reduce(
                            (total, seg) => total + seg.duration,
                            0
                          )
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {segments.map((segment, index) => (
                    <div key={index}>
                      {/* Segment info */}
                      <div className="flex items-center justify-between py-4">
                        <div className="text-center flex-1">
                          <p className="text-2xl font-bold text-gray-800">
                            {formatTime(segment.departureOn)}
                          </p>
                          <p className="text-sm text-gray-600 font-medium">
                            {segment.origin}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(segment.departureOn)}
                          </p>
                          {segment.depTerminal && (
                            <p className="text-xs text-gray-500">
                              Terminal {segment.depTerminal}
                            </p>
                          )}
                        </div>

                        <div className="flex-2 px-6">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-xs">
                                  {segment.mrkAirline}
                                </span>
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-800">
                                  {getAirlineName(segment.mrkAirline)}{" "}
                                  {segment.flightNum}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {segment.eqpType} •{" "}
                                  {formatDuration(segment.duration)}
                                </p>
                              </div>
                            </div>
                            <div className="w-full h-px bg-gray-300 relative">
                              <div className="absolute left-0 top-0 w-2 h-2 bg-blue-500 rounded-full transform -translate-y-1/2"></div>
                              <div className="absolute right-0 top-0 w-2 h-2 bg-blue-500 rounded-full transform -translate-y-1/2"></div>
                            </div>
                          </div>
                        </div>

                        <div className="text-center flex-1">
                          <p className="text-2xl font-bold text-gray-800">
                            {formatTime(segment.arrivalOn)}
                          </p>
                          <p className="text-sm text-gray-600 font-medium">
                            {segment.destination}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(segment.arrivalOn)}
                          </p>
                          {segment.arrTerminal && (
                            <p className="text-xs text-gray-500">
                              Terminal {segment.arrTerminal}
                            </p>
                          )}
                        </div>
                      </div>

                      {index < segments.length - 1 && (
                        <div className="border-t border-gray-200 py-3">
                          <div className="flex items-center justify-center space-x-2 text-orange-600">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <p className="text-sm font-medium">
                              Layover in {segment.destination}:{" "}
                              {calculateLayover(
                                segment.arrivalOn,
                                segments[index + 1]?.departureOn
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Passenger Form */}
          <PassengerForm
            passengerFields={passengerFields}
            flight={flight}
            onPassengerDataChange={handlePassengerDataChange}
          />

          {/* Baggage, Fare Rules, Addons (same as before) */}
          {/* Baggage Information (Collapsible) */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div
              className="flex justify-between items-center cursor-pointer"
              role="button"
              aria-expanded={isBaggageOpen}
              onClick={() => setIsBaggageOpen(!isBaggageOpen)}
            >
              <h4 className="font-semibold text-gray-800 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                </svg>
                Baggage Allowance
              </h4>
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  isBaggageOpen ? "rotate-180" : ""
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {isBaggageOpen && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {fareGroup?.baggages
                  ?.filter((bag) => bag.paxType === "ADT")
                  .map((bag, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border">
                      <p className="font-medium text-gray-700 mb-1">
                        {bag.cityPair?.substring(0, 3)} →{" "}
                        {bag.cityPair?.substring(3, 6)}
                      </p>
                      <div className="space-y-1 text-gray-600">
                        <p>
                          <span className="font-medium">Cabin:</span>{" "}
                          {bag.cabinBag}
                        </p>
                        <p>
                          <span className="font-medium">Check-in:</span>{" "}
                          {bag.checkInBag}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Fare Rules (Collapsible) */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div
              className="flex justify-between items-center cursor-pointer"
              role="button"
              aria-expanded={isFareRulesOpen}
              onClick={() => setIsFareRulesOpen(!isFareRulesOpen)}
            >
              <h4 className="font-semibold text-gray-800 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Fare Rules
              </h4>
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  isFareRulesOpen ? "rotate-180" : ""
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {isFareRulesOpen && (
              <div className="mt-3 space-y-3">
                {fareGroup?.miniRules?.length ? (
                  <>
                    {fareGroup.miniRules.reduce(
                      (acc, rule) => {
                        const key = rule.changeAllowed ? "change" : "cancel";
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(rule);
                        return acc;
                      },
                      { change: [], cancel: [] }
                    ).change?.length > 0 && (
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="font-medium text-blue-800 mb-2">
                          ✏️ Changes Allowed
                        </p>
                        <p className="text-sm text-blue-700">
                          Change fee: ₹
                          {fareGroup.miniRules.find((r) => r.changeAllowed)
                            ?.exgAmt || 0}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {
                            fareGroup.miniRules.find((r) => r.changeAllowed)
                              ?.remarks
                          }
                        </p>
                      </div>
                    )}

                    {fareGroup.miniRules.reduce(
                      (acc, rule) => {
                        const key = rule.changeAllowed ? "change" : "cancel";
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(rule);
                        return acc;
                      },
                      { change: [], cancel: [] }
                    ).cancel?.length > 0 && (
                      <div className="bg-green-50 p-3 rounded border border-green-200">
                        <p className="font-medium text-green-800 mb-2">
                          ❌ Cancellation Allowed
                        </p>
                        <p className="text-sm text-green-700">
                          Cancel fee: ₹
                          {fareGroup.miniRules.find((r) => r.cancelAllowed)
                            ?.canAmt || 0}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {
                            fareGroup.miniRules.find((r) => r.cancelAllowed)
                              ?.remarks
                          }
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-600 text-sm">
                    Non-refundable / Non-changeable unless specified by airline.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <div
              className="flex justify-between items-center cursor-pointer"
              role="button"
              aria-expanded={isAddonsOpen}
              onClick={() => setIsAddonsOpen(!isAddonsOpen)}
            >
              <h4 className="font-semibold text-gray-800 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                </svg>
                Addons (Optional)
              </h4>
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  isBaggageOpen ? "rotate-180" : ""
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {isAddonsOpen && (
              <div className="mt-4">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  onClick={() => {
                    console.log("Addons");
                  }}
                >
                  Baggage
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Price Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border-2 border-gray-200 rounded-lg top-6">
            <div className="bg-gray-50 p-4 border-b">
              <h3 className="font-semibold text-gray-800">Price Summary</h3>
              <p className="text-sm text-gray-600">
                {flight?.adtNum} Adult{flight?.adtNum > 1 ? "s" : ""}
                {flight?.chdNum
                  ? `, ${flight.chdNum} Child${flight.chdNum > 1 ? "ren" : ""}`
                  : ""}
                {flight?.infNum
                  ? `, ${flight.infNum} Infant${flight.infNum > 1 ? "s" : ""}`
                  : ""}
              </p>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Fare</span>
                <span className="font-medium">
                  ₹{fareGroup?.fares?.[0]?.base?.toLocaleString() || "N/A"}
                </span>
              </div>

              {fareGroup?.fares?.[0]?.taxes?.map((tax, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600">{tax.code}</span>
                  <span className="font-medium">
                    ₹{tax.amt?.toLocaleString()}
                  </span>
                </div>
              ))}

              <hr className="border-gray-200" />

              <div className="flex justify-between items-center py-2">
                <span className="font-semibold text-gray-800">
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {fareGroup?.totalAmount?.toLocaleString() || "N/A"}
                </span>
              </div>

              <p className="text-xs text-gray-500 text-center">
                All taxes and fees included
              </p>
              <div className="flex justify-center pt-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {fareGroup?.refundable ? "✓ Refundable" : "✗ Non-refundable"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Back to Search
        </button>
        <button
          onClick={handleProceedToBooking}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Continue to Book
        </button>
      </div>
    </div>
  );
};

export default RevalidationPage;
