import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../axios-client";
import toast from "react-hot-toast";
import PriceSummary from "../components/PriceSummary";
import LoadingModal from "../components/LoadingModal";
import TourCodeCard from "../components/TourCodeCard";
import RevalidationSkeleton from "../components/RevalidationSkeleton";
import ContactDetailsForm from "../components/ContactDetailsForm";
import Addons from "../components/Addons";
import PassengerForm from "../components/PassengerForm";
import {
  FaRegArrowAltCircleRight,
  FaSuitcase,
  FaInfoCircle,
} from "react-icons/fa";
import { MdAirplanemodeActive } from "react-icons/md";

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
  const { traceId, purchaseId } = location.state || {};
  const [revalidation, setRevalidation] = useState(null);

  useEffect(() => {
    const fetchRevalidation = async () => {
      if (!traceId || !purchaseId) {
        toast.error("Missing booking details. Please search again.");
        navigate("/");
        return;
      }

      setLoading(true);

      try {
        const res = await axiosClient.post("/flights/revalidate", {
          traceId,
          purchaseIds: [String(purchaseId)],
        });

        if (!res.data?.flights?.length) {
          toast.error("Unable to validate fare. Please try again.");
          navigate("/");
          return;
        }

        setRevalidation(res.data);
      } catch (error) {
        console.error("Revalidation error:", error);
        toast.error(
          error.response?.data?.message ||
            "Network or server error. Please try again."
        );
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchRevalidation();
  }, [traceId, purchaseId, navigate]);

  if (loading) {
    return <RevalidationSkeleton />;
  }

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
      traceId,
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
    <div className="min-h-screen bg-[linear-gradient(300.13deg,#D9D9D9_8.16%,#FAF3DB_52.55%,#F4F4FF_106.01%)]">
      <div className="max-w-6xl mx-auto pt-12 pb-12 ">
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
                  <p className="text-sm text-gray-600 font-medium mb-2">
                    DEPART
                  </p>
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

            {flight?.segGroups?.length ? (
              flight.segGroups.map((segGroup, gIdx) => {
                const segments = segGroup.segs || [];
                return (
                  <div
                    key={gIdx}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="p-4">
                      {segments.map((seg, idx) => (
                        <div
                          key={idx}
                          className="p-6 border-b border-gray-200 last:border-none"
                        >
                          <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="flex items-center gap-3 w-full md:w-1/4">
                              <div className="text-center">
                                <img
                                  src={`/react/flight_logos/${
                                    seg.mrkAirline || "AA"
                                  }.webp`}
                                  alt={getAirlineName(seg.mrkAirline || "AA")}
                                  className="w-20 h-20 rounded object-contain mx-auto"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                  <span className="text-blue-600 font-bold text-xs">
                                    {seg.mrkAirline || "AA"}
                                  </span>
                                </div>
                                <p className="p-2 text-sm text-[#12114A] font-medium">
                                  {getAirlineName(seg.mrkAirline || "AA")} -{" "}
                                  {seg.flightNum || "N/A"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start justify-between w-full h-36 md:w-2/4">
                              <div className="w-2/6 flex flex-col h-full justify-between">
                                <div>
                                  <p className="text-xl font-bold text-[#12114A]">
                                    {formatTime(seg.departureOn)}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {formatDate(seg.departureOn)}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xl font-bold text-[#12114A]">
                                    {formatTime(seg.arrivalOn)}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {formatDate(seg.arrivalOn)}
                                  </p>
                                </div>
                              </div>

                              <div className="w-1/6 flex flex-col items-center text-gray-400">
                                <span className="h-28 w-px bg-gray-300 my-1"></span>
                                <MdAirplanemodeActive className="text-lg" />
                              </div>

                              <div className="w-3/6 flex flex-col h-full justify-between">
                                <div>
                                  <p className="text-sm text-[#12114A] font-medium mt-1">
                                    {seg.origin || "N/A"}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {seg.origin || "N/A"}
                                    {seg.depTerminal &&
                                      `, Terminal ${seg.depTerminal}`}
                                  </p>
                                </div>

                                <div className="text-sm text-gray-600 font-semibold">
                                  {formatDuration(seg.duration)}
                                </div>

                                <div>
                                  <p className="text-sm text-[#12114A] font-medium mt-1">
                                    {seg.destination || "N/A"}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {seg.destination || "N/A"}
                                    {seg.arrTerminal &&
                                      `, Terminal ${seg.arrTerminal}`}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="w-full md:w-1/4">
                              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <p className="text-[#12114A] font-semibold mb-2">
                                  Free Baggage Detail
                                </p>
                                <div className="flex items-start gap-2 text-sm text-gray-700 mb-1">
                                  <FaSuitcase className="mt-0.5 text-yellow-600" />
                                  <p>Check In: 15 kg</p>
                                </div>
                                <div className="flex items-start gap-2 text-sm text-gray-700 mb-1">
                                  <FaSuitcase className="mt-0.5 text-yellow-600" />
                                  <p>Cabin: 7 kg</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[#12114A] font-medium cursor-pointer">
                                  <FaInfoCircle className="text-yellow-600" />
                                  <span>Information</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {idx < segments.length - 1 && (
                            <div className="mt-6 border-t border-gray-200 pt-4 text-center">
                              {/* Destination on top */}
                              <p className="text-[#12114A] font-semibold">
                                {seg.destination || "N/A"}
                              </p>

                              {/* Change Planes with line */}
                              <div className="flex items-center">
                                <p className="text-gray-400 font-medium whitespace-nowrap mr-2">
                                  Change Planes
                                </p>
                                <div className="flex-grow border-t border-gray-200"></div>
                              </div>

                              {/* Connecting time below */}
                              <p className="text-gray-500 text-sm">
                                Connecting Time:{" "}
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
              })
            ) : (
              <p className="text-gray-600 p-4">No flight segments available.</p>
            )}

            <h2 className="text-2xl font-semibold text-indigo-900 m-4">
              Passenger Information
            </h2>
            <PassengerForm
              passengerFields={passengerFields}
              flight={flight}
              onPassengerDataChange={handlePassengerDataChange}
            />

            <h2 className="text-2xl font-semibold text-indigo-900 m-4">
              Contact Details
            </h2>
            <ContactDetailsForm
              contactData={contactData}
              onContactChange={setContactData}
            />

            <h2 className="text-2xl font-semibold text-indigo-900 m-4">
              Addons (Optional)
            </h2>
            <Addons traceId={traceId} purchaseId={purchaseId}/>
          </div>

          {/* Right Panel: Price Summary */}
          <div className="lg:col-span-1 relative">
            <PriceSummary flight={flight} fareGroup={fareGroup} />
            <TourCodeCard />

            {/* Sticky action buttons */}
            <div className="bottom-4 mt-6 flex gap-4">
              {flight?.isHold && (
                <button
                  onClick={() => handleProceedToBooking(true)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium cursor-pointer"
                >
                  Hold
                </button>
              )}
              <button
                onClick={() => handleProceedToBooking(false)}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-indigo-950 text-white rounded-lg hover:bg-indigo-900 transition-colors font-medium cursor-pointer"
              >
                Issue
              </button>
            </div>
          </div>
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

        {/* Action Buttons
      <div className="flex gap-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium cursor-pointer"
        >
          Back to Search
        </button>

        {flight?.isHold && (
          <button
            onClick={() => handleProceedToBooking(true)}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium cursor-pointer"
          >
            Hold
          </button>
        )}
        <button
          onClick={() => handleProceedToBooking(false)}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
        >
          Issue
        </button>
      </div> */}
        <LoadingModal
          loading={loading}
          loadingMessage="Processing your request..."
        />
      </div>
    </div>
  );
};

export default RevalidationPage;
