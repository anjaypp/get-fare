import React from "react";

const RecentSearches = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Recent Searches</h2>
        <button className="text-sm text-gray-500">Clear All</button>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-gray-100 rounded-lg px-4 py-2">
          <span>Warsaw → New Delhi</span>
          <span className="text-sm text-gray-500">19 Sep 25</span>
        </div>
        <div className="flex justify-between items-center bg-gray-100 rounded-lg px-4 py-2">
          <span>Mumbai → Qatar</span>
          <span className="text-sm text-gray-500">19 Sep 25</span>
        </div>
        <div className="flex justify-between items-center bg-gray-100 rounded-lg px-4 py-2">
          <span>Mumbai → Dubai</span>
          <span className="text-sm text-gray-500">19 Sep 25</span>
        </div>
      </div>
    </div>
  );
};

export default RecentSearches;
