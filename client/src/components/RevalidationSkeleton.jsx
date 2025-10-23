import React from "react";

const RevalidationSkeleton = () => {
  return (
    <div className="min-h-screen bg-[linear-gradient(300.13deg,#D9D9D9_8.16%,#FAF3DB_52.55%,#F4F4FF_106.01%)] animate-pulse">
      <div className="max-w-6xl mx-auto pt-12 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* DEPART header */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="flex items-center gap-4">
                    <div className="h-6 bg-gray-300 rounded w-24"></div>
                    <div className="flex items-center gap-3">
                      <div className="h-8 bg-gray-300 rounded w-12"></div>
                      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                      <div className="h-8 bg-gray-300 rounded w-12"></div>
                    </div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </div>
            </div>

            {/* Flight segments - assuming 2 segments for skeleton */}
            {[...Array(2)].map((_, gIdx) => (
              <div key={gIdx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4">
                  {[...Array(1)].map((_, idx) => ( // One segment per group for simplicity
                    <div key={idx} className="p-6 border-b border-gray-200 last:border-none">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex items-center gap-3 w-full md:w-1/4">
                          <div className="text-center">
                            <div className="w-20 h-20 bg-gray-300 rounded mx-auto"></div>
                            <div className="h-4 bg-gray-300 rounded w-24 mt-2 mx-auto"></div>
                          </div>
                        </div>

                        <div className="flex items-start justify-between w-full h-36 md:w-2/4">
                          <div className="w-2/6 flex flex-col h-full justify-between">
                            <div className="space-y-1">
                              <div className="h-6 bg-gray-300 rounded w-16"></div>
                              <div className="h-3 bg-gray-300 rounded w-20"></div>
                            </div>
                            <div className="space-y-1">
                              <div className="h-6 bg-gray-300 rounded w-16"></div>
                              <div className="h-3 bg-gray-300 rounded w-20"></div>
                            </div>
                          </div>

                          <div className="w-1/6 flex flex-col items-center text-gray-400">
                            <div className="h-28 w-px bg-gray-300 my-1"></div>
                            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                          </div>

                          <div className="w-3/6 flex flex-col h-full justify-between">
                            <div className="space-y-1">
                              <div className="h-4 bg-gray-300 rounded w-12"></div>
                              <div className="h-3 bg-gray-300 rounded w-24"></div>
                            </div>
                            <div className="h-4 bg-gray-300 rounded w-20"></div>
                            <div className="space-y-1">
                              <div className="h-4 bg-gray-300 rounded w-12"></div>
                              <div className="h-3 bg-gray-300 rounded w-24"></div>
                            </div>
                          </div>
                        </div>

                        <div className="w-full md:w-1/4">
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-28"></div>
                            <div className="flex items-start gap-2">
                              <div className="w-4 h-4 bg-gray-300 rounded mt-1"></div>
                              <div className="h-3 bg-gray-300 rounded w-20"></div>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="w-4 h-4 bg-gray-300 rounded mt-1"></div>
                              <div className="h-3 bg-gray-300 rounded w-16"></div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-gray-300 rounded"></div>
                              <div className="h-3 bg-gray-300 rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Passenger Information */}
            <div>
              <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
              <div className="bg-white rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, idx) => (
                    <div key={idx}>
                      <div className="h-3 bg-gray-300 rounded w-20 mb-2"></div>
                      <div className="h-10 bg-gray-300 rounded border"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <div className="h-6 bg-gray-300 rounded w-40 mb-4"></div>
              <div className="bg-white rounded-lg p-6 space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="h-3 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-10 bg-gray-300 rounded border"></div>
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-10 bg-gray-300 rounded border"></div>
                  </div>
                </div>
                <div>
                  <div className="h-3 bg-gray-300 rounded w-20 mb-2"></div>
                  <div className="h-20 bg-gray-300 rounded border"></div>
                </div>
              </div>
            </div>

            {/* Addons */}
            <div>
              <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
              <div className="bg-white rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="h-12 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Price Summary */}
          <div className="lg:col-span-1 relative">
            <div className="bg-white rounded-lg p-6 space-y-4 sticky top-0">
              <div className="h-4 bg-gray-300 rounded w-24 mb-4"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="flex justify-between">
                    <div className="h-3 bg-gray-300 rounded w-20"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                ))}
                <div className="h-4 bg-gray-300 rounded w-20 mt-4"></div>
                <div className="flex justify-between pt-2 border-t">
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                  <div className="h-4 bg-gray-300 rounded w-20 font-bold"></div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="sticky bottom-4 mt-6 flex gap-4">
              <div className="flex-1 h-12 bg-gray-300 rounded-lg"></div>
              <div className="flex-1 h-12 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevalidationSkeleton;