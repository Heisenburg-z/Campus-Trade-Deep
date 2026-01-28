import React from 'react';
import { FaBell, FaImage, FaStar } from 'react-icons/fa';

const QuickTips = () => {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <div className="flex items-center mb-2">
          <div className="p-2 rounded-lg bg-[#1B8ED1]/20 mr-2">
            <FaBell className="text-[#8EC6EA]" />
          </div>
          <h3 className="font-bold">Quick Responses</h3>
        </div>
        <p className="text-sm text-white/70">
          Use 👍 and other reactions to quickly respond without typing
        </p>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <div className="flex items-center mb-2">
          <div className="p-2 rounded-lg bg-green-500/20 mr-2">
            <FaImage className="text-green-300" />
          </div>
          <h3 className="font-bold">Share Photos</h3>
        </div>
        <p className="text-sm text-white/70">
          Easily share product images by clicking the photo icon
        </p>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <div className="flex items-center mb-2">
          <div className="p-2 rounded-lg bg-purple-500/20 mr-2">
            <FaStar className="text-purple-300" />
          </div>
          <h3 className="font-bold">Favorite Contacts</h3>
        </div>
        <p className="text-sm text-white/70">
          Save frequent contacts as favorites for quick access
        </p>
      </div>
    </div>
  );
};

export default QuickTips;