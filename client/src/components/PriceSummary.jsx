import React, { useState } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const PriceSummary = ({ flight, fareGroup, isRevalidating }) => {
  const [baseFareOpen, setBaseFareOpen] = useState(false);
  const [taxOpen, setTaxOpen] = useState(false);

  if (!fareGroup) return null;

  const paxTypeLabels = {
    ADT: "Adult",
    CHD: "Child",
    INF: "Infant",
  };

  // Count passengers by type
  const paxCounts = {
    ADT: flight?.adtNum || 0,
    CHD: flight?.chdNum || 0,
    INF: flight?.infNum || 0,
  };

  // Calculate totals
  const totalBase =
    fareGroup.fares?.reduce((sum, fare) => {
      const count = paxCounts[fare.paxType] || 1;
      return sum + (fare.base || 0) * count;
    }, 0) || 0;

  const totalTax =
    fareGroup.fares?.reduce((sum, fare) => {
      const count = paxCounts[fare.paxType] || 1;
      const fareTax =
        fare.taxes?.reduce((taxSum, tax) => taxSum + (tax.amt || 0), 0) || 0;
      return sum + fareTax * count;
    }, 0) || 0;

  const grandTotal = totalBase + totalTax;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-min">
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <h3 className="font-semibold text-indigo-900 text-lg">Fare Details</h3>
      </div>

      <div className="p-5 space-y-3">
        {/* Base Fare Section */}
        <div>
          <button
            onClick={() => setBaseFareOpen(!baseFareOpen)}
            className="w-full flex items-center justify-between text-sm text-indigo-900 hover:text-indigo-950 transition-colors"
          >
            <span className="font-medium">Base Fare</span>
            <div className="flex items-center gap-2">
              {isRevalidating ? (
                <div className="h-6 w-32 bg-gray-300 animate-pulse rounded-md" />
              ) : (
                <span className="font-semibold">
                  ₹{" "}
                  {totalBase.toLocaleString("en-IN", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              )}

              {baseFareOpen ? (
                <FaChevronUp size={16} className="text-indigo-900" />
              ) : (
                <FaChevronDown size={16} className="text-indigo-900" />
              )}
            </div>
          </button>

          {baseFareOpen && (
            <div className="mt-2 ml-2 space-y-1">
              {fareGroup.fares?.map((fare, idx) => {
                const count = paxCounts[fare.paxType] || 0;
                if (count === 0) return null;
                return (
                  <div
                    key={idx}
                    className="flex justify-between text-xs text-gray-600"
                  >
                    <span>
                      {paxTypeLabels[fare.paxType]} ({count} x{" "}
                      {(fare.base || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                      )
                    </span>
                    <span>
                      ₹{" "}
                      {((fare.base || 0) * count).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tax & Charges Section */}
        <div className="pb-4 border-b border-gray-200">
          <button
            onClick={() => setTaxOpen(!taxOpen)}
            className="w-full flex items-center justify-between text-sm text-indigo-900 hover:text-indigo-950 transition-colors"
          >
            <span className="font-medium">Tax & Charges</span>
            <div className="flex items-center gap-2">
              {isRevalidating ? (
                <div className="h-6 w-32 bg-gray-300 animate-pulse rounded-md" />
              ) : (
                <span className="font-semibold">
                  ₹{" "}
                  {totalTax.toLocaleString("en-IN", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              )}

              {taxOpen ? (
                <FaChevronUp size={16} className="text-indigo-900" />
              ) : (
                <FaChevronDown size={16} className="text-indigo-900" />
              )}
            </div>
          </button>

          {taxOpen && (
            <div className="mt-2 ml-2 space-y-1">
              {fareGroup.fares?.map((fare, idx) => {
                const count = paxCounts[fare.paxType] || 0;
                if (count === 0) return null;
                return fare.taxes?.map((tax, taxIdx) => (
                  <div
                    key={`${idx}-${taxIdx}`}
                    className="flex justify-between text-xs text-gray-600"
                  >
                    <span>
                      {paxTypeLabels[fare.paxType]} {tax.code} ({count} x{" "}
                      {(tax.amt || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                      )
                    </span>
                    <span>
                      ₹{" "}
                      {((tax.amt || 0) * count).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ));
              })}
            </div>
          )}
        </div>

        {/* Total Amount */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-base font-semibold text-indigo-900">
            Total Amount
          </span>
          {isRevalidating ? (
            <div className="h-8 w-32 bg-gray-300 animate-pulse rounded-md" />
          ) : (
            <span className="text-base font-bold text-indigo-900">
              ₹{" "}
              {grandTotal.toLocaleString("en-IN", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceSummary;
