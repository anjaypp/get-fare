import React from "react";

const FlightSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-md p-6 animate-pulse"
        >
          {/* Top Section */}
          <div className="flex justify-between items-center">
            {/* Airline info */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-gray-300 rounded-sm mb-2"></div>
              <div className="h-4 w-20 bg-gray-300 rounded mb-1"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>

            {/* Flight timing section */}
            <div className="flex flex-col items-center space-y-3">
              {[...Array(1)].map((_, j) => (
                <div
                  key={j}
                  className="flex items-center justify-between space-x-8 border-b border-gray-200 pb-3 last:border-none"
                >
                  {/* Departure */}
                  <div className="flex flex-col items-center">
                    <div className="h-5 w-12 bg-gray-300 rounded mb-1"></div>
                    <div className="h-3 w-10 bg-gray-200 rounded"></div>
                  </div>

                  {/* Flight path */}
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-12 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 w-24 bg-gray-300 rounded mb-1"></div>
                    <div className="h-3 w-10 bg-gray-200 rounded"></div>
                  </div>

                  {/* Arrival */}
                  <div className="flex flex-col items-center">
                    <div className="h-5 w-12 bg-gray-300 rounded mb-1"></div>
                    <div className="h-3 w-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fare + Button */}
            <div className="flex flex-col items-center space-y-2">
              <div className="h-5 w-16 bg-gray-300 rounded"></div>
              <div className="h-8 w-24 bg-gray-300 rounded"></div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 mt-4 pt-3"></div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-3 rounded-b-xl">
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="h-4 w-28 bg-gray-200 rounded"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-4 w-28 bg-gray-200 rounded mt-2 md:mt-0"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlightSkeleton;
