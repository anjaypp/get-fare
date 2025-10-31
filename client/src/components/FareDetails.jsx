import React, { useRef, useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { GoXCircleFill } from "react-icons/go";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

// import cancellation from "../assets/cancellation.svg";
// import checkedBag from "../assets/checked_bag.svg";
// import handBag from "../assets/hand_bag.svg";

// const services = [
//   { name: "Cancellation", icon: cancellation },
//   { name: "Checked Bag", icon: checkedBag },
//   { name: "Cabin Bag", icon: handBag },
// ];

const FareDetails = ({ flight, onBook, formatBaggageAllowance }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false); // Start false; will update on mount

  if (!flight?.fareGroups) return null;

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

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1); // -1 for pixel rounding
    }
  };

  useEffect(() => {
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener("scroll", handleScroll);
      handleScroll(); // Initial check
      return () => ref.removeEventListener("scroll", handleScroll);
    }
  }, []); // Runs once on mount

  // Re-check on fareGroups change (e.g., new flight data)
  useEffect(() => {
    handleScroll();
  }, [flight?.fareGroups]);

  const scrollLeft = () => {
    if (scrollRef.current && canScrollLeft) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current && canScrollRight) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-[#FFFAFA] p-6 rounded-xl mt-2 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-[#15144E] text-lg">Fare Options</h3>
        <div className="flex gap-2">
          <button
            disabled={!canScrollLeft}
            onClick={scrollLeft}
            className={`p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors ${
              !canScrollLeft ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <FaArrowLeft className="text-[#15144E]" size={18} />
          </button>
          <button
            disabled={!canScrollRight}
            onClick={scrollRight}
            className={`p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors ${
              !canScrollRight ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <FaArrowRight className="text-[#15144E]" size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-2"
      >
        {/* Fare Cards */}
        {flight.fareGroups.map((group) => {
          const baggageData = group.baggages?.[0] || {};
          const checkInBag = baggageData.checkInBag || "Not specified";
          const cabinBag = baggageData.cabinBag || "Not specified";

          return (
            <div
              key={group.purchaseId}
              className="col-span-1 bg-white border-1 border-[#E2E2E2] rounded-md p-6 flex flex-col justify-between transition cursor-pointer min-w-[300px] max-w-[300px] hover:border-indigo-950 duration-200"
            >
              {/* Top row: PriceClass + TotalFare + Radio */}
              <div className="flex border-b-1 border-gray-200 justify-between items-start mb-3">
                <div className="flex flex-col">
                  <h4 className="text-[20px] text-left font-semibold text-[#15144E]">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: flight.currency,
                      maximumFractionDigits: 0,
                    }).format(getFareTotal(group))}
                  </h4>
                  <p className="text-[13px] text-left pb-2.5">
                    {group.priceClass}
                  </p>
                </div>
              </div>

              {/* Fare Details */}
              <div className="space-y-3 text-sm">
                <p className="text-[14px] font-semibold">Baggage</p>
                <div className="space-y-1 mb-4">
                  {formatBaggageAllowance(checkInBag) !== "No allowance" ? (
                    <p className="w-full text-black-800 text-sm">
                      <FaCheckCircle className="text-green-400 inline mb-1 me-1" />
                      {formatBaggageAllowance(checkInBag)}
                      {""} {"Check-in Baggage"}
                    </p>
                  ) : (
                    <p className="w-full text-[#757575] text-sm">
                      <GoXCircleFill className="text-red-400 inline mb-1 me-1" />
                      {formatBaggageAllowance(checkInBag)}{" "}
                      {"on Check-in Baggage"}
                    </p>
                  )}

                  {formatBaggageAllowance(cabinBag) !== "No allowance" ? (
                    <p className="w-full text-black-800 text-sm">
                      <FaCheckCircle className="text-green-400 inline mb-1 me-1" />
                      {formatBaggageAllowance(cabinBag)}{" "}
                      {"Cabin Baggage"}
                    </p>
                  ) : (
                    <p className="w-full text-[#757575] text-sm">
                      <GoXCircleFill className="text-red-400 inline mb-1 me-1" />
                      {formatBaggageAllowance(cabinBag)}{" "} {"on Cabin Baggage"}
                    </p>
                  )}
                </div>

                <p className="text-[14px] font-semibold">Flexiblity</p>
                <p className="mb-4 w-full">
                  {group.refundable ? (
                    <p>
                      <FaCheckCircle className="text-green-400 inline mb-1 me-1" />
                      Refundable on Cancellation
                    </p>
                  ) : (
                    <p>
                      <GoXCircleFill className="text-red-400 inline mb-1 me-1" />
                      No Refund on Cancellation
                    </p>
                  )}
                </p>

                <button
                  className="bg-[#15144E] text-white py-2 px-4 rounded-lg font-medium cursor-pointer"
                  onClick={() => onBook(flight, group.purchaseId)}
                >
                  Book Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Bar */}
      {/* <div className="w-full flex items-center justify-between text-sm mt-5 border-t border-[#EAEAEA] pt-3">
        <div className="flex items-center">
          <IoIosInformationCircle className="text-[#E5BC3B] h-5 w-5" />
          <p className="text-[#15144E] text-xs ms-2">
            Transit Visa is mandatory if there are two Schengen stops or
            same-country stops.
          </p>
        </div>


        {selectedGroup && (
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-[#15144E]">
              {flight.currency} {getFareTotal(selectedGroup).toFixed(0)}
            </span>
             <button
              className="bg-[#15144E] text-white py-2 px-4 rounded-lg font-medium cursor-pointer"
              onClick={() => onBook(flight, selectedGroup.purchaseId)}
            >
              Book Now
            </button> 
          </div>
        )}
      </div> */}
    </div>
  );
};

export default FareDetails;