import React, { useState } from "react";
import { IoIosInformationCircle } from "react-icons/io";
import cancellation from "../assets/cancellation.svg";
import checkedBag from "../assets/checked_bag.svg";
import handBag from "../assets/hand_bag.svg";

const services = [
  { name: "Cancellation", icon: cancellation },
  { name: "Checked Bag", icon: checkedBag },
  { name: "Cabin Bag", icon: handBag },
];

const FareDetails = ({ flight, onBook, formatBaggageAllowance }) => {
  const [selectedFareId, setSelectedFareId] = useState(
    flight?.fareGroups?.[0]?.purchaseId || null
  );

  if (!flight?.fareGroups) return null;

  const selectedGroup = flight.fareGroups.find(
    (group) => group.purchaseId === selectedFareId
  );

  const getFareTotal = (group) => {
    const getTotalForPax = (paxType, count) => {
      const fare = group.fares.find((f) => f.paxType === paxType);
      if (!fare) return 0;

      // Sum base + all taxes
      const taxes = fare.taxes?.reduce((sum, t) => sum + (t.amt || 0), 0) || 0;
      return (fare.base + taxes) * count;
    };

    const total =
      getTotalForPax("ADT", flight.adtNum || 0) +
      getTotalForPax("CHD", flight.chdNum || 0) +
      getTotalForPax("INF", flight.infNum || 0);

    return total;
  };

  return (
    <div className="p-6 rounded-xl mt-2 relative">
      <h3 className="font-semibold text-[#15144E] mb-6 text-lg">
        Fare Options
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Services Column */}
        <div className="col-span-1 border-r border-gray-200 pr-4">
          <h3 className="font-semibold text-[#15144E] mb-4 text-lg">
            Services
          </h3>
          <ul className="space-y-4">
            {services.map((service) => (
              <li
                key={service.name}
                className="flex items-center gap-3 text-sm text-[#15144E] border-b border-b-[#EAEAEA] pb-2"
              >
                <img
                  src={service.icon}
                  alt={service.name}
                  className="w-5 h-5 object-contain"
                />
                <span className="text-base font-medium">{service.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Fare Cards */}
        {flight.fareGroups.map((group) => {
          const baggageData = group.baggages?.[0] || {};
          const checkInBag = baggageData.checkInBag || "Not specified";
          const cabinBag = baggageData.cabinBag || "Not specified";

          return (
            <div
              key={group.purchaseId}
              className={`bg-gray-50 col-span-1 border border-[#E2E2E2] rounded-xl p-3 flex flex-col justify-between transition cursor-pointer ${
                selectedFareId === group.purchaseId
                  ? "ring-2 ring-indigo-950"
                  : ""
              }`}
              onClick={(e) => {
                // Only trigger on real clicks (not keyboard etc.)
                if (e.type === "click" && e.clientX !== 0 && e.clientY !== 0) {
                  setSelectedFareId(group.purchaseId);
                }
              }}
            >
              {/* Top row: PriceClass + TotalFare + Radio */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <h4 className="font-semibold text-[11px] text-left">
                    {group.priceClass}
                  </h4>
                  <p className="text-lg text-left font-semibold text-[#15144E]">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: flight.currency,
                      maximumFractionDigits: 0,
                    }).format(getFareTotal(group))}
                  </p>
                </div>

                {/* Radio Button */}
                <input
                  type="radio"
                  name="selectedFare"
                  checked={selectedFareId === group.purchaseId}
                  onChange={() => setSelectedFareId(group.purchaseId)}
                  className="w-5 h-5 cursor-pointer accent-indigo-950"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Fare Details */}
              <div className="space-y-2 text-sm">
                <p className="border-b border-b-[#EAEAEA] pb-1 w-full">
                  {group.refundable ? "Refundable" : "Non-refundable"}
                </p>
                <p className="border-b border-b-[#EAEAEA] pb-1 w-full">
                  {formatBaggageAllowance(checkInBag)}
                </p>
                <p className="border-b border-b-[#EAEAEA] pb-1 w-full">
                  {formatBaggageAllowance(cabinBag)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Bar */}
      <div className="w-full flex items-center justify-between text-sm mt-5 border-t border-[#EAEAEA] pt-3">
        <div className="flex items-center">
          <IoIosInformationCircle className="text-[#E5BC3B] h-5 w-5" />
          <p className="text-[#15144E] text-xs ms-2">
            Transit Visa is mandatory if there are two Schengen stops or
            same-country stops.
          </p>
        </div>

        {/* Selected fare and Book button */}
        {selectedGroup && (
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-[#15144E]">
              {flight.currency} {getFareTotal(selectedGroup).toFixed(0)}
            </span>
            <button
              className="bg-[#15144E] text-white py-2 px-4 rounded-lg font-medium"
              onClick={() => onBook(flight, selectedGroup.purchaseId)}
            >
              Book Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FareDetails;
