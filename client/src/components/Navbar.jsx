import React from "react";
import { FaPlaneDeparture } from "react-icons/fa";
import { MdFlight } from "react-icons/md";
import { FaHotel } from "react-icons/fa6";
import { FaUmbrellaBeach } from "react-icons/fa";

export default function Navbar() {
  return (
    <header className="bg-white shadow-md h-[120px]">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex gap-18">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="AFineTrip Logo"
              className="h-22 w-auto"
              loading="eager"
            />
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-8 mt-8 mb-8 text-md font-medium">
            <a
              href="#"
              className="text-indigo-900 hover:text-yellow-500 hover:underline transition inline-flex items-center space-x-2"
            >
              <MdFlight className="align-middle" />
              <span>Flights</span>
            </a>
            <a
              href="#"
              className="text-indigo-900 hover:text-yellow-500 hover:underline transition inline-flex items-center space-x-2"
            >
              <FaHotel className="align-middle" />
              <span>Hotels</span>
            </a>
            <a
              href="#"
              className="text-indigo-900 hover:text-yellow-500 hover:underline transition inline-flex items-center space-x-2"
            >
              <FaUmbrellaBeach className="align-middle" />
              <span>Holiday</span>
            </a>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          <button className="hidden md:inline px-4 py-2 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition">
            Book Now
          </button>
          <button className="md:hidden p-2 text-indigo-900 hover:text-yellow-500">
            <FaPlaneDeparture size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}
