import React from "react";

const ContactDetailsSkeleton = () => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg animate-pulse">
      <div className="h-6 w-1/3 bg-gray-300 rounded mb-4"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded mt-4"></div>
    </div>
  );
};

export default ContactDetailsSkeleton;
