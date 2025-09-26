import React from "react";
import { FaPlaneDeparture } from "react-icons/fa";

export default function Navbar() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        
        {/* Logo Section */}
        <div className="flex items-center space-x-2">
          <img
            src="/logo.png" 
            alt="AFineTrip Logo"
            className="h-12 w-auto"
          />
          <span className="text-lg font-semibold text-gray-700">AFineTrip</span>
        </div>

        {/* Navigation Menu */}
        <nav className="hidden md:flex space-x-8 text-sm font-medium">
          <a href="#" className="text-gray-700 hover:text-yellow-500 transition">Home</a>
          <a href="#" className="text-gray-700 hover:text-yellow-500 transition">Flights</a>
          <a href="#" className="text-gray-700 hover:text-yellow-500 transition">Hotels</a>
          <a href="#" className="text-gray-700 hover:text-yellow-500 transition">Packages</a>
          <a href="#" className="text-gray-700 hover:text-yellow-500 transition">Contact</a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          <button className="hidden md:inline px-4 py-2 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition">
            Book Now
          </button>
          <button className="md:hidden p-2 text-gray-700 hover:text-yellow-500">
            <FaPlaneDeparture size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}