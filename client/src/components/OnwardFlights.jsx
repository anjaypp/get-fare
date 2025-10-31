import React, { useState } from "react";
import { GoDotFill } from "react-icons/go";
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";

const FlightGroup = ({ segments = [], title }) => {
  const [openStops, setOpenStops] = useState(false);

  if (!segments.length) return null;

  const formatTime = (t) =>
    new Date(t).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatDate = (t) =>
    new Date(t).toLocaleDateString([], {
      day: "2-digit",
      month: "short",
    });

  const calculateStopoverDuration = (arrivalTime, nextDepartureTime) => {
    const diffMs = new Date(nextDepartureTime) - new Date(arrivalTime);
    if (diffMs <= 0) return "";
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffH}h ${diffM}m`;
  };

  // collect stopovers
  const stopovers = segments.slice(0, -1).map((seg, i) => ({
    city: seg.destinationCity,
    code: seg.destination,
    arrivalOn: seg.arrivalOn,
    nextDepartureOn: segments[i + 1].departureOn,
    duration: calculateStopoverDuration(
      seg.arrivalOn,
      segments[i + 1].departureOn
    ),
    flightNum: segments[i + 1].flightNum,
    eqpType: segments[i + 1].eqpType,
    cabinClass: segments[i + 1].cabinClass || "Economy", // optional field
  }));

  return (
    <div className="w-full max-w-6xl bg-[#f9fafb] rounded-lg p-4 mb-4 mx-auto">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">{title}</h4>

      <div className="relative flex flex-col gap-10 -translate-x-14">
        {/* Vertical line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-5 bottom-5 w-px bg-gray-300"></div>

        {/* === Departure === */}
        <div className="flex justify-center items-start relative">
          <div className="w-1/2 text-right pr-12">
            <div className="text-base font-semibold text-gray-800">
              {formatTime(segments[0].departureOn)}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(segments[0].departureOn)}
            </div>
          </div>

          <GoDotFill className="text-cyan-500 text-xl z-10" />

          <div className="w-1/2 pl-4">
            <div className="text-base font-semibold text-indigo-950">
              {segments[0].originCity} ({segments[0].origin})
            </div>
            <div className="text-sm text-gray-500">
              Terminal {segments[0].depTerminal || "-"}
            </div>
            {/* Flight details */}
            <div className="text-xs text-gray-500 mt-1">
              Flight: {segments[0].mrkAirline} {segments[0].flightNum} |{" "}
              {segments[0].eqpType} | Cabin:{" "}
              {segments[0].cabinClass || "Economy"}
            </div>
          </div>
        </div>

        {/* === Stopover Button === */}
        {stopovers.length > 0 && (
          <div className="flex flex-col items-center relative">
            {/* Button on center line */}
            <button
              onClick={() => setOpenStops(!openStops)}
              className="absolute left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:bg-gray-50 z-20"
            >
              {openStops ? (
                <IoChevronUpOutline className="text-cyan-600" size={18} />
              ) : (
                <IoChevronDownOutline className="text-cyan-600" size={18} />
              )}
            </button>

            {/* Left: stops count */}
            <div className="flex flex-col w-1/2 items-end text-right pr-22 mt-1 space-y-1">
              <span className="bg-[#e9f6f8] text-[12px] font-medium px-1.5 py-1 rounded-md">
                {calculateStopoverDuration(
                  stopovers[0].arrivalOn,
                  stopovers[stopovers.length - 1].nextDepartureOn
                )}
              </span>

              <span className="bg-[#fdf3f4] text-[12px] font-medium px-1 py-1 rounded-md">
                {stopovers.length} Stop{stopovers.length > 1 && "s"}
              </span>
            </div>

            {/* Dropdown below */}
            {openStops && (
              <div className="mt-10 w-full">
                {stopovers.map((stop, i) => (
                  <div
                    key={i}
                    className="relative flex justify-center items-start mb-8"
                  >
                    {/* Left: time/date */}
                    <div className="w-1/2 text-right pr-12">
                      <div className="text-base font-semibold text-gray-800">
                        {formatTime(stop.arrivalOn)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(stop.arrivalOn)}
                      </div>
                    </div>

                    {/* Red dot */}
                    <GoDotFill className="text-rose-500 text-lg z-10" />

                    {/* Right: stop info */}
                    <div className="w-1/2 pl-4">
                      <div className="text-base font-semibold text-gray-800">
                        Stopover at {stop.city} ({stop.code})
                      </div>
                      <div className="text-sm text-gray-600 mb-0.5">
                        Duration: {stop.duration}
                      </div>
                      <div className="text-xs text-gray-500">
                        Flight: {stop.flightNum} | {stop.eqpType} | Cabin:{" "}
                        {stop.cabinClass}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === Arrival === */}
        <div className="flex justify-center items-start relative">
          <div className="w-1/2 text-right pr-12">
            <div className="text-base font-semibold text-gray-800">
              {formatTime(segments[segments.length - 1].arrivalOn)}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(segments[segments.length - 1].arrivalOn)}
            </div>
          </div>

          <GoDotFill className="text-cyan-500 text-xl z-10" />

          <div className="w-1/2 pl-4">
            <div className="text-base font-semibold text-indigo-950">
              {segments[segments.length - 1].destinationCity} (
              {segments[segments.length - 1].destination})
            </div>
            <div className="text-sm text-gray-500">
              Terminal {segments[segments.length - 1].arrTerminal || "-"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Flight: {segments[segments.length - 1].mrkAirline}{" "}
              {segments[segments.length - 1].flightNum} |{" "}
              {segments[segments.length - 1].eqpType} | Cabin:{" "}
              {segments[segments.length - 1].cabinClass || "Economy"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Wrapper that handles roundtrip
const OnwardFlights = ({ flight }) => {
  if (!flight?.segGroups?.length) return null;

  return (
    <>
      {flight.segGroups.map((group, idx) => {
        const title = group.segs?.[0]?.isReturn
          ? "Return Flight"
          : "Onward Flight";
        return (
          <FlightGroup key={idx} segments={group.segs || []} title={title} />
        );
      })}
    </>
  );
};

export default OnwardFlights;
