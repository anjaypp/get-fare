import React from 'react';

const FlightItinerary = () => {
  const flights = [
    {
      time: '04:00 AM',
      date: 'Nov 29',
      city: 'Delhi, DEL',
      terminal: 'Terminal 3',
    },
    {
      time: '09:55 AM',
      date: 'Nov 29',
      city: 'Paris, CDG',
      terminal: 'Terminal 2C',
    },
    {
      time: '10:05 PM',
      date: 'Nov 29',
      city: 'Warsaw, WAW',
      terminal: 'Terminal 2',
    },
  ];

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="relative">
        {/* Vertical line connecting the dots */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-300 h-full top-0 bottom-0"></div>
        
        {flights.map((flight, index) => (
          <div key={index} className="relative mb-8 flex items-center justify-between">
            {/* Time and date on the left */}
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800">{flight.time}</div>
              <div className="text-sm text-gray-500">{flight.date}</div>
            </div>
            
            {/* Dot */}
            <div className={`absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-cyan-500 rounded-full border-2 border-white shadow-md z-10`}></div>
            
            {/* City and terminal on the right */}
            <div className="text-right ml-8">
              <div className="text-lg font-semibold text-cyan-600">{flight.city}</div>
              <div className="text-sm text-gray-500">{flight.terminal}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlightItinerary;