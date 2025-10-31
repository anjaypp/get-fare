import React from "react";

const AddonsSkeleton = () => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg animate-pulse">
      <div className="h-6 w-1/4 bg-gray-300 rounded mb-4"></div>
      <div className="space-y-3">
        <div className="h-14 bg-gray-200 rounded"></div>
        <div className="h-14 bg-gray-200 rounded"></div>
        <div className="h-14 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default AddonsSkeleton;
