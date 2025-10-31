import React from "react";

const PriceSummarySkeleton = () => {
  return (
    <div className="bg-white rounded-lg p-6 animate-pulse">
      {/* Title */}
      <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>

      {/* Fare Breakdown */}
      <div className="space-y-2">
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="h-6 bg-gray-200 rounded w-full"></div>
        ))}
      </div>

      {/* Total Price */}
      <div className="h-8 bg-gray-300 rounded w-2/3 mt-6"></div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <div className="h-10 bg-gray-300 rounded flex-1"></div>
        <div className="h-10 bg-gray-300 rounded flex-1"></div>
      </div>
    </div>
  );
};

export default PriceSummarySkeleton;
