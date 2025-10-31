import React from "react";

const RevalidationSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel: Passenger, Contact, Addons */}
      <div className="lg:col-span-2 space-y-6">
        {/* Passenger Information Skeleton */}
        <div className="bg-white rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="flex gap-4 mb-4">
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
            </div>
          ))}
        </div>

        {/* Contact Details Skeleton */}
        <div className="bg-white rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="flex flex-col gap-4">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>

        {/* Addons Skeleton */}
        <div className="bg-white rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="h-12 bg-gray-200 rounded mb-3"></div>
          ))}
        </div>
      </div>

      {/* Right Panel: Price Summary Skeleton */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="h-6 bg-gray-200 rounded w-full"></div>
            ))}
          </div>

          {/* Buttons Skeleton */}
          <div className="flex gap-4 mt-6">
            <div className="h-10 bg-gray-300 rounded flex-1"></div>
            <div className="h-10 bg-gray-300 rounded flex-1"></div>
          </div>
        </div>

        {/* TourCodeCard Skeleton */}
        <div className="bg-white rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevalidationSkeleton;