import React, { useState } from "react";
import logo from "../assets/logo.svg";

import { IoMdAirplane, IoIosArrowDown } from "react-icons/io";
import { FaHotel, FaUser, FaUmbrellaBeach } from "react-icons/fa";
import { FaBell } from "react-icons/fa6";
import { Link } from "react-router-dom";

export default function Header() {
  const [quickLinksOpen, setQuickLinksOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Flight");

  const tabs = [
    {
      name: "Flight",
      icon: <IoMdAirplane className="w-5 h-5 transform rotate-45" />,
    },
    { name: "Hotel", icon: <FaHotel className="w-5 h-5" /> },
    { name: "Holiday", icon: <FaUmbrellaBeach className="w-5 h-5" /> },
  ];

  return (
    <header className="bg-white shadow-md h-[110px]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-2 py-4">
        {/* Logo */}
        <div className="flex items-center space-x-20">
          <div className="flex items-center space-x-2">
            <Link to={'/'}>
            <img src={logo} alt="AFineTrip" className="h-auto w-25" />
            </Link>
          </div>

          <nav className="flex items-center space-x-8">
            {tabs.map((tab) => (
              <Link
                key={tab.name}
                to={'/'}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-2 sm:text-sm md:text-base pb-1 text-[#15144E] min-w-[80px] ${
                  activeTab === tab.name ? "font-semibold " : "font-normal"
                }`}
              >
                {tab.icon}
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-8 text-[16px] relative text-[#15144E] font-normal">
          {/* Quick Links Dropdown */}
          <div className="relative">
            <div
              className="flex items-center cursor-pointer space-x-2"
              onClick={() => setQuickLinksOpen(!quickLinksOpen)}
            >
              <span>Quick Links</span>
              <IoIosArrowDown className={`w-4 h-4`} />
            </div>

            {quickLinksOpen && (
              <div className="absolute left-0 mt-0 w-40 bg-white shadow-md rounded-lg border border-gray-200 z-50">
                <ul className="py-2 text-sm">
                  <li className="px-4 py-2 cursor-pointer">Offline Request</li>
                  <li className="px-4 py-2 cursor-pointer">Search Itinerary</li>
                  <li className="px-4 py-2 cursor-pointer">Travel Calendar</li>
                  <li className="px-4 py-2 cursor-pointer">Hold Itineraries</li>
                  <li className="px-4 py-2 cursor-pointer">Notice Board</li>
                  <li className="px-4 py-2 cursor-pointer">Recharge</li>
                  <li className="px-4 py-2 cursor-pointer">Airline Update</li>
                  <li className="px-4 py-2 cursor-pointer">
                    TAX Invoice Format
                  </li>
                </ul>
              </div>
            )}
          </div>

          <FaBell className="w-5 h-5 cursor-pointer" />

          <div className="relative">
            <div
              className="flex items-center space-x-2 cursor-pointer text-[18px]"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <FaUser className="w-4 h-4" />
              <span>Moideen Shibili</span>
              <IoIosArrowDown className={`w-4 h-4`} />
            </div>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white shadow-md rounded-lg border border-gray-200 z-50">
                <ul className="py-2 text-sm">
                  <li className="px-4 py-2 cursor-pointer">Profile</li>
                  <li className="px-4 py-2 cursor-pointer">Account Settings</li>
                  <li className="px-4 py-2 cursor-pointer">Logout</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
