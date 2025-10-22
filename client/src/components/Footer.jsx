import React from "react";
import { IoMdPin } from "react-icons/io";
import { IoIosMail } from "react-icons/io";
import footerlogo from "../assets/footerlogo.png";
import { MdLocalPhone } from "react-icons/md";
const Footer = () => {
  return (
    <footer className="grid place-items-center bg-indigo-950 mt-auto text-white">
      <div className="max-w-6xl px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          {/* Left Section */}
          <div className="flex-1 max-w-[300px] mt-4">
            <img
              src={footerlogo}
              alt="Afinetrip Logo"
              className="h-20 w-auto"
            />
            <p className="w-[272px] h-[66px] text-[14px] text-[#D0D0D0] mt-5 opacity-100">
              At Afinetrip, we believe that every journey should be seamless,
              affordable, and unforgettable.
            </p>
          </div>

          {/* Middle Section */}
          <div className="flex-1 flex flex-col sm:flex-row justify-center gap-12 text-sm">
            {/* Travel Solution */}
            <div>
              <h5 className="text-base font-medium mb-3">Travel Solution</h5>
              <a href="#" className="block mt-2 hover:text-gray-300">
                Home
              </a>
              <a href="#" className="block mt-2 hover:text-gray-300">
                Flight
              </a>
              <a href="#" className="block mt-2 hover:text-gray-300">
                Hotel
              </a>
              <a href="#" className="block mt-2 hover:text-gray-300">
                Holiday
              </a>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="text-base font-medium mb-3">Quick Links</h5>
              <a href="#" className="block mt-2 hover:text-gray-300">
                Notice Board
              </a>
              <a href="#" className="block mt-2 hover:text-gray-300">
                Recharge
              </a>
              <a href="#" className="block mt-2 hover:text-gray-300">
                Airline Update
              </a>
              <a href="#" className="block mt-2 hover:text-gray-300">
                Tax Invoice Format
              </a>
            </div>

            {/* Company */}
            <div>
              <h5 className="text-base font-medium mb-3">Company</h5>
              <a href="#" className="block mt-2 hover:text-gray-300">
                About Us
              </a>
              <a href="#" className="block mt-2 hover:text-gray-300">
                Why Choose Us
              </a>
              <a href="#" className="block mt-2 hover:text-gray-300">
                Contact Us
              </a>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex-1 max-w-[300px] flex flex-col gap-4">
            <h5 className="text-base font-medium mb-2">Contact Us</h5>

            {/* Location Info */}
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <IoMdPin className="text-lg mt-1" />
                <div className="flex flex-col">
                  <p className="font-normal text-base">Europe</p>
                  <p className="text-sm text-[#D0D0D0]">
                    Afine Trip, Żurawia 43/10, Warszawa, Mazowieckie, Poland,
                    00-680
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <IoMdPin className="text-lg mt-1" />
                <div className="flex flex-col">
                  <p className="font-normal text-base">India</p>
                  <p className="text-sm text-[#D0D0D0]">
                    Calicut Road, Perinthalmanna, Malappuram Kerala 679322,
                    India
                    <br /> +91 7661871111
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <IoIosMail className="text-lg mt-1" />
                <div className="flex flex-col">
                  <p className="text-sm text-[#D0D0D0]">Info@afinetrip.com</p>
                  <p className="text-sm text-[#D0D0D0]">
                    contact@afinetrip.com
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <MdLocalPhone className="text-lg mt-1" />
                <div className="flex flex-col">
                  <p className="text-sm text-[#D0D0D0]">
                    Europe +48 532 872 000
                  </p>
                  <p className="text-sm text-[#D0D0D0]">
                    India +91 7661-871111
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width underline */}
      <div className="w-full border-t border-gray-700 mt-6"></div>

      {/* Text below underline */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-8 py-4 gap-2 space-x-122 md:gap-0">
        {/* Left: Copyright */}
        <p className="text-sm text-[#D0D0D0] text-center md:text-left">
          Copyright © 2025 Afine Trip
        </p>

        {/* Right: Links / Info */}
        <div className="flex flex-wrap justify-center md:justify-end items-center gap-2 text-[14px] mt-2 md:mt-0">
          <span>All Rights Reserved</span>
          <span>|</span>
          <span>Terms and Conditions Apply</span>
          <span>|</span>
          <span>Privacy Policy</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
