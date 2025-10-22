import React from "react";
import raddison from '../assets/radisson.png'
import skyview from '../assets/sky hotel.png'
import publichotel from '../assets/public_hotel.png'

const hotels = [
  {
    name: "Radisson Blu Plaza Hotel",
    location: "Hyderabad",
    image: raddison,
  },
  {
    name: "Address Sky View",
    location: "Dubai",
    image: skyview,
  },
  {
    name: "PUBLIC Hotel NYC",
    location: "New York",
    image: publichotel,
  },
];

const Hotels = () => {
  return (
    <section className="py-8 w-full max-w-6xl px-2 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900">
          Recommended Hotels
        </h2>
        <button className="text-sm font-semibold text-blue-700 hover:underline">
          VIEW ALL →
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white hover:shadow-md transition"
          >
            <img
              src={hotel.image}
              alt={hotel.name}
              className="w-full h-56 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 text-lg mb-1">{hotel.name}</h3>
              <p className="text-sm text-gray-600">{hotel.location}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hotels;