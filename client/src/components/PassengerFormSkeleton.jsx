import React from "react";

const PassengerFormSkeleton = () => {
  return (
    <div className="bg-white rounded-lg p-6 animate-pulse">
      {/* Header */}
      <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>

      {/* Passenger Fields */}
      {[...Array(3)].map((_, idx) => (
        <div key={idx} className="flex gap-4 mb-4">
          <div className="h-10 bg-gray-200 rounded flex-1"></div>
          <div className="h-10 bg-gray-200 rounded flex-1"></div>
          <div className="h-10 bg-gray-200 rounded flex-1"></div>
        </div>
      ))}

      {/* Contact Info */}
      <div className="h-6 bg-gray-300 rounded w-1/4 mb-4 mt-6"></div>
      <div className="flex flex-col gap-4">
        <div className="h-10 bg-gray-200 rounded w-full"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>

      {/* Addons Section Placeholder */}
      <div className="h-6 bg-gray-300 rounded w-1/4 mb-4 mt-6"></div>
      {[...Array(2)].map((_, idx) => (
        <div key={idx} className="h-12 bg-gray-200 rounded mb-3"></div>
      ))}
    </div>
  );
};

export default PassengerFormSkeleton;
