import React from "react";
import { FaSuitcase, FaInfoCircle } from "react-icons/fa";
import { MdAirplanemodeActive, MdLocationOn } from "react-icons/md";
import { formatDate, formatDuration, formatTime } from "../../utilities/DateTimeFunctions";

const FlightSegmentCard = ({ outbounds = [], inbounds = []}) => {
    const FlightSegment = ({ segment, index, roundtrip  }) => {
        return (
            <div key={index} className="p-6 border-b border-gray-200 last:border-none">
                <div className="flex flex-col md:flex-row justify-between gap-6">

                    <div className="flex items-center gap-3 w-full md:w-1/4">

                        <div className="text-center">
                            <img
                                src={/react/flight_logos/${segment.airlineCode}.webp}
                                alt={segment.airline}
                                className="w-20 h-20 rounded object-contain mx-auto"
                            />
                            <p className="text-sm text-[#12114A] font-medium">{segment.airline}</p>
                            <p className="text-sm font-semibold text-[#12114A]">
                                {segment.flightNo}
                            </p>
                        </div>
                        <span className="ml-2 px-3 py-1 bg-gray-50 rounded-full text-sm text-[#12114A] border border-gray-200">
                            {segment.flightClass}
                        </span>
                    </div>

                    <div className="flex items-start justify-between w-full h-36 md:w-2/4">
                        <div className="w-2/6 flex flex-col h-full justify-between">
                            <div>
                                <p className="text-xl font-bold text-[#12114A]">{formatTime(segment.origin.departure)}</p>
                                <p className="text-sm text-gray-500">
                                    {/* {segment.departDay},  */}
                                    {formatDate(segment.origin.departure)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xl font-bold text-[#12114A]">{formatTime(segment.destination.arrival)}</p>
                                <p className="text-sm text-gray-500">
                                    {/* {segment.arriveDay},  */}
                                     {formatDate(segment.origin.departure)}
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
                                    {segment.origin.city}
                                </p>
                                <p className="text-xs text-gray-500  truncate">{segment.origin.airportName}, {segment.origin.terminal}</p>
                            </div>

                            <div className="text-sm text-gray-600 font-semibold">
                                {formatDuration(segment.duration)}
                            </div>

                            <div>
                                <p className="text-sm text-[#12114A] font-medium mt-1">
                                    {segment.destination.city}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{segment.destination.airportName}</p>
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
                                <p>Check In: {segment.baggage}</p>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-gray-700 mb-1">
                                <FaSuitcase className="mt-0.5 text-yellow-600" />
                                <p>Cabin: {segment.cabinBaggage}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#12114A] font-medium cursor-pointer">
                                <FaInfoCircle className="text-yellow-600" />
                                <span>Information</span>
                            </div>
                        </div>
                    </div>
                </div>

                {segment.connection && (
                    <div className="mt-6 border-t border-gray-200 pt-4 text-center">
                        <p className="text-gray-400 font-medium">Change Planes</p>
                        <p className="text-[#12114A] text-sm font-semibold">
                            {segment.layover.airportName}
                        </p>
                        <p className="text-gray-500 text-sm">
                            Connecting Time: {segment.layover.layoverMinutes}
                        </p>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {inbounds.length > 0 && <h2 className="text-lg font-semibold mb-4 text-gray-600 pt-6 px-6">Outbound</h2>}
            {outbounds.map((segment, index) => (
                <FlightSegment segment={segment} index={index} />
            ))}

            {inbounds.length > 0 && <h2 className="text-lg font-semibold mb-4 text-gray-600 pt-6 px-6">Inbound</h2>}
            {inbounds.length > 0 && inbounds.map((segment, index) => (
                <FlightSegment segment={segment} index={index} />
            ))}
        </div>
    );
};

export default FlightSegmentCard;