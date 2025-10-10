import React from "react";
import { IoIosInformationCircle } from "react-icons/io";

const FareDetails = ({ flight, onBook, formatBaggageAllowance }) => {
  if (!flight?.fareGroups) return null;

  return (
    <div className="bg-[#FFFAFA] p-6 rounded-xl mt-4 relative shadow-md">
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
            {["Cancellation", "Checked Bag", "Cabin Bag"].map((service) => (
              <li
                key={service}
                className="flex items-start gap-3 text-sm text-[#15144E] border-b border-b-[#EAEAEA] pb-2"
              >
                <span className="text-base font-medium whitespace-pre-line">
                  {service}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dynamic Fare Cards */}
        {flight.fareGroups.map((group) => {
          const getFareTotal = (type) => {
            const fare = group.fares.find((f) => f.paxType === type);
            if (!fare) return 0;
            const taxes = fare.taxes
              ? fare.taxes.reduce((sum, t) => sum + t.amt, 0)
              : 0;
            return fare.base + taxes;
          };

          const adtFare = getFareTotal("ADT");
          const chdFare = getFareTotal("CHD");
          const infFare = getFareTotal("INF");
          const totalFare =
            adtFare * (flight.adtNum || 0) +
            chdFare * (flight.chdNum || 0) +
            infFare * (flight.infNum || 0);


          // Raw baggage strings
          const baggageData = flight.fareGroups[0]?.baggages?.[0] || {};
          const checkInBag = baggageData.checkInBag || "Not specified";
          const cabinBag = baggageData.cabinBag || "Not specified";

          return (
            <div
              key={group.purchaseId}
              className="bg-white col-span-1 border border-[#E2E2E2] rounded-xl p-5 flex flex-col justify-between transition"
            >
              <div>
                <div className="flex justify-center items-center gap-2 mb-3">
                  <h4 className="font-semibold text-[#15144E] text-base">
                    {group.priceClass}
                  </h4>
                </div>

                <p className="text-center text-lg font-semibold border-b border-b-[#EAEAEA] text-[#15144E] mb-4">
                  {flight.currency} {totalFare.toFixed(2)}
                </p>

                <div className="space-y-2 text-sm text-[#15144E]">
                  <p className="border-b border-b-[#EAEAEA] pb-1">
                    {group.refundable ? "Refundable" : "Non-refundable"}
                  </p>
                  <p className="border-b border-b-[#EAEAEA] pb-1">
                    {formatBaggageAllowance(checkInBag)}
                  </p>
                  <p className="border-b border-b-[#EAEAEA] pb-1">
                    {formatBaggageAllowance(cabinBag)}
                  </p>
                </div>
              </div>

              <button
                className="mt-6 bg-[#15144E] text-sm text-white py-2 rounded-lg font-medium cursor-pointer"
                onClick={() => onBook(flight, group.purchaseId)}
              >
                Book Now
              </button>
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
      </div>
    </div>
  );
};

export default FareDetails;
