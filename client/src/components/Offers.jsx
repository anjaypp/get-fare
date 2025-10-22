import React, { useState } from "react";
import dubai from '../assets/dubai.jpg'
import hyderabad from '../assets/hyderabad.jpg';
import akbar from '../assets/akbar.jpg';
import newyork from '../assets/fly_newyork.jpg';
import discover from '../assets/discover_dubai.jpg';
import explore from '../assets/exploreindia.jpg'


const tabs = ["All Offers", "Flight", "Hotel", "Holiday"];

const offers = [
  {
    title: "Direct Flights",
    desc: "From Hong Kong to Hyderabad",
    image: dubai,
  },
  {
    title: "Hyderabad to Ho Chi Minh",
    desc: "Fares starting at ₹9978",
    image: hyderabad,
  },
  {
    title: "AKBAR STUDY ABROAD",
    desc: "Earn High Commissions • GET UPTO ₹1,00,000",
    image: akbar,
  },
  {
    title: "Fly direct to New York",
    desc: "Where every journey begins with a dream.",
    image: newyork,
  },
  {
    title: "Discover Dubai",
    desc: "Luxury, adventure, and culture meet in a city of endless wonders.",
    image: discover,
  },
  {
    title: "Explore India’s colors, culture, and landscapes",
    desc: "Every trip a new story.",
    image: explore,
  },
];

const Offers = () => {
  const [activeTab, setActiveTab] = useState("All Offers");

  return (
    <section className="mb-12 md:col-span-3">
      {/* Tabs and View All */}
      <div className="flex justify-between items-center mb-6 pb-2">
        <h1 className="text-3xl font-extrabold text-gray-900">Offers</h1>
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-base cursor-pointer pb-2 px-6 ${
                activeTab === tab
                  ? "text-gray-900 border-b-2 font-bold border-yellow-500"
                  : "text-gray-500 font-medium hover:text-yellow-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button className="text-sm font-semibold text-gray-900 cursor-pointer hover:underline">
          VIEW ALL →
        </button>
      </div>

      {/* Offers grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {offers.map((offer, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-4 flex bg-white"
          >
            <img
              src={offer.image}
              alt={offer.title}
              className="rounded-lg mb-3 w-1/3 h-20 object-cover"
            />
            <div className="px-2 pl-4 flex flex-col">
            <h3 className="font-semibold text-base mb-1">{offer.title}</h3>
            <p className="text-xs text-gray-600 flex-grow">{offer.desc}</p>
            <button className="mt-3 text-sm font-semibold text-right text-gray-900 w-full hover:text-gray-700 cursor-pointer self-start">
              BOOK NOW
            </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Offers;