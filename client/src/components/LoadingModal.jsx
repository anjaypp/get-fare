import React from "react";

const LoadingModal = ({ loading, loadingMessage = "Loading..." }) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg font-medium">{loadingMessage}</p>
      </div>
    </div>
  );
};

export default LoadingModal;
