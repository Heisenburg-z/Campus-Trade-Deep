import React from 'react';

const LoadingErrorStates = ({ isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-[#0B2A4A] to-[#1B8ED1] p-6">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-xl font-bold">Loading your conversations...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-[#0B2A4A] to-[#1B8ED1] p-6">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-xl max-w-md w-full">
          <div className="text-center text-red-300 mb-4 text-6xl">⚠️</div>
          <h3 className="text-white text-xl font-bold text-center mb-2">Connection Error</h3>
          <p className="text-white/80 text-center">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 w-full py-2 bg-gradient-to-r from-[#ec463d] to-[#FF6B6B] text-white rounded-lg font-bold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return null;
};

export default LoadingErrorStates;