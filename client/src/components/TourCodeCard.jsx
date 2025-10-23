import React from "react";

const TourCodeCard = () => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-6 max-w-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-[#171347] mb-4">Tour Code</h2>

      <div className="mb-4">
        <label
          htmlFor="selector"
          className="block text-[#171347] text-sm mb-2 font-medium"
        >
          Select Selector
        </label>
        <select
          id="selector"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          defaultValue=""
        >
          <option value="" disabled>
            WAW...DEL
          </option>
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor="tourCode"
          className="block text-[#171347] text-sm mb-2 font-medium"
        >
          Enter Tour Code
        </label>
        <input
          type="text"
          id="tourCode"
          placeholder="Tour Code"
          className="w-full border border-gray-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <button className="bg-[#171347] text-white px-6 py-2 rounded-lg hover:bg-[#0f0b2c] transition w-full sm:w-auto cursor-pointer">
        Apply
      </button>
    </div>
  );
};

export default TourCodeCard;