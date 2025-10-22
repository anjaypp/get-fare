import React from "react";
import arrow from "../assets/arrow.png"


const searches = [
    { from: "Warsaw", to: "New Delhi", date: "19 Sep 25" },
    { from: "Mumbai", to: "Qatar", date: "19 Sep 25" },
    { from: "Mumbai", to: "Dubai", date: "19 Sep 25" },
    { from: "Warsaw", to: "New Delhi", date: "19 Sep 25" },
    { from: "New Delhi", to: "New York", date: "19 Sep 25" },
];

const RecentSearches = () => {
    return (
        <div className="w-full md:w-auto mt-4 md:mt-0">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Recent Searches</h3>
                <button className="text-xs text-gray-600 hover:underline">Clear All</button>
            </div>

            <div className="flex flex-wrap md:flex-col gap-2 w-full">
                {searches.map((s, i) => (
                    <div
                        key={i}
                        className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl flex flex-col justify-between text-sm text-gray-700 w-full"
                    >
                        <div className="flex justify-between items-center mb-1">
                            <p>{s.from}</p>
                            {/* <FaBolt className="inline text-yellow-400 mx-1" /> */}
                            <img
                                src={arrow}
                                alt="Swap cities"
                                className="w-5 h-5 object-contain"
                            />
                            <p>{s.to}</p>
                        </div>
                        <span className="text-xs text-gray-500">{s.date}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentSearches;