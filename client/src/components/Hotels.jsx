import React from "react";

const Hotels = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Recommended Hotels</h2>
      </div>

      <div className="grid grid-row-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden max-h-[220px]">
          <img
            src="https://images.pexels.com/photos/70441/pexels-photo-70441.jpeg"
            alt="Emerald Hotel"
            className="w-full h-[150px] object-cover"
          />
          <div className="p-4">
            <h3 className="text-sm font-semibold truncate">
              Emerald Hotel
            </h3>
            <p className="text-xs text-gray-500">
              Luxury stay near the airport
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden max-h-[220px]">
          <img
            src="https://images.pexels.com/photos/2467558/pexels-photo-2467558.jpeg"
            alt="Raddison Blu Plaza Hotel"
            className="w-full h-[150px] object-cover"
          />
          <div className="p-4">
            <h3 className="text-sm font-semibold truncate">
              Raddison Blu Plaza Hotel
            </h3>
            <p className="text-xs text-gray-500">Comfort & elegance</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden max-h-[220px]">
          <img
            src="https://images.pexels.com/photos/16104977/pexels-photo-16104977.jpeg"
            alt="Broadway Hotel"
            className="w-full h-[150px] object-cover"
          />
          <div className="p-4">
            <h3 className="text-sm font-semibold truncate">
              Braodway Hotel
            </h3>
            <p className="text-xs text-gray-500">Best rated in the city</p>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Hotels;
