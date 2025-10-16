import React from "react";

const Offers = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Offers</h2>
        <button className="text-sm text-indigo-900 font-semibold">VIEW ALL</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Direct Flights */}
        <div className="relative bg-white rounded-xl shadow-md p-4">
          <img
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
            alt="Airplane icon"
            className="absolute top-4 left-4 w-12 h-12 object-cover rounded-lg shadow-md"
          />
          <div className="pt-16">
            <h3 className="text-lg font-bold mb-1">Direct Flights</h3>
            <p className="text-sm text-gray-600 mb-4">From Hong Kong to Hyderabad</p>
            <button className="text-indigo-900 px-4 py-2 rounded-full text-sm font-semibold hover:bg-indigo-800 hover:text-white transition-colors absolute bottom-4 right-4">
              BOOK NOW
            </button>
          </div>
        </div>

        {/* Card 2: Hyderabad to Ho Chi Minh */}
        <div className="relative bg-white rounded-xl shadow-md p-4">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
            alt="City icon"
            className="absolute top-4 left-4 w-12 h-12 object-cover rounded-lg shadow-md"
          />
          <div className="pt-16">
            <h3 className="text-lg font-bold mb-1">Hyderabad to Ho Chi Minh</h3>
            <p className="text-sm text-gray-600 mb-4">Round-trip deals</p>
            <button className="text-indigo-900 px-4 py-2 rounded-full text-sm font-semibold hover:bg-indigo-800 hover:text-white transition-colors absolute bottom-4 right-4">
              BOOK NOW
            </button>
          </div>
        </div>

        {/* Card 3: Discover Dubai */}
        <div className="relative bg-white rounded-xl shadow-md p-4">
          <img
            src="https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
            alt="Dubai icon"
            className="absolute top-4 left-4 w-12 h-12 object-cover rounded-lg shadow-md"
          />
          <div className="pt-16">
            <h3 className="text-lg font-bold mb-1">Discover Dubai</h3>
            <p className="text-sm text-gray-600 mb-4">Luxury escapes</p>
            <button className="text-indigo-900 px-4 py-2 rounded-full text-sm font-semibold hover:bg-indigo-800 hover:text-white transition-colors absolute bottom-4 right-4">
              BOOK NOW
            </button>
          </div>
        </div>

        {/* Card 4: Explore India’s colors */}
        <div className="relative bg-white rounded-xl shadow-md p-4">
          <img
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
            alt="India icon"
            className="absolute top-4 left-4 w-12 h-12 object-cover rounded-lg shadow-md"
          />
          <div className="pt-16">
            <h3 className="text-lg font-bold mb-1">Explore India’s colors</h3>
            <p className="text-sm text-gray-600 mb-4">Cultural adventures</p>
            <button className="text-indigo-900 px-4 py-2 rounded-full text-sm font-semibold hover:bg-indigo-800 hover:text-white transition-colors absolute bottom-4 right-4">
              BOOK NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offers;