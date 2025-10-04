import React from "react";

const Offers = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Offers</h2>
        <button className="text-sm text-indigo-900 font-semibold">VIEW ALL</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-4">Direct Flights…</div>
        <div className="bg-white rounded-xl shadow-md p-4">Hyderabad to Ho Chi Minh…</div>
        <div className="bg-white rounded-xl shadow-md p-4">Discover Dubai…</div>
        <div className="bg-white rounded-xl shadow-md p-4">Explore India’s colors…</div>
      </div>
    </div>
  );
};

export default Offers;
