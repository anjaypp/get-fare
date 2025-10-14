import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../axios-client";
import toast from "react-hot-toast";
import PriceSummary from "../components/PriceSummary";
import LoadingModal from "../components/LoadingModal";
import ContactDetailsForm from "../components/ContactDetailsForm";
import Addons from "../components/Addons";
import PassengerForm from "../components/PassengerForm";
import { FaRegArrowAltCircleRight } from "react-icons/fa";

const RevalidationPage = () => {
  const [isFareRulesOpen, setIsFareRulesOpen] = useState(false);
  const [contactData, setContactData] = useState({
    email: "",
    mobile: "",
    areaCode: "",
  });
  const [passengerData, setPassengerData] = useState({ passengers: [] });
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { revalidation, purchaseId } = location.state || {};

  if (!revalidation) {
    return <p className="p-6">No revalidation data. Please search again.</p>;
  }

  const flight = revalidation.flights?.[0];
  const fareGroup = flight?.fareGroups?.[0];
  const passengerFields = revalidation.passengerRequiredFields || [];

  const handlePassengerDataChange = (data) => setPassengerData(data);

  // Extract error message from API
  const extractErrorDetail = (message) => {
    if (!message) return "An unknown error occurred";
    const jsonPart = message.split("An error occurred: ")[1];
    if (!jsonPart) return message;
    try {
      const parsed = JSON.parse(jsonPart);
      return parsed.detail || message;
    } catch {
      return message;
    }
  };

  // Handle booking or hold
  const handleProceedToBooking = async (hold) => {
    const passengers = passengerData?.passengers || [];

    // Validate contact fields first
    const errors = [];
    if (!contactData.email || !contactData.mobile || !contactData.areaCode) {
      errors.push(
        "Please fill in all contact details (Email, Phone, Area Code)"
      );
    }

    // Validate passenger fields
    const contactFields = ["email", "mobile", "areaCode"];
    passengerFields.forEach((pax) => {
      const requiredFields = Object.keys(pax).filter(
        (key) => key !== "paxType" && pax[key]
      );
      const passengersOfType = passengers.filter(
        (p) => p.paxType === pax.paxType
      );

      passengersOfType.forEach((p, idx) => {
        requiredFields.forEach((field) => {
          if (contactFields.includes(field)) return; // skip contact fields
          const fieldMap = {
            salutation: "title",
            firstName: "firstName",
            lastName: "lastName",
            dob: "dob",
            gender: "genderType",
            passportNumber: "passportNumber",
            passengerNationality: "passengerNationality",
            passportDOI: "passportDOI",
            passportDOE: "passportDOE",
            passportIssuedCountry: "passportIssuedCountry",
          };
          const passengerFieldName = fieldMap[field] || field;

          if (
            !p[passengerFieldName] ||
            p[passengerFieldName].toString().trim() === ""
          ) {
            const fieldDisplay = field
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase());
            errors.push(
              `${fieldDisplay} is required for ${pax.paxType} passenger ${
                idx + 1
              }`
            );
          }
        });
      });
    });

    if (errors.length) {
      toast.error(errors.join("\n"));
      return;
    }

    setLoading(true);

    // Merge contact info into passengers
    const payload = {
      traceId: revalidation.traceId,
      purchaseIds: [purchaseId],
      isHold: hold,
      passengers: passengers.map((p) => ({
        ...p,
        email: contactData.email,
        mobile: contactData.mobile,
        areaCode: contactData.areaCode,
      })),
    };

    try {
      const res = await axiosClient.post("/flights/booking", payload);
      if (res.data.success) {
        navigate("/flight-booking", { state: { booking: res.data.data } });
      } else {
        toast.error(
          extractErrorDetail(res.data.message) ||
            "Booking failed. Please try again."
        );
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(
        extractErrorDetail(
          err.response?.data?.message || err.message || "Booking error"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Other helpers (formatTime, formatDate, formatDuration, calculateLayover, getAirlineName)
  const formatTime = (dateTimeString) =>
    dateTimeString
      ? new Date(dateTimeString).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "N/A";
  const formatDate = (dateTimeString) =>
    dateTimeString
      ? new Date(dateTimeString).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      : "N/A";
  const formatDuration = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  const calculateLayover = (arrivalTime, departureTime) => {
    if (!arrivalTime || !departureTime) return "N/A";
    const layoverMinutes = Math.floor(
      (new Date(departureTime) - new Date(arrivalTime)) / (1000 * 60)
    );
    return formatDuration(layoverMinutes);
  };
  const getAirlineName = (code) => {
    const airlines = {
      "6E": "IndiGo",
      AI: "Air India",
      SG: "SpiceJet",
      "9W": "Jet Airways",
      UK: "Vistara",
      G8: "GoFirst",
    };
    return airlines[code] || code;
  };

  const firstSegGroup = flight?.segGroups?.[0];
  const origin = firstSegGroup?.origin || "N/A";
  const destination = firstSegGroup?.destination || "N/A";
  const departureDate = firstSegGroup?.departureOn;
  const totalSegments = firstSegGroup?.segs?.length || 0;

  // Calculate total duration and stops
  const allSegments = flight?.segGroups?.flatMap((sg) => sg.segs || []) || [];
  const totalDuration = allSegments.reduce(
    (sum, seg) => sum + (seg.duration || 0),
    0
  );
  const totalStops = totalSegments > 0 ? totalSegments - 1 : 0;
  const totalHours = Math.floor(totalDuration / 60);
  const totalMins = totalDuration % 60;

  return (
    <div className="w-full min-h-screen p-12 bg-[linear-gradient(300.13deg,#D9D9D9_8.16%,#FAF3DB_52.55%,#F4F4FF_106.01%)]">
      {/* <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold mb-6">Review Your Flight</h2>
        <span
          onClick={() => setIsFareRulesOpen(true)}
          className="text-ms text-blue-600"
        >
          View Fare Rules
        </span>
      </div> */}

      {/* Flight Segments & Passenger Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">DEPART</p>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xl font-bold text-gray-800">
                      {formatDate(departureDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-900">
                      {origin}
                    </span>

                    <FaRegArrowAltCircleRight className="text-yellow-400 text-2xl" />

                    <span className="text-2xl font-bold text-gray-900">
                      {destination}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {totalStops === 0
                      ? ""
                      : `${totalStops} Stop${totalStops > 1 ? "s" : ""}, `}
                    {totalHours} Hrs {totalMins} Mins
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsFareRulesOpen(true)}
                className="text-indigo-900 hover:text-indigo-950 font-medium underline text-sm"
              >
                Fare Rules
              </button>
            </div>
          </div>

          {flight?.segGroups?.map((segGroup, gIdx) => {
            const segments = segGroup.segs || [];
            const totalSegments = segments.length;
            const isReturn = gIdx > 0;
            return (
              <div
                key={gIdx}
                className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="bg-gray-100 text-indigo-900 p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {isReturn ? "Return: " : "Outbound: "} {segGroup.origin} →{" "}
                      {segGroup.destination}
                    </h3>
                    <p className="text-indigo-900 text-sm">
                      {formatDate(segGroup.departureOn)} •{" "}
                      {totalSegments === 1
                        ? "Non-stop"
                        : `${totalSegments - 1} stop${
                            totalSegments > 2 ? "s" : ""
                          }`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-indigo-900 text-sm">Total Duration</p>
                    <p className="text-lg font-semibold">
                      {formatDuration(
                        segments.reduce((t, s) => t + s.duration, 0)
                      )}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  {segments.map((seg, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between py-4">
                        <div className="text-center flex-1">
                          <p className="text-2xl font-bold text-gray-800">
                            {formatTime(seg.departureOn)}
                          </p>
                          <p className="text-sm text-gray-600 font-medium">
                            {seg.origin}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(seg.departureOn)}
                          </p>
                          {seg.depTerminal && (
                            <p className="text-xs text-gray-500">
                              Terminal {seg.depTerminal}
                            </p>
                          )}
                        </div>

                        <div className="flex-2 px-6">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-xs">
                                  {seg.mrkAirline}
                                </span>
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-800">
                                  {getAirlineName(seg.mrkAirline)}{" "}
                                  {seg.flightNum}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {seg.eqpType} • {formatDuration(seg.duration)}
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
                            {formatTime(seg.arrivalOn)}
                          </p>
                          <p className="text-sm text-gray-600 font-medium">
                            {seg.destination}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(seg.arrivalOn)}
                          </p>
                          {seg.arrTerminal && (
                            <p className="text-xs text-gray-500">
                              Terminal {seg.arrTerminal}
                            </p>
                          )}
                        </div>
                      </div>

                      {idx < segments.length - 1 && (
                        <div className="border-t border-gray-200 py-3 flex justify-center space-x-2 text-orange-600 text-sm">
                          <p>
                            Layover in {seg.destination}:{" "}
                            {calculateLayover(
                              seg.arrivalOn,
                              segments[idx + 1]?.departureOn
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

           <h2 className="text-2xl font-semibold text-indigo-900 m-4">Passenger Information</h2>
          <PassengerForm
            passengerFields={passengerFields}
            flight={flight}
            onPassengerDataChange={handlePassengerDataChange}
          />

          <h2 className="text-2xl font-semibold text-indigo-900 m-4">Contact Details</h2>
          <ContactDetailsForm
            contactData={contactData}
            onContactChange={setContactData}
          />

          <h2 className="text-2xl font-semibold text-indigo-900 m-4">Addons (Optional)</h2>
          <Addons/>
        </div>

        {/* Right Panel: Price Summary */}
        <PriceSummary flight={flight} fareGroup={fareGroup} />
      </div>

      {isFareRulesOpen && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
              onClick={() => setIsFareRulesOpen(false)}
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4">Fare Rules</h3>

            {fareGroup?.miniRules?.length ? (
              <div className="space-y-6">
                {/* Change Policy */}
                <div>
                  <h4 className="text-lg font-semibold text-blue-600 mb-2">
                    Change Policy
                  </h4>
                  {fareGroup.miniRules
                    .filter((rule) => rule.changeAllowed)
                    .map((rule, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-400 pl-3 py-2 mb-2 bg-gray-50 rounded"
                      >
                        <p className="text-sm text-gray-700">
                          <strong>When:</strong> {rule.apply}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Fee:</strong> ₹{rule.exgAmt || 0}
                        </p>
                        {rule.remarks && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            {rule.remarks}
                          </p>
                        )}
                      </div>
                    ))}
                </div>

                {/* Cancellation Policy */}
                <div>
                  <h4 className="text-lg font-semibold text-red-600 mb-2">
                    Cancellation Policy
                  </h4>
                  {fareGroup.miniRules
                    .filter((rule) => rule.cancelAllowed)
                    .map((rule, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-red-400 pl-3 py-2 mb-2 bg-gray-50 rounded"
                      >
                        <p className="text-sm text-gray-700">
                          <strong>When:</strong> {rule.apply}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Fee:</strong> ₹{rule.canAmt || 0}
                        </p>
                        {rule.remarks && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            {rule.remarks}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">
                No change or cancellation policies available for this fare.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Back to Search
        </button>
        
      {flight?.isHold && (
        <button
          onClick={() => handleProceedToBooking(true)}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
        >
          Hold
        </button>
      )}
        <button
          onClick={() => handleProceedToBooking(false)}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Issue
        </button>

      </div>
      <LoadingModal
        loading={loading}
        loadingMessage="Processing your request..."
      />
    </div>
  );
};

export default RevalidationPage;
