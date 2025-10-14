import React from "react";
import { IoBagRemoveSharp } from "react-icons/io5";
import { GiHotMeal } from "react-icons/gi";
import { MdAirlineSeatReclineExtra } from "react-icons/md";


const Addons = () => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="flex flex-row space-x-4">
        <button className="flex items-center justify-center w-full p-3 bg-white border border-indigo-900 text-indigo-900 rounded-lg transition">
        <IoBagRemoveSharp className="w-5 h-5 text-indigo-900 mr-2"/>    
          Add Baggage
        </button>
        <button className=" flex items-center justify-center w-full p-3 bg-white border border-indigo-900 text-indigo-900 rounded-lg transition">
          <GiHotMeal className="w-5 h-5 text-indigo-900 mr-2"/>
          Add Meals
        </button>
        <button className="flex items-center justify-center w-full p-3 bg-white border border-indigo-900 text-indigo-900 rounded-lg transition">
          <MdAirlineSeatReclineExtra className="w-5 h-5 text-indigo-900 mr-2"/>
          Add Seat
        </button>
      </div>
    </div>
  );
};

export default Addons;
